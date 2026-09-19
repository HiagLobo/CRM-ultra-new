/**
 * `/api/admin/leads` — GET resumo + lista · PATCH follow-up.
 * Devolve PII (e-mail, telefone, CRECI) e por isso **começa** por `exigirAdmin`.
 * Nada de PII em log: o catch registra só a causa (nome + código, `causaDoErro`).
 * A resposta leva o `LeadAdmin` (contato + status), nunca o hash do código nem o
 * carimbo do consentimento — a projeção mora no domínio (`paraLeadAdmin`).
 */
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { exigirAdmin } from "@/lib/adminAuth";
import { leadStore } from "@/lib/criarLeadStore";
import { registrarAuditoria } from "@/lib/auditoria";
import { resumo, atualizarStatus, excluirLead, STATUS_DO_ADMIN } from "@/features/lead/admin";
import { causaDoErro } from "../causaErro";

export const runtime = "nodejs"; // o store (arquivo/pg) exige runtime Node


const PatchSchema = z.object({
  id: z.string().min(1).max(100),
  status: z.enum(STATUS_DO_ADMIN),
});

export async function GET(req: NextRequest) {
  const barrado = exigirAdmin(req);
  if (barrado) return barrado;

  try {
    const dados = await resumo(leadStore());
    return NextResponse.json({ ok: true, ...dados });
  } catch (err) {
    const causa = causaDoErro(err);
    console.error("[/api/admin/leads] GET:", causa);
    return NextResponse.json({ ok: false, erro: "falha_interna" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const barrado = exigirAdmin(req);
  if (barrado) return barrado;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, erro: "json_invalido" }, { status: 400 });
  }

  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, erro: "dados_invalidos", campos: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  try {
    const r = await atualizarStatus(leadStore(), parsed.data.id, parsed.data.status);
    if (r.status === "nao_encontrado") {
      return NextResponse.json({ ok: false, erro: "lead_nao_encontrado" }, { status: 404 });
    }
    // ação material do admin → auditoria (id e status, nunca o contato)
    await registrarAuditoria("lead.status", {
      id: r.lead.id,
      de: r.de,
      para: r.lead.status,
    });
    return NextResponse.json({ ok: true, lead: r.lead });
  } catch (err) {
    const causa = causaDoErro(err);
    console.error("[/api/admin/leads] PATCH:", causa);
    return NextResponse.json({ ok: false, erro: "falha_interna" }, { status: 500 });
  }
}

const DeleteSchema = z.object({ id: z.string().min(1).max(100) });

/**
 * Elimina o lead (LGPD art. 18). Apaga de vez — o titular pediu para sumir.
 * A auditoria guarda que houve exclusão e de qual id, nunca o contato apagado:
 * registrar o e-mail aqui manteria justamente o dado que se pediu para eliminar.
 */
export async function DELETE(req: NextRequest) {
  const barrado = exigirAdmin(req);
  if (barrado) return barrado;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, erro: "json_invalido" }, { status: 400 });
  }

  const parsed = DeleteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, erro: "dados_invalidos" }, { status: 400 });
  }

  try {
    const excluido = await excluirLead(leadStore(), parsed.data.id);
    if (!excluido) {
      return NextResponse.json({ ok: false, erro: "lead_nao_encontrado" }, { status: 404 });
    }
    await registrarAuditoria("lead.exclusao", { id: parsed.data.id, motivo: "pedido_do_titular" });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const causa = causaDoErro(err);
    console.error("[/api/admin/leads] DELETE:", causa);
    return NextResponse.json({ ok: false, erro: "falha_interna" }, { status: 500 });
  }
}
