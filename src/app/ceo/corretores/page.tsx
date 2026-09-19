"use client";
import * as React from "react";
import CeoChrome, { ceoPalette, CIc } from "@/components/ceo/CeoChrome";
const { useState, useEffect, useRef, useMemo, useCallback } = React;
const { useState: useStateCr } = React;

const cr: any = {
  ...ceoPalette,
  info: '#3E82E0', infoBg: '#E5EEFB',
  successBg: '#E6F4EC', warnBg: '#FBF1DC', errBg: '#FAE5E5',
};
const crCard = { background: '#fff', border: `1px solid ${cr.g300}`, borderRadius: 16 };

const CR_STATUS: any = { 'Ativo': [cr.success, cr.successBg], 'Em triagem': [cr.info, cr.infoBg], 'Suspenso': [cr.error, cr.errBg] };
function scoreColor(s: any) { if (s == null) return cr.g300; if (s >= 750) return cr.success; if (s >= 650) return cr.warning; return cr.error; }

function CrBadge({ text, fg, bg }: any) {
  return <span style={{ fontSize: 12, fontWeight: 700, color: fg, background: bg, borderRadius: 999, padding: '3px 10px', whiteSpace: 'nowrap' } as React.CSSProperties}>{text}</span>;
}
function initials(n: any) { return n.split(' ').map((p: any) => p[0]).slice(0, 2).join(''); }

