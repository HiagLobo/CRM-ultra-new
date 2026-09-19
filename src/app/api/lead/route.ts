/**
 * POST /api/lead — captura o lead, carimba consentimento e dispara o código.
 * Rota fina: valida (Zod) e delega ao caso de uso `solicitarAcesso`.
 * Sem PII em log/response. Em dev (sem Resend), devolve `codigoDev` para testar o fluxo.
 */
import { NextResponse, type NextRequest } from "next/server";
import { env, emailModoDev } from "@/lib/env";
import { ipDaRequisicao } from "@/lib/req";
import { brand } from "@/config/brand";
import { leadStore } from "@/lib/criarLeadStore";
import { provedorEmail } from "@/lib/email";
import { rateLimiter } from "@/lib/criarRateLimiter";
import { LeadInputSchema, solicitarAcesso } from "@/features/lead";

export const runtime = "nodejs"; // store/crypto exigem runtime Node (não Edge)


export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, erro: "JSON inválido" }, { status: 400 });
  }

  const parsed = LeadInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, erro: "dados inválidos", campos: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  try {
    const resultado = await solicitarAcesso(
      { store: leadStore(), email: provedorEmail(), limiter: rateLimiter(), brand, secret: env.APP_SECRET },
      parsed.data,
      { ip: ipDaRequisicao(req) },
    );

    if (resultado.status === "limitado") {
      return NextResponse.json(
        { ok: false, erro: "muitas solicitações; tente novamente em alguns minutos" },
        { status: 429 },
      );
    }

    return NextResponse.json({
      ok: true,
      ...(emailModoDev ? { codigoDev: resultado.codigo } : {}),
    });
  } catch (err) {
    // erro do store/e-mail: não vaza caminho/conteúdo/PII — loga só o tipo do erro.
    console.error("[/api/lead] erro ao processar:", err instanceof Error ? err.name : "desconhecido");
    return NextResponse.json({ ok: false, erro: "falha ao processar solicitação" }, { status: 500 });
  }
}
