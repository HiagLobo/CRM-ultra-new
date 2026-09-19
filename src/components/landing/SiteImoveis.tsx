"use client";
/**
 * Seção do **site de divulgação** — o que a imobiliária recebe junto do CRM.
 *
 * É a única parte do produto que o visitante pode ver inteira sem pedir acesso:
 * o site é público por natureza, então o CTA leva direto para o exemplo. Serve
 * ao funil (prova antes do cadastro) e é honesto (não esconde o que já é aberto).
 */
import * as React from "react";
import Link from "next/link";
import { palette as p } from "@/lib/palette";
import { brand } from "@/config/brand";
import { Ic } from "@/components/Icon";
import { Secao, Eyebrow, Titulo, Sub } from "./ui";

const INCLUI = [
  { icone: "search", texto: "Busca por cidade, bairro, tipo e faixa de preço" },
  { icone: "image", texto: "Página de cada imóvel com fotos, mapa e ficha completa" },
  { icone: "heart", texto: "Favoritos e comparação lado a lado para o visitante" },
  { icone: "send", texto: "Formulário de contato que cai direto no funil do corretor" },
];

/** Miniatura do site — composta com divs, não é screenshot de cliente. */
function PreviaSite() {
  const card = (titulo: string, preco: string, local: string, i: number) => (
    <div
      key={titulo}
      style={{
        background: "#fff",
        borderRadius: 12,
        border: `1px solid ${p.g300}`,
        overflow: "hidden",
        boxShadow: "0 6px 18px rgba(28,26,34,.06)",
      }}
    >
      <div
        style={{
          height: 62,
          background: `linear-gradient(135deg, ${i % 2 ? p.lilac2 : p.light} 0%, ${p.primary} 100%)`,
          opacity: 0.85,
        }}
      />
      <div style={{ padding: "9px 11px 11px" }}>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13.5, color: p.ink }}>
          {preco}
        </div>
        <div style={{ fontSize: 11.5, color: p.g700, marginTop: 2 }}>{titulo}</div>
        <div style={{ fontSize: 11, color: p.g500, marginTop: 1 }}>{local}</div>
      </div>
    </div>
  );

  return (
    <div
      aria-hidden="true"
      style={{
        background: p.page,
        border: `1px solid ${p.g300}`,
        borderRadius: 16,
        padding: 16,
        boxShadow: "0 18px 44px rgba(28,26,34,.10)",
      }}
    >
      {/* barra do navegador */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <span style={{ display: "flex", gap: 4 }}>
          {[p.error, p.warning, p.success].map((c) => (
            <span key={c} style={{ width: 8, height: 8, borderRadius: "50%", background: c, opacity: 0.6 }} />
          ))}
        </span>
        <span
          style={{
            flex: 1,
            background: "#fff",
            border: `1px solid ${p.g300}`,
            borderRadius: 999,
            padding: "4px 12px",
            fontSize: 11,
            color: p.g500,
          }}
        >
          www.suaimobiliaria.com.br
        </span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
        {card("Apartamento 3 dorm.", "R$ 745.000", "Pinheiros, SP", 0)}
        {card("Casa com quintal", "R$ 1.180.000", "Santa Felicidade, PR", 1)}
        {card("Studio mobiliado", "R$ 2.900/mês", "Boa Viagem, PE", 2)}
      </div>
    </div>
  );
}

export default function SiteImoveis() {
  return (
    <Secao id="site" fundo={p.page}>
      <div className="ds-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1.05fr", gap: 48, alignItems: "center" }}>
        <div>
          <Eyebrow>Vem junto</Eyebrow>
          <Titulo>Sua imobiliária também ganha um site de imóveis</Titulo>
          <Sub>
            Não é só o sistema interno. Ao assinar o {brand.nomeCurto}, sua carteira vira um site
            público (com a sua marca) onde o cliente busca, favorita e pede contato. Cadastrou o
            imóvel no CRM, ele aparece lá.
          </Sub>

          <ul style={{ listStyle: "none", padding: 0, margin: "24px 0 0", display: "grid", gap: 12 }}>
            {INCLUI.map((i) => (
              <li key={i.texto} style={{ display: "flex", alignItems: "center", gap: 11, fontSize: 15, color: p.g700 }}>
                <span style={{ width: 30, height: 30, borderRadius: 9, background: p.lilac1, display: "grid", placeItems: "center", flexShrink: 0 }}>
                  <Ic n={i.icone} s={16} c={p.primary} />
                </span>
                {i.texto}
              </li>
            ))}
          </ul>

          <Link
            href="/demo/portal"
            className="ds-btnpop"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 9,
              marginTop: 30,
              background: "#fff",
              color: p.primary,
              border: `1.5px solid ${p.primary}`,
              borderRadius: 999,
              padding: "13px 26px",
              fontWeight: 700,
              fontSize: 15,
              textDecoration: "none",
            }}
          >
            Ver o site de exemplo <Ic n="arrow-up-right" s={18} c={p.primary} />
          </Link>
          <div style={{ fontSize: 12.5, color: p.g500, marginTop: 10 }}>
            Aberto, sem cadastro: o site é público por natureza.
          </div>
        </div>

        <PreviaSite />
      </div>
    </Secao>
  );
}
