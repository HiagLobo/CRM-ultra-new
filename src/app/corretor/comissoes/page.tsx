"use client";
import * as React from "react";
import CorretorChrome, { pal, Ic } from "@/components/corretor/CorretorChrome";
import { demo } from "@/config/demo";

/* ============================================================
   COMISSÕES — porte fiel de comissoes-data.jsx + comissoes.jsx
   + comissoes-modals.jsx + comissoes-app.jsx
   ============================================================ */

// ── DATA (comissoes-data.jsx) ─────────────────────────────────
const CM_STATUS: Record<string, { c: string; bg: string; dot: string }> = {
  "Previsto":        { c: "#807C8A", bg: "#F2F1F5", dot: "#807C8A" },
  "A receber":       { c: "#B8860B", bg: "#FBF1DC", dot: "#E0A82E" },
  "Em processamento":{ c: "#2563A8", bg: "#E5EEF7", dot: "#2563A8" },
  "Pago":            { c: "#1E7A43", bg: "#E6F4EC", dot: "#2E9E5B" },
};

// Split do corretor: o mesmo motor 60/40 do painel do CEO.
const SPLIT_CORRETOR = 60;
// Recorrência: 1,5% do aluguel dos contratos que o corretor trouxe, enquanto o contrato estiver ativo.
const RECUR_PCT = 1.5;
const pctLabel = (p: number) => p.toLocaleString("pt-BR") + "%";
/** Parte do corretor numa venda (comissão de 6% × split). */
const minhaParte = (valor: number) => Math.round(Math.round(valor * 6 / 100) * SPLIT_CORRETOR / 100);
const recorrencia = (aluguel: number) => Math.round(aluguel * RECUR_PCT / 100);
/** Soma dos aluguéis ativos que o corretor trouxe: 54 contratos em junho, 53 em maio. */
const ALUGUEIS_JUN = 159000;
const ALUGUEIS_MAI = 155750;

const CM_SUMMARY = {
  aReceber:       minhaParte(890000),                             // d1 — o único "A receber"
  recebidoMes:    minhaParte(610000) + recorrencia(ALUGUEIS_JUN), // extrato de junho (l1 + l2)
  recorrente:     recorrencia(ALUGUEIS_JUN),
  totalAno:       121700,                                         // ≈ 142.000 × 60/70
  proximoRepasse: { valor: 12300, data: "12/06" },
  potencialFunil: minhaParte(720000 + 1450000),                   // proposta + negociação do funil
};

const CM_DEALS_RAW: any[] = [
  { id: "d1", name: "Mariana Costa", imovel: "Apto Boa Viagem",   code: "48213", value: 890000, pct: 6, split: SPLIT_CORRETOR, status: "A receber",        date: "05/06", av: ["#6366F1","#312E81"] },
  { id: "d2", name: "João Pedro",    imovel: "Casa Candeias",     code: "50127", value: 620000, pct: 6, split: SPLIT_CORRETOR, status: "Em processamento", date: "04/06", av: ["#2E7D9E","#1C4A63"] },
  { id: "d3", name: "Ana Paula",     imovel: "Apto Espinheiro",   code: "46900", value: 610000, pct: 6, split: SPLIT_CORRETOR, status: "Pago",             date: "02/06", av: ["#C2557A","#7A2E4C"] },
];
CM_DEALS_RAW.forEach((d: any) => {
  d.bruta = Math.round(d.value * d.pct / 100);
  d.minha = Math.round(d.bruta * d.split / 100);
});
const CM_DEALS: any[] = CM_DEALS_RAW;

const CM_RECUR_RAW: any[] = [
  { id: "r1", imovel: "Apto Rosarinho",            code: "52140", aluguel: 3200, pct: RECUR_PCT, status: "Ativo", prox: "10/06" },
  { id: "r2", imovel: "Sala comercial Paissandu",  code: "52377", aluguel: 5500, pct: RECUR_PCT, status: "Ativo", prox: "10/06" },
  { id: "r3", imovel: "Apto Jaqueira",             code: "52611", aluguel: 2400, pct: RECUR_PCT, status: "Ativo", prox: "10/06" },
];
CM_RECUR_RAW.forEach((r: any) => { r.meu = Math.round(r.aluguel * r.pct / 100); });
const CM_RECUR: any[] = CM_RECUR_RAW;
const CM_RECUR_MORE = 51;

