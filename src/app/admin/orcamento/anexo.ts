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
export const ANEXO_REVISADO_EM = "2026-09-23";

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
      "Painel do corretor em operação: funil por etapa, ficha do cliente, carteira de imóveis com fotos e situação, anotações, agenda e próxima ação do dia. Os mesmos painéis abrem no navegador do celular, com o mesmo login do computador e sem instalar aplicativo.",
      "Painel da imobiliária: carteira da equipe, distribuição dos atendimentos, divisão da comissão entre corretor e imobiliária junto do fechamento, e exportação em planilha.",
      "Migração da carteira a partir de planilha, acompanhada pela nossa equipe.",
      "Exportação da carteira e exclusão dos dados de um titular pela própria tela (LGPD).",
    ],
  },
  {
    mes: "Dezembro de 2026",
    itens: [
      "Atendimento de IA no WhatsApp oficial: o assistente apura o que o cliente procura, a faixa de valor e o prazo, escreve o resumo na ficha e move o lead para a etapa do funil correspondente, marcado como alteração da IA para o corretor conferir. O registro vai junto do atendimento e não conta como um segundo atendimento na franquia.",
      "Conversa do corretor com o cliente feita dentro do painel, pelo número de WhatsApp oficial da imobiliária, com o histórico guardado na conta da imobiliária.",
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
      "Locação: contratos, reajustes e baixa automática de pagamento, com o repasse ao proprietário e a comissão da administração saindo do mesmo lançamento.",
      "Publicação do imóvel a partir do cadastro: o sistema monta o anúncio e envia, num movimento só, para as principais plataformas de divulgação de imóveis, com a situação de cada envio na ficha do imóvel.",
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
