/**
 * Normalização anti-disfarce do filtro de comentários (O10·S1, correção da
 * revisão cética).
 *
 * O que a pessoa escreveu continua intacto — o que está aqui é o texto que as
 * REGRAS leem. Sem isto, `golpe . com`, `golpe(ponto)com`, `golpe。com`,
 * `m e r d a` e um telefone com caracteres invisíveis no meio passavam direto
 * para a landing: o filtro só via a forma "bem-comportada" de cada truque.
 *
 * CLIENT-SAFE e puro (sem crypto/fs/env).
 */

/** Largura zero, marcas de direção e hífen mole: partem a palavra sem aparecer na tela. */
const INVISIVEIS = /[­​-‏⁠⁦-⁩﻿]/g;

/** Pontos que não são o ponto comum: ideográfico, largura cheia, meia largura. */
const PONTOS = /[。．｡․]/g;

/** Letras de outros alfabetos que se parecem com as nossas (cirílico, grego). */
const PARECIDAS: Record<string, string> = {
  а: "a", в: "b", с: "c", ԁ: "d", е: "e", ѕ: "s", і: "i", ј: "j", к: "k", ӏ: "l",
  м: "m", н: "h", о: "o", р: "p", т: "t", у: "y", х: "x",
  α: "a", ε: "e", ι: "i", κ: "k", ν: "v", ο: "o", ρ: "p", τ: "t",
};

/** Dígito ou símbolo no lugar da letra: `m3rda`, `p0rra`, `c@ralho`. */
const LEET: Record<string, string> = {
  "0": "o", "1": "i", "3": "e", "4": "a", "5": "s", "7": "t", "@": "a", $: "s",
};

/** Domínios de primeiro nível comuns — só para o truque escrito (` ponto `). */
const TLD_ESCRITO = "com|br|net|org|io|co|me|app|site|dev|link|xyz|online|shop|store|info|club|vip|tk|ru";

function trocar(texto: string, mapa: Record<string, string>): string {
  return texto.replace(/./gu, (c) => mapa[c] ?? c);
}

/** Minúsculas, sem acento, sem invisível e com as letras parecidas viradas nas nossas. */
export function normalizar(texto: string): string {
  return trocar(texto.replace(INVISIVEIS, "").toLowerCase(), PARECIDAS)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

/** O mesmo, com dígito e símbolo voltando a ser letra (`m3rda` → `merda`). */
export function comLeet(texto: string): string {
  return trocar(normalizar(texto), LEET);
}

/**
 * Desfaz os disfarces de ponto e de arroba: `golpe。com`, `golpe(ponto)com`,
 * `golpe[.]com`, `golpe ponto com`, `golpe . com` e `eu @ golpe . com` voltam à
 * forma normal, que as regras de link e e-mail reconhecem.
 *
 * Dois cuidados para não segurar texto honesto:
 * - o espaço só é engolido quando vem ANTES do ponto. Ninguém escreve
 *   "bom . recomendo", mas todo mundo escreve "bom. Recomendo" — que são duas
 *   frases, não um domínio;
 * - a palavra "ponto" só vira ponto quando o que vem depois é um domínio
 *   conhecido. Senão "chegou no ponto certo" viraria "no.certo".
 */
export function semDisfarces(texto: string): string {
  return normalizar(texto)
    .replace(PONTOS, ".")
    .replace(/\(\s*ponto\s*\)|\[\s*\.\s*\]/g, ".")
    .replace(new RegExp(`\\b([a-z0-9-]{2,})\\s+ponto\\s+(${TLD_ESCRITO})\\b`, "g"), "$1.$2")
    .replace(/\s+\.\s*/g, ".")
    .replace(/\s*@\s*/g, "@");
}

/**
 * Texto "colado" para achar palavrão escrito espaçado ou cortado: `m e r d a`,
 * `mer-da`, `m.e.r.d.a`, `m3rda`. Serve só para termo longo — grudar tudo faria
 * "cu" aparecer dentro de "o curso".
 */
export function colado(texto: string): string {
  return comLeet(texto)
    .replace(/\b(?:[a-z]\s+){2,}[a-z]\b/g, (t) => t.replace(/\s+/g, ""))
    .replace(/[-_.*+'"`~^]/g, "");
}
