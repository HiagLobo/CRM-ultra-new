"use client";
/** Os 4 cards do topo (Para hoje · Em andamento · Clientes · Conversão); os que são uma aba abrem a aba. */
import * as React from "react";
import { palette as p } from "@/lib/palette";
import type { LeadAdmin } from "@/features/lead/admin";
import { cardsDoTopo } from "./cardsDoTopo";
import type { Aba } from "./filtroLeads";

export default function CardsTopo({
  leads,
  carregado,
  agora,
  aoAbrirAba,
}: {
  leads: ReadonlyArray<LeadAdmin>;
  carregado: boolean;
  agora: Date;
  aoAbrirAba: (aba: Aba) => void;
}) {
  const cards = React.useMemo(() => cardsDoTopo(leads, agora), [leads, agora]);
  return (
    <div className="ds-cards adm-cards" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
      {/* celular: 2 por linha e mais baixos — a lista é o que importa */}
      <style>{`@media (max-width: 640px) { .ds-cards.adm-cards { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; gap: 10px !important; margin-bottom: 18px !important; } .adm-cards > * { padding: 12px 14px !important; } .adm-cards .adm-valor { font-size: 24px !important; } }`}</style>
      {cards.map((c) => {
        const conteudo = (
          <>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: p.g500, marginBottom: 6 }}>{c.rotulo}</div>
            <div className="adm-valor" style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 30, color: c.chave === "hoje" && c.valor !== "0" ? p.error : p.ink }}>
              {carregado ? c.valor : "—"}
            </div>
            <div style={{ fontSize: 12.5, color: p.g500, marginTop: 4 }}>{carregado ? c.detalhe : " "}</div>
          </>
        );
        const caixa: React.CSSProperties = { background: p.white, border: `1px solid ${p.g300}`, borderRadius: 14, padding: "16px 20px", textAlign: "left", fontFamily: "var(--font-body)" };
        const aba = c.aba;
        return aba ? (
          <button key={c.chave} type="button" onClick={() => aoAbrirAba(aba)} title="Abrir a aba" style={{ ...caixa, cursor: "pointer" }}>
            {conteudo}
          </button>
        ) : (
          <div key={c.chave} style={caixa}>
            {conteudo}
          </div>
        );
      })}
    </div>
  );
}
