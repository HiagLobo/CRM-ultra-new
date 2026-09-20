/**
 * Caso de uso: avisar o fundador que entrou avaliação do demo (O10·S1).
 *
 * Um e-mail **sem PII** (nota + situação + link do `/admin`). Desligado quando
 * `AVISO_LEADS_EMAIL` não está no env.
 *
 * Quando avisa: avaliação NOVA, ou edição que MUDOU a situação do texto (o
 * comentário publicado virou `pendente`, ou o contrário). Editar a nota de uma
 * avaliação que segue publicada não avisa de novo: o fundador já sabe dela, e
 * cada aviso gasta vaga do MESMO teto diário que os códigos de verificação —
 * ficar sem código por causa de aviso repetido seria trocar o essencial pelo
 * acessório.
 *
 * Nunca quebra a avaliação: provedor fora do ar, configuração faltando, teto
 * diário ou demora viram log com a causa, e a avaliação segue gravada. A rota
 * espera (await): na Vercel, trabalho depois da resposta pode ser cortado.
 */
import type { ProvedorEmail } from "../../lib/email";
import type { RateLimiter } from "../../lib/ratelimit";
import type { BrandConfig } from "../../config/brand";
import { causaDoErro } from "../../lib/erros";
import { comPrazo } from "../../lib/prazo";
import { CHAVE_TETO_DIARIO, regraTetoDiario } from "../lead/solicitarAcesso";
import type { ResultadoAvaliar } from "./avaliar";

/** Prazo do aviso — não pode segurar a resposta de quem acabou de avaliar. */
export const PRAZO_AVISO_AVALIACAO_MS = 4_000;

export type ResultadoAvisoAvaliacao = "enviado" | "nao_se_aplica" | "teto_diario" | "falhou";

export interface DepsAvisoAvaliacao {
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

/** Vale a pena avisar? Regra pura, para o teste não precisar de e-mail nenhum. */
export function mereceAviso(resultado: ResultadoAvaliar): boolean {
  if (resultado.status !== "ok") return false;
  return resultado.novo || resultado.statusAnterior !== resultado.avaliacao.status;
}

export async function avisarAvaliacao(
  deps: DepsAvisoAvaliacao,
  resultado: ResultadoAvaliar,
): Promise<ResultadoAvisoAvaliacao> {
  if (!deps.para || resultado.status !== "ok" || !mereceAviso(resultado)) return "nao_se_aplica";
  const agora = deps.agora ?? new Date();
  const { estrelas, status } = resultado.avaliacao;

  try {
    // provedor antes do teto: configuração quebrada não gasta vaga da cota do dia
    const provedor = deps.email();
    if (!(await deps.limiter.permitir([CHAVE_TETO_DIARIO], regraTetoDiario(deps.limiteEnviosDia), agora))) {
      console.warn("[aviso-avaliacao] teto diário de e-mails atingido; aviso não enviado (a avaliação está no /admin)");
      return "teto_diario";
    }
    // só a nota e a situação: quem avaliou e o que escreveu não entram, nem por engano
    await comPrazo(
      provedor.enviarAvisoAvaliacao(deps.para, deps.brand, { estrelas, pendente: status === "pendente" }),
      deps.prazoMs ?? PRAZO_AVISO_AVALIACAO_MS,
    );
    return "enviado";
  } catch (erro) {
    // `config:<VAR>` quando o provedor nem sobe; senão só o tipo do erro (sem PII)
    const causa = causaDoErro(erro, "email");
    console.error("[aviso-avaliacao] aviso de avaliação não saiu:", causa);
    return "falhou";
  }
}
