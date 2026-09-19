/**
 * Domínio da captação de leads (sem HTTP, sem rede).
 *
 * Entidade `Lead` da captação (corretor pedindo acesso ao demo) — distinta do
 * `Lead` mock do funil em src/types. Por isso mora no slice, não no types global.
 *
 * SERVER-ONLY (usa crypto). Código de verificação NUNCA é guardado em texto puro.
 */
import { createHmac, randomInt, randomUUID } from "crypto";
import type { LeadStore } from "../../lib/leadStore";
import type { LeadInput } from "./schema";
import { TEXTO_CONSENTIMENTO } from "./schema";

export type StatusLead = "novo" | "verificado" | "contatado" | "descartado";

export interface Consentimento {
  texto: string;
  aceitoEm: string; // ISO 8601
  ip: string;
}

export interface CodigoVerificacao {
  hash: string;
  expiraEm: string; // ISO 8601
  tentativas: number;
  enviadoEm: string; // ISO 8601
}

export interface Lead {
  id: string;
  email: string;
  telefone: string; // E.164
  creci: string;
  status: StatusLead;
  consentimento: Consentimento;
  codigo: CodigoVerificacao;
  verificadoEm?: string;
  origem?: { utm?: string; ref?: string };
  criadoEm: string;
  atualizadoEm: string;
}

/**
 * Texto da política carimbado no consentimento (LGPD). Definido no `schema.ts`
 * (client-safe) para o formulário exibir o mesmo texto que é gravado; re-exportado
 * aqui porque o domínio é quem carimba.
 */
export { TEXTO_CONSENTIMENTO };

/** Validade do código de verificação, em minutos. */
export const EXPIRACAO_CODIGO_MIN = 10;
/** Máximo de tentativas de verificação por código (anti-força bruta). */
export const MAX_TENTATIVAS = 5;

/** Código numérico de 6 dígitos, cripto-seguro (000000–999999). */
export function gerarCodigo(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

/** HMAC-SHA256 do código com o APP_SECRET — guardamos só o hash, nunca o código. */
export function hashCodigo(codigo: string, secret: string): string {
  return createHmac("sha256", secret).update(codigo).digest("hex");
}

/** Carimba o consentimento: texto da política + timestamp + IP. */
export function registrarConsentimento(ip: string, agora: Date): Consentimento {
  return { texto: TEXTO_CONSENTIMENTO, aceitoEm: agora.toISOString(), ip };
}

function montarCodigo(codigo: string, secret: string, agora: Date): CodigoVerificacao {
  return {
    hash: hashCodigo(codigo, secret),
    expiraEm: new Date(agora.getTime() + EXPIRACAO_CODIGO_MIN * 60_000).toISOString(),
    tentativas: 0,
    enviadoEm: agora.toISOString(),
  };
}

export interface ContextoCriacao {
  ip: string;
  secret: string;
  /** Relógio injetável (testes). Default: agora. */
  agora?: Date;
}

export interface ResultadoCriacao {
  lead: Lead;
  /** Código em texto puro — só para envio (S2)/fallback dev. NUNCA logar/persistir. */
  codigo: string;
  novo: boolean;
}

export interface SolicitacaoPreparada {
  lead: Lead;
  codigo: string;
  novo: boolean;
  /**
   * Persiste a solicitação. Separado da preparação para o chamador poder enviar o
   * e-mail ANTES de persistir — assim um envio que falha não sobrescreve um código
   * válido anterior. Sob corrida (mesmo e-mail criado nesse meio), cai para
   * atualização em vez de duplicar.
   */
  persistir(): Promise<void>;
}

/**
 * Monta (em memória, sem persistir) o lead novo/atualizado com um novo código.
 * Upsert por e-mail; não rebaixa o status de quem já verificou.
 */
export async function prepararSolicitacao(
  store: LeadStore,
  input: LeadInput,
  ctx: ContextoCriacao,
): Promise<SolicitacaoPreparada> {
  const agora = ctx.agora ?? new Date();
  const codigo = gerarCodigo();
  const codigoObj = montarCodigo(codigo, ctx.secret, agora);
  const consentimento = registrarConsentimento(ctx.ip, agora);

  const existente = await store.buscarPorEmail(input.email);
  if (existente) {
    const lead: Lead = {
      ...existente,
      telefone: input.telefone,
      creci: input.creci,
      origem: input.origem ?? existente.origem,
      consentimento,
      codigo: codigoObj,
      atualizadoEm: agora.toISOString(),
    };
    return { lead, codigo, novo: false, persistir: async () => void (await store.atualizar(lead)) };
  }

  const lead: Lead = {
    id: randomUUID(),
    email: input.email,
    telefone: input.telefone,
    creci: input.creci,
    status: "novo",
    consentimento,
    codigo: codigoObj,
    origem: input.origem,
    criadoEm: agora.toISOString(),
    atualizadoEm: agora.toISOString(),
  };
  return {
    lead,
    codigo,
    novo: true,
    persistir: async () => {
      try {
        await store.criar(lead);
      } catch (err) {
        // corrida: e-mail criado por outro request nesse meio → atualiza, não duplica
        const atual = await store.buscarPorEmail(lead.email);
        if (!atual) throw err;
        await store.atualizar({ ...lead, id: atual.id, criadoEm: atual.criadoEm });
      }
    },
  };
}

/**
 * Cria/atualiza o lead e persiste de imediato (upsert por e-mail). Conveniência
 * para quem não precisa intercalar envio entre preparar e persistir.
 */
export async function criarOuAtualizarLead(
  store: LeadStore,
  input: LeadInput,
  ctx: ContextoCriacao,
): Promise<ResultadoCriacao> {
  const prep = await prepararSolicitacao(store, input, ctx);
  await prep.persistir();
  return { lead: prep.lead, codigo: prep.codigo, novo: prep.novo };
}
