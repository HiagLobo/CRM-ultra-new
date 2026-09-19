/**
 * POST /api/lead no handler de verdade — as respostas novas da O9: 409 do
 * WhatsApp repetido (com/sem dica), 409 do CRECI repetido, `existente` no 200
 * e o 400 do nome/UF. Mesmo esquema de dublês do `semCodigo.test.ts`.
 */
import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from "vitest";
import { NextRequest } from "next/server";
import type { LeadStore } from "@/lib/leadStore";
import type { RateLimiter } from "@/lib/ratelimit";
import type { ProvedorEmail } from "@/lib/email";
import { MemoriaRateLimiter } from "@/lib/ratelimit";
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

const DONA = "dona.whats@exemplo.com";
const stores = storesTemporarias("leads-rota-repetidos");

beforeAll(() => {
  process.env.APP_SECRET = SECRET_TESTE;
});
beforeEach(async () => {
  const email = new EmailFake();
  dubles.store = stores.nova();
  dubles.limiter = new MemoriaRateLimiter();
  dubles.email = () => email;
  await dubles.store.criar(leadCru({ id: "dona", email: DONA, telefone: "+5581900000001", creci: "PE 12345" }));
});
afterEach(async () => {
  await stores.limpar();
  vi.restoreAllMocks();
});

const post = (over: Record<string, unknown>) =>
  POST(
    new NextRequest("http://localhost/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": "203.0.113.70" },
      body: JSON.stringify(dadosCadastro({ email: "novo.corretor@exemplo.com", ...over })),
    }),
  );

describe("POST /api/lead — repetidos (O9)", () => {
  it("WhatsApp de outro lead: 409 telefone_em_uso com a dica mascarada (nunca o e-mail inteiro)", async () => {
    const log = capturarConsole();
    const res = await post({ telefone: "(81) 90000-0001" });
    expect(res.status).toBe(409);
    const texto = await res.text();
    expect(JSON.parse(texto)).toEqual({ ok: false, erro: "telefone_em_uso", dica: "d•••••s@exemplo.com" });
    expect(texto).not.toContain(DONA);
    expect(log()).not.toMatch(/exemplo\.com|90000/);
  });

  it("dono sem e-mail: 409 com dica null", async () => {
    await dubles.store.excluir("dona");
    await dubles.store.criar(leadCru({ id: "manual", email: undefined, telefone: "+5581900000001", creci: "" }));
    const res = await post({ telefone: "(81) 90000-0001" });
    expect(await res.json()).toEqual({ ok: false, erro: "telefone_em_uso", dica: null });
  });

  it("CRECI de outro lead (PE 12345 ≡ PE 12345-F): 409 creci_em_uso, sem dica", async () => {
    const res = await post({ telefone: "(81) 97777-0000", creci: "PE 12345-F" });
    expect(res.status).toBe(409);
    expect(await res.json()).toEqual({ ok: false, erro: "creci_em_uso" });
    expect(await dubles.store.listar()).toHaveLength(1);
  });

  it("e-mail novo: 200 com existente=false; e-mail que já existe: 200 com existente=true", async () => {
    const novo = await post({ telefone: "(81) 97777-0000", creci: "PE 999" });
    expect(novo.status).toBe(200);
    expect(await novo.json()).toMatchObject({ ok: true, status: "enviado", existente: false });

    const existente = await post({ email: DONA, telefone: "(21) 98888-7777", creci: "RJ 10" });
    expect(existente.status).toBe(200);
    expect(await existente.json()).toMatchObject({ ok: true, status: "enviado", existente: true });
    expect((await dubles.store.buscarPorId("dona"))!.telefone).toBe("+5581900000001"); // nada regravado
  });

  it("robô: 200 falso SEM o campo existente", async () => {
    const res = await post({ website: "x" });
    expect(await res.json()).toEqual({ ok: true, status: "enviado" });
  });

  it("sem nome completo ou CRECI sem UF: 400 com o campo certo", async () => {
    const semNome = await post({ nome: "Maria" });
    expect(semNome.status).toBe(400);
    expect((await semNome.json()).campos).toHaveProperty("nome");
    const semUf = await post({ creci: "12345" });
    expect((await semUf.json()).campos.creci).toEqual(["informe o estado do CRECI"]);
  });
});
