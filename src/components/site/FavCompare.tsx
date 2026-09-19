"use client";
import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { palette as sitePalette } from "@/lib/palette";
import { Ic } from "@/components/Icon";
import type { Imovel } from "@/types";

/* ============================================================
   FAVORITOS + COMPARAR fora da página de favoritos (home/buscar).
   Mesmo armazenamento (localStorage) e mesma linguagem visual da
   página /favoritos: barra flutuante de comparação + toast.
   ============================================================ */

const FAV_KEY = "crm_favorites_v1";
const CMP_KEY = "crm_compare_v1";
const MAX_COMPARE = 4;

/* Metadados extras por código (nº da foto + atributos usados em /favoritos e /comparar) */
const META: Record<string, { img: number; priceNum: number; suites: number; vagas: number; tipo: string; kind: string; financia: string }> = {
  "48213": { img: 1, priceNum: 850000, suites: 3, vagas: 2, tipo: "Cobertura", kind: "Comprar", financia: "Sim" },
  "48199": { img: 2, priceNum: 540000, suites: 1, vagas: 1, tipo: "Apartamento", kind: "Comprar", financia: "Sim" },
  "48087": { img: 3, priceNum: 1250000, suites: 2, vagas: 4, tipo: "Casa", kind: "Comprar", financia: "Não" },
  "47980": { img: 4, priceNum: 420000, suites: 0, vagas: 0, tipo: "Studio", kind: "Comprar", financia: "Sim" },
  "47712": { img: 5, priceNum: 980000, suites: 2, vagas: 3, tipo: "Casa", kind: "Comprar", financia: "Sim" },
  "47865": { img: 6, priceNum: 690000, suites: 1, vagas: 2, tipo: "Apartamento", kind: "Comprar", financia: "Sim" },
  "49021": { img: 7, priceNum: 1480000, suites: 3, vagas: 4, tipo: "Casa", kind: "Comprar", financia: "Sim" },
  "49008": { img: 8, priceNum: 620000, suites: 0, vagas: 1, tipo: "Apartamento", kind: "Comprar", financia: "Sim" },
  "48977": { img: 9, priceNum: 2100000, suites: 3, vagas: 3, tipo: "Cobertura", kind: "Comprar", financia: "Sim" },
  "51230": { img: 10, priceNum: 3200, suites: 0, vagas: 1, tipo: "Apartamento", kind: "Alugar", financia: "Não" },
  "51188": { img: 11, priceNum: 5800, suites: 1, vagas: 2, tipo: "Casa", kind: "Alugar", financia: "Não" },
  "51102": { img: 12, priceNum: 2400, suites: 0, vagas: 0, tipo: "Studio", kind: "Alugar", financia: "Não" },
};

function buildFav(p: Imovel) {
  const m = META[p.code];
  return {
    code: p.code, price: p.price, priceNum: m?.priceNum ?? 0, title: p.title, location: p.location,
    beds: p.beds, baths: p.baths, area: p.area, vagas: m?.vagas ?? 0, tipo: m?.tipo ?? "Imóvel",
    kind: m?.kind ?? "Comprar", tag: p.tag, img: m?.img ?? 1, addedAt: Date.now(),
  };
}
function buildCmp(p: Imovel) {
  const m = META[p.code];
  return {
    code: p.code, price: p.price, priceNum: m?.priceNum ?? 0, title: p.title, location: p.location,
    beds: p.beds, suites: m?.suites ?? 0, baths: p.baths, area: p.area, vagas: m?.vagas ?? 0,
    tipo: m?.tipo ?? "Imóvel", kind: m?.kind ?? "Comprar", financia: m?.financia ?? "Sim", img: m?.img ?? 1,
  };
}

