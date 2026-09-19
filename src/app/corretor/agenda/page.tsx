"use client";
import * as React from "react";
import CorretorChrome, { pal, Ic } from "@/components/corretor/CorretorChrome";

/* ============================================================
   AGENDA — porte fiel de agenda-data.jsx + agenda.jsx + planejamento.jsx + agenda-app.jsx
   ============================================================ */

/* ---------- data ---------- */
const AG_DAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const AG_DATES = ['9', '10', '11', '12', '13', '14'];
const AG_TODAY = 2; // Qua
const AG_HOURS = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23];

const AG_TYPES: Record<string, any> = {
  visita:       { c: '#4F46E5', bg: '#E0E7FF', bd: '#D9C4E8', label: 'Visita', icon: 'map-pin' },
  reuniao:      { c: '#2563A8', bg: '#E5EEF7', bd: '#C2D6EC', label: 'Reunião online', icon: 'video' },
  bloco:        { c: '#807C8A', bg: '#F2F1F5', bd: '#DCD9E2', label: 'Bloco de leads', icon: 'inbox', striped: true },
  prospeccao:   { c: '#2E9E5B', bg: '#E6F4EC', bd: '#C3E3D0', label: 'Prospecção', icon: 'search' },
  planejamento: { c: '#B8860B', bg: '#FBF1DC', bd: '#EEDCA8', label: 'Planejamento', icon: 'list-checks' },
  auto:         { c: '#6366F1', bg: '#F3EAFB', bd: '#E0CEF0', label: 'Conversa registrada', icon: 'sparkles' },
};

const AG_EVENTS_INIT: any[] = [
  { id: 'e1', day: 0, start: 9, dur: 1, type: 'planejamento', title: 'Planejamento semanal' },
  { id: 'e2', day: 0, start: 14, dur: 1, type: 'visita', title: 'Visita · Apto Boa Viagem', lead: 'Mariana Costa', imovel: 'Apto 3 quartos · Boa Viagem', code: '48213', address: 'Av. Exemplo, 1200 · Recife', status: 'Confirmada' },
  { id: 'e3', day: 0, start: 16.5, dur: 0.5, type: 'auto', title: 'Conversa · Mariana Costa' },
  { id: 'e4', day: 1, start: 10, dur: 1, type: 'reuniao', title: 'Reunião online', lead: 'Carlos Eduardo', imovel: 'Cobertura · Boa Viagem', code: '47710', status: 'Confirmada' },
  { id: 'e5', day: 1, start: 16, dur: 1, type: 'visita', title: 'Visita · Casa Candeias', lead: 'João Pedro', imovel: 'Casa · Candeias', code: '50127', address: 'Rua Exemplo, 45 · Jaboatão', status: 'Agendada' },
  { id: 'e6', day: 2, start: 9, dur: 1, type: 'bloco', title: 'Responder novos leads' },
  { id: 'e7', day: 2, start: 15, dur: 1, type: 'visita', title: 'Visita · Sala Pina', lead: 'Fernanda Lima', imovel: 'Sala comercial · Pina', code: '49802', address: 'Rua Modelo, 300 · Recife', status: 'Agendada' },
  { id: 'e7b', day: 2, start: 15, dur: 1, type: 'reuniao', title: 'Reunião online', lead: 'Carlos Eduardo', imovel: 'Cobertura · Boa Viagem', code: '47710', status: 'Confirmada' },
  { id: 'e8', day: 3, start: 9, dur: 1.5, type: 'prospeccao', title: 'Prospecção' },
  { id: 'e9', day: 3, start: 11.33, dur: 0.66, type: 'auto', title: 'Conversa · Fernanda Lima' },
  { id: 'e10', day: 4, start: 9, dur: 1, type: 'bloco', title: 'Responder novos leads' },
  { id: 'e11', day: 4, start: 11, dur: 0.5, type: 'auto', title: 'Conversa · João Pedro' },
  { id: 'e12', day: 4, start: 15, dur: 1, type: 'reuniao', title: 'Reunião online', lead: 'Beatriz Souza', imovel: 'Apto · Casa Forte', code: '48655', status: 'Agendada' },
];

const AG_AVAIL: [string, string, boolean][] = [
  ['Segunda', '09:00 – 18:00', true],
  ['Terça', '09:00 – 18:00', true],
  ['Quarta', '09:00 – 18:00', true],
  ['Quinta', '09:00 – 18:00', true],
  ['Sexta', '09:00 – 18:00', true],
  ['Sábado', '09:00 – 12:00', true],
  ['Domingo', 'Indisponível', false],
];

const VISIT_STATUS = ['Agendada', 'Confirmada', 'Realizada', 'Não compareceu', 'Remarcada'];
const STATUS_C: Record<string, [string, string]> = {
  'Agendada': ['#2563A8', '#E5EEF7'], 'Confirmada': ['#1E7A43', '#E6F4EC'], 'Realizada': ['#4F46E5', '#E0E7FF'],
  'Não compareceu': ['#C0392B', '#FAE5E5'], 'Remarcada': ['#B8860B', '#FBF1DC'],
};

const fmtHour = (h: number) => { const hh = Math.floor(h); const mm = Math.round((h - hh) * 60); return String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0'); };

/* ---------- planejamento data ---------- */
const RETRO: [string, string, string, string, string][] = [
  ['Negócios fechados', '2', 'handshake', '#2E9E5B', '+1 vs. semana anterior'],
  ['Visitas realizadas', '5', 'map-pin', '#4F46E5', 'meta era 4'],
  ['Propostas enviadas', '3', 'file-text', '#2563A8', 'em dia'],
  ['Score', '+12', 'trending-up', '#B8860B', '742 · subiu na semana'],
];
const FOCUS_BLOCKS = [
  { k: 'leads', label: 'Responder leads', icon: 'inbox', c: '#807C8A' },
  { k: 'prosp', label: 'Prospecção', icon: 'search', c: '#2E9E5B' },
  { k: 'visitas', label: 'Visitas', icon: 'map-pin', c: '#4F46E5' },
];
const LIFE_HABITS = [
  { k: 'academia', label: 'Academia / treino', icon: 'dumbbell' },
  { k: 'leitura', label: 'Leitura / estudo', icon: 'book-open' },
  { k: 'familia', label: 'Tempo em família', icon: 'heart' },
  { k: 'caminhada', label: 'Caminhada / pausa', icon: 'footprints' },
];
const DAYL = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];

/* ============================================================
   CALENDAR COMPONENTS
   ============================================================ */
const HROW = 50;
let agDragId: string | null = null, agDragGrab = 0;

function layoutDay(evs: any[]) {
  const sorted = [...evs].sort((a, b) => a.start - b.start || b.dur - a.dur);
  const out: any[] = [];
  let cluster: any[] = [], clusterEnd = -1;
  const flush = () => {
    const colEnds: number[] = [];
    cluster.forEach(ev => {
      let c = colEnds.findIndex(end => ev.start >= end - 1e-6);
      if (c === -1) { c = colEnds.length; colEnds.push(0); }
      colEnds[c] = ev.start + ev.dur; ev._col = c;
    });
    const n = colEnds.length;
    cluster.forEach(ev => out.push({ ev, col: ev._col, cols: n }));
    cluster = [];
  };
  sorted.forEach(ev => {
    if (cluster.length && ev.start >= clusterEnd - 1e-6) flush();
    cluster.push(ev); clusterEnd = Math.max(clusterEnd, ev.start + ev.dur);
  });
  if (cluster.length) flush();
  return out;
}

