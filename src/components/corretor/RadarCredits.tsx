"use client";
import * as React from "react";
import { pal, Ic } from "@/components/corretor/CorretorChrome";

/* ============================================================
   CRÉDITOS DO RADAR — porte fiel de credits-data.jsx + credits.jsx
   (pílula de saldo + painel + compra + modal de consumo).
   Compartilhado por todas as páginas do Radar.
   ============================================================ */

const CR_STATE = { mensal: 4400, comprado: 300, usadosMes: 600, totalMes: 5000, renova: "01/07" };

const CR_PACKAGES = [
  { id: "p20", qtd: 2000, preco: "R$ 59", unit: "= 20 consultas" },
  { id: "p50", qtd: 5000, preco: "R$ 119", unit: "= 50 consultas", popular: true },
  { id: "p100", qtd: 10000, preco: "R$ 209", unit: "= 100 consultas" },
];

const CR_HISTORY = [
  { id: "h1", tipo: "Contato de proprietário", det: "Rua Exemplo, 100", date: "Hoje · 10:24", delta: -100, icon: "user-round" },
  { id: "h2", tipo: "Endereço completo", det: "Campo Belo · anúncio particular", date: "Ontem · 16:12", delta: -100, icon: "map-pin" },
  { id: "h3", tipo: "Contato de proprietário", det: "Av. Exemplo, 1450", date: "Ontem · 11:05", delta: -100, icon: "user-round" },
  { id: "h4", tipo: "Avaliação (AVM)", det: "Apto Campo Belo · 68 m²", date: "12 jun · 09:40", delta: -100, icon: "gauge" },
  { id: "h5", tipo: "Créditos comprados", det: "Pacote 2.000 créditos", date: "10 jun · 14:20", delta: 300, icon: "plus-circle", buy: true },
  { id: "h6", tipo: "Endereço completo", det: "Pinheiros · anúncio particular", date: "09 jun · 17:33", delta: -100, icon: "map-pin" },
];

const CR_CONSUMES: [string, string][] = [
  ["user-round", "Revelar contato de proprietário"],
  ["map-pin", "Revelar endereço completo / anúncio particular"],
  ["gauge", "Avaliação de imóvel (AVM)"],
];

export const CR_COST = 100;

/* shared credit store (persists + syncs across Radar pages) */
const CREDITS_KEY = "crm_radar_credits";
export function getCredits(): number {
  if (typeof window === "undefined") return 4700;
  const v = parseInt(localStorage.getItem(CREDITS_KEY) || "", 10);
  return Number.isFinite(v) ? v : 4700;
}
export function setCredits(n: number) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(CREDITS_KEY, String(n)); } catch { /* ignore */ }
  try { window.dispatchEvent(new CustomEvent("ds-credits", { detail: n })); } catch { /* ignore */ }
}

/* ---------- balance pill (header) ---------- */
function BalancePill({ saldo, onClick }: { saldo: number; onClick: () => void }) {
  const low = saldo <= 500 && saldo > 0;
  const zero = saldo === 0;
  const c = zero ? "#C0392B" : low ? "#B8860B" : pal.primary;
  const bg = zero ? "#FAE5E5" : low ? "#FBF1DC" : pal.lilac2;
  return (
    <button onClick={onClick} data-tour="radar-creditos" style={{ display: "inline-flex", alignItems: "center", gap: 7, background: bg, color: c, border: "none", borderRadius: 999, padding: "7px 14px", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 13.5 }}>
      <Ic n="coins" s={16} c={c} /> {saldo.toLocaleString("pt-BR")} créditos
      {low && <Ic n="alert-triangle" s={13} c={c} />}
    </button>
  );
}

