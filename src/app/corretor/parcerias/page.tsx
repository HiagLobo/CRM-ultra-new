"use client";
import * as React from "react";
import CorretorChrome, { pal, Ic } from "@/components/corretor/CorretorChrome";
import { demo } from "@/config/demo";

/* ============================================================
   PARCERIAS — porte fiel de parcerias-data.jsx + parcerias.jsx
   + parcerias-app.jsx
   ============================================================ */

// ── DATA (parcerias-data.jsx) ─────────────────────────────────
const PT_CATS: any[] = [
  { k: "Todos",              icon: "layout-grid" },
  { k: "Reformas & reparos", icon: "hammer" },
  { k: "Mudança & pós-venda",icon: "truck" },
];

const PT_CAT_COLOR: Record<string, { c: string; bg: string }> = {
  "Reformas & reparos":  { c: "#B5632F", bg: "#FBEEE3" },
  "Mudança & pós-venda": { c: "#2E9E5B", bg: "#E6F4EC" },
};

const PT_PARTNERS: any[] = [
  { id: "p1",  name: "ConstruFácil",     cat: "Reformas & reparos",  icon: "hard-hat",    benefit: "10% OFF",              desc: "Construção e reformas completas, com equipe própria.",          initials: "CF", av: ["#B5632F","#7A3B16"] },
  { id: "p2",  name: "HidroJá",          cat: "Reformas & reparos",  icon: "wrench",      benefit: "15% na 1ª visita",     desc: "Encanamento e reparos hidráulicos de urgência.",               initials: "HJ", av: ["#2E7D9E","#1C4A63"] },
  { id: "p3",  name: "Elétrica Recife",  cat: "Reformas & reparos",  icon: "zap",         benefit: "10% OFF",              desc: "Serviços elétricos residenciais e comerciais.",                initials: "ER", av: ["#B8860B","#7A5A08"] },
  { id: "p4",  name: "Pinta Bem",        cat: "Reformas & reparos",  icon: "paintbrush",  benefit: "12% OFF",              desc: "Pintura interna e externa, acabamento premium.",               initials: "PB", av: ["#6366F1","#312E81"] },
  { id: "p9",  name: "Muda Fácil",       cat: "Mudança & pós-venda", icon: "truck",       benefit: "15% OFF",              desc: "Mudanças residenciais com seguro de carga.",                   initials: "MF", av: ["#2E9E5B","#176B3A"] },
  { id: "p10", name: "Planejados Lar",   cat: "Mudança & pós-venda", icon: "sofa",        benefit: "10% + projeto grátis", desc: "Móveis planejados sob medida, projeto 3D incluso.",            initials: "PL", av: ["#B5632F","#7A3B16"] },
  { id: "p11", name: "Limpa Tudo",       cat: "Mudança & pós-venda", icon: "sparkles",    benefit: "10% OFF",              desc: "Limpeza pós-obra e pós-mudança completa.",                    initials: "LT", av: ["#2563A8","#163A5C"] },
  { id: "p12", name: "Chave Já",         cat: "Mudança & pós-venda", icon: "key-round",   benefit: "10% OFF",              desc: "Chaveiro e troca de fechaduras na entrega das chaves.",        initials: "CJ", av: ["#807C8A","#4A4754"] },
  { id: "p13", name: "Marcenaria Nobre", cat: "Reformas & reparos",  icon: "ruler",       benefit: "10% OFF",              desc: "Marcenaria sob medida e pequenos reparos.",                   initials: "MN", av: ["#B5632F","#7A3B16"] },
  { id: "p14", name: "Jardim Vivo",      cat: "Mudança & pós-venda", icon: "flower-2",    benefit: "12% OFF",              desc: "Paisagismo e manutenção de áreas verdes.",                    initials: "JV", av: ["#2E9E5B","#176B3A"] },
];

const PT_LINKS: any[] = [
  { id: "l1", label: "Mariana Costa · Apto Boa Viagem",       type: "cliente" },
  { id: "l2", label: "João Pedro · Casa Candeias",             type: "cliente" },
  { id: "l3", label: "Cód 48213 · Apto Boa Viagem",           type: "imovel"  },
  { id: "l4", label: "Cód 49802 · Sala comercial Pina",        type: "imovel"  },
];

// ── COMPONENTS (parcerias.jsx) ────────────────────────────────
function CatTag({ cat }: { cat: string }) {
  const m = PT_CAT_COLOR[cat] || { c: pal.g500, bg: pal.g100 };
  return <span style={{ fontSize: 10.5, fontWeight: 700, color: m.c, background: m.bg, borderRadius: 999, padding: "2px 9px" }}>{cat}</span>;
}

