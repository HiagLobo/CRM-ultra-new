/**
 * `/api/admin/avaliacoes` — GET lista (com quem avaliou, para o fundador
 * conferir) · PATCH tira do site ou publica de volta.
 * Devolve PII (nome, e-mail, CRECI de quem avaliou) e o texto do comentário, e
 * por isso TODO handler **começa** por `exigirAdmin`. Nada disso em log: o 500
 * registra só a causa (`causaDoErro`).
 * A auditoria grava o que o caso de uso devolve: id e situação de/para, nunca o
 * texto nem quem escreveu.
 */
import { NextResponse, type NextRequest } from "next/server";
import { exigirAdmin } from "@/lib/adminAuth";
import { leadStore } from "@/lib/criarLeadStore";
import { avaliacaoStore } from "@/lib/criarAvaliacaoStore";
import { registrarAuditoria } from "@/lib/auditoria";
import { listarParaAdmin, moderar, ModeracaoSchema } from "@/features/avaliacao";
import { dadosInvalidos, falhaInterna, lerJson } from "../respostas";

export const runtime = "nodejs"; // o store (arquivo/pg) exige runtime Node

export async function GET(req: NextRequest) {
  const barrado = exigirAdmin(req);
  if (barrado) return barrado;

  try {
    const dados = await listarParaAdmin(avaliacaoStore(), leadStore());
    return NextResponse.json({ ok: true, ...dados });
  } catch (err) {
    return falhaInterna("[/api/admin/avaliacoes] GET", err);
  }
}

/** `{ id, status: "publicado" | "recusado" }` — `pendente` é decisão do filtro, não do clique. */
export async function PATCH(req: NextRequest) {
  const barrado = exigirAdmin(req);
  if (barrado) return barrado;

  const lido = await lerJson(req);
  if (!lido.ok) return lido.resposta;
  const parsed = ModeracaoSchema.safeParse(lido.corpo);
  if (!parsed.success) return dadosInvalidos(parsed.error);

  try {
    const r = await moderar(avaliacaoStore(), parsed.data.id, parsed.data.status);
    if (r.status === "nao_encontrada") {
      return NextResponse.json({ ok: false, erro: "avaliacao_nao_encontrada" }, { status: 404 });
    }
    await registrarAuditoria(r.auditoria.acao, r.auditoria.dados);
    return NextResponse.json({ ok: true, avaliacao: r.avaliacao });
  } catch (err) {
    return falhaInterna("[/api/admin/avaliacoes] PATCH", err);
  }
}
