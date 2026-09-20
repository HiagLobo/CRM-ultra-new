/**
 * O texto jurídico e comercial do documento: escada, implantação, condições,
 * condição de fundador, LGPD e o aviso de que proposta não é contrato.
 *
 * Fica separado da tabela de preços de propósito: número muda por decisão de
 * preço, frase muda por decisão de contrato. Nenhuma promessa de resultado
 * entra aqui, e a palavra "completo" não descreve nível nenhum enquanto os
 * painéis forem demonstração (guardado por teste).
 */

/** A escada marginal em uma linha, do lado da tabela de assentos. */
export const ESCADA_EXPLICADA =
  "Cada assento entra pela faixa dele: a faixa vale para o assento, não para a conta inteira.";

export const IMPLANTACAO_TITULO = "Migração de carteira e treinamento";
export const IMPLANTACAO_EXPLICADA =
  "Cobrada uma vez, no go live, e amortizada em 1/12 por mês. A saída antes do 12º mês paga o saldo ainda não amortizado.";

export const TITULO_CONDICOES = "Condições comerciais";
export const CONDICOES_COMERCIAIS: string[] = [
  "Pagamento mensal, com vencimento no mesmo dia de cada mês, começando no go live.",
  "A conta segue os assentos ativos no fechamento do mês: assento aberto no meio do mês entra proporcional, assento desligado sai na fatura seguinte.",
  "No plano anual, 12 meses pelo preço de 10, pagos no go live, com a migração de carteira e o treinamento isentos.",
  "No plano mensal não há fidelidade: a saída pode ser pedida por escrito, com 30 dias de antecedência.",
  "Na saída, a carteira sai em planilha e o acesso segue até o fim do período já pago.",
];

export const TITULO_FUNDADOR = "Condição de fundador";
export const FUNDADOR_RECEBE: string[] = [
  "Preço congelado por 24 meses.",
  "Pagamento começa no go live.",
  "Migração de carteira e treinamento isentos.",
  "Assentos Ultra pelo preço do Pro nos 12 primeiros meses.",
  "Saída sem multa nos primeiros 90 dias.",
];
export const FUNDADOR_EM_TROCA: string[] = [
  "12 meses de contrato, contados do go live.",
  "Uso do case e um depoimento sobre a operação.",
  "Uma conversa de feedback por mês.",
  "Uma visita de referência para outro cliente.",
];

export const TITULO_LGPD = "Dados pessoais (LGPD)";

/**
 * Quem é controlador e quem é operador, em português de gente. `operadora` vem
 * da razão social do `brand`, nunca escrita aqui.
 */
export function textoLgpd(cliente: string, operadora: string): string[] {
  return [
    `Os dados de clientes e imóveis continuam sendo da ${cliente}, que é a controladora. A ${operadora} é a operadora: trata esses dados apenas para o sistema funcionar e seguindo as instruções da controladora (Lei 13.709/2018).`,
    "A carteira é exportável em planilha a qualquer momento, pela própria tela, sem depender de pedido.",
    "Pedido de exclusão feito pelo titular é atendido dentro do sistema e fica registrado.",
    "Encerrado o contrato, os dados são devolvidos em planilha e apagados dos nossos ambientes em até 30 dias, salvo o que a lei obrigar a guardar.",
  ];
}

export const AVISO_PROPOSTA =
  "Esta é uma proposta comercial e não é contrato: vale como preço e como prazo, e não cria obrigação de resultado para nenhuma das partes.";

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
