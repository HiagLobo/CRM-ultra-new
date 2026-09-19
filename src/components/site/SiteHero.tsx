"use client";
import * as React from "react";
import { palette as sitePalette } from "@/lib/palette";
import { CAPA_PORTAL } from "@/mock-data/fotos";
import { demo } from "@/config/demo";
import { Ic } from "@/components/Icon";

/* ---------------- ADVANCED FILTERS PANEL ----------------
   Toggled (DOM display) by the "Filtros" tab. Cosmetic fields. */
function FiltersPanel({
  innerRef,
  onSearch,
}: {
  innerRef: React.RefObject<HTMLDivElement>;
  onSearch?: (q: string) => void;
}) {
  const lblStyle: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: sitePalette.g700, marginBottom: 6, display: "block" };
  const ctrl: React.CSSProperties = {
    width: "100%", fontFamily: "var(--font-body)", fontSize: 14, padding: "10px 12px",
    border: `1.5px solid ${sitePalette.g300}`, borderRadius: 10, background: "#fff", color: sitePalette.ink, outline: "none",
  };
  const Field = ({ label, ph, opts }: { label: string; ph: string; opts?: string[] }) => (
    <div>
      <label style={lblStyle}>{label}</label>
      <select style={ctrl} defaultValue=""><option value="" disabled>{ph}</option>{(opts || []).map((o) => <option key={o}>{o}</option>)}</select>
    </div>
  );
  const Range = ({ label }: { label: string }) => (
    <div>
      <label style={lblStyle}>{label}</label>
      <div style={{ display: "flex", gap: 8 }}>
        <input style={ctrl} placeholder="Área mín" />
        <input style={ctrl} placeholder="Área máx" />
      </div>
    </div>
  );
  const counts = ["1+", "2+", "3+", "4+", "5+"];
  return (
    <div ref={innerRef} className="ds-cards" style={{
      display: "none", marginTop: 16, width: "min(760px, 88vw)", background: "#fff",
      borderRadius: 16, boxShadow: "0 24px 60px rgba(20,6,38,.4)", padding: 24, color: sitePalette.ink,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18, gridColumn: "1 / -1" }}>
        <Ic n="sliders-horizontal" s={20} c={sitePalette.primary} />
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20 }}>Filtros avançados</span>
      </div>
      <Field label="UF" ph="UF" opts={["SP", "RJ", "MG", "PR", "SC", "RS"]} />
      <Field label="Cidade" ph="Cidade" opts={["São Paulo", "Campinas", "Santos", "Cotia"]} />
      <Field label="Tipo de imóvel" ph="Tipos de imóvel" opts={["Apartamento", "Casa", "Studio", "Cobertura", "Terreno"]} />
      <Field label="Dormitório(s)" ph="Dormitório(s)" opts={counts} />
      <Field label="Suíte(s)" ph="Suíte(s)" opts={counts} />
      <Field label="Banheiro(s)" ph="Banheiro(s)" opts={counts} />
      <Range label="Área privativa (m²)" />
      <Range label="Área total (m²)" />
      <Field label="Aceita financiamento" ph="Aceita financiamento" opts={["Sim", "Não", "Indiferente"]} />
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 4, gridColumn: "1 / -1" }}>
        <button onClick={() => onSearch && onSearch("")} style={{
          border: "none", background: sitePalette.primary, color: "#fff", borderRadius: 10,
          padding: "13px 32px", fontWeight: 700, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
        }}><Ic n="search" s={17} c="#fff" /> Buscar</button>
      </div>
    </div>
  );
}

/* ---------------- HERO + SEARCH ---------------- */
export default function SiteHero({ onSearch }: { onSearch?: (q: string) => void }) {
  const tabs = ["Comprar", "Alugar", "Filtros"];
  const [q, setQ] = React.useState("");
  const filtersRef = React.useRef<HTMLDivElement>(null);
  const tabsRef = React.useRef<HTMLDivElement>(null);
  const selectTab = (_e: React.MouseEvent, name: string) => {
    if (tabsRef.current) {
      Array.from(tabsRef.current.children).forEach((btn) => {
        const el = btn as HTMLElement;
        const on = el.dataset.tab === name && name !== "Filtros";
        el.style.background = on ? "#fff" : "rgba(255,255,255,.12)";
        el.style.color = on ? sitePalette.primary : "#fff";
      });
    }
    if (name === "Filtros") {
      const p = filtersRef.current;
      if (p) p.style.display = p.style.display === "grid" ? "none" : "grid";
    } else if (filtersRef.current) {
      filtersRef.current.style.display = "none";
    }
  };
  return (
    <section style={{ position: "relative", backgroundColor: sitePalette.deep, color: "#fff", overflow: "hidden" }}>
      {/* hero photo */}
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, backgroundImage: `url('${CAPA_PORTAL}')`, backgroundSize: "cover", backgroundPosition: "right center", backgroundRepeat: "no-repeat" }} />
      {/* legibility scrim on the left */}
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(30,27,75,.95) 0%, rgba(49,46,129,.84) 30%, rgba(49,46,129,.42) 55%, rgba(49,46,129,0) 75%)" }} />
      <div className="ds-pad" style={{ position: "relative", zIndex: 2, maxWidth: 1240, margin: "0 auto", padding: "96px 32px 104px", minHeight: 520, display: "flex", alignItems: "center" }}>
        <div style={{ minWidth: 0, maxWidth: 600 }}>
          <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase", color: "rgba(255,255,255,.7)", marginBottom: 16 }}>
            {demo.nome}
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(34px, 6vw, 52px)", lineHeight: 1.08, letterSpacing: "-.02em", maxWidth: 560, margin: 0 }}>
            Encontre o imóvel<br />certo para você.
          </h1>
          <p style={{ fontSize: 18, lineHeight: 1.55, color: "rgba(255,255,255,.85)", maxWidth: 520, marginTop: 18 }}>
            Busque por cidade, bairro ou código, salve os favoritos e compare lado a lado antes de visitar.
          </p>
          <div ref={tabsRef} style={{ display: "flex", gap: 6, marginTop: 32, marginBottom: 14 }}>
            {tabs.map((t, i) => (
              <button key={t} data-tab={t} onClick={(e) => selectTab(e, t)} className="ds-tab" style={{
                border: "none", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 14,
                padding: "9px 18px", borderRadius: 999, display: "flex", alignItems: "center", gap: 7,
                background: i === 0 ? "#fff" : "rgba(255,255,255,.12)",
                color: i === 0 ? sitePalette.primary : "#fff",
              }}>{t === "Filtros" && <Ic n="sliders-horizontal" s={15} c="currentColor" />}{t}</button>
            ))}
          </div>
          <div style={{
            display: "flex", alignItems: "center", gap: 10, background: "#fff", borderRadius: 999,
            padding: "8px 8px 8px 22px", boxShadow: "0 12px 32px rgba(49,46,129,.3)", maxWidth: 720,
          }}>
            <Ic n="search" s={22} c={sitePalette.g500} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cidade, bairro ou código"
              style={{ flex: 1, minWidth: 0, border: "none", outline: "none", fontFamily: "var(--font-body)", fontSize: 16, color: sitePalette.ink }} />
            <button onClick={() => onSearch && onSearch(q)} className="ds-btnpop" style={{
              border: "none", background: sitePalette.primary, color: "#fff", borderRadius: 999,
              padding: "14px 26px", fontWeight: 700, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
            }}><Ic n="search" s={18} c="#fff" /> Buscar</button>
          </div>
          <FiltersPanel innerRef={filtersRef} onSearch={onSearch} />
        </div>
      </div>
    </section>
  );
}
