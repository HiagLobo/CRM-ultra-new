/**
 * Os seis diferenciais do CRM Ultra, como a landing conta ao visitante.
 *
 * A seção "Recursos" responde o que o sistema faz. Esta responde outra coisa:
 * por que o Ultra e não outro CRM imobiliário. Por isso cada cartão descreve um
 * MECANISMO (o que acontece na tela), nunca um resultado prometido ao cliente.
 *
 * Decisões do fundador em 21/09/2026, que o teste ao lado fixa:
 * 1. sem selo de data por item (nada de "em breve" ou mês ao lado do cartão);
 * 2. o cartão dos anúncios não cita nome de portal;
 * 3. "app" aqui é a própria versão web aberta no navegador do celular.
 *
 * A regra que o teste protege de verdade: o site nunca promete mais que o
 * anexo datado da proposta (`src/app/admin/orcamento/anexo.ts`). Por isso cada
 * diferencial carrega o mês em que a entrega foi contratada. O mês não aparece
 * na tela, ele existe para o teste provar que a promessa tem lastro no papel
 * que o cliente assina. Mexeu aqui, confira lá.
 */

/** Nome de ícone do mapa de `src/components/Icon.tsx`. */
export type IconeDiferencial =
  | "sliders-horizontal"
  | "megaphone"
  | "shield-check"
  | "kanban-square"
  | "hand-coins"
  | "smartphone";

export interface Diferencial {
  /** Estável: serve de `key` na lista e de âncora nos testes. */
  id: string;
  icone: IconeDiferencial;
  /** Duas a cinco palavras: é o que a pessoa lê no celular antes de decidir ler o resto. */
  titulo: string;
  texto: string;
  /**
   * Mês do anexo da proposta que sustenta esta promessa, escrito exatamente
   * como está lá. Não vai para a tela.
   */
  entregaContratada: string;
}

export const EYEBROW_DIFERENCIAIS = "Onde o Ultra é diferente";
export const TITULO_DIFERENCIAIS = "O lead é da imobiliária, e continua sendo";
export const SUB_DIFERENCIAIS =
  "Recurso todo CRM imobiliário tem. Estas seis decisões mudam quem fica com o cliente, com o histórico da conversa e com o número real da operação.";

export const DIFERENCIAIS: readonly Diferencial[] = [
  {
    id: "triagem",
    icone: "sliders-horizontal",
    titulo: "Triagem antes do corretor",
    texto:
      "Quem chega pelo anúncio fala primeiro com o assistente, que separa quem responde de quem está só olhando. O corretor recebe a conversa que andou, com as respostas já na ficha, e não a fila inteira do dia.",
    entregaContratada: "Dezembro de 2026",
  },
  {
    id: "anuncios",
    icone: "megaphone",
    titulo: "Um cadastro, vários anúncios",
    texto:
      "Você preenche a ficha do imóvel uma vez, com fotos, metragem e valor. O sistema monta o anúncio e envia para as principais plataformas do mercado, sem redigitar a mesma ficha em cada site.",
    entregaContratada: "Abril de 2027",
  },
  {
    id: "conversa",
    icone: "shield-check",
    titulo: "Conversa pelo painel, resposta no WhatsApp",
    texto:
      "O corretor responde de dentro do painel. O cliente recebe e responde no WhatsApp, pelo número da imobiliária. Se o corretor sair, o contato e o histórico da conversa continuam na conta.",
    entregaContratada: "Dezembro de 2026",
  },
  {
    id: "funil",
    icone: "kanban-square",
    titulo: "O funil se preenche sozinho",
    texto:
      "Depois de cada conversa, o assistente escreve o resumo na ficha e move o cartão para a etapa correspondente. O corretor ajusta se discordar. O relatório da imobiliária passa a sair do atendimento, não de estimativa.",
    entregaContratada: "Dezembro de 2026",
  },
  {
    id: "pagamentos",
    icone: "hand-coins",
    titulo: "Aluguel, repasse e comissão",
    texto:
      "Quem administra imóvel de terceiro registra a cobrança do aluguel e dá baixa quando o pagamento entra. Na mesma tela saem o repasse ao proprietário e a comissão da administração, com o histórico de cada lançamento.",
    entregaContratada: "Abril de 2027",
  },
  {
    id: "celular",
    icone: "smartphone",
    titulo: "Do celular, sem instalar",
    texto:
      "Na porta do imóvel, o corretor abre o mesmo endereço no navegador do celular e entra com a conta dele: funil, ficha do cliente e agenda do dia. Não tem aplicativo para instalar nem loja para atualizar.",
    entregaContratada: "Novembro de 2026",
  },
];
