/**
 * Funções puras do domínio da avaliação: o texto do consentimento (que a tela
 * mostra e o banco guarda), a média do site e a leitura tolerante do banco.
 */
import { describe, it, expect } from "vitest";
import { normalizarIdentificacao, normalizarStatusAvaliacao, resumo, resumoDaContagem } from "./avaliacao";
import { notasDoArquivo } from "./doArquivo";

describe("resumo (média com 1 casa e contagem)", () => {
  const notas = (...n: number[]) => n.map((estrelas) => ({ estrelas }));

  it("sem avaliação nenhuma: zero, sem dividir por zero", () => {
    expect(resumo([])).toEqual({ media: 0, quantas: 0 });
    expect(resumoDaContagem(0, 0)).toEqual({ media: 0, quantas: 0 });
  });

  it("média com 1 casa decimal", () => {
    expect(resumo(notas(5, 5, 4))).toEqual({ media: 4.7, quantas: 3 });
    expect(resumo(notas(5, 4))).toEqual({ media: 4.5, quantas: 2 });
  });

  it("soma o que veio do arquivo (decisão F4: as 3 avaliações antigas continuam contando)", () => {
    // 3 do arquivo (5, 5, 4) + 1 nova de 3 estrelas
    expect(resumo(notas(3), notas(5, 5, 4))).toEqual({ media: 4.3, quantas: 4 });
    expect(resumoDaContagem(3, 1, notas(5, 5, 4))).toEqual({ media: 4.3, quantas: 4 });
  });

  it("a contagem do banco dá o mesmo resultado de somar as linhas na memória", () => {
    const lista = notas(5, 4, 3, 5);
    const soma = lista.reduce((t, a) => t + a.estrelas, 0);
    expect(resumoDaContagem(soma, lista.length)).toEqual(resumo(lista));
  });

  it("duas no banco (5 e 4) + as três do arquivo (5, 5, 4) = 5 avaliações, média 4,6", () => {
    // o número que a landing mostra, já somado no servidor (contrato da O10)
    expect(notasDoArquivo().map((n) => n.estrelas)).toEqual([5, 5, 4]);
    expect(resumo(notas(5, 4), notasDoArquivo())).toEqual({ media: 4.6, quantas: 5 });
    expect(resumoDaContagem(9, 2, notasDoArquivo())).toEqual({ media: 4.6, quantas: 5 });
  });
});

describe("leitura tolerante do banco", () => {
  it("identificação desconhecida vira anônima — na dúvida, nome de ninguém vai ao ar", () => {
    expect(normalizarIdentificacao("nome_creci")).toBe("nome_creci");
    expect(normalizarIdentificacao("inventado")).toBe("anonimo");
    expect(normalizarIdentificacao(undefined)).toBe("anonimo");
  });

  it("situação desconhecida vira pendente — na dúvida, o texto fica fora do ar", () => {
    expect(normalizarStatusAvaliacao("recusado")).toBe("recusado");
    expect(normalizarStatusAvaliacao("qualquer")).toBe("pendente");
    expect(normalizarStatusAvaliacao(null)).toBe("pendente");
  });
});
