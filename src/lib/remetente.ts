/**
 * Remetente do e-mail (`EMAIL_FROM`) — aceita "endereço" ou "Nome <endereço>".
 *
 * Antes o env validava com `z.string().email()`, que recusa "Nome <acesso@…>";
 * como o env é validado no import (inclusive no `next build`), usar o nome de
 * exibição derrubava o deploy (achados captacao-9 / persistencia-10 da O7).
 * Puro, sem env: o `env.ts` usa para validar e o `email.ts` para montar o `from`.
 */
import { z } from "zod";

export interface Remetente {
  /** Nome de exibição; ausente → o envio usa o nome curto da marca. */
  nome?: string;
  endereco: string;
}

export const MENSAGEM_REMETENTE_INVALIDO =
  'use "endereço" ou "Nome <endereço>" (ex.: Minha Marca <acesso@mail.exemplo.com.br>)';

const enderecoValido = (e: string) => z.string().email().safeParse(e).success;

/** Caractere de controle (quebra de linha inclusive) nunca entra em cabeçalho de e-mail. */
const CONTROLE = /[\u0000-\u001f\u007f]/;

/** Interpreta o `EMAIL_FROM`. `null` se não for "endereço" nem "Nome <endereço>". */
export function interpretarRemetente(valor: string): Remetente | null {
  const texto = valor.trim();
  if (CONTROLE.test(texto)) return null;

  const comNome = /^(.*?)\s*<([^<>]*)>$/.exec(texto);
  if (!comNome) return enderecoValido(texto) ? { endereco: texto } : null;

  const endereco = comNome[2]!.trim();
  // aspas em volta do nome são opcionais no padrão ("Nome" <…>) — tira e remonta
  const nome = comNome[1]!.trim().replace(/^"(.*)"$/, "$1").trim();
  if (!enderecoValido(endereco) || /[<>"\\]/.test(nome)) return null;
  return nome ? { nome, endereco } : { endereco };
}

/** Nome de exibição entre aspas quando tem caractere especial do padrão (RFC 5322). */
function nomeDeExibicao(nome: string): string {
  const limpo = nome.replace(/["\\<>\u0000-\u001f\u007f]/g, "").trim();
  return /[()[\]:;@,.]/.test(limpo) ? `"${limpo}"` : limpo;
}

/**
 * Monta o `from` do envio: sempre "Nome <endereço>". Sem nome no `EMAIL_FROM`,
 * usa `nomePadrao` (o `brand.nomeCurto`) — o e-mail chega com o nome da marca, não
 * como um endereço solto, o que reduz a chance de ser ignorado.
 */
export function montarRemetente(remetente: Remetente, nomePadrao: string): string {
  const nome = nomeDeExibicao(remetente.nome ?? nomePadrao);
  return nome ? `${nome} <${remetente.endereco}>` : remetente.endereco;
}