/* ---------- confirm consume modal ---------- */
export function ConfirmConsume({ title, saldo, cost = 100, onConfirm, onClose, onBuy }: {
  title: string; saldo: number; cost?: number; onConfirm: () => void; onClose: () => void; onBuy: () => void;
}) {
  const zero = saldo < cost;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 8600, background: "rgba(28,22,40,.5)", display: "grid", placeItems: "center", padding: 24 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: 400, maxWidth: "100%", background: "#fff", borderRadius: 18, overflow: "hidden", boxShadow: "var(--shadow-lg)" }}>
        <div style={{ padding: "22px 20px 0", textAlign: "center" }}>
          <div style={{ width: 54, height: 54, borderRadius: 15, background: zero ? "#FAE5E5" : pal.lilac2, display: "grid", placeItems: "center", margin: "0 auto 14px" }}><Ic n={zero ? "coins" : "eye"} s={26} c={zero ? "#C0392B" : pal.primary} /></div>
          {zero ? (
            <React.Fragment>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, color: pal.ink }}>Seus créditos acabaram</div>
              <div style={{ fontSize: 13.5, color: pal.g600, marginTop: 8, lineHeight: 1.5 }}>Compre mais para continuar revelando contatos e endereços.</div>
            </React.Fragment>
          ) : (
            <React.Fragment>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, color: pal.ink }}>{title}</div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: pal.lilac1, border: `1px solid ${pal.lilac2}`, borderRadius: 999, padding: "6px 14px", marginTop: 12, fontSize: 13, fontWeight: 600, color: pal.g700 }}>
                <Ic n="coins" s={15} c={pal.primary} /> Esta consulta usa <strong style={{ color: pal.primary }}>{cost} créditos</strong> · você tem {saldo.toLocaleString("pt-BR")}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "center", fontSize: 11.5, color: pal.g500, marginTop: 12 }}><Ic n="shield-check" s={13} c={pal.success} /> Seu acesso é registrado para fins de captação.</div>
            </React.Fragment>
          )}
        </div>
        <div style={{ display: "flex", gap: 10, padding: 20 }}>
          <button onClick={onClose} style={{ flex: 1, border: `1px solid ${pal.g300}`, background: "#fff", borderRadius: 11, padding: "12px", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 14, color: pal.g700 }}>Cancelar</button>
          {zero ? (
            <button onClick={onBuy} style={{ flex: 1.4, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, border: "none", background: pal.primary, color: "#fff", borderRadius: 11, padding: "12px", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 14, boxShadow: "var(--shadow-purple)" }}><Ic n="coins" s={16} c="#fff" /> Comprar créditos</button>
          ) : (
            <button onClick={onConfirm} style={{ flex: 1.4, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, border: "none", background: pal.primary, color: "#fff", borderRadius: 11, padding: "12px", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 14, boxShadow: "var(--shadow-purple)" }}><Ic n="check" s={16} c="#fff" /> Confirmar</button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- buy modal ---------- */
function BuyModal({ isMobile, saldo = 47, onClose, onBought }: { isMobile?: boolean; saldo?: number; onClose: () => void; onBought: (qtd: number) => void }) {
  const [sel, setSel] = React.useState("p50");
  const [done, setDone] = React.useState(false);
  const pkg = CR_PACKAGES.find((p) => p.id === sel)!;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 8700, background: "rgba(28,22,40,.5)", display: "grid", placeItems: isMobile ? "stretch" : "center", padding: isMobile ? 0 : 24 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: isMobile ? "100%" : 460, maxWidth: "100%", height: isMobile ? "100%" : "auto", background: "#fff", borderRadius: isMobile ? 0 : 18, overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "var(--shadow-lg)" }}>
        {done ? (
          <div style={{ padding: "40px 24px", textAlign: "center", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ width: 64, height: 64, borderRadius: 18, background: "#E6F4EC", display: "grid", placeItems: "center", margin: "0 auto 16px" }}><Ic n="check-circle-2" s={32} c="#2E9E5B" /></div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 22, color: pal.ink }}>Créditos adicionados!</div>
            <div style={{ fontSize: 14, color: pal.g600, marginTop: 8 }}>Seu novo saldo é <strong style={{ color: pal.primary }}>{(saldo + pkg.qtd).toLocaleString("pt-BR")} créditos</strong>.</div>
            <button onClick={() => onBought(pkg.qtd)} style={{ marginTop: 24, alignSelf: "center", border: "none", background: pal.primary, color: "#fff", borderRadius: 11, padding: "12px 28px", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 14, boxShadow: "var(--shadow-purple)" }}>Concluir</button>
          </div>
        ) : (
          <React.Fragment>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 18px", borderBottom: `1px solid ${pal.g100}` }}>
              <span style={{ width: 38, height: 38, borderRadius: 10, background: pal.lilac2, display: "grid", placeItems: "center" }}><Ic n="coins" s={19} c={pal.primary} /></span>
              <div style={{ flex: 1 }}><div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, color: pal.ink }}>Comprar créditos</div><div style={{ fontSize: 12, color: pal.g500 }}>Créditos comprados acumulam — não expiram na virada do mês</div></div>
              <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: 10, border: "none", background: pal.g100, display: "grid", placeItems: "center", cursor: "pointer" }}><Ic n="x" s={19} c={pal.g700} /></button>
            </div>
            <div style={{ padding: 18, flex: 1, overflowY: "auto" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {CR_PACKAGES.map((p) => {
                  const on = sel === p.id;
                  return (
                    <button key={p.id} onClick={() => setSel(p.id)} style={{ display: "flex", alignItems: "center", gap: 13, border: on ? `1.5px solid ${pal.primary}` : `1px solid ${pal.g300}`, background: on ? pal.lilac1 : "#fff", borderRadius: 13, padding: "15px 16px", cursor: "pointer", textAlign: "left", position: "relative", fontFamily: "var(--font-body)" }}>
                      <span style={{ width: 44, height: 44, flexShrink: 0, borderRadius: 11, background: on ? pal.lilac2 : pal.g100, display: "grid", placeItems: "center" }}><Ic n="coins" s={22} c={on ? pal.primary : pal.g600} /></span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, color: pal.ink }}>{p.qtd.toLocaleString("pt-BR")} créditos</span>{p.popular && <span style={{ fontSize: 9.5, fontWeight: 700, color: "#fff", background: pal.primary, borderRadius: 999, padding: "2px 9px" }}>MAIS POPULAR</span>}</div>
                        <div style={{ fontSize: 12, color: pal.g500, marginTop: 2 }}>{p.unit}</div>
                      </div>
                      <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, color: pal.primary, flexShrink: 0 }}>{p.preco}</div>
                      <span style={{ width: 18, height: 18, borderRadius: "50%", flexShrink: 0, border: on ? `6px solid ${pal.primary}` : `2px solid ${pal.g300}` }} />
                    </button>
                  );
                })}
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, padding: "14px 18px", borderTop: `1px solid ${pal.g100}` }}>
              <button onClick={onClose} style={{ border: `1px solid ${pal.g300}`, background: "#fff", borderRadius: 11, padding: "12px 16px", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 14, color: pal.g700 }}>Cancelar</button>
              <button onClick={() => setDone(true)} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, border: "none", background: pal.primary, color: "#fff", borderRadius: 11, padding: "12px", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 14, boxShadow: "var(--shadow-purple)" }}><Ic n="credit-card" s={17} c="#fff" /> Comprar {pkg.qtd.toLocaleString("pt-BR")} por {pkg.preco}</button>
            </div>
          </React.Fragment>
        )}
      </div>
    </div>
  );
}

