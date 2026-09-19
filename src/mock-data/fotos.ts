/**
 * Fotos de exemplo do portal — fonte única dos caminhos.
 * Licença Unsplash (uso comercial livre); origem e autor de cada arquivo em
 * public/assets/CREDITOS.md. Nunca usar material do protótipo antigo aqui.
 */

/** Quantas fotos de imóvel existem (imovel-01 … imovel-12). */
export const TOTAL_FOTOS_IMOVEIS = 12;

/** Caminho público da foto `n` (1–12) do catálogo de exemplo. */
export function fotoImovel(n: number): string {
  return `/assets/imoveis/imovel-${String(n).padStart(2, "0")}.webp`;
}

/** Foto de fundo da capa do portal de exemplo. */
export const CAPA_PORTAL = "/img/capa-portal.webp";
