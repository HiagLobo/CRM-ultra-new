/**
 * Mínimo faturável, implantação por porte e a divisão da implantação em
 * entrada (na assinatura) e saldo (na conclusão), mais o que o plano anual faz
 * com o total do ano. A conta fica na asserção, em centavos.
 */
import { describe, it, expect } from "vitest";
import { calcularOrcamento, partirImplantacao } from "./calculo";
import { implantacaoDoPorte, minimoFaturavel } from "./porte";
import { ENTRADA_PADRAO_PCT, NOME_IMPLANTACAO, TABELA, type TabelaPrecos } from "./tabela";

/** Atalho: o cálculo que deu certo, ou uma falha clara no teste. */
function calculado(...args: Parameters<typeof calcularOrcamento>) {
  const r = calcularOrcamento(...args);
  if (!r.ok) throw new Error(`esperava cálculo aprovado, veio ${r.erro}`);
  return r.calculo;
}

describe("anual, mínimo faturável e implantação", () => {
  // 5 assentos Pro = 2 x 179,00 + 3 x 139,00 = 775,00
  const cincoPro = { publico: "imobiliaria" as const, assentos: { pro: 5, ultra: 0 } };

  it("anual: 12 meses pelo preço de 10, com implantação isenta", () => {
    const mensal = calculado(cincoPro);
    expect(mensal.totais.mensalCentavos).toBe(77_500);
    expect(mensal.totais.anoCentavos).toBe(77_500 * 12); // 930.000
    expect(mensal.totais.implantacaoCentavos).toBe(179_000);

    const anual = calculado({ ...cincoPro, anual: true });
    expect(anual.totais.anoCentavos).toBe(77_500 * 10); // 775.000
    expect(anual.totais.economiaAnualCentavos).toBe(77_500 * 2); // os 2 meses poupados
    expect(anual.totais.implantacaoCentavos).toBe(0);
    expect(anual.totais.implantacaoCheiaCentavos).toBe(179_000); // o documento mostra o que foi abatido
  });

  it("desconto e anual juntos: o desconto entra na linha, o anual nos meses", () => {
    const c = calculado({ publico: "imobiliaria", assentos: { pro: 10, ultra: 0 }, descontoPct: 20, anual: true });
    // 145.000 x 0,80 = 116.000 por mês; 10 mensalidades no ano = 1.160.000
    expect(c.totais.mensalCentavos).toBe(116_000);
    expect(c.totais.descontoCentavos).toBe(29_000);
    expect(c.totais.anoCentavos).toBe(1_160_000);
    expect(c.totais.economiaAnualCentavos).toBe(232_000);
    expect(c.condicoes.efetivoPorAssento.pro).toBe(9_666); // 1.160.000 / 120
  });

  it("os 12 pelo preço de 10 valem SÓ no assento: consumo medido é pago por uso", () => {
    const c = calculado({
      publico: "imobiliaria",
      assentos: { pro: 5, ultra: 0 },
      anual: true,
      extras: [{ item: "whatsapp_adicional", quantidade: 2 }], // 298,00 por mês
    });
    expect(c.totais.mensalCentavos).toBe(77_500 + 29_800);
    // 775,00 x 10 meses + 298,00 x 12 meses = 775.000 + 357.600
    expect(c.totais.anoCentavos).toBe(1_132_600);
    // a economia é só a dos assentos, e não 2 meses de extras de graça
    expect(c.totais.economiaAnualCentavos).toBe(155_000);
    expect(c.totais.economiaAnualCentavos).not.toBe(107_300 * 2);
  });

  it("no mensal, o ano é 12 vezes o mensal, extras inclusos", () => {
    const c = calculado({
      publico: "imobiliaria",
      assentos: { pro: 5, ultra: 0 },
      extras: [{ item: "whatsapp_adicional", quantidade: 2 }],
    });
    expect(c.totais.anoCentavos).toBe(c.totais.mensalCentavos * 12);
    expect(c.totais.economiaAnualCentavos).toBe(0);
  });

  it("a condição de fundador isenta a implantação, e o resto do preço fica igual", () => {
    const c = calculado({ ...cincoPro, condicaoFundador: true });
    expect(c.totais.mensalCentavos).toBe(77_500);
    expect(c.totais.implantacaoCentavos).toBe(0);
    expect(c.condicoes.condicaoFundador).toBe(true);
  });

  it("mínimo faturável por público: autônomo 1, imobiliária 3, rede 5 por unidade", () => {
    expect(minimoFaturavel("autonomo", 1)).toBe(1);
    expect(minimoFaturavel("imobiliaria", 1)).toBe(3);
    expect(minimoFaturavel("rede", 4)).toBe(20);

    expect(calcularOrcamento({ publico: "imobiliaria", assentos: { pro: 2, ultra: 0 } })).toEqual({
      ok: false,
      erro: "assentos_abaixo_do_minimo",
      minimo: 3,
      assentos: 2,
    });
    expect(calcularOrcamento({ publico: "rede", assentos: { pro: 10, ultra: 0 }, unidades: 3 })).toEqual({
      ok: false,
      erro: "assentos_abaixo_do_minimo",
      minimo: 15,
      assentos: 10,
    });
    expect(calcularOrcamento({ publico: "autonomo", assentos: { pro: 0, ultra: 0 } })).toEqual({
      ok: false,
      erro: "sem_assentos",
    });
  });

  it("implantação da rede: matriz mais cada unidade ativada", () => {
    expect(implantacaoDoPorte("rede", 25, 5)).toEqual({
      centavos: 1_190_000 + 5 * 99_000, // 16.850,00
      descricao: `${NOME_IMPLANTACAO}, matriz mais 5 unidades ativadas`,
    });
    expect(implantacaoDoPorte("imobiliaria", 9, 1).centavos).toBe(179_000);
    expect(implantacaoDoPorte("imobiliaria", 10, 1).centavos).toBe(299_000);
    expect(implantacaoDoPorte("autonomo", 1, 1).centavos).toBe(0);
  });

  it("imobiliária acima de 49 assentos fica na faixa de cima (o plano só escreve até 49)", () => {
    expect(implantacaoDoPorte("imobiliaria", 49, 1).centavos).toBe(299_000);
    expect(implantacaoDoPorte("imobiliaria", 50, 1).centavos).toBe(299_000);
    expect(implantacaoDoPorte("imobiliaria", 300, 1).centavos).toBe(299_000);
    // e o cálculo inteiro concorda com o porte
    expect(calculado({ publico: "imobiliaria", assentos: { pro: 60, ultra: 0 } }).totais.implantacaoCheiaCentavos).toBe(
      299_000,
    );
  });
});

