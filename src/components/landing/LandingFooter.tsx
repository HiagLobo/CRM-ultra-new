"use client";
/**
 * Rodapé da landing. Não reusa o `SiteFooter` do portal de propósito: aquele
 * vende imóveis (buscar/anunciar/CRECI da imobiliária) e tem contato cravado —
 * este vende o software e tira tudo de `brand.*`.
 */
import * as React from "react";
import Link from "next/link";
import { palette as p } from "@/lib/palette";
import { brand, feitoPor } from "@/config/brand";
import { Ic } from "@/components/Icon";
import { ANCORAS } from "./LandingNav";

export default function LandingFooter() {
  const linkStyle: React.CSSProperties = {
    fontSize: 14,
    color: "rgba(255,255,255,.85)",
    textDecoration: "none",
  };
  const anoAtual = new Date().getFullYear();

  return (
    <footer style={{ background: p.ink, color: "#fff" }}>
      <div
        className="ds-pad ds-2col"
        style={{
          maxWidth: 1240,
          margin: "0 auto",
          padding: "52px 32px 28px",
          display: "grid",
          gridTemplateColumns: "1.6fr 1fr 1fr",
          gap: 40,
        }}
      >
        <div>
          <img src="/assets/logo-white.svg" alt={brand.nome} style={{ height: 40, marginBottom: 14 }} />
          <p style={{ fontSize: 14.5, lineHeight: 1.6, color: "rgba(255,255,255,.75)", margin: 0, maxWidth: 340 }}>
            {brand.tagline} Software de gestão para corretores, imobiliárias e redes de franquias.
          </p>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,.62)", marginTop: 16, lineHeight: 1.6 }}>
            {feitoPor()}
            <br />
            CNPJ {brand.empresa.cnpj}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: "rgba(255,255,255,.55)", marginBottom: 14 }}>
            Produto
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {ANCORAS.map((a) => (
              <a key={a.href} href={a.href} style={linkStyle}>
                {a.label}
              </a>
            ))}
            <Link href="/login" style={linkStyle}>
              Já tenho acesso
            </Link>
            <Link href="/privacidade" style={linkStyle}>
              Política de privacidade
            </Link>
          </div>
        </div>

        <div>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: "rgba(255,255,255,.55)", marginBottom: 14 }}>
            Contato
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <a href={`mailto:${brand.contato.email}`} style={{ ...linkStyle, display: "flex", alignItems: "center", gap: 9 }}>
              <Ic n="mail" s={16} c="rgba(255,255,255,.6)" /> {brand.contato.email}
            </a>
            <span style={{ ...linkStyle, display: "flex", alignItems: "center", gap: 9 }}>
              <Ic n="message-circle" s={16} c="rgba(255,255,255,.6)" /> {brand.contato.whatsapp}
            </span>
            <span style={{ ...linkStyle, display: "flex", alignItems: "center", gap: 9 }}>
              <Ic n="globe" s={16} c="rgba(255,255,255,.6)" /> {brand.dominio}
            </span>
          </div>
        </div>
      </div>

      <div
        className="ds-pad"
        style={{
          maxWidth: 1240,
          margin: "0 auto",
          padding: "18px 32px 32px",
          borderTop: "1px solid rgba(255,255,255,.12)",
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          justifyContent: "space-between",
          fontSize: 13,
          color: "rgba(255,255,255,.6)",
        }}
      >
        <span>
          © {anoAtual} {brand.empresa.razaoSocial}
        </span>
        <span>Tratamos seus dados conforme a LGPD e usamos o contato só para falar sobre o produto.</span>
      </div>
    </footer>
  );
}
