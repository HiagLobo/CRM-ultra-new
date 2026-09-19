"use client";
import * as React from "react";
import CorretorChrome, { pal, Ic } from "@/components/corretor/CorretorChrome";
import { demo } from "@/config/demo";
import { useRouter } from "next/navigation";

/* ============================================================
   IMÓVEIS — Carteira + Wizard de cadastro
   Porte fiel de imoveis-data.jsx + imoveis-carteira.jsx +
   imoveis-wizard.jsx + imoveis-steps.jsx + imoveis-steps2.jsx
   ============================================================ */

/* ---- Toast ---- */
interface ToastT { id: number; msg: string; icon?: string }
function ImToast({ toast }: { toast: ToastT | null }) {
  if (!toast) return null;
  return (
    <div key={toast.id} style={{ position: "fixed", bottom: 26, left: "50%", transform: "translateX(-50%)", zIndex: 9000, display: "flex", alignItems: "center", gap: 10, background: pal.ink, color: "#fff", borderRadius: 12, padding: "12px 18px", boxShadow: "var(--shadow-lg)", fontFamily: "var(--font-body)", fontSize: 13.5, fontWeight: 500, animation: "toastUp .26s cubic-bezier(.2,.7,.3,1)", maxWidth: 440 }}>
      <span style={{ width: 26, height: 26, borderRadius: "50%", background: "rgba(255,255,255,.14)", display: "grid", placeItems: "center", flexShrink: 0 }}><Ic n={toast.icon || "check"} s={15} c="#fff" /></span>
      <span>{toast.msg}</span>
    </div>
  );
}

/* ============================================================
   DATA
   ============================================================ */
const IM_STATUS: Record<string, { c: string; bg: string; dot: string }> = {
  "Rascunho":   { c: "#807C8A", bg: "#F2F1F5", dot: "#807C8A" },
  "Em análise": { c: "#B8860B", bg: "#FBF1DC", dot: "#E0A82E" },
  "Devolvido":  { c: "#C0392B", bg: "#FAE5E5", dot: "#D64545" },
  "Ativo":      { c: "#1E7A43", bg: "#E6F4EC", dot: "#2E9E5B" },
  "Reservado":  { c: "#4F46E5", bg: "#E0E7FF", dot: "#4F46E5" },
  "Vendido":    { c: "#4A4754", bg: "#E7E6EB", dot: "#4A4754" },
};

const IM_COVER: Record<string, [string, string]> = {
  Residencial:    ["#6366F1", "#312E81"],
  Comercial:      ["#2563A8", "#163A5C"],
  Industrial:     ["#5A6B8C", "#2E3A52"],
  Terreno:        ["#3B7A57", "#1E4533"],
  Empreendimento: ["#B5632F", "#7A3B16"],
};

const IM_PROPS: any[] = [
  { id: "p1", title: "Apto 3 quartos · Boa Viagem", price: "R$ 890.000", type: "Residencial", subtype: "Apartamento", bairro: "Boa Viagem · Recife", code: "48213", status: "Ativo", fotos: 28, fin: "Venda", portais: ["ZAP", "VivaReal", "OLX"], icon: "building-2", destaque: true },
  { id: "p2", title: "Casa · Candeias", price: "R$ 620.000", type: "Residencial", subtype: "Casa", bairro: "Candeias · Jaboatão", code: "50127", status: "Em análise", fotos: 22, fin: "Venda", portais: ["ZAP", "VivaReal"], icon: "home" },
  { id: "p3", title: "Sala comercial · Pina", price: "R$ 380.000", type: "Comercial", subtype: "Sala/Conjunto", bairro: "Pina · Recife", code: "49802", status: "Ativo", fotos: 16, fin: "Venda", portais: ["ZAP"], icon: "briefcase" },
  { id: "p4", title: "Galpão industrial · Jaboatão", price: "R$ 2.100.000", type: "Industrial", subtype: "Galpão", bairro: "Prazeres · Jaboatão", code: "47120", status: "Ativo", fotos: 19, fin: "Venda", portais: ["ZAP", "VivaReal"], icon: "factory" },
  { id: "p5", title: "Terreno 450m² · Aldeia", price: "R$ 310.000", type: "Terreno", subtype: "Lote", bairro: "Aldeia · Camaragibe", code: "51344", status: "Devolvido", motivo: "Faltam fotos (8/15) e a metragem do lote.", fotos: 8, fin: "Venda", portais: [], icon: "trees" },
  { id: "p6", title: "Cobertura · Boa Viagem", price: "R$ 1.450.000", type: "Residencial", subtype: "Cobertura", bairro: "Boa Viagem · Recife", code: "47710", status: "Reservado", fotos: 31, fin: "Venda", portais: ["ZAP", "VivaReal", "OLX"], icon: "building" },
];

const IM_CATEGORIES: any[] = [
  { k: "Residencial", icon: "home", subs: ["Apartamento", "Apartamento Duplex", "Cobertura", "Studio", "Loft", "Kitnet", "Casa", "Casa de vila", "Casa em condomínio", "Sobrado", "Prédio inteiro"] },
  { k: "Comercial", icon: "briefcase", subs: ["Sala comercial", "Loja", "Ponto comercial", "Casa comercial", "Prédio comercial", "Laje corporativa", "Coworking", "Box", "Depósito", "Hotel/Pousada", "Built to Suit"] },
  { k: "Industrial", icon: "factory", subs: ["Galpão", "Galpão industrial", "Galpão para condomínio", "Condomínio industrial", "Pavilhão", "Loteamento industrial"] },
  { k: "Terreno", icon: "trees", subs: ["Terreno", "Terreno comercial", "Terreno industrial", "Lote", "Terreno em condomínio", "Área"] },
  { k: "Rural", icon: "tractor", subs: ["Sítio", "Chácara", "Fazenda", "Área rural"] },
  { k: "Empreendimento", icon: "building-2", subs: ["Lançamento", "Em obras", "Pronto para morar"] },
];

const IM_FINS = ["Venda", "Aluguel", "Temporada"];

const IM_FEATURES: Record<string, any[]> = {
  Residencial: [
    { row: ["dorm", "Dormitórios", "stepper"] },
    { row: ["suites", "Suítes", "stepper"] },
    { row: ["banheiros", "Banheiros", "stepper"] },
    { row: ["vagas", "Vagas", "stepper"] },
    { row: ["areaUtil", "Área útil (m²)", "number"] },
    { row: ["areaTotal", "Área total (m²)", "number"] },
    { row: ["andar", "Andar", "number"] },
    { row: ["mobiliado", "Mobiliado", "toggle"] },
    { row: ["pet", "Aceita pet", "toggle"] },
    { row: ["lazer", "Lazer do condomínio", "chips", ["Piscina", "Academia", "Salão de festas", "Playground", "Churrasqueira", "Portaria 24h", "Quadra", "Sauna"]] },
  ],
  Comercial: [
    { row: ["area", "Área (m²)", "number"] },
    { row: ["peDireito", "Pé-direito (m)", "number"] },
    { row: ["vagas", "Vagas", "stepper"] },
    { row: ["salas", "Salas", "stepper"] },
    { row: ["banheiros", "Banheiros", "stepper"] },
    { row: ["ar", "Ar-condicionado", "toggle"] },
    { row: ["vitrine", "Vitrine / alto fluxo", "toggle"] },
  ],
  Industrial: [
    { row: ["areaTerreno", "Área do terreno (m²)", "number"] },
    { row: ["areaConstruida", "Área construída (m²)", "number"] },
    { row: ["peDireito", "Pé-direito (m)", "number"] },
    { row: ["docas", "Docas", "stepper"] },
    { row: ["energia", "Energia (kVA)", "number"] },
    { row: ["trifasica", "Energia trifásica", "toggle"] },
    { row: ["zoneamento", "Zoneamento", "text"] },
    { row: ["caminhao", "Acesso de caminhão", "toggle"] },
  ],
  Terreno: [
    { row: ["area", "Área (m²)", "number"] },
    { row: ["frente", "Frente (m)", "number"] },
    { row: ["fundo", "Fundo (m)", "number"] },
    { row: ["topografia", "Topografia", "text"] },
    { row: ["zoneamento", "Zoneamento", "text"] },
    { row: ["esquina", "Esquina", "toggle"] },
    { row: ["murado", "Murado", "toggle"] },
  ],
  Rural: [
    { row: ["areaTotal", "Área total (m²/ha)", "number"] },
    { row: ["areaConstruida", "Área construída (m²)", "number"] },
    { row: ["dorm", "Dormitórios", "stepper"] },
    { row: ["banheiros", "Banheiros", "stepper"] },
    { row: ["agua", "Água (poço/nascente)", "toggle"] },
    { row: ["energia", "Energia elétrica", "toggle"] },
    { row: ["benfeitorias", "Benfeitorias", "chips", ["Casa sede", "Curral", "Pomar", "Açude", "Pasto", "Cerca"]] },
  ],
  Empreendimento: [
    { row: ["nome", "Nome do empreendimento", "text"] },
    { row: ["construtora", "Construtora", "text"] },
    { row: ["entrega", "Previsão de entrega", "text"] },
    { row: ["unidades", "Nº de unidades", "number"] },
    { row: ["torres", "Nº de torres", "number"] },
    { row: ["lazer", "Lazer", "chips", ["Piscina", "Academia", "Salão de festas", "Playground", "Coworking", "Pet place"]] },
  ],
};

