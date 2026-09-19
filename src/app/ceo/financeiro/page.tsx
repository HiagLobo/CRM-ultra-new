"use client";
import * as React from "react";
import CeoChrome, { ceoPalette, CIc } from "@/components/ceo/CeoChrome";
import { demo } from "@/config/demo";
const { useState, useEffect, useRef, useMemo, useCallback } = React;
const { useState: useStateFi } = React;

const fi: any = {
  ...ceoPalette,
  info: '#3E82E0', infoBg: '#E5EEFB',
  successBg: '#E6F4EC', warnBg: '#FBF1DC', errBg: '#FAE5E5',
  p1: '#4F46E5', p2: '#6366F1', p3: '#818CF8', p4: '#C79BDD',
};
const fiCard = { background: '#fff', border: `1px solid ${fi.g300}`, borderRadius: 16 };

function FiHead({ title, sub, right }: any) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
      <div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: fi.ink }}>{title}</div>
        {sub && <div style={{ fontSize: 13, color: fi.g500, marginTop: 2 }}>{sub}</div>}
      </div>
      {right}
    </div>
  );
}

/* ---------------- FILTERS ---------------- */
function FiFilters() {
  const [p, setP] = useStateFi('Este mês');
  const periods = ['Este mês', 'Trimestre', 'Ano', 'Sempre'];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <CIc n="calendar" s={16} c={fi.g500} />
      <div style={{ display: 'flex', background: fi.g100, borderRadius: 999, padding: 3 }}>
        {periods.map(x => (
          <button key={x} onClick={() => setP(x)} style={{ border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, padding: '7px 14px', borderRadius: 999, background: p === x ? '#fff' : 'transparent', color: p === x ? fi.primary : fi.g500, boxShadow: p === x ? 'var(--shadow-sm)' : 'none' }}>{x}</button>
        ))}
      </div>
    </div>
  );
}

/* ---------------- SUMMARY ---------------- */
function FiSummary() {
  const k = [
    { l: 'Receita do período', v: 'R$ 1,24 mi', delta: '9%', up: true, ic: 'wallet', hl: true },
    { l: 'Receita recorrente (MRR)', v: 'R$ 142 mil', delta: '6%', up: true, ic: 'repeat' },
    { l: 'A receber', v: 'R$ 380 mil', ic: 'arrow-down-to-line' },
    { l: 'A repassar', v: 'R$ 520 mil', ic: 'arrow-up-from-line' },
    { l: 'Caixa', v: 'R$ 2,1 mi', ic: 'landmark' },
    { l: 'Inadimplência', v: '3,2%', delta: '0,4 p.p.', up: false, good: true, ic: 'alert-circle' },
  ];
  return (
    <div className="fi-summary">
      {k.map(c => (
        <div key={c.l} style={{ background: c.hl ? `linear-gradient(135deg, ${fi.primary}, ${fi.deep})` : '#fff', border: c.hl ? 'none' : `1px solid ${fi.g300}`, borderRadius: 16, padding: 18, boxShadow: c.hl ? 'var(--shadow-purple)' : 'none', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: c.hl ? 'rgba(255,255,255,.85)' : fi.g500, lineHeight: 1.3 }}>{c.l}</span>
            <span style={{ width: 30, height: 30, borderRadius: 8, background: c.hl ? 'rgba(255,255,255,.18)' : fi.lilac2, display: 'grid', placeItems: 'center', flexShrink: 0 }}><CIc n={c.ic} s={15} c={c.hl ? '#fff' : fi.primary} /></span>
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, lineHeight: 1.15, color: c.hl ? '#fff' : fi.ink, marginTop: 14, letterSpacing: '-0.01em' }}>{c.v}</div>
          {c.delta ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 9 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, fontSize: 11.5, fontWeight: 700, color: c.hl ? '#fff' : ((c.up || c.good) ? fi.success : fi.error), background: c.hl ? 'rgba(255,255,255,.18)' : ((c.up || c.good) ? fi.successBg : fi.errBg), borderRadius: 999, padding: '2px 7px' }}>
                <CIc n={c.up ? 'arrow-up-right' : 'arrow-down-right'} s={12} /> {c.delta}
              </span>
              <span style={{ fontSize: 11.5, color: c.hl ? 'rgba(255,255,255,.7)' : fi.g500 }}>vs. mês anterior</span>
            </div>
          ) : <div style={{ fontSize: 11.5, color: fi.g500, marginTop: 9 }}>no período</div>}
        </div>
      ))}
    </div>
  );
}

