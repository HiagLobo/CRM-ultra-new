/**
 * Casos de uso do admin de leads (sem HTTP): o que o painel recebe (DTO), o
 * resumo do funil e a exclusão. As rotas `/api/admin/*` só fazem authz + wiring.
 * Funil: `funilAdmin.ts` · anotações: `notas.ts` · cadastro manual:
 * `cadastroManual.ts` · CSV: `exportarCsv.ts`.
 *
 * Sem dependência de servidor em runtime: o store chega injetado e os imports
 * são só de tipo. Por isso o formatador puro `telefoneNacional` também serve à
 * tela do painel. Nada aqui loga PII — quem chama decide o que mostrar ao admin.
 */
import type { LeadStore } from "../../lib/leadStore";
import type { Lead } from "./lead";
import type { Canal, StatusLead } from "./funil";
import type { ConferenciaCreci } from "./creci";

export interface ResumoLeads {
  total: number;
  /** Confirmaram o e-mail (tem `verificadoEm`) — é selo, não etapa. */
  verificados: number;
  /** Quantos leads em cada etapa. */
  porEtapa: Record<StatusLead, number>;
  /** Em contato + demonstração + negociação: quem está sendo trabalhado agora. */
  emAndamento: number;
  clientes: number;
  /** clientes / total, em % com 1 casa. */
  conversaoPct: number;
}

/**
 * O que o painel recebe de cada lead (LGPD art. 6º, III — minimização): o
 * contato e o funil para o follow-up, e mais nada. A prova do consentimento
 * (texto, IP) e o código (hash, tentativas) ficam no banco, que é onde servem.
 * As anotações têm rota própria (`/api/admin/leads/[id]/notas`).
 */
export interface LeadAdmin {
  id: string;
  /** Ausente no lead cadastrado à mão sem e-mail. */
  email?: string;
  /** E.164 (`+55DDNÚMERO`). */
  telefone: string;
  /** Vazio no lead cadastrado à mão sem CRECI. */
  creci: string;
  /** Conferência do CRECI na busca oficial (O9); ausente = não conferido. */
  creciConferencia?: ConferenciaCreci;
  creciConferidoEm?: string;
  nome?: string;
  canal: Canal;
  /** Etapa do funil. */
  status: StatusLead;
  verificadoEm?: string;
  /** Última verificação com sucesso — "voltou ao demo" (O9). */
  ultimoAcessoEm?: string;
  criadoEm: string;
  origem?: { utm?: string; ref?: string };
  /** `AAAA-MM-DD` — só na etapa "retomar". */
  retomarEm?: string;
  motivo?: string;
  /** `AAAA-MM-DD`. */
  proximaAcaoEm?: string;
  proximaAcao?: string;
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
    creciConferencia: l.creciConferencia,
    creciConferidoEm: l.creciConferidoEm,
    nome: l.nome,
    canal: l.canal,
    status: l.status,
    verificadoEm: l.verificadoEm,
    ultimoAcessoEm: l.ultimoAcessoEm,
    criadoEm: l.criadoEm,
    origem: l.origem ? { utm: l.origem.utm, ref: l.origem.ref } : undefined,
    retomarEm: l.retomarEm,
    motivo: l.motivo,
    proximaAcaoEm: l.proximaAcaoEm,
    proximaAcao: l.proximaAcao,
  };
}

const EM_ANDAMENTO: ReadonlyArray<StatusLead> = ["em_contato", "demonstracao", "negociacao"];

export function calcularResumo(leads: ReadonlyArray<Pick<Lead, "status" | "verificadoEm">>): ResumoLeads {
  const porEtapa: Record<StatusLead, number> = {
    novo: 0,
    em_contato: 0,
    demonstracao: 0,
    negociacao: 0,
    cliente: 0,
    retomar: 0,
    perdido: 0,
  };
  for (const l of leads) porEtapa[l.status] = (porEtapa[l.status] ?? 0) + 1;
  const clientes = porEtapa.cliente;
  return {
    total: leads.length,
    verificados: leads.filter((l) => !!l.verificadoEm).length,
    porEtapa,
    emAndamento: EM_ANDAMENTO.reduce((soma, etapa) => soma + porEtapa[etapa], 0),
    clientes,
    conversaoPct: leads.length ? Math.round((clientes / leads.length) * 1000) / 10 : 0,
  };
}

/** Resumo + lista (só os campos do painel), do mais recente para o mais antigo. */
export async function resumo(store: LeadStore): Promise<{ resumo: ResumoLeads; leads: LeadAdmin[] }> {
  const leads = await store.listar();
  const ordenados = [...leads].sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));
  return { resumo: calcularResumo(leads), leads: ordenados.map(paraLeadAdmin) };
}

/**
 * Elimina o lead (LGPD art. 18, direito à eliminação) — apaga de vez, com as
 * anotações, não marca como excluído: o titular pediu para sumir dos registros.
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

/** Dia `AAAA-MM-DD` → `dd/mm/aaaa` (sem fuso: é um dia, não um instante). Fora do formato, sai como veio. */
export function diaBR(dia: string | undefined): string {
  if (!dia) return "";
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dia);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : dia;
}
