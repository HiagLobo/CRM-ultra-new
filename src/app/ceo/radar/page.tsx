"use client";
import * as React from "react";
import CeoChrome, { ceoPalette, CIc } from "@/components/ceo/CeoChrome";
import { demo } from "@/config/demo";
const { useState, useEffect, useRef, useMemo, useCallback } = React;

const { useState: useStateCp } = React;

const cp = {
  ...ceoPalette,
  info: '#3E82E0', infoBg: '#E5EEFB',
  successBg: '#E6F4EC', warnBg: '#FBF1DC', errBg: '#FAE5E5',
  p3: '#818CF8',
} as any;
const cpCard = { background: '#fff', border: `1px solid ${cp.g300}`, borderRadius: 16 };
const cpSecLabel = { fontSize: 11.5, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: cp.g500, margin: '0 0 12px' } as React.CSSProperties;

function CpBadge({ text, fg, bg }: any) {
  return <span style={{ fontSize: 12, fontWeight: 700, color: fg, background: bg, borderRadius: 999, padding: '3px 10px', whiteSpace: 'nowrap' }}>{text}</span>;
}
function CpHead({ title, sub, right }: any) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
      <div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: cp.ink }}>{title}</div>
        {sub && <div style={{ fontSize: 13, color: cp.g500, marginTop: 2 }}>{sub}</div>}
      </div>
      {right}
    </div>
  );
}

const ORIGIN_TONE: any = { Radar: cp.primary, Indicação: cp.success, Portal: cp.info };
const CAP_STATUS: any = {
  'Oportunidade': [cp.g700, cp.g100], 'Em negociação': [cp.warning, cp.warnBg], 'Captado': [cp.success, cp.successBg], 'Listado': [cp.success, cp.successBg], 'Perdido': [cp.error, cp.errBg],
};
const GAP_TONE: any = { 'Gap (captar)': [cp.error, cp.errBg], 'Gap moderado': [cp.warning, cp.warnBg], 'Equilibrado': [cp.success, cp.successBg], 'Excesso': [cp.info, cp.infoBg] };

/* ---------------- DATA ---------------- */
const REGIONS: any[] = [
  { r: 'Boa Viagem', dem: 320, of: 45, tag: 'Gap (captar)' },
  { r: 'Casa Forte', dem: 140, of: 20, tag: 'Gap (captar)' },
  { r: 'Pina', dem: 180, of: 90, tag: 'Equilibrado' },
  { r: 'Caruaru', dem: 110, of: 35, tag: 'Gap moderado' },
  { r: 'Candeias', dem: 60, of: 110, tag: 'Excesso' },
];

const CAPTURES: any[] = [
  {
    id: 'k1', imovel: 'Apto 3q Boa Viagem', regiao: 'Boa Viagem', tipo: 'Residencial', owner: 'Marcos Lima', origem: 'Radar', avm: 'R$ 720 mil', unit: `${demo.nomeCurto} Boa Viagem`, broker: 'Lucas F.', status: 'Em negociação', days: 8,
    area: '98 m²', quartos: '3 quartos · 1 suíte', addr: 'Av. Boa Viagem (aprox.)', carac: 'Vista mar, 2 vagas, varanda',
    avmFaixa: 'R$ 690 – 750 mil', avmComp: 8, avmConf: 'Alta', ownerContact: '(81) 9XXXX-1122', ownerSrc: 'Radar · base pública compliant',
    radarWhy: 'Demanda alta em Boa Viagem + imóvel sem anúncio ativo há 90 dias', demanda: '12 leads da rede querendo apto 3q em Boa Viagem',
    history: [{ t: 'há 8 dias', d: 'Sinalizado pelo Radar', ic: 'radar' }, { t: 'há 6 dias', d: 'Proprietário contatado', ic: 'phone' }, { t: 'há 2 dias', d: 'Em negociação', ic: 'handshake' }],
  },
  { id: 'k2', imovel: 'Casa Casa Forte', regiao: 'Casa Forte', tipo: 'Residencial', owner: 'Helena R.', origem: 'Radar', avm: 'R$ 1,2 mi', unit: `${demo.nomeCurto} Recife Centro`, broker: 'Renata A.', status: 'Oportunidade', days: 1 },
  { id: 'k3', imovel: 'Sala comercial Pina', regiao: 'Pina', tipo: 'Comercial', owner: 'Construtora X', origem: 'Indicação', avm: 'R$ 980 mil', unit: `${demo.nomeCurto} Boa Viagem`, broker: 'Bruno T.', status: 'Captado', days: 22 },
  { id: 'k4', imovel: 'Apto 2q Candeias', regiao: 'Candeias', tipo: 'Residencial', owner: 'José P.', origem: 'Portal', avm: 'R$ 410 mil', unit: `${demo.nomeCurto} Caruaru`, broker: '', status: 'Listado', days: 30 },
  { id: 'k5', imovel: 'Cobertura Boa Viagem', regiao: 'Boa Viagem', tipo: 'Residencial', owner: 'Família Souza', origem: 'Radar', avm: 'R$ 2,4 mi', unit: `${demo.nomeCurto} Boa Viagem`, broker: 'Lucas F.', status: 'Em negociação', days: 5 },
];

