"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import CorretorChrome, { pal, Ic } from "@/components/corretor/CorretorChrome";
import { demo } from "@/config/demo";
import RadarCredits from "@/components/corretor/RadarCredits";

/* ============================================================
   RADAR MAPA — porte fiel de mapa-data.jsx + mapa.jsx +
   mapa-panels.jsx + mapa-results.jsx + mapa-app.jsx
   ============================================================ */

/* ---------- DATA (mapa-data.jsx) ---------- */
const MP_CITIES = ["São Paulo, SP", "Recife, PE", "Rio de Janeiro, RJ"];

const MP_BAIRROS: any[] = [
  { id: "pinheiros",   nome: "Pinheiros",     cx: 24, cy: 32, n: 6500, count: "6,5k",
    path: "M6 14 L30 10 L40 26 L34 44 L14 48 L4 34 Z",
    valorMedio: "R$ 1.119.205", valorM2: "R$ 8.430", tempoMedio: "37 dias", anuncios: "15.914", particulares: 83, completos: "6.256", incompletos: "9.658" },
  { id: "vilamadalena", nome: "Vila Madalena", cx: 16, cy: 58, n: 3100, count: "3,1k",
    path: "M4 34 L14 48 L34 44 L30 64 L10 72 L2 56 Z",
    valorMedio: "R$ 1.340.000", valorM2: "R$ 9.120", tempoMedio: "41 dias", anuncios: "8.420", particulares: 61, completos: "3.980", incompletos: "4.440" },
  { id: "itaimbibi",   nome: "Itaim Bibi",    cx: 52, cy: 26, n: 2500, count: "2,5k",
    path: "M30 10 L58 6 L70 22 L60 38 L40 26 Z",
    valorMedio: "R$ 2.180.000", valorM2: "R$ 13.400", tempoMedio: "52 dias", anuncios: "6.110", particulares: 44, completos: "3.020", incompletos: "3.090" },
  { id: "vilaolimpia", nome: "Vila Olímpia",  cx: 74, cy: 30, n: 1800, count: "1,8k",
    path: "M70 22 L92 18 L96 38 L78 46 L60 38 Z",
    valorMedio: "R$ 1.960.000", valorM2: "R$ 12.100", tempoMedio: "48 dias", anuncios: "4.730", particulares: 39, completos: "2.510", incompletos: "2.220" },
  { id: "vilamariana", nome: "Vila Mariana",  cx: 44, cy: 56, n: 3700, count: "3,7k",
    path: "M34 44 L60 38 L66 56 L52 72 L30 64 Z",
    valorMedio: "R$ 1.150.000", valorM2: "R$ 9.480", tempoMedio: "33 dias", anuncios: "12.300", particulares: 77, completos: "5.900", incompletos: "6.400" },
  { id: "moema",       nome: "Moema",         cx: 72, cy: 56, n: 1000, count: "1k",
    path: "M66 56 L78 46 L96 38 L98 62 L80 74 L66 56 Z",
    valorMedio: "R$ 1.420.000", valorM2: "R$ 11.200", tempoMedio: "36 dias", anuncios: "5.240", particulares: 52, completos: "3.110", incompletos: "2.130" },
  { id: "campobelo",   nome: "Campo Belo",    cx: 40, cy: 80, n: 980, count: "980",
    path: "M30 64 L52 72 L66 56 L80 74 L62 92 L34 92 L24 78 Z",
    valorMedio: "R$ 980.000", valorM2: "R$ 8.900", tempoMedio: "29 dias", anuncios: "4.180", particulares: 66, completos: "2.460", incompletos: "1.720" },
  { id: "brooklin",    nome: "Brooklin",      cx: 14, cy: 80, n: 2100, count: "2,1k",
    path: "M2 56 L10 72 L30 64 L24 78 L34 92 L8 96 L0 78 Z",
    valorMedio: "R$ 1.080.000", valorM2: "R$ 9.760", tempoMedio: "38 dias", anuncios: "7.020", particulares: 58, completos: "3.640", incompletos: "3.380" },
];

const MP_FUNNEL: any[] = [
  { k: "Prospectar", c: "#2563A8", n: 8 },
  { k: "Contactar",  c: "#4F46E5", n: 5 },
  { k: "Avaliar",    c: "#E0A82E", n: 3 },
  { k: "Visitar",    c: "#D64545", n: 2 },
  { k: "Documentar", c: "#C2410C", n: 1 },
];

const MP_PINS: any[] = [
  { id: "p1", bid: "pinheiros",   dx: -6, dy:  4, stage: "Prospectar" },
  { id: "p2", bid: "pinheiros",   dx:  6, dy: -3, stage: "Contactar" },
  { id: "p3", bid: "itaimbibi",   dx:  0, dy:  4, stage: "Contactar" },
  { id: "p4", bid: "vilaolimpia", dx: -4, dy:  0, stage: "Visitar" },
  { id: "p5", bid: "vilamariana", dx:  4, dy: -2, stage: "Avaliar" },
  { id: "p6", bid: "vilamariana", dx: -6, dy:  6, stage: "Prospectar" },
  { id: "p7", bid: "moema",       dx:  0, dy:  2, stage: "Documentar" },
  { id: "p8", bid: "campobelo",   dx:  2, dy: -2, stage: "Prospectar" },
];

const MP_TYPES = ["Apartamento", "Casa", "Comercial", "Galpão", "Terreno"];
const MP_CARTEIRA: [string, number][] = [["Publicados", 14], ["Não publicados", 5]];

const MP_SUBCLUSTERS: any[] = [
  { dx: -8, dy: -4, count: "1,5k" }, { dx: 6, dy: -6, count: "3,7k" }, { dx: 10, dy: 4, count: "1,1k" },
  { dx: -10, dy: 6, count: "244" },  { dx: -4, dy: 10, count: "3,1k" }, { dx: 8, dy: 10, count: "361" },
];

