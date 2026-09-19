"use client";
import * as React from "react";
import CeoChrome, { ceoPalette, CIc } from "@/components/ceo/CeoChrome";
const { useState, useEffect, useRef, useMemo, useCallback } = React;

const { useState: useStateVg } = React;

/* extended palette for charts (purple-dominant + accents) */
const vg: any = {
  ...ceoPalette,
  info: '#3E82E0', infoBg: '#E5EEFB',
  p1: '#4F46E5', p2: '#6366F1', p3: '#818CF8', p4: '#C79BDD',
};

const card = { background: '#fff', border: `1px solid ${ceoPalette.g300}`, borderRadius: 16 };

/* ---------- section header ---------- */
function VgHead({ title, sub, right }: any) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
      <div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: ceoPalette.ink }}>{title}</div>
        {sub && <div style={{ fontSize: 13, color: ceoPalette.g500, marginTop: 2 }}>{sub}</div>}
      </div>
      {right}
    </div>
  );
}

/* ---------- KPI CARD ---------- */
function VgKpi({ label, value, delta, up, icon, highlight }: any) {
  return (
    <div style={{
      background: highlight ? `linear-gradient(135deg, ${vg.primary}, ${vg.deep})` : '#fff',
      border: highlight ? 'none' : `1px solid ${vg.g300}`,
      borderRadius: 16, padding: 18, minWidth: 0,
      boxShadow: highlight ? 'var(--shadow-purple)' : 'none',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ fontSize: 12.5, fontWeight: 600, color: highlight ? 'rgba(255,255,255,.85)' : vg.g500, minWidth: 0, lineHeight: 1.3 }}>{label}</div>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: highlight ? 'rgba(255,255,255,.18)' : vg.lilac2, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
          <CIc n={icon} s={15} c={highlight ? '#fff' : vg.primary} />
        </div>
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 25, lineHeight: 1.15, color: highlight ? '#fff' : vg.ink, marginTop: 14, letterSpacing: '-0.01em' }}>{value}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 9 }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 2, fontSize: 11.5, fontWeight: 700,
          color: highlight ? '#fff' : (up ? vg.success : vg.error),
          background: highlight ? 'rgba(255,255,255,.18)' : (up ? vg.success_bg || '#E6F4EC' : '#FAE5E5'),
          borderRadius: 999, padding: '2px 7px',
        }}>
          <CIc n={up ? 'arrow-up-right' : 'arrow-down-right'} s={12} /> {delta}
        </span>
        <span style={{ fontSize: 11.5, color: highlight ? 'rgba(255,255,255,.7)' : vg.g500 }}>vs. mês anterior</span>
      </div>
    </div>
  );
}

function VgKpis() {
  const k = [
    { label: 'VGV — Vendas', value: 'R$ 18,4 mi', delta: '12%', up: true, icon: 'trending-up', highlight: true },
    { label: 'VGL — Locação', value: 'R$ 2,1 mi', delta: '4%', up: true, icon: 'key-round' },
    { label: 'Receita do período', value: 'R$ 1,24 mi', delta: '9%', up: true, icon: 'wallet' },
    { label: 'Receita recorrente (MRR)', value: 'R$ 142 mil', delta: '6%', up: true, icon: 'repeat' },
    { label: 'Negócios fechados', value: '47', delta: '8', up: true, icon: 'handshake' },
    { label: 'Corretores ativos', value: '312', delta: '14', up: true, icon: 'users' },
  ];
  return <div className="vg-kpis">{k.map(x => <VgKpi key={x.label} {...x} />)}</div>;
}

