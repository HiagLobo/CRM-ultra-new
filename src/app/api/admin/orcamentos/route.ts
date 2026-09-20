/**
 * `/api/admin/orcamentos` — GET lista · POST cria · PATCH muda a situação ·
 * DELETE apaga. Devolve PREÇO e o contato do cliente, e por isso TODO handler
 * **começa** por `exigirAdmin`. Nada disso em log: o 500 registra só a causa
 * (`causaDoErro`).
 *
 * O PISO É TRAVA DO SERVIDOR: o cálculo roda aqui de novo, com a tabela do
 * servidor, e um desconto abaixo do piso volta 409 mesmo que o painel tenha
 * sido contornado.
 *
 * A auditoria grava o que o caso de uso devolve: id, público e quantidade de
 * assentos na criação, id e situação de/para na troca. Nunca valor, nome do
 * cliente ou observação.
 */
import { NextResponse, type NextRequest } from "next/server";
import { exigirAdmin } from "@/lib/adminAuth";
import { leadStore } from "@/lib/criarLeadStore";
import { orcamentoStore } from "@/lib/criarOrcamentoStore";
import { registrarAuditoria } from "@/lib/auditoria";
import {
  criarOrcamento,
  excluirOrcamento,
  listarOrcamentosParaAdmin,
  trocarStatusOrcamento,
  ExclusaoOrcamentoSchema,
  NovoOrcamentoSchema,
  StatusOrcamentoSchema,
  type RecusaCalculo,
} from "@/features/orcamento";
import { dadosInvalidos, falhaInterna, leadNaoEncontrado, lerJson } from "../respostas";

export const runtime = "nodejs"; // o store (arquivo/pg) exige runtime Node

const naoEncontrado = () => NextResponse.json({ ok: false, erro: "orcamento_nao_encontrado" }, { status: 404 });

/**
 * Recusa do cálculo → 409 com o código e o que a tela precisa mostrar. É
 * conflito de regra, não corpo malformado (o Zod já passou): mesmo tratamento
 * que `fora_da_fila` e `sem_creci` recebem no PATCH do lead.
 */
function recusadoPelaRegra(recusa: RecusaCalculo): NextResponse {
  const detalhe =
    recusa.erro === "abaixo_do_piso"
      ? { nivel: recusa.nivel, piso: recusa.piso, efetivo: recusa.efetivo }
      : recusa.erro === "assentos_abaixo_do_minimo"
        ? { minimo: recusa.minimo, assentos: recusa.assentos }
        : {};
  return NextResponse.json({ ok: false, erro: recusa.erro, ...detalhe }, { status: 409 });
}

export async function GET(req: NextRequest) {
  const barrado = exigirAdmin(req);
  if (barrado) return barrado;

  try {
    const dados = await listarOrcamentosParaAdmin(orcamentoStore(), leadStore());
    return NextResponse.json({ ok: true, ...dados });
  } catch (err) {
    return falhaInterna("[/api/admin/orcamentos] GET", err);
  }
}

/** Cria a proposta (nasce rascunho) com os preços do dia já congelados. */
export async function POST(req: NextRequest) {
  const barrado = exigirAdmin(req);
  if (barrado) return barrado;

  const lido = await lerJson(req);
  if (!lido.ok) return lido.resposta;
  const parsed = NovoOrcamentoSchema.safeParse(lido.corpo);
  if (!parsed.success) return dadosInvalidos(parsed.error);

  try {
    const r = await criarOrcamento({ orcamentos: orcamentoStore(), leads: leadStore() }, parsed.data);
    if (r.status === "lead_nao_encontrado") return leadNaoEncontrado();
    if (r.status === "recusado") return recusadoPelaRegra(r.recusa);
    await registrarAuditoria(r.auditoria.acao, r.auditoria.dados);
    return NextResponse.json({ ok: true, orcamento: r.orcamento }, { status: 201 });
  } catch (err) {
    return falhaInterna("[/api/admin/orcamentos] POST", err);
  }
}

/** `{ id, status: "rascunho" | "enviado" | "aceito" | "recusado" }`. */
export async function PATCH(req: NextRequest) {
  const barrado = exigirAdmin(req);
  if (barrado) return barrado;

  const lido = await lerJson(req);
  if (!lido.ok) return lido.resposta;
  const parsed = StatusOrcamentoSchema.safeParse(lido.corpo);
  if (!parsed.success) return dadosInvalidos(parsed.error);

  try {
    const r = await trocarStatusOrcamento(orcamentoStore(), parsed.data.id, parsed.data.status);
    if (r.status === "nao_encontrado") return naoEncontrado();
    await registrarAuditoria(r.auditoria.acao, r.auditoria.dados);
    return NextResponse.json({ ok: true, orcamento: r.orcamento });
  } catch (err) {
    return falhaInterna("[/api/admin/orcamentos] PATCH", err);
  }
}

/** Apaga a proposta. A auditoria guarda o id; o valor e o cliente, nunca. */
export async function DELETE(req: NextRequest) {
  const barrado = exigirAdmin(req);
  if (barrado) return barrado;

  const lido = await lerJson(req);
  if (!lido.ok) return lido.resposta;
  const parsed = ExclusaoOrcamentoSchema.safeParse(lido.corpo);
  if (!parsed.success) return dadosInvalidos(parsed.error);

  try {
    if (!(await excluirOrcamento(orcamentoStore(), parsed.data.id))) return naoEncontrado();
    await registrarAuditoria("orcamento.excluido", { id: parsed.data.id });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return falhaInterna("[/api/admin/orcamentos] DELETE", err);
  }
}
