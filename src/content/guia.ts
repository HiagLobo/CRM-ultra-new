/**
 * CATÁLOGO do guia do demo — a única fonte dos textos de orientação.
 *
 * Fica separado dos componentes de propósito: dá para reescrever a copy inteira
 * aqui sem abrir um arquivo de UI. Nada de PII e nada de pessoa real: o demo é
 * todo persona fictícia.
 */
export type Painel = "corretor" | "ceo" | "franqueado";

export interface PassoGuia {
  titulo: string;
  texto: string;
}

export interface GuiaPainel {
  /** Nome do painel como o visitante o vê. */
  nome: string;
  titulo: string;
  resumo: string;
  /** O que sugerimos olhar primeiro — 3 a 4 itens, não um manual. */
  passos: PassoGuia[];
}

export const GUIA: Record<Painel, GuiaPainel> = {
  corretor: {
    nome: "Painel do Corretor",
    titulo: "Este é o dia a dia de quem atende",
    resumo:
      "Aqui o corretor vê os próprios clientes, onde cada negócio parou e o que fazer em seguida. Explore à vontade: os dados são inventados.",
    passos: [
      {
        titulo: "Comece pelo Funil",
        texto: "Cada lead numa etapa. Arraste a leitura da esquerda para a direita: é o caminho do primeiro contato até o fechamento.",
      },
      {
        titulo: "Abra o Atendimento",
        texto: "Conversas, modelos de mensagem e a ficha do cliente na mesma tela, sem pular entre aplicativos.",
      },
      {
        titulo: "Passe pelo Radar",
        texto: "É a parte de captação: mapa de oportunidades, alertas e avaliação de imóveis para chegar antes no proprietário.",
      },
      {
        titulo: "Confira as Comissões",
        texto: "Quanto cada negócio rendeu e o que está por receber.",
      },
    ],
  },
  ceo: {
    nome: "CEO com associados",
    titulo: "A visão de quem administra a imobiliária",
    resumo:
      "O mesmo produto, do ponto de vista de quem responde pela operação: time, carteira, caixa e risco.",
    passos: [
      {
        titulo: "Visão geral primeiro",
        texto: "Os números da operação numa tela: entradas, fechamentos e o que precisa de atenção.",
      },
      {
        titulo: "Veja os Associados",
        texto: "Quem são os corretores da rede, como estão performando e o que cada um tem em mãos.",
      },
      {
        titulo: "Curadoria e Fechamentos",
        texto: "Onde os imóveis são aprovados e os negócios saem do papel.",
      },
      {
        titulo: "Financeiro e Jurídico",
        texto: "Cobranças, repasses e contratos: a parte que costuma viver fora do CRM.",
      },
    ],
  },
  franqueado: {
    nome: "CEO com franquias",
    titulo: "A rede vista por unidade",
    resumo:
      "Para quem opera franquias: comparar unidades, acompanhar o time e decidir onde investir atenção.",
    passos: [
      {
        titulo: "Comece pela Visão",
        texto: "O desempenho da unidade e a posição dela na rede.",
      },
      {
        titulo: "Olhe o Time",
        texto: "Quem está na unidade, quantos assentos existem e quem está entrando.",
      },
      {
        titulo: "Leads e Candidatos",
        texto: "As oportunidades que chegaram e os corretores indicados para a unidade.",
      },
    ],
  },
};

/** Descobre o painel pela rota. Fora dos painéis, devolve `null`. */
export function painelDaRota(pathname: string): Painel | null {
  if (pathname.startsWith("/corretor")) return "corretor";
  if (pathname.startsWith("/ceo")) return "ceo";
  if (pathname.startsWith("/franqueado")) return "franqueado";
  return null;
}

/* ─────────────────────────────────────────────────────────────────────────────
   Dicas por seção (O3·S2) — o que o guia mostra conforme a tela aberta.
   Rota sem entrada aqui cai nos passos gerais do painel: nunca guia vazio.
   ──────────────────────────────────────────────────────────────────────────── */

