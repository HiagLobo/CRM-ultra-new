/**
 * Casos de uso do funil no admin (O8): mudar a etapa e definir a próxima ação.
 * Sem HTTP: a rota faz authz + Zod e grava a auditoria que o caso de uso
 * devolve. Escrita direcionada (`atualizarFunil`): só as colunas do funil —
 * uma verificação ou um pedido de acesso no mesmo instante não é desfeito.
 */
import type { LeadStore } from "../../lib/leadStore";
import { paraLeadAdmin, type LeadAdmin } from "./admin";
import { diaRecife, diaValido, type MudancaEtapa, type ProximaAcao } from "./funil";

/**
 * O que a rota grava na auditoria: ids e códigos, NUNCA contato, nome, motivo
 * ou texto livre (a auditoria não pode virar uma segunda cópia da base).
 */
export interface EventoAuditoriaAdmin {
  acao: "lead.etapa" | "lead.proxima_acao" | "lead.nota" | "lead.manual";
  dados: Record<string, string>;
}

export type ResultadoFunil =
  | { status: "ok"; lead: LeadAdmin; auditoria: EventoAuditoriaAdmin }
  | { status: "nao_encontrado" }
  /** A data não serve: "retomar" pede dia depois de hoje; a próxima ação, hoje ou depois. */
  | { status: "data_invalida"; campo: "retomarEm" | "proximaAcao" };

/**
 * Move o lead de etapa. "Retomar depois" exige um dia DEPOIS de hoje (Recife);
 * "perdido" exige o motivo (garantido pelo tipo e pelo Zod da rota).
 *
 * Data e motivo pertencem à etapa: saindo de "retomar"/"perdido" eles somem.
 * Indo para "retomar" ou "perdido", a próxima ação é limpa — o lead sai da fila
 * de trabalho (a data de retomar é que diz quando ele volta).
 */
export async function mudarEtapa(
  store: LeadStore,
  id: string,
  mudanca: MudancaEtapa,
  agora: Date = new Date(),
): Promise<ResultadoFunil> {
  if (mudanca.etapa === "retomar" && !(diaValido(mudanca.retomarEm) && mudanca.retomarEm > diaRecife(agora))) {
    return { status: "data_invalida", campo: "retomarEm" };
  }
  const atual = await store.buscarPorId(id);
  if (!atual) return { status: "nao_encontrado" };

  const saiDaFila = mudanca.etapa === "retomar" || mudanca.etapa === "perdido";
  const lead = await store.atualizarFunil(id, {
    status: mudanca.etapa,
    retomarEm: mudanca.etapa === "retomar" ? mudanca.retomarEm : null,
    motivo: "motivo" in mudanca && mudanca.motivo ? mudanca.motivo : null,
    ...(saiDaFila ? { proximaAcaoEm: null, proximaAcao: null } : {}),
    atualizadoEm: agora.toISOString(),
  });
  if (!lead) return { status: "nao_encontrado" }; // excluído nesse meio

  return {
    status: "ok",
    lead: paraLeadAdmin(lead),
    auditoria: { acao: "lead.etapa", dados: { id, de: atual.status, para: lead.status } },
  };
}

/**
 * Define (dia + o que fazer) ou limpa (`null`) a próxima ação. O dia não pode
 * ser antes de hoje em Recife: ação vencida se resolve andando a data, não
 * cadastrando atraso.
 */
export async function definirProximaAcao(
  store: LeadStore,
  id: string,
  acao: ProximaAcao | null,
  agora: Date = new Date(),
): Promise<ResultadoFunil> {
  if (acao && !(diaValido(acao.em) && acao.em >= diaRecife(agora))) {
    return { status: "data_invalida", campo: "proximaAcao" };
  }
  const lead = await store.atualizarFunil(id, {
    proximaAcaoEm: acao?.em ?? null,
    proximaAcao: acao?.texto ?? null,
    atualizadoEm: agora.toISOString(),
  });
  if (!lead) return { status: "nao_encontrado" };

  return {
    status: "ok",
    lead: paraLeadAdmin(lead),
    auditoria: { acao: "lead.proxima_acao", dados: { id, acao: acao ? "definida" : "limpa" } },
  };
}
