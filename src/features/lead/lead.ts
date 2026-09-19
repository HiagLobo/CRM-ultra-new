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
import { EXPIRACAO_CODIGO_MIN, TEXTO_CONSENTIMENTO } from "./schema";
import type { Canal, StatusLead } from "./funil";
import type { ConferenciaCreci } from "./creci";

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
  /** 1ª verificação do código (selo de e-mail confirmado; nunca re-carimba). */
  verificadoEm?: string;
  /** Última verificação com sucesso — "voltou ao demo" (O9). */
  ultimoAcessoEm?: string;
  /** Conferência do CRECI pelo fundador (O9). Ausente = não conferido. */
  creciConferencia?: ConferenciaCreci;
  creciConferidoEm?: string;
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

/**
 * O que a gravação fez: `criado` = este pedido criou o lead; `mesclado` = o
 * e-mail já tinha lead (antes, ou criado por outro pedido nesse meio).
 */
export type Gravacao = "criado" | "mesclado";

export interface SolicitacaoPreparada extends ResultadoCriacao {
  /**
   * Persiste com o código novo. Separado da preparação para o chamador enviar o
   * e-mail ANTES — um envio que falha não sobrescreve um código válido anterior.
   * Lead que já existia (ou foi criado por outro pedido nesse meio): só o código.
   */
  persistir(): Promise<Gravacao>;
  /**
   * O e-mail não saiu. Só o lead NOVO é gravado (contato + código inutilizado:
   * o lead novo não se perde) → `criado`. E-mail que já tinha lead — antes, ou
   * criado por outro pedido nesse meio — NÃO grava nada (o código e o status
   * que ele já tinha continuam valendo) → `mesclado`: a rota responde 503
   * `envio_indisponivel`, nunca "recebemos seus dados".
   */
  persistirSemCodigo(): Promise<Gravacao>;
}

/** Código novo: o texto puro (só para o envio) e o registro com o hash (o que se grava). */
export function novoCodigo(secret: string, agora: Date): { codigo: string; registro: CodigoVerificacao } {
  const codigo = gerarCodigo();
  return { codigo, registro: montarCodigo(codigo, secret, agora) };
}

/**
 * Cria o lead. Se o e-mail foi criado por outro pedido nesse meio, grava por
 * cima SÓ o código (quando o e-mail saiu) — o contato do outro pedido fica:
 * contato só muda depois de provar o e-mail (O9). Nunca duplica, nunca mexe no status.
 */
async function criarOuMesclar(
  store: LeadStore,
  lead: Lead & { email: string },
  codigo?: CodigoVerificacao,
): Promise<Gravacao> {
  try {
    await store.criar(lead);
    return "criado";
  } catch (err) {
    const atual = await store.buscarPorEmail(lead.email);
    if (!atual) throw err;
    if (codigo) await store.atualizarCodigo(atual.id, { codigo, atualizadoEm: lead.atualizadoEm });
    return "mesclado";
  }
}

/**
 * Monta (em memória, sem persistir) o pedido de acesso com um código novo.
 *
 * E-mail que já tem lead (O9): NÃO regrava nome, telefone, CRECI, origem nem
 * consentimento — quem digita o e-mail de outra pessoa não troca o WhatsApp
 * dela. Só o código muda (`atualizarCodigo`); os dados novos viajam no verify
 * e são aplicados depois do código certo (`atualizacaoCadastro.ts`).
 */
export async function prepararSolicitacao(
  store: LeadStore,
  input: LeadInput,
  ctx: ContextoCriacao,
): Promise<SolicitacaoPreparada> {
  const agora = ctx.agora ?? new Date();
  const { codigo, registro } = novoCodigo(ctx.secret, agora);

  const existente = await store.buscarPorEmail(input.email);
  if (existente) {
    // Só o código: entre ler e gravar há o envio do e-mail, e o lead pode ter
    // verificado o código anterior nesse meio (o carimbo fica — COALESCE).
    return {
      lead: { ...existente, codigo: registro },
      codigo,
      novo: false,
      persistir: async () => {
        await store.atualizarCodigo(existente.id, { codigo: registro, atualizadoEm: agora.toISOString() });
        return "mesclado";
      },
      persistirSemCodigo: async () => "mesclado", // nada gravado
    };
  }

  const lead: Lead & { email: string } = {
    id: randomUUID(),
    nome: input.nome,
    email: input.email,
    telefone: input.telefone,
    creci: input.creci,
    status: "novo",
    canal: "site",
    ...(input.origem ? { origem: input.origem } : {}),
    consentimento: registrarConsentimento(ctx.ip, agora),
    codigo: registro,
    criadoEm: agora.toISOString(),
    atualizadoEm: agora.toISOString(),
  };
  return {
    lead,
    codigo,
    novo: true,
    persistir: () => criarOuMesclar(store, lead, registro),
    // corrida: se outro pedido criou o lead nesse meio, nada é gravado (o código dele fica)
    persistirSemCodigo: () => criarOuMesclar(store, { ...lead, codigo: codigoInutilizado(agora) }),
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
  const gravacao = await prep.persistir();
  return { lead: prep.lead, codigo: prep.codigo, novo: gravacao === "criado" };
}