function PartnerCard({ p, onAcionar }: { p: any; onAcionar: (p: any) => void }) {
  return (
    <div style={{ background: "#fff", border: `1px solid ${pal.g300}`, borderRadius: 16, padding: 18, display: "flex", flexDirection: "column", transition: "box-shadow .15s ease, transform .15s ease" }}
      onMouseEnter={(e: any) => { e.currentTarget.style.boxShadow = "var(--shadow-lg)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={(e: any) => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "none"; }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 13 }}>
        <span style={{ width: 48, height: 48, flexShrink: 0, borderRadius: 13, background: `linear-gradient(135deg, ${p.av[0]}, ${p.av[1]})`, display: "grid", placeItems: "center", color: "#fff" }}><Ic n={p.icon} s={22} c="#fff" /></span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: pal.ink }}>{p.name}</div>
          <div style={{ marginTop: 3 }}><CatTag cat={p.cat} /></div>
        </div>
      </div>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 6, alignSelf: "flex-start", background: "#E6F4EC", color: "#1E7A43", borderRadius: 999, padding: "5px 12px", fontSize: 13, fontWeight: 700, marginBottom: 11 }}>
        <Ic n="badge-percent" s={15} c="#2E9E5B" /> {p.benefit} <span style={{ fontWeight: 500, opacity: .8 }}>· clientes da {demo.nomeCurto}</span>
      </div>
      <div style={{ fontSize: 13, color: pal.g700, lineHeight: 1.5, marginBottom: 16, flex: 1 }}>{p.desc}</div>
      <button onClick={() => onAcionar(p)} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, border: "none", background: pal.primary, color: "#fff", borderRadius: 11, padding: "11px", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 14, boxShadow: "var(--shadow-purple)" }}>
        <Ic n="send" s={16} c="#fff" /> Acionar
      </button>
    </div>
  );
}

function AcionarModal({ p, isMobile, onClose, onSent }: { p: any; isMobile: boolean; onClose: () => void; onSent?: (p: any) => void }) {
  const [link, setLink] = React.useState("");
  const [obs,  setObs]  = React.useState("");
  const [sent, setSent] = React.useState(false);

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 8000, background: "rgba(28,22,40,.5)", display: "grid", placeItems: isMobile ? "stretch" : "center", padding: isMobile ? 0 : 24 }}>
      <div onClick={(e: any) => e.stopPropagation()} style={{ width: isMobile ? "100%" : 460, maxWidth: "100%", height: isMobile ? "100%" : "auto", maxHeight: isMobile ? "100%" : "92vh", background: "#fff", borderRadius: isMobile ? 0 : 18, overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "var(--shadow-lg)" }}>
        {sent ? (
          <div style={{ padding: "40px 24px", textAlign: "center", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#E6F4EC", display: "grid", placeItems: "center", margin: "0 auto 16px" }}><Ic n="check" s={30} c="#2E9E5B" /></div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 19, color: pal.ink }}>Solicitação enviada</div>
            <div style={{ fontSize: 13.5, color: pal.g500, marginTop: 6, lineHeight: 1.5 }}><strong>{p.name}</strong> entrará em contato — e o desconto <strong style={{ color: "#1E7A43" }}>{p.benefit}</strong> já está aplicado.</div>
            <button onClick={onClose} style={{ marginTop: 22, alignSelf: "center", border: "none", background: pal.primary, color: "#fff", borderRadius: 11, padding: "12px 28px", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 14, boxShadow: "var(--shadow-purple)" }}>Concluir</button>
          </div>
        ) : (
          <React.Fragment>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 18px", borderBottom: `1px solid ${pal.g100}` }}>
              <span style={{ width: 44, height: 44, flexShrink: 0, borderRadius: 12, background: `linear-gradient(135deg, ${p.av[0]}, ${p.av[1]})`, display: "grid", placeItems: "center", color: "#fff" }}><Ic n={p.icon} s={21} c="#fff" /></span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: pal.ink }}>{p.name}</div>
                <div style={{ fontSize: 12.5, color: "#1E7A43", fontWeight: 600 }}>{p.benefit} · clientes da {demo.nomeCurto}</div>
              </div>
              <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: 10, border: "none", background: pal.g100, display: "grid", placeItems: "center", cursor: "pointer" }}><Ic n="x" s={19} c={pal.g700} /></button>
            </div>
            <div style={{ padding: 18, flex: 1, overflowY: "auto" }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: pal.g700, marginBottom: 7 }}>Vincular a um imóvel ou cliente <span style={{ color: pal.g500, fontWeight: 400 }}>(opcional)</span></div>
              <div style={{ position: "relative", marginBottom: 16 }}>
                <select value={link} onChange={(e: any) => setLink(e.target.value)} style={{ width: "100%", appearance: "none" as any, border: `1px solid ${pal.g300}`, borderRadius: 10, padding: "11px 38px 11px 13px", fontFamily: "var(--font-body)", fontSize: 14, color: link ? pal.ink : pal.g500, outline: "none", background: "#fff", cursor: "pointer" }}>
                  <option value="">Não vincular</option>
                  {PT_LINKS.map((l: any) => <option key={l.id} value={l.label}>{l.label}</option>)}
                </select>
                <Ic n="chevron-down" s={17} c={pal.g500} style={{ position: "absolute", right: 13, top: 13, pointerEvents: "none" } as React.CSSProperties} />
              </div>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: pal.g700, marginBottom: 7 }}>Observação <span style={{ color: pal.g500, fontWeight: 400 }}>(opcional)</span></div>
              <textarea value={obs} onChange={(e: any) => setObs(e.target.value)} rows={3} placeholder="Detalhe o que precisa — o parceiro já recebe com contexto." style={{ width: "100%", border: `1px solid ${pal.g300}`, borderRadius: 10, padding: "11px 13px", fontFamily: "var(--font-body)", fontSize: 14, lineHeight: 1.5, color: pal.ink, outline: "none", resize: "vertical" }} />
              <div style={{ display: "flex", gap: 9, marginTop: 14, background: pal.lilac1, border: `1px solid ${pal.lilac2}`, borderRadius: 11, padding: "11px 13px", fontSize: 12.5, color: pal.g700 }}>
                <Ic n="shield-check" s={16} c={pal.primary} style={{ flexShrink: 0, marginTop: 1 }} /> <span>Fica tudo registrado: o parceiro recebe seu contato e o cliente garante o benefício pela {demo.nomeCurto}.</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, padding: "14px 18px", borderTop: `1px solid ${pal.g100}` }}>
              <button onClick={onClose} style={{ border: `1px solid ${pal.g300}`, background: "#fff", borderRadius: 11, padding: "12px 18px", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 14, color: pal.g700 }}>Cancelar</button>
              <button onClick={() => { setSent(true); onSent && onSent(p); }} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, border: "none", background: pal.primary, color: "#fff", borderRadius: 11, padding: "12px", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 14, boxShadow: "var(--shadow-purple)" }}><Ic n="send" s={16} c="#fff" /> Enviar solicitação</button>
            </div>
          </React.Fragment>
        )}
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
      <div style={{ display: "flex", gap: 8, marginBottom: 22 }}>{[0,1,2,3].map(i => <div key={i} className="sk" style={{ height: 38, width: 130, borderRadius: 999 }} />)}</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>{[0,1,2,3,4,5].map(i => <div key={i} className="sk" style={{ height: 210, borderRadius: 16 }} />)}</div>
    </div>
  );
}

