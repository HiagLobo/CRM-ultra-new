/**
 * Validação (Zod) das entradas do admin no funil (O8): etapa, próxima ação,
 * anotação e cadastro manual. Toda rota `/api/admin/*` passa por aqui antes de
 * qualquer lógica. CLIENT-SAFE: o formulário do painel valida com o mesmo schema.
 *
 * As mensagens nunca repetem o valor recebido (pode ser dado pessoal).
 */
import { z } from "zod";
import { creciSchema, emailSchema, telefoneSchema } from "./schema";
import {
  CANAIS_MANUAIS,
  ETAPAS,
  ETAPAS_SIMPLES,
  LIMITE_MOTIVO,
  LIMITE_NOTA,
  LIMITE_PROXIMA_ACAO,
  diaValido,
  type MudancaEtapa,
  type ProximaAcao,
} from "./funil";

export const IdLeadSchema = z.string().trim().min(1, "id inválido").max(100, "id inválido");

const diaSchema = z.string().max(10, "data inválida (use AAAA-MM-DD)").refine(diaValido, "data inválida (use AAAA-MM-DD)");

const textoObrigatorio = (max: number, oQue: string) =>
  z.string().trim().min(1, `informe ${oQue}`).max(max, `${oQue} passa de ${max} caracteres`);

/** Campo opcional de formulário: vazio ("" ou só espaços) conta como não informado. */
function opcional<T extends z.ZodTypeAny>(schema: T) {
  return z.preprocess((v) => (typeof v === "string" && v.trim() === "" ? undefined : v), schema.optional());
}

/** O PATCH do lead é uma de duas coisas: mudar a etapa OU definir/limpar a próxima ação. */
export type PedidoPatch =
  | { tipo: "etapa"; id: string; mudanca: MudancaEtapa }
  | { tipo: "proxima_acao"; id: string; proximaAcao: ProximaAcao | null };

type EtapaSimples = (typeof ETAPAS_SIMPLES)[number];

export const PatchLeadSchema = z
  .object({
    id: IdLeadSchema,
    etapa: z.enum(ETAPAS, { errorMap: () => ({ message: "etapa inválida" }) }).optional(),
    retomarEm: diaSchema.optional(),
    // vazio conta como não informado (retomar aceita sem motivo; perdido cai no "informe o motivo")
    motivo: opcional(textoObrigatorio(LIMITE_MOTIVO, "o motivo")),
    proximaAcao: z
      .object({ em: diaSchema, texto: textoObrigatorio(LIMITE_PROXIMA_ACAO, "a próxima ação") })
      .strict()
      .nullable()
      .optional(),
  })
  .strict()
  .superRefine((v, ctx) => {
    const erro = (campo: string, message: string) => ctx.addIssue({ code: z.ZodIssueCode.custom, path: [campo], message });
    if ((v.etapa === undefined) === (v.proximaAcao === undefined)) {
      erro("etapa", "envie a etapa ou a próxima ação (uma das duas)");
      return;
    }
    if (v.etapa === "retomar" && !v.retomarEm) erro("retomarEm", "informe a data de retomar");
    if (v.etapa === "perdido" && !v.motivo) erro("motivo", "informe o motivo da perda");
    if (v.retomarEm && v.etapa !== "retomar") erro("retomarEm", "a data de retomar só vale para a etapa retomar");
    if (v.motivo && v.etapa !== "retomar" && v.etapa !== "perdido") {
      erro("motivo", "o motivo só vale para retomar ou perdido");
    }
  })
  .transform((v): PedidoPatch => {
    if (v.etapa === undefined) return { tipo: "proxima_acao", id: v.id, proximaAcao: v.proximaAcao ?? null };
    // o superRefine já garantiu: retomar tem data, perdido tem motivo
    const mudanca: MudancaEtapa =
      v.etapa === "retomar"
        ? { etapa: "retomar", retomarEm: v.retomarEm!, ...(v.motivo ? { motivo: v.motivo } : {}) }
        : v.etapa === "perdido"
          ? { etapa: "perdido", motivo: v.motivo! }
          : { etapa: v.etapa as EtapaSimples };
    return { tipo: "etapa", id: v.id, mudanca };
  });

export const NotaSchema = z.object({ texto: textoObrigatorio(LIMITE_NOTA, "a anotação") }).strict();

/**
 * Cadastro manual (indicação, evento, WhatsApp): telefone e canal obrigatórios;
 * nome, e-mail, CRECI e observação opcionais. O checkbox "a pessoa sabe e
 * concordou em ser contatada" é obrigatório — é a base do registro (LGPD).
 */
export const CadastroManualSchema = z
  .object({
    nome: opcional(z.string().trim().max(120, "o nome passa de 120 caracteres")),
    telefone: telefoneSchema,
    email: opcional(emailSchema),
    creci: opcional(creciSchema),
    canal: z.enum(CANAIS_MANUAIS, { errorMap: () => ({ message: "escolha o canal" }) }),
    observacao: opcional(z.string().trim().max(LIMITE_NOTA, `a observação passa de ${LIMITE_NOTA} caracteres`)),
    consentimento: z.literal(true, {
      errorMap: () => ({ message: "confirme que a pessoa sabe e concordou em ser contatada" }),
    }),
  })
  .strict();

export type CadastroManual = z.infer<typeof CadastroManualSchema>;
