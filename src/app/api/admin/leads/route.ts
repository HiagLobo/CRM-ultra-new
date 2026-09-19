/**
 * `/api/admin/leads` — GET resumo + lista · PATCH etapa ou próxima ação ·
 * POST cadastro manual · DELETE exclusão (LGPD).
 * Devolve PII (e-mail, telefone, CRECI, nome) e por isso TODO handler **começa**
 * por `exigirAdmin`. Nada de PII em log: o 500 registra só a causa (`causaDoErro`).
 * A resposta leva o `LeadAdmin` (contato + funil), nunca o hash do código nem o
 * carimbo do consentimento — a projeção mora no domínio (`paraLeadAdmin`).
 * A auditoria grava o que o caso de uso devolve: ids e etapas, nunca texto livre.
 */
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { exigirAdmin } from "@/lib/adminAuth";
import { leadStore } from "@/lib/criarLeadStore";
import { registrarAuditoria } from "@/lib/auditoria";
import { resumo, excluirLead } from "@/features/lead/admin";
import { definirProximaAcao, mudarEtapa } from "@/features/lead/funilAdmin";
import { cadastrarManual } from "@/features/lead/cadastroManual";
import { CadastroManualSchema, IdLeadSchema, PatchLeadSchema } from "@/features/lead/schemaAdmin";
import { dadosInvalidos, falhaInterna, leadNaoEncontrado, lerJson } from "../respostas";

export const runtime = "nodejs"; // o store (arquivo/pg) exige runtime Node

const DeleteSchema = z.object({ id: IdLeadSchema });

const MENSAGEM_DATA: Record<"retomarEm" | "proximaAcao", string> = {
  retomarEm: "a data de retomar precisa ser depois de hoje",
  proximaAcao: "a próxima ação não pode ser antes de hoje",
};

export async function GET(req: NextRequest) {
  const barrado = exigirAdmin(req);
  if (barrado) return barrado;

  try {
    const dados = await resumo(leadStore());
    return NextResponse.json({ ok: true, ...dados });
  } catch (err) {
    return falhaInterna("[/api/admin/leads] GET", err);
  }
}

/** `{ id, etapa, retomarEm?, motivo? }` muda a etapa · `{ id, proximaAcao: { em, texto } | null }` define/limpa. */
export async function PATCH(req: NextRequest) {
  const barrado = exigirAdmin(req);
  if (barrado) return barrado;

  const lido = await lerJson(req);
  if (!lido.ok) return lido.resposta;
  const parsed = PatchLeadSchema.safeParse(lido.corpo);
  if (!parsed.success) return dadosInvalidos(parsed.error);

  try {
    const pedido = parsed.data;
    const r =
      pedido.tipo === "etapa"
        ? await mudarEtapa(leadStore(), pedido.id, pedido.mudanca)
        : await definirProximaAcao(leadStore(), pedido.id, pedido.proximaAcao);
    if (r.status === "nao_encontrado") return leadNaoEncontrado();
    if (r.status === "fora_da_fila") {
      return NextResponse.json({ ok: false, erro: "fora_da_fila" }, { status: 409 });
    }
    if (r.status === "data_invalida") {
      return NextResponse.json(
        { ok: false, erro: "data_invalida", campos: { [r.campo]: [MENSAGEM_DATA[r.campo]] } },
        { status: 400 },
      );
    }
    await registrarAuditoria(r.auditoria.acao, r.auditoria.dados);
    return NextResponse.json({ ok: true, lead: r.lead });
  } catch (err) {
    return falhaInterna("[/api/admin/leads] PATCH", err);
  }
}

/**
 * Cadastro manual (indicação, evento, WhatsApp). Contato repetido → 409 com o
 * id do lead que já existe (o painel oferece abri-lo), nunca um segundo lead.
 */
export async function POST(req: NextRequest) {
  const barrado = exigirAdmin(req);
  if (barrado) return barrado;

  const lido = await lerJson(req);
  if (!lido.ok) return lido.resposta;
  const parsed = CadastroManualSchema.safeParse(lido.corpo);
  if (!parsed.success) return dadosInvalidos(parsed.error);

  try {
    const r = await cadastrarManual(leadStore(), parsed.data);
    if (r.status === "duplicado") {
      return NextResponse.json({ ok: false, erro: "lead_existente", id: r.id, campo: r.campo }, { status: 409 });
    }
    await registrarAuditoria(r.auditoria.acao, r.auditoria.dados);
    const aviso = r.observacaoSalva === false ? { aviso: "observacao_nao_salva" } : {};
    return NextResponse.json({ ok: true, lead: r.lead, ...aviso }, { status: 201 });
  } catch (err) {
    return falhaInterna("[/api/admin/leads] POST", err);
  }
}

/**
 * Elimina o lead (LGPD art. 18), com as anotações. Apaga de vez — o titular
 * pediu para sumir. A auditoria guarda que houve exclusão e de qual id, nunca
 * o contato apagado: registrá-lo manteria o dado que se pediu para eliminar.
 */
export async function DELETE(req: NextRequest) {
  const barrado = exigirAdmin(req);
  if (barrado) return barrado;

  const lido = await lerJson(req);
  if (!lido.ok) return lido.resposta;
  const parsed = DeleteSchema.safeParse(lido.corpo);
  if (!parsed.success) return NextResponse.json({ ok: false, erro: "dados_invalidos" }, { status: 400 });

  try {
    if (!(await excluirLead(leadStore(), parsed.data.id))) return leadNaoEncontrado();
    await registrarAuditoria("lead.exclusao", { id: parsed.data.id, motivo: "pedido_do_titular" });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return falhaInterna("[/api/admin/leads] DELETE", err);
  }
}
