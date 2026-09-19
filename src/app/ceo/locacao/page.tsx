"use client";
import * as React from "react";
import CeoChrome, { ceoPalette, CIc } from "@/components/ceo/CeoChrome";
const { useState, useEffect, useRef, useMemo, useCallback } = React;
const { useState: useStateLg } = React;

const lg: any = {
  ...ceoPalette,
  info: '#3E82E0', infoBg: '#E5EEFB',
  successBg: '#E6F4EC', warnBg: '#FBF1DC', errBg: '#FAE5E5',
  p3: '#818CF8',
};
const lgCard = { background: '#fff', border: `1px solid ${lg.g300}`, borderRadius: 16 };
const lgSecLabel = { fontSize: 11.5, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: lg.g500, margin: '0 0 12px' } as React.CSSProperties;

// A rede administra o aluguel; a garantia é sempre emitida por um parceiro (ou é caução do inquilino).
const GUARANTEE: any = { 'Seguro-fiança': lg.info, 'Fiador digital': lg.primary, 'Caução': lg.p3, 'Sem garantia': lg.g500 };
const LG_STATUS: any = { 'Em dia': [lg.success, lg.successBg], 'Atrasado': [lg.error, lg.errBg] };

function LgBadge({ text, fg, bg }: any) {
  return <span style={{ fontSize: 12, fontWeight: 700, color: fg, background: bg, borderRadius: 999, padding: '3px 10px', whiteSpace: 'nowrap' } as React.CSSProperties}>{text}</span>;
}
function LgHead({ title, sub, right }: any) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 16, flexWrap: 'wrap' } as React.CSSProperties}>
      <div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: lg.ink }}>{title}</div>
        {sub && <div style={{ fontSize: 13, color: lg.g500, marginTop: 2 }}>{sub}</div>}
      </div>
      {right}
    </div>
  );
}

/* ---------------- DATA ---------------- */
const CONTRACTS: any[] = [
  {
    id: 'c1', imovel: 'Apto Madalena', tipo: 'Residencial', uf: 'PE', owner: 'Heloísa Quintas', tenant: 'Sérgio Moura', rent: 'R$ 2.900', fee: '8%', guar: 'Seguro-fiança', status: 'Em dia', due: '08/06', readj: 'IGP-M 08/2026',
    unit: 'Franquia Recife', broker: 'Bruno Lima', vig: '08/2025 – 08/2027', cover: 'Aluguel, condomínio e IPTU · até 24 aluguéis', partner: 'Seguradora parceira A', policy: 'SPA-2025-04417', credit: 'Aprovado · score 760',
    repasse: 'R$ 2.540', nextRepasse: '10/07', payHist: [{ m: 'Jun', ok: true }, { m: 'Mai', ok: true }, { m: 'Abr', ok: true }, { m: 'Mar', ok: true }], late: null, vistoria: 'Entrada · ok', chaves: 'Entregues',
  },
  {
    id: 'c2', imovel: 'Loja Derby', tipo: 'Comercial', uf: 'PE', owner: 'Gilberto Rezende', tenant: 'Ateliê Exemplo ME', rent: 'R$ 6.200', fee: '10%', guar: 'Fiador digital', status: 'Atrasado', lateDays: 9, due: '31/05', readj: 'IPCA 02/2027',
    unit: 'Franquia Recife', broker: 'Carla Menezes', vig: '02/2025 – 02/2028', cover: 'Aluguel e encargos · até 12 aluguéis', partner: 'Garantidora parceira A', policy: 'GPA-2025-00932', credit: 'Aprovado · score 710',
    repasse: 'R$ 5.270', nextRepasse: 'retido (em atraso)', payHist: [{ m: 'Mai', ok: false }, { m: 'Abr', ok: true }, { m: 'Mar', ok: true }, { m: 'Fev', ok: true }], late: 'R$ 6.200 · 9 dias', vistoria: 'Entrada · ok', chaves: 'Entregues', stage: '2ª cobrança',
  },
  {
    id: 'c3', imovel: 'Apto Casa Amarela', tipo: 'Residencial', uf: 'PE', owner: 'Beatriz Nóbrega', tenant: 'Renan Farias', rent: 'R$ 1.850', fee: '8%', guar: 'Caução', status: 'Em dia', due: '12/06', readj: 'IGP-M 01/2027',
    unit: 'Franquia Recife', broker: 'Felipe Andrade', vig: '01/2025 – 01/2027', cover: 'Depósito de 3 aluguéis do inquilino', policy: 'CAU-2025-00318', credit: 'Aprovado · score 700',
    repasse: 'R$ 1.640', nextRepasse: '14/06', payHist: [{ m: 'Jun', ok: true }, { m: 'Mai', ok: true }, { m: 'Abr', ok: true }, { m: 'Mar', ok: true }], late: null, vistoria: 'Entrada · ok', chaves: 'Entregues',
  },
  {
    id: 'c4', imovel: 'Casa Setúbal', tipo: 'Residencial', uf: 'PE', owner: 'Rodrigo Tenório', tenant: 'Lívia Sampaio', rent: 'R$ 3.600', fee: '8%', guar: 'Sem garantia', status: 'Em dia', due: '15/06', readj: 'IPCA 04/2027',
    unit: 'Franquia Recife', broker: 'Bruno Lima', vig: '04/2025 – 04/2027', cover: '—', policy: '—', credit: '—',
    repasse: 'R$ 3.190', nextRepasse: '17/06', payHist: [{ m: 'Jun', ok: true }, { m: 'Mai', ok: true }, { m: 'Abr', ok: true }], late: null, vistoria: 'Entrada · ok', chaves: 'Entregues',
  },
];

