/**
 * Domínio da avaliação com estrelas do demo (O10) — tipos e funções puras.
 *
 * CLIENT-SAFE de propósito (sem crypto, sem fs, sem env): a tela do convite
 * mostra EXATAMENTE o texto de consentimento que fica gravado no registro, e a
 * vitrine da landing soma o mesmo resumo que a API devolve.
 *
 * Quem avalia é sempre um lead com o demo liberado (o cookie `crm_demo` carrega
 * o e-mail já verificado), então a avaliação mora presa ao lead — nome e CRECI
 * vêm de lá, nunca de um formulário novo.
 */

/** Como a pessoa escolheu aparecer no site. */
export const IDENTIFICACOES = ["nome_creci", "nome", "anonimo"] as const;
export type Identificacao = (typeof IDENTIFICACOES)[number];

/**
 * Situação do TEXTO no site. A nota conta nos três: `recusado` é o fundador
 * tirando o comentário do ar, não apagando a avaliação.
 */
export const STATUS_AVALIACAO = ["publicado", "pendente", "recusado"] as const;
export type StatusAvaliacao = (typeof STATUS_AVALIACAO)[number];

/**
 * O que o fundador escolhe no painel: pôr no ar ou tirar do ar. `pendente` é
 * decisão do filtro automático, nunca de um clique — por isso fica de fora.
 */
export const STATUS_MODERAVEL = ["publicado", "recusado"] as const;
export type StatusModeravel = (typeof STATUS_MODERAVEL)[number];

/** Carimbo do consentimento da publicação (LGPD): o texto exibido + quando + de onde. */
export interface ConsentimentoAvaliacao {
  texto: string;
  /** ISO 8601. */
  em: string;
  ip: string;
}

export interface Avaliacao {
  id: string;
  leadId: string;
  /** Inteiro de 1 a 5 — a nota que a pessoa deu, sem filtro nem arredondamento. */
  estrelas: number;
  /** Ausente quando a pessoa só deu a nota. */
  comentario?: string;
  identificacao: Identificacao;
  status: StatusAvaliacao;
  consentimento: ConsentimentoAvaliacao;
  criadoEm: string;
  atualizadoEm: string;
}

/**
 * Valor de `identificacao` vindo do banco. Desconhecido (linha mexida à mão,
 * versão futura) → `anonimo`: na dúvida, NÃO publica o nome de ninguém.
 */
export function normalizarIdentificacao(valor: unknown): Identificacao {
  return IDENTIFICACOES.find((i) => i === valor) ?? "anonimo";
}

/**
 * Valor de `status` vindo do banco. Desconhecido → `pendente`: na dúvida, o
 * texto fica fora do ar até o fundador olhar.
 */
export function normalizarStatusAvaliacao(valor: unknown): StatusAvaliacao {
  return STATUS_AVALIACAO.find((s) => s === valor) ?? "pendente";
}

/** Nota máxima — o mesmo número na tela, na API e no banco (CHECK da 006). */
export const ESTRELAS_MAX = 5;
/** Tamanho máximo do comentário (o mesmo do Zod e da regra "texto gigante"). */
export const COMENTARIO_MAX = 400;
/** Quantos comentários a vitrine pública mostra, no máximo. */
export const COMENTARIOS_NA_VITRINE = 12;

// O texto do consentimento (o que a tela mostra e o banco guarda) mora em
// `consentimento.ts` — fonte única das três frases, dividida com a trilha da
// tela para as palavras nunca divergirem. Este módulo fica só com os tipos.

export interface ResumoAvaliacoes {
  /** Média das notas, com 1 casa decimal. Sem avaliação nenhuma: 0. */
  media: number;
  quantas: number;
}

/** Só a nota importa para o resumo — de onde ela veio (banco ou arquivo), não. */
type ComNota = { estrelas: number };

/**
 * Média (1 casa) e contagem de TODAS as avaliações válidas — inclusive a
 * anônima, a `pendente` e a `recusado`: o que o fundador tira do ar é o texto,
 * nunca a nota que a pessoa deu.
 *
 * `doArquivo` existe para a landing somar as três avaliações que continuam em
 * `src/content/depoimentos.ts` (decisão F4). A API NÃO soma esse arquivo — ela
 * devolve só o que está no banco, e quem exibe soma as duas fontes.
 */
export function resumo(avaliacoes: ReadonlyArray<ComNota>, doArquivo: ReadonlyArray<ComNota> = []): ResumoAvaliacoes {
  const todas = [...avaliacoes, ...doArquivo];
  if (todas.length === 0) return { media: 0, quantas: 0 };
  const soma = todas.reduce((total, a) => total + a.estrelas, 0);
  return { media: Math.round((soma / todas.length) * 10) / 10, quantas: todas.length };
}

/**
 * Mesmo resumo a partir da contagem que o banco devolve (`SELECT count, sum`),
 * sem trazer todas as linhas para a memória só para somar.
 */
export function resumoDaContagem(soma: number, quantas: number, doArquivo: ReadonlyArray<ComNota> = []): ResumoAvaliacoes {
  const total = quantas + doArquivo.length;
  if (total === 0) return { media: 0, quantas: 0 };
  const somaTotal = soma + doArquivo.reduce((t, a) => t + a.estrelas, 0);
  return { media: Math.round((somaTotal / total) * 10) / 10, quantas: total };
}
