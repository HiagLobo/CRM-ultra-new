/**
 * Rótulos da avaliação no painel: é por eles que o fundador decide o que tirar
 * do ar. Situação trocada ou motivo errado aqui vira decisão errada lá.
 */
import { describe, it, expect } from "vitest";
import { STATUS_AVALIACAO, IDENTIFICACOES, ROTULO_MOTIVO, type MotivoPendente } from "@/features/avaliacao";
import {
  COR_SITUACAO,
  ROTULO_IDENTIFICACAO,
  ROTULO_SITUACAO,
  avaliacaoNaFicha,
  diaDaAvaliacao,
  motivoEmTexto,
  resumoEmTexto,
  trecho,
} from "./rotulosAvaliacao";

describe("rótulos de situação e identificação", () => {
  it("cada situação tem rótulo e cor próprios, em português", () => {
    expect(ROTULO_SITUACAO).toEqual({ publicado: "No site", pendente: "Para conferir", recusado: "Fora do site" });
    for (const status of STATUS_AVALIACAO) {
      expect(ROTULO_SITUACAO[status]).toBeTruthy();
      expect(COR_SITUACAO[status]).toMatch(/^#/); // cor da palette
    }
    expect(new Set(Object.values(ROTULO_SITUACAO)).size).toBe(STATUS_AVALIACAO.length);
  });

  it("cada escolha de identificação tem rótulo próprio", () => {
    for (const escolha of IDENTIFICACOES) expect(ROTULO_IDENTIFICACAO[escolha]).toBeTruthy();
    expect(ROTULO_IDENTIFICACAO.anonimo).toBe("Anônima");
    expect(new Set(Object.values(ROTULO_IDENTIFICACAO)).size).toBe(IDENTIFICACOES.length);
  });

  it("o motivo vira frase inteira; sem motivo, nada é mostrado", () => {
    expect(motivoEmTexto("link")).toBe("Segurada porque tem link");
    expect(motivoEmTexto("telefone")).toBe("Segurada porque tem telefone");
    expect(motivoEmTexto(undefined)).toBeNull();
    for (const motivo of Object.keys(ROTULO_MOTIVO) as MotivoPendente[]) {
      expect(motivoEmTexto(motivo)).toContain(ROTULO_MOTIVO[motivo]);
    }
  });
});

describe("trecho do comentário", () => {
  it("texto curto sai inteiro, com os espaços normalizados", () => {
    expect(trecho("Organizou   meu\n dia.")).toBe("Organizou meu dia.");
    expect(trecho(undefined)).toBe("");
  });

  it("texto longo corta na palavra inteira e marca com reticências", () => {
    const longo = "palavra ".repeat(40).trim();
    const cortado = trecho(longo, 50);
    expect(cortado.length).toBeLessThanOrEqual(51);
    expect(cortado.endsWith("…")).toBe(true);
    expect(cortado).not.toContain("palavr…"); // nunca parte a palavra no meio
  });

  it("palavra única gigante é cortada mesmo assim (não estoura a tela)", () => {
    expect(trecho("a".repeat(100), 20)).toBe(`${"a".repeat(20)}…`);
  });
});

describe("datas e resumo", () => {
  it("a lista mostra o dia, sem hora (fuso de Recife)", () => {
    expect(diaDaAvaliacao("2026-09-19T15:00:00.000Z")).toBe("19/09/2026");
    // 00:30 UTC do dia 20 ainda é dia 19 em Recife (UTC−3)
    expect(diaDaAvaliacao("2026-09-20T00:30:00.000Z")).toBe("19/09/2026");
  });

  it("a linha da ficha do lead: estrelas + dia", () => {
    expect(avaliacaoNaFicha({ estrelas: 5, criadoEm: "2026-09-19T15:00:00.000Z" })).toBe("★★★★★ em 19/09/2026");
    expect(avaliacaoNaFicha({ estrelas: 4, criadoEm: "2026-09-19T15:00:00.000Z" })).toBe("★★★★☆ em 19/09/2026");
  });

  it("o cartão do topo fala como o site: nota com vírgula e plural certo", () => {
    expect(resumoEmTexto({ media: 4.6, quantas: 5 })).toBe("4,6 de 5 · 5 avaliações");
    expect(resumoEmTexto({ media: 5, quantas: 1 })).toBe("5,0 de 5 · 1 avaliação");
    expect(resumoEmTexto({ media: 0, quantas: 0 })).toBe("Nenhuma avaliação ainda");
  });
});
