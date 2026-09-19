/**
 * Links de contato do painel: um clique abre a conversa com o lead.
 * Puro (sem React), para o teste conferir o link exato que a tela monta.
 */
import { brand } from "@/config/brand";
import { telefoneNacional, type LeadAdmin } from "@/features/lead/admin";
import type { Canal } from "@/features/lead/funil";

/**
 * Primeira mensagem, curta e neutra: diz de onde vem o contato e por quê, sem
 * prometer nada — o fundador completa a conversa do jeito dele.
 */
export const MENSAGEM_WHATSAPP = `Oi! Aqui é do ${brand.nomeCurto}, vi que você pediu acesso ao demo.`;

/** Lead cadastrado à mão (indicação, evento, WhatsApp) não pediu acesso ao demo: a conversa abre neutra. */
export const MENSAGEM_WHATSAPP_MANUAL = `Oi! Aqui é do ${brand.nomeCurto}, tudo bem?`;

/**
 * `https://wa.me/<dígitos>?text=…` a partir do telefone E.164 do lead. O wa.me
 * quer o número internacional só com dígitos (sem `+`). Número curto demais para
 * ter DDI + DDD → `null`, e a tela mostra o telefone sem link.
 */
export function linkWhatsappLead(telefone: string, canal: Canal = "site"): string | null {
  const digitos = telefone.replace(/\D/g, "");
  if (digitos.length < 12) return null;
  const mensagem = canal === "site" ? MENSAGEM_WHATSAPP : MENSAGEM_WHATSAPP_MANUAL;
  return `https://wa.me/${digitos}?text=${encodeURIComponent(mensagem)}`;
}

/** `mailto:` com o endereço escapado (o `@` fica legível; `?`, `#` e afins não viram parâmetro). */
export function linkEmailLead(email: string): string {
  return `mailto:${encodeURIComponent(email).replace(/%40/g, "@")}`;
}

/** Como o lead é chamado na tela: o nome; sem nome, o e-mail; sem os dois, o telefone. */
export function identificacaoLead(lead: Pick<LeadAdmin, "nome" | "email" | "telefone">): string {
  return lead.nome?.trim() || lead.email || telefoneNacional(lead.telefone);
}
