"use client";
import * as React from "react";
import CorretorChrome, { pal, Ic } from "@/components/corretor/CorretorChrome";

/* ============================================================
   FUNIL — porte fiel de funil-data.jsx + funil.jsx + funil-app.jsx
   ============================================================ */

/* ---------- data ---------- */
const FN_STAGES = [
  { k: 'Novo', c: '#4F46E5', bg: '#E0E7FF', dot: '#4F46E5' },
  { k: 'Em atendimento', c: '#2563A8', bg: '#E5EEF7', dot: '#2563A8' },
  { k: 'Visita agendada', c: '#2E9E5B', bg: '#E6F4EC', dot: '#2E9E5B' },
  { k: 'Proposta', c: '#B8860B', bg: '#FBF1DC', dot: '#E0A82E' },
  { k: 'Negociação', c: '#C2410C', bg: '#FCEBDD', dot: '#EA580C' },
  { k: 'Fechado', c: '#1E7A43', bg: '#E6F4EC', dot: '#2E9E5B' },
];

const FN_ORIGINS: Record<string, any> = {
  Portal: { c: '#2563A8', bg: '#E5EEF7', icon: 'globe' },
  Site: { c: '#4F46E5', bg: '#E0E7FF', icon: 'monitor' },
  WhatsApp: { c: '#1E7A43', bg: '#E6F4EC', icon: 'message-circle' },
};

const FN_SIGNALS: Record<string, any> = {
  quente: { label: 'Quente', c: '#EA580C', bg: '#FCEBDD', icon: 'flame' },
  sla: { label: 'SLA', c: '#D64545', bg: '#FAE5E5', icon: 'alarm-clock' },
  esfriando: { label: 'Esfriando', c: '#2563A8', bg: '#E5EEF7', icon: 'snowflake' },
};

const av = (n: string) => n.split(' ').map((x: string) => x[0]).join('').slice(0, 2).toUpperCase();

const FN_CARDS_INIT: any[] = [
  { id: 'c1', stage: 'Novo', name: 'João Pedro', imovel: 'Casa em Candeias', code: '50127', value: 620000, origin: 'Portal', days: 0, note: 'Lead criado hoje', av: ['#2E7D9E', '#1C4A63'] },
  { id: 'c2', stage: 'Novo', name: 'Lucas Andrade', imovel: 'Apto Aflitos', code: '51020', value: 430000, origin: 'Site', days: 1, av: ['#5A6B8C', '#2E3A52'] },
  { id: 'c3', stage: 'Em atendimento', name: 'Fernanda Lima', imovel: 'Apto no Pina', code: '49802', value: 540000, origin: 'WhatsApp', days: 0, signal: 'sla', note: 'Aguardando há 3h', av: ['#B5632F', '#7A3B16'] },
  { id: 'c4', stage: 'Em atendimento', name: 'Renata Dias', imovel: 'Sala comercial', code: '48330', value: 380000, origin: 'Portal', days: 5, signal: 'esfriando', note: 'Sem atividade há 5 dias', av: ['#807C8A', '#4A4754'] },
  { id: 'c5', stage: 'Visita agendada', name: 'Mariana Costa', imovel: 'Apto Boa Viagem', code: '48213', value: 890000, origin: 'Site', days: 0, signal: 'quente', note: 'Visita amanhã 15h', av: ['#6366F1', '#312E81'] },
  { id: 'c6', stage: 'Proposta', name: 'Beatriz Souza', imovel: 'Apto Casa Forte', code: '48655', value: 720000, origin: 'Portal', days: 1, note: 'Proposta enviada ontem', av: ['#2E9E5B', '#176B3A'] },
  { id: 'c7', stage: 'Negociação', name: 'Carlos Eduardo', imovel: 'Cobertura Boa Viagem', code: '47710', value: 1450000, origin: 'Site', days: 1, signal: 'quente', note: 'Contraproposta R$ 1.380.000', av: ['#4338CA', '#231038'] },
  { id: 'c8', stage: 'Fechado', name: 'Ana Paula', imovel: 'Apto Espinheiro', code: '46900', value: 610000, origin: 'WhatsApp', days: 0, note: 'Fechado este mês', av: ['#C2557A', '#7A2E4C'] },
];

const FN_ARCHIVED: any[] = [
  { id: 'a1', name: 'Pedro Henrique', imovel: 'Apto Torre', value: 470000, motivo: 'Comprou com outra imobiliária' },
  { id: 'a2', name: 'Júlia Mendes', imovel: 'Casa Aldeia', value: 350000, motivo: 'Desistiu da compra' },
];

