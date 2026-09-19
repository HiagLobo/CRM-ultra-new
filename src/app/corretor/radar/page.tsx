"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import CorretorChrome, { pal, Ic } from "@/components/corretor/CorretorChrome";
import RadarCredits from "@/components/corretor/RadarCredits";

/* ============================================================
   RADAR — Oportunidades (porte fiel de radar-data.jsx + radar.jsx + radar-detail.jsx + radar-app.jsx)
   ============================================================ */

/* ---------- data ---------- */
const RD_POTENTIAL: Record<string, { c: string; bg: string; dot: string; soft: string; softC: string }> = {
  Alto: { c: "#fff", bg: "#4F46E5", dot: "#fff", soft: "#E0E7FF", softC: "#4F46E5" },
  Médio: { c: "#4F46E5", bg: "#E0E7FF", dot: "#6366F1", soft: "#E0E7FF", softC: "#4F46E5" },
  Baixo: { c: "#807C8A", bg: "#F2F1F5", dot: "#807C8A", soft: "#F2F1F5", softC: "#807C8A" },
};

const RD_OPS: any[] = [
  {
    id: "o1", tipo: "Apartamento", bairro: "Campo Belo", cidade: "São Paulo", fin: "Venda",
    price: "R$ 720.000", priceN: 720000, m2: 68, quartos: 2, suites: 1, vagas: 1, dias: 72,
    potencial: "Alto", motivo: "Particular · 72 dias no mercado · 6% acima da média",
    demanda: "3 clientes procurando 2q em Campo Belo", demandaN: 3,
    anunciante: "Particular", av: ["#6366F1", "#312E81"],
    sinais: [
      { icon: "user", t: "Anunciante particular", d: "Sem corretor, fala direto com o dono" },
      { icon: "clock", t: "72 dias no mercado", d: "Acima da média do bairro (38 dias): dono tende a negociar" },
      { icon: "trending-up", t: "6% acima da média", d: "Pede R$ 720k; comparáveis em ~R$ 678k: espaço para ajuste" },
    ],
    comparaveis: [
      { end: "Rua Exemplo, 2q", m2: 65, price: "R$ 670.000" },
      { end: "Av. Exemplo, 2q", m2: 70, price: "R$ 690.000" },
      { end: "Rua Modelo, 2q", m2: 66, price: "R$ 675.000" },
    ],
    clientes: [
      { nome: "Mariana Costa", busca: "2 quartos, até R$ 750 mil, Campo Belo", ini: "MC" },
      { nome: "Paulo Henrique", busca: "2q com suíte e vaga, Zona Sul", ini: "PH" },
      { nome: "Sofia Andrade", busca: "Apto até R$ 730 mil para morar", ini: "SA" },
    ],
  },
  {
    id: "o2", tipo: "Cobertura", bairro: "Itaim Bibi", cidade: "São Paulo", fin: "Venda",
    price: "R$ 2.400.000", priceN: 2400000, m2: 180, quartos: 4, suites: 2, vagas: 3, dias: 90,
    potencial: "Alto", motivo: "90 dias anunciado · dono provavelmente motivado",
    demanda: null, demandaN: 0, anunciante: "Imobiliária", av: ["#4338CA", "#231038"],
    sinais: [
      { icon: "clock", t: "90 dias no mercado", d: "Bem acima da média de alto padrão: sinal de motivação" },
      { icon: "gem", t: "Alto padrão", d: "Cobertura de 180m² no Itaim: ticket e comissão altos" },
    ],
    comparaveis: [
      { end: "Rua Exemplo, cobertura", m2: 175, price: "R$ 2.350.000" },
      { end: "Av. Modelo, 4q", m2: 190, price: "R$ 2.500.000" },
      { end: "Rua Fictícia, cob.", m2: 170, price: "R$ 2.290.000" },
    ],
    clientes: [
      { nome: "Roberto Vianna", busca: "Cobertura alto padrão, Itaim/Vila Olímpia", ini: "RV" },
    ],
  },
  {
    id: "o3", tipo: "Conjunto comercial", bairro: "Pinheiros", cidade: "São Paulo", fin: "Venda",
    price: "R$ 980.000", priceN: 980000, m2: 90, quartos: 0, suites: 0, vagas: 2, dias: 21,
    potencial: "Alto", motivo: "Preço caiu 5% esta semana", precoQueda: true,
    demanda: null, demandaN: 0, anunciante: "Particular", av: ["#2563A8", "#163A5C"],
    sinais: [
      { icon: "trending-down", t: "Queda de 5% esta semana", d: "De R$ 1.030.000 para R$ 980.000: dono ajustando para vender" },
      { icon: "user", t: "Anunciante particular", d: "Negociação direta com o proprietário" },
    ],
    comparaveis: [
      { end: "Rua Modelo, conj. 88m²", m2: 88, price: "R$ 950.000" },
      { end: "Rua Exemplo, 92m²", m2: 92, price: "R$ 1.000.000" },
      { end: "Av. Exemplo, conj. 85m²", m2: 85, price: "R$ 920.000" },
    ],
    clientes: [],
  },
  {
    id: "o4", tipo: "Casa", bairro: "Vila Mariana", cidade: "São Paulo", fin: "Venda",
    price: "R$ 1.150.000", priceN: 1150000, m2: 140, quartos: 3, suites: 1, vagas: 2, dias: 45,
    potencial: "Médio", motivo: "45 dias no mercado · preço alinhado à região",
    demanda: null, demandaN: 0, anunciante: "Imobiliária", av: ["#3B7A57", "#1E4533"],
    sinais: [
      { icon: "clock", t: "45 dias no mercado", d: "Levemente acima da média de casas no bairro" },
      { icon: "home", t: "Casa com quintal", d: "Tipologia procurada para famílias na Vila Mariana" },
    ],
    comparaveis: [
      { end: "Rua Exemplo, casa 3q", m2: 135, price: "R$ 1.120.000" },
      { end: "Av. Exemplo, 3q", m2: 145, price: "R$ 1.180.000" },
      { end: "Rua Modelo, casa", m2: 138, price: "R$ 1.140.000" },
    ],
    clientes: [],
  },
  {
    id: "o5", tipo: "Apartamento", bairro: "Moema", cidade: "São Paulo", fin: "Venda",
    price: "R$ 890.000", priceN: 890000, m2: 92, quartos: 3, suites: 1, vagas: 2, dias: 12,
    potencial: "Médio", motivo: "12 dias no mercado · recém-anunciado",
    demanda: "1 cliente procurando", demandaN: 1, anunciante: "Particular", av: ["#B5632F", "#7A3B16"],
    sinais: [
      { icon: "sparkles", t: "Recém-anunciado", d: "12 dias: chegar cedo dá vantagem na captação" },
      { icon: "user", t: "Anunciante particular", d: "Contato direto com o dono" },
    ],
    comparaveis: [
      { end: "Al. Exemplo, 3q", m2: 90, price: "R$ 870.000" },
      { end: "Rua Modelo, 3q", m2: 94, price: "R$ 905.000" },
      { end: "Av. Exemplo, 3q", m2: 88, price: "R$ 860.000" },
    ],
    clientes: [
      { nome: "Camila Reis", busca: "3 quartos em Moema, até R$ 900 mil", ini: "CR" },
    ],
  },
  {
    id: "o6", tipo: "Apartamento", bairro: "Vila Olímpia", cidade: "São Paulo", fin: "Venda",
    price: "R$ 650.000", priceN: 650000, m2: 55, quartos: 1, suites: 0, vagas: 1, dias: 8,
    potencial: "Baixo", motivo: "8 dias · preço de mercado · sem sinais fortes",
    demanda: null, demandaN: 0, anunciante: "Imobiliária", av: ["#5A6B8C", "#2E3A52"],
    sinais: [
      { icon: "info", t: "Sem sinais fortes ainda", d: "Recém-anunciado e a preço de mercado: vale acompanhar" },
    ],
    comparaveis: [
      { end: "Rua Exemplo, 1q", m2: 52, price: "R$ 630.000" },
      { end: "Rua Modelo, 1q", m2: 58, price: "R$ 670.000" },
      { end: "Rua Fictícia, 1q", m2: 54, price: "R$ 645.000" },
    ],
    clientes: [],
  },
];

