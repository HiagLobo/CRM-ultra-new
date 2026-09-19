"use client";
import * as React from "react";
import Link from "next/link";
import SiteNavbar from "@/components/site/SiteNavbar";
import { SiteFooter } from "@/components/site/SiteComponents";
import { palette as sitePalette } from "@/lib/palette";
import { Ic } from "@/components/Icon";
import { fotoImovel } from "@/mock-data/fotos";

/* ============================================================
   COMPARAR — site de exemplo (demo)
   Side-by-side property comparison. Persistent (localStorage),
   shared with the Favoritos page ("Comparar agora" sends the
   selection here). Glass hero + best-criterion highlights.
   ============================================================ */

const CMP_KEY = "crm_compare_v1";
const IMG = fotoImovel;
const MAX = 4;

interface CmpItem {
  code: string; price: string; priceNum: number; title: string; location: string;
  beds: number; suites: number; baths: number; area: number; vagas: number;
  tipo: string; kind: string; financia: string; img: number;
}

const CMP_SEED: CmpItem[] = [
  { code: "48213", price: "R$ 850.000", priceNum: 850000, title: "Cobertura com vista, 3 suítes", location: "Pinheiros, São Paulo", beds: 3, suites: 3, baths: 4, area: 185, vagas: 2, tipo: "Cobertura", kind: "Comprar", financia: "Sim", img: 1 },
  { code: "47865", price: "R$ 690.000", priceNum: 690000, title: "Apartamento com varanda gourmet", location: "Moema, São Paulo", beds: 2, suites: 1, baths: 2, area: 92, vagas: 2, tipo: "Apartamento", kind: "Comprar", financia: "Sim", img: 6 },
  { code: "48087", price: "R$ 1.250.000", priceNum: 1250000, title: "Casa com quintal e piscina", location: "Cotia, São Paulo", beds: 4, suites: 2, baths: 3, area: 240, vagas: 4, tipo: "Casa", kind: "Comprar", financia: "Não", img: 3 },
];

