/**
 * O cálculo do orçamento, com a CONTA na asserção: quem ler o teste confere a
 * escada marginal no papel, sem rodar nada. Todo valor em centavos.
 *
 * A escada é a parte traiçoeira: com 8 assentos são 2 na primeira faixa e 6 na
 * segunda, nunca 8 na segunda.
 */
import { describe, it, expect } from "vitest";
import { calcularOrcamento } from "./calculo";
import { FAIXAS, PISOS, TABELA, type TabelaPrecos } from "./tabela";

/** Atalho: o cálculo que deu certo, ou uma falha clara no teste. */
function calculado(...args: Parameters<typeof calcularOrcamento>) {
  const r = calcularOrcamento(...args);
  if (!r.ok) throw new Error(`esperava cálculo aprovado, veio ${r.erro}`);
  return r.calculo;
}

describe("escada marginal: cada assento entra pela faixa dele", () => {
  it("1 assento Pro, autônomo: só o 1º da escada", () => {
    const c = calculado({ publico: "autonomo", assentos: { pro: 1, ultra: 0 } });
    expect(c.totais.assentosCentavos).toBe(17_900); // 1 x 179,00
    expect(c.totais.mensalCentavos).toBe(17_900);
    expect(c.totais.anoCentavos).toBe(17_900 * 12); // 214.800 = R$ 2.148,00
    expect(c.totais.implantacaoCheiaCentavos).toBe(0); // autônomo não paga implantação
    expect(c.itens.filter((i) => i.tipo === "assento")).toEqual([
      {
        tipo: "assento",
        codigo: "pro",
        descricao: "Assento Pro",
        quantidade: 1,
        unitarioCentavos: 17_900,
        totalCentavos: 17_900,
        faixa: "1º e 2º assento",
      },
    ]);
  });

  it("8 assentos (3 Ultra + 5 Pro): 2 na 1ª faixa e 6 na 2ª, nunca 8 na 2ª", () => {
    const c = calculado({ publico: "imobiliaria", assentos: { pro: 5, ultra: 3 } });
    const linhas = c.itens.filter((i) => i.tipo === "assento");

    // Ultra ocupa as posições 1 a 3: 2 x 299,00 na 1ª faixa + 1 x 229,00 na 2ª
    expect(linhas[0]).toMatchObject({ codigo: "ultra", quantidade: 2, unitarioCentavos: 29_900, totalCentavos: 59_800 });
    expect(linhas[1]).toMatchObject({ codigo: "ultra", quantidade: 1, unitarioCentavos: 22_900, totalCentavos: 22_900 });
    // Pro ocupa as posições 4 a 8, todas na 2ª faixa: 5 x 139,00
    expect(linhas[2]).toMatchObject({ codigo: "pro", quantidade: 5, unitarioCentavos: 13_900, totalCentavos: 69_500 });
    expect(linhas).toHaveLength(3);

    // 59.800 + 22.900 + 69.500 = 152.200 (R$ 1.522,00)
    expect(c.totais.assentosCentavos).toBe(152_200);
    // a leitura errada seria 8 assentos na 2ª faixa: 3 x 229 + 5 x 139 = 137.200
    expect(c.totais.assentosCentavos).not.toBe(3 * 22_900 + 5 * 13_900);
    expect(c.totais.implantacaoCentavos).toBe(179_000); // imobiliária até 9 assentos
  });

  it("150 assentos Pro: as cinco faixas somadas", () => {
    const c = calculado({ publico: "rede", assentos: { pro: 150, ultra: 0 }, unidades: 10 });
    // 2 x 179,00 + 7 x 139,00 + 20 x 119,00 + 70 x 105,00 + 51 x 95,00
    const esperado = 2 * 17_900 + 7 * 13_900 + 20 * 11_900 + 70 * 10_500 + 51 * 9_500;
    expect(esperado).toBe(1_590_600); // R$ 15.906,00
    expect(c.totais.assentosCentavos).toBe(1_590_600);
    expect(c.itens.filter((i) => i.tipo === "assento")).toHaveLength(5);
    // rede: matriz 11.900,00 + 10 unidades x 990,00 = 21.800,00
    expect(c.totais.implantacaoCentavos).toBe(1_190_000 + 10 * 99_000);
  });
});

