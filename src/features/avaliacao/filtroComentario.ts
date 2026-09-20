/**
 * Filtro automático do comentário (O10·S1) — a rede de proteção do "publica
 * direto" (decisão F2).
 *
 * Função PURA: recebe o texto e devolve `publicado` ou `pendente` + o motivo.
 * Não decide nada sobre a NOTA — estrela sempre entra na hora, em qualquer
 * caso. Segurar é conservador de propósito: o falso positivo custa um clique do
 * fundador no painel; o falso negativo é um link de golpe na landing. Por isso
 * as regras leem o texto já sem disfarce (`normalizarTexto.ts`) e o link vale
 * para QUALQUER domínio, não para uma lista de terminações — lista de
 * terminação sempre fica velha, e `golpe.online` passava.
 *
 * O tamanho do comentário NÃO é regra daqui: o Zod recusa acima de 400
 * caracteres antes de o filtro rodar (400 na rota), então uma regra de tamanho
 * aqui seria código morto.
 *
 * CLIENT-SAFE (sem crypto/fs/env) — a tela pode explicar a regra com o mesmo código.
 */
import { BAIXO_CALAO } from "./baixoCalao";
import { colado, comLeet, semDisfarces } from "./normalizarTexto";

export type MotivoPendente = "email" | "link" | "telefone" | "baixo_calao" | "linhas_vazias" | "caps";

export type ResultadoFiltro = { status: "publicado" } | { status: "pendente"; motivo: MotivoPendente };

/** O que o painel mostra ao lado da avaliação segurada (S3). */
export const ROTULO_MOTIVO: Record<MotivoPendente, string> = {
  email: "tem e-mail",
  link: "tem link",
  telefone: "tem telefone",
  baixo_calao: "tem palavrão",
  linhas_vazias: "muitas linhas em branco",
  caps: "quase tudo em maiúsculas",
};

const EMAIL = /[\w.+-]+@[\w-]+\.[\w.-]*\w/;
/**
 * `http(s)://`, `www.` ou qualquer domínio: rótulo válido + ponto + terminação
 * de 2 letras ou mais, colados. "bom. Recomendo" não casa (o ponto está solto);
 * "etc.br" casa e vai para conferência — falso positivo aceito de propósito.
 */
const LINK = /https?:\/\/|\bwww\.|\b[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.[a-z]{2,24}\b/;
/** 8 dígitos ou mais só com separador de telefone entre eles (a barra da data fica de fora). */
const TELEFONE = /(?:\d[\s().+-]*){8,}/;
/** 3 linhas em branco seguidas = 4 quebras com nada (ou só espaço) entre elas. */
const LINHAS_VAZIAS = /\n[^\S\n]*\n[^\S\n]*\n[^\S\n]*\n/;

/** Acima deste tanto de letras o CAPS vira grito; abaixo, é só um "ÓTIMO!" animado. */
const MINIMO_LETRAS_CAPS = 12;
/** Proporção de maiúsculas que caracteriza o grito. */
const LIMITE_CAPS = 0.7;

/** Termo com este tanto de letras pode ser procurado no texto colado sem pegar palavra inocente. */
const MINIMO_COLADO = 5;
/** Terminações que ainda são a mesma palavra ("merdas", "fodido", "putaria"). */
const SUFIXOS = /^(s|es|as|os|ada|ado|adas|ados|ido|ida|idos|idas|inha|inho|inhas|inhos|eira|eiro|ice)$/;

/** A palavra é o termo, ou o termo com uma terminação comum? */
function casaComSufixo(palavra: string, termo: string): boolean {
  if (!palavra.startsWith(termo)) return false;
  const resto = palavra.slice(termo.length);
  if (resto === "") return true;
  // termo curto só aceita o plural: "cura" e "cueira" não são palavrão
  return termo.length < 4 ? resto === "s" : SUFIXOS.test(resto);
}

/**
 * Duas passadas: por palavra inteira (nada de "cu" dentro de "curso") e, para
 * os termos longos, no texto colado — é o que pega `m e r d a` e `mer-da`.
 */
function temBaixoCalao(original: string): boolean {
  const palavras = comLeet(original).split(/[^a-z0-9]+/).filter(Boolean);
  const grudado = colado(original);
  return BAIXO_CALAO.some(
    (termo) =>
      palavras.some((p) => casaComSufixo(p, termo)) || (termo.length >= MINIMO_COLADO && grudado.includes(termo)),
  );
}

function gritando(texto: string): boolean {
  const letras = [...texto].filter((c) => /\p{L}/u.test(c));
  if (letras.length < MINIMO_LETRAS_CAPS) return false;
  const maiusculas = letras.filter((c) => c === c.toUpperCase() && c !== c.toLowerCase()).length;
  return maiusculas / letras.length > LIMITE_CAPS;
}

/** O mesmo texto em três leituras: como veio, sem disfarce e colado. */
interface Leituras {
  /** Como a pessoa escreveu (maiúsculas e quebras de linha importam para 2 regras). */
  original: string;
  /** Sem invisível, sem acento, com os disfarces de ponto e arroba desfeitos. */
  busca: string;
}

/**
 * Regras na ordem em que o motivo é reportado: a mais específica primeiro (um
 * e-mail também casaria como "link", e o fundador prefere saber que é e-mail).
 */
const REGRAS: ReadonlyArray<{ motivo: MotivoPendente; pega: (t: Leituras) => boolean }> = [
  { motivo: "email", pega: (t) => EMAIL.test(t.busca) },
  { motivo: "link", pega: (t) => LINK.test(t.busca) },
  { motivo: "telefone", pega: (t) => TELEFONE.test(t.busca) },
  { motivo: "baixo_calao", pega: (t) => temBaixoCalao(t.original) },
  { motivo: "linhas_vazias", pega: (t) => LINHAS_VAZIAS.test(t.original) },
  { motivo: "caps", pega: (t) => gritando(t.original) },
];

/**
 * Comentário vazio (só a nota) é `publicado`: não há texto para conferir.
 * Qualquer regra que pegar devolve `pendente` com o motivo — o painel mostra o
 * rótulo e o fundador decide.
 */
export function filtrarComentario(comentario: string | undefined): ResultadoFiltro {
  const original = comentario?.trim() ?? "";
  if (!original) return { status: "publicado" };
  const leituras: Leituras = { original, busca: semDisfarces(original) };
  const regra = REGRAS.find((r) => r.pega(leituras));
  return regra ? { status: "pendente", motivo: regra.motivo } : { status: "publicado" };
}
