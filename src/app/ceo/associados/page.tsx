"use client";
import * as React from "react";
import CeoChrome, { ceoPalette, CIc, ceoPersona } from "@/components/ceo/CeoChrome";
import { demo, emailDemo } from "@/config/demo";
const { useState, useEffect, useRef, useMemo, useCallback } = React;

const { useState: useStateAf } = React;

const af: any = {
  ...ceoPalette,
  info: '#3E82E0', infoBg: '#E5EEFB',
  successBg: '#E6F4EC', warnBg: '#FBF1DC', errBg: '#FAE5E5',
};
const afCard = { background: '#fff', border: `1px solid ${af.g300}`, borderRadius: 16 };

const TYPE_COLOR: any = { Matriz: af.primary, Franquia: af.info, Associado: af.warning };
const STATUS_COLOR: any = { 'Ativa': [af.success, af.successBg], 'Em implantação': [af.warning, af.warnBg], 'Suspensa': [af.error, af.errBg] };

function Badge({ text, fg, bg }: any) {
  return <span style={{ fontSize: 12, fontWeight: 700, color: fg, background: bg, borderRadius: 999, padding: '3px 10px', whiteSpace: 'nowrap' }}>{text}</span>;
}

/* ---------------- DATA ---------------- */
const AF_UNITS: any[] = [
  {
    id: 'matriz', name: `Matriz ${demo.nome}`, type: 'Matriz', resp: ceoPersona.nome, region: 'São Paulo · Nacional', uf: 'SP',
    cor: 280, vgv: 'R$ 14,0 mi', vgl: 'R$ 1,4 mi', score: 720, royalties: '—', status: 'Ativa', icon: 'building',
    contact: `${ceoPersona.email} · ${demo.telefone}`, creci: 'CRECI-SP 00000-J', cnpj: '12.345.678/0001-00',
    territory: 'Nacional (sede)', brand: `${demo.nome} (marca-mãe)`, plan: 'Sede', contract: 'Própria · sem royalties', royaltyPct: '—',
    funnel: [{ l: 'Novo', v: 820 }, { l: 'Visita', v: 140 }, { l: 'Proposta', v: 60 }, { l: 'Fechado', v: 31 }],
    royDue: '—', royPaid: '—',
    team: [{ n: 'Ricardo Almeida', s: 861, st: 'Ativo' }, { n: 'Bruno Lima', s: 838, st: 'Ativo' }, { n: 'Patrícia Gomes', s: 690, st: 'Ativo' }],
    admin: { n: ceoPersona.nome, role: 'CEO da rede', mail: ceoPersona.email },
  },
  {
    id: 'recife', name: 'Franquia Recife', type: 'Franquia', resp: 'Marina Costa', region: 'Recife · PE', uf: 'PE',
    cor: 22, vgv: 'R$ 2,1 mi', vgl: 'R$ 320 mil', score: 690, royalties: 'R$ 10,5 mil', status: 'Ativa', icon: 'store',
    contact: `${emailDemo('marina.costa')} · (81) 90000-0002`, creci: 'CRECI-PE 00000-J', cnpj: '34.567.890/0001-12',
    territory: 'Recife e Região Metropolitana · PE', brand: `${demo.nomeCurto} Recife (white-label)`, plan: 'Franquia Premium',
    contract: 'Vigência 03/2025 – 03/2030', royaltyPct: '5%',
    funnel: [{ l: 'Novo', v: 210 }, { l: 'Visita', v: 48 }, { l: 'Proposta', v: 19 }, { l: 'Fechado', v: 7 }],
    royDue: 'R$ 10,5 mil', royPaid: 'R$ 8,0 mil',
    team: [{ n: 'Felipe Andrade', s: 742, st: 'Ativo' }, { n: 'Carla Menezes', s: 701, st: 'Ativo' }, { n: 'Diego Tavares', s: 612, st: 'Em análise' }],
    admin: { n: 'Marina Costa', role: 'Admin da unidade', mail: emailDemo('marina.costa') },
  },
  {
    id: 'curitiba', name: 'Franquia Curitiba', type: 'Franquia', resp: 'Rafael Souza', region: 'Curitiba · PR', uf: 'PR',
    cor: 8, vgv: 'R$ 0,6 mi', vgl: 'R$ 90 mil', score: 665, royalties: 'R$ 3,0 mil', status: 'Em implantação', icon: 'store',
    contact: `${emailDemo('rafael')} · (41) 90000-0003`, creci: 'CRECI-PR 00000-J', cnpj: '45.678.901/0001-23',
    territory: 'Curitiba · PR', brand: `${demo.nomeCurto} Curitiba (white-label)`, plan: 'Franquia',
    contract: 'Vigência 05/2026 – 05/2031', royaltyPct: '5%',
    funnel: [{ l: 'Novo', v: 60 }, { l: 'Visita', v: 12 }, { l: 'Proposta', v: 4 }, { l: 'Fechado', v: 2 }],
    royDue: 'R$ 3,0 mil', royPaid: 'R$ 0',
    team: [{ n: 'Letícia Borges', s: 680, st: 'Ativo' }, { n: 'André Pires', s: 650, st: 'Ativo' }],
    admin: { n: 'Rafael Souza', role: 'Admin da unidade', mail: emailDemo('rafael') },
  },
  {
    id: 'campinas', name: 'Associado Campinas', type: 'Associado', resp: 'Juliana Moraes', region: 'Campinas · SP', uf: 'SP',
    cor: 10, vgv: 'R$ 2,3 mi', vgl: 'R$ 210 mil', score: 705, royalties: '—', status: 'Ativa', icon: 'handshake',
    contact: `${emailDemo('juliana')} · (19) 90000-0004`, creci: 'CRECI-SP 00000-J', cnpj: '56.789.012/0001-34',
    territory: 'Campinas · SP', brand: `${demo.nomeCurto} (co-marca)`, plan: 'Associado',
    contract: 'Adesão 01/2025 · sem exclusividade', royaltyPct: '—',
    funnel: [{ l: 'Novo', v: 90 }, { l: 'Visita', v: 22 }, { l: 'Proposta', v: 10 }, { l: 'Fechado', v: 5 }],
    royDue: '—', royPaid: '—',
    team: [{ n: 'Marcos Moraes', s: 730, st: 'Ativo' }, { n: 'Sônia Prado', s: 698, st: 'Ativo' }],
    admin: { n: 'Juliana Moraes', role: 'Admin da unidade', mail: emailDemo('juliana') },
  },
];

