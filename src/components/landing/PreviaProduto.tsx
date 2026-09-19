"use client";
/**
 * A cena da capa: três cartões em camadas, no lugar do funil solto.
 *
 * O funil sozinho não contava nada — mostrava um número saindo de lugar nenhum.
 * A ordem aqui é a do próprio produto: o assistente qualifica → o funil anda →
 * a etapa se move sozinha. É a mesma história dos pilares logo ao lado.
 *
 * Tudo composto com divs: nenhuma imagem, nenhum screenshot de cliente.
 */
import * as React from "react";
import { palette as p } from "@/lib/palette";
import { Ic } from "@/components/Icon";

const ETAPAS: [string, string, number][] = [
  ["Novos leads", "38", 100],
  ["Em atendimento", "21", 62],
  ["Visita agendada", "12", 38],
  ["Proposta", "5", 18],
];

/** Cartão do assistente — o diferencial, então vem na frente. */
function CartaoAssistente() {
  const campo = (rotulo: string, valor: string) => (
    <div key={rotulo}>
      <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", color: p.g500 }}>
        {rotulo}
      </div>
      <div style={{ fontSize: 12.5, fontWeight: 600, color: p.ink, marginTop: 1 }}>{valor}</div>
    </div>
  );

  return (
    <div
      className="lp-flutua"
      style={{
        background: "#fff",
        borderRadius: 16,
        border: `1px solid ${p.lilac2}`,
        boxShadow: "0 18px 44px rgba(20,6,38,.28)",
        overflow: "hidden",
        width: "min(330px, 100%)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "11px 13px", background: `linear-gradient(180deg, ${p.lilac1}, #fff)` }}>
        <span style={{ width: 30, height: 30, borderRadius: 9, background: p.lilac2, display: "grid", placeItems: "center", flexShrink: 0 }}>
          <Ic n="sparkles" s={16} c={p.primary} />
        </span>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: p.ink }}>Assistente Ultra</div>
          <div style={{ fontSize: 10.5, color: p.g500 }}>qualificou e transferiu · agora</div>
        </div>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 9.5, fontWeight: 700, letterSpacing: ".03em", textTransform: "uppercase", color: p.primary, background: p.lilac2, borderRadius: 999, padding: "3px 8px" }}>
          <span className="lp-pulso" style={{ width: 5, height: 5, borderRadius: "50%", background: p.primary }} /> Quente
        </span>
      </div>
      <div style={{ padding: "12px 13px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11 }}>
        {campo("Procura", "Apto 3q · Boa Viagem")}
        {campo("Orçamento", "Até R$ 950 mil")}
        {campo("Finalidade", "Moradia")}
        {campo("Urgência", "Alta · este mês")}
      </div>
    </div>
  );
}

/** Cartão do funil — agora consequência, não protagonista. */
function CartaoFunil() {
  return (
    <div
      className="lp-flutua-b lp-camada-b"
      style={{
        background: "#fff",
        borderRadius: 16,
        boxShadow: "0 22px 54px rgba(20,6,38,.30)",
        padding: 18,
        width: "min(300px, 100%)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <span style={{ width: 28, height: 28, borderRadius: 9, background: p.lilac1, display: "grid", placeItems: "center" }}>
          <Ic n="kanban-square" s={15} c={p.primary} />
        </span>
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13.5, color: p.ink }}>
          Funil do corretor
        </span>
      </div>

      {ETAPAS.map(([nome, valor, largura], i) => (
        <div key={nome} style={{ marginBottom: 11 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, marginBottom: 5 }}>
            <span style={{ color: p.g700, fontWeight: 600 }}>{nome}</span>
            <span style={{ color: p.ink, fontWeight: 700 }}>{valor}</span>
          </div>
          <div style={{ height: 6, borderRadius: 999, background: p.g100, overflow: "hidden" }}>
            <div
              className="lp-barra"
              style={{
                width: `${largura}%`,
                height: "100%",
                borderRadius: 999,
                background: p.primary,
                animationDelay: `${0.5 + i * 0.12}s`,
              }}
            />
          </div>
        </div>
      ))}

      <div style={{ borderTop: `1px solid ${p.g100}`, marginTop: 2, paddingTop: 11, fontSize: 10.5, color: p.g500 }}>
        Números ilustrativos
      </div>
    </div>
  );
}

/** A etiqueta que fecha o argumento: ninguém arrastou o card. */
function EtiquetaAutomatica() {
  return (
    <div
      className="lp-flutua lp-camada-c"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        background: "#fff",
        borderRadius: 999,
        boxShadow: "0 12px 30px rgba(20,6,38,.24)",
        padding: "9px 15px",
        animationDelay: "-1.4s",
      }}
    >
      <span style={{ width: 22, height: 22, borderRadius: "50%", background: `${p.success}1A`, display: "grid", placeItems: "center" }}>
        <Ic n="check" s={13} c={p.success} />
      </span>
      <span style={{ fontSize: 12, color: p.ink }}>
        <strong style={{ fontWeight: 700 }}>Visita agendada</strong> — etapa movida sozinha
      </span>
    </div>
  );
}

export default function PreviaProduto() {
  return (
    <div
      aria-hidden="true"
      style={{ display: "grid", justifyItems: "end", gap: 14 }}
    >
      <div className="lp-entra lp-entra-2" style={{ display: "flex", justifyContent: "flex-end", width: "100%" }}>
        <CartaoAssistente />
      </div>
      <div className="lp-entra lp-entra-3" style={{ display: "flex", justifyContent: "flex-end", width: "100%" }}>
        <CartaoFunil />
      </div>
      <div className="lp-entra lp-entra-4" style={{ display: "flex", justifyContent: "flex-end", width: "100%" }}>
        <EtiquetaAutomatica />
      </div>
    </div>
  );
}
