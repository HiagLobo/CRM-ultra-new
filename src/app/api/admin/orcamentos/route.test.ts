/**
 * `/api/admin/orcamentos` devolve PREÇO e o contato do cliente: a porta é o
 * `exigirAdmin`, e os testes provam que ela fecha nos quatro handlers e no GET
 * do documento. O piso é trava do SERVIDOR: 409 mesmo com o painel contornado.
 * Auditoria e stores entram por `vi.mock`: nada vai para `data/`.
 */
import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from "vitest";
import type { LeadStore } from "@/lib/leadStore";
import type { OrcamentoStore } from "@/lib/orcamentoStorePorta";
import type { EventoAuditoria } from "@/lib/auditoria";
import { COOKIE_ADMIN, criarSessaoAdmin } from "@/lib/adminAuth";
import { SECRET_TESTE } from "@/features/lead/apoioTestes";
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

const banco = bancoTemporario("rota-admin-orcamentos");

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

/** Corpo válido do POST (5 assentos Pro para o lead fictício). */
const corpoNovo = (over: Record<string, unknown> = {}) => pedidoOrcamento(over);
const sessao = sessaoDeAdmin;
const req = requisicao;
const numero = numeroDoTeste;

async function comLead() {
  await dubles.leads.criar(leadDoOrcamento());
}

/** Cria pela rota e devolve o orçamento do corpo. */
async function criarPelaRota(over: Record<string, unknown> = {}) {
  const res = await POST(req("POST", corpoNovo(over), sessao()));
  expect(res.status).toBe(201);
  return (await res.json()).orcamento as { id: string; numero: string };
}

describe("sem sessão de admin, nada", () => {
  it("os quatro handlers respondem 401 e não tocam no store", async () => {
    const criar = vi.spyOn(dubles.orcamentos, "criar");
    const listar = vi.spyOn(dubles.orcamentos, "listar");
    const trocar = vi.spyOn(dubles.orcamentos, "trocarStatus");
    const excluir = vi.spyOn(dubles.orcamentos, "excluir");

    expect((await GET(req("GET"))).status).toBe(401);
    expect((await POST(req("POST", corpoNovo()))).status).toBe(401);
    expect((await PATCH(req("PATCH", { id: "x", status: "enviado" }))).status).toBe(401);
    expect((await DELETE(req("DELETE", { id: "x" }))).status).toBe(401);

    for (const espiao of [criar, listar, trocar, excluir]) expect(espiao).not.toHaveBeenCalled();
    expect(dubles.auditoria).toEqual([]);
  });

  it("o documento (GET por id) também é 401, e cookie de demo não abre", async () => {
    const ctx = { params: Promise.resolve({ id: "x" }) };
    expect((await GET_UM(req("GET"), ctx)).status).toBe(401);
    const comDemo = { params: Promise.resolve({ id: "x" }) };
    expect((await GET_UM(req("GET", undefined, "crm_demo=qualquer"), comDemo)).status).toBe(401);
    const outroSegredo = `${COOKIE_ADMIN}=${criarSessaoAdmin("outro-segredo-1234567890")}`;
    expect((await GET(req("GET", undefined, outroSegredo))).status).toBe(401);
  });
});