const CM_LEDGER: any[] = [
  { id: "l1", date: "02/06", type: "Comissão",   desc: "Apto Espinheiro · Ana Paula",   amount: minhaParte(610000),        icon: "handshake" },
  { id: "l2", date: "01/06", type: "Recorrência",desc: "54 contratos de aluguel",        amount: recorrencia(ALUGUEIS_JUN), icon: "repeat" },
  { id: "l3", date: "28/05", type: "Antecipação",desc: "Casa Aldeia · recebido antes",   amount: 12000, fee: -300,          icon: "zap" },
  { id: "l4", date: "20/05", type: "Repasse",    desc: "Repasse quinzenal",               amount: 8900,                      icon: "arrow-down-to-line" },
  { id: "l5", date: "15/05", type: "Comissão",   desc: "Loja Centro · Marcos Vinícius",  amount: minhaParte(440000),        icon: "handshake" },
  { id: "l6", date: "10/05", type: "Recorrência",desc: "53 contratos de aluguel",        amount: recorrencia(ALUGUEIS_MAI), icon: "repeat" },
];

const LEDGER_TYPE: Record<string, { c: string; bg: string }> = {
  "Comissão":   { c: "#1E7A43", bg: "#E6F4EC" },
  "Recorrência":{ c: "#4F46E5", bg: "#E0E7FF" },
  "Antecipação":{ c: "#B8860B", bg: "#FBF1DC" },
  "Repasse":    { c: "#2563A8", bg: "#E5EEF7" },
};

// Taxa do parceiro financeiro que adianta a comissão (a mesma do painel do CEO).
const ANTECIP_FEE = 0.025;
const ANTECIP_FEE_LABEL = (ANTECIP_FEE * 100).toLocaleString("pt-BR") + "%";

const brl  = (v: number) => "R$ " + Math.round(v).toLocaleString("pt-BR");

// ── HELPERS ───────────────────────────────────────────────────
const av = (n: string) => n.split(" ").map((x: string) => x[0]).join("").slice(0, 2).toUpperCase();

// ── COMPONENTS (comissoes.jsx) ────────────────────────────────
function StatusPill({ status, small }: { status: string; small?: boolean }) {
  const m = CM_STATUS[status];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: m.bg, color: m.c, fontSize: small ? 10.5 : 11.5, fontWeight: 700, borderRadius: 999, padding: small ? "2px 8px" : "3px 10px", whiteSpace: "nowrap" }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: m.dot }} /> {status}
    </span>
  );
}

function Summary({ isMobile }: { isMobile: boolean }) {
  const s = CM_SUMMARY;
  const cards = [
    { label: "A receber",        value: brl(s.aReceber),         icon: "hourglass",   c: "#B8860B", bg: "#FBF1DC" },
    { label: "Recebido no mês",  value: brl(s.recebidoMes),      icon: "check-circle",c: "#1E7A43", bg: "#E6F4EC" },
    { label: "Renda recorrente", value: brl(s.recorrente)+"/mês", icon: "repeat",      c: "#4F46E5", bg: "#E0E7FF" },
    { label: "Total no ano",     value: brl(s.totalAno),         icon: "trending-up", c: "#2563A8", bg: "#E5EEF7" },
  ];
  return (
    <div style={{ display: "flex", gap: 14, marginBottom: 16, flexWrap: "wrap" }}>
      <div className="cm-summary" style={{ flex: "3 1 520px", display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: 14 }}>
        {cards.map((c, i) => (
          <div key={i} style={{ background: "#fff", border: `1px solid ${pal.g300}`, borderRadius: 14, padding: "16px 18px" }}>
            <span style={{ width: 32, height: 32, borderRadius: 9, background: c.bg, display: "grid", placeItems: "center" }}><Ic n={c.icon} s={17} c={c.c} /></span>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 22, color: pal.ink, marginTop: 11 }}>{c.value}</div>
            <div style={{ fontSize: 12.5, color: pal.g500, marginTop: 1 }}>{c.label}</div>
          </div>
        ))}
      </div>
      <div style={{ flex: "1 1 220px", background: `linear-gradient(135deg, ${pal.primary}, ${pal.deep})`, borderRadius: 14, padding: "18px 20px", color: "#fff", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12.5, fontWeight: 600, opacity: .85 }}><Ic n="calendar-clock" s={15} c="#fff" /> Próximo repasse</div>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 28, margin: "8px 0 2px" }}>{brl(s.proximoRepasse.valor)}</div>
        <div style={{ fontSize: 13, opacity: .85 }}>em {s.proximoRepasse.data}</div>
      </div>
    </div>
  );
}

