/**
 * Casos de uso do admin de leads (sem HTTP): contagens, follow-up e export.
 * As rotas `/api/admin/*` só fazem authz + wiring.
 *
 * SERVER-ONLY. Nada aqui loga PII — quem chama decide o que mostrar ao admin.
 */
import type { LeadStore } from "../../lib/leadStore";
import type { Lead, StatusLead } from "./lead";

export interface ResumoLeads {
  total: number;
  /** Confirmaram o e-mail (tem `verificadoEm`) — não é o status, que segue avançando. */
  verificados: number;
  novos: number;
  contatados: number;
  descartados: number;
  /** verificados / total, em % com 1 casa. */
  conversaoPct: number;
}

/** Status que o admin pode aplicar. `novo` e `verificado` são conquistados pelo fluxo. */
export const STATUS_DO_ADMIN = ["contatado", "descartado"] as const;
export type StatusDoAdmin = (typeof STATUS_DO_ADMIN)[number];

export function calcularResumo(leads: Lead[]): ResumoLeads {
  const conta = (s: StatusLead) => leads.filter((l) => l.status === s).length;
  const verificados = leads.filter((l) => !!l.verificadoEm).length;
  return {
    total: leads.length,
    verificados,
    novos: conta("novo"),
    contatados: conta("contatado"),
    descartados: conta("descartado"),
    conversaoPct: leads.length ? Math.round((verificados / leads.length) * 1000) / 10 : 0,
  };
}

/** Resumo + lista, do mais recente para o mais antigo. */
export async function resumo(store: LeadStore): Promise<{ resumo: ResumoLeads; leads: Lead[] }> {
  const leads = await store.listar();
  const ordenados = [...leads].sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));
  return { resumo: calcularResumo(leads), leads: ordenados };
}

export type ResultadoStatus =
  | { status: "ok"; lead: Lead; de: StatusLead }
  | { status: "nao_encontrado" };

/**
 * Marca o follow-up. O `LeadStore` não busca por id (a porta é por e-mail),
 * então lista e encontra — aceitável no volume desta fase.
 */
export async function atualizarStatus(
  store: LeadStore,
  id: string,
  novo: StatusDoAdmin,
  agora: Date = new Date(),
): Promise<ResultadoStatus> {
  const atual = (await store.listar()).find((l) => l.id === id);
  if (!atual) return { status: "nao_encontrado" };

  const lead = await store.atualizar({ ...atual, status: novo, atualizadoEm: agora.toISOString() });
  return { status: "ok", lead, de: atual.status };
}

/**
 * Elimina o lead (LGPD art. 18, direito à eliminação) — apaga de vez, não
 * marca como excluído: o titular pediu para sumir dos registros.
 * Devolve `false` se já não existia; atender duas vezes o mesmo pedido não é erro.
 */
export async function excluirLead(store: LeadStore, id: string): Promise<boolean> {
  return store.excluir(id);
}

const COLUNAS = [
  "id",
  "email",
  "telefone",
  "creci",
  "status",
  "verificado_em",
  "criado_em",
  "origem_utm",
  "origem_ref",
] as const;

/**
 * Escapa um campo para CSV e **neutraliza injeção de fórmula**: uma célula que
 * começa com `= + - @` (ou tab/CR) é executada por Excel/Sheets ao abrir. Como
 * e-mail e CRECI vêm do visitante, prefixamos com `'` nesses casos.
 */
function celula(valor: string | undefined): string {
  const bruto = valor ?? "";
  const seguro = /^[=+\-@\t\r]/.test(bruto) ? `'${bruto}` : bruto;
  return `"${seguro.replace(/"/g, '""')}"`;
}

/** CSV da base de leads (o admin abre na planilha para trabalhar o follow-up). */
export async function exportarCsv(store: LeadStore): Promise<{ csv: string; linhas: number }> {
  const { leads } = await resumo(store);
  const cabecalho = COLUNAS.join(",");
  const corpo = leads.map((l) =>
    [
      l.id,
      l.email,
      l.telefone,
      l.creci,
      l.status,
      l.verificadoEm,
      l.criadoEm,
      l.origem?.utm,
      l.origem?.ref,
    ]
      .map(celula)
      .join(","),
  );
  // BOM para o Excel abrir os acentos certo
  return { csv: `﻿${[cabecalho, ...corpo].join("\r\n")}\r\n`, linhas: leads.length };
}
