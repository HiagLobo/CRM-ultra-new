"use client";
import * as React from "react";
import CorretorChrome, { pal, Ic } from "@/components/corretor/CorretorChrome";
import RadarCredits, { ConfirmConsume, getCredits, setCredits } from "@/components/corretor/RadarCredits";

/* ============================================================
   RADAR — PROPRIETÁRIOS
   Porte fiel de prop-data.jsx + prop.jsx + prop-app.jsx
   ============================================================ */

/* ---------- DATA (prop-data.jsx) ---------- */
/* Donos achados pelo Radar são terceiros, não gente da rede: e-mail em domínio
   reservado neutro (RFC 2606), nunca no domínio da rede do demo. */
const emailTerceiro = (usuario: string) => `${usuario}@email.example`;

const OW_CITIES = ["São Paulo, SP", "Recife, PE", "Rio de Janeiro, RJ"];

const OW_RESULTS: any[] = [
  {
    id: "o1", unidade: "Apto 11 · Bloco A", endereco: "Rua Exemplo, 100", bairro: "Campo Belo · São Paulo",
    tipo: "Apartamento", m2: 72, owner: "Roberto A.", vinculo: "Proprietário desde 2017",
    fone: "(11) 9XXXX-XX21", email: emailTerceiro("r****a"),
    demanda: 2, av: ["#6366F1", "#312E81"],
  },
  {
    id: "o2", unidade: "Apto 22 · Bloco B", endereco: "Rua Exemplo, 100", bairro: "Campo Belo · São Paulo",
    tipo: "Apartamento", m2: 64, owner: "Marina L.", vinculo: "Proprietária desde 2021",
    fone: "(11) 9XXXX-XX07", email: emailTerceiro("m****l"),
    demanda: 0, av: ["#2563A8", "#163A5C"],
  },
];

const OW_HISTORY: any[] = [
  { id: "h1", q: "Rua Exemplo, 100 · Campo Belo", date: "Hoje · 10:24", n: 2 },
  { id: "h2", q: "Av. Exemplo, 1450 · Campo Belo", date: "Ontem · 16:10", n: 1 },
  { id: "h3", q: "Rua Modelo, 88–120 · Pinheiros", date: "07 jun · 09:33", n: 4 },
];

/* ---------- STYLES ---------- */
const inSt: React.CSSProperties = { width: "100%", border: `1px solid ${pal.g300}`, borderRadius: 10, padding: "11px 13px", fontFamily: "var(--font-body)", fontSize: 14, color: pal.ink, outline: "none", background: "#fff" };

/* ---------- ComplianceLine (prop.jsx) ---------- */
function ComplianceLine({ onInfo }: { onInfo: () => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", fontSize: 12, color: pal.g500, lineHeight: 1.5 }}>
      <Ic n="shield-check" s={14} c={pal.success} style={{ flexShrink: 0 }} />
      <span>Exemplo da demonstração: proprietários e contatos são fictícios. No produto, a <strong style={{ color: pal.g600 }}>origem dos dados e a base legal</strong> serão informadas aqui.</span>
      <button onClick={onInfo} style={{ border: "none", background: "transparent", color: pal.primary, fontWeight: 600, fontSize: 12, cursor: "pointer", textDecoration: "underline", padding: 0 }}>Sobre esses dados</button>
    </div>
  );
}