/* ---------------- DATA ---------------- */
const BROKERS: any[] = [
  {
    id: 'ricardo', name: 'Ricardo Almeida', creci: 'CRECI-SP 00000-F', unit: 'Matriz', uf: 'SP', score: 861, vgv: 'R$ 1,9 mi', vgl: 'R$ 180 mil', deals: 6, csat: '4,8', status: 'Ativo', carteira: 42, resp: '8 min',
    pillars: [{ l: 'Resultados', v: 270, m: 300 }, { l: 'Atendimento / Qualidade', v: 220, m: 250 }, { l: 'Carteira', v: 175, m: 200 }, { l: 'CRM', v: 120, m: 150 }, { l: 'Disciplina / Planejamento', v: 76, m: 100 }],
    funnel: [{ l: 'Novo', v: 120 }, { l: 'Visita', v: 38 }, { l: 'Proposta', v: 14 }, { l: 'Fechado', v: 6 }],
    reputation: { risk: 'BAIXO', items: ['CRECI ativo, sem sanções no COFECI', 'Sem processos públicos relevantes', 'Reputação pública positiva'], date: '04/06/2026' },
    properties: [
      { cod: '10293', t: 'Apartamento · 3 quartos', bairro: 'Moema · SP', preco: 'R$ 1.250.000', st: 'Ativo' },
      { cod: '10288', t: 'Casa · 4 quartos', bairro: 'Alto de Pinheiros · SP', preco: 'R$ 2.800.000', st: 'Ativo' },
      { cod: '10271', t: 'Cobertura · 4 quartos', bairro: 'Vila Nova Conceição · SP', preco: 'R$ 4.100.000', st: 'Reservado' },
      { cod: '10260', t: 'Apartamento · 2 quartos', bairro: 'Pinheiros · SP', preco: 'R$ 890.000', st: 'Vendido' },
    ],
    history: [{ d: '04/06/2026', t: 'Verificação de reputação concluída — risco baixo', ic: 'shield-check' }, { d: '12/01/2025', t: 'Promovido a corretor sênior', ic: 'trending-up' }, { d: '03/2024', t: 'Aprovado e ativado na Matriz', ic: 'user-check' }],
  },
  {
    id: 'ana', name: 'Ana Marques', creci: 'CRECI-SP 00000-F', unit: 'Matriz', uf: 'SP', score: 845, vgv: 'R$ 1,6 mi', vgl: 'R$ 150 mil', deals: 5, csat: '4,7', status: 'Ativo', carteira: 36, resp: '11 min',
    pillars: [{ l: 'Resultados', v: 255, m: 300 }, { l: 'Atendimento / Qualidade', v: 225, m: 250 }, { l: 'Carteira', v: 165, m: 200 }, { l: 'CRM', v: 128, m: 150 }, { l: 'Disciplina / Planejamento', v: 72, m: 100 }],
    funnel: [{ l: 'Novo', v: 104 }, { l: 'Visita', v: 31 }, { l: 'Proposta', v: 12 }, { l: 'Fechado', v: 5 }],
    reputation: { risk: 'BAIXO', items: ['CRECI ativo, sem sanções', 'Sem processos relevantes', 'Reputação pública positiva'], date: '02/06/2026' },
    properties: [
      { cod: '10312', t: 'Apartamento · 3 quartos', bairro: 'Itaim Bibi · SP', preco: 'R$ 1.450.000', st: 'Ativo' },
      { cod: '10301', t: 'Studio · 1 quarto', bairro: 'Vila Olímpia · SP', preco: 'R$ 620.000', st: 'Ativo' },
      { cod: '10295', t: 'Casa · 3 quartos', bairro: 'Brooklin · SP', preco: 'R$ 1.980.000', st: 'Reservado' },
    ],
    history: [{ d: '02/06/2026', t: 'Verificação de reputação concluída', ic: 'shield-check' }, { d: '06/2024', t: 'Aprovada e ativada na Matriz', ic: 'user-check' }],
  },
  {
    id: 'bruno', name: 'Bruno Lima', creci: 'CRECI-PE 00000-F', unit: 'Franquia Recife', uf: 'PE', score: 838, vgv: 'R$ 1,2 mi', vgl: 'R$ 120 mil', deals: 4, csat: '4,9', status: 'Ativo', carteira: 28, resp: '6 min',
    pillars: [{ l: 'Resultados', v: 240, m: 300 }, { l: 'Atendimento / Qualidade', v: 235, m: 250 }, { l: 'Carteira', v: 150, m: 200 }, { l: 'CRM', v: 130, m: 150 }, { l: 'Disciplina / Planejamento', v: 83, m: 100 }],
    funnel: [{ l: 'Novo', v: 88 }, { l: 'Visita', v: 26 }, { l: 'Proposta', v: 9 }, { l: 'Fechado', v: 4 }],
    reputation: { risk: 'BAIXO', items: ['CRECI ativo, sem sanções', 'Sem processos relevantes', 'Reputação pública positiva'], date: '05/06/2026' },
    properties: [
      { cod: '20145', t: 'Apartamento · 3 quartos', bairro: 'Boa Viagem · PE', preco: 'R$ 980.000', st: 'Ativo' },
      { cod: '20139', t: 'Casa · 4 quartos', bairro: 'Casa Forte · PE', preco: 'R$ 1.350.000', st: 'Ativo' },
      { cod: '20122', t: 'Flat · 1 quarto', bairro: 'Pina · PE', preco: 'R$ 540.000', st: 'Vendido' },
    ],
    history: [{ d: '05/06/2026', t: 'Verificação de reputação concluída', ic: 'shield-check' }, { d: '09/2024', t: 'Aprovado na Franquia Recife', ic: 'user-check' }],
  },
  {
    id: 'carla', name: 'Carla Dias', creci: 'CRECI-SP 00000-F', unit: 'Matriz', uf: 'SP', score: null, vgv: '—', vgl: '—', deals: null, csat: '—', status: 'Em triagem', carteira: 0, resp: '—',
    triagem: { perfil: 'Compatível', completude: 86, ai: ['Cadastro 86% completo', 'Documentos (CRECI, RG, comprovante) validados', 'Perfil profissional compatível com a rede', 'Sem inconsistências detectadas'] },
    reputation: { risk: 'BAIXO', items: ['CRECI ativo, sem sanções no COFECI', 'Sem processos públicos relevantes', 'Reputação pública neutra/positiva'], date: '09/06/2026' },
    history: [{ d: '09/06/2026', t: 'Pré-cadastro enviado · triagem por IA concluída', ic: 'sparkles' }],
  },
  {
    id: 'diego', name: 'Diego Santos', creci: 'CRECI-SP 00000-F', unit: 'Associado Campinas', uf: 'SP', score: 540, vgv: 'R$ 0,2 mi', vgl: '—', deals: 1, csat: '3,9', status: 'Suspenso', carteira: 9, resp: '42 min',
    pillars: [{ l: 'Resultados', v: 110, m: 300 }, { l: 'Atendimento / Qualidade', v: 130, m: 250 }, { l: 'Carteira', v: 95, m: 200 }, { l: 'CRM', v: 70, m: 150 }, { l: 'Disciplina / Planejamento', v: 35, m: 100 }],
    funnel: [{ l: 'Novo', v: 30 }, { l: 'Visita', v: 6 }, { l: 'Proposta', v: 2 }, { l: 'Fechado', v: 1 }],
    reputation: { risk: 'MÉDIO', items: ['CRECI ativo', 'CSAT abaixo do mínimo da rede', 'Reclamações recorrentes de atendimento'], date: '01/06/2026' },
    properties: [
      { cod: '30012', t: 'Apartamento · 2 quartos', bairro: 'Cambuí · SP', preco: 'R$ 720.000', st: 'Despublicado' },
      { cod: '30008', t: 'Casa · 3 quartos', bairro: 'Barão Geraldo · SP', preco: 'R$ 1.100.000', st: 'Despublicado' },
    ],
    history: [{ d: '01/06/2026', t: 'Auditoria — publicações despublicadas · leads pausados', ic: 'shield-alert' }, { d: '05/2025', t: 'Aprovado no Associado Campinas', ic: 'user-check' }],
  },
];

