/**
 * POST /api/lead/entrar no handler de verdade (O9·S1): cada resultado do caso
 * de uso vira o status/corpo do contrato. Store em tmpdir, limitador em memória
 * e e-mail falso entram por `vi.mock` nas fábricas: nada vai para `data/`,
 * nada sai para a rede. Sem PII no corpo nem no log.
 */
import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from "vitest";
import { NextRequest } from "next/server";
import type { LeadStore } from "@/lib/leadStore";
import type { RateLimiter } from "@/lib/ratelimit";
import type { ProvedorEmail } from "@/lib/email";
import { MemoriaRateLimiter } from "@/lib/ratelimit";
import { ErroConfiguracao } from "@/lib/erros";
import { EmailFake, SECRET_TESTE, capturarConsole, leadCru, storesTemporarias } from "@/features/lead/apoioTestes";

const dubles = vi.hoisted(() => ({
  store: undefined as unknown as LeadStore,
  limiter: undefined as unknown as RateLimiter,
  email: undefined as unknown as () => ProvedorEmail,
}));
vi.mock("@/lib/criarLeadStore", () => ({ leadStore: () => dubles.store }));
vi.mock("@/lib/criarRateLimiter", () => ({ rateLimiter: () => dubles.limiter }));
vi.mock("@/lib/email", async (original) => ({
  ...(await original<typeof import("@/lib/email")>()),
  provedorEmail: () => dubles.email(),
}));

import { POST, maxDuration } from "./route";

const EMAIL = "corretor.entrar@exemplo.com";
const stores = storesTemporarias("leads-rota-entrar");
let email: EmailFake;

beforeAll(() => {
  process.env.APP_SECRET = SECRET_TESTE; // em teste, `env` é o process.env
});
beforeEach(async () => {
  email = new EmailFake();
  dubles.store = stores.nova();
  dubles.limiter = new MemoriaRateLimiter();
  dubles.email = () => email;
  await dubles.store.criar(leadCru({ email: EMAIL }));
});
afterEach(async () => {
  delete process.env.TURNSTILE_SECRET_KEY;
  vi.unstubAllGlobals();
  await stores.limpar();
  vi.restoreAllMocks();
});

function req(corpo: unknown, ip = "203.0.113.60") {
  return new NextRequest("http://localhost/api/lead/entrar", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": ip },
    body: typeof corpo === "string" ? corpo : JSON.stringify(corpo),
  });
}

function semPII(texto: string) {
  expect(texto).not.toContain(EMAIL);
  expect(texto).not.toContain("98888");
}

describe("POST /api/lead/entrar", () => {
  it("achou: 200 enviado (código de dev só sem Resend), e-mail sai para o lead", async () => {
    const res = await POST(req({ email: EMAIL.toUpperCase() }));
    expect(res.status).toBe(200);
    const corpo = await res.json();
    expect(corpo).toMatchObject({ ok: true, status: "enviado" });
    expect(corpo.codigoDev).toMatch(/^\d{6}$/); // teste = sem RESEND_API_KEY e fora de produção
    expect(email.codigos).toEqual([{ para: EMAIL, codigo: corpo.codigoDev }]);
  });

  it("não achou: 404 sem_cadastro", async () => {
    const res = await POST(req({ email: "ninguem@exemplo.com" }));
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ ok: false, erro: "sem_cadastro" });
  });

  it("robô (isca): 200 falso, sem código e sem enviar", async () => {
    const res = await POST(req({ email: EMAIL, website: "https://spam.exemplo" }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, status: "enviado" });
    expect(email.codigos).toHaveLength(0);
  });

  it("limite: 429 depois de 3 pedidos do mesmo e-mail", async () => {
    for (let i = 0; i < 3; i++) expect((await POST(req({ email: EMAIL }, `10.2.0.${i}`))).status).toBe(200);
    const res = await POST(req({ email: EMAIL }, "10.2.0.9"));
    expect(res.status).toBe(429);
  });

  it("provedor fora: 503 envio_indisponivel, log só com a causa", async () => {
    const log = capturarConsole();
    dubles.email = () => {
      throw new ErroConfiguracao("RESEND_API_KEY", "RESEND_API_KEY é obrigatória em produção");
    };
    const res = await POST(req({ email: EMAIL }));
    expect(res.status).toBe(503);
    const texto = await res.text();
    expect(JSON.parse(texto)).toEqual({ ok: false, erro: "envio_indisponivel" });
    expect(log()).toContain("[/api/lead/entrar] código não enviado: config:RESEND_API_KEY");
    semPII(texto + log());
  });

  it("provedor recusa (mensagem com o destinatário): 503, e o destinatário não vai ao log", async () => {
    const log = capturarConsole();
    email.falharCodigo = new Error(`recusado para ${EMAIL}`);
    const res = await POST(req({ email: EMAIL }));
    expect(res.status).toBe(503);
    expect(log()).toContain("email:Error");
    semPII(log());
  });

  it("Turnstile ligado sem token: 403, como no /api/lead", async () => {
    process.env.TURNSTILE_SECRET_KEY = "segredo-turnstile-teste";
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    const res = await POST(req({ email: EMAIL }));
    expect(res.status).toBe(403);
    expect((await res.json()).erro).toBe("verificacao_humana");
    expect(fetch).not.toHaveBeenCalled();
  });

  it("e-mail inválido, JSON quebrado ou campo gigante: 400 antes de qualquer lógica", async () => {
    const buscar = vi.spyOn(dubles.store, "buscarPorEmail");
    const invalido = await POST(req({ email: "nao-e-email" }));
    expect(invalido.status).toBe(400);
    expect((await invalido.json()).campos).toHaveProperty("email");
    expect((await POST(req("{quebrado"))).status).toBe(400);
    expect((await POST(req({ email: EMAIL, turnstileToken: "x".repeat(3000) }))).status).toBe(400);
    expect(buscar).not.toHaveBeenCalled();
  });

  it("banco fora: 500 genérico, log com a categoria", async () => {
    const log = capturarConsole();
    vi.spyOn(dubles.store, "buscarPorEmail").mockRejectedValueOnce(
      Object.assign(new Error(`falhou para ${EMAIL}`), { code: "42P01" }),
    );
    const res = await POST(req({ email: EMAIL }));
    expect(res.status).toBe(500);
    expect(log()).toContain("[/api/lead/entrar] erro ao processar: db:42P01");
    semPII((await res.text()) + log());
  });

  it("maxDuration igual ao do cadastro", () => {
    expect(maxDuration).toBe(30);
  });
});
