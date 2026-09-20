/**
 * Como a pessoa escolhe aparecer na avaliação (F3) e o consentimento LGPD de
 * cada escolha.
 *
 * O texto que a tela mostra é **exatamente** o que o servidor carimba no
 * registro (com data e IP), como no cadastro (`TEXTO_CONSENTIMENTO` da O1).
 * Mostrar uma coisa e gravar outra seria consentimento inválido — por isso o
 * texto mora num módulo só dele, puro e testável, e a marca vem do `brand`.
 */
import { textoConsentimentoAvaliacao } from "@/features/avaliacao/consentimento";

/** Mesmo tipo do domínio: a tela e o servidor falam do mesmo conjunto. */
export type { Identificacao } from "@/features/avaliacao/avaliacao";
import type { Identificacao } from "@/features/avaliacao/avaliacao";

/** Ordem em que as opções aparecem na tela. */
export const IDENTIFICACOES: readonly Identificacao[] = ["nome_creci", "nome", "anonimo"];

/** Rótulo curto do rádio. */
export function rotuloIdentificacao(escolha: Identificacao): string {
  if (escolha === "nome_creci") return "Com meu nome e meu CRECI";
  if (escolha === "nome") return "Só com meu nome";
  return "Anônimo";
}

/**
 * O texto do consentimento que vai para o registro. Reexporta a fonte única do
 * domínio (`features/avaliacao/consentimento.ts`), que é o que o servidor
 * carimba: duas cópias acabariam divergindo numa vírgula, e consentimento só
 * vale se o gravado for o que a pessoa leu.
 */
export const textoConsentimento = textoConsentimentoAvaliacao;

/** Vale para as três escolhas: a nota sempre conta, o que muda é a assinatura. */
export const AVISO_NOTA_SEMPRE_CONTA =
  "Sua nota entra na média nas três opções. O que muda é como você assina.";

/** Só o que o contrato aceita — qualquer outra coisa vira anônimo. */
export function ehIdentificacao(valor: unknown): valor is Identificacao {
  return typeof valor === "string" && (IDENTIFICACOES as readonly string[]).includes(valor);
}
