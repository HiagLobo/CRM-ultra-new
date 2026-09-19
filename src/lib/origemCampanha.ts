/**
 * Origem da campanha (O8·S3): qual anúncio, post ou link trouxe o visitante.
 *
 * A landing lê `utm_source`, `utm_medium`, `utm_campaign` e `ref` da URL (e o
 * domínio do `document.referrer`), guarda em `sessionStorage` e o pedido de
 * acesso manda em `origem`: `utm` = fonte.meio.campanha; `ref` = o `ref` do link
 * ou, sem ele, o domínio de onde a pessoa veio.
 *
 * É identificador de campanha, não dado pessoal — e só sai do navegador junto do
 * pedido de acesso que a própria pessoa envia. Perder a origem (storage
 * bloqueado, aba nova) só perde a atribuição: o pedido nunca depende dela.
 *
 * Sai daqui já no formato que o servidor aceita (`[A-Za-z0-9._-]`, até 100):
 * texto de URL acima de 200 caracteres faria o Zod da rota recusar o pedido
 * inteiro — e a pessoa ficaria sem acesso por causa de um link de anúncio.
 */

export interface OrigemCampanha {
  utm?: string;
  ref?: string;
}

/** O que a landing sabe da visita: a query string, o referrer e o próprio host. */
export interface Visita {
  search: string;
  referrer: string;
  host: string;
}

export const CHAVE_ORIGEM = "crm_origem_campanha"; // prefixo crm_ — padrão de storage da O0
export const LIMITE_ORIGEM = 100;

/**
 * Mesmo saneamento do servidor, com duas gentilezas antes: acento vira a letra
 * sem acento ("promoção" → "promocao") e espaço vira hífen ("black friday" →
 * "black-friday"). Sem nenhuma letra ou dígito, não é origem: vira vazio.
 */
export function sanearOrigem(bruto: string): string {
  const limpo = bruto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^A-Za-z0-9._-]/g, "")
    .slice(0, LIMITE_ORIGEM);
  return /[A-Za-z0-9]/.test(limpo) ? limpo : "";
}

/** Só os campos com conteúdo, saneados; nada aproveitável → `undefined` (o pedido omite `origem`). */
export function limparOrigem(origem: unknown): OrigemCampanha | undefined {
  if (!origem || typeof origem !== "object") return undefined;
  const { utm, ref } = origem as Record<string, unknown>;
  const u = typeof utm === "string" ? sanearOrigem(utm) : "";
  const r = typeof ref === "string" ? sanearOrigem(ref) : "";
  if (!u && !r) return undefined;
  return { ...(u ? { utm: u } : {}), ...(r ? { ref: r } : {}) };
}

/** Domínio de onde a pessoa veio, sem `www.`; o próprio site não conta como origem. */
export function dominioDeOrigem(referrer: string, hostAtual: string): string | undefined {
  if (!referrer) return undefined;
  let host: string;
  try {
    host = new URL(referrer).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return undefined; // referrer malformado: segue sem origem, a tela não quebra
  }
  if (!host || host === hostAtual.toLowerCase().replace(/^www\./, "")) return undefined;
  return sanearOrigem(host) || undefined;
}

/** `utm` em posição fixa: "google..natal" diz que faltou o meio, sem confundir campanha com meio. */
function utmDaUrl(params: URLSearchParams): string {
  const partes = ["utm_source", "utm_medium", "utm_campaign"].map((n) => sanearOrigem(params.get(n) ?? ""));
  while (partes.length > 0 && !partes[partes.length - 1]) partes.pop();
  return partes.join(".").slice(0, LIMITE_ORIGEM);
}

/**
 * Origem desta visita. `explicita` = veio de parâmetro no link (utm/ref), que
 * vale mais que o referrer: numa volta dentro do site, o `document.referrer`
 * continua sendo o da chegada, e não pode apagar a campanha já guardada.
 */
export function origemDaVisita(visita: Visita): { origem: OrigemCampanha; explicita: boolean } | null {
  const params = new URLSearchParams(visita.search);
  const utm = utmDaUrl(params);
  const refDoLink = sanearOrigem(params.get("ref") ?? "");
  const ref = refDoLink || dominioDeOrigem(visita.referrer, visita.host);
  const origem = limparOrigem({ utm, ref });
  if (!origem) return null;
  return { origem, explicita: Boolean(utm || refDoLink) };
}

function sessao(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.sessionStorage;
  } catch {
    return null; // storage bloqueado pelo navegador: sem origem, sem erro
  }
}

/** Origem guardada nesta aba, já saneada (o storage é editável por quem usa o navegador). */
export function lerOrigemGuardada(armazenamento: Storage | null = sessao()): OrigemCampanha | undefined {
  try {
    const bruto = armazenamento?.getItem(CHAVE_ORIGEM);
    return bruto ? limparOrigem(JSON.parse(bruto)) : undefined;
  } catch {
    return undefined; // storage recusado ou valor corrompido: o pedido segue sem origem
  }
}

/** Guarda a origem; `false` quando o storage recusou (o pedido segue sem ela). */
export function guardarOrigem(origem: OrigemCampanha, armazenamento: Storage | null = sessao()): boolean {
  if (!armazenamento) return false;
  try {
    armazenamento.setItem(CHAVE_ORIGEM, JSON.stringify(origem));
    return true;
  } catch {
    return false;
  }
}

function visitaAtual(): Visita | null {
  if (typeof window === "undefined") return null;
  return { search: window.location.search, referrer: document.referrer, host: window.location.hostname };
}

/**
 * Chamado pela landing ao montar (efeito — nunca no render). Link com utm/ref
 * substitui o que estava guardado (vale o último anúncio clicado); só referrer
 * entra quando ainda não há nada — e visita direta não mexe em nada.
 */
export function registrarOrigemDaVisita(
  visita: Visita | null = visitaAtual(),
  armazenamento: Storage | null = sessao(),
): OrigemCampanha | undefined {
  const atual = visita ? origemDaVisita(visita) : null;
  if (!atual) return lerOrigemGuardada(armazenamento);
  if (!atual.explicita) {
    const guardada = lerOrigemGuardada(armazenamento);
    if (guardada) return guardada;
  }
  guardarOrigem(atual.origem, armazenamento);
  return atual.origem;
}
