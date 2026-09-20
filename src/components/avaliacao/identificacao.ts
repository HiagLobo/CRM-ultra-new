/**
 * Como a pessoa escolhe aparecer na avaliação (F3) e o consentimento LGPD de
 * cada escolha.
 *
 * O texto que a tela mostra é **exatamente** o que o servidor carimba no
 * registro (com data e IP), como no cadastro (`TEXTO_CONSENTIMENTO` da O1).
 * Mostrar uma coisa e gravar outra seria consentimento inválido — por isso o
 * texto mora num módulo só dele, puro e testável, e a marca vem do `brand`.
 */
import { brand } from "@/config/brand";

export type Identificacao = "nome_creci" | "nome" | "anonimo";

/** Ordem em que as opções aparecem na tela. */
export const IDENTIFICACOES: readonly Identificacao[] = ["nome_creci", "nome", "anonimo"];

/** Rótulo curto do rádio. */
export function rotuloIdentificacao(escolha: Identificacao): string {
  if (escolha === "nome_creci") return "Com meu nome e meu CRECI";
  if (escolha === "nome") return "Só com meu nome";
  return "Anônimo";
}

/** O texto do consentimento que vai para o registro — palavra por palavra. */
export function textoConsentimento(escolha: Identificacao): string {
  const site = `no site do ${brand.nomeCurto}`;
  if (escolha === "nome_creci") {
    return `Autorizo publicar meu nome e meu CRECI junto da minha avaliação ${site}.`;
  }
  if (escolha === "nome") {
    return `Autorizo publicar meu nome, sem o CRECI, junto da minha avaliação ${site}.`;
  }
  return `Não autorizo publicar meu nome nem meu CRECI: minha avaliação aparece como anônima ${site}.`;
}

/** Vale para as três escolhas: a nota sempre conta, o que muda é a assinatura. */
export const AVISO_NOTA_SEMPRE_CONTA =
  "Sua nota entra na média nas três opções. O que muda é como você assina.";

/** Só o que o contrato aceita — qualquer outra coisa vira anônimo. */
export function ehIdentificacao(valor: unknown): valor is Identificacao {
  return typeof valor === "string" && (IDENTIFICACOES as readonly string[]).includes(valor);
}
