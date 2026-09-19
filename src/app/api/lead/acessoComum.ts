/**
 * O que as duas portas públicas de acesso — POST /api/lead (cadastro) e
 * POST /api/lead/entrar ("Já tenho cadastro", O9) — montam e respondem igual:
 * as dependências do envio do código e as respostas de quem foi barrado antes
 * de tocar no lead (isca, Turnstile, limite). Uma fonte só: as duas portas
 * nunca divergem na resposta ao robô nem no limite.
 *
 * Não é rota (não exporta handler). SERVER-ONLY.
 */
import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/lib/env";
import { brand } from "@/config/brand";
import { leadStore } from "@/lib/criarLeadStore";
import { provedorEmail } from "@/lib/email";
import { rateLimiter } from "@/lib/criarRateLimiter";
import { criarVerificadorTurnstile } from "@/lib/turnstile";
import type { DepsSolicitarAcesso } from "@/features/lead";
import type { Barrado } from "@/features/lead/envioCodigo";

/**
 * Turnstile só com as duas chaves no env (o schema do env recusa uma sem a outra).
 * Em produção, o token também tem de ter sido emitido no domínio da marca.
 */
function verificadorHumano() {
  const secret = env.TURNSTILE_SECRET_KEY;
  if (!secret) return undefined;
  return criarVerificadorTurnstile({
    secret,
    ...(env.NODE_ENV === "production" ? { dominio: brand.dominio } : {}),
  });
}

/** Dependências do envio do código, a partir do env validado. */
export function depsEnvio(): DepsSolicitarAcesso {
  return {
    store: leadStore(),
    email: provedorEmail, // sob demanda: config faltando vira "não enviado" com causa, não 500
    limiter: rateLimiter(),
    brand,
    secret: env.APP_SECRET,
    limiteEnviosDia: env.LIMITE_ENVIOS_DIA,
    verificarHumano: verificadorHumano(),
  };
}

/** Corpo JSON; ilegível → 400 pronto para devolver (mesmo corpo de sempre do /api/lead). */
export async function lerCorpo(req: NextRequest): Promise<{ ok: true; corpo: unknown } | { ok: false; resposta: NextResponse }> {
  try {
    return { ok: true, corpo: await req.json() };
  } catch {
    return { ok: false, resposta: NextResponse.json({ ok: false, erro: "JSON inválido" }, { status: 400 }) };
  }
}

/** 400 com as mensagens por campo do Zod (nenhuma repete o valor recebido). */
export function dadosInvalidos(campos: Record<string, string[] | undefined>): NextResponse {
  return NextResponse.json({ ok: false, erro: "dados inválidos", campos }, { status: 400 });
}

/** Resposta de quem foi barrado antes de qualquer consulta ao lead. */
export function respostaBarrado(r: Barrado): NextResponse {
  switch (r.status) {
    case "robo":
      // sucesso falso: o robô não aprende que foi pego (nada foi gravado nem enviado)
      return NextResponse.json({ ok: true, status: "enviado" });
    case "desafio_recusado":
      return NextResponse.json(
        { ok: false, erro: "verificacao_humana", mensagem: "não foi possível confirmar que você não é um robô" },
        { status: 403 },
      );
    case "desafio_indisponivel":
      return NextResponse.json(
        { ok: false, erro: "verificacao_indisponivel", mensagem: "verificação de segurança indisponível agora" },
        { status: 503 },
      );
    case "limitado":
      return NextResponse.json(
        { ok: false, erro: "muitas solicitações; tente novamente em alguns minutos" },
        { status: 429 },
      );
  }
}

const BARRADOS: ReadonlyArray<string> = ["robo", "desafio_recusado", "desafio_indisponivel", "limitado"];

/** Robô, desafio ou limite? (o resto do resultado é de cada porta) */
export function foiBarrado<T extends { status: string }>(r: T): r is Extract<T, Barrado> {
  return BARRADOS.includes(r.status);
}
