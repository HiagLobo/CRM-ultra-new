/**
 * Guarda dos depoimentos: nada vai ao ar sem nome, local e autorização
 * registrada, e nenhum texto pode carregar contato da pessoa.
 */
import { describe, it, expect } from "vitest";
import { DEPOIMENTOS, assinatura, mediaDasNotas, notaEmTexto, type Depoimento } from "./depoimentos";

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

  it.each(DEPOIMENTOS.map((d) => [caso(d), d] as const))("%s: se tem estrela, tem registro da nota", (_, d) => {
    if (!d.avaliacao) return; // quem não avaliou simplesmente não mostra estrela
    expect(Number.isInteger(d.avaliacao.estrelas)).toBe(true);
    expect(d.avaliacao.estrelas).toBeGreaterThanOrEqual(1);
    expect(d.avaliacao.estrelas).toBeLessThanOrEqual(5);
    expect(d.avaliacao.canal).toBeTruthy();
    expect(d.avaliacao.em).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(new Date(`${d.avaliacao.em}T12:00:00Z`).getTime()).toBeLessThanOrEqual(Date.now());
  });

  it("a média vem das notas, não de um número escrito à mão", () => {
    expect(mediaDasNotas([])).toBeNull();
    const semNota = { ...DEPOIMENTOS[0]!, avaliacao: undefined };
    expect(mediaDasNotas([semNota])).toBeNull();
    const d = (estrelas: 1 | 2 | 3 | 4 | 5) => ({
      ...DEPOIMENTOS[0]!,
      avaliacao: { estrelas, em: "2026-09-19", canal: "WhatsApp" as const },
    });
    expect(mediaDasNotas([d(5), d(5), d(4)])).toEqual({ media: 4.7, quantas: 3 });
    expect(mediaDasNotas([d(5), semNota])).toEqual({ media: 5, quantas: 1 });
    expect(notaEmTexto(4.666)).toBe("4,7 de 5");
    expect(notaEmTexto(5)).toBe("5,0 de 5");
  });

  it("as notas publicadas hoje batem com o que cada um respondeu", () => {
    expect(DEPOIMENTOS.map((d) => [d.nome, d.avaliacao?.estrelas])).toEqual([
      ["Rodrigo", 5],
      ["Daniela", 5],
      ["Jorge", 4],
    ]);
  });

  it("a assinatura sai legível", () => {
    expect(assinatura(DEPOIMENTOS[0]!)).toBe("Rodrigo, corretor em Recife");
    expect(
      assinatura({ ...DEPOIMENTOS[0]!, nome: "Ana", papel: "Imobiliária", local: "Olinda" }),
    ).toBe("Ana, imobiliária em Olinda");
  });
});
