"use client";
import * as React from "react";
import CeoChrome, { ceoPalette, CIc } from "@/components/ceo/CeoChrome";
import { demo } from "@/config/demo";
const { useState, useEffect, useRef, useMemo, useCallback } = React;
const { useState: useStateSc } = React;

const sc: any = {
  ...ceoPalette,
  info: '#3E82E0', infoBg: '#E5EEFB',
  successBg: '#E6F4EC', warnBg: '#FBF1DC', errBg: '#FAE5E5',
  p3: '#818CF8', p4: '#C79BDD',
};
const scCard = { background: '#fff', border: `1px solid ${sc.g300}`, borderRadius: 16 };
const scSecLabel = { fontSize: 11.5, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: sc.g500, margin: '0 0 12px' };

function ScBadge({ text, fg, bg }: any) {
  return <span style={{ fontSize: 12, fontWeight: 700, color: fg, background: bg, borderRadius: 999, padding: '3px 10px', whiteSpace: 'nowrap' } as React.CSSProperties}>{text}</span>;
}
function ScHead({ title, sub, right }: any) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 16, flexWrap: 'wrap' } as React.CSSProperties}>
      <div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: sc.ink }}>{title}</div>
        {sub && <div style={{ fontSize: 13, color: sc.g500, marginTop: 2 }}>{sub}</div>}
      </div>
      {right}
    </div>
  );
}

const PILLAR_COLOR = [sc.primary, sc.light, sc.p3, sc.p4, sc.warning];
const TIERS = [
  { l: 'Atenção', range: '0–400', tone: sc.error, bg: sc.errBg, benefits: 'Plano de ação obrigatório · menor prioridade em leads' },
  { l: 'Em desenvolvimento', range: '400–650', tone: sc.warning, bg: sc.warnBg, benefits: 'Prioridade normal em leads' },
  { l: 'Consolidado', range: '650–850', tone: sc.success, bg: sc.successBg, benefits: 'Prioridade alta em leads · selo no perfil' },
  { l: 'Elite', range: '850–1000', tone: sc.primary, bg: sc.lilac2, benefits: 'Prioridade máxima · antecipação de comissão · créditos extras' },
];
function tierOf(score: any) { if (score >= 850) return TIERS[3]; if (score >= 650) return TIERS[2]; if (score >= 400) return TIERS[1]; return TIERS[0]; }

/* ---------------- SUMMARY ---------------- */
function ScSummary() {
  const cards = [
    { l: 'Score médio da rede', v: '642', ic: 'gauge', hl: true },
    { l: '% na meta (Consolidado+)', v: '43%', ic: 'target', tone: sc.success },
    { l: 'Corretores Elite', v: '18', ic: 'crown', tone: sc.primary },
    { l: 'Corretores em Atenção', v: '22', ic: 'alert-triangle', tone: sc.error },
    { l: 'Evolução', v: '+18', ic: 'trending-up', tone: sc.success },
    { l: 'Corretores ativos', v: '190', ic: 'users', tone: sc.primary },
  ];
  return (
    <div className="sc-summary">
      {cards.map((c: any) => (
        <div key={c.l} style={{ background: c.hl ? `linear-gradient(135deg, ${sc.primary}, ${sc.deep})` : '#fff', border: c.hl ? 'none' : `1px solid ${sc.g300}`, borderRadius: 14, padding: 15, boxShadow: c.hl ? 'var(--shadow-purple)' : 'none', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 30, height: 30, borderRadius: 8, background: c.hl ? 'rgba(255,255,255,.18)' : sc.lilac2, display: 'grid', placeItems: 'center', flexShrink: 0 }}><CIc n={c.ic} s={15} c={c.hl ? '#fff' : (c.tone || sc.primary)} /></span>
            <span style={{ fontSize: 11.5, fontWeight: 600, color: c.hl ? 'rgba(255,255,255,.85)' : sc.g500, lineHeight: 1.25 }}>{c.l}</span>
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 21, lineHeight: 1.15, color: c.hl ? '#fff' : sc.ink, marginTop: 11 }}>{c.v}{c.l === 'Evolução' && <span style={{ fontSize: 12, fontWeight: 600, color: c.hl ? 'rgba(255,255,255,.7)' : sc.g500 }}> pts</span>}</div>
        </div>
      ))}
    </div>
  );
}

