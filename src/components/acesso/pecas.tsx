"use client";
/**
 * Peças miúdas do fluxo de acesso, usadas por vários passos: o visual de caixa
 * de texto/seleção, o botão com cara de link e o link do WhatsApp da marca.
 * (Os campos, avisos e o botão de envio ficam em `ui.tsx`.)
 */
import * as React from "react";
import { palette as p } from "@/lib/palette";
import { linkWhatsapp } from "@/config/brand";

/** Visual de caixa de texto/seleção do fluxo (`Campo` e `CampoCreci`). */
export function estiloEntrada(comErro: boolean): React.CSSProperties {
  return {
    width: "100%",
    boxSizing: "border-box",
    fontFamily: "var(--font-body)",
    fontSize: 15,
    padding: "12px 14px",
    border: `1.5px solid ${comErro ? p.error : p.g300}`,
    borderRadius: 10,
    background: "#fff",
    color: p.ink,
    outline: "none",
  };
}

/** Saída na hora quando o fluxo trava: o WhatsApp da marca, com a mensagem já escrita (sem PII). */
export function LinkWhatsapp({ texto }: { texto: string }) {
  return (
    <a
      href={linkWhatsapp(texto)}
      target="_blank"
      rel="noreferrer"
      style={{ color: p.primary, fontWeight: 600, whiteSpace: "nowrap" }}
    >
      Falar no WhatsApp
    </a>
  );
}

/** Botão com cara de link, para as saídas do fluxo ("Já tenho cadastro", "Corrigir meus dados"…). */
export function BotaoTexto({
  children,
  discreto,
  ...rest
}: { children: React.ReactNode; discreto?: boolean } & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "type">) {
  return (
    <button
      type="button"
      {...rest}
      style={{
        border: "none",
        background: "none",
        padding: 0,
        fontFamily: "var(--font-body)",
        fontSize: "inherit",
        textAlign: "left",
        color: discreto || rest.disabled ? p.g500 : p.primary,
        fontWeight: discreto ? 400 : 600,
        cursor: rest.disabled ? "default" : "pointer",
        ...rest.style,
      }}
    >
      {children}
    </button>
  );
}