/* ---------- credits panel (drawer) ---------- */
function CreditsPanel({ state, saldo, isMobile, onClose, onBuy }: { state: typeof CR_STATE; saldo: number; isMobile?: boolean; onClose: () => void; onBuy: () => void }) {
  const pct = Math.min(100, (state.usadosMes / state.totalMes) * 100);
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 8500, background: "rgba(28,22,40,.45)", display: isMobile ? "block" : "flex", justifyContent: "flex-end" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: isMobile ? "100%" : 400, maxWidth: "100%", height: "100%", background: pal.page, display: "flex", flexDirection: "column", boxShadow: "var(--shadow-lg)", animation: "slideInRight .22s cubic-bezier(.2,.7,.3,1)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 18px", background: "#fff", borderBottom: `1px solid ${pal.g300}`, flexShrink: 0 }}>
          <span style={{ width: 36, height: 36, borderRadius: 10, background: pal.lilac2, display: "grid", placeItems: "center" }}><Ic n="coins" s={19} c={pal.primary} /></span>
          <div style={{ flex: 1 }}><div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: pal.ink }}>Créditos</div><div style={{ fontSize: 12, color: pal.g500 }}>Consultas de dados protegidos</div></div>
          <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: 10, border: "none", background: pal.g100, display: "grid", placeItems: "center", cursor: "pointer" }}><Ic n="x" s={19} c={pal.g700} /></button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: 18 }}>
          <div style={{ background: `linear-gradient(150deg, ${pal.primary}, ${pal.deep})`, borderRadius: 16, padding: 20, color: "#fff", marginBottom: 16 }}>
            <div style={{ fontSize: 12.5, opacity: 0.85, fontWeight: 600 }}>Saldo atual</div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 40, lineHeight: 1, marginTop: 4 }}>{saldo.toLocaleString("pt-BR")} <span style={{ fontSize: 18, fontWeight: 700 }}>créditos</span></div>
            <div style={{ fontSize: 12.5, opacity: 0.85, marginTop: 8 }}>{state.mensal.toLocaleString("pt-BR")} do plano (renova em {state.renova}) + {state.comprado.toLocaleString("pt-BR")} comprados</div>
          </div>
          <div style={{ background: "#fff", border: `1px solid ${pal.g300}`, borderRadius: 14, padding: 16, marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 9 }}><span style={{ fontSize: 13, fontWeight: 700, color: pal.ink }}>Uso do mês</span><span style={{ fontSize: 12.5, color: pal.g500 }}><strong style={{ color: pal.ink }}>{state.usadosMes.toLocaleString("pt-BR")}</strong> de {state.totalMes.toLocaleString("pt-BR")}</span></div>
            <div style={{ height: 9, borderRadius: 999, background: pal.g100, overflow: "hidden" }}><div style={{ height: "100%", width: pct + "%", background: pal.primary, borderRadius: 999 }} /></div>
            <div style={{ fontSize: 11.5, color: pal.g500, marginTop: 7 }}>Os créditos do plano renovam em {state.renova} · comprados não expiram.</div>
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: pal.g500, marginBottom: 10 }}>Histórico de uso</div>
          <div style={{ background: "#fff", border: `1px solid ${pal.g300}`, borderRadius: 14, overflow: "hidden", marginBottom: 16 }}>
            {CR_HISTORY.map((h, i) => (
              <div key={h.id} style={{ display: "flex", alignItems: "center", gap: 11, padding: "12px 14px", borderBottom: i < CR_HISTORY.length - 1 ? `1px solid ${pal.g100}` : "none" }}>
                <span style={{ width: 32, height: 32, flexShrink: 0, borderRadius: 9, background: h.buy ? "#E6F4EC" : pal.g100, display: "grid", placeItems: "center" }}><Ic n={h.icon} s={16} c={h.buy ? "#2E9E5B" : pal.g600} /></span>
                <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 13, fontWeight: 600, color: pal.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{h.tipo}</div><div style={{ fontSize: 11.5, color: pal.g500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{h.det} · {h.date}</div></div>
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 14, color: h.delta > 0 ? "#1E7A43" : pal.g700, flexShrink: 0 }}>{h.delta > 0 ? "+" : ""}{h.delta.toLocaleString("pt-BR")}</span>
              </div>
            ))}
          </div>
          <div style={{ background: pal.lilac1, border: `1px solid ${pal.lilac2}`, borderRadius: 12, padding: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: pal.g700, marginBottom: 9 }}>O que usa crédito</div>
            {CR_CONSUMES.map(([ic, t], i) => <div key={i} style={{ display: "flex", alignItems: "center", gap: 9, padding: "4px 0" }}><Ic n={ic} s={14} c={pal.primary} /><span style={{ fontSize: 12.5, color: pal.g700 }}>{t}</span></div>)}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, paddingTop: 9, borderTop: `1px solid ${pal.lilac2}`, fontSize: 11.5, color: pal.g500 }}><Ic n="check" s={13} c={pal.success} /> Navegar, ver estatísticas e alertas é grátis.</div>
          </div>
        </div>

        <div style={{ padding: "14px 18px", borderTop: `1px solid ${pal.g300}`, background: "#fff", flexShrink: 0 }}>
          <button onClick={onBuy} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, border: "none", background: pal.primary, color: "#fff", borderRadius: 12, padding: "13px", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 14.5, boxShadow: "var(--shadow-purple)" }}><Ic n="coins" s={18} c="#fff" /> Comprar créditos</button>
        </div>
      </div>
    </div>
  );
}

/* ---------- header widget: pill + panel + buy (shared across Radar pages) ---------- */
export default function RadarCredits({ mobile }: { mobile?: boolean }) {
  const [saldo, setSaldo] = React.useState<number>(4700);
  const [panel, setPanel] = React.useState(false);
  const [buy, setBuy] = React.useState(false);
  React.useEffect(() => {
    setSaldo(getCredits());
    const h = () => setSaldo(getCredits());
    window.addEventListener("ds-credits", h);
    window.addEventListener("storage", h);
    return () => { window.removeEventListener("ds-credits", h); window.removeEventListener("storage", h); };
  }, []);
  return (
    <React.Fragment>
      <BalancePill saldo={saldo} onClick={() => setPanel(true)} />
      {panel && <CreditsPanel state={CR_STATE} saldo={saldo} isMobile={mobile} onClose={() => setPanel(false)} onBuy={() => { setPanel(false); setBuy(true); }} />}
      {buy && <BuyModal isMobile={mobile} saldo={saldo} onClose={() => setBuy(false)} onBought={(qtd) => { setCredits(saldo + qtd); setBuy(false); }} />}
    </React.Fragment>
  );
}
