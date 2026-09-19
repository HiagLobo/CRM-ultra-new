"use client";
/**
 * Boas-vindas do painel: o que é aquela tela e por onde começar.
 * Aparece uma vez por painel (a memória é do `guiaState`) e sai do caminho — o
 * visitante veio explorar o produto, não ler manual.
 */
import * as React from "react";
import { palette as p } from "@/lib/palette";
import { Ic } from "@/components/Icon";
import type { GuiaPainel } from "@/content/guia";

export default function WelcomeModal({
  guia,
  aoFechar,
}: {
  guia: GuiaPainel;
  aoFechar: () => void;
}) {
  const fechar = React.useRef(aoFechar);
  fechar.current = aoFechar;

  React.useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape") fechar.current();
    };
    document.addEventListener("keydown", aoTeclar);
    return () => document.removeEventListener("keydown", aoTeclar);
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="guia-titulo"
      onClick={aoFechar}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 300,
        background: "rgba(28,10,46,.55)",
        display: "grid",
        placeItems: "center",
        padding: 20,
        overflowY: "auto",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 18,
          boxShadow: "0 30px 70px rgba(20,6,38,.4)",
          padding: 30,
          width: "min(520px, 100%)",
          boxSizing: "border-box",
          margin: "auto",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 18 }}>
          <span
            style={{
              width: 46,
              height: 46,
              borderRadius: 13,
              background: p.lilac1,
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
            }}
          >
            <Ic n="sparkles" s={22} c={p.primary} />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: p.primary, marginBottom: 5 }}>
              {guia.nome}
            </div>
            <h2 id="guia-titulo" style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 21, margin: 0, color: p.ink, lineHeight: 1.25 }}>
              {guia.titulo}
            </h2>
          </div>
          <button
            type="button"
            aria-label="Fechar"
            onClick={aoFechar}
            className="ds-iconbox"
            style={{
              width: 36,
              height: 36,
              display: "grid",
              placeItems: "center",
              border: `1.5px solid ${p.g300}`,
              background: "#fff",
              borderRadius: 11,
              cursor: "pointer",
              color: p.g700,
              flexShrink: 0,
            }}
          >
            <Ic n="x" s={17} />
          </button>
        </div>

        <p style={{ fontSize: 14.5, lineHeight: 1.6, color: p.g700, margin: "0 0 20px" }}>{guia.resumo}</p>

        <ol style={{ listStyle: "none", padding: 0, margin: "0 0 24px", display: "grid", gap: 14 }}>
          {guia.passos.map((passo, i) => (
            <li key={passo.titulo} style={{ display: "flex", gap: 12 }}>
              <span
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  background: p.lilac1,
                  color: p.primary,
                  display: "grid",
                  placeItems: "center",
                  fontWeight: 700,
                  fontSize: 13,
                  flexShrink: 0,
                }}
              >
                {i + 1}
              </span>
              <span>
                <span style={{ display: "block", fontWeight: 700, fontSize: 14.5, color: p.ink }}>
                  {passo.titulo}
                </span>
                <span style={{ display: "block", fontSize: 14, color: p.g700, lineHeight: 1.55, marginTop: 2 }}>
                  {passo.texto}
                </span>
              </span>
            </li>
          ))}
        </ol>

        <button
          type="button"
          onClick={aoFechar}
          autoFocus
          className="ds-btnpop"
          style={{
            width: "100%",
            border: "none",
            borderRadius: 999,
            padding: "14px 24px",
            background: p.primary,
            color: "#fff",
            fontFamily: "var(--font-body)",
            fontWeight: 700,
            fontSize: 15,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 9,
          }}
        >
          Começar a explorar <Ic n="arrow-right" s={18} c="#fff" />
        </button>
      </div>
    </div>
  );
}