export interface SecaoGuia {
  /** Prefixo de rota. A correspondência mais específica ganha. */
  rota: string;
  titulo: string;
  dicas: string[];
}

export const SECOES: SecaoGuia[] = [
  // ---- Corretor ----
  {
    rota: "/corretor/funil",
    titulo: "Funil de vendas",
    dicas: [
      "Cada coluna é uma etapa do negócio: da primeira conversa até a assinatura.",
      "O que trava mais é a passagem de 'visita' para 'proposta'. É aí que o acompanhamento vale mais.",
      "Um card parado há dias na mesma coluna é o sinal para retomar o contato.",
    ],
  },
  {
    rota: "/corretor/atendimento",
    titulo: "Atendimento",
    dicas: [
      "O assistente de IA atende antes de você: o resumo do pré-atendimento traz imóvel, orçamento, finalidade e urgência já levantados.",
      "A etapa do funil anda sozinha conforme a conversa evolui. O selo 'automático' mostra isso. Discordou? Clique na etapa certa.",
      "A conversa, a ficha do cliente e o histórico ficam lado a lado: não precisa abrir outro app.",
      "As ações rápidas (agendar visita, reunião, proposta) já saem preenchidas com o que a IA levantou.",
    ],
  },
  {
    rota: "/corretor/imoveis",
    titulo: "Carteira de imóveis",
    dicas: [
      "É o cadastro do que você tem para vender ou alugar, com fotos e situação de cada imóvel.",
      "O cadastro é em etapas: dá para salvar no meio e terminar depois.",
      "Imóvel em curadoria é o que ainda precisa de aprovação antes de ir para o site.",
    ],
  },
  {
    rota: "/corretor/radar",
    titulo: "Radar de captação",
    dicas: [
      "Aqui o assunto é achar imóvel para captar, não vender o que já se tem.",
      "A lista sai de sinais cruzados todo dia (anúncio antigo, preço fora da curva, movimento na região) e vem ordenada pelos mais promissores.",
      "O mapa mostra concentração de oportunidades; os alertas avisam quando algo muda na sua região.",
      "Ver a lista é livre; abrir o contato do proprietário consome crédito, porque cada consulta dessas tem custo real.",
    ],
  },
  {
    rota: "/corretor/agenda",
    titulo: "Agenda",
    dicas: [
      "Visitas, reuniões e retornos no mesmo lugar, já ligados ao cliente.",
      "O que está marcado aparece também no card do lead dentro do funil.",
    ],
  },
  {
    rota: "/corretor/comissoes",
    titulo: "Comissões",
    dicas: [
      "Quanto cada negócio fechado rendeu e o que ainda está por receber.",
      "A divisão entre corretor, captador e imobiliária fica explícita em cada linha.",
    ],
  },
  // ---- CEO com associados ----
  {
    rota: "/ceo/visao-geral",
    titulo: "Visão geral",
    dicas: [
      "O resumo da operação: o que entrou, o que fechou e o que precisa de atenção agora.",
      "Serve para decidir onde olhar: cada bloco leva para a tela detalhada.",
    ],
  },
  {
    rota: "/ceo/associados",
    titulo: "Corretores associados",
    dicas: [
      "Quem faz parte da rede, o que cada um tem em mãos e como está performando.",
      "É por aqui que entra corretor novo e que se acompanha quem está parado.",
    ],
  },
  {
    rota: "/ceo/curadoria",
    titulo: "Curadoria",
    dicas: [
      "Fila de imóveis aguardando aprovação antes de irem para o site.",
      "É o controle de qualidade do que a imobiliária anuncia com o nome dela.",
    ],
  },
  {
    rota: "/ceo/financeiro",
    titulo: "Financeiro",
    dicas: [
      "Entradas, repasses e cobranças da operação.",
      "Comissão de negócio fechado aparece aqui e no painel do corretor: é a mesma fonte.",
    ],
  },
  {
    rota: "/ceo/juridico",
    titulo: "Jurídico",
    dicas: [
      "Contratos e pendências que costumam viver fora do CRM, em pasta separada.",
      "Manter aqui é o que evita perder prazo por causa de e-mail esquecido.",
    ],
  },
  {
    rota: "/ceo/leads",
    titulo: "Leads da imobiliária",
    dicas: [
      "Tudo que chegou pelos canais da imobiliária, antes de virar atendimento de alguém.",
      "A distribuição para os corretores acontece a partir desta tela.",
    ],
  },
  // ---- CEO com franquias ----
  {
    rota: "/franqueado",
    titulo: "Visão da unidade",
    dicas: [
      "A tela inteira é a sua unidade: desempenho, time, leads e a posição na rede.",
      "O ranking compara unidades: serve para saber o que está funcionando em outra praça.",
      "Assentos são as vagas de corretor que a unidade pode ocupar.",
    ],
  },
];

