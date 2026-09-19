/**
 * Chamadas do fluxo de acesso às rotas da O1 — a única parte do fluxo que fala
 * HTTP. Traduz cada resposta num estado fechado, para os componentes só
 * decidirem o que mostrar (nada de checar `res.status` espalhado pela UI).
 * O "Já tenho cadastro" e o reenvio do código moram em `apiEntrar.ts` (O9·S2).
 *
 * Regra: PII (nome, e-mail, telefone, CRECI, código, dica) NUNCA vai para o console.
 */
import type { MotivoFalha } from "@/features/lead/verificacao";
import { limparOrigem, type OrigemCampanha } from "@/lib/origemCampanha";
import { MENSAGEM_ENVIO_INDISPONIVEL, type CampoNaoAtualizado } from "./mensagens";

export interface DadosSolicitacao {
  /** Nome completo (O9), já normalizado pelo `nomeSchema`. */
  nome: string;
  email: string;
  telefone: string;
  /** "UF NÚMERO" canônico (O9: UF obrigatória no cadastro público). */
  creci: string;
  consentimento: true;
  /** Campanha que trouxe a pessoa (O8·S3) — o reenvio do código manda a mesma. */
  origem?: OrigemCampanha;
}

/** Dados novos de quem já tinha cadastro (O9): vão no `verify` e só valem DEPOIS do código certo. */
export interface Atualizacao {
  nome: string;
  telefone: string;
  creci: string;
}

/** Sinais anti-robô (O7·S1) — vão junto do pedido, mas não são dado do lead. */
export interface AntiRobo {
  /** Campo-isca: gente deixa vazio. */
  website?: string;
  /** Token do Cloudflare Turnstile, quando o widget está ligado. */
  turnstileToken?: string;
}

/** Respostas que o `/api/lead` e o `/api/lead/entrar` dão do mesmo jeito. */
export type FalhaComum =
  /**
   * Anti-robô recusou (refazer a verificação) ou está fora do ar. Fora do ar,
   * nada foi gravado e só esperar não resolve: `whatsapp` pede a saída na tela.
   */
  | { status: "desafio"; mensagem: string; whatsapp?: true }
  | { status: "limitado"; mensagem: string }
  | { status: "invalido"; mensagem: string; campos?: Record<string, string[] | undefined> }
  /** Falha do servidor ou da rede: o pedido pode não ter sido gravado — a tela oferece o WhatsApp. */
  | { status: "erro"; mensagem: string; whatsapp: true };

export type ResultadoSolicitar =
  /** `existente` (O9): o e-mail já tinha cadastro — nada foi regravado; o código é para entrar. */
  | { status: "enviado"; codigoDev?: string; existente: boolean }
  /** Lead NOVO gravado, e-mail do código não saiu. `existente` é defesa: o 202 é só de e-mail novo. */
  | { status: "recebido_sem_codigo"; mensagem: string; existente: boolean }
  /** 503 (emenda O9): e-mail que já existia e o código não saiu — nada gravado; a tela oferece o WhatsApp. */
  | { status: "envio_indisponivel"; mensagem: string }
  /** WhatsApp de outro cadastro (O9); `dica` = e-mail mascarado do dono, `null` se ele não tem e-mail. */
  | { status: "telefone_em_uso"; dica: string | null }
  /** CRECI de outro cadastro (O9) — sem dica: o CRECI é público. */
  | { status: "creci_em_uso" }
  | FalhaComum;

export type ResultadoVerificar =
  /** `naoAtualizados` (O9): dados novos que já estavam em outro cadastro e ficaram como eram. */
  | { status: "verificado"; naoAtualizados?: CampoNaoAtualizado[] }
  | { status: "falha"; motivo: MotivoFalha | "limitado"; mensagem: string }
  | { status: "invalido"; mensagem: string }
  | { status: "erro"; mensagem: string };

const ERRO_REDE = "não deu para falar com o servidor. Verifique sua conexão e tente de novo.";
const ERRO_SERVIDOR = "algo falhou do nosso lado. Tente novamente em instantes.";
/** Falha de rede: o pedido nem chegou — mesma saída (WhatsApp) em qualquer chamada. */
export const FALHA_REDE: FalhaComum = { status: "erro", mensagem: ERRO_REDE, whatsapp: true };

/** Mensagem honesta do "recebido sem código": o contato ficou, o e-mail não saiu. */
export const MENSAGEM_SEM_CODIGO =
  "Recebemos seus dados. O e-mail com o código não saiu agora. Tente reenviar em alguns minutos ou fale com a gente.";
const DESAFIO_RECUSADO = "não conseguimos confirmar que você é uma pessoa. Refaça a verificação e tente de novo.";
const DESAFIO_FORA = "a verificação de segurança está fora do ar agora. Tente de novo em instantes ou fale com a gente.";
// o limite é por e-mail E por rede: a pessoa pode não ter pedido nada ainda
const LIMITADO = "muitos pedidos de código em pouco tempo (deste e-mail ou desta rede). Aguarde alguns minutos e tente de novo.";

/** Faz o POST e devolve `{ res, corpo }`; `corpo` é `{}` se a resposta não for JSON. */
export async function postar(url: string, dados: unknown): Promise<{ res: Response; corpo: any } | null> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    });
    let corpo: any = {};
    try {
      corpo = await res.json();
    } catch {
      corpo = {};
    }
    return { res, corpo };
  } catch {
    // falha de rede: sem detalhes no console (a mensagem já vira estado na tela)
    return null;
  }
}

