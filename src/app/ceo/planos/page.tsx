"use client";
import * as React from "react";
import CeoChrome, { ceoPalette, CIc } from "@/components/ceo/CeoChrome";
import { demo } from "@/config/demo";
const { useState, useEffect, useRef, useMemo, useCallback } = React;
const { useState: useStatePl } = React;

const pl: any = {
  ...ceoPalette,
  info: '#3E82E0', infoBg: '#E5EEFB',
  successBg: '#E6F4EC', warnBg: '#FBF1DC', errBg: '#FAE5E5',
  p3: '#818CF8',
};
const plCard = { background: '#fff', border: `1px solid ${pl.g300}`, borderRadius: 16 };
const plSecLabel = { fontSize: 11.5, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: pl.g500, margin: '0 0 12px' } as React.CSSProperties;

const PL_TYPE: any = { Franquia: pl.primary, Associado: pl.info, Corretor: pl.p3 };
const PL_STATUS: any = { 'Ativo': [pl.success, pl.successBg], 'Em atraso': [pl.error, pl.errBg], 'Cancelado': [pl.g500, pl.g100] };

function PlBadge({ text, fg, bg }: any) {
  return <span style={{ fontSize: 12, fontWeight: 700, color: fg, background: bg, borderRadius: 999, padding: '3px 10px', whiteSpace: 'nowrap' }}>{text}</span>;
}
function PlHead({ title, sub, right }: any) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
      <div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: pl.ink }}>{title}</div>
        {sub && <div style={{ fontSize: 13, color: pl.g500, marginTop: 2 }}>{sub}</div>}
      </div>
      {right}
    </div>
  );
}

/* ---------------- DATA ---------------- */
const PLANS: any[] = [
  { name: 'Associado', price: 'R$ 450', adesao: 'R$ 1.500', seats: 'até 3 assentos', credits: '30 créditos/mês', feat: 'CRM + Radar básico', units: 49, tone: pl.info, icon: 'handshake' },
  { name: 'Franquia', price: 'R$ 1.900', adesao: 'R$ 20.000', seats: 'até 15 assentos', credits: '150 créditos/mês', feat: 'Território + leads prioritários', units: 28, tone: pl.primary, icon: 'store' },
  { name: 'Franquia Premium', price: 'R$ 3.600', adesao: 'R$ 40.000', seats: 'até 40 assentos', credits: '400 créditos/mês', feat: 'Inteligência completa + leads premium', units: 8, tone: pl.p3, highlight: true, icon: 'crown' },
];
const CORRETOR_PLANS: any[] = [
  { name: 'Corretor', price: 'R$ 99', noAdesao: true, seats: '1 corretor', credits: '15 créditos/mês', feat: 'CRM + funil + agenda + Radar básico + materiais', units: 28, unitLabel: 'corretores', tone: pl.info, icon: 'user' },
  { name: 'Corretor Pro', price: 'R$ 199', noAdesao: true, seats: '1 corretor', credits: '40 créditos/mês', feat: 'Tudo do Corretor + inteligência completa + leads prioritários + AVM', units: 12, unitLabel: 'corretores', tone: pl.p3, highlight: true, icon: 'user-check' },
];