function NowLine({ leftInset = 0 }: { leftInset?: number }) {
  const now = new Date();
  const h = now.getHours() + now.getMinutes() / 60;
  if (h < AG_HOURS[0] || h > AG_HOURS[AG_HOURS.length - 1] + 1) return null;
  const top = (h - AG_HOURS[0]) * HROW;
  return (
    <div style={{ position: 'absolute', left: leftInset, right: 0, top, height: 0, zIndex: 6, pointerEvents: 'none' } as React.CSSProperties}>
      <div style={{ position: 'absolute', left: -4, top: -4, width: 9, height: 9, borderRadius: '50%', background: '#E0552E' }} />
      <div style={{ borderTop: '2px solid #E0552E' }} />
      <span style={{ position: 'absolute', left: 2, top: -16, fontSize: 9.5, fontWeight: 700, color: '#E0552E', background: '#fff', padding: '0 3px', borderRadius: 3 }}>agora</span>
    </div>
  );
}

function EventChip({ ev, onClick, h, narrow }: { ev: any; onClick: (ev: any) => void; h: number; narrow: boolean }) {
  const t = AG_TYPES[ev.type];
  const clickable = ev.type === 'visita' || ev.type === 'reuniao';
  const tiny = h < 34;
  const showLead = h >= 58 && ev.lead && !narrow;
  return (
    <button onClick={() => clickable && onClick(ev)} style={{
      width: '100%', height: '100%', textAlign: 'left', border: `1px solid ${t.bd}`, borderLeft: `3px solid ${t.c}`,
      background: t.striped ? `repeating-linear-gradient(45deg, ${t.bg}, ${t.bg} 6px, #EAE8EF 6px, #EAE8EF 12px)` : t.bg,
      borderRadius: 7, padding: tiny ? '2px 6px' : '4px 7px', cursor: clickable ? 'pointer' : 'default', overflow: 'hidden',
      display: 'flex', flexDirection: tiny ? 'row' : 'column', alignItems: tiny ? 'center' : 'stretch', gap: tiny ? 5 : 1, fontFamily: 'var(--font-body)',
    } as React.CSSProperties}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
        <Ic n={t.icon} s={11} c={t.c} />
        <span style={{ fontSize: 11, fontWeight: 700, color: t.c, whiteSpace: 'nowrap' }}>{fmtHour(ev.start)}</span>
      </div>
      <span style={{ fontSize: 11.5, fontWeight: 600, color: pal.ink, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>{ev.title}</span>
      {showLead && <span style={{ fontSize: 10.5, color: pal.g500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ev.lead}</span>}
    </button>
  );
}

function WeekView({ onOpen, events, onMove }: { onOpen: (ev: any) => void; events: any[]; onMove: (id: string, day: number, start: number) => void }) {
  const evs = events || AG_EVENTS_INIT;
  return (
    <div style={{ background: '#fff', border: `1px solid ${pal.g300}`, borderRadius: 16, overflow: 'hidden' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '52px repeat(6, 1fr)', borderBottom: `1px solid ${pal.g300}` }}>
        <div />
        {AG_DAYS.map((d, i) => (
          <div key={i} style={{ padding: '10px 6px', textAlign: 'center', borderLeft: `1px solid ${pal.g100}`, background: i === AG_TODAY ? pal.lilac1 : '#fff' }}>
            <div style={{ fontSize: 11.5, fontWeight: 600, color: i === AG_TODAY ? pal.primary : pal.g500, textTransform: 'uppercase', letterSpacing: '.03em' }}>{d}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, color: i === AG_TODAY ? pal.primary : pal.ink, marginTop: 1 }}>{AG_DATES[i]}</div>
          </div>
        ))}
      </div>
      <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '52px repeat(6, 1fr)' }}>
        <div>
          {AG_HOURS.map(h => <div key={h} style={{ height: HROW, fontSize: 10.5, color: pal.g500, textAlign: 'right', padding: '2px 7px 0 0', boxSizing: 'border-box' }}>{h}h</div>)}
        </div>
        <NowLine leftInset={52} />
        {AG_DAYS.map((d, di) => (
          <div key={di} onDragOver={(e: any) => e.preventDefault()}
            onDrop={(e: any) => {
              e.preventDefault(); if (!agDragId || !onMove) return;
              const rect = e.currentTarget.getBoundingClientRect();
              let start = AG_HOURS[0] + (e.clientY - rect.top - agDragGrab) / HROW;
              start = Math.max(AG_HOURS[0], Math.min(23.5, Math.round(start * 2) / 2));
              onMove(agDragId, di, start); agDragId = null;
            }}
            style={{ position: 'relative', borderLeft: `1px solid ${pal.g100}`, background: di === AG_TODAY ? 'rgba(79,70,229,.025)' : '#fff' }}>
            {AG_HOURS.map(h => <div key={h} style={{ height: HROW, borderTop: `1px solid ${pal.g100}` }} />)}
            {layoutDay(evs.filter((e: any) => e.day === di)).map(({ ev, col, cols }: any) => {
              const hpx = ev.dur * HROW - 2;
              const gap = 2;
              return (
                <div key={ev.id} draggable onDragStart={(e: any) => { agDragId = ev.id; agDragGrab = e.nativeEvent.offsetY; e.dataTransfer.effectAllowed = 'move'; }}
                  style={{ position: 'absolute', left: `calc(${(col / cols) * 100}% + 2px)`, width: `calc(${100 / cols}% - ${gap + 2}px)`, top: (ev.start - AG_HOURS[0]) * HROW + 1, height: hpx, cursor: 'grab', zIndex: 2 } as React.CSSProperties}>
                  <EventChip ev={ev} onClick={onOpen} h={hpx} narrow={cols > 1} />
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function DayView({ onOpen, events, dayIdx = AG_TODAY, onMove }: { onOpen: (ev: any) => void; events: any[]; dayIdx?: number; onMove: (id: string, day: number, start: number) => void }) {
  const evs = (events || AG_EVENTS_INIT).filter((e: any) => e.day === dayIdx);
  return (
    <div style={{ background: '#fff', border: `1px solid ${pal.g300}`, borderRadius: 16, overflow: 'hidden' }}>
      <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '52px 1fr' }}>
        <div>{AG_HOURS.map(h => <div key={h} style={{ height: HROW, fontSize: 10.5, color: pal.g500, textAlign: 'right', padding: '2px 7px 0 0', boxSizing: 'border-box' }}>{h}h</div>)}</div>
        <div onDragOver={(e: any) => e.preventDefault()}
          onDrop={(e: any) => { e.preventDefault(); if (!agDragId || !onMove) return; const rect = e.currentTarget.getBoundingClientRect(); let start = AG_HOURS[0] + (e.clientY - rect.top - agDragGrab) / HROW; start = Math.max(AG_HOURS[0], Math.min(23.5, Math.round(start * 2) / 2)); onMove(agDragId, dayIdx, start); agDragId = null; }}
          style={{ position: 'relative', borderLeft: `1px solid ${pal.g100}` }}>
          {AG_HOURS.map(h => <div key={h} style={{ height: HROW, borderTop: `1px solid ${pal.g100}` }} />)}
          {layoutDay(evs).map(({ ev, col, cols }: any) => {
            const hpx = ev.dur * HROW - 2;
            return (
              <div key={ev.id} draggable onDragStart={(e: any) => { agDragId = ev.id; agDragGrab = e.nativeEvent.offsetY; e.dataTransfer.effectAllowed = 'move'; }}
                style={{ position: 'absolute', left: `calc(${(col / cols) * 100}% + 6px)`, width: `calc(${100 / cols}% - ${cols > 1 ? 8 : 12}px)`, top: (ev.start - AG_HOURS[0]) * HROW + 1, height: hpx, cursor: 'grab', zIndex: 2 } as React.CSSProperties}>
                <EventChip ev={ev} onClick={onOpen} h={hpx} narrow={cols > 1} />
              </div>
            );
          })}
          <NowLine leftInset={0} />
        </div>
      </div>
    </div>
  );
}

function Legend() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, padding: '12px 2px 0' }}>
      {Object.keys(AG_TYPES).map(k => {
        const t = AG_TYPES[k];
        return (
          <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: pal.g700 }}>
            <span style={{ width: 12, height: 12, borderRadius: 4, background: t.striped ? `repeating-linear-gradient(45deg, ${t.bg}, ${t.bg} 3px, #DCD9E2 3px, #DCD9E2 6px)` : t.bg, border: `1px solid ${t.bd}`, borderLeft: `3px solid ${t.c}` } as React.CSSProperties} />
            {t.label}
          </span>
        );
      })}
    </div>
  );
}

