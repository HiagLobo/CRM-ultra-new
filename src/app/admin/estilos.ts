/** Estilos compartilhados do painel: botões, campos de formulário, chips e rótulos. Só cores da palette. */
import type * as React from "react";
import { palette as p } from "@/lib/palette";

export function acao(cor: string, cheio: boolean): React.CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    border: cheio ? "none" : `1.5px solid ${p.g300}`,
    background: cheio ? cor : p.white,
    color: cheio ? p.white : p.g700,
    borderRadius: 999,
    padding: "10px 18px",
    fontSize: 14,
    fontWeight: 600,
    fontFamily: "var(--font-body)",
    textDecoration: "none",
    cursor: "pointer",
  };
}

/** Botão pequeno de contorno (ações da gaveta e da linha). */
export function botaoContorno(cor: string, desabilitado = false): React.CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    border: `1.5px solid ${desabilitado ? p.g300 : cor}`,
    background: p.white,
    color: desabilitado ? p.g500 : cor,
    borderRadius: 999,
    padding: "7px 13px",
    fontSize: 13,
    fontWeight: 600,
    fontFamily: "var(--font-body)",
    textDecoration: "none",
    cursor: desabilitado ? "default" : "pointer",
    opacity: desabilitado ? 0.7 : 1,
  };
}

/** Input, select e textarea dos formulários. */
export function campo(comErro: boolean): React.CSSProperties {
  return {
    width: "100%",
    boxSizing: "border-box",
    fontFamily: "var(--font-body)",
    fontSize: 15,
    padding: "10px 12px",
    border: `1.5px solid ${comErro ? p.error : p.g300}`,
    borderRadius: 10,
    background: p.white,
    color: p.ink,
  };
}

export const rotuloCampo: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  color: p.g700,
  marginBottom: 6,
};

export const mensagemErroCampo: React.CSSProperties = { fontSize: 12.5, color: p.error, marginTop: 5 };

/**
 * Selo de situação (avaliação, orçamento): contorno e fundo na cor da situação,
 * com o texto em `ink` — cor clara escrita em branco não se lê.
 */
export function selo(cor: string): React.CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    border: `1px solid ${cor}66`,
    background: `${cor}14`,
    color: p.ink,
    borderRadius: 999,
    padding: "2px 10px",
    fontSize: 12.5,
    fontWeight: 600,
  };
}

/** Chip de escolha rápida (atalhos de data, motivos). */
export function chip(ativo: boolean): React.CSSProperties {
  return {
    border: `1.5px solid ${ativo ? p.primary : p.g300}`,
    background: ativo ? p.lilac1 : p.white,
    color: ativo ? p.dark : p.g700,
    borderRadius: 999,
    padding: "6px 12px",
    fontSize: 13,
    fontWeight: 600,
    fontFamily: "var(--font-body)",
    cursor: "pointer",
  };
}

/** Título de seção da gaveta. */
export const tituloSecao: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: ".05em",
  textTransform: "uppercase",
  color: p.g500,
  margin: "0 0 10px",
};

/** Aviso de erro dentro de formulário ou da gaveta. */
export const caixaErro: React.CSSProperties = {
  background: `${p.error}14`,
  border: `1px solid ${p.error}55`,
  color: p.ink,
  borderRadius: 10,
  padding: "9px 12px",
  fontSize: 13.5,
  lineHeight: 1.5,
};