describe("desconto: o piso é trava, não aviso", () => {
  // 10 assentos Pro = 2 x 179,00 + 7 x 139,00 + 1 x 119,00 = 1.450,00
  const dezPro = { publico: "imobiliaria" as const, assentos: { pro: 10, ultra: 0 } };

  it("a conta base dos 10 assentos", () => {
    expect(calculado(dezPro).totais.assentosCentavos).toBe(145_000);
  });

  it("41,37% ainda passa: 145.000 x 0,5863 = 85.013,5, arredondado para cima = 85.014", () => {
    const c = calculado({ ...dezPro, descontoPct: 41.37 });
    expect(c.totais.mensalCentavos).toBe(85_014); // piso x 10 assentos = 85.000
    expect(c.totais.descontoCentavos).toBe(145_000 - 85_014);
    expect(c.condicoes.efetivoPorAssento.pro).toBe(8_501); // acima do piso de 85,00
    expect(c.condicoes.descontoAlto).toBe(true); // passou de 15%
  });

  it("41,38% recusa: 145.000 x 0,5862 = 84.999, um centavo abaixo do piso", () => {
    const r = calcularOrcamento({ ...dezPro, descontoPct: 41.38 });
    expect(r).toEqual({ ok: false, erro: "abaixo_do_piso", nivel: "pro", piso: 8_500, efetivo: 8_499 });
  });

  it("o piso do Ultra é maior e vale sozinho", () => {
    // 2 assentos Ultra = 2 x 299,00 = 598,00; piso 109,00 x 2 = 218,00
    const r = calcularOrcamento({ publico: "autonomo", assentos: { pro: 0, ultra: 2 }, descontoPct: 64 });
    expect(r).toEqual({ ok: false, erro: "abaixo_do_piso", nivel: "ultra", piso: 10_900, efetivo: 10_764 });
    expect(PISOS.ultra).toBeGreaterThan(PISOS.pro);
  });

  it("abaixo de 15% não acende o aviso; 15% acende", () => {
    expect(calculado({ ...dezPro, descontoPct: 14.99 }).condicoes.descontoAlto).toBe(false);
    expect(calculado({ ...dezPro, descontoPct: 15 }).condicoes.descontoAlto).toBe(true);
  });

  it("conta misturada: o piso do Pro aperta primeiro (5 Pro + 3 Ultra)", () => {
    // Ultra ocupa 1 a 3 = 827,00 e Pro ocupa 4 a 8 = 695,00; o piso do Pro é
    // 85,00 x 5 = 425,00, e o do Ultra 109,00 x 3 = 327,00 (sobra muito mais)
    const misturado = { publico: "imobiliaria" as const, assentos: { pro: 5, ultra: 3 } };
    const passa = calculado({ ...misturado, descontoPct: 38.85 });
    expect(passa.condicoes.efetivoPorAssento.pro).toBe(8_500); // exatamente no piso
    expect(passa.condicoes.efetivoPorAssento.ultra).toBeGreaterThan(PISOS.ultra);

    // 69.500 x 0,6114 = 42.492,3, arredondado para cima = 42.493, abaixo de 42.500
    expect(calcularOrcamento({ ...misturado, descontoPct: 38.86 })).toEqual({
      ok: false,
      erro: "abaixo_do_piso",
      nivel: "pro",
      piso: 8_500,
      efetivo: 8_498,
    });
  });
});

describe("o piso vale sobre o que o cliente PAGA (anual incluído)", () => {
  const dezPro = { publico: "imobiliaria" as const, assentos: { pro: 10, ultra: 0 } };

  it("o caso que passava: 41,37% no anual é recusado, porque o pago cai 16,67%", () => {
    // mensal: 145.000 x 0,5863 = 85.014, que no mensal fica acima do piso
    expect(calculado({ ...dezPro, descontoPct: 41.37 }).totais.mensalCentavos).toBe(85_014);
    // anual: paga 10 mensalidades em 12 meses = 850.140 no ano, contra o piso de
    // 85,00 x 10 assentos x 12 meses = 1.020.000. Dá R$ 70,84 por assento/mês.
    expect(calcularOrcamento({ ...dezPro, descontoPct: 41.37, anual: true })).toEqual({
      ok: false,
      erro: "abaixo_do_piso",
      nivel: "pro",
      piso: 8_500,
      efetivo: 7_084,
    });
  });

  it("no anual o teto do desconto cai para 29,65% (era 41,37% no mensal)", () => {
    const passa = calculado({ ...dezPro, descontoPct: 29.65, anual: true });
    // 145.000 x 0,7035 = 102.007,5 → 102.008; x 10 meses = 1.020.080 ≥ 1.020.000
    expect(passa.totais.mensalCentavos).toBe(102_008);
    expect(passa.condicoes.efetivoPorAssento.pro).toBe(8_500);

    expect(calcularOrcamento({ ...dezPro, descontoPct: 29.66, anual: true })).toMatchObject({
      ok: false,
      erro: "abaixo_do_piso",
      nivel: "pro",
      efetivo: 8_499,
    });
  });

  it("mesma trava no Ultra: 56,25% passa no anual, 56,26% não", () => {
    // 2 Ultra = 598,00; piso 109,00 x 2 x 12 = 2.616,00 no ano
    const doisUltra = { publico: "autonomo" as const, assentos: { pro: 0, ultra: 2 } };
    expect(calculado({ ...doisUltra, descontoPct: 56.25, anual: true }).condicoes.efetivoPorAssento.ultra).toBe(10_901);
    expect(calcularOrcamento({ ...doisUltra, descontoPct: 56.26, anual: true })).toEqual({
      ok: false,
      erro: "abaixo_do_piso",
      nivel: "ultra",
      piso: 10_900,
      efetivo: 10_898,
    });
  });

  it("sem desconto, o anual sozinho não fura o piso", () => {
    const c = calculado({ ...dezPro, anual: true });
    // 145.000 x 10 / 12 = 120.833,33 por mês, ou R$ 120,83 por assento
    expect(c.condicoes.efetivoPorAssento.pro).toBe(12_083);
    expect(c.totais.anoCentavos).toBe(1_450_000);
  });
});

