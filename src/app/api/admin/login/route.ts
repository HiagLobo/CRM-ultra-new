/**
 * POST /api/admin/login — abre a sessão do admin.
 * Rota fina: Zod → rate-limit por IP (anti brute-force) → comparação da senha em
 * tempo constante → cookie httpOnly assinado.
 * A senha NUNCA vai para log nem para a resposta; a falha é sempre genérica.
 */
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { env } from "@/lib/env";
import { ipDaRequisicao } from "@/lib/req";
import { rateLimiter } from "@/lib/criarRateLimiter";
import {
  COOKIE_ADMIN,
  REGRA_LOGIN_ADMIN,
  VALIDADE_SESSAO_H,
  criarSessaoAdmin,
  opcoesCookieAdmin,
  verificarSenha,
} from "@/lib/adminAuth";

export const runtime = "nodejs"; // crypto exige runtime Node (não Edge)


const LoginSchema = z.object({ senha: z.string().min(1).max(200) });

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, erro: "json_invalido" }, { status: 400 });
  }

  const parsed = LoginSchema.safeParse(body);
  if (!parsed.success) {
    // não detalha o campo: é senha, qualquer detalhe ajuda quem está sondando
    return NextResponse.json({ ok: false, erro: "credenciais_invalidas" }, { status: 401 });
  }

  const ip = ipDaRequisicao(req);
  if (!(await rateLimiter().permitir([`admin:login:${ip}`], REGRA_LOGIN_ADMIN))) {
    return NextResponse.json(
      { ok: false, erro: "limitado", mensagem: "muitas tentativas; aguarde alguns minutos" },
      { status: 429 },
    );
  }

  if (!verificarSenha(parsed.data.senha, env.ADMIN_PASSWORD)) {
    return NextResponse.json({ ok: false, erro: "credenciais_invalidas" }, { status: 401 });
  }

  const resposta = NextResponse.json({ ok: true });
  resposta.cookies.set(
    COOKIE_ADMIN,
    criarSessaoAdmin(env.APP_SECRET),
    opcoesCookieAdmin(VALIDADE_SESSAO_H * 3600),
  );
  return resposta;
}