/** Seção da rota atual — a correspondência mais específica ganha. */
export function secaoDaRota(pathname: string): SecaoGuia | null {
  const candidatas = SECOES.filter((s) => pathname === s.rota || pathname.startsWith(`${s.rota}/`));
  if (candidatas.length === 0) return null;
  return candidatas.reduce((a, b) => (b.rota.length > a.rota.length ? b : a));
}

/* ─────────────────────────────────────────────────────────────────────────────
   Tour guiado (destaque + balão) — o guia ATIVO, que leva pela mão na primeira
   visita. O do drawer é passivo: só responde se a pessoa clicar.

   `alvo` é um seletor CSS. Os elementos carregam `data-tour="..."`; passo cujo
   elemento não existe na tela é pulado (no celular a barra lateral some).
   ──────────────────────────────────────────────────────────────────────────── */

export interface PassoTour {
  alvo: string;
  titulo: string;
  texto: string;
}

/** Chave do tour = rota onde ele roda. */
export const TOURS: Record<string, PassoTour[]> = {
  "/corretor": [
    {
      alvo: '[data-tour="menu-lateral"]',
      titulo: "Este é o seu menu",
      texto:
        "Tudo do painel sai daqui, em três blocos: Geral (o dia a dia), Negócios (imóveis e dinheiro) e Conta. Vou mostrar os quatro que você mais vai usar.",
    },
    {
      alvo: '[data-tour="nav-atendimento"]',
      titulo: "Atendimento é onde a conversa acontece",
      texto:
        "Mensagens, ficha do cliente e histórico na mesma tela. O contador mostra quantas conversas estão esperando resposta.",
    },
    {
      alvo: '[data-tour="nav-funil"]',
      titulo: "Funil é onde o negócio anda",
      texto:
        "Cada cliente numa etapa, do primeiro contato ao fechamento. É aqui que se enxerga o que travou.",
    },
    {
      alvo: '[data-tour="nav-radar"]',
      titulo: "Radar é para achar imóvel novo",
      texto:
        "Enquanto o funil cuida de quem já chegou, o Radar procura quem ainda vai vender: mapa, alertas e avaliação.",
    },
    {
      alvo: '[data-tour="nav-comissoes"]',
      titulo: "Comissões: quanto rendeu",
      texto: "O que cada negócio fechado pagou e o que ainda está por receber.",
    },
    {
      alvo: '[data-tour="topbar-busca"]',
      titulo: "Busca de tudo",
      texto: "Procure por imóvel, cliente ou código sem precisar saber em que tela ele está.",
    },
    {
      alvo: '[data-tour="fab-guia"]',
      titulo: "E se a dúvida voltar",
      texto:
        "Este botão abre o guia da tela em que você estiver, e dá para refazer este tour por ele quando quiser.",
    },
  ],

  "/corretor/atendimento": [
    {
      alvo: '[data-tour="atendimento-inbox"]',
      titulo: "A fila de conversas",
      texto:
        "Todo mundo que está falando com você, com filtro por situação e busca por nome. O ponto colorido marca quem espera resposta.",
    },
    {
      alvo: '[data-tour="atendimento-ia"]',
      titulo: "O cliente chega já qualificado",
      texto:
        "O assistente de IA atende primeiro e só passa para você depois de descobrir o essencial: imóvel de interesse, orçamento, finalidade, forma de pagamento e urgência. Este resumo é dele. Você entra na conversa sabendo com quem está falando.",
    },
    {
      alvo: '[data-tour="atendimento-conversa"]',
      titulo: "A conversa continua de onde ela parou",
      texto:
        "Texto, áudio e envio de imóvel no mesmo lugar. Reunião gravada vira resumo automático, e os modelos resolvem o que se repete: primeiro contato, confirmação de visita.",
    },
    {
      alvo: '[data-tour="atendimento-etapa"]',
      titulo: "A etapa do funil se move sozinha",
      texto:
        "Repare no selo 'automático': conforme a conversa evolui, o cliente anda de etapa sem você arrastar card nenhum. Se discordar, é só clicar na etapa certa. O sistema aprende com a correção, não briga com ela.",
    },
    {
      alvo: '[data-tour="atendimento-acoes"]',
      titulo: "E o CRM se preenche enquanto você vende",
      texto:
        "Agendar visita, marcar reunião e gerar proposta em um clique, com os dados que a IA já levantou. A ideia é essa: o preenchimento é do sistema, seu tempo é para vender e captar imóvel.",
    },
    {
      alvo: '[data-tour="atendimento-ficha"]',
      titulo: "A ficha, sempre à vista",
      texto:
        "Quem é, o que procura, etiquetas e histórico: tudo montado pelo caminho. Nada aqui você precisou digitar.",
    },
  ],

  "/corretor/radar": [
    {
      alvo: '[data-tour="radar-abas"]',
      titulo: "O Radar é o contrário do funil",
      texto:
        "O funil cuida de quem já procurou você. O Radar procura imóvel para captar: Oportunidades (a lista de hoje), Mapa (onde elas se concentram), Avaliação (quanto vale) e Alertas (avisa quando algo muda).",
    },
    {
      alvo: '[data-tour="radar-lista"]',
      titulo: "Oportunidades encontradas para você",
      texto:
        "Cada card é um imóvel com sinal de que pode ir à venda: anúncio antigo, preço fora da curva, mudança na região. A IA cruza esses sinais todo dia e ordena pelos mais promissores.",
    },
    {
      alvo: '[data-tour="radar-creditos"]',
      titulo: "Por que tem crédito aqui",
      texto:
        "Ver a lista é livre; abrir os dados de contato do proprietário consome crédito, porque cada consulta dessas tem custo real. É o que evita gastar a captação com quem não vai atender.",
    },
  ],

  // O menu do CEO tem ~20 itens em 7 grupos. Explicar item a item viraria um
  // tour de 20 passos — pior que nenhum. O que a pessoa precisa pegar é a
  // LÓGICA dos grupos; de dentro de cada um os nomes se explicam.
  "/ceo/visao-geral": [
    {
      alvo: '[data-tour="ceo-menu"]',
      titulo: "Este painel é a operação inteira",
      texto:
        "Diferente do painel do corretor, que é o dia a dia de uma pessoa, aqui está a imobiliária toda. O menu é longo de propósito, mas ele é organizado em blocos, e é isso que vale entender.",
    },
    {
      alvo: '[data-tour="ceo-grupo-inicio"]',
      titulo: "Visão geral: por onde começar todo dia",
      texto:
        "O resumo da operação numa tela: o que entrou, o que fechou e o que precisa de atenção agora. Cada bloco leva para a tela detalhada.",
    },
    {
      alvo: '[data-tour="ceo-grupo-rede"]',
      titulo: "Rede: quem trabalha com você",
      texto:
        "Associados e franquias, os corretores da casa e a curadoria (a fila de imóveis que precisa de aprovação antes de sair com o nome da imobiliária).",
    },
    {
      alvo: '[data-tour="ceo-grupo-operacao"]',
      titulo: "Operação: o que está acontecendo agora",
      texto:
        "As filas de atendimento, os negócios em fechamento e os candidatos a corretor. É a parte que se olha quando alguma coisa travou.",
    },
    {
      alvo: '[data-tour="ceo-grupo-financeiro"]',
      titulo: "Financeiro: o dinheiro, do repasse à garantia",
      texto:
        "Caixa, cobranças e repasses, análise de crédito do inquilino, locação com garantia e os planos que a imobiliária assina. É o bloco que costuma viver fora do CRM, em planilha.",
    },
    {
      alvo: '[data-tour="ceo-grupo-crescimento"]',
      titulo: "Crescimento: de onde vem o próximo negócio",
      texto:
        "Leads e a distribuição deles entre corretores, o Radar de captação da rede, parcerias e o site da imobiliária. Aqui se decide onde investir atenção.",
    },
    {
      alvo: '[data-tour="ceo-grupo-configuracao"]',
      titulo: "Configuração: as regras da casa",
      texto:
        "Como o score dos corretores é calculado, quem tem acesso a quê, a parte técnica e o custo do sistema. Mexe-se pouco, mas é onde as regras vivem.",
    },
    {
      alvo: '[data-tour="fab-guia"]',
      titulo: "E se a dúvida voltar",
      texto:
        "Este botão abre o guia da tela em que você estiver, e dá para refazer este tour por ele quando quiser.",
    },
  ],

  // O painel de franquias é uma tela só, com âncoras — o menu rola até a seção.
  "/franqueado": [
    {
      alvo: '[data-tour="fq-menu"]',
      titulo: "Aqui é a sua unidade, não a rede inteira",
      texto:
        "O painel do CEO enxerga a operação toda; este é o recorte de uma franquia. O menu não troca de tela: ele rola até cada bloco desta página.",
    },
    {
      alvo: '[data-tour="fq-nav-visao"]',
      titulo: "Visão da unidade",
      texto:
        "Como a sua unidade está indo no mês: o que entrou, o que fechou e o que precisa de atenção.",
    },
    {
      alvo: '[data-tour="fq-nav-time"]',
      titulo: "Meu time",
      texto:
        "Quem está na unidade e como cada corretor vem performando. É por aqui que se percebe quem precisa de apoio.",
    },
    {
      alvo: '[data-tour="fq-nav-plano"]',
      titulo: "Plano & assentos",
      texto:
        "Assento é a vaga de corretor que a unidade pode ocupar. Contratar mais gente passa por aqui, e o custo aparece na hora.",
    },
    {
      alvo: '[data-tour="fq-nav-ranking"]',
      titulo: "Sua posição na rede",
      texto:
        "A comparação com as outras unidades. Serve menos para competir e mais para descobrir o que está funcionando em outra praça.",
    },
    {
      alvo: '[data-tour="fab-guia"]',
      titulo: "E se a dúvida voltar",
      texto:
        "Este botão abre o guia da tela, e dá para refazer este tour por ele quando quiser.",
    },
  ],

  "/demo/buscar": [
    {
      alvo: '[data-tour="busca-campo"]',
      titulo: "É por aqui que seu cliente procura",
      texto:
        "Cidade, bairro ou código do imóvel. Esta é a mesma busca que aparece no site público da sua imobiliária.",
    },
    {
      alvo: '[data-tour="busca-filtros"]',
      titulo: "Filtros avançados",
      texto:
        "Dormitórios, área, faixa de preço, se aceita financiamento. Quanto melhor o filtro, menos visita perdida.",
    },
    {
      alvo: '[data-tour="busca-resultados"]',
      titulo: "Os resultados",
      texto:
        "Cada card traz preço, localização e as medidas. O coração salva nos favoritos e o ícone ao lado põe o imóvel na comparação.",
    },
  ],
};

/** Tour da rota atual (correspondência exata — cada tela tem o seu). */
export function tourDaRota(pathname: string): PassoTour[] | null {
  return TOURS[pathname] ?? null;
}
