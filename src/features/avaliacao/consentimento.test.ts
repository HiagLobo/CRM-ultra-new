/**
 * As três frases do consentimento são fixadas LETRA POR LETRA: a tela do
 * convite mostra estas palavras e o banco grava estas palavras. Mudar uma
 * vírgula aqui muda o que fica registrado como prova (LGPD), então a mudança
 * tem de ser deliberada — nunca efeito colateral de outra mexida.
 */
import { describe, it, expect } from "vitest";
import { brand } from "../../config/brand";
import { IDENTIFICACOES } from "./avaliacao";
import { textoConsentimentoAvaliacao } from "./consentimento";

describe("texto do consentimento da avaliação (LGPD)", () => {
  it("nome + CRECI", () => {
    expect(textoConsentimentoAvaliacao("nome_creci")).toBe(
      `Autorizo publicar meu nome e meu CRECI junto da minha avaliação no site do ${brand.nomeCurto}.`,
    );
  });

  it("só o nome", () => {
    expect(textoConsentimentoAvaliacao("nome")).toBe(
      `Autorizo publicar meu nome, sem o CRECI, junto da minha avaliação no site do ${brand.nomeCurto}.`,
    );
  });

  it("anônima", () => {
    expect(textoConsentimentoAvaliacao("anonimo")).toBe(
      `Não autorizo publicar meu nome nem meu CRECI: minha avaliação aparece como anônima no site do ${brand.nomeCurto}.`,
    );
  });

  it("toda escolha tem frase própria, terminada em ponto, com o nome da marca vindo do brand", () => {
    const frases = IDENTIFICACOES.map(textoConsentimentoAvaliacao);
    expect(new Set(frases).size).toBe(IDENTIFICACOES.length);
    for (const frase of frases) {
      expect(frase.endsWith(".")).toBe(true);
      expect(frase).toContain(brand.nomeCurto); // marca via config, nunca cravada
    }
  });
});