/* ---------------- SUMMARY ---------------- */
function CpSummary() {
  const cards: any[] = [
    { l: 'Imóveis captados', v: '95', ic: 'home', hl: true },
    { l: 'Em captação (pipeline)', v: '220', ic: 'git-pull-request', tone: cp.primary },
    { l: 'Conversão de captação', v: '7,9%', ic: 'target', tone: cp.success },
    { l: 'Cobertura AVM', v: '88%', ic: 'gauge', tone: cp.primary },
    { l: 'Créditos consumidos', v: '3.420', ic: 'coins', tone: cp.warning },
    { l: 'Pedidos de exclusão (LGPD)', v: '6', ic: 'shield', tone: cp.info },
  ];
  return (
    <div className="cp-summary">
      {cards.map(c => (
        <div key={c.l} style={{ background: c.hl ? `linear-gradient(135deg, ${cp.primary}, ${cp.deep})` : '#fff', border: c.hl ? 'none' : `1px solid ${cp.g300}`, borderRadius: 14, padding: 15, boxShadow: c.hl ? 'var(--shadow-purple)' : 'none', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 30, height: 30, borderRadius: 8, background: c.hl ? 'rgba(255,255,255,.18)' : cp.lilac2, display: 'grid', placeItems: 'center', flexShrink: 0 }}><CIc n={c.ic} s={15} c={c.hl ? '#fff' : (c.tone || cp.primary)} /></span>
            <span style={{ fontSize: 11.5, fontWeight: 600, color: c.hl ? 'rgba(255,255,255,.85)' : cp.g500, lineHeight: 1.25 }}>{c.l}</span>
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 21, lineHeight: 1.15, color: c.hl ? '#fff' : cp.ink, marginTop: 11 }}>{c.v}</div>
        </div>
      ))}
    </div>
  );
}