const IM_DESCRIPTIONS = [
  { title: "Apartamento 3 quartos com suíte e vista em Boa Viagem", body: "Apartamento de 110m² com 3 quartos, sendo 1 suíte, e 2 vagas de garagem, em Boa Viagem. Varanda com vista, próximo à orla e a comércios. Condomínio com lazer completo." },
  { title: "Apto 110m² · 3 quartos · 2 vagas · Boa Viagem (Recife)", body: "Excelente apartamento em Boa Viagem com 110m², 3 dormitórios (1 suíte), 2 vagas e varanda. Localização privilegiada a poucos minutos da praia, com fácil acesso a escolas, mercados e restaurantes." },
  { title: "Viva em Boa Viagem: 3 quartos, suíte e varanda", body: "Apartamento bem distribuído de 110m² em Boa Viagem: 3 quartos com suíte, 2 vagas e varanda integrada. Pronto para morar, perto da orla. Aceita financiamento." },
];

/* ============================================================
   CARTEIRA COMPONENTS
   ============================================================ */
function StatusSeal({ status, onCover }: { status: string; onCover?: boolean }) {
  const m = IM_STATUS[status] || IM_STATUS["Rascunho"];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: onCover ? "rgba(255,255,255,.94)" : m.bg, color: m.c, fontSize: 11, fontWeight: 700, borderRadius: 999, padding: "3px 9px", boxShadow: onCover ? "var(--shadow-sm)" : "none" }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: m.dot }} /> {status}
    </span>
  );
}

function PropCover({ p, h, bare }: { p: any; h?: any; bare?: boolean }) {
  const hVal = h ?? 158;
  const g = IM_COVER[p.type] || IM_COVER.Residencial;
  return (
    <div style={{ height: hVal, background: `linear-gradient(135deg, ${g[0]}, ${g[1]})`, position: "relative", display: "grid", placeItems: "center", overflow: "hidden" }}>
      <Ic n={p.icon || "building-2"} s={bare ? 28 : 40} c="rgba(255,255,255,.55)" />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,.12), rgba(0,0,0,0) 38%, rgba(0,0,0,.28))" }} />
      {!bare && <span style={{ position: "absolute", top: 10, left: 10 }}><StatusSeal status={p.status} onCover /></span>}
      {!bare && p.destaque && (
        <span style={{ position: "absolute", top: 10, right: 10, display: "inline-flex", alignItems: "center", gap: 4, background: "rgba(255,255,255,.94)", color: "#B8860B", fontSize: 10.5, fontWeight: 700, borderRadius: 999, padding: "3px 8px", boxShadow: "var(--shadow-sm)" }}>
          <Ic n="star" s={12} c="#E0A82E" /> Destaque
        </span>
      )}
      <span style={{ position: "absolute", bottom: bare ? 6 : 10, left: bare ? 6 : 10, display: "inline-flex", alignItems: "center", gap: 4, background: "rgba(28,22,40,.62)", backdropFilter: "blur(4px)", color: "#fff", fontSize: bare ? 10 : 11, fontWeight: 600, borderRadius: 7, padding: "3px 7px" }}>
        <Ic n="image" s={bare ? 11 : 13} c="#fff" /> {p.fotos}
      </span>
      {!bare && <span style={{ position: "absolute", bottom: 10, right: 10, fontSize: 10.5, fontWeight: 600, letterSpacing: ".04em", color: "rgba(255,255,255,.85)" }}>CÓD {p.code}</span>}
    </div>
  );
}

function ActionBtn({ icon, label, onClick, primary }: { icon: string; label: string; onClick: () => void; primary?: boolean }) {
  return (
    <button onClick={onClick} title={label} style={{
      display: "flex", alignItems: "center", justifyContent: "center", gap: 6, height: 34, flex: primary ? 1 : "0 0 34px" as any,
      border: primary ? "none" : `1px solid ${pal.g300}`, background: primary ? pal.primary : "#fff", color: primary ? "#fff" : pal.g700,
      borderRadius: 9, cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 12.5,
    }}
      onMouseEnter={(e: any) => { if (!primary) { e.currentTarget.style.background = pal.lilac1; e.currentTarget.style.borderColor = pal.lilac2; } }}
      onMouseLeave={(e: any) => { if (!primary) { e.currentTarget.style.background = "#fff"; e.currentTarget.style.borderColor = pal.g300; } }}>
      <Ic n={icon} s={15} c={primary ? "#fff" : pal.g700} />{primary && label}
    </button>
  );
}

function Portais({ list }: { list: string[] }) {
  if (!list || !list.length) return null;
  return (
    <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
      {list.map(pt => <span key={pt} style={{ fontSize: 10.5, fontWeight: 600, color: pal.g500, background: pal.g100, borderRadius: 6, padding: "2px 7px" }}>{pt}</span>)}
    </div>
  );
}

function PropCard({ p, onEdit, onToast }: { p: any; onEdit: (p: any) => void; onToast: (m: string, i?: string) => void }) {
  return (
    <div style={{ background: "#fff", border: `1px solid ${pal.g300}`, borderRadius: 16, overflow: "hidden", display: "flex", flexDirection: "column", transition: "box-shadow .15s ease, transform .15s ease" }}
      onMouseEnter={(e: any) => { e.currentTarget.style.boxShadow = "var(--shadow-lg)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={(e: any) => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "none"; }}>
      <PropCover p={p} />
      <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 9, flex: 1 }}>
        <div>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: pal.ink, lineHeight: 1.3 }}>{p.title}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 4, fontSize: 12.5, color: pal.g500 }}>
            <span>{p.subtype}</span><span style={{ color: pal.g300 }}>·</span><span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}><Ic n="map-pin" s={13} c={pal.g500} />{p.bairro}</span>
          </div>
        </div>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 19, color: pal.primary }}>{p.price}</div>
        {p.status === "Devolvido" && (
          <div style={{ display: "flex", gap: 8, background: pal.errorBg, border: "1px solid #F2C9C9", borderRadius: 10, padding: "9px 11px" }}>
            <Ic n="rotate-ccw" s={15} c={pal.error} style={{ flexShrink: 0, marginTop: 1 }} />
            <span style={{ fontSize: 12, color: "#9A3A3A", lineHeight: 1.4 }}><strong>Devolvido:</strong> {p.motivo}</span>
          </div>
        )}
        <Portais list={p.portais} />
        <div style={{ display: "flex", gap: 7, marginTop: "auto", paddingTop: 4 }}>
          {p.status === "Devolvido"
            ? <ActionBtn icon="pencil" label="Corrigir e reenviar" primary onClick={() => onEdit(p)} />
            : <ActionBtn icon="pencil" label="Editar" primary onClick={() => onEdit(p)} />}
          <ActionBtn icon="external-link" label="Ver no site" onClick={() => onToast("Abrindo no site público…", "external-link")} />
          <ActionBtn icon="qr-code" label="Gerar material (placa/QR)" onClick={() => onToast("Material gerado · placa e QR code", "qr-code")} />
          <ActionBtn icon="star" label="Destacar" onClick={() => onToast("Imóvel marcado como destaque", "star")} />
          <ActionBtn icon="copy" label="Duplicar" onClick={() => onToast("Imóvel duplicado como rascunho", "copy")} />
        </div>
      </div>
    </div>
  );
}

