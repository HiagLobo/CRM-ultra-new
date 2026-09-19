"use client";
/** Balão do tour guiado: título, explicação e os botões de navegação. */
import * as React from "react";
import { palette as p } from "@/lib/palette";
import { Ic } from "@/components/Icon";
import type { PassoTour } from "@/content/guia";

export default function BalaoDoTour({
  passo,
  numero,
  total,
  posicao,
  aoPular,
  aoVoltar,
  aoAvancar,
}: {
  passo: PassoTour;
  /** Posição do passo entre os que estão na tela (1 = primeiro). */
  numero: number;
  total: number;
  posicao: { top: number; left: number; largura: number };
  aoPular: () => void;
  aoVoltar: () => void;
  aoAvancar: () => void;
}) {
  const ultimo = numero >= total;

  return (
    <div
      role="dialog"
      data-tour-balao=""
      aria-modal="false"
      aria-labelledby="tour-titulo"
      style={{
        position: "fixed",
        top: posicao.top,
        left: posicao.left,
        width: posicao.largura,
        background: "#fff",
        borderRadius: 14,
        boxShadow: "0 24px 60px rgba(20,6,38,.4)",
        padding: 18,
        pointerEvents: "auto",
        fontFamily: "var(--font-body)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: p.primary }}>
          Passo {numero} de {total}
        </span>
        <button
          type="button"
          onClick={aoPular}
          style={{ marginLeft: "auto", background: "none", border: "none", padding: 2, cursor: "pointer", color: p.g500, display: "grid" }}
          aria-label="Fechar o tour"
        >
          <Ic n="x" s={16} c={p.g500} />
        </button>
      </div>

      <h3 id="tour-titulo" style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, margin: "0 0 6px", color: p.ink }}>
        {passo.titulo}
      </h3>
      <p style={{ fontSize: 14, lineHeight: 1.55, color: p.g700, margin: 0 }}>{passo.texto}</p>

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 16 }}>
        <button
          type="button"
          onClick={aoPular}
          style={{ background: "none", border: "none", padding: 0, color: p.g500, fontSize: 13, cursor: "pointer", fontFamily: "var(--font-body)" }}
        >
          Pular
        </button>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          {numero > 1 && (
            <button
              type="button"
              onClick={aoVoltar}
              style={{ border: `1.5px solid ${p.g300}`, background: "#fff", color: p.g700, borderRadius: 999, padding: "9px 16px", fontSize: 13.5, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-body)" }}
            >
              Anterior
            </button>
          )}
          <button
            type="button"
            onClick={aoAvancar}
            className="ds-btnpop"
            style={{ border: "none", background: p.primary, color: "#fff", borderRadius: 999, padding: "9px 18px", fontSize: 13.5, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 7, fontFamily: "var(--font-body)" }}
          >
            {ultimo ? "Concluir" : "Próximo"}
            {!ultimo && <Ic n="arrow-right" s={15} c="#fff" />}
          </button>
        </div>
      </div>
    </div>
  );
}