/* ---------- RECEITA POR FONTE (donut) ---------- */
function VgRevenue() {
  const segs = [
    { label: 'Comissão', v: 63, val: 'R$ 788 mil', c: vg.p1 },
    { label: 'Recorrência (taxa adm. + planos)', v: 17, val: 'R$ 210 mil', c: vg.p2 },
    { label: 'Seguro-fiança (comissão do parceiro)', v: 9, val: 'R$ 112 mil', c: vg.p3 },
    { label: 'Antecipação (taxas)', v: 1, val: 'R$ 6 mil', c: vg.p4 },
    { label: 'Parceiros', v: 5, val: 'R$ 62 mil', c: vg.info },
    { label: 'Royalties / franquia', v: 3, val: 'R$ 38 mil', c: vg.success },
    { label: 'Créditos Radar', v: 2, val: 'R$ 24 mil', c: vg.warning },
  ];
  let off = 25;
  return (
    <div style={{ ...card, padding: 22 }}>
      <VgHead title="Receita por fonte" sub="A margem é diversificada — não só comissão" right={<span style={{ fontSize: 12.5, fontWeight: 700, color: vg.primary, background: vg.lilac2, padding: '5px 12px', borderRadius: 999 }}>Total R$ 1,24 mi</span>} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 32, flexWrap: 'wrap' }}>
        <svg width="150" height="150" viewBox="0 0 42 42" style={{ flexShrink: 0 }}>
          <circle cx="21" cy="21" r="15.9" fill="none" stroke={vg.g100} strokeWidth="5" />
          {segs.map((s, i) => {
            const el = <circle key={i} cx="21" cy="21" r="15.9" fill="none" stroke={s.c} strokeWidth="5" strokeDasharray={`${s.v} ${100 - s.v}`} strokeDashoffset={off} transform="rotate(-90 21 21)" strokeLinecap="butt" />;
            off -= s.v; return el;
          })}
          <text x="21" y="20" textAnchor="middle" fontSize="5.4" fontWeight="800" fill={vg.ink} fontFamily="var(--font-display)">100%</text>
          <text x="21" y="25" textAnchor="middle" fontSize="2.9" fill={vg.g500} fontFamily="var(--font-body)">da receita</text>
        </svg>
        <div style={{ flex: 1, minWidth: 260, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '11px 24px' }}>
          {segs.map(s => (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: s.c, flexShrink: 0 }} />
              <span style={{ fontSize: 12.5, color: vg.g700, flex: 1, lineHeight: 1.25 }}>{s.label}</span>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: vg.ink, whiteSpace: 'nowrap' }}>{s.val}</span>
              <span style={{ fontSize: 11.5, color: vg.g500, width: 30, textAlign: 'right' }}>{s.v}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- FUNIL DA REDE ---------- */