function PropRow({ p, onEdit, onToast }: { p: any; onEdit: (p: any) => void; onToast: (m: string, i?: string) => void }) {
  return (
    <div style={{ display: "flex", gap: 12, background: "#fff", border: `1px solid ${pal.g300}`, borderRadius: 14, padding: 12 }}
      onMouseEnter={(e: any) => e.currentTarget.style.background = pal.lilac1}
      onMouseLeave={(e: any) => e.currentTarget.style.background = "#fff"}>
      <div style={{ width: 104, flexShrink: 0, borderRadius: 10, overflow: "hidden", alignSelf: "stretch", minHeight: 96 }}><PropCover p={p} h={"100%"} bare /></div>
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 5 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14.5, color: pal.ink, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</span>
          <span style={{ flexShrink: 0 }}><StatusSeal status={p.status} /></span>
        </div>
        <div style={{ fontSize: 12, color: pal.g500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.subtype} · {p.bairro} · Cód {p.code} · {p.fotos} fotos</div>
        {p.status === "Devolvido" && <div style={{ fontSize: 12, color: pal.error, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}><strong>Devolvido:</strong> {p.motivo}</div>}
        <div style={{ marginTop: "auto", paddingTop: 4, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17, color: pal.primary, whiteSpace: "nowrap" }}>{p.price}</span>
          <div style={{ display: "flex", gap: 7, flexShrink: 0 }}>
            <span className="row-extra" style={{ display: "flex", gap: 7 }}>
              <ActionBtn icon="external-link" label="Ver no site" onClick={() => onToast("Abrindo no site público…", "external-link")} />
              <ActionBtn icon="qr-code" label="Material" onClick={() => onToast("Material gerado · placa e QR code", "qr-code")} />
            </span>
            <ActionBtn icon="pencil" label="Editar" primary onClick={() => onEdit(p)} />
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterChip({ label, value, active, onClick }: { label: string; value?: string; active?: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      display: "inline-flex", alignItems: "center", gap: 6, border: `1px solid ${active ? pal.primary : pal.g300}`,
      background: active ? pal.lilac2 : "#fff", color: active ? pal.primary : pal.g700, borderRadius: 999,
      padding: "7px 13px", cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600, whiteSpace: "nowrap",
    }}>
      {label}{value ? ": " + value : ""} <Ic n="chevron-down" s={15} c={active ? pal.primary : pal.g500} />
    </button>
  );
}

function Counter({ label, value, color, icon }: { label: string; value: number; color: { bg: string; c: string }; icon: string }) {
  return (
    <div style={{ flex: "1 1 150px", background: "#fff", border: `1px solid ${pal.g300}`, borderRadius: 14, padding: "14px 16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ width: 30, height: 30, borderRadius: 9, background: color.bg, display: "grid", placeItems: "center" }}><Ic n={icon} s={17} c={color.c} /></span>
        <span style={{ fontSize: 12.5, color: pal.g500, fontWeight: 600 }}>{label}</span>
      </div>
      <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 26, color: pal.ink, marginTop: 8 }}>{value}</div>
    </div>
  );
}

const STATUS_FILTERS = ["Todos", "Ativo", "Em análise", "Devolvido", "Reservado", "Rascunho", "Vendido"];

function Carteira({ onNew, onEdit, onToast }: { onNew: () => void; onEdit: (p: any) => void; onToast: (m: string, i?: string) => void }) {
  const [view, setView] = React.useState("grid");
  const [statusF, setStatusF] = React.useState("Todos");
  const [query, setQuery] = React.useState("");

  const props = IM_PROPS.filter(p => {
    if (statusF !== "Todos" && p.status !== statusF) return false;
    const q = query.trim().toLowerCase();
    if (q && !p.title.toLowerCase().includes(q) && !p.bairro.toLowerCase().includes(q) && !p.code.includes(q)) return false;
    return true;
  });
  const count = (s: string) => IM_PROPS.filter(p => p.status === s).length;

  return (
    <div style={{ padding: 28, maxWidth: 1240, margin: "0 auto" }}>
      {/* header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, marginBottom: 18, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 26, margin: 0, color: pal.ink, letterSpacing: "-0.01em" }}>Meus imóveis</h2>
          <p style={{ fontSize: 13.5, color: pal.g500, margin: "4px 0 0" }}>Sua carteira completa — cadastre, acompanhe a curadoria e gere material.</p>
        </div>
        <button onClick={onNew} style={{ display: "flex", alignItems: "center", gap: 8, border: "none", background: pal.primary, color: "#fff", borderRadius: 12, padding: "13px 20px", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 14.5, boxShadow: "var(--shadow-purple)" }}>
          <Ic n="plus" s={19} c="#fff" /> Novo imóvel
        </button>
      </div>

      {/* counters */}
      <div style={{ display: "flex", gap: 14, marginBottom: 18, flexWrap: "wrap" }}>
        <Counter label="Ativos" value={count("Ativo")} icon="circle-check" color={{ bg: "#E6F4EC", c: "#2E9E5B" }} />
        <Counter label="Em análise" value={count("Em análise")} icon="clock" color={{ bg: "#FBF1DC", c: "#E0A82E" }} />
        <Counter label="Devolvidos" value={count("Devolvido")} icon="rotate-ccw" color={{ bg: "#FAE5E5", c: "#D64545" }} />
        <Counter label="Total na carteira" value={IM_PROPS.length} icon="building-2" color={{ bg: "#E0E7FF", c: "#4F46E5" }} />
      </div>

      {/* search + filters */}
      <div style={{ background: "#fff", border: `1px solid ${pal.g300}`, borderRadius: 14, padding: 14, marginBottom: 18 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 220, display: "flex", alignItems: "center", gap: 8, background: pal.g100, borderRadius: 10, padding: "10px 14px" }}>
            <Ic n="search" s={18} c={pal.g500} />
            <input value={query} onChange={(e: any) => setQuery(e.target.value)} placeholder="Buscar por título, bairro ou código" style={{ flex: 1, border: "none", background: "transparent", outline: "none", fontFamily: "var(--font-body)", fontSize: 14, color: pal.ink }} />
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", background: pal.g100, borderRadius: 10, padding: 4 }}>
            {["grid", "list"].map(v => (
              <button key={v} onClick={() => setView(v)} title={v === "grid" ? "Grade" : "Lista"} style={{ width: 38, height: 34, borderRadius: 8, border: "none", background: view === v ? "#fff" : "transparent", boxShadow: view === v ? "var(--shadow-sm)" : "none", display: "grid", placeItems: "center", cursor: "pointer" }}>
                <Ic n={v === "grid" ? "layout-grid" : "list"} s={18} c={view === v ? pal.primary : pal.g500} />
              </button>
            ))}
          </div>
        </div>
        <div className="hide-scroll" style={{ display: "flex", gap: 8, marginTop: 12, overflowX: "auto" }}>
          {["Tipo", "Finalidade", "Portal", "Faixa de preço", "Bairro"].map(f => <FilterChip key={f} label={f} onClick={() => onToast("Filtro: " + f, "sliders-horizontal")} />)}
        </div>
        <div style={{ display: "flex", gap: 7, marginTop: 10, flexWrap: "wrap" }}>
          {STATUS_FILTERS.map(s => {
            const on = statusF === s;
            return (
              <button key={s} onClick={() => setStatusF(s)} style={{ border: on ? `1px solid ${pal.primary}` : `1px solid ${pal.g300}`, background: on ? pal.primary : "#fff", color: on ? "#fff" : pal.g700, fontFamily: "var(--font-body)", fontSize: 12.5, fontWeight: 600, borderRadius: 999, padding: "6px 13px", cursor: "pointer" }}>{s}</button>
            );
          })}
        </div>
      </div>

      {/* results */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{ fontSize: 13, color: pal.g500, fontWeight: 600 }}>{props.length} {props.length === 1 ? "imóvel" : "imóveis"}</span>
      </div>

      {props.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: pal.g500 }}>
          <Ic n="search-x" s={32} c={pal.g300} /><div style={{ marginTop: 12, fontSize: 14 }}>Nenhum imóvel encontrado com esses filtros.</div>
        </div>
      ) : view === "grid" ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 16 }}>
          {props.map(p => <PropCard key={p.id} p={p} onEdit={onEdit} onToast={onToast} />)}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {props.map(p => <PropRow key={p.id} p={p} onEdit={onEdit} onToast={onToast} />)}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   WIZARD COMPONENTS (field controls)
   ============================================================ */
