"use client";
/** Estado vazio/carregando da lista: ícone + texto (e, se vier, uma ação). Nada de tela em branco. */
import * as React from "react";
import { palette as p } from "@/lib/palette";
import { Ic } from "@/components/Icon";

export default function Aviso({ icone, children }: { icone: string; children: React.ReactNode }) {
  return (
    <div style={{ background: p.white, border: `1px dashed ${p.g300}`, borderRadius: 16, padding: "40px 20px", textAlign: "center", color: p.g500 }}>
      <div style={{ width: 50, height: 50, borderRadius: "50%", background: p.lilac1, display: "grid", placeItems: "center", margin: "0 auto 14px" }}>
        <Ic n={icone} s={24} c={p.primary} />
      </div>
      <div style={{ fontSize: 14.5, maxWidth: 440, margin: "0 auto", lineHeight: 1.6 }}>{children}</div>
    </div>
  );
}

/** Faixa de erro do topo, com "Recarregar" — falha nunca fica muda. */
export function FaixaErro({ mensagem, aoRecarregar }: { mensagem: string; aoRecarregar: () => void }) {
  return (
    <div role="alert" style={{ display: "flex", alignItems: "center", gap: 9, background: `${p.error}14`, border: `1px solid ${p.error}55`, borderRadius: 12, padding: "12px 14px", fontSize: 14, marginBottom: 20 }}>
      <Ic n="alert-triangle" s={17} c={p.error} /> {mensagem}
      <button type="button" onClick={aoRecarregar} style={{ marginLeft: "auto", background: "none", border: "none", color: p.primary, fontWeight: 700, cursor: "pointer", fontSize: 13.5 }}>
        Recarregar
      </button>
    </div>
  );
}

/** Botão com cara de link, para a ação dentro do aviso ("Ver todos", "Limpar busca"). */
export function LinkAviso({ children, aoClicar }: { children: React.ReactNode; aoClicar: () => void }) {
  return (
    <button type="button" onClick={aoClicar} style={{ background: "none", border: "none", padding: 0, color: p.primary, fontWeight: 700, cursor: "pointer", fontSize: "inherit", fontFamily: "inherit" }}>
      {children}
    </button>
  );
}
