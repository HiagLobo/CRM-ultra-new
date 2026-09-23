/**
 * Tabela oficial de preços do CRM Ultra (O11) — a ÚNICA fonte de número do
 * orçamento. Nenhuma tela, rota ou documento escreve preço: tudo sai daqui.
 * Mudou aqui, muda no orçamento novo; o já emitido guarda os valores do dia
 * (o registro grava itens e totais).
 *
 * Tudo em **centavos inteiros**. Dinheiro em ponto flutuante vira
 * R$ 1.784,999 mais cedo ou mais tarde — aqui nem existe a chance.
 *
 * Os valores já são os do 00-PLANO (decisão F3: a tabela nasceu ancorada 20%
 * acima da recomendada, com os mesmos pisos). O cálculo NÃO multiplica nada por
 * 1,2: ancorar de novo dobraria a âncora.
 *
 * CLIENT-SAFE (sem fs, sem crypto, sem env): o formulário do painel calcula ao
 * vivo com a mesma tabela que o servidor usa para gravar.
 */

/** Público do orçamento: define o mínimo faturável e a implantação. */
export const PUBLICOS = ["autonomo", "imobiliaria", "rede"] as const;
export type PublicoOrcamento = (typeof PUBLICOS)[number];

/** Nível do assento. É POR ASSENTO: a mesma conta mistura Pro e Ultra. */
export const NIVEIS = ["pro", "ultra"] as const;
export type NivelAssento = (typeof NIVEIS)[number];

export const ROTULO_PUBLICO: Record<PublicoOrcamento, string> = {
  autonomo: "Corretor autônomo",
  imobiliaria: "Imobiliária",
  rede: "Rede de franquias",
};

export const ROTULO_NIVEL: Record<NivelAssento, string> = { pro: "Pro", ultra: "Ultra" };

/** Uma faixa da escada marginal: da posição `de` até `ate` (null = daí em diante). */
export interface FaixaAssento {
  de: number;
  ate: number | null;
  rotulo: string;
  /** Preço do assento Pro nesta faixa, em centavos. */
  pro: number;
  /** Preço do assento Ultra nesta faixa, em centavos. */
  ultra: number;
}

/**
 * Escada marginal por assento, como imposto de renda: cada assento entra pelo
 * preço da faixa DELE. Com 8 assentos são 2 na primeira faixa e 6 na segunda,
 * nunca 8 na segunda.
 */
export const FAIXAS: readonly FaixaAssento[] = [
  { de: 1, ate: 2, rotulo: "1º e 2º assento", pro: 17_900, ultra: 29_900 },
  { de: 3, ate: 9, rotulo: "3º ao 9º assento", pro: 13_900, ultra: 22_900 },
  { de: 10, ate: 29, rotulo: "10º ao 29º assento", pro: 11_900, ultra: 18_900 },
  { de: 30, ate: 99, rotulo: "30º ao 99º assento", pro: 10_500, ultra: 16_500 },
  { de: 100, ate: null, rotulo: "100º assento em diante", pro: 9_500, ultra: 14_900 },
];

/**
 * Piso do preço EFETIVO por assento (depois do desconto). Abaixo disso o
 * servidor recusa, não avisa: é trava, não conselho.
 */
export const PISOS: Record<NivelAssento, number> = { pro: 8_500, ultra: 10_900 };

/** A partir daqui o painel avisa (amarelo). O bloqueio é o piso, não este número. */
export const DESCONTO_QUE_AVISA = 15;

/** Mínimo faturável de assentos. Na rede é por unidade ativa. */
export const MINIMO_FATURAVEL: Record<PublicoOrcamento, number> = { autonomo: 1, imobiliaria: 3, rede: 5 };

/** Anual: 12 meses pelo preço de 10 (16,67%), com implantação isenta. */
export const MESES_PAGOS_NO_ANUAL = 10;
export const MESES_DO_ANO = 12;

/** Validade padrão da proposta, em dias. */
export const VALIDADE_PADRAO_DIAS = 15;

/** Nome da implantação no documento (o que o cliente lê). */
export const NOME_IMPLANTACAO = "Personalização, migração de carteira e treinamento";

/**
 * Quanto da implantação entra na assinatura (o resto fica para a conclusão).
 * Decisão do fundador em 2026-09-20: a implantação é personalização do software
 * para aquela empresa, então parte é paga na entrada. Editável por orçamento.
 * NÃO é diluída em 12 meses e NÃO volta se o cliente sair: o serviço foi feito.
 */
