"use client";
import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SiteNavbar from "@/components/site/SiteNavbar";
import { SiteFooter } from "@/components/site/SiteComponents";
import { palette as sitePalette } from "@/lib/palette";
import { Ic } from "@/components/Icon";
import { fotoImovel } from "@/mock-data/fotos";

/* ============================================================
   FAVORITOS — site de exemplo (demo)
   Persistent favorites (localStorage), sort, compare, remove,
   WhatsApp, empty state. Reuses the standard site navbar/footer
   and the design-system property-card visual language.
   ============================================================ */

const LS_KEY = "crm_favorites_v1";
const IMG = (n: number) => `url('${fotoImovel(n)}') center/cover no-repeat`;

interface FavItem {
  code: string; price: string; priceNum: number; title: string; location: string;
  beds: number; baths: number; area: number; vagas: number; tipo: string;
  kind: string; tag?: string; img: number; addedAt?: number;
}

/* Seed data — pre-filled example favorites (mix of venda / aluguel). */
const SEED: FavItem[] = [
  { code: "48213", price: "R$ 850.000", priceNum: 850000, title: "Cobertura com vista, 3 suítes", location: "Pinheiros, São Paulo", beds: 3, baths: 4, area: 185, vagas: 2, tipo: "Cobertura", kind: "Comprar", tag: "Destaque", img: 1 },
  { code: "47865", price: "R$ 690.000", priceNum: 690000, title: "Apartamento com varanda gourmet", location: "Moema, São Paulo", beds: 2, baths: 2, area: 92, vagas: 2, tipo: "Apartamento", kind: "Comprar", tag: "Destaque", img: 6 },
  { code: "48087", price: "R$ 1.250.000", priceNum: 1250000, title: "Casa com quintal e piscina", location: "Cotia, São Paulo", beds: 4, baths: 3, area: 240, vagas: 4, tipo: "Casa", kind: "Comprar", img: 3 },
  { code: "51188", price: "R$ 5.800/mês", priceNum: 5800, title: "Casa em condomínio com quintal", location: "Morumbi, São Paulo", beds: 3, baths: 3, area: 180, vagas: 2, tipo: "Casa", kind: "Alugar", tag: "Aluguel", img: 11 },
  { code: "47980", price: "R$ 420.000", priceNum: 420000, title: "Studio mobiliado no centro", location: "República, São Paulo", beds: 1, baths: 1, area: 38, vagas: 0, tipo: "Studio", kind: "Comprar", img: 4 },
];

function loadFavs(): FavItem[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  const seeded = SEED.map((p, i) => ({ ...p, addedAt: Date.now() - i * 86400000 }));
  try { localStorage.setItem(LS_KEY, JSON.stringify(seeded)); } catch { /* ignore */ }
  return seeded;
}
function saveFavs(list: FavItem[]) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(list)); } catch { /* ignore */ }
}

/* page-level animations (from the prototype's <style>) */
const FAV_PAGE_CSS = `
  .fav-iconbtn:hover { border-color: var(--purple-primary) !important; }
  .fav-heartbtn:active { transform: scale(.9); }
  .fav-cmpbtn:active { transform: scale(.97); }
  @keyframes favPop { from { opacity: 0; transform: translate(-50%, 14px); } to { opacity: 1; transform: translate(-50%, 0); } }
  .fav-toast, .fav-comparebar { animation: favPop .26s cubic-bezier(.2,.7,.3,1) both; }
  @keyframes favFade { from { opacity: 0; } to { opacity: 1; } }
  .fav-overlay { animation: favFade .2s ease both; }
  @keyframes favRise { from { opacity: 0; transform: translateY(10px) scale(.98); } to { opacity: 1; transform: none; } }
  .fav-modal { animation: favRise .28s cubic-bezier(.2,.7,.3,1) both; }
  @media (prefers-reduced-motion: reduce) { .fav-toast, .fav-comparebar, .fav-overlay, .fav-modal { animation: none !important; } }
`;

