/**
 * Numeração, datas e dinheiro em texto — as funções puras que o painel e o
 * documento A4 dividem. Dinheiro nunca passa por ponto flutuante.
 */
import { describe, it, expect } from "vitest";
import {
  anoEmRecife,
  diaBR,
  diaEmRecife,
  diaMaisDias,
  formatarNumero,
  formatarReais,
  normalizarPublico,
  normalizarStatusOrcamento,
  proximoNumero,
  sequenciaDoNumero,
} from "./orcamento";

describe("numeração ORC-AAAA-NNN", () => {
  it("três dígitos, e mais quando passar de 999 (nunca corta)", () => {
    expect(formatarNumero(2026, 1)).toBe("ORC-2026-001");
    expect(formatarNumero(2026, 42)).toBe("ORC-2026-042");
    expect(formatarNumero(2026, 1000)).toBe("ORC-2026-1000");
  });

  it("o próximo é o maior do ANO mais um (outro ano não interfere)", () => {
    expect(proximoNumero(2026, [])).toBe("ORC-2026-001");
    expect(proximoNumero(2026, ["ORC-2026-001", "ORC-2026-002"])).toBe("ORC-2026-003");
    expect(proximoNumero(2027, ["ORC-2026-009"])).toBe("ORC-2027-001");
    // buraco na sequência (um orçamento excluído) não reaproveita o número
    expect(proximoNumero(2026, ["ORC-2026-001", "ORC-2026-007"])).toBe("ORC-2026-008");
    // lixo na lista não derruba a conta
    expect(proximoNumero(2026, ["", "ORC-XX", "ORC-2026-003"])).toBe("ORC-2026-004");
  });

  it("a sequência sai do número, e 0 quando não é daquele ano", () => {
    expect(sequenciaDoNumero("ORC-2026-012", 2026)).toBe(12);
    expect(sequenciaDoNumero("ORC-2025-012", 2026)).toBe(0);
    expect(sequenciaDoNumero("qualquer coisa", 2026)).toBe(0);
  });
});

describe("dias e validade", () => {
  it("o dia é o do fuso de Recife, onde o fundador trabalha", () => {
    // 20/09/2026 às 23:30 em Brasília ainda é dia 20 (UTC já virou 21)
    expect(diaEmRecife(new Date("2026-09-21T02:30:00.000Z"))).toBe("2026-09-20");
    expect(anoEmRecife(new Date("2027-01-01T02:30:00.000Z"))).toBe(2026);
  });

  it("validade: dia mais os dias corridos, atravessando mês e ano", () => {
    expect(diaMaisDias("2026-09-20", 15)).toBe("2026-10-05");
    expect(diaMaisDias("2026-12-28", 15)).toBe("2027-01-12");
    expect(diaMaisDias("2028-02-28", 1)).toBe("2028-02-29"); // ano bissexto
  });

  it("dia em português, e fora do formato sai como veio", () => {
    expect(diaBR("2026-10-05")).toBe("05/10/2026");
    expect(diaBR("depois")).toBe("depois");
  });
});

describe("centavos em texto", () => {
  it("R$ com milhar e duas casas, sempre do inteiro", () => {
    expect(formatarReais(0)).toBe("R$ 0,00");
    expect(formatarReais(9)).toBe("R$ 0,09");
    expect(formatarReais(17_900)).toBe("R$ 179,00");
    expect(formatarReais(178_499)).toBe("R$ 1.784,99");
    expect(formatarReais(1_590_600)).toBe("R$ 15.906,00");
    expect(formatarReais(-2_500)).toBe("-R$ 25,00");
  });

  it("o valor famoso do plano não vira 1.784,999", () => {
    expect(formatarReais(178_500)).toBe("R$ 1.785,00");
    expect(formatarReais(178_499)).not.toContain("999");
  });
});

describe("valores vindos do banco", () => {
  it("situação desconhecida vira rascunho (não consta como enviada nem aceita)", () => {
    expect(normalizarStatusOrcamento("enviado")).toBe("enviado");
    expect(normalizarStatusOrcamento("inventado")).toBe("rascunho");
    expect(normalizarStatusOrcamento(undefined)).toBe("rascunho");
  });

  it("público desconhecido vira imobiliária", () => {
    expect(normalizarPublico("rede")).toBe("rede");
    expect(normalizarPublico(null)).toBe("imobiliaria");
  });
});
