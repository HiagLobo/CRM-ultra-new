/** API pública do slice de captação de leads. */
export {
  LeadInputSchema,
  PedidoAcessoSchema,
  VerifyInputSchema,
  EntrarSchema,
  AtualizacaoCadastroSchema,
  normalizarTelefoneBR,
} from "./schema";
export type { LeadInput, PedidoAcesso, VerifyInput, PedidoEntrar, AtualizacaoCadastro } from "./schema";
export { normalizarCreci, EXEMPLO_CRECI, chaveCreci, formasEquivalentesCreci, CONFERENCIAS_CRECI } from "./creci";
export type { ConferenciaCreci, Uf } from "./creci";
export { mascararEmail } from "./mascaraEmail";
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
  PRAZO_ENVIO_CODIGO_MS,
} from "./solicitarAcesso";
export type { DepsSolicitarAcesso, ResultadoSolicitacao, MotivoSemCodigo, Repetido } from "./solicitarAcesso";
export { entrar } from "./entrar";
export type { ResultadoEntrar } from "./entrar";
export { verificarCodigo, consumirTentativa, REGRA_VERIFICACAO } from "./verificacao";
export type { DepsVerificacao, ResultadoVerificacao, MotivoFalha } from "./verificacao";
export type { CampoNaoAtualizado } from "./atualizacaoCadastro";
export { avisarLeadNovo, PRAZO_AVISO_MS } from "./avisoLeadNovo";
export type { DepsAviso, ResultadoAviso } from "./avisoLeadNovo";
export {
  ETAPAS,
  CANAIS,
  CANAIS_MANUAIS,
  ROTULO_CANAL,
  normalizarStatus,
  normalizarCanal,
  diaRecife,
  diaValido,
} from "./funil";
export type { Canal, CanalManual, MudancaEtapa, NotaLead, ProximaAcao } from "./funil";
export { PatchLeadSchema, NotaSchema, CadastroManualSchema, IdLeadSchema } from "./schemaAdmin";
export type { PedidoPatch, CadastroManual } from "./schemaAdmin";
