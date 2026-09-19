/**
 * Guarda dos depoimentos: nada vai ao ar sem nome, local e autorização
 * registrada, e nenhum texto pode carregar contato da pessoa.
 */
import { describe, it, expect } from "vitest";
import { DEPOIMENTOS, assinatura, type Depoimento } from "./depoimentos";

const caso = (d: Depoimento) => `${d.id} (${d.nome})`;

describe("depoimentos publicados", () => {
  it("todos têm id único", () => {
    const ids = DEPOIMENTOS.map((d) => d.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(DEPOIMENTOS.map((d) => [caso(d), d] as const))("%s tem nome, local e texto de gente", (_, d) => {
    expect(d.nome.trim().length).toBeGreaterThanOrEqual(2);
    expect(d.local.trim().length).toBeGreaterThanOrEqual(2);
    expect(d.texto.trim().length).toBeGreaterThanOrEqual(20);
    expect(d.texto).not.toMatch(/^"|"$/); // as aspas são da tela, não do dado
  });

  it.each(DEPOIMENTOS.map((d) => [caso(d), d] as const))("%s tem autorização registrada (data e canal)", (_, d) => {
    expect(d.autorizacao.canal).toBeTruthy();
    expect(d.autorizacao.em).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    const dia = new Date(`${d.autorizacao.em}T12:00:00Z`);
    expect(Number.isNaN(dia.getTime())).toBe(false);
    expect(dia.getTime()).toBeLessThanOrEqual(Date.now());
  });

  it.each(DEPOIMENTOS.map((d) => [caso(d), d] as const))("%s não expõe contato nem vira promessa", (_, d) => {
    expect(d.texto).not.toMatch(/@|https?:\/\/|\(?\d{2}\)?\s?9?\d{4}[-\s]?\d{4}/); // e-mail, link ou telefone
    expect(d.texto.toLowerCase()).not.toMatch(/garant|lucro de|\d+\s?% a mais/); // promessa de resultado
  });

  it("ninguém é apresentado como cliente: todos testaram a demonstração", () => {
    for (const d of DEPOIMENTOS) expect(d.contexto).toBe("testou a demonstração");
  });

  it("a assinatura sai legível", () => {
    expect(assinatura(DEPOIMENTOS[0]!)).toBe("Ricardo, corretor em Recife");
    expect(
      assinatura({ ...DEPOIMENTOS[0]!, nome: "Ana", papel: "Imobiliária", local: "Olinda" }),
    ).toBe("Ana, imobiliária em Olinda");
  });
});
