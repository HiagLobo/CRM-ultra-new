"use client";
/** Barra do painel: busca (e-mail, telefone, CRECI), filtro por status e contagem visível. */
import * as React from "react";
import { palette as p } from "@/lib/palette";
import { Ic } from "@/components/Icon";
import { FILTROS, type FiltroStatus } from "./filtroLeads";

export default function BarraFiltros({
  busca,
  status,
  contagem,
  textoTotal,
  aoBuscar,
  aoFiltrar,
}: {
  busca: string;
  status: FiltroStatus;
  /** Quantos leads de cada status casam com a busca. */
  contagem: Record<FiltroStatus, number>;
  /** "3 de 12 leads" — o que a tabela está mostrando agora. */
  textoTotal: string;
  aoBuscar: (busca: string) => void;
  aoFiltrar: (status: FiltroStatus) => void;
}) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12, marginBottom: 14 }}>
      <div style={{ position: "relative", flex: "1 1 240px", maxWidth: 380 }}>
        <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", display: "flex" }}>
          <Ic n="search" s={17} c={p.g500} />
        </span>
        <input
          type="search"
          value={busca}
          onChange={(e) => aoBuscar(e.target.value)}
          placeholder="Buscar por e-mail, telefone ou CRECI"
          aria-label="Buscar por e-mail, telefone ou CRECI"
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "10px 14px 10px 38px",
            border: `1.5px solid ${p.g300}`,
            borderRadius: 999,
            background: "#fff",
            color: p.ink,
            fontSize: 14,
            fontFamily: "var(--font-body)",
          }}
        />
      </div>

      <div role="group" aria-label="Filtrar por status" style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {FILTROS.map((f) => {
          const ativo = f.valor === status;
          return (
            <button
              key={f.valor}
              type="button"
              aria-pressed={ativo}
              onClick={() => aoFiltrar(f.valor)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                border: `1.5px solid ${ativo ? p.primary : p.g300}`,
                background: ativo ? p.lilac1 : "#fff",
                color: ativo ? p.dark : p.g700,
                borderRadius: 999,
                padding: "7px 13px",
                fontSize: 13,
                fontWeight: 600,
                fontFamily: "var(--font-body)",
                cursor: "pointer",
              }}
            >
              {f.rotulo}
              <span style={{ fontWeight: 700, color: ativo ? p.primary : p.g500 }}>{contagem[f.valor]}</span>
            </button>
          );
        })}
      </div>

      <div aria-live="polite" style={{ marginLeft: "auto", fontSize: 13, fontWeight: 600, color: p.g500 }}>
        {textoTotal}
      </div>
    </div>
  );
}
