/**
 * Mini-formulários do funil: mover para "Retomar depois" (dia + motivo),
 * "Perdido" (motivo da lista) e a próxima ação (dia + o que fazer).
 *
 * Puro e com as MESMAS regras do servidor (`mudarEtapa`/`definirProximaAcao`):
 * retomar só depois de hoje, próxima ação de hoje em diante — o dia é o de
 * Recife. O servidor confere de novo; aqui é para o erro aparecer no campo.
 */
import {
  LIMITE_MOTIVO,
  LIMITE_PROXIMA_ACAO,
  diaRecife,
  diaValido,
  type MudancaEtapa,
  type ProximaAcao,
} from "@/features/lead/funil";

/** Resultado de validar um formulário: o valor pronto para a API, ou o erro de cada campo. */
export type Validacao<T, Campo extends string> =
  | { ok: true; valor: T }
  | { ok: false; erros: Partial<Record<Campo, string>> };

/** Motivos de perda (a lista do fundador); "Outro" pede um texto curto. */
export const MOTIVOS_PERDA = [
  { valor: "preco", rotulo: "Preço" },
  { valor: "outro_crm", rotulo: "Já usa outro CRM" },
  { valor: "sem_interesse", rotulo: "Sem interesse" },
  { valor: "sem_resposta", rotulo: "Sem resposta" },
  { valor: "outro", rotulo: "Outro" },
] as const;

export type MotivoPerda = (typeof MOTIVOS_PERDA)[number]["valor"];

const PREFIXO_OUTRO = "Outro: ";
/** O "outro" vira `Outro: <texto>` e o total cabe no limite do motivo. */
export const LIMITE_OUTRO_MOTIVO = LIMITE_MOTIVO - PREFIXO_OUTRO.length;

export interface FormEtapa {
  retomarEm: string;
  motivoRetomar: string;
  motivoPerda: MotivoPerda | "";
  outroMotivo: string;
}

export const FORM_ETAPA_VAZIO: FormEtapa = { retomarEm: "", motivoRetomar: "", motivoPerda: "", outroMotivo: "" };

/** Atalhos de data: um toque em vez de abrir o calendário no celular. */
export const ATALHOS_RETOMAR = [
  { rotulo: "Em 1 semana", dias: 7 },
  { rotulo: "Em 1 mês", dias: 30 },
  { rotulo: "Em 3 meses", dias: 90 },
] as const;

export const ATALHOS_ACAO = [
  { rotulo: "Hoje", dias: 0 },
  { rotulo: "Amanhã", dias: 1 },
  { rotulo: "Em 1 semana", dias: 7 },
] as const;

/** Monta a mudança para "retomar" ou "perdido" — ou diz o que falta em cada campo. */
export function montarMudancaEtapa(
  etapa: "retomar" | "perdido",
  form: FormEtapa,
  agora: Date,
): Validacao<MudancaEtapa, keyof FormEtapa> {
  if (etapa === "retomar") {
    const erros: Partial<Record<keyof FormEtapa, string>> = {};
    if (!form.retomarEm) erros.retomarEm = "escolha o dia de retomar";
    else if (!diaValido(form.retomarEm)) erros.retomarEm = "data inválida";
    else if (form.retomarEm <= diaRecife(agora)) erros.retomarEm = "escolha um dia depois de hoje";
    const motivo = form.motivoRetomar.trim();
    if (motivo.length > LIMITE_MOTIVO) erros.motivoRetomar = `o motivo passa de ${LIMITE_MOTIVO} caracteres`;
    if (Object.keys(erros).length) return { ok: false, erros };
    return { ok: true, valor: { etapa: "retomar", retomarEm: form.retomarEm, ...(motivo ? { motivo } : {}) } };
  }

  const escolhido = MOTIVOS_PERDA.find((m) => m.valor === form.motivoPerda);
  if (!escolhido) return { ok: false, erros: { motivoPerda: "escolha o motivo" } };
  if (escolhido.valor !== "outro") return { ok: true, valor: { etapa: "perdido", motivo: escolhido.rotulo } };

  const texto = form.outroMotivo.trim();
  if (!texto) return { ok: false, erros: { outroMotivo: "conte o motivo em poucas palavras" } };
  if (texto.length > LIMITE_OUTRO_MOTIVO) {
    return { ok: false, erros: { outroMotivo: `o motivo passa de ${LIMITE_OUTRO_MOTIVO} caracteres` } };
  }
  return { ok: true, valor: { etapa: "perdido", motivo: `${PREFIXO_OUTRO}${texto}` } };
}

/**
 * Formulário "retomar" já preenchido com o que o lead tem (para "Alterar data"):
 * o dia e o motivo atuais. Vazio para quem não está em "retomar".
 */
export function formRetomarDoLead(lead: { status: string; retomarEm?: string; motivo?: string }): FormEtapa {
  if (lead.status !== "retomar") return FORM_ETAPA_VAZIO;
  return { ...FORM_ETAPA_VAZIO, retomarEm: lead.retomarEm ?? "", motivoRetomar: lead.motivo ?? "" };
}

export interface FormProximaAcao {
  em: string;
  texto: string;
}

/** Próxima ação: dia de hoje em diante (Recife) e o que fazer (até 200 caracteres). */
export function validarProximaAcao(form: FormProximaAcao, agora: Date): Validacao<ProximaAcao, keyof FormProximaAcao> {
  const erros: Partial<Record<keyof FormProximaAcao, string>> = {};
  if (!form.em) erros.em = "escolha o dia";
  else if (!diaValido(form.em)) erros.em = "data inválida";
  else if (form.em < diaRecife(agora)) erros.em = "a próxima ação não pode ser antes de hoje";
  const texto = form.texto.trim();
  if (!texto) erros.texto = "diga o que fazer (ex.: ligar às 10h)";
  else if (texto.length > LIMITE_PROXIMA_ACAO) erros.texto = `passa de ${LIMITE_PROXIMA_ACAO} caracteres`;
  if (Object.keys(erros).length) return { ok: false, erros };
  return { ok: true, valor: { em: form.em, texto } };
}
