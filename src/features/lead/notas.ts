/**
 * Anotações do admin sobre um lead (O8) — o histórico da conversa.
 *
 * O texto é livre e pode conter dado pessoal: vai para o banco e para o
 * painel, NUNCA para log nem auditoria (a auditoria registra só que houve
 * anotação, e em qual lead). Excluir o lead apaga as anotações junto.
 */
import type { LeadStore } from "../../lib/leadStore";
import type { EventoAuditoriaAdmin } from "./funilAdmin";
import type { NotaLead } from "./funil";

export type ResultadoNotas = { status: "ok"; notas: NotaLead[] } | { status: "nao_encontrado" };

/** Anotações do lead, da mais recente para a mais antiga. Lead inexistente → `nao_encontrado`. */
export async function listarNotasDoLead(store: LeadStore, leadId: string): Promise<ResultadoNotas> {
  if (!(await store.buscarPorId(leadId))) return { status: "nao_encontrado" };
  return { status: "ok", notas: await store.listarNotas(leadId) };
}

export type ResultadoAnotar =
  | { status: "ok"; nota: NotaLead; auditoria: EventoAuditoriaAdmin }
  | { status: "nao_encontrado" };

/** Grava a anotação (texto já validado pelo Zod: 1 a 2.000 caracteres). */
export async function anotar(
  store: LeadStore,
  leadId: string,
  texto: string,
  agora: Date = new Date(),
): Promise<ResultadoAnotar> {
  const nota = await store.adicionarNota(leadId, texto, agora.toISOString());
  if (!nota) return { status: "nao_encontrado" };
  return { status: "ok", nota, auditoria: { acao: "lead.nota", dados: { id: leadId, nota: nota.id } } };
}
