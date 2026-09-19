"use client";
import * as React from "react";
import CorretorChrome, { pal, Ic } from "@/components/corretor/CorretorChrome";
import { demo, urlDemo } from "@/config/demo";

/* ============================================================
   MARKETING — porte fiel de mkt-data.jsx + mkt.jsx
   + mkt-editor.jsx + mkt-app.jsx
   ============================================================ */

// ── DATA (mkt-data.jsx) ───────────────────────────────────────
const MKT_AGENT = {
  name:     "Ricardo Almeida",
  creci:    "CRECI-PE 00000-F",
  role:     `Corretor · ${demo.nome}`,
  slug:     "ricardo-almeida",
  url:      `${demo.dominio}/corretores/ricardo-almeida`,
  initials: "RA",
  imoveis:  123,
  visitas:  1840,
};

const MKT_PROPS: any[] = [
  { id: "m1", title: "Apto 3 quartos · Boa Viagem", price: "R$ 890.000",   code: "48213", specs: "3 quartos · 2 vagas · 112 m²",  type: "Residencial", av: ["#6366F1","#312E81"] },
  { id: "m2", title: "Cobertura · Boa Viagem",      price: "R$ 1.450.000", code: "47710", specs: "4 suítes · 3 vagas · 224 m²",  type: "Residencial", av: ["#4338CA","#231038"] },
  { id: "m3", title: "Casa · Candeias",              price: "R$ 620.000",   code: "50127", specs: "3 quartos · quintal · 180 m²", type: "Residencial", av: ["#2E7D9E","#1C4A63"] },
  { id: "m4", title: "Sala comercial · Pina",        price: "R$ 380.000",   code: "49802", specs: "68 m² · 1 vaga",               type: "Comercial",   av: ["#2563A8","#163A5C"] },
];

const MKT_TEMPLATES: any[] = [
  { id: "t1", name: "Cartão de visita",  kind: "pessoal", icon: "contact",         ratio: "85/55",   desc: `Seu cartão profissional na marca da ${demo.nomeCurto}.` },
  { id: "t2", name: "Panfleto de imóvel",kind: "imovel",  icon: "file-text",       ratio: "210/297", desc: "Folheto A5 com foto, preço e dados." },
  { id: "t3", name: "Banner para redes", kind: "imovel",  icon: "image",           ratio: "1/1",     desc: "Post quadrado para Instagram/Facebook." },
  { id: "t4", name: "Banner impresso",   kind: "imovel",  icon: "panels-top-left", ratio: "297/210", desc: "Banner horizontal para impressão." },
  { id: "t5", name: 'Placa "Vende-se"',  kind: "imovel",  icon: "land-plot",       ratio: "4/3",     desc: "Placa para fachada do imóvel." },
  { id: "t6", name: "Story para redes",  kind: "imovel",  icon: "smartphone",      ratio: "9/16",    desc: "Story vertical 9:16 para Instagram." },
];

const QR_DESTINOS: any[] = [
  { k: "chatbot", label: "Conversa com o assistente", sub: "captura e tria o lead na hora", icon: "message-circle", rec: true },
  { k: "pagina",  label: "Minha página",               sub: "leva à sua página de imóveis",  icon: "globe" },
  { k: "ambos",   label: "Ambos",                       sub: "assistente + página",            icon: "layers" },
];

const QR_URL: Record<string, string> = {
  chatbot: `${demo.dominio}/c/ricardo-almeida?src=qr`,
  pagina:  `${demo.dominio}/corretores/ricardo-almeida`,
  ambos:   `${demo.dominio}/r/ricardo-almeida`,
};

// ── COMPONENTS (mkt.jsx) ─────────────────────────────────────
function QR({ text, size = 120, fg = "#1C1A22", bg = "#fff" }: { text: string; size?: number; fg?: string; bg?: string }) {
  const ref = React.useRef<HTMLSpanElement>(null);
  React.useEffect(() => {
    const el = ref.current; if (!el) return;
    try {
      const qr = (window as any).qrcode(0, "M");
      qr.addData(text || urlDemo());
      qr.make();
      const c = qr.getModuleCount();
      let rects = "";
      for (let r = 0; r < c; r++) for (let col = 0; col < c; col++) {
        if (qr.isDark(r, col)) rects += `<rect x="${col}" y="${r}" width="1.04" height="1.04" fill="${fg}"/>`;
      }
      el.innerHTML = `<svg width="${size}" height="${size}" viewBox="0 0 ${c} ${c}" shape-rendering="crispEdges" style="display:block;border-radius:6px;background:${bg}"><rect x="-1" y="-1" width="${c+2}" height="${c+2}" fill="${bg}"/>${rects}</svg>`;
    } catch { el.innerHTML = ""; }
  }, [text, size, fg, bg]);
  return <span ref={ref} style={{ display: "inline-flex", lineHeight: 0 }} />;
}

/**
 * Marca da rede do demo nas peças do corretor: monograma + nome curto, no mesmo
 * lugar e altura em que ficava o logo. `variant="purple"` = peça de fundo claro.
 */
