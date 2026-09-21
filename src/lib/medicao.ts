/**
 * Medição de audiência (Vercel Analytics) sem pegar carona no painel.
 *
 * A contagem é anônima e sem cookie, mas o endereço da página viaja junto de
 * cada visita. No site público isso é inofensivo e é justamente o que queremos
 * saber. No painel, não: a folha do orçamento mora em
 * `/admin/orcamento/<id>`, e esse identificador aponta para um cliente. Mandar
 * essa URL para fora seria vazar, em forma de endereço, com quem estamos
 * negociando.
 *
 * Por isso o evento passa por aqui antes de sair do navegador: caminho de área
 * restrita não é medido. Função pura de propósito, para o teste ao lado poder
 * provar que o corte continua valendo quando alguém mexer no painel.
 */

/** Começos de caminho que nunca são medidos. */
export const FORA_DA_MEDICAO = ["/admin", "/login", "/api"] as const;

/**
 * Só o caminho, sem domínio, sem busca e sem âncora. Aceita a URL inteira
 * (é o que o Analytics manda) ou um caminho solto.
 */
export function caminhoDaUrl(url: string): string {
  const bruto = url.trim();
  let caminho = bruto;

  const protocolo = bruto.indexOf("://");
  if (protocolo >= 0) {
    const barra = bruto.indexOf("/", protocolo + 3);
    caminho = barra >= 0 ? bruto.slice(barra) : "/";
  }

  caminho = caminho.split("?")[0].split("#")[0];
  if (!caminho.startsWith("/")) caminho = `/${caminho}`;
  // "/admin/" e "/admin" são a mesma porta.
  return caminho.length > 1 ? caminho.replace(/\/+$/, "") : caminho;
}

/** A página pode ser contada? Área restrita nunca pode. */
export function podeMedir(url: string): boolean {
  const caminho = caminhoDaUrl(url).toLowerCase();
  return !FORA_DA_MEDICAO.some((restrita) => caminho === restrita || caminho.startsWith(`${restrita}/`));
}

/**
 * O `beforeSend` do Analytics: devolve o evento para ser contado ou `null`
 * para descartá-lo ainda no navegador.
 */
export function filtrarEvento<E extends { url: string }>(evento: E): E | null {
  return podeMedir(evento.url) ? evento : null;
}
