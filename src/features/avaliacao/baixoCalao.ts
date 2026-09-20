/**
 * Lista curta de baixo calão do filtro automático de comentários (O10·S1).
 *
 * Mora num arquivo só dela, separada da regra que a usa, por três motivos:
 * este é o ÚNICO lugar do repositório que precisa escrever as palavras (nenhum
 * teste as repete — todos importam daqui); mudar o rigor da lista não mexe no
 * filtro; e quem for ler o filtro não esbarra nelas.
 *
 * Critério: palavrão comum, do tipo que o fundador não quer ver na landing.
 * Xingamento contra grupo de pessoas NÃO entra aqui — isso não é caso de
 * "segurar para conferir", é caso de recusar, e quem recusa é o fundador no
 * painel. A comparação é por palavra inteira, em texto sem acento e em
 * minúsculas (`filtroComentario.ts`), então "cu" não pega "curso".
 */
export const BAIXO_CALAO: readonly string[] = [
  "merda",
  "bosta",
  "porra",
  "caralho",
  "foda",
  "fodase",
  "fodam",
  "puta",
  "putaria",
  "buceta",
  "cu",
  "cuzao",
  "babaca",
  "otario",
  "escroto",
  "arrombado",
  "desgraca",
  "fdp",
  "pqp",
  "vsf",
];
