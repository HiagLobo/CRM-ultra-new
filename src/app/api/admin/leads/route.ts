/**
 * `/api/admin/leads` — GET resumo + lista · PATCH etapa, próxima ação ou
 * conferência do CRECI · POST cadastro manual · DELETE exclusão (LGPD).
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
import { avaliacaoStore } from "@/lib/criarAvaliacaoStore";
import { orcamentoStore } from "@/lib/criarOrcamentoStore";
import { causaDoErro } from "@/lib/erros";
import { registrarAuditoria } from "@/lib/auditoria";
import { resumo, excluirLead } from "@/features/lead/admin";
import { conferirCreci, definirProximaAcao, mudarEtapa } from "@/features/lead/funilAdmin";
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

/**
 * `{ id, etapa, retomarEm?, motivo? }` muda a etapa · `{ id, proximaAcao: { em, texto } | null }`
 * define/limpa · `{ id, creciConferencia: "conferido" | "nao_confere" | null }` marca/desfaz (O9).
 */
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
        : pedido.tipo === "creci"
          ? await conferirCreci(leadStore(), pedido.id, pedido.conferencia)
          : await definirProximaAcao(leadStore(), pedido.id, pedido.proximaAcao);
    if (r.status === "nao_encontrado") return leadNaoEncontrado();
    if (r.status === "fora_da_fila" || r.status === "sem_creci") {
      return NextResponse.json({ ok: false, erro: r.status }, { status: 409 });
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
 * Elimina o lead (LGPD art. 18), com as anotações, com a avaliação que ele
 * tenha deixado no demo (O10) e com os orçamentos dele (O11). Apaga de vez —
 * o titular pediu para sumir. A auditoria guarda que houve exclusão e de qual
 * id, nunca o contato apagado: registrá-lo manteria o dado que se pediu para
 * eliminar.
 *
 * A avaliação e os orçamentos saem ANTES do lead: no Postgres o
 * `ON DELETE CASCADE` das migrações 006 e 007 já faria isso sozinho, mas o
 * adaptador de arquivo (dev) não tem cascata, e registro órfão é dado de quem
 * pediu para ser apagado. Falhar aqui não pode travar a eliminação: a causa vai
 * para o log e o lead sai do mesmo jeito.
 */
export async function DELETE(req: NextRequest) {
  const barrado = exigirAdmin(req);
  if (barrado) return barrado;

  const lido = await lerJson(req);
  if (!lido.ok) return lido.resposta;
  const parsed = DeleteSchema.safeParse(lido.corpo);
  if (!parsed.success) return NextResponse.json({ ok: false, erro: "dados_invalidos" }, { status: 400 });

  try {
    try {
      await avaliacaoStore().removerDoLead(parsed.data.id);
    } catch (err) {
      // ex.: migração 006 ainda não rodada (db:42P01) — a exclusão do lead segue.
      // A causa vai para uma variável antes do log: nenhuma rota loga o erro cru.
      const causa = causaDoErro(err, "db");
      console.error("[/api/admin/leads] DELETE avaliação não removida:", causa);
    }
    try {
      await orcamentoStore().removerDoLead(parsed.data.id);
    } catch (err) {
      // ex.: migração 007 ainda não rodada (db:42P01) — a exclusão do lead segue
      const causa = causaDoErro(err, "db");
      console.error("[/api/admin/leads] DELETE orçamentos não removidos:", causa);
    }
    if (!(await excluirLead(leadStore(), parsed.data.id))) return leadNaoEncontrado();
    await registrarAuditoria("lead.exclusao", { id: parsed.data.id, motivo: "pedido_do_titular" });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return falhaInterna("[/api/admin/leads] DELETE", err);
  }
}
