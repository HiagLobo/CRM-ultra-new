/**
 * Caso de uso: solicitar acesso ao demo (criar/atualizar lead + disparar código).
 * Sem HTTP — as dependências (store, e-mail, rate-limit, anti-robô) são injetadas,
 * então é testável sem rede/Resend. A rota fina (POST /api/lead) só faz o wiring.
 *
 * Ordem (O7·S1) — do mais barato ao mais caro, e nada é gravado antes de passar:
 * 1. isca (honeypot) preenchida → robô: sucesso falso, nada gravado nem enviado;
 * 2. Turnstile, se ligado → sem pessoa do outro lado, para aqui;
 * 3. limite por e-mail (3/30 min) e por IP (10/30 min), atômicos entre si;
 * 4. provedor de e-mail não sobe (ex.: produção sem RESEND_API_KEY) → grava o
 *    lead SEM código (o fundador liga), sem gastar vaga do teto diário;
 * 5. teto global diário estourado → idem;
 * 6. envio do código falhou ou passou do prazo → idem: nunca perde o contato;
 * 7. e-mail saiu → persiste o código novo.
 */
import type { LeadStore } from "../../lib/leadStore";
import type { ProvedorEmail } from "../../lib/email";
import type { RateLimiter, RegraRate } from "../../lib/ratelimit";
import type { VerificadorHumano } from "../../lib/turnstile";
import type { BrandConfig } from "../../config/brand";
import { causaDoErro } from "../../lib/erros";
import { comPrazo } from "../../lib/prazo";
import type { PedidoAcesso } from "./schema";
import { prepararSolicitacao, type SolicitacaoPreparada } from "./lead";

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
 * e gravamos o lead sem código antes de a plataforma cortar a função.
 */
export const PRAZO_ENVIO_CODIGO_MS = 8_000;

export interface DepsSolicitarAcesso {
  store: LeadStore;
  /**
   * Provedor sob demanda: configuração faltando (ex.: produção sem
   * `RESEND_API_KEY`) também cai no "grava sem código" — nunca num 500.
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

  // 4. provedor antes do teto: config quebrada não gasta vaga do dia (consertada, a cota está lá)
  let provedor: ProvedorEmail;
  try {
    provedor = deps.email();
  } catch (erro) {
    return gravarSemCodigo(prep, "falha_envio", causaDoErro(erro, "email"));
  }

  // 5. teto diário: a cota do provedor acabou para hoje, mas o contato não se perde
  if (!(await deps.limiter.permitir([CHAVE_TETO_DIARIO], regraTetoDiario(deps.limiteEnviosDia), agora))) {
    return gravarSemCodigo(prep, "teto_diario", "teto_diario");
  }

  // 6. envia ANTES de persistir o código: falha não sobrescreve um código válido.
  // Só o tipo do erro vai para a causa — a mensagem pode carregar o destinatário.
  try {
    const envio = provedor.enviarCodigo(input.email, prep.codigo, deps.brand);
    await comPrazo(envio, deps.prazoEnvioMs ?? PRAZO_ENVIO_CODIGO_MS);
  } catch (erro) {
    return gravarSemCodigo(prep, "falha_envio", causaDoErro(erro, "email"));
  }

  await prep.persistir();
  return { status: "enviado", novo: prep.novo, codigo: prep.codigo };
}

/** O e-mail não saiu: o contato fica gravado mesmo assim, e a causa (sem PII) vai para o log. */
async function gravarSemCodigo(
  prep: SolicitacaoPreparada,
  motivo: MotivoSemCodigo,
  causa: string,
): Promise<ResultadoSolicitacao> {
  await prep.persistirSemCodigo();
  return { status: "recebido_sem_codigo", motivo, causa };
}