/* ---------------- SUMMARY ---------------- */
function AfSummary() {
  const cards = [
    { l: 'Unidades', v: '86', ic: 'layers', tone: af.primary },
    { l: 'Franquias', v: '36', ic: 'store', tone: af.info },
    { l: 'Associados', v: '49', ic: 'handshake', tone: af.warning },
    { l: 'Matriz', v: '1', ic: 'building', tone: af.primary },
    { l: 'Corretores na rede', v: '342', ic: 'users', tone: af.primary },
    { l: 'Royalties do mês', v: 'R$ 38 mil', ic: 'badge-percent', tone: af.success },
  ];
  return (
    <div className="af-summary">
      {cards.map(c => (
        <div key={c.l} style={{ ...afCard, padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ width: 38, height: 38, borderRadius: 10, background: af.lilac2, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <CIc n={c.ic} s={18} c={c.tone} />
          </span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: af.ink, lineHeight: 1.1 }}>{c.v}</div>
            <div style={{ fontSize: 12, color: af.g500, lineHeight: 1.3 }}>{c.l}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------------- ONBOARDING ---------------- */
function AfOnboarding() {
  const steps = [
    { l: 'Prospecto', v: 3, ic: 'search', note: 'em conversa' },
    { l: 'Contrato', v: 1, ic: 'file-signature', note: 'assinatura' },
    { l: 'Setup', v: 1, ic: 'settings-2', note: 'configuração' },
    { l: 'No ar', v: 2, ic: 'rocket', note: 'últimos 90 dias' },
  ];
  return (
    <div style={{ ...afCard, padding: 22 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18, gap: 12, flexWrap: 'wrap' } as React.CSSProperties}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: af.ink }}>Onboarding de franquias</div>
          <div style={{ fontSize: 13, color: af.g500, marginTop: 2 }}>Novas franquias em implantação</div>
        </div>
        <Badge text="7 em esteira" fg={af.primary} bg={af.lilac2} />
      </div>
      <div className="af-onboarding">
        {steps.map((s, i) => (
          <React.Fragment key={s.l}>
            <button style={{
              flex: 1, minWidth: 130, border: `1px solid ${af.g300}`, background: af.page, borderRadius: 12, padding: '14px 16px',
              cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', gap: 12,
            } as React.CSSProperties}
              onMouseEnter={(e: any) => { e.currentTarget.style.background = af.lilac1; e.currentTarget.style.borderColor = af.primary; }}
              onMouseLeave={(e: any) => { e.currentTarget.style.background = af.page; e.currentTarget.style.borderColor = af.g300; }}>
              <span style={{ width: 36, height: 36, borderRadius: 9, background: '#fff', border: `1px solid ${af.g300}`, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <CIc n={s.ic} s={18} c={af.primary} />
              </span>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, color: af.ink, lineHeight: 1 }}>{s.v}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: af.ink, marginTop: 3 }}>{s.l}</div>
                <div style={{ fontSize: 11.5, color: af.g500 }}>{s.note}</div>
              </div>
            </button>
            {i < steps.length - 1 && <div className="af-arrow" style={{ display: 'grid', placeItems: 'center', flexShrink: 0 }}><CIc n="chevron-right" s={20} c={af.g300} /></div>}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

/* ---------------- SELECT ---------------- */
function AfSelect({ value, onChange, options, icon }: any) {
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' } as React.CSSProperties}>
      {icon && <span style={{ position: 'absolute', left: 12, pointerEvents: 'none', display: 'flex' } as React.CSSProperties}><CIc n={icon} s={15} c={af.g500} /></span>}
      <select value={value} onChange={(e: any) => onChange(e.target.value)} style={{
        appearance: 'none', WebkitAppearance: 'none', border: `1px solid ${af.g300}`, background: '#fff', borderRadius: 10,
        padding: icon ? '9px 32px 9px 34px' : '9px 32px 9px 13px', fontFamily: 'var(--font-body)', fontSize: 13.5, fontWeight: 600,
        color: af.ink, cursor: 'pointer', outline: 'none',
      } as React.CSSProperties}>
        {options.map((o: any) => <option key={o} value={o}>{o}</option>)}
      </select>
      <span style={{ position: 'absolute', right: 11, pointerEvents: 'none', display: 'flex' } as React.CSSProperties}><CIc n="chevron-down" s={15} c={af.g500} /></span>
    </div>
  );
}

/* ---------------- TABLE ---------------- */
function AfTable({ onSelect }: any) {
  const [q, setQ] = useStateAf('');
  const [fType, setFType] = useStateAf('Todos os tipos');
  const [fRegion, setFRegion] = useStateAf('Todas as regiões');
  const [fStatus, setFStatus] = useStateAf('Todos os status');

  const rows = AF_UNITS.filter(u =>
    (q === '' || (u.name + u.resp + u.region).toLowerCase().includes(q.toLowerCase())) &&
    (fType === 'Todos os tipos' || u.type === fType) &&
    (fRegion === 'Todas as regiões' || u.uf === fRegion) &&
    (fStatus === 'Todos os status' || u.status === fStatus)
  );

  const cols = ['Unidade', 'Tipo', 'Responsável', 'Região', 'Corretores', 'VGV (mês)', 'Score', 'Royalties', 'Status'];
  const numAlign: any = { 'Corretores': 1, 'VGV (mês)': 1, 'Score': 1, 'Royalties': 1 };

  return (
    <div style={{ ...afCard, padding: 22 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, gap: 12, flexWrap: 'wrap' } as React.CSSProperties}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: af.ink }}>Unidades da rede</div>
          <div style={{ fontSize: 13, color: af.g500, marginTop: 2 }}>{rows.length} de {AF_UNITS.length} unidades</div>
        </div>
      </div>

      {/* filters */}
      <div className="af-filters">
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: af.g100, borderRadius: 10, padding: '0 13px', height: 40, flex: 1, minWidth: 200 }}>
          <CIc n="search" s={17} c={af.g500} />
          <input value={q} onChange={(e: any) => setQ(e.target.value)} placeholder="Buscar unidade, responsável…" style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontFamily: 'var(--font-body)', fontSize: 13.5, color: af.ink }} />
        </div>
        <AfSelect icon="layers" value={fType} onChange={setFType} options={['Todos os tipos', 'Matriz', 'Franquia', 'Associado']} />
        <AfSelect icon="map-pin" value={fRegion} onChange={setFRegion} options={['Todas as regiões', 'SP', 'PE', 'PR']} />
        <AfSelect icon="activity" value={fStatus} onChange={setFStatus} options={['Todos os status', 'Ativa', 'Em implantação', 'Suspensa']} />
      </div>

      {/* desktop table */}
      <div className="af-table-wrap" style={{ overflowX: 'auto', marginTop: 18 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 860 } as React.CSSProperties}>
          <thead>
            <tr>
              {cols.map(h => (
                <th key={h} style={{ textAlign: numAlign[h] ? 'right' : 'left', fontSize: 11, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: af.g500, padding: '0 14px 12px', borderBottom: `1px solid ${af.g300}`, whiteSpace: 'nowrap' } as React.CSSProperties}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(u => {
              const isMatriz = u.type === 'Matriz';
              const [sFg, sBg] = STATUS_COLOR[u.status];
              return (
                <tr key={u.id} onClick={() => onSelect(u)} style={{ borderBottom: `1px solid ${af.g100}`, cursor: 'pointer', background: isMatriz ? af.lilac1 : '#fff' }}
                  onMouseEnter={(e: any) => e.currentTarget.style.background = af.lilac2}
                  onMouseLeave={(e: any) => e.currentTarget.style.background = isMatriz ? af.lilac1 : '#fff'}>
                  <td style={{ padding: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                      <span style={{ width: 36, height: 36, borderRadius: 9, background: isMatriz ? af.primary : af.lilac2, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                        <CIc n={u.icon} s={18} c={isMatriz ? '#fff' : af.primary} />
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: af.ink }}>{u.name}</span>
                        {isMatriz && <span style={{ fontSize: 10, fontWeight: 700, color: af.primary, background: af.white, border: `1px solid ${af.primary}`, borderRadius: 999, padding: '1px 7px' }}>CASA</span>}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px' }}><Badge text={u.type} fg={TYPE_COLOR[u.type]} bg={`${TYPE_COLOR[u.type]}1A`} /></td>
                  <td style={{ padding: '14px', fontSize: 13.5, color: af.g700, whiteSpace: 'nowrap' } as React.CSSProperties}>{u.resp}</td>
                  <td style={{ padding: '14px', fontSize: 13.5, color: af.g700, whiteSpace: 'nowrap' } as React.CSSProperties}>{u.region}</td>
                  <td style={{ padding: '14px', textAlign: 'right', fontSize: 14, fontWeight: 600, color: af.ink } as React.CSSProperties}>{u.cor}</td>
                  <td style={{ padding: '14px', textAlign: 'right', fontSize: 14, fontWeight: 600, color: af.ink, whiteSpace: 'nowrap' } as React.CSSProperties}>{u.vgv}</td>
                  <td style={{ padding: '14px', textAlign: 'right' } as React.CSSProperties}><span style={{ fontSize: 14, fontWeight: 700, color: u.score >= 700 ? af.success : af.warning }}>{u.score}</span></td>
                  <td style={{ padding: '14px', textAlign: 'right', fontSize: 13.5, fontWeight: 600, color: u.royalties === '—' ? af.g300 : af.ink, whiteSpace: 'nowrap' } as React.CSSProperties}>{u.royalties}</td>
                  <td style={{ padding: '14px' }}><Badge text={u.status} fg={sFg} bg={sBg} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* mobile cards */}
      <div className="af-table-cards" style={{ marginTop: 18, flexDirection: 'column', gap: 12 } as React.CSSProperties}>
        {rows.map(u => {
          const [sFg, sBg] = STATUS_COLOR[u.status];
          return (
            <button key={u.id} onClick={() => onSelect(u)} style={{ ...afCard, background: af.page, padding: 16, textAlign: 'left', cursor: 'pointer', fontFamily: 'var(--font-body)', width: '100%' } as React.CSSProperties}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 12 }}>
                <span style={{ width: 38, height: 38, borderRadius: 9, background: af.lilac2, display: 'grid', placeItems: 'center', flexShrink: 0 }}><CIc n={u.icon} s={18} c={af.primary} /></span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 600, color: af.ink }}>{u.name}</div>
                  <div style={{ fontSize: 12.5, color: af.g500 }}>{u.resp} · {u.region}</div>
                </div>
                <Badge text={u.status} fg={sFg} bg={sBg} />
              </div>
              <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' } as React.CSSProperties}>
                {[['Tipo', u.type], ['Corretores', u.cor], ['VGV', u.vgv], ['Score', u.score], ['Royalties', u.royalties]].map(([l, v]) => (
                  <div key={l}><div style={{ fontSize: 11, color: af.g500 }}>{l}</div><div style={{ fontSize: 13.5, fontWeight: 600, color: af.ink }}>{v}</div></div>
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
function Drawer({ open, onClose, children, width = 480 }: any) {
  return (
    <React.Fragment>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(28,26,34,.45)', zIndex: 80, opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none', transition: 'opacity .2s ease' } as React.CSSProperties} />
      <div className="af-drawer" style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width, maxWidth: '100vw', background: '#fff', zIndex: 81,
        boxShadow: 'var(--shadow-lg)', transform: open ? 'translateX(0)' : 'translateX(100%)', transition: 'transform .26s cubic-bezier(.2,.7,.3,1)',
        display: 'flex', flexDirection: 'column',
      } as React.CSSProperties}>
        {open && children}
      </div>
    </React.Fragment>
  );
}

const sectionLabel: any = { fontSize: 11.5, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: af.g500, margin: '0 0 12px' };
function Field({ l, v }: any) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, padding: '9px 0', borderBottom: `1px solid ${af.g100}` }}>
      <span style={{ fontSize: 13, color: af.g500, flexShrink: 0 }}>{l}</span>
      <span style={{ fontSize: 13.5, fontWeight: 600, color: af.ink, textAlign: 'right' } as React.CSSProperties}>{v}</span>
    </div>
  );
}

/* ---------------- DETAIL DRAWER ---------------- */
function AfDetail({ unit, onClose }: any) {
  if (!unit) return null;
  const [sFg, sBg] = STATUS_COLOR[unit.status];
  const fmax = Math.max(...unit.funnel.map((f: any) => f.v));
  return (
    <React.Fragment>
      {/* header */}
      <div style={{ padding: '20px 24px', borderBottom: `1px solid ${af.g300}` }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <span style={{ width: 46, height: 46, borderRadius: 11, background: unit.type === 'Matriz' ? af.primary : af.lilac2, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <CIc n={unit.icon} s={22} c={unit.type === 'Matriz' ? '#fff' : af.primary} />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 19, color: af.ink, lineHeight: 1.2 }}>{unit.name}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
              <Badge text={unit.type} fg={TYPE_COLOR[unit.type]} bg={`${TYPE_COLOR[unit.type]}1A`} />
              <Badge text={unit.status} fg={sFg} bg={sBg} />
              <span style={{ fontSize: 12.5, color: af.g500 }}>{unit.region}</span>
            </div>
          </div>
          <button onClick={onClose} style={{ width: 34, height: 34, border: `1px solid ${af.g300}`, background: '#fff', borderRadius: 9, display: 'grid', placeItems: 'center', cursor: 'pointer', flexShrink: 0 }}><CIc n="x" s={18} c={af.g700} /></button>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <button style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, border: 'none', background: af.primary, color: '#fff', borderRadius: 10, padding: '10px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13.5 }}><CIc n="pencil" s={16} c="#fff" /> Editar</button>
          <button style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, border: `1px solid ${af.g300}`, background: '#fff', color: af.error, borderRadius: 10, padding: '10px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13.5 }}><CIc n="pause" s={16} c={af.error} /> Suspender</button>
        </div>
      </div>

      {/* body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
        {/* performance */}
        <div style={{ marginBottom: 26 }}>
          <div style={sectionLabel}>Desempenho</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[['VGV', unit.vgv], ['VGL', unit.vgl], ['Score médio', unit.score], ['Corretores ativos', unit.cor]].map(([l, v]) => (
              <div key={l} style={{ background: af.page, borderRadius: 11, padding: '12px 14px' }}>
                <div style={{ fontSize: 12, color: af.g500 }}>{l}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 19, color: af.ink, marginTop: 2 }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 12, color: af.g500, marginBottom: 8 }}>Mini funil</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 } as React.CSSProperties}>
              {unit.funnel.map((f: any) => (
                <div key={f.l} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 64, fontSize: 12.5, color: af.g700, textAlign: 'right' } as React.CSSProperties}>{f.l}</span>
                  <div style={{ flex: 1, height: 22, background: af.g100, borderRadius: 6, overflow: 'hidden' }}>
                    <div style={{ width: `${Math.max(8, (f.v / fmax) * 100)}%`, height: '100%', background: af.primary, borderRadius: 6, display: 'flex', alignItems: 'center', paddingLeft: 8, color: '#fff', fontSize: 11.5, fontWeight: 700 }}>{f.v}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* dados */}
        <div style={{ marginBottom: 26 }}>
          <div style={sectionLabel}>Dados da unidade</div>
          <Field l="Responsável" v={unit.resp} />
          <Field l="Contato" v={unit.contact} />
          <Field l="CRECI" v={unit.creci} />
          <Field l="CNPJ" v={unit.cnpj} />
          <Field l="Território" v={unit.territory} />
          <Field l="Marca" v={unit.brand} />
          <Field l="Plano" v={unit.plan} />
          <Field l="Contrato" v={unit.contract} />
          <Field l="Royalties" v={unit.royaltyPct} />
        </div>

        {/* financeiro */}
        <div style={{ marginBottom: 26 }}>
          <div style={sectionLabel}>Financeiro · royalties</div>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1, background: af.warnBg, borderRadius: 11, padding: '12px 14px' }}>
              <div style={{ fontSize: 12, color: af.g700 }}>Devido (mês)</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 19, color: af.warning, marginTop: 2 }}>{unit.royDue}</div>
            </div>
            <div style={{ flex: 1, background: af.successBg, borderRadius: 11, padding: '12px 14px' }}>
              <div style={{ fontSize: 12, color: af.g700 }}>Pago</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 19, color: af.success, marginTop: 2 }}>{unit.royPaid}</div>
            </div>
          </div>
        </div>

        {/* corretores */}
        <div style={{ marginBottom: 26 }}>
          <div style={sectionLabel}>Corretores da unidade</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 } as React.CSSProperties}>
            {unit.team.map((t: any) => (
              <div key={t.n} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '8px 0', borderBottom: `1px solid ${af.g100}` }}>
                <span style={{ width: 32, height: 32, borderRadius: '50%', background: af.lilac2, color: af.primary, fontSize: 12, fontWeight: 700, display: 'grid', placeItems: 'center', flexShrink: 0 }}>{t.n.split(' ').map((p: any) => p[0]).slice(0, 2).join('')}</span>
                <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600, color: af.ink }}>{t.n}</span>
                <span style={{ fontSize: 13, color: af.g500 }}>score <strong style={{ color: af.ink }}>{t.s}</strong></span>
                <span style={{ fontSize: 11.5, fontWeight: 600, color: t.st === 'Ativo' ? af.success : af.warning }}>{t.st}</span>
              </div>
            ))}
          </div>
        </div>

        {/* admin */}
        <div>
          <div style={sectionLabel}>Admin da unidade</div>
          <div style={{ background: af.lilac1, border: `1px solid ${af.lilac2}`, borderRadius: 12, padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ width: 40, height: 40, borderRadius: '50%', background: `linear-gradient(135deg, ${af.light}, ${af.deep})`, color: '#fff', fontWeight: 700, fontFamily: 'var(--font-display)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>{unit.admin.n.split(' ').map((p: any) => p[0]).slice(0, 2).join('')}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: af.ink }}>{unit.admin.n}</div>
                <div style={{ fontSize: 12.5, color: af.g500 }}>{unit.admin.mail}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, margintop: 10, marginTop: 12, fontSize: 12.5, color: af.g700 } as React.CSSProperties}>
              <CIc n="eye" s={15} c={af.primary} /> Enxerga apenas esta unidade
            </div>
            <button style={{ width: '100%', marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, border: `1px solid ${af.primary}`, background: '#fff', color: af.primary, borderRadius: 10, padding: '9px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13.5 }}><CIc n="key-round" s={16} c={af.primary} /> Gerenciar acesso</button>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}

/* ---------------- NEW UNIT DRAWER ---------------- */
function FormRow({ label, children }: any) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: af.g700, marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}
const inputStyle: any = { width: '100%', border: `1px solid ${af.g300}`, borderRadius: 10, padding: '10px 13px', fontFamily: 'var(--font-body)', fontSize: 14, color: af.ink, outline: 'none', background: '#fff' };

function AfNew({ onClose }: any) {
  const [type, setType] = useStateAf('Franquia');
  return (
    <React.Fragment>
      <div style={{ padding: '20px 24px', borderBottom: `1px solid ${af.g300}`, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 19, color: af.ink }}>Nova unidade</div>
          <div style={{ fontSize: 13, color: af.g500, marginTop: 2 }}>Cadastrar franquia ou associado na rede</div>
        </div>
        <button onClick={onClose} style={{ width: 34, height: 34, border: `1px solid ${af.g300}`, background: '#fff', borderRadius: 9, display: 'grid', placeItems: 'center', cursor: 'pointer', flexShrink: 0 }}><CIc n="x" s={18} c={af.g700} /></button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
        <div style={sectionLabel}>Tipo de unidade</div>
        <div style={{ display: 'flex', gap: 10, marginBottom: 22 }}>
          {['Associado', 'Franquia'].map(t => (
            <button key={t} onClick={() => setType(t)} style={{
              flex: 1, border: `1.5px solid ${type === t ? af.primary : af.g300}`, background: type === t ? af.lilac1 : '#fff',
              borderRadius: 12, padding: '14px', cursor: 'pointer', fontFamily: 'var(--font-body)', textAlign: 'left',
            } as React.CSSProperties}>
              <CIc n={t === 'Franquia' ? 'store' : 'handshake'} s={20} c={type === t ? af.primary : af.g500} />
              <div style={{ fontSize: 14.5, fontWeight: 700, color: type === t ? af.primary : af.ink, marginTop: 8 }}>{t}</div>
              <div style={{ fontSize: 12, color: af.g500, marginTop: 2 }}>{t === 'Franquia' ? 'Marca própria, royalties' : 'Adesão, sem exclusividade'}</div>
            </button>
          ))}
        </div>

        <div style={sectionLabel}>Identificação</div>
        <FormRow label="Nome da unidade"><input style={inputStyle} placeholder="Ex.: Franquia Salvador" /></FormRow>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <FormRow label="CRECI"><input style={inputStyle} placeholder="CRECI-XX 0000-J" /></FormRow>
          <FormRow label="CNPJ"><input style={inputStyle} placeholder="00.000.000/0001-00" /></FormRow>
        </div>
        <FormRow label="Região / território"><input style={inputStyle} placeholder="Ex.: Salvador e RM · BA" /></FormRow>

        <div style={{ ...sectionLabel, marginTop: 10 }}>Responsável</div>
        <FormRow label="Nome do responsável"><input style={inputStyle} placeholder="Nome completo" /></FormRow>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <FormRow label="E-mail"><input style={inputStyle} placeholder={emailDemo('unidade')} /></FormRow>
          <FormRow label="Telefone"><input style={inputStyle} placeholder="(00) 00000-0000" /></FormRow>
        </div>

        <div style={{ ...sectionLabel, marginTop: 10 }}>Marca & plano</div>
        <FormRow label="Marca (white-label)"><input style={inputStyle} placeholder={`Ex.: ${demo.nomeCurto} Salvador`} /></FormRow>
        <FormRow label="Plano">
          <div style={{ position: 'relative' } as React.CSSProperties}>
            <select style={{ ...inputStyle, appearance: 'none', WebkitAppearance: 'none', cursor: 'pointer' } as React.CSSProperties}>
              <option>Franquia</option><option>Franquia Premium</option><option>Associado</option>
            </select>
            <span style={{ position: 'absolute', right: 12, top: 12, pointerEvents: 'none', display: 'flex' } as React.CSSProperties}><CIc n="chevron-down" s={16} c={af.g500} /></span>
          </div>
        </FormRow>

        <div style={{ ...sectionLabel, marginTop: 10 }}>Contrato</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <FormRow label="Royalties (%)"><input style={inputStyle} placeholder="5" /></FormRow>
          <FormRow label="Vigência"><input style={inputStyle} placeholder="60 meses" /></FormRow>
        </div>

        <div style={{ ...sectionLabel, marginTop: 10 }}>Admin da unidade</div>
        <FormRow label="Quem vai gerir a unidade"><input style={inputStyle} placeholder="E-mail do admin" /></FormRow>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12.5, color: af.g500, marginTop: -6 }}>
          <CIc n="info" s={14} c={af.g500} /> O admin enxergará apenas os dados desta unidade.
        </div>
      </div>
      <div style={{ padding: '16px 24px', borderTop: `1px solid ${af.g300}`, display: 'flex', gap: 10 }}>
        <button onClick={onClose} style={{ flex: 1, border: `1px solid ${af.g300}`, background: '#fff', color: af.g700, borderRadius: 10, padding: '11px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14 }}>Cancelar</button>
        <button onClick={onClose} style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, border: 'none', background: af.primary, color: '#fff', borderRadius: 10, padding: '11px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 14, boxShadow: 'var(--shadow-purple)' }}><CIc n="check" s={17} c="#fff" /> Criar unidade</button>
      </div>
    </React.Fragment>
  );
}

/* ---------------- PAGE ---------------- */
export default function AssociadosPage() {
  const [selected, setSelected] = useStateAf<any>(null);
  const [showNew, setShowNew] = useStateAf(false);
  return (
    <CeoChrome>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 } as React.CSSProperties}>
      {/* header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap' } as React.CSSProperties}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 30, letterSpacing: '-0.02em', margin: 0, color: af.ink }}>Associados &amp; Franquias</h1>
          <div style={{ fontSize: 13.5, color: af.g500, marginTop: 4 }}>As unidades da {demo.nome}</div>
        </div>
        <button onClick={() => setShowNew(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, border: 'none', background: af.primary, color: '#fff', borderRadius: 10, padding: '11px 18px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 14, boxShadow: 'var(--shadow-purple)' }}>
          <CIc n="plus" s={18} c="#fff" /> Nova unidade
        </button>
      </div>

      <AfSummary />
      <AfOnboarding />
      <AfTable onSelect={setSelected} />

      <Drawer open={!!selected} onClose={() => setSelected(null)}><AfDetail unit={selected} onClose={() => setSelected(null)} /></Drawer>
      <Drawer open={showNew} onClose={() => setShowNew(false)} width={520}><AfNew onClose={() => setShowNew(false)} /></Drawer>
    </div>
    </CeoChrome>
  );
}
