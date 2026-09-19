import { describe, it, expect } from "vitest";
import type { LeadAdmin } from "@/features/lead/admin";
import { cardsDoTopo } from "./cardsDoTopo";

const AGORA = new Date("2026-09-19T15:00:00.000Z"); // 19/09 12:00 em Recife

const lead = (id: string, parcial: Partial<LeadAdmin>): LeadAdmin => ({
  id,
  telefone: "+5581988887777",
  creci: "",
  canal: "site",
  status: "novo",
  criadoEm: "2026-09-19T14:00:00.000Z",
  ...parcial,
});

describe("cards do topo", () => {
  it("Para hoje · Em andamento · Clientes · Conversão, coerentes com o funil", () => {
    const leads = [
      lead("1", { status: "em_contato", proximaAcaoEm: "2026-09-18", proximaAcao: "ligar" }), // hoje (vencida)
      lead("2", { status: "demonstracao" }),
      lead("3", { status: "negociacao" }),
      lead("4", { status: "cliente" }),
      lead("5", { status: "retomar", retomarEm: "2026-09-19" }), // hoje
      lead("6", { status: "perdido", motivo: "Preço" }),
      lead("7", { status: "novo" }), // 1 h: ainda não parado
      lead("8", { status: "cliente" }),
    ];
    const cards = cardsDoTopo(leads, AGORA);
    expect(cards.map((c) => [c.chave, c.valor])).toEqual([
      ["hoje", "2"],
      ["andamento", "3"],
      ["clientes", "2"],
      ["conversao", "25%"],
    ]);
    expect(cards.find((c) => c.chave === "clientes")?.detalhe).toBe("de 8 leads");
    expect(cards.find((c) => c.chave === "hoje")?.aba).toBe("hoje");
    expect(cards.find((c) => c.chave === "clientes")?.aba).toBe("cliente");
  });

  it("conversão com casa decimal em pt-BR e lista vazia sem divisão por zero", () => {
    const tres = [lead("1", { status: "cliente" }), lead("2", {}), lead("3", {})];
    expect(cardsDoTopo(tres, AGORA).find((c) => c.chave === "conversao")?.valor).toBe("33,3%");
    const vazio = cardsDoTopo([], AGORA);
    expect(vazio.map((c) => c.valor)).toEqual(["0", "0", "0", "0%"]);
    expect(vazio[0]?.detalhe).toBe("tudo em dia");
    expect(vazio[2]?.detalhe).toBe("de 0 leads");
  });
});
