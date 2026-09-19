/** API pública do slice de captação de leads. */
export { LeadInputSchema, VerifyInputSchema, normalizarTelefoneBR } from "./schema";
export type { LeadInput, VerifyInput } from "./schema";
export {
  criarOuAtualizarLead,
  gerarCodigo,
  hashCodigo,
  registrarConsentimento,
  TEXTO_CONSENTIMENTO,
  EXPIRACAO_CODIGO_MIN,
  MAX_TENTATIVAS,
} from "./lead";
export type {
  Lead,
  StatusLead,
  Consentimento,
  CodigoVerificacao,
  ContextoCriacao,
  ResultadoCriacao,
} from "./lead";
export { solicitarAcesso, REGRA_ENVIO_CODIGO } from "./solicitarAcesso";
export type { DepsSolicitarAcesso, ResultadoSolicitacao } from "./solicitarAcesso";
export { verificarCodigo, consumirTentativa, REGRA_VERIFICACAO } from "./verificacao";
export type { DepsVerificacao, ResultadoVerificacao, MotivoFalha } from "./verificacao";