function MarcaRede({ variant = "white", h = 16 }: { variant?: string; h?: number }) {
  const fundoClaro = variant === "purple";
  return (
    <span role="img" aria-label={demo.nome} style={{ display: "inline-flex", alignItems: "center", gap: h * 0.22, height: h, whiteSpace: "nowrap" }}>
      <span style={{ width: h * 0.75, height: h * 0.75, borderRadius: h * 0.2, flexShrink: 0, display: "grid", placeItems: "center", background: fundoClaro ? pal.primary : "#fff", color: fundoClaro ? "#fff" : pal.primary, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: h * 0.32, lineHeight: 1 }}>{demo.sigla}</span>
      <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: h * 0.42, lineHeight: 1, letterSpacing: "-.01em", color: fundoClaro ? pal.ink : "#fff" }}>{demo.nomeCurto}</span>
    </span>
  );
}

function MyPage({ isMobile, onToast }: { isMobile: boolean; onToast: (msg: string, icon?: string) => void }) {
  const a = MKT_AGENT;
  return (
    <div style={{ background: "#fff", border: `1px solid ${pal.g300}`, borderRadius: 18, overflow: "hidden", marginBottom: 24 }}>
      <div style={{ display: "flex", gap: 0, flexWrap: "wrap" }}>
        {/* preview of the page */}
        <div style={{ flex: "1 1 320px", minWidth: 0, padding: isMobile ? 18 : 24, borderRight: isMobile ? "none" : `1px solid ${pal.g100}` }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: pal.lilac2, color: pal.primary, borderRadius: 999, padding: "5px 12px", fontSize: 12, fontWeight: 700, marginBottom: 14 }}>
            <Ic n="globe" s={14} c={pal.primary} /> Minha página
          </div>
          {/* browser frame mock */}
          <div style={{ border: `1px solid ${pal.g300}`, borderRadius: 12, overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", background: pal.g100, borderBottom: `1px solid ${pal.g300}` }}>
              <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#E0685E" }} />
              <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#E0A82E" }} />
              <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#5BB97E" }} />
              <span style={{ marginLeft: 8, fontSize: 11, color: pal.g500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.url}</span>
            </div>
            {/* page hero */}
            <div style={{ background: `linear-gradient(135deg, ${pal.primary}, ${pal.deep})`, padding: "18px 16px", color: "#fff", display: "flex", alignItems: "center", gap: 13 }}>
              <span style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(255,255,255,.18)", border: "2px solid rgba(255,255,255,.4)", display: "grid", placeItems: "center", fontWeight: 700, fontFamily: "var(--font-display)", fontSize: 16 }}>{a.initials}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15 }}>{a.name}</div>
                <div style={{ fontSize: 11.5, opacity: .85 }}>{a.creci} · {a.imoveis} imóveis</div>
              </div>
              <MarcaRede h={22} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, padding: 10, background: "#fff" }}>
              {[["#6366F1","#312E81"],["#2E7D9E","#1C4A63"],["#2563A8","#163A5C"]].map((g, i) => (
                <div key={i} style={{ aspectRatio: "4/3", borderRadius: 7, background: `linear-gradient(135deg, ${g[0]}, ${g[1]})`, display: "grid", placeItems: "center" }}><Ic n="building-2" s={16} c="rgba(255,255,255,.5)" /></div>
              ))}
            </div>
          </div>
        </div>
        {/* actions + QR */}
        <div style={{ flex: "1 1 280px", minWidth: 0, padding: isMobile ? 18 : 24, display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: pal.g500, marginBottom: 7 }}>Link da sua página</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, border: `1px solid ${pal.g300}`, borderRadius: 11, padding: "10px 13px" }}>
              <Ic n="link" s={16} c={pal.g500} />
              <span style={{ flex: 1, minWidth: 0, fontSize: 13, color: pal.ink, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.url}</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
            <button onClick={() => { try { navigator.clipboard && navigator.clipboard.writeText("https://" + a.url); } catch {} onToast("Link copiado", "copy"); }} style={{ flex: 1, minWidth: 120, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, border: "none", background: pal.primary, color: "#fff", borderRadius: 10, padding: "11px", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 13.5, boxShadow: "var(--shadow-purple)" }}><Ic n="copy" s={16} c="#fff" /> Copiar link</button>
            <button onClick={() => onToast(`Compartilhar pelo WhatsApp da ${demo.nomeCurto}`, "share-2")} style={{ flex: 1, minWidth: 120, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, border: `1px solid ${pal.g300}`, background: "#fff", color: pal.g700, borderRadius: 10, padding: "11px", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13.5 }}><Ic n="share-2" s={16} c={pal.primary} /> Compartilhar</button>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, background: pal.lilac1, border: `1px solid ${pal.lilac2}`, borderRadius: 12, padding: 14 }}>
            <div style={{ flexShrink: 0, padding: 6, background: "#fff", borderRadius: 9, border: `1px solid ${pal.lilac2}` }}><QR text={"https://" + a.url} size={84} fg={pal.deep} /></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: pal.ink }}>QR da sua página</div>
              <div style={{ fontSize: 12, color: pal.g500, marginTop: 2, lineHeight: 1.45 }}>Imprima onde quiser — leva direto à sua página.</div>
              <button onClick={() => onToast("QR da página baixado (PNG)", "download")} style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 9, border: `1px solid ${pal.g300}`, background: "#fff", borderRadius: 9, padding: "7px 12px", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 12.5, color: pal.g700 }}><Ic n="download" s={14} c={pal.primary} /> Baixar QR</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TemplatePreview({ t }: { t: any }) {
  if (t.id === "t1") {
    return (
      <div style={{ width: "100%", aspectRatio: "85/55", background: "#fff", border: `1px solid ${pal.g300}`, borderRadius: 8, display: "grid", placeItems: "center", boxShadow: "var(--shadow-sm)" }}>
        <MarcaRede variant="purple" h={32} />
      </div>
    );
  }
  return (
    <div style={{ width: "100%", aspectRatio: t.id === "t6" ? "9/16" : t.id === "t3" ? "1/1" : "4/3", maxHeight: 150, borderRadius: 8, overflow: "hidden", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", padding: "8%",
      background: `radial-gradient(120% 90% at 85% 8%, rgba(255,255,255,.16), rgba(255,255,255,0) 45%), linear-gradient(150deg, ${pal.primary}, ${pal.deep})` }}>
      <span style={{ position: "absolute", top: 7, left: 0, right: 0, textAlign: "center" }}><MarcaRede h={13} /></span>
      <div style={{ width: "56%", background: "#fff", padding: "5% 5% 0", borderRadius: 3, boxShadow: "0 6px 16px rgba(0,0,0,.3)", transform: "rotate(-3deg)", marginTop: "8%" }}>
        <div style={{ width: "100%", aspectRatio: "1/1", background: `linear-gradient(135deg, ${pal.light}, ${pal.deep})`, display: "grid", placeItems: "center" }}><Ic n="building-2" s={18} c="rgba(255,255,255,.55)" /></div>
        <div style={{ height: 7 }} />
      </div>
      <div style={{ color: "#fff", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 12, marginTop: "7%" }}>R$ 890.000</div>
      {t.id === "t5" && <span style={{ position: "absolute", top: 7, right: 7, background: "#fff", color: pal.primary, fontWeight: 800, fontSize: 8, borderRadius: 3, padding: "2px 6px", fontFamily: "var(--font-display)" }}>VENDE-SE</span>}
    </div>
  );
}