const RD_SORTS = ["Potencial", "Bate com demanda", "Mais recentes", "Mais tempo no mercado", "Maior gap de preço"];
const RD_FILTERS = ["Região", "Tipo", "Finalidade", "Faixa de preço"];

function sortOps(ops: any[], sort: string): any[] {
  const r = [...ops];
  if (sort === "Potencial") { const o: any = { Alto: 0, Médio: 1, Baixo: 2 }; r.sort((a, b) => o[a.potencial] - o[b.potencial]); }
  else if (sort === "Bate com demanda") r.sort((a, b) => b.demandaN - a.demandaN);
  else if (sort === "Mais recentes") r.sort((a, b) => a.dias - b.dias);
  else if (sort === "Mais tempo no mercado") r.sort((a, b) => b.dias - a.dias);
  else if (sort === "Maior gap de preço") { const o: any = { Alto: 0, Médio: 1, Baixo: 2 }; r.sort((a, b) => o[a.potencial] - o[b.potencial]); }
  return r;
}

/* ---------- Toast ---------- */
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

/* ---------- Skeleton ---------- */
function Skeleton({ isMobile }: { isMobile: boolean }) {
  return (
    <div style={{ padding: isMobile ? 16 : 28, maxWidth: 1180, margin: "0 auto" }}>
      <div className="sk" style={{ height: 30, width: 320, borderRadius: 8, marginBottom: 10 }} />
      <div className="sk" style={{ height: 36, width: 280, borderRadius: 999, marginBottom: 20 }} />
      <div className="sk" style={{ height: 40, borderRadius: 10, marginBottom: 20 }} />
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>{[0, 1, 2, 3, 4, 5].map(i => <div key={i} className="sk" style={{ height: 360, borderRadius: 16 }} />)}</div>
    </div>
  );
}

