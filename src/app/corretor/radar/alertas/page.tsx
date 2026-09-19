"use client";
import * as React from "react";
import CorretorChrome, { pal, Ic } from "@/components/corretor/CorretorChrome";
import RadarCredits from "@/components/corretor/RadarCredits";

/* ============================================================
   ALERTAS (porte fiel de alertas-data.jsx + alertas.jsx + alertas-create.jsx + alertas-app.jsx)
   ============================================================ */

/* ---------- data ---------- */
const AL_TYPES: Record<string, { label: string; c: string; bg: string; icon: string; star?: boolean }> = {
  demanda:   { label: "Bate com demanda", c: "#C2410C", bg: "#FCEBDD", icon: "sun", star: true },
  queda:     { label: "Queda de preço", c: "#1E7A43", bg: "#E6F4EC", icon: "trending-down" },
  dias:      { label: "Dias no mercado", c: "#B8860B", bg: "#FBF1DC", icon: "clock" },
  novo:      { label: "Novo anúncio", c: "#2563A8", bg: "#E5EEF7", icon: "sparkles" },
  reanuncio: { label: "Reanúncio", c: "#4F46E5", bg: "#E0E7FF", icon: "rotate-ccw" },
};

const AL_FEED_INIT: any[] = [
  {
    id: "f1", tipo: "demanda", time: "há 10 min", cliente: "Mariana Costa", ini: "MC",
    title: "Novo imóvel para a Mariana Costa", desc: "Bate com a busca dela: 2 quartos, até R$ 750 mil, Campo Belo.",
    imovel: { t: "Apto 2q · Campo Belo", price: "R$ 720.000", m2: 68, code: "52310", av: ["#6366F1", "#312E81"] },
    actions: ["captar", "avisar", "ver"],
  },
  {
    id: "f2", tipo: "queda", time: "há 2h",
    title: "Cobertura em Moema baixou 8%", desc: "De R$ 1.300.000 para R$ 1.196.000: dono ajustando para vender.",
    imovel: { t: "Cobertura · Moema", price: "R$ 1.196.000", priceOld: "R$ 1.300.000", m2: 180, code: "47710", av: ["#4338CA", "#231038"] },
    actions: ["ver", "captar"],
  },
  {
    id: "f3", tipo: "dias", time: "há 5h",
    title: "Casa em Pinheiros há 90 dias no mercado", desc: "Bem acima da média do bairro: dono provavelmente motivado.",
    imovel: { t: "Casa · Pinheiros", price: "R$ 1.150.000", m2: 140, code: "50120", av: ["#3B7A57", "#1E4533"] },
    actions: ["captar", "ver"],
  },
  {
    id: "f4", tipo: "novo", time: "há 8h",
    title: "3 novos apartamentos em Vila Mariana hoje", desc: "Dentro do seu filtro salvo. Chegue antes da concorrência.",
    imovel: { t: "Vila Mariana · 3 anúncios", price: "a partir de R$ 640.000", m2: null, code: null, av: ["#2563A8", "#163A5C"], multi: true },
    actions: ["verlista"],
  },
  {
    id: "f5", tipo: "reanuncio", time: "ontem", cliente: "Carlos Eduardo", ini: "CE",
    title: "Imóvel reanunciado bate com o Carlos", desc: "Voltou ao mercado após sair: pode estar mais negociável agora.",
    imovel: { t: "Apto 3q · Boa Viagem", price: "R$ 890.000", m2: 92, code: "48655", av: ["#B5632F", "#7A3B16"] },
    actions: ["captar", "avisar", "ver"],
  },
];

const AL_RULES_INIT: any[] = [
  { id: "r1", tipo: "novo", title: "Apartamentos 2–3q em Campo Belo até R$ 800k", criterios: "Apartamento · 2–3 quartos · Campo Belo · até R$ 800.000", freq: "Na hora", canais: ["push", "app"], ativo: true },
  { id: "r2", tipo: "demanda", title: "Imóveis que batem com a demanda dos meus clientes", criterios: "Cruza com a carteira de clientes · todas as regiões", freq: "Na hora", canais: ["push"], ativo: true, star: true },
  { id: "r3", tipo: "queda", title: "Quedas de preço em Moema (venda)", criterios: "Queda ≥ 5% · Moema · Venda", freq: "Resumo diário", canais: ["app"], ativo: true },
  { id: "r4", tipo: "dias", title: "Imóveis com 60+ dias no mercado em Pinheiros", criterios: "60+ dias · Pinheiros · qualquer tipo", freq: "Na hora", canais: ["whatsapp"], ativo: false },
];