function Gallery({ onPick }: { onPick: (t: any) => void }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <span style={{ width: 32, height: 32, borderRadius: 9, background: pal.lilac2, display: "grid", placeItems: "center" }}><Ic n="palette" s={18} c={pal.primary} /></span>
        <div><h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, margin: 0, color: pal.ink }}>Materiais de marketing</h2><div style={{ fontSize: 12.5, color: pal.g500 }}>Na marca da {demo.nomeCurto}, com QR que captura o lead — nunca no WhatsApp pessoal.</div></div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
        {MKT_TEMPLATES.map((t: any) => (
          <div key={t.id} style={{ background: "#fff", border: `1px solid ${pal.g300}`, borderRadius: 14, padding: 14, display: "flex", flexDirection: "column", transition: "box-shadow .15s ease, transform .15s ease" }}
            onMouseEnter={(e: any) => { e.currentTarget.style.boxShadow = "var(--shadow-lg)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={(e: any) => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "none"; }}>
            <div style={{ display: "grid", placeItems: "center", minHeight: 130, marginBottom: 12, padding: "4px 0" }}><div style={{ width: t.id === "t6" ? 84 : "100%" }}><TemplatePreview t={t} /></div></div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: pal.ink, flex: 1 }}>{t.name}</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: t.kind === "imovel" ? pal.primary : pal.g500, background: t.kind === "imovel" ? pal.lilac2 : pal.g100, borderRadius: 999, padding: "2px 8px" }}>{t.kind === "imovel" ? "Imóvel" : "Pessoal"}</span>
            </div>
            <div style={{ fontSize: 12, color: pal.g500, lineHeight: 1.4, marginBottom: 12, flex: 1 }}>{t.desc}</div>
            <button onClick={() => onPick(t)} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, border: "none", background: pal.primary, color: "#fff", borderRadius: 10, padding: "10px", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 13.5, boxShadow: "var(--shadow-purple)" }}><Ic n="wand-sparkles" s={15} c="#fff" /> Personalizar</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── EDITOR (mkt-editor.jsx) ───────────────────────────────────