export const ENTRADA_PADRAO_PCT = 50;
/** Limites da entrada no orçamento (nunca 0%: alguma entrada sempre há). */
export const ENTRADA_MIN_PCT = 10;
export const ENTRADA_MAX_PCT = 100;

/** Faixa de implantação da imobiliária, por quantidade de assentos. */
export interface FaixaImplantacao {
  ate: number | null;
  centavos: number;
  rotulo: string;
}

/**
 * Implantação, paga em duas partes (entrada na assinatura + saldo na conclusão).
 * Autônomo não paga. Imobiliária: duas faixas. Rede: matriz + cada unidade.
 *
 * Interpretação (o 00-PLANO só escreve "de 10 a 49"): de 10 assentos em diante
 * vale a mesma faixa, porque imobiliária com 50 assentos é rede na prática e
 * inventar uma faixa a mais seria escrever preço fora da decisão do fundador.
 */
export const IMPLANTACAO: {
  autonomo: number;
  imobiliaria: readonly FaixaImplantacao[];
  rede: { matriz: number; porUnidade: number };
} = {
  autonomo: 0,
  imobiliaria: [
    { ate: 9, centavos: 179_000, rotulo: "até 9 assentos" },
    { ate: null, centavos: 299_000, rotulo: "de 10 assentos em diante" },
  ],
  rede: { matriz: 1_190_000, porUnidade: 99_000 },
};

/** Franquias de uso inclusas, por assento/mês (salvo indicação). */
export interface FranquiasDeUso {
  /** Atendimentos de IA por assento/mês. */
  iaPorAssento: number;
  /** Reuniões transcritas por assento/mês. */
  reunioesPorAssento: number;
  /** Consultas de Radar por assento/mês (só Ultra). */
  radarPorAssentoUltra: number;
  /** Baixas automáticas por conta/mês (só Ultra). */
  baixasPorConta: number;
}

export const FRANQUIAS: FranquiasDeUso = {
  iaPorAssento: 25,
  reunioesPorAssento: 2,
  radarPorAssentoUltra: 8,
  baixasPorConta: 300,
};

/** Entra todo mês na fatura, ou é cobrança única no go live. */
export const RECORRENCIAS = ["mensal", "unica"] as const;
export type Recorrencia = (typeof RECORRENCIAS)[number];

export const CODIGOS_EXTRA = [
  "ia_excedente",
  "reuniao_excedente",
  "radar_avulso",
  "radar_pacote_50",
  "radar_pacote_250",
  "radar_em_pro",
  "analise_credito",
  "baixa_excedente",
  "migracao_lote",
  "turma_treinamento",
  "whatsapp_adicional",
  "suporte_sincrono",
] as const;
export type CodigoExtra = (typeof CODIGOS_EXTRA)[number];

export interface Extra {
  codigo: CodigoExtra;
  /** O que o cliente lê no documento. */
  nome: string;
  centavos: number;
  recorrencia: Recorrencia;
}

/**
 * Extras e repasses, sempre com preço fechado em reais: "repasse de custo" põe
 * o custo do fornecedor no contrato e obriga a explicar reajuste dele.
 * O que é consumo (IA, reunião, Radar, baixa, bureau) entra como mensal: é
 * medido e faturado no mês. Pacote e serviço de projeto entram como única.
 */
export const EXTRAS: readonly Extra[] = [
  { codigo: "ia_excedente", nome: "Atendimento de IA acima da franquia", centavos: 150, recorrencia: "mensal" },
  { codigo: "reuniao_excedente", nome: "Reunião transcrita acima da franquia", centavos: 490, recorrencia: "mensal" },
  { codigo: "radar_avulso", nome: "Consulta de Radar avulsa", centavos: 290, recorrencia: "mensal" },
  { codigo: "radar_pacote_50", nome: "Pacote de 50 consultas de Radar", centavos: 11_900, recorrencia: "unica" },
  { codigo: "radar_pacote_250", nome: "Pacote de 250 consultas de Radar", centavos: 49_700, recorrencia: "unica" },
  { codigo: "radar_em_pro", nome: "Radar avulso numa conta Pro (por assento/mês)", centavos: 9_900, recorrencia: "mensal" },
  { codigo: "analise_credito", nome: "Análise de crédito com bureau", centavos: 8_900, recorrencia: "mensal" },
  { codigo: "baixa_excedente", nome: "Baixa automática acima de 300 na conta", centavos: 90, recorrencia: "mensal" },
  { codigo: "migracao_lote", nome: "Migração de lote extra", centavos: 129_000, recorrencia: "unica" },
  { codigo: "turma_treinamento", nome: "Turma extra de treinamento", centavos: 69_000, recorrencia: "unica" },
  { codigo: "whatsapp_adicional", nome: "Número de WhatsApp oficial adicional", centavos: 14_900, recorrencia: "mensal" },
  { codigo: "suporte_sincrono", nome: "Suporte síncrono, 2 h por mês", centavos: 29_000, recorrencia: "mensal" },
];

