"use client";
/** Busca do painel (nome, e-mail, telefone, CRECI) — vale sobre a aba aberta — e a contagem visível. */
import * as React from "react";
import { palette as p } from "@/lib/palette";
import { Ic } from "@/components/Icon";

export default function BarraFiltros({
  busca,
  textoTotal,
  aoBuscar,
}: {
  busca: string;
  /** "3 de 12 leads" — o que a lista está mostrando agora. */
  textoTotal: string;
  aoBuscar: (busca: string) => void;
}) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12, marginBottom: 12 }}>
      <div style={{ position: "relative", flex: "1 1 240px", maxWidth: 420 }}>
        <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", display: "flex" }}>
          <Ic n="search" s={17} c={p.g500} />
        </span>
        <input
          type="search"
          value={busca}
          onChange={(e) => aoBuscar(e.target.value)}
          placeholder="Buscar por nome, e-mail, telefone ou CRECI"
          aria-label="Buscar por nome, e-mail, telefone ou CRECI"
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "10px 14px 10px 38px",
            border: `1.5px solid ${p.g300}`,
            borderRadius: 999,
            background: p.white,
            color: p.ink,
            fontSize: 14,
            fontFamily: "var(--font-body)",
          }}
        />
      </div>

      <div aria-live="polite" style={{ marginLeft: "auto", fontSize: 13, fontWeight: 600, color: p.g500 }}>
        {textoTotal}
      </div>
    </div>
  );
}