/* ---------------- RECEITA POR FONTE ---------------- */
function FiRevenue() {
  const segs = [
    { l: 'Comissão (40%)', val: 'R$ 788 mil', v: 788, c: fi.p1 },
    { l: 'Taxa de administração', val: 'R$ 142 mil', v: 142, c: fi.p2 },
    { l: 'Seguro-fiança (comissão do parceiro)', val: 'R$ 112 mil', v: 112, c: fi.warning },
    { l: 'Taxas de antecipação', val: 'R$ 6 mil', v: 6, c: fi.p3 },
    { l: 'Assinaturas (planos)', val: 'R$ 68 mil', v: 68, c: fi.info },
    { l: 'Parceiros', val: 'R$ 62 mil', v: 62, c: fi.success },
    { l: 'Royalties / franquia', val: 'R$ 38 mil', v: 38, c: fi.p4 },
    { l: 'Créditos do Radar', val: 'R$ 24 mil', v: 24, c: fi.g500 },
  ];
  const total = segs.reduce((s, x) => s + x.v, 0);
  let off = 25;
  return (
    <div style={{ ...fiCard, padding: 22 }}>
      <FiHead title="Receita por fonte" sub="A margem é diversificada, não só comissão" right={<span style={{ fontSize: 12.5, fontWeight: 700, color: fi.primary, background: fi.lilac2, padding: '5px 12px', borderRadius: 999 }}>Total R$ 1,24 mi</span>} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 32, flexWrap: 'wrap' }}>
        <svg width="160" height="160" viewBox="0 0 42 42" style={{ flexShrink: 0 }}>
          <circle cx="21" cy="21" r="15.9" fill="none" stroke={fi.g100} strokeWidth="5" />
          {segs.map((s, i) => {
            const pct = (s.v / total) * 100;
            const el = <circle key={i} cx="21" cy="21" r="15.9" fill="none" stroke={s.c} strokeWidth="5" strokeDasharray={`${pct} ${100 - pct}`} strokeDashoffset={off} transform="rotate(-90 21 21)" />;
            off -= pct; return el;
          })}
          <text x="21" y="20" textAnchor="middle" fontSize="5" fontWeight="800" fill={fi.ink} fontFamily="var(--font-display)">R$1,24mi</text>
          <text x="21" y="25" textAnchor="middle" fontSize="2.9" fill={fi.g500} fontFamily="var(--font-body)">no mês</text>
        </svg>
        <div style={{ flex: 1, minWidth: 280, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '11px 24px' }}>
          {segs.map(s => (
            <div key={s.l} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: s.c, flexShrink: 0 }} />
              <span style={{ fontSize: 12.5, color: fi.g700, flex: 1, lineHeight: 1.25 }}>{s.l}</span>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: fi.ink, whiteSpace: 'nowrap' }}>{s.val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------- COMISSÕES & REPASSES ---------------- */
function FiCommissions() {
  return (
    <div style={{ ...fiCard, padding: 22 }}>
      <FiHead title="Comissões & repasses" sub="O motor de split 60/40" right={<button style={{ display: 'flex', alignItems: 'center', gap: 6, border: `1px solid ${fi.g300}`, background: '#fff', borderRadius: 10, padding: '8px 13px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13, color: fi.ink }}>Ver por corretor / negócio <CIc n="arrow-right" s={15} c={fi.g500} /></button>} />
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 6 }}>
        <span style={{ fontSize: 13, color: fi.g500 }}>Comissão total gerada no mês</span>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, color: fi.ink }}>R$ 1,97 mi</span>
      </div>
      {/* split bar */}
      <div style={{ display: 'flex', height: 38, borderRadius: 10, overflow: 'hidden', marginTop: 10, marginBottom: 12 }}>
        <div style={{ width: '60%', background: fi.p3, display: 'flex', alignItems: 'center', paddingLeft: 14, color: '#fff', fontWeight: 700, fontSize: 13 }}>Corretores 60% · R$ 1,18 mi</div>
        <div style={{ width: '40%', background: fi.primary, display: 'flex', alignItems: 'center', paddingLeft: 14, color: '#fff', fontWeight: 700, fontSize: 13 }}>{demo.nomeCurto} 40%</div>
      </div>
      <div className="fi-3col" style={{ marginTop: 16 }}>
        {[
          { l: `${demo.nomeCurto} (40%)`, v: 'R$ 788 mil', tone: fi.primary, ic: 'building-2' },
          { l: 'Repasses pagos', v: 'R$ 850 mil', tone: fi.success, ic: 'check-circle' },
          { l: 'Repasses pendentes', v: 'R$ 332 mil', tone: fi.warning, ic: 'clock' },
          { l: 'Recorrência aos corretores (1,5%)', v: 'R$ 31 mil', tone: fi.info, ic: 'repeat' },
        ].map(s => (
          <div key={s.l} style={{ background: fi.page, borderRadius: 12, padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}><CIc n={s.ic} s={16} c={s.tone} /><span style={{ fontSize: 12.5, color: fi.g500, lineHeight: 1.3 }}>{s.l}</span></div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: fi.ink }}>{s.v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- LOCAÇÃO & PAGAMENTOS ---------------- */
function FiRental() {
  const stats = [
    { l: 'Recebimentos (boleto/Pix)', v: 'R$ 2,10 mi', tone: fi.success, ic: 'arrow-down-to-line' },
    { l: 'Repasses aos proprietários', v: 'R$ 1,80 mi', tone: fi.g700, ic: 'arrow-up-from-line' },
    { l: 'Taxa de administração retida', v: 'R$ 142 mil', tone: fi.primary, ic: 'percent' },
    { l: 'Inadimplência', v: 'R$ 67 mil', sub: '3,2%', tone: fi.error, ic: 'alert-triangle' },
  ];
  return (
    <div style={{ ...fiCard, padding: 22 }}>
      <FiHead title="Locação & pagamentos" sub="O fluxo do aluguel" />
      <div className="fi-2x2">
        {stats.map(s => (
          <div key={s.l} style={{ background: fi.page, borderRadius: 12, padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}><CIc n={s.ic} s={16} c={s.tone} /><span style={{ fontSize: 12.5, color: fi.g500, lineHeight: 1.3 }}>{s.l}</span></div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: fi.ink }}>{s.v}{s.sub && <span style={{ fontSize: 13, fontWeight: 600, color: fi.error, marginLeft: 8 }}>{s.sub}</span>}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14, background: fi.successBg, borderRadius: 10, padding: '11px 14px' }}>
        <CIc n="shield-check" s={18} c={fi.success} />
        <span style={{ fontSize: 12.5, color: fi.g700, lineHeight: 1.4 }}><strong style={{ color: fi.ink }}>412 pagamentos confirmados por webhook</strong> · 8 pendentes de conciliação</span>
      </div>
    </div>
  );
}

/* ---------------- ANTECIPAÇÕES ---------------- */
function FiAdvances() {
  const stats = [
    { l: 'Concedidas no mês', v: 'R$ 240 mil', tone: fi.primary, ic: 'banknote' },
    { l: 'Em aberto (com o parceiro)', v: 'R$ 1,10 mi', tone: fi.g700, ic: 'hourglass' },
    { l: 'Taxas no mês (2,5%)', v: 'R$ 6,0 mil', tone: fi.success, ic: 'trending-up' },
    { l: 'Risco de crédito', v: 'Do parceiro', tone: fi.success, ic: 'shield-check' },
  ];
  return (
    <div style={{ ...fiCard, padding: 22 }}>
      <FiHead title="Antecipações" sub="Adiantadas por parceiro financeiro: a rede não empresta, só intermedeia (taxa de 2,5%)" />
      <div className="fi-2x2">
        {stats.map(s => (
          <div key={s.l} style={{ background: fi.page, borderRadius: 12, padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}><CIc n={s.ic} s={16} c={s.tone} /><span style={{ fontSize: 12.5, color: fi.g500, lineHeight: 1.3 }}>{s.l}</span></div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: s.l.includes('Risco') ? fi.success : fi.ink }}>{s.v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- FLUXO DE CAIXA ---------------- */
function FiCashflow() {
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
  const entradas = [3.1, 3.4, 3.6, 3.9, 4.1, 4.5];
  const saidas = [2.6, 2.8, 2.9, 3.2, 3.3, 3.6];
  const max = 5;
  const W = 620, H = 220, padL = 30, padB = 28, padT = 10;
  const gw = (W - padL) / months.length;
  const bw = 14;
  const y = (v: any) => padT + (1 - v / max) * (H - padB - padT);
  return (
    <div style={{ ...fiCard, padding: 22 }}>
      <FiHead title="Fluxo de caixa" sub="Entradas × saídas (R$ milhões)" right={
        <div style={{ display: 'flex', gap: 14 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: fi.g700 }}><span style={{ width: 11, height: 11, borderRadius: 3, background: fi.success }} /> Entradas</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: fi.g700 }}><span style={{ width: 11, height: 11, borderRadius: 3, background: fi.warning }} /> Saídas</span>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: fi.success, background: fi.successBg, padding: '4px 10px', borderRadius: 999 }}>Saldo Jun +R$ 0,9 mi</span>
        </div>
      } />
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="220" preserveAspectRatio="none">
        {[0, 1, 2, 3, 4, 5].map(g => (
          <g key={g}>
            <line x1={padL} x2={W} y1={y(g)} y2={y(g)} stroke={fi.g100} strokeWidth="1" />
            <text x={padL - 6} y={y(g) + 3} textAnchor="end" fontSize="9" fill={fi.g500} fontFamily="var(--font-body)">{g}</text>
          </g>
        ))}
        {months.map((m, i) => {
          const cx = padL + gw * i + gw / 2;
          return (
            <g key={m}>
              <rect x={cx - bw - 2} y={y(entradas[i])} width={bw} height={y(0) - y(entradas[i])} rx="3" fill={fi.success} />
              <rect x={cx + 2} y={y(saidas[i])} width={bw} height={y(0) - y(saidas[i])} rx="3" fill={fi.warning} />
              <text x={cx} y={H - 10} textAnchor="middle" fontSize="10" fill={fi.g500} fontFamily="var(--font-body)">{m}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ---------------- LEDGER ---------------- */
const LEDGER_TONE: any = {
  'Comissão (40%)': fi.primary, 'Repasse corretor': fi.info, 'Repasse proprietário': fi.p2,
  'Antecipação (taxa)': fi.success, 'Taxa de administração': fi.warning, 'Royalty': fi.p3, 'Assinatura': fi.g500, 'Recorrência': fi.info,
};
function FiLedger() {
  const rows = [
    { d: '08/06', tipo: 'Comissão (40%)', desc: 'Venda Apto Boa Viagem', unit: 'Franquia Recife', val: '+R$ 21.360', pos: true },
    { d: '08/06', tipo: 'Repasse corretor', desc: 'Bruno Lima', unit: 'Franquia Recife', val: '−R$ 32.040', pos: false },
    { d: '07/06', tipo: 'Repasse proprietário', desc: 'Contrato Pina', unit: 'Matriz', val: '−R$ 3.040', pos: false },
    { d: '07/06', tipo: 'Antecipação (taxa)', desc: 'Ricardo Almeida', unit: 'Matriz', val: '+R$ 801', pos: true },
    { d: '01/06', tipo: 'Taxa de administração', desc: '312 contratos', unit: 'Rede', val: '+R$ 142.000', pos: true },
    { d: '01/06', tipo: 'Royalty', desc: 'Franquia Recife', unit: 'Franquia Recife', val: '+R$ 10.500', pos: true },
  ];
  return (
    <div style={{ ...fiCard, padding: 22 }}>
      <FiHead title="Ledger / extrato" sub="Lançamentos imutáveis e auditáveis · capturados de pagamentos confirmados" right={
        <button style={{ display: 'flex', alignItems: 'center', gap: 6, border: `1px solid ${fi.g300}`, background: '#fff', borderRadius: 10, padding: '8px 13px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13, color: fi.ink }}><CIc n="download" s={15} c={fi.primary} /> Exportar</button>
      } />
      {/* desktop table */}
      <div className="fi-table-wrap" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
          <thead><tr>
            {['Data', 'Tipo', 'Descrição', 'Unidade', 'Valor'].map((h, i) => (
              <th key={h} style={{ textAlign: i === 4 ? 'right' : 'left', fontSize: 11, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: fi.g500, padding: '0 14px 12px', borderBottom: `1px solid ${fi.g300}`, whiteSpace: 'nowrap' } as React.CSSProperties}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {rows.map((r, i) => {
              const tone = LEDGER_TONE[r.tipo] || fi.g500;
              return (
                <tr key={i} style={{ borderBottom: `1px solid ${fi.g100}` }}>
                  <td style={{ padding: '13px 14px', fontSize: 13, color: fi.g500, whiteSpace: 'nowrap' }}>{r.d}</td>
                  <td style={{ padding: '13px 14px' }}><span style={{ fontSize: 12, fontWeight: 700, color: tone, background: `${tone}1A`, borderRadius: 999, padding: '3px 10px', whiteSpace: 'nowrap' }}>{r.tipo}</span></td>
                  <td style={{ padding: '13px 14px', fontSize: 13.5, color: fi.ink }}>{r.desc}</td>
                  <td style={{ padding: '13px 14px', fontSize: 13.5, color: fi.g700, whiteSpace: 'nowrap' }}>{r.unit}</td>
                  <td style={{ padding: '13px 14px', textAlign: 'right', fontSize: 14, fontWeight: 700, color: r.pos ? fi.success : fi.error, whiteSpace: 'nowrap', fontFamily: 'var(--font-display)' } as React.CSSProperties}>{r.val}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {/* mobile cards */}
      <div className="fi-table-cards" style={{ flexDirection: 'column', gap: 10 }}>
        {rows.map((r, i) => {
          const tone = LEDGER_TONE[r.tipo] || fi.g500;
          return (
            <div key={i} style={{ background: fi.page, borderRadius: 12, padding: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: tone, background: `${tone}1A`, borderRadius: 999, padding: '3px 10px' }}>{r.tipo}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: r.pos ? fi.success : fi.error, fontFamily: 'var(--font-display)' }}>{r.val}</span>
              </div>
              <div style={{ fontSize: 13.5, color: fi.ink }}>{r.desc}</div>
              <div style={{ fontSize: 12, color: fi.g500 }}>{r.d} · {r.unit}</div>
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 14, fontSize: 12, color: fi.g500 }}>
        <CIc n="lock" s={14} c={fi.g500} /> Registro imutável, mesmo ledger que o corretor vê no extrato dele.
      </div>
    </div>
  );
}

/* ---------------- PAGE ---------------- */
export default function FinanceiroPage() {
  return (
    <CeoChrome>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 30, letterSpacing: '-0.02em', margin: 0, color: fi.ink }}>Financeiro</h1>
          <div style={{ fontSize: 13.5, color: fi.g500, marginTop: 4 }}>Rede inteira · 1–30 de junho de 2026 · o dinheiro consolidado da rede</div>
        </div>
        <FiFilters />
      </div>

      <FiSummary />
      <FiRevenue />
      <FiCommissions />
      <div className="fi-2col"><FiRental /><FiAdvances /></div>
      <FiCashflow />
      <FiLedger />
    </div>
    </CeoChrome>
  );
}
