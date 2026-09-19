"use client";
import * as React from "react";
import CeoChrome, { ceoPalette, CIc } from "@/components/ceo/CeoChrome";
import { demo } from "@/config/demo";
const { useState, useEffect, useRef, useMemo, useCallback } = React;

const { useState: useStateLd } = React;

const ld: any = {
  ...ceoPalette,
  info: '#3E82E0', infoBg: '#E5EEFB',
  successBg: '#E6F4EC', warnBg: '#FBF1DC', errBg: '#FAE5E5',
  p3: '#818CF8',
};
const ldCard = { background: '#fff', border: `1px solid ${ld.g300}`, borderRadius: 16 };
const ldSecLabel = { fontSize: 11.5, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: ld.g500, margin: '0 0 12px' } as React.CSSProperties;

function LdBadge({ text, fg, bg }: any) {
  return <span style={{ fontSize: 12, fontWeight: 700, color: fg, background: bg, borderRadius: 999, padding: '3px 10px', whiteSpace: 'nowrap' }}>{text}</span>;
}
function LdHead({ title, sub, right }: any) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
      <div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: ld.ink }}>{title}</div>
        {sub && <div style={{ fontSize: 13, color: ld.g500, marginTop: 2 }}>{sub}</div>}
      </div>
      {right}
    </div>
  );
}

const STATUS_TONE: any = {
  'Novo (na fila)': [ld.info, ld.infoBg], 'Distribuído': [ld.p3, '#E0E7FF'], 'Em atendimento': [ld.primary, ld.lilac2],
  'Qualificado': [ld.p3, '#E0E7FF'], 'Visita': [ld.warning, ld.warnBg], 'Proposta': [ld.info, ld.infoBg], 'Fechado': [ld.success, ld.successBg], 'Perdido': [ld.error, ld.errBg],
};
const SLA_TONE: any = { 'No prazo': [ld.success, ld.successBg], 'Estourado': [ld.error, ld.errBg], 'Redistribuído': [ld.primary, ld.lilac2] };

/* ---------------- DATA ---------------- */
const LEADS: any[] = [
  { id: 'l1', name: 'Maria S.', origem: 'Portal ZAP', interesse: 'Apto 2q · Boa Viagem', status: 'Em atendimento', unit: `${demo.nomeCurto} Boa Viagem`, broker: 'Lucas F.', time: '2h', sla: 'No prazo' },
  { id: 'l2', name: 'João P.', origem: 'Meta Ads', interesse: 'Sala comercial', status: 'Novo (na fila)', unit: '—', broker: '', time: '3 min', sla: 'No prazo' },
  { id: 'l3', name: 'Carla D.', origem: `Chatbot ${demo.nomeCurto}`, interesse: 'Casa Candeias', status: 'Qualificado', unit: `${demo.nomeCurto} Recife Centro`, broker: 'Renata A.', time: '1d', sla: 'No prazo' },
  {
    id: 'l4', name: 'Pedro N.', origem: 'Portal VivaReal', interesse: 'Apto · Pina', status: 'Em atendimento', unit: `${demo.nomeCurto} Caruaru`, broker: 'Bruno T.', time: '22 min', sla: 'Redistribuído',
    phone: '(81) 9XXXX-3344', email: 'pedro.n****@example.com', tipo: 'Apartamento', regiao: 'Pina · Recife/PE', faixa: 'R$ 400 mil – R$ 600 mil', msg: 'Tenho interesse no apto de 2 quartos no Pina. Pode me passar mais fotos e agendar visita?',
    campanha: 'VivaReal · Recife Destaque', entrada: '08/06/2026 · 14:32',
    timeline: [
      { t: '14:32', d: 'Lead recebido no pool · origem Portal VivaReal', ic: 'inbox' },
      { t: '14:32', d: `1ª atribuição → ${demo.nomeCurto} Pina · Felipe A. (regra: Região)`, ic: 'user' },
      { t: '14:47', d: 'SLA de 15 min estourado, sem 1ª resposta', ic: 'alarm-clock', warn: true },
      { t: '14:47', d: `Redistribuído → ${demo.nomeCurto} Caruaru · Bruno T. (regra: Região + Rodízio)`, ic: 'shuffle', ok: true },
    ],
  },
  { id: 'l5', name: 'Ana L.', origem: 'Indicação', interesse: 'Cobertura · Boa Viagem', status: 'Visita', unit: `${demo.nomeCurto} Boa Viagem`, broker: 'Lucas F.', time: '3d', sla: 'No prazo' },
];