const SUBS: any[] = [
  { id: 's1', member: `${demo.nomeCurto} Boa Viagem`, type: 'Franquia', plan: 'Franquia Premium', value: 'R$ 3.600', extra: '', used: 38, inc: 40, status: 'Ativo', next: '05/07', since: '03/2024', uf: 'PE' },
  {
    id: 's2', member: 'Imobiliária Costa', type: 'Associado', plan: 'Associado', value: 'R$ 450', extra: '', used: 3, inc: 3, status: 'Em atraso', lateDays: 8, next: '28/06', since: '11/2024', uf: 'PE',
    resp: 'Marcos Costa', method: 'Boleto', adesaoPaid: 'R$ 1.500 · paga', creditsInc: 30, creditsUsed: 22, creditsPack: 0,
    payHist: [{ m: 'Jun', ok: false }, { m: 'Mai', ok: true }, { m: 'Abr', ok: true }, { m: 'Mar', ok: true }], invoice: 'R$ 450 · 8 dias em atraso',
  },
  { id: 's3', member: `${demo.nomeCurto} Caruaru`, type: 'Franquia', plan: 'Franquia', value: 'R$ 1.900', extra: '', used: 11, inc: 15, status: 'Ativo', next: '10/07', since: '01/2025', uf: 'PE' },
  { id: 's4', member: 'Pedro Nunes Imóveis', type: 'Associado', plan: 'Associado', value: 'R$ 450', extra: '', used: 2, inc: 3, status: 'Ativo', next: '12/07', since: '05/2025', uf: 'PE' },
  { id: 's5', member: `${demo.nomeCurto} Recife Centro`, type: 'Franquia', plan: 'Franquia', value: 'R$ 1.900', extra: '+ assentos extras', used: 15, inc: 15, status: 'Ativo', next: '15/07', since: '08/2024', uf: 'PE' },
  { id: 's6', member: 'Lucas Ferreira', type: 'Corretor', plan: 'Corretor Pro', value: 'R$ 199', extra: '', used: null, inc: null, status: 'Ativo', next: '09/07', since: '02/2025', uf: 'SP' },
  { id: 's7', member: 'Renata Alves', type: 'Corretor', plan: 'Corretor', value: 'R$ 99', extra: '', used: null, inc: null, status: 'Ativo', next: '14/07', since: '06/2025', uf: 'SP' },
  { id: 's8', member: 'Bruno Tavares', type: 'Corretor', plan: 'Corretor', value: 'R$ 99', extra: '', used: null, inc: null, status: 'Ativo', next: '25/07', since: '09/2024', uf: 'PE' },
];

/* ---------------- SUMMARY ---------------- */
function PlSummary() {
  const cards = [
    { l: 'Receita recorrente (MRR)', v: 'R$ 114 mil', sub: '/mês', note: 'R$ 109 mil unid. · R$ 5,2 mil corr.', ic: 'repeat', hl: true },
    { l: 'ARR (anualizada)', v: 'R$ 1,4 mi', ic: 'calendar-range' },
    { l: 'Assinaturas ativas', v: '125', note: '85 unidades · 40 corretores', ic: 'badge-check' },
    { l: 'Novas no mês', v: '7', ic: 'plus-circle' },
    { l: 'Churn', v: '2,3%', sub: '2 canc.', ic: 'user-minus' },
    { l: 'Ticket médio (ARPU)', v: 'R$ 1.279', ic: 'receipt' },
    { l: 'Inadimplência', v: '4,7%', ic: 'alert-circle' },
  ];
  return (
    <div className="pl-summary">
      {cards.map(c => (
        <div key={c.l} style={{ background: c.hl ? `linear-gradient(135deg, ${pl.primary}, ${pl.deep})` : '#fff', border: c.hl ? 'none' : `1px solid ${pl.g300}`, borderRadius: 14, padding: 15, boxShadow: c.hl ? 'var(--shadow-purple)' : 'none', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 30, height: 30, borderRadius: 8, background: c.hl ? 'rgba(255,255,255,.18)' : pl.lilac2, display: 'grid', placeItems: 'center', flexShrink: 0 }}><CIc n={c.ic} s={15} c={c.hl ? '#fff' : pl.primary} /></span>
            <span style={{ fontSize: 11.5, fontWeight: 600, color: c.hl ? 'rgba(255,255,255,.85)' : pl.g500, lineHeight: 1.25 }}>{c.l}</span>
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, lineHeight: 1.15, color: c.hl ? '#fff' : pl.ink, marginTop: 11 }}>{c.v}{c.sub && <span style={{ fontSize: 11.5, fontWeight: 600, color: c.hl ? 'rgba(255,255,255,.7)' : pl.g500 }}> {c.sub}</span>}</div>
          {c.note && <div style={{ fontSize: 11, color: c.hl ? 'rgba(255,255,255,.7)' : pl.g500, marginTop: 3, lineHeight: 1.3 }}>{c.note}</div>}
        </div>
      ))}
    </div>
  );
}

