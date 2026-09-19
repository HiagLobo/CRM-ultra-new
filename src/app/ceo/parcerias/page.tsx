"use client";
import * as React from "react";
import CeoChrome, { ceoPalette, CIc } from "@/components/ceo/CeoChrome";
import { demo } from "@/config/demo";
const { useState, useEffect, useRef, useMemo, useCallback } = React;
const { useState: useStatePa } = React;

const pa: any = {
  ...ceoPalette,
  info: '#3E82E0', infoBg: '#E5EEFB',
  successBg: '#E6F4EC', warnBg: '#FBF1DC', errBg: '#FAE5E5',
  p3: '#818CF8',
};
const paCard = { background: '#fff', border: `1px solid ${pa.g300}`, borderRadius: 16 };
const paSecLabel = { fontSize: 11.5, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: pa.g500, margin: '0 0 12px' } as React.CSSProperties;

function PaBadge({ text, fg, bg }: any) {
  return <span style={{ fontSize: 12, fontWeight: 700, color: fg, background: bg, borderRadius: 999, padding: '3px 10px', whiteSpace: 'nowrap' } as React.CSSProperties}>{text}</span>;
}
function PaHead({ title, sub, right }: any) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 16, flexWrap: 'wrap' } as React.CSSProperties}>
      <div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: pa.ink }}>{title}</div>
        {sub && <div style={{ fontSize: 13, color: pa.g500, marginTop: 2 }}>{sub}</div>}
      </div>
      {right}
    </div>
  );
}

const PA_STATUS: any = {
  'Proposta': [pa.g700, pa.g100], 'Em negociação': [pa.warning, pa.warnBg], 'Fechada': [pa.success, pa.successBg], 'Perdida': [pa.error, pa.errBg],
};

/* ---------------- DATA ---------------- */
const DEALS: any[] = [
  {
    id: 'd1', imovel: 'Apto 3q Boa Viagem', buyer: 'Maria S.', sideImovel: `${demo.nomeCurto} Boa Viagem · Lucas F.`, sideBuyer: `${demo.nomeCurto} Recife Centro · Renata A.`, com: 'R$ 43,2 mil', split: '50/50', status: 'Em negociação', upd: '2 dias',
    imUnit: `${demo.nomeCurto} Boa Viagem`, imBroker: 'Lucas F.', bUnit: `${demo.nomeCurto} Recife Centro`, bBroker: 'Renata A.', valor: 'R$ 720 mil', comPct: '6%', each: 'R$ 21,6 mil',
    history: [{ t: 'há 5 dias', d: 'Match sugerido pelo Radar (92%)', ic: 'sparkles' }, { t: 'há 4 dias', d: 'Proposta de parceria enviada', ic: 'send' }, { t: 'há 3 dias', d: 'Acordo aceito pelas duas partes', ic: 'check' }, { t: 'há 2 dias', d: 'Em negociação com o comprador', ic: 'handshake' }],
  },
  { id: 'd2', imovel: 'Sala comercial Pina', buyer: 'Tech Ltda', sideImovel: `${demo.nomeCurto} Boa Viagem · Bruno T.`, sideBuyer: `${demo.nomeCurto} Caruaru · —`, com: 'R$ 58,8 mil', split: '50/50', status: 'Fechada', upd: '10 dias', imUnit: `${demo.nomeCurto} Boa Viagem`, imBroker: 'Bruno T.', bUnit: `${demo.nomeCurto} Caruaru`, bBroker: '—', valor: 'R$ 980 mil', comPct: '6%', each: 'R$ 29,4 mil' },
  { id: 'd3', imovel: 'Cobertura Boa Viagem', buyer: '(lead)', sideImovel: `${demo.nomeCurto} Boa Viagem · Lucas F.`, sideBuyer: 'independente · Carla', com: 'R$ 144 mil', split: '60/40', status: 'Proposta', upd: '1 dia', imUnit: `${demo.nomeCurto} Boa Viagem`, imBroker: 'Lucas F.', bUnit: 'Independente', bBroker: 'Carla', valor: 'R$ 2,4 mi', comPct: '6%', each: 'R$ 86,4 mil / R$ 57,6 mil' },
  { id: 'd4', imovel: 'Casa Casa Forte', buyer: '(lead)', sideImovel: `${demo.nomeCurto} Recife Centro · Renata A.`, sideBuyer: 'independente · João', com: 'R$ 72 mil', split: '50/50', status: 'Em negociação', upd: '4 dias', imUnit: `${demo.nomeCurto} Recife Centro`, imBroker: 'Renata A.', bUnit: 'Independente', bBroker: 'João', valor: 'R$ 1,2 mi', comPct: '6%', each: 'R$ 36 mil' },
];