function Tag({ kind }: { kind: string }) {
  const internal = kind === "interno";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 700, letterSpacing: ".03em", textTransform: "uppercase", borderRadius: 999, padding: "2px 7px",
      background: internal ? pal.g100 : "#E6F4EC", color: internal ? pal.g700 : "#1E7A43" }}>
      <Ic n={internal ? "lock" : "globe"} s={11} c={internal ? pal.g500 : "#2E9E5B"} /> {internal ? "Interno" : "Público"}
    </span>
  );
}

function Field({ label, children, hint, tag, full }: { label: string; children?: React.ReactNode; hint?: string; tag?: string; full?: boolean }) {
  return (
    <div style={{ gridColumn: full ? "1 / -1" : "auto", minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <span style={{ fontSize: 12.5, fontWeight: 600, color: pal.g700 }}>{label}</span>
        {tag && <Tag kind={tag} />}
      </div>
      {children}
      {hint && <div style={{ fontSize: 11.5, color: pal.g500, marginTop: 5, lineHeight: 1.4 }}>{hint}</div>}
    </div>
  );
}

const inputSt: React.CSSProperties = { width: "100%", border: `1px solid ${pal.g300}`, borderRadius: 10, padding: "11px 13px", fontFamily: "var(--font-body)", fontSize: 14, color: pal.ink, outline: "none", background: "#fff" };

function TextField({ value, onChange, placeholder, ...rest }: { value: any; onChange: (v: string) => void; placeholder?: string; [k: string]: any }) {
  return <input value={value || ""} onChange={(e: any) => onChange(e.target.value)} placeholder={placeholder} style={inputSt} {...rest} />;
}

function NumField({ value, onChange, placeholder, suffix }: { value: any; onChange: (v: string) => void; placeholder?: string; suffix?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", border: `1px solid ${pal.g300}`, borderRadius: 10, padding: "0 13px", background: "#fff" }}>
      <input value={value || ""} onChange={(e: any) => onChange(e.target.value)} placeholder={placeholder} inputMode="numeric" style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontFamily: "var(--font-body)", fontSize: 14, color: pal.ink, padding: "11px 0" }} />
      {suffix && <span style={{ fontSize: 12.5, color: pal.g500, fontWeight: 600 }}>{suffix}</span>}
    </div>
  );
}

function Stepper({ value, onChange }: { value: any; onChange: (v: number) => void }) {
  const v = Number(value) || 0;
  const btn2 = (d: number, ic: string) => (
    <button onClick={() => onChange(Math.max(0, v + d))} style={{ width: 38, height: 38, borderRadius: 9, border: `1px solid ${pal.g300}`, background: "#fff", display: "grid", placeItems: "center", cursor: "pointer" }}>
      <Ic n={ic} s={16} c={pal.g700} />
    </button>
  );
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      {btn2(-1, "minus")}
      <span style={{ minWidth: 28, textAlign: "center", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, color: pal.ink }}>{v}</span>
      {btn2(1, "plus")}
    </div>
  );
}

function Toggle({ value, onChange }: { value: any; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!value)} style={{ width: 46, height: 27, borderRadius: 999, border: "none", background: value ? pal.primary : pal.g300, position: "relative", cursor: "pointer", transition: "background .15s ease", flexShrink: 0 }}>
      <span style={{ position: "absolute", top: 3, left: value ? 22 : 3, width: 21, height: 21, borderRadius: "50%", background: "#fff", transition: "left .15s ease", boxShadow: "0 1px 3px rgba(0,0,0,.2)" }} />
    </button>
  );
}

function Chips({ options, value, onChange }: { options: string[]; value: any; onChange: (v: string[]) => void }) {
  const sel: string[] = value || [];
  const toggle = (o: string) => onChange(sel.includes(o) ? sel.filter((x: string) => x !== o) : [...sel, o]);
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {options.map(o => {
        const on = sel.includes(o);
        return (
          <button key={o} onClick={() => toggle(o)} style={{ display: "inline-flex", alignItems: "center", gap: 6, border: on ? `1.5px solid ${pal.primary}` : `1px solid ${pal.g300}`, background: on ? pal.lilac2 : "#fff", color: on ? pal.primary : pal.g700, borderRadius: 999, padding: on ? "6.5px 13px" : "7px 13px", cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 12.5, fontWeight: 600 }}>
            {on && <Ic n="check" s={13} c={pal.primary} />}{o}
          </button>
        );
      })}
    </div>
  );
}

function Section({ title, subtitle, tag, open, onToggle, children }: { title: string; subtitle?: string; tag?: string; open: boolean; onToggle: () => void; children?: React.ReactNode }) {
  return (
    <div style={{ border: `1px solid ${pal.g300}`, borderRadius: 14, overflow: "hidden", background: "#fff" }}>
      <button onClick={onToggle} style={{ width: "100%", display: "flex", alignItems: "center", gap: 11, border: "none", background: "transparent", cursor: "pointer", padding: "14px 16px", textAlign: "left" }}>
        <span style={{ width: 34, height: 34, flexShrink: 0, borderRadius: 9, background: pal.g100, display: "grid", placeItems: "center" }}><Ic n="lock" s={17} c={pal.g500} /></span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontWeight: 700, fontSize: 14, color: pal.ink }}>{title}</span>{tag && <Tag kind={tag} />}</div>
          {subtitle && <div style={{ fontSize: 12, color: pal.g500, marginTop: 2 }}>{subtitle}</div>}
        </div>
        <span style={{ display: "inline-flex", transition: "transform .2s ease", transform: open ? "rotate(180deg)" : "none" }}><Ic n="chevron-down" s={18} c={pal.g500} /></span>
      </button>
      {open && <div style={{ padding: "4px 16px 18px", borderTop: `1px solid ${pal.g100}` }}>{children}</div>}
    </div>
  );
}

const grid2: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 };

/* ============================================================
   WIZARD STEPS
   ============================================================ */
function StepTitle({ icon, title, sub }: { icon: string; title: string; sub?: string }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ width: 36, height: 36, borderRadius: 10, background: pal.lilac2, display: "grid", placeItems: "center" }}><Ic n={icon} s={19} c={pal.primary} /></span>
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 21, margin: 0, color: pal.ink, whiteSpace: "nowrap" }}>{title}</h2>
      </div>
      {sub && <p style={{ fontSize: 13.5, color: pal.g500, margin: "8px 0 0", lineHeight: 1.5 }}>{sub}</p>}
    </div>
  );
}

/* Step 0 — Tipo & finalidade */
function ImStep0({ form, set }: any) {
  const cat = IM_CATEGORIES.find((c: any) => c.k === form.category) || IM_CATEGORIES[0];
  return (
    <div>
      <StepTitle icon="layers" title="Tipo & finalidade" sub="Os campos do cadastro se adaptam ao tipo escolhido — você só vê o que importa." />
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: pal.g500, marginBottom: 10 }}>Categoria</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px,1fr))", gap: 10, marginBottom: 22 }}>
        {IM_CATEGORIES.map((c: any) => {
          const on = form.category === c.k;
          return (
            <button key={c.k} onClick={() => { set("category", c.k); set("subtype", c.subs[0]); }} style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 9, border: on ? `1.5px solid ${pal.primary}` : `1px solid ${pal.g300}`, background: on ? pal.lilac1 : "#fff", borderRadius: 13, padding: 14, cursor: "pointer", textAlign: "left" }}>
              <span style={{ width: 40, height: 40, borderRadius: 11, background: on ? pal.lilac2 : pal.g100, display: "grid", placeItems: "center" }}><Ic n={c.icon} s={21} c={on ? pal.primary : pal.g700} /></span>
              <span style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 14, color: on ? pal.primary : pal.ink }}>{c.k}</span>
            </button>
          );
        })}
      </div>
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: pal.g500, marginBottom: 10 }}>Subtipo</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 22 }}>
        {cat.subs.map((s: string) => {
          const on = form.subtype === s;
          return <button key={s} onClick={() => set("subtype", s)} style={{ border: on ? `1.5px solid ${pal.primary}` : `1px solid ${pal.g300}`, background: on ? pal.lilac2 : "#fff", color: on ? pal.primary : pal.g700, borderRadius: 999, padding: "8px 14px", cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600 }}>{s}</button>;
        })}
      </div>
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: pal.g500, marginBottom: 10 }}>Finalidade <span style={{ textTransform: "none", fontWeight: 500, color: pal.g500 }}>· pode marcar mais de uma</span></div>
      <Chips options={IM_FINS} value={form.fins} onChange={(v: string[]) => set("fins", v.length ? v : ["Venda"])} />
    </div>
  );
}

