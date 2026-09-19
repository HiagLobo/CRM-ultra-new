/**
 * Casos de uso do admin de leads (sem HTTP): contagens, follow-up e export.
 * As rotas `/api/admin/*` só fazem authz + wiring.
 *
 * Sem dependência de servidor em runtime: o store chega injetado e os imports
 * são só de tipo. Por isso o formatador puro `telefoneNacional` também serve à
 * tela do painel. Nada aqui loga PII — quem chama decide o que mostrar ao admin.
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

/**
 * O que o painel recebe de cada lead (LGPD art. 6º, III — minimização): o
 * contato para o follow-up e mais nada. A prova do consentimento (texto, IP) e
 * o código (hash, tentativas) ficam no banco, que é onde servem.
 */
export interface LeadAdmin {
  id: string;
  email: string;
  /** E.164 (`+55DDNÚMERO`). */
  telefone: string;
  creci: string;
  status: StatusLead;
  verificadoEm?: string;
  criadoEm: string;
  origem?: { utm?: string; ref?: string };
}

/**
 * Projeção campo a campo, de propósito: um campo sensível novo no `Lead` não
 * vaza para o navegador só porque alguém esqueceu de apagá-lo aqui.
 */
export function paraLeadAdmin(l: Lead): LeadAdmin {
  return {
    id: l.id,
    email: l.email,
    telefone: l.telefone,
    creci: l.creci,
    status: l.status,
    verificadoEm: l.verificadoEm,
    criadoEm: l.criadoEm,
    origem: l.origem ? { utm: l.origem.utm, ref: l.origem.ref } : undefined,
  };
}

/** Status que o admin pode aplicar. `novo` e `verificado` são conquistados pelo fluxo. */
export const STATUS_DO_ADMIN = ["contatado", "descartado"] as const;
export type StatusDoAdmin = (typeof STATUS_DO_ADMIN)[number];

export function calcularResumo(leads: ReadonlyArray<Pick<Lead, "status" | "verificadoEm">>): ResumoLeads {
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

/** Resumo + lista (só os campos do painel), do mais recente para o mais antigo. */
export async function resumo(store: LeadStore): Promise<{ resumo: ResumoLeads; leads: LeadAdmin[] }> {
  const leads = await store.listar();
  const ordenados = [...leads].sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));
  return { resumo: calcularResumo(leads), leads: ordenados.map(paraLeadAdmin) };
}

export type ResultadoStatus =
  | { status: "ok"; lead: LeadAdmin; de: StatusLead }
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
  return { status: "ok", lead: paraLeadAdmin(lead), de: atual.status };
}

/**
 * Elimina o lead (LGPD art. 18, direito à eliminação) — apaga de vez, não
 * marca como excluído: o titular pediu para sumir dos registros.
 * Devolve `false` se já não existia; atender duas vezes o mesmo pedido não é erro.
 */
export async function excluirLead(store: LeadStore, id: string): Promise<boolean> {
  return store.excluir(id);
}

/**
 * Telefone E.164 brasileiro no formato nacional: `+5581988887777` →
 * `(81) 98888-7777`. É o que se cola no WhatsApp e, por não começar com `+`,
 * dispensa o apóstrofo de proteção no CSV. Fora do padrão, devolve como veio.
 */
export function telefoneNacional(e164: string): string {
  const m = /^\+55(\d{2})(\d{4,5})(\d{4})$/.exec(e164);
  return m ? `(${m[1]}) ${m[2]}-${m[3]}` : e164;
}

/** O fundador trabalha no horário de Recife (UTC−3, sem horário de verão). */
const FORMATO_RECIFE = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Recife",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/**
 * ISO 8601 → `dd/mm/aaaa hh:mm` no fuso de Recife. Montado pelas partes, e não
 * pelo `format()`, porque a pontuação entre data e hora muda com a versão do ICU.
 * Data ilegível sai como veio: no export, sumir com o dado seria pior.
 */
export function dataHoraRecife(iso: string | undefined): string {
  if (!iso) return "";
  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) return iso;
  const parte: Record<string, string> = {};
  for (const { type, value } of FORMATO_RECIFE.formatToParts(data)) parte[type] = value;
  return `${parte.day}/${parte.month}/${parte.year} ${parte.hour}:${parte.minute}`;
}

/**
 * `;` é o separador de lista do Excel em português: com ele o duplo clique já
 * abre em colunas, e o `;` que vier dentro de um campo fica preso nas aspas.
 */
const SEPARADOR = ";";

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
 * Escapa um campo para CSV (sempre entre aspas) e **neutraliza injeção de
 * fórmula**: uma célula que começa com `= + - @` (ou tab/CR) é executada por
 * Excel/Sheets ao abrir. Como e-mail, CRECI e origem vêm do visitante,
 * prefixamos com `'` nesses casos.
 */
function celula(valor: string | undefined): string {
  const bruto = valor ?? "";
  const seguro = /^[=+\-@\t\r]/.test(bruto) ? `'${bruto}` : bruto;
  return `"${seguro.replace(/"/g, '""')}"`;
}

const linhaCsv = (campos: ReadonlyArray<string | undefined>) => campos.map(celula).join(SEPARADOR);

/** CSV da base de leads (o admin abre na planilha para trabalhar o follow-up). */
export async function exportarCsv(store: LeadStore): Promise<{ csv: string; linhas: number }> {
  const { leads } = await resumo(store);
  const corpo = leads.map((l) =>
    linhaCsv([
      l.id,
      l.email,
      telefoneNacional(l.telefone),
      l.creci,
      l.status,
      dataHoraRecife(l.verificadoEm),
      dataHoraRecife(l.criadoEm),
      l.origem?.utm,
      l.origem?.ref,
    ]),
  );
  // BOM para o Excel abrir os acentos certo
  return { csv: `﻿${[linhaCsv(COLUNAS), ...corpo].join("\r\n")}\r\n`, linhas: leads.length };
}
