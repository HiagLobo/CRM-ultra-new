"use client";
/**
 * Bloco "Orçamentos" da ficha do lead: as propostas deste cliente (número,
 * total, situação e validade) e o atalho para montar mais uma já com ele
 * escolhido. Lista vazia também fala: é dali que sai o primeiro orçamento.
 */
import * as React from "react";
import { palette as p } from "@/lib/palette";
import { Ic } from "@/components/Icon";
import { formatarReais, ROTULO_STATUS, type OrcamentoAdmin } from "@/features/orcamento";
import { botaoContorno } from "./estilos";
import { COR_STATUS, linkDocumento, textoValidade } from "./listaOrcamentos";

export default function BlocoOrcamentos({
  orcamentos,
  hoje,
  aoNovoOrcamento,
}: {
  /** Os deste lead, do mais recente para o mais antigo. */
  orcamentos: ReadonlyArray<OrcamentoAdmin>;
  hoje: string;
  aoNovoOrcamento: () => void;
}) {
  return (
    <div>
      {orcamentos.length === 0 ? (
        <p style={{ margin: "0 0 10px", fontSize: 14, color: p.g700, lineHeight: 1.5 }}>
          Nenhuma proposta para este cliente ainda.
        </p>
      ) : (
        <ul style={{ listStyle: "none", margin: "0 0 10px", padding: 0, display: "grid", gap: 8 }}>
          {orcamentos.map((o) => (
            <li key={o.id} style={{ border: `1px solid ${p.g300}`, borderRadius: 10, padding: "8px 12px", display: "grid", gap: 3 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <a href={linkDocumento(o.id)} target="_blank" rel="noopener noreferrer" style={{ color: p.primary, fontWeight: 700, fontSize: 14 }}>
                  {o.numero}
                </a>
                <span style={{ fontSize: 12.5, fontWeight: 600, color: COR_STATUS[o.status] }}>{ROTULO_STATUS[o.status]}</span>
                <span style={{ fontSize: 12.5, color: p.g500, marginLeft: "auto" }}>{textoValidade(o, hoje)}</span>
              </div>
              <span style={{ fontSize: 13.5, color: p.ink }}>{formatarReais(o.totais.mensalCentavos)} por mês</span>
            </li>
          ))}
        </ul>
      )}
      <button type="button" onClick={aoNovoOrcamento} style={botaoContorno(p.primary)}>
        <Ic n="calculator" s={14} c="currentColor" /> Novo orçamento
      </button>
    </div>
  );
}