const fmtBRL = (v: number) => 'R$ ' + v.toLocaleString('pt-BR');
const fmtMi = (v: number) => v >= 1e6 ? 'R$ ' + (v / 1e6).toFixed(1).replace('.', ',') + ' mi' : v >= 1e3 ? 'R$ ' + Math.round(v / 1e3) + ' mil' : 'R$ ' + v;

/* ---------- drag state ---------- */
let fnDragId: string | null = null;

/* ---------- attention signal ---------- */
function Signal({ s }: { s: string }) {
  const m = FN_SIGNALS[s];
  if (!m) return null;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: m.bg, color: m.c, fontSize: 10.5, fontWeight: 700, borderRadius: 999, padding: '2px 8px' }}>
      <Ic n={m.icon} s={12} c={m.c} /> {m.label}
    </span>
  );
}

function OriginTag({ o }: { o: string }) {
  const m = FN_ORIGINS[o];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: pal.g500, fontSize: 11, fontWeight: 600 }}>
      <Ic n={m.icon} s={12} c={m.c} /> {o}
    </span>
  );
}

/* ---------- card ---------- */
function Card({ card, onOpen, active }: { card: any; onOpen: (c: any) => void; active: boolean }) {
  const stage = FN_STAGES.find(s => s.k === card.stage)!;
  return (
    <div draggable onDragStart={(e: any) => { fnDragId = card.id; e.dataTransfer.effectAllowed = 'move'; }}
      onClick={() => onOpen(card)}
      style={{ background: '#fff', border: `1px solid ${active ? pal.primary : pal.g300}`, borderLeft: `3px solid ${stage.dot}`, borderRadius: 12, padding: 13, cursor: 'pointer', boxShadow: active ? 'var(--shadow-md)' : 'none', transition: 'box-shadow .14s ease, transform .14s ease' }}
      onMouseEnter={(e: any) => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
      onMouseLeave={(e: any) => { e.currentTarget.style.boxShadow = active ? 'var(--shadow-md)' : 'none'; e.currentTarget.style.transform = 'none'; }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 9 }}>
        <span style={{ width: 30, height: 30, flexShrink: 0, borderRadius: '50%', background: `linear-gradient(135deg, ${card.av[0]}, ${card.av[1]})`, display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 700, fontSize: 11, fontFamily: 'var(--font-display)' }}>{av(card.name)}</span>
        <span style={{ flex: 1, minWidth: 0, fontWeight: 700, fontSize: 13.5, color: pal.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{card.name}</span>
        {card.signal && <Signal s={card.signal} />}
      </div>
      <div style={{ fontSize: 12.5, color: pal.g700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{card.imovel}</div>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16, color: pal.primary, margin: '5px 0 9px' }}>{fmtBRL(card.value)}</div>
      {card.note && <div style={{ fontSize: 11.5, color: pal.g500, marginBottom: 9, lineHeight: 1.35 }}>{card.note}</div>}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, paddingTop: 9, borderTop: `1px solid ${pal.g100}` }}>
        <OriginTag o={card.origin} />
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: pal.g500 }}>
          <Ic n="clock" s={12} c={pal.g500} /> {card.days === 0 ? 'hoje' : card.days + 'd'}
        </span>
      </div>
    </div>
  );
}

/* ---------- column ---------- */
function Column({ stage, cards, onOpen, activeId, onDropCard }: { stage: any; cards: any[]; onOpen: (c: any) => void; activeId: string | null; onDropCard: (id: string, stage: string) => void }) {
  const total = cards.reduce((s, c) => s + c.value, 0);
  return (
    <div onDragOver={(e: any) => e.preventDefault()} onDrop={(e: any) => { e.preventDefault(); if (fnDragId) { onDropCard(fnDragId, stage.k); fnDragId = null; } }}
      style={{ flex: '1 1 0', minWidth: 244, display: 'flex', flexDirection: 'column', background: pal.g100, borderRadius: 14, padding: 10, maxHeight: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 6px 12px' }}>
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: stage.dot, flexShrink: 0 }} />
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13.5, color: pal.ink, flex: 1 }}>{stage.k}</span>
        <span style={{ fontSize: 11.5, fontWeight: 700, color: stage.c, background: stage.bg, borderRadius: 999, padding: '1px 8px' }}>{cards.length}</span>
      </div>
      <div style={{ fontSize: 11.5, fontWeight: 600, color: pal.g500, padding: '0 6px 10px' }}>{total > 0 ? fmtMi(total) : '—'}</div>
      <div className="hide-scroll" style={{ display: 'flex', flexDirection: 'column', gap: 9, overflowY: 'auto', flex: 1 }}>
        {cards.length === 0 ? (
          <div style={{ border: `1.5px dashed ${pal.g300}`, borderRadius: 11, padding: '24px 12px', textAlign: 'center', color: pal.g500, fontSize: 12, lineHeight: 1.5 }}>
            <Ic n="inbox" s={22} c={pal.g300} />
            <div style={{ marginTop: 8 }}>Nenhum negócio nesta etapa.</div>
          </div>
        ) : cards.map(c => <Card key={c.id} card={c} onOpen={onOpen} active={c.id === activeId} />)}
      </div>
    </div>
  );
}

