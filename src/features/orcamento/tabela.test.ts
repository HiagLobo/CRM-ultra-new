/**
 * A tabela oficial é a fonte única de preço (O11). Este teste trava o que o
 * fundador decidiu no 00-PLANO: mexer num número aqui quebra o teste, que é o
 * momento de olhar o plano de novo — não de "consertar" o teste.
 */
import { describe, it, expect } from "vitest";
import {
  CODIGOS_EXTRA,
  CONDICAO_FUNDADOR,
  DESCONTO_QUE_AVISA,
  ENTRADA_MAX_PCT,
  ENTRADA_MIN_PCT,
  ENTRADA_PADRAO_PCT,
  EXTRAS,
  FAIXAS,
  FRANQUIAS,
  IMPLANTACAO,
  INCLUSOS,
  MESES_DO_ANO,
  MESES_PAGOS_NO_ANUAL,
  MINIMO_FATURAVEL,
  NIVEIS,
  NOME_IMPLANTACAO,
  PISOS,
  VALIDADE_PADRAO_DIAS,
  extraPorCodigo,
} from "./tabela";

describe("faixas da escada", () => {
  it("as cinco faixas do 00-PLANO, nos valores decididos", () => {
    expect(FAIXAS.map((f) => [f.de, f.ate, f.pro, f.ultra])).toEqual([
      [1, 2, 17_900, 29_900],
      [3, 9, 13_900, 22_900],
      [10, 29, 11_900, 18_900],
      [30, 99, 10_500, 16_500],
      [100, null, 9_500, 14_900],
    ]);
  });

  it("cobrem a escada sem buraco e sem sobreposição, e barateiam a cada faixa", () => {
    FAIXAS.forEach((faixa, i) => {
      const anterior = FAIXAS[i - 1];
      if (!anterior) return expect(faixa.de).toBe(1);
      expect(faixa.de).toBe((anterior.ate ?? 0) + 1);
      for (const nivel of NIVEIS) expect(faixa[nivel]).toBeLessThan(anterior[nivel]);
    });
    expect(FAIXAS[FAIXAS.length - 1]!.ate).toBeNull(); // a última não acaba
  });

  it("todo preço é centavo inteiro, e o Ultra custa mais que o Pro em toda faixa", () => {
    for (const faixa of FAIXAS) {
      for (const nivel of NIVEIS) expect(Number.isInteger(faixa[nivel])).toBe(true);
      expect(faixa.ultra).toBeGreaterThan(faixa.pro);
    }
  });
});

describe("pisos, mínimos e prazos", () => {
  it("piso efetivo por assento: Pro 85,00 e Ultra 109,00", () => {
    expect(PISOS).toEqual({ pro: 8_500, ultra: 10_900 });
  });

  it("o piso é menor que o preço mais barato da escada (senão nunca caberia desconto)", () => {
    const maisBarata = FAIXAS[FAIXAS.length - 1]!;
    for (const nivel of NIVEIS) expect(PISOS[nivel]).toBeLessThan(maisBarata[nivel]);
  });

  it("mínimo faturável, aviso de desconto, anual e validade", () => {
    expect(MINIMO_FATURAVEL).toEqual({ autonomo: 1, imobiliaria: 3, rede: 5 });
    expect(DESCONTO_QUE_AVISA).toBe(15);
    expect(MESES_PAGOS_NO_ANUAL).toBe(10);
    expect(MESES_DO_ANO).toBe(12);
    expect(VALIDADE_PADRAO_DIAS).toBe(15);
  });

  it("entrada da implantação: metade na assinatura, entre 10% e 100%", () => {
    expect(ENTRADA_PADRAO_PCT).toBe(50);
    expect(ENTRADA_MIN_PCT).toBe(10);
    expect(ENTRADA_MAX_PCT).toBe(100);
    expect(ENTRADA_PADRAO_PCT).toBeGreaterThanOrEqual(ENTRADA_MIN_PCT);
    expect(ENTRADA_PADRAO_PCT).toBeLessThanOrEqual(ENTRADA_MAX_PCT);
    // o nome no documento fala de personalização; a amortização saiu do modelo
    expect(NOME_IMPLANTACAO).toContain("Personalização");
    expect(NOME_IMPLANTACAO.toLowerCase()).not.toContain("amortiz");
  });

  it("implantação por porte, em centavos", () => {
    expect(IMPLANTACAO.autonomo).toBe(0);
    expect(IMPLANTACAO.imobiliaria.map((f) => [f.ate, f.centavos])).toEqual([
      [9, 179_000],
      [null, 299_000],
    ]);
    expect(IMPLANTACAO.rede).toEqual({ matriz: 1_190_000, porUnidade: 99_000 });
  });

  it("franquias de uso inclusas", () => {
    expect(FRANQUIAS).toEqual({
      iaPorAssento: 25,
      reunioesPorAssento: 2,
      radarPorAssentoUltra: 8,
      baixasPorConta: 300,
    });
  });
});

describe("extras e textos do documento", () => {
  it("todo código tem um extra, e todo extra está na lista de códigos", () => {
    expect(EXTRAS.map((e) => e.codigo).sort()).toEqual([...CODIGOS_EXTRA].sort());
    for (const codigo of CODIGOS_EXTRA) {
      const extra = extraPorCodigo(codigo);
      expect(extra, codigo).toBeDefined();
      expect(Number.isInteger(extra!.centavos), codigo).toBe(true);
      expect(extra!.centavos, codigo).toBeGreaterThan(0);
      expect(extra!.nome.length, codigo).toBeGreaterThan(3);
    }
    expect(extraPorCodigo("nao_existe")).toBeUndefined();
  });

  it("os preços fechados do 00-PLANO", () => {
    const porCodigo = Object.fromEntries(EXTRAS.map((e) => [e.codigo, e.centavos]));
    expect(porCodigo).toEqual({
      ia_excedente: 150,
      reuniao_excedente: 490,
      radar_avulso: 290,
      radar_pacote_50: 11_900,
      radar_pacote_250: 49_700,
      radar_em_pro: 9_900,
      analise_credito: 8_900,
      baixa_excedente: 90,
      migracao_lote: 129_000,
      turma_treinamento: 69_000,
      whatsapp_adicional: 14_900,
      suporte_sincrono: 29_000,
    });
  });

  it("cada nível tem o que está incluso, e a condição de fundador tem os dois lados", () => {
    for (const nivel of NIVEIS) expect(INCLUSOS[nivel].length).toBeGreaterThan(2);
    expect(CONDICAO_FUNDADOR.vagas).toBe(10);
    expect(CONDICAO_FUNDADOR.oferecemos.length).toBeGreaterThan(3);
    expect(CONDICAO_FUNDADOR.emTroca.length).toBeGreaterThan(3);
  });

  it("nenhum texto da tabela usa travessão (regra do fundador)", () => {
    const textos = [
      ...EXTRAS.map((e) => e.nome),
      ...FAIXAS.map((f) => f.rotulo),
      ...IMPLANTACAO.imobiliaria.map((f) => f.rotulo),
      ...NIVEIS.flatMap((n) => [...INCLUSOS[n]]),
      CONDICAO_FUNDADOR.titulo,
      ...CONDICAO_FUNDADOR.oferecemos,
      ...CONDICAO_FUNDADOR.emTroca,
    ];
    for (const texto of textos) expect(texto, texto).not.toContain("—");
  });
});
