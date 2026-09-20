/**
 * Cliente das rotas de avaliação (contrato da O10 — a trilha A constrói o
 * servidor). É a única parte da avaliação que fala HTTP: traduz cada resposta
 * num estado fechado, para a tela só escolher o que mostrar.
 *
 * Regra: PII (nome, CRECI, comentário) NUNCA vai para o console — nem em erro.
 * Resposta estranha nunca vira exceção: vira estado com mensagem na tela.
 */
import { postar } from "@/components/acesso/api";
import type { Identificacao } from "./identificacao";

/** Limite do comentário, igual ao do contrato (`comentario?: string(≤400)`). */
export const MAX_COMENTARIO = 400;

/** Média e contagem somando o arquivo e o banco — quem soma é o servidor. */
export interface Resumo {
  media: number;
  quantas: number;
}

/** Comentário já publicado, como o `GET /api/avaliacoes` devolve. */
export interface ComentarioPublicado {
  id: string;
  estrelas: number;
  texto: string;
  /** Só vem quando a pessoa autorizou (`nome` ou `nome_creci`). */
  nome?: string;
  /** Só vem quando a pessoa autorizou `nome_creci`. */
  creci?: string;
  em: string;
}

export interface VitrineDaApi {
  media: number;
  quantas: number;
  comentarios: ComentarioPublicado[];
}

export type ResultadoEnvio =
  /** No ar na hora (F2). */
  | { status: "publicado"; resumo: Resumo | null }
  /** A nota entrou, mas o texto ficou retido pelo filtro automático. */
  | { status: "pendente"; resumo: Resumo | null }
  /** 401: sem cookie do demo ou cookie vencido — só entrando de novo. */
  | { status: "sem_acesso"; mensagem: string }
  /** 409: o cadastro não tem nome; a tela cai para anônimo e avisa. */
  | { status: "sem_nome"; mensagem: string }
  | { status: "invalido"; mensagem: string; campos?: Record<string, string[] | undefined> }
  | { status: "limitado"; mensagem: string }
  | { status: "erro"; mensagem: string };

export const MENSAGENS = {
  semAcesso: "seu acesso ao demo expirou. Entre de novo com seu e-mail para avaliar.",
  semNome: "seu cadastro não tem o nome gravado. Dá para enviar como anônimo agora mesmo.",
  invalido: "confira a nota e o comentário antes de enviar.",
  limitado: "você enviou avaliações demais em pouco tempo. Aguarde alguns minutos e tente de novo.",
  erro: "algo falhou do nosso lado. Tente novamente em instantes.",
  rede: "não deu para falar com o servidor. Verifique sua conexão e tente de novo.",
} as const;

export interface DadosAvaliacao {
  estrelas: number;
  /** Texto cru da caixa; vazio ou só espaço é omitido do corpo, nunca vai como "". */
  comentario?: string;
  identificacao: Identificacao;
}

/** Corpo do POST, exatamente como o contrato pede. */
export function corpoDoEnvio(dados: DadosAvaliacao): Record<string, unknown> {
  const texto = (dados.comentario ?? "").trim().slice(0, MAX_COMENTARIO);
  return {
    estrelas: dados.estrelas,
    identificacao: dados.identificacao,
    ...(texto ? { comentario: texto } : {}),
  };
}

function numero(valor: unknown): number | null {
  return typeof valor === "number" && Number.isFinite(valor) ? valor : null;
}

/**
 * Resumo só quando os dois números vierem de verdade **e fizerem sentido**:
 * média fora de 0 a 5 é resposta quebrada, e a tela prefere não mostrar número
 * nenhum a estampar "12,0 de 5".
 */
export function lerResumo(corpo: unknown): Resumo | null {
  const c = (corpo ?? {}) as Record<string, unknown>;
  const cru = (c.resumo ?? c) as Record<string, unknown>;
  const media = numero(cru.media);
  const quantas = numero(cru.quantas);
  if (media === null || quantas === null || quantas < 0) return null;
  if (media < 0 || media > 5) return null;
  return { media, quantas: Math.floor(quantas) };
}

/** `POST /api/avaliacao` — exige o cookie do demo (o navegador manda sozinho). */
export async function enviarAvaliacao(dados: DadosAvaliacao): Promise<ResultadoEnvio> {
  const r = await postar("/api/avaliacao", corpoDoEnvio(dados));
  if (!r) return { status: "erro", mensagem: MENSAGENS.rede };
  const { res, corpo } = r;

  if (res.ok && corpo?.ok) {
    // status desconhecido conta como publicado: a nota entrou de qualquer jeito
    const resumo = lerResumo(corpo);
    return corpo.status === "pendente" ? { status: "pendente", resumo } : { status: "publicado", resumo };
  }

  const erro = typeof corpo?.erro === "string" ? corpo.erro : "";
  if (res.status === 401 || erro === "sem_acesso") return { status: "sem_acesso", mensagem: MENSAGENS.semAcesso };
  if (res.status === 409 || erro === "sem_nome") return { status: "sem_nome", mensagem: MENSAGENS.semNome };
  if (res.status === 429) return { status: "limitado", mensagem: MENSAGENS.limitado };
  if (res.status === 400) return { status: "invalido", mensagem: MENSAGENS.invalido, campos: corpo?.campos };
  return { status: "erro", mensagem: MENSAGENS.erro };
}

function texto(valor: unknown, limite: number): string {
  return typeof valor === "string" ? valor.trim().slice(0, limite) : "";
}

/** Uma linha da lista pública; qualquer item sem id, sem nota ou sem texto é descartado. */
function lerComentario(bruto: unknown): ComentarioPublicado | null {
  const c = (bruto ?? {}) as Record<string, unknown>;
  const id = texto(c.id, 64) || (typeof c.id === "number" ? String(c.id) : "");
  const corpo = texto(c.texto, MAX_COMENTARIO);
  const estrelas = numero(c.estrelas);
  if (!id || !corpo || estrelas === null || estrelas < 1 || estrelas > 5) return null;
  const nome = texto(c.nome, 80);
  const creci = texto(c.creci, 32);
  return {
    id,
    estrelas: Math.round(estrelas),
    texto: corpo,
    ...(nome ? { nome } : {}),
    ...(nome && creci ? { creci } : {}), // CRECI sem nome não identifica ninguém na tela
    em: texto(c.em, 40),
  };
}

/** Lê o corpo do `GET /api/avaliacoes`; `null` quando não dá para confiar no que veio. */
export function lerVitrine(corpo: unknown): VitrineDaApi | null {
  const resumo = lerResumo(corpo);
  if (!resumo) return null;
  const lista = Array.isArray((corpo as Record<string, unknown>)?.comentarios)
    ? ((corpo as Record<string, unknown>).comentarios as unknown[])
    : [];
  const comentarios = lista.map(lerComentario).filter((c): c is ComentarioPublicado => c !== null);
  return { ...resumo, comentarios };
}

/**
 * `GET /api/avaliacoes` — público. Falha de rede, servidor fora ou resposta
 * estranha devolvem `null`: a landing fica com os depoimentos do arquivo e não
 * mostra erro nenhum (a vitrine é enfeite, não função).
 */
export async function buscarAvaliacoes(): Promise<VitrineDaApi | null> {
  try {
    const res = await fetch("/api/avaliacoes", { headers: { Accept: "application/json" } });
    if (!res.ok) return null;
    return lerVitrine(await res.json());
  } catch {
    return null; // sem console: a página simplesmente segue com o arquivo
  }
}
