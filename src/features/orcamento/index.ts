/** API pública do slice de orçamentos (O11). */
export {
  PUBLICOS,
  NIVEIS,
  ROTULO_PUBLICO,
  ROTULO_NIVEL,
  FAIXAS,
  PISOS,
  DESCONTO_QUE_AVISA,
  ENTRADA_PADRAO_PCT,
  ENTRADA_MIN_PCT,
  ENTRADA_MAX_PCT,
  MINIMO_FATURAVEL,
  MESES_PAGOS_NO_ANUAL,
  MESES_DO_ANO,
  VALIDADE_PADRAO_DIAS,
  NOME_IMPLANTACAO,
  IMPLANTACAO,
  FRANQUIAS,
  EXTRAS,
  CODIGOS_EXTRA,
  RECORRENCIAS,
  INCLUSOS,
  CONDICAO_FUNDADOR,
  TABELA,
  extraPorCodigo,
} from "./tabela";
export type {
  CodigoExtra,
  Extra,
  FaixaAssento,
  FaixaImplantacao,
  FranquiasDeUso,
  NivelAssento,
  PublicoOrcamento,
  Recorrencia,
  TabelaPrecos,
} from "./tabela";
export {
  STATUS_ORCAMENTO,
  ROTULO_STATUS,
  PREFIXO_NUMERO,
  anoEmRecife,
  diaBR,
  diaEmRecife,
  diaMaisDias,
  formatarNumero,
  formatarReais,
  implantacaoDoOrcamento,
  normalizarPublico,
  normalizarStatusOrcamento,
  proximoNumero,
  sequenciaDoNumero,
} from "./orcamento";
export type {
  CondicoesOrcamento,
  ImplantacaoOrcamento,
  ItemOrcamento,
  Orcamento,
  StatusOrcamento,
  TotaisOrcamento,
} from "./orcamento";
export { calcularOrcamento, partirImplantacao } from "./calculo";
export { implantacaoDoPorte, minimoFaturavel } from "./porte";
export type { CalculoOrcamento, ExtraPedido, PedidoOrcamento, ResultadoCalculo } from "./calculo";
export {
  ExclusaoOrcamentoSchema,
  IdOrcamentoSchema,
  LIMITE_OBSERVACAO,
  LIMITE_QUANTIDADE_EXTRA,
  NovoOrcamentoSchema,
  StatusOrcamentoSchema,
} from "./schema";
export type { NovoOrcamento } from "./schema";
export {
  buscarOrcamentoAdmin,
  clienteDoLead,
  excluirOrcamento,
  listarOrcamentosParaAdmin,
  paraOrcamentoAdmin,
  trocarStatusOrcamento,
} from "./admin";
export type { ClienteOrcamento, OrcamentoAdmin, ResultadoStatus } from "./admin";
export { textosDoDia } from "./inclusos";
export type { FranquiaDoDia, TextosDoDia } from "./inclusos";
export { emReais, paraDocumento } from "./documento";
export type {
  ImplantacaoDocumento,
  LinhaAssentoDocumento,
  LinhaExtraDocumento,
  OrcamentoDocumento,
  TotaisDocumento,
} from "./documento";
export { criarOrcamento } from "./criar";
export type { DepsCriarOrcamento, RecusaCalculo, ResultadoCriarOrcamento } from "./criar";