const AL_CANAIS: Record<string, { label: string; icon: string }> = {
  app: { label: "App", icon: "layout-grid" },
  push: { label: "Push", icon: "bell" },
  whatsapp: { label: "WhatsApp", icon: "message-circle" },
  email: { label: "E-mail", icon: "mail" },
};

const AL_CREATE_TYPES: any[] = [
  { k: "novo", title: "Novo anúncio", desc: "Por filtro ou região", icon: "sparkles", c: "#2563A8", bg: "#E5EEF7" },
  { k: "demanda", title: "Bate com a demanda de um cliente", desc: "Cruza com a sua carteira", icon: "sun", c: "#C2410C", bg: "#FCEBDD", star: true },
  { k: "queda", title: "Queda de preço", desc: "Dono ajustando o valor", icon: "trending-down", c: "#1E7A43", bg: "#E6F4EC" },
  { k: "dias", title: "Imóvel há X dias no mercado", desc: "Sinal de dono motivado", icon: "clock", c: "#B8860B", bg: "#FBF1DC" },
  { k: "reanuncio", title: "Reanúncio", desc: "Voltou ao mercado", icon: "rotate-ccw", c: "#4F46E5", bg: "#E0E7FF" },
];

const AL_CLIENTES = ["Mariana Costa · 2q Campo Belo até R$ 750k", "Carlos Eduardo · 3q Boa Viagem", "Fernanda Lima · investimento Pina", "João Pedro · casa Candeias"];
const AL_REGIOES = ["Campo Belo", "Moema", "Pinheiros", "Vila Mariana", "Itaim Bibi", "Brooklin"];
const AL_TIPOS_IMOVEL = ["Apartamento", "Casa", "Cobertura", "Comercial", "Terreno"];

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
function Skeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {[0, 1, 2].map(i => <div key={i} className="sk" style={{ height: 168, borderRadius: 14 }} />)}
    </div>
  );
}

/* ---------- TypeSeal ---------- */
function TypeSeal({ tipo, big }: { tipo: string; big?: boolean }) {
  const m = AL_TYPES[tipo];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: m.bg, color: m.c, fontSize: big ? 12 : 11, fontWeight: 700, borderRadius: 999, padding: big ? "4px 11px" : "3px 9px", whiteSpace: "nowrap" }}>
      <Ic n={m.icon} s={big ? 14 : 12} c={m.c} /> {m.label}
    </span>
  );
}

const ACTION_DEF: Record<string, { label: string; icon: string; primary?: boolean }> = {
  captar: { label: "Captar", icon: "crosshair", primary: true },
  avisar: { label: "Avisar cliente", icon: "message-circle" },
  ver: { label: "Ver", icon: "eye" },
  verlista: { label: "Ver imóveis", icon: "list", primary: true },
};