const MP_LISTINGS: any[] = [
  { id: "l1", end: "Rua Exemplo, 320",    anunciante: "Particular",          tipo: "Apartamento", price: "R$ 720.000", area: 68, quartos: 2, vagas: 1, dias: 72, particular: true },
  { id: "l2", end: "Av. Modelo, 1450",        anunciante: "Imobiliária Modelo", tipo: "Apartamento", price: "R$ 890.000", area: 88, quartos: 2, vagas: 2, dias: 21, particular: false },
  { id: "l3", end: "Rua Modelo, 88",         anunciante: "Particular",          tipo: "Comercial",   price: "R$ 980.000", area: 90, quartos: 0, vagas: 2, dias: 14, particular: true },
  { id: "l4", end: "Rua Fictícia, 760",   anunciante: "Revenda Imóvel",      tipo: "Apartamento", price: "R$ 640.000", area: 60, quartos: 1, vagas: 1, dias: 45, particular: false },
  { id: "l5", end: "Rua Exemplo, 410",   anunciante: "Particular",          tipo: "Casa",        price: "R$ 1.250.000", area: 140, quartos: 3, vagas: 2, dias: 33, particular: true },
  { id: "l6", end: "Av. Exemplo, 2100",    anunciante: "Imobiliária Modelo", tipo: "Apartamento", price: "R$ 815.000", area: 74, quartos: 2, vagas: 1, dias: 58, particular: false },
  { id: "l7", end: "Rua Modelo, 55",     anunciante: "Particular",          tipo: "Apartamento", price: "R$ 705.000", area: 64, quartos: 2, vagas: 1, dias: 27, particular: true },
  { id: "l8", end: "Rua Fictícia, 300",              anunciante: "Revenda Imóvel",      tipo: "Apartamento", price: "R$ 398.000", area: 51, quartos: 1, vagas: 0, dias: 90, particular: false },
];

/* ---------- SHARED HELPERS ---------- */
function Toast({ toast }: { toast: any }) {
  if (!toast) return null;
  return (
    <div key={toast.id} style={{ position: "fixed", bottom: 26, left: "50%", transform: "translateX(-50%)", zIndex: 9000, display: "flex", alignItems: "center", gap: 10, background: pal.ink, color: "#fff", borderRadius: 12, padding: "12px 18px", boxShadow: "var(--shadow-lg)", fontFamily: "var(--font-body)", fontSize: 13.5, fontWeight: 500, animation: "toastUp .26s cubic-bezier(.2,.7,.3,1)", maxWidth: 440 }}>
      <span style={{ width: 26, height: 26, borderRadius: "50%", background: "rgba(255,255,255,.14)", display: "grid", placeItems: "center", flexShrink: 0 }}><Ic n={toast.icon || "check"} s={15} c="#fff" /></span>
      <span>{toast.msg}</span>
    </div>
  );
}

/* ---------- mapa-panels.jsx ---------- */
function Tg({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!value)} style={{ width: 40, height: 23, flexShrink: 0, borderRadius: 999, border: "none", background: value ? pal.primary : pal.g300, position: "relative", cursor: "pointer", transition: "background .15s" } as React.CSSProperties}>
      <span style={{ position: "absolute", top: 3, left: value ? 20 : 3, width: 17, height: 17, borderRadius: "50%", background: "#fff", transition: "left .15s", boxShadow: "0 1px 2px rgba(0,0,0,.2)" } as React.CSSProperties} />
    </button>
  );
}
const segBtn = (on: boolean): React.CSSProperties => ({ flex: 1 as any, border: on ? `1.5px solid ${pal.primary}` : `1px solid ${pal.g300}`, background: on ? pal.lilac2 : "#fff", color: on ? pal.primary : pal.g700, borderRadius: 9, padding: "9px 6px", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 12.5 });
const groupLabel: React.CSSProperties = { fontSize: 11, fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: pal.g500, margin: "0 0 9px" };

function AnunciosFilters({ onToast, onBuscar }: { onToast: (m: string, i?: string) => void; onBuscar?: () => void }) {
  const [busca, setBusca] = React.useState("Venda");
  const [loc, setLoc] = React.useState("Urbano");
  const [types, setTypes] = React.useState(["Apartamento"]);
  const [particular, setParticular] = React.useState(false);
  const [completos, setCompletos] = React.useState(false);
  const [carac, setCarac] = React.useState(false);
  const allOn = types.length === MP_TYPES.length;
  const toggleType = (t: string) => setTypes((x) => x.includes(t) ? x.filter((y) => y !== t) : [...x, t]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div>
        <div style={groupLabel}>Buscar por</div>
        <div style={{ display: "flex", gap: 7 }}>{["Venda", "Locação", "Lançamentos"].map((b) => <button key={b} onClick={() => setBusca(b)} style={segBtn(busca === b)}>{b}</button>)}</div>
      </div>
      <div>
        <div style={groupLabel}>Localização</div>
        <div style={{ display: "flex", gap: 7 }}>{["Urbano", "Rural"].map((b) => <button key={b} onClick={() => setLoc(b)} style={segBtn(loc === b)}>{b}</button>)}</div>
      </div>
      <div>
        <div style={{ ...groupLabel, display: "flex", alignItems: "center", gap: 6 }}>Tipo de imóvel <span style={{ color: pal.error, textTransform: "none", letterSpacing: 0 }}>*</span></div>
        <button onClick={() => setTypes(allOn ? [] : [...MP_TYPES])} style={{ display: "flex", alignItems: "center", gap: 9, width: "100%", border: "none", background: "transparent", cursor: "pointer", padding: "6px 0", fontFamily: "var(--font-body)" }}>
          <span style={{ width: 20, height: 20, borderRadius: 6, border: allOn ? "none" : `2px solid ${pal.g300}`, background: allOn ? pal.primary : "#fff", display: "grid", placeItems: "center" }}>{allOn && <Ic n="check" s={14} c="#fff" />}</span>
          <span style={{ fontSize: 13.5, fontWeight: 600, color: pal.ink }}>Selecionar todos</span>
        </button>
        <div style={{ display: "flex", flexDirection: "column", gap: 2, marginTop: 2 }}>
          {MP_TYPES.map((t) => {
            const on = types.includes(t);
            return (
              <button key={t} onClick={() => toggleType(t)} style={{ display: "flex", alignItems: "center", gap: 9, width: "100%", border: "none", background: "transparent", cursor: "pointer", padding: "6px 0", fontFamily: "var(--font-body)" }}>
                <span style={{ width: 20, height: 20, borderRadius: 6, border: on ? "none" : `2px solid ${pal.g300}`, background: on ? pal.primary : "#fff", display: "grid", placeItems: "center" }}>{on && <Ic n="check" s={14} c="#fff" />}</span>
                <span style={{ fontSize: 13.5, color: pal.g700 }}>{t}</span>
              </button>
            );
          })}
        </div>
      </div>
      {([["Apenas anúncios particulares", "Direto com o dono — sem corretor no anúncio", particular, setParticular], ["Apenas endereços completos", "Imóveis com localização exata informada", completos, setCompletos]] as any[]).map(([t, d, v, set]: any, i: number) => (
        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 11 }}>
          <div style={{ flex: 1 }}><div style={{ fontSize: 13.5, fontWeight: 600, color: pal.ink }}>{t}</div><div style={{ fontSize: 12, color: pal.g500, marginTop: 2, lineHeight: 1.4 }}>{d}</div></div>
          <Tg value={v} onChange={set} />
        </div>
      ))}
      <div style={{ borderTop: `1px solid ${pal.g100}`, paddingTop: 14 }}>
        <button onClick={() => setCarac((c) => !c)} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", border: "none", background: "transparent", cursor: "pointer", padding: 0, fontFamily: "var(--font-body)" }}>
          <span style={{ flex: 1, textAlign: "left", fontSize: 13.5, fontWeight: 600, color: pal.ink }}>Características do imóvel</span>
          <span style={{ display: "inline-flex", transition: "transform .2s", transform: carac ? "rotate(180deg)" : "none" } as React.CSSProperties}><Ic n="chevron-down" s={17} c={pal.g500} /></span>
        </button>
        {carac && <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 12 }}>{["1+ quarto", "2+ quartos", "3+ quartos", "1+ vaga", "2+ vagas", "Suíte"].map((c) => <button key={c} onClick={() => onToast("Característica: " + c, "check")} style={{ border: `1px solid ${pal.g300}`, background: "#fff", color: pal.g700, borderRadius: 999, padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>{c}</button>)}</div>}
      </div>
      <div style={{ display: "flex", gap: 9, paddingTop: 4 }}>
        <button onClick={() => onToast("Filtros limpos", "eraser")} style={{ flex: 1, border: `1px solid ${pal.g300}`, background: "#fff", color: pal.g700, borderRadius: 10, padding: "11px", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13.5 }}>Limpar</button>
        <button onClick={() => (onBuscar ? onBuscar() : onToast("Busca aplicada", "search"))} style={{ flex: 2, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, border: "none", background: pal.primary, color: "#fff", borderRadius: 10, padding: "11px", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 13.5, boxShadow: "var(--shadow-purple)" }}><Ic n="search" s={16} c="#fff" /> Buscar</button>
      </div>
    </div>
  );
}

