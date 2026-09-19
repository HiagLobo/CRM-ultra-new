"use client";
import * as React from "react";
import { pal, Ic } from "@/components/corretor/CorretorChrome";

export function MeetMark({ small }: { small?: boolean }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fff', border: `1px solid ${pal.g300}`, borderRadius: 999, padding: small ? '2px 9px 2px 6px' : '4px 11px 4px 7px', fontSize: small ? 11 : 12, fontWeight: 600, color: pal.g700 }}>
      <span style={{ width: small ? 17 : 20, height: small ? 17 : 20, borderRadius: 5, background: '#E8F0FE', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
        <Ic n="video" s={small ? 11 : 13} c="#1A73E8" />
      </span>
      Google Meet
    </span>
  );
}

export const ST: Record<string, { label: string; c: string; bg: string; icon: string }> = {
  agendada:    { label: 'Agendada',     c: '#2563A8', bg: '#E5EEF7', icon: 'calendar-clock' },
  andamento:   { label: 'Em andamento', c: '#2E9E5B', bg: '#E6F4EC', icon: 'radio' },
  processando: { label: 'Processando',  c: '#B8860B', bg: '#FBF1DC', icon: 'loader' },
  realizada:   { label: 'Realizada',    c: '#2E9E5B', bg: '#E6F4EC', icon: 'circle-check' },
};

export function StatusPill({ status }: { status: string }) {
  const s = ST[status] || ST.agendada;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: s.bg, color: s.c, fontSize: 12, fontWeight: 700, borderRadius: 999, padding: '4px 11px' }}>
      <Ic n={s.icon} s={13} c={s.c} /> {s.label}
    </span>
  );
}

export function copyLink(link: string, onToast?: (msg: string, icon?: string) => void) {
  try { navigator.clipboard && navigator.clipboard.writeText('https://' + link); } catch (e) { /* ignore */ }
  onToast && onToast('Link da reunião copiado', 'copy');
}

export function ModalShell({ isMobile, onClose, children, w = 540 }: {
  isMobile: boolean; onClose: () => void; children: React.ReactNode; w?: number;
}) {
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 8000, background: 'rgba(28,22,40,.5)', display: 'grid', placeItems: isMobile ? 'stretch' : 'center', padding: isMobile ? 0 : 24 }}>
      <div onClick={(e: any) => e.stopPropagation()} style={{
        width: isMobile ? '100%' : w, maxWidth: '100%', height: isMobile ? '100%' : 'auto', maxHeight: isMobile ? '100%' : '92vh',
        background: '#fff', borderRadius: isMobile ? 0 : 18, display: 'flex', flexDirection: 'column', overflow: 'hidden',
        boxShadow: 'var(--shadow-lg)',
      }}>{children}</div>
    </div>
  );
}

