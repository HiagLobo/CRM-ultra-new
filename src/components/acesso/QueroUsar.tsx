"use client";
/**
 * "Quero usar no meu time" (O8·S3): o próximo passo de quem gostou do demo.
 * Abre o WhatsApp comercial da marca em nova aba, com a mensagem já escrita —
 * sem dado da pessoa no texto (ela decide o que mandar).
 *
 * Mora no fluxo de acesso porque é a mesma conversão: o banner e o guia do demo
 * e a tela de acesso liberado usam daqui o texto e o link.
 */
import * as React from "react";
import { palette as p } from "@/lib/palette";
import { brand, linkWhatsapp } from "@/config/brand";
import { Ic } from "@/components/Icon";

export const ROTULO_QUERO_USAR = "Quero usar no meu time";
export const MENSAGEM_QUERO_USAR = `Olá! Explorei o demo do ${brand.nomeCurto} e quero usar no meu time.`;
/** Tela de acesso liberado: a pessoa ainda nem explorou — o convite é para conversar. */
export const MENSAGEM_CONVERSAR = `Olá! Liberei o demo do ${brand.nomeCurto} e quero conversar.`;

export const linkQueroUsar = () => linkWhatsapp(MENSAGEM_QUERO_USAR);

/**
 * Botão preenchido com a cor primária (é um link: abre o WhatsApp em nova aba).
 * `compacto` para a faixa do banner; sem ele, ocupa a largura toda (rodapé do guia).
 * `children` troca o rótulo — o banner encurta o texto no celular.
 */
export function BotaoQueroUsar({
  compacto,
  children = ROTULO_QUERO_USAR,
}: {
  compacto?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <a
      href={linkQueroUsar()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${ROTULO_QUERO_USAR} — abre o WhatsApp em nova aba`}
      className="ds-btnpop"
      style={{
        display: compacto ? "inline-flex" : "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: compacto ? 6 : 8,
        background: p.primary,
        color: "#fff",
        borderRadius: 999,
        padding: compacto ? "6px 13px" : "11px 16px",
        fontSize: compacto ? 13 : 14,
        fontWeight: 700,
        fontFamily: "var(--font-body)",
        textDecoration: "none",
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}
    >
      <Ic n="message-circle" s={compacto ? 14 : 16} c="#fff" />
      {children}
    </a>
  );
}
