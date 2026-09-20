"use client";
/**
 * Excluir um orçamento apaga a proposta de vez (número, valores e condições) —
 * por isso confirma. Marcar recusado é outra coisa: guarda o histórico.
 * O foco começa em "Cancelar". A falha aparece aqui mesmo.
 */
import * as React from "react";
import { palette as p } from "@/lib/palette";
import { formatarReais, type OrcamentoAdmin } from "@/features/orcamento";
import Dialogo from "./Dialogo";
import { acao, caixaErro } from "./estilos";
import { resumoDaLinha } from "./listaOrcamentos";

export default function ConfirmarExclusaoOrcamento({
  orcamento,
  ocupado,
  erro,
  aoCancelar,
  aoConfirmar,
}: {
  orcamento: OrcamentoAdmin;
  ocupado: boolean;
  erro: string | null;
  aoCancelar: () => void;
  aoConfirmar: () => void;
}) {
  return (
    <Dialogo idTitulo="titulo-excluir-orcamento" titulo={`Excluir o ${orcamento.numero}?`} aoFechar={aoCancelar} ocupado={ocupado}>
      <p style={{ fontSize: 14.5, lineHeight: 1.6, color: p.g700, margin: "0 0 10px" }}>
        A proposta some do painel e o documento deixa de abrir.{" "}
        <strong style={{ color: p.ink }}>Não dá para desfazer.</strong> Se a intenção é registrar que o cliente
        não aceitou, marque <strong style={{ color: p.ink }}>Recusado</strong>: aí o histórico fica.
      </p>
      <blockquote style={{ margin: "0 0 18px", padding: "10px 12px", background: p.g100, borderRadius: 10, fontSize: 13.5, lineHeight: 1.6, color: p.ink, overflowWrap: "anywhere" }}>
        {resumoDaLinha(orcamento)}
        <br />
        Total do ano: {formatarReais(orcamento.totais.anoCentavos)}
      </blockquote>
      {erro && <div role="alert" style={{ ...caixaErro, marginBottom: 14 }}>{erro}</div>}
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
        <button type="button" autoFocus onClick={aoCancelar} disabled={ocupado} style={{ ...acao(p.g500, false), padding: "11px 18px" }}>
          Cancelar
        </button>
        <button type="button" onClick={aoConfirmar} disabled={ocupado} style={{ ...acao(p.error, true), padding: "11px 18px", opacity: ocupado ? 0.6 : 1 }}>
          {ocupado ? "Excluindo…" : "Excluir"}
        </button>
      </div>
    </Dialogo>
  );
}
