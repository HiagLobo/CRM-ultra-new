/**
 * O texto jurídico e comercial do documento: escada, implantação, condições,
 * condição de fundador, LGPD e o aviso de que proposta não é o contrato.
 *
 * Fica separado da tabela de preços de propósito: número muda por decisão de
 * preço, frase muda por decisão de contrato. Nenhuma promessa de resultado
 * entra aqui, e a palavra "completo" não descreve nível nenhum enquanto os
 * painéis forem demonstração (guardado por teste).
 *
 * Regra de leitura (decisões do fundador em 2026-09-20): cada assunto tem UMA
 * resposta no papel. A implantação é serviço entregue, pago em duas partes,
 * nunca diluído na mensalidade e não devolvido; não existe multa de saída.
 */

/** A escada marginal em uma linha, do lado da tabela de assentos. */
export const ESCADA_EXPLICADA =
  "Cada assento entra pela faixa dele: a faixa vale para o assento, não para a conta inteira.";

export const IMPLANTACAO_TITULO = "Migração de carteira, personalização e treinamento";

/**
 * Primeira vez que "go live" aparece no papel: a tradução vem junto, porque nem
 * todo cliente conhece o termo.
 */
export const IMPLANTACAO_EXPLICADA =
  "Serviço entregue uma vez: migração da carteira, personalização do sistema para a sua operação e treinamento da equipe. É pago em duas partes, entrada na assinatura e saldo na conclusão da implantação (o go live, quando o sistema entra em operação). O valor pago não é devolvido em caso de saída depois disso.";

export const IMPLANTACAO_ISENTA = "Implantação isenta nesta proposta: não há entrada nem saldo a pagar.";

export const TITULO_CONDICOES = "Condições comerciais";
export const CONDICOES_COMERCIAIS: string[] = [
  "A entrada da implantação vence na assinatura desta proposta; o saldo vence na conclusão da implantação (go live).",
  "A mensalidade começa no go live, com vencimento no mesmo dia de cada mês.",
  "A conta segue os assentos ativos no fechamento do mês: assento aberto no meio do mês entra proporcional, assento desligado sai na fatura seguinte.",
  "No plano anual, 12 meses pelo preço de 10, pagos na assinatura, e a implantação fica isenta.",
  "Sem prazo mínimo de permanência: a saída pode ser pedida por escrito, com 30 dias de antecedência, e não há multa.",
  "Na saída, a carteira sai em planilha e o acesso segue até o fim do período já pago. A implantação já paga não é devolvida.",
];

export const TITULO_FUNDADOR = "Condição de fundador";
export const FUNDADOR_RECEBE: string[] = [
  "Preço congelado por 24 meses.",
  "A mensalidade começa no go live.",
  "Implantação isenta: não há entrada nem saldo a pagar.",
  "Assentos Ultra pelo preço do Pro nos 12 primeiros meses.",
  "Saída sem multa a qualquer momento, inclusive dentro dos primeiros 90 dias.",
];
export const FUNDADOR_EM_TROCA: string[] = [
  "Compromisso de 12 meses de uso, contados do go live.",
  "Uso do case e um depoimento sobre a operação.",
  "Uma conversa de feedback por mês.",
  "Uma visita de referência para outro cliente.",
];

export const TITULO_LGPD = "Dados pessoais (LGPD)";

/**
 * Quem é controlador e quem é operador, em português de gente. O nome do
 * cliente entra sem artigo (pode ser pessoa ou empresa); `operadora` vem da
 * razão social do `brand`, nunca escrita aqui.
 */
export function textoLgpd(cliente: string, operadora: string): string[] {
  return [
    `Os dados de clientes e imóveis continuam sendo de ${cliente}, na posição de controlador. ${operadora} é a operadora: trata esses dados apenas para o sistema funcionar e seguindo as instruções do controlador (Lei 13.709/2018).`,
    "Exportar a carteira e apagar os dados de um titular pela própria tela entra junto com o painel do cliente, na data do anexo. Até lá, o pedido é feito por e-mail para o contato do rodapé e atendido em até 5 dias úteis, com registro.",
    "Encerrado o contrato, os dados são devolvidos em planilha e apagados dos ambientes de produção em até 30 dias; as cópias de segurança expiram no ciclo normal de retenção, em até 35 dias, sem uso.",
  ];
}

export const AVISO_PROPOSTA =
  "Esta é uma proposta comercial e não é o contrato: ela fixa o preço, o prazo e o anexo de entregas, e vale até a data indicada acima.";

/** Linha de validade do topo do documento. */
export function linhaValidade(dataFormatada: string): string {
  return `Proposta válida até ${dataFormatada}.`;
}

/** Como o público contratado aparece no papel. Valor desconhecido sai como veio. */
export function rotuloPublico(publico: string | undefined): string {
  if (!publico) return "";
  const rotulos: Record<string, string> = {
    autonomo: "Corretor autônomo",
    imobiliaria: "Imobiliária",
    rede: "Rede de imobiliárias",
  };
  return rotulos[publico] ?? publico;
}
