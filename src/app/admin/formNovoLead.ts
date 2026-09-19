/**
 * "+ Novo lead" (cadastro manual): o formulário, a validação e o que a API
 * responde. A validação é o MESMO schema do servidor (`CadastroManualSchema`,
 * client-safe) — o erro aparece no campo antes de enviar, e o servidor confere
 * de novo. Puro, para o teste cobrir obrigatórios, formatos e o checkbox.
 */
import { CadastroManualSchema } from "@/features/lead/schemaAdmin";
import type { LeadAdmin } from "@/features/lead/admin";
import type { CanalManual } from "@/features/lead/funil";
import type { Validacao } from "./formEtapa";
import { errosPorCampo, mensagemDeErro, mensagemDuplicado, type RespostaApi } from "./mensagensApi";

export interface FormNovoLead {
  nome: string;
  telefone: string;
  email: string;
  creci: string;
  canal: CanalManual | "";
  /** Vira a 1ª anotação do lead. */
  observacao: string;
  /** "A pessoa sabe e concordou em ser contatada" — obrigatório. */
  consentimento: boolean;
}

export type CampoNovoLead = keyof FormNovoLead;

export const CAMPOS_NOVO_LEAD: readonly CampoNovoLead[] = [
  "nome",
  "telefone",
  "email",
  "creci",
  "canal",
  "observacao",
  "consentimento",
];

export const FORM_NOVO_LEAD_VAZIO: FormNovoLead = {
  nome: "",
  telefone: "",
  email: "",
  creci: "",
  canal: "",
  observacao: "",
  consentimento: false,
};

/**
 * Confere o formulário com o schema do servidor. O valor devolvido é o próprio
 * formulário (o servidor normaliza telefone, e-mail e CRECI do mesmo jeito).
 */
export function validarNovoLead(form: FormNovoLead): Validacao<FormNovoLead, CampoNovoLead> {
  const r = CadastroManualSchema.safeParse(form);
  if (r.success) return { ok: true, valor: form };
  const { fieldErrors } = r.error.flatten();
  const erros: Partial<Record<CampoNovoLead, string>> = {};
  for (const campo of CAMPOS_NOVO_LEAD) {
    const mensagem = (fieldErrors as Partial<Record<CampoNovoLead, string[]>>)[campo]?.[0];
    if (mensagem) erros[campo] = mensagem;
  }
  return { ok: false, erros };
}

/** O que a tela faz com a resposta do POST. */
export type ResultadoCadastroTela =
  | { status: "ok"; lead: LeadAdmin; observacaoNaoSalva: boolean }
  | { status: "duplicado"; id: string; mensagem: string }
  | { status: "invalido"; erros: Partial<Record<CampoNovoLead, string>> }
  | { status: "erro"; erro: string };

/** Traduz a resposta do `POST /api/admin/leads` (201 · 409 · 400 · o resto). */
export function lerRespostaCadastro(r: RespostaApi): ResultadoCadastroTela {
  const corpo = (r.corpo ?? {}) as { ok?: boolean; lead?: LeadAdmin; aviso?: string; id?: unknown; campo?: unknown };
  if (r.status === 201 && corpo.ok === true && corpo.lead) {
    return { status: "ok", lead: corpo.lead, observacaoNaoSalva: corpo.aviso === "observacao_nao_salva" };
  }
  if (r.status === 409 && typeof corpo.id === "string") {
    return { status: "duplicado", id: corpo.id, mensagem: mensagemDuplicado(corpo.campo) };
  }
  if (r.status === 400) {
    const erros = errosPorCampo(r.corpo, CAMPOS_NOVO_LEAD);
    if (Object.keys(erros).length) return { status: "invalido", erros };
  }
  return { status: "erro", erro: mensagemDeErro(r, "cadastrar o lead") };
}