/* ---------------- PLAN CARD ---------------- */
function PlanCard({ p }: any) {
  return (
    <div style={{ ...plCard, padding: 22, position: 'relative', borderColor: p.highlight ? pl.primary : pl.g300, borderWidth: p.highlight ? 1.5 : 1 } as React.CSSProperties}>
      <button title="Editar plano" style={{ position: 'absolute', top: 16, right: 16, width: 30, height: 30, border: `1px solid ${pl.g300}`, background: '#fff', borderRadius: 8, display: 'grid', placeItems: 'center', cursor: 'pointer' }}><CIc n="pencil" s={15} c={pl.g500} /></button>
      <span style={{ width: 40, height: 40, borderRadius: 11, background: `${p.tone}1A`, display: 'grid', placeItems: 'center' }}><CIc n={p.icon} s={20} c={p.tone} /></span>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: pl.ink, marginTop: 12 }}>{p.name}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 26, color: pl.primary, whiteSpace: 'nowrap' }}>{p.price}</span>
        <span style={{ fontSize: 13, color: pl.g500 }}>/mês</span>
      </div>
      <div style={{ fontSize: 12.5, color: pl.g500, marginTop: 2 }}>{p.noAdesao ? 'sem taxa de adesão' : `+ adesão ${p.adesao}`}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16, paddingTop: 16, borderTop: `1px solid ${pl.g100}` }}>
        {[[p.seats, 'users'], [p.credits, 'search'], [p.feat, 'sparkles']].map(([t, ic]: any) => (
          <div key={t} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, fontSize: 13, color: pl.g700, lineHeight: 1.35 }}><CIc n={ic} s={15} c={pl.primary} style={{ marginTop: 1, flexShrink: 0 }} /> <span>{t}</span></div>
        ))}
      </div>
      <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 7, fontSize: 12.5, color: pl.g500 }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 17, color: pl.ink }}>{p.units}</span> {p.unitLabel || 'unidades'} neste plano
      </div>
    </div>
  );
}