/* ---------------- FAVORITE CARD ---------------- */
function FavoriteCard({ p, layout, selected, onRemove, onToggleCompare }: {
  p: FavItem; layout: "grid" | "list"; selected: boolean;
  onRemove: (code: string) => void; onToggleCompare: (code: string) => void;
}) {
  const horiz = layout === "list";
  const Heart = (
    <button onClick={() => onRemove(p.code)} title="Remover dos favoritos" aria-label="Remover dos favoritos"
      className="fav-heartbtn" style={{
        position: "absolute", top: 12, right: 12, width: 36, height: 36, border: "none", zIndex: 3,
        background: "#fff", borderRadius: "50%", display: "grid", placeItems: "center", cursor: "pointer",
        boxShadow: "0 2px 8px rgba(0,0,0,.16)",
      }}>
      <Ic n="heart" s={19} c={sitePalette.primary} style={{ fill: sitePalette.primary }} />
    </button>
  );

  const Gallery = (
    <div className="ds-gallery" style={horiz ? { height: "auto", minHeight: 200, flex: "0 0 38%", alignSelf: "stretch" } : undefined}>
      {horiz ? (
        <div style={{ position: "absolute", inset: 0, background: IMG(p.img), backgroundSize: "cover" }} />
      ) : (
        <div className="ds-track">
          <div className="ds-slide" style={{ background: IMG(p.img) }} />
        </div>
      )}
      <span style={{ position: "absolute", top: 12, left: 12, background: sitePalette.primary, color: "#fff", fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 999, zIndex: 3 }}>Cód: {p.code}</span>
      {Heart}
      {p.tag && <span style={{ position: "absolute", bottom: 12, left: 12, background: p.tag === "Destaque" ? sitePalette.primary : "#fff", color: p.tag === "Destaque" ? "#fff" : sitePalette.ink, fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 999, zIndex: 3 }}>{p.tag}</span>}
    </div>
  );

  const specsRow = (
    <div style={{ display: "flex", gap: 16, color: sitePalette.g700, fontSize: 13, marginTop: 12, paddingTop: 12, borderTop: `1px solid ${sitePalette.g100}` }}>
      <span style={{ display: "flex", alignItems: "center", gap: 5 }}><Ic n="bed-double" s={15} /> {p.beds}</span>
      <span style={{ display: "flex", alignItems: "center", gap: 5 }}><Ic n="bath" s={15} /> {p.baths}</span>
      <span style={{ display: "flex", alignItems: "center", gap: 5 }}><Ic n="ruler" s={15} /> {p.area} m²</span>
      <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 5, color: sitePalette.g500 }}><Ic n="tag" s={14} /> {p.kind}</span>
    </div>
  );

  const actions = (
    <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
      <button onClick={() => onToggleCompare(p.code)} className="fav-cmpbtn" title="Selecionar para comparar" style={{
        display: "flex", alignItems: "center", gap: 7, cursor: "pointer", flexShrink: 0,
        border: `1.5px solid ${selected ? sitePalette.primary : sitePalette.g300}`,
        background: selected ? sitePalette.lilac2 : "#fff", borderRadius: 10, padding: "0 14px", height: 42,
        fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13.5,
        color: selected ? sitePalette.primary : sitePalette.g700,
      }}>
        <Ic n={selected ? "check-circle-2" : "git-compare"} s={16} c={selected ? sitePalette.primary : sitePalette.g500} />
        {selected ? "Selecionado" : "Comparar"}
      </button>
      <a href="#" onClick={(e) => e.preventDefault()} className="ds-btnpop" style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, height: 42,
        background: sitePalette.primary, color: "#fff", borderRadius: 10, textDecoration: "none",
        fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 13.5, boxShadow: "var(--shadow-purple)",
      }}>
        <Ic n="message-circle" s={17} c="#fff" /> Falar no WhatsApp
      </a>
    </div>
  );

  const info = (
    <div style={{ padding: horiz ? "20px 22px" : "14px 16px 16px", flex: horiz ? 1 : undefined, display: "flex", flexDirection: "column", justifyContent: horiz ? "center" : undefined }}>
      <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: horiz ? 24 : 21, color: sitePalette.ink }}>{p.price}</div>
      <div style={{ fontWeight: 600, fontSize: horiz ? 15 : 14, color: sitePalette.ink, marginTop: 4 }}>{p.title}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 5, color: sitePalette.g500, fontSize: 13, marginTop: 4 }}>
        <Ic n="map-pin" s={14} /> {p.location}
      </div>
      {specsRow}
      {actions}
    </div>
  );

  return (
    <div className={`ds-pcard${horiz ? " ds-prow" : ""}`} style={horiz ? { display: "flex", alignItems: "stretch" } : undefined}>
      {Gallery}
      {info}
    </div>
  );
}