function CaptacoesFilters({ activeStages, setActiveStages, onToast }: { activeStages: string[]; setActiveStages: (fn: (s: string[]) => string[]) => void; onToast: (m: string, i?: string) => void }) {
  const toggle = (k: string) => setActiveStages((s) => s.includes(k) ? s.filter((x) => x !== k) : [...s, k]);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div>
        <div style={groupLabel}>Oportunidades no funil</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {MP_FUNNEL.map((f) => {
            const on = activeStages.includes(f.k);
            return (
              <button key={f.k} onClick={() => toggle(f.k)} style={{ display: "flex", alignItems: "center", gap: 11, border: on ? `1.5px solid ${f.c}` : `1px solid ${pal.g300}`, background: on ? f.c + "14" : "#fff", borderRadius: 11, padding: "11px 13px", cursor: "pointer", fontFamily: "var(--font-body)" }}>
                <span style={{ width: 12, height: 12, borderRadius: "50%", background: f.c, flexShrink: 0 }} />
                <span style={{ flex: 1, textAlign: "left", fontSize: 13.5, fontWeight: 600, color: pal.ink }}>{f.k}</span>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: f.c, background: f.c + "18", borderRadius: 999, padding: "1px 9px" }}>{f.n}</span>
                {on && <Ic n="check" s={15} c={f.c} />}
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <div style={groupLabel}>Imóveis na carteira</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {MP_CARTEIRA.map(([t, n]) => (
            <div key={t} style={{ display: "flex", alignItems: "center", gap: 10, border: `1px solid ${pal.g300}`, borderRadius: 11, padding: "11px 13px" }}>
              <Ic n={t === "Publicados" ? "globe" : "file-clock"} s={16} c={pal.g600} />
              <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600, color: pal.ink }}>{t}</span>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: pal.g700 }}>{n}</span>
            </div>
          ))}
        </div>
      </div>
      <button onClick={() => onToast("Abrindo funil de captação…", "arrow-up-right")} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, border: `1px solid ${pal.g300}`, background: "#fff", color: pal.primary, borderRadius: 10, padding: "11px", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13.5 }}>Abrir funil completo <Ic n="arrow-up-right" s={15} c={pal.primary} /></button>
    </div>
  );
}