const WALL: any[] = [
  { tag: 'Procura imóvel', tagTone: 'info', txt: 'Comprador p/ apto 3q Boa Viagem até R$ 800 mil', who: `${demo.nomeCurto} Recife Centro · Renata A.` },
  { tag: 'Aceita parceria', tagTone: 'success', txt: 'Apto 3q Boa Viagem · R$ 720 mil · aceita parceria', who: `${demo.nomeCurto} Boa Viagem · Lucas F.` },
  { tag: 'Procura imóvel', tagTone: 'info', txt: 'Comprador p/ casa Casa Forte até R$ 1,3 mi', who: 'Independente · João' },
];
const MATCHES: any[] = [
  { pct: 92, dem: 'Comprador apto 3q Boa Viagem', demWho: `${demo.nomeCurto} Recife Centro · Renata A.`, of: 'Apto 3q Boa Viagem · R$ 720 mil', ofWho: `${demo.nomeCurto} Boa Viagem · Lucas F.` },
  { pct: 85, dem: 'Comprador casa Casa Forte', demWho: 'Independente · João', of: 'Casa Casa Forte · R$ 1,2 mi', ofWho: `${demo.nomeCurto} Recife Centro · Renata A.` },
];

const PARTNERS: any[] = [
  { cat: 'Financiamento', ic: 'landmark', n: 3, names: 'Banco parceiro A · Financeira parceira B', fee: '0,8% do crédito', vis: 'Todas as unidades', tone: pa.primary },
  { cat: 'Seguros (fiança/residencial)', ic: 'shield', n: 2, names: 'Seguradora parceira A · Seguradora parceira B', fee: '15% da apólice', vis: 'Todas', tone: pa.info },
  { cat: 'Reforma & design', ic: 'paintbrush', n: 2, names: 'Empreiteira parceira A · Estúdio parceiro B', fee: 'R$ 200 / indicação', vis: 'Franquia+', tone: pa.p3 },
  { cat: 'Mudança', ic: 'truck', n: 1, names: 'Transportadora parceira', fee: 'R$ 80 / indicação', vis: 'Todas', tone: pa.warning },
  { cat: 'Jurídico', ic: 'scale', n: 1, names: 'Escritório jurídico parceiro', fee: 'R$ 150 / caso', vis: 'Todas', tone: pa.g700 },
  { cat: 'Avaliação / vistoria', ic: 'clipboard-check', n: 1, names: 'Vistoriadora parceira', fee: 'R$ 120 / laudo', vis: 'Todas', tone: pa.success },
  { cat: 'Construtoras / Lançamentos', ic: 'building-2', n: 4, names: 'Construtoras parceiras A · B · C · D', fee: 'até 5% VGV', vis: 'Franquia+', tone: pa.primary, note: 'VGV ativo R$ 38 mi' },
];

/* ---------------- SUMMARY ---------------- */
function PaSummary() {
  const cards = [
    { l: 'Parcerias fechadas', v: '24', ic: 'handshake', hl: true },
    { l: 'Em negociação', v: '18', ic: 'messages-square', tone: pa.warning },
    { l: 'Comissão em parcerias', v: 'R$ 870 mil', ic: 'wallet', tone: pa.primary },
    { l: 'Parceiros externos ativos', v: '14', ic: 'store', tone: pa.info },
    { l: 'Receita de indicação', v: 'R$ 62 mil', ic: 'gift', tone: pa.success },
    { l: 'Demandas abertas (mural)', v: '36', ic: 'megaphone', tone: pa.primary },
  ];
  return (
    <div className="pa-summary">
      {cards.map(c => (
        <div key={c.l} style={{ background: c.hl ? `linear-gradient(135deg, ${pa.primary}, ${pa.deep})` : '#fff', border: c.hl ? 'none' : `1px solid ${pa.g300}`, borderRadius: 14, padding: 15, boxShadow: c.hl ? 'var(--shadow-purple)' : 'none', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 30, height: 30, borderRadius: 8, background: c.hl ? 'rgba(255,255,255,.18)' : pa.lilac2, display: 'grid', placeItems: 'center', flexShrink: 0 }}><CIc n={c.ic} s={15} c={c.hl ? '#fff' : (c.tone || pa.primary)} /></span>
            <span style={{ fontSize: 11.5, fontWeight: 600, color: c.hl ? 'rgba(255,255,255,.85)' : pa.g500, lineHeight: 1.25 }}>{c.l}</span>
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 21, lineHeight: 1.15, color: c.hl ? '#fff' : pa.ink, marginTop: 11 }}>{c.v}</div>
        </div>
      ))}
    </div>
  );
}

