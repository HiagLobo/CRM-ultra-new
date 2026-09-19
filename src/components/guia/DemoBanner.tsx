"use client";
/**
 * Faixa fina no topo do painel: deixa claro que é demonstração e que os dados
 * são inventados. Fica **no fluxo** (não é `fixed`) de propósito — assim empurra
 * o conteúdo em vez de cobrir a topbar do painel.
 */
import * as React from "react";
import { palette as p } from "@/lib/palette";
import { brand } from "@/config/brand";
import { Ic } from "@/components/Icon";

export default function DemoBanner({
  aoSaberMais,
  aoFechar,
}: {
  aoSaberMais: () => void;
  aoFechar: () => void;
}) {
  return (
    <div
      role="status"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        flexWrap: "wrap",
        background: p.lilac1,
        borderBottom: `1px solid ${p.lilac2}`,
        color: p.dark,
        padding: "9px 16px",
        fontSize: 13.5,
        fontFamily: "var(--font-body)",
      }}
    >
      <Ic n="sparkles" s={16} c={p.primary} />
      <span>
        <strong style={{ fontWeight: 700 }}>Modo demonstração</strong> — você está explorando o{" "}
        {brand.nomeCurto} com dados fictícios. Nada aqui é de cliente real.
      </span>
      <button
        type="button"
        onClick={aoSaberMais}
        style={{
          background: "none",
          border: "none",
          padding: 0,
          color: p.primary,
          fontWeight: 700,
          fontSize: 13.5,
          fontFamily: "var(--font-body)",
          cursor: "pointer",
          textDecoration: "underline",
        }}
      >
        Como usar este painel
      </button>
      <button
        type="button"
        aria-label="Ocultar aviso de demonstração"
        onClick={aoFechar}
        style={{
          marginLeft: "auto",
          background: "none",
          border: "none",
          padding: 4,
          cursor: "pointer",
          color: p.g500,
          display: "grid",
          placeItems: "center",
        }}
      >
        <Ic n="x" s={16} c={p.g500} />
      </button>
    </div>
  );
}
