/**
 * Conteúdo do aviso "novo lead confirmado" que vai para o fundador (O7·S1).
 *
 * **Sem PII, de propósito**: nada de e-mail, telefone ou CRECI do lead — o
 * aviso passa por caixa de entrada, celular e notificação de tela bloqueada, e
 * o contato já mora no `/admin`, atrás de senha. O e-mail só diz que entrou
 * alguém e leva até lá.
 * Marca via `brand.*` + palette, nunca cravada.
 */
import { palette } from "./palette";
import { urlDoSite, type EmailCodigo } from "./emailCodigo";
import type { BrandConfig } from "../config/brand";

/** Escapa texto de config para dentro do HTML (a marca é config, mas config também erra). */
function escaparHtml(texto: string): string {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Endereço do painel de leads, a partir do domínio da marca. */
export function urlDoAdmin(brand: BrandConfig): string {
  return `${urlDoSite(brand)}/admin`;
}

export function montarEmailAviso(brand: BrandConfig): EmailCodigo {
  const admin = urlDoAdmin(brand);
  const assunto = `${brand.nomeCurto}: novo lead confirmado`;

  const texto = [
    `Um corretor acabou de confirmar o e-mail e liberar o demo do ${brand.nome}.`,
    `Veja o contato e fale com ele pelo painel de leads: ${admin}`,
    "",
    "—",
    "Aviso automático. Os dados do lead ficam só no painel (protegido por senha), nunca neste e-mail.",
  ].join("\n");

  const corpo = `<div style="font-family:system-ui,Arial,sans-serif;max-width:480px;margin:0 auto;color:${palette.ink}">
    <h2 style="color:${palette.primary};margin:0 0 8px">${escaparHtml(brand.nome)}</h2>
    <p>Um corretor acabou de confirmar o e-mail e liberar o demo.</p>
    <p style="margin:20px 0">
      <a href="${escaparHtml(admin)}" style="background:${palette.primary};color:#fff;padding:12px 20px;border-radius:999px;text-decoration:none;font-weight:700">Abrir o painel de leads</a>
    </p>
    <p style="color:${palette.g500};font-size:12px;line-height:1.5">
      Aviso automático. Os dados do lead ficam só no painel (protegido por senha), nunca neste e-mail.
    </p>
  </div>`;

  return { assunto, html: corpo, texto };
}
