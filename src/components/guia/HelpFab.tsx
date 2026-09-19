"use client";
/** Botão flutuante de ajuda — abre e fecha o guia da tela atual. */
import * as React from "react";
import { palette as p } from "@/lib/palette";
import { Ic } from "@/components/Icon";

export default function HelpFab({ aberto, aoAlternar }: { aberto: boolean; aoAlternar: () => void }) {
  return (
    <button
      type="button"
      onClick={aoAlternar}
      aria-expanded={aberto}
      aria-label={aberto ? "Fechar guia" : "Abrir guia da tela"}
      data-tour="fab-guia"
      title={aberto ? "Fechar guia" : "Precisa de ajuda nesta tela?"}
      className="ds-btnpop"
      style={{
        position: "fixed",
        right: 16,
        bottom: 20,
        zIndex: 250,
        display: "inline-flex",
        alignItems: "center",
        gap: 9,
        border: "none",
        borderRadius: 999,
        padding: "13px 20px",
        background: aberto ? p.dark : p.primary,
        color: "#fff",
        fontFamily: "var(--font-body)",
        fontWeight: 700,
        fontSize: 14,
        cursor: "pointer",
        boxShadow: "0 14px 34px rgba(49,46,129,.34)",
      }}
    >
      <Ic n={aberto ? "x" : "help-circle"} s={18} c="#fff" />
      {aberto ? "Fechar" : "Guia"}
    </button>
  );
}
