"use client";
/**
 * Primitivas visuais da landing de marketing.
 * Reusa os tokens do design system (palette + classes ds-* do globals.css) para
 * a landing ter a mesma cara do resto do app. Marca sempre via `brand.*`.
 */
import * as React from "react";
import { palette as p } from "@/lib/palette";
import { Ic } from "@/components/Icon";

/** Faixa de conteúdo com a largura e o respiro padrão da landing. */
export function Secao({
  id,
  fundo,
  children,
  style,
}: {
  id?: string;
  fundo?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <section id={id} style={{ background: fundo ?? "transparent", scrollMarginTop: 80 }}>
      <div
        className="ds-pad lp-rise"
        style={{ maxWidth: 1240, margin: "0 auto", padding: "88px 32px", ...style }}
      >
        {children}
      </div>
    </section>
  );
}

export function Eyebrow({ children, claro }: { children: React.ReactNode; claro?: boolean }) {
  return (
    <div
      style={{
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: ".06em",
        textTransform: "uppercase",
        color: claro ? "rgba(255,255,255,.7)" : p.primary,
        marginBottom: 10,
      }}
    >
      {children}
    </div>
  );
}

export function Titulo({
  children,
  claro,
  style,
}: {
  children: React.ReactNode;
  claro?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <h2
      style={{
        fontFamily: "var(--font-display)",
        fontWeight: 700,
        fontSize: "clamp(26px, 3.4vw, 36px)",
        lineHeight: 1.15,
        letterSpacing: "-.01em",
        margin: 0,
        color: claro ? "#fff" : p.ink,
        ...style,
      }}
    >
      {children}
    </h2>
  );
}

export function Sub({
  children,
  claro,
  style,
}: {
  children: React.ReactNode;
  claro?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <p
      style={{
        fontSize: 17,
        lineHeight: 1.6,
        color: claro ? "rgba(255,255,255,.85)" : p.g700,
        margin: "14px 0 0",
        maxWidth: 640,
        ...style,
      }}
    >
      {children}
    </p>
  );
}

/** Cartão branco padrão (recursos, públicos, prova). */
export function Cartao({
  icone,
  titulo,
  children,
  destaque,
}: {
  icone?: string;
  titulo: string;
  children: React.ReactNode;
  destaque?: boolean;
}) {
  return (
    <article
      style={{
        background: "#fff",
        borderRadius: 16,
        border: `1px solid ${destaque ? p.primary : p.g300}`,
        boxShadow: destaque ? "0 18px 44px rgba(79,70,229,.16)" : "0 8px 24px rgba(28,26,34,.06)",
        padding: 26,
        height: "100%",
        boxSizing: "border-box",
      }}
    >
      {icone && (
        <div
          style={{
            width: 46,
            height: 46,
            borderRadius: 13,
            background: p.lilac1,
            display: "grid",
            placeItems: "center",
            marginBottom: 16,
          }}
        >
          <Ic n={icone} s={22} c={p.primary} />
        </div>
      )}
      <h3
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: 19,
          margin: "0 0 8px",
          color: p.ink,
        }}
      >
        {titulo}
      </h3>
      <div style={{ fontSize: 14.5, lineHeight: 1.6, color: p.g700 }}>{children}</div>
    </article>
  );
}

/** Aviso de conteúdo ilustrativo (pré-lançamento) — honestidade com o visitante. */
export function AvisoIlustrativo({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        background: p.lilac1,
        border: `1px solid ${p.lilac2}`,
        borderRadius: 999,
        padding: "7px 14px",
        fontSize: 12.5,
        fontWeight: 600,
        color: p.dark,
      }}
    >
      <Ic n="alert-triangle" s={14} c={p.dark} />
      {children}
    </div>
  );
}
