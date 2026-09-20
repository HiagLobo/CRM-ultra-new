/**
 * Abas, ordenação e rótulos da lista de orçamentos do painel — no cliente,
 * sobre a lista já carregada (o volume desta fase cabe numa resposta), como as
 * abas do funil. Puro, para o teste cobrir as regras.
 *
 * Nenhum preço é escrito aqui: os valores vêm do registro (o preço do dia) e
 * só passam pelo `formatarReais`.
 */
import { palette as p } from "@/lib/palette";
import type { OrcamentoAdmin } from "@/features/orcamento/admin";
import type { CondicoesOrcamento, StatusOrcamento } from "@/features/orcamento/orcamento";
import { diaBR, formatarReais } from "@/features/orcamento/orcamento";
import { ROTULO_NIVEL, ROTULO_PUBLICO } from "@/features/orcamento/tabela";

/** Uma aba por situação, mais "Todos". */
export type AbaOrcamento = "todos" | StatusOrcamento;

export const ABAS_ORCAMENTO: ReadonlyArray<{ valor: AbaOrcamento; rotulo: string }> = [
  { valor: "todos", rotulo: "Todos" },
  { valor: "rascunho", rotulo: "Rascunho" },
  { valor: "enviado", rotulo: "Enviados" },
  { valor: "aceito", rotulo: "Aceitos" },
  { valor: "recusado", rotulo: "Recusados" },
];

/** Cor do selo de situação (só da palette). */
export const COR_STATUS: Record<StatusOrcamento, string> = {
  rascunho: p.g500,
  enviado: p.info,
  aceito: p.success,
  recusado: p.error,
};

/** Do mais recente para o mais antigo (`criadoEm` ISO ordena como texto). */
export function ordenar(orcamentos: ReadonlyArray<OrcamentoAdmin>): OrcamentoAdmin[] {
  return [...orcamentos].sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));
}

/** Os da aba escolhida, já ordenados. */
export function filtrarPorAba(orcamentos: ReadonlyArray<OrcamentoAdmin>, aba: AbaOrcamento): OrcamentoAdmin[] {
  return ordenar(aba === "todos" ? orcamentos : orcamentos.filter((o) => o.status === aba));
}

/** Quantos em cada aba (o número que aparece na própria aba). */
export function contarPorAba(orcamentos: ReadonlyArray<OrcamentoAdmin>): Record<AbaOrcamento, number> {
  const contagem: Record<AbaOrcamento, number> = { todos: orcamentos.length, rascunho: 0, enviado: 0, aceito: 0, recusado: 0 };
  for (const o of orcamentos) contagem[o.status] += 1;
  return contagem;
}

/**
 * Aba de abertura: "Rascunho" quando há proposta por terminar (é o que espera
 * decisão), senão "Todos".
 */
export function abaInicial(contagem: Record<AbaOrcamento, number>): AbaOrcamento {
  return contagem.rascunho > 0 ? "rascunho" : "todos";
}

/** Os orçamentos de cada lead, para a ficha mostrar os dele. */
export function porLead(orcamentos: ReadonlyArray<OrcamentoAdmin>): Map<string, OrcamentoAdmin[]> {
  const mapa = new Map<string, OrcamentoAdmin[]>();
  for (const o of ordenar(orcamentos)) mapa.set(o.leadId, [...(mapa.get(o.leadId) ?? []), o]);
  return mapa;
}

/** "5 Pro" · "5 Pro e 3 Ultra" · "3 Ultra". */
export function textoAssentos(condicoes: Pick<CondicoesOrcamento, "assentos">): string {
  const partes = (["pro", "ultra"] as const)
    .filter((nivel) => condicoes.assentos[nivel] > 0)
    .map((nivel) => `${condicoes.assentos[nivel]} ${ROTULO_NIVEL[nivel]}`);
  return partes.join(" e ") || "sem assento";
}

/** "R$ 1.522,00 por mês · 5 Pro · Imobiliária" — a linha de resumo da lista. */
export function resumoDaLinha(o: OrcamentoAdmin): string {
  return [
    `${formatarReais(o.totais.mensalCentavos)} por mês`,
    textoAssentos(o.condicoes),
    ROTULO_PUBLICO[o.publico],
  ].join(" · ");
}

/** A proposta já passou da validade? (`hoje` é o dia de Recife, `AAAA-MM-DD`.) */
export function venceu(o: Pick<OrcamentoAdmin, "validadeEm">, hoje: string): boolean {
  return o.validadeEm < hoje;
}

/** "Vale até 05/10/2026" ou "Venceu em 05/10/2026". */
export function textoValidade(o: Pick<OrcamentoAdmin, "validadeEm">, hoje: string): string {
  return `${venceu(o, hoje) ? "Venceu em" : "Vale até"} ${diaBR(o.validadeEm)}`;
}

/** A página do documento A4 (trilha B). O id vai escapado na URL. */
export function linkDocumento(id: string): string {
  return `/admin/orcamento/${encodeURIComponent(id)}`;
}
