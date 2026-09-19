/**
 * POST /api/lead/verify — confere o código e libera o acesso ao demo.
 * Rota fina: valida (Zod), delega ao domínio e, no sucesso, emite o token de
 * demo em cookie httpOnly. Sem PII em log/response.
 *
 * Na PRIMEIRA verificação de um lead, avisa o fundador (`AVISO_LEADS_EMAIL`,
 * opcional) com um e-mail sem PII. O aviso nunca derruba a verificação.
 *
 * O9: o corpo pode trazer `atualizacao` ({ nome, telefone, creci }, mesmo Zod do
 * cadastro) — aplicada só com o código certo. 200 `{ ok, naoAtualizados? }`:
 * `naoAtualizados` lista o que ficou para trás por ser de outro lead.
 *
 * O 500 loga a causa segura (O7·S2) — ver RUNBOOK §6.
 */
import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/lib/env";
import { ipDaRequisicao } from "@/lib/req";
import { brand } from "@/config/brand";
import { leadStore } from "@/lib/criarLeadStore";
import { provedorEmail } from "@/lib/email";
import { rateLimiter } from "@/lib/criarRateLimiter";
import { causaDoErro } from "@/lib/erros";
import { assinarTokenDemo, COOKIE_TOKEN_DEMO, VALIDADE_TOKEN_DIAS } from "@/lib/token";
import { VerifyInputSchema, avisarLeadNovo, verificarCodigo, type MotivoFalha } from "@/features/lead";

export const runtime = "nodejs"; // store/crypto exigem runtime Node (não Edge)

/** Motivo do domínio → status HTTP + texto para o usuário (a UI da O2 lê o `erro`). */
const RESPOSTA_FALHA: Record<MotivoFalha, { status: number; mensagem: string }> = {
  codigo_invalido: { status: 400, mensagem: "código inválido, confira e tente novamente" },
  expirado: { status: 410, mensagem: "código expirado, solicite um novo" },
  tentativas_excedidas: { status: 429, mensagem: "tentativas esgotadas, solicite um novo código" },
};

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, erro: "json_invalido", mensagem: "JSON inválido" }, { status: 400 });
  }

  const parsed = VerifyInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        erro: "dados_invalidos",
        mensagem: "dados inválidos",
        campos: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  try {
    const resultado = await verificarCodigo(
      { store: leadStore(), limiter: rateLimiter(), secret: env.APP_SECRET },
      parsed.data,
      { ip: ipDaRequisicao(req) },
    );

    if (resultado.status === "limitado") {
      return NextResponse.json(
        { ok: false, erro: "limitado", mensagem: "muitas tentativas; aguarde alguns minutos" },
        { status: 429 },
      );
    }
    if (resultado.status === "falha") {
      const { status, mensagem } = RESPOSTA_FALHA[resultado.motivo];
      return NextResponse.json({ ok: false, erro: resultado.motivo, mensagem }, { status });
    }

    // aviso ao fundador: só na 1ª verificação, sem PII, com prazo — e nunca lança.
    // Esperado aqui (await): na Vercel, trabalho depois da resposta pode morrer.
    await avisarLeadNovo(
      {
        para: env.AVISO_LEADS_EMAIL,
        email: provedorEmail,
        limiter: rateLimiter(),
        limiteEnviosDia: env.LIMITE_ENVIOS_DIA,
        brand,
      },
      resultado,
    );

    // O9: campos da `atualizacao` que ficaram para trás por já serem de outro lead
    const naoAtualizados = resultado.naoAtualizados?.length ? { naoAtualizados: resultado.naoAtualizados } : {};
    const resposta = NextResponse.json({ ok: true, ...naoAtualizados });
    resposta.cookies.set(
      COOKIE_TOKEN_DEMO,
      assinarTokenDemo({ email: resultado.email }, env.APP_SECRET),
      {
        httpOnly: true,
        sameSite: "lax",
        secure: env.NODE_ENV === "production",
        path: "/",
        maxAge: VALIDADE_TOKEN_DIAS * 86_400,
      },
    );
    return resposta;
  } catch (err) {
    // banco/config/bug: só a categoria (config:VAR, db:SQLSTATE, rede:errno) — nunca a
    // mensagem, que traz os valores da linha (e-mail, telefone) ou o host do banco.
    const causa = causaDoErro(err);
    console.error("[/api/lead/verify] erro ao processar:", causa);
    return NextResponse.json(
      { ok: false, erro: "falha_interna", mensagem: "falha ao processar verificação" },
      { status: 500 },
    );
  }
}