/* ---------------- SUMMARY ---------------- */
function LdSummary() {
  const cards = [
    { l: 'Leads no período', v: '1.480', ic: 'inbox', hl: true },
    { l: 'Na fila (não distribuídos)', v: '12', ic: 'clock', tone: ld.warning },
    { l: 'Tempo médio 1ª resposta', v: '9 min', ic: 'timer', tone: ld.primary },
    { l: 'Conversão (lead→fechado)', v: '6,2%', ic: 'target', tone: ld.success },
    { l: 'Custo por lead (CPL)', v: 'R$ 35', ic: 'banknote', tone: ld.primary },
    { l: 'Redistribuídos (SLA)', v: '47', sub: '3,2%', ic: 'shuffle', tone: ld.error },
  ];
  return (
    <div className="ld-summary">
      {cards.map(c => (
        <div key={c.l} style={{ background: c.hl ? `linear-gradient(135deg, ${ld.primary}, ${ld.deep})` : '#fff', border: c.hl ? 'none' : `1px solid ${ld.g300}`, borderRadius: 14, padding: 15, boxShadow: c.hl ? 'var(--shadow-purple)' : 'none', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 30, height: 30, borderRadius: 8, background: c.hl ? 'rgba(255,255,255,.18)' : ld.lilac2, display: 'grid', placeItems: 'center', flexShrink: 0 }}><CIc n={c.ic} s={15} c={c.hl ? '#fff' : ((c as any).tone || ld.primary)} /></span>
            <span style={{ fontSize: 11.5, fontWeight: 600, color: c.hl ? 'rgba(255,255,255,.85)' : ld.g500, lineHeight: 1.25 }}>{c.l}</span>
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 21, lineHeight: 1.15, color: c.hl ? '#fff' : ld.ink, marginTop: 11 }}>{c.v}{(c as any).sub && <span style={{ fontSize: 12, fontWeight: 600, color: c.hl ? 'rgba(255,255,255,.7)' : ld.g500 }}> · {(c as any).sub}</span>}</div>
        </div>
      ))}
    </div>
  );
}

