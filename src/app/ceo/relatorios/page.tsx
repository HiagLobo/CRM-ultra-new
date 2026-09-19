"use client";
import * as React from "react";
import CeoChrome, { ceoPalette, CIc, ceoPersona } from "@/components/ceo/CeoChrome";
const { useState, useEffect, useRef, useMemo, useCallback } = React;
const { useState: useStateRe } = React;

const re: any = {
  ...ceoPalette,
  info: '#3E82E0', infoBg: '#E5EEFB',
  successBg: '#E6F4EC', warnBg: '#FBF1DC', errBg: '#FAE5E5',
  p3: '#818CF8',
};
const reCard = { background: '#fff', border: `1px solid ${re.g300}`, borderRadius: 16 };
const reSecLabel = { fontSize: 11.5, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: re.g500, margin: '0 0 12px' } as React.CSSProperties;

function ReBadge({ text, fg, bg }: any) {
  return <span style={{ fontSize: 11.5, fontWeight: 700, color: fg, background: bg, borderRadius: 999, padding: '3px 9px', whiteSpace: 'nowrap' }}>{text}</span>;
}
function ReHead({ title, sub, right }: any) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
      <div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: re.ink }}>{title}</div>
        {sub && <div style={{ fontSize: 13, color: re.g500, marginTop: 2 }}>{sub}</div>}
      </div>
      {right}
    </div>
  );
}
const FMT_TONE: any = { PDF: [re.error, re.errBg], Excel: [re.success, re.successBg], CSV: [re.info, re.infoBg] };
const FREQ_TONE: any = { Diário: [re.info, re.infoBg], Semanal: [re.p3, '#E0E7FF'], Mensal: [re.primary, re.lilac2] };

/* ---------------- CATALOG DATA ---------------- */
const CATALOG: any[] = [
  { group: 'Financeiro', items: [
    { n: 'Financeiro consolidado', fmt: 'Excel' }, { n: 'Receita recorrente (MRR/ARR)', fmt: 'PDF' }, { n: 'Locação & Garantia (carteira + risco)', fmt: 'Excel' }, { n: 'Comissões pagas', fmt: 'Excel' },
  ] },
  { group: 'Rede', items: [
    { n: 'Desempenho da rede', fmt: 'PDF' }, { n: 'Ranking de unidades', fmt: 'PDF' }, { n: 'Crescimento da rede', fmt: 'Excel' },
  ] },
  { group: 'Crescimento', items: [
    { n: 'Funil de leads & conversão', fmt: 'PDF', preview: true }, { n: 'ROI por canal', fmt: 'Excel' }, { n: 'Captação & oferta×demanda', fmt: 'PDF' }, { n: 'Parcerias', fmt: 'PDF' },
  ] },
  { group: 'Score', items: [
    { n: 'Ranking de corretores', fmt: 'PDF' }, { n: 'Distribuição do Score', fmt: 'PDF' },
  ] },
  { group: 'Conformidade', items: [
    { n: 'Relatório LGPD', fmt: 'PDF' }, { n: 'Auditoria (AuditLog)', fmt: 'PDF' }, { n: 'Contratos a vencer', fmt: 'Excel' },
  ] },
];
const GROUP_IC: any = { Financeiro: 'wallet', Rede: 'network', Crescimento: 'trending-up', Score: 'gauge', Conformidade: 'shield-check' };