function CardFace({ side, qrText }: { side: string; qrText: string }) {
  const a = MKT_AGENT;
  const base: React.CSSProperties = { width: "100%", aspectRatio: "85/55", background: "#fff", border: `1px solid ${pal.g300}`, borderRadius: 12, boxShadow: "var(--shadow-sm)", overflow: "hidden", position: "relative" };
  if (side === "front") {
    return (
      <div style={{ ...base, display: "grid", placeItems: "center", padding: "10%" }}>
        <span style={{ position: "absolute", top: 14, left: 14, width: 22, height: 22, borderTop: `2px solid ${pal.lilac2}`, borderLeft: `2px solid ${pal.lilac2}` }} />
        <span style={{ position: "absolute", bottom: 14, right: 14, width: 22, height: 22, borderBottom: `2px solid ${pal.lilac2}`, borderRight: `2px solid ${pal.lilac2}` }} />
        <MarcaRede variant="purple" h={62} />
      </div>
    );
  }
  return (
    <div style={{ ...base, padding: "7% 8%", display: "flex", alignItems: "center", gap: 14 }}>
      <span style={{ position: "absolute", left: 0, top: "18%", bottom: "18%", width: 3, background: pal.primary, borderRadius: 999 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 19, color: pal.ink, lineHeight: 1.1 }}>{a.name}</div>
        <div style={{ fontSize: 11.5, color: pal.primary, fontWeight: 600, marginTop: 3 }}>{a.creci}</div>
        <div style={{ fontSize: 10.5, color: pal.g500, marginTop: 1 }}>{a.role}</div>
        <div style={{ height: 1, background: pal.g100, margin: "11px 0" }} />
        <div style={{ fontSize: 10, color: pal.g500, lineHeight: 1.5 }}>{a.url}</div>
      </div>
      <div style={{ flexShrink: 0, textAlign: "center" }}>
        <QR text={"https://" + qrText} size={68} fg={pal.deep} />
        <div style={{ fontSize: 8, color: pal.g500, marginTop: 4 }}>aponte a câmera</div>
      </div>
    </div>
  );
}

function SingleCard({ qrText }: { qrText: string }) {
  const a = MKT_AGENT;
  return (
    <div style={{ width: "100%", aspectRatio: "85/55", background: "#fff", border: `1px solid ${pal.g300}`, borderRadius: 12, boxShadow: "var(--shadow-sm)", padding: "8%", display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative", overflow: "hidden" }}>
      <span style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: `linear-gradient(${pal.primary}, ${pal.deep})` }} />
      <div style={{ display: "flex", justifyContent: "center" }}><MarcaRede variant="purple" h={40} /></div>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 14, borderTop: `1px solid ${pal.g100}`, paddingTop: "5%" }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17, color: pal.ink, lineHeight: 1.1 }}>{a.name}</div>
          <div style={{ fontSize: 10.5, color: pal.primary, fontWeight: 600, marginTop: 2 }}>{a.creci}</div>
          <div style={{ fontSize: 9.5, color: pal.g500, marginTop: 1 }}>{a.url}</div>
        </div>
        <div style={{ flexShrink: 0 }}><QR text={"https://" + qrText} size={56} fg={pal.deep} /></div>
      </div>
    </div>
  );
}

function CardArt({ sides, qrText }: { sides: string; qrText: string }) {
  if (sides === "front") return <SingleCard qrText={qrText} />;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div><div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: pal.g500, marginBottom: 6 }}>Frente</div><CardFace side="front" qrText={qrText} /></div>
      <div><div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: pal.g500, marginBottom: 6 }}>Verso</div><CardFace side="back" qrText={qrText} /></div>
    </div>
  );
}