/* ---------------- TOAST ---------------- */
function Toast({ toast, onUndo, onClose }: { toast: { code: string } | null; onUndo: () => void; onClose: () => void }) {
  if (!toast) return null;
  return (
    <div className="fav-toast" style={{
      position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", zIndex: 300,
      display: "flex", alignItems: "center", gap: 14, background: "#fff", borderLeft: `4px solid ${sitePalette.primary}`,
      borderRadius: 10, boxShadow: "0 16px 40px rgba(20,6,38,.28)", padding: "14px 18px", minWidth: 320,
    }}>
      <Ic n="heart-off" s={20} c={sitePalette.primary} />
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: 14, color: sitePalette.ink }}>Imóvel removido dos favoritos</div>
        <div style={{ fontSize: 12.5, color: sitePalette.g500 }}>Cód: {toast.code}</div>
      </div>
      <button onClick={onUndo} style={{ border: "none", background: "transparent", color: sitePalette.primary, fontWeight: 700, fontSize: 13.5, cursor: "pointer", fontFamily: "var(--font-body)" }}>Desfazer</button>
      <button onClick={onClose} aria-label="Fechar" style={{ border: "none", background: "transparent", cursor: "pointer", display: "grid", placeItems: "center" }}><Ic n="x" s={16} c={sitePalette.g500} /></button>
    </div>
  );
}

/* ---------------- EMPTY STATE ---------------- */
function EmptyState() {
  return (
    <div style={{ background: "#fff", borderRadius: 18, border: `1px dashed ${sitePalette.g300}`, padding: "72px 32px", textAlign: "center", maxWidth: 620, margin: "0 auto" }}>
      <div style={{ width: 76, height: 76, borderRadius: "50%", background: sitePalette.lilac2, display: "grid", placeItems: "center", margin: "0 auto 22px" }}>
        <Ic n="heart" s={36} c={sitePalette.primary} />
      </div>
      <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 24, color: sitePalette.ink }}>Sua lista de favoritos está vazia</div>
      <p style={{ fontSize: 15.5, color: sitePalette.g700, lineHeight: 1.55, marginTop: 10, maxWidth: 440, marginLeft: "auto", marginRight: "auto" }}>
        Toque no coração dos imóveis que você gostar para salvá-los aqui e compará-los com calma, quando quiser.
      </p>
      <Link href="/demo/buscar" className="ds-btnpop" style={{
        display: "inline-flex", alignItems: "center", gap: 9, marginTop: 26, background: sitePalette.primary,
        color: "#fff", borderRadius: 999, padding: "15px 32px", textDecoration: "none", fontWeight: 700, fontSize: 15.5,
        boxShadow: "var(--shadow-purple)",
      }}>
        <Ic n="search" s={18} c="#fff" /> Buscar imóveis
      </Link>
    </div>
  );
}