/* ---------- potential seal ---------- */
function PotentialSeal({ level, big }: { level: string; big?: boolean }) {
  const m = RD_POTENTIAL[level];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: m.bg, color: m.c, fontSize: big ? 12 : 11, fontWeight: 700, borderRadius: 999, padding: big ? "4px 11px" : "3px 9px", whiteSpace: "nowrap" }}>
      <Ic n="radar" s={big ? 14 : 12} c={m.c} /> Potencial {level}
    </span>
  );
}

function DemandSeal({ text, count }: { text: string | null; count: number }) {
  if (!text) return null;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#FCEBDD", color: "#C2410C", fontSize: 11, fontWeight: 700, borderRadius: 999, padding: "3px 9px" }}>
      <Ic n="sun" s={12} c="#EA580C" /> {count} {count === 1 ? "cliente procurando" : "clientes procurando"}
    </span>
  );
}

/* ---------- cover ---------- */
function OpCover({ op, h = 168 }: { op: any; h?: number }) {
  return (
    <div style={{ height: h, background: `linear-gradient(135deg, ${op.av[0]}, ${op.av[1]})`, position: "relative", display: "grid", placeItems: "center", overflow: "hidden", flexShrink: 0 }}>
      <Ic n={op.tipo === "Casa" ? "home" : op.tipo === "Conjunto comercial" ? "briefcase" : "building-2"} s={38} c="rgba(255,255,255,.5)" />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,.16), rgba(0,0,0,0) 40%, rgba(0,0,0,.22))" }} />
      <span style={{ position: "absolute", top: 10, left: 10, background: op.fin === "Venda" ? "rgba(79,70,229,.92)" : "rgba(37,99,168,.92)", color: "#fff", fontSize: 10.5, fontWeight: 700, letterSpacing: ".03em", borderRadius: 999, padding: "3px 10px" }}>{op.fin}</span>
      <span style={{ position: "absolute", bottom: 10, left: 10, display: "inline-flex", alignItems: "center", gap: 4, background: "rgba(28,22,40,.6)", backdropFilter: "blur(4px)", color: "#fff", fontSize: 10.5, fontWeight: 600, borderRadius: 7, padding: "3px 8px" }}><Ic n="clock" s={12} c="#fff" /> há {op.dias} dias</span>
    </div>
  );
}

function specsLine(op: any): string {
  const parts = [`${op.m2} m²`];
  if (op.quartos > 0) parts.push(`${op.quartos}q${op.suites ? ` (${op.suites} suíte${op.suites > 1 ? "s" : ""})` : ""}`);
  if (op.vagas > 0) parts.push(`${op.vagas} vaga${op.vagas > 1 ? "s" : ""}`);
  return parts.join(" · ");
}

