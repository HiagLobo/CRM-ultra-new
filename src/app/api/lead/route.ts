/**
 * POST /api/lead — captura o lead, carimba consentimento e dispara o código.
 * Rota fina: valida (Zod) e delega ao caso de uso `solicitarAcesso`, que decide
 * isca, Turnstile, limites, teto diário e envio. Sem PII em log/response.
 * Em dev (sem Resend), devolve `codigoDev` para testar o fluxo.
 *
 * Respostas (O7·S1):
 * - 200 `{ ok, status: "enviado" }` — o e-mail saiu (ou robô: sucesso falso);
 * - 202 `{ ok, status: "recebido_sem_codigo" }` — lead gravado, e-mail não saiu;
 * - 400 dados inválidos · 403 anti-robô recusou · 429 limite · 503 anti-robô fora do ar · 500.
 *
 * O 500 loga a causa segura (O7·S2): `config:DATABASE_URL`, `db:42P01`,
 * `rede:ENOTFOUND`… — o RUNBOOK §6 diz o que fazer com cada uma.
 */
import { NextResponse, type NextRequest } from "next/server";
import { env, emailModoDev } from "@/lib/env";
import { ipDaRequisicao } from "@/lib/req";
import { brand } from "@/config/brand";
import { leadStore } from "@/lib/criarLeadStore";
import { provedorEmail } from "@/lib/email";
import { rateLimiter } from "@/lib/criarRateLimiter";
import { criarVerificadorTurnstile } from "@/lib/turnstile";
import { causaDoErro } from "@/lib/erros";
import { PedidoAcessoSchema, solicitarAcesso } from "@/features/lead";

export const runtime = "nodejs"; // store/crypto exigem runtime Node (não Edge)
/**
 * Teto da função na Vercel, em segundos. Os prazos internos (Turnstile 5 s +
 * envio do código 8 s + banco) cabem com folga: a plataforma nunca corta a
 * requisição antes de o lead ser gravado.
 */
export const maxDuration = 30;

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

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, erro: "JSON inválido" }, { status: 400 });
  }

  const parsed = PedidoAcessoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, erro: "dados inválidos", campos: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  try {
    const resultado = await solicitarAcesso(
      {
        store: leadStore(),
        email: provedorEmail, // sob demanda: config faltando vira "recebido sem código", não 500
        limiter: rateLimiter(),
        brand,
        secret: env.APP_SECRET,
        limiteEnviosDia: env.LIMITE_ENVIOS_DIA,
        verificarHumano: verificadorHumano(),
      },
      parsed.data,
      { ip: ipDaRequisicao(req) },
    );

    switch (resultado.status) {
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
      case "recebido_sem_codigo": {
        // o lead está salvo; o log diz POR QUE o e-mail não saiu (categoria, sem PII)
        const causa = resultado.causa;
        console.error("[/api/lead] código não enviado; lead gravado sem código:", causa);
        return NextResponse.json({ ok: true, status: "recebido_sem_codigo" }, { status: 202 });
      }
      case "enviado":
        return NextResponse.json({
          ok: true,
          status: "enviado",
          ...(emailModoDev ? { codigoDev: resultado.codigo } : {}),
        });
    }
  } catch (err) {
    // banco/config/bug: só a categoria (config:VAR, db:SQLSTATE, rede:errno) — nunca a
    // mensagem, que traz os valores da linha (e-mail, telefone) ou o host do banco.
    const causa = causaDoErro(err);
    console.error("[/api/lead] erro ao processar:", causa);
    return NextResponse.json({ ok: false, erro: "falha ao processar solicitação" }, { status: 500 });
  }
}
