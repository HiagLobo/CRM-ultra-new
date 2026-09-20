/**
 * Abas e ordenação da lista de avaliações: o fundador abre o painel para
 * decidir o que o filtro segurou, então é essa aba que tem de aparecer
 * primeiro — e a ordem é sempre da mais recente para a mais antiga.
 */
import { describe, it, expect } from "vitest";
import type { AvaliacaoAdmin } from "@/features/avaliacao/admin";
import type { StatusAvaliacao } from "@/features/avaliacao/avaliacao";
import { ABAS_AVALIACAO, abaInicial, contarPorAba, filtrarPorAba, ordenar, porLead } from "./listaAvaliacoes";

function linha(id: string, status: StatusAvaliacao, dia: string, leadId = `lead-${id}`): AvaliacaoAdmin {
  return {
    id,
    leadId,
    estrelas: 5,
    comentario: "Organizou meu dia.",
    identificacao: "nome",
    status,
    criadoEm: `2026-09-${dia}T12:00:00.000Z`,
    atualizadoEm: `2026-09-${dia}T12:00:00.000Z`,
    autor: { nome: "Corretor Exemplo", email: "corretor@exemplo.com" },
  };
}

const LISTA: AvaliacaoAdmin[] = [
  linha("a", "publicado", "17"),
  linha("b", "pendente", "19"),
  linha("c", "recusado", "18"),
  linha("d", "publicado", "20"),
];

describe("ordenação", () => {
  it("da mais recente para a mais antiga, sem mexer na lista original", () => {
    expect(ordenar(LISTA).map((a) => a.id)).toEqual(["d", "b", "c", "a"]);
    expect(LISTA.map((a) => a.id)).toEqual(["a", "b", "c", "d"]);
  });
});

describe("abas por situação", () => {
  it("uma aba por situação, mais 'Todas', e todas com rótulo em português", () => {
    expect(ABAS_AVALIACAO.map((a) => a.valor)).toEqual(["todas", "pendente", "publicado", "recusado"]);
    for (const aba of ABAS_AVALIACAO) expect(aba.rotulo).toBeTruthy();
  });

  it("cada aba mostra só a sua situação, já ordenada", () => {
    expect(filtrarPorAba(LISTA, "todas").map((a) => a.id)).toEqual(["d", "b", "c", "a"]);
    expect(filtrarPorAba(LISTA, "publicado").map((a) => a.id)).toEqual(["d", "a"]);
    expect(filtrarPorAba(LISTA, "pendente").map((a) => a.id)).toEqual(["b"]);
    expect(filtrarPorAba(LISTA, "recusado").map((a) => a.id)).toEqual(["c"]);
  });

  it("a contagem de cada aba bate com a lista", () => {
    expect(contarPorAba(LISTA)).toEqual({ todas: 4, publicado: 2, pendente: 1, recusado: 1 });
    expect(contarPorAba([])).toEqual({ todas: 0, publicado: 0, pendente: 0, recusado: 0 });
  });

  it("abre em 'Para conferir' quando há alguma segurada; senão, em 'Todas'", () => {
    expect(abaInicial(contarPorAba(LISTA))).toBe("pendente");
    expect(abaInicial(contarPorAba(LISTA.filter((a) => a.status !== "pendente")))).toBe("todas");
    expect(abaInicial(contarPorAba([]))).toBe("todas");
  });
});

describe("ligação com a ficha do lead", () => {
  it("a avaliação de cada lead, achada pelo id do lead (um lead tem no máximo uma)", () => {
    const mapa = porLead(LISTA);
    expect(mapa.get("lead-b")?.id).toBe("b");
    expect(mapa.get("lead-x")).toBeUndefined();
    expect(mapa.size).toBe(4);
  });
});