/* ---------------- OFERTA × DEMANDA ---------------- */
function CpSupplyDemand() {
  const max = Math.max(...REGIONS.flatMap(r => [r.dem, r.of]));
  return (
    <div style={{ ...cpCard, padding: 22 }}>
      <CpHead title="Oferta × Demanda — Radar" sub="Onde a rede deve captar (cruzando a demanda dos leads)" right={
        <div style={{ display: 'flex', gap: 14 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: cp.g700 }}><span style={{ width: 11, height: 11, borderRadius: 3, background: cp.primary }} /> Demanda</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: cp.g700 }}><span style={{ width: 11, height: 11, borderRadius: 3, background: cp.p3 }} /> Oferta</span>
        </div>
      } />
      <div className="cp-regions">
        {REGIONS.map(rg => {
          const [gFg, gBg] = GAP_TONE[rg.tag];
          return (
            <div key={rg.r} style={{ background: cp.page, border: `1px solid ${cp.g300}`, borderRadius: 12, padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: cp.ink }}>{rg.r}</span>
                <CpBadge text={rg.tag} fg={gFg} bg={gBg} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 56, fontSize: 11.5, color: cp.g500, flexShrink: 0 }}>Demanda</span>
                  <div style={{ flex: 1, height: 16, background: cp.g100, borderRadius: 5, overflow: 'hidden' }}><div style={{ width: `${(rg.dem / max) * 100}%`, height: '100%', background: cp.primary, borderRadius: 5 }} /></div>
                  <span style={{ width: 34, textAlign: 'right', fontSize: 12.5, fontWeight: 700, color: cp.ink }}>{rg.dem}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 56, fontSize: 11.5, color: cp.g500, flexShrink: 0 }}>Oferta</span>
                  <div style={{ flex: 1, height: 16, background: cp.g100, borderRadius: 5, overflow: 'hidden' }}><div style={{ width: `${(rg.of / max) * 100}%`, height: '100%', background: cp.p3, borderRadius: 5 }} /></div>
                  <span style={{ width: 34, textAlign: 'right', fontSize: 12.5, fontWeight: 700, color: cp.ink }}>{rg.of}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- FUNIL + POR UNIDADE ---------------- */
function CpFunnel() {
  const max = 1200;
  const stages: any[] = [{ l: 'Oportunidades', v: 1200, c: cp.p3 }, { l: 'Contatadas', v: 540, c: cp.light }, { l: 'Em negociação', v: 220, c: cp.primary }, { l: 'Captadas/listadas', v: 95, c: cp.success }];
  const units: any[] = [
    { u: `${demo.nomeCurto} Boa Viagem`, cap: 42, taxa: '9,1%', tempo: '11 dias' },
    { u: `${demo.nomeCurto} Recife Centro`, cap: 28, taxa: '7,4%', tempo: '14 dias' },
    { u: `${demo.nomeCurto} Caruaru`, cap: 15, taxa: '5,6%', tempo: '18 dias' },
    { u: 'Corretores independentes', cap: 10, taxa: '6,2%', tempo: '13 dias' },
  ];
  return (
    <div style={{ ...cpCard, padding: 22 }}>
      <CpHead title="Funil de captação" sub="Oportunidade → Captado/Listado · por unidade" />
      <div className="cp-funnel-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {stages.map((s, i) => {
            const w = 22 + (s.v / max) * 78;
            return (
              <div key={s.l} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 130, textAlign: 'right', flexShrink: 0, fontSize: 13, fontWeight: 600, color: cp.ink }}>{s.l}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ width: `${w}%`, height: 30, background: s.c, borderRadius: 8, display: 'flex', alignItems: 'center', paddingLeft: 12, color: '#fff', fontWeight: 700, fontSize: 13 }}>{s.v.toLocaleString('pt-BR')}</div>
                </div>
              </div>
            );
          })}
        </div>
        <div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {units.map(u => (
              <div key={u.u} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: cp.page, borderRadius: 10 }}>
                <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: cp.ink }}>{u.u}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: cp.ink }}>{u.cap}</span>
                <span style={{ width: 44, textAlign: 'right', fontSize: 12.5, color: cp.success, fontWeight: 600 }}>{u.taxa}</span>
                <span style={{ width: 54, textAlign: 'right', fontSize: 12, color: cp.g500 }}>{u.tempo}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- SELECT ---------------- */
function CpSelect({ value, onChange, options, icon }: any) {
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      {icon && <span style={{ position: 'absolute', left: 12, pointerEvents: 'none', display: 'flex' }}><CIc n={icon} s={15} c={cp.g500} /></span>}
      <select value={value} onChange={e => onChange(e.target.value)} style={{ appearance: 'none', WebkitAppearance: 'none', border: `1px solid ${cp.g300}`, background: '#fff', borderRadius: 10, padding: icon ? '9px 32px 9px 34px' : '9px 32px 9px 13px', fontFamily: 'var(--font-body)', fontSize: 13.5, fontWeight: 600, color: cp.ink, cursor: 'pointer', outline: 'none' } as React.CSSProperties}>
        {options.map((o: any) => <option key={o} value={o}>{o}</option>)}
      </select>
      <span style={{ position: 'absolute', right: 11, pointerEvents: 'none', display: 'flex' }}><CIc n="chevron-down" s={15} c={cp.g500} /></span>
    </div>
  );
}