/* ---------------- TOP: FILTERS + SUMMARY ---------------- */
function ReTop() {
  const [period, setPeriod] = useStateRe('Junho 2026');
  const [scope, setScope] = useStateRe('Rede inteira');
  const stats = [
    { l: 'Relatórios disponíveis', v: '16', ic: 'files' },
    { l: 'Agendamentos ativos', v: '4', ic: 'calendar-clock' },
    { l: 'Gerados no mês', v: '38', ic: 'file-check' },
    { l: 'Próxima entrega', v: '1º jul', sub: 'Executivo', ic: 'send' },
  ];
  return (
    <div className="re-top">
      <div style={{ ...reCard, padding: 18, display: 'flex', flexDirection: 'column', gap: 12, justifyContent: 'center' }}>
        <div style={reSecLabel}>Filtros universais</div>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <span style={{ position: 'absolute', left: 12, display: 'flex' }}><CIc n="calendar" s={15} c={re.g500} /></span>
          <select value={period} onChange={(e: any) => setPeriod(e.target.value)} style={{ width: '100%', appearance: 'none', WebkitAppearance: 'none', border: `1px solid ${re.g300}`, background: '#fff', borderRadius: 10, padding: '10px 32px 10px 34px', fontFamily: 'var(--font-body)', fontSize: 13.5, fontWeight: 600, color: re.ink, cursor: 'pointer', outline: 'none' } as React.CSSProperties}>
            {['Junho 2026', '2º trimestre 2026', 'Ano 2026', 'Maio 2026'].map(o => <option key={o}>{o}</option>)}
          </select>
          <span style={{ position: 'absolute', right: 11, display: 'flex' }}><CIc n="chevron-down" s={15} c={re.g500} /></span>
        </div>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <span style={{ position: 'absolute', left: 12, display: 'flex' }}><CIc n="git-branch" s={15} c={re.g500} /></span>
          <select value={scope} onChange={(e: any) => setScope(e.target.value)} style={{ width: '100%', appearance: 'none', WebkitAppearance: 'none', border: `1px solid ${re.g300}`, background: '#fff', borderRadius: 10, padding: '10px 32px 10px 34px', fontFamily: 'var(--font-body)', fontSize: 13.5, fontWeight: 600, color: re.ink, cursor: 'pointer', outline: 'none' } as React.CSSProperties}>
            {['Rede inteira', 'Matriz', 'Franquia Recife', 'Região Nordeste'].map(o => <option key={o}>{o}</option>)}
          </select>
          <span style={{ position: 'absolute', right: 11, display: 'flex' }}><CIc n="chevron-down" s={15} c={re.g500} /></span>
        </div>
      </div>
      <div className="re-stats">
        {stats.map(s => (
          <div key={s.l} style={{ ...reCard, padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ width: 36, height: 36, borderRadius: 10, background: re.lilac2, display: 'grid', placeItems: 'center', flexShrink: 0 }}><CIc n={s.ic} s={17} c={re.primary} /></span>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, color: re.ink, lineHeight: 1.1 }}>{s.v}{s.sub && <span style={{ fontSize: 11.5, fontWeight: 600, color: re.g500 }}> · {s.sub}</span>}</div>
              <div style={{ fontSize: 12, color: re.g500, lineHeight: 1.3 }}>{s.l}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- EXECUTIVE REPORT ---------------- */
function ReExecutive() {
  const kpis = [
    { area: 'Financeiro', ic: 'wallet', main: 'R$ 1,24 mi', sub: 'receita · margem diversificada' },
    { area: 'Receita recorrente', ic: 'repeat', main: 'R$ 114 mil', sub: 'MRR · ARR R$ 1,4 mi' },
    { area: 'Locação & Garantia', ic: 'key-round', main: 'R$ 2,10 mi/mês', sub: 'carteira · inadimpl. 3,2%' },
    { area: 'Rede', ic: 'network', main: '86 unidades', sub: '40 corretores indep.' },
    { area: 'Leads & conversão', ic: 'inbox', main: '1.480', sub: 'conv. 6,2% · CPL R$ 35' },
    { area: 'Captação', ic: 'radar', main: '95 imóveis', sub: 'gaps: Boa Viagem, Casa Forte' },
    { area: 'Parcerias', ic: 'handshake', main: '24 fechadas', sub: 'R$ 870 mil em comissão' },
    { area: 'Score', ic: 'gauge', main: '642', sub: 'médio · 18 Elite' },
    { area: 'Conformidade', ic: 'shield-check', main: '0 incidentes', sub: '9 LGPD · AuditLog íntegro' },
  ];
  return (
    <div style={{ ...reCard, padding: 0, overflow: 'hidden' }}>
      {/* cover header */}
      <div style={{ background: `linear-gradient(135deg, ${re.primary}, ${re.deep})`, padding: '22px 24px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <span style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(255,255,255,.16)', display: 'grid', placeItems: 'center', flexShrink: 0 }}><CIc n="file-text" s={24} c="#fff" /></span>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: '#fff' }}>Relatório Executivo</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,.8)' }}>O one-pager do board · Rede inteira · junho de 2026</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: 7, border: 'none', background: '#fff', color: re.primary, borderRadius: 10, padding: '10px 16px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 13.5 }}><CIc n="file-down" s={16} c={re.primary} /> Gerar PDF</button>
          <button style={{ display: 'flex', alignItems: 'center', gap: 7, border: '1px solid rgba(255,255,255,.4)', background: 'transparent', color: '#fff', borderRadius: 10, padding: '10px 16px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13.5 }}><CIc n="calendar-clock" s={16} c="#fff" /> Agendar mensal</button>
        </div>
      </div>
      {/* KPI grid */}
      <div style={{ padding: 22 }}>
        <div style={{ fontSize: 12, color: re.g500, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 7 }}><CIc n="eye" s={14} c={re.g500} /> Prévia · mesmos números das telas, fechados no período</div>
        <div className="re-exec-grid">
          {kpis.map(k => (
            <div key={k.area} style={{ background: re.page, border: `1px solid ${re.g300}`, borderRadius: 12, padding: '14px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <CIc n={k.ic} s={15} c={re.primary} /><span style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '.02em', textTransform: 'uppercase', color: re.g500 }}>{k.area}</span>
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 19, color: re.ink, lineHeight: 1.1 }}>{k.main}</div>
              <div style={{ fontSize: 12, color: re.g500, marginTop: 3 }}>{k.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------- CATALOG ---------------- */
function ReCatalog({ onSelect }: any) {
  return (
    <div style={{ ...reCard, padding: 22 }}>
      <ReHead title="Catálogo de relatórios" sub="16 relatórios prontos · gere ou agende" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
        {CATALOG.map(g => (
          <div key={g.group}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <CIc n={GROUP_IC[g.group]} s={15} c={re.primary} />
              <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: re.g500 }}>{g.group}</span>
              <span style={{ flex: 1, height: 1, background: re.g100 }} />
            </div>
            <div className="re-cat-grid">
              {g.items.map((it: any) => {
                const [fFg, fBg] = FMT_TONE[it.fmt];
                return (
                  <div key={it.n} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: re.page, border: `1px solid ${re.g300}`, borderRadius: 11 }}>
                    <span style={{ width: 34, height: 34, borderRadius: 9, background: '#fff', border: `1px solid ${re.g300}`, display: 'grid', placeItems: 'center', flexShrink: 0 }}><CIc n="file-text" s={16} c={re.primary} /></span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 600, color: re.ink, lineHeight: 1.3 }}>{it.n}</div>
                      <ReBadge text={it.fmt} fg={fFg} bg={fBg} />
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => onSelect({ ...it, group: g.group })} style={{ display: 'flex', alignItems: 'center', gap: 5, border: 'none', background: re.primary, color: '#fff', borderRadius: 9, padding: '7px 12px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 12.5 }}><CIc n="download" s={14} c="#fff" /> Gerar</button>
                      <button onClick={() => onSelect({ ...it, group: g.group })} title="Agendar" style={{ width: 32, height: 32, border: `1px solid ${re.g300}`, background: '#fff', borderRadius: 9, display: 'grid', placeItems: 'center', cursor: 'pointer', flexShrink: 0 }}><CIc n="calendar-clock" s={15} c={re.g700} /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- SCHEDULED ---------------- */
function ReScheduled() {
  const rows = [
    { n: 'Relatório Executivo', freq: 'Mensal', dest: 'CEO + sócios', fmt: 'PDF', next: '1º jul', active: true },
    { n: 'Financeiro consolidado', freq: 'Mensal', dest: 'CEO + Financeiro', fmt: 'Excel', next: '1º jul', active: true },
    { n: 'Funil de leads', freq: 'Semanal', dest: 'Gestor de Rede', fmt: 'PDF', next: 'segunda', active: true },
    { n: 'Relatório LGPD', freq: 'Mensal', dest: 'DPO', fmt: 'PDF', next: '1º jul', active: true },
  ];
  return (
    <div style={{ ...reCard, padding: 22 }}>
      <ReHead title="Agendados" sub="Relatórios recorrentes por e-mail" right={<button style={{ display: 'flex', alignItems: 'center', gap: 7, border: 'none', background: re.primary, color: '#fff', borderRadius: 10, padding: '9px 15px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 13 }}><CIc n="plus" s={15} c="#fff" /> Novo agendamento</button>} />
      <div className="re-sched-wrap" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 680 }}>
          <thead><tr>
            {['Relatório', 'Frequência', 'Destinatários', 'Formato', 'Próximo envio', 'Status'].map(h => <th key={h} style={{ textAlign: 'left', fontSize: 11, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: re.g500, padding: '0 12px 12px', borderBottom: `1px solid ${re.g300}`, whiteSpace: 'nowrap' } as React.CSSProperties}>{h}</th>)}
          </tr></thead>
          <tbody>
            {rows.map(r => {
              const [fFg, fBg] = FMT_TONE[r.fmt];
              const [qFg, qBg] = FREQ_TONE[r.freq];
              return (
                <tr key={r.n} style={{ borderBottom: `1px solid ${re.g100}` }}>
                  <td style={{ padding: '12px', fontSize: 13.5, fontWeight: 600, color: re.ink, whiteSpace: 'nowrap' }}>{r.n}</td>
                  <td style={{ padding: '12px' }}><ReBadge text={r.freq} fg={qFg} bg={qBg} /></td>
                  <td style={{ padding: '12px', fontSize: 13, color: re.g700, whiteSpace: 'nowrap' }}>{r.dest}</td>
                  <td style={{ padding: '12px' }}><ReBadge text={r.fmt} fg={fFg} bg={fBg} /></td>
                  <td style={{ padding: '12px', fontSize: 13, color: re.g700, whiteSpace: 'nowrap' }}>{r.next}</td>
                  <td style={{ padding: '12px' }}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 600, color: re.success }}><span style={{ width: 7, height: 7, borderRadius: '50%', background: re.success }} /> Ativo</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------------- HISTORY ---------------- */
function ReHistory() {
  const rows = [
    { n: 'Relatório Executivo', per: 'Maio/2026', by: `${ceoPersona.nome} (CEO)`, d: '01/06', fmt: 'PDF' },
    { n: 'Comissões pagas', per: 'Maio/2026', by: 'Patrícia Souza (Financeiro)', d: '02/06', fmt: 'Excel' },
    { n: 'Ranking de corretores', per: 'Maio/2026', by: 'Rafael Lima', d: '03/06', fmt: 'PDF' },
    { n: 'Relatório LGPD', per: 'Maio/2026', by: 'André Costa (DPO)', d: '01/06', fmt: 'PDF' },
  ];
  return (
    <div style={{ ...reCard, padding: 22 }}>
      <ReHead title="Histórico de gerados" sub="Baixe novamente quando precisar" />
      <div className="re-hist-wrap" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 680 }}>
          <thead><tr>
            {['Relatório', 'Período', 'Gerado por', 'Data', 'Formato', ''].map((h, i) => <th key={i} style={{ textAlign: 'left', fontSize: 11, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: re.g500, padding: '0 12px 12px', borderBottom: `1px solid ${re.g300}`, whiteSpace: 'nowrap' } as React.CSSProperties}>{h}</th>)}
          </tr></thead>
          <tbody>
            {rows.map((r, i) => {
              const [fFg, fBg] = FMT_TONE[r.fmt];
              return (
                <tr key={i} style={{ borderBottom: `1px solid ${re.g100}` }}>
                  <td style={{ padding: '12px', fontSize: 13.5, fontWeight: 600, color: re.ink, whiteSpace: 'nowrap' }}>{r.n}</td>
                  <td style={{ padding: '12px', fontSize: 13, color: re.g700, whiteSpace: 'nowrap' }}>{r.per}</td>
                  <td style={{ padding: '12px', fontSize: 13, color: re.g700, whiteSpace: 'nowrap' }}>{r.by}</td>
                  <td style={{ padding: '12px', fontSize: 13, color: re.g500, whiteSpace: 'nowrap' }}>{r.d}</td>
                  <td style={{ padding: '12px' }}><ReBadge text={r.fmt} fg={fFg} bg={fBg} /></td>
                  <td style={{ padding: '12px', textAlign: 'right' } as React.CSSProperties}><button title="Baixar" style={{ width: 32, height: 32, border: `1px solid ${re.g300}`, background: '#fff', borderRadius: 9, display: 'grid', placeItems: 'center', cursor: 'pointer' }}><CIc n="download" s={15} c={re.primary} /></button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------------- DRAWER ---------------- */
function ReDrawer({ open, onClose, children, width = 500 }: any) {
  return (
    <React.Fragment>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(28,26,34,.45)', zIndex: 80, opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none', transition: 'opacity .2s ease' }} />
      <div className="re-drawer" style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width, maxWidth: '100vw', background: '#fff', zIndex: 81, boxShadow: 'var(--shadow-lg)', transform: open ? 'translateX(0)' : 'translateX(100%)', transition: 'transform .26s cubic-bezier(.2,.7,.3,1)', display: 'flex', flexDirection: 'column' }}>
        {open && children}
      </div>
    </React.Fragment>
  );
}

/* ---------------- CONFIGURE/GENERATE ---------------- */
function ReConfigure({ report, onClose }: any) {
  if (!report) return null;
  const [fmt, setFmt] = useStateRe('PDF');
  const funnel = [{ l: 'Novo', v: 1480 }, { l: 'Atendimento', v: 1190 }, { l: 'Qualificado', v: 540 }, { l: 'Fechado', v: 92 }];
  const fmax = 1480;
  return (
    <React.Fragment>
      <div style={{ padding: '20px 24px', borderBottom: `1px solid ${re.g300}` }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <span style={{ width: 46, height: 46, borderRadius: 11, background: re.lilac2, display: 'grid', placeItems: 'center', flexShrink: 0 }}><CIc n="file-text" s={22} c={re.primary} /></span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: re.ink, lineHeight: 1.2 }}>{report.n}</div>
            <div style={{ fontSize: 12.5, color: re.g500, marginTop: 4 }}>Grupo: {report.group}</div>
          </div>
          <button onClick={onClose} style={{ width: 34, height: 34, border: `1px solid ${re.g300}`, background: '#fff', borderRadius: 9, display: 'grid', placeItems: 'center', cursor: 'pointer', flexShrink: 0 }}><CIc n="x" s={18} c={re.g700} /></button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
        <div style={{ marginBottom: 22 }}>
          <div style={reSecLabel}>Parâmetros</div>
          {[['Período', 'Junho 2026'], ['Escopo', 'Rede inteira']].map(([l, v]) => (
            <div key={l} style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: re.g700, marginBottom: 6 }}>{l}</label>
              <div style={{ position: 'relative' }}>
                <select style={{ width: '100%', appearance: 'none', WebkitAppearance: 'none', border: `1px solid ${re.g300}`, background: '#fff', borderRadius: 10, padding: '10px 32px 10px 13px', fontFamily: 'var(--font-body)', fontSize: 14, color: re.ink, cursor: 'pointer', outline: 'none' } as React.CSSProperties}><option>{v}</option></select>
                <span style={{ position: 'absolute', right: 12, top: 12, display: 'flex' }}><CIc n="chevron-down" s={15} c={re.g500} /></span>
              </div>
            </div>
          ))}
          <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: re.g700, marginBottom: 6 }}>Formato</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {['PDF', 'Excel', 'CSV'].map(f => (
              <button key={f} onClick={() => setFmt(f)} style={{ flex: 1, border: `1.5px solid ${fmt === f ? re.primary : re.g300}`, background: fmt === f ? re.lilac1 : '#fff', borderRadius: 10, padding: '9px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 13, color: fmt === f ? re.primary : re.g700 }}>{f}</button>
            ))}
          </div>
        </div>

        <div>
          <div style={reSecLabel}>Prévia do conteúdo</div>
          <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
            {[['Leads', '1.480'], ['Conversão', '6,2%'], ['CPL', 'R$ 35']].map(([l, v]) => (
              <div key={l} style={{ flex: 1, background: re.page, borderRadius: 11, padding: '12px 14px' }}>
                <div style={{ fontSize: 11.5, color: re.g500 }}>{l}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, color: re.ink, marginTop: 2 }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ background: re.page, borderRadius: 11, padding: 16 }}>
            <div style={{ fontSize: 12, color: re.g500, marginBottom: 10 }}>Funil de leads</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {funnel.map(f => (
                <div key={f.l} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 90, fontSize: 12.5, color: re.g700, textAlign: 'right', flexShrink: 0 } as React.CSSProperties}>{f.l}</span>
                  <div style={{ flex: 1, height: 20, background: re.g100, borderRadius: 6, overflow: 'hidden' }}><div style={{ width: `${Math.max(8, (f.v / fmax) * 100)}%`, height: '100%', background: re.primary, borderRadius: 6, display: 'flex', alignItems: 'center', paddingLeft: 8, color: '#fff', fontSize: 11, fontWeight: 700 }}>{f.v.toLocaleString('pt-BR')}</div></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '14px 24px', borderTop: `1px solid ${re.g300}`, display: 'flex', gap: 10 }}>
        <button onClick={onClose} style={{ flex: 1.4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, border: 'none', background: re.primary, color: '#fff', borderRadius: 10, padding: '11px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 13.5, boxShadow: 'var(--shadow-purple)' }}><CIc n="download" s={16} c="#fff" /> Gerar {fmt}</button>
        <button style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, border: `1px solid ${re.g300}`, background: '#fff', color: re.g700, borderRadius: 10, padding: '11px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13.5 }}><CIc n="calendar-clock" s={16} c={re.g700} /> Agendar</button>
      </div>
    </React.Fragment>
  );
}

/* ---------------- PAGE ---------------- */
export default function RelatoriosPage() {
  const [selected, setSelected] = useStateRe(null);
  return (
    <CeoChrome>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 30, letterSpacing: '-0.02em', margin: 0, color: re.ink }}>Relatórios</h1>
        <div style={{ fontSize: 13.5, color: re.g500, marginTop: 4 }}>A fábrica de documentos da rede: o período fechado, gerado e agendado</div>
      </div>

      <ReTop />
      <ReExecutive />
      <ReCatalog onSelect={setSelected} />
      <ReScheduled />
      <ReHistory />

      <ReDrawer open={!!selected} onClose={() => setSelected(null)}>
        <ReConfigure report={selected} onClose={() => setSelected(null)} />
      </ReDrawer>
    </div>
    </CeoChrome>
  );
}
