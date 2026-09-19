/**
 * O que o pedido de acesso (`solicitarAcesso`) e o "Já tenho cadastro"
 * (`entrar`, O9) fazem igual — separado para as duas portas nunca divergirem:
 *
 * - `portaria`: isca → Turnstile → limite por e-mail e por IP (O7·S1). As
 *   MESMAS chaves de limite nas duas portas: trocar de porta não dá vaga nova;
 * - `enviarComTeto`: provedor → teto diário → envio com prazo.
 *
 * Sem HTTP, dependências injetadas (testável sem rede/Resend).
 */
import type { LeadStore } from "../../lib/leadStore";
import type { ProvedorEmail } from "../../lib/email";
import type { RateLimiter, RegraRate } from "../../lib/ratelimit";
import type { VerificadorHumano } from "../../lib/turnstile";
import type { BrandConfig } from "../../config/brand";
import { causaDoErro } from "../../lib/erros";
import { comPrazo } from "../../lib/prazo";

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

/**
 * Prazo do envio do código. O SDK do Resend não tem timeout: travou, desistimos
 * antes de a plataforma cortar a função.
 */
export const PRAZO_ENVIO_CODIGO_MS = 8_000;

export interface DepsEnvioCodigo {
  store: LeadStore;
  /**
   * Provedor sob demanda: configuração faltando (ex.: produção sem
   * `RESEND_API_KEY`) vira "não enviado" com a causa — nunca um 500.
   */
  email: () => ProvedorEmail;
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
  /** Prazo do envio (testes). Padrão: `PRAZO_ENVIO_CODIGO_MS`. */
  prazoEnvioMs?: number;
}

/** Barrado antes de tocar no lead. `robo`: a rota finge sucesso e nada foi tocado. */
export type Barrado =
  | { status: "robo" }
  | { status: "desafio_recusado" }
  | { status: "desafio_indisponivel" }
  | { status: "limitado" };

/** Os sinais anti-robô que chegam com o pedido (nunca vão para o banco). */
export interface SinaisAntiRobo {
  website?: string;
  turnstileToken?: string;
}

/**
 * Passos 1–3, do mais barato ao mais caro: isca (robô) → Turnstile → limites.
 * `null` = pode seguir, e a vaga do limite já foi gasta — por isso toda
 * consulta ao banco (achar o e-mail, o WhatsApp, o CRECI) vem DEPOIS daqui:
 * nenhuma das portas vira ferramenta de varredura.
 */
export async function portaria(
  deps: DepsEnvioCodigo,
  sinais: SinaisAntiRobo,
  email: string,
  ip: string,
  agora: Date,
): Promise<Barrado | null> {
  // 1. a isca é invisível para gente — preenchida, só pode ser robô
  if (sinais.website?.trim()) return { status: "robo" };

  // 2. anti-robô antes de gastar vaga de rate-limit de quem divide o IP
  if (deps.verificarHumano) {
    const desafio = await deps.verificarHumano(sinais.turnstileToken);
    if (desafio === "recusado") return { status: "desafio_recusado" };
    if (desafio === "indisponivel") return { status: "desafio_indisponivel" };
  }

  // 3. regras separadas, checagem atômica: barrar pelo e-mail não gasta a vaga do IP
  const permitido = await deps.limiter.permitirCada(
    [
      { chave: `email:${email}`, regra: REGRA_ENVIO_POR_EMAIL },
      { chave: `ip:${ip}`, regra: REGRA_ENVIO_POR_IP },
    ],
    agora,
  );
  return permitido ? null : { status: "limitado" };
}

/** Por que o e-mail não saiu. */
export type MotivoSemCodigo = "falha_envio" | "teto_diario";

/** `causa` é categoria segura para log (sem PII): `config:VAR`, `email:<código>`, `teto_diario`… */
export type ResultadoEnvio = { status: "enviado" } | { status: "nao_enviado"; motivo: MotivoSemCodigo; causa: string };

/**
 * Passos 4–6: provedor antes do teto (config quebrada não gasta vaga do dia —
 * consertada, a cota está lá) → teto diário → envio com prazo. Só o tipo do
 * erro vai para a causa: a mensagem pode carregar o destinatário.
 */
export async function enviarComTeto(
  deps: DepsEnvioCodigo,
  para: string,
  codigo: string,
  agora: Date,
): Promise<ResultadoEnvio> {
  let provedor: ProvedorEmail;
  try {
    provedor = deps.email();
  } catch (erro) {
    return { status: "nao_enviado", motivo: "falha_envio", causa: causaDoErro(erro, "email") };
  }

  if (!(await deps.limiter.permitir([CHAVE_TETO_DIARIO], regraTetoDiario(deps.limiteEnviosDia), agora))) {
    return { status: "nao_enviado", motivo: "teto_diario", causa: "teto_diario" };
  }

  try {
    await comPrazo(provedor.enviarCodigo(para, codigo, deps.brand), deps.prazoEnvioMs ?? PRAZO_ENVIO_CODIGO_MS);
  } catch (erro) {
    return { status: "nao_enviado", motivo: "falha_envio", causa: causaDoErro(erro, "email") };
  }
  return { status: "enviado" };
}