function loadCompare(): CmpItem[] {
  try {
    const raw = localStorage.getItem(CMP_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  try { localStorage.setItem(CMP_KEY, JSON.stringify(CMP_SEED)); } catch { /* ignore */ }
  return CMP_SEED;
}
function saveCompare(list: CmpItem[]) {
  try { localStorage.setItem(CMP_KEY, JSON.stringify(list)); } catch { /* ignore */ }
}

/* ---------------- COMPARISON ROWS ---------------- */
interface Row {
  label: string;
  get: (p: CmpItem) => string | number;
  num?: (p: CmpItem) => number;
  best?: "min" | "max";
  strong?: boolean;
}
const ROWS: Row[] = [
  { label: "Preço", get: (p) => p.price, num: (p) => p.priceNum, best: "min", strong: true },
  { label: "Localização", get: (p) => p.location },
  { label: "Tipo de imóvel", get: (p) => p.tipo },
  { label: "Finalidade", get: (p) => p.kind },
  { label: "Área privativa", get: (p) => `${p.area} m²`, num: (p) => p.area, best: "max" },
  { label: "Dormitórios", get: (p) => p.beds, num: (p) => p.beds, best: "max" },
  { label: "Suítes", get: (p) => p.suites, num: (p) => p.suites, best: "max" },
  { label: "Banheiros", get: (p) => p.baths, num: (p) => p.baths, best: "max" },
  { label: "Vagas", get: (p) => p.vagas, num: (p) => p.vagas, best: "max" },
  { label: "Aceita financiamento", get: (p) => p.financia },
];
function winnerFor(items: CmpItem[], r: Row): number | null {
  if (!r.num || !r.best || items.length < 2) return null;
  const vals = items.map(r.num);
  const w = r.best === "min" ? Math.min(...vals) : Math.max(...vals);
  if (vals.every((v) => v === w)) return null; // tie → no advantage
  return w;
}

/* page-level toast animation (from the prototype's <style>) */
const CMP_PAGE_CSS = `
  @keyframes cmpPop { from { opacity: 0; transform: translate(-50%, 14px); } to { opacity: 1; transform: translate(-50%, 0); } }
  .cmp-toast { animation: cmpPop .26s cubic-bezier(.2,.7,.3,1) both; }
  @media (prefers-reduced-motion: reduce) { .cmp-toast { animation: none !important; } }
`;

/* ============================================================
   GLASS HERO SCENE
   ============================================================ */
const CMP_HERO_CSS = `
  .cmph-band { position:relative; color:#fff; overflow:hidden; background:
      radial-gradient(120% 140% at 12% 0%, #4338CA 0%, #312E81 46%, #2C103F 100%); }
  .cmph-grain { position:absolute; inset:0; opacity:.5;
      background: radial-gradient(58% 120% at 16% 26%, rgba(146,82,184,.5), transparent 60%); }
  .cmph-wrap { position:relative; z-index:3; max-width:1240px; margin:0 auto; padding:48px 32px 52px;
      display:grid; grid-template-columns:.95fr 1.05fr; align-items:center; gap:40px; }

  .cmph-scene { position:relative; height:320px; min-width:0; order:2; }
  .cmph-glow { position:absolute; border-radius:50%; filter:blur(38px); pointer-events:none; }
  .cmph-glow-a { width:280px; height:280px; top:8%; left:12%;
      background:radial-gradient(closest-side, rgba(178,120,214,.5), transparent 72%); animation:cmphGlow 9s ease-in-out infinite; }
  .cmph-glow-b { width:200px; height:200px; bottom:0; right:14%;
      background:radial-gradient(closest-side, rgba(120,70,168,.5), transparent 72%); animation:cmphGlow 11s ease-in-out infinite reverse; }
  .cmph-net { position:absolute; inset:0; width:100%; height:100%; opacity:.45; z-index:1; }

  .cmph-card { position:absolute; width:188px; background:rgba(255,255,255,.12);
      -webkit-backdrop-filter:blur(16px); backdrop-filter:blur(16px); border:1px solid rgba(255,255,255,.3);
      border-radius:16px; padding:10px; z-index:4;
      box-shadow:0 26px 56px rgba(20,6,38,.5), inset 0 1px 0 rgba(255,255,255,.32); }
  .cmph-card .ph { height:96px; border-radius:10px; background-size:cover; background-position:center;
      box-shadow:inset 0 0 0 1px rgba(255,255,255,.16); }
  .cmph-card .pr { font-family:var(--font-display); font-weight:800; font-size:17px; margin-top:9px; }
  .cmph-bar { height:6px; border-radius:999px; background:rgba(255,255,255,.3); margin-top:7px; }
  .cmph-bar.t { width:60%; background:rgba(255,255,255,.2); }
  .cmph-tag { position:absolute; top:8px; left:8px; font-size:10px; font-weight:700; letter-spacing:.04em;
      padding:3px 8px; border-radius:999px; background:rgba(49,46,129,.7); -webkit-backdrop-filter:blur(4px); backdrop-filter:blur(4px); }
  .cmph-a { left:2%; top:12%; transform:rotate(-5deg); animation:cmphFloatA 7s ease-in-out infinite; }
  .cmph-b { right:2%; top:34%; transform:rotate(5deg); animation:cmphFloatB 8s ease-in-out infinite; }

  .cmph-badge { position:absolute; left:50%; top:42%; transform:translate(-50%,-50%); z-index:6;
      width:72px; height:72px; border-radius:50%; display:grid; place-items:center;
      background:linear-gradient(135deg, rgba(255,255,255,.25), rgba(255,255,255,.1));
      -webkit-backdrop-filter:blur(14px); backdrop-filter:blur(14px); border:1px solid rgba(255,255,255,.45);
      box-shadow:0 16px 40px rgba(20,6,38,.5), inset 0 1px 0 rgba(255,255,255,.5); }
  .cmph-badge::after { content:''; position:absolute; inset:0; border-radius:50%;
      border:2px solid rgba(255,255,255,.7); animation:cmphRing 2.6s ease-out infinite; }
  .cmph-badge svg { animation:cmphTilt 4s ease-in-out infinite; }

  .cmph-chip { position:absolute; z-index:7; display:flex; align-items:center; gap:9px; white-space:nowrap;
      background:rgba(255,255,255,.14); -webkit-backdrop-filter:blur(14px); backdrop-filter:blur(14px);
      border:1px solid rgba(255,255,255,.3); border-radius:13px; padding:9px 13px; color:#fff;
      font-size:12.5px; font-weight:600; box-shadow:0 14px 32px rgba(20,6,38,.4); }
  .cmph-ico { width:26px; height:26px; border-radius:8px; display:grid; place-items:center; flex:0 0 auto; }
  .cmph-chip-a { top:0; left:30%; animation:cmphFloatC 6.5s ease-in-out infinite; }
  .cmph-chip-b { bottom:6%; left:16%; animation:cmphFloatC 8s ease-in-out 1s infinite; }

  @keyframes cmphFloatA { 0%,100%{ transform:rotate(-5deg) translateY(0); } 50%{ transform:rotate(-5deg) translateY(-12px); } }
  @keyframes cmphFloatB { 0%,100%{ transform:rotate(5deg) translateY(0); } 50%{ transform:rotate(5deg) translateY(12px); } }
  @keyframes cmphFloatC { 0%,100%{ transform:translateY(0); } 50%{ transform:translateY(-9px); } }
  @keyframes cmphGlow { 0%,100%{ transform:scale(1); opacity:.85; } 50%{ transform:scale(1.12); opacity:1; } }
  @keyframes cmphRing { 0%{ transform:scale(1); opacity:.7; } 100%{ transform:scale(1.7); opacity:0; } }
  @keyframes cmphTilt { 0%,100%{ transform:rotate(0deg); } 50%{ transform:rotate(-12deg); } }

  @media (max-width: 760px) {
    .cmph-wrap { grid-template-columns:1fr; }
    .cmph-scene { display:none; }
  }
  @media (prefers-reduced-motion: reduce) {
    .cmph-card,.cmph-glow-a,.cmph-glow-b,.cmph-badge::after,.cmph-badge svg,.cmph-chip-a,.cmph-chip-b { animation:none !important; }
  }
`;

function CmpHeroScene() {
  return (
    <div className="cmph-scene" aria-hidden="true">
      <div className="cmph-glow cmph-glow-a" />
      <div className="cmph-glow cmph-glow-b" />
      <svg className="cmph-net" viewBox="0 0 400 320" preserveAspectRatio="none">
        <line x1="110" y1="120" x2="200" y2="150" stroke="rgba(255,255,255,.4)" strokeWidth="1" strokeDasharray="3 6" />
        <line x1="300" y1="170" x2="205" y2="155" stroke="rgba(255,255,255,.4)" strokeWidth="1" strokeDasharray="3 6" />
        {[[110, 120], [300, 170]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="3" fill="#fff" opacity=".8" />)}
      </svg>

      <div className="cmph-card cmph-a">
        <div className="ph" style={{ backgroundImage: `url('${IMG(1)}')` }}><span className="cmph-tag">IMÓVEL A</span></div>
        <div className="pr">R$ 850.000</div>
        <div className="cmph-bar" /><div className="cmph-bar t" />
      </div>
      <div className="cmph-card cmph-b">
        <div className="ph" style={{ backgroundImage: `url('${IMG(6)}')` }}><span className="cmph-tag">IMÓVEL B</span></div>
        <div className="pr">R$ 690.000</div>
        <div className="cmph-bar" /><div className="cmph-bar t" />
      </div>

      <div className="cmph-badge"><Ic n="git-compare" s={30} c="#fff" /></div>

      <div className="cmph-chip cmph-chip-a">
        <span className="cmph-ico" style={{ background: "rgba(46,158,91,.85)" }}><Ic n="badge-check" s={15} c="#fff" /></span>
        Melhor preço
      </div>
      <div className="cmph-chip cmph-chip-b">
        <span className="cmph-ico" style={{ background: "rgba(255,255,255,.2)" }}><Ic n="scale" s={15} c="#fff" /></span>
        Lado a lado
      </div>
    </div>
  );
}

/* ---------------- PAGE HEADER ---------------- */
function CmpHeader({ count }: { count: number }) {
  return (
    <section className="cmph-band">
      <style>{CMP_HERO_CSS}</style>
      <div aria-hidden="true" className="cmph-grain" />
      <div className="cmph-wrap ds-pad">
        <div style={{ minWidth: 0, order: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "rgba(255,255,255,.7)", marginBottom: 16 }}>
            <Link href="/demo/portal" style={{ color: "rgba(255,255,255,.7)", textDecoration: "none" }}>Home</Link>
            <Ic n="chevron-right" s={14} c="rgba(255,255,255,.5)" />
            <span style={{ color: "#fff", fontWeight: 600 }}>Comparar</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(255,255,255,.12)", display: "grid", placeItems: "center", border: "1px solid rgba(255,255,255,.22)" }}>
              <Ic n="git-compare" s={26} c="#fff" />
            </span>
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(30px, 5vw, 44px)", letterSpacing: "-.02em", margin: 0, lineHeight: 1.1 }}>Comparar imóveis</h1>
          </div>
          <p style={{ fontSize: 17, lineHeight: 1.5, color: "rgba(255,255,255,.82)", marginTop: 14, maxWidth: 520 }}>
            Veja preço, área e diferenciais lado a lado. Destacamos o melhor de cada critério para você decidir com segurança.
          </p>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 20, background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.22)", borderRadius: 999, padding: "8px 16px", fontSize: 13.5, fontWeight: 600 }}>
            <Ic n="layers" s={15} c="#fff" /> {count} {count === 1 ? "imóvel selecionado" : "imóveis selecionados"}
          </div>
        </div>
        <CmpHeroScene />
      </div>
    </section>
  );
}

/* ---------------- COMPARISON TABLE ---------------- */
const CMP_TABLE_CSS = `
  .cmp-scroll { overflow-x:auto; padding-bottom:6px; }
  .cmp-grid { min-width:680px; background:#fff; border:1px solid ${sitePalette.g300}; border-radius:18px;
      overflow:hidden; box-shadow:var(--shadow-md); }
  .cmp-corner { padding:22px 20px; background:${sitePalette.lilac1}; display:flex; flex-direction:column; justify-content:flex-end; }
  .cmp-head { padding:14px; background:${sitePalette.lilac1}; border-left:1px solid ${sitePalette.g100}; position:relative; }
  .cmp-photo { height:120px; border-radius:11px; background-size:cover; background-position:center; position:relative; }
  .cmp-x { position:absolute; top:8px; right:8px; width:28px; height:28px; border:none; border-radius:50%;
      background:rgba(255,255,255,.92); cursor:pointer; display:grid; place-items:center; box-shadow:0 2px 8px rgba(0,0,0,.18); }
  .cmp-code { position:absolute; top:8px; left:8px; background:${sitePalette.primary}; color:#fff; font-size:10.5px;
      font-weight:600; padding:3px 9px; border-radius:999px; }
  .cmp-wa { display:flex; align-items:center; justify-content:center; gap:7px; height:38px; margin-top:12px;
      background:${sitePalette.primary}; color:#fff; border-radius:9px; text-decoration:none; font-weight:700; font-size:13px;
      box-shadow:var(--shadow-purple); transition:transform .18s ease, filter .2s ease; }
  .cmp-wa:hover { transform:translateY(-2px); filter:brightness(1.05); }
  .cmp-wa:active { transform:scale(.97); }
  .cmp-crit { padding:14px 20px; font-size:14px; color:${sitePalette.g700}; border-top:1px solid ${sitePalette.g100};
      display:flex; align-items:center; background:#fff; }
  .cmp-cell { padding:14px; text-align:center; font-size:14.5px; border-top:1px solid ${sitePalette.g100};
      border-left:1px solid ${sitePalette.g100}; display:flex; align-items:center; justify-content:center; gap:7px; }
  .cmp-win { background:${sitePalette.lilac2} !important; color:${sitePalette.primary}; font-weight:700; }
  .cmp-wincheck { display:inline-grid; place-items:center; width:18px; height:18px; border-radius:50%;
      background:${sitePalette.primary}; flex:0 0 auto; }
  .cmp-addcol { padding:14px; border-left:1px dashed ${sitePalette.g300}; display:grid; place-items:center; background:repeating-linear-gradient(135deg, ${sitePalette.lilac1} 0 10px, #fff 10px 20px); }
  .cmp-addbody { border-top:1px solid ${sitePalette.g100}; border-left:1px dashed ${sitePalette.g300}; background:${sitePalette.lilac1}; }
`;

function ComparisonTable({ items, canAdd, onRemove }: { items: CmpItem[]; canAdd: boolean; onRemove: (code: string) => void }) {
  const cols = items.length + (canAdd ? 1 : 0);
  const gridTemplateColumns = `minmax(170px, 210px) repeat(${cols}, minmax(190px, 1fr))`;
  const winners = ROWS.map((r) => winnerFor(items, r));

  return (
    <div className="cmp-scroll">
      <style>{CMP_TABLE_CSS}</style>
      <div className="cmp-grid" style={{ display: "grid", gridTemplateColumns }}>
        {/* corner */}
        <div className="cmp-corner">
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: sitePalette.g500 }}>Comparativo</div>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, color: sitePalette.ink, marginTop: 4 }}>{items.length} {items.length === 1 ? "imóvel" : "imóveis"}</div>
        </div>
        {/* property header cards */}
        {items.map((p) => (
          <div key={p.code} className="cmp-head">
            <div className="cmp-photo" style={{ backgroundImage: `url('${IMG(p.img)}')` }}>
              <span className="cmp-code">Cód: {p.code}</span>
              <button className="cmp-x" title="Remover da comparação" onClick={() => onRemove(p.code)}><Ic n="x" s={15} c={sitePalette.g700} /></button>
            </div>
            <div style={{ fontWeight: 600, fontSize: 13.5, color: sitePalette.ink, marginTop: 10, lineHeight: 1.35, minHeight: 36 }}>{p.title}</div>
            <a href="#" onClick={(e) => e.preventDefault()} className="cmp-wa"><Ic n="message-circle" s={16} c="#fff" /> WhatsApp</a>
          </div>
        ))}
        {canAdd && (
          <Link href="/demo/favoritos" className="cmp-addcol" style={{ textDecoration: "none" }}>
            <div style={{ textAlign: "center", color: sitePalette.primary }}>
              <div style={{ width: 46, height: 46, borderRadius: "50%", background: "#fff", border: `1.5px solid ${sitePalette.g300}`, display: "grid", placeItems: "center", margin: "0 auto 10px" }}>
                <Ic n="plus" s={22} c={sitePalette.primary} />
              </div>
              <div style={{ fontWeight: 700, fontSize: 13.5 }}>Adicionar imóvel</div>
              <div style={{ fontSize: 12, color: sitePalette.g500, marginTop: 2 }}>dos favoritos</div>
            </div>
          </Link>
        )}

        {/* criteria rows */}
        {ROWS.map((r, ri) => (
          <React.Fragment key={r.label}>
            <div className="cmp-crit" style={ri % 2 ? { background: sitePalette.page } : undefined}>{r.label}</div>
            {items.map((p) => {
              const isWin = winners[ri] != null && !!r.num && r.num(p) === winners[ri];
              return (
                <div key={p.code} className={`cmp-cell ${isWin ? "cmp-win" : ""}`} style={{
                  background: isWin ? sitePalette.lilac2 : (ri % 2 ? sitePalette.page : "#fff"),
                  color: isWin ? sitePalette.primary : (r.strong ? sitePalette.primary : sitePalette.ink),
                  fontWeight: isWin || r.strong ? 700 : 600,
                }}>
                  {isWin && <span className="cmp-wincheck"><Ic n="check" s={12} c="#fff" /></span>}
                  {r.get(p)}
                </div>
              );
            })}
            {canAdd && <div className="cmp-addbody" style={{ background: sitePalette.lilac1 }} />}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

/* ---------------- EMPTY STATE ---------------- */
function CmpEmpty() {
  return (
    <div style={{ background: "#fff", borderRadius: 18, border: `1px dashed ${sitePalette.g300}`, padding: "72px 32px", textAlign: "center", maxWidth: 620, margin: "0 auto" }}>
      <div style={{ width: 76, height: 76, borderRadius: "50%", background: sitePalette.lilac2, display: "grid", placeItems: "center", margin: "0 auto 22px" }}>
        <Ic n="git-compare" s={34} c={sitePalette.primary} />
      </div>
      <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 24, color: sitePalette.ink }}>Nada para comparar ainda</div>
      <p style={{ fontSize: 15.5, color: sitePalette.g700, lineHeight: 1.55, maxWidth: 460, margin: "10px auto 0" }}>
        Selecione imóveis nos seus favoritos e toque em &quot;Comparar agora&quot; para vê-los lado a lado aqui.
      </p>
      <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginTop: 26 }}>
        <Link href="/demo/favoritos" className="ds-btnpop" style={{ display: "inline-flex", alignItems: "center", gap: 9, background: sitePalette.primary, color: "#fff", borderRadius: 999, padding: "14px 28px", textDecoration: "none", fontWeight: 700, fontSize: 15, boxShadow: "var(--shadow-purple)" }}>
          <Ic n="heart" s={18} c="#fff" /> Ver favoritos
        </Link>
        <Link href="/demo/buscar" style={{ display: "inline-flex", alignItems: "center", gap: 9, background: "#fff", color: sitePalette.primary, border: `1.5px solid ${sitePalette.g300}`, borderRadius: 999, padding: "14px 28px", textDecoration: "none", fontWeight: 700, fontSize: 15 }}>
          <Ic n="search" s={18} c={sitePalette.primary} /> Buscar imóveis
        </Link>
      </div>
    </div>
  );
}