/* ---------- summary band ---------- */
function SummaryBand({ cards }: { cards: any[] }) {
  const grand = cards.reduce((s, c) => s + c.value, 0);
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'stretch', marginBottom: 16, flexWrap: 'wrap' }}>
      {FN_STAGES.map(st => {
        const cs = cards.filter(c => c.stage === st.k);
        const total = cs.reduce((s, c) => s + c.value, 0);
        return (
          <div key={st.k} style={{ flex: '1 1 0', minWidth: 130, background: '#fff', border: `1px solid ${pal.g300}`, borderTop: `3px solid ${st.dot}`, borderRadius: 12, padding: '11px 13px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11.5, fontWeight: 600, color: pal.g700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{st.k}</span>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16, color: pal.ink }}>{cs.length}</span>
            </div>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: st.c, marginTop: 3 }}>{total > 0 ? fmtMi(total) : '—'}</div>
          </div>
        );
      })}
      <div style={{ flex: '1 1 0', minWidth: 150, background: `linear-gradient(135deg, ${pal.primary}, ${pal.deep})`, borderRadius: 12, padding: '11px 14px', color: '#fff' }}>
        <div style={{ fontSize: 11.5, fontWeight: 600, opacity: .85 }}>Funil total</div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 19, marginTop: 3 }}>{fmtMi(grand)}</div>
      </div>
    </div>
  );
}

/* ---------- filters ---------- */
function Filters({ onToast, onArchive }: { onToast: (msg: string, icon?: string) => void; onArchive: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: pal.lilac1, border: `1px solid ${pal.lilac2}`, borderRadius: 999, padding: '7px 13px', fontSize: 12.5, color: pal.g700 }}>
        <Ic n="sparkles" s={15} c={pal.primary} /> O quadro se atualiza sozinho pelos seus atendimentos
      </div>
      <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
        {['Imóvel', 'Origem', 'Período'].map(f => (
          <button key={f} onClick={() => onToast('Filtrar por ' + f, 'sliders-horizontal')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, border: `1px solid ${pal.g300}`, background: '#fff', color: pal.g700, borderRadius: 999, padding: '8px 14px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600 }}>{f} <Ic n="chevron-down" s={15} c={pal.g500} /></button>
        ))}
        <button onClick={onArchive} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, border: `1px solid ${pal.g300}`, background: '#fff', color: pal.g700, borderRadius: 999, padding: '8px 14px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600 }}><Ic n="archive" s={15} c={pal.g500} /> Arquivo</button>
      </div>
    </div>
  );
}