export function useFavCompare() {
  const router = useRouter();
  const [favCodes, setFavCodes] = React.useState<string[]>([]);
  const [selected, setSelected] = React.useState<Imovel[]>([]);
  const [toast, setToast] = React.useState<{ kind: "added" | "removed"; code: string } | null>(null);
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(FAV_KEY);
      if (raw) setFavCodes((JSON.parse(raw) as { code: string }[]).map((f) => f.code));
    } catch { /* ignore */ }
  }, []);

  const isFav = (code: string) => favCodes.includes(code);
  const isSelected = (code: string) => selected.some((s) => s.code === code);

  const toggleFav = (p: Imovel) => {
    let list: { code: string }[] = [];
    try {
      const raw = localStorage.getItem(FAV_KEY);
      if (raw) list = JSON.parse(raw);
    } catch { /* ignore */ }
    const exists = list.some((f) => f.code === p.code);
    const next = exists ? list.filter((f) => f.code !== p.code) : [buildFav(p), ...list];
    try { localStorage.setItem(FAV_KEY, JSON.stringify(next)); } catch { /* ignore */ }
    setFavCodes(next.map((f) => f.code));
    setToast({ kind: exists ? "removed" : "added", code: p.code });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 5000);
  };

  const toggleCompare = (p: Imovel) => {
    setSelected((cur) => {
      if (cur.some((s) => s.code === p.code)) return cur.filter((s) => s.code !== p.code);
      if (cur.length >= MAX_COMPARE) return cur;
      return [...cur, p];
    });
  };

  const goCompare = () => {
    if (selected.length < 2) return;
    try { localStorage.setItem(CMP_KEY, JSON.stringify(selected.map(buildCmp))); } catch { /* ignore */ }
    router.push("/demo/comparar");
  };

  const overlay = (
    <React.Fragment>
      <style>{`
        @keyframes fcPop { from { opacity: 0; transform: translate(-50%, 14px); } to { opacity: 1; transform: translate(-50%, 0); } }
        .fc-pop { animation: fcPop .26s cubic-bezier(.2,.7,.3,1) both; }
        @media (prefers-reduced-motion: reduce) { .fc-pop { animation: none !important; } }
      `}</style>

      {/* barra de comparação (igual à de /favoritos) */}
      {selected.length > 0 && (
        <div className="fc-pop" style={{
          position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", zIndex: 150,
          display: "flex", alignItems: "center", gap: 18, background: sitePalette.dark, color: "#fff",
          borderRadius: 999, boxShadow: "0 18px 50px rgba(20,6,38,.5)", padding: "12px 14px 12px 24px",
          maxWidth: "calc(100vw - 24px)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14.5, fontWeight: 600 }}>
            <Ic n="git-compare" s={18} c="#fff" />
            {selected.length} {selected.length === 1 ? "selecionado" : "selecionados"}
            <span style={{ fontSize: 12.5, color: "rgba(255,255,255,.6)", fontWeight: 500 }}>· até 4</span>
          </div>
          <button onClick={() => setSelected([])} style={{ border: "none", background: "transparent", color: "rgba(255,255,255,.8)", fontWeight: 600, fontSize: 13.5, cursor: "pointer", fontFamily: "var(--font-body)" }}>Limpar</button>
          <button onClick={goCompare} disabled={selected.length < 2} className="ds-btnpop" style={{
            border: "none", borderRadius: 999, padding: "12px 24px", cursor: selected.length < 2 ? "not-allowed" : "pointer",
            fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 8,
            background: selected.length < 2 ? "rgba(255,255,255,.18)" : "#fff",
            color: selected.length < 2 ? "rgba(255,255,255,.6)" : sitePalette.primary,
          }}>
            Comparar agora <Ic n="arrow-right" s={16} c={selected.length < 2 ? "rgba(255,255,255,.6)" : sitePalette.primary} />
          </button>
        </div>
      )}

      {/* toast de favorito (mesma arte da página /favoritos, com "Ver favoritos") */}
      {toast && (
        <div className="fc-pop" style={{
          position: "fixed", bottom: selected.length > 0 ? 96 : 24, left: "50%", transform: "translateX(-50%)", zIndex: 300,
          display: "flex", alignItems: "center", gap: 14, background: "#fff", borderLeft: `4px solid ${sitePalette.primary}`,
          borderRadius: 10, boxShadow: "0 16px 40px rgba(20,6,38,.28)", padding: "14px 18px", minWidth: 320,
          maxWidth: "calc(100vw - 24px)",
        }}>
          {toast.kind === "added"
            ? <Ic n="heart" s={20} c={sitePalette.primary} style={{ fill: sitePalette.primary }} />
            : <Ic n="heart-off" s={20} c={sitePalette.primary} />}
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 14, color: sitePalette.ink }}>
              {toast.kind === "added" ? "Imóvel salvo nos favoritos" : "Imóvel removido dos favoritos"}
            </div>
            <div style={{ fontSize: 12.5, color: sitePalette.g500 }}>Cód: {toast.code}</div>
          </div>
          <Link href="/demo/favoritos" style={{ color: sitePalette.primary, fontWeight: 700, fontSize: 13.5, textDecoration: "none", fontFamily: "var(--font-body)", whiteSpace: "nowrap" }}>Ver favoritos</Link>
          <button onClick={() => setToast(null)} aria-label="Fechar" style={{ border: "none", background: "transparent", cursor: "pointer", display: "grid", placeItems: "center" }}><Ic n="x" s={16} c={sitePalette.g500} /></button>
        </div>
      )}
    </React.Fragment>
  );

  return { isFav, isSelected, toggleFav, toggleCompare, overlay };
}
