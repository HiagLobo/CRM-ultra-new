/**
 * Texto do consentimento da avaliação (LGPD) — **fonte única** das três frases.
 *
 * A tela do convite mostra estas palavras e o servidor grava ESTAS MESMAS
 * palavras em `consentimento_texto`: prova de consentimento só vale se o que
 * ficou registrado for o que a pessoa leu. Por isso o módulo é puro e
 * client-safe (nada de crypto, fs ou env) e a trilha da tela importa daqui em
 * vez de repetir as frases.
 *
 * Mudar uma vírgula aqui muda o que fica gravado: o teste fixa as três frases
 * letra por letra de propósito.
 */
import { brand } from "../../config/brand";
import type { Identificacao } from "./avaliacao";

/**
 * A frase que a pessoa aceita ao escolher como quer aparecer. `nomeCurto` vem
 * da marca (`brand.*`), nunca cravado — "no site do CRM Ultra".
 */
export function textoConsentimentoAvaliacao(identificacao: Identificacao): string {
  const site = brand.nomeCurto;
  if (identificacao === "nome_creci") {
    return `Autorizo publicar meu nome e meu CRECI junto da minha avaliação no site do ${site}.`;
  }
  if (identificacao === "nome") {
    return `Autorizo publicar meu nome, sem o CRECI, junto da minha avaliação no site do ${site}.`;
  }
  return `Não autorizo publicar meu nome nem meu CRECI: minha avaliação aparece como anônima no site do ${site}.`;
}
