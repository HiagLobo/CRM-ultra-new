/**
 * Caso de uso: solicitar acesso ao demo (criar/atualizar lead + disparar código).
 * Sem HTTP — as dependências (store, e-mail, rate-limit) são injetadas, então é
 * testável sem rede/Resend. A rota fina (POST /api/lead) só faz o wiring.
 */
import type { LeadStore } from "../../lib/leadStore";
import type { ProvedorEmail } from "../../lib/email";
import type { RateLimiter, RegraRate } from "../../lib/ratelimit";
import type { BrandConfig } from "../../config/brand";
import type { LeadInput } from "./schema";
import { prepararSolicitacao } from "./lead";

/** Anti-abuso/custo: no máx. 3 envios por 30 min, por e-mail e por IP. */
export const REGRA_ENVIO_CODIGO: RegraRate = { max: 3, janelaMs: 30 * 60_000 };

export interface DepsSolicitarAcesso {
  store: LeadStore;
  email: ProvedorEmail;
  limiter: RateLimiter;
  brand: BrandConfig;
  /** APP_SECRET (HMAC do código) — injetado pela rota a partir do env validado. */
  secret: string;
  /** Relógio injetável (testes). */
  agora?: Date;
}

export type ResultadoSolicitacao =
  | { status: "enviado"; novo: boolean; codigo: string }
  | { status: "limitado" };

export async function solicitarAcesso(
  deps: DepsSolicitarAcesso,
  input: LeadInput,
  ctx: { ip: string },
): Promise<ResultadoSolicitacao> {
  const agora = deps.agora ?? new Date();

  // anti-abuso ANTES de criar/enviar: barra por e-mail E por IP (checagem atômica).
  if (!(await deps.limiter.permitir([`email:${input.email}`, `ip:${ctx.ip}`], REGRA_ENVIO_CODIGO, agora))) {
    return { status: "limitado" };
  }

  // prepara em memória → ENVIA → só então persiste. Se o envio falhar, nada é
  // persistido: não sobrescreve um código válido anterior nem cria lead órfão.
  const prep = await prepararSolicitacao(deps.store, input, { ip: ctx.ip, secret: deps.secret, agora });
  await deps.email.enviarCodigo(prep.lead.email, prep.codigo, deps.brand);
  await prep.persistir();

  return { status: "enviado", novo: prep.novo, codigo: prep.codigo };
}
