"use client";
/**
 * Caixa de diálogo do painel (confirmação de exclusão, mini-formulário de etapa,
 * "+ Novo lead"): fundo escuro, cartão central, título, Esc fecha. Quem tem
 * dado digitado passa `fecharNoFundo={false}` para um toque fora não apagar tudo.
 * Fica acima da gaveta (z-index maior): a gaveta não fecha junto no Esc porque
 * o painel desliga o Esc dela enquanto um diálogo está aberto.
 */
import * as React from "react";
import { palette as p } from "@/lib/palette";

export default function Dialogo({
  idTitulo,
  titulo,
  aoFechar,
  ocupado = false,
  fecharNoFundo = true,
  largura = 440,
  children,
}: {
  idTitulo: string;
  titulo: string;
  aoFechar: () => void;
  /** Enquanto envia, Esc e fundo não fecham (a resposta ainda vai chegar). */
  ocupado?: boolean;
  fecharNoFundo?: boolean;
  largura?: number;
  children: React.ReactNode;
}) {
  React.useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !ocupado) aoFechar();
    };
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [aoFechar, ocupado]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={idTitulo}
      onClick={() => fecharNoFundo && !ocupado && aoFechar()}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "rgba(28,10,46,.55)",
        display: "grid",
        padding: 16,
        overflowY: "auto",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          // margin auto (e não place-items: center): formulário mais alto que a tela do
          // celular rola a partir do topo, em vez de ter o começo cortado
          margin: "auto",
          background: p.white,
          borderRadius: 18,
          padding: 24,
          width: `min(${largura}px, 100%)`,
          boxSizing: "border-box",
          boxShadow: "0 30px 70px rgba(20,6,38,.4)",
        }}
      >
        <h2 id={idTitulo} style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, margin: "0 0 14px", color: p.ink }}>
          {titulo}
        </h2>
        {children}
      </div>
    </div>
  );
}