/** Isca e token só quando existem: campo vazio é omitido, nunca `""`. */
export function sinaisAntiRobo(antiRobo: AntiRobo): AntiRobo {
  return {
    ...(antiRobo.website ? { website: antiRobo.website } : {}),
    ...(antiRobo.turnstileToken ? { turnstileToken: antiRobo.turnstileToken } : {}),
  };
}

export function codigoDevDe(corpo: any): string | undefined {
  return typeof corpo?.codigoDev === "string" ? corpo.codigoDev : undefined;
}

/** Anti-robô, limite, dados inválidos e o resto — iguais no cadastro e no "entrar". */
export function falhaComum(res: Response, corpo: any): FalhaComum {
  if (corpo?.erro === "verificacao_humana") return { status: "desafio", mensagem: DESAFIO_RECUSADO };
  if (corpo?.erro === "verificacao_indisponivel") return { status: "desafio", mensagem: DESAFIO_FORA, whatsapp: true };
  if (res.status === 429) return { status: "limitado", mensagem: LIMITADO };
  if (res.status === 400) return { status: "invalido", mensagem: "confira os dados informados.", campos: corpo?.campos };
  return { status: "erro", mensagem: ERRO_SERVIDOR, whatsapp: true };
}

/** A dica é texto pronto do servidor (e-mail mascarado); qualquer outra coisa vira "sem dica". */
function dicaDe(corpo: any): string | null {
  const dica = typeof corpo?.dica === "string" ? corpo.dica.trim() : "";
  return dica ? dica.slice(0, 254) : null;
}

/**
 * `POST /api/lead` — cadastra e dispara o código por e-mail (e-mail que já
 * existe: só manda o código, `existente: true`). A origem vai só com campo
 * preenchido: vazio é omitido, nunca `""`.
 */
export async function solicitarAcesso(dados: DadosSolicitacao, antiRobo: AntiRobo = {}): Promise<ResultadoSolicitar> {
  const { origem, ...lead } = dados;
  const origemLimpa = limparOrigem(origem);
  const r = await postar("/api/lead", {
    ...lead,
    ...(origemLimpa ? { origem: origemLimpa } : {}),
    ...sinaisAntiRobo(antiRobo),
  });
  if (!r) return FALHA_REDE;
  const { res, corpo } = r;

  if (res.ok && corpo?.ok) {
    if (res.status === 202 || corpo.status === "recebido_sem_codigo") {
      return { status: "recebido_sem_codigo", mensagem: MENSAGEM_SEM_CODIGO, existente: corpo.existente === true };
    }
    // robô leva um 200 falso sem `existente`: conta como cadastro novo
    return { status: "enviado", codigoDev: codigoDevDe(corpo), existente: corpo.existente === true };
  }
  if (corpo?.erro === "telefone_em_uso") return { status: "telefone_em_uso", dica: dicaDe(corpo) };
  if (corpo?.erro === "creci_em_uso") return { status: "creci_em_uso" };
  if (corpo?.erro === "envio_indisponivel") return { status: "envio_indisponivel", mensagem: MENSAGEM_ENVIO_INDISPONIVEL };
  return falhaComum(res, corpo);
}

const CAMPOS_NAO_ATUALIZAVEIS: readonly CampoNaoAtualizado[] = ["telefone", "creci"];

/** `naoAtualizados` da resposta, só com os campos conhecidos e sem repetição. */
function naoAtualizadosDe(corpo: any): CampoNaoAtualizado[] {
  const lista: unknown[] = Array.isArray(corpo?.naoAtualizados) ? corpo.naoAtualizados : [];
  return CAMPOS_NAO_ATUALIZAVEIS.filter((c) => lista.includes(c));
}

/**
 * `POST /api/lead/verify` — confere o código e recebe o cookie de acesso ao demo.
 * Com `atualizacao` (O9), o servidor aplica os dados novos depois do código certo.
 */
export async function verificarCodigo(email: string, codigo: string, atualizacao?: Atualizacao): Promise<ResultadoVerificar> {
  const r = await postar("/api/lead/verify", { email, codigo, ...(atualizacao ? { atualizacao } : {}) });
  if (!r) return { status: "erro", mensagem: ERRO_REDE };
  const { res, corpo } = r;

  if (res.ok && corpo?.ok) {
    const naoAtualizados = naoAtualizadosDe(corpo);
    return naoAtualizados.length > 0 ? { status: "verificado", naoAtualizados } : { status: "verificado" };
  }

  const erro = typeof corpo?.erro === "string" ? corpo.erro : "";
  const mensagem = typeof corpo?.mensagem === "string" ? corpo.mensagem : ERRO_SERVIDOR;

  if (erro === "codigo_invalido" || erro === "expirado" || erro === "tentativas_excedidas" || erro === "limitado") {
    return { status: "falha", motivo: erro, mensagem };
  }
  if (erro === "dados_invalidos" || erro === "json_invalido") {
    return { status: "invalido", mensagem: "digite os 6 números do código." };
  }
  return { status: "erro", mensagem: ERRO_SERVIDOR };
}