/* ---------------- GLASSMORPHISM HERO SCENE ---------------- */
const FAVH_CSS = `
  .favh-band { position:relative; background:
      radial-gradient(120% 140% at 88% 0%, #4338CA 0%, #312E81 46%, #2C103F 100%); color:#fff; overflow:hidden; }
  .favh-grain { position:absolute; inset:0; opacity:.5;
      background: radial-gradient(60% 120% at 84% 28%, rgba(146,82,184,.55), transparent 60%); }
  .favh-wrap { position:relative; z-index:3; max-width:1240px; margin:0 auto; padding:48px 32px 52px;
      display:grid; grid-template-columns:1.05fr .95fr; align-items:center; gap:40px; }

  .favh-scene { position:relative; height:330px; min-width:0; }
  .favh-glow { position:absolute; border-radius:50%; filter:blur(36px); pointer-events:none; }
  .favh-glow-a { width:300px; height:300px; top:6%; left:24%;
      background:radial-gradient(closest-side, rgba(178,120,214,.55), transparent 72%); animation:favhGlow 9s ease-in-out infinite; }
  .favh-glow-b { width:200px; height:200px; bottom:0; right:8%;
      background:radial-gradient(closest-side, rgba(120,70,168,.5), transparent 72%); animation:favhGlow 11s ease-in-out infinite reverse; }
  .favh-net { position:absolute; inset:0; width:100%; height:100%; opacity:.5; z-index:1; }

  .favh-card { position:absolute; top:50%; left:50%; width:264px; transform:translate(-58%,-50%);
      background:rgba(255,255,255,.12); -webkit-backdrop-filter:blur(16px); backdrop-filter:blur(16px);
      border:1px solid rgba(255,255,255,.3); border-radius:18px; padding:12px;
      box-shadow:0 28px 60px rgba(20,6,38,.5), inset 0 1px 0 rgba(255,255,255,.35); z-index:4;
      animation:favhFloat 7s ease-in-out infinite; }
  .favh-photo { position:relative; height:128px; border-radius:11px; background-size:cover; background-position:center;
      box-shadow:inset 0 0 0 1px rgba(255,255,255,.18); }
  .favh-code { position:absolute; top:9px; left:9px; background:rgba(49,46,129,.72); -webkit-backdrop-filter:blur(4px);
      backdrop-filter:blur(4px); color:#fff; font-size:10.5px; font-weight:600; padding:3px 9px; border-radius:999px; }
  .favh-heart { position:absolute; top:8px; right:8px; width:34px; height:34px; border-radius:50%;
      background:rgba(255,255,255,.92); display:grid; place-items:center; box-shadow:0 4px 12px rgba(20,6,38,.3); }
  .favh-heart svg { animation:favhBeat 1.9s ease-in-out infinite; transform-origin:center; }
  .favh-heart::after { content:''; position:absolute; inset:0; border-radius:50%;
      border:2px solid rgba(255,255,255,.85); animation:favhRing 2.4s ease-out infinite; }
  .favh-body { padding:13px 6px 6px; }
  .favh-price { font-family:var(--font-display); font-weight:800; font-size:22px; color:#fff; letter-spacing:-.01em; }
  .favh-bar { height:7px; border-radius:999px; background:rgba(255,255,255,.32); margin-top:9px; }
  .favh-bar.s { width:78%; } .favh-bar.t { width:52%; background:rgba(255,255,255,.22); }
  .favh-specs { display:flex; gap:14px; margin-top:13px; padding-top:11px; border-top:1px solid rgba(255,255,255,.18);
      font-size:12.5px; font-weight:600; color:rgba(255,255,255,.9); }
  .favh-specs span { display:flex; align-items:center; gap:5px; }

  .favh-chip { position:absolute; z-index:5; display:flex; align-items:center; gap:9px; white-space:nowrap;
      background:rgba(255,255,255,.14); -webkit-backdrop-filter:blur(14px); backdrop-filter:blur(14px);
      border:1px solid rgba(255,255,255,.3); border-radius:13px; padding:9px 13px; color:#fff;
      font-size:12.5px; font-weight:600; box-shadow:0 14px 32px rgba(20,6,38,.4); }
  .favh-chip svg { flex:0 0 auto; }
  .favh-chip-a { top:2%; right:6%; animation:favhFloatB 6s ease-in-out infinite; }
  .favh-chip-b { bottom:6%; left:0; animation:favhFloatC 7.5s ease-in-out infinite; }
  .favh-chip-c { bottom:24%; right:2%; animation:favhFloatB 8s ease-in-out .8s infinite; }
  .favh-ico { width:26px; height:26px; border-radius:8px; display:grid; place-items:center; flex:0 0 auto; }

  .favh-mini { position:absolute; bottom:-8px; opacity:0; z-index:2; animation:favhRise linear infinite; }

  @keyframes favhFloat { 0%,100%{ transform:translate(-58%,-50%); } 50%{ transform:translate(-58%,calc(-50% - 13px)); } }
  @keyframes favhFloatB { 0%,100%{ transform:translateY(0); } 50%{ transform:translateY(-12px); } }
  @keyframes favhFloatC { 0%,100%{ transform:translateY(0); } 50%{ transform:translateY(11px); } }
  @keyframes favhGlow { 0%,100%{ transform:scale(1); opacity:.85; } 50%{ transform:scale(1.12); opacity:1; } }
  @keyframes favhBeat { 0%,100%{ transform:scale(1); } 14%{ transform:scale(1.22); } 28%{ transform:scale(1); } 42%{ transform:scale(1.15); } 56%{ transform:scale(1); } }
  @keyframes favhRing { 0%{ transform:scale(1); opacity:.7; } 100%{ transform:scale(1.8); opacity:0; } }
  @keyframes favhRise { 0%{ transform:translateY(0) scale(.6) rotate(0deg); opacity:0; } 12%{ opacity:.85; } 100%{ transform:translateY(-300px) scale(1) rotate(18deg); opacity:0; } }

  @media (max-width: 760px) {
    .favh-wrap { grid-template-columns:1fr; }
    .favh-scene { display:none; }
  }
  @media (prefers-reduced-motion: reduce) {
    .favh-card,.favh-chip-a,.favh-chip-b,.favh-chip-c,.favh-glow-a,.favh-glow-b,.favh-heart svg,.favh-heart::after,.favh-mini { animation:none !important; }
    .favh-mini { display:none; }
  }
`;

