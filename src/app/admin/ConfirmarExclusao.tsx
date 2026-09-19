"use client";
/**
 * Exclusão é irreversível — confirmação explícita, com o e-mail à vista.
 * Fecha no fundo, no "Cancelar" e no Esc; o foco começa no "Cancelar", a
 * escolha que não destrói nada.
 */
import * as React from "react";
import { palette as p } from "@/lib/palette";
import { telefoneNacional, type LeadAdmin } from "@/features/lead/admin";
import { acao } from "./estilos";

export default function ConfirmarExclusao({
  lead,
  ocupado,
  aoCancelar,
  aoConfirmar,
}: {
  lead: LeadAdmin;
  ocupado: boolean;
  aoCancelar: () => void;
  aoConfirmar: () => void;
}) {
  React.useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !ocupado) aoCancelar();
    };
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [aoCancelar, ocupado]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-excluir-lead"
      onClick={aoCancelar}
      style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(28,10,46,.55)", display: "grid", placeItems: "center", padding: 20 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: "#fff", borderRadius: 18, padding: 28, width: "min(440px, 100%)", boxSizing: "border-box", boxShadow: "0 30px 70px rgba(20,6,38,.4)" }}
      >
        <h2 id="titulo-excluir-lead" style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, margin: "0 0 10px", color: p.ink }}>
          Excluir este lead?
        </h2>
        <p style={{ fontSize: 14.5, lineHeight: 1.6, color: p.g700, margin: "0 0 6px" }}>
          Todos os dados de <strong style={{ color: p.ink }}>{lead.email ?? telefoneNacional(lead.telefone)}</strong> serão apagados —
          contato, consentimento e histórico. <strong>Não dá para desfazer.</strong>
        </p>
        <p style={{ fontSize: 13, color: p.g500, margin: "0 0 22px" }}>
          Use quando o titular pedir a eliminação dos dados (LGPD). Para só parar o follow-up,
          &ldquo;Descartar&rdquo; basta e preserva o histórico.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
          <button type="button" autoFocus onClick={aoCancelar} style={{ ...acao(p.g500, false), padding: "11px 18px" }}>
            Cancelar
          </button>
          <button
            type="button"
            onClick={aoConfirmar}
            disabled={ocupado}
            style={{ ...acao(p.error, true), padding: "11px 18px", opacity: ocupado ? 0.6 : 1 }}
          >
            {ocupado ? "Excluindo…" : "Excluir definitivamente"}
          </button>
        </div>
      </div>
    </div>
  );
}
