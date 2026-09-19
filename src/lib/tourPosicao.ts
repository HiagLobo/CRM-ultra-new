/**
 * Matemática do tour guiado: onde encaixar o balão em relação ao elemento
 * destacado, sem sair da tela.
 *
 * Está separado do componente porque é a parte que quebra em silêncio — balão
 * cortado na borda, ou fora da viewport em telas pequenas — e é exatamente o
 * que dá para provar com teste sem precisar de navegador.
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

export type LadoDoBalao = "abaixo" | "acima" | "centro";

export interface PosicaoBalao {
  top: number;
  left: number;
  lado: LadoDoBalao;
}

/** Respiro entre o elemento destacado e o balão. */
export const ESPACO = 14;
/** Margem mínima até a borda da tela. */
export const MARGEM = 12;

/**
 * Escolhe o lado com espaço suficiente: abaixo, senão acima; se não couber em
 * nenhum (elemento alto ou tela curta), centraliza — melhor um balão no meio da
 * tela que um cortado pela metade.
 */
export function posicaoDoBalao(
  alvo: Retangulo,
  viewport: Viewport,
  balao: { largura: number; altura: number },
): PosicaoBalao {
  const abaixoTop = alvo.top + alvo.height + ESPACO;
  const acimaTop = alvo.top - balao.altura - ESPACO;

  let lado: LadoDoBalao;
  let top: number;

  if (abaixoTop + balao.altura + MARGEM <= viewport.altura) {
    lado = "abaixo";
    top = abaixoTop;
  } else if (acimaTop >= MARGEM) {
    lado = "acima";
    top = acimaTop;
  } else {
    lado = "centro";
    top = Math.max(MARGEM, (viewport.altura - balao.altura) / 2);
  }

  // alinha pelo centro do alvo e depois puxa para dentro da tela
  const centrado = alvo.left + alvo.width / 2 - balao.largura / 2;
  const maximo = viewport.largura - balao.largura - MARGEM;
  const left = Math.round(Math.min(Math.max(MARGEM, centrado), Math.max(MARGEM, maximo)));

  return { top: Math.round(top), left, lado };
}

/** O elemento está visível na viewport (inteiro ou em parte)? */
export function estaVisivel(alvo: Retangulo, viewport: Viewport): boolean {
  return alvo.top < viewport.altura && alvo.top + alvo.height > 0;
}

/**
 * Largura do balão para a tela atual — nunca maior que a viewport menos as
 * margens, senão em celular ele nasce cortado.
 */
export function larguraDoBalao(viewport: Viewport, desejada = 340): number {
  return Math.min(desejada, viewport.largura - MARGEM * 2);
}