function RegionPanel({ bairro, showDemand, setShowDemand, onVerImoveis, onClose, onToast }: any) {
  const r = bairro || {};
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
        <div>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: pal.ink }}>Resultados da sua busca</div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12.5, color: pal.primary, fontWeight: 600, marginTop: 2 }}><Ic n="map-pin" s={13} c={pal.primary} /> {r.nome}</div>
        </div>
        {onClose && <button onClick={onClose} style={{ width: 30, height: 30, flexShrink: 0, borderRadius: 8, border: "none", background: pal.g100, display: "grid", placeItems: "center", cursor: "pointer" }}><Ic n="x" s={16} c={pal.g700} /></button>}
      </div>
      <div>
        <div style={groupLabel}>Informações gerais</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {([ ["Valor médio", r.valorMedio, "tag"], ["Valor médio m²", r.valorM2, "ruler"], ["Tempo médio dos anúncios", r.tempoMedio, "clock"] ] as any[]).map(([l, v, ic]: any, i: number) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, background: pal.g100, borderRadius: 10, padding: "10px 12px" }}>
              <Ic n={ic} s={16} c={pal.primary} /><span style={{ flex: 1, fontSize: 12.5, color: pal.g600 }}>{l}</span><span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: pal.ink }}>{v}</span>
            </div>
          ))}
        </div>
        <button onClick={() => onToast("Abrindo estatísticas detalhadas…", "bar-chart-3")} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, width: "100%", marginTop: 9, border: `1px solid ${pal.g300}`, background: "#fff", color: pal.g700, borderRadius: 10, padding: "9px", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13 }}><Ic n="bar-chart-3" s={15} c={pal.primary} /> Estatísticas</button>
      </div>
      <div style={{ background: `linear-gradient(135deg, ${pal.primary}, ${pal.deep})`, borderRadius: 14, padding: "14px 16px", color: "#fff" }}>
        <div style={{ fontSize: 12, opacity: 0.85, fontWeight: 600 }}>Anúncios na região</div>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 30, marginTop: 2 }}>{r.anuncios}</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {([ ["Anúncios de particulares", r.particulares, "user"], ["Endereços completos", r.completos, "map-pin"], ["Endereços incompletos", r.incompletos, "map-pin-off"] ] as any[]).map(([l, v, ic]: any, i: number) => (
          <button key={i} onClick={() => onToast("Filtrando: " + l, ic)} style={{ display: "flex", alignItems: "center", gap: 10, border: "none", background: "transparent", cursor: "pointer", padding: "10px 4px", borderBottom: i < 2 ? `1px solid ${pal.g100}` : "none", fontFamily: "var(--font-body)" }}>
            <Ic n={ic} s={15} c={pal.g500} /><span style={{ flex: 1, textAlign: "left", fontSize: 13, color: pal.g700 }}>{l}</span><span style={{ fontSize: 13, fontWeight: 700, color: pal.ink }}>{v}</span><Ic n="chevron-right" s={15} c={pal.g300} />
          </button>
        ))}
      </div>
      <div style={{ background: showDemand ? "#FCEBDD" : pal.lilac1, border: `1px solid ${showDemand ? "#F2C9A8" : pal.lilac2}`, borderRadius: 14, padding: 14, transition: "background .2s" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 11 }}>
          <span style={{ width: 36, height: 36, flexShrink: 0, borderRadius: 10, background: "#fff", display: "grid", placeItems: "center" }}><Ic n="flame" s={19} c="#EA580C" /></span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: pal.ink }}>Sobrepor demanda da rede</div>
            <div style={{ fontSize: 12, color: pal.g600, marginTop: 2, lineHeight: 1.45 }}>Veja onde os clientes da {demo.nomeCurto} procuram — capture onde há procura e pouca oferta.</div>
          </div>
          <Tg value={showDemand} onChange={setShowDemand} />
        </div>
        {showDemand && (
          <div style={{ display: "flex", gap: 14, marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(234,88,12,.2)" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11.5, color: "#9A3A12", fontWeight: 600 }}><span style={{ width: 11, height: 11, borderRadius: "50%", background: "rgba(234,88,12,.55)" }} /> Procura alta</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11.5, color: "#9A6B0E", fontWeight: 600 }}><span style={{ width: 11, height: 11, borderRadius: "50%", background: "rgba(224,168,46,.5)" }} /> Procura média</span>
          </div>
        )}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <button onClick={() => (onVerImoveis ? onVerImoveis() : onToast("Listando imóveis…", "list"))} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, border: "none", background: pal.primary, color: "#fff", borderRadius: 10, padding: "12px", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 14, boxShadow: "var(--shadow-purple)" }}><Ic n="list" s={16} c="#fff" /> Ver imóveis</button>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => onToast("Filtro salvo", "bookmark")} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, border: `1px solid ${pal.g300}`, background: "#fff", color: pal.g700, borderRadius: 10, padding: "10px", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13 }}><Ic n="bookmark" s={15} c={pal.primary} /> Salvar filtro</button>
          <button onClick={() => onToast("Alerta criado para esta região", "bell-plus")} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, border: `1px solid ${pal.g300}`, background: "#fff", color: pal.g700, borderRadius: 10, padding: "10px", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13 }}><Ic n="bell-plus" s={15} c={pal.primary} /> Criar alerta</button>
        </div>
      </div>
    </div>
  );
}

