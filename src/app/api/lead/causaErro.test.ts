/**
 * 500 das rotas públicas com causa no log (O7·S2): no primeiro deploy, o log
 * diz O QUE quebrou — configuração, banco, rede — e nada de PII vai para o log
 * nem para a resposta. A configuração faltando corre pelo caminho de verdade
 * (produção sem DATABASE_URL → `poolPostgres` recusa); o Postgres recusando
 * entra por dublê nas fábricas. Nada vai para `data/`, nada sai para a rede.
 */
import { describe, it, expect, beforeAll, afterEach, vi } from "vitest";
import { NextRequest } from "next/server";
import type { LeadStore } from "@/lib/leadStore";
import type { RateLimiter } from "@/lib/ratelimit";
import { MemoriaRateLimiter } from "@/lib/ratelimit";
import { SECRET_TESTE, capturarConsole, storesTemporarias } from "@/features/lead/apoioTestes";

const dubles = vi.hoisted(() => ({
  store: undefined as LeadStore | undefined,
  limiter: undefined as RateLimiter | undefined,
}));
// sem dublê, respondem as fábricas de verdade (e, atrás delas, o poolPostgres de verdade)
vi.mock("@/lib/criarLeadStore", async (original) => {
  const real = await original<typeof import("@/lib/criarLeadStore")>();
  return { leadStore: () => dubles.store ?? real.leadStore() };
});
vi.mock("@/lib/criarRateLimiter", async (original) => {
  const real = await original<typeof import("@/lib/criarRateLimiter")>();
  return { rateLimiter: () => dubles.limiter ?? real.rateLimiter() };
});

import { POST as pedirAcesso } from "./route";
import { POST as verificar } from "./verify/route";

const EMAIL = "corretor.causa@exemplo.com";
const HOST_BANCO = "ep-ficticio-pooler.exemplo.invalid";

const stores = storesTemporarias("leads-rota-causa");

beforeAll(() => {
  process.env.APP_SECRET = SECRET_TESTE; // em teste, `env` é o process.env
});
afterEach(async () => {
  dubles.store = undefined;
  dubles.limiter = undefined;
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  await stores.limpar();
});

function post(url: string, corpo: unknown) {
  return new NextRequest(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": "203.0.113.20" },
    body: JSON.stringify(corpo),
  });
}
const CORPO_LEAD = { email: EMAIL, telefone: "(11) 90000-0000", creci: "SP 12345", consentimento: true };
const chamarLead = () => pedirAcesso(post("http://localhost/api/lead", CORPO_LEAD));
const chamarVerify = () => verificar(post("http://localhost/api/lead/verify", { email: EMAIL, codigo: "123456" }));

/** Nada de PII nem do host do banco no que sai da rota (corpo e log). */
function semVazamento(texto: string) {
  for (const proibido of [EMAIL, "90000", "12345", HOST_BANCO, "senha-ficticia"]) {
    expect(texto).not.toContain(proibido);
  }
}

/** Erro como o `pg` entrega: código + mensagem com os valores da linha e o host. */
function erroPg(code: string) {
  return Object.assign(new Error(`falhou em ${HOST_BANCO} para ${EMAIL} (senha-ficticia)`), { code, name: "error" });
}

describe("produção sem DATABASE_URL (a trava dispara na 1ª requisição, não no boot)", () => {
  it("as duas rotas respondem 500 genérico e o log diz config:DATABASE_URL", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("DATABASE_URL", "");
    const log = capturarConsole();

    const lead = await chamarLead();
    expect(lead.status).toBe(500);
    const corpoLead = await lead.text();
    expect(JSON.parse(corpoLead)).toEqual({ ok: false, erro: "falha ao processar solicitação" });

    const verify = await chamarVerify();
    expect(verify.status).toBe(500);
    const corpoVerify = await verify.text();
    expect(JSON.parse(corpoVerify)).toMatchObject({ ok: false, erro: "falha_interna" });

    expect(log()).toContain("[/api/lead] erro ao processar: config:DATABASE_URL");
    expect(log()).toContain("[/api/lead/verify] erro ao processar: config:DATABASE_URL");
    semVazamento(corpoLead + corpoVerify + log());
  });
});

describe("Postgres recusando", () => {
  it("tabela que não existe (migração não rodada): db:42P01 nas duas rotas", async () => {
    const log = capturarConsole();
    const recusa = async () => {
      throw erroPg("42P01");
    };
    dubles.store = stores.nova();
    dubles.limiter = { permitir: recusa, permitirCada: recusa };

    const lead = await chamarLead();
    const verify = await chamarVerify();
    expect([lead.status, verify.status]).toEqual([500, 500]);
    expect(log()).toContain("[/api/lead] erro ao processar: db:42P01");
    expect(log()).toContain("[/api/lead/verify] erro ao processar: db:42P01");
    semVazamento((await lead.text()) + (await verify.text()) + log());
  });

  it("host do banco que não existe (string errada): rede:ENOTFOUND, sem o host no log", async () => {
    const log = capturarConsole();
    const store = stores.nova();
    vi.spyOn(store, "buscarPorEmail").mockRejectedValue(erroPg("ENOTFOUND"));
    dubles.store = store;
    dubles.limiter = new MemoriaRateLimiter();

    const lead = await chamarLead();
    const verify = await chamarVerify();
    expect([lead.status, verify.status]).toEqual([500, 500]);
    expect(log()).toContain("[/api/lead] erro ao processar: rede:ENOTFOUND");
    expect(log()).toContain("[/api/lead/verify] erro ao processar: rede:ENOTFOUND");
    semVazamento((await lead.text()) + (await verify.text()) + log());
  });

  it("banco que não respondeu a tempo (pg-pool, sem código): db:PrazoConexao", async () => {
    const log = capturarConsole();
    const store = stores.nova();
    vi.spyOn(store, "buscarPorEmail").mockRejectedValue(new Error("timeout exceeded when trying to connect"));
    dubles.store = store;
    dubles.limiter = new MemoriaRateLimiter();

    expect((await chamarLead()).status).toBe(500);
    expect(log()).toContain("[/api/lead] erro ao processar: db:PrazoConexao");
  });
});