function AvailabilityPanel({ onToast }: { onToast: (msg: string, icon?: string) => void }) {
  const [now, setNow] = React.useState(true);
  const [cap, setCap] = React.useState(8);
  return (
    <div style={{ background: '#fff', border: `1px solid ${pal.g300}`, borderRadius: 16, padding: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 14 }}>
        <span style={{ width: 30, height: 30, borderRadius: 8, background: pal.lilac2, display: 'grid', placeItems: 'center' }}><Ic n="clock" s={17} c={pal.primary} /></span>
        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, margin: 0, color: pal.ink }}>Disponibilidade</h3>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 11, background: now ? '#E6F4EC' : pal.g100, border: `1px solid ${now ? '#BFE3CD' : pal.g300}`, borderRadius: 12, padding: '11px 13px', marginBottom: 14 }}>
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: now ? '#2E9E5B' : pal.g500, flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: now ? '#1E7A43' : pal.g700 }}>{now ? 'Disponível agora' : 'Indisponível agora'}</div>
          <div style={{ fontSize: 11.5, color: pal.g500 }}>O bot usa isso pra responder o cliente.</div>
        </div>
        <button onClick={() => setNow(v => !v)} style={{ width: 44, height: 26, borderRadius: 999, border: 'none', background: now ? pal.success : pal.g300, position: 'relative', cursor: 'pointer', flexShrink: 0 }}>
          <span style={{ position: 'absolute', top: 3, left: now ? 21 : 3, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left .15s', boxShadow: '0 1px 2px rgba(0,0,0,.2)' } as React.CSSProperties} />
        </button>
      </div>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: pal.g500, marginBottom: 8 }}>Grade semanal</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
        {AG_AVAIL.map(([d, h, on], i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 11px', borderRadius: 9, background: on ? pal.lilac1 : pal.g100, border: `1px solid ${on ? pal.lilac2 : pal.g300}` }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: pal.ink, width: 66 }}>{d}</span>
            <span style={{ flex: 1, fontSize: 12.5, color: on ? pal.g700 : pal.g500 }}>{h}</span>
            <Ic n={on ? 'check' : 'x'} s={14} c={on ? pal.success : pal.g500} />
          </div>
        ))}
      </div>
      <button onClick={() => onToast('Adicionar exceção (folga/feriado)', 'calendar-x')} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, border: `1px solid ${pal.g300}`, background: '#fff', borderRadius: 10, padding: '10px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13, color: pal.g700, marginBottom: 14 }}>
        <Ic n="calendar-x" s={16} c={pal.g500} /> Adicionar folga / feriado
      </button>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: pal.ink }}>Capacidade</div>
          <div style={{ fontSize: 11.5, color: pal.g500 }}>atendimentos simultâneos</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <button onClick={() => setCap(c => Math.max(1, c - 1))} style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${pal.g300}`, background: '#fff', display: 'grid', placeItems: 'center', cursor: 'pointer' }}><Ic n="minus" s={15} c={pal.g700} /></button>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: pal.ink, minWidth: 20, textAlign: 'center' }}>{cap}</span>
          <button onClick={() => setCap(c => c + 1)} style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${pal.g300}`, background: '#fff', display: 'grid', placeItems: 'center', cursor: 'pointer' }}><Ic n="plus" s={15} c={pal.g700} /></button>
        </div>
      </div>
    </div>
  );
}

/* ---------- visit modal ---------- */
function VisitModal({ ev, isMobile, onClose, onToast }: { ev: any; isMobile: boolean; onClose: () => void; onToast: (msg: string, icon?: string) => void }) {
  const [status, setStatus] = React.useState(ev.status || 'Agendada');
  const t = AG_TYPES[ev.type];
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 8000, background: 'rgba(28,22,40,.5)', display: 'grid', placeItems: isMobile ? 'stretch' : 'center', padding: isMobile ? 0 : 24 } as React.CSSProperties}>
      <div onClick={(e: any) => e.stopPropagation()} style={{ width: isMobile ? '100%' : 480, maxWidth: '100%', height: isMobile ? '100%' : 'auto', background: '#fff', borderRadius: isMobile ? 0 : 18, overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ padding: '16px 18px', borderBottom: `1px solid ${pal.g100}`, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ width: 38, height: 38, borderRadius: 10, background: t.bg, display: 'grid', placeItems: 'center', flexShrink: 0 }}><Ic n={t.icon} s={19} c={t.c} /></span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: pal.ink }}>{t.label}</div>
            <div style={{ fontSize: 12.5, color: pal.g500 }}>{AG_DAYS[ev.day]} {AG_DATES[ev.day]} jun · {fmtHour(ev.start)}</div>
          </div>
          <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: 10, border: 'none', background: pal.g100, display: 'grid', placeItems: 'center', cursor: 'pointer' }}><Ic n="x" s={19} c={pal.g700} /></button>
        </div>
        <div style={{ padding: 18, flex: 1, overflowY: 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: pal.g100, borderRadius: 11, padding: '11px 13px' }}>
              <Ic n="user-round" s={17} c={pal.primary} /><div><div style={{ fontSize: 13.5, fontWeight: 700, color: pal.ink }}>{ev.lead}</div><div style={{ fontSize: 11.5, color: pal.g500 }}>Cliente</div></div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: pal.g100, borderRadius: 11, padding: '11px 13px' }}>
              <Ic n="building-2" s={17} c={pal.primary} /><div style={{ minWidth: 0 }}><div style={{ fontSize: 13.5, fontWeight: 700, color: pal.ink }}>{ev.imovel}</div><div style={{ fontSize: 11.5, color: pal.g500 }}>Cód {ev.code}</div></div>
            </div>
            {ev.address && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: pal.g100, borderRadius: 11, padding: '11px 13px' }}>
                <Ic n="map-pin" s={17} c={pal.primary} /><div><div style={{ fontSize: 13, fontWeight: 600, color: pal.ink }}>{ev.address}</div></div>
              </div>
            )}
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: pal.g500, marginBottom: 8 }}>Status</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 18 }}>
            {VISIT_STATUS.map(s => {
              const on = status === s; const c = STATUS_C[s];
              return <button key={s} onClick={() => { setStatus(s); onToast('Status: ' + s, 'check'); }} style={{ border: on ? `1.5px solid ${c[0]}` : `1px solid ${pal.g300}`, background: on ? c[1] : '#fff', color: on ? c[0] : pal.g700, borderRadius: 999, padding: '7px 13px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: 600 }}>{s}</button>;
            })}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, padding: '14px 18px', borderTop: `1px solid ${pal.g100}` }}>
          <button onClick={() => onToast('Lembrete enviado ao cliente e a você', 'bell')} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, border: `1px solid ${pal.g300}`, background: '#fff', borderRadius: 11, padding: '12px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13.5, color: pal.g700 }}><Ic n="bell" s={16} c={pal.primary} /> Enviar lembrete</button>
          <button onClick={() => { onToast('Marcada como realizada · funil e score atualizados', 'circle-check'); onClose(); }} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, border: 'none', background: pal.primary, color: '#fff', borderRadius: 11, padding: '12px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 13.5, boxShadow: 'var(--shadow-purple)' }}><Ic n="circle-check" s={16} c="#fff" /> Realizada</button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   WEEKLY PLAN (3 steps)
   ============================================================ */