/* ---------- FeedCard ---------- */
function FeedCard({ item, onAction, onDismiss }: { item: any; onAction: (a: string, item: any) => void; onDismiss: (item: any) => void }) {
  const m = AL_TYPES[item.tipo];
  const star = m.star;
  return (
    <div style={{ background: "#fff", border: star ? `1.5px solid ${m.c}33` : `1px solid ${pal.g300}`, borderLeft: `3px solid ${m.c}`, borderRadius: 14, padding: 16, position: "relative" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <span style={{ width: 40, height: 40, flexShrink: 0, borderRadius: 11, background: m.bg, display: "grid", placeItems: "center" }}><Ic n={m.icon} s={20} c={m.c} /></span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <TypeSeal tipo={item.tipo} />
            {item.cliente && <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: pal.lilac2, color: pal.primary, borderRadius: 999, padding: "2px 9px 2px 3px", fontSize: 11, fontWeight: 700 }}><span style={{ width: 17, height: 17, borderRadius: "50%", background: `linear-gradient(135deg, ${pal.light}, ${pal.deep})`, display: "grid", placeItems: "center", color: "#fff", fontSize: 8, fontWeight: 700 }}>{item.ini}</span> {item.cliente}</span>}
            <span style={{ marginLeft: "auto", fontSize: 11.5, color: pal.g500 }}>{item.time}</span>
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: pal.ink, marginTop: 8 }}>{item.title}</div>
          <div style={{ fontSize: 13, color: pal.g600, marginTop: 3, lineHeight: 1.45 }}>{item.desc}</div>
          {/* imóvel mini */}
          <div style={{ display: "flex", alignItems: "center", gap: 11, background: pal.g100, borderRadius: 11, padding: 10, marginTop: 11 }}>
            <div style={{ width: 44, height: 40, flexShrink: 0, borderRadius: 8, background: `linear-gradient(135deg, ${item.imovel.av[0]}, ${item.imovel.av[1]})`, display: "grid", placeItems: "center", position: "relative" }}>
              <Ic n={item.imovel.multi ? "layers" : "building-2"} s={18} c="rgba(255,255,255,.6)" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: pal.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.imovel.t}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 1 }}>
                {item.imovel.priceOld && <span style={{ fontSize: 11.5, color: pal.g500, textDecoration: "line-through" }}>{item.imovel.priceOld}</span>}
                <span style={{ fontSize: 13, fontWeight: 700, color: pal.primary }}>{item.imovel.price}</span>
                {item.imovel.m2 && <span style={{ fontSize: 11.5, color: pal.g500 }}>· {item.imovel.m2} m²</span>}
                {item.imovel.code && <span style={{ fontSize: 11, color: pal.g500 }}>· Cód {item.imovel.code}</span>}
              </div>
            </div>
          </div>
          {/* actions */}
          <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
            {item.actions.map((a: string) => {
              const d = ACTION_DEF[a];
              return (
                <button key={a} onClick={() => onAction(a, item)} style={{ display: "flex", alignItems: "center", gap: 6, border: d.primary ? "none" : `1px solid ${pal.g300}`, background: d.primary ? pal.primary : "#fff", color: d.primary ? "#fff" : pal.g700, borderRadius: 9, padding: "8px 14px", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 12.5, boxShadow: d.primary ? "var(--shadow-purple)" : "none" }}>
                  <Ic n={d.icon} s={14} c={d.primary ? "#fff" : pal.g600} /> {d.label}
                </button>
              );
            })}
            <button onClick={() => onDismiss(item)} title="Dispensar" style={{ marginLeft: "auto", width: 34, height: 34, border: `1px solid ${pal.g300}`, background: "#fff", borderRadius: 9, display: "grid", placeItems: "center", cursor: "pointer" }}><Ic n="x" s={15} c={pal.g500} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- RuleRow ---------- */
function RuleRow({ rule, onToggle, onEdit, onDelete }: { rule: any; onToggle: (r: any) => void; onEdit: (r: any) => void; onDelete: (r: any) => void }) {
  const m = AL_TYPES[rule.tipo];
  return (
    <div style={{ background: "#fff", border: `1px solid ${pal.g300}`, borderRadius: 14, padding: 16, opacity: rule.ativo ? 1 : 0.72 }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <span style={{ width: 38, height: 38, flexShrink: 0, borderRadius: 10, background: m.bg, display: "grid", placeItems: "center" }}><Ic n={m.icon} s={18} c={m.c} /></span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14.5, color: pal.ink }}>{rule.title}</span>
            {rule.star && <Ic n="sparkles" s={14} c={pal.primary} />}
          </div>
          <div style={{ fontSize: 12.5, color: pal.g500, marginTop: 3, lineHeight: 1.4 }}>{rule.criterios}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 9, flexWrap: "wrap" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11.5, color: pal.g600, fontWeight: 600 }}><Ic n={rule.freq === "Na hora" ? "zap" : "calendar-clock"} s={13} c={pal.g500} /> {rule.freq}</span>
            <span style={{ width: 1, height: 12, background: pal.g300 }} />
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {rule.canais.map((c: string) => { const cd = AL_CANAIS[c]; return <span key={c} title={cd.label} style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, color: pal.g600, fontWeight: 600 }}><Ic n={cd.icon} s={13} c={pal.g500} /> {cd.label}</span>; })}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10, flexShrink: 0 }}>
          <button onClick={() => onToggle(rule)} title={rule.ativo ? "Pausar" : "Ativar"} style={{ width: 44, height: 25, borderRadius: 999, border: "none", background: rule.ativo ? pal.primary : pal.g300, position: "relative", cursor: "pointer" }}>
            <span style={{ position: "absolute", top: 3, left: rule.ativo ? 22 : 3, width: 19, height: 19, borderRadius: "50%", background: "#fff", transition: "left .15s", boxShadow: "0 1px 2px rgba(0,0,0,.2)" }} />
          </button>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => onEdit(rule)} title="Editar" style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${pal.g300}`, background: "#fff", display: "grid", placeItems: "center", cursor: "pointer" }}><Ic n="pencil" s={15} c={pal.g600} /></button>
            <button onClick={() => onDelete(rule)} title="Excluir" style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${pal.g300}`, background: "#fff", display: "grid", placeItems: "center", cursor: "pointer" }}><Ic n="trash-2" s={15} c={pal.g500} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- CreateAlertModal ---------- */