/* Step 1 — Endereço */
function ImStep1({ form, set, onToast }: any) {
  const [busy, setBusy] = React.useState(false);
  const buscarCep = () => {
    setBusy(true);
    setTimeout(() => {
      set("rua", "Rua Exemplo"); set("bairro", "Boa Viagem"); set("cidade", "Recife"); set("uf", "PE");
      setBusy(false); onToast("Endereço preenchido pelo CEP", "map-pin");
    }, 900);
  };
  return (
    <div>
      <StepTitle icon="map-pin" title="Endereço" sub="Digite o CEP e a gente preenche o resto. O número fica só no registro interno se você quiser." />
      <Field label="CEP" hint="Preenchimento automático via ViaCEP (gratuito).">
        <div style={{ display: "flex", gap: 10 }}>
          <input value={form.cep} onChange={(e: any) => set("cep", e.target.value)} placeholder="00000-000" style={{ flex: 1, border: `1px solid ${pal.g300}`, borderRadius: 10, padding: "11px 13px", fontFamily: "var(--font-body)", fontSize: 14, outline: "none" }} />
          <button onClick={buscarCep} style={{ display: "flex", alignItems: "center", gap: 7, border: "none", background: pal.primary, color: "#fff", borderRadius: 10, padding: "0 18px", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13.5 }}>
            {busy ? <React.Fragment><span className="rec-dot" style={{ width: 9, height: 9, borderRadius: "50%", background: "#fff" }} /> Buscando</React.Fragment> : <React.Fragment><Ic n="search" s={16} c="#fff" /> Buscar</React.Fragment>}
          </button>
        </div>
      </Field>
      <div className="wz-grid2" style={{ marginTop: 16 }}>
        <Field label="Rua / Logradouro" full><TextField value={form.rua} onChange={(v: string) => set("rua", v)} placeholder="Preenchido pelo CEP" /></Field>
        <Field label="Número"><TextField value={form.numero} onChange={(v: string) => set("numero", v)} placeholder="Ex.: 1200" /></Field>
        <Field label="Complemento"><TextField value={form.complemento} onChange={(v: string) => set("complemento", v)} placeholder="Apto / bloco" /></Field>
        <Field label="Bairro"><TextField value={form.bairro} onChange={(v: string) => set("bairro", v)} /></Field>
        <Field label="Cidade"><TextField value={form.cidade} onChange={(v: string) => set("cidade", v)} /></Field>
        <Field label="UF"><TextField value={form.uf} onChange={(v: string) => set("uf", v)} /></Field>
      </div>
      {/* map */}
      <div style={{ marginTop: 16 }}>
        <Field label="Ponto exato no mapa" hint="O CEP traz a rua; arraste o pin para marcar o edifício/terreno." />
        <div style={{ position: "relative", height: 200, borderRadius: 12, overflow: "hidden", border: `1px solid ${pal.g300}`,
          background: "repeating-linear-gradient(0deg, #EAEAF0 0 1px, transparent 1px 40px), repeating-linear-gradient(90deg, #EAEAF0 0 1px, transparent 1px 40px), linear-gradient(135deg, #F4F2F8, #EDEAF3)" }}>
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-100%)", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ width: 38, height: 38, borderRadius: "50% 50% 50% 0", transform: "rotate(-45deg)", background: pal.primary, display: "grid", placeItems: "center", boxShadow: "var(--shadow-md)" }}><Ic n="home" s={17} c="#fff" style={{ transform: "rotate(45deg)" }} /></span>
          </div>
          <span style={{ position: "absolute", bottom: 12, left: 12, display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,.92)", borderRadius: 8, padding: "6px 11px", fontSize: 12, color: pal.g700, fontWeight: 600, boxShadow: "var(--shadow-sm)" }}><Ic n="move" s={14} c={pal.primary} /> Arraste o pin para ajustar</span>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 16, background: "#fff", border: `1px solid ${pal.g300}`, borderRadius: 12, padding: "13px 15px" }}>
        <Toggle value={form.ocultarNumero} onChange={(v: boolean) => set("ocultarNumero", v)} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: pal.ink }}>Ocultar número e condomínio no anúncio</div>
          <div style={{ fontSize: 12, color: pal.g500, marginTop: 1 }}>Publicamente mostra só o bairro. O endereço exato fica interno.</div>
        </div>
      </div>
    </div>
  );
}

/* Step 2 — Características */
function ImStep2({ form, setFeat }: any) {
  const fields = IM_FEATURES[form.category] || IM_FEATURES.Residencial;
  return (
    <div>
      <StepTitle icon="ruler" title="Características" sub={`Campos específicos para ${(form.category as string).toLowerCase()} — terreno não tem suíte, galpão tem pé-direito.`} />
      <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: pal.lilac2, color: pal.primary, borderRadius: 999, padding: "5px 12px", fontSize: 12.5, fontWeight: 600, marginBottom: 18 }}>
        <Ic n="sparkles" s={14} c={pal.primary} /> Formulário adaptado a {form.category} · {form.subtype}
      </div>
      <div className="wz-grid2">
        {fields.map(({ row }: any) => {
          const [k, label, kind, opts] = row;
          const v = form.features[k];
          const full = kind === "chips";
          return (
            <Field key={k} label={label} full={full}>
              {kind === "stepper" ? <Stepper value={v} onChange={(x: number) => setFeat(k, x)} />
                : kind === "toggle" ? <Toggle value={v} onChange={(x: boolean) => setFeat(k, x)} />
                : kind === "number" ? <NumField value={v} onChange={(x: string) => setFeat(k, x)} placeholder="0" />
                : kind === "chips" ? <Chips options={opts} value={v || []} onChange={(x: string[]) => setFeat(k, x)} />
                : <TextField value={v} onChange={(x: string) => setFeat(k, x)} />}
            </Field>
          );
        })}
      </div>
    </div>
  );
}