function VgFunnel() {
  const max = 1240;
  const stages = [
    { label: 'Novo', v: 1240, tempo: '—', c: vg.p4 },
    { label: 'Atendimento', v: 580, tempo: '2 h', c: vg.p3 },
    { label: 'Visita', v: 210, tempo: '1,5 d', c: vg.p2 },
    { label: 'Proposta', v: 95, tempo: '2 d', c: vg.primary },
    { label: 'Negociação', v: 40, tempo: '3 d', c: vg.dark },
    { label: 'Fechado', v: 47, tempo: '2 d', c: vg.success },
  ];
  return (
    <div style={{ ...card, padding: 22 }}>
      <VgHead title="Funil da rede" sub="Negócios por etapa · tempo médio" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        {stages.map(s => {
          const w = 16 + (s.v / max) * 84;
          return (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 96, textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: vg.ink }}>{s.label}</div>
                <div style={{ fontSize: 11, color: vg.g500 }}>{s.tempo}</div>
              </div>
              <div style={{ flex: 1, display: 'grid', placeItems: 'center' }}>
                <div style={{ width: `${w}%`, height: 34, background: s.c, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 13, fontFamily: 'var(--font-body)' }}>
                  {s.v.toLocaleString('pt-BR')}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- RESULTADO & MOTIVOS DE PERDA ---------- */
function VgLosses() {
  const motivos = [
    { label: 'Desistência', v: 62 },
    { label: 'Fora do perfil', v: 18 },
    { label: 'Preço', v: 12 },
    { label: 'Outros', v: 8 },
  ];
  return (
    <div style={{ ...card, padding: 22, display: 'flex', flexDirection: 'column', gap: 18 }}>
      <VgHead title="Resultado & perdas" sub="Junho · rede inteira" />
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1, background: vg.success_bg || '#E6F4EC', borderRadius: 12, padding: '14px 16px' }}>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: vg.g700 }}>Ganhos</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 26, color: vg.success }}>47</div>
        </div>
        <div style={{ flex: 1, background: '#FAE5E5', borderRadius: 12, padding: '14px 16px' }}>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: vg.g700 }}>Perdidos</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 26, color: vg.error }}>88</div>
        </div>
      </div>
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: vg.g500, marginBottom: 12 }}>Motivos de perda</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
          {motivos.map(m => (
            <div key={m.label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 13, color: vg.g700 }}>{m.label}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: vg.ink }}>{m.v}%</span>
              </div>
              <div style={{ height: 8, background: vg.g100, borderRadius: 999, overflow: 'hidden' }}>
                <div style={{ width: `${m.v}%`, height: '100%', background: vg.primary, borderRadius: 999 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- QUALIDADE DO ATENDIMENTO ---------- */
function VgService() {
  return (
    <div style={{ ...card, padding: 22 }}>
      <VgHead title="Qualidade do atendimento" sub="Velocidade e satisfação" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {[
          { ic: 'timer', v: '8 min', l: '1ª resposta', tone: vg.primary },
          { ic: 'gauge', v: '92%', l: 'SLA cumprido', tone: vg.success },
          { ic: 'smile', v: '4,6/5', l: 'CSAT médio', tone: vg.warning },
        ].map(s => (
          <div key={s.l} style={{ background: vg.page, borderRadius: 12, padding: '16px 14px', textAlign: 'center' }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: '#fff', border: `1px solid ${vg.g300}`, display: 'grid', placeItems: 'center', margin: '0 auto 10px' }}>
              <CIc n={s.ic} s={19} c={s.tone} />
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, color: vg.ink }}>{s.v}</div>
            <div style={{ fontSize: 12, color: vg.g500, marginTop: 3 }}>{s.l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- SCORE DA REDE ---------- */
function VgScore() {
  const dist = [8, 14, 22, 30, 26, 38, 30, 18, 10];
  const top = [
    { n: 'Ricardo Almeida', s: 861 },
    { n: 'Ana Marques', s: 845 },
    { n: 'Bruno Lima', s: 838 },
  ];
  const dmax = Math.max(...dist);
  return (
    <div style={{ ...card, padding: 22 }}>
      <VgHead title="Score da rede" sub="Média e distribuição" right={<span style={{ fontSize: 12.5, fontWeight: 700, color: vg.success, background: vg.success_bg || '#E6F4EC', padding: '5px 12px', borderRadius: 999 }}>78% na meta</span>} />
      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div style={{ flexShrink: 0 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 44, lineHeight: 1, color: vg.primary }}>712</div>
          <div style={{ fontSize: 12.5, color: vg.g500, marginTop: 4 }}>média da rede</div>
        </div>
        <div style={{ flex: 1, minWidth: 160, display: 'flex', alignItems: 'flex-end', gap: 4, height: 64 }}>
          {dist.map((d, i) => (
            <div key={i} style={{ flex: 1, height: `${(d / dmax) * 100}%`, background: i >= 5 ? vg.primary : vg.p3, borderRadius: '4px 4px 0 0', minHeight: 4 }} />
          ))}
        </div>
      </div>
      <div style={{ height: 1, background: vg.g100, margin: '18px 0 14px' }} />
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: vg.g500, marginBottom: 10 }}>Top corretores</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {top.map((t, i) => (
          <div key={t.n} style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
            <span style={{ width: 22, height: 22, borderRadius: '50%', background: i === 0 ? vg.primary : vg.lilac2, color: i === 0 ? '#fff' : vg.primary, fontSize: 12, fontWeight: 700, display: 'grid', placeItems: 'center', flexShrink: 0 }}>{i + 1}</span>
            <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600, color: vg.ink }}>{t.n}</span>
            <span style={{ fontSize: 13.5, fontWeight: 700, color: vg.primary }}>{t.s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- UNIDADES ---------- */
function VgUnits() {
  const units = [
    { name: 'Matriz', type: 'Matriz', city: 'São Paulo · SP', cor: 280, vgv: 'R$ 14,0 mi', score: 720, icon: 'building' },
    { name: 'Franquia Recife', type: 'Franquia', city: 'Recife · PE', cor: 22, vgv: 'R$ 2,1 mi', score: 690, icon: 'store' },
    { name: 'Associado Campinas', type: 'Associado', city: 'Campinas · SP', cor: 10, vgv: 'R$ 2,3 mi', score: 705, icon: 'handshake' },
  ];
  const typeColor: any = { Matriz: vg.primary, Franquia: vg.info, Associado: vg.warning };
  return (
    <div style={{ ...card, padding: 22 }}>
      <VgHead title="Unidades" sub="Visão da rede multi-unidade" right={<button style={{ display: 'flex', alignItems: 'center', gap: 6, border: `1px solid ${vg.g300}`, background: '#fff', borderRadius: 10, padding: '8px 13px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13, color: vg.ink }}><span>Ver todas</span><CIc n="arrow-right" s={15} c={vg.g500} /></button>} />
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 520 }}>
          <thead>
            <tr>
              {['Unidade', 'Tipo', 'Corretores', 'VGV', 'Score'].map((h, i) => (
                <th key={h} style={{ textAlign: i >= 2 ? 'right' : 'left', fontSize: 11.5, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: vg.g500, padding: '0 12px 12px', borderBottom: `1px solid ${vg.g300}` } as React.CSSProperties}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {units.map(u => (
              <tr key={u.name} style={{ borderBottom: `1px solid ${vg.g100}` }}>
                <td style={{ padding: '14px 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                    <span style={{ width: 36, height: 36, borderRadius: 9, background: vg.lilac2, display: 'grid', placeItems: 'center', flexShrink: 0 }}><CIc n={u.icon} s={18} c={vg.primary} /></span>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: vg.ink }}>{u.name}</div>
                      <div style={{ fontSize: 12, color: vg.g500 }}>{u.city}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '14px 12px' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: typeColor[u.type], background: `${typeColor[u.type]}1A`, borderRadius: 999, padding: '3px 10px' }}>{u.type}</span>
                </td>
                <td style={{ padding: '14px 12px', textAlign: 'right', fontSize: 14, fontWeight: 600, color: vg.ink }}>{u.cor}</td>
                <td style={{ padding: '14px 12px', textAlign: 'right', fontSize: 14, fontWeight: 600, color: vg.ink }}>{u.vgv}</td>
                <td style={{ padding: '14px 12px', textAlign: 'right' }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: u.score >= 712 ? vg.success : vg.warning }}>{u.score}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------- RISCO & PENDÊNCIAS ---------- */
function VgRisk() {
  const items = [
    { ic: 'percent', v: '3,2%', l: 'Inadimplência', note: '+0,5 pp vs. maio', tone: vg.error, bg: '#FAE5E5' },
    { ic: 'shield-alert', v: '4', l: 'Garantias acionadas', note: 'no mês', tone: vg.warning, bg: '#FBF1DC' },
    { ic: 'clipboard-check', v: '18', l: 'Curadoria pendente', note: 'anúncios na fila', tone: vg.primary, bg: vg.lilac2 },
  ];
  return (
    <div className="vg-risco">
      {items.map(x => (
        <div key={x.l} style={{ ...card, padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: x.bg, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <CIc n={x.ic} s={22} c={x.tone} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, color: vg.ink, lineHeight: 1.1 }}>{x.v}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: vg.g700, marginTop: 2 }}>{x.l}</div>
            <div style={{ fontSize: 12, color: vg.g500 }}>{x.note}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------- FILTERS ---------- */
function VgFilters() {
  const [period, setPeriod] = useStateVg('Este mês');
  const [seg, setSeg] = useStateVg('Todos');
  const periods = ['Este mês', 'Trimestre', 'Ano', 'Sempre'];
  const segs = ['Todos', 'Venda', 'Locação'];
  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
      {/* period */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <CIc n="calendar" s={16} c={vg.g500} />
        <div style={{ display: 'flex', background: vg.g100, borderRadius: 999, padding: 3 }}>
          {periods.map(p => (
            <button key={p} onClick={() => setPeriod(p)} style={{
              border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
              padding: '7px 14px', borderRadius: 999, transition: 'all .15s ease',
              background: period === p ? '#fff' : 'transparent', color: period === p ? vg.primary : vg.g500,
              boxShadow: period === p ? 'var(--shadow-sm)' : 'none',
            }}>{p}</button>
          ))}
        </div>
      </div>
      {/* segment */}
      <div style={{ display: 'flex', background: vg.g100, borderRadius: 999, padding: 3 }}>
        {segs.map(s => (
          <button key={s} onClick={() => setSeg(s)} style={{
            border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
            padding: '7px 14px', borderRadius: 999, transition: 'all .15s ease',
            background: seg === s ? '#fff' : 'transparent', color: seg === s ? vg.primary : vg.g500,
            boxShadow: seg === s ? 'var(--shadow-sm)' : 'none',
          }}>{s}</button>
        ))}
      </div>
    </div>
  );
}

/* ---------- PAGE ---------- */
export default function VisaoGeralPage() {
  return (
    <CeoChrome>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* header row: title + filters */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 30, letterSpacing: '-0.02em', margin: 0, color: vg.ink }}>Visão geral</h1>
            <div style={{ fontSize: 13.5, color: vg.g500, marginTop: 4 }}>Rede inteira · 1–30 de junho de 2026</div>
          </div>
          <VgFilters />
        </div>

        <VgKpis />
        <VgRevenue />
        <div className="vg-2col"><VgFunnel /><VgLosses /></div>
        <div className="vg-2col-even"><VgService /><VgScore /></div>
        <VgUnits />
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: vg.g500, margin: '2px 0 14px' }}>Risco & pendências</div>
          <VgRisk />
        </div>
      </div>
    </CeoChrome>
  );
}