function Block({ icon, title, sub, right, children }: { icon: string; title: string; sub?: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ background: "#fff", border: `1px solid ${pal.g300}`, borderRadius: 16, overflow: "hidden", marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "16px 18px", borderBottom: `1px solid ${pal.g100}` }}>
        <span style={{ width: 32, height: 32, flexShrink: 0, borderRadius: 9, background: pal.lilac2, display: "grid", placeItems: "center" }}><Ic n={icon} s={18} c={pal.primary} /></span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, margin: 0, color: pal.ink }}>{title}</h2>
          {sub && <div style={{ fontSize: 12.5, color: pal.g500, marginTop: 1 }}>{sub}</div>}
        </div>
        {right}
      </div>
      {children}
    </div>
  );
}

function DealRow({ d, isMobile, onOpen, onAntecipar }: { d: any; isMobile: boolean; onOpen: (d: any) => void; onAntecipar: (d: any) => void }) {
  return (
    <div onClick={() => onOpen(d)} style={{ display: "flex", alignItems: "center", gap: 14, padding: isMobile ? "14px 16px" : "14px 18px", borderBottom: `1px solid ${pal.g100}`, cursor: "pointer", flexWrap: "wrap" }}
      onMouseEnter={(e: any) => e.currentTarget.style.background = pal.lilac1}
      onMouseLeave={(e: any) => e.currentTarget.style.background = "transparent"}>
      <span style={{ width: 38, height: 38, flexShrink: 0, borderRadius: "50%", background: `linear-gradient(135deg, ${d.av[0]}, ${d.av[1]})`, display: "grid", placeItems: "center", color: "#fff", fontWeight: 700, fontSize: 13, fontFamily: "var(--font-display)" }}>{av(d.name)}</span>
      <div style={{ flex: "1 1 160px", minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: pal.ink }}>{d.name}</div>
        <div style={{ fontSize: 12.5, color: pal.g500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.imovel} · {brl(d.value)}</div>
      </div>
      <div style={{ flex: "0 0 auto", textAlign: isMobile ? "left" : "right" }}>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16, color: pal.primary }}>{brl(d.minha)}</div>
        <div style={{ fontSize: 11, color: pal.g500 }}>{d.pct}% · split {d.split}%</div>
      </div>
      <div style={{ flex: "0 0 auto", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ textAlign: "right" }}>
          <StatusPill status={d.status} />
          <div style={{ fontSize: 11, color: pal.g500, marginTop: 3 }}>{d.date}</div>
        </div>
        {d.status === "A receber"
          ? <button onClick={(e: any) => { e.stopPropagation(); onAntecipar(d); }} style={{ display: "flex", alignItems: "center", gap: 6, border: "none", background: pal.primary, color: "#fff", borderRadius: 9, padding: "8px 13px", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 12.5, boxShadow: "var(--shadow-purple)", whiteSpace: "nowrap" }}><Ic n="zap" s={14} c="#fff" /> Antecipar</button>
          : <Ic n="chevron-right" s={18} c={pal.g300} />}
      </div>
    </div>
  );
}

function RecurRow({ r, isMobile }: { r: any; isMobile: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, padding: isMobile ? "13px 16px" : "13px 18px", borderBottom: `1px solid ${pal.g100}` }}>
      <span style={{ width: 36, height: 36, flexShrink: 0, borderRadius: 9, background: pal.lilac2, display: "grid", placeItems: "center" }}><Ic n="building-2" s={18} c={pal.primary} /></span>
      <div style={{ flex: "1 1 140px", minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 13.5, color: pal.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.imovel}</div>
        <div style={{ fontSize: 12, color: pal.g500 }}>Aluguel {brl(r.aluguel)} · seu {pctLabel(r.pct)}</div>
      </div>
      <div style={{ flex: "0 0 auto", textAlign: "right" }}>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 15, color: "#1E7A43" }}>+{brl(r.meu)}/mês</div>
        <div style={{ fontSize: 11, color: pal.g500 }}>próx. {r.prox}</div>
      </div>
    </div>
  );
}

