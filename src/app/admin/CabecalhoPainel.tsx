"use client";
/**
 * Cabeçalho do painel: logo, título e as ações (novo lead, exportar, sair).
 * No celular só ficam os ícones e some o título — senão "Sair" sai da tela.
 */
import * as React from "react";
import { palette as p } from "@/lib/palette";
import { brand } from "@/config/brand";
import { Ic } from "@/components/Icon";
import { acao } from "./estilos";

export default function CabecalhoPainel({
  exportando,
  aoNovoLead,
  aoExportar,
  aoSair,
}: {
  exportando: boolean;
  aoNovoLead: () => void;
  aoExportar: () => void;
  aoSair: () => void;
}) {
  return (
    <header style={{ background: p.white, borderBottom: `1px solid ${p.g300}` }}>
      <style>{`@media (max-width: 640px) { .adm-titulo, .adm-rotulo { display: none; } .adm-topo { padding: 0 16px !important; gap: 10px !important; } .adm-topo img { height: 36px !important; } .adm-acoes button { padding: 10px 14px !important; } }`}</style>
      <div className="ds-pad adm-topo" style={{ maxWidth: 1240, margin: "0 auto", padding: "0 32px", height: 72, display: "flex", alignItems: "center", gap: 16 }}>
        <img src="/assets/logo.svg" alt={brand.nome} style={{ height: 44 }} />
        <span className="adm-titulo" style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, color: p.ink }}>
          Painel de leads
        </span>
        <div className="adm-acoes" style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
          <button type="button" onClick={aoNovoLead} aria-label="Novo lead" className="ds-btnpop" style={acao(p.primary, true)}>
            <Ic n="user-plus" s={16} c={p.white} /> <span className="adm-rotulo">Novo lead</span>
          </button>
          <button
            type="button"
            onClick={aoExportar}
            aria-label="Exportar CSV"
            disabled={exportando}
            style={{ ...acao(p.primary, false), opacity: exportando ? 0.7 : 1 }}
          >
            <Ic n="download" s={16} c={p.primary} /> <span className="adm-rotulo">{exportando ? "Exportando…" : "Exportar CSV"}</span>
          </button>
          <button type="button" onClick={aoSair} aria-label="Sair" style={acao(p.g500, false)}>
            <Ic n="log-out" s={16} c={p.g700} /> <span className="adm-rotulo">Sair</span>
          </button>
        </div>
      </div>
    </header>
  );
}