/* ---------------- MURAL & MATCHES ---------------- */
function PaWall() {
  const [auto, setAuto] = useStatePa(true);
  const tagTones: any = { info: [pa.info, pa.infoBg], success: [pa.success, pa.successBg] };
  return (
    <div style={{ ...paCard, padding: 22 }}>
      <PaHead title="Co-corretagem da rede" sub="O efeito de rede: comprador de uma unidade × imóvel de outra" />
      <div className="pa-wall-grid">
        {/* mural */}
        <div>
          <div style={paSecLabel}>Mural de demandas & ofertas</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 } as React.CSSProperties}>
            {WALL.map((w, i) => {
              const [tFg, tBg] = tagTones[w.tagTone];
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 11, padding: '12px 14px', background: pa.page, border: `1px solid ${pa.g300}`, borderRadius: 11 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <PaBadge text={w.tag} fg={tFg} bg={tBg} />
                    <div style={{ fontSize: 13.5, color: pa.ink, marginTop: 7, lineHeight: 1.4 }}>{w.txt}</div>
                    <div style={{ fontSize: 12, color: pa.g500, marginTop: 3 }}>{w.who}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {/* matches + rules */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 } as React.CSSProperties}>
          <div>
            <div style={paSecLabel}>Matches sugeridos (entre unidades)</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 } as React.CSSProperties}>
              {MATCHES.map((m, i) => (
                <div key={i} style={{ background: pa.lilac1, border: `1px solid ${pa.lilac2}`, borderRadius: 12, padding: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, color: pa.success }}>{m.pct}%</span>
                    <span style={{ fontSize: 12, color: pa.g500 }}>de aderência</span>
                    <button style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5, border: 'none', background: pa.primary, color: '#fff', borderRadius: 9, padding: '6px 12px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 12.5 }}>Abrir parceria</button>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, color: pa.info, fontWeight: 700 }}>DEMANDA</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: pa.ink, lineHeight: 1.3 }}>{m.dem}</div>
                      <div style={{ fontSize: 11.5, color: pa.g500 }}>{m.demWho}</div>
                    </div>
                    <CIc n="arrow-left-right" s={18} c={pa.primary} />
                    <div style={{ flex: 1, minWidth: 0, textAlign: 'right' } as React.CSSProperties}>
                      <div style={{ fontSize: 11, color: pa.success, fontWeight: 700 }}>OFERTA</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: pa.ink, lineHeight: 1.3 }}>{m.of}</div>
                      <div style={{ fontSize: 11.5, color: pa.g500 }}>{m.ofWho}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div style={paSecLabel}>Regras de co-corretagem</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 } as React.CSSProperties}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: pa.page, borderRadius: 10 }}>
                <CIc n="split" s={16} c={pa.primary} /><span style={{ flex: 1, fontSize: 13, color: pa.g700 }}>Split padrão entre unidades</span><strong style={{ fontSize: 13.5, color: pa.ink }}>50/50</strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: pa.page, borderRadius: 10 }}>
                <CIc n="zap" s={16} c={pa.primary} /><span style={{ flex: 1, fontSize: 13, color: pa.g700 }}>Aprovação automática no match</span>
                <button onClick={() => setAuto((v: any) => !v)} style={{ width: 40, height: 23, borderRadius: 999, border: 'none', background: auto ? pa.success : pa.g300, position: 'relative', cursor: 'pointer', flexShrink: 0 } as React.CSSProperties}><span style={{ position: 'absolute', top: 3, left: auto ? 20 : 3, width: 17, height: 17, borderRadius: '50%', background: '#fff', transition: 'left .15s ease' } as React.CSSProperties} /></button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: pa.page, borderRadius: 10 }}>
                <CIc n="scale" s={16} c={pa.primary} /><span style={{ flex: 1, fontSize: 13, color: pa.g700 }}>Disputa</span><strong style={{ fontSize: 13.5, color: pa.ink }}>→ Jurídico</strong>
              </div>
              <button style={{ alignSelf: 'flex-start', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6, border: 'none', background: pa.primary, color: '#fff', borderRadius: 10, padding: '9px 16px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 13 }}><CIc n="save" s={15} c="#fff" /> Salvar regras</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- SELECT ---------------- */
function PaSelect({ value, onChange, options, icon }: any) {
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' } as React.CSSProperties}>
      {icon && <span style={{ position: 'absolute', left: 12, pointerEvents: 'none', display: 'flex' } as React.CSSProperties}><CIc n={icon} s={15} c={pa.g500} /></span>}
      <select value={value} onChange={e => onChange(e.target.value)} style={{ appearance: 'none', WebkitAppearance: 'none', border: `1px solid ${pa.g300}`, background: '#fff', borderRadius: 10, padding: icon ? '9px 32px 9px 34px' : '9px 32px 9px 13px', fontFamily: 'var(--font-body)', fontSize: 13.5, fontWeight: 600, color: pa.ink, cursor: 'pointer', outline: 'none' } as React.CSSProperties}>
        {options.map((o: any) => <option key={o} value={o}>{o}</option>)}
      </select>
      <span style={{ position: 'absolute', right: 11, pointerEvents: 'none', display: 'flex' } as React.CSSProperties}><CIc n="chevron-down" s={15} c={pa.g500} /></span>
    </div>
  );
}

/* ---------------- DEALS TABLE ---------------- */
function PaTable({ onSelect }: any) {
  const [q, setQ] = useStatePa('');
  const [fStatus, setFStatus] = useStatePa('Todos os status');
  const rows = DEALS.filter(d =>
    (q === '' || (d.imovel + d.buyer + d.sideImovel + d.sideBuyer).toLowerCase().includes(q.toLowerCase())) &&
    (fStatus === 'Todos os status' || d.status === fStatus)
  );
  const cols = ['Imóvel', 'Comprador', 'Lado imóvel', 'Lado comprador', 'Comissão', 'Split', 'Status', 'Atualizado'];
  return (
    <div style={{ ...paCard, padding: 22 }}>
      <PaHead title="Parcerias" sub={`${rows.length} de ${DEALS.length} negócios em parceria`} />
      <div className="pa-filters">
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: pa.g100, borderRadius: 10, padding: '0 13px', height: 40, flex: 1, minWidth: 180 }}>
          <CIc n="search" s={17} c={pa.g500} />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar imóvel, comprador, unidade…" style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontFamily: 'var(--font-body)', fontSize: 13.5, color: pa.ink }} />
        </div>
        <PaSelect icon="activity" value={fStatus} onChange={setFStatus} options={['Todos os status', 'Proposta', 'Em negociação', 'Fechada', 'Perdida']} />
      </div>

      <div className="pa-table-wrap" style={{ overflowX: 'auto', marginTop: 18 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 960 } as React.CSSProperties}>
          <thead><tr>
            {cols.map(h => <th key={h} style={{ textAlign: h === 'Comissão' ? 'right' : 'left', fontSize: 11, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: pa.g500, padding: '0 12px 12px', borderBottom: `1px solid ${pa.g300}`, whiteSpace: 'nowrap' } as React.CSSProperties}>{h}</th>)}
          </tr></thead>
          <tbody>
            {rows.map(d => {
              const [stFg, stBg] = PA_STATUS[d.status];
              return (
                <tr key={d.id} onClick={() => onSelect(d)} style={{ borderBottom: `1px solid ${pa.g100}`, cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = pa.lilac1}
                  onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                  <td style={{ padding: '13px 12px', fontSize: 14, fontWeight: 600, color: pa.ink, whiteSpace: 'nowrap' } as React.CSSProperties}>{d.imovel}</td>
                  <td style={{ padding: '13px 12px', fontSize: 13, color: pa.g700, whiteSpace: 'nowrap' } as React.CSSProperties}>{d.buyer}</td>
                  <td style={{ padding: '13px 12px', fontSize: 12.5, color: pa.g700, whiteSpace: 'nowrap' } as React.CSSProperties}>{d.sideImovel}</td>
                  <td style={{ padding: '13px 12px', fontSize: 12.5, color: pa.g700, whiteSpace: 'nowrap' } as React.CSSProperties}>{d.sideBuyer}</td>
                  <td style={{ padding: '13px 12px', textAlign: 'right', fontSize: 14, fontWeight: 600, color: pa.ink, whiteSpace: 'nowrap' } as React.CSSProperties}>{d.com}</td>
                  <td style={{ padding: '13px 12px' }}><PaBadge text={d.split} fg={pa.primary} bg={pa.lilac2} /></td>
                  <td style={{ padding: '13px 12px' }}><PaBadge text={d.status} fg={stFg} bg={stBg} /></td>
                  <td style={{ padding: '13px 12px', fontSize: 13, color: pa.g500, whiteSpace: 'nowrap' } as React.CSSProperties}>{d.upd}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="pa-table-cards" style={{ marginTop: 18, flexDirection: 'column', gap: 12 } as React.CSSProperties}>
        {rows.map(d => {
          const [stFg, stBg] = PA_STATUS[d.status];
          return (
            <button key={d.id} onClick={() => onSelect(d)} style={{ ...paCard, background: pa.page, padding: 16, textAlign: 'left', cursor: 'pointer', fontFamily: 'var(--font-body)', width: '100%' } as React.CSSProperties}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 14.5, fontWeight: 600, color: pa.ink }}>{d.imovel}</span>
                <PaBadge text={d.status} fg={stFg} bg={stBg} />
              </div>
              <div style={{ fontSize: 12, color: pa.g500, marginBottom: 4 }}>🏠 {d.sideImovel}</div>
              <div style={{ fontSize: 12, color: pa.g500, marginBottom: 10 }}>👤 {d.sideBuyer}</div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' } as React.CSSProperties}>
                <div><div style={{ fontSize: 11, color: pa.g500 }}>Comissão</div><div style={{ fontSize: 13, fontWeight: 600, color: pa.ink }}>{d.com}</div></div>
                <PaBadge text={d.split} fg={pa.primary} bg={pa.lilac2} />
                <span style={{ fontSize: 12, color: pa.g500, marginLeft: 'auto' }}>{d.upd}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- PARTNERS CATALOG ---------------- */
function PaPartners() {
  return (
    <div>
      <PaHead title="Catálogo de parceiros externos" sub="Credenciados pelo CEO por categoria · 14 ativos" right={<button style={{ display: 'flex', alignItems: 'center', gap: 7, border: 'none', background: pa.primary, color: '#fff', borderRadius: 10, padding: '10px 16px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 13.5, boxShadow: 'var(--shadow-purple)', whiteSpace: 'nowrap' } as React.CSSProperties}><CIc n="plus" s={16} c="#fff" /> Novo parceiro</button>} />
      <div className="pa-partners">
        {PARTNERS.map(p => (
          <div key={p.cat} style={{ ...paCard, padding: 18, position: 'relative' } as React.CSSProperties}>
            <button title="Editar" style={{ position: 'absolute', top: 14, right: 14, width: 28, height: 28, border: `1px solid ${pa.g300}`, background: '#fff', borderRadius: 8, display: 'grid', placeItems: 'center', cursor: 'pointer' } as React.CSSProperties}><CIc n="pencil" s={14} c={pa.g500} /></button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 38, height: 38, borderRadius: 10, background: `${p.tone}1A`, display: 'grid', placeItems: 'center', flexShrink: 0 }}><CIc n={p.ic} s={19} c={p.tone} /></span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: pa.ink, lineHeight: 1.25 }}>{p.cat}</div>
                <div style={{ fontSize: 12, color: pa.g500 }}>{p.n} {p.n === 1 ? 'parceiro' : 'parceiros'} ativos</div>
              </div>
            </div>
            <div style={{ fontSize: 12.5, color: pa.g700, marginTop: 12, lineHeight: 1.4 }}>{p.names}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 12, paddingTop: 12, borderTop: `1px solid ${pa.g100}` } as React.CSSProperties}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5 }}><span style={{ color: pa.g500 }}>Taxa de indicação</span><strong style={{ color: pa.ink }}>{p.fee}</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5 }}><span style={{ color: pa.g500 }}>Visibilidade</span><span style={{ color: pa.g700, fontWeight: 600 }}>{p.vis}</span></div>
              {p.note && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5 }}><span style={{ color: pa.g500 }}>Lançamentos</span><span style={{ color: pa.success, fontWeight: 600 }}>{p.note}</span></div>}
            </div>
            <div style={{ marginTop: 12 }}><PaBadge text="Ativo" fg={pa.success} bg={pa.successBg} /></div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- PERFORMANCE ---------------- */
function PaPerformance() {
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
  const vals = [410, 520, 580, 690, 760, 870];
  const max = 1000;
  const W = 440, H = 170, padL = 32, padB = 24, padT = 8;
  const gw = (W - padL) / months.length;
  const y = (v: any) => padT + (1 - v / max) * (H - padB - padT);
  const cats: any[] = [['Financiamento', 'R$ 34 mil', 34], ['Seguros', 'R$ 14 mil', 14], ['Lançamentos', 'R$ 10 mil', 10], ['Demais', 'R$ 4 mil', 4]];
  const maxCat = 34;
  return (
    <div style={{ ...paCard, padding: 22 }}>
      <PaHead title="Receita & desempenho de parcerias" sub="Co-corretagem e receita de indicação" />
      <div className="pa-perf-grid">
        <div>
          <div style={{ fontSize: 12, color: pa.g500, marginBottom: 8 }}>Comissão de co-corretagem (R$ mil)</div>
          <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="170" preserveAspectRatio="none">
            {[0, 250, 500, 750, 1000].map(g => (<g key={g}><line x1={padL} x2={W} y1={y(g)} y2={y(g)} stroke={pa.g100} strokeWidth="1" /><text x={padL - 5} y={y(g) + 3} textAnchor="end" fontSize="8.5" fill={pa.g500} fontFamily="var(--font-body)">{g}</text></g>))}
            {vals.map((v, i) => { const cx = padL + gw * i + gw / 2; return <g key={i}><rect x={cx - 13} y={y(v)} width={26} height={y(0) - y(v)} rx="4" fill={pa.primary} /><text x={cx} y={H - 8} textAnchor="middle" fontSize="9.5" fill={pa.g500} fontFamily="var(--font-body)">{months[i]}</text></g>; })}
          </svg>
        </div>
        <div>
          <div style={{ fontSize: 12, color: pa.g500, marginBottom: 10 }}>Receita de indicação por categoria</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 } as React.CSSProperties}>
            {cats.map(([l, val, v]) => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 96, fontSize: 12.5, color: pa.g700, flexShrink: 0 }}>{l}</span>
                <div style={{ flex: 1, height: 14, background: pa.g100, borderRadius: 5, overflow: 'hidden' }}><div style={{ width: `${(v / maxCat) * 100}%`, height: '100%', background: l === 'Financiamento' ? pa.success : pa.p3, borderRadius: 5 }} /></div>
                <span style={{ width: 60, textAlign: 'right', fontSize: 12.5, fontWeight: 700, color: pa.ink } as React.CSSProperties}>{val}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' } as React.CSSProperties}>
            <div style={{ flex: 1, minWidth: 130, background: pa.page, borderRadius: 10, padding: '10px 12px' }}>
              <div style={{ fontSize: 11, color: pa.g500 }}>Top unidades</div>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: pa.ink, marginTop: 2 }}>{demo.nomeCurto} Boa Viagem · {demo.nomeCurto} Recife Centro</div>
            </div>
            <div style={{ flex: 1, minWidth: 130, background: pa.page, borderRadius: 10, padding: '10px 12px' }}>
              <div style={{ fontSize: 11, color: pa.g500 }}>Top parceiros</div>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: pa.ink, marginTop: 2 }}>Banco parceiro A · Seguradora parceira A</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- DRAWER ---------------- */
