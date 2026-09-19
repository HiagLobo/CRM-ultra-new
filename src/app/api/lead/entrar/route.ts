/**
 * POST /api/lead/entrar — "Já tenho cadastro" (O9): só o e-mail; manda o código
 * para quem já é lead. Rota fina: valida (Zod) e delega ao caso de uso `entrar`
 * (isca, Turnstile, limites — as MESMAS chaves do /api/lead —, teto e envio).
 * Sem PII em log/response. Em dev (sem Resend), devolve `codigoDev`.
 *
 * Respostas:
 * - 200 `{ ok, status: "enviado" }` — o e-mail saiu (ou robô: sucesso falso);
 * - 404 `{ ok: false, erro: "sem_cadastro" }` — a tela oferece o cadastro (F4);
 * - 503 `{ ok: false, erro: "envio_indisponivel" }` — provedor fora, falha/prazo do
 *   envio ou teto diário (nada é gravado: o lead já existe);
 * - 400 dados inválidos · 403 anti-robô recusou · 429 limite · 503
 *   `verificacao_indisponivel` (Turnstile fora do ar) · 500 — como no /api/lead.
 */
import { NextResponse, type NextRequest } from "next/server";
import { emailModoDev } from "@/lib/env";
import { ipDaRequisicao } from "@/lib/req";
import { causaDoErro } from "@/lib/erros";
import { EntrarSchema, entrar } from "@/features/lead";
import { dadosInvalidos, depsEnvio, foiBarrado, lerCorpo, respostaBarrado } from "../acessoComum";

export const runtime = "nodejs"; // store/crypto exigem runtime Node (não Edge)
/** Mesmo teto do /api/lead: Turnstile + envio do código + banco cabem com folga. */
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const lido = await lerCorpo(req);
  if (!lido.ok) return lido.resposta;

  const parsed = EntrarSchema.safeParse(lido.corpo);
  if (!parsed.success) return dadosInvalidos(parsed.error.flatten().fieldErrors);

  try {
    const resultado = await entrar(depsEnvio(), parsed.data, { ip: ipDaRequisicao(req) });
    if (foiBarrado(resultado)) return respostaBarrado(resultado);

    switch (resultado.status) {
      case "sem_cadastro":
        return NextResponse.json({ ok: false, erro: "sem_cadastro" }, { status: 404 });
      case "envio_indisponivel": {
        // o log diz POR QUE o e-mail não saiu (categoria, sem PII)
        const causa = resultado.causa;
        console.error("[/api/lead/entrar] código não enviado:", causa);
        return NextResponse.json({ ok: false, erro: "envio_indisponivel" }, { status: 503 });
      }
      case "enviado":
        return NextResponse.json({
          ok: true,
          status: "enviado",
          ...(emailModoDev ? { codigoDev: resultado.codigo } : {}),
        });
      default: {
        // um resultado novo no caso de uso sem resposta aqui não compila (e não passa calado)
        const _naoTratado: never = resultado;
        throw new Error("resultado inesperado");
      }
    }
  } catch (err) {
    // banco/config/bug: só a categoria — nunca a mensagem (valores da linha, host do banco)
    const causa = causaDoErro(err);
    console.error("[/api/lead/entrar] erro ao processar:", causa);
    return NextResponse.json({ ok: false, erro: "falha ao processar solicitação" }, { status: 500 });
  }
}