function LedgerRow({ l, isMobile }: { l: any; isMobile: boolean }) {
  const t = LEDGER_TYPE[l.type];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 13, padding: isMobile ? "12px 16px" : "13px 18px", borderBottom: `1px solid ${pal.g100}` }}>
      <span style={{ width: 36, height: 36, flexShrink: 0, borderRadius: 9, background: t.bg, display: "grid", placeItems: "center" }}><Ic n={l.icon} s={17} c={t.c} /></span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontWeight: 600, fontSize: 13.5, color: pal.ink }}>{l.type}</span>
          <span style={{ fontSize: 11, color: t.c, background: t.bg, borderRadius: 999, padding: "1px 7px", fontWeight: 600 }}>{l.date}</span>
        </div>
        <div style={{ fontSize: 12, color: pal.g500, marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{l.desc}</div>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 15, color: "#1E7A43" }}>+{brl(l.amount)}</div>
        {l.fee && <div style={{ fontSize: 11, color: pal.error }}>taxa {brl(l.fee)}</div>}
      </div>
    </div>
  );
}

// ── MODALS (comissoes-modals.jsx) ─────────────────────────────
function ModalShell({ isMobile, onClose, w = 460, children }: { isMobile: boolean; onClose: () => void; w?: number; children: React.ReactNode }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 8000, background: "rgba(28,22,40,.5)", display: "grid", placeItems: isMobile ? "stretch" : "center", padding: isMobile ? 0 : 24 }}>
      <div onClick={(e: any) => e.stopPropagation()} style={{ width: isMobile ? "100%" : w, maxWidth: "100%", height: isMobile ? "100%" : "auto", maxHeight: isMobile ? "100%" : "92vh", background: "#fff", borderRadius: isMobile ? 0 : 18, overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "var(--shadow-lg)" }}>{children}</div>
    </div>
  );
}

function CalcLine({ label, value, bold, accent }: { label: string; value: string; bold?: boolean; accent?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 0" }}>
      <span style={{ fontSize: bold ? 14 : 13, color: bold ? pal.ink : pal.g700, fontWeight: bold ? 700 : 500 }}>{label}</span>
      <span style={{ fontFamily: "var(--font-display)", fontWeight: bold ? 800 : 600, fontSize: bold ? 18 : 14, color: accent ? pal.primary : pal.ink }}>{value}</span>
    </div>
  );
}

function DealDetail({ d, isMobile, onClose, onAntecipar }: { d: any; isMobile: boolean; onClose: () => void; onAntecipar: (d: any) => void }) {
  return (
    <ModalShell isMobile={isMobile} onClose={onClose}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 18px", borderBottom: `1px solid ${pal.g100}` }}>
        <span style={{ width: 42, height: 42, flexShrink: 0, borderRadius: "50%", background: `linear-gradient(135deg, ${d.av[0]}, ${d.av[1]})`, display: "grid", placeItems: "center", color: "#fff", fontWeight: 700, fontSize: 14, fontFamily: "var(--font-display)" }}>{av(d.name)}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: pal.ink }}>{d.name}</div>
          <div style={{ fontSize: 12.5, color: pal.g500 }}>{d.imovel} · Cód {d.code}</div>
        </div>
        <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: 10, border: "none", background: pal.g100, display: "grid", placeItems: "center", cursor: "pointer" }}><Ic n="x" s={19} c={pal.g700} /></button>
      </div>
      <div style={{ padding: 18, flex: 1, overflowY: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <StatusPill status={d.status} />
          <span style={{ fontSize: 12, color: pal.g500 }}>Fechado em {d.date}</span>
        </div>
        <div style={{ background: pal.lilac1, border: `1px solid ${pal.lilac2}`, borderRadius: 14, padding: "6px 16px 12px", marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: pal.primary, padding: "12px 0 4px" }}>Como sua comissão é calculada</div>
          <CalcLine label="Valor do negócio" value={brl(d.value)} />
          <div style={{ borderTop: `1px solid ${pal.lilac2}` }} />
          <CalcLine label={`Comissão da ${demo.nomeCurto} (${d.pct}%)`} value={brl(d.bruta)} />
          <div style={{ borderTop: `1px solid ${pal.lilac2}` }} />
          <CalcLine label={`Seu split (${d.split}%)`} value={brl(d.minha)} bold accent />
        </div>
        <div style={{ display: "flex", gap: 9, background: pal.g100, borderRadius: 11, padding: "11px 13px", fontSize: 12, color: pal.g700, lineHeight: 1.45 }}>
          <Ic n="info" s={16} c={pal.g500} style={{ flexShrink: 0, marginTop: 1 }} />
          <span>O split de {d.split}% reflete seu perfil e score. Tudo calculado automaticamente, sem ajuste manual.</span>
        </div>
      </div>
      {d.status === "A receber" && (
        <div style={{ padding: "14px 18px", borderTop: `1px solid ${pal.g100}` }}>
          <button onClick={() => onAntecipar(d)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, border: "none", background: pal.primary, color: "#fff", borderRadius: 12, padding: "13px", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 14.5, boxShadow: "var(--shadow-purple)" }}><Ic n="zap" s={17} c="#fff" /> Antecipar {brl(d.minha)}</button>
        </div>
      )}
    </ModalShell>
  );
}