const inSt: React.CSSProperties = { width: "100%", border: `1px solid ${pal.g300}`, borderRadius: 10, padding: "11px 13px", fontFamily: "var(--font-body)", fontSize: 14, color: pal.ink, outline: "none", background: "#fff" };
const grpSt: React.CSSProperties = { fontSize: 11, fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: pal.g500, marginBottom: 10 };

function Sel({ value, onChange, options, placeholder }: { value: string; onChange: (v: string) => void; options: string[]; placeholder: string }) {
  return (
    <div style={{ position: "relative" }}>
      <select value={value} onChange={e => onChange(e.target.value)} style={{ ...inSt, appearance: "none", cursor: "pointer", paddingRight: 36, color: value ? pal.ink : pal.g500 }}>
        <option value="">{placeholder}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <Ic n="chevron-down" s={17} c={pal.g500} style={{ position: "absolute", right: 12, top: 12, pointerEvents: "none" }} />
    </div>
  );
}

function CreateAlertModal({ isMobile, initialType, onClose, onCreate, onToast }: { isMobile: boolean; initialType?: string; onClose: () => void; onCreate: (data: any) => void; onToast: (msg: string, icon?: string) => void }) {
  const [tipo, setTipo] = React.useState(initialType || "");
  const [cliente, setCliente] = React.useState("");
  const [regiao, setRegiao] = React.useState("");
  const [tImovel, setTImovel] = React.useState("");
  const [pmin, setPmin] = React.useState("");
  const [pmax, setPmax] = React.useState("");
  const [dias, setDias] = React.useState("60");
  const [freq, setFreq] = React.useState("Na hora");
  const [canais, setCanais] = React.useState<string[]>(["push", "app"]);
  const toggleCanal = (c: string) => setCanais(x => x.includes(c) ? x.filter(y => y !== c) : [...x, c]);

  const submit = () => { onCreate({ tipo, cliente, regiao }); onToast("Alerta criado · você será avisado", "bell-plus"); onClose(); };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 8000, background: "rgba(28,22,40,.5)", display: "grid", placeItems: isMobile ? "stretch" : "center", padding: isMobile ? 0 : 24 }}>
      <div onClick={e => e.stopPropagation()} style={{ width: isMobile ? "100%" : 560, maxWidth: "100%", height: isMobile ? "100%" : "auto", maxHeight: isMobile ? "100%" : "92vh", background: "#fff", borderRadius: isMobile ? 0 : 18, overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "var(--shadow-lg)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 18px", borderBottom: `1px solid ${pal.g100}`, flexShrink: 0 }}>
          <span style={{ width: 38, height: 38, borderRadius: 10, background: pal.lilac2, display: "grid", placeItems: "center" }}><Ic n="bell-plus" s={19} c={pal.primary} /></span>
          <div style={{ flex: 1 }}><div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, color: pal.ink }}>Criar alerta</div><div style={{ fontSize: 12, color: pal.g500 }}>Receba avisos do que importa para captar</div></div>
          <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: 10, border: "none", background: pal.g100, display: "grid", placeItems: "center", cursor: "pointer" }}><Ic n="x" s={19} c={pal.g700} /></button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: 18 }}>
          {/* TIPO */}
          <div style={grpSt}>Tipo de alerta</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 22 }}>
            {AL_CREATE_TYPES.map(t => {
              const on = tipo === t.k;
              return (
                <button key={t.k} onClick={() => setTipo(t.k)} style={{ display: "flex", alignItems: "center", gap: 12, border: on ? `1.5px solid ${pal.primary}` : `1px solid ${pal.g300}`, background: on ? pal.lilac1 : "#fff", borderRadius: 12, padding: "12px 14px", cursor: "pointer", textAlign: "left", fontFamily: "var(--font-body)" }}>
                  <span style={{ width: 36, height: 36, flexShrink: 0, borderRadius: 10, background: t.bg, display: "grid", placeItems: "center" }}><Ic n={t.icon} s={18} c={t.c} /></span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}><span style={{ fontSize: 13.5, fontWeight: 600, color: pal.ink }}>{t.title}</span>{t.star && <span style={{ fontSize: 9.5, fontWeight: 700, color: "#C2410C", background: "#FCEBDD", borderRadius: 999, padding: "1px 7px" }}>DESTAQUE</span>}</div>
                    <div style={{ fontSize: 12, color: pal.g500, marginTop: 1 }}>{t.desc}</div>
                  </div>
                  <span style={{ width: 18, height: 18, borderRadius: "50%", flexShrink: 0, border: on ? `6px solid ${pal.primary}` : `2px solid ${pal.g300}` }} />
                </button>
              );
            })}
          </div>

          {/* CRITÉRIOS (dinâmicos) */}
          {tipo && (
            <div style={{ marginBottom: 22 }}>
              <div style={grpSt}>Critérios</div>
              {tipo === "demanda" ? (
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: pal.g700, marginBottom: 6 }}>Cliente / demanda</div>
                  <Sel value={cliente} onChange={setCliente} options={AL_CLIENTES} placeholder="Escolha um cliente da sua carteira" />
                  <div style={{ display: "flex", gap: 8, marginTop: 10, background: "#FCEBDD", border: "1px solid #F2C9A8", borderRadius: 10, padding: "10px 12px", fontSize: 12, color: "#9A3A12", lineHeight: 1.45 }}>
                    <Ic n="sun" s={15} c="#EA580C" style={{ flexShrink: 0, marginTop: 1 }} /><span>Cruzamos automaticamente com a busca registrada do cliente. Você é avisado quando surgir algo que combina.</span>
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div><div style={{ fontSize: 12.5, fontWeight: 600, color: pal.g700, marginBottom: 6 }}>Região</div><Sel value={regiao} onChange={setRegiao} options={AL_REGIOES} placeholder="Selecione" /></div>
                    <div><div style={{ fontSize: 12.5, fontWeight: 600, color: pal.g700, marginBottom: 6 }}>Tipo de imóvel</div><Sel value={tImovel} onChange={setTImovel} options={AL_TIPOS_IMOVEL} placeholder="Todos" /></div>
                  </div>
                  {tipo === "dias" ? (
                    <div><div style={{ fontSize: 12.5, fontWeight: 600, color: pal.g700, marginBottom: 6 }}>Dias mínimos no mercado</div>
                      <div style={{ display: "flex", gap: 8 }}>{["30", "60", "90"].map(d => <button key={d} onClick={() => setDias(d)} style={{ flex: 1, border: dias === d ? `1.5px solid ${pal.primary}` : `1px solid ${pal.g300}`, background: dias === d ? pal.lilac2 : "#fff", color: dias === d ? pal.primary : pal.g700, borderRadius: 10, padding: "10px", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13 }}>{d}+ dias</button>)}</div>
                    </div>
                  ) : (
                    <div><div style={{ fontSize: 12.5, fontWeight: 600, color: pal.g700, marginBottom: 6 }}>Faixa de preço</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <input value={pmin} onChange={e => setPmin(e.target.value)} placeholder="Mín" style={inSt} /><span style={{ color: pal.g500 }}>—</span><input value={pmax} onChange={e => setPmax(e.target.value)} placeholder="Máx" style={inSt} />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* FREQUÊNCIA */}
          {tipo && (
            <React.Fragment>
              <div style={{ marginBottom: 22 }}>
                <div style={grpSt}>Frequência</div>
                <div style={{ display: "flex", gap: 8 }}>
                  {([["Na hora", "zap", "Avisa assim que acontece"], ["Resumo diário", "calendar-clock", "Uma vez por dia"]] as [string, string, string][]).map(([k, ic, d]) => {
                    const on = freq === k;
                    return <button key={k} onClick={() => setFreq(k)} style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, border: on ? `1.5px solid ${pal.primary}` : `1px solid ${pal.g300}`, background: on ? pal.lilac1 : "#fff", borderRadius: 11, padding: "12px 13px", cursor: "pointer", textAlign: "left" }}><Ic n={ic} s={18} c={on ? pal.primary : pal.g600} /><div><div style={{ fontSize: 13, fontWeight: 600, color: on ? pal.primary : pal.ink }}>{k}</div><div style={{ fontSize: 11, color: pal.g500 }}>{d}</div></div></button>;
                  })}
                </div>
              </div>
              {/* CANAL */}
              <div>
                <div style={grpSt}>Como quer ser avisado</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {Object.keys(AL_CANAIS).map(c => {
                    const cd = AL_CANAIS[c]; const on = canais.includes(c);
                    return <button key={c} onClick={() => toggleCanal(c)} style={{ display: "inline-flex", alignItems: "center", gap: 7, border: on ? `1.5px solid ${pal.primary}` : `1px solid ${pal.g300}`, background: on ? pal.lilac2 : "#fff", color: on ? pal.primary : pal.g700, borderRadius: 999, padding: "8px 14px", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13 }}>{on && <Ic n="check" s={14} c={pal.primary} />}<Ic n={cd.icon} s={15} c={on ? pal.primary : pal.g600} /> {cd.label}</button>;
                  })}
                </div>
              </div>
            </React.Fragment>
          )}
        </div>

        <div style={{ display: "flex", gap: 10, padding: "14px 18px", borderTop: `1px solid ${pal.g100}`, flexShrink: 0 }}>
          <button onClick={onClose} style={{ border: `1px solid ${pal.g300}`, background: "#fff", borderRadius: 11, padding: "12px 16px", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 14, color: pal.g700 }}>Cancelar</button>
          <button onClick={submit} disabled={!tipo} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, border: "none", background: tipo ? pal.primary : pal.g300, color: "#fff", borderRadius: 11, padding: "12px", cursor: tipo ? "pointer" : "default", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 14, boxShadow: tipo ? "var(--shadow-purple)" : "none" }}><Ic n="bell-plus" s={17} c="#fff" /> Criar alerta</button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   PAGE
   ============================================================ */