/* ---------- preview panel ---------- */
function PreviewPanel({ card, onClose, onToast }: { card: any; onClose: () => void; onToast: (msg: string, icon?: string) => void }) {
  if (!card) return null;
  const stage = FN_STAGES.find(s => s.k === card.stage)!;
  return (
    <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 380, maxWidth: '92vw', zIndex: 7000, background: '#fff', borderLeft: `1px solid ${pal.g300}`, boxShadow: 'var(--shadow-lg)', display: 'flex', flexDirection: 'column', animation: 'slideInRight .22s cubic-bezier(.2,.7,.3,1)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 18px', borderBottom: `1px solid ${pal.g100}` }}>
        <span style={{ width: 44, height: 44, flexShrink: 0, borderRadius: '50%', background: `linear-gradient(135deg, ${card.av[0]}, ${card.av[1]})`, display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 700, fontSize: 15, fontFamily: 'var(--font-display)' }}>{av(card.name)}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: pal.ink }}>{card.name}</div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 3 }}><span style={{ width: 7, height: 7, borderRadius: '50%', background: stage.dot }} /><span style={{ fontSize: 12, color: stage.c, fontWeight: 600 }}>{card.stage}</span></div>
        </div>
        <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: 10, border: 'none', background: pal.g100, display: 'grid', placeItems: 'center', cursor: 'pointer' }}><Ic n="x" s={19} c={pal.g700} /></button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: 18 }}>
        <div style={{ background: pal.lilac1, border: `1px solid ${pal.lilac2}`, borderRadius: 12, padding: 14, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <span style={{ width: 44, height: 44, flexShrink: 0, borderRadius: 9, background: `linear-gradient(135deg, ${pal.lilac2}, #DCC9EC)`, display: 'grid', placeItems: 'center' }}><Ic n="building-2" s={20} c={pal.light} /></span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 13.5, color: pal.ink }}>{card.imovel}</div>
              <div style={{ fontSize: 11.5, color: pal.g500 }}>Cód {card.code}</div>
            </div>
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: pal.primary, marginTop: 10 }}>{fmtBRL(card.value)}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
          {([['globe', 'Origem', card.origin], ['clock', 'Na etapa', card.days === 0 ? 'desde hoje' : 'há ' + card.days + ' dias'], ['activity', 'Status', card.note || '—']] as [string,string,string][]).map(([ic, l, v], i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
              <span style={{ width: 32, height: 32, flexShrink: 0, borderRadius: 9, background: pal.g100, display: 'grid', placeItems: 'center' }}><Ic n={ic} s={16} c={pal.g500} /></span>
              <div><div style={{ fontSize: 11, color: pal.g500 }}>{l}</div><div style={{ fontSize: 13.5, fontWeight: 600, color: pal.ink }}>{v}</div></div>
            </div>
          ))}
        </div>
        {card.signal && <div style={{ marginBottom: 16 }}><Signal s={card.signal} /></div>}
      </div>
      <div style={{ padding: '14px 18px', borderTop: `1px solid ${pal.g100}` }}>
        <button onClick={() => onToast('Abrindo conversa no Atendimento…', 'message-circle')} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, border: 'none', background: pal.primary, color: '#fff', borderRadius: 12, padding: '13px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 14.5, boxShadow: 'var(--shadow-purple)' }}>
          <Ic n="message-circle" s={18} c="#fff" /> Abrir no Atendimento
        </button>
        <div style={{ textAlign: 'center', fontSize: 11.5, color: pal.g500, marginTop: 9 }}>O trabalho acontece no Atendimento — o Funil é o mapa.</div>
      </div>
    </div>
  );
}

/* ---------- archive modal ---------- */
function ArchiveModal({ onClose }: { onClose: () => void }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 8000, background: 'rgba(28,22,40,.5)', display: 'grid', placeItems: 'center', padding: 24 } as React.CSSProperties}>
      <div onClick={(e: any) => e.stopPropagation()} style={{ width: 480, maxWidth: '100%', background: '#fff', borderRadius: 18, overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 18px', borderBottom: `1px solid ${pal.g100}` }}>
          <span style={{ width: 38, height: 38, borderRadius: 10, background: pal.g100, display: 'grid', placeItems: 'center' }}><Ic n="archive" s={19} c={pal.g500} /></span>
          <div style={{ flex: 1 }}><div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: pal.ink }}>Negócios perdidos</div><div style={{ fontSize: 12, color: pal.g500 }}>Arquivados com o motivo do desfecho</div></div>
          <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: 10, border: 'none', background: pal.g100, display: 'grid', placeItems: 'center', cursor: 'pointer' }}><Ic n="x" s={19} c={pal.g700} /></button>
        </div>
        <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 9 }}>
          {FN_ARCHIVED.map(a => (
            <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 11, border: `1px solid ${pal.g300}`, borderRadius: 11, padding: 12 }}>
              <span style={{ width: 34, height: 34, borderRadius: '50%', background: pal.g100, display: 'grid', placeItems: 'center', color: pal.g500, fontWeight: 700, fontSize: 12, fontFamily: 'var(--font-display)' }}>{av(a.name)}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: pal.ink }}>{a.name} · <span style={{ color: pal.g500, fontWeight: 500 }}>{a.imovel}</span></div>
                <div style={{ fontSize: 12, color: pal.error, marginTop: 1 }}>{a.motivo}</div>
              </div>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: pal.g500 }}>{fmtMi(a.value)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- skeleton ---------- */
function Skeleton() {
  return (
    <div style={{ padding: 28 }}>
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>{[0,1,2,3,4,5,6].map(i => <div key={i} className="sk" style={{ flex: 1, height: 64, borderRadius: 12 }} />)}</div>
      <div style={{ display: 'flex', gap: 14 }}>{[0,1,2,3,4,5].map(i => (
        <div key={i} style={{ flex: 1, background: pal.g100, borderRadius: 14, padding: 10 }}>
          <div className="sk" style={{ height: 16, width: '60%', borderRadius: 6, marginBottom: 12 }} />
          {[0,1].map(j => <div key={j} className="sk" style={{ height: 96, borderRadius: 11, marginBottom: 9 }} />)}
        </div>
      ))}</div>
    </div>
  );
}

/* ---------- narrow notice ---------- */
function NarrowNotice() {
  return (
    <div style={{ height: '100%', display: 'grid', placeItems: 'center', padding: 28, background: pal.page }}>
      <div style={{ textAlign: 'center', maxWidth: 320 }}>
        <div style={{ width: 70, height: 70, borderRadius: 18, background: pal.lilac2, display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}><Ic n="monitor" s={30} c={pal.primary} /></div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 19, color: pal.ink }}>O Funil é uma visão de desktop</div>
        <div style={{ fontSize: 13.5, color: pal.g500, marginTop: 6, lineHeight: 1.55 }}>Abra em uma tela larga para ver o quadro completo. No celular, use <strong style={{ color: pal.primary }}>Atendimento</strong>, <strong style={{ color: pal.primary }}>Início</strong> e <strong style={{ color: pal.primary }}>Agenda</strong>.</div>
      </div>
    </div>
  );
}

