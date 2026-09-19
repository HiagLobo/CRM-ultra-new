/**
 * POST /api/lead no handler de verdade — os caminhos que GRAVAM (revisão da
 * O7·S1). Store em tmpdir, limitador em memória e e-mail falso entram por
 * `vi.mock` nas fábricas: nada vai para `data/`, nada sai para a rede.
 * Prova a ligação HTTP: e-mail que não sai = 202 `recebido_sem_codigo`, lead
 * gravado, log só com a causa; saiu = 200 `enviado`.
 */
import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from "vitest";
import { NextRequest } from "next/server";
import type { LeadStore } from "@/lib/leadStore";
import type { RateLimiter } from "@/lib/ratelimit";
import type { ProvedorEmail } from "@/lib/email";
import { MemoriaRateLimiter } from "@/lib/ratelimit";
import { ErroConfiguracao } from "@/lib/erros";
import { PRAZO_SITEVERIFY_MS } from "@/lib/turnstile";
import { PRAZO_ENVIO_CODIGO_MS } from "@/features/lead";
import { EmailFake, capturarConsole, storesTemporarias } from "@/features/lead/apoioTestes";

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

const EMAIL = "corretor.rota@exemplo.com";
const TELEFONE = "(11) 90000-0000";
const CORPO = { nome: "Corretor Exemplo", email: EMAIL, telefone: TELEFONE, creci: "SP 12345", consentimento: true };

const stores = storesTemporarias("leads-rota-lead");
let email: EmailFake;

beforeAll(() => {
  process.env.APP_SECRET = "segredo-de-teste-1234567890"; // em teste, `env` é o process.env
});
beforeEach(() => {
  email = new EmailFake();
  dubles.store = stores.nova();
  dubles.limiter = new MemoriaRateLimiter();
  dubles.email = () => email;
});
afterEach(async () => {
  await stores.limpar();
  vi.restoreAllMocks();
});

function req(corpo: unknown) {
  return new NextRequest("http://localhost/api/lead", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": "203.0.113.9" },
    body: JSON.stringify(corpo),
  });
}

/** Nada de PII no que sai da rota (corpo e log). */
function semPII(texto: string) {
  expect(texto).not.toContain(EMAIL);
  expect(texto).not.toContain("90000");
  expect(texto).not.toContain("12345");
}

describe("POST /api/lead — e-mail que não sai", () => {
  it("provedor recusa: 202 recebido_sem_codigo, lead gravado sem código, log só com a causa", async () => {
    const log = capturarConsole();
    email.falharCodigo = new Error(`recusado ao enviar para ${EMAIL}`);

    const res = await POST(req(CORPO));
    expect(res.status).toBe(202);
    const texto = await res.text();
    expect(JSON.parse(texto)).toEqual({ ok: true, status: "recebido_sem_codigo" });

    expect(await dubles.store.buscarPorEmail(EMAIL)).toMatchObject({ status: "novo", codigo: { hash: "" } });
    expect(log()).toContain("[/api/lead] código não enviado; lead gravado sem código: email:Error");
    semPII(texto);
    semPII(log());
  });

  it("provedor nem sobe (produção sem RESEND_API_KEY): 202, lead gravado, nenhum código na resposta", async () => {
    const log = capturarConsole();
    dubles.email = () => {
      throw new ErroConfiguracao("RESEND_API_KEY", "RESEND_API_KEY é obrigatória em produção");
    };

    const res = await POST(req(CORPO));
    expect(res.status).toBe(202);
    const corpo = await res.json();
    expect(corpo).toEqual({ ok: true, status: "recebido_sem_codigo" });
    expect(corpo).not.toHaveProperty("codigoDev");
    expect(await dubles.store.buscarPorEmail(EMAIL)).not.toBeNull();
    expect(log()).toContain("config:RESEND_API_KEY");
  });

  it("e-mail saiu: 200 enviado (a distinção 200/202 é o que a tela usa)", async () => {
    capturarConsole();
    const res = await POST(req(CORPO));
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ ok: true, status: "enviado" });
    expect(email.codigos).toHaveLength(1);
  });
});

describe("POST /api/lead — prazo da função", () => {
  it("maxDuration cobre Turnstile + envio + folga para gravar o lead", () => {
    expect(maxDuration * 1000).toBeGreaterThanOrEqual(PRAZO_SITEVERIFY_MS + PRAZO_ENVIO_CODIGO_MS + 10_000);
  });
});