function Polaroid({ w: pw, tilt = -3, cap, photoTall, prop }: { w: any; tilt?: number; cap?: string; photoTall?: boolean; prop: any }) {
  return (
    <div style={{ width: pw, background: "#fff", padding: "4% 4% 0", borderRadius: 4, boxShadow: "0 10px 26px rgba(0,0,0,.34)", transform: `rotate(${tilt}deg)`, flexShrink: 0 }}>
      <div style={{ width: "100%", aspectRatio: photoTall ? "4/5" : "1/1", background: `linear-gradient(135deg, ${prop.av[0]}, ${prop.av[1]})`, display: "grid", placeItems: "center", position: "relative" }}>
        <Ic n="building-2" s={28} c="rgba(255,255,255,.5)" />
        <span style={{ position: "absolute", bottom: 5, right: 5, background: "rgba(28,22,40,.7)", color: "#fff", fontSize: 8.5, fontWeight: 600, borderRadius: 4, padding: "1px 6px" }}>Cód {prop.code}</span>
      </div>
      <div style={{ textAlign: "center", padding: "6% 0 8%", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 10.5, color: pal.primary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{cap || prop.title.split("·")[0].trim()}</div>
    </div>
  );
}

function ArtPreview({ t, mode, prop, headline, sub, qrText, cardSides }: { t: any; mode: string; prop: any; headline: string; sub: string; qrText: string; cardSides: string }) {
  const a = MKT_AGENT;
  const isCard   = t.id === "t1";
  const isStory  = t.id === "t6";
  const isSquare = t.id === "t3";
  const ratio = isCard ? "85/55" : isStory ? "9/16" : isSquare ? "1/1" : t.id === "t4" ? "297/210" : t.id === "t5" ? "4/3" : "210/297";

  if (isCard) return <CardArt sides={cardSides} qrText={qrText} />;

  if (mode === "pessoal") {
    return (
      <div style={{ width: "100%", aspectRatio: ratio, background: `linear-gradient(150deg, ${pal.primary}, ${pal.deep})`, borderRadius: 12, padding: "7%", display: "flex", flexDirection: "column", justifyContent: "space-between", color: "#fff", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", right: -40, top: -40, width: 140, height: 140, borderRadius: "50%", background: "rgba(255,255,255,.06)" }} />
        <div style={{ alignSelf: "flex-start" }}><MarcaRede h={isStory ? 76 : 54} /></div>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12 }}>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: isStory ? 30 : 20, lineHeight: 1.1 }}>{a.name}</div>
            <div style={{ fontSize: isStory ? 15 : 11, opacity: .85, marginTop: 3 }}>{a.creci}</div>
            <div style={{ fontSize: isStory ? 14 : 10.5, opacity: .7, marginTop: 2 }}>{a.role}</div>
          </div>
          <div style={{ flexShrink: 0, padding: 6, background: "#fff", borderRadius: 9 }}><QR text={"https://" + qrText} size={isStory ? 92 : 60} fg={pal.deep} /></div>
        </div>
      </div>
    );
  }

  const horiz   = t.id === "t4";
  const isPlaca = t.id === "t5";
  const premiumBg: React.CSSProperties = {
    background: `
      radial-gradient(130% 90% at 92% 4%, rgba(255,255,255,.10), rgba(255,255,255,0) 38%),
      radial-gradient(100% 80% at 6% 106%, rgba(150,90,200,.5), rgba(150,90,200,0) 52%),
      linear-gradient(150deg, ${pal.primary} 0%, ${pal.deep} 100%)`,
    position: "relative",
    overflow: "hidden",
  };
  const deco = (
    <React.Fragment>
      <span style={{ position: "absolute", top: -50, right: -50, width: 160, height: 160, borderRadius: "50%", border: "1.5px solid rgba(255,255,255,.12)" }} />
      <span style={{ position: "absolute", top: -30, right: -30, width: 110, height: 110, borderRadius: "50%", border: "1.5px solid rgba(255,255,255,.1)" }} />
      <span style={{ position: "absolute", bottom: "-8%", left: "-6%", width: 90, height: 90, borderRadius: "50%", background: "rgba(255,255,255,.05)" }} />
    </React.Fragment>
  );

  if (horiz) {
    return (
      <div style={{ width: "100%", aspectRatio: ratio, borderRadius: 12, padding: "5%", display: "flex", alignItems: "center", gap: "6%", ...premiumBg }}>
        {deco}
        <Polaroid w="38%" tilt={-4} prop={prop} />
        <div style={{ flex: 1, minWidth: 0, color: "#fff", display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between", padding: "2% 0", position: "relative", zIndex: 1 }}>
          <div style={{ alignSelf: "flex-start" }}><MarcaRede h={40} /></div>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 20, lineHeight: 1.15 }}>{headline}</div>
            <div style={{ fontSize: 12, opacity: .82, marginTop: 3 }}>{sub}</div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 32, marginTop: 8 }}>{prop.price}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
            <div style={{ fontSize: 11, opacity: .85 }}>{a.name}<br /><span style={{ opacity: .7 }}>{a.creci}</span></div>
            <div style={{ padding: 5, background: "#fff", borderRadius: 8 }}><QR text={"https://" + qrText} size={62} fg={pal.deep} /></div>
          </div>
        </div>
      </div>
    );
  }

  if (isPlaca) {
    return (
      <div style={{ width: "100%", aspectRatio: ratio, borderRadius: 12, padding: "5%", display: "flex", flexDirection: "column", ...premiumBg }}>
        {deco}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", zIndex: 1 }}>
          <MarcaRede h={28} />
          <span style={{ background: "#fff", color: pal.primary, fontWeight: 800, fontSize: 17, borderRadius: 8, padding: "5px 16px", fontFamily: "var(--font-display)", letterSpacing: ".05em" }}>VENDE-SE</span>
        </div>
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "6%", padding: "4% 0", position: "relative", zIndex: 1 }}>
          <Polaroid w="38%" tilt={-4} prop={prop} />
          <div style={{ flex: 1, color: "#fff" }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, lineHeight: 1.2 }}>{headline}</div>
            <div style={{ fontSize: 11, opacity: .82, marginTop: 3 }}>{sub}</div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 30, marginTop: 8 }}>{prop.price}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, position: "relative", zIndex: 1 }}>
          <div style={{ color: "#fff", fontSize: 12 }}>{a.name} · {a.creci}<div style={{ opacity: .75, fontSize: 11, marginTop: 2 }}>Aponte a câmera no QR</div></div>
          <div style={{ padding: 6, background: "#fff", borderRadius: 8 }}><QR text={"https://" + qrText} size={68} fg={pal.deep} /></div>
        </div>
      </div>
    );
  }

  // vertical (panfleto, social square, story)
  return (
    <div style={{ width: "100%", aspectRatio: ratio, borderRadius: 12, padding: isStory ? "7% 6%" : isSquare ? "5%" : "7% 6%", display: "flex", flexDirection: "column", alignItems: "center", overflow: "hidden", ...premiumBg }}>
      {deco}
      <div style={{ position: "relative", zIndex: 1, marginBottom: isStory ? "4%" : isSquare ? "2%" : "5%" }}><MarcaRede h={isStory ? 48 : isSquare ? 34 : 58} /></div>
      <div style={{ position: "relative", zIndex: 1 }}><Polaroid w={isStory ? "50%" : isSquare ? "34%" : "66%"} tilt={-3} prop={prop} /></div>
      <div style={{ color: "#fff", textAlign: "center", marginTop: isStory ? "5%" : isSquare ? "2.5%" : "5%", position: "relative", zIndex: 1 }}>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: isStory ? 21 : isSquare ? 14 : 19, lineHeight: 1.15 }}>{headline}</div>
        <div style={{ fontSize: isStory ? 12.5 : isSquare ? 10 : 11.5, opacity: .82, marginTop: isSquare ? 2 : 4 }}>{sub}</div>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: isStory ? 32 : isSquare ? 21 : 30, marginTop: isSquare ? "2.5%" : "3.5%" }}>{prop.price}</div>
      </div>
      <div style={{ marginTop: "auto", width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, borderTop: "1px solid rgba(255,255,255,.18)", paddingTop: isStory ? "5%" : isSquare ? "2.5%" : "4.5%", position: "relative", zIndex: 1 }}>
        <div style={{ color: "#fff", fontSize: isStory ? 12 : isSquare ? 10 : 11, textAlign: "left" }}>{a.name}<div style={{ opacity: .7 }}>{a.creci}</div></div>
        <div style={{ padding: 4, background: "#fff", borderRadius: 7 }}><QR text={"https://" + qrText} size={isStory ? 72 : isSquare ? 44 : 60} fg={pal.deep} /></div>
      </div>
    </div>
  );
}

