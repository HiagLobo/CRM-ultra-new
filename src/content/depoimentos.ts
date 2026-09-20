/**
 * Depoimentos publicados na landing (seção "Por que confiar").
 *
 * REGRA: só entra aqui quem autorizou, e a autorização fica registrada (data e
 * canal). O teste `depoimentos.test.ts` barra qualquer entrada sem nome, sem
 * local ou sem autorização, e barra texto com contato pessoal dentro.
 *
 * Estas pessoas TESTARAM A DEMONSTRAÇÃO; nenhuma é cliente pagante. O rótulo da
 * seção diz isso, porque chamar de cliente quem ainda não é seria propaganda
 * enganosa (CDC art. 37).
 *
 * A grafia do que a pessoa escreveu é corrigida (acento, pontuação, digitação),
 * sem trocar palavras nem mudar o sentido.
 */

/** Como a pessoa se apresenta no mercado. */
export type PapelDepoimento = "Corretor" | "Corretora" | "Imobiliária";

/** O que a pessoa fez com o produto. Só a demonstração, enquanto não houver cliente pagante. */
export type ContextoDepoimento = "testou a demonstração";

/**
 * Nota que a pessoa DEU, com o registro de quando e onde. Estrela sem isto é
 * nota inventada (propaganda enganosa, CDC art. 37) e o teste reprova.
 */
export interface AvaliacaoDepoimento {
  /** De 1 a 5, inteira, exatamente como a pessoa respondeu. */
  estrelas: 1 | 2 | 3 | 4 | 5;
  em: string;
  canal: "WhatsApp" | "e-mail" | "presencial";
}

export interface Depoimento {
  /** Identificador curto e estável (usado como chave da lista). */
  id: string;
  /** O que a pessoa disse, entre aspas na tela. */
  texto: string;
  /** Como assina: primeiro nome, ou nome e inicial do sobrenome. */
  nome: string;
  papel: PapelDepoimento;
  /** Cidade ou estado onde atua. */
  local: string;
  contexto: ContextoDepoimento;
  /** Prova de que pode ser publicado. Sem isto, o teste reprova. */
  autorizacao: { em: string; canal: "WhatsApp" | "e-mail" | "presencial" };
  /** A nota, quando a pessoa deu uma. Quem não deu não mostra estrela. */
  avaliacao?: AvaliacaoDepoimento;
}

const AUTORIZADO_EM_19_09 = { em: "2026-09-19", canal: "WhatsApp" } as const;

/** Nota dada no mesmo dia, respondendo "de 1 a 5, que nota você dá?" no WhatsApp. */
const notaEm19_09 = (estrelas: AvaliacaoDepoimento["estrelas"]): AvaliacaoDepoimento => ({
  estrelas,
  ...AUTORIZADO_EM_19_09,
});

export const DEPOIMENTOS: readonly Depoimento[] = [
  {
    id: "rodrigo-recife",
    texto:
      "Tive acesso à versão demo e fiquei impressionado com a tecnologia e a praticidade que o sistema traz.",
    nome: "Rodrigo",
    papel: "Corretor",
    local: "Recife",
    contexto: "testou a demonstração",
    autorizacao: AUTORIZADO_EM_19_09,
    avaliacao: notaEm19_09(5),
  },
  {
    id: "daniela-sao-paulo",
    texto:
      "Através do sistema, realmente vou ter mais tempo para realizar o trabalho, em vez de criar relatórios sobre cada atendimento!",
    nome: "Daniela",
    papel: "Corretora",
    local: "São Paulo",
    contexto: "testou a demonstração",
    autorizacao: AUTORIZADO_EM_19_09,
    avaliacao: notaEm19_09(5),
  },
  {
    id: "jorge-goias",
    texto: "Estou impressionado com a tecnologia!",
    nome: "Jorge",
    papel: "Corretor",
    local: "Goiás",
    contexto: "testou a demonstração",
    autorizacao: AUTORIZADO_EM_19_09,
    avaliacao: notaEm19_09(4),
  },
];

/**
 * Média das notas dadas, calculada na hora (nunca um número escrito à mão) e
 * arredondada em uma casa. `null` enquanto ninguém tiver avaliado.
 */
export function mediaDasNotas(lista: readonly Depoimento[] = DEPOIMENTOS): { media: number; quantas: number } | null {
  const notas = lista.map((d) => d.avaliacao?.estrelas).filter((n): n is NonNullable<typeof n> => n !== undefined);
  if (notas.length === 0) return null;
  const soma = notas.reduce((t, n) => t + n, 0);
  return { media: Math.round((soma / notas.length) * 10) / 10, quantas: notas.length };
}

/** "4,7 de 5" com a vírgula decimal do português. */
export function notaEmTexto(media: number): string {
  return `${media.toFixed(1).replace(".", ",")} de 5`;
}

/** Como a assinatura aparece na tela: "Rodrigo, corretor em Recife". */
export function assinatura(d: Depoimento): string {
  const papel = d.papel === "Imobiliária" ? "imobiliária" : d.papel.toLowerCase();
  return `${d.nome}, ${papel} em ${d.local}`;
}
