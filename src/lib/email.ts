/**
 * Porta de e-mail (fronteira de fornecedor — ADR U4).
 * ResendEmail (produção) + ConsoleEmail (fallback dev, sem chave Resend).
 * Marca via brand.* + palette (nunca cravada). PII (e-mail) mascarada em log.
 *
 * SERVER-ONLY. Importa env (validado no boot, fail-closed).
 */
import { Resend } from "resend";
import { env, emailModoDev } from "./env";
import { palette } from "./palette";
import type { BrandConfig } from "../config/brand";

export interface ProvedorEmail {
  /** Envia o código de verificação para o e-mail informado. */
  enviarCodigo(para: string, codigo: string, brand: BrandConfig): Promise<void>;
}

/** Mascara o e-mail para uso seguro em log (não vaza o endereço completo). */
export function mascararEmail(email: string): string {
  const [usuario, dominio] = email.split("@");
  if (!dominio) return "***";
  const visivel = usuario.slice(0, 2);
  return `${visivel}${"*".repeat(Math.max(1, usuario.length - visivel.length))}@${dominio}`;
}

function montarEmailCodigo(codigo: string, brand: BrandConfig): {
  assunto: string;
  html: string;
  texto: string;
} {
  const assunto = `${brand.nomeCurto}: seu código de acesso`;
  const texto =
    `Seu código de acesso ao demo do ${brand.nome} é ${codigo}. ` +
    `Validade: 10 minutos. Se você não solicitou, ignore este e-mail — ` +
    `nunca pediremos seu código por telefone ou mensagem.`;
  const html = `<div style="font-family:system-ui,Arial,sans-serif;max-width:480px;margin:0 auto;color:#1C1A22">
    <h2 style="color:${palette.primary};margin:0 0 8px">${brand.nome}</h2>
    <p>Seu código de acesso ao demo é:</p>
    <p style="font-size:32px;font-weight:700;letter-spacing:6px;color:${palette.primary};margin:16px 0">${codigo}</p>
    <p style="color:#807C8A;font-size:14px">Validade: 10 minutos.</p>
    <p style="color:#807C8A;font-size:13px">Se você não solicitou, ignore este e-mail. Nunca pediremos seu código por telefone ou mensagem.</p>
  </div>`;
  return { assunto, html, texto };
}

export class ConsoleEmail implements ProvedorEmail {
  async enviarCodigo(para: string, _codigo: string, _brand: BrandConfig): Promise<void> {
    // dev: só registra que "enviou" (e-mail mascarado). O código chega ao dev
    // pela resposta da rota (codigoDev), nunca pelo log.
    console.log(`[email:dev] código de acesso enviado para ${mascararEmail(para)} (modo desenvolvimento)`);
  }
}

export class ResendEmail implements ProvedorEmail {
  private readonly resend: Resend;
  constructor(apiKey: string, private readonly remetente: string) {
    this.resend = new Resend(apiKey);
  }
  async enviarCodigo(para: string, codigo: string, brand: BrandConfig): Promise<void> {
    const { assunto, html, texto } = montarEmailCodigo(codigo, brand);
    const { error } = await this.resend.emails.send({
      from: this.remetente,
      to: para,
      subject: assunto,
      html,
      text: texto,
    });
    // erro sem PII (só o nome do erro do provedor); não engole — propaga.
    if (error) throw new Error(`falha no envio de e-mail (${error.name})`);
  }
}

let cache: ProvedorEmail | null = null;

/**
 * Provedor padrão da aplicação, criado **sob demanda** (no primeiro envio).
 *
 * Não pode ser criado no import: o `next build` avalia os módulos das rotas com
 * `NODE_ENV=production`, e aí a exigência da chave (correta em runtime)
 * quebraria o build de quem só quer compilar. Sob demanda, a trava continua
 * valendo — só que na hora de enviar de verdade.
 */
export function provedorEmail(): ProvedorEmail {
  cache ??= criarProvedorEmail();
  return cache;
}

/** Seleciona o provedor: sem chave Resend → ConsoleEmail (dev); com chave → ResendEmail. */
export function criarProvedorEmail(): ProvedorEmail {
  if (emailModoDev) return new ConsoleEmail();
  // fail-closed: em produção o fallback de dev está desligado, então a ausência
  // da chave tem de parar o boot com mensagem clara — nunca cair num provedor
  // meia-boca que "funciona" devolvendo o código na resposta.
  if (!env.RESEND_API_KEY) {
    throw new Error(
      "RESEND_API_KEY é obrigatória em produção (sem ela o código de verificação não sai por e-mail)",
    );
  }
  if (!env.EMAIL_FROM) {
    throw new Error("EMAIL_FROM é obrigatório quando RESEND_API_KEY está definida");
  }
  return new ResendEmail(env.RESEND_API_KEY, env.EMAIL_FROM);
}