/* ---------- OpCard ---------- */
function OpCard({ op, onDetails, onCaptar, onDismiss }: { op: any; onDetails: (op: any) => void; onCaptar: (op: any) => void; onDismiss: (op: any) => void }) {
  return (
    <div style={{ background: "#fff", border: `1px solid ${pal.g300}`, borderRadius: 16, overflow: "hidden", display: "flex", flexDirection: "column", transition: "box-shadow .15s ease, transform .15s ease" }}
      onMouseEnter={e => { (e.currentTarget as any).style.boxShadow = "var(--shadow-lg)"; (e.currentTarget as any).style.transform = "translateY(-2px)"; }}
      onMouseLeave={e => { (e.currentTarget as any).style.boxShadow = "none"; (e.currentTarget as any).style.transform = "none"; }}>
      <OpCover op={op} />
      <div style={{ padding: 15, display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
        <div>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: pal.ink }}>{op.tipo} · {op.bairro}</span>
          </div>
          <div style={{ fontSize: 12.5, color: pal.g500, marginTop: 2 }}>{specsLine(op)}</div>
        </div>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 19, color: pal.primary }}>{op.price}</div>
        {/* potential + reason */}
        <div style={{ background: op.potencial === "Alto" ? pal.lilac1 : pal.g100, border: `1px solid ${op.potencial === "Alto" ? pal.lilac2 : pal.g300}`, borderRadius: 11, padding: "10px 12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
            <PotentialSeal level={op.potencial} />
            {op.precoQueda && <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 10.5, fontWeight: 700, color: "#1E7A43", background: "#E6F4EC", borderRadius: 999, padding: "2px 7px" }}><Ic n="trending-down" s={11} c="#2E9E5B" /> Preço caiu</span>}
          </div>
          <div style={{ fontSize: 12, color: pal.g700, lineHeight: 1.4, marginTop: 7 }}>{op.motivo}</div>
        </div>
        {/* demand */}
        {op.demanda && <DemandSeal text={op.demanda} count={op.demandaN} />}
        {/* actions */}
        <div style={{ display: "flex", gap: 8, marginTop: "auto", paddingTop: 4 }}>
          <button onClick={() => onDetails(op)} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, border: `1px solid ${pal.g300}`, background: "#fff", color: pal.g700, borderRadius: 10, padding: "10px", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13 }}>Ver detalhes</button>
          <button onClick={() => onCaptar(op)} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, border: "none", background: pal.primary, color: "#fff", borderRadius: 10, padding: "10px", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 13, boxShadow: "var(--shadow-purple)" }}><Ic n="crosshair" s={15} c="#fff" /> Captar</button>
          <button onClick={() => onDismiss(op)} title="Dispensar" style={{ width: 40, flexShrink: 0, border: `1px solid ${pal.g300}`, background: "#fff", borderRadius: 10, display: "grid", placeItems: "center", cursor: "pointer" }}><Ic n="x" s={16} c={pal.g500} /></button>
        </div>
      </div>
    </div>
  );
}

/* ---------- RadarHeader ---------- */
function RadarHeader({ count, demandCount }: { count: number; demandCount: number }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ width: 38, height: 38, borderRadius: 10, background: `linear-gradient(135deg, ${pal.primary}, ${pal.deep})`, display: "grid", placeItems: "center", boxShadow: "var(--shadow-purple)" }}><Ic n="radar" s={21} c="#fff" /></span>
        <div>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 25, margin: 0, color: pal.ink, letterSpacing: "-0.01em" }}>Oportunidades para captar</h2>
          <p style={{ fontSize: 13.5, color: pal.g500, margin: "2px 0 0" }}>Imóveis com alto potencial de captação, escolhidos pra você.</p>
        </div>
      </div>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 9, background: pal.lilac2, color: pal.primary, borderRadius: 999, padding: "7px 15px", fontSize: 13, fontWeight: 600, marginTop: 14 }}>
        <Ic n="sparkles" s={15} c={pal.primary} /> <strong style={{ fontWeight: 800 }}>{count} novas hoje</strong> · {demandCount} batem com a sua demanda
      </div>
    </div>
  );
}

