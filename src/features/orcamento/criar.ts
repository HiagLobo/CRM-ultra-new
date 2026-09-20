/**
 * Criar o orçamento (sem HTTP): confere o lead, calcula com a tabela do dia e
 * grava o retrato. O número `ORC-AAAA-NNN` sai do store, que é quem consegue
 * garantir que duas criações ao mesmo tempo não repitam.
 *
 * Recusa do cálculo é RESULTADO, não exceção: piso furado, assentos abaixo do
 * mínimo ou sem assento voltam como valor para a rota responder 409 e a tela
 * explicar. O piso é trava: nem o painel, nem um POST direto passam por ele.
 */
import type { LeadStore } from "../../lib/leadStore";
import type { OrcamentoStore } from "../../lib/orcamentoStorePorta";
import { calcularOrcamento, type ResultadoCalculo } from "./calculo";
import { anoEmRecife, diaEmRecife, diaMaisDias } from "./orcamento";
import { paraOrcamentoAdmin, clienteDoLead, type OrcamentoAdmin } from "./admin";
import type { NovoOrcamento } from "./schema";
import { TABELA, VALIDADE_PADRAO_DIAS, type PublicoOrcamento, type TabelaPrecos } from "./tabela";

export interface DepsCriarOrcamento {
  orcamentos: OrcamentoStore;
  leads: LeadStore;
}

/** Recusa do cálculo, já sem o `ok: false` (o que a rota devolve no 409). */
export type RecusaCalculo = Exclude<ResultadoCalculo, { ok: true }>;

export type ResultadoCriarOrcamento =
  | {
      status: "ok";
      orcamento: OrcamentoAdmin;
      /** Só ids e códigos — nunca valores, nome do cliente ou observação. */
      auditoria: {
        acao: "orcamento.criado";
        dados: { id: string; publico: PublicoOrcamento; assentos: number };
      };
    }
  | { status: "lead_nao_encontrado" }
  | { status: "recusado"; recusa: RecusaCalculo };

/**
 * O orçamento nasce como rascunho: enviar é um clique do fundador depois de
 * conferir o documento, nunca um efeito colateral de salvar.
 */
export async function criarOrcamento(
  deps: DepsCriarOrcamento,
  pedido: NovoOrcamento,
  agora: Date = new Date(),
  /** A tabela em vigor. Entra por parâmetro para o teste provar que orçamento
   *  emitido não muda quando a tabela muda, sem remendar o singleton. */
  tabela: TabelaPrecos = TABELA,
): Promise<ResultadoCriarOrcamento> {
  const lead = await deps.leads.buscarPorId(pedido.leadId);
  if (!lead) return { status: "lead_nao_encontrado" };

  const calculado = calcularOrcamento(pedido, tabela);
  if (!calculado.ok) return { status: "recusado", recusa: calculado };

  const hoje = diaEmRecife(agora);
  const orcamento = await deps.orcamentos.criar({
    leadId: pedido.leadId,
    publico: pedido.publico,
    status: "rascunho",
    itens: calculado.calculo.itens,
    totais: calculado.calculo.totais,
    condicoes: calculado.calculo.condicoes,
    validadeEm: diaMaisDias(hoje, pedido.validadeDias ?? VALIDADE_PADRAO_DIAS),
    ...(pedido.observacao ? { observacao: pedido.observacao } : {}),
    em: agora.toISOString(),
    ano: anoEmRecife(agora),
  });

  return {
    status: "ok",
    orcamento: paraOrcamentoAdmin(orcamento, clienteDoLead(lead)),
    auditoria: {
      acao: "orcamento.criado",
      dados: {
        id: orcamento.id,
        publico: pedido.publico,
        // quantidade, não valor: a auditoria nunca guarda dinheiro
        assentos: pedido.assentos.pro + pedido.assentos.ultra,
      },
    },
  };
}