/* ---------------- FUNNEL ---------------- */
function LdFunnel() {
  const max = 1480;
  const stages = [
    { l: 'Novo', v: 1480, c: ld.p4 || '#C79BDD' }, { l: 'Distribuído', v: 1468, c: ld.p3 }, { l: 'Em atendimento', v: 1190, c: ld.light },
    { l: 'Qualificado', v: 540, c: ld.primary }, { l: 'Visita', v: 250, c: ld.dark }, { l: 'Proposta', v: 132, c: ld.deep }, { l: 'Fechado', v: 92, c: ld.success },
  ];
  return (
    <div style={{ ...ldCard, padding: 22 }}>
      <LdHead title="Funil de leads" sub="Volume e conversão entre etapas" right={<LdBadge text="Perdido: 1.376 saídas" fg={ld.error} bg={ld.errBg} />} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        {stages.map((s, i) => {
          const w = 16 + (s.v / max) * 84;
          const conv = i > 0 ? Math.round((s.v / stages[i - 1].v) * 100) : 100;
          return (
            <div key={s.l} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 110, textAlign: 'right', flexShrink: 0, fontSize: 13, fontWeight: 600, color: ld.ink }}>{s.l}</div>
              <div style={{ flex: 1, display: 'grid', placeItems: 'center start' }}>
                <div style={{ width: `${w}%`, height: 32, background: s.c, borderRadius: 8, display: 'flex', alignItems: 'center', paddingLeft: 12, color: '#fff', fontWeight: 700, fontSize: 13 }}>{s.v.toLocaleString('pt-BR')}</div>
              </div>
              <div style={{ width: 46, textAlign: 'right', flexShrink: 0, fontSize: 12, color: i > 0 ? ld.g500 : 'transparent' }}>{i > 0 ? `${conv}%` : '—'}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- ORIGEM & ROI ---------------- */
function LdOrigin() {
  const channels = [
    { l: 'Portais (ZAP/VivaReal/OLX)', vol: 540, conv: '5,1%', cpl: 'R$ 46', ic: 'globe' },
    { l: 'Anúncios (Meta/Google)', vol: 420, conv: '4,8%', cpl: 'R$ 52', ic: 'megaphone' },
    { l: `Chatbot / site ${demo.nomeCurto}`, vol: 300, conv: '8,5%', cpl: 'R$ 12', ic: 'message-circle', good: true },
    { l: 'QR / materiais (corretores)', vol: 140, conv: '9,2%', cpl: 'R$ 8', ic: 'qr-code', good: true },
    { l: 'Indicação', vol: 80, conv: '14%', cpl: 'R$ 0', ic: 'users', good: true },
  ];
  return (
    <div style={{ ...ldCard, padding: 22 }}>
      <LdHead title="Origem & ROI" sub="Canal próprio e indicação convertem mais e custam menos" />
      <div className="ld-origin-wrap" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 520 }}>
          <thead><tr>
            {['Canal', 'Leads', 'Conversão', 'CPL'].map((h, i) => <th key={h} style={{ textAlign: i === 0 ? 'left' : 'right', fontSize: 11, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: ld.g500, padding: '0 12px 12px', borderBottom: `1px solid ${ld.g300}`, whiteSpace: 'nowrap' } as React.CSSProperties}>{h}</th>)}
          </tr></thead>
          <tbody>
            {channels.map(c => (
              <tr key={c.l} style={{ borderBottom: `1px solid ${ld.g100}`, background: c.good ? ld.successBg + '66' : '#fff' }}>
                <td style={{ padding: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ width: 32, height: 32, borderRadius: 8, background: c.good ? '#fff' : ld.lilac2, display: 'grid', placeItems: 'center', flexShrink: 0 }}><CIc n={c.ic} s={16} c={c.good ? ld.success : ld.primary} /></span>
                    <span style={{ fontSize: 13.5, fontWeight: 600, color: ld.ink }}>{c.l}</span>
                  </div>
                </td>
                <td style={{ padding: '12px', textAlign: 'right', fontSize: 14, fontWeight: 600, color: ld.ink }}>{c.vol}</td>
                <td style={{ padding: '12px', textAlign: 'right', fontSize: 14, fontWeight: 700, color: c.good ? ld.success : ld.g700 }}>{c.conv}</td>
                <td style={{ padding: '12px', textAlign: 'right', fontSize: 14, fontWeight: 700, color: c.good ? ld.success : ld.g700 }}>{c.cpl}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------------- DISTRIBUTION RULES ---------------- */
function Toggle({ on, onClick }: any) {
  return (
    <button onClick={onClick} style={{ width: 40, height: 23, borderRadius: 999, border: 'none', background: on ? ld.success : ld.g300, position: 'relative', cursor: 'pointer', flexShrink: 0, transition: 'background .15s ease' }}>
      <span style={{ position: 'absolute', top: 3, left: on ? 20 : 3, width: 17, height: 17, borderRadius: '50%', background: '#fff', transition: 'left .15s ease' }} />
    </button>
  );
}
function LdRules() {
  const [rules, setRules] = useStateLd([
    { name: 'Região', on: true }, { name: 'Plano / tier', on: true }, { name: 'Desempenho (Score)', on: true }, { name: 'Disponibilidade', on: true }, { name: 'Rodízio', on: true },
  ]);
  const [sla, setSla] = useStateLd('15');
  const [byPlan, setByPlan] = useStateLd(true);
  const move = (i: any, dir: any) => setRules((r: any) => { const a = [...r]; const j = i + dir; if (j < 0 || j >= a.length) return r; [a[i], a[j]] = [a[j], a[i]]; return a; });
  const toggle = (i: any) => setRules((r: any) => r.map((x: any, j: any) => j === i ? { ...x, on: !x.on } : x));
  const mapRows = [['Boa Viagem', `${demo.nomeCurto} Boa Viagem`], ['Pina', `${demo.nomeCurto} Boa Viagem`], ['Centro', `${demo.nomeCurto} Recife Centro`], ['Caruaru', `${demo.nomeCurto} Caruaru`]];
  return (
    <div style={{ ...ldCard, padding: 22 }}>
      <LdHead title="Regras de distribuição" sub="Configure a lógica do motor, sem código" right={<button style={{ display: 'flex', alignItems: 'center', gap: 7, border: 'none', background: ld.primary, color: '#fff', borderRadius: 10, padding: '9px 16px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 13.5, boxShadow: 'var(--shadow-purple)' }}><CIc n="save" s={16} c="#fff" /> Salvar regras</button>} />
      <div className="ld-rules-grid">
        {/* ordem das regras */}
        <div>
          <div style={ldSecLabel}>Ordem de prioridade</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {rules.map((r: any, i: any) => (
              <div key={r.name} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '10px 12px', background: ld.page, border: `1px solid ${ld.g300}`, borderRadius: 11 }}>
                <CIc n="grip-vertical" s={16} c={ld.g300} />
                <span style={{ width: 22, height: 22, borderRadius: 6, background: ld.lilac2, color: ld.primary, fontSize: 12, fontWeight: 700, display: 'grid', placeItems: 'center', flexShrink: 0 }}>{i + 1}</span>
                <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600, color: r.on ? ld.ink : ld.g500 }}>{r.name}</span>
                <div style={{ display: 'flex', gap: 2 }}>
                  <button onClick={() => move(i, -1)} disabled={i === 0} style={{ width: 26, height: 26, border: `1px solid ${ld.g300}`, background: '#fff', borderRadius: 7, display: 'grid', placeItems: 'center', cursor: i === 0 ? 'default' : 'pointer', opacity: i === 0 ? 0.4 : 1 }}><CIc n="chevron-up" s={14} c={ld.g700} /></button>
                  <button onClick={() => move(i, 1)} disabled={i === rules.length - 1} style={{ width: 26, height: 26, border: `1px solid ${ld.g300}`, background: '#fff', borderRadius: 7, display: 'grid', placeItems: 'center', cursor: i === rules.length - 1 ? 'default' : 'pointer', opacity: i === rules.length - 1 ? 0.4 : 1 }}><CIc n="chevron-down" s={14} c={ld.g700} /></button>
                </div>
                <Toggle on={r.on} onClick={() => toggle(i)} />
              </div>
            ))}
          </div>
        </div>
        {/* SLA + prioridade + mapa */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <div style={ldSecLabel}>SLA de 1ª resposta</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: ld.page, border: `1px solid ${ld.g300}`, borderRadius: 11, padding: '10px 14px' }}>
              <CIc n="timer" s={18} c={ld.primary} />
              <input value={sla} onChange={e => setSla(e.target.value.replace(/\D/g, ''))} style={{ width: 44, border: `1px solid ${ld.g300}`, borderRadius: 8, padding: '6px 8px', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 700, color: ld.ink, textAlign: 'center', outline: 'none' }} />
              <span style={{ fontSize: 13.5, color: ld.g700 }}>minutos</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 7, marginTop: 8, fontSize: 12, color: ld.g500, lineHeight: 1.45 }}>
              <CIc n="corner-down-right" s={14} c={ld.g500} style={{ marginTop: 1, flexShrink: 0 }} /> Ao estourar: redistribuir para o próximo elegível.
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: ld.lilac1, border: `1px solid ${ld.lilac2}`, borderRadius: 11, padding: '12px 14px' }}>
            <CIc n="crown" s={18} c={ld.primary} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: ld.ink }}>Prioridade por plano</div>
              <div style={{ fontSize: 12, color: ld.g500 }}>Franquia/Premium e Corretor Pro recebem antes</div>
            </div>
            <Toggle on={byPlan} onClick={() => setByPlan((v: any) => !v)} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ ...ldSecLabel, margin: 0 }}>Mapa região → unidade</span>
              <button style={{ display: 'flex', alignItems: 'center', gap: 5, border: `1px solid ${ld.g300}`, background: '#fff', color: ld.primary, borderRadius: 9, padding: '5px 10px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 12 }}><CIc n="plus" s={13} c={ld.primary} /> Adicionar regra</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {mapRows.map(([r, u]) => (
                <div key={r} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: ld.g700, padding: '8px 12px', background: ld.page, borderRadius: 9 }}>
                  <CIc n="map-pin" s={14} c={ld.g500} /><span style={{ fontWeight: 600, color: ld.ink }}>{r}</span>
                  <CIc n="arrow-right" s={14} c={ld.g300} style={{ marginLeft: 'auto' }} /><span>{u}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- SELECT ---------------- */