export default function AlertasPage() {
  const [isMobile, setIsMobile] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [tab, setTab] = React.useState("Novidades");
  const [feed, setFeed] = React.useState<any[]>(() => AL_FEED_INIT.map(f => ({ ...f })));
  const [rules, setRules] = React.useState<any[]>(() => AL_RULES_INIT.map(r => ({ ...r })));
  const [creating, setCreating] = React.useState<any>(null);
  const [toast, setToast] = React.useState<ToastT | null>(null);
  const toastTimer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  React.useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 1024);
    onResize();
    window.addEventListener("resize", onResize);
    const t0 = setTimeout(() => setLoading(false), 800);
    return () => { window.removeEventListener("resize", onResize); clearTimeout(t0); };
  }, []);

  const fire = (msg: string, icon?: string) => { setToast({ msg, icon, id: Date.now() }); clearTimeout(toastTimer.current); toastTimer.current = setTimeout(() => setToast(null), 2800); };

  const onAction = (a: string, item: any) => {
    if (a === "captar") { setFeed(f => f.filter(x => x.id !== item.id)); fire("Imóvel enviado ao funil de captação (Prospectar)", "crosshair"); }
    else if (a === "avisar") fire("Abrindo conversa com " + item.cliente + "…", "message-circle");
    else if (a === "ver") fire("Abrindo o anúncio…", "eye");
    else if (a === "verlista") fire("Abrindo lista de imóveis…", "list");
  };
  const onDismiss = (item: any) => { setFeed(f => f.filter(x => x.id !== item.id)); fire("Alerta dispensado", "x"); };
  const onToggleRule = (rule: any) => { setRules(rs => rs.map(r => r.id === rule.id ? { ...r, ativo: !r.ativo } : r)); fire(rule.ativo ? "Alerta pausado" : "Alerta ativado", rule.ativo ? "pause" : "play"); };
  const onDeleteRule = (rule: any) => { setRules(rs => rs.filter(r => r.id !== rule.id)); fire("Alerta excluído", "trash-2"); };
  const onCreate = () => { /* mock: toast handled in modal */ };

  const content = (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: isMobile ? "16px" : "24px 28px" }}>
      {/* segmented + create */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 4, background: pal.g100, borderRadius: 11, padding: 4 }}>
          {([["Novidades", "bell-ring", feed.length], ["Meus alertas", "settings-2", rules.length]] as [string, string, number][]).map(([k, ic, n]) => {
            const on = tab === k;
            return <button key={k} onClick={() => setTab(k)} style={{ display: "flex", alignItems: "center", gap: 7, border: "none", borderRadius: 8, padding: "9px 16px", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13.5, background: on ? "#fff" : "transparent", color: on ? pal.primary : pal.g500, boxShadow: on ? "var(--shadow-sm)" : "none" }}><Ic n={ic} s={16} c={on ? pal.primary : pal.g500} /> {k} <span style={{ fontSize: 11, fontWeight: 700, color: on ? pal.primary : pal.g500, background: on ? pal.lilac2 : pal.g300 + "55", borderRadius: 999, padding: "0 7px" }}>{n}</span></button>;
          })}
        </div>
        <button onClick={() => setCreating({})} style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 7, border: "none", background: pal.primary, color: "#fff", borderRadius: 10, padding: "10px 16px", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 13.5, boxShadow: "var(--shadow-purple)" }}><Ic n="plus" s={17} c="#fff" /> Criar alerta</button>
      </div>

      {loading ? <Skeleton /> : tab === "Novidades" ? (
        feed.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: pal.g500 }}>
            <div style={{ width: 64, height: 64, borderRadius: 18, background: pal.lilac2, display: "grid", placeItems: "center", margin: "0 auto 14px" }}><Ic n="bell-off" s={28} c={pal.primary} /></div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, color: pal.ink }}>Tudo em dia</div>
            <div style={{ fontSize: 13.5, marginTop: 6 }}>Sem novidades agora. Você será avisado quando algo surgir.</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ fontSize: 12, color: pal.g500, fontWeight: 600 }}>{feed.length} {feed.length === 1 ? "novidade" : "novidades"} · mais recente no topo</div>
            {feed.map(item => <FeedCard key={item.id} item={item} onAction={onAction} onDismiss={onDismiss} />)}
          </div>
        )
      ) : (
        rules.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: pal.g500 }}>
            <div style={{ width: 64, height: 64, borderRadius: 18, background: pal.lilac2, display: "grid", placeItems: "center", margin: "0 auto 14px" }}><Ic n="bell-plus" s={28} c={pal.primary} /></div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, color: pal.ink }}>Nenhum alerta ainda</div>
            <div style={{ fontSize: 13.5, marginTop: 6, marginBottom: 16 }}>Crie o primeiro e nunca perca uma oportunidade de captação.</div>
            <button onClick={() => setCreating({})} style={{ display: "inline-flex", alignItems: "center", gap: 7, border: "none", background: pal.primary, color: "#fff", borderRadius: 10, padding: "11px 18px", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 14, boxShadow: "var(--shadow-purple)" }}><Ic n="plus" s={17} c="#fff" /> Criar alerta</button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {rules.map(rule => <RuleRow key={rule.id} rule={rule} onToggle={onToggleRule} onEdit={(r) => setCreating({ initialType: r.tipo })} onDelete={onDeleteRule} />)}
          </div>
        )
      )}
    </div>
  );

  return (
    <CorretorChrome title="Radar" subtitle="Alertas proativos: a oportunidade chega até você." searchPlaceholder="Buscar alerta" radar="Alertas" radarRight={<RadarCredits />}>
      {content}
      {creating && <CreateAlertModal isMobile={isMobile} initialType={creating.initialType} onClose={() => setCreating(null)} onCreate={onCreate} onToast={fire} />}
      <Toast toast={toast} />
    </CorretorChrome>
  );
}
