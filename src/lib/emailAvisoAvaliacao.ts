/**
 * Conteúdo do aviso "nova avaliação do demo" que vai para o fundador (O10·S1).
 *
 * **Sem PII, pela mesma regra da O7**: nada de nome, e-mail, CRECI nem o texto
 * do comentário — o aviso passa por caixa de entrada, celular e notificação de
 * tela bloqueada. Só o que ele precisa para decidir se abre o painel agora: a
 * nota, a situação e o link do `/admin`.
 * Marca via `brand.*` + palette, nunca cravada.
 */
import { palette } from "./palette";
import type { EmailCodigo } from "./emailCodigo";
import { escaparHtml, urlDoAdmin } from "./emailAviso";
import { estrelasEmTexto } from "../features/avaliacao/avaliacao";
import type { BrandConfig } from "../config/brand";

/** O desenho das estrelas mora no domínio (o painel usa o mesmo); re-exportado por conveniência. */
export { estrelasEmTexto };

/** O que o aviso carrega. Note que não há campo nenhum de pessoa — nem opcional. */
export interface AvisoAvaliacao {
  /** 1 a 5. */
  estrelas: number;
  /** `true` quando o filtro automático segurou o texto para conferência. */
  pendente: boolean;
}

export function montarEmailAvisoAvaliacao(brand: BrandConfig, aviso: AvisoAvaliacao): EmailCodigo {
  const admin = urlDoAdmin(brand);
  const desenho = estrelasEmTexto(aviso.estrelas);
  const situacao = aviso.pendente
    ? "O comentário ficou fora do ar até você conferir (o filtro automático segurou)."
    : "O comentário já está publicado no site.";
  const assunto = `${brand.nomeCurto}: nova avaliação (${aviso.estrelas} de 5)${aviso.pendente ? " — para conferir" : ""}`;

  const texto = [
    `Alguém que testou a demonstração do ${brand.nome} deixou uma avaliação: ${desenho} (${aviso.estrelas} de 5).`,
    situacao,
    `Leia e decida no painel: ${admin}`,
    "",
    "—",
    "Aviso automático. Quem avaliou e o que escreveu ficam só no painel (protegido por senha), nunca neste e-mail.",
  ].join("\n");

  const corpo = `<div style="font-family:system-ui,Arial,sans-serif;max-width:480px;margin:0 auto;color:${palette.ink}">
    <h2 style="color:${palette.primary};margin:0 0 8px">${escaparHtml(brand.nome)}</h2>
    <p>Alguém que testou a demonstração deixou uma avaliação:</p>
    <p style="font-size:24px;letter-spacing:2px;margin:8px 0">${desenho} <span style="font-size:14px;color:${palette.g500}">(${aviso.estrelas} de 5)</span></p>
    <p>${situacao}</p>
    <p style="margin:20px 0">
      <a href="${escaparHtml(admin)}" style="background:${palette.primary};color:#fff;padding:12px 20px;border-radius:999px;text-decoration:none;font-weight:700">Abrir o painel</a>
    </p>
    <p style="color:${palette.g500};font-size:12px;line-height:1.5">
      Aviso automático. Quem avaliou e o que escreveu ficam só no painel (protegido por senha), nunca neste e-mail.
    </p>
  </div>`;

  return { assunto, html: corpo, texto };
}