function Editor({ t, isMobile, onClose, onToast }: { t: any; isMobile: boolean; onClose: () => void; onToast: (msg: string, icon?: string) => void }) {
  const isCardOnly = t.id === "t1";
  const [mode,      setMode]      = React.useState(t.kind === "imovel" ? "imovel" : "pessoal");
  const [propId,    setPropId]    = React.useState(MKT_PROPS[0].id);
  const [headline,  setHeadline]  = React.useState("Oportunidade em Boa Viagem");
  const [sub,       setSub]       = React.useState("3 quartos · 2 vagas · vista mar");
  const [dest,      setDest]      = React.useState("chatbot");
  const [cardSides, setCardSides] = React.useState("both");
  const prop    = MKT_PROPS.find((p: any) => p.id === propId) || MKT_PROPS[0];
  const qrText  = QR_URL[dest];

  const inputSt: React.CSSProperties = { width: "100%", border: `1px solid ${pal.g300}`, borderRadius: 10, padding: "10px 13px", fontFamily: "var(--font-body)", fontSize: 14, color: pal.ink, outline: "none" };

  const field = (label: string, node: React.ReactNode) => (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: pal.g700, marginBottom: 6 }}>{label}</div>
      {node}
    </div>
  );

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 8000, background: "rgba(28,22,40,.5)", display: "grid", placeItems: isMobile ? "stretch" : "center", padding: isMobile ? 0 : 24 }}>
      <div onClick={(e: any) => e.stopPropagation()} style={{ width: isMobile ? "100%" : 880, maxWidth: "100%", height: isMobile ? "100%" : "auto", maxHeight: isMobile ? "100%" : "92vh", background: "#fff", borderRadius: isMobile ? 0 : 18, overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "var(--shadow-lg)" }}>
        {/* header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", borderBottom: `1px solid ${pal.g100}`, flexShrink: 0 }}>
          <span style={{ width: 36, height: 36, borderRadius: 10, background: pal.lilac2, display: "grid", placeItems: "center" }}><Ic n={t.icon} s={18} c={pal.primary} /></span>
          <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: pal.ink }}>{t.name}</div><div style={{ fontSize: 12, color: pal.g500 }}>Personalize na marca da {demo.nomeCurto}</div></div>
          <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: 10, border: "none", background: pal.g100, display: "grid", placeItems: "center", cursor: "pointer" }}><Ic n="x" s={19} c={pal.g700} /></button>
        </div>
        {/* body: preview + controls */}
        <div style={{ flex: 1, display: "flex", flexDirection: isMobile ? "column" : "row", minHeight: 0, overflow: isMobile ? "auto" : "hidden" }}>
          {/* preview */}
          <div style={{ flex: isMobile ? "none" : "1 1 0", background: pal.page, padding: 22, display: "grid", placeItems: "center", borderRight: isMobile ? "none" : `1px solid ${pal.g100}` }}>
            <div style={{ width: t.id === "t6" ? 200 : "100%", maxWidth: 360 }}>
              <ArtPreview t={t} mode={mode} prop={prop} headline={headline} sub={sub} qrText={qrText} cardSides={cardSides} />
              <div style={{ textAlign: "center", fontSize: 11.5, color: pal.g500, marginTop: 10 }}>Prévia ao vivo · o QR já aponta para o sistema</div>
            </div>
          </div>
          {/* controls */}
          <div style={{ flex: isMobile ? "none" : "0 0 340px", overflowY: "auto", padding: 18 }}>
            {isCardOnly && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".03em", textTransform: "uppercase", color: pal.g500, marginBottom: 9 }}>Formato do cartão</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[["both","Frente e verso","Frente só com a logo · verso com seus dados e QR","copy"],["front","Só frente","Tudo num lado só, minimalista","square"]].map(([k, lbl, sub2, ic]) => {
                    const on = cardSides === k;
                    return (
                      <button key={k} onClick={() => setCardSides(k)} style={{ display: "flex", alignItems: "center", gap: 11, border: on ? `1.5px solid ${pal.primary}` : `1px solid ${pal.g300}`, background: on ? pal.lilac1 : "#fff", borderRadius: 11, padding: "11px 13px", cursor: "pointer", textAlign: "left", fontFamily: "var(--font-body)" }}>
                        <span style={{ width: 32, height: 32, flexShrink: 0, borderRadius: 8, background: on ? pal.lilac2 : pal.g100, display: "grid", placeItems: "center" }}><Ic n={ic} s={16} c={on ? pal.primary : pal.g600} /></span>
                        <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 13, fontWeight: 600, color: pal.ink }}>{lbl}</div><div style={{ fontSize: 11.5, color: pal.g500, marginTop: 1 }}>{sub2}</div></div>
                        <span style={{ width: 18, height: 18, borderRadius: "50%", flexShrink: 0, border: on ? `6px solid ${pal.primary}` : `2px solid ${pal.g300}` }} />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            {!isCardOnly && (
              <div style={{ display: "flex", gap: 6, background: pal.g100, borderRadius: 11, padding: 4, marginBottom: 16 }}>
                {[["imovel","Material de imóvel","building-2"],["pessoal","Material pessoal","user-round"]].map(([k, lbl, ic]) => {
                  const on = mode === k;
                  return <button key={k} onClick={() => setMode(k)} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, border: "none", borderRadius: 8, padding: "9px 8px", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 12.5, background: on ? "#fff" : "transparent", color: on ? pal.primary : pal.g500, boxShadow: on ? "var(--shadow-sm)" : "none" }}><Ic n={ic} s={15} c={on ? pal.primary : pal.g500} /> {lbl}</button>;
                })}
              </div>
            )}
            {mode === "imovel" && !isCardOnly && (
              <React.Fragment>
                {field("Imóvel do anúncio", (
                  <div style={{ position: "relative" }}>
                    <select value={propId} onChange={(e: any) => setPropId(e.target.value)} style={{ ...inputSt, appearance: "none" as any, paddingRight: 36, cursor: "pointer" }}>
                      {MKT_PROPS.map((p: any) => <option key={p.id} value={p.id}>{p.title} · {p.price}</option>)}
                    </select>
                    <Ic n="chevron-down" s={17} c={pal.g500} style={{ position: "absolute", right: 12, top: 12, pointerEvents: "none" } as React.CSSProperties} />
                  </div>
                ))}
                {field("Título",    <input value={headline} onChange={(e: any) => setHeadline(e.target.value)} style={inputSt} />)}
                {field("Subtítulo", <input value={sub}      onChange={(e: any) => setSub(e.target.value)}      style={inputSt} />)}
              </React.Fragment>
            )}
            {/* agent data (locked) */}
            <div style={{ background: pal.lilac1, border: `1px solid ${pal.lilac2}`, borderRadius: 11, padding: "11px 13px", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}><Ic n="badge-check" s={15} c={pal.primary} /><span style={{ fontSize: 12.5, fontWeight: 700, color: pal.ink }}>Seus dados (fixos)</span></div>
              <div style={{ fontSize: 12, color: pal.g700 }}>{MKT_AGENT.name} · {MKT_AGENT.creci} · logo da {demo.nomeCurto}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: pal.g500, marginTop: 5 }}><Ic n="shield" s={12} c={pal.g500} /> Sem WhatsApp pessoal — o contato é sempre o sistema.</div>
            </div>
            {/* QR destination */}
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".03em", textTransform: "uppercase", color: pal.g500, marginBottom: 9 }}>Destino do QR code</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
              {QR_DESTINOS.map((d: any) => {
                const on = dest === d.k;
                return (
                  <button key={d.k} onClick={() => setDest(d.k)} style={{ display: "flex", alignItems: "center", gap: 11, border: on ? `1.5px solid ${pal.primary}` : `1px solid ${pal.g300}`, background: on ? pal.lilac1 : "#fff", borderRadius: 11, padding: "11px 13px", cursor: "pointer", textAlign: "left", fontFamily: "var(--font-body)" }}>
                    <span style={{ width: 32, height: 32, flexShrink: 0, borderRadius: 8, background: on ? pal.lilac2 : pal.g100, display: "grid", placeItems: "center" }}><Ic n={d.icon} s={16} c={on ? pal.primary : pal.g600} /></span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ fontSize: 13, fontWeight: 600, color: pal.ink }}>{d.label}</span>{d.rec && <span style={{ fontSize: 9.5, fontWeight: 700, color: "#1E7A43", background: "#E6F4EC", borderRadius: 999, padding: "1px 6px" }}>RECOMENDADO</span>}</div>
                      <div style={{ fontSize: 11.5, color: pal.g500, marginTop: 1 }}>{d.sub}</div>
                    </div>
                    <span style={{ width: 18, height: 18, borderRadius: "50%", flexShrink: 0, border: on ? `6px solid ${pal.primary}` : `2px solid ${pal.g300}` }} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        {/* footer downloads */}
        <div style={{ display: "flex", gap: 9, padding: "14px 18px", borderTop: `1px solid ${pal.g100}`, flexShrink: 0, flexWrap: "wrap" }}>
          <button onClick={() => onToast("Arte baixada em PDF (alta resolução)", "file-down")} style={{ flex: 1, minWidth: 130, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, border: "none", background: pal.primary, color: "#fff", borderRadius: 11, padding: "12px", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 13.5, boxShadow: "var(--shadow-purple)" }}><Ic n="file-down" s={16} c="#fff" /> Baixar PDF</button>
          <button onClick={() => onToast("Imagem PNG baixada", "image-down")} style={{ flex: 1, minWidth: 130, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, border: `1px solid ${pal.g300}`, background: "#fff", color: pal.g700, borderRadius: 11, padding: "12px", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13.5 }}><Ic n="image" s={16} c={pal.primary} /> Baixar imagem</button>
          <button onClick={() => onToast("Enviado para impressão", "printer")} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, border: `1px solid ${pal.g300}`, background: "#fff", color: pal.g700, borderRadius: 11, padding: "12px 16px", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13.5 }}><Ic n="printer" s={16} c={pal.primary} /> {isMobile ? "" : "Imprimir"}</button>
        </div>
      </div>
    </div>
  );
}

