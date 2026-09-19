/** Utilidades de requisição compartilhadas pelos route handlers. SERVER-ONLY. */
import type { NextRequest } from "next/server";

/**
 * IP do cliente, para rate-limit e carimbo de consentimento.
 * Atrás de proxy (Vercel) vem em `x-forwarded-for`; sem header, todos os
 * clientes caem no mesmo balde "desconhecido" — aceitável para anti-abuso.
 */
export function ipDaRequisicao(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "desconhecido";
}
