/**
 * A conta do orçamento fecha? O documento só é impresso quando sim, então cada
 * jeito de não fechar tem um teste: linha errada, soma diferente do total,
 * entrada e saldo que não somam a implantação, implantação cobrada onde ela é
 * isenta e nível contratado sem o que está incluso.
 *
 * O ponto de partida é o orçamento de exemplo: se ele deixar de fechar, o
 * primeiro teste avisa antes de alguém conferir a folha com número torto.
 */
import { describe, it, expect } from "vitest";
import { conferirTotais, problemasDoOrcamento } from "./conferencia";
import { ORCAMENTO_EXEMPLO } from "./exemplo";
import type { Orcamento } from "./tiposOrcamento";

const com = (mudanca: Partial<Orcamento>): Orcamento => ({ ...ORCAMENTO_EXEMPLO, ...mudanca });

describe("conferir os totais", () => {
  it("proposta com desconto fecha pela identidade da trilha A (achado da integração)", () => {
    // as linhas de assento trazem o preço de TABELA e o desconto é linha
    // própria: somar as linhas sem tirar o desconto recusava TODA proposta
    // negociada, que é a maioria
    const negociada = com({
      assentos: [{ codigo: "pro", nivel: "Pro", quantidade: 5, precoUnitario: 179, total: 895 }],
      extras: [
        { item: "analise_credito", rotulo: "Análise de crédito", quantidade: 10, precoUnitario: 89, total: 890 },
        { item: "radar_pacote_50", rotulo: "Pacote de 50 consultas", quantidade: 1, precoUnitario: 119, total: 119 },
      ],
      totais: {
        ...ORCAMENTO_EXEMPLO.totais,
        assentos: 895,
        desconto: 89.5,
        extrasMensais: 890,
        extrasUnicos: 119,
        mensal: 1695.5,
        anual: 20346,
      },
    });
    expect(conferirTotais(negociada)).toEqual([]);
  });

  it("recusa quando o mensal não fecha com a identidade", () => {
    const torto = com({
      assentos: [{ codigo: "pro", nivel: "Pro", quantidade: 5, precoUnitario: 179, total: 895 }],
      extras: [],
      totais: { ...ORCAMENTO_EXEMPLO.totais, assentos: 895, desconto: 89.5, extrasMensais: 0, mensal: 895 },
    });
    expect(conferirTotais(torto)).toContain("as linhas não somam o total mensal");
  });

  it("o orçamento de exemplo fecha, nas linhas e nos blocos", () => {
    expect(conferirTotais(ORCAMENTO_EXEMPLO)).toEqual([]);
    expect(problemasDoOrcamento(ORCAMENTO_EXEMPLO)).toEqual([]);
  });

  it("linha em que quantidade vezes preço não dá o total", () => {
    const torto = com({
      assentos: [{ codigo: "pro", nivel: "Pro", quantidade: 2, precoUnitario: 179, total: 400 }],
      totais: { mensal: 400, anual: 4800 },
    });
    expect(conferirTotais(torto)).toContain("assento pro: quantidade vezes preço não dá o total da linha");
  });

  it("as linhas precisam somar o total mensal", () => {
    expect(conferirTotais(com({ totais: { mensal: 2000, anual: 24000 } }))).toContain(
      "as linhas não somam o total mensal",
    );
  });

  it("extra pode estar dentro ou fora da mensalidade (as duas leituras passam)", () => {
    const soAssentos = ORCAMENTO_EXEMPLO.totais.mensal; // 1898, sem o extra
    const comExtras = soAssentos + ORCAMENTO_EXEMPLO.extras.reduce((s, e) => s + e.total, 0);
    expect(conferirTotais(com({ totais: { mensal: soAssentos, anual: soAssentos * 12 } }))).toEqual([]);
    expect(conferirTotais(com({ totais: { mensal: comExtras, anual: comExtras * 12 } }))).toEqual([]);
  });

  it("um centavo de folga não vira problema", () => {
    const quase = com({ totais: { mensal: ORCAMENTO_EXEMPLO.totais.mensal + 0.01, anual: 22776 } });
    expect(conferirTotais(quase)).toEqual([]);
  });

  it("entrada e saldo precisam somar a implantação", () => {
    const torta = com({ implantacao: { total: 17840, entrada: 8920, saldo: 8000, entradaPct: 50 } });
    expect(conferirTotais(torta)).toContain("entrada e saldo não somam a implantação");
  });

  it("implantação cobrada no anual ou na condição de fundador (onde é isenta)", () => {
    expect(conferirTotais(com({ anual: true }))).toContain("implantação cobrada no plano anual, em que ela é isenta");
    expect(conferirTotais(com({ condicaoFundador: true }))).toContain(
      "implantação cobrada na condição de fundador, em que ela é isenta",
    );
  });

  it("implantação isenta (sem o bloco) passa limpo no anual e no fundador", () => {
    const isenta = com({ implantacao: undefined, anual: true, condicaoFundador: true });
    expect(conferirTotais(isenta)).toEqual([]);
  });

  it("implantação só com o número antigo, sem entrada e saldo", () => {
    const antiga = com({ implantacao: undefined, totais: { mensal: 1898, anual: 22776, implantacao: 17840 } });
    expect(conferirTotais(antiga)).toContain("implantação sem entrada e saldo");
  });

  it("nível contratado sem a lista do que está incluso", () => {
    const semUltra = com({ inclusos: { pro: ORCAMENTO_EXEMPLO.inclusos.pro ?? [] } });
    expect(problemasDoOrcamento(semUltra)).toContain("nível ultra contratado sem a lista do que está incluso");
  });
});
