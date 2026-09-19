/**
 * Porta de e-mail (fronteira de fornecedor — ADR U4).
 * ResendEmail (produção) + ConsoleEmail (fallback dev, sem chave Resend).
 * Conteúdo em `emailCodigo.ts`, remetente em `remetente.ts`. PII (e-mail) mascarada em log.
 *
 * SERVER-ONLY. Importa env (validado no boot, fail-closed).
 */
import { Resend } from "resend";
import { env, emailModoDev } from "./env";
import { montarEmailCodigo } from "./emailCodigo";
import { interpretarRemetente, montarRemetente, MENSAGEM_REMETENTE_INVALIDO, type Remetente } from "./remetente";
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

export class ConsoleEmail implements ProvedorEmail {
  async enviarCodigo(para: string, _codigo: string, _brand: BrandConfig): Promise<void> {
    // dev: só registra que "enviou" (e-mail mascarado). O código chega ao dev
    // pela resposta da rota (codigoDev), nunca pelo log.
    console.log(`[email:dev] código de acesso enviado para ${mascararEmail(para)} (modo desenvolvimento)`);
  }
}

export class ResendEmail implements ProvedorEmail {
  private readonly resend: Resend;
  constructor(apiKey: string, private readonly remetente: Remetente) {
    this.resend = new Resend(apiKey);
  }
  async enviarCodigo(para: string, codigo: string, brand: BrandConfig): Promise<void> {
    const { assunto, html, texto } = montarEmailCodigo(codigo, brand);
    const { error } = await this.resend.emails.send({
      // sempre com nome de exibição ("<nome da marca> <acesso@…>"), nunca um endereço solto
      from: montarRemetente(this.remetente, brand.nomeCurto),
      // a resposta do corretor vai para o contato comercial, não para o remetente técnico
      ...(brand.contato.email ? { replyTo: brand.contato.email } : {}),
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
  // o env já validou o formato no boot; aqui só se chega sem validação em teste
  const remetente = interpretarRemetente(env.EMAIL_FROM);
  if (!remetente) throw new Error(`EMAIL_FROM inválido: ${MENSAGEM_REMETENTE_INVALIDO}`);
  return new ResendEmail(env.RESEND_API_KEY, remetente);
}
