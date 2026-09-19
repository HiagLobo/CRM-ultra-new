/**
 * Rotas do funil (O8) nos handlers de verdade, COM sessão: PATCH (etapa e
 * próxima ação), POST (cadastro manual) e as anotações. Store em tmpdir e
 * auditoria capturada por `vi.mock` — nada vai para `data/`. O 401 sem sessão
 * de cada handler novo está em `src/lib/adminRotas.test.ts`.
 * Relógio: só o `Date` é falso (fixado em 17/06/2026 09:00 de Recife).
 */
import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from "vitest";
import { NextRequest } from "next/server";
import type { LeadStore } from "@/lib/leadStore";
import { COOKIE_ADMIN, criarSessaoAdmin } from "@/lib/adminAuth";
import { capturarConsole, criarLeads, storesTemporarias } from "@/features/lead/apoioTestes";

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

import { PATCH, POST, DELETE } from "./route";
import { GET as GET_NOTAS, POST as POST_NOTAS } from "./[id]/notas/route";

const SECRET = "segredo-de-teste-1234567890";
const T0 = new Date("2026-06-17T12:00:00.000Z");
const stores = storesTemporarias("leads-rota-funil");

beforeAll(() => {
  process.env.APP_SECRET = SECRET; // em teste, `env` é o process.env
});
beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(T0);
  dubles.store = stores.nova();
  dubles.auditoria = [];
});
afterEach(async () => {
  vi.useRealTimers();
  await stores.limpar();
  vi.restoreAllMocks();
});

function req(url: string, metodo: string, corpo?: unknown) {
  return new NextRequest(`http://localhost${url}`, {
    method: metodo,
    headers: { "Content-Type": "application/json", cookie: `${COOKIE_ADMIN}=${criarSessaoAdmin(SECRET)}` },
    ...(corpo !== undefined ? { body: typeof corpo === "string" ? corpo : JSON.stringify(corpo) } : {}),
  });
}
const patch = (corpo: unknown) => PATCH(req("/api/admin/leads", "PATCH", corpo));
const ctx = (id: string) => ({ params: Promise.resolve({ id }) });

async function umLead() {
  const [lead] = await criarLeads(dubles.store, 1, T0);
  return lead!;
}

describe("PATCH /api/admin/leads — etapa", () => {
  it("move de etapa, devolve o lead do painel e audita só {id, de, para}", async () => {
    const lead = await umLead();
    const res = await patch({ id: lead.id, etapa: "demonstracao" });
    expect(res.status).toBe(200);
    const bruto = await res.text();
    expect(JSON.parse(bruto)).toMatchObject({ ok: true, lead: { id: lead.id, status: "demonstracao" } });
    for (const sensivel of ["consentimento", "codigo", "203.0.113", "1.2.3.4"]) expect(bruto).not.toContain(sensivel);
    expect(dubles.auditoria).toEqual([{ acao: "lead.etapa", dados: { id: lead.id, de: "novo", para: "demonstracao" } }]);
  });

  it("retomar sem data e perdido sem motivo → 400 no campo certo; nada gravado nem auditado", async () => {
    const lead = await umLead();
    const semData = await patch({ id: lead.id, etapa: "retomar" });
    expect(semData.status).toBe(400);
    expect((await semData.json()).campos).toHaveProperty("retomarEm");
    const semMotivo = await patch({ id: lead.id, etapa: "perdido" });
    expect(semMotivo.status).toBe(400);
    expect((await semMotivo.json()).campos).toHaveProperty("motivo");

    expect((await dubles.store.buscarPorId(lead.id))!.status).toBe("novo");
    expect(dubles.auditoria).toEqual([]);
  });

  it("retomar para hoje → 400 data_invalida; para amanhã → 200 com data e motivo", async () => {
    const lead = await umLead();
    const hoje = await patch({ id: lead.id, etapa: "retomar", retomarEm: "2026-06-17" });
    expect(hoje.status).toBe(400);
    expect(await hoje.json()).toMatchObject({ erro: "data_invalida", campos: { retomarEm: [expect.any(String)] } });

    const amanha = await patch({ id: lead.id, etapa: "retomar", retomarEm: "2026-06-18", motivo: "sem orçamento" });
    expect(amanha.status).toBe(200);
    expect((await amanha.json()).lead).toMatchObject({ status: "retomar", retomarEm: "2026-06-18", motivo: "sem orçamento" });
    expect(JSON.stringify(dubles.auditoria)).not.toContain("orçamento");
  });

  it("status antigo no corpo (painel da O7) → 400, nunca grava valor legado", async () => {
    const lead = await umLead();
    expect((await patch({ id: lead.id, status: "contatado" })).status).toBe(400);
    expect((await patch("{quebrado")).status).toBe(400);
  });

  it("id inexistente → 404", async () => {
    await umLead();
    const res = await patch({ id: "nao-existe", etapa: "cliente" });
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ ok: false, erro: "lead_nao_encontrado" });
  });

  it("banco com problema → 500 genérico; o log leva só a causa", async () => {
    const lead = await umLead();
    vi.spyOn(dubles.store, "buscarPorId").mockRejectedValueOnce(
      Object.assign(new Error('column "retomar_em" does not exist; corretor0@exemplo.com'), { code: "42703" }),
    );
    const saida = capturarConsole();
    const res = await patch({ id: lead.id, etapa: "cliente" });
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ ok: false, erro: "falha_interna" });
    expect(saida()).toContain("[/api/admin/leads] PATCH: db:42703");
    expect(saida()).not.toContain("exemplo.com");
  });
});

