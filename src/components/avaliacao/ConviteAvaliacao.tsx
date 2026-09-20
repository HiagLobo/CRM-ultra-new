"use client";
/**
 * Convite discreto para avaliar o demo (F1), depois de ~4 minutos navegando.
 *
 * Fica no canto inferior direito, **acima** do botão Guia — nunca por cima dele,
 * da barra de abas do celular ou da faixa de demonstração (que vive no fluxo, lá
 * no topo). No celular ocupa a largura da tela menos as margens, sem estouro.
 *
 * "Agora não" tira o convite da frente; quem mudar de ideia reabre pelo Guia.
 */
import * as React from "react";
import { palette as p } from "@/lib/palette";
import { Ic } from "@/components/Icon";

const CSS_CONVITE = `
.av-convite { animation: avConvite .32s cubic-bezier(.2,.7,.3,1) both; }
@keyframes avConvite { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
.av-convite button:focus-visible { outline: 3px solid ${p.primary}; outline-offset: 2px; }
@media (prefers-reduced-motion: reduce) { .av-convite { animation: none; } }
`;

export default function ConviteAvaliacao({
  aoAvaliar,
  aoDispensar,
  rodape,
}: {
  aoAvaliar: () => void;
  aoDispensar: () => void;
  /** Distância até a base da tela (CSS) — já calculada acima do botão Guia. */
  rodape: string;
}) {
  return (
    <aside
      aria-label="Convite para avaliar a demonstração"
      className="av-convite"
      style={{
        position: "fixed",
        right: 16,
        bottom: rodape,
        zIndex: 240, // abaixo do guia (250) e dos modais (300)
        width: "min(320px, calc(100vw - 32px))",
        boxSizing: "border-box",
        background: "#fff",
        border: `1px solid ${p.g300}`,
        borderRadius: 16,
        boxShadow: "0 18px 46px rgba(20,6,38,.22)",
        padding: 16,
        fontFamily: "var(--font-body)",
      }}
    >
      <style>{CSS_CONVITE}</style>
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 12 }}>
        <span
          style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            background: p.lilac1,
            display: "grid",
            placeItems: "center",
            flexShrink: 0,
          }}
        >
          <Ic n="star" s={17} c={p.primary} />
        </span>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15.5, color: p.ink, lineHeight: 1.3 }}>
            O que achou até aqui?
          </div>
          <div style={{ fontSize: 13, color: p.g700, lineHeight: 1.5, marginTop: 4 }}>
            Você já navegou alguns minutos. Dá uma nota de 1 a 5 — leva menos de um minuto.
          </div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={aoAvaliar}
          className="ds-btnpop"
          style={{
            flex: "1 1 auto",
            border: "none",
            borderRadius: 999,
            padding: "11px 18px",
            background: p.primary,
            color: "#fff",
            fontFamily: "var(--font-body)",
            fontWeight: 700,
            fontSize: 14,
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          Avaliar o demo
        </button>
        <button
          type="button"
          onClick={aoDispensar}
          style={{
            border: "none",
            background: "none",
            padding: "8px 4px",
            color: p.g500,
            fontFamily: "var(--font-body)",
            fontSize: 13.5,
            fontWeight: 600,
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          Agora não
        </button>
      </div>
    </aside>
  );
}
