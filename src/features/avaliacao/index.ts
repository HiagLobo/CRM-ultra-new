/** API pública do slice de avaliações do demo (O10). */
export {
  IDENTIFICACOES,
  STATUS_AVALIACAO,
  STATUS_MODERAVEL,
  ESTRELAS_MAX,
  COMENTARIO_MAX,
  COMENTARIOS_NA_VITRINE,
  normalizarIdentificacao,
  normalizarStatusAvaliacao,
  resumo,
  resumoDaContagem,
} from "./avaliacao";
export type {
  Avaliacao,
  ConsentimentoAvaliacao,
  Identificacao,
  ResumoAvaliacoes,
  StatusAvaliacao,
  StatusModeravel,
} from "./avaliacao";
/** Fonte única das frases de consentimento — a tela do convite importa daqui. */
export { textoConsentimentoAvaliacao } from "./consentimento";
export { notasDoArquivo } from "./doArquivo";
export { filtrarComentario, ROTULO_MOTIVO } from "./filtroComentario";
export type { MotivoPendente, ResultadoFiltro } from "./filtroComentario";
export { AvaliacaoInputSchema, ModeracaoSchema, MENSAGEM_ESTRELAS } from "./schema";
export type { AvaliacaoInput, Moderacao } from "./schema";
export { avaliar, REGRA_AVALIACAO } from "./avaliar";
export type { DepsAvaliar, ResultadoAvaliar } from "./avaliar";
export { vitrine } from "./vitrine";
export type { ComentarioPublico, DepsVitrine, VitrineAvaliacoes } from "./vitrine";
export { listarParaAdmin, moderar, paraAvaliacaoAdmin } from "./admin";
export type { AvaliacaoAdmin, ListaAvaliacoesAdmin, ResultadoModeracao } from "./admin";
export { avisarAvaliacao, mereceAviso, PRAZO_AVISO_AVALIACAO_MS } from "./avisoAvaliacao";
export type { DepsAvisoAvaliacao, ResultadoAvisoAvaliacao } from "./avisoAvaliacao";