function LdSelect({ value, onChange, options, icon }: any) {
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      {icon && <span style={{ position: 'absolute', left: 12, pointerEvents: 'none', display: 'flex' }}><CIc n={icon} s={15} c={ld.g500} /></span>}
      <select value={value} onChange={e => onChange(e.target.value)} style={{ appearance: 'none', WebkitAppearance: 'none', border: `1px solid ${ld.g300}`, background: '#fff', borderRadius: 10, padding: icon ? '9px 32px 9px 34px' : '9px 32px 9px 13px', fontFamily: 'var(--font-body)', fontSize: 13.5, fontWeight: 600, color: ld.ink, cursor: 'pointer', outline: 'none' } as React.CSSProperties}>
        {options.map((o: any) => <option key={o} value={o}>{o}</option>)}
      </select>
      <span style={{ position: 'absolute', right: 11, pointerEvents: 'none', display: 'flex' }}><CIc n="chevron-down" s={15} c={ld.g500} /></span>
    </div>
  );
}

/* ---------------- LEADS TABLE ---------------- */
function LdTable({ onSelect }: any) {
  const [q, setQ] = useStateLd('');
  const [fOrigem, setFOrigem] = useStateLd('Todas as origens');
  const [fStatus, setFStatus] = useStateLd('Todos os status');
  const rows = LEADS.filter(l =>
    (q === '' || (l.name + l.interesse + l.broker).toLowerCase().includes(q.toLowerCase())) &&
    (fOrigem === 'Todas as origens' || l.origem === fOrigem) &&
    (fStatus === 'Todos os status' || l.status === fStatus)
  );
  const cols = ['Lead', 'Origem', 'Interesse', 'Status', 'Atribuído a', 'Tempo', 'SLA'];
  return (
    <div style={{ ...ldCard, padding: 22 }}>
      <LdHead title="Leads" sub={`${rows.length} de ${LEADS.length} leads`} />
      <div className="ld-filters">
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: ld.g100, borderRadius: 10, padding: '0 13px', height: 40, flex: 1, minWidth: 180 }}>
          <CIc n="search" s={17} c={ld.g500} />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar lead, interesse, corretor…" style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontFamily: 'var(--font-body)', fontSize: 13.5, color: ld.ink }} />
        </div>
        <LdSelect icon="radio" value={fOrigem} onChange={setFOrigem} options={['Todas as origens', 'Portal ZAP', 'Portal VivaReal', 'Meta Ads', `Chatbot ${demo.nomeCurto}`, 'Indicação']} />
        <LdSelect icon="activity" value={fStatus} onChange={setFStatus} options={['Todos os status', 'Novo (na fila)', 'Em atendimento', 'Qualificado', 'Visita']} />
      </div>

      {/* desktop table */}
      <div className="ld-table-wrap" style={{ overflowX: 'auto', marginTop: 18 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
          <thead><tr>
            {cols.map(h => <th key={h} style={{ textAlign: 'left', fontSize: 11, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: ld.g500, padding: '0 12px 12px', borderBottom: `1px solid ${ld.g300}`, whiteSpace: 'nowrap' } as React.CSSProperties}>{h}</th>)}
          </tr></thead>
          <tbody>
            {rows.map(l => {
              const [stFg, stBg] = STATUS_TONE[l.status] || [ld.g500, ld.g100];
              const [slFg, slBg] = SLA_TONE[l.sla];
              return (
                <tr key={l.id} onClick={() => onSelect(l)} style={{ borderBottom: `1px solid ${ld.g100}`, cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = ld.lilac1}
                  onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                  <td style={{ padding: '13px 12px', fontSize: 14, fontWeight: 600, color: ld.ink, whiteSpace: 'nowrap' }}>{l.name}</td>
                  <td style={{ padding: '13px 12px', fontSize: 13, color: ld.g700, whiteSpace: 'nowrap' }}>{l.origem}</td>
                  <td style={{ padding: '13px 12px', fontSize: 13.5, color: ld.g700, whiteSpace: 'nowrap' }}>{l.interesse}</td>
                  <td style={{ padding: '13px 12px' }}><LdBadge text={l.status} fg={stFg} bg={stBg} /></td>
                  <td style={{ padding: '13px 12px', fontSize: 13, color: l.unit === '—' ? ld.g300 : ld.g700, whiteSpace: 'nowrap' }}>{l.unit === '—' ? '—' : `${l.unit} · ${l.broker}`}</td>
                  <td style={{ padding: '13px 12px', fontSize: 13, color: ld.g500, whiteSpace: 'nowrap' }}>{l.time}</td>
                  <td style={{ padding: '13px 12px' }}><LdBadge text={l.sla} fg={slFg} bg={slBg} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* mobile cards */}
      <div className="ld-table-cards" style={{ marginTop: 18, flexDirection: 'column', gap: 12 }}>
        {rows.map(l => {
          const [stFg, stBg] = STATUS_TONE[l.status] || [ld.g500, ld.g100];
          const [slFg, slBg] = SLA_TONE[l.sla];
          return (
            <button key={l.id} onClick={() => onSelect(l)} style={{ ...ldCard, background: ld.page, padding: 16, textAlign: 'left', cursor: 'pointer', fontFamily: 'var(--font-body)', width: '100%' } as React.CSSProperties}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 14.5, fontWeight: 600, color: ld.ink }}>{l.name}</span>
                <LdBadge text={l.sla} fg={slFg} bg={slBg} />
              </div>
              <div style={{ fontSize: 12.5, color: ld.g500, marginBottom: 10 }}>{l.origem} · {l.interesse}</div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                <LdBadge text={l.status} fg={stFg} bg={stBg} />
                <span style={{ fontSize: 12.5, color: ld.g700 }}>{l.unit === '—' ? 'na fila' : `${l.unit} · ${l.broker}`}</span>
                <span style={{ fontSize: 12, color: ld.g500, marginLeft: 'auto' }}>{l.time}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- PERFORMANCE & SLA ---------------- */
function LdPerformance() {
  const rows = [
    { u: `${demo.nomeCurto} Boa Viagem`, recv: 420, resp: '7 min', conv: '7,1%', stuck: 2 },
    { u: `${demo.nomeCurto} Recife Centro`, recv: 360, resp: '11 min', conv: '5,8%', stuck: 5 },
    { u: `${demo.nomeCurto} Caruaru`, recv: 240, resp: '14 min', conv: '4,9%', stuck: 8 },
    { u: 'Corretores independentes', recv: 180, resp: '9 min', conv: '6,5%', stuck: 1 },
    { u: 'Demais unidades', recv: 268, resp: '10 min', conv: '5,5%', stuck: 4 },
  ];
  return (
    <div style={{ ...ldCard, padding: 22 }}>
      <LdHead title="Desempenho & SLA da distribuição" sub="Por unidade / corretor" />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: ld.warnBg, border: `1px solid ${ld.warning}55`, borderRadius: 12, padding: '12px 16px', marginBottom: 16, flexWrap: 'wrap' }}>
        <CIc n="alert-triangle" s={18} c={ld.warning} />
        <span style={{ flex: 1, fontSize: 13, color: ld.g700, minWidth: 200 }}><strong style={{ color: ld.ink }}>12 leads na fila</strong> aguardando distribuição · <strong style={{ color: ld.error }}>6 leads</strong> a menos de 3 min de estourar o SLA</span>
        <button style={{ display: 'flex', alignItems: 'center', gap: 7, border: 'none', background: ld.primary, color: '#fff', borderRadius: 10, padding: '9px 14px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 13 }}><CIc n="zap" s={15} c="#fff" /> Redistribuir agora</button>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
          <thead><tr>
            {['Unidade / corretor', 'Recebidos', '1ª resposta', 'Conversão', 'Parados'].map((h, i) => <th key={h} style={{ textAlign: i === 0 ? 'left' : 'right', fontSize: 11, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: ld.g500, padding: '0 12px 12px', borderBottom: `1px solid ${ld.g300}`, whiteSpace: 'nowrap' } as React.CSSProperties}>{h}</th>)}
          </tr></thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.u} style={{ borderBottom: `1px solid ${ld.g100}` }}>
                <td style={{ padding: '12px', fontSize: 13.5, fontWeight: 600, color: ld.ink, whiteSpace: 'nowrap' }}>{r.u}</td>
                <td style={{ padding: '12px', textAlign: 'right', fontSize: 14, color: ld.g700 }}>{r.recv}</td>
                <td style={{ padding: '12px', textAlign: 'right', fontSize: 14, color: parseInt(r.resp) > 12 ? ld.warning : ld.g700, fontWeight: parseInt(r.resp) > 12 ? 700 : 400 }}>{r.resp}</td>
                <td style={{ padding: '12px', textAlign: 'right', fontSize: 14, fontWeight: 600, color: ld.ink }}>{r.conv}</td>
                <td style={{ padding: '12px', textAlign: 'right' }}><span style={{ fontSize: 13, fontWeight: 700, color: r.stuck >= 5 ? ld.error : r.stuck > 0 ? ld.warning : ld.success }}>{r.stuck}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------------- DRAWER SHELL ---------------- */
function LdDrawer({ open, onClose, children, width = 520 }: any) {
  return (
    <React.Fragment>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(28,26,34,.45)', zIndex: 80, opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none', transition: 'opacity .2s ease' }} />
      <div className="ld-drawer" style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width, maxWidth: '100vw', background: '#fff', zIndex: 81, boxShadow: 'var(--shadow-lg)', transform: open ? 'translateX(0)' : 'translateX(100%)', transition: 'transform .26s cubic-bezier(.2,.7,.3,1)', display: 'flex', flexDirection: 'column' } as React.CSSProperties}>
        {open && children}
      </div>
    </React.Fragment>
  );
}
function LdField({ l, v, tone }: any) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, padding: '9px 0', borderBottom: `1px solid ${ld.g100}` }}>
      <span style={{ fontSize: 13, color: ld.g500, flexShrink: 0 }}>{l}</span>
      <span style={{ fontSize: 13.5, fontWeight: 600, color: tone || ld.ink, textAlign: 'right' }}>{v}</span>
    </div>
  );
}

/* ---------------- LEAD DRAWER ---------------- */
function LdLead({ lead, onClose }: any) {
  if (!lead) return null;
  const l = lead;
  const [stFg, stBg] = STATUS_TONE[l.status] || [ld.g500, ld.g100];
  const [slFg, slBg] = SLA_TONE[l.sla];
  return (
    <React.Fragment>
      <div style={{ padding: '20px 24px', borderBottom: `1px solid ${ld.g300}` }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <span style={{ width: 46, height: 46, borderRadius: '50%', background: `linear-gradient(135deg, ${ld.light}, ${ld.deep})`, color: '#fff', fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-display)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>{l.name.split(' ').map((p: any) => p[0]).slice(0, 2).join('')}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: ld.ink, lineHeight: 1.2 }}>{l.name}</div>
            <div style={{ fontSize: 12.5, color: ld.g500, marginTop: 2 }}>{l.origem} · {l.interesse}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 7 }}>
              <LdBadge text={l.status} fg={stFg} bg={stBg} />
              <LdBadge text={l.sla} fg={slFg} bg={slBg} />
            </div>
          </div>
          <button onClick={onClose} style={{ width: 34, height: 34, border: `1px solid ${ld.g300}`, background: '#fff', borderRadius: 9, display: 'grid', placeItems: 'center', cursor: 'pointer', flexShrink: 0 }}><CIc n="x" s={18} c={ld.g700} /></button>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <button style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, border: 'none', background: ld.primary, color: '#fff', borderRadius: 10, padding: '10px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 13.5 }}><CIc n="shuffle" s={16} c="#fff" /> Redistribuir</button>
          <button style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, border: `1px solid ${ld.g300}`, background: '#fff', color: ld.g700, borderRadius: 10, padding: '10px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13.5 }}><CIc n="message-circle" s={16} c={ld.g700} /> Ver conversa</button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
        <div style={{ marginBottom: 22 }}>
          <div style={ldSecLabel}>Contato</div>
          <LdField l="Telefone" v={l.phone || '—'} />
          <LdField l="E-mail" v={l.email || '—'} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 8, fontSize: 11.5, color: ld.g500 }}><CIc n="lock" s={13} c={ld.g500} /> Dado pessoal (LGPD) · acesso registrado.</div>
        </div>

        <div style={{ marginBottom: 22 }}>
          <div style={ldSecLabel}>Interesse</div>
          <LdField l="Tipo" v={l.tipo || '—'} />
          <LdField l="Região" v={l.regiao || '—'} />
          <LdField l="Faixa de preço" v={l.faixa || '—'} />
          {l.msg && <div style={{ marginTop: 12, fontSize: 13.5, color: ld.g700, lineHeight: 1.55, background: ld.page, borderRadius: 10, padding: '12px 14px', fontStyle: 'italic' }}>“{l.msg}”</div>}
        </div>

        <div style={{ marginBottom: 22 }}>
          <div style={ldSecLabel}>Origem</div>
          <LdField l="Canal" v={l.origem} />
          <LdField l="Campanha" v={l.campanha || '—'} />
          <LdField l="Entrada" v={l.entrada || '—'} />
        </div>

        {l.timeline && (
          <div style={{ marginBottom: 22 }}>
            <div style={ldSecLabel}>Distribuição</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {l.timeline.map((e: any, i: any) => (
                <div key={i} style={{ display: 'flex', gap: 12 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ width: 30, height: 30, borderRadius: '50%', background: e.warn ? ld.errBg : e.ok ? ld.successBg : ld.lilac2, display: 'grid', placeItems: 'center', flexShrink: 0 }}><CIc n={e.ic} s={15} c={e.warn ? ld.error : e.ok ? ld.success : ld.primary} /></span>
                    {i < l.timeline.length - 1 && <span style={{ width: 1, flex: 1, background: ld.g300, marginTop: 2 }} />}
                  </div>
                  <div style={{ paddingBottom: 14 }}>
                    <div style={{ fontSize: 13, color: ld.ink, lineHeight: 1.4 }}>{e.d}</div>
                    <div style={{ fontSize: 12, color: ld.g500 }}>{e.t}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <div style={ldSecLabel}>Funil</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: ld.page, borderRadius: 11, padding: '12px 14px' }}>
            <LdBadge text={l.status} fg={stFg} bg={stBg} />
            <span style={{ fontSize: 13, color: ld.g500 }}>há {l.time}</span>
          </div>
        </div>
      </div>

      <div style={{ padding: '14px 24px', borderTop: `1px solid ${ld.g300}`, display: 'flex', gap: 10 }}>
        <button style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, border: `1px solid ${ld.g300}`, background: '#fff', color: ld.g700, borderRadius: 10, padding: '11px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13 }}><CIc n="shuffle" s={15} c={ld.g700} /> Redistribuir</button>
        <button style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, border: `1px solid ${ld.g300}`, background: '#fff', color: ld.g700, borderRadius: 10, padding: '11px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13 }}><CIc n="message-circle" s={15} c={ld.g700} /> Conversa</button>
        <button style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, border: `1px solid ${ld.g300}`, background: '#fff', color: ld.g700, borderRadius: 10, padding: '11px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13 }}><CIc n="refresh-cw" s={15} c={ld.g700} /> Status</button>
      </div>
    </React.Fragment>
  );
}

/* ---------------- PERIOD ---------------- */
function LdPeriod() {
  const [p, setP] = useStateLd('Este mês');
  const periods = ['Este mês', 'Trimestre', 'Ano'];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <CIc n="calendar" s={16} c={ld.g500} />
      <div style={{ display: 'flex', background: ld.g100, borderRadius: 999, padding: 3 }}>
        {periods.map(x => <button key={x} onClick={() => setP(x)} style={{ border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, padding: '7px 14px', borderRadius: 999, background: p === x ? '#fff' : 'transparent', color: p === x ? ld.primary : ld.g500, boxShadow: p === x ? 'var(--shadow-sm)' : 'none' }}>{x}</button>)}
      </div>
    </div>
  );
}

/* ---------------- PAGE ---------------- */
function LeadsPage() {
  const [selected, setSelected] = useStateLd(null);
  return (
    <CeoChrome>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 30, letterSpacing: '-0.02em', margin: 0, color: ld.ink }}>Leads &amp; Distribuição</h1>
          <div style={{ fontSize: 13.5, color: ld.g500, marginTop: 4 }}>O motor de leads da rede: origem, funil e distribuição</div>
        </div>
        <LdPeriod />
      </div>

      <LdSummary />
      <LdFunnel />
      <LdOrigin />
      <LdRules />
      <LdTable onSelect={setSelected} />
      <LdPerformance />

      <LdDrawer open={!!selected} onClose={() => setSelected(null)}>
        <LdLead lead={selected} onClose={() => setSelected(null)} />
      </LdDrawer>
    </div>
    </CeoChrome>
  );
}

export default LeadsPage;
