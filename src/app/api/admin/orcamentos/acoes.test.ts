/**
 * `/api/admin/orcamentos` depois de criada a proposta: a lista que o painel lê,
 * o corpo que a folha A4 imprime e as ações do fundador (marcar situação e
 * excluir). A criação e a authz ficam no `route.test.ts`, ao lado.
 *
 * Auditoria e stores entram por `vi.mock`: nada vai para `data/`.
 */
import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from "vitest";
import type { LeadStore } from "@/lib/leadStore";
import type { OrcamentoStore } from "@/lib/orcamentoStorePorta";
import type { EventoAuditoria } from "@/lib/auditoria";
import { SECRET_TESTE, capturarConsole } from "@/features/lead/apoioTestes";
import {
  AGORA_TESTE,
  bancoTemporario,
  leadDoOrcamento,
  numeroDoTeste,
  pedidoOrcamento,
  requisicao,
  sessaoDeAdmin,
} from "@/features/orcamento/apoioTestes";

const dubles = vi.hoisted(() => ({
  leads: undefined as unknown as LeadStore,
  orcamentos: undefined as unknown as OrcamentoStore,
  auditoria: [] as { acao: string; dados: EventoAuditoria["dados"] }[],
}));
vi.mock("@/lib/criarLeadStore", () => ({ leadStore: () => dubles.leads }));
vi.mock("@/lib/criarOrcamentoStore", () => ({ orcamentoStore: () => dubles.orcamentos }));
vi.mock("@/lib/auditoria", () => ({
  registrarAuditoria: async (acao: string, dados: EventoAuditoria["dados"]) => {
    dubles.auditoria.push({ acao, dados });
  },
}));

import { DELETE, GET, PATCH, POST } from "./route";
import { GET as GET_UM } from "./[id]/route";

const banco = bancoTemporario("rota-orcamentos-acoes");

beforeAll(() => {
  process.env.APP_SECRET = SECRET_TESTE; // em teste, `env` é o process.env
});
beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(AGORA_TESTE);
  dubles.leads = banco.leads();
  dubles.orcamentos = banco.orcamentos();
  dubles.auditoria = [];
});
afterEach(async () => {
  vi.useRealTimers();
  await banco.limpar();
  vi.restoreAllMocks();
});

/** Cria pela rota e devolve o orçamento do corpo. */
async function criarPelaRota() {
  await dubles.leads.criar(leadDoOrcamento());
  const res = await POST(requisicao("POST", pedidoOrcamento(), sessaoDeAdmin()));
  expect(res.status).toBe(201);
  dubles.auditoria = [];
  return (await res.json()).orcamento as { id: string; numero: string };
}

describe("GET: lista e documento", () => {
  it("a lista leva o cliente, e nada do consentimento, IP ou hash do código", async () => {
    await criarPelaRota();
    const res = await GET(requisicao("GET", undefined, sessaoDeAdmin()));
    expect(res.status).toBe(200);
    expect(res.headers.get("cache-control")).toBe("no-store");

    const bruto = await res.text();
    const corpo = JSON.parse(bruto);
    expect(corpo.orcamentos[0].cliente).toEqual({
      nome: "Imobiliária Exemplo",
      email: "contato@exemplo.com",
      telefone: "+5581900000001",
    });
    // "codigo" sozinho não serve de busca: o item do orçamento tem um campo com esse nome
    for (const sensivel of ["203.0.113.9", "texto-da-politica", "hash-do-codigo", "consentimento", "verificadoEm"]) {
      expect(bruto, sensivel).not.toContain(sensivel);
    }
  });

  it("o documento abre pelo id, com a implantação partida em entrada e saldo", async () => {
    const criado = await criarPelaRota();
    const achado = await GET_UM(requisicao("GET", undefined, sessaoDeAdmin()), {
      params: Promise.resolve({ id: criado.id }),
    });
    expect(achado.status).toBe(200);
    expect(achado.headers.get("cache-control")).toBe("no-store");

    const { orcamento } = await achado.json();
    expect(orcamento.numero).toBe(numeroDoTeste("001"));
    // o que a folha A4 lê no topo do objeto (valores em reais)
    expect(orcamento.implantacao).toMatchObject({ total: 1_790, entrada: 895, saldo: 895, entradaPct: 50 });
    expect(orcamento.situacao).toBe("rascunho");
    expect(orcamento.validoAte).toBe("2026-10-05");
    expect(orcamento.totais.mensalTexto).toBe("R$ 775,00");
    expect(orcamento.assentos).toHaveLength(2); // 2 na 1ª faixa + 3 na 2ª
  });

  it("id que não existe → 404", async () => {
    await criarPelaRota();
    const sumido = await GET_UM(requisicao("GET", undefined, sessaoDeAdmin()), {
      params: Promise.resolve({ id: "nao-existe" }),
    });
    expect(sumido.status).toBe(404);
  });

  it("banco com problema → 500 genérico, com só a causa no log", async () => {
    vi.spyOn(dubles.orcamentos, "listar").mockRejectedValueOnce(
      Object.assign(new Error('relation "orcamentos" does not exist; contato@exemplo.com'), { code: "42P01" }),
    );
    const linhas = capturarConsole();
    const res = await GET(requisicao("GET", undefined, sessaoDeAdmin()));
    expect(res.status).toBe(500);
    expect(linhas()).toContain("db:42P01");
    expect(linhas()).not.toContain("exemplo.com");
  });
});

describe("PATCH e DELETE", () => {
  it("marcar enviado registra auditoria de id e situação, sem valores", async () => {
    const criado = await criarPelaRota();

    const res = await PATCH(requisicao("PATCH", { id: criado.id, status: "enviado" }, sessaoDeAdmin()));
    expect(res.status).toBe(200);
    expect((await res.json()).orcamento).toMatchObject({ id: criado.id, status: "enviado" });
    expect(dubles.auditoria).toEqual([
      { acao: "orcamento.status", dados: { id: criado.id, de: "rascunho", para: "enviado" } },
    ]);
    const cru = JSON.stringify(dubles.auditoria);
    for (const sensivel of ["Imobiliária Exemplo", "exemplo.com", "mensalCentavos"]) {
      expect(cru).not.toContain(sensivel);
    }
  });

  it("situação inventada → 400; id que não existe → 404", async () => {
    expect((await PATCH(requisicao("PATCH", { id: "x", status: "quase" }, sessaoDeAdmin()))).status).toBe(400);
    const semId = await PATCH(requisicao("PATCH", { id: "nao-existe", status: "aceito" }, sessaoDeAdmin()));
    expect(semId.status).toBe(404);
    expect((await semId.json()).erro).toBe("orcamento_nao_encontrado");
    expect(dubles.auditoria).toEqual([]);
  });

  it("DELETE apaga e audita só o id; de novo → 404", async () => {
    const criado = await criarPelaRota();

    expect((await DELETE(requisicao("DELETE", { id: criado.id }, sessaoDeAdmin()))).status).toBe(200);
    expect(dubles.auditoria).toEqual([{ acao: "orcamento.excluido", dados: { id: criado.id } }]);
    expect(await dubles.orcamentos.listar()).toEqual([]);
    expect((await DELETE(requisicao("DELETE", { id: criado.id }, sessaoDeAdmin()))).status).toBe(404);
  });
});