/* ---------------- CAPTURES TABLE ---------------- */
function CpTable({ onSelect }: any) {
  const [q, setQ] = useStateCp('');
  const [fOrigem, setFOrigem] = useStateCp('Todas as origens');
  const [fStatus, setFStatus] = useStateCp('Todos os status');
  const rows = CAPTURES.filter(c =>
    (q === '' || (c.imovel + c.owner + c.regiao).toLowerCase().includes(q.toLowerCase())) &&
    (fOrigem === 'Todas as origens' || c.origem === fOrigem) &&
    (fStatus === 'Todos os status' || c.status === fStatus)
  );
  const cols = ['Imóvel', 'Região', 'Tipo', 'Proprietário', 'Origem', 'AVM', 'Responsável', 'Status'];
  return (
    <div style={{ ...cpCard, padding: 22 }}>
      <CpHead title="Captações" sub={`${rows.length} de ${CAPTURES.length} captações`} />
      <div className="cp-filters">
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: cp.g100, borderRadius: 10, padding: '0 13px', height: 40, flex: 1, minWidth: 180 }}>
          <CIc n="search" s={17} c={cp.g500} />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar imóvel, proprietário, região…" style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontFamily: 'var(--font-body)', fontSize: 13.5, color: cp.ink }} />
        </div>
        <CpSelect icon="radio" value={fOrigem} onChange={setFOrigem} options={['Todas as origens', 'Radar', 'Indicação', 'Portal']} />
        <CpSelect icon="activity" value={fStatus} onChange={setFStatus} options={['Todos os status', 'Oportunidade', 'Em negociação', 'Captado', 'Listado', 'Perdido']} />
      </div>

      <div className="cp-table-wrap" style={{ overflowX: 'auto', marginTop: 18 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 940 }}>
          <thead><tr>
            {cols.map(h => <th key={h} style={{ textAlign: h === 'AVM' ? 'right' : 'left', fontSize: 11, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: cp.g500, padding: '0 12px 12px', borderBottom: `1px solid ${cp.g300}`, whiteSpace: 'nowrap' } as React.CSSProperties}>{h}</th>)}
          </tr></thead>
          <tbody>
            {rows.map(c => {
              const [stFg, stBg] = CAP_STATUS[c.status];
              return (
                <tr key={c.id} onClick={() => onSelect(c)} style={{ borderBottom: `1px solid ${cp.g100}`, cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = cp.lilac1}
                  onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                  <td style={{ padding: '13px 12px', fontSize: 14, fontWeight: 600, color: cp.ink, whiteSpace: 'nowrap' }}>{c.imovel}</td>
                  <td style={{ padding: '13px 12px', fontSize: 13, color: cp.g700, whiteSpace: 'nowrap' }}>{c.regiao}</td>
                  <td style={{ padding: '13px 12px', fontSize: 13, color: cp.g700 }}>{c.tipo}</td>
                  <td style={{ padding: '13px 12px', fontSize: 13, color: cp.g700, whiteSpace: 'nowrap' }}>{c.owner}</td>
                  <td style={{ padding: '13px 12px' }}><CpBadge text={c.origem} fg={ORIGIN_TONE[c.origem]} bg={`${ORIGIN_TONE[c.origem]}1A`} /></td>
                  <td style={{ padding: '13px 12px', textAlign: 'right', fontSize: 14, fontWeight: 600, color: cp.ink, whiteSpace: 'nowrap' }}>{c.avm}</td>
                  <td style={{ padding: '13px 12px', fontSize: 13, color: c.broker ? cp.g700 : cp.g300, whiteSpace: 'nowrap' }}>{c.broker ? `${c.unit} · ${c.broker}` : c.unit}</td>
                  <td style={{ padding: '13px 12px' }}><CpBadge text={c.status} fg={stFg} bg={stBg} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="cp-table-cards" style={{ marginTop: 18, flexDirection: 'column', gap: 12 }}>
        {rows.map(c => {
          const [stFg, stBg] = CAP_STATUS[c.status];
          return (
            <button key={c.id} onClick={() => onSelect(c)} style={{ ...cpCard, background: cp.page, padding: 16, textAlign: 'left', cursor: 'pointer', fontFamily: 'var(--font-body)', width: '100%' } as React.CSSProperties}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 14.5, fontWeight: 600, color: cp.ink }}>{c.imovel}</span>
                <CpBadge text={c.status} fg={stFg} bg={stBg} />
              </div>
              <div style={{ fontSize: 12.5, color: cp.g500, marginBottom: 10 }}>{c.regiao} · {c.tipo} · {c.owner}</div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                <CpBadge text={c.origem} fg={ORIGIN_TONE[c.origem]} bg={`${ORIGIN_TONE[c.origem]}1A`} />
                <div><div style={{ fontSize: 11, color: cp.g500 }}>AVM</div><div style={{ fontSize: 13, fontWeight: 600, color: cp.ink }}>{c.avm}</div></div>
                <span style={{ fontSize: 12.5, color: cp.g700, marginLeft: 'auto' }}>{c.broker ? `${c.unit} · ${c.broker}` : c.unit}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- INTELLIGENCE & CREDITS ---------------- */
function CpCredits() {
  const top: any[] = [[`${demo.nomeCurto} Boa Viagem`, 980], [`${demo.nomeCurto} Recife Centro`, 720], [`${demo.nomeCurto} Caruaru`, 410], ['Independentes', 360]];
  const maxC = 980;
  return (
    <div style={{ ...cpCard, padding: 22 }}>
      <CpHead title="Camada de inteligência & créditos" sub="Consumo, AVM e pacotes extras" />
      <div style={{ display: 'flex', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 140, background: cp.page, borderRadius: 12, padding: '14px 16px' }}>
          <div style={{ fontSize: 12, color: cp.g500 }}>Créditos (uso / alocado)</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: cp.ink, marginTop: 2 }}>3.420 <span style={{ fontSize: 13, color: cp.g500 }}>/ 4.800</span></div>
          <div style={{ height: 8, background: cp.g100, borderRadius: 999, overflow: 'hidden', marginTop: 8 }}><div style={{ width: '71%', height: '100%', background: cp.primary, borderRadius: 999 }} /></div>
          <div style={{ fontSize: 11.5, color: cp.g500, marginTop: 5 }}>71% de uso</div>
        </div>
        <div style={{ flex: 1, minWidth: 140, background: cp.page, borderRadius: 12, padding: '14px 16px' }}>
          <div style={{ fontSize: 12, color: cp.g500 }}>Pacotes extras (mês)</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: cp.ink, marginTop: 2 }}>38</div>
          <div style={{ fontSize: 11.5, color: cp.success, marginTop: 5 }}>vira receita em Planos</div>
        </div>
        <div style={{ flex: 1, minWidth: 140, background: cp.page, borderRadius: 12, padding: '14px 16px' }}>
          <div style={{ fontSize: 12, color: cp.g500 }}>AVM</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: cp.ink, marginTop: 2 }}>612</div>
          <div style={{ fontSize: 11.5, color: cp.g500, marginTop: 5 }}>cobertura 88% · erro ~6%</div>
        </div>
      </div>
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: cp.g500, marginBottom: 10 } as React.CSSProperties}>Top consumo por unidade</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {top.map(([u, v]) => (
          <div key={u} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 150, fontSize: 13, color: cp.g700, flexShrink: 0 }}>{u}</span>
            <div style={{ flex: 1, height: 14, background: cp.g100, borderRadius: 5, overflow: 'hidden' }}><div style={{ width: `${(v / maxC) * 100}%`, height: '100%', background: cp.primary, borderRadius: 5 }} /></div>
            <span style={{ width: 38, textAlign: 'right', fontSize: 13, fontWeight: 700, color: cp.ink }}>{v}</span>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14, background: cp.warnBg, borderRadius: 10, padding: '10px 13px', fontSize: 12.5, color: cp.g700 }}>
        <CIc n="alert-triangle" s={15} c={cp.warning} /> {demo.nomeCurto} Boa Viagem a 84% da alocação — avaliar pacote extra.
      </div>
    </div>
  );
}

