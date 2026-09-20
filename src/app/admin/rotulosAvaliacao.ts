/**
 * Como a avaliação aparece na tela do painel: rótulos em português, trecho do
 * comentário e a linha que entra na ficha do lead. Puro (sem React), para o
 * teste conferir texto por texto — rótulo errado aqui faz o fundador tirar do
 * ar a avaliação errada.
 */
import { estrelasEmTexto } from "@/features/avaliacao/avaliacao";
import type { Identificacao, StatusAvaliacao } from "@/features/avaliacao/avaliacao";
import { ROTULO_MOTIVO, type MotivoPendente } from "@/features/avaliacao/filtroComentario";
import type { AvaliacaoAdmin } from "@/features/avaliacao/admin";
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

/**
 * Quando o motivo não vem (a regra que segurou o texto mudou depois, e o
 * recálculo já não a reconhece), a avaliação não pode aparecer sem explicação
 * nenhuma — o fundador ficaria sem saber por que ela está fora do ar.
 */
export const MOTIVO_GENERICO = "Segurada pelo filtro automático";

/** A explicação que vai na linha, só para o que está `pendente`. */
export function motivoDaPendente(a: Pick<AvaliacaoAdmin, "status" | "motivo">): string | null {
  if (a.status !== "pendente") return null;
  return motivoEmTexto(a.motivo) ?? MOTIVO_GENERICO;
}

/** Como a avaliação é assinada no painel: o nome, o e-mail, ou o aviso de que não há nem um nem outro. */
export function quemAvaliou(autor: AvaliacaoAdmin["autor"]): string {
  return autor.nome?.trim() || autor.email || "lead sem nome";
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

/**
 * A linha da ficha do lead: "★★★★★ em 19/09/2026 · Anônima · No site".
 * A escolha de identificação entra porque é ela que responde a pergunta que o
 * fundador faz olhando a ficha: o nome desta pessoa está no site ou não?
 */
export function avaliacaoNaFicha(avaliacao: Pick<AvaliacaoAdmin, "estrelas" | "criadoEm" | "identificacao" | "status">): string {
  return [
    `${estrelasEmTexto(avaliacao.estrelas)} em ${diaDaAvaliacao(avaliacao.criadoEm)}`,
    ROTULO_IDENTIFICACAO[avaliacao.identificacao],
    ROTULO_SITUACAO[avaliacao.status],
  ].join(" · ");
}

/** O que a ficha mostra quando a lista de avaliações não carregou (nunca um silêncio). */
export const FICHA_SEM_AVALIACOES = "não deu para carregar";

/** "4,6 de 5 · 5 avaliações" — o mesmo número que a landing mostra. */
export function resumoEmTexto(resumo: { media: number; quantas: number }): string {
  if (resumo.quantas === 0) return "Nenhuma avaliação ainda";
  const nota = resumo.media.toFixed(1).replace(".", ",");
  return `${nota} de 5 · ${resumo.quantas} ${resumo.quantas === 1 ? "avaliação" : "avaliações"}`;
}
