/**
 * Caso de uso: gravar a avaliação de quem está com o demo liberado (O10·S1).
 * Sem HTTP — store, limitador e relógio injetados. A rota fina só faz o wiring.
 *
 * Ordem, do mais barato ao mais caro, e nada é gravado antes de passar:
 * 1. e-mail do cookie → lead. Sem lead (excluído pela LGPD, banco trocado) o
 *    cookie não vale mais: `sem_acesso`, que a rota devolve como 401;
 * 2. limite de 5 envios / 30 min POR LEAD (a chave é o id, nunca o e-mail);
 * 3. quem pediu para aparecer com nome precisa ter nome no cadastro (lead
 *    anterior à O9 não tem) → `sem_nome`, e a tela cai para anônimo;
 * 4. filtro automático do texto → `publicado` ou `pendente` (a NOTA entra na
 *    hora nos dois casos);
 * 5. grava (upsert por lead) e devolve o resumo já com a avaliação nova dentro.
 */
import type { LeadStore } from "../../lib/leadStore";
import type { AvaliacaoStore, DadosAvaliacao } from "../../lib/avaliacaoStorePorta";
import type { RateLimiter, RegraRate } from "../../lib/ratelimit";
import type { Avaliacao, StatusAvaliacao } from "./avaliacao";
import { resumoDaContagem, type ResumoAvaliacoes } from "./avaliacao";
import { textoConsentimentoAvaliacao } from "./consentimento";
import { notasDoArquivo } from "./doArquivo";
import { filtrarComentario } from "./filtroComentario";
import type { AvaliacaoInput } from "./schema";

/** 5 envios / 30 min por lead: dá para corrigir a nota e o texto, não para inundar. */
export const REGRA_AVALIACAO: RegraRate = { max: 5, janelaMs: 30 * 60_000 };

export interface DepsAvaliar {
  avaliacoes: AvaliacaoStore;
  leads: LeadStore;
  limiter: RateLimiter;
  /** Relógio injetável (testes). Default: agora. */
  agora?: Date;
}

export type ResultadoAvaliar =
  | {
      status: "ok";
      avaliacao: Avaliacao;
      resumo: ResumoAvaliacoes;
      /** Primeira avaliação deste lead (a edição de uma que já existia é `false`). */
      novo: boolean;
      /** Situação anterior do texto, quando já havia avaliação. */
      statusAnterior?: StatusAvaliacao;
    }
  /** O cookie é válido, mas o lead não existe mais — a rota responde 401. */
  | { status: "sem_acesso" }
  /** Pediu `nome`/`nome_creci` e o cadastro não tem nome — a rota responde 409. */
  | { status: "sem_nome" }
  | { status: "limitado" };

export async function avaliar(
  deps: DepsAvaliar,
  entrada: AvaliacaoInput,
  ctx: { email: string; ip: string },
): Promise<ResultadoAvaliar> {
  const agora = deps.agora ?? new Date();

  const lead = await deps.leads.buscarPorEmail(ctx.email);
  if (!lead) return { status: "sem_acesso" };

  if (!(await deps.limiter.permitir([`avaliacao:lead:${lead.id}`], REGRA_AVALIACAO, agora))) {
    return { status: "limitado" };
  }

  // publicar nome sem o cadastro ter nome viraria "avaliação de ninguém"
  if (entrada.identificacao !== "anonimo" && !lead.nome?.trim()) return { status: "sem_nome" };

  const anterior = await deps.avaliacoes.doLead(lead.id);
  const filtro = filtrarComentario(entrada.comentario);

  const dados: DadosAvaliacao = {
    estrelas: entrada.estrelas,
    ...(entrada.comentario ? { comentario: entrada.comentario } : {}),
    identificacao: entrada.identificacao,
    status: filtro.status,
    consentimento: {
      texto: textoConsentimentoAvaliacao(entrada.identificacao),
      em: agora.toISOString(),
      ip: ctx.ip,
    },
    em: agora.toISOString(),
  };

  const avaliacao = await deps.avaliacoes.salvar(lead.id, dados);
  const contagem = await deps.avaliacoes.resumoContagem();

  return {
    status: "ok",
    avaliacao,
    // o mesmo número que a landing mostra: banco + as três do arquivo (F4)
    resumo: resumoDaContagem(contagem.soma, contagem.quantas, notasDoArquivo()),
    novo: !anterior,
    ...(anterior ? { statusAnterior: anterior.status } : {}),
  };
}