describe("implantação: entrada na assinatura e saldo na conclusão", () => {
  const cincoPro = { publico: "imobiliaria" as const, assentos: { pro: 5, ultra: 0 } };

  it("metade na assinatura por padrão, metade na conclusão", () => {
    const c = calculado(cincoPro);
    expect(c.implantacao).toEqual({
      totalCentavos: 179_000,
      entradaCentavos: 89_500, // 50% de 1.790,00
      saldoCentavos: 89_500,
      entradaPct: 50,
    });
    // o retrato gravado leva as duas partes, não só o total
    expect(c.totais.implantacaoEntradaCentavos).toBe(89_500);
    expect(c.totais.implantacaoSaldoCentavos).toBe(89_500);
    expect(c.condicoes.entradaPct).toBe(ENTRADA_PADRAO_PCT);
  });

  it("a entrada é editável por orçamento, e 100% zera o saldo", () => {
    expect(calculado({ ...cincoPro, entradaPct: 30 }).implantacao).toMatchObject({
      entradaCentavos: 53_700, // 30% de 1.790,00
      saldoCentavos: 125_300,
    });
    expect(calculado({ ...cincoPro, entradaPct: 100 }).implantacao).toMatchObject({
      entradaCentavos: 179_000,
      saldoCentavos: 0,
    });
  });

  it("centavo quebrado fica na ENTRADA, nunca no saldo", () => {
    // tabela de mentira com implantação ímpar: 1.790,01 dividido ao meio
    const impar: TabelaPrecos = {
      ...TABELA,
      implantacao: { ...TABELA.implantacao, imobiliaria: [{ ate: null, centavos: 179_001, rotulo: "faixa única" }] },
    };
    const c = calculado(cincoPro, impar);
    expect(c.implantacao.entradaCentavos).toBe(89_501);
    expect(c.implantacao.saldoCentavos).toBe(89_500);
    expect(c.implantacao.entradaCentavos + c.implantacao.saldoCentavos).toBe(179_001);
    expect(partirImplantacao(3, 50)).toMatchObject({ entradaCentavos: 2, saldoCentavos: 1 });
  });

  it("implantação isenta não cobra entrada nem saldo, e o documento vê o que foi abatido", () => {
    const c = calculado({ ...cincoPro, anual: true });
    expect(c.implantacao).toEqual({ totalCentavos: 0, entradaCentavos: 0, saldoCentavos: 0, entradaPct: 50 });
    expect(c.totais.implantacaoCheiaCentavos).toBe(179_000);
  });
});