/* ---------------- PLAN CATALOG ---------------- */
function PlCatalog() {
  const [seg, setSeg] = useStatePl('Unidades');
  const list = seg === 'Unidades' ? PLANS : CORRETOR_PLANS;
  return (
    <div>
      <PlHead title="Catálogo de planos" sub="O CEO cria, edita e arquiva planos, sem código" right={<button style={{ display: 'flex', alignItems: 'center', gap: 7, border: 'none', background: pl.primary, color: '#fff', borderRadius: 10, padding: '10px 16px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 13.5, boxShadow: 'var(--shadow-purple)', whiteSpace: 'nowrap' }}><CIc n="plus" s={16} c="#fff" /> Novo plano</button>} />
      <div style={{ display: 'flex', background: pl.g100, borderRadius: 999, padding: 4, width: 'fit-content', marginBottom: 16 }}>
        {[['Unidades', 'building-2'], ['Corretores', 'user']].map(([s, ic]: any) => (
          <button key={s} onClick={() => setSeg(s)} style={{ display: 'flex', alignItems: 'center', gap: 7, border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13.5, fontWeight: 600, padding: '8px 16px', borderRadius: 999, transition: 'all .15s ease', background: seg === s ? '#fff' : 'transparent', color: seg === s ? pl.primary : pl.g500, boxShadow: seg === s ? 'var(--shadow-sm)' : 'none' }}>
            <CIc n={ic} s={15} c={seg === s ? pl.primary : pl.g500} /> {s}
          </button>
        ))}
      </div>
      <div className="pl-plans">
        {list.map((p: any) => <PlanCard key={p.name} p={p} />)}
      </div>
    </div>
  );
}

/* ---------------- SELECT ---------------- */
function PlSelect({ value, onChange, options, icon }: any) {
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      {icon && <span style={{ position: 'absolute', left: 12, pointerEvents: 'none', display: 'flex' }}><CIc n={icon} s={15} c={pl.g500} /></span>}
      <select value={value} onChange={e => onChange(e.target.value)} style={{ appearance: 'none', WebkitAppearance: 'none', border: `1px solid ${pl.g300}`, background: '#fff', borderRadius: 10, padding: icon ? '9px 32px 9px 34px' : '9px 32px 9px 13px', fontFamily: 'var(--font-body)', fontSize: 13.5, fontWeight: 600, color: pl.ink, cursor: 'pointer', outline: 'none' } as React.CSSProperties}>
        {options.map((o: any) => <option key={o} value={o}>{o}</option>)}
      </select>
      <span style={{ position: 'absolute', right: 11, pointerEvents: 'none', display: 'flex' }}><CIc n="chevron-down" s={15} c={pl.g500} /></span>
    </div>
  );
}

/* ---------------- SUBSCRIPTIONS TABLE ---------------- */
function PlTable({ onSelect }: any) {
  const [q, setQ] = useStatePl('');
  const [fType, setFType] = useStatePl('Todos os tipos');
  const [fPlan, setFPlan] = useStatePl('Todos os planos');
  const [fStatus, setFStatus] = useStatePl('Todos os status');
  const rows = SUBS.filter(s =>
    (q === '' || s.member.toLowerCase().includes(q.toLowerCase())) &&
    (fType === 'Todos os tipos' || s.type === fType) &&
    (fPlan === 'Todos os planos' || s.plan === fPlan) &&
    (fStatus === 'Todos os status' || s.status === fStatus)
  );
  const cols = ['Membro', 'Tipo', 'Plano', 'Valor/mês', 'Assentos', 'Status', 'Próx. cobrança', 'Cliente desde'];
  return (
    <div style={{ ...plCard, padding: 22 }}>
      <PlHead title="Assinaturas" sub={`${rows.length} de ${SUBS.length} assinaturas`} />
      <div className="pl-filters">
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: pl.g100, borderRadius: 10, padding: '0 13px', height: 40, flex: 1, minWidth: 180 }}>
          <CIc n="search" s={17} c={pl.g500} />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar membro…" style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontFamily: 'var(--font-body)', fontSize: 13.5, color: pl.ink }} />
        </div>
        <PlSelect icon="layers" value={fType} onChange={setFType} options={['Todos os tipos', 'Franquia', 'Associado', 'Corretor']} />
        <PlSelect icon="tag" value={fPlan} onChange={setFPlan} options={['Todos os planos', 'Associado', 'Franquia', 'Franquia Premium', 'Corretor', 'Corretor Pro']} />
        <PlSelect icon="activity" value={fStatus} onChange={setFStatus} options={['Todos os status', 'Ativo', 'Em atraso', 'Cancelado']} />
      </div>

      {/* desktop table */}
      <div className="pl-table-wrap" style={{ overflowX: 'auto', marginTop: 18 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
          <thead><tr>
            {cols.map(h => <th key={h} style={{ textAlign: ['Valor/mês', 'Assentos'].includes(h) ? 'right' : 'left', fontSize: 11, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: pl.g500, padding: '0 12px 12px', borderBottom: `1px solid ${pl.g300}`, whiteSpace: 'nowrap' } as React.CSSProperties}>{h}</th>)}
          </tr></thead>
          <tbody>
            {rows.map(s => {
              const [sFg, sBg] = PL_STATUS[s.status];
              const full = s.used >= s.inc;
              return (
                <tr key={s.id} onClick={() => onSelect(s)} style={{ borderBottom: `1px solid ${pl.g100}`, cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = pl.lilac1}
                  onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                  <td style={{ padding: '13px 12px', fontSize: 14, fontWeight: 600, color: pl.ink, whiteSpace: 'nowrap' }}>{s.member}</td>
                  <td style={{ padding: '13px 12px' }}><PlBadge text={s.type} fg={PL_TYPE[s.type]} bg={`${PL_TYPE[s.type]}1A`} /></td>
                  <td style={{ padding: '13px 12px', fontSize: 13.5, color: pl.g700, whiteSpace: 'nowrap' }}>{s.plan}</td>
                  <td style={{ padding: '13px 12px', textAlign: 'right', fontSize: 14, fontWeight: 600, color: pl.ink, whiteSpace: 'nowrap' }}>{s.value}{s.extra && <span style={{ display: 'block', fontSize: 11, fontWeight: 500, color: pl.success }}>{s.extra}</span>}</td>
                  <td style={{ padding: '13px 12px', textAlign: 'right', fontSize: 13.5, fontWeight: 600, color: s.used == null ? pl.g300 : (full ? pl.warning : pl.g700) }}>{s.used == null ? '—' : `${s.used}/${s.inc}`}</td>
                  <td style={{ padding: '13px 12px' }}><PlBadge text={s.status === 'Em atraso' ? `Em atraso ${s.lateDays}d` : s.status} fg={sFg} bg={sBg} /></td>
                  <td style={{ padding: '13px 12px', fontSize: 13.5, color: pl.g700, whiteSpace: 'nowrap' }}>{s.next}</td>
                  <td style={{ padding: '13px 12px', fontSize: 13, color: pl.g500, whiteSpace: 'nowrap' }}>{s.since}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* mobile cards */}
      <div className="pl-table-cards" style={{ marginTop: 18, flexDirection: 'column', gap: 12 }}>
        {rows.map(s => {
          const [sFg, sBg] = PL_STATUS[s.status];
          return (
            <button key={s.id} onClick={() => onSelect(s)} style={{ ...plCard, background: pl.page, padding: 16, textAlign: 'left', cursor: 'pointer', fontFamily: 'var(--font-body)', width: '100%' } as React.CSSProperties}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 14.5, fontWeight: 600, color: pl.ink }}>{s.member}</span>
                <PlBadge text={s.status === 'Em atraso' ? `Em atraso ${s.lateDays}d` : s.status} fg={sFg} bg={sBg} />
              </div>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
                <PlBadge text={s.type} fg={PL_TYPE[s.type]} bg={`${PL_TYPE[s.type]}1A`} />
                <div><div style={{ fontSize: 11, color: pl.g500 }}>Plano</div><div style={{ fontSize: 13, fontWeight: 600, color: pl.ink }}>{s.plan}</div></div>
                <div><div style={{ fontSize: 11, color: pl.g500 }}>Valor</div><div style={{ fontSize: 13, fontWeight: 600, color: pl.ink }}>{s.value}</div></div>
                <div><div style={{ fontSize: 11, color: pl.g500 }}>Assentos</div><div style={{ fontSize: 13, fontWeight: 600, color: pl.ink }}>{s.used == null ? '—' : `${s.used}/${s.inc}`}</div></div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- REVENUE & GROWTH ---------------- */
function PlGrowth() {
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
  const mrr = [79, 85, 90, 96, 101, 114];
  const max = 160;
  const W = 460, H = 180, padL = 28, padB = 24, padT = 8;
  const gw = (W - padL) / months.length;
  const y = (v: any) => padT + (1 - v / max) * (H - padB - padT);
  const moves = [
    { l: 'Novo', v: '+R$ 14 mil', tone: pl.success, ic: 'plus' },
    { l: 'Expansão (upgrades + add-ons)', v: '+R$ 6 mil', tone: pl.success, ic: 'trending-up' },
    { l: 'Contração (downgrades)', v: '−R$ 2 mil', tone: pl.warning, ic: 'trending-down' },
    { l: 'Churn', v: '−R$ 5 mil', tone: pl.error, ic: 'user-minus' },
  ];
  return (
    <div style={{ ...plCard, padding: 22 }}>
      <PlHead title="Receita & crescimento" sub="MRR e movimentos do período" />
      <div className="pl-growth">
        <div>
          <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="180" preserveAspectRatio="none">
            {[0, 40, 80, 120, 160].map(g => (
              <g key={g}><line x1={padL} x2={W} y1={y(g)} y2={y(g)} stroke={pl.g100} strokeWidth="1" /><text x={padL - 5} y={y(g) + 3} textAnchor="end" fontSize="8.5" fill={pl.g500} fontFamily="var(--font-body)">{g}</text></g>
            ))}
            {mrr.map((v, i) => {
              const cx = padL + gw * i + gw / 2;
              return <g key={i}><rect x={cx - 12} y={y(v)} width={24} height={y(0) - y(v)} rx="4" fill={pl.primary} /><text x={cx} y={H - 8} textAnchor="middle" fontSize="9.5" fill={pl.g500} fontFamily="var(--font-body)">{months[i]}</text></g>;
            })}
          </svg>
        </div>
        <div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {moves.map(m => (
              <div key={m.l} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', background: pl.page, borderRadius: 10 }}>
                <CIc n={m.ic} s={16} c={m.tone} />
                <span style={{ flex: 1, fontSize: 12.5, color: pl.g700, lineHeight: 1.3 }}>{m.l}</span>
                <span style={{ fontSize: 13.5, fontWeight: 700, color: m.tone, whiteSpace: 'nowrap' }}>{m.v}</span>
              </div>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 12px', background: pl.lilac2, borderRadius: 10, marginTop: 2 }}>
              <CIc n="equal" s={16} c={pl.primary} />
              <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color: pl.ink }}>Crescimento líquido</span>
              <span style={{ fontSize: 15, fontWeight: 800, color: pl.success, fontFamily: 'var(--font-display)', whiteSpace: 'nowrap' }}>+R$ 13 mil</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- DELINQUENCY ---------------- */
const PL_STAGE: any = { 'Lembrete enviado': pl.warning, '2ª cobrança': pl.warning, 'Pré-suspensão': pl.error, 'Suspenso': pl.error };
function PlDelinquency() {
  const late = [
    { member: 'Imobiliária Costa', plan: 'Associado', days: 8, val: 'R$ 450', stage: '2ª cobrança' },
    { member: `${demo.nomeCurto} Petrolina`, plan: 'Franquia', days: 3, val: 'R$ 1.900', stage: 'Lembrete enviado' },
    { member: 'Lar Imóveis', plan: 'Associado', days: 21, val: 'R$ 450', stage: 'Pré-suspensão' },
  ];
  return (
    <div style={{ ...plCard, padding: 22 }}>
      <PlHead title="Inadimplência de assinatura" sub="Separada da inadimplência de aluguel" right={<span style={{ fontSize: 12.5, fontWeight: 700, color: pl.error, background: pl.errBg, padding: '5px 12px', borderRadius: 999 }}>Total R$ 5,1 mil</span>} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {late.map((l, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: pl.page, borderRadius: 12, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 150 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: pl.ink }}>{l.member}</div>
              <div style={{ fontSize: 12, color: pl.g500 }}>{l.plan} · <span style={{ color: pl.error, fontWeight: 600 }}>{l.days} dias</span> · {l.val}</div>
            </div>
            <PlBadge text={l.stage} fg={PL_STAGE[l.stage]} bg={`${PL_STAGE[l.stage]}1A`} />
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={{ display: 'flex', alignItems: 'center', gap: 5, border: `1px solid ${pl.g300}`, background: '#fff', color: pl.g700, borderRadius: 9, padding: '7px 11px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 12.5 }}><CIc n="bell" s={14} c={pl.g700} /> Cobrar</button>
              <button style={{ display: 'flex', alignItems: 'center', gap: 5, border: 'none', background: pl.error, color: '#fff', borderRadius: 9, padding: '7px 11px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 12.5 }}><CIc n="pause" s={14} c="#fff" /> Suspender</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- ADD-ONS & CREDITS ---------------- */
function PlAddons() {
  const items = [
    { l: 'Assentos extras', v: '24 assentos', sub: 'R$ 49 cada · R$ 1.176/mês', ic: 'user-plus', tone: pl.primary },
    { l: 'Pacotes de créditos', v: '38 pacotes', sub: 'vendidos no mês', ic: 'search', tone: pl.info },
    { l: 'Inteligência Premium', v: '12 assinantes', sub: 'R$ 290/mês cada', ic: 'sparkles', tone: pl.p3 },
    { l: 'Taxa de adesão (período)', v: '2 novas', sub: 'R$ 20.000 cada', ic: 'door-open', tone: pl.success },
  ];
  return (
    <div style={{ ...plCard, padding: 22 }}>
      <PlHead title="Add-ons & créditos" sub="Os motores de expansão da receita" />
      <div className="pl-2x2">
        {items.map(s => (
          <div key={s.l} style={{ background: pl.page, borderRadius: 12, padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}><CIc n={s.ic} s={16} c={s.tone} /><span style={{ fontSize: 12.5, color: pl.g500, lineHeight: 1.3 }}>{s.l}</span></div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 19, color: pl.ink }}>{s.v}</div>
            <div style={{ fontSize: 11.5, color: pl.g500, marginTop: 2 }}>{s.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- DRAWER SHELL ---------------- */
function PlDrawer({ open, onClose, children, width = 520 }: any) {
  return (
    <React.Fragment>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(28,26,34,.45)', zIndex: 80, opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none', transition: 'opacity .2s ease' }} />
      <div className="pl-drawer" style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width, maxWidth: '100vw', background: '#fff', zIndex: 81, boxShadow: 'var(--shadow-lg)', transform: open ? 'translateX(0)' : 'translateX(100%)', transition: 'transform .26s cubic-bezier(.2,.7,.3,1)', display: 'flex', flexDirection: 'column' } as React.CSSProperties}>
        {open && children}
      </div>
    </React.Fragment>
  );
}
function PlField({ l, v, tone }: any) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, padding: '9px 0', borderBottom: `1px solid ${pl.g100}` }}>
      <span style={{ fontSize: 13, color: pl.g500, flexShrink: 0 }}>{l}</span>
      <span style={{ fontSize: 13.5, fontWeight: 600, color: tone || pl.ink, textAlign: 'right' } as React.CSSProperties}>{v}</span>
    </div>
  );
}

/* ---------------- SUBSCRIPTION DRAWER ---------------- */
function PlSub({ sub, onClose }: any) {
  if (!sub) return null;
  const s = sub;
  const [sFg, sBg] = PL_STATUS[s.status];
  return (
    <React.Fragment>
      <div style={{ padding: '20px 24px', borderBottom: `1px solid ${pl.g300}` }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <span style={{ width: 46, height: 46, borderRadius: 11, background: pl.lilac2, display: 'grid', placeItems: 'center', flexShrink: 0 }}><CIc n={s.type === 'Franquia' ? 'store' : 'handshake'} s={22} c={pl.primary} /></span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: pl.ink, lineHeight: 1.2 }}>{s.member}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
              <PlBadge text={s.type} fg={PL_TYPE[s.type]} bg={`${PL_TYPE[s.type]}1A`} />
              <PlBadge text={s.plan} fg={pl.g700} bg={pl.g100} />
              <PlBadge text={s.status === 'Em atraso' ? `Em atraso ${s.lateDays}d` : s.status} fg={sFg} bg={sBg} />
            </div>
          </div>
          <button onClick={onClose} style={{ width: 34, height: 34, border: `1px solid ${pl.g300}`, background: '#fff', borderRadius: 9, display: 'grid', placeItems: 'center', cursor: 'pointer', flexShrink: 0 }}><CIc n="x" s={18} c={pl.g700} /></button>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <button style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, border: 'none', background: pl.primary, color: '#fff', borderRadius: 10, padding: '10px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 13.5 }}><CIc n="bell" s={16} c="#fff" /> Cobrar</button>
          <button style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, border: `1px solid ${pl.g300}`, background: '#fff', color: pl.g700, borderRadius: 10, padding: '10px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13.5 }}><CIc n="arrow-up-down" s={16} c={pl.g700} /> Mudar plano</button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
        {s.status === 'Em atraso' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: pl.errBg, borderRadius: 12, padding: '12px 14px', marginBottom: 20 }}>
            <CIc n="alert-triangle" s={18} c={pl.error} />
            <span style={{ fontSize: 13, color: pl.g700 }}>Fatura atual: <strong style={{ color: pl.error }}>{s.invoice}</strong></span>
          </div>
        )}

        <div style={{ marginBottom: 24 }}>
          <div style={plSecLabel}>Dados da assinatura</div>
          <PlField l="Razão social" v={s.member} />
          <PlField l="Responsável" v={s.resp || '—'} />
          <PlField l="Plano" v={s.plan} />
          <PlField l="Valor/mês" v={s.value} />
          <PlField l="Ciclo" v="Mensal" />
          <PlField l="Cliente desde" v={s.since} />
          <PlField l="Taxa de adesão" v={s.adesaoPaid || '—'} tone={pl.success} />
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={plSecLabel}>Assentos & créditos</div>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1, background: pl.page, borderRadius: 12, padding: 14 }}>
              <div style={{ fontSize: 12, color: pl.g500, marginBottom: 6 }}>Assentos (corretores)</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: pl.ink }}>{s.used}<span style={{ fontSize: 14, color: pl.g500 }}> / {s.inc}</span></div>
              <button style={{ marginTop: 10, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, border: `1px solid ${pl.g300}`, background: '#fff', color: pl.primary, borderRadius: 9, padding: '7px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 12.5 }}><CIc n="plus" s={14} c={pl.primary} /> Adicionar assentos</button>
            </div>
            <div style={{ flex: 1, background: pl.page, borderRadius: 12, padding: 14 }}>
              <div style={{ fontSize: 12, color: pl.g500, marginBottom: 6 }}>Créditos de consulta</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: pl.ink }}>{s.creditsUsed != null ? s.creditsUsed : 0}<span style={{ fontSize: 14, color: pl.g500 }}> / {s.creditsInc || 30}</span></div>
              <div style={{ fontSize: 11, color: pl.g500 }}>{s.creditsPack || 0} pacotes extras</div>
              <button style={{ marginTop: 6, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, border: `1px solid ${pl.g300}`, background: '#fff', color: pl.primary, borderRadius: 9, padding: '7px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 12.5 }}><CIc n="plus" s={14} c={pl.primary} /> Adicionar créditos</button>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <div style={plSecLabel}>Add-ons</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: pl.page, borderRadius: 10, padding: '12px 14px', fontSize: 13, color: pl.g500 }}><CIc n="package" s={16} c={pl.g500} /> Nenhum add-on contratado.</div>
        </div>

        <div>
          <div style={plSecLabel}>Cobrança</div>
          <PlField l="Método" v={s.method || 'Boleto'} />
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 12, color: pl.g500, marginBottom: 8 }}>Histórico de pagamentos</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {(s.payHist || []).map((p: any) => (
                <div key={p.m} style={{ flex: 1, textAlign: 'center', background: p.ok ? pl.successBg : pl.errBg, borderRadius: 10, padding: '10px 4px' } as React.CSSProperties}>
                  <CIc n={p.ok ? 'check' : 'x'} s={16} c={p.ok ? pl.success : pl.error} />
                  <div style={{ fontSize: 12, fontWeight: 600, color: pl.g700, marginTop: 2 }}>{p.m}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '14px 24px', borderTop: `1px solid ${pl.g300}`, display: 'flex', gap: 10 }}>
        <button style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, border: `1px solid ${pl.g300}`, background: '#fff', color: pl.g700, borderRadius: 10, padding: '11px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13.5 }}><CIc n="arrow-up-down" s={16} c={pl.g700} /> Mudar de plano</button>
        <button style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, border: `1px solid ${pl.g300}`, background: '#fff', color: pl.warning, borderRadius: 10, padding: '11px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13.5 }}><CIc n="pause" s={16} c={pl.warning} /> Suspender</button>
        <button style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, border: `1px solid ${pl.errBg}`, background: pl.errBg, color: pl.error, borderRadius: 10, padding: '11px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13.5 }}><CIc n="x-circle" s={16} c={pl.error} /> Cancelar</button>
      </div>
    </React.Fragment>
  );
}

/* ---------------- PERIOD FILTER ---------------- */
function PlPeriod() {
  const [p, setP] = useStatePl('Este mês');
  const periods = ['Este mês', 'Trimestre', 'Ano'];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <CIc n="calendar" s={16} c={pl.g500} />
      <div style={{ display: 'flex', background: pl.g100, borderRadius: 999, padding: 3 }}>
        {periods.map(x => <button key={x} onClick={() => setP(x)} style={{ border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, padding: '7px 14px', borderRadius: 999, background: p === x ? '#fff' : 'transparent', color: p === x ? pl.primary : pl.g500, boxShadow: p === x ? 'var(--shadow-sm)' : 'none' }}>{x}</button>)}
      </div>
    </div>
  );
}

/* ---------------- PAGE ---------------- */
function PlanosPage() {
  const [selected, setSelected] = useStatePl(null);
  return (
    <CeoChrome>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 30, letterSpacing: '-0.02em', margin: 0, color: pl.ink }}>Planos &amp; Assinaturas</h1>
          <div style={{ fontSize: 13.5, color: pl.g500, marginTop: 4 }}>A receita recorrente da rede: mensalidade das unidades</div>
        </div>
        <PlPeriod />
      </div>

      <PlSummary />
      <PlCatalog />
      <PlTable onSelect={setSelected} />
      <PlGrowth />
      <div className="pl-2col"><PlDelinquency /><PlAddons /></div>

      <PlDrawer open={!!selected} onClose={() => setSelected(null)}>
        <PlSub sub={selected} onClose={() => setSelected(null)} />
      </PlDrawer>
    </div>
    </CeoChrome>
  );
}

export default PlanosPage;
