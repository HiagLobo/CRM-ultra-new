"use client";
/**
 * Seção "Para quem": os três perfis que a demonstração abre — e que viram as
 * três entradas do gate na O2·S3 (Corretor, CEO com associados, CEO com franquias).
 */
import * as React from "react";
import { palette as p } from "@/lib/palette";
import { Ic } from "@/components/Icon";
import { Secao, Eyebrow, Titulo, Sub } from "./ui";

const PUBLICOS: { icone: string; titulo: string; texto: string; itens: string[] }[] = [
  {
    icone: "user-round",
    titulo: "Corretor",
    texto: "Você toca os próprios clientes e precisa de ordem, não de burocracia.",
    itens: ["Funil e agenda do dia", "Atendimento com histórico", "Radar de captação", "Suas comissões"],
  },
  {
    icone: "building-2",
    titulo: "Imobiliária com associados",
    texto: "Você responde pela operação: time, carteira, caixa e risco.",
    itens: ["Corretores associados", "Curadoria de imóveis", "Financeiro e cobranças", "Jurídico e fechamentos"],
  },
  {
    icone: "globe",
    titulo: "Rede de franquias",
    texto: "Você compara unidades e decide onde investir atenção.",
    itens: ["Visão por unidade", "Assentos e acessos", "Indicação de corretores", "Relatórios da rede"],
  },
];

export default function Publico() {
  return (
    <Secao id="publico">
      <div style={{ maxWidth: 720, marginBottom: 40 }}>
        <Eyebrow>Para quem é</Eyebrow>
        <Titulo>Três painéis, três formas de trabalhar</Titulo>
        <Sub>
          Ao liberar seu acesso você escolhe por qual deles quer começar, e pode voltar e testar os
          outros dois quando quiser.
        </Sub>
      </div>

      <div className="ds-cards" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 22 }}>
        {PUBLICOS.map((pub) => (
          <article
            key={pub.titulo}
            style={{
              background: "#fff",
              borderRadius: 16,
              border: `1px solid ${p.g300}`,
              boxShadow: "0 8px 24px rgba(28,26,34,.06)",
              padding: 26,
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
              <span style={{ width: 44, height: 44, borderRadius: 13, background: p.lilac1, display: "grid", placeItems: "center" }}>
                <Ic n={pub.icone} s={21} c={p.primary} />
              </span>
              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 19, margin: 0, color: p.ink }}>
                {pub.titulo}
              </h3>
            </div>
            <p style={{ fontSize: 14.5, lineHeight: 1.6, color: p.g700, margin: 0 }}>{pub.texto}</p>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 9 }}>
              {pub.itens.map((i) => (
                <li key={i} style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 14, color: p.ink }}>
                  <Ic n="check-circle-2" s={16} c={p.success} /> {i}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </Secao>
  );
}
