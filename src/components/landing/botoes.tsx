"use client";
/** Botões da landing: o CTA de acesso ao demo e o link-âncora das seções. */
import * as React from "react";
import { palette as p } from "@/lib/palette";
import { Ic } from "@/components/Icon";

/** CTA principal — dispara o fluxo de acesso ao demo (ligado na O2·S2). */
export function BotaoAcessar({
  onAcessar,
  children = "Acessar CRM",
  grande,
  invertido,
}: {
  onAcessar: () => void;
  children?: React.ReactNode;
  grande?: boolean;
  invertido?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onAcessar}
      className="ds-btnpop"
      style={{
        border: "none",
        cursor: "pointer",
        borderRadius: 999,
        padding: grande ? "15px 30px" : "11px 22px",
        fontFamily: "var(--font-body)",
        fontWeight: 700,
        fontSize: grande ? 16 : 14,
        display: "inline-flex",
        alignItems: "center",
        gap: 9,
        background: invertido ? "#fff" : p.primary,
        color: invertido ? p.primary : "#fff",
        boxShadow: invertido ? "0 10px 30px rgba(20,6,38,.22)" : "0 10px 26px rgba(79,70,229,.28)",
      }}
    >
      {children} <Ic n="arrow-right" s={grande ? 19 : 16} c="currentColor" />
    </button>
  );
}

/** CTA secundário — âncora para as seções ("Conhecer CRM"). */
export function BotaoAncora({
  href,
  children,
  claro,
  grande,
}: {
  href: string;
  children: React.ReactNode;
  claro?: boolean;
  grande?: boolean;
}) {
  return (
    <a
      href={href}
      className="ds-btnpop"
      style={{
        textDecoration: "none",
        borderRadius: 999,
        padding: grande ? "15px 30px" : "11px 22px",
        fontFamily: "var(--font-body)",
        fontWeight: 700,
        fontSize: grande ? 16 : 14,
        display: "inline-flex",
        alignItems: "center",
        gap: 9,
        border: `1.5px solid ${claro ? "rgba(255,255,255,.45)" : p.g300}`,
        background: claro ? "rgba(255,255,255,.08)" : "#fff",
        color: claro ? "#fff" : p.ink,
      }}
    >
      {children}
    </a>
  );
}
