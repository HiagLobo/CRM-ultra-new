/**
 * POST /api/lead/verify no handler de verdade (revisão da O7·S1): a 1ª
 * verificação avisa o fundador e emite o cookie; o aviso que falha nunca
 * derruba a entrada do corretor. Store em tmpdir, limitador em memória e
 * e-mail falso entram por `vi.mock` nas fábricas — nada vai para `data/`.
 */
import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from "vitest";
import { NextRequest } from "next/server";
import type { LeadStore } from "@/lib/leadStore";
import type { RateLimiter } from "@/lib/ratelimit";
import type { ProvedorEmail } from "@/lib/email";
import { MemoriaRateLimiter } from "@/lib/ratelimit";
import { ErroConfiguracao } from "@/lib/erros";
import { COOKIE_TOKEN_DEMO } from "@/lib/token";
import { LeadInputSchema, criarOuAtualizarLead } from "@/features/lead";
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

import { POST } from "./route";

const EMAIL = "corretor.verify@exemplo.com";
const FUNDADOR = "avisos@exemplo.com.br";

const stores = storesTemporarias("leads-rota-verify");
let email: EmailFake;

beforeAll(() => {
  process.env.APP_SECRET = SECRET_TESTE; // em teste, `env` é o process.env
});
beforeEach(() => {
  process.env.AVISO_LEADS_EMAIL = FUNDADOR;
  email = new EmailFake();
  dubles.store = stores.nova();
  dubles.limiter = new MemoriaRateLimiter();
  dubles.email = () => email;
});
afterEach(async () => {
  delete process.env.AVISO_LEADS_EMAIL;
  await stores.limpar();
  vi.restoreAllMocks();
});

/** Pede o código direto no domínio (como o POST /api/lead faria) e devolve o código. */
async function pedirCodigo(): Promise<string> {
  const input = LeadInputSchema.parse({ nome: "Corretor Exemplo", email: EMAIL, telefone: "(11) 90000-0000", creci: "SP 12345", consentimento: true });
  const { codigo } = await criarOuAtualizarLead(dubles.store, input, { ip: "203.0.113.5", secret: SECRET_TESTE });
  return codigo;
}

function verificar(codigo: string, atualizacao?: Record<string, string>) {
  return POST(
    new NextRequest("http://localhost/api/lead/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": "203.0.113.5" },
      body: JSON.stringify({ email: EMAIL, codigo, ...(atualizacao ? { atualizacao } : {}) }),
    }),
  );
}

describe("POST /api/lead/verify — aviso de lead novo", () => {
  it("1ª verificação: 200, cookie do demo e UM aviso ao fundador; reverificar não avisa de novo", async () => {
    const res = await verificar(await pedirCodigo());
    expect(res.status).toBe(200);
    expect(res.cookies.get(COOKIE_TOKEN_DEMO)?.value).toBeTruthy();
    expect(email.avisos).toEqual([{ para: FUNDADOR, marca: expect.any(String) }]);

    const deNovo = await verificar(await pedirCodigo());
    expect(deNovo.status).toBe(200);
    expect(email.avisos).toHaveLength(1);
  });

  it("aviso que falha: o corretor entra do mesmo jeito (200 + cookie) e o log não tem PII", async () => {
    const log = capturarConsole();
    email.falharAviso = new Error(`recusado; lead ${EMAIL}`);

    const res = await verificar(await pedirCodigo());
    expect(res.status).toBe(200);
    expect(res.cookies.get(COOKIE_TOKEN_DEMO)?.value).toBeTruthy();
    expect(log()).toContain("[aviso-lead] aviso de lead novo não saiu: email:Error");
    expect(log()).not.toContain(EMAIL);
    expect(log()).not.toContain(FUNDADOR);
  });

  it("provedor que nem sobe no aviso: 200 + cookie, log com config:VAR", async () => {
    const log = capturarConsole();
    dubles.email = () => {
      throw new ErroConfiguracao("RESEND_API_KEY", "RESEND_API_KEY é obrigatória em produção");
    };

    const res = await verificar(await pedirCodigo());
    expect(res.status).toBe(200);
    expect(res.cookies.get(COOKIE_TOKEN_DEMO)?.value).toBeTruthy();
    expect(log()).toContain("config:RESEND_API_KEY");
  });

  it("código errado: 400, sem cookie e sem aviso", async () => {
    const codigo = await pedirCodigo();
    const res = await verificar(codigo === "000000" ? "111111" : "000000");
    expect(res.status).toBe(400);
    expect(res.cookies.get(COOKIE_TOKEN_DEMO)).toBeUndefined();
    expect(email.avisos).toHaveLength(0);
  });
});

describe("POST /api/lead/verify — atualizacao de quem já tinha cadastro (O9)", () => {
  it("aplica o que não colide; o que é de outro lead volta em naoAtualizados (sem PII na resposta)", async () => {
    await dubles.store.criar(leadCru({ id: "outro", email: "outro@exemplo.com", telefone: "+5581900000001", creci: "PE 777" }));
    const codigo = await pedirCodigo();
    const res = await verificar(codigo, { nome: "Maria da Silva", telefone: "(81) 90000-0001", creci: "PE 4321" });
    expect(res.status).toBe(200);
    const texto = await res.text();
    expect(JSON.parse(texto)).toEqual({ ok: true, naoAtualizados: ["telefone"] });
    expect(texto).not.toMatch(/exemplo\.com|90000|4321|Maria/);
    expect(await dubles.store.buscarPorEmail(EMAIL)).toMatchObject({ nome: "Maria da Silva", telefone: "+5511900000000", creci: "PE 4321" });
  });

  it("tudo aplicado: 200 { ok: true } sem naoAtualizados", async () => {
    const res = await verificar(await pedirCodigo(), { nome: "Maria da Silva", telefone: "(21) 98888-7777", creci: "RJ 4321" });
    expect(await res.json()).toEqual({ ok: true });
  });

  it("atualizacao inválida (CRECI sem UF): 400 antes de conferir o código", async () => {
    const codigo = await pedirCodigo();
    const res = await verificar(codigo, { nome: "Maria da Silva", telefone: "(21) 98888-7777", creci: "4321" });
    expect(res.status).toBe(400);
    expect((await dubles.store.buscarPorEmail(EMAIL))!.codigo.tentativas).toBe(0); // nem gastou tentativa
  });
});