// ── PAGE ──────────────────────────────────────────────────────
export default function ParceriasPage() {
  const [isMobile, setIsMobile] = React.useState(false);
  const [loading, setLoading]   = React.useState(true);
  const [cat, setCat]           = React.useState("Todos");
  const [acionar, setAcionar]   = React.useState<any>(null);
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

  const partners = cat === "Todos" ? PT_PARTNERS : PT_PARTNERS.filter((p: any) => p.cat === cat);

  const content = loading ? <Skeleton /> : (
    <div style={{ padding: isMobile ? "16px" : 28, maxWidth: 1120, margin: "0 auto" }}>
      {!isMobile && (
        <div style={{ marginBottom: 18 }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 26, margin: 0, color: pal.ink, letterSpacing: "-0.01em" }}>Parcerias</h2>
          <p style={{ fontSize: 13.5, color: pal.g500, margin: "4px 0 0" }}>Parceiros com condições especiais para clientes da {demo.nome}.</p>
        </div>
      )}
      {/* category filters */}
      <div className="hide-scroll" style={{ display: "flex", gap: 8, marginBottom: 20, overflowX: "auto", paddingBottom: 2 }}>
        {PT_CATS.map((c: any) => {
          const on = cat === c.k;
          return (
            <button key={c.k} onClick={() => setCat(c.k)} style={{ flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 7, border: on ? `1px solid ${pal.primary}` : `1px solid ${pal.g300}`, background: on ? pal.primary : "#fff", color: on ? "#fff" : pal.g700, borderRadius: 999, padding: "9px 16px", cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 13.5, fontWeight: 600, whiteSpace: "nowrap" }}>
              <Ic n={c.icon} s={16} c={on ? "#fff" : pal.g500} /> {c.k}
            </button>
          );
        })}
      </div>
      {/* grid */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
        {partners.map((p: any) => <PartnerCard key={p.id} p={p} onAcionar={setAcionar} />)}
      </div>
      <div style={{ textAlign: "center", fontSize: 11.5, color: pal.g500, padding: "20px 0 8px" }}>
        <Ic n="shield-check" s={12} c={pal.g500} style={{ verticalAlign: "middle", marginRight: 4 }} /> Parceiros e descontos curados pela {demo.nome}.
      </div>
    </div>
  );

  return (
    <CorretorChrome title="Parcerias" subtitle={`Serviços parceiros com desconto para clientes da ${demo.nomeCurto}.`} searchPlaceholder="Buscar parceiro ou serviço">
      {content}
      {acionar && <AcionarModal p={acionar} isMobile={isMobile} onClose={() => setAcionar(null)} onSent={() => fire("Solicitação enviada ao parceiro", "send")} />}
      <Toast toast={toast} />
    </CorretorChrome>
  );
}
