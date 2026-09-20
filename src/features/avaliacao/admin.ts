/**
 * Casos de uso do painel de avaliações (sem HTTP): o que o fundador vê e a
 * moderação em um clique. As rotas `/api/admin/avaliacoes` só fazem authz + wiring.
 *
 * Aqui o painel vê TUDO, inclusive de quem é a avaliação — é a tela atrás de
 * senha onde ele confere. O que não sai daqui: o texto do consentimento e o IP
 * (ficam no banco, que é onde servem) e nada disso entra em log ou auditoria.
 */
import type { LeadStore } from "../../lib/leadStore";
import type { AvaliacaoStore } from "../../lib/avaliacaoStorePorta";
import type { Avaliacao, Identificacao, StatusAvaliacao, StatusModeravel } from "./avaliacao";
import { resumoDaContagem, type ResumoAvaliacoes } from "./avaliacao";
import { notasDoArquivo } from "./doArquivo";
import { filtrarComentario, type MotivoPendente } from "./filtroComentario";

/** Uma linha da lista do painel. */
export interface AvaliacaoAdmin {
  id: string;
  leadId: string;
  estrelas: number;
  comentario?: string;
  identificacao: Identificacao;
  status: StatusAvaliacao;
  /**
   * Por que o filtro automático segurou. Recalculado do texto na leitura: a
   * migração 006 não guarda o motivo, e guardar um rótulo velho seria pior que
   * recalcular com a regra em vigor.
   */
  motivo?: MotivoPendente;
  criadoEm: string;
  atualizadoEm: string;
  /** De quem é (o painel abre a ficha pelo `leadId`). */
  autor: { nome?: string; email?: string; creci?: string };
}

/** Projeção campo a campo, como no `paraLeadAdmin`: campo novo não vaza por esquecimento. */
export function paraAvaliacaoAdmin(a: Avaliacao, autor: { nome?: string; email?: string; creci?: string }): AvaliacaoAdmin {
  const filtro = a.status === "pendente" ? filtrarComentario(a.comentario) : undefined;
  return {
    id: a.id,
    leadId: a.leadId,
    estrelas: a.estrelas,
    comentario: a.comentario,
    identificacao: a.identificacao,
    status: a.status,
    ...(filtro?.status === "pendente" ? { motivo: filtro.motivo } : {}),
    criadoEm: a.criadoEm,
    atualizadoEm: a.atualizadoEm,
    autor,
  };
}

export interface ListaAvaliacoesAdmin {
  resumo: ResumoAvaliacoes;
  avaliacoes: AvaliacaoAdmin[];
}

/**
 * Lista do painel (da mais recente para a mais antiga) + o MESMO resumo que o
 * site mostra (banco + as três do arquivo, F4): o cartão do topo do `/admin` e
 * a landing não podem divergir.
 */
export async function listarParaAdmin(
  avaliacoes: AvaliacaoStore,
  leads: LeadStore,
): Promise<ListaAvaliacoesAdmin> {
  const todas = await avaliacoes.listarTodas();
  const porId = new Map((await leads.listar()).map((l) => [l.id, l] as const));
  const contagem = await avaliacoes.resumoContagem();
  return {
    resumo: resumoDaContagem(contagem.soma, contagem.quantas, notasDoArquivo()),
    avaliacoes: todas.map((a) => {
      const lead = porId.get(a.leadId);
      return paraAvaliacaoAdmin(a, { nome: lead?.nome, email: lead?.email, creci: lead?.creci || undefined });
    }),
  };
}

export type ResultadoModeracao =
  | {
      status: "ok";
      avaliacao: AvaliacaoAdmin;
      /** Só ids e códigos — nunca o texto nem quem escreveu. */
      auditoria: { acao: "avaliacao.status"; dados: { id: string; de: StatusAvaliacao; para: StatusAvaliacao } };
    }
  | { status: "nao_encontrada" };

/**
 * Tira do site ou põe de volta. NÃO apaga o registro: a nota continua contando
 * na média (decisão do fundador), só o texto some da vitrine.
 */
export async function moderar(
  store: AvaliacaoStore,
  id: string,
  status: StatusModeravel,
  agora: Date = new Date(),
): Promise<ResultadoModeracao> {
  const troca = await store.trocarStatus(id, status, agora.toISOString());
  if (!troca) return { status: "nao_encontrada" };
  return {
    status: "ok",
    // a lista recarrega com o autor; aqui o retorno é só a linha alterada
    avaliacao: paraAvaliacaoAdmin(troca.avaliacao, {}),
    auditoria: { acao: "avaliacao.status", dados: { id, de: troca.anterior, para: status } },
  };
}