function PaDrawer({ open, onClose, children, width = 520 }: any) {
  return (
    <React.Fragment>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(28,26,34,.45)', zIndex: 80, opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none', transition: 'opacity .2s ease' } as React.CSSProperties} />
      <div className="pa-drawer" style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width, maxWidth: '100vw', background: '#fff', zIndex: 81, boxShadow: 'var(--shadow-lg)', transform: open ? 'translateX(0)' : 'translateX(100%)', transition: 'transform .26s cubic-bezier(.2,.7,.3,1)', display: 'flex', flexDirection: 'column' } as React.CSSProperties}>
        {open && children}
      </div>
    </React.Fragment>
  );
}

/* ---------------- DEAL DETAIL ---------------- */
function PaDetail({ deal, onClose }: any) {
  if (!deal) return null;
  const d = deal;
  const [stFg, stBg] = PA_STATUS[d.status];
  return (
    <React.Fragment>
      <div style={{ padding: '20px 24px', borderBottom: `1px solid ${pa.g300}` }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <span style={{ width: 46, height: 46, borderRadius: 11, background: pa.lilac2, display: 'grid', placeItems: 'center', flexShrink: 0 }}><CIc n="handshake" s={22} c={pa.primary} /></span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: pa.ink, lineHeight: 1.2 }}>{d.imovel}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
              <PaBadge text={d.status} fg={stFg} bg={stBg} />
              <PaBadge text={`Split ${d.split}`} fg={pa.primary} bg={pa.lilac2} />
            </div>
          </div>
          <button onClick={onClose} style={{ width: 34, height: 34, border: `1px solid ${pa.g300}`, background: '#fff', borderRadius: 9, display: 'grid', placeItems: 'center', cursor: 'pointer', flexShrink: 0 } as React.CSSProperties}><CIc n="x" s={18} c={pa.g700} /></button>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <button style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, border: 'none', background: pa.primary, color: '#fff', borderRadius: 10, padding: '10px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 13.5 }}><CIc n="arrow-right" s={16} c="#fff" /> Avançar etapa</button>
          <button style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, border: `1px solid ${pa.g300}`, background: '#fff', color: pa.g700, borderRadius: 10, padding: '10px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13.5 }}><CIc n="file-text" s={16} c={pa.g700} /> Ver acordo</button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' } as React.CSSProperties}>
        {/* dois lados */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 22 }}>
          <div style={{ flex: 1, background: pa.page, borderRadius: 12, padding: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}><CIc n="home" s={15} c={pa.primary} /><span style={{ fontSize: 11, fontWeight: 700, color: pa.primary }}>LADO IMÓVEL</span></div>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: pa.ink }}>{d.imUnit}</div>
            <div style={{ fontSize: 12.5, color: pa.g500 }}>{d.imBroker} · captou</div>
          </div>
          <div style={{ flex: 1, background: pa.page, borderRadius: 12, padding: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}><CIc n="user" s={15} c={pa.info} /><span style={{ fontSize: 11, fontWeight: 700, color: pa.info }}>LADO COMPRADOR</span></div>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: pa.ink }}>{d.bUnit}</div>
            <div style={{ fontSize: 12.5, color: pa.g500 }}>{d.bBroker} · tem o lead</div>
          </div>
        </div>

        <div style={{ marginBottom: 22 }}>
          <div style={paSecLabel}>O negócio</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, padding: '9px 0', borderBottom: `1px solid ${pa.g100}` }}><span style={{ fontSize: 13, color: pa.g500 }}>Imóvel</span><span style={{ fontSize: 13.5, fontWeight: 600, color: pa.ink }}>{d.imovel}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, padding: '9px 0', borderBottom: `1px solid ${pa.g100}` }}><span style={{ fontSize: 13, color: pa.g500 }}>Valor</span><span style={{ fontSize: 13.5, fontWeight: 600, color: pa.ink }}>{d.valor}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, padding: '9px 0', borderBottom: `1px solid ${pa.g100}` }}><span style={{ fontSize: 13, color: pa.g500 }}>Comissão total ({d.comPct})</span><span style={{ fontSize: 13.5, fontWeight: 700, color: pa.primary }}>{d.com}</span></div>
        </div>

        <div style={{ marginBottom: 22 }}>
          <div style={paSecLabel}>Divisão</div>
          <div style={{ display: 'flex', height: 38, borderRadius: 10, overflow: 'hidden', marginBottom: 10 }}>
            <div style={{ width: d.split === '60/40' ? '60%' : '50%', background: pa.primary, display: 'flex', alignItems: 'center', paddingLeft: 12, color: '#fff', fontWeight: 700, fontSize: 12.5 }}>Imóvel {d.split.split('/')[0]}%</div>
            <div style={{ flex: 1, background: pa.p3, display: 'flex', alignItems: 'center', paddingLeft: 12, color: '#fff', fontWeight: 700, fontSize: 12.5 }}>Comprador {d.split.split('/')[1]}%</div>
          </div>
          <div style={{ fontSize: 13, color: pa.g700 }}>Cada lado: <strong style={{ color: pa.ink }}>{d.each}</strong></div>
          <div style={{ fontSize: 11.5, color: pa.g500, marginTop: 4 }}>Cada unidade ainda aplica seu 60/40 interno (corretor/rede).</div>
        </div>

        <div style={{ marginBottom: 22 }}>
          <div style={paSecLabel}>Governança</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: pa.successBg, borderRadius: 10, padding: '11px 14px', fontSize: 13, color: pa.g700 }}><CIc n="check-circle" s={16} c={pa.success} /> Acordo aceito pelas duas partes · sem disputa.</div>
        </div>

        {d.history && (
          <div>
            <div style={paSecLabel}>Histórico</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 } as React.CSSProperties}>
              {d.history.map((h: any, i: any) => (
                <div key={i} style={{ display: 'flex', gap: 12 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' } as React.CSSProperties}>
                    <span style={{ width: 30, height: 30, borderRadius: '50%', background: pa.lilac2, display: 'grid', placeItems: 'center', flexShrink: 0 }}><CIc n={h.ic} s={15} c={pa.primary} /></span>
                    {i < d.history.length - 1 && <span style={{ width: 1, flex: 1, background: pa.g300, marginTop: 2 }} />}
                  </div>
                  <div style={{ paddingBottom: 14 }}>
                    <div style={{ fontSize: 13, color: pa.ink }}>{h.d}</div>
                    <div style={{ fontSize: 12, color: pa.g500 }}>{h.t}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: '14px 24px', borderTop: `1px solid ${pa.g300}`, display: 'flex', gap: 10 }}>
        <button style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, border: 'none', background: pa.primary, color: '#fff', borderRadius: 10, padding: '11px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 13 }}><CIc n="arrow-right" s={15} c="#fff" /> Avançar</button>
        <button style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, border: `1px solid ${pa.g300}`, background: '#fff', color: pa.g700, borderRadius: 10, padding: '11px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13 }}><CIc n="file-text" s={15} c={pa.g700} /> Acordo</button>
        <button style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, border: `1px solid ${pa.errBg}`, background: pa.errBg, color: pa.error, borderRadius: 10, padding: '11px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13 }}><CIc n="flag" s={15} c={pa.error} /> Disputa</button>
      </div>
    </React.Fragment>
  );
}

/* ---------------- PERIOD ---------------- */
function PaPeriod() {
  const [p, setP] = useStatePa('Este mês');
  const periods = ['Este mês', 'Trimestre', 'Ano'];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <CIc n="calendar" s={16} c={pa.g500} />
      <div style={{ display: 'flex', background: pa.g100, borderRadius: 999, padding: 3 }}>
        {periods.map(x => <button key={x} onClick={() => setP(x)} style={{ border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, padding: '7px 14px', borderRadius: 999, background: p === x ? '#fff' : 'transparent', color: p === x ? pa.primary : pa.g500, boxShadow: p === x ? 'var(--shadow-sm)' : 'none' }}>{x}</button>)}
      </div>
    </div>
  );
}

/* ---------------- PAGE ---------------- */
export default function ParceriasPage() {
  const [selected, setSelected] = useStatePa(null);
  return (
    <CeoChrome>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 } as React.CSSProperties}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap' } as React.CSSProperties}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 30, letterSpacing: '-0.02em', margin: 0, color: pa.ink }}>Parcerias</h1>
          <div style={{ fontSize: 13.5, color: pa.g500, marginTop: 4 }}>Co-corretagem da rede e marketplace de parceiros externos</div>
        </div>
        <PaPeriod />
      </div>

      <PaSummary />
      <PaWall />
      <PaTable onSelect={setSelected} />
      <PaPartners />
      <PaPerformance />

      <PaDrawer open={!!selected} onClose={() => setSelected(null)}>
        <PaDetail deal={selected} onClose={() => setSelected(null)} />
      </PaDrawer>
    </div>
    </CeoChrome>
  );
}
