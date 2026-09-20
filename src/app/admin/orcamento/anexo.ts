/**
 * Anexo datado da proposta: o que está no ar hoje e o que entra em qual mês.
 *
 * Mora aqui, e não na tabela de preços, porque muda a cada onda: ao fechar uma
 * entrega, passe o item de `ANEXO_PROXIMAS` para `ANEXO_NO_AR` e atualize
 * `ANEXO_REVISADO_EM`. Orçamento já emitido não muda (o papel dele foi impresso
 * com o anexo do dia).
 *
 * Regra de ouro do texto: descreve o que o sistema faz, nunca o resultado que o
 * cliente vai ter. Enquanto os painéis forem demonstração, o anexo diz isso com
 * todas as letras.
 */

export interface EntregaDatada {
  /** Mês combinado, como aparece no papel. */
  mes: string;
  itens: string[];
}

/** Data da última revisão desta lista (sai impressa no anexo). */
export const ANEXO_REVISADO_EM = "2026-09-20";

export const TITULO_ANEXO = "Anexo 1: o que está no ar hoje e o que entra em qual mês";

/** Em operação nesta data. Só entra aqui o que o cliente pode usar hoje. */
export const ANEXO_NO_AR: string[] = [
  "Site público da imobiliária com a página de avaliações de quem usa o sistema.",
  "Cadastro do corretor com verificação de e-mail por código e conferência de CRECI.",
  "Painel de leads com etapas do funil, anotações, próxima ação do dia e exportação da carteira.",
  "Moderação das avaliações: o que vai para o site passa pela imobiliária antes.",
  "Demonstração navegável dos painéis do corretor, da imobiliária e da rede.",
];

/** Compromisso de data por item. Atrasou, vale a cláusula do mês sem cobrança. */
export const ANEXO_PROXIMAS: EntregaDatada[] = [
  {
    mes: "Novembro de 2026",
    itens: [
      "Funil do corretor em operação: ficha do cliente, agenda e próxima ação no dia.",
      "Migração da carteira a partir de planilha, acompanhada pela nossa equipe.",
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
    ],
  },
];

/** Cláusula do mês sem cobrança e o que ela não cobre. Sai logo abaixo da lista. */
export const CLAUSULA_MES_GRATIS = [
  "Cada item deste anexo que passar do mês indicado vale um mês de mensalidade sem cobrança, por item atrasado, creditado na fatura seguinte.",
  "Enquanto um item não entra, ele não é cobrado à parte: o que está neste anexo já está no preço desta proposta.",
];

/** Avisos que impedem a demonstração de ser lida como produto pronto. */
export const ANEXO_NOTAS = [
  "As telas de demonstração mostram o desenho do produto. Em operação está apenas o que aparece em \"no ar hoje\".",
  `Este anexo vale na data da proposta e é revisado a cada entrega (última revisão em ${ANEXO_REVISADO_EM.split("-").reverse().join("/")}).`,
];
