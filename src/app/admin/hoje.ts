/**
 * A aba "Hoje" — o que o fundador precisa fazer hoje — e o "próximo passo" de
 * cada lead na lista. Puro, com relógio injetável; o dia é o de Recife (o mesmo
 * `diaRecife` que o servidor usa para validar as datas).
 */
import type { LeadAdmin } from "@/features/lead/admin";
import { diaRecife } from "@/features/lead/funil";
import { diasDesde, horasDesde, rotuloDia } from "./datas";

/** Por que o lead está no "Hoje", na ordem de urgência. */
export type MotivoHoje = "acao_vencida" | "retomar" | "acao_hoje" | "novo_parado";

const URGENCIA: Readonly<Record<MotivoHoje, number>> = {
  acao_vencida: 0,
  retomar: 1,
  acao_hoje: 2,
  novo_parado: 3,
};

/** Lead "novo" sem ninguém falar com ele há este tempo entra no "Hoje". */
export const HORAS_NOVO_PARADO = 24;

/**
 * O lead entra no "Hoje"?
 * - próxima ação vencida (antes de hoje) ou do dia;
 * - "retomar depois" com a data até hoje;
 * - "novo" criado há 24 h ou mais, sem contato e sem próxima ação marcada
 *   (quem já tem dia combinado aparece no dia dele, não antes).
 */
export function motivoHoje(lead: LeadAdmin, agora: Date): MotivoHoje | null {
  const hoje = diaRecife(agora);
  if (lead.proximaAcaoEm && lead.proximaAcaoEm < hoje) return "acao_vencida";
  if (lead.status === "retomar" && lead.retomarEm && lead.retomarEm <= hoje) return "retomar";
  if (lead.proximaAcaoEm === hoje) return "acao_hoje";
  if (lead.status === "novo" && !lead.proximaAcaoEm && horasDesde(lead.criadoEm, agora) >= HORAS_NOVO_PARADO) {
    return "novo_parado";
  }
  return null;
}

/** O dia (ou instante) que conta para ordenar dentro do mesmo motivo: o mais antigo primeiro. */
function referencia(lead: LeadAdmin, motivo: MotivoHoje): string {
  if (motivo === "retomar") return lead.retomarEm ?? "";
  if (motivo === "novo_parado") return lead.criadoEm;
  return lead.proximaAcaoEm ?? "";
}

/** Só os leads do "Hoje", do mais urgente para o menos (e, no empate, o mais antigo antes). */
export function leadsDeHoje(leads: ReadonlyArray<LeadAdmin>, agora: Date): LeadAdmin[] {
  return leads
    .map((lead) => ({ lead, motivo: motivoHoje(lead, agora) }))
    .filter((item): item is { lead: LeadAdmin; motivo: MotivoHoje } => item.motivo !== null)
    .sort(
      (a, b) =>
        URGENCIA[a.motivo] - URGENCIA[b.motivo] ||
        referencia(a.lead, a.motivo).localeCompare(referencia(b.lead, b.motivo)),
    )
    .map((item) => item.lead);
}

/** Como o próximo passo aparece: a cor diz se está atrasado, é hoje, está marcado ou parado. */
export type TomPasso = "atrasado" | "hoje" | "agendado" | "nenhum";

export interface ProximoPasso {
  texto: string;
  tom: TomPasso;
}

const junto = (...partes: Array<string | undefined>) => partes.filter(Boolean).join(" · ");

/** O texto da coluna "Próximo passo" (e do topo da gaveta). */
export function proximoPasso(lead: LeadAdmin, agora: Date): ProximoPasso {
  const hoje = diaRecife(agora);

  if (lead.proximaAcaoEm) {
    const dia = rotuloDia(lead.proximaAcaoEm, hoje);
    if (lead.proximaAcaoEm < hoje) return { texto: junto(`Atrasada (${dia})`, lead.proximaAcao), tom: "atrasado" };
    if (lead.proximaAcaoEm === hoje) return { texto: junto("Hoje", lead.proximaAcao), tom: "hoje" };
    return { texto: junto(primeiraMaiuscula(dia), lead.proximaAcao), tom: "agendado" };
  }

  if (lead.status === "retomar" && lead.retomarEm) {
    const dia = rotuloDia(lead.retomarEm, hoje);
    if (lead.retomarEm < hoje) return { texto: junto(`Retomar (desde ${dia})`, lead.motivo), tom: "atrasado" };
    if (lead.retomarEm === hoje) return { texto: junto("Retomar hoje", lead.motivo), tom: "hoje" };
    const quando = /^\d/.test(dia) ? `em ${dia}` : dia;
    return { texto: junto(`Retomar ${quando}`, lead.motivo), tom: "agendado" };
  }

  if (lead.status === "perdido") return { texto: lead.motivo || "Sem motivo registrado", tom: "nenhum" };

  if (lead.status === "novo" && horasDesde(lead.criadoEm, agora) >= HORAS_NOVO_PARADO) {
    const dias = diasDesde(lead.criadoEm, agora);
    return { texto: `Sem contato há ${dias} ${dias === 1 ? "dia" : "dias"}`, tom: "atrasado" };
  }

  return { texto: "Sem próxima ação", tom: "nenhum" };
}

function primeiraMaiuscula(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}
