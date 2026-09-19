/**
 * Sessão do admin (O4·S1) — a porta que protege a lista de leads (PII).
 *
 * Senha única via env (`ADMIN_PASSWORD`), comparada em tempo constante; sessão
 * em cookie httpOnly assinado com `APP_SECRET`, reusando o mesmo HMAC do token
 * de demo (`assinarPayload`/`verificarPayload`).
 *
 * SERVER-ONLY. A senha NUNCA aparece em log, resposta ou cookie — o que vai no
 * cookie é só `{ adm: true, exp }` assinado.
 */
import { timingSafeEqual } from "crypto";
import { NextResponse, type NextRequest } from "next/server";
import { env } from "./env";
import { assinarPayload, verificarPayload } from "./token";
import type { RegraRate } from "./ratelimit";

/** Cookie da sessão do admin (prefixo `crm_` — padrão de storage da O0). */
export const COOKIE_ADMIN = "crm_admin";

/** Duração da sessão do admin, em horas. */
export const VALIDADE_SESSAO_H = 12;

/** Anti brute-force no login: 5 tentativas / 5 min por IP. */
export const REGRA_LOGIN_ADMIN: RegraRate = { max: 5, janelaMs: 5 * 60_000 };

/** Compara a senha em tempo constante. Tamanhos diferentes → false (nunca lança). */
export function verificarSenha(informada: string, esperada: string): boolean {
  const a = Buffer.from(informada, "utf8");
  const b = Buffer.from(esperada, "utf8");
  if (a.length === 0 || a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/** Emite a sessão do admin (12h). O payload não carrega nada além da expiração. */
export function criarSessaoAdmin(secret: string, agora: Date = new Date()): string {
  return assinarPayload({ adm: true }, secret, VALIDADE_SESSAO_H * 3600, agora);
}

/** A sessão é válida (assinatura + prazo + marca de admin)? */
export function sessaoAdminValida(
  token: string | undefined,
  secret: string,
  agora: Date = new Date(),
): boolean {
  if (!token) return false;
  const payload = verificarPayload(token, secret, agora);
  return payload?.adm === true;
}

/** Resposta padrão de acesso negado — genérica, sem revelar o motivo. */
export function respostaNaoAutorizado(): NextResponse {
  return NextResponse.json({ ok: false, erro: "nao_autorizado" }, { status: 401 });
}

/**
 * Portão de TODA rota `/api/admin/*`: devolve `null` quando autorizado, ou a
 * resposta 401 pronta para o handler retornar. Lê o `APP_SECRET` já validado
 * no boot (as funções puras acima recebem o secret injetado, para teste).
 */
export function exigirAdmin(req: NextRequest): NextResponse | null {
  const token = req.cookies.get(COOKIE_ADMIN)?.value;
  return sessaoAdminValida(token, env.APP_SECRET) ? null : respostaNaoAutorizado();
}

/** Opções do cookie de sessão — `maxAge` 0 encerra a sessão. */
export function opcoesCookieAdmin(maxAgeSegundos: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: env.NODE_ENV === "production",
    path: "/",
    maxAge: maxAgeSegundos,
  };
}
