/**
 * POST /api/admin/logout — encerra a sessão do admin.
 * Não exige sessão válida: apagar o próprio cookie não expõe nada, e exigir
 * autorização aqui só criaria um jeito de ficar preso numa sessão quebrada.
 */
import { NextResponse } from "next/server";
import { COOKIE_ADMIN, opcoesCookieAdmin } from "@/lib/adminAuth";

export const runtime = "nodejs";

export async function POST() {
  const resposta = NextResponse.json({ ok: true });
  resposta.cookies.set(COOKIE_ADMIN, "", opcoesCookieAdmin(0));
  return resposta;
}
