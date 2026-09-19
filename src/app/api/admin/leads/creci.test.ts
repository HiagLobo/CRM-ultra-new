/**
 * O9 nas rotas do admin, nos handlers de verdade e COM sessão: PATCH da
 * conferência do CRECI, o cadastro manual barrando CRECI repetido e o GET com
 * os campos novos (sem nenhum campo sensível). O 401 sem sessão está em
 * `src/lib/adminRotas.test.ts`. Store em tmpdir e auditoria capturada.
 */
import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from "vitest";
import { NextRequest } from "next/server";
import type { LeadStore } from "@/lib/leadStore";
import { COOKIE_ADMIN, criarSessaoAdmin } from "@/lib/adminAuth";
import { capturarConsole, leadCru, storesTemporarias } from "@/features/lead/apoioTestes";

const dubles = vi.hoisted(() => ({
  store: undefined as unknown as LeadStore,
  auditoria: [] as { acao: string; dados: Record<string, unknown> }[],
}));
vi.mock("@/lib/criarLeadStore", () => ({ leadStore: () => dubles.store }));
vi.mock("@/lib/auditoria", () => ({
  registrarAuditoria: async (acao: string, dados: Record<string, unknown>) => {
    dubles.auditoria.push({ acao, dados });
  },
}));

import { GET, PATCH, POST } from "./route";

const SECRET = "segredo-de-teste-1234567890";
const T0 = new Date("2026-06-17T12:00:00.000Z");
const stores = storesTemporarias("leads-rota-creci");

beforeAll(() => {
  process.env.APP_SECRET = SECRET;
});
beforeEach(async () => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(T0);
  dubles.store = stores.nova();
  dubles.auditoria = [];
  await dubles.store.criar(leadCru({ nome: "Corretor Exemplo" }));
});
afterEach(async () => {
  vi.useRealTimers();
  await stores.limpar();
  vi.restoreAllMocks();
});

function req(metodo: string, corpo?: unknown) {
  return new NextRequest("http://localhost/api/admin/leads", {
    method: metodo,
    headers: { "Content-Type": "application/json", cookie: `${COOKIE_ADMIN}=${criarSessaoAdmin(SECRET)}` },
    ...(corpo !== undefined ? { body: JSON.stringify(corpo) } : {}),
  });
}

describe("PATCH /api/admin/leads — conferência do CRECI", () => {
  it("marca: 200 com o lead do painel; auditoria lead.creci só com {id, resultado}", async () => {
    const res = await PATCH(req("PATCH", { id: "1", creciConferencia: "conferido" }));
    expect(res.status).toBe(200);
    const bruto = await res.text();
    expect(JSON.parse(bruto)).toMatchObject({
      ok: true,
      lead: { id: "1", creciConferencia: "conferido", creciConferidoEm: T0.toISOString() },
    });
    for (const sensivel of ["consentimento", "codigo", "hash", "203.0.113"]) expect(bruto).not.toContain(sensivel);
    expect(dubles.auditoria).toEqual([{ acao: "lead.creci", dados: { id: "1", resultado: "conferido" } }]);
  });

  it("não confere e desfazer (null)", async () => {
    await PATCH(req("PATCH", { id: "1", creciConferencia: "nao_confere" }));
    const desfaz = await PATCH(req("PATCH", { id: "1", creciConferencia: null }));
    expect(desfaz.status).toBe(200);
    const { lead } = await desfaz.json();
    expect(lead).not.toHaveProperty("creciConferencia");
    expect(dubles.auditoria.map((e) => e.dados.resultado)).toEqual(["nao_confere", "desfeita"]);
  });

  it("valor inválido → 400; id inexistente → 404; lead sem CRECI → 409 sem_creci", async () => {
    expect((await PATCH(req("PATCH", { id: "1", creciConferencia: "sim" }))).status).toBe(400);
    expect((await PATCH(req("PATCH", { id: "x", creciConferencia: "conferido" }))).status).toBe(404);
    await dubles.store.criar(leadCru({ id: "manual", email: undefined, telefone: "+5581900000001", creci: "" }));
    const semCreci = await PATCH(req("PATCH", { id: "manual", creciConferencia: "conferido" }));
    expect(semCreci.status).toBe(409);
    expect(await semCreci.json()).toEqual({ ok: false, erro: "sem_creci" });
    expect(dubles.auditoria).toEqual([]);
  });

  it("coluna da 005 faltando → 500 genérico; o log leva só a causa", async () => {
    vi.spyOn(dubles.store, "atualizarFunil").mockRejectedValueOnce(
      Object.assign(new Error('column "creci_conferencia" does not exist; corretor@exemplo.com'), { code: "42703" }),
    );
    const saida = capturarConsole();
    const res = await PATCH(req("PATCH", { id: "1", creciConferencia: "conferido" }));
    expect(res.status).toBe(500);
    expect(saida()).toContain("[/api/admin/leads] PATCH: db:42703");
    expect(saida()).not.toContain("exemplo.com");
  });
});

describe("POST /api/admin/leads — CRECI repetido (O9)", () => {
  it("CRECI de outro lead (mesma chave) → 409 lead_existente com campo creci", async () => {
    const res = await POST(
      req("POST", { telefone: "(81) 96666-5555", creci: "CRECI-PE 12.345-F", canal: "evento", consentimento: true }),
    );
    expect(res.status).toBe(409);
    expect(await res.json()).toEqual({ ok: false, erro: "lead_existente", id: "1", campo: "creci" });
    expect(await dubles.store.listar()).toHaveLength(1);
  });
});

describe("GET /api/admin/leads — campos da O9 no DTO", () => {
  it("leva conferência e último acesso; nunca hash, IP ou consentimento", async () => {
    await dubles.store.registrarAcesso("1", "2026-06-18T10:00:00.000Z");
    await PATCH(req("PATCH", { id: "1", creciConferencia: "conferido" }));
    const res = await GET(req("GET"));
    const bruto = await res.text();
    expect(JSON.parse(bruto).leads[0]).toMatchObject({
      creciConferencia: "conferido",
      creciConferidoEm: T0.toISOString(),
      ultimoAcessoEm: "2026-06-18T10:00:00.000Z",
    });
    for (const sensivel of ["hash-do-codigo", "203.0.113.9", "texto-da-politica", "consentimento", "tentativas"]) {
      expect(bruto).not.toContain(sensivel);
    }
  });
});
