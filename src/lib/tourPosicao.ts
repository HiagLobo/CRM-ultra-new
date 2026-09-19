/**
 * Matemática do tour guiado: onde encaixar o balão em relação ao elemento
 * destacado sem sair da tela, e o que conta como elemento "na tela".
 *
 * Está separado do componente porque é a parte que quebra em silêncio — balão
 * cortado na borda, ou recorte apontando para um menu escondido no celular — e é
 * exatamente o que dá para provar com teste sem precisar de navegador.
 */

export interface Retangulo {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface Viewport {
  largura: number;
  altura: number;
}

export type LadoDoBalao = "abaixo" | "acima" | "direita" | "centro";

export interface PosicaoBalao {
  top: number;
  left: number;
  lado: LadoDoBalao;
}

/** Respiro entre o elemento destacado e o balão. */
export const ESPACO = 14;
/** Margem mínima até a borda da tela. */
export const MARGEM = 12;

const limitar = (valor: number, minimo: number, maximo: number) =>
  Math.min(Math.max(minimo, valor), Math.max(minimo, maximo));

/**
 * Escolhe o lado com espaço suficiente: abaixo, senão acima, senão à direita
 * (alvo alto, como o menu lateral — o balão ao lado não cobre o que explica);
 * se nada couber, centraliza — melhor um balão no meio da tela que um cortado.
 */
export function posicaoDoBalao(
  alvo: Retangulo,
  viewport: Viewport,
  balao: { largura: number; altura: number },
): PosicaoBalao {
  const abaixoTop = alvo.top + alvo.height + ESPACO;
  const acimaTop = alvo.top - balao.altura - ESPACO;
  const direitaLeft = alvo.left + alvo.width + ESPACO;

  if (abaixoTop + balao.altura + MARGEM <= viewport.altura) {
    return { top: Math.round(abaixoTop), left: alinharPeloCentro(alvo, viewport, balao), lado: "abaixo" };
  }
  if (acimaTop >= MARGEM) {
    return { top: Math.round(acimaTop), left: alinharPeloCentro(alvo, viewport, balao), lado: "acima" };
  }
  if (direitaLeft + balao.largura + MARGEM <= viewport.largura) {
    // centro da parte visível do alvo, puxado para dentro da tela
    const topoVisivel = Math.max(alvo.top, 0);
    const baseVisivel = Math.min(alvo.top + alvo.height, viewport.altura);
    const top = limitar((topoVisivel + baseVisivel - balao.altura) / 2, MARGEM, viewport.altura - balao.altura - MARGEM);
    return { top: Math.round(top), left: Math.round(direitaLeft), lado: "direita" };
  }
  const top = Math.max(MARGEM, (viewport.altura - balao.altura) / 2);
  return { top: Math.round(top), left: alinharPeloCentro(alvo, viewport, balao), lado: "centro" };
}

/** Alinha pelo centro do alvo e depois puxa para dentro da tela. */
function alinharPeloCentro(alvo: Retangulo, viewport: Viewport, balao: { largura: number }): number {
  const centrado = alvo.left + alvo.width / 2 - balao.largura / 2;
  return Math.round(limitar(centrado, MARGEM, viewport.largura - balao.largura - MARGEM));
}

/** Alguma parte do elemento cai dentro da tela na horizontal? */
export function dentroNaHorizontal(alvo: Retangulo, viewport: Viewport): boolean {
  return alvo.left < viewport.largura && alvo.left + alvo.width > 0;
}

/** O elemento está visível na viewport (inteiro ou em parte), nos dois eixos? */
export function estaVisivel(alvo: Retangulo, viewport: Viewport): boolean {
  const naVertical = alvo.top < viewport.altura && alvo.top + alvo.height > 0;
  return naVertical && dentroNaHorizontal(alvo, viewport);
}

/** O que o tour mede de um elemento candidato a alvo. */
export interface MedidaDoAlvo {
  /** `getClientRects().length` — zero quando ele ou um ancestral tem `display: none`. */
  caixas: number;
  retangulo: Retangulo;
  /** `visibility: hidden` — o menu do celular fechado sai de cena assim. */
  invisivel: boolean;
}

/**
 * Dá para destacar este elemento? Existir no DOM não basta: no celular o menu
 * lateral continua lá, só que com `display: none` (retângulo 0×0) ou empurrado
 * para fora da tela pela esquerda. Na vertical não se exige nada aqui porque o
 * tour rola a página até o alvo — e confere de novo, com `estaVisivel`, depois.
 */
export function alvoNaTela(medida: MedidaDoAlvo, viewport: Viewport): boolean {
  const r = medida.retangulo;
  return (
    medida.caixas > 0 &&
    !medida.invisivel &&
    r.width > 0 &&
    r.height > 0 &&
    dentroNaHorizontal(r, viewport)
  );
}

/**
 * Largura do balão para a tela atual — nunca maior que a viewport menos as
 * margens, senão em celular ele nasce cortado.
 */
export function larguraDoBalao(viewport: Viewport, desejada = 340): number {
  return Math.min(desejada, viewport.largura - MARGEM * 2);
}