/* Step 3 — Fotos & mídia */
function ImStep3({ form, set, onToast }: any) {
  const fotos = form.fotos;
  const ok = fotos >= 15;
  const tiles = Math.min(fotos, 11);
  const addFotos = () => { set("fotos", fotos + 6); onToast("6 fotos adicionadas", "image"); };
  return (
    <div>
      <StepTitle icon="image" title="Fotos & mídia" sub="Boas fotos reduzem devolução na curadoria e vendem mais rápido." />
      <div style={{ display: "flex", gap: 10, background: pal.lilac1, border: `1px solid ${pal.lilac2}`, borderRadius: 12, padding: "12px 14px", marginBottom: 16 }}>
        <Ic n="lightbulb" s={18} c={pal.primary} style={{ flexShrink: 0, marginTop: 1 }} />
        <span style={{ fontSize: 12.5, color: pal.g700, lineHeight: 1.5 }}>Dica: fotos <strong>na horizontal</strong>, com boa luz, sem print de tela. O ideal são ~30 fotos cobrindo todos os cômodos.</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: ok ? pal.success : "#9A6B0E" }}>{fotos} de 15 fotos {ok ? "· liberado" : "mínimas"}</span>
            <span style={{ fontSize: 12, color: pal.g500 }}>ideal ~30</span>
          </div>
          <div style={{ height: 7, borderRadius: 999, background: pal.g100, overflow: "hidden" }}>
            <div style={{ height: "100%", width: Math.min(100, (fotos / 15) * 100) + "%", borderRadius: 999, background: ok ? pal.success : pal.warning, transition: "width .3s ease" }} />
          </div>
        </div>
      </div>
      {!ok && (
        <div style={{ display: "flex", gap: 9, background: pal.warningBg, border: "1px solid #F0DCA8", borderRadius: 10, padding: "10px 13px", marginBottom: 16, fontSize: 12.5, color: "#8A5F0C" }}>
          <Ic n="alert-triangle" s={16} c="#C08A1E" style={{ flexShrink: 0, marginTop: 1 }} />
          <span>Faltam <strong>{15 - fotos} fotos</strong> para liberar o envio à análise (mínimo dos portais).</span>
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px,1fr))", gap: 10, marginBottom: 18 }}>
        {Array.from({ length: tiles }).map((_, i) => {
          const g = IM_COVER[form.category] || IM_COVER.Residencial;
          return (
            <div key={i} style={{ position: "relative", aspectRatio: "4/3", borderRadius: 10, background: `linear-gradient(135deg, ${g[0]}, ${g[1]})`, display: "grid", placeItems: "center", overflow: "hidden" }}>
              <Ic n="image" s={20} c="rgba(255,255,255,.5)" />
              {i === 0 && <span style={{ position: "absolute", top: 6, left: 6, background: "rgba(255,255,255,.94)", color: pal.primary, fontSize: 9.5, fontWeight: 700, borderRadius: 6, padding: "2px 7px" }}>CAPA</span>}
              <span style={{ position: "absolute", top: 6, right: 6, width: 18, height: 18, borderRadius: 5, background: "rgba(28,22,40,.5)", display: "grid", placeItems: "center", cursor: "grab" }}><Ic n="grip-vertical" s={11} c="#fff" /></span>
            </div>
          );
        })}
        {fotos > 11 && <div style={{ aspectRatio: "4/3", borderRadius: 10, background: pal.g100, display: "grid", placeItems: "center", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: pal.g500 }}>+{fotos - 11}</div>}
        <button onClick={addFotos} style={{ aspectRatio: "4/3", borderRadius: 10, border: `1.5px dashed ${pal.g300}`, background: pal.lilac1, display: "flex", flexDirection: "column", gap: 4, alignItems: "center", justifyContent: "center", cursor: "pointer", color: pal.primary }}>
          <Ic n="plus" s={22} c={pal.primary} /><span style={{ fontSize: 11.5, fontWeight: 600 }}>Adicionar</span>
        </button>
      </div>
      <div className="wz-grid2">
        <Field label="Vídeo (link)" tag="publico"><TextField value={form.video} onChange={(v: string) => set("video", v)} placeholder="YouTube ou Vimeo" /></Field>
        <Field label="Tour 360° (link)" tag="publico"><TextField value={form.tour360} onChange={(v: string) => set("tour360", v)} placeholder="Matterport, Kuula…" /></Field>
      </div>
    </div>
  );
}

/* Step 4 — Valores & condições */
function ImStep4({ form, set }: any) {
  return (
    <div>
      <StepTitle icon="wallet" title="Valores & condições" sub="O que é público vai pro anúncio. O que é interno fica só pra você e a casa." />
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <Ic n="globe" s={16} c="#2E9E5B" /><span style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: pal.g500 }}>Públicos · vão para o anúncio</span>
      </div>
      <div className="wz-grid2" style={{ marginBottom: 18 }}>
        <Field label="Preço de venda" tag="publico"><NumField value={form.preco} onChange={(v: string) => set("preco", v)} placeholder="0" suffix="R$" /></Field>
        <Field label="Condomínio" tag="publico"><NumField value={form.condominio} onChange={(v: string) => set("condominio", v)} placeholder="0" suffix="R$/mês" /></Field>
        <Field label="IPTU" tag="publico"><NumField value={form.iptu} onChange={(v: string) => set("iptu", v)} placeholder="0" suffix="R$/mês" /></Field>
        <Field label="Aceita financiamento" tag="publico"><div style={{ height: 44, display: "flex", alignItems: "center" }}><Toggle value={form.financiamento} onChange={(v: boolean) => set("financiamento", v)} /></div></Field>
      </div>
      <Section title="Dados internos" subtitle="Proprietário e permuta — nunca publicados." tag="interno" open={form.internalOpen} onToggle={() => set("internalOpen", !form.internalOpen)}>
        <div className="wz-grid2" style={{ paddingTop: 12 }}>
          <Field label="Proprietário" tag="interno" full><TextField value={form.proprietario} onChange={(v: string) => set("proprietario", v)} placeholder="Nome do proprietário" /></Field>
          <Field label="Contato do proprietário" tag="interno" full hint={`Opcional. Só será necessário na etapa de fechamento — o lead é da ${demo.nomeCurto}, o imóvel é seu.`}>
            <TextField value={form.contatoProprietario} onChange={(v: string) => set("contatoProprietario", v)} placeholder="Opcional · pode deixar em branco" />
          </Field>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 14, background: pal.lilac1, border: `1px solid ${pal.lilac2}`, borderRadius: 11, padding: "12px 14px" }}>
          <Toggle value={form.permuta} onChange={(v: boolean) => set("permuta", v)} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: pal.ink }}>Aceita permuta</div>
            <div style={{ fontSize: 12, color: pal.g500, marginTop: 1 }}>O que aceita pode ser público; os detalhes (valores, ano do veículo) ficam internos.</div>
          </div>
        </div>
        {form.permuta && <div style={{ marginTop: 12 }}><Chips options={["Veículo", "Imóvel", "Outros"]} value={form.permutaTipos} onChange={(v: string[]) => set("permutaTipos", v)} /></div>}
      </Section>
    </div>
  );
}

/* Step 5 — Dados complementares */
function ImStep5({ form, set }: any) {
  return (
    <div>
      <StepTitle icon="clipboard-list" title="Dados complementares" sub="Tudo interno e opcional. Quem tem pressa pula; quem quiser, preenche." />
      <Section title="Registro e inscrições" subtitle="Matrícula, zona, inscrições e chaves — restritos." tag="interno" open={form.complementOpen} onToggle={() => set("complementOpen", !form.complementOpen)}>
        <div className="wz-grid2" style={{ paddingTop: 12 }}>
          <Field label="Nº de matrícula" tag="interno"><TextField value={form.matricula} onChange={(v: string) => set("matricula", v)} placeholder="Ex.: 123.456" /></Field>
          <Field label="Zona" tag="interno"><TextField value={form.zona} onChange={(v: string) => set("zona", v)} placeholder="Zona urbana / ZEIS…" /></Field>
          <Field label="Inscrição IPTU" tag="interno"><TextField value={form.inscIptu} onChange={(v: string) => set("inscIptu", v)} placeholder="0000000" /></Field>
          <Field label="Nº do hidrômetro" tag="interno"><TextField value={form.hidrometro} onChange={(v: string) => set("hidrometro", v)} placeholder="0000000" /></Field>
          <Field label="Chaves do imóvel / responsável" tag="interno" full><TextField value={form.chaves} onChange={(v: string) => set("chaves", v)} placeholder="Ex.: na portaria, com o zelador…" /></Field>
          <Field label="Observações internas e restritas" tag="interno" full>
            <textarea value={form.obsInternas} onChange={(e: any) => set("obsInternas", e.target.value)} rows={3} placeholder="Anotações que nunca vão para o anúncio." style={{ width: "100%", border: `1px solid ${pal.g300}`, borderRadius: 10, padding: "11px 13px", fontFamily: "var(--font-body)", fontSize: 14, color: pal.ink, outline: "none", resize: "vertical" }} />
          </Field>
        </div>
      </Section>
      <div style={{ display: "flex", gap: 9, marginTop: 16, background: pal.g100, borderRadius: 10, padding: "11px 13px", fontSize: 12.5, color: pal.g700 }}>
        <Ic n="shield" s={16} c={pal.g500} style={{ flexShrink: 0, marginTop: 1 }} />
        <span>Dados do proprietário são <strong>dados pessoais de terceiro (LGPD)</strong>: ficam no registro interno e jamais vão para o anúncio.</span>
      </div>
    </div>
  );
}

