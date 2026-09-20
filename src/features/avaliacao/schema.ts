/**
 * Validação de entrada da avaliação (Zod) — nada chega ao domínio sem passar
 * por aqui. Server/cliente: schema puro, sem segredos.
 *
 * O corpo NÃO traz nome, CRECI nem e-mail: quem avalia já é um lead verificado
 * (cookie `crm_demo`), e esses dados vêm do cadastro dele. O que a pessoa
 * escolhe é só a nota, o texto e COMO quer aparecer.
 */
import { z } from "zod";
import { COMENTARIO_MAX, ESTRELAS_MAX, IDENTIFICACOES, STATUS_MODERAVEL } from "./avaliacao";

export const MENSAGEM_ESTRELAS = "escolha de 1 a 5 estrelas";

/** Nota inteira de 1 a 5 — sem decimal, como o CHECK da migração 006. */
export const estrelasSchema = z
  .number({ invalid_type_error: MENSAGEM_ESTRELAS, required_error: MENSAGEM_ESTRELAS })
  .int(MENSAGEM_ESTRELAS)
  .min(1, MENSAGEM_ESTRELAS)
  .max(ESTRELAS_MAX, MENSAGEM_ESTRELAS);

/**
 * Comentário opcional: espaços das pontas fora, no máximo 400 caracteres, e
 * texto que sobrou vazio vira "sem comentário" (só a nota).
 */
export const comentarioSchema = z
  .string()
  .max(2_000, `o comentário tem no máximo ${COMENTARIO_MAX} caracteres`)
  .transform((v) => v.trim())
  .pipe(z.string().max(COMENTARIO_MAX, `o comentário tem no máximo ${COMENTARIO_MAX} caracteres`))
  .transform((v) => (v === "" ? undefined : v));

export const AvaliacaoInputSchema = z.object({
  estrelas: estrelasSchema,
  comentario: comentarioSchema.optional(),
  identificacao: z.enum(IDENTIFICACOES, {
    errorMap: () => ({ message: "escolha como quer aparecer no site" }),
  }),
});

export type AvaliacaoInput = z.infer<typeof AvaliacaoInputSchema>;

/**
 * Moderação no painel: o fundador só põe no ar ou tira do ar. `pendente` é
 * decisão do filtro automático, nunca de um PATCH — por isso fica de fora.
 */
export const ModeracaoSchema = z.object({
  id: z.string().trim().min(1).max(64),
  status: z.enum(STATUS_MODERAVEL, { errorMap: () => ({ message: "situação inválida" }) }),
});

export type Moderacao = z.infer<typeof ModeracaoSchema>;