function PlBlockHead({ icon, title, sub }: { icon: string; title: string; sub?: string }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ width: 34, height: 34, borderRadius: 10, background: pal.lilac2, display: 'grid', placeItems: 'center' }}><Ic n={icon} s={18} c={pal.primary} /></span>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, margin: 0, color: pal.ink, whiteSpace: 'nowrap' }}>{title}</h2>
      </div>
      {sub && <p style={{ fontSize: 13.5, color: pal.g500, margin: '8px 0 0', lineHeight: 1.5 }}>{sub}</p>}
    </div>
  );
}

function WeeklyPlan({ isMobile, onClose, onDone, onToast }: { isMobile: boolean; onClose: () => void; onDone: () => void; onToast: (msg: string, icon?: string) => void }) {
  const [step, setStep] = React.useState(0);
  const [metas, setMetas] = React.useState<any>({ visitas: '6', follow: '15', capta: '3' });
  const [blocks, setBlocks] = React.useState<string[]>(['leads', 'visitas']);
  const [wake, setWake] = React.useState('06:30');
  const [sleep, setSleep] = React.useState('22:30');
  const [habits, setHabits] = React.useState<any>({ academia: [0, 2, 4], leitura: [1, 3], familia: [5, 6], caminhada: [0, 1, 2, 3, 4] });
  const [habitTimes, setHabitTimes] = React.useState<any>({ academia: '18:00', leitura: '21:00', familia: '20:00', caminhada: '07:00' });
  const [habitEnd, setHabitEnd] = React.useState<any>({ academia: '19:00', leitura: '22:00', familia: '21:00', caminhada: '07:30' });
  const [tasks, setTasks] = React.useState<any[]>([{ title: 'Captar imóvel na Boa Viagem', start: '10:00', end: '11:00', days: [1, 3], desc: 'Visita ao proprietário indicado pelo João Pedro.' }]);
  const setTask = (i: number, k: string, v: any) => setTasks(ts => ts.map((x, j) => j === i ? { ...x, [k]: v } : x));
  const toggleTaskDay = (i: number, d: number) => setTasks(ts => ts.map((x, j) => j === i ? { ...x, days: (x.days || []).includes(d) ? x.days.filter((y: number) => y !== d) : [...(x.days || []), d] } : x));
  const [avail, setAvail] = React.useState<any[]>([
    { d: 'Segunda', on: true, s: '09:00', e: '18:00' }, { d: 'Terça', on: true, s: '09:00', e: '18:00' },
    { d: 'Quarta', on: true, s: '09:00', e: '18:00' }, { d: 'Quinta', on: true, s: '09:00', e: '18:00' },
    { d: 'Sexta', on: true, s: '09:00', e: '18:00' }, { d: 'Sábado', on: true, s: '09:00', e: '12:00' },
    { d: 'Domingo', on: false, s: '', e: '' },
  ]);
  const setAv = (i: number, k: string, v: any) => setAvail(a => a.map((x, j) => j === i ? { ...x, [k]: v } : x));
  const toggleHab = (k: string, d: number) => setHabits((h: any) => ({ ...h, [k]: (h[k] || []).includes(d) ? h[k].filter((x: number) => x !== d) : [...(h[k] || []), d] }));
  const steps = ['Retrospecto', 'Metas', 'Rotina & vida', 'Compromissos & tarefas', 'Disponibilidade', 'Blocos de foco', 'Resumo'];
  const toggleBlock = (k: string) => setBlocks(b => b.includes(k) ? b.filter(x => x !== k) : [...b, k]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: pal.page, minWidth: 0 }}>
      <div style={{ background: '#fff', borderBottom: `1px solid ${pal.g300}`, padding: isMobile ? '12px 16px' : '14px 28px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, maxWidth: 720, margin: '0 auto' }}>
          <button onClick={onClose} style={{ width: 38, height: 38, flexShrink: 0, borderRadius: 10, border: `1px solid ${pal.g300}`, background: '#fff', display: 'grid', placeItems: 'center', cursor: 'pointer' }}><Ic n="arrow-left" s={19} c={pal.g700} /></button>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: pal.ink }}>Planejamento semanal</div>
            <div style={{ fontSize: 12, color: pal.g500 }}>Passo {step + 1} de {steps.length} · {steps[step]}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, maxWidth: 720, margin: '14px auto 0' }}>
          {steps.map((s, i) => <div key={i} style={{ flex: 1, height: 5, borderRadius: 999, background: i <= step ? pal.primary : pal.g300, transition: 'background .2s' }} />)}
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '20px 16px' : '26px 28px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          {step === 0 && (
            <div>
              <PlBlockHead icon="history" title="Como foi sua semana" sub="Um retrato rápido: vem do seu score e indicadores, sem digitar nada." />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px,1fr))', gap: 12 }}>
                {RETRO.map(([l, v, ic, c, note], i) => (
                  <div key={i} style={{ background: '#fff', border: `1px solid ${pal.g300}`, borderRadius: 14, padding: 16 }}>
                    <Ic n={ic} s={18} c={c} />
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, color: pal.ink, marginTop: 8 }}>{v}</div>
                    <div style={{ fontSize: 12.5, color: pal.g700, fontWeight: 600 }}>{l}</div>
                    <div style={{ fontSize: 11.5, color: pal.g500, marginTop: 2 }}>{note}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {step === 1 && (
            <div>
              <PlBlockHead icon="target" title="Metas da semana" sub="Defina poucos números: o que dá pra perseguir todo dia." />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {([['visitas', 'Visitas agendadas', 'sugestão: 6'], ['follow', 'Follow-ups', 'sugestão: 15'], ['capta', 'Captações de imóvel', 'sugestão: 3']] as [string,string,string][]).map(([k, label, hint]) => (
                  <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#fff', border: `1px solid ${pal.g300}`, borderRadius: 13, padding: '14px 16px' }}>
                    <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 600, color: pal.ink }}>{label}</div><div style={{ fontSize: 12, color: pal.g500 }}>{hint}</div></div>
                    <input value={metas[k]} onChange={(e: any) => setMetas((m: any) => ({ ...m, [k]: e.target.value }))} inputMode="numeric" style={{ width: 70, textAlign: 'center', border: `1px solid ${pal.g300}`, borderRadius: 10, padding: '10px', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: pal.primary, outline: 'none' }} />
                  </div>
                ))}
              </div>
            </div>
          )}
          {step === 2 && (
            <div>
              <PlBlockHead icon="heart-pulse" title="Rotina & vida" sub="Sua agenda é de crescimento pessoal, não só de trabalho. Dormir bem e se cuidar melhora foco, energia e fechamento." />
              <div style={{ display: 'flex', gap: 9, marginBottom: 16, background: pal.lilac1, border: `1px solid ${pal.lilac2}`, borderRadius: 12, padding: '12px 14px', fontSize: 12.5, color: pal.g700 }}>
                <Ic n="lightbulb" s={17} c={pal.primary} style={{ flexShrink: 0, marginTop: 1 }} /> <span>~8h de sono e atividade física regular aumentam clareza e disposição. Planeje a semana <strong>inteira</strong>. Corpo descansado fecha mais negócios.</span>
              </div>
              <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                {([['Acordar', wake, setWake, 'sunrise'], ['Dormir', sleep, setSleep, 'moon']] as any[]).map(([lab, val, setter, ic]: any, i: number) => (
                  <div key={i} style={{ flex: 1, background: '#fff', border: `1px solid ${pal.g300}`, borderRadius: 13, padding: '13px 15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}><Ic n={ic} s={16} c={pal.primary} /><span style={{ fontSize: 13, fontWeight: 600, color: pal.ink }}>{lab}</span></div>
                    <input type="time" value={val} onChange={(e: any) => setter(e.target.value)} style={{ width: '100%', border: `1px solid ${pal.g300}`, borderRadius: 10, padding: '10px 12px', fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 600, color: pal.ink, outline: 'none' }} />
                  </div>
                ))}
              </div>
              <div style={{ background: '#fff', border: `1px solid ${pal.g300}`, borderRadius: 14, padding: '16px 16px 8px' }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: pal.g500, marginBottom: 12 }}>Hábitos · dia a dia</div>
                {LIFE_HABITS.map(h => (
                  <div key={h.k} style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 12, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, flex: '1 1 140px', minWidth: 120 }}><Ic n={h.icon} s={16} c={pal.g700} /><span style={{ fontSize: 13, fontWeight: 600, color: pal.ink }}>{h.label}</span></div>
                    <input type="time" value={habitTimes[h.k] || ''} onChange={(e: any) => setHabitTimes((ht: any) => ({ ...ht, [h.k]: e.target.value }))} style={{ width: 84, flexShrink: 0, border: `1px solid ${pal.g300}`, borderRadius: 8, padding: '6px 8px', fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: 600, color: pal.primary, outline: 'none' }} />
                    <span style={{ color: pal.g500, fontWeight: 600, flexShrink: 0 }}>–</span>
                    <input type="time" value={habitEnd[h.k] || ''} onChange={(e: any) => setHabitEnd((ht: any) => ({ ...ht, [h.k]: e.target.value }))} style={{ width: 84, flexShrink: 0, border: `1px solid ${pal.g300}`, borderRadius: 8, padding: '6px 8px', fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: 600, color: pal.primary, outline: 'none' }} />
                    <div style={{ display: 'flex', gap: 5 }}>
                      {DAYL.map((d, di) => {
                        const on = (habits[h.k] || []).includes(di);
                        return <button key={di} onClick={() => toggleHab(h.k, di)} style={{ width: 28, height: 28, borderRadius: 8, border: on ? `1.5px solid ${pal.primary}` : `1px solid ${pal.g300}`, background: on ? pal.primary : '#fff', color: on ? '#fff' : pal.g500, fontFamily: 'var(--font-body)', fontSize: 11.5, fontWeight: 700, cursor: 'pointer' }}>{d}</button>;
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {step === 3 && (
            <div>
              <PlBlockHead icon="clipboard-list" title="Compromissos & tarefas" sub="O que você precisa fazer esta semana, com título, horário e descrição." />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {tasks.map((t, i) => (
                  <div key={i} style={{ background: '#fff', border: `1px solid ${pal.g300}`, borderRadius: 14, padding: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 10 }}>
                      <input value={t.title} onChange={(e: any) => setTask(i, 'title', e.target.value)} placeholder="Título do compromisso ou tarefa" style={{ flex: 1, minWidth: 0, border: `1px solid ${pal.g300}`, borderRadius: 10, padding: '10px 12px', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, color: pal.ink, outline: 'none' }} />
                      <button onClick={() => setTasks(x => x.filter((_, j) => j !== i))} title="Remover" style={{ width: 36, height: 36, flexShrink: 0, borderRadius: 9, border: `1px solid ${pal.g300}`, background: '#fff', display: 'grid', placeItems: 'center', cursor: 'pointer' }}><Ic n="trash-2" s={15} c={pal.g500} /></button>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ fontSize: 12, color: pal.g500, fontWeight: 600 }}>Início</span><input type="time" value={t.start} onChange={(e: any) => setTask(i, 'start', e.target.value)} style={{ border: `1px solid ${pal.g300}`, borderRadius: 9, padding: '8px 10px', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: pal.primary, outline: 'none' }} /></div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ fontSize: 12, color: pal.g500, fontWeight: 600 }}>Fim</span><input type="time" value={t.end} onChange={(e: any) => setTask(i, 'end', e.target.value)} style={{ border: `1px solid ${pal.g300}`, borderRadius: 9, padding: '8px 10px', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: pal.primary, outline: 'none' }} /></div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                      <span style={{ fontSize: 12, color: pal.g500, fontWeight: 600 }}>Dias</span>
                      {DAYL.map((d, di) => {
                        const on = (t.days || []).includes(di);
                        return <button key={di} onClick={() => toggleTaskDay(i, di)} style={{ width: 28, height: 28, borderRadius: 8, border: on ? `1.5px solid ${pal.primary}` : `1px solid ${pal.g300}`, background: on ? pal.primary : '#fff', color: on ? '#fff' : pal.g500, fontFamily: 'var(--font-body)', fontSize: 11.5, fontWeight: 700, cursor: 'pointer' }}>{d}</button>;
                      })}
                    </div>
                    <textarea value={t.desc} onChange={(e: any) => setTask(i, 'desc', e.target.value)} rows={2} placeholder="Descrição (o que precisa fazer, com quem, onde…)" style={{ width: '100%', border: `1px solid ${pal.g300}`, borderRadius: 10, padding: '10px 12px', fontFamily: 'var(--font-body)', fontSize: 13.5, lineHeight: 1.5, color: pal.ink, outline: 'none', resize: 'vertical' }} />
                  </div>
                ))}
              </div>
              <button onClick={() => setTasks(x => [...x, { title: '', start: '', end: '', days: [], desc: '' }])} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 12, border: `1px dashed ${pal.g300}`, background: pal.lilac1, color: pal.primary, borderRadius: 11, padding: '12px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13.5, width: '100%' }}><Ic n="plus" s={16} c={pal.primary} /> Adicionar compromisso ou tarefa</button>
            </div>
          )}
          {step === 4 && (
            <div>
              <PlBlockHead icon="clock" title="Disponibilidade" sub="Sua grade semanal: quando você atende. O bot e o roteamento de leads leem isso em tempo real." />
              <div style={{ display: 'flex', gap: 9, marginBottom: 16, background: pal.lilac1, border: `1px solid ${pal.lilac2}`, borderRadius: 12, padding: '12px 14px', fontSize: 12.5, color: pal.g700 }}>
                <Ic n="info" s={16} c={pal.primary} style={{ flexShrink: 0, marginTop: 1 }} /> <span>Leads só são oferecidos dentro da sua disponibilidade. Confirme seus horários da semana.</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {avail.map((a, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff', border: `1px solid ${pal.g300}`, borderRadius: 12, padding: '11px 14px', flexWrap: 'wrap' }}>
                    <button onClick={() => setAv(i, 'on', !a.on)} style={{ width: 42, height: 24, flexShrink: 0, borderRadius: 999, border: 'none', background: a.on ? pal.primary : pal.g300, position: 'relative', cursor: 'pointer' }}>
                      <span style={{ position: 'absolute', top: 3, left: a.on ? 21 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left .15s', boxShadow: '0 1px 2px rgba(0,0,0,.2)' } as React.CSSProperties} />
                    </button>
                    <span style={{ fontSize: 13.5, fontWeight: 600, color: a.on ? pal.ink : pal.g500, width: 76 }}>{a.d}</span>
                    {a.on ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <input type="time" value={a.s} onChange={(e: any) => setAv(i, 's', e.target.value)} style={{ border: `1px solid ${pal.g300}`, borderRadius: 9, padding: '7px 9px', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: pal.primary, outline: 'none' }} />
                        <span style={{ color: pal.g500, fontWeight: 600 }}>–</span>
                        <input type="time" value={a.e} onChange={(e: any) => setAv(i, 'e', e.target.value)} style={{ border: `1px solid ${pal.g300}`, borderRadius: 9, padding: '7px 9px', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: pal.primary, outline: 'none' }} />
                      </div>
                    ) : <span style={{ fontSize: 13, color: pal.g500 }}>Indisponível</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
          {step === 5 && (
            <div>
              <PlBlockHead icon="layout-grid" title="Blocos de foco" sub="Reserve tempo na semana. Esses blocos entram na sua agenda." />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {FOCUS_BLOCKS.map(b => {
                  const on = blocks.includes(b.k);
                  return (
                    <button key={b.k} onClick={() => toggleBlock(b.k)} style={{ display: 'flex', alignItems: 'center', gap: 13, border: on ? `1.5px solid ${pal.primary}` : `1px solid ${pal.g300}`, background: on ? pal.lilac1 : '#fff', borderRadius: 13, padding: '14px 16px', cursor: 'pointer', fontFamily: 'var(--font-body)', textAlign: 'left' }}>
                      <span style={{ width: 38, height: 38, flexShrink: 0, borderRadius: 10, background: on ? pal.lilac2 : pal.g100, display: 'grid', placeItems: 'center' }}><Ic n={b.icon} s={19} c={on ? pal.primary : pal.g700} /></span>
                      <span style={{ flex: 1, fontSize: 14.5, fontWeight: 600, color: pal.ink }}>{b.label}</span>
                      <span style={{ width: 24, height: 24, borderRadius: '50%', border: on ? `7px solid ${pal.primary}` : `2px solid ${pal.g300}` }} />
                    </button>
                  );
                })}
              </div>
              <div style={{ display: 'flex', gap: 9, marginTop: 16, background: pal.lilac1, border: `1px solid ${pal.lilac2}`, borderRadius: 12, padding: '12px 14px', fontSize: 12.5, color: pal.g700 }}>
                <Ic n="info" s={16} c={pal.primary} style={{ flexShrink: 0 }} /> Os blocos selecionados viram horários reservados na sua Agenda automaticamente.
              </div>
            </div>
          )}
          {step === 6 && (
            <div>
              <PlBlockHead icon="check-circle-2" title="Plano da semana pronto" sub="Direção definida. Bora pra cima!" />
              <div style={{ background: '#fff', border: `1px solid ${pal.g300}`, borderRadius: 16, padding: 18, marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: pal.g500, marginBottom: 10 }}>Rotina & vida</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: pal.lilac1, border: `1px solid ${pal.lilac2}`, borderRadius: 999, padding: '6px 12px', fontSize: 12.5, fontWeight: 600, color: pal.g700 }}><Ic n="sunrise" s={14} c={pal.primary} /> Acordar {wake}</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: pal.lilac1, border: `1px solid ${pal.lilac2}`, borderRadius: 999, padding: '6px 12px', fontSize: 12.5, fontWeight: 600, color: pal.g700 }}><Ic n="moon" s={14} c={pal.primary} /> Dormir {sleep}</span>
                  {LIFE_HABITS.filter(h => (habits[h.k] || []).length).map(h => (
                    <span key={h.k} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: pal.lilac1, border: `1px solid ${pal.lilac2}`, borderRadius: 999, padding: '6px 12px', fontSize: 12.5, fontWeight: 600, color: pal.g700 }}><Ic n={h.icon} s={14} c={pal.primary} /> {h.label} · {habitTimes[h.k]}–{habitEnd[h.k]} · {(habits[h.k] || []).length}x</span>
                  ))}
                </div>
              </div>
              <div style={{ background: '#fff', border: `1px solid ${pal.g300}`, borderRadius: 16, padding: 18 }}>
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: pal.g500, marginBottom: 12 }}>Metas</div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 18 }}>
                  {([['Visitas', metas.visitas], ['Follow-ups', metas.follow], ['Captações', metas.capta]] as [string,string][]).map(([l, v], i) => (
                    <div key={i} style={{ flex: '1 1 120px', background: pal.lilac1, border: `1px solid ${pal.lilac2}`, borderRadius: 12, padding: '12px 14px' }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, color: pal.primary }}>{v}</div>
                      <div style={{ fontSize: 12, color: pal.g600 }}>{l}</div>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: pal.g500, marginBottom: 10 }}>Blocos de foco</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {blocks.length === 0 ? <span style={{ fontSize: 13, color: pal.g500 }}>Nenhum bloco selecionado.</span> : blocks.map(k => {
                    const b = FOCUS_BLOCKS.find(x => x.k === k)!;
                    return <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: pal.lilac2, color: pal.primary, borderRadius: 999, padding: '6px 12px', fontSize: 12.5, fontWeight: 600 }}><Ic n={b.icon} s={14} c={pal.primary} /> {b.label}</span>;
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div style={{ background: '#fff', borderTop: `1px solid ${pal.g300}`, padding: isMobile ? '12px 16px' : '14px 28px', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 10, maxWidth: 680, margin: '0 auto' }}>
          <button onClick={() => (step === 0 ? onClose() : setStep(s => s - 1))} style={{ display: 'flex', alignItems: 'center', gap: 7, border: `1px solid ${pal.g300}`, background: '#fff', borderRadius: 11, padding: '11px 17px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14, color: pal.g700 }}><Ic n="arrow-left" s={16} c={pal.g700} /> {step === 0 ? 'Cancelar' : 'Voltar'}</button>
          {step < 6 ? (
            <button onClick={() => setStep(s => s + 1)} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 7, border: 'none', background: pal.primary, color: '#fff', borderRadius: 11, padding: '11px 20px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 14, boxShadow: 'var(--shadow-purple)' }}>Próximo <Ic n="arrow-right" s={16} c="#fff" /></button>
          ) : (
            <button onClick={() => { onDone(); }} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 7, border: 'none', background: pal.primary, color: '#fff', borderRadius: 11, padding: '11px 20px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 14, boxShadow: 'var(--shadow-purple)' }}><Ic n="check" s={17} c="#fff" /> Concluir planejamento</button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   DAILY PLAN
   ============================================================ */
function DailyPlan({ isMobile, onClose, onDone, onToast, initialWhich }: { isMobile: boolean; onClose: () => void; onDone: () => void; onToast: (msg: string, icon?: string) => void; initialWhich: string }) {
  const [which, setWhich] = React.useState(initialWhich || 'hoje');
  const amanha = which === 'amanha';
  const [tops, setTops] = React.useState(['Fechar a proposta do Carlos', 'Confirmar a visita da Mariana', '']);
  const [topsT, setTopsT] = React.useState(['Preparar a visita da Sala Pina', 'Ligar para o proprietário da cobertura', '']);
  const [acts, setActs] = React.useState<any[]>([{ h: '07:00', t: 'Caminhada' }, { h: '09:00', t: 'Bloco · Responder leads' }, { h: '15:00', t: 'Visita · Sala Pina (Fernanda)' }]);
  const [actsT, setActsT] = React.useState<any[]>([{ h: '07:00', t: 'Academia' }, { h: '09:00', t: 'Prospecção' }, { h: '10:00', t: 'Reunião online · Carlos' }]);
  const [cap, setCap] = React.useState(6);
  const [capT, setCapT] = React.useState(6);
  const curActs = amanha ? actsT : acts;
  const setAct = (i: number, k: string, v: any) => (amanha ? setActsT : setActs)((a: any[]) => a.map((x, j) => j === i ? { ...x, [k]: v } : x));
  const addAct = () => (amanha ? setActsT : setActs)((x: any[]) => [...x, { h: '', t: '' }]);
  const delAct = (i: number) => (amanha ? setActsT : setActs)((x: any[]) => x.filter((_: any, j: number) => j !== i));
  const curTops = amanha ? topsT : tops;
  const setTop = (i: number, v: string) => (amanha ? setTopsT : setTops)((t: string[]) => t.map((x, j) => j === i ? v : x));
  const curCap = amanha ? capT : cap;
  const setCapV = amanha ? setCapT : setCap;
  const retomar = [['Fernanda Lima', 'aguardando há 3h'], ['João Pedro', 'novo · sem resposta']];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: pal.page, minWidth: 0 }}>
      <div style={{ background: '#fff', borderBottom: `1px solid ${pal.g300}`, padding: isMobile ? '12px 16px' : '14px 28px', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <button onClick={onClose} style={{ width: 38, height: 38, flexShrink: 0, borderRadius: 10, border: `1px solid ${pal.g300}`, background: '#fff', display: 'grid', placeItems: 'center', cursor: 'pointer' }}><Ic n="arrow-left" s={19} c={pal.g700} /></button>
        <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: pal.ink }}>Revisão do dia</div><div style={{ fontSize: 12, color: pal.g500 }}>{amanha ? 'Chegue preparado para amanhã.' : '1 minuto pra orientar o seu dia.'}</div></div>
        <div style={{ display: 'flex', gap: 4, background: pal.g100, borderRadius: 10, padding: 4 }}>
          {([['hoje', 'Hoje'], ['amanha', 'Amanhã']] as [string,string][]).map(([k, lab]) => (
            <button key={k} onClick={() => setWhich(k)} style={{ border: 'none', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13.5, background: which === k ? '#fff' : 'transparent', color: which === k ? pal.primary : pal.g500, boxShadow: which === k ? 'var(--shadow-sm)' : 'none' }}>{lab}</button>
          ))}
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '20px 16px' : '26px 28px' }}>
        <div style={{ maxWidth: 620, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'flex', gap: 10, background: pal.lilac1, border: `1px solid ${pal.lilac2}`, borderRadius: 12, padding: '13px 15px' }}>
            <Ic n="sparkles" s={18} c={pal.primary} style={{ flexShrink: 0, marginTop: 1 }} />
            <div style={{ fontSize: 13, color: pal.g700, lineHeight: 1.5 }}><strong style={{ color: pal.ink }}>Imprevistos acontecem</strong>, e está tudo bem ajustar {amanha ? 'o dia de amanhã' : 'seu dia'}. Edite os horários e o que vai fazer à vontade.</div>
          </div>
          <div style={{ background: '#fff', border: `1px solid ${pal.g300}`, borderRadius: 14, padding: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: pal.g500 }}>{amanha ? 'O que vou fazer amanhã' : 'O que vou fazer hoje'}</div>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: pal.primary, fontWeight: 600 }}><Ic n="pencil" s={12} c={pal.primary} /> editável</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {curActs.map((a: any, i: number) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="time" value={a.h} onChange={(e: any) => setAct(i, 'h', e.target.value)} style={{ width: 92, flexShrink: 0, border: `1px solid ${pal.g300}`, borderRadius: 9, padding: '9px 10px', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: pal.primary, outline: 'none' }} />
                  <input value={a.t} onChange={(e: any) => setAct(i, 't', e.target.value)} placeholder="Atividade" style={{ flex: 1, minWidth: 0, border: `1px solid ${pal.g300}`, borderRadius: 9, padding: '9px 12px', fontFamily: 'var(--font-body)', fontSize: 13.5, color: pal.ink, outline: 'none' }} />
                  <button onClick={() => delAct(i)} title="Remover" style={{ width: 34, height: 34, flexShrink: 0, borderRadius: 9, border: `1px solid ${pal.g300}`, background: '#fff', display: 'grid', placeItems: 'center', cursor: 'pointer' }}><Ic n="trash-2" s={15} c={pal.g500} /></button>
                </div>
              ))}
            </div>
            <button onClick={addAct} style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 12, border: `1px dashed ${pal.g300}`, background: pal.lilac1, color: pal.primary, borderRadius: 10, padding: '10px 14px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13, width: '100%', justifyContent: 'center' }}><Ic n="plus" s={16} c={pal.primary} /> Adicionar atividade</button>
          </div>
          <div style={{ background: '#fff', border: `1px solid ${pal.g300}`, borderRadius: 14, padding: 18, display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ width: 38, height: 38, flexShrink: 0, borderRadius: 10, background: pal.lilac2, display: 'grid', placeItems: 'center' }}><Ic n="users" s={19} c={pal.primary} /></span>
            <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 600, color: pal.ink }}>{amanha ? 'Capacidade de amanhã' : 'Capacidade de hoje'}</div><div style={{ fontSize: 12, color: pal.g500 }}>quantos novos atendimentos posso receber</div></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <button onClick={() => setCapV(c => Math.max(0, c - 1))} style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${pal.g300}`, background: '#fff', display: 'grid', placeItems: 'center', cursor: 'pointer' }}><Ic n="minus" s={15} c={pal.g700} /></button>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: pal.ink, minWidth: 22, textAlign: 'center' }}>{curCap}</span>
              <button onClick={() => setCapV(c => c + 1)} style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${pal.g300}`, background: '#fff', display: 'grid', placeItems: 'center', cursor: 'pointer' }}><Ic n="plus" s={15} c={pal.g700} /></button>
            </div>
          </div>
          <div style={{ background: '#fff', border: `1px solid ${pal.g300}`, borderRadius: 14, padding: 18 }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: pal.g500, marginBottom: 12 }}>{amanha ? 'Top 3 prioridades de amanhã' : 'Top 3 prioridades do dia'}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {curTops.map((v: string, i: number) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                  <span style={{ width: 26, height: 26, flexShrink: 0, borderRadius: '50%', background: pal.lilac2, color: pal.primary, display: 'grid', placeItems: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13 }}>{i + 1}</span>
                  <input value={v} onChange={(e: any) => setTop(i, e.target.value)} placeholder={'Prioridade ' + (i + 1)} style={{ flex: 1, border: `1px solid ${pal.g300}`, borderRadius: 10, padding: '11px 13px', fontFamily: 'var(--font-body)', fontSize: 14, color: pal.ink, outline: 'none' }} />
                </div>
              ))}
            </div>
          </div>
          <div style={{ background: '#fff', border: `1px solid ${pal.g300}`, borderRadius: 14, padding: 18 }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: pal.g500, marginBottom: 12 }}>Conversas para retomar</div>
            {retomar.map(([n, s], i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '9px 0', borderTop: i ? `1px solid ${pal.g100}` : 'none' }}>
                <span style={{ width: 32, height: 32, borderRadius: '50%', background: `linear-gradient(135deg, ${pal.light}, ${pal.deep})`, display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 700, fontSize: 11, fontFamily: 'var(--font-display)' }}>{n.split(' ').map((x: string) => x[0]).join('')}</span>
                <div style={{ flex: 1 }}><div style={{ fontSize: 13.5, fontWeight: 600, color: pal.ink }}>{n}</div><div style={{ fontSize: 12, color: pal.g500 }}>{s}</div></div>
                <button onClick={() => onToast('Abrindo conversa…', 'message-circle')} style={{ border: `1px solid ${pal.g300}`, background: '#fff', borderRadius: 9, padding: '7px 13px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 12.5, color: pal.primary }}>Retomar</button>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ background: '#fff', borderTop: `1px solid ${pal.g300}`, padding: isMobile ? '12px 16px' : '14px 28px', flexShrink: 0 }}>
        <button onClick={onDone} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', maxWidth: 620, margin: '0 auto', border: 'none', background: pal.primary, color: '#fff', borderRadius: 12, padding: '13px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 15, boxShadow: 'var(--shadow-purple)' }}><Ic n={amanha ? 'check' : 'sunrise'} s={18} c="#fff" /> {amanha ? 'Salvar plano de amanhã' : 'Começar o dia'}</button>
      </div>
    </div>
  );
}

/* ============================================================
   TOAST
   ============================================================ */
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
   AGENDA TOOLBAR & SYNC NOTICE
   ============================================================ */
function Toolbar({ view, setView, isMobile, onToast, onPlanWeek, onReviewDay }: any) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
      {!isMobile && (
        <div style={{ display: 'flex', gap: 4, background: pal.g100, borderRadius: 10, padding: 4 }}>
          {['Dia', 'Semana'].map(v => (
            <button key={v} onClick={() => setView(v)} style={{ border: 'none', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13.5, background: view === v ? '#fff' : 'transparent', color: view === v ? pal.primary : pal.g500, boxShadow: view === v ? 'var(--shadow-sm)' : 'none' }}>{v}</button>
          ))}
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <button onClick={() => onToast('Semana anterior', 'chevron-left')} style={{ width: 36, height: 36, borderRadius: 9, border: `1px solid ${pal.g300}`, background: '#fff', display: 'grid', placeItems: 'center', cursor: 'pointer' }}><Ic n="chevron-left" s={18} c={pal.g700} /></button>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: pal.ink, minWidth: 120, textAlign: 'center' }}>{isMobile ? 'Qua, 11 jun' : '9 – 14 jun · 2025'}</span>
        <button onClick={() => onToast('Próxima semana', 'chevron-right')} style={{ width: 36, height: 36, borderRadius: 9, border: `1px solid ${pal.g300}`, background: '#fff', display: 'grid', placeItems: 'center', cursor: 'pointer' }}><Ic n="chevron-right" s={18} c={pal.g700} /></button>
      </div>
      <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
        <div style={{ display: 'flex', border: `1px solid ${pal.g300}`, borderRadius: 10, overflow: 'hidden' }}>
          <button onClick={() => onReviewDay('hoje')} style={{ display: 'flex', alignItems: 'center', gap: 7, border: 'none', borderRight: `1px solid ${pal.g300}`, background: '#fff', padding: '9px 14px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13.5, color: pal.g700 }}><Ic n="sun" s={16} c={pal.primary} /> {isMobile ? 'Hoje' : 'Revisar hoje'}</button>
          <button onClick={() => onReviewDay('amanha')} style={{ display: 'flex', alignItems: 'center', gap: 7, border: 'none', background: '#fff', padding: '9px 14px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13.5, color: pal.g700 }}><Ic n="sunrise" s={16} c={pal.primary} /> {isMobile ? 'Amanhã' : 'Revisar amanhã'}</button>
        </div>
        <button onClick={onPlanWeek} style={{ display: 'flex', alignItems: 'center', gap: 7, border: 'none', background: pal.primary, color: '#fff', borderRadius: 10, padding: '9px 16px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 13.5, boxShadow: 'var(--shadow-purple)' }}><Ic n="list-checks" s={16} c="#fff" /> {isMobile ? 'Semana' : 'Planejar semana'}</button>
      </div>
    </div>
  );
}

function SyncNotice({ onToast }: { onToast: (msg: string, icon?: string) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: pal.lilac1, border: `1px solid ${pal.lilac2}`, borderRadius: 10, padding: '9px 13px', marginBottom: 16, fontSize: 12.5, color: pal.g700 }}>
      <Ic n="calendar-sync" s={16} c={pal.primary} style={{ flexShrink: 0 }} />
      <span>Sua agenda pode ser sincronizada com o <strong>Google, Apple ou Outlook</strong>: só compromissos reais vão pro seu calendário.</span>
      <button onClick={() => onToast('Link de sincronização (.ics) copiado', 'link')} style={{ marginLeft: 'auto', border: 'none', background: 'transparent', color: pal.primary, fontWeight: 700, fontSize: 12.5, cursor: 'pointer', whiteSpace: 'nowrap' }}>Sincronizar</button>
    </div>
  );
}

/* ============================================================
   MAIN PAGE
   ============================================================ */
export default function AgendaPage() {
  const [isMobile, setIsMobile] = React.useState(false);
  const [view, setView] = React.useState('Semana');
  const [screen, setScreen] = React.useState<'agenda' | 'semanal' | 'diario'>('agenda');
  const [modal, setModal] = React.useState<any>(null);
  const [mobAvail, setMobAvail] = React.useState(false);
  const [dayWhich, setDayWhich] = React.useState('hoje');
  const reviewDay = (w: string) => { setDayWhich(w); setScreen('diario'); };
  const [events, setEvents] = React.useState<any[]>(() => AG_EVENTS_INIT.map(e => ({ ...e })));
  const moveEvent = (id: string, day: number, start: number) => { setEvents(es => es.map(e => e.id === id ? { ...e, day, start } : e)); fire('Compromisso movido', 'move'); };
  const [toast, setToast] = React.useState<ToastT | null>(null);
  const toastTimer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  React.useEffect(() => {
    const onResize = () => { const w = window.innerWidth; setIsMobile(w < 1024); };
    onResize(); window.addEventListener('resize', onResize); return () => window.removeEventListener('resize', onResize);
  }, []);

  const fire = (msg: string, icon?: string) => { setToast({ msg, icon, id: Date.now() }); clearTimeout(toastTimer.current); toastTimer.current = setTimeout(() => setToast(null), 2600); };

  const effView = isMobile ? 'Dia' : view;
  const calEl = effView === 'Semana'
    ? <WeekView onOpen={setModal} events={events} onMove={moveEvent} />
    : <DayView onOpen={setModal} events={events} onMove={moveEvent} />;

  const agendaContent = (
    <div style={{ padding: isMobile ? '16px' : 28, maxWidth: 1280, margin: '0 auto' }}>
      <Toolbar view={view} setView={setView} isMobile={isMobile} onToast={fire}
        onPlanWeek={() => setScreen('semanal')} onReviewDay={reviewDay} />
      <SyncNotice onToast={fire} />
      {isMobile ? (
        <div>
          <button onClick={() => setMobAvail(true)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 9, border: `1px solid ${pal.g300}`, background: '#fff', borderRadius: 12, padding: '12px 14px', cursor: 'pointer', marginBottom: 14, fontFamily: 'var(--font-body)' }}>
            <Ic n="clock" s={18} c={pal.primary} /><span style={{ flex: 1, textAlign: 'left', fontWeight: 600, fontSize: 13.5, color: pal.ink }}>Disponibilidade</span><Ic n="chevron-right" s={17} c={pal.g500} />
          </button>
          {calEl}
          <Legend />
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start' }}>
          <div style={{ flex: 1, minWidth: 0 }}>{calEl}<Legend /></div>
          <div style={{ width: 304, flexShrink: 0 }}><AvailabilityPanel onToast={fire} /></div>
        </div>
      )}
    </div>
  );

  let main: React.ReactNode;
  if (screen === 'semanal') main = <WeeklyPlan isMobile={isMobile} onClose={() => setScreen('agenda')} onDone={() => { setScreen('agenda'); fire('Planejamento da semana concluído · +pontos de disciplina', 'check'); }} onToast={fire} />;
  else if (screen === 'diario') main = <DailyPlan isMobile={isMobile} initialWhich={dayWhich} onClose={() => setScreen('agenda')} onDone={() => { setScreen('agenda'); fire(dayWhich === 'amanha' ? 'Plano de amanhã salvo.' : 'Bom dia! Seu dia está orientado.', dayWhich === 'amanha' ? 'check' : 'sunrise'); }} onToast={fire} />;
  else main = agendaContent;

  const overlays = (
    <React.Fragment>
      {modal && <VisitModal ev={modal} isMobile={isMobile} onClose={() => setModal(null)} onToast={fire} />}
      {mobAvail && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 8000, background: '#fff', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', borderBottom: `1px solid ${pal.g300}` }}>
            <button onClick={() => setMobAvail(false)} style={{ width: 36, height: 36, borderRadius: 10, border: 'none', background: pal.g100, display: 'grid', placeItems: 'center', cursor: 'pointer' }}><Ic n="arrow-left" s={19} c={pal.ink} /></button>
            <span style={{ fontWeight: 700, fontSize: 15, color: pal.ink }}>Disponibilidade</span>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}><AvailabilityPanel onToast={fire} /></div>
        </div>
      )}
      <Toast toast={toast} />
    </React.Fragment>
  );

  return (
    <CorretorChrome title="Agenda" subtitle="Seu planejamento e o registro real do dia." searchPlaceholder="Buscar compromisso ou cliente" mobileTab="Agenda">
      <div style={{ flex: 1, overflowY: screen === 'agenda' ? 'auto' : 'hidden', minHeight: 0, background: pal.page, height: '100%' }}>
        {main}
      </div>
      {overlays}
    </CorretorChrome>
  );
}
