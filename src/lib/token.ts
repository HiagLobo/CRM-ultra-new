/**
 * Token de acesso ao demo — HMAC-SHA256 assinado com o APP_SECRET.
 * Formato: `base64url(payload JSON).base64url(assinatura)` — auto-contido, sem
 * sessão em banco. O gate dos painéis (O2·S3) valida este token.
 *
 * O segredo é sempre INJETADO (nunca lido aqui) — mesma regra do `hashCodigo`.
 * SERVER-ONLY (usa crypto).
 */
import { createHmac, timingSafeEqual } from "crypto";

/** Cookie httpOnly que carrega o token (prefixo `crm_`, padrão de storage da O0). */
export const COOKIE_TOKEN_DEMO = "crm_demo";

/** Validade do token, em dias. */
export const VALIDADE_TOKEN_DIAS = 7;

export interface PayloadTokenDemo {
  /** E-mail verificado do lead. */
  email: string;
  /** Expiração — epoch em segundos. */
  exp: number;
}

function assinar(corpo: string, secret: string): string {
  return createHmac("sha256", secret).update(corpo).digest("base64url");
}

function temExpiracao(valor: unknown): valor is Record<string, unknown> & { exp: number } {
  const p = valor as { exp?: unknown } | null;
  return !!p && typeof p === "object" && typeof p.exp === "number" && Number.isFinite(p.exp);
}

/**
 * Assina qualquer payload com prazo de validade. Base comum do token de demo e
 * da sessão do admin (O4) — a cripto fica num lugar só.
 */
export function assinarPayload<T extends object>(
  dados: T,
  secret: string,
  validadeSegundos: number,
  agora: Date = new Date(),
): string {
  const payload = { ...dados, exp: Math.floor(agora.getTime() / 1000) + validadeSegundos };
  const corpo = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  return `${corpo}.${assinar(corpo, secret)}`;
}

/**
 * Valida assinatura (tempo constante) e expiração de um token assinado por
 * `assinarPayload`. Devolve o payload cru ou `null` — qualquer adulteração,
 * corrupção ou vencimento cai em `null`.
 */
export function verificarPayload(
  token: string,
  secret: string,
  agora: Date = new Date(),
): (Record<string, unknown> & { exp: number }) | null {
  const partes = token.split(".");
  if (partes.length !== 2) return null;
  const [corpo, assinatura] = partes;
  if (!corpo || !assinatura) return null;

  const esperada = Buffer.from(assinar(corpo, secret), "utf8");
  const recebida = Buffer.from(assinatura, "utf8");
  if (esperada.length !== recebida.length || !timingSafeEqual(esperada, recebida)) return null;

  try {
    const payload: unknown = JSON.parse(Buffer.from(corpo, "base64url").toString("utf8"));
    if (!temExpiracao(payload)) return null;
    if (Math.floor(agora.getTime() / 1000) >= payload.exp) return null;
    return payload;
  } catch {
    // corpo corrompido → token inválido (sem vazar detalhe do erro)
    return null;
  }
}

/** Emite o token do demo para um e-mail já verificado. */
export function assinarTokenDemo(
  entrada: { email: string },
  secret: string,
  agora: Date = new Date(),
): string {
  return assinarPayload({ email: entrada.email }, secret, VALIDADE_TOKEN_DIAS * 86_400, agora);
}

/** Valida o token do demo. Payload sem e-mail (ex.: sessão de admin) não serve aqui. */
export function verificarTokenDemo(
  token: string,
  secret: string,
  agora: Date = new Date(),
): PayloadTokenDemo | null {
  const payload = verificarPayload(token, secret, agora);
  if (!payload || typeof payload.email !== "string") return null;
  return { email: payload.email, exp: payload.exp };
}
