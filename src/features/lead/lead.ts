/**
 * Domínio da captação de leads (sem HTTP, sem rede).
 *
 * Entidade `Lead` da captação (corretor pedindo acesso ao demo) — distinta do
 * `Lead` mock do funil em src/types. Por isso mora no slice, não no types global.
 *
 * SERVER-ONLY (usa crypto). Código de verificação NUNCA é guardado em texto puro.
 */
import { createHmac, randomInt, randomUUID } from "crypto";
import type { AtualizacaoContato, LeadStore } from "../../lib/leadStore";
import type { LeadInput } from "./schema";
import { EXPIRACAO_CODIGO_MIN, TEXTO_CONSENTIMENTO } from "./schema";
import type { Canal, StatusLead } from "./funil";

/** A etapa do funil (O8) mora em `funil.ts` (client-safe); re-exportada aqui por compatibilidade. */
export type { StatusLead } from "./funil";

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
  /** Ausente só no lead cadastrado à mão sem e-mail (O8). */
  email?: string;
  telefone: string; // E.164
  /** Forma canônica; vazio no lead cadastrado à mão sem CRECI. */
  creci: string;
  /** Etapa do funil. A verificação do e-mail NÃO mexe aqui (é o selo `verificadoEm`). */
  status: StatusLead;
  nome?: string;
  canal: Canal;
  /** Dia (`AAAA-MM-DD`) de retomar — só na etapa "retomar". */
  retomarEm?: string;
  /** Motivo de "retomar" ou "perdido". */
  motivo?: string;
  /** Próxima ação: o dia (`AAAA-MM-DD`) e o que fazer. */
  proximaAcaoEm?: string;
  proximaAcao?: string;
  consentimento: Consentimento;
  codigo: CodigoVerificacao;
  verificadoEm?: string;
  origem?: { utm?: string; ref?: string };
  criadoEm: string;
  atualizadoEm: string;
}

/**
 * Texto do consentimento (LGPD) e validade do código moram no `schema.ts`
 * (client-safe: a tela mostra o mesmo que é gravado); o domínio, que carimba, re-exporta.
 */
export { TEXTO_CONSENTIMENTO, EXPIRACAO_CODIGO_MIN };
/** Máximo de tentativas de verificação por código (anti-força bruta). */
export const MAX_TENTATIVAS = 5;

/** Código consumido/inutilizado: string vazia nunca casa com um HMAC (64 hex). */
export const SEM_CODIGO = "";

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

/** Código que nunca valida (sem hash, já vencido); datas = a tentativa de envio (colunas NOT NULL). */
export function codigoInutilizado(agora: Date): CodigoVerificacao {
  return { hash: SEM_CODIGO, expiraEm: agora.toISOString(), tentativas: 0, enviadoEm: agora.toISOString() };
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

export interface SolicitacaoPreparada extends ResultadoCriacao {
  /**
   * Persiste com o código novo. Separado da preparação para o chamador enviar o
   * e-mail ANTES — um envio que falha não sobrescreve um código válido anterior.
   */
  persistir(): Promise<void>;
  /**
   * Persiste o contato SEM o código novo (o e-mail não saiu): o lead não se perde.
   * Lead novo nasce com o código inutilizado; lead existente mantém o código e o
   * status que já tinha (um código válido continua valendo; nunca rebaixa).
   */
  persistirSemCodigo(): Promise<void>;
}

/**
 * Cria o lead; se o e-mail já foi criado por outro request nesse meio, grava só
 * o contato (e o código, se vier) por cima — nunca duplica, nunca mexe no status.
 */
async function criarOuMesclar(
  store: LeadStore,
  lead: Lead & { email: string },
  contato: AtualizacaoContato,
): Promise<void> {
  try {
    await store.criar(lead);
  } catch (err) {
    const atual = await store.buscarPorEmail(lead.email);
    if (!atual) throw err;
    await store.atualizarContato(atual.id, contato);
  }
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
  // contato e consentimento sempre atualizados; o código só troca se o e-mail sair
  const origem = input.origem ?? existente?.origem;
  const contato: AtualizacaoContato = {
    telefone: input.telefone,
    creci: input.creci,
    ...(origem ? { origem } : {}),
    consentimento,
    atualizadoEm: agora.toISOString(),
  };

  if (existente) {
    // Grava só as colunas de contato (+ código): entre ler e gravar há o envio do
    // e-mail, e o lead pode ter verificado o código anterior nesse meio.
    return {
      lead: { ...existente, ...contato, codigo: codigoObj },
      codigo,
      novo: false,
      persistir: () => store.atualizarContato(existente.id, { ...contato, codigo: codigoObj }),
      persistirSemCodigo: () => store.atualizarContato(existente.id, contato),
    };
  }

  const lead: Lead & { email: string } = {
    id: randomUUID(),
    email: input.email,
    status: "novo",
    canal: "site",
    ...contato,
    codigo: codigoObj,
    criadoEm: agora.toISOString(),
  };
  return {
    lead,
    codigo,
    novo: true,
    persistir: () => criarOuMesclar(store, lead, { ...contato, codigo: codigoObj }),
    // corrida: se outro request criou o lead nesse meio, o código dele é preservado
    persistirSemCodigo: () => criarOuMesclar(store, { ...lead, codigo: codigoInutilizado(agora) }, contato),
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
