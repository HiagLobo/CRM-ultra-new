/**
 * Casos de uso do painel de orçamentos (sem HTTP): o que o fundador vê, a
 * troca de situação e a exclusão. As rotas `/api/admin/orcamentos` só fazem
 * authz + wiring. A criação (com o cálculo) mora em `criar.ts`.
 *
 * O DTO leva preço e o contato do cliente — é a tela atrás de senha onde o
 * fundador monta a proposta. O que NUNCA sai daqui: consentimento, IP e hash
 * do código do lead. Nada disso entra em log nem em auditoria.
 */
import type { LeadStore } from "../../lib/leadStore";
import type { OrcamentoStore } from "../../lib/orcamentoStorePorta";
import type { CondicoesOrcamento, ItemOrcamento, Orcamento, StatusOrcamento, TotaisOrcamento } from "./orcamento";
import type { PublicoOrcamento } from "./tabela";

/** Contato do cliente na proposta: o que o documento imprime, e só isso. */
export interface ClienteOrcamento {
  nome?: string;
  email?: string;
  telefone?: string;
}

/** Uma linha da lista do painel e o conteúdo do documento A4. */
export interface OrcamentoAdmin {
  id: string;
  numero: string;
  leadId: string;
  cliente: ClienteOrcamento;
  publico: PublicoOrcamento;
  status: StatusOrcamento;
  itens: ItemOrcamento[];
  totais: TotaisOrcamento;
  condicoes: CondicoesOrcamento;
  validadeEm: string;
  observacao?: string;
  criadoEm: string;
  atualizadoEm: string;
  enviadoEm?: string;
}

/** Projeção campo a campo, como no `paraLeadAdmin`: campo novo não vaza por esquecimento. */
export function paraOrcamentoAdmin(o: Orcamento, cliente: ClienteOrcamento): OrcamentoAdmin {
  return {
    id: o.id,
    numero: o.numero,
    leadId: o.leadId,
    cliente,
    publico: o.publico,
    status: o.status,
    itens: o.itens,
    totais: o.totais,
    condicoes: o.condicoes,
    validadeEm: o.validadeEm,
    ...(o.observacao ? { observacao: o.observacao } : {}),
    criadoEm: o.criadoEm,
    atualizadoEm: o.atualizadoEm,
    ...(o.enviadoEm ? { enviadoEm: o.enviadoEm } : {}),
  };
}

/** Só o contato, nunca o lead inteiro: o resto fica no banco, que é onde serve. */
export function clienteDoLead(lead: { nome?: string; email?: string; telefone?: string } | null | undefined): ClienteOrcamento {
  return { nome: lead?.nome, email: lead?.email, telefone: lead?.telefone };
}

/** Lista do painel (do mais recente para o mais antigo), com o cliente de cada um. */
export async function listarOrcamentosParaAdmin(
  orcamentos: OrcamentoStore,
  leads: LeadStore,
): Promise<{ orcamentos: OrcamentoAdmin[] }> {
  const todos = await orcamentos.listar();
  const porId = new Map((await leads.listar()).map((l) => [l.id, l] as const));
  return { orcamentos: todos.map((o) => paraOrcamentoAdmin(o, clienteDoLead(porId.get(o.leadId)))) };
}

/** Um orçamento com o cliente (o documento A4 abre por aqui). `null` se não existe. */
export async function buscarOrcamentoAdmin(
  orcamentos: OrcamentoStore,
  leads: LeadStore,
  id: string,
): Promise<OrcamentoAdmin | null> {
  const orcamento = await orcamentos.buscarPorId(id);
  if (!orcamento) return null;
  return paraOrcamentoAdmin(orcamento, clienteDoLead(await leads.buscarPorId(orcamento.leadId)));
}

export type ResultadoStatus =
  | {
      status: "ok";
      orcamento: OrcamentoAdmin;
      /** Só ids e códigos — nunca valores, nome do cliente ou observação. */
      auditoria: { acao: "orcamento.status"; dados: { id: string; de: StatusOrcamento; para: StatusOrcamento } };
    }
  | { status: "nao_encontrado" };

/**
 * Marca enviado, aceito ou recusado. NÃO apaga nem recalcula: a proposta
 * continua com os valores do dia em que foi emitida.
 */
export async function trocarStatusOrcamento(
  store: OrcamentoStore,
  id: string,
  status: StatusOrcamento,
  agora: Date = new Date(),
): Promise<ResultadoStatus> {
  const troca = await store.trocarStatus(id, status, agora.toISOString());
  if (!troca) return { status: "nao_encontrado" };
  return {
    status: "ok",
    // a lista recarrega com o cliente; aqui o retorno é só a linha alterada
    orcamento: paraOrcamentoAdmin(troca.orcamento, {}),
    auditoria: { acao: "orcamento.status", dados: { id, de: troca.anterior, para: status } },
  };
}

/**
 * Apaga o orçamento de vez (rascunho errado, proposta refeita). `false` se já
 * não existia: pedir duas vezes não é erro.
 */
export async function excluirOrcamento(store: OrcamentoStore, id: string): Promise<boolean> {
  return store.excluir(id);
}