/* ---------------- LGPD & ACESSOS ---------------- */
function CpLgpd() {
  const reqs: any[] = [
    { n: 'Titular #2041', st: 'Concluído', tone: cp.success, bg: cp.successBg },
    { n: 'Titular #2055', st: 'Em análise', tone: cp.warning, bg: cp.warnBg },
    { n: 'Titular #2061', st: 'Recebido', tone: cp.info, bg: cp.infoBg },
  ];
  return (
    <div style={{ ...cpCard, padding: 22 }}>
      <CpHead title="LGPD & acessos" sub="Acesso a dados protegidos · tudo registrado" right={<button style={{ display: 'flex', alignItems: 'center', gap: 6, border: `1px solid ${cp.g300}`, background: '#fff', borderRadius: 10, padding: '8px 13px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13, color: cp.primary }}>Abrir em Jurídico & LGPD <CIc n="arrow-up-right" s={14} c={cp.primary} /></button>} />
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 130, background: cp.page, borderRadius: 12, padding: '14px 16px' }}>
          <div style={{ fontSize: 12, color: cp.g500 }}>Acessos registrados</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: cp.ink, marginTop: 2 }}>3.420</div>
          <div style={{ fontSize: 11.5, color: cp.g500, marginTop: 4 }}>todos com base legal</div>
        </div>
        <div style={{ flex: 1, minWidth: 130, background: cp.page, borderRadius: 12, padding: '14px 16px' }}>
          <div style={{ fontSize: 12, color: cp.g500 }}>Pedidos de exclusão</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: cp.ink, marginTop: 2 }}>6</div>
          <div style={{ fontSize: 11.5, color: cp.g500, marginTop: 4 }}>roteados ao Jurídico</div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
        {reqs.map(r => (
          <div key={r.n} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', background: cp.page, borderRadius: 10 }}>
            <CIc n="user-x" s={15} c={cp.g500} />
            <span style={{ flex: 1, fontSize: 13, color: cp.g700 }}>{r.n}</span>
            <CpBadge text={r.st} fg={r.tone} bg={r.bg} />
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9, background: cp.errBg, borderRadius: 10, padding: '11px 13px', fontSize: 12.5, color: cp.g700, lineHeight: 1.5 }}>
        <CIc n="alert-octagon" s={16} c={cp.error} style={{ marginTop: 1, flexShrink: 0 }} />
        <span><strong style={{ color: cp.ink }}>Anomalia:</strong> 1 corretor com volume de consulta acima do padrão — revisar.</span>
      </div>
    </div>
  );
}

