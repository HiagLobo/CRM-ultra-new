/**
 * `/api/admin/leads/[id]/notas` — GET lista as anotações do lead (da mais
 * recente para a mais antiga) · POST grava uma anotação nova.
 *
 * O texto da anotação é livre e pode ter dado pessoal: todo handler começa por
 * `exigirAdmin`, a resposta não fica em cache e o texto NUNCA vai para log nem
 * auditoria (que registra só o id do lead e o da anotação).
 */
import { NextResponse, type NextRequest } from "next/server";
import { exigirAdmin } from "@/lib/adminAuth";
import { leadStore } from "@/lib/criarLeadStore";
import { registrarAuditoria } from "@/lib/auditoria";
import { anotar, listarNotasDoLead } from "@/features/lead/notas";
import { IdLeadSchema, NotaSchema } from "@/features/lead/schemaAdmin";
import { dadosInvalidos, falhaInterna, leadNaoEncontrado, lerJson } from "../../../respostas";

export const runtime = "nodejs"; // o store (arquivo/pg) exige runtime Node

/** Next 15: os parâmetros dinâmicos chegam como Promise. */
interface Contexto {
  params: Promise<{ id: string }>;
}

const SEM_CACHE = { "Cache-Control": "no-store" };

export async function GET(req: NextRequest, { params }: Contexto) {
  const barrado = exigirAdmin(req);
  if (barrado) return barrado;

  const id = IdLeadSchema.safeParse((await params).id);
  if (!id.success) return dadosInvalidos(id.error);

  try {
    const r = await listarNotasDoLead(leadStore(), id.data);
    if (r.status === "nao_encontrado") return leadNaoEncontrado();
    return NextResponse.json({ ok: true, notas: r.notas }, { headers: SEM_CACHE });
  } catch (err) {
    return falhaInterna("[/api/admin/leads/notas] GET", err);
  }
}

export async function POST(req: NextRequest, { params }: Contexto) {
  const barrado = exigirAdmin(req);
  if (barrado) return barrado;

  const id = IdLeadSchema.safeParse((await params).id);
  if (!id.success) return dadosInvalidos(id.error);
  const lido = await lerJson(req);
  if (!lido.ok) return lido.resposta;
  const parsed = NotaSchema.safeParse(lido.corpo);
  if (!parsed.success) return dadosInvalidos(parsed.error);

  try {
    const r = await anotar(leadStore(), id.data, parsed.data.texto);
    if (r.status === "nao_encontrado") return leadNaoEncontrado();
    await registrarAuditoria(r.auditoria.acao, r.auditoria.dados);
    return NextResponse.json({ ok: true, nota: r.nota }, { status: 201, headers: SEM_CACHE });
  } catch (err) {
    return falhaInterna("[/api/admin/leads/notas] POST", err);
  }
}
