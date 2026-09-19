/**
 * Validação de entrada da captação de leads (Zod).
 * Toda a superfície pública passa por aqui ANTES de qualquer lógica.
 * Server/cliente: schema puro, sem segredos.
 */
import { z } from "zod";

/** CRECI — formato leve: UF opcional (0–2 letras) + 3–6 dígitos + sufixo opcional. */
const CRECI_REGEX = /^[A-Za-z]{0,2}\s?\d{3,6}(-?\w)?$/;

/**
 * Texto da política carimbado no consentimento (LGPD).
 * Mora aqui — e não no domínio (`lead.ts`, server-only) — para a tela do
 * formulário exibir EXATAMENTE o texto que fica gravado no registro do lead.
 */
export const TEXTO_CONSENTIMENTO =
  "Autorizo o contato comercial e o tratamento dos meus dados (e-mail, telefone e CRECI) " +
  "para liberar o acesso ao demo do CRM Ultra, conforme a Política de Privacidade.";

/**
 * Normaliza um telefone brasileiro para E.164 (+55DDDNÚMERO).
 * Aceita formatos comuns (com/sem DDI, com máscara). Retorna null se inválido.
 */
export function normalizarTelefoneBR(bruto: string): string | null {
  const digitos = bruto.replace(/\D/g, "");
  let nacional: string;
  if ((digitos.length === 13 || digitos.length === 12) && digitos.startsWith("55")) {
    nacional = digitos.slice(2);
  } else if (digitos.length === 11 || digitos.length === 10) {
    nacional = digitos;
  } else {
    return null;
  }
  if (nacional.length !== 10 && nacional.length !== 11) return null;
  const ddd = Number(nacional.slice(0, 2));
  if (ddd < 11 || ddd > 99) return null;
  // celular tem 11 dígitos e o nono dígito é 9
  if (nacional.length === 11 && nacional[2] !== "9") return null;
  return `+55${nacional}`;
}

/** E-mail normalizado (minúsculas, sem espaços) — reusado por todas as entradas públicas. */
const emailSchema = z.string().trim().toLowerCase().email("e-mail inválido").max(254);

export const LeadInputSchema = z.object({
  email: emailSchema,
  telefone: z.string().trim().transform((valor, ctx) => {
    const e164 = normalizarTelefoneBR(valor);
    if (!e164) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "telefone inválido (use DDD + número)" });
      return z.NEVER;
    }
    return e164;
  }),
  creci: z.string().trim().regex(CRECI_REGEX, "CRECI inválido"),
  consentimento: z.literal(true, {
    errorMap: () => ({ message: "consentimento é obrigatório" }),
  }),
  origem: z
    .object({ utm: z.string().max(200).optional(), ref: z.string().max(200).optional() })
    .optional(),
});

export type LeadInput = z.infer<typeof LeadInputSchema>;

/** Entrada da verificação: e-mail + código de 6 dígitos (formato conferido antes de qualquer lógica). */
export const VerifyInputSchema = z.object({
  email: emailSchema,
  codigo: z.string().trim().regex(/^\d{6}$/, "código inválido"),
});

export type VerifyInput = z.infer<typeof VerifyInputSchema>;