describe("POST: cria com o preço do servidor", () => {
  it("201 com o orçamento numerado, e a auditoria só com id, público e assentos", async () => {
    await comLead();
    const res = await POST(req("POST", corpoNovo(), sessao()));
    expect(res.status).toBe(201);
    const corpo = await res.json();
    expect(corpo.orcamento).toMatchObject({
      numero: numero("001"),
      status: "rascunho",
      publico: "imobiliaria",
      totais: { mensalCentavos: 77_500 },
    });
    expect(dubles.auditoria).toEqual([
      { acao: "orcamento.criado", dados: { id: corpo.orcamento.id, publico: "imobiliaria", assentos: 5 } },
    ]);
    // relógio congelado: a validade é sempre 20/09 + 15 dias
    expect(corpo.orcamento.validadeEm).toBe("2026-10-05");
    // a implantação sai partida em entrada e saldo
    expect(corpo.orcamento.totais.implantacaoEntradaCentavos).toBe(89_500);
    expect(corpo.orcamento.totais.implantacaoSaldoCentavos).toBe(89_500);
  });

  it("a lista não fica em cache de borda (proposta tem preço e cliente)", async () => {
    await comLead();
    const res = await GET(req("GET", undefined, sessao()));
    expect(res.headers.get("cache-control")).toBe("no-store");
  });

  it("o piso vale no anual: o que passava no mensal é recusado com 409", async () => {
    await comLead();
    const mensal = await POST(req("POST", corpoNovo({ assentos: { pro: 10, ultra: 0 }, descontoPct: 41.37 }), sessao()));
    expect(mensal.status).toBe(201);

    const anual = await POST(
      req("POST", corpoNovo({ assentos: { pro: 10, ultra: 0 }, descontoPct: 41.37, anual: true }), sessao()),
    );
    expect(anual.status).toBe(409);
    expect(await anual.json()).toMatchObject({ erro: "abaixo_do_piso", nivel: "pro", piso: 8_500, efetivo: 7_084 });
  });

  it("entrada fora da faixa (5% ou 120%) é 400; 40% grava a divisão escolhida", async () => {
    await comLead();
    for (const entradaPct of [5, 120, 33.5]) {
      const res = await POST(req("POST", { ...corpoNovo(), entradaPct }, sessao()));
      expect(res.status, String(entradaPct)).toBe(400);
    }
    const ok = await POST(req("POST", corpoNovo({ entradaPct: 40 }), sessao()));
    expect(ok.status).toBe(201);
    expect((await ok.json()).orcamento.condicoes.entradaPct).toBe(40);
  });

  it("a numeração segue sequencial entre chamadas", async () => {
    await comLead();
    expect((await criarPelaRota()).numero).toBe(numero("001"));
    expect((await criarPelaRota()).numero).toBe(numero("002"));
    expect((await criarPelaRota()).numero).toBe(numero("003"));
  });

  it("lead inexistente → 404, sem gravar nada", async () => {
    const res = await POST(req("POST", corpoNovo({ leadId: "nao-existe" }), sessao()));
    expect(res.status).toBe(404);
    expect((await res.json()).erro).toBe("lead_nao_encontrado");
    expect(await dubles.orcamentos.listar()).toEqual([]);
    expect(dubles.auditoria).toEqual([]);
  });

  it("desconto abaixo do piso → 409 com o piso e o preço efetivo, mesmo direto na API", async () => {
    await comLead();
    const res = await POST(req("POST", corpoNovo({ assentos: { pro: 10, ultra: 0 }, descontoPct: 41.38 }), sessao()));
    expect(res.status).toBe(409);
    expect(await res.json()).toEqual({
      ok: false,
      erro: "abaixo_do_piso",
      nivel: "pro",
      piso: 8_500,
      efetivo: 8_499,
    });
    expect(await dubles.orcamentos.listar()).toEqual([]);
  });

  it("assentos abaixo do mínimo do público → 409", async () => {
    await comLead();
    const res = await POST(req("POST", corpoNovo({ assentos: { pro: 2, ultra: 0 } }), sessao()));
    expect(res.status).toBe(409);
    expect(await res.json()).toMatchObject({ erro: "assentos_abaixo_do_minimo", minimo: 3, assentos: 2 });
  });

  it("corpo inválido → 400 pelo Zod, sem chegar ao cálculo", async () => {
    await comLead();
    const invalidos = [
      { ...corpoNovo(), assentos: { pro: 1.5, ultra: 0 } },
      { ...corpoNovo(), descontoPct: 120 },
      { ...corpoNovo(), publico: "sei_la" },
      { ...corpoNovo(), validadeDias: 0 },
      { ...corpoNovo(), extras: [{ item: "nao_existe", quantidade: 1 }] },
      { ...corpoNovo(), assentos: { pro: 5, ultra: 0 }, unidades: 3 }, // unidades só na rede
      { ...corpoNovo(), publico: "rede", assentos: { pro: 30, ultra: 0 } }, // rede sem unidades
      { leadId: "lead-1" },
    ];
    for (const corpo of invalidos) {
      const res = await POST(req("POST", corpo, sessao()));
      expect(res.status, JSON.stringify(corpo)).toBe(400);
    }
    expect(await dubles.orcamentos.listar()).toEqual([]);
  });
});
