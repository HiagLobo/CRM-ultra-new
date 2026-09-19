/**
 * Porta de e-mail (fronteira de fornecedor — ADR U4).
 * ResendEmail (produção) + ConsoleEmail (fallback dev, sem chave Resend).
 * Conteúdo em `emailCodigo.ts` (código) e `emailAviso.ts` (aviso ao fundador),
 * remetente em `remetente.ts`. PII (e-mail) mascarada em log.
 *
 * SERVER-ONLY. Importa env (validado no boot, fail-closed).
 */
import { Resend } from "resend";
import { env, emailModoDev } from "./env";
import { montarEmailCodigo, type EmailCodigo } from "./emailCodigo";
import { montarEmailAviso } from "./emailAviso";
import { interpretarRemetente, montarRemetente, MENSAGEM_REMETENTE_INVALIDO, type Remetente } from "./remetente";
import { ErroConfiguracao, ErroEnvioEmail } from "./erros";
import type { BrandConfig } from "../config/brand";

export interface ProvedorEmail {
  /** Envia o código de verificação para o e-mail informado. */
  enviarCodigo(para: string, codigo: string, brand: BrandConfig): Promise<void>;
  /**
   * Avisa o fundador (`para` = AVISO_LEADS_EMAIL) que um lead confirmou o e-mail.
   * Não recebe dado do lead — o aviso é sem PII por construção (O7·S1).
   */
  enviarAvisoNovoLead(para: string, brand: BrandConfig): Promise<void>;
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
  async enviarAvisoNovoLead(_para: string, _brand: BrandConfig): Promise<void> {
    // dev: nem o destinatário vai ao log — só o fato
    console.log("[email:dev] aviso de lead novo confirmado (modo desenvolvimento) — veja o /admin");
  }
}

export class ResendEmail implements ProvedorEmail {
  private readonly resend: Resend;
  constructor(apiKey: string, private readonly remetente: Remetente) {
    this.resend = new Resend(apiKey);
  }
  async enviarCodigo(para: string, codigo: string, brand: BrandConfig): Promise<void> {
    // a resposta do corretor vai para o contato comercial, não para o remetente técnico
    return this.enviar(para, montarEmailCodigo(codigo, brand), brand, brand.contato.email);
  }

  async enviarAvisoNovoLead(para: string, brand: BrandConfig): Promise<void> {
    return this.enviar(para, montarEmailAviso(brand), brand);
  }

  private async enviar(para: string, conteudo: EmailCodigo, brand: BrandConfig, responderPara?: string): Promise<void> {
    const { error } = await this.resend.emails.send({
      // sempre com nome de exibição ("<nome da marca> <acesso@…>"), nunca um endereço solto
      from: montarRemetente(this.remetente, brand.nomeCurto),
      ...(responderPara ? { replyTo: responderPara } : {}),
      to: para,
      subject: conteudo.assunto,
      html: conteudo.html,
      text: conteudo.texto,
    });
    // só o código do erro do Resend (ex.: daily_quota_exceeded), que vira a causa
    // `email:<código>` no log; a mensagem pode citar o destinatário. Não engole — propaga.
    if (error) throw new ErroEnvioEmail(error.name);
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

/**
 * Seleciona o provedor: sem chave Resend → ConsoleEmail (dev); com chave → ResendEmail.
 *
 * Fail-closed: em produção o fallback de dev está desligado, então a ausência da
 * chave lança `ErroConfiguracao` com o nome da variável — nunca cai num provedor
 * meia-boca que "funciona" devolvendo o código na resposta. Quem chama trata:
 * o pedido de acesso grava o lead sem código e loga `config:RESEND_API_KEY`
 * (O7·S1 — o site fica no ar, o contato não se perde).
 */
export function criarProvedorEmail(): ProvedorEmail {
  if (emailModoDev) return new ConsoleEmail();
  if (!env.RESEND_API_KEY) {
    throw new ErroConfiguracao(
      "RESEND_API_KEY",
      "RESEND_API_KEY é obrigatória em produção (sem ela o código de verificação não sai por e-mail)",
    );
  }
  if (!env.EMAIL_FROM) {
    throw new ErroConfiguracao("EMAIL_FROM", "EMAIL_FROM é obrigatório quando RESEND_API_KEY está definida");
  }
  // o env já validou o formato no boot; aqui só se chega sem validação em teste
  const remetente = interpretarRemetente(env.EMAIL_FROM);
  if (!remetente) throw new ErroConfiguracao("EMAIL_FROM", `EMAIL_FROM inválido: ${MENSAGEM_REMETENTE_INVALIDO}`);
  return new ResendEmail(env.RESEND_API_KEY, remetente);
}