/* ---------------- TOAST ---------------- */
function CmpToast({ toast, onUndo, onClose }: { toast: { code: string } | null; onUndo: () => void; onClose: () => void }) {
  if (!toast) return null;
  return (
    <div className="cmp-toast" style={{
      position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", zIndex: 300,
      display: "flex", alignItems: "center", gap: 14, background: "#fff", borderLeft: `4px solid ${sitePalette.primary}`,
      borderRadius: 10, boxShadow: "0 16px 40px rgba(20,6,38,.28)", padding: "14px 18px", minWidth: 320,
    }}>
      <Ic n="git-compare" s={20} c={sitePalette.primary} />
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: 14, color: sitePalette.ink }}>Imóvel retirado da comparação</div>
        <div style={{ fontSize: 12.5, color: sitePalette.g500 }}>Cód: {toast.code}</div>
      </div>
      <button onClick={onUndo} style={{ border: "none", background: "transparent", color: sitePalette.primary, fontWeight: 700, fontSize: 13.5, cursor: "pointer", fontFamily: "var(--font-body)" }}>Desfazer</button>
      <button onClick={onClose} aria-label="Fechar" style={{ border: "none", background: "transparent", cursor: "pointer", display: "grid", placeItems: "center" }}><Ic n="x" s={16} c={sitePalette.g500} /></button>
    </div>
  );
}

