/** Estilo compartilhado dos botões de ação do painel (cabeçalho e confirmação). */
import type * as React from "react";
import { palette as p } from "@/lib/palette";

export function acao(cor: string, cheio: boolean): React.CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    border: cheio ? "none" : `1.5px solid ${p.g300}`,
    background: cheio ? cor : "#fff",
    color: cheio ? "#fff" : p.g700,
    borderRadius: 999,
    padding: "10px 18px",
    fontSize: 14,
    fontWeight: 600,
    fontFamily: "var(--font-body)",
    textDecoration: "none",
    cursor: "pointer",
  };
}