function AntecipModal({ d, isMobile, onClose, onConfirm }: { d: any; isMobile: boolean; onClose: () => void; onConfirm?: (d: any) => void }) {
  const [done, setDone] = React.useState(false);
  const fee = Math.round(d.minha * ANTECIP_FEE);
  const receber = d.minha - fee;
  if (done) {
    return (
      <ModalShell isMobile={isMobile} onClose={onClose}>
        <div style={{ padding: "40px 24px", textAlign: "center", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#E6F4EC", display: "grid", placeItems: "center", margin: "0 auto 16px" }}><Ic n="check" s={30} c="#2E9E5B" /></div>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 19, color: pal.ink }}>Antecipação confirmada</div>
          <div style={{ fontSize: 13.5, color: pal.g500, marginTop: 6, lineHeight: 1.5 }}><strong style={{ color: "#1E7A43" }}>{brl(receber)}</strong> cairão na sua conta em até 1 dia útil.</div>
          <button onClick={onClose} style={{ marginTop: 22, alignSelf: "center", border: "none", background: pal.primary, color: "#fff", borderRadius: 11, padding: "12px 28px", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 14, boxShadow: "var(--shadow-purple)" }}>Concluir</button>
        </div>
      </ModalShell>
    );
  }
  return (
    <ModalShell isMobile={isMobile} onClose={onClose}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 18px", borderBottom: `1px solid ${pal.g100}` }}>
        <span style={{ width: 38, height: 38, borderRadius: 10, background: pal.lilac2, display: "grid", placeItems: "center" }}><Ic n="zap" s={19} c={pal.primary} /></span>
        <div style={{ flex: 1 }}><div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: pal.ink }}>Antecipar comissão</div><div style={{ fontSize: 12.5, color: pal.g500 }}>{d.name} · {d.imovel}</div></div>
        <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: 10, border: "none", background: pal.g100, display: "grid", placeItems: "center", cursor: "pointer" }}><Ic n="x" s={19} c={pal.g700} /></button>
      </div>
      <div style={{ padding: 18, flex: 1, overflowY: "auto" }}>
        <div style={{ border: `1px solid ${pal.g300}`, borderRadius: 14, padding: "6px 16px 10px", marginBottom: 14 }}>
          <CalcLine label="Comissão a receber" value={brl(d.minha)} />
          <div style={{ borderTop: `1px solid ${pal.g100}` }} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 0" }}>
            <span style={{ fontSize: 13, color: pal.g700, display: "inline-flex", alignItems: "center", gap: 6 }}>Taxa de antecipação ({ANTECIP_FEE_LABEL}) <Ic n="info" s={13} c={pal.g500} /></span>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14, color: pal.error }}>−{brl(fee)}</span>
          </div>
          <div style={{ borderTop: `1px solid ${pal.g100}` }} />
          <CalcLine label="Você recebe agora" value={brl(receber)} bold accent />
        </div>
        <div style={{ display: "flex", gap: 9, background: pal.warningBg, border: "1px solid #F0DCA8", borderRadius: 11, padding: "11px 13px", fontSize: 12.5, color: "#8A5F0C", marginBottom: 8 }}>
          <Ic n="calendar" s={16} c="#C08A1E" style={{ flexShrink: 0, marginTop: 1 }} />
          <span>Sem antecipar, você receberia <strong>{brl(d.minha)}</strong> em <strong>{d.date}</strong>. A antecipação é feita por um parceiro financeiro; a taxa fica sempre à mostra.</span>
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, padding: "14px 18px", borderTop: `1px solid ${pal.g100}` }}>
        <button onClick={onClose} style={{ border: `1px solid ${pal.g300}`, background: "#fff", borderRadius: 11, padding: "12px 18px", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 14, color: pal.g700 }}>Cancelar</button>
        <button onClick={() => { setDone(true); onConfirm && onConfirm(d); }} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, border: "none", background: pal.primary, color: "#fff", borderRadius: 11, padding: "12px", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 14, boxShadow: "var(--shadow-purple)" }}><Ic n="check" s={17} c="#fff" /> Confirmar antecipação</button>
      </div>
    </ModalShell>
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
    <div style={{ padding: 28, maxWidth: 1080, margin: "0 auto" }}>
      <div style={{ display: "flex", gap: 14, marginBottom: 16 }}>{[0,1,2,3,4].map(i => <div key={i} className="sk" style={{ flex: 1, height: 96, borderRadius: 14 }} />)}</div>
      {[0,1,2].map(i => <div key={i} className="sk" style={{ height: 180, borderRadius: 16, marginBottom: 16 }} />)}
    </div>
  );
}