/* Step 6 — Revisão (IA) */
function ImStep6({ form, set, onToast }: any) {
  const regen = () => {
    set("descGenerating", true);
    setTimeout(() => { set("descGenerating", false); set("descIndex", (form.descIndex + 1) % IM_DESCRIPTIONS.length); onToast("Novas opções geradas pela IA", "sparkles"); }, 1500);
  };
  const sel = IM_DESCRIPTIONS[form.descIndex];
  return (
    <div>
      <StepTitle icon="sparkles" title="Revisão — título & descrição" sub={`A IA gera no tom da ${demo.nomeCurto} e otimizado pros portais. Escolha, edite e publique.`} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 10.5, fontWeight: 700, letterSpacing: ".03em", textTransform: "uppercase", color: pal.primary, background: pal.lilac2, borderRadius: 999, padding: "3px 9px" }}><Ic n="sparkles" s={12} c={pal.primary} /> Gerado por IA</span>
        <button onClick={regen} disabled={form.descGenerating} style={{ display: "flex", alignItems: "center", gap: 6, border: `1px solid ${pal.g300}`, background: "#fff", borderRadius: 9, padding: "7px 13px", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 12.5, color: pal.g700 }}>
          <Ic n="refresh-cw" s={14} c={pal.primary} /> Regerar
        </button>
      </div>

      {form.descGenerating ? (
        <div style={{ border: `1px solid ${pal.g300}`, borderRadius: 14, padding: 18, textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 9, background: pal.lilac2, color: pal.primary, borderRadius: 999, padding: "7px 15px", fontSize: 13, fontWeight: 700 }}><span className="rec-dot" style={{ width: 9, height: 9, borderRadius: "50%", background: pal.primary }} /> Gerando descrição…</div>
          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 9 }}>{["80%", "96%", "90%", "70%"].map((w, i) => <div key={i} className="sk" style={{ height: 12, borderRadius: 6, width: w, alignSelf: "flex-start" }} />)}</div>
        </div>
      ) : (
        <React.Fragment>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
            {IM_DESCRIPTIONS.map((d, i) => {
              const on = form.descIndex === i;
              return (
                <button key={i} onClick={() => set("descIndex", i)} style={{ textAlign: "left", border: on ? `1.5px solid ${pal.primary}` : `1px solid ${pal.g300}`, background: on ? pal.lilac1 : "#fff", borderRadius: 12, padding: 14, cursor: "pointer", fontFamily: "var(--font-body)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                    <span style={{ width: 18, height: 18, borderRadius: "50%", border: on ? `5px solid ${pal.primary}` : `2px solid ${pal.g300}`, flexShrink: 0 }} />
                    <span style={{ fontWeight: 700, fontSize: 13.5, color: pal.ink }}>Opção {i + 1}</span>
                    {i === 0 && <span style={{ fontSize: 10, fontWeight: 700, color: "#1E7A43", background: "#E6F4EC", borderRadius: 999, padding: "2px 7px" }}>RECOMENDADA</span>}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 13.5, color: pal.ink, margin: "9px 0 4px", paddingLeft: 27 }}>{d.title}</div>
                  <div style={{ fontSize: 12.5, color: pal.g700, lineHeight: 1.5, paddingLeft: 27 }}>{d.body}</div>
                </button>
              );
            })}
          </div>
          <Field label="Título (editável)"><input key={"t" + form.descIndex} defaultValue={sel.title} style={{ width: "100%", border: `1px solid ${pal.g300}`, borderRadius: 10, padding: "11px 13px", fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 600, color: pal.ink, outline: "none" }} /></Field>
          <div style={{ marginTop: 14 }}>
            <Field label="Descrição (editável)" hint="A IA só usa o que você informou — nunca inventa metragem, vista ou item que não existe.">
              <textarea key={"b" + form.descIndex} defaultValue={sel.body} rows={4} style={{ width: "100%", border: `1px solid ${pal.g300}`, borderRadius: 10, padding: "11px 13px", fontFamily: "var(--font-body)", fontSize: 14, lineHeight: 1.5, color: pal.ink, outline: "none", resize: "vertical" }} />
            </Field>
          </div>
        </React.Fragment>
      )}

      <div style={{ marginTop: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: pal.g500, marginBottom: 10 }}>Publicar em</div>
        <Chips options={["ZAP", "VivaReal", "OLX", `Site ${demo.nomeCurto}`]} value={form.portais} onChange={(v: string[]) => set("portais", v)} />
      </div>
      <div style={{ marginTop: 18 }}>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: pal.g500, marginBottom: 10 }}>Modelo de anúncio</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["Padrão", "Destaque", "Super destaque"].map(m => {
            const on = form.modelo === m;
            return <button key={m} onClick={() => set("modelo", m)} style={{ display: "inline-flex", alignItems: "center", gap: 6, border: on ? `1.5px solid ${pal.primary}` : `1px solid ${pal.g300}`, background: on ? pal.lilac2 : "#fff", color: on ? pal.primary : pal.g700, borderRadius: 10, padding: "9px 14px", cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600 }}>{m !== "Padrão" && <Ic n="star" s={14} c={on ? pal.primary : pal.g500} />}{m}</button>;
          })}
        </div>
      </div>
    </div>
  );
}

/* Step 7 — Enviar para análise */
function ImStep7({ form, photosOK, onSubmitted, onToast }: any) {
  const g = IM_COVER[form.category] || IM_COVER.Residencial;
  const feat = form.features;
  const summary = form.category === "Residencial"
    ? `${feat.dorm} quartos · ${feat.suites} suíte · ${feat.vagas} vagas · ${feat.areaUtil}m²`
    : `${form.subtype} · ${form.bairro || "—"}`;
  return (
    <div>
      <StepTitle icon="send" title="Enviar para análise" sub="Confira o resumo. Após aprovado pela curadoria, publica e sindica automaticamente." />
      <div style={{ border: `1px solid ${pal.g300}`, borderRadius: 14, overflow: "hidden", marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 14, padding: 14 }}>
          <div style={{ width: 120, height: 90, flexShrink: 0, borderRadius: 10, background: `linear-gradient(135deg, ${g[0]}, ${g[1]})`, display: "grid", placeItems: "center", position: "relative" }}>
            <Ic n="building-2" s={26} c="rgba(255,255,255,.55)" />
            <span style={{ position: "absolute", bottom: 6, left: 6, fontSize: 10.5, fontWeight: 600, color: "#fff", background: "rgba(28,22,40,.6)", borderRadius: 6, padding: "2px 6px" }}>{form.fotos} fotos</span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: pal.ink }}>{form.subtype} · {form.bairro || "Boa Viagem"}</div>
            <div style={{ fontSize: 12.5, color: pal.g500, marginTop: 3 }}>{summary}</div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, color: pal.primary, marginTop: 6 }}>R$ {form.preco}</div>
            <div style={{ display: "flex", gap: 5, marginTop: 8, flexWrap: "wrap" }}>{form.portais.map((p: string) => <span key={p} style={{ fontSize: 10.5, fontWeight: 600, color: pal.g500, background: pal.g100, borderRadius: 6, padding: "2px 7px" }}>{p}</span>)}</div>
          </div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 9, background: "#E6F4EC", border: "1px solid #BFE3CD", borderRadius: 10, padding: "11px 13px", marginBottom: 12, fontSize: 12.5, color: "#1E7A43" }}>
        <Ic n="shield-check" s={16} c="#2E9E5B" style={{ flexShrink: 0 }} /> Nenhuma duplicidade encontrada (matrícula / CEP + número).
      </div>
      {!photosOK && (
        <div style={{ display: "flex", gap: 9, background: pal.warningBg, border: "1px solid #F0DCA8", borderRadius: 10, padding: "11px 13px", marginBottom: 12, fontSize: 12.5, color: "#8A5F0C" }}>
          <Ic n="alert-triangle" s={16} c="#C08A1E" style={{ flexShrink: 0 }} /> O envio libera com <strong>15 fotos</strong> (você tem {form.fotos}). Volte ao passo de Fotos para adicionar.
        </div>
      )}
      <button onClick={() => photosOK && onSubmitted()} disabled={!photosOK} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 9, border: "none", background: photosOK ? pal.primary : pal.g300, color: "#fff", borderRadius: 12, padding: "14px", cursor: photosOK ? "pointer" : "default", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 15, boxShadow: photosOK ? "var(--shadow-purple)" : "none" }}>
        <Ic n="send" s={18} c="#fff" /> Enviar para análise
      </button>
      <div style={{ textAlign: "center", fontSize: 12, color: pal.g500, marginTop: 10 }}>Status passará para <strong style={{ color: "#B8860B" }}>Em análise</strong> · a curadoria responde em até 1 dia útil.</div>
    </div>
  );
}