export function ModalHeader({ title, sub, onClose }: { title: string; sub?: string; onClose: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 18px', borderBottom: `1px solid ${pal.g100}`, flexShrink: 0 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: pal.ink }}>{title}</div>
        {sub && <div style={{ fontSize: 12.5, color: pal.g500, marginTop: 2 }}>{sub}</div>}
      </div>
      <button onClick={onClose} style={{ width: 36, height: 36, flexShrink: 0, borderRadius: 10, border: 'none', background: pal.g100, display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
        <Ic n="x" s={19} c={pal.g700} />
      </button>
    </div>
  );
}

export function CreateMeetingModal({ conv, isMobile, onClose, onCreate, onToast }: {
  conv: any; isMobile: boolean; onClose: () => void;
  onCreate: (convId: string, d: any) => void; onToast: (msg: string, icon?: string) => void;
}) {
  const [mode, setMode] = React.useState('agendar');
  const [title, setTitle] = React.useState('Apresentação do imóvel e condições');
  const [date, setDate] = React.useState('');
  const [time, setTime] = React.useState('');
  const [dur, setDur] = React.useState('30 min');
  const link = 'meet.google.com/ds-' + conv.id.slice(0, 3) + '-meet';

  const submit = () => {
    onCreate(conv.id, { mode, title, date, time, dur, link });
    onToast(mode === 'agora' ? 'Reunião iniciada · link enviado' : 'Reunião agendada · link enviado', 'video');
    onClose();
  };

  const field = (label: string, node: React.ReactNode) => (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: pal.g500, marginBottom: 6 }}>{label}</div>
      {node}
    </div>
  );
  const inputSt: React.CSSProperties = { width: '100%', border: `1px solid ${pal.g300}`, borderRadius: 10, padding: '10px 12px', fontFamily: 'var(--font-body)', fontSize: 14, color: pal.ink, outline: 'none', background: '#fff' };

  return (
    <ModalShell isMobile={isMobile} onClose={onClose}>
      <ModalHeader title="Reunião online" sub={`Com ${conv.name} · ${conv.property.title}`} onClose={onClose} />
      <div style={{ flex: 1, overflowY: 'auto', padding: 18 }}>
        {/* external notice */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: pal.lilac1, border: `1px solid ${pal.lilac2}`, borderRadius: 12, padding: '11px 13px', marginBottom: 16 }}>
          <MeetMark />
          <span style={{ fontSize: 12.5, color: pal.g700, lineHeight: 1.45 }}>A chamada acontece no <strong>Google Meet</strong> (externo). A gravação e o resumo ficam registrados aqui no lead.</span>
        </div>
        {/* mode segmented */}
        <div style={{ display: 'flex', gap: 6, background: pal.g100, borderRadius: 12, padding: 4, marginBottom: 16 }}>
          {[['agora', 'Iniciar agora', 'play'], ['agendar', 'Agendar', 'calendar']].map(([k, lbl, ic]) => {
            const on = mode === k;
            return (
              <button key={k} onClick={() => setMode(k)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, border: 'none', borderRadius: 9, padding: '9px 12px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13.5, background: on ? '#fff' : 'transparent', color: on ? pal.primary : pal.g500, boxShadow: on ? 'var(--shadow-sm)' : 'none' }}>
                <Ic n={ic} s={16} c={on ? pal.primary : pal.g500} /> {lbl}
              </button>
            );
          })}
        </div>
        {/* title */}
        <div style={{ marginBottom: 16 }}>
          {field('Assunto', <input value={title} onChange={(e: any) => setTitle(e.target.value)} style={inputSt} />)}
        </div>
        {/* schedule fields */}
        {mode === 'agendar' && (
          <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
            {field('Data', <input type="date" value={date} onChange={(e: any) => setDate(e.target.value)} style={inputSt} />)}
            {field('Hora', <input type="time" value={time} onChange={(e: any) => setTime(e.target.value)} style={inputSt} />)}
            {field('Duração', (
              <select value={dur} onChange={(e: any) => setDur(e.target.value)} style={inputSt}>
                {['15 min', '30 min', '45 min', '60 min'].map(d => <option key={d}>{d}</option>)}
              </select>
            ))}
          </div>
        )}
        {/* link box */}
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: pal.g500, marginBottom: 6 }}>Link do Google Meet</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, border: `1px solid ${pal.g300}`, borderRadius: 12, padding: '10px 12px' }}>
          <Ic n="link" s={17} c={pal.g500} />
          <span style={{ flex: 1, minWidth: 0, fontSize: 13.5, color: pal.ink, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{link}</span>
          <button onClick={() => copyLink(link, onToast)} title="Copiar link" style={{ display: 'flex', alignItems: 'center', gap: 5, border: `1px solid ${pal.g300}`, background: '#fff', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: 600, color: pal.g700 }}>
            <Ic n="copy" s={14} c={pal.g700} /> Copiar
          </button>
          <a href={'https://' + link} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 5, border: 'none', background: pal.g100, borderRadius: 8, padding: '7px 10px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: 600, color: pal.primary, textDecoration: 'none' }}>
            <Ic n="external-link" s={14} c={pal.primary} /> Abrir
          </a>
        </div>
      </div>
      {/* footer */}
      <div style={{ display: 'flex', gap: 10, padding: '14px 18px', borderTop: `1px solid ${pal.g100}`, flexShrink: 0 }}>
        <button onClick={onClose} style={{ border: `1px solid ${pal.g300}`, background: '#fff', borderRadius: 11, padding: '11px 16px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14, color: pal.g700 }}>Cancelar</button>
        <button onClick={submit} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, border: 'none', background: pal.primary, color: '#fff', borderRadius: 11, padding: '11px 16px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 14, boxShadow: 'var(--shadow-purple)' }}>
          <Ic n="message-circle" s={17} c="#fff" /> Enviar link pelo WhatsApp
        </button>
      </div>
    </ModalShell>
  );
}
