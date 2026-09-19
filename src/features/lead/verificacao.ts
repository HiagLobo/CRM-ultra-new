/**
 * Domínio da verificação do código (sem HTTP, sem rede).
 * A rota POST /api/lead/verify só faz o wiring e emite o cookie do token.
 *
 * SERVER-ONLY (usa crypto). Comparação de hash SEMPRE em tempo constante
 * (`timingSafeEqual`, nunca `===`). PII (e-mail/código) nunca vai a log.
 */
import { timingSafeEqual } from "crypto";
import type { LeadStore } from "../../lib/leadStore";
import type { RateLimiter, RegraRate } from "../../lib/ratelimit";
import { hashCodigo, MAX_TENTATIVAS, SEM_CODIGO, type CodigoVerificacao, type Lead } from "./lead";
import type { VerifyInput } from "./schema";

/**
 * Anti-martelada no endpoint de verificação: 20 tentativas / 10 min por IP.
 * Só por IP — a proteção da conta já é `MAX_TENTATIVAS` (invalida o código);
 * limitar por e-mail deixaria um terceiro travar a retentativa do dono.
 */
export const REGRA_VERIFICACAO: RegraRate = { max: 20, janelaMs: 10 * 60_000 };

export type MotivoFalha = "codigo_invalido" | "expirado" | "tentativas_excedidas";

export type ResultadoVerificacao =
  | { status: "verificado"; email: string; jaVerificado: boolean }
  | { status: "falha"; motivo: MotivoFalha }
  | { status: "limitado" };

export interface DepsVerificacao {
  store: LeadStore;
  limiter: RateLimiter;
  /** APP_SECRET (HMAC do código) — injetado pela rota a partir do env validado. */
  secret: string;
  /** Relógio injetável (testes). */
  agora?: Date;
}

/** Compara dois hashes em tempo constante. Tamanhos diferentes → false (nunca lança). */
function hashesIguais(salvo: string, calculado: string): boolean {
  const a = Buffer.from(salvo, "utf8");
  const b = Buffer.from(calculado, "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

function expirou(codigo: CodigoVerificacao, agora: Date): boolean {
  const limite = Date.parse(codigo.expiraEm);
  // data corrompida no store → trata como expirado (fail-closed), nunca como eterno
  return Number.isNaN(limite) || agora.getTime() >= limite;
}

/**
 * Confere o código do lead e, no sucesso, carimba `verificadoEm` (o selo de
 * e-mail confirmado). A etapa do funil NÃO muda (O8): ela é do admin.
 * Falhas não distinguem "e-mail não cadastrado" de "código errado" — não revelar
 * quem é lead. Idempotente: reverificar não duplica nem re-carimba `verificadoEm`.
 * O `status: "verificado"` do resultado é o desfecho da operação, não a etapa.
 */
export async function verificarCodigo(
  deps: DepsVerificacao,
  input: VerifyInput,
  ctx: { ip: string },
): Promise<ResultadoVerificacao> {
  const agora = deps.agora ?? new Date();

  if (!(await deps.limiter.permitir([`verify:ip:${ctx.ip}`], REGRA_VERIFICACAO, agora))) {
    return { status: "limitado" };
  }

  const lead = await deps.store.buscarPorEmail(input.email);
  if (!lead) return { status: "falha", motivo: "codigo_invalido" };

  if (lead.codigo.tentativas >= MAX_TENTATIVAS) {
    return { status: "falha", motivo: "tentativas_excedidas" };
  }
  if (!lead.codigo.hash) return { status: "falha", motivo: "codigo_invalido" };
  if (expirou(lead.codigo, agora)) return { status: "falha", motivo: "expirado" };

  if (!hashesIguais(lead.codigo.hash, hashCodigo(input.codigo, deps.secret))) {
    return consumirTentativa(deps.store, lead, agora);
  }
  // o lead foi achado por este e-mail: é ele que libera o token
  return marcarVerificado(deps.store, lead, input.email, agora);
}

/** Gasta uma tentativa; ao atingir o limite, invalida o código (anti-força bruta). */
export async function consumirTentativa(
  store: LeadStore,
  lead: Lead,
  agora: Date,
): Promise<ResultadoVerificacao> {
  const tentativas = lead.codigo.tentativas + 1;
  const estourou = tentativas >= MAX_TENTATIVAS;
  await store.atualizarCodigo(lead.id, {
    codigo: { ...lead.codigo, tentativas, hash: estourou ? SEM_CODIGO : lead.codigo.hash },
    atualizadoEm: agora.toISOString(),
  });
  return { status: "falha", motivo: estourou ? "tentativas_excedidas" : "codigo_invalido" };
}

/**
 * Carimba a verificação e consome o código (uso único: um código só libera uma vez).
 * Grava SÓ o código e o carimbo (`atualizarCodigo`): a etapa que o admin der
 * enquanto isso não é desfeita, e quem já tinha carimbo fica com o original.
 */
async function marcarVerificado(
  store: LeadStore,
  lead: Lead,
  email: string,
  agora: Date,
): Promise<ResultadoVerificacao> {
  const jaVerificado = Boolean(lead.verificadoEm);
  await store.atualizarCodigo(lead.id, {
    codigo: { ...lead.codigo, hash: SEM_CODIGO, tentativas: 0 },
    verificadoEm: lead.verificadoEm ?? agora.toISOString(),
    atualizadoEm: agora.toISOString(),
  });
  return { status: "verificado", email, jaVerificado };
}