describe("PATCH /api/admin/leads — próxima ação", () => {
  it("define e limpa; a auditoria não leva o texto", async () => {
    const lead = await umLead();
    const define = await patch({ id: lead.id, proximaAcao: { em: "2026-06-17", texto: "ligar para Maria às 10h" } });
    expect(define.status).toBe(200);
    expect((await define.json()).lead).toMatchObject({ proximaAcaoEm: "2026-06-17", proximaAcao: "ligar para Maria às 10h" });

    const limpa = await patch({ id: lead.id, proximaAcao: null });
    expect((await limpa.json()).lead.proximaAcao).toBeUndefined();
    expect(dubles.auditoria.map((e) => e.dados)).toEqual([
      { id: lead.id, acao: "definida" },
      { id: lead.id, acao: "limpa" },
    ]);
    expect(JSON.stringify(dubles.auditoria)).not.toContain("Maria");
  });

  it("dia que já passou → 400 data_invalida", async () => {
    const lead = await umLead();
    const res = await patch({ id: lead.id, proximaAcao: { em: "2026-06-16", texto: "ligar" } });
    expect(res.status).toBe(400);
    expect((await res.json()).campos).toHaveProperty("proximaAcao");
  });
});

describe("POST /api/admin/leads — cadastro manual", () => {
  const CORPO = {
    nome: "Bruna Exemplo",
    telefone: "(81) 97777-6666",
    canal: "evento",
    observacao: "conheci no evento de sábado",
    consentimento: true,
  };
  const cadastrar = (corpo: unknown) => POST(req("/api/admin/leads", "POST", corpo));

  it("201 com o lead do painel (sem código nem consentimento) e a observação como 1ª anotação", async () => {
    const saida = capturarConsole();
    const res = await cadastrar(CORPO);
    expect(res.status).toBe(201);
    const bruto = await res.text();
    const { lead } = JSON.parse(bruto);
    expect(lead).toMatchObject({ nome: "Bruna Exemplo", telefone: "+5581977776666", canal: "evento", status: "novo" });
    for (const sensivel of ["consentimento", "codigo", "admin", "legítimo"]) expect(bruto).not.toContain(sensivel);

    expect(dubles.auditoria).toEqual([{ acao: "lead.manual", dados: { id: lead.id, canal: "evento" } }]);
    const notas = await GET_NOTAS(req(`/api/admin/leads/${lead.id}/notas`, "GET"), ctx(lead.id));
    expect((await notas.json()).notas.map((n: { texto: string }) => n.texto)).toEqual([CORPO.observacao]);
    expect(saida()).not.toMatch(/Bruna|97777|sábado/); // nada de PII no log
  });

  it("contato repetido → 409 com o id do existente", async () => {
    const primeiro = await (await cadastrar(CORPO)).json();
    const res = await cadastrar({ ...CORPO, nome: "Outra", telefone: "+55 81 97777-6666" });
    expect(res.status).toBe(409);
    expect(await res.json()).toEqual({ ok: false, erro: "lead_existente", id: primeiro.lead.id, campo: "telefone" });
    expect(await dubles.store.listar()).toHaveLength(1);
  });

  it("sem o checkbox, telefone inválido ou canal 'site' → 400; nada gravado", async () => {
    for (const corpo of [
      { ...CORPO, consentimento: false },
      { ...CORPO, telefone: "123" },
      { ...CORPO, canal: "site" },
    ]) {
      const res = await cadastrar(corpo);
      expect(res.status).toBe(400);
      expect((await res.json()).erro).toBe("dados_invalidos");
    }
    expect(await dubles.store.listar()).toEqual([]);
    expect(dubles.auditoria).toEqual([]);
  });
});

describe("/api/admin/leads/[id]/notas", () => {
  it("POST 201 grava; GET lista da mais recente; auditoria com ids, sem o texto", async () => {
    const lead = await umLead();
    const res = await POST_NOTAS(req(`/api/admin/leads/${lead.id}/notas`, "POST", { texto: "  pediu proposta  " }), ctx(lead.id));
    expect(res.status).toBe(201);
    expect(res.headers.get("cache-control")).toBe("no-store");
    const { nota } = await res.json();
    expect(nota).toMatchObject({ texto: "pediu proposta", em: T0.toISOString() });
    expect(dubles.auditoria).toEqual([{ acao: "lead.nota", dados: { id: lead.id, nota: nota.id } }]);

    const lista = await GET_NOTAS(req(`/api/admin/leads/${lead.id}/notas`, "GET"), ctx(lead.id));
    expect(await lista.json()).toEqual({ ok: true, notas: [nota] });
  });

  it("lead inexistente → 404; texto vazio ou longo demais → 400", async () => {
    const lead = await umLead();
    expect((await GET_NOTAS(req("/api/admin/leads/x/notas", "GET"), ctx("x"))).status).toBe(404);
    expect((await POST_NOTAS(req("/api/admin/leads/x/notas", "POST", { texto: "oi" }), ctx("x"))).status).toBe(404);
    for (const texto of ["   ", "x".repeat(2001)]) {
      const res = await POST_NOTAS(req(`/api/admin/leads/${lead.id}/notas`, "POST", { texto }), ctx(lead.id));
      expect(res.status).toBe(400);
    }
    expect(await dubles.store.listarNotas(lead.id)).toEqual([]);
  });

  it("DELETE do lead (LGPD) leva as anotações junto", async () => {
    const lead = await umLead();
    await POST_NOTAS(req(`/api/admin/leads/${lead.id}/notas`, "POST", { texto: "anotação" }), ctx(lead.id));
    const res = await DELETE(req("/api/admin/leads", "DELETE", { id: lead.id }));
    expect(res.status).toBe(200);
    expect(await dubles.store.listarNotas(lead.id)).toEqual([]);
    expect((await GET_NOTAS(req(`/api/admin/leads/${lead.id}/notas`, "GET"), ctx(lead.id))).status).toBe(404);
  });
});