function FavGlassScene() {
  const minis = [
    { left: "14%", size: 14, dur: 9, delay: 0 },
    { left: "40%", size: 10, dur: 11, delay: 2.4 },
    { left: "66%", size: 16, dur: 8.5, delay: 1.2 },
    { left: "86%", size: 11, dur: 10, delay: 3.6 },
    { left: "54%", size: 12, dur: 12, delay: 5 },
  ];
  return (
    <div className="favh-scene" aria-hidden="true">
      <div className="favh-glow favh-glow-a" />
      <div className="favh-glow favh-glow-b" />

      <svg className="favh-net" viewBox="0 0 400 330" preserveAspectRatio="none">
        <line x1="70" y1="50" x2="200" y2="160" stroke="rgba(255,255,255,.4)" strokeWidth="1" strokeDasharray="3 6" />
        <line x1="350" y1="40" x2="210" y2="160" stroke="rgba(255,255,255,.4)" strokeWidth="1" strokeDasharray="3 6" />
        <line x1="40" y1="290" x2="190" y2="180" stroke="rgba(255,255,255,.4)" strokeWidth="1" strokeDasharray="3 6" />
        {[[70, 50], [350, 40], [40, 290]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="3" fill="#fff" opacity=".8" />)}
      </svg>

      {minis.map((m, i) => (
        <span key={i} className="favh-mini" style={{ left: m.left, animationDuration: `${m.dur}s`, animationDelay: `${m.delay}s` }}>
          <Ic n="heart" s={m.size} c="rgba(255,255,255,.55)" style={{ fill: "rgba(255,255,255,.4)" }} />
        </span>
      ))}

      {/* main glass property card */}
      <div className="favh-card">
        <div className="favh-photo" style={{ backgroundImage: `url('${fotoImovel(1)}')` }}>
          <span className="favh-code">Cód: 48213</span>
          <span className="favh-heart"><Ic n="heart" s={18} c={sitePalette.primary} style={{ fill: sitePalette.primary }} /></span>
        </div>
        <div className="favh-body">
          <div className="favh-price">R$ 850.000</div>
          <div className="favh-bar s" />
          <div className="favh-bar t" />
          <div className="favh-specs">
            <span><Ic n="bed-double" s={14} c="rgba(255,255,255,.9)" /> 3</span>
            <span><Ic n="bath" s={14} c="rgba(255,255,255,.9)" /> 4</span>
            <span><Ic n="ruler" s={14} c="rgba(255,255,255,.9)" /> 185 m²</span>
          </div>
        </div>
      </div>

      {/* orbiting chips */}
      <div className="favh-chip favh-chip-a">
        <span className="favh-ico" style={{ background: "rgba(255,255,255,.2)" }}><Ic n="bookmark-check" s={15} c="#fff" /></span>
        Imóvel salvo
      </div>
      <div className="favh-chip favh-chip-b">
        <span className="favh-ico" style={{ background: "rgba(46,158,91,.85)" }}><Ic n="shield-check" s={15} c="#fff" /></span>
        100% verificado
      </div>
      <div className="favh-chip favh-chip-c">
        <Ic n="git-compare" s={16} c="#fff" /> Comparar
      </div>
    </div>
  );
}