// ── PAGE ──────────────────────────────────────────────────────
export default function ComissoesPage() {
  const [isMobile, setIsMobile] = React.useState(false);
  const [loading, setLoading]   = React.useState(true);
  const [detail, setDetail]     = React.useState<any>(null);
  const [antecip, setAntecip]   = React.useState<any>(null);
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

  const recurTotal = CM_RECUR.reduce((s: number, r: any) => s + r.meu, 0);

  const content = loading ? <Skeleton /> : (
    <div style={{ padding: isMobile ? "16px" : 28, maxWidth: 1080, margin: "0 auto" }}>
      <Summary isMobile={isMobile} />

      {/* projeção do funil */}
      <div style={{ display: "flex", alignItems: "center", gap: 11, background: pal.lilac1, border: `1px solid ${pal.lilac2}`, borderRadius: 14, padding: "13px 16px", marginBottom: 16 }}>
        <span style={{ width: 34, height: 34, flexShrink: 0, borderRadius: 9, background: "#fff", display: "grid", placeItems: "center", border: `1px solid ${pal.lilac2}` }}><Ic n="target" s={18} c={pal.primary} /></span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: pal.ink }}>Comissão potencial no funil: <strong style={{ color: pal.primary }}>{brl(CM_SUMMARY.potencialFunil)}</strong></div>
          <div style={{ fontSize: 12, color: pal.g500, marginTop: 1 }}>se os negócios em proposta e negociação fecharem. O esforço de hoje é o dinheiro de amanhã.</div>
        </div>
      </div>

      <Block icon="handshake" title="Comissões por negócio" sub="Cada comissão com o split à mostra. Toque para ver o cálculo.">
        {CM_DEALS.map((d: any) => <DealRow key={d.id} d={d} isMobile={isMobile} onOpen={setDetail} onAntecipar={setAntecip} />)}
      </Block>

      <Block icon="repeat" title="Recorrência (aluguéis)" sub={`Sua renda recorrente: ${pctLabel(RECUR_PCT)} dos aluguéis que você trouxe, enquanto o contrato estiver ativo.`}
        right={<div style={{ textAlign: "right" }}><div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17, color: "#1E7A43" }}>{brl(recurTotal)}/mês</div><div style={{ fontSize: 11, color: pal.g500 }}>e crescendo</div></div>}>
        {CM_RECUR.map((r: any) => <RecurRow key={r.id} r={r} isMobile={isMobile} />)}
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "13px 18px", fontSize: 12.5, color: pal.g500 }}>
          <Ic n="plus-circle" s={16} c={pal.g500} /> + {CM_RECUR_MORE} contratos ativos somando sua recorrência
        </div>
      </Block>

      <Block icon="receipt-text" title="Extrato" sub="Todo movimento registrado, imutável e auditável.">
        {CM_LEDGER.map((l: any) => <LedgerRow key={l.id} l={l} isMobile={isMobile} />)}
      </Block>

      <div style={{ textAlign: "center", fontSize: 11.5, color: pal.g500, padding: "4px 0 8px" }}>
        <Ic n="lock" s={12} c={pal.g500} style={{ verticalAlign: "middle", marginRight: 4 }} /> Tudo calculado automaticamente pelos negócios fechados e pagamentos confirmados.
      </div>
    </div>
  );

  return (
    <CorretorChrome title="Comissões" subtitle="Transparência total: cada centavo rastreável." searchPlaceholder="Buscar negócio ou cliente">
      {content}
      {detail  && <DealDetail  d={detail}  isMobile={isMobile} onClose={() => setDetail(null)}  onAntecipar={(d) => { setDetail(null); setAntecip(d); }} />}
      {antecip && <AntecipModal d={antecip} isMobile={isMobile} onClose={() => setAntecip(null)} onConfirm={() => fire("Antecipação solicitada", "zap")} />}
      <Toast toast={toast} />
    </CorretorChrome>
  );
}
