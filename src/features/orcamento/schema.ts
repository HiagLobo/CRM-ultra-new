/**
 * Validação (Zod) das entradas do orçamento — nada chega ao cálculo nem ao
 * banco sem passar por aqui. CLIENT-SAFE: o formulário do painel valida com o
 * MESMO schema que o servidor, então o erro aparece no campo antes de enviar.
 *
 * As mensagens nunca repetem o valor recebido (a observação é texto livre do
 * fundador sobre um cliente).
 */
import { z } from "zod";
import { CODIGOS_EXTRA, ENTRADA_MAX_PCT, ENTRADA_MIN_PCT, PUBLICOS, VALIDADE_PADRAO_DIAS } from "./tabela";
import { STATUS_ORCAMENTO } from "./orcamento";

/** Limites de sanidade: acima disso é erro de digitação, não negócio. */
export const LIMITE_ASSENTOS = 5_000;
export const LIMITE_UNIDADES = 500;
export const LIMITE_QUANTIDADE_EXTRA = 100_000;
export const LIMITE_OBSERVACAO = 500;
export const LIMITE_VALIDADE_DIAS = 180;

export const IdOrcamentoSchema = z.string().trim().min(1, "id inválido").max(100, "id inválido");

const inteiro = (max: number, mensagem: string) =>
  z.number({ invalid_type_error: mensagem, required_error: mensagem }).int(mensagem).min(0, mensagem).max(max, mensagem);

/** Desconto em %, com no máximo 2 casas (o cálculo trabalha em centésimos de %). */
const descontoSchema = z
  .number({ invalid_type_error: "desconto inválido" })
  .min(0, "o desconto começa em 0%")
  .max(100, "o desconto vai até 100%")
  .refine((v) => Math.abs(v * 100 - Math.round(v * 100)) < 1e-6, "o desconto aceita no máximo 2 casas");

export const NovoOrcamentoSchema = z
  .object({
    leadId: z.string().trim().min(1, "escolha o cliente").max(100, "id inválido"),
    publico: z.enum(PUBLICOS, { errorMap: () => ({ message: "escolha o público" }) }),
    assentos: z
      .object({
        pro: inteiro(LIMITE_ASSENTOS, "quantos assentos Pro?"),
        ultra: inteiro(LIMITE_ASSENTOS, "quantos assentos Ultra?"),
      })
      .strict(),
    descontoPct: descontoSchema.optional(),
    anual: z.boolean().optional(),
    implantacaoIsenta: z.boolean().optional(),
    unidades: z
      .number({ invalid_type_error: "quantas unidades ativas?" })
      .int("quantas unidades ativas?")
      .min(1, "a rede começa em 1 unidade ativa")
      .max(LIMITE_UNIDADES, `no máximo ${LIMITE_UNIDADES} unidades`)
      .optional(),
    extras: z
      .array(
        z
          .object({
            item: z.enum(CODIGOS_EXTRA, { errorMap: () => ({ message: "extra inválido" }) }),
            quantidade: z
              .number({ invalid_type_error: "quantidade inválida" })
              .int("quantidade inválida")
              .min(1, "a quantidade começa em 1")
              .max(LIMITE_QUANTIDADE_EXTRA, "quantidade fora do limite"),
          })
          .strict(),
      )
      .max(CODIGOS_EXTRA.length, "extra repetido na lista")
      .optional(),
    condicaoFundador: z.boolean().optional(),
    // quanto da implantação entra na assinatura; o saldo sai na conclusão
    entradaPct: z
      .number({ invalid_type_error: "entrada inválida" })
      .int("a entrada é em % inteiro")
      .min(ENTRADA_MIN_PCT, `a entrada começa em ${ENTRADA_MIN_PCT}%`)
      .max(ENTRADA_MAX_PCT, `a entrada vai até ${ENTRADA_MAX_PCT}%`)
      .optional(),
    validadeDias: z
      .number({ invalid_type_error: "validade inválida" })
      .int("validade inválida")
      .min(1, "a validade começa em 1 dia")
      .max(LIMITE_VALIDADE_DIAS, `a validade vai até ${LIMITE_VALIDADE_DIAS} dias`)
      .optional(),
    observacao: z
      .string()
      .trim()
      .max(LIMITE_OBSERVACAO, `a observação passa de ${LIMITE_OBSERVACAO} caracteres`)
      .transform((v) => (v === "" ? undefined : v))
      .optional(),
  })
  .strict()
  .superRefine((v, ctx) => {
    const erro = (campo: string, message: string) =>
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: [campo], message });
    if (v.publico === "rede" && v.unidades === undefined) erro("unidades", "informe quantas unidades estão ativas");
    if (v.publico !== "rede" && v.unidades !== undefined) erro("unidades", "unidades ativas só valem para a rede");
    const codigos = (v.extras ?? []).map((e) => e.item);
    if (new Set(codigos).size !== codigos.length) erro("extras", "o mesmo extra aparece duas vezes");
  });

export type NovoOrcamento = z.infer<typeof NovoOrcamentoSchema>;

/** Validade padrão quando o formulário não manda nada. */
export const VALIDADE_PADRAO = VALIDADE_PADRAO_DIAS;

/** Troca de situação no painel. */
export const StatusOrcamentoSchema = z
  .object({
    id: IdOrcamentoSchema,
    status: z.enum(STATUS_ORCAMENTO, { errorMap: () => ({ message: "situação inválida" }) }),
  })
  .strict();

export const ExclusaoOrcamentoSchema = z.object({ id: IdOrcamentoSchema }).strict();