/* ---------------- PILLARS & WEIGHTS ---------------- */
function ScWeights() {
  const [w, setW] = useStateSc([
    { l: 'Resultados', v: 300 }, { l: 'Atendimento / Qualidade', v: 250 }, { l: 'Carteira', v: 200 }, { l: 'CRM', v: 150 }, { l: 'Disciplina / Planejamento', v: 100 },
  ]);
  const total = w.reduce((s: any, x: any) => s + x.v, 0);
  const setVal = (i: any, val: any) => setW((arr: any) => arr.map((x: any, j: any) => j === i ? { ...x, v: Math.max(0, Math.min(1000, parseInt(val) || 0)) } : x));
  // donut
  let off = 25;
  return (
    <div style={{ ...scCard, padding: 22 }}>
      <ScHead title="Modelo do Score: pilares & pesos" sub="Resultado pesa mais que burocracia · ajuste sem código" right={
        <span style={{ fontSize: 13, fontWeight: 700, color: total === 1000 ? sc.success : sc.error, background: total === 1000 ? sc.successBg : sc.errBg, padding: '6px 14px', borderRadius: 999, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <CIc n={total === 1000 ? 'check' : 'alert-triangle'} s={15} /> Total: {total} / 1000
        </span>
      } />
      <div className="sc-weights-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 } as React.CSSProperties}>
          {w.map((p: any, i: any) => (
            <div key={p.l}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 7 }}>
                <span style={{ width: 10, height: 10, borderRadius: 3, background: PILLAR_COLOR[i], flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600, color: sc.ink }}>{p.l}</span>
                <input value={p.v} onChange={e => setVal(i, e.target.value)} style={{ width: 56, border: `1px solid ${sc.g300}`, borderRadius: 8, padding: '5px 8px', fontFamily: 'var(--font-body)', fontSize: 13.5, fontWeight: 700, color: sc.ink, textAlign: 'center', outline: 'none' } as React.CSSProperties} />
              </div>
              <input type="range" min="0" max="500" value={p.v} onChange={e => setVal(i, e.target.value)} className="sc-range" style={{ width: '100%', accentColor: PILLAR_COLOR[i] }} />
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 } as React.CSSProperties}>
          <svg width="170" height="170" viewBox="0 0 42 42">
            <circle cx="21" cy="21" r="15.9" fill="none" stroke={sc.g100} strokeWidth="6" />
            {w.map((p: any, i: any) => {
              const pct = total ? (p.v / total) * 100 : 0;
              const el = <circle key={i} cx="21" cy="21" r="15.9" fill="none" stroke={PILLAR_COLOR[i]} strokeWidth="6" strokeDasharray={`${pct} ${100 - pct}`} strokeDashoffset={off} transform="rotate(-90 21 21)" />;
              off -= pct; return el;
            })}
            <text x="21" y="20" textAnchor="middle" fontSize="6" fontWeight="800" fill={sc.ink} fontFamily="var(--font-display)">1000</text>
            <text x="21" y="25.5" textAnchor="middle" fontSize="3" fill={sc.g500} fontFamily="var(--font-body)">pontos</text>
          </svg>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9, background: sc.lilac1, border: `1px solid ${sc.lilac2}`, borderRadius: 11, padding: '12px 14px', fontSize: 12.5, color: sc.g700, lineHeight: 1.5 }}>
            <CIc n="flask-conical" s={16} c={sc.primary} style={{ marginTop: 1, flexShrink: 0 }} />
            <span><strong style={{ color: sc.ink }}>Prévia:</strong> se salvar, 6 corretores sobem de faixa · 4 descem · score médio 642 → 651.</span>
          </div>
          <div style={{ display: 'flex', gap: 10, width: '100%' }}>
            <button style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, border: `1px solid ${sc.g300}`, background: '#fff', color: sc.g700, borderRadius: 10, padding: '10px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13.5 }}><CIc n="flask-conical" s={16} c={sc.g700} /> Simular impacto</button>
            <button style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, border: 'none', background: total === 1000 ? sc.primary : sc.g300, color: '#fff', borderRadius: 10, padding: '10px', cursor: total === 1000 ? 'pointer' : 'not-allowed', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 13.5 }}><CIc n="save" s={16} c="#fff" /> Salvar pesos</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- PILLAR INDICATORS (accordion) ---------------- */
