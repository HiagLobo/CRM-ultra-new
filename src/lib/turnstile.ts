/**
 * Verificação do Cloudflare Turnstile no servidor (O7·S1).
 *
 * O widget na tela entrega um token; só o servidor, com o segredo, pergunta à
 * Cloudflare se aquele token é de uma pessoa. Ligado apenas quando as duas
 * chaves estão no env (`NEXT_PUBLIC_TURNSTILE_SITE_KEY` + `TURNSTILE_SECRET_KEY`).
 *
 * Três respostas, porque "robô" e "Cloudflare fora do ar" pedem mensagens
 * diferentes para a pessoa. Nas duas a porta fica fechada (fail-closed).
 * `fetch` injetável: o teste roda sem rede. O IP do visitante NÃO é enviado
 * (é opcional na API — minimização de dados).
 *
 * SERVER-ONLY (usa o segredo). Token e segredo nunca vão para log.
 */
import { z } from "zod";

export const URL_SITEVERIFY = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export type ResultadoDesafio = "aprovado" | "recusado" | "indisponivel";

/** Quem confere que do outro lado do formulário há uma pessoa. */
export type VerificadorHumano = (token: string | undefined) => Promise<ResultadoDesafio>;

/** Resposta do siteverify — input externo, então passa por Zod como qualquer outro. */
const RespostaSiteverify = z.object({
  success: z.boolean(),
  "error-codes": z.array(z.string()).default([]),
});

/** Códigos que indicam erro NOSSO de configuração, não robô. */
const ERROS_DE_CONFIG = new Set(["missing-input-secret", "invalid-input-secret"]);

export interface OpcoesTurnstile {
  secret: string;
  /** Injetável (testes). Padrão: o `fetch` global. */
  fetch?: typeof fetch;
  /** Prazo da consulta à Cloudflare. Padrão: 5 s. */
  prazoMs?: number;
}

export function criarVerificadorTurnstile(opcoes: OpcoesTurnstile): VerificadorHumano {
  const buscar = opcoes.fetch ?? fetch;
  const prazoMs = opcoes.prazoMs ?? 5_000;

  return async (token) => {
    // sem token nem pergunta: a tela sempre manda um quando o widget está ligado
    if (!token) return "recusado";

    let resposta: Response;
    try {
      resposta = await buscar(URL_SITEVERIFY, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ secret: opcoes.secret, response: token }).toString(),
        signal: AbortSignal.timeout(prazoMs),
      });
    } catch (erro) {
      const causa = erro instanceof Error ? erro.name : "desconhecido";
      console.error("[turnstile] siteverify inacessível:", causa);
      return "indisponivel";
    }

    if (!resposta.ok) {
      console.error("[turnstile] siteverify respondeu HTTP", resposta.status);
      return "indisponivel";
    }
    const corpo = RespostaSiteverify.safeParse(await resposta.json().catch(() => null));
    if (!corpo.success) {
      console.error("[turnstile] resposta fora do formato esperado do siteverify");
      return "indisponivel";
    }
    if (corpo.data.success) return "aprovado";

    const codigos = corpo.data["error-codes"];
    if (codigos.some((c) => ERROS_DE_CONFIG.has(c))) {
      // segredo errado barraria todo mundo como "robô": melhor dizer a verdade
      console.error("[turnstile] segredo recusado pela Cloudflare — confira config:TURNSTILE_SECRET_KEY");
      return "indisponivel";
    }
    console.warn("[turnstile] desafio recusado:", codigos.join(",") || "sem-codigo");
    return "recusado";
  };
}