/* ---------- OwnerCard (prop.jsx) ---------- */
function OwnerCard({ r, revealed, onReveal, onCaptar, onMapa }: { r: any; revealed: boolean; onReveal: (r: any) => void; onCaptar: (r: any) => void; onMapa: (r: any) => void }) {
  return (
    <div style={{ background: "#fff", border: `1px solid ${pal.g300}`, borderRadius: 16, overflow: "hidden" }}>
      <div style={{ display: "flex", gap: 14, padding: 16 }}>
        <div style={{ width: 60, height: 60, flexShrink: 0, borderRadius: 12, background: `linear-gradient(135deg, ${r.av[0]}, ${r.av[1]})`, display: "grid", placeItems: "center" }}><Ic n="building-2" s={24} c="rgba(255,255,255,.6)" /></div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15.5, color: pal.ink }}>{r.unidade}</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: pal.g600, background: pal.g100, borderRadius: 999, padding: "2px 9px" }}>{r.tipo} · {r.m2} m²</span>
          </div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12.5, color: pal.g500, marginTop: 3 }}><Ic n="map-pin" s={13} c={pal.g500} /> {r.endereco} · {r.bairro}</div>
          {r.demanda > 0 && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#FCEBDD", color: "#C2410C", borderRadius: 999, padding: "4px 11px", fontSize: 12, fontWeight: 700, marginTop: 10 }}>
              <Ic n="sun" s={14} c="#EA580C" /> {r.demanda} clientes seus querem comprar aqui
            </div>
          )}
        </div>
      </div>

      {/* owner minimized block — gated */}
      <div style={{ margin: "0 16px", padding: "13px 14px", background: pal.lilac1, border: `1px solid ${pal.lilac2}`, borderRadius: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
          <span style={{ width: 38, height: 38, flexShrink: 0, borderRadius: "50%", background: "#fff", border: `1px solid ${pal.lilac2}`, display: "grid", placeItems: "center" }}><Ic n="user-round" s={19} c={pal.primary} /></span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: pal.ink }}>{r.owner}</div>
            <div style={{ fontSize: 12, color: pal.g500 }}>{r.vinculo}</div>
          </div>
        </div>
        {revealed ? (
          <React.Fragment>
            <div style={{ display: "flex", gap: 18, marginTop: 11, flexWrap: "wrap" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: pal.g700, fontWeight: 600 }}><Ic n="phone" s={14} c={pal.primary} /> {r.fone}</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: pal.g700, fontWeight: 600 }}><Ic n="mail" s={14} c={pal.primary} /> {r.email}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 9, fontSize: 11, color: pal.g500 }}>
              <Ic n="eye" s={12} c={pal.g500} /> Mostramos só o necessário para captar — sem dossiê.
            </div>
          </React.Fragment>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 11, marginTop: 11 }}>
            <div style={{ flex: 1, display: "flex", gap: 16 }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: pal.g500, fontWeight: 600 }}><Ic n="phone" s={14} c={pal.g500} /> (11) •••••-••••</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: pal.g500, fontWeight: 600 }}><Ic n="mail" s={14} c={pal.g500} /> ••••••@•••</span>
            </div>
            <button onClick={() => onReveal(r)} style={{ display: "flex", alignItems: "center", gap: 6, border: "none", background: pal.primary, color: "#fff", borderRadius: 9, padding: "8px 13px", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 12.5, boxShadow: "var(--shadow-purple)", flexShrink: 0 }}>
              <Ic n="eye" s={14} c="#fff" /> Revelar <span style={{ display: "inline-flex", alignItems: "center", gap: 3, background: "rgba(255,255,255,.2)", borderRadius: 999, padding: "0 6px", fontSize: 11 }}><Ic n="coins" s={11} c="#fff" />100</span>
            </button>
          </div>
        )}
      </div>

      {/* actions */}
      <div style={{ display: "flex", gap: 9, padding: 16 }}>
        <button onClick={() => onCaptar(r)} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, border: "none", background: pal.primary, color: "#fff", borderRadius: 11, padding: "12px", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 14, boxShadow: "var(--shadow-purple)" }}><Ic n="crosshair" s={16} c="#fff" /> Iniciar captação</button>
        <button onClick={() => onMapa(r)} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, border: `1px solid ${pal.g300}`, background: "#fff", color: pal.g700, borderRadius: 11, padding: "12px 16px", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 14 }}><Ic n="map-pinned" s={16} c={pal.primary} /> Ver no mapa</button>
      </div>
    </div>
  );
}

