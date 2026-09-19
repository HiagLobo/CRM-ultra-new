/**
 * E-mail mascarado (O9) — a dica mostrada a quem tenta cadastrar um WhatsApp
 * que já tem dono: o bastante para a pessoa reconhecer o PRÓPRIO e-mail
 * (`m•••••a@provedor.com.br`), pouco para um terceiro descobrir o de outra.
 *
 * Puro e client-safe. O tamanho da máscara é fixo: não entrega o tamanho da
 * parte local.
 */
const MASCARA = "•••••";

/**
 * 1ª e última letra da parte local + máscara + `@domínio`. Parte local com 1 ou
 * 2 letras: só a 1ª + máscara (senão a máscara não esconderia nada).
 */
export function mascararEmail(email: string): string {
  const arroba = email.lastIndexOf("@");
  if (arroba <= 0) return MASCARA;
  const local = Array.from(email.slice(0, arroba));
  const dominio = email.slice(arroba + 1);
  const fim = local.length > 2 ? local[local.length - 1] : "";
  return `${local[0]}${MASCARA}${fim}@${dominio}`;
}
