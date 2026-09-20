/**
 * `/api/admin/orcamentos/[id]` — GET um orçamento com o cliente, que é o que a
 * página do documento A4 (`/admin/orcamento/[id]`) imprime.
 *
 * Leva preço e contato do cliente: o handler **começa** por `exigirAdmin` e a
 * resposta nunca fica em cache (proposta com valor não pode ficar guardada em
 * cache de borda).
 */
import { NextResponse, type NextRequest } from "next/server";
import { exigirAdmin } from "@/lib/adminAuth";
import { leadStore } from "@/lib/criarLeadStore";
import { orcamentoStore } from "@/lib/criarOrcamentoStore";
import { buscarOrcamentoAdmin, IdOrcamentoSchema } from "@/features/orcamento";
import { dadosInvalidos, falhaInterna } from "../../respostas";

export const runtime = "nodejs"; // o store (arquivo/pg) exige runtime Node

/** Next 15: os parâmetros dinâmicos chegam como Promise. */
interface Contexto {
  params: Promise<{ id: string }>;
}

const SEM_CACHE = { "Cache-Control": "no-store" };

export async function GET(req: NextRequest, { params }: Contexto) {
  const barrado = exigirAdmin(req);
  if (barrado) return barrado;

  const id = IdOrcamentoSchema.safeParse((await params).id);
  if (!id.success) return dadosInvalidos(id.error);

  try {
    const orcamento = await buscarOrcamentoAdmin(orcamentoStore(), leadStore(), id.data);
    if (!orcamento) return NextResponse.json({ ok: false, erro: "orcamento_nao_encontrado" }, { status: 404 });
    return NextResponse.json({ ok: true, orcamento }, { headers: SEM_CACHE });
  } catch (err) {
    return falhaInterna("[/api/admin/orcamentos/id] GET", err);
  }
}
