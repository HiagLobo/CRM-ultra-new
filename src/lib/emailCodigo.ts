/**
 * Conteúdo do e-mail do código de verificação (assunto, HTML e texto puro).
 *
 * Diz quem envia e para onde leva (site + empresa responsável) — um remetente
 * novo, sem isso, parece phishing e cai no spam/Promoções (achado captacao-12).
 * A validade vem de `EXPIRACAO_CODIGO_MIN`, a mesma que o domínio aplica.
 * Marca via `brand.*` + palette, nunca cravada.
 */
import { palette } from "./palette";
import { EXPIRACAO_CODIGO_MIN } from "../features/lead/schema";
import type { BrandConfig } from "../config/brand";

export interface EmailCodigo {
  assunto: string;
  html: string;
  texto: string;
}

/** Escapa texto para dentro do HTML (a marca é config, mas config também erra). */
function html(texto: string): string {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Endereço público do site, a partir do domínio da marca. */
export function urlDoSite(brand: BrandConfig): string {
  return `https://${brand.dominio}`;
}

export function montarEmailCodigo(codigo: string, brand: BrandConfig): EmailCodigo {
  const site = urlDoSite(brand);
  const validade = `${EXPIRACAO_CODIGO_MIN} minutos`;
  const quemEnvia = `Enviado por ${brand.empresa.razaoSocial} (CNPJ ${brand.empresa.cnpj}), responsável pelo ${brand.nome}.`;

  const assunto = `${brand.nomeCurto}: seu código de acesso`;

  const texto = [
    `Seu código de acesso ao demo do ${brand.nome} é ${codigo}.`,
    `Validade: ${validade}.`,
    "Se você não solicitou, ignore este e-mail — nunca pediremos seu código por telefone ou mensagem.",
    "",
    "—",
    `${brand.nome} · ${site}`,
    quemEnvia,
    "Dúvidas? É só responder este e-mail.",
  ].join("\n");

  const cinza = palette.g500;
  const corpo = `<div style="font-family:system-ui,Arial,sans-serif;max-width:480px;margin:0 auto;color:${palette.ink}">
    <h2 style="color:${palette.primary};margin:0 0 8px">${html(brand.nome)}</h2>
    <p>Seu código de acesso ao demo é:</p>
    <p style="font-size:32px;font-weight:700;letter-spacing:6px;color:${palette.primary};margin:16px 0">${html(codigo)}</p>
    <p style="color:${cinza};font-size:14px">Validade: ${validade}.</p>
    <p style="color:${cinza};font-size:13px">Se você não solicitou, ignore este e-mail. Nunca pediremos seu código por telefone ou mensagem.</p>
    <hr style="border:none;border-top:1px solid ${palette.g300};margin:24px 0 12px">
    <p style="color:${cinza};font-size:12px;line-height:1.5;margin:0">
      <a href="${html(site)}" style="color:${palette.primary}">${html(brand.dominio)}</a><br>
      ${html(quemEnvia)} Dúvidas? É só responder este e-mail.
    </p>
  </div>`;

  return { assunto, html: corpo, texto };
}