/* ---------------- DRAWER ---------------- */
function CpDrawer({ open, onClose, children, width = 540 }: any) {
  return (
    <React.Fragment>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(28,26,34,.45)', zIndex: 80, opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none', transition: 'opacity .2s ease' } as React.CSSProperties} />
      <div className="cp-drawer" style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width, maxWidth: '100vw', background: '#fff', zIndex: 81, boxShadow: 'var(--shadow-lg)', transform: open ? 'translateX(0)' : 'translateX(100%)', transition: 'transform .26s cubic-bezier(.2,.7,.3,1)', display: 'flex', flexDirection: 'column' } as React.CSSProperties}>
        {open && children}
      </div>
    </React.Fragment>
  );
}
function CpField({ l, v, tone }: any) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, padding: '9px 0', borderBottom: `1px solid ${cp.g100}` }}>
      <span style={{ fontSize: 13, color: cp.g500, flexShrink: 0 }}>{l}</span>
      <span style={{ fontSize: 13.5, fontWeight: 600, color: tone || cp.ink, textAlign: 'right' }}>{v}</span>
    </div>
  );
}

/* ---------------- CAPTURE DETAIL ---------------- */
function CpDetail({ cap, onClose }: any) {
  if (!cap) return null;
  const c = cap;
  const [stFg, stBg] = CAP_STATUS[c.status];
  return (
    <React.Fragment>
      <div style={{ padding: '20px 24px', borderBottom: `1px solid ${cp.g300}` }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <span style={{ width: 46, height: 46, borderRadius: 11, background: cp.lilac2, display: 'grid', placeItems: 'center', flexShrink: 0 }}><CIc n="building-2" s={22} c={cp.primary} /></span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: cp.ink, lineHeight: 1.2 }}>{c.imovel}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
              <CpBadge text={c.status} fg={stFg} bg={stBg} />
              <CpBadge text={c.origem} fg={ORIGIN_TONE[c.origem]} bg={`${ORIGIN_TONE[c.origem]}1A`} />
              <span style={{ fontSize: 12.5, color: cp.g500 }}>{c.regiao}</span>
            </div>
          </div>
          <button onClick={onClose} style={{ width: 34, height: 34, border: `1px solid ${cp.g300}`, background: '#fff', borderRadius: 9, display: 'grid', placeItems: 'center', cursor: 'pointer', flexShrink: 0 }}><CIc n="x" s={18} c={cp.g700} /></button>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <button style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, border: 'none', background: cp.primary, color: '#fff', borderRadius: 10, padding: '10px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 13 }}><CIc n="arrow-right" s={15} c="#fff" /> Avançar etapa</button>
          <button style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, border: `1px solid ${cp.g300}`, background: '#fff', color: cp.g700, borderRadius: 10, padding: '10px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13 }}><CIc n="file-text" s={15} c={cp.g700} /> Laudo AVM</button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
        {/* AVM */}
        <div style={{ marginBottom: 22, background: cp.lilac1, border: `1px solid ${cp.lilac2}`, borderRadius: 12, padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <CIc n="sparkles" s={17} c={cp.primary} /><span style={{ fontSize: 13.5, fontWeight: 700, color: cp.ink, flex: 1 }}>Avaliação AVM</span>
            <CpBadge text={`Confiança ${c.avmConf || 'Alta'}`} fg={cp.success} bg={cp.successBg} />
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, color: cp.primary }}>{c.avm}</div>
          <div style={{ fontSize: 12.5, color: cp.g500, marginTop: 2 }}>Faixa {c.avmFaixa || '—'}</div>
          <button style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6, border: `1px solid ${cp.g300}`, background: '#fff', color: cp.primary, borderRadius: 9, padding: '7px 12px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 12.5 }}><CIc n="layers" s={14} c={cp.primary} /> {c.avmComp || 8} comparáveis (ver)</button>
        </div>

        {/* dados imóvel */}
        <div style={{ marginBottom: 22 }}>
          <div style={cpSecLabel}>Dados do imóvel</div>
          <CpField l="Tipo" v={c.tipo} />
          <CpField l="Área" v={c.area || '—'} />
          <CpField l="Quartos" v={c.quartos || '—'} />
          <CpField l="Endereço (aprox.)" v={c.addr || '—'} />
          <CpField l="Características" v={c.carac || '—'} />
        </div>

        {/* proprietário */}
        <div style={{ marginBottom: 22 }}>
          <div style={cpSecLabel}>Proprietário</div>
          <CpField l="Nome" v={c.owner} />
          <CpField l="Contato" v={c.ownerContact || '—'} />
          <CpField l="Fonte" v={c.ownerSrc || '—'} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 8, fontSize: 11.5, color: cp.g500 }}><CIc n="lock" s={13} c={cp.g500} /> Acesso registrado · consumiu 1 crédito (LGPD).</div>
        </div>

        {/* radar why */}
        <div style={{ marginBottom: 22 }}>
          <div style={cpSecLabel}>Por que o Radar sinalizou</div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9, background: cp.page, borderRadius: 11, padding: '12px 14px', fontSize: 13, color: cp.g700, lineHeight: 1.5 }}>
            <CIc n="radar" s={16} c={cp.primary} style={{ marginTop: 1, flexShrink: 0 }} /> {c.radarWhy || 'Demanda na região + imóvel sem anúncio ativo.'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginTop: 8, background: cp.successBg, borderRadius: 11, padding: '12px 14px', fontSize: 13, color: cp.g700 }}>
            <CIc n="users" s={16} c={cp.success} /> <span><strong style={{ color: cp.ink }}>Demanda casada:</strong> {c.demanda || 'leads da rede querendo este perfil'}</span>
          </div>
        </div>

        {/* responsável + histórico */}
        <div>
          <div style={cpSecLabel}>Responsável & histórico</div>
          <CpField l="Responsável" v={c.broker ? `${c.unit} · ${c.broker}` : c.unit} />
          <CpField l="Há" v={`${c.days} dias`} />
          {c.history && (
            <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 0 }}>
              {c.history.map((h: any, i: number) => (
                <div key={i} style={{ display: 'flex', gap: 12 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ width: 30, height: 30, borderRadius: '50%', background: cp.lilac2, display: 'grid', placeItems: 'center', flexShrink: 0 }}><CIc n={h.ic} s={15} c={cp.primary} /></span>
                    {i < c.history.length - 1 && <span style={{ width: 1, flex: 1, background: cp.g300, marginTop: 2 }} />}
                  </div>
                  <div style={{ paddingBottom: 14 }}>
                    <div style={{ fontSize: 13, color: cp.ink }}>{h.d}</div>
                    <div style={{ fontSize: 12, color: cp.g500 }}>{h.t}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: '14px 24px', borderTop: `1px solid ${cp.g300}`, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button style={{ flex: 1, minWidth: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, border: 'none', background: cp.primary, color: '#fff', borderRadius: 10, padding: '11px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 13 }}><CIc n="eye" s={15} c="#fff" /> Ver proprietário (1 crédito)</button>
        <button style={{ flex: 1, minWidth: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, border: `1px solid ${cp.g300}`, background: '#fff', color: cp.g700, borderRadius: 10, padding: '11px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13 }}><CIc n="user-plus" s={15} c={cp.g700} /> Atribuir</button>
      </div>
    </React.Fragment>
  );
}

/* ---------------- PERIOD ---------------- */
function CpPeriod() {
  const [p, setP] = useStateCp('Este mês');
  const periods = ['Este mês', 'Trimestre', 'Ano'];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <CIc n="calendar" s={16} c={cp.g500} />
      <div style={{ display: 'flex', background: cp.g100, borderRadius: 999, padding: 3 }}>
        {periods.map(x => <button key={x} onClick={() => setP(x)} style={{ border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, padding: '7px 14px', borderRadius: 999, background: p === x ? '#fff' : 'transparent', color: p === x ? cp.primary : cp.g500, boxShadow: p === x ? 'var(--shadow-sm)' : 'none' }}>{x}</button>)}
      </div>
    </div>
  );
}

/* ---------------- PAGE ---------------- */
function CaptacaoPage() {
  const [selected, setSelected] = useStateCp<any>(null);
  return (
    <CeoChrome>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 30, letterSpacing: '-0.02em', margin: 0, color: cp.ink }}>Captação &amp; Radar</h1>
          <div style={{ fontSize: 13.5, color: cp.g500, marginTop: 4 }}>O lado da oferta — achar e captar imóvel com a inteligência do Radar</div>
        </div>
        <CpPeriod />
      </div>

      <CpSummary />
      <CpSupplyDemand />
      <CpFunnel />
      <CpTable onSelect={setSelected} />
      <div className="cp-2col"><CpCredits /><CpLgpd /></div>

      <CpDrawer open={!!selected} onClose={() => setSelected(null)}>
        <CpDetail cap={selected} onClose={() => setSelected(null)} />
      </CpDrawer>
    </div>
    </CeoChrome>
  );
}

export default CaptacaoPage;
