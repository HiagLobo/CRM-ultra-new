/**
 * Como a avaliação aparece na tela do painel: rótulos em português, trecho do
 * comentário e a linha que entra na ficha do lead. Puro (sem React), para o
 * teste conferir texto por texto — rótulo errado aqui faz o fundador tirar do
 * ar a avaliação errada.
 */
import { estrelasEmTexto, type Identificacao, type StatusAvaliacao } from "@/features/avaliacao";
import { ROTULO_MOTIVO, type MotivoPendente } from "@/features/avaliacao";
import { palette as p } from "@/lib/palette";
import { dataHoraRecife } from "@/features/lead/admin";

/** Situação do texto, do jeito que o fundador pensa nela. */
export const ROTULO_SITUACAO: Record<StatusAvaliacao, string> = {
  publicado: "No site",
  pendente: "Para conferir",
  recusado: "Fora do site",
};

/** Cor do selo de situação (só da palette). */
export const COR_SITUACAO: Record<StatusAvaliacao, string> = {
  publicado: p.success,
  pendente: p.warning,
  recusado: p.g500,
};

/** Como a pessoa escolheu aparecer no site. */
export const ROTULO_IDENTIFICACAO: Record<Identificacao, string> = {
  nome_creci: "Nome e CRECI",
  nome: "Só o nome",
  anonimo: "Anônima",
};

/** "Segurada porque tem link" — a frase inteira, pronta para a tela. */
export function motivoEmTexto(motivo: MotivoPendente | undefined): string | null {
  return motivo ? `Segurada porque ${ROTULO_MOTIVO[motivo]}` : null;
}

/** Trecho do comentário para a lista, com reticências quando corta. */
export function trecho(texto: string | undefined, maximo = 160): string {
  const limpo = (texto ?? "").replace(/\s+/g, " ").trim();
  if (limpo.length <= maximo) return limpo;
  // corta na última palavra inteira que couber, para não partir a palavra no meio
  const cortado = limpo.slice(0, maximo);
  const espaco = cortado.lastIndexOf(" ");
  return `${(espaco > maximo / 2 ? cortado.slice(0, espaco) : cortado).trimEnd()}…`;
}

/** Quando não há comentário: a nota sozinha também é uma avaliação. */
export const SEM_COMENTARIO = "Deu a nota, sem comentário.";

/** `dd/mm/aaaa` (Recife) — na lista de avaliações a hora não ajuda em nada. */
export function diaDaAvaliacao(iso: string): string {
  return dataHoraRecife(iso).slice(0, 10);
}

/** A linha da ficha do lead: "★★★★★ em 19/09/2026". */
export function avaliacaoNaFicha(avaliacao: { estrelas: number; criadoEm: string }): string {
  return `${estrelasEmTexto(avaliacao.estrelas)} em ${diaDaAvaliacao(avaliacao.criadoEm)}`;
}

/** "4,6 de 5 · 5 avaliações" — o mesmo número que a landing mostra. */
export function resumoEmTexto(resumo: { media: number; quantas: number }): string {
  if (resumo.quantas === 0) return "Nenhuma avaliação ainda";
  const nota = resumo.media.toFixed(1).replace(".", ",");
  return `${nota} de 5 · ${resumo.quantas} ${resumo.quantas === 1 ? "avaliação" : "avaliações"}`;
}
