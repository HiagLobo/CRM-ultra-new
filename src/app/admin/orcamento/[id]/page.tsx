/**
 * `/admin/orcamento/[id]` — a proposta em A4, pronta para virar PDF.
 *
 * Guarda no **servidor**, igual ao `/admin`: a proposta tem preço e dado de
 * cliente, então sem cookie de sessão válido a página nem chega a renderizar.
 */
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { env } from "@/lib/env";
import { COOKIE_ADMIN, sessaoAdminValida } from "@/lib/adminAuth";
import DocumentoOrcamento from "../DocumentoOrcamento";

export const runtime = "nodejs";
export const dynamic = "force-dynamic"; // depende do cookie: nunca pré-renderizar

export const metadata = { robots: { index: false, follow: false } };

/** Next 15: os parâmetros dinâmicos chegam como Promise. */
export default async function OrcamentoPage({ params }: { params: Promise<{ id: string }> }) {
  const sessao = (await cookies()).get(COOKIE_ADMIN)?.value;
  if (!sessaoAdminValida(sessao, env.APP_SECRET)) redirect("/admin/login");
  const { id } = await params;
  return <DocumentoOrcamento id={id} />;
}
