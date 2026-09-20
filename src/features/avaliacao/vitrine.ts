/**
 * Caso de uso: o que a vitrine pública mostra (O10·S1) — média, quantidade e
 * os comentários no ar. Sem HTTP; a rota `GET /api/avaliacoes` só faz o wiring
 * e o cache de borda.
 *
 * Minimização (LGPD art. 6º, III) construída em camadas, para vazar nome ser
 * difícil de propósito:
 * - o store já devolve SÓ as `publicado` **com texto** (nada de `pendente` nem
 *   de `recusado` chega aqui);
 * - o cadastro de quem escolheu `anonimo` nem é consultado — não há nome em
 *   memória para vazar por engano;
 * - `creci` só sai com a escolha `nome_creci`;
 * - o e-mail NUNCA sai, em escolha nenhuma.
 *
 * `media`/`quantas` já vêm SOMADAS: banco + as três avaliações que continuam
 * em `src/content/depoimentos.ts` (decisão F4). Quem exibe usa o número como
 * chega e nunca soma o arquivo de novo. `comentarios` é só do banco.
 */
import type { LeadStore } from "../../lib/leadStore";
import type { AvaliacaoStore } from "../../lib/avaliacaoStorePorta";
import { COMENTARIOS_NA_VITRINE, resumoDaContagem, type ResumoAvaliacoes } from "./avaliacao";
import { notasDoArquivo } from "./doArquivo";

export interface ComentarioPublico {
  id: string;
  estrelas: number;
  texto: string;
  /** Só com a escolha `nome` ou `nome_creci`. */
  nome?: string;
  /** Só com a escolha `nome_creci`. */
  creci?: string;
  /** ISO 8601 da avaliação. */
  em: string;
}

export interface VitrineAvaliacoes extends ResumoAvaliacoes {
  comentarios: ComentarioPublico[];
}

export interface DepsVitrine {
  avaliacoes: AvaliacaoStore;
  leads: LeadStore;
}

export async function vitrine(deps: DepsVitrine, limite = COMENTARIOS_NA_VITRINE): Promise<VitrineAvaliacoes> {
  const contagem = await deps.avaliacoes.resumoContagem();
  const publicadas = await deps.avaliacoes.listarPublicadas(limite);

  // só quem autorizou o nome tem o cadastro consultado
  const identificados = [...new Set(publicadas.filter((a) => a.identificacao !== "anonimo").map((a) => a.leadId))];
  const autores = new Map(
    (await Promise.all(identificados.map((id) => deps.leads.buscarPorId(id))))
      .filter((l): l is NonNullable<typeof l> => !!l)
      .map((l) => [l.id, l] as const),
  );

  const comentarios = publicadas
    // avaliação identificada cujo cadastro sumiu (excluído pela LGPD, base de
    // dev fora de sincronia) não vai ao ar: publicar texto de alguém que pediu
    // para ser apagado é justamente o que não pode acontecer
    .filter((a) => a.identificacao === "anonimo" || autores.has(a.leadId))
    .map((a) => {
      const autor = a.identificacao === "anonimo" ? undefined : autores.get(a.leadId);
      const nome = autor?.nome?.trim();
      const creci = a.identificacao === "nome_creci" ? autor?.creci?.trim() : undefined;
      return {
        id: a.id,
        estrelas: a.estrelas,
        texto: a.comentario ?? "",
        ...(nome ? { nome } : {}),
        ...(creci ? { creci } : {}),
        em: a.criadoEm,
      };
    });

  return { ...resumoDaContagem(contagem.soma, contagem.quantas, notasDoArquivo()), comentarios };
}
