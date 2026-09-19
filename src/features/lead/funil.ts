/**
 * Funil de leads (O8): etapas, canais, datas do dia e a normalização dos
 * valores antigos.
 *
 * CLIENT-SAFE: sem crypto, sem fs, sem segredo — o painel usa as mesmas
 * listas e o mesmo "hoje em Recife" que o servidor usa para validar.
 */

/**
 * Etapas do funil, na ordem em que o lead anda. "E-mail confirmado" não é
 * etapa: é o selo `verificadoEm`, que a verificação carimba sem mexer aqui.
 */
export const ETAPAS = [
  "novo",
  "em_contato",
  "demonstracao",
  "negociacao",
  "cliente",
  "retomar",
  "perdido",
] as const;

export type StatusLead = (typeof ETAPAS)[number];

/** Etapas sem dado extra: "retomar" pede a data e "perdido" pede o motivo. */
export const ETAPAS_SIMPLES = ["novo", "em_contato", "demonstracao", "negociacao", "cliente"] as const;

/** Até a O7 o status era outro. Linha antiga (banco ou arquivo de dev) nunca quebra a leitura. */
const STATUS_LEGADO: Readonly<Record<string, StatusLead>> = {
  verificado: "novo",
  contatado: "em_contato",
  descartado: "perdido",
};

/**
 * Status gravado → etapa. Traduz os 3 status antigos e, para qualquer valor
 * desconhecido, devolve "novo": um lead nunca some do painel por causa de um
 * valor que o código não conhece.
 */
export function normalizarStatus(valor: unknown): StatusLead {
  if (typeof valor !== "string") return "novo";
  if ((ETAPAS as readonly string[]).includes(valor)) return valor as StatusLead;
  return STATUS_LEGADO[valor] ?? "novo";
}

/** De onde o lead veio. `site` é o formulário público (padrão). */
export const CANAIS = ["site", "indicacao", "evento", "whatsapp", "outro"] as const;
export type Canal = (typeof CANAIS)[number];

/** Canais do cadastro manual — quem veio pelo site já entrou pelo formulário. */
export const CANAIS_MANUAIS = ["indicacao", "evento", "whatsapp", "outro"] as const;
export type CanalManual = (typeof CANAIS_MANUAIS)[number];

export const ROTULO_CANAL: Readonly<Record<Canal, string>> = {
  site: "site",
  indicacao: "indicação",
  evento: "evento",
  whatsapp: "WhatsApp",
  outro: "outro",
};

/** Canal gravado → canal conhecido; ausente ou desconhecido vira `site` (a origem de toda linha antiga). */
export function normalizarCanal(valor: unknown): Canal {
  return typeof valor === "string" && (CANAIS as readonly string[]).includes(valor) ? (valor as Canal) : "site";
}

/** Limites de texto (conferidos pelo Zod na entrada). */
export const LIMITE_NOTA = 2000;
export const LIMITE_MOTIVO = 200;
export const LIMITE_PROXIMA_ACAO = 200;

/** Anotação do admin sobre um lead. O texto é dado pessoal em potencial: nunca vai a log. */
export interface NotaLead {
  id: string;
  texto: string;
  /** ISO 8601 */
  em: string;
}

/** Mudança de etapa: "retomar" exige a data (dia) e "perdido" exige o motivo. */
export type MudancaEtapa =
  | { etapa: "retomar"; retomarEm: string; motivo?: string }
  | { etapa: "perdido"; motivo: string }
  | { etapa: (typeof ETAPAS_SIMPLES)[number] };

/** Próxima ação combinada com o lead: o dia (`AAAA-MM-DD`) e o que fazer. */
export interface ProximaAcao {
  em: string;
  texto: string;
}

/** O fundador trabalha no horário de Recife (UTC−3, sem horário de verão). */
const DIA_RECIFE = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Recife",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** O dia de hoje em Recife, `AAAA-MM-DD` — relógio injetável (testes e a aba "Hoje"). */
export function diaRecife(agora: Date = new Date()): string {
  const parte: Record<string, string> = {};
  for (const { type, value } of DIA_RECIFE.formatToParts(agora)) parte[type] = value;
  return `${parte.year}-${parte.month}-${parte.day}`;
}

/** `AAAA-MM-DD` que existe no calendário (31/02 não passa). */
export function diaValido(valor: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false;
  const data = new Date(`${valor}T00:00:00Z`);
  return !Number.isNaN(data.getTime()) && data.toISOString().slice(0, 10) === valor;
}
