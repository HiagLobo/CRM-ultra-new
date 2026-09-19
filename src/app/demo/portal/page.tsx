"use client";
import * as React from "react";
import Link from "next/link";
import SiteNavbar from "@/components/site/SiteNavbar";
import SiteHero from "@/components/site/SiteHero";
import { PropertyCard, SiteFooter } from "@/components/site/SiteComponents";
import { useFavCompare } from "@/components/site/FavCompare";
import { palette as sitePalette } from "@/lib/palette";
import { Ic } from "@/components/Icon";
import { getImoveis, getImoveisVenda, getImoveisLocacao } from "@/services";
import type { Imovel } from "@/types";

type FC = ReturnType<typeof useFavCompare>;

function Row({ eyebrow, title, items, fc }: { eyebrow: string; title: string; items: Imovel[]; fc: FC }) {
  return (
    <section className="ds-pad" style={{ maxWidth: 1240, margin: "0 auto", padding: "8px 32px 56px" }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase", color: sitePalette.primary, marginBottom: 8 }}>{eyebrow}</div>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 32, margin: 0, color: sitePalette.ink }}>{title}</h2>
        </div>
        <Link href="/demo/buscar" style={{ display: "flex", alignItems: "center", gap: 6, color: sitePalette.primary, fontWeight: 600, fontSize: 14, textDecoration: "none" }}>
          Ver todos <Ic n="arrow-right" s={16} c={sitePalette.primary} />
        </Link>
      </div>
      <div className="ds-cards" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }}>
        {items.map((p) => (
          <PropertyCard key={p.code} p={p}
            favorited={fc.isFav(p.code)} onToggleFav={fc.toggleFav}
            compared={fc.isSelected(p.code)} onToggleCompare={fc.toggleCompare} />
        ))}
      </div>
    </section>
  );
}

export default function HomePage() {
  const [query, setQuery] = React.useState("");
  const [destaque, setDestaque] = React.useState<Imovel[]>([]);
  const [venda, setVenda] = React.useState<Imovel[]>([]);
  const [locacao, setLocacao] = React.useState<Imovel[]>([]);
  const fc = useFavCompare();

  React.useEffect(() => {
    getImoveis().then(setDestaque);
    getImoveisVenda().then(setVenda);
    getImoveisLocacao().then(setLocacao);
  }, []);

  const filtered = destaque.filter(
    (l) => !query || (l.location + l.title + l.code).toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div>
      <SiteNavbar current="Home" />
      <SiteHero onSearch={setQuery} />

      <section className="ds-pad" style={{ maxWidth: 1240, margin: "0 auto", padding: "56px 32px 56px" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase", color: sitePalette.primary, marginBottom: 8 }}>
              {query ? `Resultados para "${query}"` : "Selecionados para você"}
            </div>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 32, margin: 0, color: sitePalette.ink }}>
              Imóveis em destaque
            </h2>
          </div>
        </div>
        {filtered.length ? (
          <div className="ds-cards" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }}>
            {filtered.map((p) => (
              <PropertyCard key={p.code} p={p}
                favorited={fc.isFav(p.code)} onToggleFav={fc.toggleFav}
                compared={fc.isSelected(p.code)} onToggleCompare={fc.toggleCompare} />
            ))}
          </div>
        ) : (
          <div style={{ background: "#fff", borderRadius: 16, border: `1px dashed ${sitePalette.g300}`, padding: 48, textAlign: "center" }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: sitePalette.lilac2, display: "grid", placeItems: "center", margin: "0 auto 14px" }}>
              <Ic n="search-x" s={26} c={sitePalette.primary} />
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18 }}>Nenhum imóvel encontrado</div>
            <div style={{ fontSize: 14, color: sitePalette.g500, marginTop: 4 }}>Ajuste a busca e tente de novo.</div>
          </div>
        )}
      </section>

      <Row eyebrow="Para comprar" title="Imóveis à venda" items={venda} fc={fc} />
      <Row eyebrow="Para alugar" title="Imóveis para alugar" items={locacao} fc={fc} />

      <SiteFooter />
      {fc.overlay}
    </div>
  );
}
