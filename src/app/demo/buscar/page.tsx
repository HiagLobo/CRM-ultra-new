"use client";
import * as React from "react";
import SiteNavbar from "@/components/site/SiteNavbar";
import { PropertyCard, SiteFooter } from "@/components/site/SiteComponents";
import { FilterBar, ResultsToolbar, PropertyRow, FinancingCard } from "@/components/buscar/BuscarComponents";
import { useFavCompare } from "@/components/site/FavCompare";
import { palette as buscarPalette } from "@/lib/palette";
import { BIc } from "@/components/Icon";
import { getImoveisBusca } from "@/services";
import type { Imovel } from "@/types";

export default function BuscarPage() {
  const [view, setView] = React.useState("grid");
  const [query, setQuery] = React.useState("");
  const [all, setAll] = React.useState<Imovel[]>([]);
  const fc = useFavCompare();

  React.useEffect(() => {
    getImoveisBusca().then(setAll);
  }, []);

  const filtered = all.filter((l) => !query || (l.location + l.title + l.code).toLowerCase().includes(query.toLowerCase()));

  const cardProps = (p: Imovel) => ({
    p,
    favorited: fc.isFav(p.code),
    onToggleFav: fc.toggleFav,
    compared: fc.isSelected(p.code),
    onToggleCompare: fc.toggleCompare,
  });

  return (
    <div>
      <SiteNavbar current="Buscar imóvel" />

      {/* page heading band */}
      <section style={{ background: buscarPalette.lilac1, borderBottom: `1px solid ${buscarPalette.g300}` }}>
        <div className="ds-pad" style={{ maxWidth: 1240, margin: "0 auto", padding: "32px 32px 26px" }}>
          <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase", color: buscarPalette.primary, marginBottom: 8 }}>Buscar imóvel</div>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(28px, 5vw, 34px)", margin: 0, color: buscarPalette.ink }}>Encontre seu próximo lar</h1>
        </div>
      </section>

      <main className="ds-pad" style={{ maxWidth: 1240, margin: "0 auto", padding: "24px 32px 64px" }}>
        <FilterBar onSearch={setQuery} view={view} setView={setView} />
        <ResultsToolbar count={filtered.length} view={view} setView={setView} />

        {view === "grid" ? (
          <div className="ds-cards" data-tour="busca-resultados" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
            {filtered.slice(0, 5).map((p) => <PropertyCard key={p.code} {...cardProps(p)} />)}
            <FinancingCard />
            {filtered.slice(5).map((p) => <PropertyCard key={p.code} {...cardProps(p)} />)}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {filtered.slice(0, 4).map((p) => <PropertyRow key={p.code} {...cardProps(p)} />)}
            <div style={{ maxWidth: 420 }}><FinancingCard /></div>
            {filtered.slice(4).map((p) => <PropertyRow key={p.code} {...cardProps(p)} />)}
          </div>
        )}

        {/* pagination */}
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 40 }}>
          <span style={{ width: 38, height: 38, border: `1px solid ${buscarPalette.g300}`, borderRadius: 10, display: "grid", placeItems: "center", color: buscarPalette.g500, cursor: "pointer" }}>
            <BIc n="chevron-left" s={16} />
          </span>
          {[1, 2, 3, 4].map((n) => (
            <span key={n} style={{ width: 38, height: 38, border: `1px solid ${n === 1 ? buscarPalette.primary : buscarPalette.g300}`, background: n === 1 ? buscarPalette.primary : "#fff", color: n === 1 ? "#fff" : buscarPalette.g700, borderRadius: 10, display: "grid", placeItems: "center", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>{n}</span>
          ))}
          <span style={{ width: 38, height: 38, border: `1px solid ${buscarPalette.g300}`, borderRadius: 10, display: "grid", placeItems: "center", color: buscarPalette.g700, cursor: "pointer" }}>
            <BIc n="chevron-right" s={16} />
          </span>
        </div>
      </main>

      <SiteFooter />
      {fc.overlay}
    </div>
  );
}