/* ---------- toast ---------- */
interface ToastT { id: number; msg: string; icon?: string }
function Toast({ toast }: { toast: ToastT | null }) {
  if (!toast) return null;
  return (
    <div key={toast.id} style={{ position: 'fixed', bottom: 26, left: '50%', transform: 'translateX(-50%)', zIndex: 9000, display: 'flex', alignItems: 'center', gap: 10, background: pal.ink, color: '#fff', borderRadius: 12, padding: '12px 18px', boxShadow: 'var(--shadow-lg)', fontFamily: 'var(--font-body)', fontSize: 13.5, fontWeight: 500, animation: 'toastUp .26s cubic-bezier(.2,.7,.3,1)', maxWidth: 440 }}>
      <span style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(255,255,255,.14)', display: 'grid', placeItems: 'center', flexShrink: 0 }}><Ic n={toast.icon || 'check'} s={15} c="#fff" /></span>
      <span>{toast.msg}</span>
    </div>
  );
}

/* ============================================================
   MAIN PAGE
   ============================================================ */
export default function FunilPage() {
  const [narrow, setNarrow] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [cards, setCards] = React.useState<any[]>(() => FN_CARDS_INIT.map(c => ({ ...c })));
  const [preview, setPreview] = React.useState<any>(null);
  const [archive, setArchive] = React.useState(false);
  const [toast, setToast] = React.useState<ToastT | null>(null);
  const toastTimer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  React.useEffect(() => {
    const onResize = () => { const w = window.innerWidth; setNarrow(w < 980); };
    onResize(); window.addEventListener('resize', onResize);
    const t0 = setTimeout(() => setLoading(false), 850);
    return () => { window.removeEventListener('resize', onResize); clearTimeout(t0); };
  }, []);

  const fire = (msg: string, icon?: string) => { setToast({ msg, icon, id: Date.now() }); clearTimeout(toastTimer.current); toastTimer.current = setTimeout(() => setToast(null), 2600); };

  const onDropCard = (id: string, stage: string) => {
    setCards(cs => cs.map(c => c.id === id ? { ...c, stage, days: 0 } : c));
    fire('Negócio movido para ' + stage + ' (override manual)', 'move');
  };

  return (
    <CorretorChrome title="Funil" subtitle="O mapa dos seus negócios — atualizado pelos atendimentos." searchPlaceholder="Buscar cliente, imóvel ou código">
      {narrow ? <NarrowNotice /> : loading ? <Skeleton /> : (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, padding: '24px 28px 0', background: pal.page, height: '100%' }}>
          <SummaryBand cards={cards} />
          <Filters onToast={fire} onArchive={() => setArchive(true)} />
          <div style={{ flex: 1, display: 'flex', gap: 14, minHeight: 0, overflowX: 'auto', paddingBottom: 24 }}>
            {FN_STAGES.map(st => (
              <Column key={st.k} stage={st} cards={cards.filter(c => c.stage === st.k)} onOpen={setPreview} activeId={preview && preview.id} onDropCard={onDropCard} />
            ))}
          </div>
        </div>
      )}
      <PreviewPanel card={preview} onClose={() => setPreview(null)} onToast={fire} />
      {archive && <ArchiveModal onClose={() => setArchive(false)} />}
      <Toast toast={toast} />
    </CorretorChrome>
  );
}