// ── SKELETON & TOAST ──────────────────────────────────────────
interface ToastT { id: number; msg: string; icon?: string }
function Toast({ toast }: { toast: ToastT | null }) {
  if (!toast) return null;
  return (
    <div key={toast.id} style={{ position: "fixed", bottom: 26, left: "50%", transform: "translateX(-50%)", zIndex: 9000, display: "flex", alignItems: "center", gap: 10, background: pal.ink, color: "#fff", borderRadius: 12, padding: "12px 18px", boxShadow: "var(--shadow-lg)", fontFamily: "var(--font-body)", fontSize: 13.5, fontWeight: 500, animation: "toastUp .26s cubic-bezier(.2,.7,.3,1)", maxWidth: 440 }}>
      <span style={{ width: 26, height: 26, borderRadius: "50%", background: "rgba(255,255,255,.14)", display: "grid", placeItems: "center", flexShrink: 0 }}><Ic n={toast.icon || "check"} s={15} c="#fff" /></span>
      <span>{toast.msg}</span>
    </div>
  );
}

function Skeleton() {
  return (
    <div style={{ padding: 28, maxWidth: 1120, margin: "0 auto" }}>
      <div className="sk" style={{ height: 220, borderRadius: 18, marginBottom: 24 }} />
      <div className="sk" style={{ height: 22, width: 220, borderRadius: 8, marginBottom: 16 }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>{[0,1,2,3,4,5].map(i => <div key={i} className="sk" style={{ height: 240, borderRadius: 14 }} />)}</div>
    </div>
  );
}

// ── PAGE ──────────────────────────────────────────────────────
export default function MarketingPage() {
  const [isMobile, setIsMobile] = React.useState(false);
  const [loading, setLoading]   = React.useState(true);
  const [editing, setEditing]   = React.useState<any>(null);
  const [toast, setToast]       = React.useState<ToastT | null>(null);
  const toastTimer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  React.useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 1024);
    onResize();
    window.addEventListener("resize", onResize);
    const t0 = setTimeout(() => setLoading(false), 850);
    return () => { window.removeEventListener("resize", onResize); clearTimeout(t0); };
  }, []);

  const fire = (msg: string, icon?: string) => {
    setToast({ msg, icon, id: Date.now() });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  };

  const content = loading ? <Skeleton /> : (
    <div style={{ padding: isMobile ? "16px" : 28, maxWidth: 1120, margin: "0 auto" }}>
      {!isMobile && (
        <div style={{ marginBottom: 18 }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 26, margin: 0, color: pal.ink, letterSpacing: "-0.01em" }}>Marketing</h2>
          <p style={{ fontSize: 13.5, color: pal.g500, margin: "4px 0 0" }}>Sua página e materiais prontos — todo QR captura o lead pra dentro da {demo.nomeCurto}.</p>
        </div>
      )}
      <MyPage isMobile={isMobile} onToast={fire} />
      <Gallery onPick={setEditing} />
      <div style={{ textAlign: "center", fontSize: 11.5, color: pal.g500, padding: "20px 0 8px" }}>
        <Ic n="shield-check" s={12} c={pal.g500} style={{ verticalAlign: "middle", marginRight: 4 }} /> Todo material leva a logo da {demo.nomeCurto} e um QR que captura o lead — nunca o WhatsApp pessoal.
      </div>
    </div>
  );

  return (
    <CorretorChrome title="Marketing" subtitle={`Divulgue na marca da ${demo.nomeCurto} — o lead sempre volta pra você.`} searchPlaceholder="Buscar modelo de material">
      {content}
      {editing && <Editor t={editing} isMobile={isMobile} onClose={() => setEditing(null)} onToast={fire} />}
      <Toast toast={toast} />
    </CorretorChrome>
  );
}
