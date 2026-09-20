"use client";
/**
 * O fluxo de criar um orçamento, que atravessa o painel inteiro: o formulário
 * abre da seção Orçamentos, da ficha do lead e do botão "Duplicar", e pode sair
 * no meio para cadastrar um cliente que ainda não está no funil.
 *
 * O que este estado garante: sair para o "+ Novo lead" **não joga fora** o que
 * já estava digitado, e o que acaba de ser salvo é anunciado pela seção (que
 * também abre na aba certa).
 */
import * as React from "react";
import type { LeadAdmin } from "@/features/lead/admin";
import type { OrcamentoAdmin } from "@/features/orcamento";
import type { FormOrcamento } from "./formOrcamento";

/** O formulário aberto: com ou sem cliente, com ou sem valores pré-preenchidos. */
interface PedidoNovoOrcamento {
  lead: LeadAdmin | null;
  form?: FormOrcamento;
}

export function useNovoOrcamento() {
  const [pedido, setPedido] = React.useState<PedidoNovoOrcamento | null>(null);
  /** O que estava sendo digitado quando o fundador saiu para cadastrar o cliente. */
  const [pendente, setPendente] = React.useState<FormOrcamento | null>(null);
  const [salvo, setSalvo] = React.useState<OrcamentoAdmin | null>(null);

  return {
    /** O formulário aberto agora, ou `null`. */
    pedido,
    /** O último orçamento salvo (a seção abre na aba dele e anuncia o número). */
    salvo,
    abrir(lead: LeadAdmin | null, form?: FormOrcamento) {
      setPedido({ lead, ...(form ? { form } : {}) });
    },
    fechar() {
      setPedido(null);
    },
    /** Vai cadastrar o cliente, guardando a proposta em andamento. */
    irParaNovoLead(form: FormOrcamento) {
      setPendente(form);
      setPedido(null);
    },
    /**
     * Volta do "+ Novo lead" com o cliente novo (ou sem, se desistiu). `false`
     * quando não havia orçamento em andamento: aí o painel segue o fluxo normal
     * do cadastro (abrir a ficha do lead).
     */
    voltarDoNovoLead(lead: LeadAdmin | null): boolean {
      if (!pendente) return false;
      setPedido({ lead, form: pendente });
      setPendente(null);
      return true;
    },
    salvou(orcamento: OrcamentoAdmin) {
      setPedido(null);
      setSalvo(orcamento);
    },
  };
}
