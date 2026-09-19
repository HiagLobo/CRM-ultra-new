/**
 * Chamadas do fluxo de acesso às rotas da O1 — a única parte do fluxo que fala
 * HTTP. Traduz cada resposta num estado fechado, para os componentes só
 * decidirem o que mostrar (nada de checar `res.status` espalhado pela UI).
 *
 * Regra: PII (e-mail, telefone, CRECI, código) NUNCA vai para o console.
 */
import type { MotivoFalha } from "@/features/lead/verificacao";

export interface DadosSolicitacao {
  email: string;
  telefone: string;
  creci: string;
  consentimento: true;
}

export type ResultadoSolicitar =
  | { status: "enviado"; codigoDev?: string }
  | { status: "limitado"; mensagem: string }
  | { status: "invalido"; mensagem: string; campos?: Record<string, string[] | undefined> }
  | { status: "erro"; mensagem: string };

export type ResultadoVerificar =
  | { status: "verificado" }
  | { status: "falha"; motivo: MotivoFalha | "limitado"; mensagem: string }
  | { status: "invalido"; mensagem: string }
  | { status: "erro"; mensagem: string };

const ERRO_REDE = "não deu para falar com o servidor. Verifique sua conexão e tente de novo.";
const ERRO_SERVIDOR = "algo falhou do nosso lado. Tente novamente em instantes.";

/** Faz o POST e devolve `{ res, corpo }`; `corpo` é `{}` se a resposta não for JSON. */
async function postar(url: string, dados: unknown): Promise<{ res: Response; corpo: any } | null> {
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

/** `POST /api/lead` — cria/atualiza o lead e dispara o código por e-mail. */
export async function solicitarAcesso(dados: DadosSolicitacao): Promise<ResultadoSolicitar> {
  const r = await postar("/api/lead", dados);
  if (!r) return { status: "erro", mensagem: ERRO_REDE };
  const { res, corpo } = r;

  if (res.ok && corpo?.ok) {
    return { status: "enviado", codigoDev: typeof corpo.codigoDev === "string" ? corpo.codigoDev : undefined };
  }
  if (res.status === 429) {
    return {
      status: "limitado",
      mensagem: "você já pediu o código algumas vezes. Aguarde alguns minutos e tente de novo.",
    };
  }
  if (res.status === 400) {
    return {
      status: "invalido",
      mensagem: "confira os dados informados.",
      campos: corpo?.campos,
    };
  }
  return { status: "erro", mensagem: ERRO_SERVIDOR };
}

/** `POST /api/lead/verify` — confere o código e recebe o cookie de acesso ao demo. */
export async function verificarCodigo(email: string, codigo: string): Promise<ResultadoVerificar> {
  const r = await postar("/api/lead/verify", { email, codigo });
  if (!r) return { status: "erro", mensagem: ERRO_REDE };
  const { res, corpo } = r;

  if (res.ok && corpo?.ok) return { status: "verificado" };

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