/* ---------- mapa-results.jsx ---------- */
function ResultsList({ bairro, isMobile, onClose, onCaptar, onToast }: any) {
  const [q, setQ] = React.useState("");
  const [hideFunil, setHideFunil] = React.useState(false);
  const [sel, setSel] = React.useState<string[]>([]);
  const rows = MP_LISTINGS.filter((l) => !q || (l.end + l.anunciante + l.tipo).toLowerCase().includes(q.toLowerCase()));
  const toggle = (id: string) => setSel((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 8500, background: pal.page, display: "flex", flexDirection: "column", animation: "fadeIn .18s ease" }}>
      <div style={{ background: pal.dark, color: "#fff", padding: isMobile ? "12px 16px" : "16px 24px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={onClose} style={{ width: 38, height: 38, flexShrink: 0, borderRadius: 10, border: "none", background: "rgba(255,255,255,.14)", display: "grid", placeItems: "center", cursor: "pointer" }}><Ic n="arrow-left" s={19} c="#fff" /></button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: isMobile ? 16 : 18 }}>Resultados da busca</div>
            <div style={{ fontSize: 12.5, color: "rgba(255,255,255,.7)" }}>{bairro.nome} · {bairro.anuncios} anúncios</div>
          </div>
          {sel.length > 0 && (
            <button onClick={() => { onCaptar(); onToast(sel.length + " imóveis enviados ao funil de captação", "crosshair"); setSel([]); }} style={{ display: "flex", alignItems: "center", gap: 7, border: "none", background: pal.primary, color: "#fff", borderRadius: 10, padding: "10px 16px", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 13.5, boxShadow: "var(--shadow-purple)" }}><Ic n="crosshair" s={16} c="#fff" /> Captar {sel.length}</button>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 200, display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,.12)", borderRadius: 10, padding: "9px 14px" }}>
            <Ic n="search" s={17} c="rgba(255,255,255,.7)" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Procure por palavra-chave" style={{ flex: 1, border: "none", background: "transparent", outline: "none", fontFamily: "var(--font-body)", fontSize: 14, color: "#fff" }} />
          </div>
          <button onClick={() => setHideFunil((v) => !v)} style={{ display: "flex", alignItems: "center", gap: 8, border: "none", background: "transparent", cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 13, color: "rgba(255,255,255,.85)", fontWeight: 500 }}>
            <span style={{ width: 18, height: 18, borderRadius: 5, border: hideFunil ? "none" : "2px solid rgba(255,255,255,.5)", background: hideFunil ? pal.primary : "transparent", display: "grid", placeItems: "center" }}>{hideFunil && <Ic n="check" s={13} c="#fff" />}</span>
            Ocultar já no funil
          </button>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", background: "#fff" }}>
        {!isMobile && (
          <div style={{ display: "grid", gridTemplateColumns: "40px 64px 1.4fr 1.4fr 1fr 70px 70px 70px 120px", gap: 0, padding: "0 24px", position: "sticky", top: 0, background: pal.g100, borderBottom: `1px solid ${pal.g300}`, zIndex: 2 }}>
            {["", "Fotos", "Endereço", "Anunciante", "Valor", "Área", "Quartos", "Vagas", "Ações"].map((h, i) => <div key={i} style={{ padding: "12px 8px", fontSize: 11.5, fontWeight: 700, color: pal.g600, letterSpacing: ".02em" }}>{h}</div>)}
          </div>
        )}
        {rows.map((l) => isMobile ? (
          <div key={l.id} style={{ display: "flex", gap: 12, padding: "13px 16px", borderBottom: `1px solid ${pal.g100}` }}>
            <div style={{ width: 56, height: 56, flexShrink: 0, borderRadius: 9, background: `linear-gradient(135deg, ${pal.light}, ${pal.deep})`, display: "grid", placeItems: "center" }}><Ic n="building-2" s={20} c="rgba(255,255,255,.55)" /></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}><span style={{ fontWeight: 700, fontSize: 13.5, color: pal.ink }}>{l.end}</span>{l.particular && <span style={{ fontSize: 9.5, fontWeight: 700, color: "#1E7A43", background: "#E6F4EC", borderRadius: 999, padding: "1px 6px" }}>PARTICULAR</span>}</div>
              <div style={{ fontSize: 12, color: pal.g500, marginTop: 1 }}>{l.anunciante} · {l.area}m² · {l.quartos}q · {l.vagas} vagas</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 6 }}>
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 15, color: pal.primary }}>{l.price}</span>
                <button onClick={() => { onCaptar(); onToast("Captado: " + l.end, "crosshair"); }} style={{ display: "flex", alignItems: "center", gap: 5, border: "none", background: pal.primary, color: "#fff", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 12 }}><Ic n="crosshair" s={13} c="#fff" /> Captar</button>
              </div>
            </div>
          </div>
        ) : (
          <div key={l.id} style={{ display: "grid", gridTemplateColumns: "40px 64px 1.4fr 1.4fr 1fr 70px 70px 70px 120px", gap: 0, padding: "0 24px", alignItems: "center", borderBottom: `1px solid ${pal.g100}` }}
            onMouseEnter={(e) => (e.currentTarget.style.background = pal.lilac1)} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
            <div style={{ padding: "11px 8px" }}><button onClick={() => toggle(l.id)} style={{ width: 19, height: 19, borderRadius: 5, border: sel.includes(l.id) ? "none" : `2px solid ${pal.g300}`, background: sel.includes(l.id) ? pal.primary : "#fff", display: "grid", placeItems: "center", cursor: "pointer" }}>{sel.includes(l.id) && <Ic n="check" s={13} c="#fff" />}</button></div>
            <div style={{ padding: "8px" }}><div style={{ width: 46, height: 38, borderRadius: 7, background: `linear-gradient(135deg, ${pal.light}, ${pal.deep})`, display: "grid", placeItems: "center" }}><Ic n="building-2" s={16} c="rgba(255,255,255,.55)" /></div></div>
            <div style={{ padding: "11px 8px" }}><div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ fontSize: 13, fontWeight: 600, color: pal.ink }}>{l.end}</span>{l.particular && <span style={{ fontSize: 9, fontWeight: 700, color: "#1E7A43", background: "#E6F4EC", borderRadius: 999, padding: "1px 6px" }}>PART.</span>}</div><div style={{ fontSize: 11.5, color: pal.g500 }}>{l.tipo}</div></div>
            <div style={{ padding: "11px 8px", fontSize: 13, color: pal.g700 }}>{l.anunciante}</div>
            <div style={{ padding: "11px 8px", fontSize: 13.5, fontWeight: 700, color: pal.primary }}>{l.price}</div>
            <div style={{ padding: "11px 8px", fontSize: 13, color: pal.g700 }}>{l.area}m²</div>
            <div style={{ padding: "11px 8px", fontSize: 13, color: pal.g700 }}>{l.quartos}</div>
            <div style={{ padding: "11px 8px", fontSize: 13, color: pal.g700 }}>{l.vagas}</div>
            <div style={{ padding: "8px", display: "flex", gap: 6 }}>
              <button onClick={() => onToast("Abrindo anúncio…", "external-link")} title="Abrir" style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${pal.g300}`, background: "#fff", display: "grid", placeItems: "center", cursor: "pointer" }}><Ic n="external-link" s={15} c={pal.g600} /></button>
              <button onClick={() => { onCaptar(); onToast("Captado: " + l.end, "crosshair"); }} title="Captar" style={{ display: "flex", alignItems: "center", gap: 5, border: "none", background: pal.primary, color: "#fff", borderRadius: 8, padding: "0 12px", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 12.5 }}><Ic n="crosshair" s={14} c="#fff" /> Captar</button>
            </div>
          </div>
        ))}
        <div style={{ textAlign: "center", padding: "20px", fontSize: 12.5, color: pal.g500 }}>Mostrando {rows.length} de {bairro.anuncios} · refine os filtros para ver mais</div>
      </div>
    </div>
  );
}

/* ---------- mapa.jsx ---------- */
function MapCanvas({ view, showDemand, activeStages, selected, onSelect, onCluster, onPin, demandSet }: any) {
  const [hover, setHover] = React.useState<string | null>(null);
  const stageColor = (k: string) => (MP_FUNNEL.find((f) => f.k === k) || {}).c || pal.primary;
  const sel = selected ? MP_BAIRROS.find((b) => b.id === selected) : null;

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: "#E9ECEF" }}>
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" style={{ position: "absolute", inset: 0 } as React.CSSProperties}>
        <defs>
          <pattern id="streets" width="3.2" height="3.2" patternUnits="userSpaceOnUse"><path d="M3.2 0H0V3.2" fill="none" stroke="#DDE1E6" strokeWidth="0.18" /></pattern>
        </defs>
        <rect width="100" height="100" fill="#EBEEF1" />
        <path d="M-5 84 q22 -10 46 -3 q30 8 64 -8 L105 105 L-5 105 Z" fill="#D4E2EF" opacity="0.8" />
        <path d="M-5 84 q22 -10 46 -3 q30 8 64 -8" fill="none" stroke="#BFD4E8" strokeWidth="2.4" />
        <ellipse cx="70" cy="64" rx="9" ry="7" fill="#D7E8D2" />
        <ellipse cx="12" cy="20" rx="7" ry="6" fill="#D7E8D2" />
        <rect width="100" height="100" fill="url(#streets)" />
        {MP_BAIRROS.map((b) => {
          const isSel = selected === b.id;
          const isHover = hover === b.id;
          const anySel = !!selected;
          let fill = "rgba(79,70,229,0.05)";
          if (isSel) fill = "rgba(79,70,229,0.16)";
          else if (isHover) fill = "rgba(79,70,229,0.12)";
          else if (anySel) fill = "rgba(120,120,130,0.04)";
          return (
            <path key={b.id} d={b.path} fill={fill}
              stroke={isSel ? pal.primary : isHover ? pal.light : "#C7C2D0"}
              strokeWidth={isSel ? 0.9 : isHover ? 0.7 : 0.4}
              style={{ cursor: "pointer", transition: "fill .15s, stroke .15s" } as React.CSSProperties}
              onMouseEnter={() => setHover(b.id)} onMouseLeave={() => setHover(null)}
              onClick={() => onSelect(b.id)} />
          );
        })}
        <g stroke="#fff" strokeLinecap="round" opacity="0.9" pointerEvents="none">
          <path d="M0 30 H100" strokeWidth="1.4" /><path d="M0 58 H100" strokeWidth="1.4" />
          <path d="M32 0 V100" strokeWidth="1.4" /><path d="M64 0 V100" strokeWidth="1.4" />
        </g>
      </svg>
      {MP_BAIRROS.map((b) => {
        const isSel = selected === b.id;
        const dim = selected && !isSel;
        return (
          <div key={b.id} onMouseEnter={() => setHover(b.id)} onMouseLeave={() => setHover(null)} onClick={() => onSelect(b.id)}
            style={{ position: "absolute", left: `${b.cx}%`, top: `${b.cy}%`, transform: "translate(-50%,-50%)", cursor: "pointer", pointerEvents: "auto", textAlign: "center", opacity: dim ? 0.5 : 1, transition: "opacity .15s" } as React.CSSProperties}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 10.5, color: isSel ? pal.deep : pal.g700, textShadow: "0 1px 3px rgba(255,255,255,.9)", whiteSpace: "nowrap", letterSpacing: ".01em" }}>{b.nome}</div>
            {!selected && hover === b.id && (
              <div style={{ marginTop: 3, display: "inline-flex", alignItems: "center", gap: 4, background: pal.primary, color: "#fff", borderRadius: 999, padding: "2px 9px", fontSize: 10, fontWeight: 700, boxShadow: "var(--shadow-md)" }}>{b.count} anúncios</div>
            )}
          </div>
        );
      })}
      {showDemand && MP_BAIRROS.filter((b) => demandSet[b.id]).map((b) => (
        <React.Fragment key={"d" + b.id}>
          <div style={{ position: "absolute", left: `${b.cx}%`, top: `${b.cy}%`, width: 150, height: 150, transform: "translate(-50%,-50%)", borderRadius: "50%", pointerEvents: "none",
            background: `radial-gradient(circle, ${demandSet[b.id] === "alta" ? "rgba(234,88,12,.4)" : "rgba(224,168,46,.32)"} 0%, transparent 68%)` } as React.CSSProperties} />
          {demandSet[b.id] === "alta" && (
            <div style={{ position: "absolute", left: `${b.cx}%`, top: `${b.cy + 6}%`, transform: "translate(-50%,0)", background: "#fff", borderRadius: 999, padding: "2px 8px", boxShadow: "var(--shadow-sm)", fontSize: 10, fontWeight: 700, color: "#C2410C", display: "flex", alignItems: "center", gap: 3, whiteSpace: "nowrap", pointerEvents: "none" } as React.CSSProperties}>
              <Ic n="flame" s={11} c="#EA580C" /> procura alta
            </div>
          )}
        </React.Fragment>
      ))}
      {view === "Anúncios" && sel && MP_SUBCLUSTERS.map((sc: any, i: number) => {
        const big = parseFloat(sc.count.replace(",", ".")) >= 3;
        const sz = big ? 48 : 38;
        return (
          <button key={i} onClick={() => onCluster(sel)} style={{ position: "absolute", left: `calc(${sel.cx}% + ${sc.dx * 0.7}%)`, top: `calc(${sel.cy}% + ${sc.dy * 0.7}%)`, transform: "translate(-50%,-50%)", width: sz, height: sz, borderRadius: "50%", border: "2.5px solid #fff", background: `linear-gradient(135deg, ${pal.primary}, ${pal.deep})`, color: "#fff", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: big ? 13 : 11.5, cursor: "pointer", boxShadow: "0 6px 16px rgba(49,46,129,.4)", display: "grid", placeItems: "center", animation: "popIn .25s ease", transition: "transform .12s" } as React.CSSProperties}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "translate(-50%,-50%) scale(1.08)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "translate(-50%,-50%)")}>{sc.count}</button>
        );
      })}
      {view === "Captações" && MP_PINS.filter((p) => activeStages.includes(p.stage)).map((p) => {
        const b = MP_BAIRROS.find((x) => x.id === p.bid); if (!b) return null;
        return (
          <button key={p.id} onClick={() => onPin(p)} style={{ position: "absolute", left: `calc(${b.cx}% + ${p.dx * 0.6}%)`, top: `calc(${b.cy}% + ${p.dy * 0.6}%)`, transform: "translate(-50%,-100%)", border: "none", background: "transparent", cursor: "pointer", padding: 0 }}>
            <span style={{ display: "block", width: 24, height: 24, borderRadius: "50% 50% 50% 0", transform: "rotate(-45deg)", background: stageColor(p.stage), border: "2.5px solid #fff", boxShadow: "0 5px 12px rgba(0,0,0,.3)" }} />
          </button>
        );
      })}
      {view === "Anúncios" && !selected && (
        <div style={{ position: "absolute", top: 18, left: "50%", transform: "translateX(-50%)", background: "rgba(28,22,40,.82)", backdropFilter: "blur(6px)", color: "#fff", borderRadius: 999, padding: "8px 16px", fontSize: 12.5, fontWeight: 600, display: "flex", alignItems: "center", gap: 8, boxShadow: "var(--shadow-lg)", pointerEvents: "none" } as React.CSSProperties}>
          <Ic n="hand-pointer" s={15} c="#fff" /> Passe o mouse e clique num bairro para ver os anúncios
        </div>
      )}
      <div style={{ position: "absolute", right: 16, bottom: 16, display: "flex", flexDirection: "column", background: "#fff", borderRadius: 11, boxShadow: "var(--shadow-md)", overflow: "hidden" }}>
        <button style={{ width: 38, height: 38, border: "none", borderBottom: `1px solid ${pal.g100}`, background: "#fff", cursor: "pointer", display: "grid", placeItems: "center" }}><Ic n="plus" s={18} c={pal.g700} /></button>
        <button style={{ width: 38, height: 38, border: "none", background: "#fff", cursor: "pointer", display: "grid", placeItems: "center" }}><Ic n="minus" s={18} c={pal.g700} /></button>
      </div>
      <div style={{ position: "absolute", left: 16, bottom: 16, display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,.92)", borderRadius: 999, padding: "5px 11px", fontSize: 11, color: pal.g500, fontWeight: 600, boxShadow: "var(--shadow-sm)" }}>
        <Ic n="map" s={13} c={pal.g500} /> {sel ? sel.nome : "São Paulo"} · mapa ilustrativo
      </div>
    </div>
  );
}

function ListingCard({ bairro, onClose, onVerImoveis }: any) {
  return (
    <div style={{ position: "absolute", top: 64, left: "50%", transform: "translateX(-50%)", zIndex: 60, width: 300, background: "#fff", borderRadius: 16, boxShadow: "var(--shadow-lg)", overflow: "hidden", animation: "fadeDown .2s ease" }}>
      <div style={{ padding: "14px 16px", borderBottom: `1px solid ${pal.g100}`, display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ width: 34, height: 34, borderRadius: 9, background: pal.lilac2, display: "grid", placeItems: "center", flexShrink: 0 }}><Ic n="map-pin" s={17} c={pal.primary} /></span>
        <div style={{ flex: 1 }}><div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14.5, color: pal.ink }}>{bairro.nome}</div><div style={{ fontSize: 11.5, color: pal.g500 }}>{bairro.anuncios} anúncios na região</div></div>
        <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 7, border: "none", background: pal.g100, display: "grid", placeItems: "center", cursor: "pointer" }}><Ic n="x" s={15} c={pal.g700} /></button>
      </div>
      <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
        <button onClick={onVerImoveis} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, border: "none", background: pal.primary, color: "#fff", borderRadius: 10, padding: "11px", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 13.5, boxShadow: "var(--shadow-purple)" }}><Ic n="list" s={15} c="#fff" /> Ver imóveis da região</button>
      </div>
    </div>
  );
}

/* ---------- mapa-app.jsx — PanelCard ---------- */
function PanelCard({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background: "#fff", border: `1px solid ${pal.g300}`, borderRadius: 16, boxShadow: "var(--shadow-sm)", padding: 18, ...style }}>{children}</div>;
}

/* ---------- TopBar (inner, from mapa-app.jsx) ---------- */
function MapTopBar({ view, setView, isMobile, onMobileFilters, selName, onClearBairro }: any) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: isMobile ? "12px 16px" : "14px 24px", background: "#fff", borderBottom: `1px solid ${pal.g300}`, flexShrink: 0, flexWrap: "wrap" }}>
      <div style={{ display: "flex", gap: 4, background: pal.g100, borderRadius: 11, padding: 4 }}>
        {["Anúncios", "Captações"].map((v) => (
          <button key={v} onClick={() => setView(v)} style={{ display: "flex", alignItems: "center", gap: 7, border: "none", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13.5, background: view === v ? "#fff" : "transparent", color: view === v ? pal.primary : pal.g500, boxShadow: view === v ? "var(--shadow-sm)" : "none" }}>
            <Ic n={v === "Anúncios" ? "map-pinned" : "crosshair"} s={16} c={view === v ? pal.primary : pal.g500} /> {v}
          </button>
        ))}
      </div>
      {!isMobile && (
        <React.Fragment>
          <div style={{ display: "flex", alignItems: "center", gap: 7, border: `1px solid ${pal.g300}`, borderRadius: 10, padding: "9px 13px" }}>
            <Ic n="map-pin" s={16} c={pal.primary} /><select style={{ border: "none", outline: "none", background: "transparent", fontFamily: "var(--font-body)", fontSize: 13.5, fontWeight: 600, color: pal.ink, cursor: "pointer" }}>{MP_CITIES.map((c) => <option key={c}>{c}</option>)}</select>
          </div>
          <div style={{ flex: 1, minWidth: 180, display: "flex", alignItems: "center", gap: 8, background: pal.g100, borderRadius: 10, padding: "10px 14px" }}>
            <Ic n="search" s={17} c={pal.g500} /><input placeholder="Digite um endereço ou bairro" style={{ flex: 1, border: "none", background: "transparent", outline: "none", fontFamily: "var(--font-body)", fontSize: 14, color: pal.ink }} />
          </div>
          {selName && (
            <button onClick={onClearBairro} style={{ display: "flex", alignItems: "center", gap: 7, border: `1px solid ${pal.primary}`, background: pal.lilac2, color: pal.primary, borderRadius: 999, padding: "8px 14px", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 13 }}>
              <Ic n="map-pin" s={15} c={pal.primary} /> {selName} <Ic n="x" s={14} c={pal.primary} />
            </button>
          )}
        </React.Fragment>
      )}
      {isMobile && <button onClick={onMobileFilters} style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, border: `1px solid ${pal.g300}`, background: "#fff", borderRadius: 10, padding: "9px 13px", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13, color: pal.g700 }}><Ic n="sliders-horizontal" s={16} c={pal.primary} /> Filtros</button>}
    </div>
  );
}

/* ---------- PAGE ---------- */
export default function RadarMapaPage() {
  const [isMobile, setIsMobile] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [view, setView] = React.useState("Anúncios");
  const [showDemand, setShowDemand] = React.useState(false);
  const [activeStages, setActiveStages] = React.useState<string[]>(MP_FUNNEL.map((f) => f.k));
  const [selected, setSelected] = React.useState<string | null>(null);
  const [listing, setListing] = React.useState<any>(null);
  const [showList, setShowList] = React.useState(false);
  const [mobilePanel, setMobilePanel] = React.useState<string | null>(null);
  const [toast, setToast] = React.useState<any>(null);
  const toastTimer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const demandSet: any = { campobelo: "alta", moema: "alta", itaimbibi: "média", vilamariana: "média" };

  React.useEffect(() => {
    const onResize = () => { const w = window.innerWidth; setIsMobile(w < 1024); };
    onResize();
    window.addEventListener("resize", onResize);
    const t0 = setTimeout(() => setLoading(false), 850);
    return () => { window.removeEventListener("resize", onResize); clearTimeout(t0); };
  }, []);

  const fire = (msg: string, icon?: string) => { setToast({ msg, icon, id: Date.now() }); clearTimeout(toastTimer.current); toastTimer.current = setTimeout(() => setToast(null), 2800); };
  const selBairro = selected ? MP_BAIRROS.find((b) => b.id === selected) : null;
  const onSelect = (id: string) => { setSelected(id); setListing(null); };
  const captar = () => { fire("Adicionado ao seu funil de captação (Prospectar)", "crosshair"); };

  const leftPanel = view === "Anúncios"
    ? <AnunciosFilters onToast={fire} onBuscar={() => { if (!selected) { setSelected(MP_BAIRROS[0].id); } fire("Busca aplicada", "search"); }} />
    : <CaptacoesFilters activeStages={activeStages} setActiveStages={setActiveStages} onToast={fire} />;

  const content = (
    <React.Fragment>
      <MapTopBar view={view} setView={setView} isMobile={isMobile} onMobileFilters={() => setMobilePanel("filters")} selName={selBairro ? selBairro.nome : null} onClearBairro={() => setSelected(null)} />
      {isMobile ? (
        <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: 16 }}>
          {loading ? <div className="sk" style={{ height: 400, borderRadius: 16 }} /> : (
            view === "Captações" ? <PanelCard>{leftPanel}</PanelCard>
              : selBairro ? <PanelCard><RegionPanel bairro={selBairro} showDemand={showDemand} setShowDemand={setShowDemand} onVerImoveis={() => setShowList(true)} onToast={fire} /></PanelCard>
              : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ fontSize: 12.5, color: pal.g500, fontWeight: 600, padding: "0 2px 4px" }}>Escolha um bairro</div>
                  {MP_BAIRROS.map((b) => (
                    <button key={b.id} onClick={() => setSelected(b.id)} style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", border: `1px solid ${pal.g300}`, background: "#fff", borderRadius: 13, padding: "13px 15px", cursor: "pointer", textAlign: "left", fontFamily: "var(--font-body)" }}>
                      <span style={{ width: 36, height: 36, flexShrink: 0, borderRadius: 9, background: pal.lilac2, display: "grid", placeItems: "center" }}><Ic n="map-pin" s={18} c={pal.primary} /></span>
                      <div style={{ flex: 1 }}><div style={{ fontWeight: 700, fontSize: 14, color: pal.ink }}>{b.nome}</div><div style={{ fontSize: 12, color: pal.g500 }}>{b.count} anúncios · {b.tempoMedio}</div></div>
                      <Ic n="chevron-right" s={17} c={pal.g300} />
                    </button>
                  ))}
                </div>
              )
          )}
        </div>
      ) : (
        <div style={{ flex: 1, position: "relative", minHeight: 0 }}>
          {loading ? (
            <div style={{ position: "absolute", inset: 0, background: "#EBEEF1", display: "grid", placeItems: "center" }}>
              <div style={{ textAlign: "center", color: pal.g500 }}><div className="sk" style={{ width: 54, height: 54, borderRadius: "50%", margin: "0 auto 12px" }} /><div style={{ fontSize: 13 }}>Carregando o mapa…</div></div>
            </div>
          ) : (
            <React.Fragment>
              <MapCanvas view={view} showDemand={showDemand} activeStages={activeStages} selected={selected} onSelect={onSelect} demandSet={demandSet}
                onCluster={(b: any) => setListing(b)} onPin={() => fire("Captação · veja no funil", "crosshair")} />
              <div className="hide-scroll" style={{ position: "absolute", top: 18, left: 18, bottom: 18, width: 300, overflowY: "auto", zIndex: 40 }}>
                <PanelCard>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: pal.ink, marginBottom: 16 }}>{view === "Anúncios" ? "Busque por anúncios" : "Minhas captações"}</div>
                  {leftPanel}
                </PanelCard>
              </div>
              {view === "Anúncios" && selBairro && (
                <div className="hide-scroll" style={{ position: "absolute", top: 18, right: 18, bottom: 18, width: 330, overflowY: "auto", zIndex: 40 }}>
                  <PanelCard><RegionPanel bairro={selBairro} showDemand={showDemand} setShowDemand={setShowDemand} onVerImoveis={() => setShowList(true)} onClose={() => setSelected(null)} onToast={fire} /></PanelCard>
                </div>
              )}
              {listing && <ListingCard bairro={listing} onClose={() => setListing(null)} onVerImoveis={() => { setShowList(true); setListing(null); }} onCaptar={captar} />}
            </React.Fragment>
          )}
          {showList && selBairro && <ResultsList bairro={selBairro} onClose={() => setShowList(false)} onCaptar={captar} onToast={fire} />}
        </div>
      )}
      {isMobile && mobilePanel === "filters" && (
        <div style={{ position: "fixed", inset: 0, zIndex: 8000, background: "#fff", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", borderBottom: `1px solid ${pal.g300}` }}>
            <button onClick={() => setMobilePanel(null)} style={{ width: 36, height: 36, borderRadius: 10, border: "none", background: pal.g100, display: "grid", placeItems: "center", cursor: "pointer" }}><Ic n="arrow-left" s={19} c={pal.ink} /></button>
            <span style={{ fontWeight: 700, fontSize: 15, color: pal.ink }}>Filtros</span>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: 18 }}>{leftPanel}</div>
        </div>
      )}
      {isMobile && showList && selBairro && <ResultsList bairro={selBairro} isMobile onClose={() => setShowList(false)} onCaptar={captar} onToast={fire} />}
      <Toast toast={toast} />
    </React.Fragment>
  );

  return (
    <CorretorChrome
      title="Radar"
      subtitle="Inteligência de mercado — anúncios e captação."
      searchPlaceholder="Buscar imóvel, bairro ou tipo"
      radar="Mapa"
      radarRight={<RadarCredits />}
    >
      <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
        {content}
      </div>
    </CorretorChrome>
  );
}
