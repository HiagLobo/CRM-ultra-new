"use client";
/**
 * Moldura do fluxo de acesso: fundo escurecido, cartão, etapa, título e o
 * botão de fechar (também no Esc e no clique fora). Os passos vêm em `children`
 * — quem decide o passo é o `AccessFlow`.
 */
import * as React from "react";
import { palette as p } from "@/lib/palette";
import { Ic } from "@/components/Icon";

export default function ModalAcesso({
  titulo,
  etapa,
  aoFechar,
  children,
}: {
  titulo: string;
  /** "Passo 1 de 2"; vazio some. */
  etapa: string;
  aoFechar: () => void;
  children: React.ReactNode;
}) {
  React.useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape") aoFechar();
    };
    document.addEventListener("keydown", aoTeclar);
    return () => document.removeEventListener("keydown", aoTeclar);
  }, [aoFechar]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="acesso-titulo"
      onClick={aoFechar}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
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
          width: "min(460px, 100%)",
          boxSizing: "border-box",
          margin: "auto",
          minWidth: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 18 }}>
          <div>
            {etapa && (
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: p.primary, marginBottom: 6 }}>
                {etapa}
              </div>
            )}
            <h2
              id="acesso-titulo"
              style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, margin: 0, color: p.ink }}
            >
              {titulo}
            </h2>
          </div>
          <button
            type="button"
            aria-label="Fechar"
            onClick={aoFechar}
            className="ds-iconbox"
            style={{
              width: 38,
              height: 38,
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
            <Ic n="x" s={18} />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}