/* ---------------- PAGE ---------------- */
export default function CompararPage() {
  const [items, setItems] = React.useState<CmpItem[]>([]);
  const [loaded, setLoaded] = React.useState(false);
  const [toast, setToast] = React.useState<{ code: string } | null>(null);
  const lastRemoved = React.useRef<{ item: CmpItem; idx: number } | null>(null);
  const toastTimer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  React.useEffect(() => { setItems(loadCompare()); setLoaded(true); }, []);
  React.useEffect(() => { if (loaded) saveCompare(items); }, [items, loaded]);

  const remove = (code: string) => {
    const idx = items.findIndex((f) => f.code === code);
    if (idx >= 0) lastRemoved.current = { item: items[idx], idx };
    setItems(items.filter((f) => f.code !== code));
    setToast({ code });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 5000);
  };
  const undo = () => {
    const lr = lastRemoved.current;
    if (lr) { setItems((cur) => { const next = [...cur]; next.splice(lr.idx, 0, lr.item); return next; }); lastRemoved.current = null; }
    setToast(null);
  };

  return (
    <div>
      <style>{CMP_PAGE_CSS}</style>
      <SiteNavbar current="" />
      <CmpHeader count={items.length} />

      <main className="ds-pad" style={{ maxWidth: 1240, margin: "0 auto", padding: "40px 32px 72px", minHeight: 320 }}>
        {!loaded ? null : items.length === 0 ? <CmpEmpty /> : (
          <React.Fragment>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: sitePalette.lilac2, color: sitePalette.primary, borderRadius: 999, padding: "7px 14px", fontSize: 13, fontWeight: 600 }}>
                <Ic n="badge-check" s={15} c={sitePalette.primary} /> Melhor valor destacado em cada linha
              </div>
              <Link href="/demo/favoritos" style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 7, color: sitePalette.primary, fontWeight: 600, fontSize: 14, textDecoration: "none" }}>
                <Ic n="arrow-left" s={16} c={sitePalette.primary} /> Voltar aos favoritos
              </Link>
            </div>
            <ComparisonTable items={items} canAdd={items.length < MAX} onRemove={remove} />
          </React.Fragment>
        )}
      </main>

      <SiteFooter />
      <CmpToast toast={toast} onUndo={undo} onClose={() => setToast(null)} />
    </div>
  );
}