describe("extras entram sem desconto, e o que é única não entra no mensal", () => {
  it("desconto só na linha de assento", () => {
    const c = calculado({
      publico: "imobiliaria",
      assentos: { pro: 5, ultra: 0 },
      descontoPct: 10,
      extras: [
        { item: "whatsapp_adicional", quantidade: 2 }, // 2 x 149,00 por mês
        { item: "migracao_lote", quantidade: 1 }, // 1.290,00 uma vez
      ],
    });
    expect(c.totais.assentosCentavos).toBe(77_500);
    expect(c.totais.descontoCentavos).toBe(7_750); // 10% de 775,00
    expect(c.totais.extrasMensaisCentavos).toBe(29_800);
    expect(c.totais.extrasUnicosCentavos).toBe(129_000);
    // 69.750 (assentos com desconto) + 29.800 (mensais) = 99.550
    expect(c.totais.mensalCentavos).toBe(99_550);
    expect(c.totais.anoCentavos).toBe(99_550 * 12);
    // o extra não levou desconto: 2 x 149,00 cheios
    expect(c.itens.find((i) => i.codigo === "whatsapp_adicional")).toMatchObject({
      quantidade: 2,
      unitarioCentavos: 14_900,
      totalCentavos: 29_800,
      recorrencia: "mensal",
    });
  });

  it("quantidade negativa ou quebrada é aparada, nunca vira desconto disfarçado", () => {
    const negativo = calculado({
      publico: "imobiliaria",
      assentos: { pro: 5, ultra: 0 },
      extras: [{ item: "whatsapp_adicional", quantidade: -3 }],
    });
    expect(negativo.totais.extrasMensaisCentavos).toBe(0);
    expect(negativo.totais.mensalCentavos).toBe(77_500);
    expect(negativo.itens.some((i) => i.tipo === "extra")).toBe(false);

    const quebrado = calculado({
      publico: "imobiliaria",
      assentos: { pro: 5, ultra: 0 },
      extras: [{ item: "whatsapp_adicional", quantidade: 2.9 }],
    });
    expect(quebrado.totais.extrasMensaisCentavos).toBe(29_800); // 2 unidades, não 2,9
  });

  it("código de extra que a tabela não conhece recusa, em vez de sumir da conta", () => {
    const tabelaSemExtras: TabelaPrecos = { ...TABELA, extras: [] };
    const r = calcularOrcamento(
      { publico: "autonomo", assentos: { pro: 1, ultra: 0 }, extras: [{ item: "radar_avulso", quantidade: 1 }] },
      tabelaSemExtras,
    );
    expect(r).toEqual({ ok: false, erro: "extra_desconhecido" });
  });
});

describe("o dinheiro é inteiro do começo ao fim", () => {
  it("nenhum total sai com centavo quebrado, nem com desconto de 2 casas", () => {
    for (const pct of [0, 7.5, 12.34, 15, 33.33]) {
      const c = calculado({ publico: "imobiliaria", assentos: { pro: 7, ultra: 4 }, descontoPct: pct });
      for (const valor of Object.values(c.totais)) expect(Number.isInteger(valor)).toBe(true);
      for (const item of c.itens) {
        expect(Number.isInteger(item.unitarioCentavos)).toBe(true);
        expect(Number.isInteger(item.totalCentavos)).toBe(true);
      }
    }
  });

  it("a soma das linhas de assento é o subtotal de assentos", () => {
    const c = calculado({ publico: "rede", assentos: { pro: 40, ultra: 12 }, unidades: 8 });
    const soma = c.itens.filter((i) => i.tipo === "assento").reduce((t, i) => t + i.totalCentavos, 0);
    expect(soma).toBe(c.totais.assentosCentavos);
  });

  it("a tabela entra por parâmetro: mudar a faixa muda o cálculo novo", () => {
    const maisCara: TabelaPrecos = { ...TABELA, faixas: FAIXAS.map((f) => ({ ...f, pro: f.pro + 1_000 })) };
    expect(calculado({ publico: "autonomo", assentos: { pro: 1, ultra: 0 } }, maisCara).totais.mensalCentavos).toBe(18_900);
    expect(calculado({ publico: "autonomo", assentos: { pro: 1, ultra: 0 } }).totais.mensalCentavos).toBe(17_900);
  });
});
