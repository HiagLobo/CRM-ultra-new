"use client";
import * as React from "react";
import { palette as buscarPalette } from "@/lib/palette";
import { BIc } from "@/components/Icon";
import type { Imovel } from "@/types";

/* ============ FILTER BAR (simple -> expandable) ============ */
export function FilterBar({
  onSearch,
}: {
  onSearch: (q: string) => void;
  view?: string;
  setView?: (v: string) => void;
  count?: number;
}) {
  const [expanded, setExpanded] = React.useState(false);
  const ctrl: React.CSSProperties = { fontFamily: "var(--font-body)", fontSize: 14, padding: "11px 13px", border: `1.5px solid ${buscarPalette.g300}`, borderRadius: 10, background: "#fff", color: buscarPalette.ink, outline: "none" };
  const label: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: buscarPalette.g700, marginBottom: 6, display: "block" };
  const onFocus = (e: React.FocusEvent<HTMLInputElement>) => { e.target.style.borderColor = buscarPalette.primary; e.target.style.boxShadow = "0 0 0 3px rgba(79,70,229,.14)"; };
  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => { e.target.style.borderColor = buscarPalette.g300; e.target.style.boxShadow = "none"; };

  return (
    <div style={{ background: "#fff", border: `1px solid ${buscarPalette.g300}`, borderRadius: 16, padding: 16, boxShadow: "var(--shadow-sm)" }}>
      {/* simple row */}
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <div data-tour="busca-campo" style={{ flex: 1, minWidth: 240, display: "flex", alignItems: "center", gap: 10, background: buscarPalette.page, border: `1.5px solid ${buscarPalette.g300}`, borderRadius: 999, padding: "10px 18px" }}>
          <BIc n="search" s={20} c={buscarPalette.g500} />
          <input placeholder="Cidade, bairro ou código do imóvel" onChange={(e) => onSearch(e.target.value)}
            style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontFamily: "var(--font-body)", fontSize: 15, color: buscarPalette.ink }} />
        </div>
        <select style={{ ...ctrl, borderRadius: 999, padding: "11px 18px" }} defaultValue="Comprar">
          <option>Comprar</option><option>Alugar</option>
        </select>
        <select style={{ ...ctrl, borderRadius: 999, padding: "11px 18px" }} defaultValue="">
          <option value="" disabled>Tipo</option><option>Apartamento</option><option>Casa</option><option>Studio</option><option>Cobertura</option>
        </select>
        <button onClick={() => setExpanded((v) => !v)} data-tour="busca-filtros" style={{ display: "flex", alignItems: "center", gap: 8, border: `1.5px solid ${expanded ? buscarPalette.primary : buscarPalette.g300}`, background: expanded ? buscarPalette.lilac2 : "#fff", color: expanded ? buscarPalette.primary : buscarPalette.ink, borderRadius: 999, padding: "11px 18px", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 14 }}>
          <BIc n="sliders-horizontal" s={16} c={expanded ? buscarPalette.primary : buscarPalette.g700} /> Filtros avançados
          <BIc n={expanded ? "chevron-up" : "chevron-down"} s={15} c={expanded ? buscarPalette.primary : buscarPalette.g500} />
        </button>
        <button style={{ border: "none", background: buscarPalette.primary, color: "#fff", borderRadius: 999, padding: "12px 26px", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 15, display: "flex", alignItems: "center", gap: 8 }}>
          <BIc n="search" s={17} c="#fff" /> Buscar
        </button>
      </div>

      {/* expanded grid */}
      {expanded && (
        <div className="ds-cards" style={{ marginTop: 16, paddingTop: 18, borderTop: `1px solid ${buscarPalette.g100}`, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          <div><label style={label}>UF</label><select style={{ ...ctrl, width: "100%" }} defaultValue="SP"><option>SP</option><option>RJ</option><option>MG</option><option>PR</option></select></div>
          <div><label style={label}>Cidade</label><select style={{ ...ctrl, width: "100%" }} defaultValue=""><option value="" disabled>Cidade</option><option>São Paulo</option><option>Campinas</option><option>Santos</option></select></div>
          <div><label style={label}>Dormitório(s)</label><select style={{ ...ctrl, width: "100%" }} defaultValue=""><option value="" disabled>Qualquer</option><option>1+</option><option>2+</option><option>3+</option><option>4+</option></select></div>
          <div><label style={label}>Suíte(s)</label><select style={{ ...ctrl, width: "100%" }} defaultValue=""><option value="" disabled>Qualquer</option><option>1+</option><option>2+</option><option>3+</option></select></div>
          <div><label style={label}>Banheiro(s)</label><select style={{ ...ctrl, width: "100%" }} defaultValue=""><option value="" disabled>Qualquer</option><option>1+</option><option>2+</option><option>3+</option></select></div>
          <div><label style={label}>Vaga(s)</label><select style={{ ...ctrl, width: "100%" }} defaultValue=""><option value="" disabled>Qualquer</option><option>1+</option><option>2+</option><option>3+</option></select></div>
          <div><label style={label}>Área mín (m²)</label><input style={{ ...ctrl, width: "100%" }} placeholder="0" onFocus={onFocus} onBlur={onBlur} /></div>
          <div><label style={label}>Área máx (m²)</label><input style={{ ...ctrl, width: "100%" }} placeholder="500" onFocus={onFocus} onBlur={onBlur} /></div>
          <div><label style={label}>Preço mín</label><input style={{ ...ctrl, width: "100%" }} placeholder="R$ 0" onFocus={onFocus} onBlur={onBlur} /></div>
          <div><label style={label}>Preço máx</label><input style={{ ...ctrl, width: "100%" }} placeholder="R$ 2.000.000" onFocus={onFocus} onBlur={onBlur} /></div>
          <div><label style={label}>Aceita financiamento</label><select style={{ ...ctrl, width: "100%" }} defaultValue=""><option value="" disabled>Indiferente</option><option>Sim</option><option>Não</option></select></div>
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <button style={{ width: "100%", border: `1.5px solid ${buscarPalette.g300}`, background: "#fff", color: buscarPalette.g700, borderRadius: 10, padding: "11px", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 14 }}>Limpar filtros</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============ RESULTS TOOLBAR (count + view toggle + sort) ============ */
export function ResultsToolbar({ count, view, setView }: { count: number; view: string; setView: (v: string) => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "24px 0 18px", flexWrap: "wrap", gap: 12 }}>
      <div style={{ fontSize: 15, color: buscarPalette.g700 }}>
        <strong style={{ color: buscarPalette.ink, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18 }}>{count} imóveis</strong> encontrados
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <select style={{ fontFamily: "var(--font-body)", fontSize: 14, padding: "9px 14px", border: `1.5px solid ${buscarPalette.g300}`, borderRadius: 10, background: "#fff", color: buscarPalette.ink, outline: "none" }} defaultValue="Relevância">
          <option>Relevância</option><option>Menor preço</option><option>Maior preço</option><option>Mais recentes</option>
        </select>
        <div style={{ display: "flex", background: buscarPalette.g100, borderRadius: 10, padding: 3, gap: 3 }}>
          {([["grid", "layout-grid"], ["list", "list"]] as [string, string][]).map(([v, ic]) => (
            <button key={v} onClick={() => setView(v)} title={v === "grid" ? "Quadrados" : "Lista"} style={{
              width: 38, height: 36, border: "none", borderRadius: 8, cursor: "pointer",
              background: view === v ? "#fff" : "transparent", boxShadow: view === v ? "var(--shadow-sm)" : "none",
              display: "grid", placeItems: "center",
            }}>
              <BIc n={ic} s={18} c={view === v ? buscarPalette.primary : buscarPalette.g500} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export interface PropertyRowProps {
  p: Imovel;
  favorited?: boolean;
  onToggleFav?: (p: Imovel) => void;
  compared?: boolean;
  onToggleCompare?: (p: Imovel) => void;
}

/* ============ PROPERTY LIST ROW (horizontal) ============ */
export function PropertyRow({ p, favorited, onToggleFav, compared, onToggleCompare }: PropertyRowProps) {
  const bg = (p.photos && p.photos[0]) || "linear-gradient(135deg,#E0E7FF,#A5B4FC)";
  return (
    <div className="ds-pcard ds-prow" style={{ display: "flex", background: "#fff", borderRadius: 16, boxShadow: "var(--shadow-md)", overflow: "hidden", fontFamily: "var(--font-body)" }}>
      <div className="ds-prow-media" style={{ position: "relative", width: 280, flexShrink: 0, background: bg, minHeight: 200 }}>
        <span style={{ position: "absolute", top: 12, left: 12, background: buscarPalette.primary, color: "#fff", fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 999 }}>Cód: {p.code}</span>
        {p.tag && <span style={{ position: "absolute", bottom: 12, left: 12, background: p.tag === "Destaque" ? buscarPalette.primary : "#fff", color: p.tag === "Destaque" ? "#fff" : buscarPalette.ink, fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 999 }}>{p.tag}</span>}
      </div>
      <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 24, color: buscarPalette.ink }}>{p.price}</div>
            <div style={{ fontWeight: 600, fontSize: 16, color: buscarPalette.ink, marginTop: 6 }}>{p.title}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, color: buscarPalette.g500, fontSize: 14, marginTop: 6 }}>
              <BIc n="map-pin" s={15} /> {p.location}
            </div>
          </div>
          {onToggleFav ? (
            <button
              onClick={() => onToggleFav(p)}
              aria-label={favorited ? "Remover dos favoritos" : "Favoritar"}
              title={favorited ? "Remover dos favoritos" : "Favoritar"}
              style={{ width: 38, height: 38, border: `1px solid ${favorited ? buscarPalette.lilac2 : buscarPalette.g300}`, background: favorited ? buscarPalette.lilac2 : "#fff", borderRadius: "50%", display: "grid", placeItems: "center", cursor: "pointer" }}
            >
              <BIc n="heart" s={18} c={buscarPalette.primary} style={{ fill: favorited ? buscarPalette.primary : "transparent" }} />
            </button>
          ) : (
            <button style={{ width: 38, height: 38, border: `1px solid ${buscarPalette.g300}`, background: "#fff", borderRadius: "50%", display: "grid", placeItems: "center", cursor: "pointer" }}>
              <BIc n="heart" s={18} c={buscarPalette.primary} />
            </button>
          )}
        </div>
        <div style={{ display: "flex", gap: 22, color: buscarPalette.g700, fontSize: 14, marginTop: "auto", paddingTop: 18, flexWrap: "wrap" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}><BIc n="bed-double" s={17} /> {p.beds} dorm.</span>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}><BIc n="bath" s={17} /> {p.baths} banh.</span>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}><BIc n="ruler" s={17} /> {p.area} m²</span>
          {onToggleCompare ? (
            <span
              onClick={() => onToggleCompare(p)}
              title={compared ? "Tirar da comparação" : "Selecionar para comparar"}
              style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, color: buscarPalette.primary, fontWeight: 600, cursor: "pointer" }}
            >
              <BIc n={compared ? "check-circle-2" : "git-compare"} s={17} /> {compared ? "Selecionado" : "Comparar"}
            </span>
          ) : (
            <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, color: buscarPalette.primary, fontWeight: 600, cursor: "pointer" }}><BIc n="git-compare" s={17} /> Comparar</span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============ FINANCING CARD ============ */
export function FinancingCard() {
  return (
    <div style={{ background: "#fff", borderRadius: 16, overflow: "hidden", border: `1px solid ${buscarPalette.g300}`, boxShadow: "var(--shadow-md)", fontFamily: "var(--font-body)", display: "flex", flexDirection: "column" }}>
      <div style={{ height: 8, background: buscarPalette.primary, borderRadius: "16px 16px 0 0" }} />
      <div style={{ background: buscarPalette.page, padding: "24px", display: "grid", placeItems: "center", borderBottom: `1px solid ${buscarPalette.g100}` }}>
        <div aria-hidden="true" style={{ width: 132, height: 132, borderRadius: "50%", background: buscarPalette.lilac2, display: "grid", placeItems: "center" }}>
          <BIc n="hand-coins" s={64} c={buscarPalette.primary} sw={1.5} />
        </div>
      </div>
      <div style={{ padding: "18px 20px 20px", display: "flex", flexDirection: "column", flex: 1 }}>
        <div style={{ fontSize: 13, color: buscarPalette.g500, fontWeight: 600 }}>Financiamento</div>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: buscarPalette.ink, marginTop: 4, lineHeight: 1.3 }}>SIMULE AS MELHORES TAXAS EM UM SÓ LUGAR</div>
        <div style={{ fontSize: 14, color: buscarPalette.g700, lineHeight: 1.5, marginTop: 10 }}>Simule seu financiamento em minutos com todos os bancos e consiga a melhor proposta.</div>
        <button style={{ marginTop: 16, border: "none", background: buscarPalette.primary, color: "#fff", borderRadius: 10, padding: "13px", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 14, letterSpacing: ".04em" }}>SIMULAR</button>
      </div>
    </div>
  );
}