/* ---------------- SUMMARY ---------------- */
function CrSummary() {
  const cards = [
    { l: 'Ativos', v: '312', ic: 'user-check', tone: cr.success },
    { l: 'Em triagem', v: '8', ic: 'user-search', tone: cr.info },
    { l: 'Suspensos', v: '3', ic: 'user-x', tone: cr.error },
    { l: 'Score médio', v: '712', ic: 'gauge', tone: cr.primary },
    { l: 'Novos no mês', v: '14', ic: 'user-plus', tone: cr.primary },
  ];
  return (
    <div className="cr-summary">
      {cards.map(c => (
        <div key={c.l} style={{ ...crCard, padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ width: 38, height: 38, borderRadius: 10, background: cr.lilac2, display: 'grid', placeItems: 'center', flexShrink: 0 }}><CIc n={c.ic} s={18} c={c.tone} /></span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: cr.ink, lineHeight: 1.1 }}>{c.v}</div>
            <div style={{ fontSize: 12, color: cr.g500, lineHeight: 1.3 }}>{c.l}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------------- RECRUITMENT FUNNEL ---------------- */
function CrRecruit({ onTriagem }: any) {
  const steps: any[] = [
    { l: 'Pré-cadastro', v: 12, ic: 'user-plus', note: 'recebidos' },
    { l: 'Triagem por IA', v: 8, ic: 'sparkles', note: 'fila de aprovação', action: true },
    { l: 'Aprovado', v: 5, ic: 'user-check', note: 'aguardando ativação' },
    { l: 'Ativo', v: 312, ic: 'badge-check', note: 'na rede' },
  ];
  return (
    <div style={{ ...crCard, padding: 22 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18, gap: 12, flexWrap: 'wrap' } as React.CSSProperties}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: cr.ink }}>Funil de recrutamento</div>
          <div style={{ fontSize: 13, color: cr.g500, marginTop: 2 }}>Portão de entrada com triagem por IA</div>
        </div>
      </div>
      <div className="cr-recruit">
        {steps.map((s, i) => (
          <React.Fragment key={s.l}>
            <button onClick={s.action ? onTriagem : undefined} style={{
              flex: 1, minWidth: 140, border: `1px solid ${s.action ? cr.primary : cr.g300}`, background: s.action ? cr.lilac1 : cr.page, borderRadius: 12, padding: '14px 16px',
              cursor: s.action ? 'pointer' : 'default', textAlign: 'left', fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', gap: 12,
            } as React.CSSProperties}>
              <span style={{ width: 36, height: 36, borderRadius: 9, background: '#fff', border: `1px solid ${cr.g300}`, display: 'grid', placeItems: 'center', flexShrink: 0 }}><CIc n={s.ic} s={18} c={cr.primary} /></span>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, color: cr.ink, lineHeight: 1 }}>{s.v}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: cr.ink, marginTop: 3 }}>{s.l}</div>
                <div style={{ fontSize: 11.5, color: s.action ? cr.primary : cr.g500, fontWeight: s.action ? 600 : 400 }}>{s.action ? 'ver fila →' : s.note}</div>
              </div>
            </button>
            {i < steps.length - 1 && <div className="cr-arrow" style={{ display: 'grid', placeItems: 'center', flexShrink: 0 }}><CIc n="chevron-right" s={20} c={cr.g300} /></div>}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

/* ---------------- SELECT ---------------- */
function CrSelect({ value, onChange, options, icon }: any) {
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' } as React.CSSProperties}>
      {icon && <span style={{ position: 'absolute', left: 12, pointerEvents: 'none', display: 'flex' } as React.CSSProperties}><CIc n={icon} s={15} c={cr.g500} /></span>}
      <select value={value} onChange={e => onChange(e.target.value)} style={{ appearance: 'none', WebkitAppearance: 'none', border: `1px solid ${cr.g300}`, background: '#fff', borderRadius: 10, padding: icon ? '9px 32px 9px 34px' : '9px 32px 9px 13px', fontFamily: 'var(--font-body)', fontSize: 13.5, fontWeight: 600, color: cr.ink, cursor: 'pointer', outline: 'none' } as React.CSSProperties}>
        {options.map((o: any) => <option key={o} value={o}>{o}</option>)}
      </select>
      <span style={{ position: 'absolute', right: 11, pointerEvents: 'none', display: 'flex' } as React.CSSProperties}><CIc n="chevron-down" s={15} c={cr.g500} /></span>
    </div>
  );
}

/* ---------------- TABLE ---------------- */
function CrTable({ onSelect, statusFilter, setStatusFilter }: any) {
  const [q, setQ] = useStateCr('');
  const [fUnit, setFUnit] = useStateCr('Todas as unidades');
  const [fScore, setFScore] = useStateCr('Todo o score');
  const [fRegion, setFRegion] = useStateCr('Todas as regiões');

  const inBand = (s: any) => fScore === 'Todo o score' || (fScore === '750+' ? s >= 750 : fScore === '650–749' ? (s >= 650 && s < 750) : s != null && s < 650);
  const rows = BROKERS.filter(b =>
    (q === '' || (b.name + b.creci + b.unit).toLowerCase().includes(q.toLowerCase())) &&
    (fUnit === 'Todas as unidades' || b.unit === fUnit) &&
    (statusFilter === 'Todos os status' || b.status === statusFilter) &&
    (fRegion === 'Todas as regiões' || b.uf === fRegion) &&
    (fScore === 'Todo o score' || inBand(b.score))
  );

  const cols = ['Corretor', 'Unidade', 'Score', 'VGV (mês)', 'Negócios', 'Imóveis', 'CSAT', 'Status'];
  const numAlign: any = { 'Score': 1, 'VGV (mês)': 1, 'Negócios': 1, 'Imóveis': 1, 'CSAT': 1 };

  return (
    <div style={{ ...crCard, padding: 22 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, gap: 12, flexWrap: 'wrap' } as React.CSSProperties}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: cr.ink }}>Corretores</div>
          <div style={{ fontSize: 13, color: cr.g500, marginTop: 2 }}>{rows.length} {rows.length === 1 ? 'corretor' : 'corretores'}{statusFilter !== 'Todos os status' ? ` · ${statusFilter}` : ''}</div>
        </div>
      </div>

      <div className="cr-filters">
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: cr.g100, borderRadius: 10, padding: '0 13px', height: 40, flex: 1, minWidth: 190 }}>
          <CIc n="search" s={17} c={cr.g500} />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar corretor, CRECI…" style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontFamily: 'var(--font-body)', fontSize: 13.5, color: cr.ink }} />
        </div>
        <CrSelect icon="building-2" value={fUnit} onChange={setFUnit} options={['Todas as unidades', 'Matriz', 'Franquia Recife', 'Associado Campinas']} />
        <CrSelect icon="activity" value={statusFilter} onChange={setStatusFilter} options={['Todos os status', 'Ativo', 'Em triagem', 'Suspenso']} />
        <CrSelect icon="gauge" value={fScore} onChange={setFScore} options={['Todo o score', '750+', '650–749', '< 650']} />
        <CrSelect icon="map-pin" value={fRegion} onChange={setFRegion} options={['Todas as regiões', 'SP', 'PE']} />
      </div>

      {/* desktop table */}
      <div className="cr-table-wrap" style={{ overflowX: 'auto', marginTop: 18 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 } as React.CSSProperties}>
          <thead><tr>
            {cols.map(h => <th key={h} style={{ textAlign: numAlign[h] ? 'right' : 'left', fontSize: 11, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: cr.g500, padding: '0 14px 12px', borderBottom: `1px solid ${cr.g300}`, whiteSpace: 'nowrap' } as React.CSSProperties}>{h}</th>)}
          </tr></thead>
          <tbody>
            {rows.map(b => {
              const [sFg, sBg] = CR_STATUS[b.status];
              return (
                <tr key={b.id} onClick={() => onSelect(b)} style={{ borderBottom: `1px solid ${cr.g100}`, cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = cr.lilac1}
                  onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                      <span style={{ width: 38, height: 38, borderRadius: '50%', background: `linear-gradient(135deg, ${cr.light}, ${cr.deep})`, color: '#fff', fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-display)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>{initials(b.name)}</span>
                      <div><div style={{ fontSize: 14, fontWeight: 600, color: cr.ink }}>{b.name}</div><div style={{ fontSize: 12, color: cr.g500 }}>{b.creci}</div></div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: 13.5, color: cr.g700, whiteSpace: 'nowrap' } as React.CSSProperties}>{b.unit}</td>
                  <td style={{ padding: '12px 14px', textAlign: 'right' } as React.CSSProperties}>
                    {b.score != null
                      ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: scoreColor(b.score) }} /><span style={{ fontSize: 14, fontWeight: 700, color: cr.ink }}>{b.score}</span></span>
                      : <span style={{ fontSize: 13.5, color: cr.g300 }}>—</span>}
                  </td>
                  <td style={{ padding: '12px 14px', textAlign: 'right', fontSize: 14, fontWeight: 600, color: b.vgv === '—' ? cr.g300 : cr.ink, whiteSpace: 'nowrap' } as React.CSSProperties}>{b.vgv}</td>
                  <td style={{ padding: '12px 14px', textAlign: 'right', fontSize: 14, color: cr.g700 } as React.CSSProperties}>{b.deals == null ? '—' : b.deals}</td>
                  <td style={{ padding: '12px 14px', textAlign: 'right', fontSize: 14, fontWeight: 600, color: b.carteira ? cr.ink : cr.g300 } as React.CSSProperties}>{b.carteira || '—'}</td>
                  <td style={{ padding: '12px 14px', textAlign: 'right', fontSize: 14, color: cr.g700 } as React.CSSProperties}>{b.csat}</td>
                  <td style={{ padding: '12px 14px' }}><CrBadge text={b.status} fg={sFg} bg={sBg} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* mobile cards */}
      <div className="cr-table-cards" style={{ marginTop: 18, flexDirection: 'column', gap: 12 } as React.CSSProperties}>
        {rows.map(b => {
          const [sFg, sBg] = CR_STATUS[b.status];
          return (
            <button key={b.id} onClick={() => onSelect(b)} style={{ ...crCard, background: cr.page, padding: 16, textAlign: 'left', cursor: 'pointer', fontFamily: 'var(--font-body)', width: '100%' } as React.CSSProperties}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 12 }}>
                <span style={{ width: 40, height: 40, borderRadius: '50%', background: `linear-gradient(135deg, ${cr.light}, ${cr.deep})`, color: '#fff', fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-display)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>{initials(b.name)}</span>
                <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 14.5, fontWeight: 600, color: cr.ink }}>{b.name}</div><div style={{ fontSize: 12.5, color: cr.g500 }}>{b.creci} · {b.unit}</div></div>
                <CrBadge text={b.status} fg={sFg} bg={sBg} />
              </div>
              <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' } as React.CSSProperties}>
                {[['Score', b.score ?? '—'], ['VGV', b.vgv], ['Negócios', b.deals ?? '—'], ['Imóveis', b.carteira || '—'], ['CSAT', b.csat]].map(([l, v]) => (
                  <div key={l}><div style={{ fontSize: 11, color: cr.g500 }}>{l}</div><div style={{ fontSize: 13.5, fontWeight: 600, color: l === 'Score' && b.score != null ? scoreColor(b.score) : cr.ink }}>{v}</div></div>
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- DRAWER SHELL ---------------- */
function CrDrawer({ open, onClose, children, width = 500 }: any) {
  return (
    <React.Fragment>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(28,26,34,.45)', zIndex: 80, opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none', transition: 'opacity .2s ease' } as React.CSSProperties} />
      <div className="cr-drawer" style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width, maxWidth: '100vw', background: '#fff', zIndex: 81, boxShadow: 'var(--shadow-lg)', transform: open ? 'translateX(0)' : 'translateX(100%)', transition: 'transform .26s cubic-bezier(.2,.7,.3,1)', display: 'flex', flexDirection: 'column' } as React.CSSProperties}>
        {open && children}
      </div>
    </React.Fragment>
  );
}

const crSecLabel: any = { fontSize: 11.5, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: cr.g500, margin: '0 0 12px' };

/* ---------------- REPUTATION CARD ---------------- */
function CrReputation({ rep }: any) {
  const riskTone = rep.risk === 'BAIXO' ? [cr.success, cr.successBg] : rep.risk === 'MÉDIO' ? [cr.warning, cr.warnBg] : [cr.error, cr.errBg];
  return (
    <div style={{ background: cr.page, border: `1px solid ${cr.g300}`, borderRadius: 12, padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <CIc n="shield-check" s={18} c={cr.primary} />
        <span style={{ fontSize: 13.5, fontWeight: 700, color: cr.ink, flex: 1 }}>Reputação & risco</span>
        <CrBadge text={`Risco ${rep.risk}`} fg={riskTone[0]} bg={riskTone[1]} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 } as React.CSSProperties}>
        {rep.items.map((it: any) => (
          <div key={it} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: cr.g700 }}>
            <CIc n="check" s={15} c={cr.success} style={{ marginTop: 2 }} /> <span>{it}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${cr.g100}`, fontSize: 11.5, color: cr.g500, lineHeight: 1.5 }}>
        <CIc n="info" s={13} c={cr.g500} style={{ verticalAlign: '-2px', marginRight: 4 }} />
        Última verificação {rep.date} · varredura de dados públicos (CRECI/COFECI, processos, reputação). Due diligence com consentimento no cadastro.
      </div>
    </div>
  );
}

/* ---------------- PROPERTIES (carteira) ---------------- */
const PROP_STATUS: any = { 'Ativo': [cr.success, cr.successBg], 'Reservado': [cr.warning, cr.warnBg], 'Vendido': [cr.info, cr.infoBg], 'Despublicado': [cr.error, cr.errBg] };
function CrProperties({ broker }: any) {
  const props = broker.properties || [];
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span style={crSecLabel.textTransform ? { ...crSecLabel, margin: 0 } : crSecLabel}>Carteira de imóveis</span>
        <span style={{ fontSize: 11.5, fontWeight: 700, color: cr.primary, background: cr.lilac2, borderRadius: 999, padding: '2px 9px' }}>{broker.carteira} imóveis</span>
      </div>
      {broker.status === 'Suspenso' && (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, background: cr.errBg, borderRadius: 10, padding: '10px 12px', marginBottom: 12, fontSize: 12.5, color: cr.g700, lineHeight: 1.5 }}>
          <CIc n="shield-alert" s={15} c={cr.error} style={{ marginTop: 1, flexShrink: 0 }} /> Publicações despublicadas por auditoria — fora dos portais e do site.
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 } as React.CSSProperties}>
        {props.map((p: any) => {
          const [pFg, pBg] = PROP_STATUS[p.st];
          return (
            <div key={p.cod} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: cr.page, border: `1px solid ${cr.g300}`, borderRadius: 11 }}>
              <span style={{ width: 44, height: 44, borderRadius: 9, background: cr.lilac2, display: 'grid', placeItems: 'center', flexShrink: 0 }}><CIc n="building-2" s={20} c={cr.primary} /></span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: cr.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } as React.CSSProperties}>{p.t}</div>
                <div style={{ fontSize: 12, color: cr.g500 }}>Cód: {p.cod} · {p.bairro}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 } as React.CSSProperties}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: cr.ink, whiteSpace: 'nowrap' } as React.CSSProperties}>{p.preco}</div>
                <span style={{ fontSize: 11, fontWeight: 700, color: pFg, background: pBg, borderRadius: 999, padding: '2px 8px' }}>{p.st}</span>
              </div>
            </div>
          );
        })}
      </div>
      {broker.carteira > props.length && (
        <button style={{ width: '100%', marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, border: `1px solid ${cr.g300}`, background: '#fff', color: cr.primary, borderRadius: 10, padding: '10px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13.5 }}>
          Ver todos os {broker.carteira} imóveis <CIc n="arrow-right" s={15} c={cr.primary} />
        </button>
      )}
    </div>
  );
}

/* ---------------- DETAIL DRAWER ---------------- */
function CrDetail({ broker, onClose, onAudit }: any) {
  if (!broker) return null;
  const [sFg, sBg] = CR_STATUS[broker.status];
  const triagem = broker.status === 'Em triagem';
  const fmax = broker.funnel ? Math.max(...broker.funnel.map((f: any) => f.v)) : 1;
  return (
    <React.Fragment>
      {/* header */}
      <div style={{ padding: '20px 24px', borderBottom: `1px solid ${cr.g300}` }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <span style={{ width: 50, height: 50, borderRadius: '50%', background: `linear-gradient(135deg, ${cr.light}, ${cr.deep})`, color: '#fff', fontSize: 16, fontWeight: 700, fontFamily: 'var(--font-display)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>{initials(broker.name)}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 19, color: cr.ink, lineHeight: 1.2 }}>{broker.name}</div>
            <div style={{ fontSize: 12.5, color: cr.g500, marginTop: 2 }}>{broker.creci}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 7 }}>
              <CrBadge text={broker.status} fg={sFg} bg={sBg} />
              <span style={{ fontSize: 12.5, color: cr.g500 }}>{broker.unit}</span>
            </div>
          </div>
          <button onClick={onClose} style={{ width: 34, height: 34, border: `1px solid ${cr.g300}`, background: '#fff', borderRadius: 9, display: 'grid', placeItems: 'center', cursor: 'pointer', flexShrink: 0 }}><CIc n="x" s={18} c={cr.g700} /></button>
        </div>
        {/* actions */}
        {triagem ? (
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, border: 'none', background: cr.success, color: '#fff', borderRadius: 10, padding: '11px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 14 }}><CIc n="check" s={17} c="#fff" /> Aprovar</button>
            <button style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, border: `1px solid ${cr.g300}`, background: '#fff', color: cr.error, borderRadius: 10, padding: '11px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14 }}><CIc n="x" s={17} c={cr.error} /> Recusar</button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, border: `1px solid ${cr.g300}`, background: '#fff', color: cr.g700, borderRadius: 10, padding: '10px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13.5 }}><CIc n={broker.status === 'Suspenso' ? 'play' : 'pause'} s={16} c={cr.g700} /> {broker.status === 'Suspenso' ? 'Reativar' : 'Suspender'}</button>
            <button onClick={() => onAudit(broker)} style={{ flex: 1.3, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, border: `1px solid ${cr.error}`, background: cr.errBg, color: cr.error, borderRadius: 10, padding: '10px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 13.5 }}><CIc n="shield-alert" s={16} c={cr.error} /> Despublicar tudo</button>
          </div>
        )}
      </div>

      {/* body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
        {triagem ? (
          <React.Fragment>
            {/* TRIAGEM */}
            <div style={{ marginBottom: 24 }}>
              <div style={crSecLabel}>Triagem por IA</div>
              <div style={{ background: cr.lilac1, border: `1px solid ${cr.lilac2}`, borderRadius: 12, padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  <span style={{ width: 40, height: 40, borderRadius: 10, background: '#fff', display: 'grid', placeItems: 'center', flexShrink: 0 }}><CIc n="sparkles" s={20} c={cr.primary} /></span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: cr.ink }}>Perfil {broker.triagem.perfil}</div>
                    <div style={{ fontSize: 12.5, color: cr.g500 }}>Cadastro {broker.triagem.completude}% completo</div>
                  </div>
                </div>
                <div style={{ height: 8, background: cr.g100, borderRadius: 999, overflow: 'hidden', marginBottom: 14 }}>
                  <div style={{ width: `${broker.triagem.completude}%`, height: '100%', background: cr.primary, borderRadius: 999 }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 } as React.CSSProperties}>
                  {broker.triagem.ai.map((it: any) => <div key={it} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: cr.g700 }}><CIc n="check" s={15} c={cr.success} style={{ marginTop: 2 }} /> <span>{it}</span></div>)}
                </div>
              </div>
            </div>
            <div style={{ marginBottom: 24 }}>
              <div style={crSecLabel}>Análise de reputação</div>
              <CrReputation rep={broker.reputation} />
            </div>
            <div style={{ background: cr.infoBg, borderRadius: 12, padding: '12px 14px', display: 'flex', alignItems: 'flex-start', gap: 9, fontSize: 12.5, color: cr.g700, lineHeight: 1.5 }}>
              <CIc n="shield" s={16} c={cr.info} style={{ marginTop: 1, flexShrink: 0 }} />
              <span>Este é o <strong>portão de entrada</strong> da rede. Ao aprovar, o corretor é ativado na unidade <strong>{broker.unit}</strong>.</span>
            </div>
          </React.Fragment>
        ) : (
          <React.Fragment>
            {/* SCORE */}
            <div style={{ marginBottom: 24 }}>
              <div style={crSecLabel}>Score</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 4 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 46, lineHeight: 1, color: scoreColor(broker.score) }}>{broker.score}</span>
                <span style={{ fontSize: 13, color: cr.g500 }}>/ 1000</span>
              </div>
              <div style={{ fontSize: 12, color: cr.g500, marginBottom: 16 }}>capturado do trabalho real — não digitado</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 11 } as React.CSSProperties}>
                {broker.pillars.map((p: any) => (
                  <div key={p.l}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: 13, color: cr.g700 }}>{p.l}</span>
                      <span style={{ fontSize: 13, color: cr.g500 }}><strong style={{ color: cr.ink }}>{p.v}</strong>/{p.m}</span>
                    </div>
                    <div style={{ height: 8, background: cr.g100, borderRadius: 999, overflow: 'hidden' }}>
                      <div style={{ width: `${(p.v / p.m) * 100}%`, height: '100%', background: cr.primary, borderRadius: 999 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* DESEMPENHO */}
            <div style={{ marginBottom: 24 }}>
              <div style={crSecLabel}>Desempenho</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 14 }}>
                {[['VGV', broker.vgv], ['VGL', broker.vgl], ['Negócios', broker.deals], ['Tempo resp.', broker.resp], ['CSAT', broker.csat]].map(([l, v]) => (
                  <div key={l} style={{ background: cr.page, borderRadius: 10, padding: '11px 12px' }}>
                    <div style={{ fontSize: 11.5, color: cr.g500 }}>{l}</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: cr.ink, marginTop: 2 }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 12, color: cr.g500, marginBottom: 8 }}>Mini funil</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 } as React.CSSProperties}>
                {broker.funnel.map((f: any) => (
                  <div key={f.l} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ width: 54, fontSize: 12.5, color: cr.g700, textAlign: 'right' } as React.CSSProperties}>{f.l}</span>
                    <div style={{ flex: 1, height: 22, background: cr.g100, borderRadius: 6, overflow: 'hidden' }}>
                      <div style={{ width: `${Math.max(8, (f.v / fmax) * 100)}%`, height: '100%', background: cr.primary, borderRadius: 6, display: 'flex', alignItems: 'center', paddingLeft: 8, color: '#fff', fontSize: 11.5, fontWeight: 700 }}>{f.v}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CARTEIRA DE IMÓVEIS */}
            <div style={{ marginBottom: 24 }}>
              <CrProperties broker={broker} />
            </div>

            {/* REPUTATION */}
            <div style={{ marginBottom: 24 }}>
              <div style={crSecLabel}>Análise de reputação e risco</div>
              <CrReputation rep={broker.reputation} />
            </div>

            {/* HISTORY */}
            <div>
              <div style={crSecLabel}>Histórico</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 } as React.CSSProperties}>
                {broker.history.map((h: any, i: any) => (
                  <div key={i} style={{ display: 'flex', gap: 12, padding: '6px 0' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' } as React.CSSProperties}>
                      <span style={{ width: 30, height: 30, borderRadius: '50%', background: cr.lilac2, display: 'grid', placeItems: 'center', flexShrink: 0 }}><CIc n={h.ic} s={15} c={cr.primary} /></span>
                      {i < broker.history.length - 1 && <span style={{ width: 1, flex: 1, background: cr.g300, marginTop: 2 }} />}
                    </div>
                    <div style={{ paddingBottom: 10 }}>
                      <div style={{ fontSize: 13.5, color: cr.ink, lineHeight: 1.4 }}>{h.t}</div>
                      <div style={{ fontSize: 12, color: cr.g500 }}>{h.d}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </React.Fragment>
        )}
      </div>
    </React.Fragment>
  );
}

/* ---------------- AUDIT MODAL ---------------- */
function CrAuditModal({ broker, onClose }: any) {
  const [reason, setReason] = useStateCr('');
  if (!broker) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 90, display: 'grid', placeItems: 'center', padding: 16 } as React.CSSProperties}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(28,26,34,.55)' } as React.CSSProperties} />
      <div style={{ position: 'relative', width: 'min(520px, 100%)', maxHeight: '90vh', overflowY: 'auto', background: '#fff', borderRadius: 18, boxShadow: 'var(--shadow-lg)', borderTop: `4px solid ${cr.error}` } as React.CSSProperties}>
        <div style={{ padding: '22px 24px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ width: 44, height: 44, borderRadius: 12, background: cr.errBg, display: 'grid', placeItems: 'center', flexShrink: 0 }}><CIc n="shield-alert" s={22} c={cr.error} /></span>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 19, color: cr.ink }}>Auditoria — despublicar tudo</div>
              <div style={{ fontSize: 13, color: cr.g500 }}>{broker.name} · {broker.unit}</div>
            </div>
          </div>
          <div style={{ background: cr.warnBg, border: `1px solid ${cr.warning}40`, borderRadius: 12, padding: '14px 16px', marginTop: 18, fontSize: 13.5, color: cr.g700, lineHeight: 1.55 }}>
            Esta ação vai <strong style={{ color: cr.ink }}>despublicar TODAS as publicações deste corretor de TODOS os canais</strong> (portais + site) e <strong style={{ color: cr.ink }}>pausar o fluxo de leads</strong>. É <strong style={{ color: cr.ink }}>reversível</strong>.
          </div>
          <div style={{ marginTop: 16 }}>
            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: cr.g700, marginBottom: 6 }}>Motivo da auditoria <span style={{ color: cr.error }}>*</span></label>
            <textarea value={reason} onChange={e => setReason(e.target.value)} rows={3} placeholder="Descreva o motivo (ficará registrado)…" style={{ width: '100%', border: `1px solid ${cr.g300}`, borderRadius: 10, padding: '11px 13px', fontFamily: 'var(--font-body)', fontSize: 13.5, color: cr.ink, outline: 'none', resize: 'vertical' } as React.CSSProperties} />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginTop: 12, fontSize: 12, color: cr.g500, lineHeight: 1.5 }}>
            <CIc n="lock" s={14} c={cr.g500} style={{ marginTop: 1, flexShrink: 0 }} />
            <span>Fica registrado (quem, quando, por quê). Ação restrita a <strong>CEO / Compliance</strong> e espelhada em <strong>Jurídico &amp; LGPD</strong>.</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, padding: '18px 24px 22px' }}>
          <button onClick={onClose} style={{ flex: 1, border: `1px solid ${cr.g300}`, background: '#fff', color: cr.g700, borderRadius: 10, padding: '11px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14 }}>Cancelar</button>
          <button onClick={onClose} disabled={!reason.trim()} style={{ flex: 1.6, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, border: 'none', background: reason.trim() ? cr.error : cr.g300, color: '#fff', borderRadius: 10, padding: '11px', cursor: reason.trim() ? 'pointer' : 'not-allowed', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 14 }}><CIc n="shield-alert" s={17} c="#fff" /> Despublicar e pausar leads</button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- PAGE ---------------- */
export default function CorretoresPage() {
  const [selected, setSelected] = useStateCr<any>(null);
  const [audit, setAudit] = useStateCr<any>(null);
  const [statusFilter, setStatusFilter] = useStateCr('Todos os status');
  return (
    <CeoChrome>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 } as React.CSSProperties}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap' } as React.CSSProperties}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 30, letterSpacing: '-0.02em', margin: 0, color: cr.ink }}>Corretores</h1>
          <div style={{ fontSize: 13.5, color: cr.g500, marginTop: 4 }}>Aprove, acompanhe o score e gerencie a rede de corretores</div>
        </div>
      </div>

      <CrSummary />
      <CrRecruit onTriagem={() => setStatusFilter('Em triagem')} />
      <CrTable onSelect={setSelected} statusFilter={statusFilter} setStatusFilter={setStatusFilter} />

      <CrDrawer open={!!selected} onClose={() => setSelected(null)}>
        <CrDetail broker={selected} onClose={() => setSelected(null)} onAudit={(b: any) => setAudit(b)} />
      </CrDrawer>
      {audit && <CrAuditModal broker={audit} onClose={() => setAudit(null)} />}
    </div>
    </CeoChrome>
  );
}
