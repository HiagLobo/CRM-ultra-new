/**
 * Validação de entrada da captação de leads (Zod).
 * Toda a superfície pública passa por aqui ANTES de qualquer lógica.
 * Server/cliente: schema puro, sem segredos.
 */
import { z } from "zod";
import { MENSAGEM_CRECI_INVALIDO, MENSAGEM_CRECI_SEM_UF, normalizarCreci, ufDoCreci } from "./creci";

/**
 * Texto da política carimbado no consentimento (LGPD).
 * Mora aqui — e não no domínio (`lead.ts`, server-only) — para a tela do
 * formulário exibir EXATAMENTE o texto que fica gravado no registro do lead.
 */
export const TEXTO_CONSENTIMENTO =
  "Autorizo o contato comercial e o tratamento dos meus dados (e-mail, telefone e CRECI) " +
  "para liberar o acesso ao demo do CRM Ultra, conforme a Política de Privacidade.";

/**
 * Validade do código de verificação, em minutos. Mora aqui (client-safe) pelo
 * mesmo motivo do texto acima: o domínio, o e-mail e a tela do código leem o
 * MESMO número — nada de "10 minutos" cravado em três lugares.
 */
export const EXPIRACAO_CODIGO_MIN = 10;

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

/** E-mail normalizado (minúsculas, sem espaços) — reusado por todas as entradas (públicas e do admin). */
export const emailSchema = z.string().trim().toLowerCase().email("e-mail inválido").max(254);

/** Telefone brasileiro → E.164. Mesma regra no formulário público e no cadastro manual. */
const MENSAGEM_TELEFONE_INVALIDO = "telefone inválido (use DDD + número)";
export const telefoneSchema = z
  .string()
  .trim()
  .max(40, MENSAGEM_TELEFONE_INVALIDO)
  .transform((valor, ctx) => {
    const e164 = normalizarTelefoneBR(valor);
    if (!e164) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: MENSAGEM_TELEFONE_INVALIDO });
      return z.NEVER;
    }
    return e164;
  });

/** CRECI: normaliza antes de validar ("CRECI-PE 12.345-F" → "PE 12345-F") e guarda o normalizado. */
export const creciSchema = z
  .string()
  .max(60, MENSAGEM_CRECI_INVALIDO)
  .transform((valor, ctx) => {
    const creci = normalizarCreci(valor);
    if (!creci) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: MENSAGEM_CRECI_INVALIDO });
      return z.NEVER;
    }
    return creci;
  });

/**
 * CRECI do cadastro público (O9): com UF obrigatória — cada conselho numera à
 * parte, e é a UF que diz em qual busca oficial o fundador confere. O cadastro
 * manual do admin continua aceitando sem UF (`creciSchema`).
 */
export const creciComUfSchema = creciSchema.refine((creci) => ufDoCreci(creci) !== undefined, {
  message: MENSAGEM_CRECI_SEM_UF,
});

/** "Maria da Silva", "Ana O'Neil", "João P. Souza": duas palavras ou mais, cada uma começando por letra. */
const NOME_COMPLETO = /^\p{L}[\p{L}'’.-]*(?: \p{L}[\p{L}'’.-]*)+$/u;
export const MENSAGEM_NOME = "informe nome e sobrenome";

/** Nome completo do cadastro público (O9): espaços repetidos viram um, 2–120 caracteres. */
export const nomeSchema = z
  .string()
  .max(200, "nome muito longo")
  .transform((v) => v.trim().replace(/\s+/g, " "))
  .pipe(z.string().max(120, "nome muito longo").regex(NOME_COMPLETO, MENSAGEM_NOME));

/**
 * Origem da campanha (utm/ref): texto livre vindo da URL ou da API pública. Saneado para
 * [A-Za-z0-9._-] e 100 caracteres — é identificador de campanha, não texto — o que fecha
 * a injeção de fórmula no CSV do admin em qualquer separador.
 */
const campoOrigem = z
  .string()
  .max(200)
  .transform((v) => v.replace(/[^A-Za-z0-9._-]/g, "").slice(0, 100));

export const LeadInputSchema = z.object({
  email: emailSchema,
  telefone: telefoneSchema,
  creci: creciSchema,
  consentimento: z.literal(true, {
    errorMap: () => ({ message: "consentimento é obrigatório" }),
  }),
  origem: z
    .object({ utm: campoOrigem.optional(), ref: campoOrigem.optional() })
    .optional(),
});

export type LeadInput = z.infer<typeof LeadInputSchema>;

/**
 * Pedido de acesso como chega na rota: os dados do lead + os sinais anti-robô
 * (O7·S1). Ficam fora do `LeadInput` porque não são dado do lead — nunca vão
 * para o banco.
 */
export const PedidoAcessoSchema = LeadInputSchema.extend({
  // campo-isca (honeypot): invisível na tela, mas robô de formulário preenche.
  // Aceita qualquer texto curto — recusar com 400 ensinaria o robô a deixá-lo vazio.
  website: z.string().max(500).optional(),
  // token do Cloudflare Turnstile (até 2048 caracteres, pela documentação)
  turnstileToken: z.string().max(2048).optional(),
});

export type PedidoAcesso = z.infer<typeof PedidoAcessoSchema>;

/**
 * Dados novos de quem já tinha cadastro e preencheu o formulário de novo (O9):
 * viajam no `verify` e só valem DEPOIS do código certo (quem digita o e-mail de
 * outra pessoa não troca o WhatsApp dela).
 */
export const AtualizacaoCadastroSchema = z.object({
  nome: nomeSchema,
  telefone: telefoneSchema,
  creci: creciComUfSchema,
});

export type AtualizacaoCadastro = z.infer<typeof AtualizacaoCadastroSchema>;

/** Entrada da verificação: e-mail + código de 6 dígitos (formato conferido antes de qualquer lógica). */
export const VerifyInputSchema = z.object({
  email: emailSchema,
  codigo: z.string().trim().regex(/^\d{6}$/, "código inválido"),
  atualizacao: AtualizacaoCadastroSchema.optional(),
});

export type VerifyInput = z.infer<typeof VerifyInputSchema>;

/** "Já tenho cadastro" (O9): só o e-mail + os mesmos sinais anti-robô do pedido de acesso. */
export const EntrarSchema = z.object({
  email: emailSchema,
  website: z.string().max(500).optional(),
  turnstileToken: z.string().max(2048).optional(),
});

export type PedidoEntrar = z.infer<typeof EntrarSchema>;