const PILLARS_DETAIL = [
  { l: 'Resultados', w: 300, c: 0, items: ['Vendas fechadas', 'Locações fechadas', 'VGV', 'Conversão lead→fechado'] },
  { l: 'Atendimento / Qualidade', w: 250, c: 1, items: ['Tempo de 1ª resposta', 'SLA cumprido', 'Avaliação do cliente', 'Sem leads parados'] },
  { l: 'Carteira', w: 200, c: 2, items: ['Captações ativas', 'Exclusividade', 'Qualidade do anúncio (fotos ≥ mín., descrição completa)'] },
  { l: 'CRM', w: 150, c: 3, items: ['Dados de contato completos', 'Follow-up em dia'], note: 'Medido automaticamente, não exige arrastar card.' },
  { l: 'Disciplina / Planejamento', w: 100, c: 4, items: ['Agenda cumprida', 'Rituais de planejamento (semanal/diário)'] },
];
function ScIndicators() {
  const [open, setOpen] = useStateSc(0);
  return (
    <div style={{ ...scCard, padding: 22 }}>
      <ScHead title="O que cada pilar mede" sub="Todos os indicadores são automáticos, subprodutos do trabalho real" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 } as React.CSSProperties}>
        {PILLARS_DETAIL.map((p: any, i: any) => {
          const isOpen = open === i;
          return (
            <div key={p.l} style={{ border: `1px solid ${sc.g300}`, borderRadius: 12, overflow: 'hidden' }}>
              <button onClick={() => setOpen(isOpen ? -1 : i)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', border: 'none', background: isOpen ? sc.lilac1 : '#fff', cursor: 'pointer', fontFamily: 'var(--font-body)', textAlign: 'left' } as React.CSSProperties}>
                <span style={{ width: 10, height: 10, borderRadius: 3, background: PILLAR_COLOR[p.c], flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: sc.ink }}>{p.l}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: sc.primary, background: sc.lilac2, borderRadius: 999, padding: '2px 10px' }}>{p.w} pts</span>
                <CIc n={isOpen ? 'chevron-up' : 'chevron-down'} s={17} c={sc.g500} />
              </button>
              {isOpen && (
                <div style={{ padding: '4px 16px 14px' }}>
                  {p.items.map((it: any) => (
                    <div key={it} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '9px 0', borderBottom: `1px solid ${sc.g100}` }}>
                      <CIc n="zap" s={14} c={sc.success} />
                      <span style={{ flex: 1, fontSize: 13, color: sc.g700 }}>{it}</span>
                      <span style={{ fontSize: 11, color: sc.g500 }}>auto</span>
                      <button style={{ width: 36, height: 21, borderRadius: 999, border: 'none', background: sc.success, position: 'relative', cursor: 'pointer', flexShrink: 0 } as React.CSSProperties}><span style={{ position: 'absolute', top: 3, left: 18, width: 15, height: 15, borderRadius: '50%', background: '#fff' } as React.CSSProperties} /></button>
                    </div>
                  ))}
                  {p.note && <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 10, fontSize: 12, color: sc.g500 }}><CIc n="info" s={14} c={sc.primary} /> {p.note}</div>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- METAS POR REGIÃO ---------------- */
function ScRegionGoals() {
  const regions = ['SP (baseline)', 'Sudeste', 'Nordeste', 'Sul'];
  const metrics = [
    ['Vendas fechadas/mês', '2', '3', '3', '3'],
    ['Tempo de 1ª resposta', '≤ 15 min', '≤ 12 min', '≤ 10 min', '≤ 12 min'],
    ['Captações ativas', '8', '10', '12', '10'],
    ['Avaliação do cliente', '≥ 4,5', '≥ 4,6', '≥ 4,7', '≥ 4,6'],
  ];
  return (
    <div style={{ ...scCard, padding: 22 }}>
      <ScHead title="Metas por região" sub="SP é a régua base; regiões fora de SP são mais rígidas" right={
        <div style={{ display: 'flex', gap: 10 }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: 6, border: `1px solid ${sc.g300}`, background: '#fff', color: sc.primary, borderRadius: 10, padding: '8px 13px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13 }}><CIc n="plus" s={15} c={sc.primary} /> Adicionar região</button>
          <button style={{ display: 'flex', alignItems: 'center', gap: 6, border: 'none', background: sc.primary, color: '#fff', borderRadius: 10, padding: '8px 14px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 13 }}><CIc n="save" s={15} c="#fff" /> Salvar metas</button>
        </div>
      } />
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 620 } as React.CSSProperties}>
          <thead><tr>
            <th style={{ textAlign: 'left', fontSize: 11, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: sc.g500, padding: '0 12px 12px', borderBottom: `1px solid ${sc.g300}`, whiteSpace: 'nowrap' } as React.CSSProperties}>Métrica (alvo)</th>
            {regions.map((r, i) => <th key={r} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: i === 0 ? sc.primary : sc.g500, padding: '0 12px 12px', borderBottom: `1px solid ${sc.g300}`, whiteSpace: 'nowrap' } as React.CSSProperties}>{r}</th>)}
          </tr></thead>
          <tbody>
            {metrics.map(([m, ...vals]) => (
              <tr key={m} style={{ borderBottom: `1px solid ${sc.g100}` }}>
                <td style={{ padding: '12px', fontSize: 13.5, fontWeight: 600, color: sc.ink, whiteSpace: 'nowrap' } as React.CSSProperties}>{m}</td>
                {vals.map((v, i) => (
                  <td key={i} style={{ padding: '8px 12px', textAlign: 'center' } as React.CSSProperties}>
                    <span style={{ display: 'inline-block', minWidth: 60, fontSize: 13, fontWeight: 600, color: sc.ink, background: i === 0 ? sc.lilac1 : sc.page, border: `1px solid ${sc.g300}`, borderRadius: 8, padding: '6px 10px' }}>{v}</span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------------- FAIXAS & BENEFÍCIOS ---------------- */
function ScTiers() {
  return (
    <div style={{ ...scCard, padding: 22 }}>
      <ScHead title="Faixas & benefícios" sub="O que cada faixa destrava" right={<button style={{ display: 'flex', alignItems: 'center', gap: 6, border: 'none', background: sc.primary, color: '#fff', borderRadius: 10, padding: '8px 14px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 13 }}><CIc n="save" s={15} c="#fff" /> Salvar faixas</button>} />
      <div className="sc-tiers">
        {TIERS.map(t => (
          <div key={t.l} style={{ background: '#fff', border: `1px solid ${sc.g300}`, borderRadius: 12, padding: 16, borderTop: `4px solid ${t.tone}` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
              <ScBadge text={t.l} fg={t.tone} bg={t.bg} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <input defaultValue={t.range} style={{ width: '100%', border: `1px solid ${sc.g300}`, borderRadius: 8, padding: '7px 10px', fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800, color: sc.ink, outline: 'none' }} />
            </div>
            <div style={{ fontSize: 12.5, color: sc.g700, lineHeight: 1.5 }}>{t.benefits}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- SELECT ---------------- */
function ScSelect({ value, onChange, options, icon }: any) {
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' } as React.CSSProperties}>
      {icon && <span style={{ position: 'absolute', left: 12, pointerEvents: 'none', display: 'flex' } as React.CSSProperties}><CIc n={icon} s={15} c={sc.g500} /></span>}
      <select value={value} onChange={e => onChange(e.target.value)} style={{ appearance: 'none', WebkitAppearance: 'none', border: `1px solid ${sc.g300}`, background: '#fff', borderRadius: 10, padding: icon ? '9px 32px 9px 34px' : '9px 32px 9px 13px', fontFamily: 'var(--font-body)', fontSize: 13.5, fontWeight: 600, color: sc.ink, cursor: 'pointer', outline: 'none' } as React.CSSProperties}>
        {options.map((o: any) => <option key={o} value={o}>{o}</option>)}
      </select>
      <span style={{ position: 'absolute', right: 11, pointerEvents: 'none', display: 'flex' } as React.CSSProperties}><CIc n="chevron-down" s={15} c={sc.g500} /></span>
    </div>
  );
}

/* ---------------- RANKING & DISTRIBUTION ---------------- */
const RANK = [
  { pos: '1º', name: 'Lucas Ferreira', unit: `${demo.nomeCurto} Boa Viagem`, reg: 'Nordeste', score: 912, trend: 'up', hl: 'forte em Resultados' },
  { pos: '2º', name: 'Renata Alves', unit: `${demo.nomeCurto} Recife Centro`, reg: 'Nordeste', score: 868, trend: 'up', hl: 'forte em Atendimento' },
  { pos: '3º', name: 'Bruno Tavares', unit: `${demo.nomeCurto} Boa Viagem`, reg: 'Nordeste', score: 740, trend: 'flat', hl: '' },
  { pos: '12º', name: 'Carla (independente)', unit: '—', reg: 'Nordeste', score: 610, trend: 'up', hl: '' },
  { pos: '47º', name: 'João (independente)', unit: '—', reg: 'Nordeste', score: 380, trend: 'down', hl: 'fraco em Atendimento' },
];
const DIST = [{ l: 'Atenção', v: 22, t: TIERS[0] }, { l: 'Em desenvolvimento', v: 86, t: TIERS[1] }, { l: 'Consolidado', v: 64, t: TIERS[2] }, { l: 'Elite', v: 18, t: TIERS[3] }];
const trendIc: any = { up: ['arrow-up-right', '#2E9E5B'], flat: ['arrow-right', '#807C8A'], down: ['arrow-down-right', '#D64545'] };
function ScRanking({ onSelect }: any) {
  const maxD = Math.max(...DIST.map(d => d.v));
  return (
    <div style={{ ...scCard, padding: 22 }}>
      <ScHead title="Ranking & distribuição" sub="Posição, faixa e tendência por corretor" right={
        <div style={{ display: 'flex', gap: 10 }}>
          <ScSelect icon="map-pin" value="Todas as regiões" onChange={() => { }} options={['Todas as regiões', 'Nordeste', 'Sudeste', 'SP', 'Sul']} />
          <ScSelect icon="building-2" value="Todas as unidades" onChange={() => { }} options={['Todas as unidades', `${demo.nomeCurto} Boa Viagem`, `${demo.nomeCurto} Recife Centro`]} />
        </div>
      } />
      {/* histogram */}
      <div className="sc-dist">
        {DIST.map(d => (
          <div key={d.l} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 } as React.CSSProperties}>
            <div style={{ display: 'flex', alignItems: 'flex-end', height: 90, width: '100%', justifyContent: 'center' }}>
              <div style={{ width: '60%', height: `${(d.v / maxD) * 100}%`, background: d.t.tone, borderRadius: '6px 6px 0 0', minHeight: 6, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 4 }}><span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{d.v}</span></div>
            </div>
            <ScBadge text={d.l} fg={d.t.tone} bg={d.t.bg} />
          </div>
        ))}
      </div>

      <div className="sc-rank-wrap" style={{ overflowX: 'auto', marginTop: 20 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 760 } as React.CSSProperties}>
          <thead><tr>
            {['#', 'Corretor', 'Unidade', 'Região', 'Score', 'Faixa', 'Tend.', 'Destaque'].map(h => <th key={h} style={{ textAlign: h === 'Score' ? 'right' : 'left', fontSize: 11, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: sc.g500, padding: '0 12px 12px', borderBottom: `1px solid ${sc.g300}`, whiteSpace: 'nowrap' } as React.CSSProperties}>{h}</th>)}
          </tr></thead>
          <tbody>
            {RANK.map(r => {
              const t = tierOf(r.score);
              const [tIc, tColor] = trendIc[r.trend];
              return (
                <tr key={r.pos} onClick={() => onSelect(r)} style={{ borderBottom: `1px solid ${sc.g100}`, cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = sc.lilac1}
                  onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                  <td style={{ padding: '12px', fontSize: 14, fontWeight: 800, color: sc.primary, fontFamily: 'var(--font-display)' }}>{r.pos}</td>
                  <td style={{ padding: '12px', fontSize: 14, fontWeight: 600, color: sc.ink, whiteSpace: 'nowrap' } as React.CSSProperties}>{r.name}</td>
                  <td style={{ padding: '12px', fontSize: 13, color: r.unit === '—' ? sc.g300 : sc.g700, whiteSpace: 'nowrap' } as React.CSSProperties}>{r.unit}</td>
                  <td style={{ padding: '12px', fontSize: 13, color: sc.g700 }}>{r.reg}</td>
                  <td style={{ padding: '12px', textAlign: 'right', fontSize: 14, fontWeight: 800, color: t.tone, fontFamily: 'var(--font-display)' } as React.CSSProperties}>{r.score}</td>
                  <td style={{ padding: '12px' }}><ScBadge text={t.l} fg={t.tone} bg={t.bg} /></td>
                  <td style={{ padding: '12px' }}><CIc n={tIc} s={17} c={tColor} /></td>
                  <td style={{ padding: '12px', fontSize: 12.5, color: sc.g500, whiteSpace: 'nowrap' } as React.CSSProperties}>{r.hl || '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------------- DRAWER (pillar breakdown) ---------------- */
function ScDrawer({ open, onClose, children, width = 460 }: any) {
  return (
    <React.Fragment>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(28,26,34,.45)', zIndex: 80, opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none', transition: 'opacity .2s ease' } as React.CSSProperties} />
      <div className="sc-drawer" style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width, maxWidth: '100vw', background: '#fff', zIndex: 81, boxShadow: 'var(--shadow-lg)', transform: open ? 'translateX(0)' : 'translateX(100%)', transition: 'transform .26s cubic-bezier(.2,.7,.3,1)', display: 'flex', flexDirection: 'column' } as React.CSSProperties}>
        {open && children}
      </div>
    </React.Fragment>
  );
}
function ScBreakdown({ broker, onClose }: any) {
  if (!broker) return null;
  const t = tierOf(broker.score);
  // mock pillar values scaled to score
  const base = broker.score / 1000;
  const pillars = [
    { l: 'Resultados', v: Math.round(300 * (base + (broker.hl.includes('Resultados') ? 0.08 : -0.02))), m: 300 },
    { l: 'Atendimento / Qualidade', v: Math.round(250 * (base + (broker.hl.includes('Atendimento') ? 0.06 : broker.hl.includes('fraco em Atendimento') ? -0.25 : 0))), m: 250 },
    { l: 'Carteira', v: Math.round(200 * base), m: 200 },
    { l: 'CRM', v: Math.round(150 * base), m: 150 },
    { l: 'Disciplina / Planejamento', v: Math.round(100 * base), m: 100 },
  ];
  return (
    <React.Fragment>
      <div style={{ padding: '20px 24px', borderBottom: `1px solid ${sc.g300}`, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <span style={{ width: 46, height: 46, borderRadius: '50%', background: `linear-gradient(135deg, ${sc.light}, ${sc.deep})`, color: '#fff', fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-display)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>{broker.name.split(' ').map((p: any) => p[0]).slice(0, 2).join('')}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: sc.ink }}>{broker.name}</div>
          <div style={{ fontSize: 12.5, color: sc.g500, marginTop: 2 }}>{broker.unit === '—' ? 'Independente' : broker.unit} · {broker.reg}</div>
        </div>
        <button onClick={onClose} style={{ width: 34, height: 34, border: `1px solid ${sc.g300}`, background: '#fff', borderRadius: 9, display: 'grid', placeItems: 'center', cursor: 'pointer', flexShrink: 0 }}><CIc n="x" s={18} c={sc.g700} /></button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 4 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 46, lineHeight: 1, color: t.tone }}>{broker.score}</span>
          <span style={{ fontSize: 13, color: sc.g500 }}>/ 1000</span>
          <ScBadge text={t.l} fg={t.tone} bg={t.bg} />
        </div>
        <div style={{ fontSize: 12, color: sc.g500, marginBottom: 18 }}>capturado do trabalho real, com quebra por pilar</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 } as React.CSSProperties}>
          {pillars.map((p, i) => (
            <div key={p.l}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 13, color: sc.g700 }}>{p.l}</span>
                <span style={{ fontSize: 13, color: sc.g500 }}><strong style={{ color: sc.ink }}>{Math.max(0, p.v)}</strong>/{p.m}</span>
              </div>
              <div style={{ height: 9, background: sc.g100, borderRadius: 999, overflow: 'hidden' }}>
                <div style={{ width: `${Math.max(0, Math.min(100, (p.v / p.m) * 100))}%`, height: '100%', background: PILLAR_COLOR[i], borderRadius: 999 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </React.Fragment>
  );
}

/* ---------------- PERIOD ---------------- */
function ScPeriod() {
  const [p, setP] = useStateSc('Este mês');
  const periods = ['Este mês', 'Trimestre', 'Ano'];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <CIc n="calendar" s={16} c={sc.g500} />
      <div style={{ display: 'flex', background: sc.g100, borderRadius: 999, padding: 3 }}>
        {periods.map(x => <button key={x} onClick={() => setP(x)} style={{ border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, padding: '7px 14px', borderRadius: 999, background: p === x ? '#fff' : 'transparent', color: p === x ? sc.primary : sc.g500, boxShadow: p === x ? 'var(--shadow-sm)' : 'none' }}>{x}</button>)}
      </div>
    </div>
  );
}

/* ---------------- PAGE ---------------- */
export default function ScorePage() {
  const [selected, setSelected] = useStateSc(null);
  return (
    <CeoChrome>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 } as React.CSSProperties}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap' } as React.CSSProperties}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 30, letterSpacing: '-0.02em', margin: 0, color: sc.ink }}>Score</h1>
          <div style={{ fontSize: 13.5, color: sc.g500, marginTop: 4 }}>O motor de mérito: configurável, automático e transparente</div>
        </div>
        <ScPeriod />
      </div>

      <ScSummary />
      <ScWeights />
      <ScIndicators />
      <ScRegionGoals />
      <ScTiers />
      <ScRanking onSelect={setSelected} />

      <ScDrawer open={!!selected} onClose={() => setSelected(null)}>
        <ScBreakdown broker={selected} onClose={() => setSelected(null)} />
      </ScDrawer>
    </div>
    </CeoChrome>
  );
}
