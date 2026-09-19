/**
 * Links de contato do painel: um clique abre a conversa com o lead.
 * Puro (sem React), para o teste conferir o link exato que a tela monta.
 */
import { brand } from "@/config/brand";

/**
 * Primeira mensagem, curta e neutra: diz de onde vem o contato e por quê, sem
 * prometer nada — o fundador completa a conversa do jeito dele.
 */
export const MENSAGEM_WHATSAPP = `Oi! Aqui é do ${brand.nomeCurto}, vi que você pediu acesso ao demo.`;

/**
 * `https://wa.me/<dígitos>?text=…` a partir do telefone E.164 do lead. O wa.me
 * quer o número internacional só com dígitos (sem `+`). Número curto demais para
 * ter DDI + DDD → `null`, e a tela mostra o telefone sem link.
 */
export function linkWhatsappLead(telefone: string): string | null {
  const digitos = telefone.replace(/\D/g, "");
  if (digitos.length < 12) return null;
  return `https://wa.me/${digitos}?text=${encodeURIComponent(MENSAGEM_WHATSAPP)}`;
}

/** `mailto:` com o endereço escapado (o `@` fica legível; `?`, `#` e afins não viram parâmetro). */
export function linkEmailLead(email: string): string {
  return `mailto:${encodeURIComponent(email).replace(/%40/g, "@")}`;
}
