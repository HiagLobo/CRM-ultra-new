/**
 * `/admin` — painel de leads.
 * Guarda no **servidor**: sem cookie de sessão válido, nem chega a renderizar
 * (diferente do gate do demo, que é client-side, aqui há PII de verdade atrás).
 */
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { env } from "@/lib/env";
import { COOKIE_ADMIN, sessaoAdminValida } from "@/lib/adminAuth";
import PainelLeads from "./PainelLeads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic"; // depende do cookie: nunca pré-renderizar

export const metadata = { robots: { index: false, follow: false } };

export default async function AdminPage() {
  // `cookies()` é assíncrono desde o Next 15
  const sessao = (await cookies()).get(COOKIE_ADMIN)?.value;
  if (!sessaoAdminValida(sessao, env.APP_SECRET)) redirect("/admin/login");
  return <PainelLeads />;
}
