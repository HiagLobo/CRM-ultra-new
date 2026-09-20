/**
 * Filtro automático do comentário (O10·S1) — a rede de proteção do "publica
 * direto" (decisão F2).
 *
 * Função PURA: recebe o texto e devolve `publicado` ou `pendente` + o motivo.
 * Não decide nada sobre a NOTA — estrela sempre entra na hora, em qualquer
 * caso. Segurar é conservador de propósito: o falso positivo custa um clique do
 * fundador no painel; o falso negativo é um link de golpe na landing.
 *
 * CLIENT-SAFE (sem crypto/fs/env) — a tela pode explicar a regra com o mesmo código.
 */
import { BAIXO_CALAO } from "./baixoCalao";
import { COMENTARIO_MAX } from "./avaliacao";

export type MotivoPendente = "email" | "link" | "telefone" | "baixo_calao" | "tamanho" | "linhas_vazias" | "caps";

export type ResultadoFiltro = { status: "publicado" } | { status: "pendente"; motivo: MotivoPendente };

/** O que o painel mostra ao lado da avaliação segurada (S3). */
export const ROTULO_MOTIVO: Record<MotivoPendente, string> = {
  email: "tem e-mail",
  link: "tem link",
  telefone: "tem telefone",
  baixo_calao: "tem palavrão",
  tamanho: "texto muito longo",
  linhas_vazias: "muitas linhas em branco",
  caps: "quase tudo em maiúsculas",
};

const EMAIL = /[\w.+-]+@[\w-]+\.[\w.-]*\w/;
/** `http(s)://`, `www.` ou domínio solto ("meusite.com.br", "bit.ly"). */
const LINK = /https?:\/\/|\bwww\.|\b[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.(com|br|net|org|io|me|app|site|dev|co|link|xyz)\b/i;
/** 8 dígitos ou mais só com separador de telefone entre eles (a barra da data fica de fora). */
const TELEFONE = /(?:\d[\s().+-]*){8,}/;
/** 3 linhas em branco seguidas = 4 quebras com nada (ou só espaço) entre elas. */
const LINHAS_VAZIAS = /\n[^\S\n]*\n[^\S\n]*\n[^\S\n]*\n/;

/** Acima deste tanto de letras o CAPS vira grito; abaixo, é só um "ÓTIMO!" animado. */
const MINIMO_LETRAS_CAPS = 12;
/** Proporção de maiúsculas que caracteriza o grito. */
const LIMITE_CAPS = 0.7;

/** Minúsculas e sem acento — "Desgraça" e "DESGRAÇA" batem com a mesma entrada da lista. */
function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

/** Palavras inteiras do texto normalizado (nada de "cu" dentro de "curso"). */
function temBaixoCalao(texto: string): boolean {
  const palavras = new Set(normalizar(texto).split(/[^a-z0-9]+/).filter(Boolean));
  return BAIXO_CALAO.some((p) => palavras.has(p));
}

function gritando(texto: string): boolean {
  const letras = [...texto].filter((c) => /\p{L}/u.test(c));
  if (letras.length < MINIMO_LETRAS_CAPS) return false;
  const maiusculas = letras.filter((c) => c === c.toUpperCase() && c !== c.toLowerCase()).length;
  return maiusculas / letras.length > LIMITE_CAPS;
}

/**
 * Regras na ordem em que o motivo é reportado: a mais específica primeiro (um
 * e-mail também casaria como "link", e o fundador prefere saber que é e-mail).
 */
const REGRAS: ReadonlyArray<{ motivo: MotivoPendente; pega: (texto: string) => boolean }> = [
  { motivo: "email", pega: (t) => EMAIL.test(t) },
  { motivo: "link", pega: (t) => LINK.test(t) },
  { motivo: "telefone", pega: (t) => TELEFONE.test(t) },
  { motivo: "baixo_calao", pega: temBaixoCalao },
  { motivo: "tamanho", pega: (t) => t.length > COMENTARIO_MAX },
  { motivo: "linhas_vazias", pega: (t) => LINHAS_VAZIAS.test(t) },
  { motivo: "caps", pega: gritando },
];

/**
 * Comentário vazio (só a nota) é `publicado`: não há texto para conferir.
 * Qualquer regra que pegar devolve `pendente` com o motivo — o painel mostra o
 * rótulo e o fundador decide.
 */
export function filtrarComentario(comentario: string | undefined): ResultadoFiltro {
  const texto = comentario?.trim() ?? "";
  if (!texto) return { status: "publicado" };
  const regra = REGRAS.find((r) => r.pega(texto));
  return regra ? { status: "pendente", motivo: regra.motivo } : { status: "publicado" };
}
