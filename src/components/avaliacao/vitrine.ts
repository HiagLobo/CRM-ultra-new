/**
 * Vitrine da landing: junta os depoimentos do arquivo (F4 — os três que já
 * estavam publicados, com autorização registrada) com o que o banco devolver.
 *
 * Contrato da O10: `media` e `quantas` do `GET /api/avaliacoes` **já somam o
 * arquivo e o banco** — o cliente usa o número do servidor como veio, nunca
 * soma de novo (isso contaria os três do arquivo duas vezes). `comentarios`
 * traz só o que está no banco, então entra depois dos do arquivo.
 *
 * Sem resposta da API (rede fora, servidor fora, corpo estranho), fica exatamente
 * o que a página já mostrava antes da O10: os três do arquivo e a média deles.
 */
import { DEPOIMENTOS, assinatura, mediaDasNotas, type Depoimento } from "@/content/depoimentos";
import type { Resumo, VitrineDaApi } from "./api";

/** Teto do contrato ("no máximo 12"); o cliente reforça para não confiar só no servidor. */
export const MAX_COMENTARIOS = 12;

/** Como a avaliação anônima assina — honesto e sem inventar pessoa. */
export const ASSINATURA_ANONIMA = "Avaliação anônima de quem testou a demonstração";

export interface CartaoVitrine {
  /** Chave de lista; o prefixo evita colisão entre o id do arquivo e o do banco. */
  chave: string;
  texto: string;
  /** Nota de quem escreveu; `null` só para depoimento antigo sem nota registrada. */
  estrelas: number | null;
  assinatura: string;
}

export interface Vitrine {
  /** Média e contagem para o alto da seção; `null` quando ninguém avaliou. */
  resumo: Resumo | null;
  cartoes: CartaoVitrine[];
  /** A vitrine já recebeu o que veio do banco? (a página não mostra erro se não) */
  comBanco: boolean;
}

function doArquivo(d: Depoimento): CartaoVitrine {
  return {
    chave: `arquivo-${d.id}`,
    texto: d.texto,
    estrelas: d.avaliacao?.estrelas ?? null,
    assinatura: assinatura(d),
  };
}

/** "Ana · CRECI PE 12345", "Ana" ou anônimo — só o que a pessoa autorizou (F3). */
export function assinaturaDoBanco(nome?: string, creci?: string): string {
  if (!nome) return ASSINATURA_ANONIMA;
  return creci ? `${nome} · CRECI ${creci}` : nome;
}

/**
 * Monta a seção. `dados` é o corpo já lido do `GET /api/avaliacoes`, ou `null`
 * quando a chamada falhou — e aí a página segue só com o arquivo.
 */
export function montarVitrine(
  dados: VitrineDaApi | null,
  depoimentos: readonly Depoimento[] = DEPOIMENTOS,
): Vitrine {
  const doArquivoTodos = depoimentos.map(doArquivo);
  if (!dados) {
    return { resumo: mediaDasNotas(depoimentos), cartoes: doArquivoTodos, comBanco: false };
  }

  const doBanco = dados.comentarios.slice(0, MAX_COMENTARIOS).map((c) => ({
    chave: `banco-${c.id}`,
    texto: c.texto,
    estrelas: c.estrelas,
    assinatura: assinaturaDoBanco(c.nome, c.creci),
  }));

  return {
    // o servidor já somou arquivo + banco; quantas = 0 é "ninguém avaliou"
    resumo: dados.quantas > 0 ? { media: dados.media, quantas: dados.quantas } : mediaDasNotas(depoimentos),
    cartoes: [...doArquivoTodos, ...doBanco],
    comBanco: true,
  };
}
