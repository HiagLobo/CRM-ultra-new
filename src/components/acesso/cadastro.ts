/**
 * Regras puras do formulário de cadastro (O9·S2) — sem React, testadas à parte.
 *
 * - O Estado do CRECI acompanha o DDD do WhatsApp enquanto a pessoa não mexe
 *   nele; mexeu, a escolha dela vale (o DDD é só palpite).
 * - O CRECI vai à API num campo só, "UF NÚMERO", validado e normalizado pelos
 *   MESMOS schemas do servidor (`creciComUfSchema`, `nomeSchema`…): o que passa
 *   aqui passa lá.
 * - Os erros (do Zod aqui ou do 400 da API) viram erros por campo da tela; o do
 *   CRECI se divide entre Estado e Número.
 */
import { z } from "zod";
import { LeadInputSchema, creciComUfSchema, emailSchema, nomeSchema, telefoneSchema } from "@/features/lead/schema";
import { LISTA_UFS, MENSAGEM_CRECI_SEM_UF, type Uf } from "@/features/lead/creci";
import { ufPorTelefone } from "@/features/lead/ddd";

/** O formulário como está na tela. Mora só em memória (estado do React). */
export interface FormCadastro {
  nome: string;
  email: string;
  /** Com a máscara da tela: "(81) 90000-0001". */
  telefone: string;
  uf: Uf | "";
  /** Número do CRECI como digitado: "12345", "12345-F", "12.345-J". */
  numero: string;
  /** A pessoa já escolheu o Estado? Então o DDD não troca mais a escolha dela. */
  ufTocada: boolean;
}

export const FORM_VAZIO: FormCadastro = { nome: "", email: "", telefone: "", uf: "", numero: "", ufTocada: false };

/** Campos da tela, na ordem em que aparecem — o foco vai para o primeiro com erro. */
export const ORDEM_CAMPOS = ["nome", "email", "telefone", "uf", "numero", "consentimento"] as const;
export type CampoCadastro = (typeof ORDEM_CAMPOS)[number];
export type ErrosCadastro = Partial<Record<CampoCadastro, string>>;

/** `id` de cada campo no HTML (rótulo, foco e `aria-describedby`). */
export const ID_CAMPO: Record<CampoCadastro, string> = {
  nome: "acesso-nome",
  email: "acesso-email",
  telefone: "acesso-telefone",
  uf: "acesso-creci-uf",
  numero: "acesso-creci-numero",
  consentimento: "acesso-consentimento",
};

export const MENSAGEM_NUMERO_VAZIO = "informe o número do CRECI";
export const MENSAGEM_NUMERO_INVALIDO = "número do CRECI inválido (ex.: 12345 ou 12345-F)";

/** UF pelo DDD do WhatsApp; DDD desconhecido (ou ainda incompleto) → vazio. */
export function ufPeloWhatsapp(telefone: string): Uf | "" {
  return ufPorTelefone(telefone) ?? "";
}

/** WhatsApp mudou: o Estado acompanha o DDD enquanto a pessoa não o escolheu ela mesma. */
export function comTelefone(form: FormCadastro, telefone: string): FormCadastro {
  return { ...form, telefone, uf: form.ufTocada ? form.uf : ufPeloWhatsapp(telefone) };
}

/** A pessoa escolheu o Estado: dali em diante, é a escolha dela que vale. */
export function comUf(form: FormCadastro, uf: string): FormCadastro {
  const valida = (LISTA_UFS as readonly string[]).includes(uf) ? (uf as Uf) : "";
  return { ...form, uf: valida, ufTocada: true };
}

/** Estado + número → o campo `creci` da API: "PE" + "12.345-F" → "PE 12.345-F". Sem Estado, só o número. */
export function montarCreci(uf: Uf | "", numero: string): string {
  const n = numero.trim();
  return uf ? `${uf} ${n}`.trim() : n;
}

/** Os mesmos schemas que a rota usa no `PedidoAcessoSchema` (nome e CRECI com UF: O9). */
const CadastroSchema = z.object({
  nome: nomeSchema,
  email: emailSchema,
  telefone: telefoneSchema,
  creci: creciComUfSchema,
  consentimento: LeadInputSchema.shape.consentimento,
});

/** Dados já normalizados: nome sem espaços sobrando, e-mail minúsculo, telefone E.164, CRECI canônico. */
export type DadosCadastro = z.infer<typeof CadastroSchema>;

/**
 * Erros por campo do Zod (daqui ou do 400 da API) → campos da tela.
 * Número inválido faz o schema reclamar também da UF (o refine roda no valor
 * recusado): com o Estado escolhido, o erro é só do Número.
 */
export function errosPorCampo(
  campos: Record<string, string[] | undefined> | undefined,
  form: Pick<FormCadastro, "uf" | "numero">,
): ErrosCadastro {
  const erros: ErrosCadastro = {};
  for (const campo of ["nome", "email", "telefone", "consentimento"] as const) {
    const mensagem = campos?.[campo]?.[0];
    if (mensagem) erros[campo] = mensagem;
  }
  const creci = campos?.creci ?? [];
  if (creci.length > 0) {
    const numeroRuim = creci.some((m) => m !== MENSAGEM_CRECI_SEM_UF);
    if (numeroRuim) erros.numero = form.numero.trim() ? MENSAGEM_NUMERO_INVALIDO : MENSAGEM_NUMERO_VAZIO;
    if (!form.uf || !numeroRuim) erros.uf = MENSAGEM_CRECI_SEM_UF;
  }
  return erros;
}

export type Validacao = { ok: true; dados: DadosCadastro } | { ok: false; erros: ErrosCadastro };

export function validarCadastro(form: FormCadastro, consentimento: boolean): Validacao {
  const r = CadastroSchema.safeParse({
    nome: form.nome,
    email: form.email,
    telefone: form.telefone,
    creci: montarCreci(form.uf, form.numero),
    consentimento,
  });
  if (r.success) return { ok: true, dados: r.data };
  return { ok: false, erros: errosPorCampo(r.error.flatten().fieldErrors, form) };
}

/** Primeiro campo com erro, na ordem da tela (quem recebe o foco). */
export function primeiroCampoComErro(erros: ErrosCadastro): CampoCadastro | undefined {
  return ORDEM_CAMPOS.find((c) => erros[c]);
}
