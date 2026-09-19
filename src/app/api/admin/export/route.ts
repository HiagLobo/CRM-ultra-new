/**
 * `GET /api/admin/export` — baixa a base de leads em CSV.
 * É a rota que mais expõe PII de uma vez: `exigirAdmin` primeiro, auditoria
 * depois (quem exportou, quando e quantas linhas — nunca os contatos).
 */
import { NextResponse, type NextRequest } from "next/server";
import { exigirAdmin } from "@/lib/adminAuth";
import { leadStore } from "@/lib/criarLeadStore";
import { registrarAuditoria } from "@/lib/auditoria";
import { exportarCsv } from "@/features/lead/admin";
import { causaDoErro } from "@/lib/erros";

export const runtime = "nodejs";


export async function GET(req: NextRequest) {
  const barrado = exigirAdmin(req);
  if (barrado) return barrado;

  try {
    const { csv, linhas } = await exportarCsv(leadStore());
    await registrarAuditoria("lead.export", { linhas });

    const dia = new Date().toISOString().slice(0, 10);
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="leads-${dia}.csv"`,
        // não é para ficar em cache de proxy: é PII
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    const causa = causaDoErro(err, "admin");
    console.error("[/api/admin/export] GET:", causa);
    return NextResponse.json({ ok: false, erro: "falha_interna" }, { status: 500 });
  }
}
