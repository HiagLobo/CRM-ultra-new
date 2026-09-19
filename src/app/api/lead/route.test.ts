/**
 * POST /api/lead no handler de verdade (O7·S1) — só os caminhos que NÃO gravam
 * nem enviam nada (isca, Turnstile, Zod), para o teste não escrever em `data/`.
 * Os caminhos que gravam estão provados no nível do caso de uso.
 */
import { describe, it, expect, beforeAll, afterEach, vi } from "vitest";
import { randomUUID } from "crypto";
import { NextRequest } from "next/server";

const EMAIL = `rota-${randomUUID()}@exemplo.com`;
const BASE = { nome: "Corretor Exemplo", email: EMAIL, telefone: "(11) 90000-0000", creci: "SP 12345", consentimento: true };

beforeAll(() => {
  // em teste, `env` é o process.env (SKIP_ENV_VALIDATION)
  process.env.APP_SECRET = "segredo-de-teste-1234567890";
});

afterEach(() => {
  delete process.env.TURNSTILE_SECRET_KEY;
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function req(corpo: unknown) {
  return new NextRequest("http://localhost/api/lead", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": "203.0.113.7" },
    body: JSON.stringify(corpo),
  });
}

/** Siteverify falso: nada sai para a rede. */
function siteverify(resposta: () => Promise<unknown>) {
  const fn = vi.fn(async () => ({ ok: true, status: 200, json: resposta }) as unknown as Response);
  vi.stubGlobal("fetch", fn);
  return fn;
}

async function leadGravado() {
  const { leadStore } = await import("@/lib/criarLeadStore");
  return leadStore().buscarPorEmail(EMAIL);
}

describe("POST /api/lead — anti-robô no handler", () => {
  it("isca preenchida: 200 idêntico ao sucesso, sem gravar e sem enviar", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    const { POST } = await import("./route");

    const res = await POST(req({ ...BASE, website: "https://spam.exemplo" }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, status: "enviado" });
    expect(log).not.toHaveBeenCalled(); // nem o e-mail de dev "saiu"
    expect(await leadGravado()).toBeNull();
  });

  it("Turnstile ligado e token recusado: 403, sem gravar", async () => {
    process.env.TURNSTILE_SECRET_KEY = "segredo-turnstile-teste";
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const fetch = siteverify(async () => ({ success: false, "error-codes": ["invalid-input-response"] }));
    const { POST } = await import("./route");

    const res = await POST(req({ ...BASE, turnstileToken: "tok-falso" }));
    expect(res.status).toBe(403);
    expect((await res.json()).erro).toBe("verificacao_humana");
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(await leadGravado()).toBeNull();
  });

  it("Turnstile ligado e sem token: 403 sem nem consultar a Cloudflare", async () => {
    process.env.TURNSTILE_SECRET_KEY = "segredo-turnstile-teste";
    const fetch = siteverify(async () => ({ success: true }));
    const { POST } = await import("./route");

    expect((await POST(req(BASE))).status).toBe(403);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("Cloudflare fora do ar: 503 com erro próprio (a tela não acusa a pessoa de robô)", async () => {
    process.env.TURNSTILE_SECRET_KEY = "segredo-turnstile-teste";
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal("fetch", vi.fn(async () => {
      throw new TypeError("fetch failed");
    }));
    const { POST } = await import("./route");

    const res = await POST(req({ ...BASE, turnstileToken: "tok" }));
    expect(res.status).toBe(503);
    expect((await res.json()).erro).toBe("verificacao_indisponivel");
    expect(await leadGravado()).toBeNull();
  });

  it("token gigante é barrado pelo Zod (400) antes de qualquer lógica", async () => {
    const { POST } = await import("./route");
    const res = await POST(req({ ...BASE, turnstileToken: "x".repeat(3000) }));
    expect(res.status).toBe(400);
  });

  it("nenhuma dessas respostas devolve o e-mail ou o telefone", async () => {
    process.env.TURNSTILE_SECRET_KEY = "segredo-turnstile-teste";
    vi.spyOn(console, "warn").mockImplementation(() => {});
    siteverify(async () => ({ success: false, "error-codes": [] }));
    const { POST } = await import("./route");
    for (const corpo of [{ ...BASE, website: "x" }, { ...BASE, turnstileToken: "t" }]) {
      const texto = await (await POST(req(corpo))).text();
      expect(texto).not.toContain(EMAIL);
      expect(texto).not.toContain("90000");
    }
  });
});
