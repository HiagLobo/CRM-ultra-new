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
}

const AUTORIZADO_EM_19_09 = { em: "2026-09-19", canal: "WhatsApp" } as const;

export const DEPOIMENTOS: readonly Depoimento[] = [
  {
    id: "ricardo-recife",
    texto:
      "Tive acesso à versão demo e fiquei impressionado com a tecnologia e a praticidade que o sistema traz.",
    nome: "Ricardo",
    papel: "Corretor",
    local: "Recife",
    contexto: "testou a demonstração",
    autorizacao: AUTORIZADO_EM_19_09,
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
  },
  {
    id: "jorge-goias",
    texto: "Estou impressionado com a tecnologia!",
    nome: "Jorge",
    papel: "Corretor",
    local: "Goiás",
    contexto: "testou a demonstração",
    autorizacao: AUTORIZADO_EM_19_09,
  },
];

/** Como a assinatura aparece na tela: "Ricardo, corretor em Recife". */
export function assinatura(d: Depoimento): string {
  const papel = d.papel === "Imobiliária" ? "imobiliária" : d.papel.toLowerCase();
  return `${d.nome}, ${papel} em ${d.local}`;
}
