/** API pública do slice de captação de leads. */
export { LeadInputSchema, PedidoAcessoSchema, VerifyInputSchema, normalizarTelefoneBR } from "./schema";
export type { LeadInput, PedidoAcesso, VerifyInput } from "./schema";
export { normalizarCreci, EXEMPLO_CRECI } from "./creci";
export {
  criarOuAtualizarLead,
  gerarCodigo,
  hashCodigo,
  registrarConsentimento,
  TEXTO_CONSENTIMENTO,
  EXPIRACAO_CODIGO_MIN,
  MAX_TENTATIVAS,
  SEM_CODIGO,
} from "./lead";
export type {
  Lead,
  StatusLead,
  Consentimento,
  CodigoVerificacao,
  ContextoCriacao,
  ResultadoCriacao,
} from "./lead";
export {
  solicitarAcesso,
  REGRA_ENVIO_POR_EMAIL,
  REGRA_ENVIO_POR_IP,
  CHAVE_TETO_DIARIO,
  regraTetoDiario,
} from "./solicitarAcesso";
export type { DepsSolicitarAcesso, ResultadoSolicitacao, MotivoSemCodigo } from "./solicitarAcesso";
export { verificarCodigo, consumirTentativa, REGRA_VERIFICACAO } from "./verificacao";
export type { DepsVerificacao, ResultadoVerificacao, MotivoFalha } from "./verificacao";
export { avisarLeadNovo, PRAZO_AVISO_MS } from "./avisoLeadNovo";
export type { DepsAviso, ResultadoAviso } from "./avisoLeadNovo";
