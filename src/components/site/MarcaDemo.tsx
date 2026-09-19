/**
 * Marca da imobiliária FICTÍCIA do site de exemplo (monograma + nome).
 * O site de exemplo é o site que o cliente do CRM ganha — por isso a marca dele
 * é a da rede do demo (`demo.*`), nunca o logo do CRM (`brand`).
 */
import * as React from "react";
import { palette } from "@/lib/palette";
import { demo } from "@/config/demo";

export default function MarcaDemo({ claro = false }: { claro?: boolean }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
      <span
        aria-hidden="true"
        style={{
          width: 40, height: 40, borderRadius: 11, flexShrink: 0,
          background: claro ? "#fff" : palette.primary, color: claro ? palette.primary : "#fff",
          display: "grid", placeItems: "center",
          fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 15, letterSpacing: ".02em",
        }}
      >
        {demo.sigla}
      </span>
      <span
        style={{
          fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, lineHeight: 1.1,
          color: claro ? "#fff" : palette.ink, whiteSpace: "nowrap",
        }}
      >
        {demo.nome}
      </span>
    </span>
  );
}

/** Aviso dos botões de contato do site de exemplo (não ligam para ninguém de verdade). */
export function avisoContatoExemplo() {
  window.alert(
    "Site de exemplo: no site real da imobiliária, este botão abre o WhatsApp do corretor responsável pelo imóvel.",
  );
}
