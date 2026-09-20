/**
 * Abas e ordenação da lista de avaliações do painel — no cliente, sobre a
 * lista já carregada (o volume desta fase cabe numa resposta), como as abas do
 * funil. Puro, para o teste cobrir as regras.
 */
import type { AvaliacaoAdmin } from "@/features/avaliacao/admin";
import type { StatusAvaliacao } from "@/features/avaliacao/avaliacao";

/** Uma aba por situação, mais "Todas". */
export type AbaAvaliacao = "todas" | StatusAvaliacao;

export const ABAS_AVALIACAO: ReadonlyArray<{ valor: AbaAvaliacao; rotulo: string }> = [
  { valor: "todas", rotulo: "Todas" },
  { valor: "pendente", rotulo: "Para conferir" },
  { valor: "publicado", rotulo: "No site" },
  { valor: "recusado", rotulo: "Fora do site" },
];

/** Da mais recente para a mais antiga (`criadoEm` ISO ordena como texto). */
export function ordenar(avaliacoes: ReadonlyArray<AvaliacaoAdmin>): AvaliacaoAdmin[] {
  return [...avaliacoes].sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));
}

/** As da aba escolhida, já ordenadas. */
export function filtrarPorAba(
  avaliacoes: ReadonlyArray<AvaliacaoAdmin>,
  aba: AbaAvaliacao,
): AvaliacaoAdmin[] {
  return ordenar(aba === "todas" ? avaliacoes : avaliacoes.filter((a) => a.status === aba));
}

/** Quantas em cada aba (o número que aparece na própria aba). */
export function contarPorAba(avaliacoes: ReadonlyArray<AvaliacaoAdmin>): Record<AbaAvaliacao, number> {
  const contagem: Record<AbaAvaliacao, number> = { todas: avaliacoes.length, publicado: 0, pendente: 0, recusado: 0 };
  for (const a of avaliacoes) contagem[a.status] += 1;
  return contagem;
}

/**
 * Aba de abertura: "Para conferir" quando há alguma segurada pelo filtro (é o
 * que espera decisão), senão "Todas".
 */
export function abaInicial(contagem: Record<AbaAvaliacao, number>): AbaAvaliacao {
  return contagem.pendente > 0 ? "pendente" : "todas";
}

/** A avaliação de cada lead, para a ficha mostrar a dele (um lead tem no máximo uma). */
export function porLead(avaliacoes: ReadonlyArray<AvaliacaoAdmin>): Map<string, AvaliacaoAdmin> {
  return new Map(avaliacoes.map((a) => [a.leadId, a] as const));
}