/* ---------- InfoModal (prop.jsx) ---------- */
function InfoModal({ onClose }: { onClose: () => void }) {
  const items: [string, string, string][] = [
    ["scale", "Base legal", "No produto, a base legal de cada consulta será informada aqui."],
    ["file-check", "Origem dos dados", "No produto, a origem dos dados será informada aqui. Nesta demonstração, tudo é fictício."],
    ["minimize-2", "Minimização", "A tela mostra só o contato necessário para a captação, não um perfil completo."],
    ["history", "Acesso registrado", "A ideia é registrar cada consulta com a finalidade (captação). Nesta demonstração, nada é consultado de verdade."],
    ["gavel", "Direitos do titular", "No produto, o canal para pedidos de exclusão e correção será informado aqui."],
  ];
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 8000, background: "rgba(28,22,40,.5)", display: "grid", placeItems: "center", padding: 24 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: 520, maxWidth: "100%", maxHeight: "92vh", background: "#fff", borderRadius: 18, overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "var(--shadow-lg)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 18px", borderBottom: `1px solid ${pal.g100}` }}>
          <span style={{ width: 38, height: 38, borderRadius: 10, background: "#E6F4EC", display: "grid", placeItems: "center" }}><Ic n="shield-check" s={19} c="#2E9E5B" /></span>
          <div style={{ flex: 1 }}><div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: pal.ink }}>Sobre esses dados</div><div style={{ fontSize: 12, color: pal.g500 }}>Texto de exemplo da demonstração</div></div>
          <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: 10, border: "none", background: pal.g100, display: "grid", placeItems: "center", cursor: "pointer" }}><Ic n="x" s={19} c={pal.g700} /></button>
        </div>
        <div style={{ padding: 18, overflowY: "auto" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {items.map(([ic, t, d], i) => (
              <div key={i} style={{ display: "flex", gap: 12 }}>
                <span style={{ width: 36, height: 36, flexShrink: 0, borderRadius: 10, background: pal.lilac1, display: "grid", placeItems: "center" }}><Ic n={ic} s={18} c={pal.primary} /></span>
                <div><div style={{ fontSize: 13.5, fontWeight: 700, color: pal.ink }}>{t}</div><div style={{ fontSize: 12.5, color: pal.g600, marginTop: 2, lineHeight: 1.5 }}>{d}</div></div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ padding: "14px 18px", borderTop: `1px solid ${pal.g100}` }}>
          <button onClick={onClose} style={{ width: "100%", border: "none", background: pal.primary, color: "#fff", borderRadius: 11, padding: "12px", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 14, boxShadow: "var(--shadow-purple)" }}>Entendi</button>
        </div>
      </div>
    </div>
  );
}

/* ---------- SearchBar (prop-app.jsx) ---------- */
function SearchBar({ onSearch, isMobile }: { onSearch: () => void; isMobile: boolean }) {
  const [end, setEnd] = React.useState("Rua Exemplo");
  const [ni, setNi] = React.useState("100");
  const [nf, setNf] = React.useState("");
  return (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
      <div style={{ flex: "0 0 auto", minWidth: 160 }}>
        <div style={{ fontSize: 11.5, fontWeight: 600, color: pal.g600, marginBottom: 6 }}>Cidade</div>
        <div style={{ position: "relative" }}>
          <select style={{ ...inSt, appearance: "none" as any, cursor: "pointer", paddingRight: 34 }}>
            {OW_CITIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          <Ic n="chevron-down" s={16} c={pal.g500} style={{ position: "absolute", right: 11, top: 12, pointerEvents: "none" }} />
        </div>
      </div>
      <div style={{ flex: "1 1 240px", minWidth: 200 }}>
        <div style={{ fontSize: 11.5, fontWeight: 600, color: pal.g600, marginBottom: 6 }}>Endereço ou CEP <span style={{ color: pal.error }}>*</span></div>
        <input value={end} onChange={(e) => setEnd(e.target.value)} placeholder="Rua, avenida ou CEP" style={inSt} />
      </div>
      <div style={{ flex: "0 0 auto", width: 100 }}>
        <div style={{ fontSize: 11.5, fontWeight: 600, color: pal.g600, marginBottom: 6 }}>Nº inicial <span style={{ color: pal.error }}>*</span></div>
        <input value={ni} onChange={(e) => setNi(e.target.value)} placeholder="000" inputMode="numeric" style={inSt} />
      </div>
      <div style={{ flex: "0 0 auto", width: 100 }}>
        <div style={{ fontSize: 11.5, fontWeight: 600, color: pal.g600, marginBottom: 6 }}>Nº final</div>
        <input value={nf} onChange={(e) => setNf(e.target.value)} placeholder="opcional" inputMode="numeric" style={inSt} />
      </div>
      <button onClick={onSearch} style={{ flex: isMobile ? "1 1 100%" : "0 0 auto", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, border: "none", background: pal.primary, color: "#fff", borderRadius: 10, padding: "11px 22px", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 14, boxShadow: "var(--shadow-purple)", height: 44 }}>
        <Ic n="search" s={17} c="#fff" /> Buscar
      </button>
    </div>
  );
}

/* ---------- TOAST ---------- */
interface ToastT { id: number; msg: string; icon?: string }
function Toast({ toast }: { toast: ToastT | null }) {
  if (!toast) return null;
  return (
    <div key={toast.id} style={{ position: "fixed", bottom: 26, left: "50%", transform: "translateX(-50%)", zIndex: 9000, display: "flex", alignItems: "center", gap: 10, background: pal.ink, color: "#fff", borderRadius: 12, padding: "12px 18px", boxShadow: "var(--shadow-lg)", fontFamily: "var(--font-body)", fontSize: 13.5, fontWeight: 500, animation: "toastUp .26s cubic-bezier(.2,.7,.3,1)", maxWidth: 460 }}>
      <span style={{ width: 26, height: 26, borderRadius: "50%", background: "rgba(255,255,255,.14)", display: "grid", placeItems: "center", flexShrink: 0 }}><Ic n={toast.icon || "check"} s={15} c="#fff" /></span>
      <span>{toast.msg}</span>
    </div>
  );
}

/* ---------- PAGE ---------- */
export default function ProprietariosPage() {
  const [isMobile, setIsMobile] = React.useState(false);
  const [tab, setTab] = React.useState("Busca");
  const [phase, setPhase] = React.useState<"empty" | "loading" | "results">("empty");
  const [info, setInfo] = React.useState(false);
  const [saldo, setSaldoState] = React.useState<number>(4700);
  const setSaldo = (n: number) => { setCredits(n); setSaldoState(n); };
  const [revealed, setRevealed] = React.useState<Record<string, boolean>>({});
  const [confirm, setConfirm] = React.useState<{ r: any } | null>(null);
  const [toast, setToast] = React.useState<ToastT | null>(null);
  const toastTimer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  React.useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 1024);
    onResize();
    window.addEventListener("resize", onResize);
    setSaldoState(getCredits());
    const h = () => setSaldoState(getCredits());
    window.addEventListener("ds-credits", h);
    return () => { window.removeEventListener("resize", onResize); window.removeEventListener("ds-credits", h); };
  }, []);

  const fire = (msg: string, icon?: string) => {
    setToast({ msg, icon, id: Date.now() });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  };

  const search = () => { setPhase("loading"); setTimeout(() => setPhase("results"), 1100); };
  const captar = (_r: any) => fire("Adicionado ao funil de captação · acesso registrado", "crosshair");
  const askReveal = (r: any) => setConfirm({ r });
  const doReveal = () => {
    if (!confirm) return;
    const r = confirm.r;
    setRevealed((v) => ({ ...v, [r.id]: true }));
    setSaldo(saldo - 100);
    setConfirm(null);
    fire("Contato revelado · 100 créditos usados · acesso registrado", "eye");
  };

  const content = (
    <div style={{ maxWidth: 820, margin: "0 auto", padding: isMobile ? "16px" : "24px 28px" }}>
      {/* segmented tabs */}
      <div style={{ display: "flex", gap: 4, background: pal.g100, borderRadius: 11, padding: 4, marginBottom: 18, width: "fit-content" }}>
        {(["Busca", "Histórico"] as const).map((k) => {
          const ic = k === "Busca" ? "search" : "history";
          const on = tab === k;
          return (
            <button key={k} onClick={() => setTab(k)} style={{ display: "flex", alignItems: "center", gap: 7, border: "none", borderRadius: 8, padding: "9px 18px", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13.5, background: on ? "#fff" : "transparent", color: on ? pal.primary : pal.g500, boxShadow: on ? "var(--shadow-sm)" : "none" }}>
              <Ic n={ic} s={16} c={on ? pal.primary : pal.g500} /> {k}
            </button>
          );
        })}
      </div>

      {tab === "Busca" ? (
        <React.Fragment>
          {/* search panel */}
          <div style={{ background: "#fff", border: `1px solid ${pal.g300}`, borderRadius: 16, padding: 18, marginBottom: 18 }}>
            <SearchBar onSearch={search} isMobile={isMobile} />
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${pal.g100}` }}>
              <ComplianceLine onInfo={() => setInfo(true)} />
            </div>
          </div>

          {/* states */}
          {phase === "empty" && (
            <div style={{ textAlign: "center", padding: "60px 20px", color: pal.g500 }}>
              <div style={{ width: 72, height: 72, borderRadius: 20, background: pal.lilac2, display: "grid", placeItems: "center", margin: "0 auto 16px" }}><Ic n="search" s={32} c={pal.primary} /></div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, color: pal.ink }}>Nenhuma busca realizada</div>
              <div style={{ fontSize: 13.5, marginTop: 6, maxWidth: 340, marginInline: "auto", lineHeight: 1.5 }}>Busque pelo endereço do imóvel e informe o número para encontrar o proprietário.</div>
            </div>
          )}
          {phase === "loading" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ textAlign: "center", fontSize: 13, color: pal.g500, padding: "4px 0 8px" }}>
                <span className="rec-dot" style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: pal.primary, marginRight: 8 }} />
                Buscando proprietários · registrando acesso…
              </div>
              {[0, 1].map((i) => <div key={i} className="sk" style={{ height: 230, borderRadius: 16 }} />)}
            </div>
          )}
          {phase === "results" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                <span style={{ fontSize: 13, color: pal.g600, fontWeight: 600 }}>{OW_RESULTS.length} resultados · Rua Exemplo, 100 · Campo Belo</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11.5, color: pal.success, fontWeight: 600 }}><Ic n="check-circle-2" s={13} c={pal.success} /> Acesso registrado</span>
              </div>
              {OW_RESULTS.map((r) => (
                <OwnerCard key={r.id} r={r} revealed={!!revealed[r.id]} onReveal={askReveal} onCaptar={captar} onMapa={() => fire("Abrindo localização no mapa…", "map-pinned")} />
              ))}
            </div>
          )}
        </React.Fragment>
      ) : (
        /* HISTÓRICO */
        <div style={{ background: "#fff", border: `1px solid ${pal.g300}`, borderRadius: 16, overflow: "hidden" }}>
          <div style={{ padding: "14px 16px", borderBottom: `1px solid ${pal.g100}`, fontSize: 12, fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: pal.g500 }}>Buscas anteriores</div>
          {OW_HISTORY.map((h, i) => (
            <button key={h.id} onClick={() => { setTab("Busca"); setPhase("results"); }}
              style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", border: "none", borderBottom: i < OW_HISTORY.length - 1 ? `1px solid ${pal.g100}` : "none", background: "transparent", cursor: "pointer", padding: "13px 16px", textAlign: "left", fontFamily: "var(--font-body)" } as React.CSSProperties}
              onMouseEnter={(e) => (e.currentTarget.style.background = pal.lilac1)}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
              <span style={{ width: 36, height: 36, flexShrink: 0, borderRadius: 10, background: pal.g100, display: "grid", placeItems: "center" }}><Ic n="map-pin" s={17} c={pal.g600} /></span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: pal.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{h.q}</div>
                <div style={{ fontSize: 12, color: pal.g500, marginTop: 1 }}>{h.date} · {h.n} resultado{h.n > 1 ? "s" : ""}</div>
              </div>
              <Ic n="chevron-right" s={17} c={pal.g300} />
            </button>
          ))}
          <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "12px 16px", fontSize: 11.5, color: pal.g500, background: pal.g100 }}>
            <Ic n="shield-check" s={13} c={pal.g500} /> Cada busca é registrada na auditoria com a finalidade de captação.
          </div>
        </div>
      )}
    </div>
  );

  return (
    <CorretorChrome
      title="Radar"
      subtitle="Proprietários e moradores — captação responsável."
      searchPlaceholder="Buscar endereço"
      radar="Proprietários"
      radarRight={<RadarCredits />}
    >
      {content}
      {info && <InfoModal onClose={() => setInfo(false)} />}
      {confirm && (
        <ConfirmConsume
          title="Revelar contato do proprietário"
          saldo={saldo}
          onConfirm={doReveal}
          onClose={() => setConfirm(null)}
          onBuy={() => setConfirm(null)}
        />
      )}
      <Toast toast={toast} />
    </CorretorChrome>
  );
}
