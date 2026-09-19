/**
 * Caso de uso: avisar o fundador que entrou lead novo (O7·S1).
 *
 * Um e-mail **sem PII** ("novo lead confirmado" + link do `/admin`) na PRIMEIRA
 * verificação de cada lead. Reverificar (lead que pediu código de novo) não
 * avisa outra vez. Desligado quando `AVISO_LEADS_EMAIL` não está no env.
 *
 * Nunca quebra a verificação: provedor fora do ar, configuração faltando, teto
 * diário ou demora — tudo vira log com a causa, e o corretor entra no demo do
 * mesmo jeito. A rota espera (await): na Vercel, trabalho depois da resposta
 * pode ser cortado.
 */
import type { ProvedorEmail } from "../../lib/email";
import type { RateLimiter } from "../../lib/ratelimit";
import type { BrandConfig } from "../../config/brand";
import type { ResultadoVerificacao } from "./verificacao";
import { CHAVE_TETO_DIARIO, regraTetoDiario } from "./solicitarAcesso";

/** Prazo do aviso — não pode segurar a entrada do corretor no demo. */
export const PRAZO_AVISO_MS = 4_000;

export type ResultadoAviso = "enviado" | "nao_se_aplica" | "teto_diario" | "falhou";

export interface DepsAviso {
  /** Destino (`AVISO_LEADS_EMAIL`). Ausente = aviso desligado. */
  para?: string;
  /** Provedor sob demanda: um erro de configuração também cai no tratamento. */
  email: () => ProvedorEmail;
  limiter: RateLimiter;
  /** O aviso gasta a mesma cota do provedor que o código: conta no mesmo teto. */
  limiteEnviosDia: number;
  brand: BrandConfig;
  agora?: Date;
  prazoMs?: number;
}

function comPrazo<T>(tarefa: Promise<T>, ms: number): Promise<T> {
  let relogio: ReturnType<typeof setTimeout> | undefined;
  const estouro = new Promise<never>((_, rejeitar) => {
    relogio = setTimeout(
      () => rejeitar(Object.assign(new Error("prazo do aviso esgotado"), { name: "PrazoEsgotado" })),
      ms,
    );
  });
  return Promise.race([tarefa, estouro]).finally(() => clearTimeout(relogio));
}

export async function avisarLeadNovo(
  deps: DepsAviso,
  resultado: ResultadoVerificacao,
): Promise<ResultadoAviso> {
  if (!deps.para || resultado.status !== "verificado" || resultado.jaVerificado) {
    return "nao_se_aplica";
  }
  const agora = deps.agora ?? new Date();

  try {
    if (!(await deps.limiter.permitir([CHAVE_TETO_DIARIO], regraTetoDiario(deps.limiteEnviosDia), agora))) {
      console.warn("[aviso-lead] teto diário de e-mails atingido; aviso não enviado (o lead está no /admin)");
      return "teto_diario";
    }
    // só o destino do fundador e a marca: o lead não entra no aviso, nem por engano
    await comPrazo(deps.email().enviarAvisoNovoLead(deps.para, deps.brand), deps.prazoMs ?? PRAZO_AVISO_MS);
    return "enviado";
  } catch (erro) {
    const causa = erro instanceof Error ? erro.name : "desconhecido";
    console.error("[aviso-lead] aviso de lead novo não saiu:", causa);
    return "falhou";
  }
}