/* ---------------- PAGE HEADER BAND ---------------- */
function FavHeader({ count }: { count: number }) {
  return (
    <section className="favh-band">
      <style>{FAVH_CSS}</style>
      <div aria-hidden="true" className="favh-grain" />
      <div className="favh-wrap ds-pad">
        <div style={{ minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "rgba(255,255,255,.7)", marginBottom: 16 }}>
            <Link href="/demo/portal" style={{ color: "rgba(255,255,255,.7)", textDecoration: "none" }}>Home</Link>
            <Ic n="chevron-right" s={14} c="rgba(255,255,255,.5)" />
            <span style={{ color: "#fff", fontWeight: 600 }}>Favoritos</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(255,255,255,.12)", display: "grid", placeItems: "center", border: "1px solid rgba(255,255,255,.22)" }}>
              <Ic n="heart" s={26} c="#fff" style={{ fill: "#fff" }} />
            </span>
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(30px, 5vw, 44px)", letterSpacing: "-.02em", margin: 0, whiteSpace: "nowrap", lineHeight: 1.1 }}>Meus favoritos</h1>
          </div>
          <p style={{ fontSize: 17, lineHeight: 1.5, color: "rgba(255,255,255,.82)", marginTop: 14, maxWidth: 520 }}>
            Os imóveis que você salvou, reunidos em um só lugar. Compare, organize e fale com um corretor quando estiver pronto.
          </p>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 20, background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.22)", borderRadius: 999, padding: "8px 16px", fontSize: 13.5, fontWeight: 600 }}>
            <Ic n="bookmark" s={15} c="#fff" /> {count} {count === 1 ? "imóvel salvo" : "imóveis salvos"}
          </div>
        </div>
        <FavGlassScene />
      </div>
    </section>
  );
}