/* ---------- FilterBar ---------- */
function FilterBar({ sort, setSort, onToast }: { sort: string; setSort: (s: string) => void; onToast: (msg: string, icon?: string) => void }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
      <div style={{ position: "relative" }}>
        <button onClick={() => setOpen(o => !o)} style={{ display: "inline-flex", alignItems: "center", gap: 8, border: `1px solid ${pal.g300}`, background: "#fff", color: pal.ink, borderRadius: 10, padding: "9px 14px", cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 13.5, fontWeight: 600 }}>
          <Ic n="arrow-up-down" s={16} c={pal.primary} /> Ordenar: <span style={{ color: pal.primary }}>{sort}</span> <Ic n="chevron-down" s={15} c={pal.g500} />
        </button>
        {open && (
          <div style={{ position: "absolute", top: "110%", left: 0, zIndex: 50, background: "#fff", border: `1px solid ${pal.g300}`, borderRadius: 12, boxShadow: "var(--shadow-lg)", padding: 6, minWidth: 230 }}>
            {RD_SORTS.map(s => (
              <button key={s} onClick={() => { setSort(s); setOpen(false); }} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", textAlign: "left", border: "none", background: s === sort ? pal.lilac2 : "transparent", color: s === sort ? pal.primary : pal.g700, borderRadius: 8, padding: "9px 11px", cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 13, fontWeight: s === sort ? 700 : 500 }}>
                {s === sort && <Ic n="check" s={14} c={pal.primary} />}<span style={{ marginLeft: s === sort ? 0 : 22 }}>{s}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      <div style={{ width: 1, height: 24, background: pal.g300 }} className="rd-sep" />
      <div className="hide-scroll" style={{ display: "flex", gap: 8, overflowX: "auto", flex: 1 }}>
        {RD_FILTERS.map(f => (
          <button key={f} onClick={() => onToast("Filtrar por " + f, "sliders-horizontal")} style={{ flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 6, border: `1px solid ${pal.g300}`, background: "#fff", color: pal.g700, borderRadius: 999, padding: "8px 14px", cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600 }}>{f} <Ic n="chevron-down" s={14} c={pal.g500} /></button>
        ))}
      </div>
    </div>
  );
}

/* ---------- DetailPanel ---------- */
function DetailPanel({ op, isMobile, onClose, onCaptar }: { op: any; isMobile: boolean; onClose: () => void; onCaptar: (op: any) => void }) {
  if (!op) return null;
  const gap = op.priceN && op.comparaveis && op.comparaveis.length
    ? Math.round((op.priceN / (op.comparaveis.reduce((s: number, c: any) => s + Number(String(c.price).replace(/\D/g, "")), 0) / op.comparaveis.length) - 1) * 100)
    : 0;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 7000, background: "rgba(28,22,40,.45)", display: isMobile ? "block" : "flex", justifyContent: "flex-end" }}>
      <div onClick={e => e.stopPropagation()} style={{ width: isMobile ? "100%" : 440, maxWidth: "100%", height: "100%", background: pal.page, display: "flex", flexDirection: "column", boxShadow: "var(--shadow-lg)", animation: "slideInRight .22s cubic-bezier(.2,.7,.3,1)" }}>
        {/* header */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          <OpCover op={op} h={isMobile ? 180 : 200} />
          <button onClick={onClose} style={{ position: "absolute", top: 12, right: 12, width: 36, height: 36, borderRadius: 10, border: "none", background: "rgba(255,255,255,.92)", display: "grid", placeItems: "center", cursor: "pointer", boxShadow: "var(--shadow-sm)" }}><Ic n="x" s={19} c={pal.ink} /></button>
          <div style={{ position: "absolute", bottom: 12, right: 12 }}><PotentialSeal level={op.potencial} big /></div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: 18 }}>
          {/* title + price */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 4 }}>
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 19, color: pal.ink }}>{op.tipo} · {op.bairro}</div>
              <div style={{ fontSize: 13, color: pal.g500, marginTop: 2 }}>{op.cidade} · anunciado há {op.dias} dias</div>
            </div>
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 24, color: pal.primary, margin: "8px 0" }}>{op.price}</div>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", padding: "12px 0", borderTop: `1px solid ${pal.g100}`, borderBottom: `1px solid ${pal.g100}`, marginBottom: 16 }}>
            {([["ruler", `${op.m2} m²`], op.quartos > 0 && ["bed", `${op.quartos} quartos`], op.suites > 0 && ["bath", `${op.suites} suíte${op.suites > 1 ? "s" : ""}`], op.vagas > 0 && ["car", `${op.vagas} vaga${op.vagas > 1 ? "s" : ""}`]] as any[]).filter(Boolean).map((item: any, i: number) => (
              <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: pal.g700, fontWeight: 600 }}><Ic n={item[0]} s={16} c={pal.primary} /> {item[1]}</span>
            ))}
          </div>
          {op.demanda && <div style={{ marginBottom: 16 }}><DemandSeal text={op.demanda} count={op.demandaN} /></div>}
          {/* WHY GOOD */}
          <div style={{ background: "#fff", border: `1px solid ${pal.lilac2}`, borderRadius: 14, padding: 16, marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <Ic n="sparkles" s={17} c={pal.primary} />
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14.5, color: pal.ink, flex: 1 }}>Por que é uma boa oportunidade</span>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".03em", textTransform: "uppercase", color: pal.primary, background: pal.lilac2, borderRadius: 999, padding: "2px 8px" }}>IA</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {op.sinais.map((s: any, i: number) => (
                <div key={i} style={{ display: "flex", gap: 11 }}>
                  <span style={{ width: 32, height: 32, flexShrink: 0, borderRadius: 9, background: pal.lilac1, display: "grid", placeItems: "center" }}><Ic n={s.icon} s={16} c={pal.primary} /></span>
                  <div><div style={{ fontSize: 13.5, fontWeight: 700, color: pal.ink }}>{s.t}</div><div style={{ fontSize: 12.5, color: pal.g600, marginTop: 1, lineHeight: 1.45 }}>{s.d}</div></div>
                </div>
              ))}
            </div>
            {/* price gap mini-bar */}
            {gap !== 0 && (
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${pal.g100}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: pal.g600, marginBottom: 6 }}><span>Gap de preço vs. região</span><span style={{ fontWeight: 700, color: gap > 0 ? "#C2410C" : "#1E7A43" }}>{gap > 0 ? "+" : ""}{gap}%</span></div>
                <div style={{ position: "relative", height: 8, borderRadius: 999, background: pal.g100 }}>
                  <div style={{ position: "absolute", left: "50%", top: -2, bottom: -2, width: 2, background: pal.g300 }} />
                  <div style={{ position: "absolute", left: gap > 0 ? "50%" : `${50 + gap}%`, width: `${Math.min(Math.abs(gap) * 3, 45)}%`, top: 0, bottom: 0, borderRadius: 999, background: gap > 0 ? "#EA580C" : "#2E9E5B" }} />
                </div>
                <div style={{ fontSize: 11, color: pal.g500, marginTop: 5 }}>Pede {op.price} · média dos comparáveis abaixo</div>
              </div>
            )}
          </div>
          {/* COMPARÁVEIS */}
          <div style={{ background: "#fff", border: `1px solid ${pal.g300}`, borderRadius: 14, padding: 16, marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}><Ic n="scale" s={16} c={pal.primary} /><span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14.5, color: pal.ink }}>Imóveis comparáveis</span></div>
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {op.comparaveis.map((c: any, i: number) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, paddingBottom: 9, borderBottom: i < op.comparaveis.length - 1 ? `1px solid ${pal.g100}` : "none" }}>
                  <span style={{ width: 30, height: 30, flexShrink: 0, borderRadius: 8, background: pal.g100, display: "grid", placeItems: "center" }}><Ic n="map-pin" s={15} c={pal.g500} /></span>
                  <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 12.5, fontWeight: 600, color: pal.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.end}</div><div style={{ fontSize: 11.5, color: pal.g500 }}>{c.m2} m²</div></div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: pal.g700, flexShrink: 0 }}>{c.price}</span>
                </div>
              ))}
            </div>
          </div>
          {/* CLIENTES */}
          {op.clientes.length > 0 && (
            <div style={{ background: "#fff", border: `1px solid ${pal.g300}`, borderRadius: 14, padding: 16, marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}><Ic n="users" s={16} c="#EA580C" /><span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14.5, color: pal.ink, flex: 1 }}>Clientes que combinam</span><span style={{ fontSize: 11, fontWeight: 700, color: "#C2410C", background: "#FCEBDD", borderRadius: 999, padding: "2px 8px" }}>{op.clientes.length}</span></div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {op.clientes.map((c: any, i: number) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 11 }}>
                    <span style={{ width: 34, height: 34, flexShrink: 0, borderRadius: "50%", background: `linear-gradient(135deg, ${pal.light}, ${pal.deep})`, display: "grid", placeItems: "center", color: "#fff", fontWeight: 700, fontSize: 12, fontFamily: "var(--font-display)" }}>{c.ini}</span>
                    <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 13.5, fontWeight: 600, color: pal.ink }}>{c.nome}</div><div style={{ fontSize: 12, color: pal.g500, marginTop: 1 }}>{c.busca}</div></div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* compliance note */}
          <div style={{ display: "flex", gap: 8, fontSize: 11.5, color: pal.g500, lineHeight: 1.5, padding: "0 2px" }}>
            <Ic n="shield-check" s={14} c={pal.g500} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>Dados do anúncio (públicos). O contato do proprietário aparece após captar, na aba <strong style={{ color: pal.g700 }}>Proprietários</strong>, com base legal.</span>
          </div>
        </div>
        {/* footer captar */}
        <div style={{ padding: "14px 18px", borderTop: `1px solid ${pal.g300}`, background: "#fff", flexShrink: 0 }}>
          <button onClick={() => { onCaptar(op); onClose(); }} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 9, border: "none", background: pal.primary, color: "#fff", borderRadius: 12, padding: "14px", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 15, boxShadow: "var(--shadow-purple)" }}>
            <Ic n="crosshair" s={18} c="#fff" /> Captar este imóvel
          </button>
          <div style={{ textAlign: "center", fontSize: 11.5, color: pal.g500, marginTop: 8 }}>Vai pro seu funil de captação na etapa <strong style={{ color: pal.g700 }}>Prospectar</strong>.</div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   PAGE
   ============================================================ */