/** O extra daquele código, ou `undefined` (código de versão futura). */
export function extraPorCodigo(codigo: string): Extra | undefined {
  return EXTRAS.find((e) => e.codigo === codigo);
}

/** O que cada nível entrega, em lista curta (o documento imprime esta lista). */
export const INCLUSOS: Record<NivelAssento, readonly string[]> = {
  pro: [
    "Funil, atendimento e agenda do corretor",
    "Carteira de imóveis e controle de comissões",
    "Publicação do imóvel nos principais portais do mercado",
    `${FRANQUIAS.iaPorAssento} atendimentos de IA por assento/mês`,
    `${FRANQUIAS.reunioesPorAssento} reuniões transcritas por assento/mês`,
  ],
  ultra: [
    "Tudo do nível Pro",
    `Radar com ${FRANQUIAS.radarPorAssentoUltra} consultas por assento/mês`,
    `${FRANQUIAS.baixasPorConta} baixas automáticas por conta/mês`,
    "Relatórios por unidade e visão da rede",
  ],
};

/**
 * Condição de fundador (10 primeiros contratos), marcável no orçamento. O que
 * a empresa dá e o que pede em troca vão escritos na proposta: vantagem sem
 * contrapartida escrita vira promessa solta.
 */
export const CONDICAO_FUNDADOR = {
  titulo: "Condição de fundador",
  vagas: 10,
  oferecemos: [
    "Preço congelado por 24 meses",
    "Pagamento começa no go live",
    "Implantação isenta",
    "Ultra pelo preço do Pro por 12 meses",
    "Saída sem multa nos nossos primeiros 90 dias",
  ],
  emTroca: [
    "12 meses contados do go live",
    "Uso do case e um depoimento",
    "Uma conversa de feedback por mês",
    "Uma visita de referência",
  ],
} as const;

/**
 * A tabela inteira num objeto só: é o que o cálculo recebe. Tudo `readonly` de
 * propósito — quem quiser simular outro preço (teste, estudo) passa uma CÓPIA,
 * e o singleton `TABELA` nunca é remendado em tempo de execução.
 */
export interface TabelaPrecos {
  readonly faixas: readonly FaixaAssento[];
  readonly pisos: Readonly<Record<NivelAssento, number>>;
  readonly minimoFaturavel: Readonly<Record<PublicoOrcamento, number>>;
  readonly implantacao: {
    readonly autonomo: number;
    readonly imobiliaria: readonly FaixaImplantacao[];
    readonly rede: { readonly matriz: number; readonly porUnidade: number };
  };
  readonly extras: readonly Extra[];
  /** Entram no orçamento como TEXTO do dia (o documento guarda o que prometeu). */
  readonly inclusos: Readonly<Record<NivelAssento, readonly string[]>>;
  readonly franquias: Readonly<FranquiasDeUso>;
  readonly entradaPadraoPct: number;
  readonly mesesPagosNoAnual: number;
  readonly mesesDoAno: number;
}

export const TABELA: TabelaPrecos = {
  faixas: FAIXAS,
  pisos: PISOS,
  minimoFaturavel: MINIMO_FATURAVEL,
  implantacao: IMPLANTACAO,
  extras: EXTRAS,
  inclusos: INCLUSOS,
  franquias: FRANQUIAS,
  entradaPadraoPct: ENTRADA_PADRAO_PCT,
  mesesPagosNoAnual: MESES_PAGOS_NO_ANUAL,
  mesesDoAno: MESES_DO_ANO,
};
