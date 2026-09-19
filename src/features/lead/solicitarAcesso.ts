/**
 * Caso de uso: solicitar acesso ao demo (criar/atualizar lead + disparar código).
 * Sem HTTP — as dependências (store, e-mail, rate-limit, anti-robô) são injetadas,
 * então é testável sem rede/Resend. A rota fina (POST /api/lead) só faz o wiring.
 *
 * Ordem (O7·S1) — do mais barato ao mais caro, e nada é gravado antes de passar:
 * 1. isca (honeypot) preenchida → robô: sucesso falso, nada gravado nem enviado;
 * 2. Turnstile, se ligado → sem pessoa do outro lado, para aqui;
 * 3. limite por e-mail (3/30 min) e por IP (10/30 min), atômicos entre si;
 * 4. teto global diário estourado → grava o lead SEM código (o fundador liga);
 * 5. envio do código falhou → idem: grava sem código, nunca perde o contato;
 * 6. e-mail saiu → persiste o código novo.
 */
import type { LeadStore } from "../../lib/leadStore";
import type { ProvedorEmail } from "../../lib/email";
import type { RateLimiter, RegraRate } from "../../lib/ratelimit";
import type { VerificadorHumano } from "../../lib/turnstile";
import type { BrandConfig } from "../../config/brand";
import type { PedidoAcesso } from "./schema";
import { prepararSolicitacao } from "./lead";

const JANELA_ENVIO_MS = 30 * 60_000;

/** Por e-mail: 3 envios / 30 min — protege a caixa de quem recebe (e a cota). */
export const REGRA_ENVIO_POR_EMAIL: RegraRate = { max: 3, janelaMs: JANELA_ENVIO_MS };
/** Por IP: 10 envios / 30 min — escritório e CGNAT móvel dividem o mesmo IP. */
export const REGRA_ENVIO_POR_IP: RegraRate = { max: 10, janelaMs: JANELA_ENVIO_MS };

/** Teto global: uma chave só (sem PII), janela de 24h. Conta TODO e-mail do app. */
export const CHAVE_TETO_DIARIO = "global:envio:dia";
const JANELA_TETO_DIARIO_MS = 24 * 60 * 60_000;

/** Regra do teto diário — o máximo vem do env (`LIMITE_ENVIOS_DIA`). */
export function regraTetoDiario(max: number): RegraRate {
  return { max, janelaMs: JANELA_TETO_DIARIO_MS };
}

export interface DepsSolicitarAcesso {
  store: LeadStore;
  email: ProvedorEmail;
  limiter: RateLimiter;
  brand: BrandConfig;
  /** APP_SECRET (HMAC do código) — injetado pela rota a partir do env validado. */
  secret: string;
  /** Máximo de e-mails do app em 24h (`LIMITE_ENVIOS_DIA`). */
  limiteEnviosDia: number;
  /** Turnstile. Ausente = não exigido (as chaves não estão no env). */
  verificarHumano?: VerificadorHumano;
  /** Relógio injetável (testes). */
  agora?: Date;
}

/** Por que o e-mail não saiu (o lead foi gravado mesmo assim). */
export type MotivoSemCodigo = "falha_envio" | "teto_diario";

export type ResultadoSolicitacao =
  | { status: "enviado"; novo: boolean; codigo: string }
  /** Lead gravado, e-mail não saiu. `causa` é categoria segura para log (sem PII). */
  | { status: "recebido_sem_codigo"; motivo: MotivoSemCodigo; causa: string }
  | { status: "limitado" }
  /** Isca preenchida: a rota finge sucesso e nada foi tocado. */
  | { status: "robo" }
  | { status: "desafio_recusado" }
  | { status: "desafio_indisponivel" };

export async function solicitarAcesso(
  deps: DepsSolicitarAcesso,
  pedido: PedidoAcesso,
  ctx: { ip: string },
): Promise<ResultadoSolicitacao> {
  const agora = deps.agora ?? new Date();
  const { website, turnstileToken, ...input } = pedido;

  // 1. a isca é invisível para gente — preenchida, só pode ser robô
  if (website?.trim()) return { status: "robo" };

  // 2. anti-robô antes de gastar vaga de rate-limit de quem divide o IP
  if (deps.verificarHumano) {
    const desafio = await deps.verificarHumano(turnstileToken);
    if (desafio === "recusado") return { status: "desafio_recusado" };
    if (desafio === "indisponivel") return { status: "desafio_indisponivel" };
  }

  // 3. regras separadas, checagem atômica: barrar pelo e-mail não gasta a vaga do IP
  const permitido = await deps.limiter.permitirCada(
    [
      { chave: `email:${input.email}`, regra: REGRA_ENVIO_POR_EMAIL },
      { chave: `ip:${ctx.ip}`, regra: REGRA_ENVIO_POR_IP },
    ],
    agora,
  );
  if (!permitido) return { status: "limitado" };

  const prep = await prepararSolicitacao(deps.store, input, { ip: ctx.ip, secret: deps.secret, agora });

  // 4. teto diário: a cota do provedor acabou para hoje, mas o contato não se perde
  if (!(await deps.limiter.permitir([CHAVE_TETO_DIARIO], regraTetoDiario(deps.limiteEnviosDia), agora))) {
    await prep.persistirSemCodigo();
    return { status: "recebido_sem_codigo", motivo: "teto_diario", causa: "teto_diario" };
  }

  // 5. envia ANTES de persistir o código: falha não sobrescreve um código válido
  try {
    await deps.email.enviarCodigo(prep.lead.email, prep.codigo, deps.brand);
  } catch (erro) {
    // só o tipo do erro — a mensagem de um erro qualquer pode carregar o destinatário
    const causa = `email:${erro instanceof Error ? erro.name : "desconhecido"}`;
    await prep.persistirSemCodigo();
    return { status: "recebido_sem_codigo", motivo: "falha_envio", causa };
  }

  await prep.persistir();
  return { status: "enviado", novo: prep.novo, codigo: prep.codigo };
}
