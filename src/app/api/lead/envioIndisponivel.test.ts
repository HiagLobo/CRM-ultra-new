/**
 * POST /api/lead no handler de verdade — emenda do contrato da O9: e-mail que
 * JÁ existe e o código não sai → 503 `{ ok: false, erro: "envio_indisponivel" }`,
 * nada gravado, log só com a causa. E o `existente` da corrida de criação.
 * Mesmo esquema de dublês do `semCodigo.test.ts` (nada vai para `data/`).
 */
import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from "vitest";
import { NextRequest } from "next/server";
import type { LeadStore } from "@/lib/leadStore";
import type { RateLimiter } from "@/lib/ratelimit";
import type { ProvedorEmail } from "@/lib/email";
import { MemoriaRateLimiter } from "@/lib/ratelimit";
import { CHAVE_TETO_DIARIO, regraTetoDiario } from "@/features/lead";
import { EmailFake, SECRET_TESTE, capturarConsole, dadosCadastro, leadCru, storesTemporarias } from "@/features/lead/apoioTestes";

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

const EMAIL = "ja.cadastrado@exemplo.com";
const stores = storesTemporarias("leads-rota-envio-indisponivel");
let email: EmailFake;

beforeAll(() => {
  process.env.APP_SECRET = SECRET_TESTE;
});
beforeEach(async () => {
  email = new EmailFake();
  dubles.store = stores.nova();
  dubles.limiter = new MemoriaRateLimiter();
  dubles.email = () => email;
  await dubles.store.criar(leadCru({ email: EMAIL, nome: "Nome Antigo Exemplo" }));
});
afterEach(async () => {
  vi.unstubAllEnvs();
  await stores.limpar();
  vi.restoreAllMocks();
});

const post = (over: Record<string, unknown> = {}) =>
  POST(
    new NextRequest("http://localhost/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": "203.0.113.90" },
      body: JSON.stringify(dadosCadastro({ email: EMAIL, telefone: "(21) 98888-7777", creci: "RJ 4321", ...over })),
    }),
  );

/** Nada de PII no que sai da rota (corpo e log). */
function semPII(texto: string) {
  for (const pii of [EMAIL, "98888", "4321", "Corretor Exemplo", "Nome Antigo"]) expect(texto).not.toContain(pii);
}

describe("POST /api/lead — e-mail já cadastrado e o código não saiu (emenda da O9)", () => {
  it("provedor recusou: 503 envio_indisponivel, lead intacto, log só com a causa", async () => {
    const antes = await dubles.store.buscarPorEmail(EMAIL);
    const log = capturarConsole();
    email.falharCodigo = new Error(`recusado para ${EMAIL}`);

    const res = await post();
    expect(res.status).toBe(503);
    const texto = await res.text();
    expect(JSON.parse(texto)).toEqual({ ok: false, erro: "envio_indisponivel" });
    expect(await dubles.store.buscarPorEmail(EMAIL)).toEqual(antes);
    expect(log()).toBe("[/api/lead] código não enviado; e-mail já cadastrado, nada gravado: email:Error");
    semPII(texto + log());
  });

  it("teto diário estourado: 503 envio_indisponivel, lead intacto, log teto_diario", async () => {
    vi.stubEnv("LIMITE_ENVIOS_DIA", "1"); // em teste, `env` é o process.env
    await dubles.limiter.permitir([CHAVE_TETO_DIARIO], regraTetoDiario(1)); // a vaga do dia já foi
    const antes = await dubles.store.buscarPorEmail(EMAIL);
    const log = capturarConsole();

    const res = await post();
    expect(res.status).toBe(503);
    const texto = await res.text();
    expect(JSON.parse(texto)).toEqual({ ok: false, erro: "envio_indisponivel" });
    expect(await dubles.store.buscarPorEmail(EMAIL)).toEqual(antes);
    expect(email.codigos).toHaveLength(0);
    expect(log()).toBe("[/api/lead] código não enviado; e-mail já cadastrado, nada gravado: teto_diario");
    semPII(texto + log());
  });

  it("e-mail NOVO com o provedor fora continua 202 recebido_sem_codigo (só o novo é gravado)", async () => {
    capturarConsole();
    email.falharCodigo = new Error("provedor caiu");
    const res = await post({ email: "novo@exemplo.com" });
    expect(res.status).toBe(202);
    expect(await res.json()).toEqual({ ok: true, status: "recebido_sem_codigo" });
  });
});

describe("POST /api/lead — corrida de criação", () => {
  it("outro pedido criou o mesmo e-mail logo antes do nosso criar: 200 com existente=true", async () => {
    const criar = dubles.store.criar.bind(dubles.store);
    vi.spyOn(dubles.store, "criar").mockImplementationOnce(async (lead) => {
      await criar(leadCru({ id: "do-outro-pedido", email: lead.email, telefone: "+5581900000009", creci: "PE 55555" }));
      return criar(lead);
    });
    const res = await post({ email: "corrida@exemplo.com" });
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ ok: true, status: "enviado", existente: true });
    expect((await dubles.store.buscarPorEmail("corrida@exemplo.com"))!.id).toBe("do-outro-pedido");
  });
});
