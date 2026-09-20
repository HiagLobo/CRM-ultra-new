/**
 * `/api/admin/orcamentos` devolve PREÇO e o contato do cliente: a porta é o
 * `exigirAdmin`, e os testes provam que ela fecha nos quatro handlers e no GET
 * do documento. O piso é trava do SERVIDOR: 409 mesmo com o painel contornado.
 * Auditoria e stores entram por `vi.mock`: nada vai para `data/`.
 */
import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from "vitest";
import { NextRequest } from "next/server";
import type { LeadStore } from "@/lib/leadStore";
import type { OrcamentoStore } from "@/lib/orcamentoStorePorta";
import type { EventoAuditoria } from "@/lib/auditoria";
import { COOKIE_ADMIN, criarSessaoAdmin } from "@/lib/adminAuth";
import { SECRET_TESTE, capturarConsole } from "@/features/lead/apoioTestes";
import { bancoTemporario, leadDoOrcamento, pedidoOrcamento } from "@/features/orcamento/apoioTestes";
import { anoEmRecife } from "@/features/orcamento";

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
  dubles.leads = banco.leads();
  dubles.orcamentos = banco.orcamentos();
  dubles.auditoria = [];
});
afterEach(async () => {
  await banco.limpar();
  vi.restoreAllMocks();
});

const sessao = () => `${COOKIE_ADMIN}=${criarSessaoAdmin(SECRET_TESTE)}`;

function req(metodo: string, corpo?: unknown, cookie?: string) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (cookie) headers.cookie = cookie;
  return new NextRequest("http://localhost/api/admin/orcamentos", {
    method: metodo,
    headers,
    ...(corpo !== undefined ? { body: JSON.stringify(corpo) } : {}),
  });
}

/** Corpo válido do POST (5 assentos Pro para o lead fictício). */
const corpoNovo = (over: Record<string, unknown> = {}) => pedidoOrcamento(over);

/** A rota numera pelo relógio de verdade: o teste espera o ano de hoje. */
const ANO = anoEmRecife(new Date());
const numero = (sequencia: string) => `ORC-${ANO}-${sequencia}`;

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

describe("GET: lista e documento", () => {
  it("a lista leva o cliente, e nada do consentimento, IP ou hash do código", async () => {
    await comLead();
    await criarPelaRota();
    const res = await GET(req("GET", undefined, sessao()));
    expect(res.status).toBe(200);

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

  it("o documento abre pelo id e responde 404 quando não existe", async () => {
    await comLead();
    const criado = await criarPelaRota();
    const achado = await GET_UM(req("GET", undefined, sessao()), { params: Promise.resolve({ id: criado.id }) });
    expect(achado.status).toBe(200);
    expect((await achado.json()).orcamento.numero).toBe(numero("001"));
    expect(achado.headers.get("cache-control")).toBe("no-store");

    const sumido = await GET_UM(req("GET", undefined, sessao()), { params: Promise.resolve({ id: "nao-existe" }) });
    expect(sumido.status).toBe(404);
  });

  it("banco com problema → 500 genérico, com só a causa no log", async () => {
    vi.spyOn(dubles.orcamentos, "listar").mockRejectedValueOnce(
      Object.assign(new Error('relation "orcamentos" does not exist; contato@exemplo.com'), { code: "42P01" }),
    );
    const linhas = capturarConsole();
    const res = await GET(req("GET", undefined, sessao()));
    expect(res.status).toBe(500);
    expect(linhas()).toContain("db:42P01");
    expect(linhas()).not.toContain("exemplo.com");
  });
});

describe("PATCH e DELETE", () => {
  it("marcar enviado registra auditoria de id e situação, sem valores", async () => {
    await comLead();
    const criado = await criarPelaRota();
    dubles.auditoria = [];

    const res = await PATCH(req("PATCH", { id: criado.id, status: "enviado" }, sessao()));
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
    await comLead();
    expect((await PATCH(req("PATCH", { id: "x", status: "quase" }, sessao()))).status).toBe(400);
    const semId = await PATCH(req("PATCH", { id: "nao-existe", status: "aceito" }, sessao()));
    expect(semId.status).toBe(404);
    expect((await semId.json()).erro).toBe("orcamento_nao_encontrado");
    expect(dubles.auditoria).toEqual([]);
  });

  it("DELETE apaga e audita só o id; de novo → 404", async () => {
    await comLead();
    const criado = await criarPelaRota();
    dubles.auditoria = [];

    expect((await DELETE(req("DELETE", { id: criado.id }, sessao()))).status).toBe(200);
    expect(dubles.auditoria).toEqual([{ acao: "orcamento.excluido", dados: { id: criado.id } }]);
    expect(await dubles.orcamentos.listar()).toEqual([]);
    expect((await DELETE(req("DELETE", { id: criado.id }, sessao()))).status).toBe(404);
  });
});
