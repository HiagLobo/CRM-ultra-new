/**
 * Anexo datado da proposta: o que está no ar hoje e o que entra em qual mês.
 *
 * Mora aqui, e não na tabela de preços, porque muda a cada onda: ao fechar uma
 * entrega, passe o item de `ANEXO_PROXIMAS` para `ANEXO_NO_AR` e atualize
 * `ANEXO_REVISADO_EM`. Orçamento já emitido não muda (o papel dele foi impresso
 * com o anexo do dia).
 *
 * Duas regras de ouro do texto:
 * 1. descreve o que o sistema faz, nunca o resultado que o cliente vai ter;
 * 2. em "no ar hoje" só entra o que o CLIENTE PAGANTE usa hoje. O painel de
 *    leads do fundador, a landing do CRM Ultra e a moderação das avaliações são
 *    do fornecedor, não do cliente: não contam como entrega (revisão de
 *    2026-09-20). Lista curta aqui é sinal de honestidade, não de fraqueza.
 */

export interface EntregaDatada {
  /** Mês combinado, como aparece no papel. */
  mes: string;
  itens: string[];
}

/** Data da última revisão desta lista (sai impressa no anexo). */
export const ANEXO_REVISADO_EM = "2026-09-20";

export const TITULO_ANEXO = "Anexo 1: o que está no ar hoje e o que entra em qual mês";

/** Em operação para o cliente nesta data. Nada aqui depende de entrega futura. */
export const ANEXO_NO_AR: string[] = [
  "Demonstração navegável dos painéis do corretor, da imobiliária e da rede, com dados de exemplo, para a equipe conhecer o sistema antes do go live.",
  "Acesso da equipe à demonstração com verificação de e-mail por código e conferência de CRECI.",
];

/** Compromisso de data por item. Atrasou, vale a cláusula do mês sem cobrança. */
export const ANEXO_PROXIMAS: EntregaDatada[] = [
  {
    mes: "Novembro de 2026",
    itens: [
      "Painel do corretor em operação: funil por etapa, ficha do cliente, anotações, agenda e próxima ação do dia.",
      "Painel da imobiliária: carteira da equipe, distribuição dos atendimentos e exportação em planilha.",
      "Migração da carteira a partir de planilha, acompanhada pela nossa equipe.",
      "Exportação da carteira e exclusão dos dados de um titular pela própria tela (LGPD).",
    ],
  },
  {
    mes: "Dezembro de 2026",
    itens: [
      "Atendimento de IA no WhatsApp oficial, com o resumo da conversa caindo na ficha do cliente.",
      "Reunião transcrita e resumida dentro do atendimento.",
    ],
  },
  {
    mes: "Fevereiro de 2027",
    itens: [
      "Radar de oportunidades, com consulta por assento no nível Ultra.",
      "Avaliação de imóvel com os comparáveis da própria carteira.",
    ],
  },
  {
    mes: "Abril de 2027",
    itens: [
      "Locação: contratos, reajustes e baixa automática de pagamento.",
      "Painel da rede com o fechamento mês a mês por unidade.",
      "Site público da imobiliária com a página de avaliações dos seus clientes, com publicação direta e filtro automático de conteúdo impróprio.",
    ],
  },
];

/** Cláusula do mês sem cobrança e como o item entregue passa a ser cobrado. */
export const CLAUSULA_MES_GRATIS = [
  "Cada item deste anexo que passar do mês indicado vale um mês de mensalidade sem cobrança, por item atrasado, creditado na fatura seguinte.",
  "Enquanto um item não é entregue, ele não é cobrado. Entregue o item, valem a franquia de uso e o preço do excedente da tabela acima.",
];

/** Avisos que impedem a demonstração de ser lida como produto pronto. */
export const ANEXO_NOTAS = [
  "As telas de demonstração mostram o desenho do produto. Em operação está apenas o que aparece em \"no ar hoje\".",
  `Este anexo vale na data da proposta e é revisado a cada entrega (última revisão em ${ANEXO_REVISADO_EM.split("-").reverse().join("/")}).`,
];
