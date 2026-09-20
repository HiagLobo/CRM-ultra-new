/**
 * POST /api/avaliacao — quem está com o demo liberado dá a nota e o comentário.
 *
 * Rota fina: cookie → Zod → domínio. Quem avalia é identificado pelo token do
 * cookie `crm_demo` (e-mail já verificado na O1), e não por nada do corpo: não
 * dá para avaliar pelo e-mail de outra pessoa. Sem cookie válido, 401.
 *
 * A resposta leva só `status` (publicado/pendente) e o resumo do BANCO — nem o
 * id da avaliação, nem nome, nem e-mail. As três avaliações do arquivo
 * (`src/content/depoimentos.ts`, decisão F4) são somadas por quem exibe.
 *
 * O 500 loga a causa segura (`causaDoErro`) — ver RUNBOOK §6.
 */
import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/lib/env";
import { brand } from "@/config/brand";
import { ipDaRequisicao } from "@/lib/req";
import { leadStore } from "@/lib/criarLeadStore";
import { avaliacaoStore } from "@/lib/criarAvaliacaoStore";
import { rateLimiter } from "@/lib/criarRateLimiter";
import { provedorEmail } from "@/lib/email";
import { causaDoErro } from "@/lib/erros";
import { COOKIE_TOKEN_DEMO, verificarTokenDemo } from "@/lib/token";
import { AvaliacaoInputSchema, avaliar, avisarAvaliacao } from "@/features/avaliacao";

export const runtime = "nodejs"; // store/crypto exigem runtime Node (não Edge)

const SEM_ACESSO = { ok: false, erro: "sem_acesso" } as const;

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_TOKEN_DEMO)?.value;
  const demo = token ? verificarTokenDemo(token, env.APP_SECRET) : null;
  if (!demo) return NextResponse.json(SEM_ACESSO, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, erro: "json_invalido", mensagem: "JSON inválido" }, { status: 400 });
  }

  const parsed = AvaliacaoInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, erro: "dados_invalidos", mensagem: "dados inválidos", campos: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  try {
    const resultado = await avaliar(
      { avaliacoes: avaliacaoStore(), leads: leadStore(), limiter: rateLimiter() },
      parsed.data,
      { email: demo.email, ip: ipDaRequisicao(req) },
    );

    // lead excluído (LGPD) ou banco trocado: o cookie não vale mais
    if (resultado.status === "sem_acesso") return NextResponse.json(SEM_ACESSO, { status: 401 });
    if (resultado.status === "sem_nome") {
      return NextResponse.json({ ok: false, erro: "sem_nome" }, { status: 409 });
    }
    if (resultado.status === "limitado") {
      return NextResponse.json(
        { ok: false, erro: "limitado", mensagem: "muitos envios; aguarde alguns minutos" },
        { status: 429 },
      );
    }

    // aviso ao fundador: sem PII, com prazo — e nunca lança.
    // Esperado aqui (await): na Vercel, trabalho depois da resposta pode morrer.
    await avisarAvaliacao(
      {
        para: env.AVISO_LEADS_EMAIL,
        email: provedorEmail,
        limiter: rateLimiter(),
        limiteEnviosDia: env.LIMITE_ENVIOS_DIA,
        brand,
      },
      resultado,
    );

    return NextResponse.json({ ok: true, status: resultado.avaliacao.status, resumo: resultado.resumo });
  } catch (err) {
    // banco/config/bug: só a categoria (config:VAR, db:SQLSTATE) — nunca a mensagem,
    // que traz os valores da linha (o texto do comentário, o IP do consentimento).
    const causa = causaDoErro(err);
    console.error("[/api/avaliacao] erro ao processar:", causa);
    return NextResponse.json({ ok: false, erro: "falha_interna", mensagem: "falha ao gravar a avaliação" }, { status: 500 });
  }
}