const STEP_COMPONENTS: any[] = [ImStep0, ImStep1, ImStep2, ImStep3, ImStep4, ImStep5, ImStep6, ImStep7];

/* ============================================================
   WIZARD (orquestrador)
   ============================================================ */
const WZ_STEPS = ["Tipo", "Endereço", "Características", "Fotos", "Valores", "Complementares", "Revisão", "Enviar"];

function blankForm(initial: any) {
  const bairro = initial ? initial.bairro.split("·")[0].trim() : "";
  return {
    category: initial ? initial.type : "Residencial", subtype: initial ? initial.subtype : "Apartamento", fins: [initial ? initial.fin : "Venda"],
    cep: initial ? "00000-000" : "", rua: initial ? "Rua Exemplo" : "", bairro, cidade: initial ? "Recife" : "", uf: initial ? "PE" : "",
    numero: "", complemento: "", ocultarNumero: true,
    features: { dorm: 3, suites: 1, banheiros: 2, vagas: 2, areaUtil: "110", areaTotal: "132", andar: "8", mobiliado: false, pet: true, lazer: ["Piscina", "Academia", "Salão de festas"] },
    fotos: initial ? initial.fotos : 6, video: "", tour360: "",
    preco: initial ? initial.price.replace("R$ ", "") : "890.000", condominio: "980", iptu: "320", financiamento: true,
    comissao: "5", proprietario: "José Andrade", contatoProprietario: "", permuta: false, permutaTipos: [],
    internalOpen: false, complementOpen: false,
    matricula: "", zona: "", inscIptu: "", hidrometro: "", obsInternas: "", chaves: "Na portaria",
    descIndex: 0, descGenerating: false, portais: ["ZAP", "VivaReal", "OLX", "Site"], modelo: "Destaque",
  };
}

function Wizard({ initial, onClose, onToast, onSubmitted, isMobile }: { initial: any; onClose: () => void; onToast: (m: string, i?: string) => void; onSubmitted: () => void; isMobile: boolean }) {
  const [step, setStep] = React.useState(0);
  const [form, setForm] = React.useState(() => blankForm(initial));
  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));
  const setFeat = (k: string, v: any) => setForm((f: any) => ({ ...f, features: { ...f.features, [k]: v } }));
  const ctx = { form, set, setFeat, onToast };

  const last = WZ_STEPS.length - 1;
  const go = (d: number) => setStep(s => Math.max(0, Math.min(last, s + d)));
  const photosOK = form.fotos >= 15;

  const StepComp = STEP_COMPONENTS[step];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: pal.page, minWidth: 0 }}>
      {/* header */}
      <div style={{ background: "#fff", borderBottom: `1px solid ${pal.g300}`, padding: isMobile ? "12px 16px" : "14px 28px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, maxWidth: 920, margin: "0 auto" }}>
          <button onClick={onClose} style={{ width: 38, height: 38, flexShrink: 0, borderRadius: 10, border: `1px solid ${pal.g300}`, background: "#fff", display: "grid", placeItems: "center", cursor: "pointer" }}>
            <Ic n="arrow-left" s={19} c={pal.g700} />
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, color: pal.ink }}>{initial ? "Editar imóvel" : "Novo imóvel"}</div>
            <div style={{ fontSize: 12, color: pal.g500 }}>Passo {step + 1} de {WZ_STEPS.length} · {WZ_STEPS[step]}</div>
          </div>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: pal.success, fontWeight: 600 }}>
            <Ic n="cloud-check" s={15} c={pal.success} /> {isMobile ? "" : "Rascunho salvo"}
          </span>
        </div>
        {/* progress */}
        <div style={{ display: "flex", gap: 6, maxWidth: 920, margin: "14px auto 0" }}>
          {WZ_STEPS.map((s, i) => {
            const done = i < step, cur = i === step;
            return (
              <button key={s} onClick={() => setStep(i)} style={{ flex: 1, cursor: "pointer", border: "none", background: "transparent", padding: 0 }}>
                <div style={{ height: 5, borderRadius: 999, background: done || cur ? pal.primary : pal.g300, transition: "background .2s ease" }} />
                {!isMobile && <div style={{ fontSize: 10.5, fontWeight: cur ? 700 : 600, color: cur ? pal.primary : pal.g500, marginTop: 6, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{i + 1}. {s}</div>}
              </button>
            );
          })}
        </div>
      </div>

      {/* step content */}
      <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? "18px 16px 24px" : "26px 28px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          {StepComp ? <StepComp {...ctx} photosOK={photosOK} onSubmitted={onSubmitted} /> : null}
        </div>
      </div>

      {/* footer nav */}
      {step < last && (
        <div style={{ background: "#fff", borderTop: `1px solid ${pal.g300}`, padding: isMobile ? "12px 16px" : "14px 28px", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, maxWidth: 760, margin: "0 auto" }}>
            <button onClick={() => (step === 0 ? onClose() : go(-1))} style={{ display: "flex", alignItems: "center", gap: 7, border: `1px solid ${pal.g300}`, background: "#fff", borderRadius: 11, padding: "11px 17px", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 14, color: pal.g700 }}>
              <Ic n="arrow-left" s={16} c={pal.g700} /> {step === 0 ? "Cancelar" : "Voltar"}
            </button>
            <button onClick={() => onToast("Rascunho salvo", "cloud-check")} style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 7, border: "none", background: "transparent", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13.5, color: pal.g500 }}>
              <Ic n="save" s={16} c={pal.g500} /> Salvar rascunho
            </button>
            <button onClick={() => go(1)} style={{ display: "flex", alignItems: "center", gap: 7, border: "none", background: pal.primary, color: "#fff", borderRadius: 11, padding: "11px 20px", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 14, boxShadow: "var(--shadow-purple)" }}>
              Próximo <Ic n="arrow-right" s={16} c="#fff" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   PAGE ROOT
   ============================================================ */
export default function ImoveisPage() {
  const router = useRouter();
  const [isMobile, setIsMobile] = React.useState(false);
  const [view, setView] = React.useState<"carteira" | "wizard">("carteira");
  const [wizInitial, setWizInitial] = React.useState<any>(null);
  const [toast, setToast] = React.useState<ToastT | null>(null);
  const toastTimer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  React.useEffect(() => {
    const onResize = () => { setIsMobile(window.innerWidth < 1024); };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const fire = (msg: string, icon?: string) => {
    setToast({ msg, icon, id: Date.now() });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  };

  const onNew = () => { setWizInitial(null); setView("wizard"); };
  const onEdit = (p: any) => { setWizInitial(p); setView("wizard"); };
  const onClose = () => setView("carteira");
  const onSubmitted = () => { setView("carteira"); fire("Imóvel enviado para análise", "send"); };

  const carteiraEl = <Carteira onNew={onNew} onEdit={onEdit} onToast={fire} />;
  const wizardEl = (
    <Wizard initial={wizInitial} onClose={onClose} onToast={fire} onSubmitted={onSubmitted} isMobile={isMobile} />
  );

  return (
    <>
      <style>{`
        .wz-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        @media (max-width: 600px) { .wz-grid2 { grid-template-columns: 1fr; } }
      `}</style>
      <CorretorChrome
        title="Imóveis"
        subtitle="Sua carteira · cadastro e curadoria"
        searchPlaceholder="Buscar imóvel, código ou bairro"
        mobileTab="Imóveis"
      >
        <div style={{ height: "100%", display: "flex", flexDirection: "column", overflow: view === "wizard" ? "hidden" : undefined }}>
          <div style={{ flex: 1, minHeight: 0, overflowY: view === "wizard" ? "hidden" : "auto" }}>
            {view === "wizard" ? wizardEl : carteiraEl}
          </div>
        </div>
        <ImToast toast={toast} />
      </CorretorChrome>
    </>
  );
}
