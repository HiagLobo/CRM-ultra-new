import { describe, it, expect } from "vitest";
import { brand } from "@/config/brand";
import {
  AVISO_NOTA_SEMPRE_CONTA,
  IDENTIFICACOES,
  ehIdentificacao,
  rotuloIdentificacao,
  textoConsentimento,
  type Identificacao,
} from "./identificacao";

/**
 * GOLDEN — o texto do consentimento, palavra por palavra.
 *
 * É o que a tela mostra E o que o servidor carimba no registro (com data e IP).
 * Mostrar uma coisa e gravar outra invalida o consentimento, então qualquer
 * reescrita — de um lado ou do outro — tem que passar por aqui e ficar vermelha.
 * A trilha A mantém o mesmo texto no servidor; na integração, este módulo passa
 * a importar de lá e estas três frases continuam sendo a prova.
 */
const OURO: Record<Identificacao, string> = {
  nome_creci: `Autorizo publicar meu nome e meu CRECI junto da minha avaliação no site do ${brand.nomeCurto}.`,
  nome: `Autorizo publicar meu nome, sem o CRECI, junto da minha avaliação no site do ${brand.nomeCurto}.`,
  anonimo: `Não autorizo publicar meu nome nem meu CRECI: minha avaliação aparece como anônima no site do ${brand.nomeCurto}.`,
};

describe("consentimento da avaliação (golden)", () => {
  it.each(Object.entries(OURO))("%s: o texto é exatamente o combinado", (escolha, esperado) => {
    expect(textoConsentimento(escolha as Identificacao)).toBe(esperado);
  });

  it("o nome do produto vem da marca, não cravado no texto", () => {
    for (const escolha of IDENTIFICACOES) {
      expect(textoConsentimento(escolha)).toContain(brand.nomeCurto);
    }
  });

  it("o texto diz o que será publicado, e o anônimo NEGA a publicação do nome", () => {
    expect(textoConsentimento("nome_creci")).toMatch(/nome e meu CRECI/);
    expect(textoConsentimento("nome")).toMatch(/sem o CRECI/);
    expect(textoConsentimento("anonimo")).toMatch(/^Não autorizo/);
  });

  it("nenhum travessão no texto que vai para a tela", () => {
    const naTela = [
      ...IDENTIFICACOES.map(textoConsentimento),
      ...IDENTIFICACOES.map(rotuloIdentificacao),
      AVISO_NOTA_SEMPRE_CONTA,
    ];
    for (const texto of naTela) expect(texto).not.toMatch(/—/);
  });
});

describe("as três escolhas (F3)", () => {
  it("são exatamente as do contrato, nessa ordem", () => {
    expect(IDENTIFICACOES).toEqual(["nome_creci", "nome", "anonimo"]);
    expect(Object.keys(OURO).sort()).toEqual([...IDENTIFICACOES].sort());
  });

  it("só o contrato passa: qualquer outro valor é recusado", () => {
    expect(ehIdentificacao("nome")).toBe(true);
    expect(ehIdentificacao("qualquer")).toBe(false);
    expect(ehIdentificacao(null)).toBe(false);
    expect(ehIdentificacao(3)).toBe(false);
  });

  it("cada escolha tem rótulo próprio, sem repetição", () => {
    expect(new Set(IDENTIFICACOES.map(rotuloIdentificacao)).size).toBe(3);
    expect(new Set(Object.values(OURO)).size).toBe(3);
  });
});
