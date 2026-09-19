"use client";
/**
 * Abas do funil com a contagem (que respeita a busca). No celular rolam na
 * horizontal dentro da própria faixa — a página não estoura para o lado.
 * "Hoje" com pendência ganha destaque para não passar batido.
 */
import * as React from "react";
import { palette as p } from "@/lib/palette";
import { ABAS, type Aba } from "./filtroLeads";

export default function AbasFunil({
  ativa,
  contagem,
  aoEscolher,
}: {
  ativa: Aba;
  contagem: Record<Aba, number>;
  aoEscolher: (aba: Aba) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Etapas do funil"
      style={{
        display: "flex",
        gap: 6,
        overflowX: "auto",
        maxWidth: "100%",
        padding: "2px 2px 8px",
        marginBottom: 10,
        scrollbarWidth: "thin",
        WebkitOverflowScrolling: "touch",
      }}
    >
      {ABAS.map((a) => {
        const selecionada = a.valor === ativa;
        const alerta = a.valor === "hoje" && contagem.hoje > 0;
        return (
          <button
            key={a.valor}
            type="button"
            role="tab"
            aria-selected={selecionada}
            aria-controls="lista-leads"
            onClick={() => aoEscolher(a.valor)}
            style={{
              flexShrink: 0,
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              border: `1.5px solid ${selecionada ? p.primary : p.g300}`,
              background: selecionada ? p.lilac1 : p.white,
              color: selecionada ? p.dark : p.g700,
              borderRadius: 999,
              padding: "7px 13px",
              fontSize: 13.5,
              fontWeight: 600,
              fontFamily: "var(--font-body)",
              whiteSpace: "nowrap",
              cursor: "pointer",
            }}
          >
            {a.rotulo}
            <span
              style={{
                minWidth: 20,
                textAlign: "center",
                borderRadius: 999,
                padding: "1px 6px",
                fontSize: 12,
                fontWeight: 700,
                background: alerta ? p.error : "transparent",
                color: alerta ? p.white : selecionada ? p.primary : p.g500,
              }}
            >
              {contagem[a.valor]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
