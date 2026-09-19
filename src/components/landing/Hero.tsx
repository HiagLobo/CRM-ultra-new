"use client";
/**
 * Hero da landing: a promessa do produto + os dois caminhos —
 * "Acessar CRM" (pede acesso ao demo) e "Conhecer CRM" (rola para os recursos).
 * Copy e marca saem de `brand.*`; nada cravado.
 */
import * as React from "react";
import { palette as p } from "@/lib/palette";
import { brand } from "@/config/brand";
import { Ic } from "@/components/Icon";
import { BotaoAcessar, BotaoAncora } from "./botoes";
import PreviaProduto from "./PreviaProduto";

const PILARES = [
  { icone: "sparkles", texto: "Assistente que qualifica o cliente e preenche o CRM por você" },
  { icone: "kanban-square", texto: "Funil que mostra onde cada negócio travou" },
  { icone: "target", texto: "Radar de captação para achar quem vai vender" },
];

export default function Hero({ onAcessar }: { onAcessar: () => void }) {
  return (
    <section style={{ position: "relative", background: p.deep, color: "#fff", overflow: "hidden" }}>
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(900px 420px at 12% 8%, ${p.dark} 0%, rgba(49,46,129,0) 62%),
                       radial-gradient(700px 420px at 88% 92%, ${p.light} 0%, rgba(99,102,241,0) 58%)`,
        }}
      />
      <div
        className="ds-pad ds-2col"
        style={{
          position: "relative",
          zIndex: 2,
          maxWidth: 1240,
          margin: "0 auto",
          padding: "84px 32px 92px",
          display: "grid",
          gridTemplateColumns: "1.15fr .85fr",
          gap: 48,
          alignItems: "center",
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div
            className="lp-entra lp-entra-1"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              border: "1px solid rgba(255,255,255,.28)",
              background: "rgba(255,255,255,.10)",
              borderRadius: 999,
              padding: "7px 15px",
              fontSize: 12.5,
              fontWeight: 600,
              marginBottom: 20,
            }}
          >
            <Ic n="sparkles" s={15} c="#fff" /> Demonstração aberta para corretores com CRECI
          </div>

          <h1
            className="lp-entra lp-entra-1"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: "clamp(34px, 5.4vw, 54px)",
              lineHeight: 1.06,
              letterSpacing: "-.02em",
              margin: 0,
              maxWidth: 620,
            }}
          >
            {brand.tagline}
          </h1>

          <p className="lp-entra lp-entra-2" style={{ fontSize: 18, lineHeight: 1.6, color: "rgba(255,255,255,.85)", maxWidth: 560, marginTop: 20 }}>
            O {brand.nomeCurto} organiza leads, atendimento, carteira de imóveis e comissões num lugar
            só — para o corretor autônomo, para a imobiliária com associados e para a rede de franquias.
          </p>

          <div className="lp-entra lp-entra-3" style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 32 }}>
            <BotaoAcessar onAcessar={onAcessar} grande invertido>
              Acessar CRM
            </BotaoAcessar>
            <BotaoAncora href="#recursos" claro grande>
              Conhecer CRM
            </BotaoAncora>
          </div>

          <ul className="lp-entra lp-entra-4" style={{ listStyle: "none", padding: 0, margin: "34px 0 0", display: "grid", gap: 12 }}>
            {PILARES.map((b) => (
              <li key={b.icone} style={{ display: "flex", alignItems: "center", gap: 11, fontSize: 15, color: "rgba(255,255,255,.9)" }}>
                <span style={{ width: 30, height: 30, borderRadius: 9, background: "rgba(255,255,255,.14)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                  <Ic n={b.icone} s={16} c="#fff" />
                </span>
                {b.texto}
              </li>
            ))}
          </ul>
        </div>

        <PreviaProduto />
      </div>
    </section>
  );
}
