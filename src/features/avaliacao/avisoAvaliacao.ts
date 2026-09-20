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
 * Dois tetos, conferidos JUNTOS e de forma atômica: o teto diário do app
 * (o mesmo dos códigos de verificação) e um teto só do aviso. Sem o segundo,
 * uma pessoa com o demo liberado poderia gastar a cota do dia inteira
 * alternando a situação da própria avaliação — e aí ninguém mais receberia
 * código para entrar. Estourou qualquer um dos dois: o aviso não sai, a
 * avaliação segue gravada e o fundador a vê no `/admin`.
 *
 * Nunca quebra a avaliação: provedor fora do ar, configuração faltando, teto
 * ou demora viram log com a causa, e a avaliação segue gravada. A rota
 * espera (await): na Vercel, trabalho depois da resposta pode ser cortado.
 */
import type { ProvedorEmail } from "../../lib/email";
import type { RateLimiter, RegraRate } from "../../lib/ratelimit";
import type { BrandConfig } from "../../config/brand";
import { causaDoErro } from "../../lib/erros";
import { comPrazo } from "../../lib/prazo";
import { CHAVE_TETO_DIARIO, regraTetoDiario } from "../lead/solicitarAcesso";
import type { ResultadoAvaliar } from "./avaliar";

/** Prazo do aviso — não pode segurar a resposta de quem acabou de avaliar. */
export const PRAZO_AVISO_AVALIACAO_MS = 4_000;

/** Teto SÓ dos avisos de avaliação: 10 por dia, chave própria, sem PII. */
export const CHAVE_TETO_AVISO = "avaliacao:aviso:dia";
export const REGRA_TETO_AVISO: RegraRate = { max: 10, janelaMs: 24 * 60 * 60_000 };

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
    // tudo ou nada: barrar por um teto não consome a vaga do outro
    const dentroDosTetos = await deps.limiter.permitirCada(
      [
        { chave: CHAVE_TETO_DIARIO, regra: regraTetoDiario(deps.limiteEnviosDia) },
        { chave: CHAVE_TETO_AVISO, regra: REGRA_TETO_AVISO },
      ],
      agora,
    );
    if (!dentroDosTetos) {
      console.warn("[aviso-avaliacao] teto diário atingido; aviso não enviado (a avaliação está no /admin)");
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
