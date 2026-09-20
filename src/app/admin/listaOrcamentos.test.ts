/**
 * Abas, ordem e rótulos da lista de orçamentos. Cliente fictício, e nenhum
 * preço escrito à mão: os valores saem do cálculo do domínio.
 */
import { describe, it, expect } from "vitest";
import { calcularOrcamento, type OrcamentoAdmin, type PedidoOrcamento, type StatusOrcamento } from "@/features/orcamento";
import {
  ABAS_ORCAMENTO,
  abaInicial,
  contarPorAba,
  COR_STATUS,
  filtrarPorAba,
  linkDocumento,
  ordenar,
  porLead,
  resumoDaLinha,
  textoAssentos,
  textoValidade,
  venceu,
} from "./listaOrcamentos";

/** Um orçamento como a API devolve, com os totais calculados de verdade. */
function orcamento(over: Partial<OrcamentoAdmin> = {}, pedido: PedidoOrcamento = { publico: "imobiliaria", assentos: { pro: 5, ultra: 0 } }): OrcamentoAdmin {
  const r = calcularOrcamento(pedido);
  if (!r.ok) throw new Error(`pedido do teste recusado: ${r.erro}`);
  return {
    id: "orc-1",
    numero: "ORC-2026-001",
    leadId: "lead-1",
    cliente: { nome: "Imobiliária Exemplo" },
    publico: pedido.publico,
    status: "rascunho",
    itens: r.calculo.itens,
    totais: r.calculo.totais,
    condicoes: r.calculo.condicoes,
    validadeEm: "2026-10-05",
    criadoEm: "2026-09-20T12:00:00.000Z",
    atualizadoEm: "2026-09-20T12:00:00.000Z",
    ...over,
  };
}

describe("abas por situação", () => {
  const lista = [
    orcamento({ id: "a", status: "rascunho", criadoEm: "2026-09-20T10:00:00.000Z" }),
    orcamento({ id: "b", status: "enviado", criadoEm: "2026-09-20T12:00:00.000Z" }),
    orcamento({ id: "c", status: "aceito", criadoEm: "2026-09-20T09:00:00.000Z" }),
    orcamento({ id: "d", status: "enviado", criadoEm: "2026-09-20T11:00:00.000Z" }),
  ];

  it("uma aba por situação, mais Todos", () => {
    expect(ABAS_ORCAMENTO.map((a) => a.valor)).toEqual(["todos", "rascunho", "enviado", "aceito", "recusado"]);
  });

  it("conta cada aba e filtra do mais recente para o mais antigo", () => {
    expect(contarPorAba(lista)).toEqual({ todos: 4, rascunho: 1, enviado: 2, aceito: 1, recusado: 0 });
    expect(filtrarPorAba(lista, "enviado").map((o) => o.id)).toEqual(["b", "d"]);
    expect(filtrarPorAba(lista, "todos").map((o) => o.id)).toEqual(["b", "d", "a", "c"]);
    expect(filtrarPorAba(lista, "recusado")).toEqual([]);
    expect(ordenar(lista).map((o) => o.id)).toEqual(["b", "d", "a", "c"]);
  });

  it("abre em Rascunho quando há proposta por terminar, senão em Todos", () => {
    expect(abaInicial(contarPorAba(lista))).toBe("rascunho");
    expect(abaInicial(contarPorAba(lista.filter((o) => o.status !== "rascunho")))).toBe("todos");
    expect(abaInicial(contarPorAba([]))).toBe("todos");
  });

  it("cada situação tem cor própria, só da palette", () => {
    const cores = Object.values(COR_STATUS);
    expect(new Set(cores).size).toBe(cores.length);
    for (const cor of cores) expect(cor).toMatch(/^#[0-9A-F]{6}$/i);
  });

  it("os orçamentos de cada lead, para a ficha", () => {
    const mapa = porLead([...lista, orcamento({ id: "e", leadId: "lead-2" })]);
    expect(mapa.get("lead-1")!.map((o) => o.id)).toEqual(["b", "d", "a", "c"]);
    expect(mapa.get("lead-2")!.map((o) => o.id)).toEqual(["e"]);
    expect(mapa.get("lead-3")).toBeUndefined();
  });
});

describe("o que a lista mostra", () => {
  it("assentos por nível, com e sem mistura", () => {
    expect(textoAssentos({ assentos: { pro: 5, ultra: 0 } })).toBe("5 Pro");
    expect(textoAssentos({ assentos: { pro: 5, ultra: 3 } })).toBe("5 Pro e 3 Ultra");
    expect(textoAssentos({ assentos: { pro: 0, ultra: 2 } })).toBe("2 Ultra");
    expect(textoAssentos({ assentos: { pro: 0, ultra: 0 } })).toBe("sem assento");
  });

  it("o resumo traz o mensal, os assentos e o público, com o valor do registro", () => {
    // 5 assentos Pro = 2 x 179,00 + 3 x 139,00 = R$ 775,00
    expect(resumoDaLinha(orcamento())).toBe("R$ 775,00 por mês · 5 Pro · Imobiliária");
  });

  it("validade: vale até, ou venceu", () => {
    const o = orcamento({ validadeEm: "2026-10-05" });
    expect(venceu(o, "2026-10-05")).toBe(false); // o último dia ainda vale
    expect(venceu(o, "2026-10-06")).toBe(true);
    expect(textoValidade(o, "2026-09-20")).toBe("Vale até 05/10/2026");
    expect(textoValidade(o, "2026-10-06")).toBe("Venceu em 05/10/2026");
  });

  it("o link do documento escapa o id", () => {
    expect(linkDocumento("orc-1")).toBe("/admin/orcamento/orc-1");
    expect(linkDocumento("a/b?c")).toBe("/admin/orcamento/a%2Fb%3Fc");
  });

  it("nenhum rótulo da lista usa travessão", () => {
    const textos: string[] = [
      ...ABAS_ORCAMENTO.map((a) => a.rotulo),
      resumoDaLinha(orcamento()),
      textoValidade(orcamento(), "2026-09-20"),
    ];
    for (const t of textos) expect(t).not.toContain("—");
  });
});

describe("situações conhecidas", () => {
  it("toda situação tem aba e cor", () => {
    for (const status of ["rascunho", "enviado", "aceito", "recusado"] as StatusOrcamento[]) {
      expect(ABAS_ORCAMENTO.some((a) => a.valor === status), status).toBe(true);
      expect(COR_STATUS[status], status).toBeTruthy();
    }
  });
});