export default function RadarOportunidadesPage() {
  const [isMobile, setIsMobile] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [sort, setSort] = React.useState("Potencial");
  const [ops, setOps] = React.useState<any[]>(() => RD_OPS.map(o => ({ ...o })));
  const [detail, setDetail] = React.useState<any>(null);
  const [toast, setToast] = React.useState<ToastT | null>(null);
  const toastTimer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  React.useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 1024);
    onResize();
    window.addEventListener("resize", onResize);
    const t0 = setTimeout(() => setLoading(false), 850);
    return () => { window.removeEventListener("resize", onResize); clearTimeout(t0); };
  }, []);

  const fire = (msg: string, icon?: string) => { setToast({ msg, icon, id: Date.now() }); clearTimeout(toastTimer.current); toastTimer.current = setTimeout(() => setToast(null), 2800); };
  const onCaptar = (op: any) => { setOps(o => o.filter(x => x.id !== op.id)); fire("Adicionada ao seu funil de captação (Prospectar)", "crosshair"); };
  const onDismiss = (op: any) => { setOps(o => o.filter(x => x.id !== op.id)); fire("Oportunidade dispensada · a IA aprende com isso", "eye-off"); };

  const sorted = sortOps(ops, sort);
  const demandCount = RD_OPS.filter(o => o.demandaN > 0).length;

  const feed = (
    <div style={{ padding: isMobile ? 16 : 28, maxWidth: 1180, margin: "0 auto" }}>
      <RadarHeader count={RD_OPS.length} demandCount={demandCount} />
      <FilterBar sort={sort} setSort={setSort} onToast={fire} />
      {sorted.length === 0 ? (
        <div style={{ textAlign: "center", padding: "70px 20px", color: pal.g500 }}>
          <div style={{ width: 64, height: 64, borderRadius: 18, background: pal.lilac2, display: "grid", placeItems: "center", margin: "0 auto 14px" }}><Ic n="radar" s={30} c={pal.primary} /></div>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, color: pal.ink }}>Nenhuma oportunidade com esses filtros</div>
          <div style={{ fontSize: 13.5, marginTop: 6 }}>Ajuste os filtros ou volte amanhã, o Radar atualiza todo dia.</div>
        </div>
      ) : (
        <div data-tour="radar-lista" style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
          {sorted.map(op => <OpCard key={op.id} op={op} onDetails={setDetail} onCaptar={onCaptar} onDismiss={onDismiss} />)}
        </div>
      )}
    </div>
  );

  return (
    <CorretorChrome title="Radar" subtitle="Inteligência de captação: oportunidades pra você." searchPlaceholder="Buscar imóvel, bairro ou tipo" radar="Oportunidades" radarRight={<RadarCredits />}>
      {loading ? <Skeleton isMobile={isMobile} /> : feed}
      {detail && <DetailPanel op={detail} isMobile={isMobile} onClose={() => setDetail(null)} onCaptar={onCaptar} />}
      <Toast toast={toast} />
    </CorretorChrome>
  );
}