/* ---------------- SUMMARY ---------------- */
function LgSummary() {
  const cards = [
    { l: 'Contratos ativos', v: '312', ic: 'file-text', tone: lg.primary },
    { l: 'Aluguel sob administração', v: 'R$ 2,10 mi', sub: '/mês', ic: 'key-round', tone: lg.primary },
    { l: 'Taxa de administração', v: 'R$ 142 mil', sub: '/mês', ic: 'repeat', tone: lg.success },
    { l: 'Inadimplência', v: '3,2%', ic: 'alert-circle', tone: lg.warning },
    { l: 'Contratos com garantia', v: '248', ic: 'shield-check', tone: lg.info },
    { l: 'Sinistros com parceiros', v: '3', ic: 'shield-alert', tone: lg.error },
  ];
  return (
    <div className="lg-summary">
      {cards.map(c => (
        <div key={c.l} style={{ ...lgCard, padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ width: 38, height: 38, borderRadius: 10, background: lg.lilac2, display: 'grid', placeItems: 'center', flexShrink: 0 }}><CIc n={c.ic} s={18} c={c.tone} /></span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 19, color: lg.ink, lineHeight: 1.1 }}>{c.v}{c.sub && <span style={{ fontSize: 12, fontWeight: 600, color: lg.g500 }}> {c.sub}</span>}</div>
            <div style={{ fontSize: 12, color: lg.g500, lineHeight: 1.3 }}>{c.l}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------------- SELECT ---------------- */
function LgSelect({ value, onChange, options, icon }: any) {
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' } as React.CSSProperties}>
      {icon && <span style={{ position: 'absolute', left: 12, pointerEvents: 'none', display: 'flex' } as React.CSSProperties}><CIc n={icon} s={15} c={lg.g500} /></span>}
      <select value={value} onChange={e => onChange(e.target.value)} style={{ appearance: 'none', WebkitAppearance: 'none', border: `1px solid ${lg.g300}`, background: '#fff', borderRadius: 10, padding: icon ? '9px 32px 9px 34px' : '9px 32px 9px 13px', fontFamily: 'var(--font-body)', fontSize: 13.5, fontWeight: 600, color: lg.ink, cursor: 'pointer', outline: 'none' } as React.CSSProperties}>
        {options.map((o: any) => <option key={o} value={o}>{o}</option>)}
      </select>
      <span style={{ position: 'absolute', right: 11, pointerEvents: 'none', display: 'flex' } as React.CSSProperties}><CIc n="chevron-down" s={15} c={lg.g500} /></span>
    </div>
  );
}

/* ---------------- CONTRACTS TABLE ---------------- */
function LgTable({ onSelect }: any) {
  const [q, setQ] = useStateLg('');
  const [fStatus, setFStatus] = useStateLg('Todos os status');
  const [fGuar, setFGuar] = useStateLg('Todas as garantias');
  const rows = CONTRACTS.filter(c =>
    (q === '' || (c.imovel + c.owner + c.tenant).toLowerCase().includes(q.toLowerCase())) &&
    (fStatus === 'Todos os status' || c.status === fStatus) &&
    (fGuar === 'Todas as garantias' || c.guar === fGuar)
  );
  const cols = ['Imóvel', 'Proprietário', 'Inquilino', 'Aluguel', 'Taxa', 'Garantia', 'Status', 'Próx. venc.', 'Reajuste'];
  const numAlign: any = { 'Aluguel': 1, 'Taxa': 1 };
  return (
    <div style={{ ...lgCard, padding: 22 }}>
      <LgHead title="Carteira de contratos" sub={`${rows.length} de ${CONTRACTS.length} contratos`} />
      <div className="lg-filters">
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: lg.g100, borderRadius: 10, padding: '0 13px', height: 40, flex: 1, minWidth: 190 }}>
          <CIc n="search" s={17} c={lg.g500} />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar imóvel, proprietário, inquilino…" style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontFamily: 'var(--font-body)', fontSize: 13.5, color: lg.ink }} />
        </div>
        <LgSelect icon="activity" value={fStatus} onChange={setFStatus} options={['Todos os status', 'Em dia', 'Atrasado']} />
        <LgSelect icon="shield-check" value={fGuar} onChange={setFGuar} options={['Todas as garantias', 'Seguro-fiança', 'Fiador digital', 'Caução', 'Sem garantia']} />
      </div>

      {/* desktop table */}
      <div className="lg-table-wrap" style={{ overflowX: 'auto', marginTop: 18 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 940 } as React.CSSProperties}>
          <thead><tr>
            {cols.map(h => <th key={h} style={{ textAlign: numAlign[h] ? 'right' : 'left', fontSize: 11, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: lg.g500, padding: '0 12px 12px', borderBottom: `1px solid ${lg.g300}`, whiteSpace: 'nowrap' } as React.CSSProperties}>{h}</th>)}
          </tr></thead>
          <tbody>
            {rows.map(c => {
              const [sFg, sBg] = LG_STATUS[c.status];
              return (
                <tr key={c.id} onClick={() => onSelect(c)} style={{ borderBottom: `1px solid ${lg.g100}`, cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = lg.lilac1}
                  onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                  <td style={{ padding: '13px 12px', fontSize: 14, fontWeight: 600, color: lg.ink, whiteSpace: 'nowrap' } as React.CSSProperties}>{c.imovel}</td>
                  <td style={{ padding: '13px 12px', fontSize: 13.5, color: lg.g700, whiteSpace: 'nowrap' } as React.CSSProperties}>{c.owner}</td>
                  <td style={{ padding: '13px 12px', fontSize: 13.5, color: c.tenant === '—' ? lg.g300 : lg.g700, whiteSpace: 'nowrap' } as React.CSSProperties}>{c.tenant}</td>
                  <td style={{ padding: '13px 12px', textAlign: 'right', fontSize: 14, fontWeight: 600, color: lg.ink, whiteSpace: 'nowrap' } as React.CSSProperties}>{c.rent}</td>
                  <td style={{ padding: '13px 12px', textAlign: 'right', fontSize: 13.5, color: lg.g700 } as React.CSSProperties}>{c.fee}</td>
                  <td style={{ padding: '13px 12px' }}><LgBadge text={c.guar} fg={GUARANTEE[c.guar]} bg={`${GUARANTEE[c.guar]}1A`} /></td>
                  <td style={{ padding: '13px 12px' }}><LgBadge text={c.status === 'Atrasado' ? `Atrasado ${c.lateDays}d` : c.status} fg={sFg} bg={sBg} /></td>
                  <td style={{ padding: '13px 12px', fontSize: 13.5, color: lg.g700, whiteSpace: 'nowrap' } as React.CSSProperties}>{c.due}</td>
                  <td style={{ padding: '13px 12px', fontSize: 13, color: lg.g500, whiteSpace: 'nowrap' } as React.CSSProperties}>{c.readj}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* mobile cards */}
      <div className="lg-table-cards" style={{ marginTop: 18, flexDirection: 'column', gap: 12 } as React.CSSProperties}>
        {rows.map(c => {
          const [sFg, sBg] = LG_STATUS[c.status];
          return (
            <button key={c.id} onClick={() => onSelect(c)} style={{ ...lgCard, background: lg.page, padding: 16, textAlign: 'left', cursor: 'pointer', fontFamily: 'var(--font-body)', width: '100%' } as React.CSSProperties}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <span style={{ fontSize: 14.5, fontWeight: 600, color: lg.ink }}>{c.imovel}</span>
                <LgBadge text={c.status === 'Atrasado' ? `Atrasado ${c.lateDays}d` : c.status} fg={sFg} bg={sBg} />
              </div>
              <div style={{ fontSize: 12.5, color: lg.g500, marginBottom: 10 }}>{c.owner} → {c.tenant}</div>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' } as React.CSSProperties}>
                <div><div style={{ fontSize: 11, color: lg.g500 }}>Aluguel</div><div style={{ fontSize: 13.5, fontWeight: 600, color: lg.ink }}>{c.rent}</div></div>
                <div><div style={{ fontSize: 11, color: lg.g500 }}>Taxa</div><div style={{ fontSize: 13.5, fontWeight: 600, color: lg.ink }}>{c.fee}</div></div>
                <LgBadge text={c.guar} fg={GUARANTEE[c.guar]} bg={`${GUARANTEE[c.guar]}1A`} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- GUARANTEE & RISK ---------------- */
function LgRisk() {
  const types = [
    { l: 'Seguro-fiança', v: 162, c: lg.info }, { l: 'Fiador digital', v: 58, c: lg.primary },
    { l: 'Caução', v: 28, c: lg.p3 }, { l: 'Sem garantia', v: 64, c: lg.g500 },
  ];
  const max = Math.max(...types.map(t => t.v));
  return (
    <div style={{ ...lgCard, padding: 22 }}>
      <LgHead title="Garantias dos contratos" sub="Seguro-fiança e fiador digital são emitidos por parceiros: o risco é deles" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 } as React.CSSProperties}>
        {types.map(t => (
          <div key={t.l} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 110, fontSize: 12.5, color: lg.g700, flexShrink: 0 }}>{t.l}</span>
            <div style={{ flex: 1, height: 18, background: lg.g100, borderRadius: 6, overflow: 'hidden' }}>
              <div style={{ width: `${(t.v / max) * 100}%`, height: '100%', background: t.c, borderRadius: 6 }} />
            </div>
            <span style={{ width: 30, textAlign: 'right', fontSize: 13.5, fontWeight: 700, color: lg.ink } as React.CSSProperties}>{t.v}</span>
          </div>
        ))}
      </div>
      <div className="lg-3col">
        {[
          { l: 'Apólices a renovar', v: '11', sub: 'com o parceiro · 60 dias', tone: lg.primary },
          { l: 'Sinistros', v: '3 abertos', sub: 'em análise no parceiro', tone: lg.error },
          { l: 'Aprovação de crédito', v: '87%', sub: 'análise de entrada', tone: lg.success },
        ].map(s => (
          <div key={s.l} style={{ background: lg.page, borderRadius: 12, padding: '13px 14px' }}>
            <div style={{ fontSize: 12, color: lg.g500 }}>{s.l}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, color: s.tone, marginTop: 3 }}>{s.v}</div>
            <div style={{ fontSize: 11.5, color: lg.g500 }}>{s.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- INADIMPLÊNCIA ---------------- */
const STAGE_TONE: any = { 'Aviso enviado': lg.warning, '2ª cobrança': lg.warning, 'Pré-jurídico': lg.error };
function LgDelinquency({ onSelect }: any) {
  const late = [
    { id: 'c2', imovel: 'Loja Derby', tenant: 'Ateliê Exemplo ME', days: 9, val: 'R$ 6.200', stage: '2ª cobrança' },
    { imovel: 'Apto Tamarineira', tenant: 'Marta Paiva', days: 4, val: 'R$ 2.300', stage: 'Aviso enviado' },
    { imovel: 'Casa Parnamirim', tenant: 'Thiago Barros', days: 41, val: 'R$ 8.600', stage: 'Pré-jurídico' },
  ];
  return (
    <div style={{ ...lgCard, padding: 22 }}>
      <LgHead title="Inadimplência" sub="Contratos em atraso · régua de cobrança" right={<span style={{ fontSize: 12.5, fontWeight: 700, color: lg.error, background: lg.errBg, padding: '5px 12px', borderRadius: 999 }}>Total R$ 67 mil</span>} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 } as React.CSSProperties}>
        {late.map((l, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: lg.page, borderRadius: 12, flexWrap: 'wrap' } as React.CSSProperties}>
            <div style={{ flex: 1, minWidth: 160 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: lg.ink }}>{l.imovel}</div>
              <div style={{ fontSize: 12, color: lg.g500 }}>{l.tenant} · <span style={{ color: lg.error, fontWeight: 600 }}>{l.days} dias</span> · {l.val}</div>
            </div>
            <LgBadge text={l.stage} fg={STAGE_TONE[l.stage]} bg={`${STAGE_TONE[l.stage]}1A`} />
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={{ display: 'flex', alignItems: 'center', gap: 5, border: `1px solid ${lg.g300}`, background: '#fff', color: lg.g700, borderRadius: 9, padding: '7px 11px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 12.5 }}><CIc n="bell" s={14} c={lg.g700} /> Cobrar</button>
              <button style={{ display: 'flex', alignItems: 'center', gap: 5, border: 'none', background: lg.primary, color: '#fff', borderRadius: 9, padding: '7px 11px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 12.5 }}><CIc n="shield-alert" s={14} c="#fff" /> Acionar parceiro</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- REAJUSTES & RENOVAÇÕES ---------------- */
function LgRenewals() {
  const items = [
    { ic: 'trending-up', v: '6', l: 'Contratos a reajustar', note: 'IGP-M / IPCA · neste período', tone: lg.primary, bg: lg.lilac2 },
    { ic: 'calendar-clock', v: '4', l: 'Renovações próximas', note: 'vencem em até 60 dias', tone: lg.warning, bg: lg.warnBg },
  ];
  return (
    <div className="lg-renew">
      {items.map(x => (
        <div key={x.l} style={{ ...lgCard, padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: x.bg, display: 'grid', placeItems: 'center', flexShrink: 0 }}><CIc n={x.ic} s={22} c={x.tone} /></div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, color: lg.ink, lineHeight: 1.1 }}>{x.v}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: lg.g700 }}>{x.l}</div>
            <div style={{ fontSize: 12, color: lg.g500 }}>{x.note}</div>
          </div>
          <CIc n="chevron-right" s={20} c={lg.g500} />
        </div>
      ))}
    </div>
  );
}

/* ---------------- DRAWER SHELL ---------------- */
function LgDrawer({ open, onClose, children, width = 520 }: any) {
  return (
    <React.Fragment>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(28,26,34,.45)', zIndex: 80, opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none', transition: 'opacity .2s ease' } as React.CSSProperties} />
      <div className="lg-drawer" style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width, maxWidth: '100vw', background: '#fff', zIndex: 81, boxShadow: 'var(--shadow-lg)', transform: open ? 'translateX(0)' : 'translateX(100%)', transition: 'transform .26s cubic-bezier(.2,.7,.3,1)', display: 'flex', flexDirection: 'column' } as React.CSSProperties}>
        {open && children}
      </div>
    </React.Fragment>
  );
}
function LgField({ l, v, tone }: any) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, padding: '9px 0', borderBottom: `1px solid ${lg.g100}` }}>
      <span style={{ fontSize: 13, color: lg.g500, flexShrink: 0 }}>{l}</span>
      <span style={{ fontSize: 13.5, fontWeight: 600, color: tone || lg.ink, textAlign: 'right' } as React.CSSProperties}>{v}</span>
    </div>
  );
}

/* ---------------- CONTRACT DRAWER ---------------- */
function LgContract({ contract, onClose }: any) {
  if (!contract) return null;
  const c = contract;
  const [sFg, sBg] = LG_STATUS[c.status];
  return (
    <React.Fragment>
      <div style={{ padding: '20px 24px', borderBottom: `1px solid ${lg.g300}` }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <span style={{ width: 46, height: 46, borderRadius: 11, background: lg.lilac2, display: 'grid', placeItems: 'center', flexShrink: 0 }}><CIc n={c.tipo === 'Comercial' ? 'briefcase' : 'home'} s={22} c={lg.primary} /></span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: lg.ink, lineHeight: 1.2 }}>{c.imovel}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
              <LgBadge text={c.tipo} fg={lg.primary} bg={lg.lilac2} />
              <LgBadge text={c.status === 'Atrasado' ? `Atrasado ${c.lateDays} dias` : c.status} fg={sFg} bg={sBg} />
            </div>
          </div>
          <button onClick={onClose} style={{ width: 34, height: 34, border: `1px solid ${lg.g300}`, background: '#fff', borderRadius: 9, display: 'grid', placeItems: 'center', cursor: 'pointer', flexShrink: 0 }}><CIc n="x" s={18} c={lg.g700} /></button>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <button style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, border: `1px solid ${lg.g300}`, background: '#fff', color: lg.g700, borderRadius: 10, padding: '10px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13.5 }}><CIc n="bell" s={16} c={lg.g700} /> Cobrar</button>
          <button style={{ flex: 1.2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, border: 'none', background: lg.primary, color: '#fff', borderRadius: 10, padding: '10px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 13.5 }}><CIc n="shield-alert" s={16} c="#fff" /> Acionar parceiro</button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
        {c.late && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: lg.errBg, borderRadius: 12, padding: '12px 14px', marginBottom: 20 }}>
            <CIc n="alert-triangle" s={18} c={lg.error} />
            <span style={{ fontSize: 13, color: lg.g700 }}>Em atraso: <strong style={{ color: lg.error }}>{c.late}</strong> · etapa <strong style={{ color: lg.ink }}>{c.stage}</strong></span>
          </div>
        )}

        <div style={{ marginBottom: 24 }}>
          <div style={lgSecLabel}>Dados do contrato</div>
          <LgField l="Proprietário" v={c.owner} />
          <LgField l="Inquilino" v={c.tenant} />
          <LgField l="Aluguel" v={c.rent} />
          <LgField l="Taxa de administração" v={c.fee} />
          <LgField l="Vigência" v={c.vig} />
          <LgField l="Reajuste" v={c.readj} />
          <LgField l="Corretor (recebe 1,5%)" v={c.broker} />
        </div>

        <div style={{ marginBottom: 24 }}>
          <div style={lgSecLabel}>Garantia</div>
          {c.guar === 'Sem garantia' ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: lg.warnBg, borderRadius: 10, padding: '12px 14px', fontSize: 13, color: lg.g700 }}><CIc n="shield-off" s={16} c={lg.warning} /> Contrato sem garantia: o risco de inadimplência fica com o proprietário.</div>
          ) : (
            <div style={{ background: lg.page, borderRadius: 12, padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <CIc n="shield-check" s={18} c={GUARANTEE[c.guar]} />
                <span style={{ fontSize: 14, fontWeight: 700, color: lg.ink, flex: 1 }}>{c.guar}</span>
                <span style={{ fontSize: 12, color: lg.g500 }}>Nº {c.policy}</span>
              </div>
              <LgField l="Emitida por" v={c.partner || 'Depósito do inquilino'} />
              <LgField l="Cobertura" v={c.cover} />
              <LgField l="Análise de crédito (entrada)" v={c.credit} tone={lg.success} />
            </div>
          )}
        </div>

        <div style={{ marginBottom: 24 }}>
          <div style={lgSecLabel}>Repasse ao proprietário</div>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1, background: lg.page, borderRadius: 12, padding: '13px 15px' }}>
              <div style={{ fontSize: 12, color: lg.g500 }}>Valor mensal</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 19, color: lg.ink, marginTop: 2 }}>{c.repasse}</div>
              <div style={{ fontSize: 11, color: lg.g500 }}>aluguel − taxa − encargos</div>
            </div>
            <div style={{ flex: 1, background: lg.page, borderRadius: 12, padding: '13px 15px' }}>
              <div style={{ fontSize: 12, color: lg.g500 }}>Próximo repasse</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 19, color: c.nextRepasse.includes('retido') ? lg.error : lg.ink, marginTop: 2 }}>{c.nextRepasse}</div>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <div style={lgSecLabel}>Pagamentos</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {c.payHist.map((p: any) => (
              <div key={p.m} style={{ flex: 1, textAlign: 'center', background: p.ok ? lg.successBg : lg.errBg, borderRadius: 10, padding: '10px 4px' } as React.CSSProperties}>
                <CIc n={p.ok ? 'check' : 'x'} s={16} c={p.ok ? lg.success : lg.error} />
                <div style={{ fontSize: 12, fontWeight: 600, color: lg.g700, marginTop: 2 }}>{p.m}</div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div style={lgSecLabel}>Vistoria & chaves</div>
          <LgField l="Vistoria de entrada" v={c.vistoria} tone={lg.success} />
          <LgField l="Chaves" v={c.chaves} tone={lg.success} />
        </div>
      </div>
    </React.Fragment>
  );
}

/* ---------------- FILTERS (period) ---------------- */
function LgPeriod() {
  const [p, setP] = useStateLg('Este mês');
  const periods = ['Este mês', 'Trimestre', 'Ano'];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <CIc n="calendar" s={16} c={lg.g500} />
      <div style={{ display: 'flex', background: lg.g100, borderRadius: 999, padding: 3 }}>
        {periods.map(x => <button key={x} onClick={() => setP(x)} style={{ border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, padding: '7px 14px', borderRadius: 999, background: p === x ? '#fff' : 'transparent', color: p === x ? lg.primary : lg.g500, boxShadow: p === x ? 'var(--shadow-sm)' : 'none' }}>{x}</button>)}
      </div>
    </div>
  );
}

/* ---------------- PAGE ---------------- */
function LocacaoPage() {
  const [selected, setSelected] = useStateLg(null);
  return (
    <CeoChrome>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 } as React.CSSProperties}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap' } as React.CSSProperties}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 30, letterSpacing: '-0.02em', margin: 0, color: lg.ink }}>Locação &amp; Garantia</h1>
          <div style={{ fontSize: 13.5, color: lg.g500, marginTop: 4 }}>A carteira de aluguel administrada (as garantias são dos parceiros)</div>
        </div>
        <LgPeriod />
      </div>

      <LgSummary />
      <LgTable onSelect={setSelected} />
      <div className="lg-2col"><LgRisk /><LgDelinquency onSelect={setSelected} /></div>
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: lg.g500, margin: '2px 0 14px' } as React.CSSProperties}>Reajustes & renovações</div>
        <LgRenewals />
      </div>

      <LgDrawer open={!!selected} onClose={() => setSelected(null)}>
        <LgContract contract={selected} onClose={() => setSelected(null)} />
      </LgDrawer>
    </div>
    </CeoChrome>
  );
}

export default LocacaoPage;