/* ---------------- PAGE ---------------- */
export default function FavoritosPage() {
  const router = useRouter();
  const [layout, setLayout] = React.useState<"grade" | "lista">("grade");
  const [favs, setFavs] = React.useState<FavItem[]>([]);
  const [loaded, setLoaded] = React.useState(false);
  const [sort, setSort] = React.useState("recent");
  const [selected, setSelected] = React.useState<string[]>([]); // codes
  const [toast, setToast] = React.useState<{ code: string } | null>(null);
  const lastRemoved = React.useRef<FavItem | null>(null);
  const toastTimer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  React.useEffect(() => { setFavs(loadFavs()); setLoaded(true); }, []);
  React.useEffect(() => { if (loaded) saveFavs(favs); }, [favs, loaded]);

  const isEmpty = favs.length === 0;

  const sorted = [...favs].sort((a, b) => {
    if (sort === "recent") return (b.addedAt || 0) - (a.addedAt || 0);
    if (sort === "price-asc") return a.priceNum - b.priceNum;
    if (sort === "price-desc") return b.priceNum - a.priceNum;
    if (sort === "area") return b.area - a.area;
    return 0;
  });

  const remove = (code: string) => {
    const item = favs.find((f) => f.code === code) || null;
    lastRemoved.current = item;
    setFavs(favs.filter((f) => f.code !== code));
    setSelected((s) => s.filter((c) => c !== code));
    setToast({ code });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 5000);
  };
  const undoRemove = () => {
    if (lastRemoved.current) {
      const item = lastRemoved.current;
      setFavs((f) => [item, ...f].sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0)));
      lastRemoved.current = null;
    }
    setToast(null);
  };
  const toggleCompare = (code: string) => {
    setSelected((s) => {
      if (s.includes(code)) return s.filter((c) => c !== code);
      if (s.length >= 4) return s; // cap at 4
      return [...s, code];
    });
  };

  const compareItems = selected.map((c) => favs.find((f) => f.code === c)).filter(Boolean) as FavItem[];

  const goCompare = () => {
    if (compareItems.length < 2) return;
    try { localStorage.setItem("crm_compare_v1", JSON.stringify(compareItems)); } catch { /* ignore */ }
    router.push("/demo/comparar");
  };

  const sortOpts: [string, string][] = [
    ["recent", "Mais recentes"],
    ["price-asc", "Menor preço"],
    ["price-desc", "Maior preço"],
    ["area", "Maior área"],
  ];

  return (
    <div>
      <style>{FAV_PAGE_CSS}</style>
      <SiteNavbar current="" />
      <FavHeader count={favs.length} />

      <main className="ds-pad" style={{ maxWidth: 1240, margin: "0 auto", padding: "40px 32px 72px", minHeight: 320 }}>
        {!loaded ? null : isEmpty ? <EmptyState /> : (
          <React.Fragment>
            {/* toolbar */}
            <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", marginBottom: 28 }}>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: sitePalette.ink }}>
                {favs.length} {favs.length === 1 ? "imóvel" : "imóveis"}
              </div>
              <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                {/* layout toggle */}
                <div style={{ display: "flex", border: `1.5px solid ${sitePalette.g300}`, borderRadius: 10, overflow: "hidden" }}>
                  {([["grade", "layout-grid"], ["lista", "rows-3"]] as ["grade" | "lista", string][]).map(([v, ic]) => (
                    <button key={v} onClick={() => setLayout(v)} title={v === "grade" ? "Grade" : "Lista"} style={{
                      width: 42, height: 42, border: "none", cursor: "pointer", display: "grid", placeItems: "center",
                      background: layout === v ? sitePalette.lilac2 : "#fff",
                    }}>
                      <Ic n={ic} s={18} c={layout === v ? sitePalette.primary : sitePalette.g500} />
                    </button>
                  ))}
                </div>
                {/* sort */}
                <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                  <Ic n="arrow-up-down" s={16} c={sitePalette.g500} style={{ position: "absolute", left: 13, pointerEvents: "none" }} />
                  <select value={sort} onChange={(e) => setSort(e.target.value)} style={{
                    appearance: "none", WebkitAppearance: "none", fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 600,
                    color: sitePalette.ink, padding: "0 38px 0 38px", height: 42, border: `1.5px solid ${sitePalette.g300}`,
                    borderRadius: 10, background: "#fff", cursor: "pointer", outline: "none",
                  }}>
                    {sortOpts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                  <Ic n="chevron-down" s={16} c={sitePalette.g500} style={{ position: "absolute", right: 12, pointerEvents: "none" }} />
                </div>
              </div>
            </div>

            {/* grid / list */}
            <div className={layout === "grade" ? "ds-cards" : undefined} style={layout === "lista"
              ? { display: "flex", flexDirection: "column", gap: 20 }
              : { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
              {sorted.map((p) => (
                <FavoriteCard key={p.code} p={p} layout={layout === "lista" ? "list" : "grid"}
                  selected={selected.includes(p.code)} onRemove={remove} onToggleCompare={toggleCompare} />
              ))}
            </div>
          </React.Fragment>
        )}
      </main>

      <SiteFooter />

      {/* compare bar */}
      {selected.length > 0 && (
        <div className="fav-comparebar" style={{
          position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", zIndex: 150,
          display: "flex", alignItems: "center", gap: 18, background: sitePalette.dark, color: "#fff",
          borderRadius: 999, boxShadow: "0 18px 50px rgba(20,6,38,.5)", padding: "12px 14px 12px 24px",
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

      <Toast toast={toast} onUndo={undoRemove} onClose={() => setToast(null)} />
    </div>
  );
}
