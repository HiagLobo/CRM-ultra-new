"use client";
import * as React from "react";
import CeoChrome, { ceoPalette, CIc, ceoPersona } from "@/components/ceo/CeoChrome";
import { demo } from "@/config/demo";
const { useState, useEffect, useRef, useMemo, useCallback } = React;

const { useState: useStateAd } = React;

const ad: any = {
  ...ceoPalette,
  info: '#3E82E0', infoBg: '#E5EEFB',
  successBg: '#E6F4EC', warnBg: '#FBF1DC', errBg: '#FAE5E5',
  p3: '#818CF8',
};
const adCard = { background: '#fff', border: `1px solid ${ad.g300}`, borderRadius: 16 };
const adSecLabel = { fontSize: 11.5, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: ad.g500, margin: '0 0 12px' } as React.CSSProperties;

function AdBadge({ text, fg, bg }: any) {
  return <span style={{ fontSize: 12, fontWeight: 700, color: fg, background: bg, borderRadius: 999, padding: '3px 10px', whiteSpace: 'nowrap' } as React.CSSProperties}>{text}</span>;
}
function AdHead({ title, sub, right }: any) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 16, flexWrap: 'wrap' } as React.CSSProperties}>
      <div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: ad.ink }}>{title}</div>
        {sub && <div style={{ fontSize: 13, color: ad.g500, marginTop: 2 }}>{sub}</div>}
      </div>
      {right}
    </div>
  );
}

const SCOPE_TONE: any = { 'Rede': [ad.primary, ad.lilac2], 'Unidade': [ad.info, ad.infoBg], 'Próprio': [ad.g700, ad.g100] };
const AD_STATUS: any = { 'Ativo': [ad.success, ad.successBg], 'Suspenso': [ad.error, ad.errBg], 'Convite pendente': [ad.warning, ad.warnBg] };

/* ---------------- DATA ---------------- */
const USERS: any[] = [
  { id: 'u1', name: ceoPersona.nome, role: 'CEO', scope: 'Rede', unit: '—', f2a: 'Ativo', last: 'agora', status: 'Ativo' },
  { id: 'u2', name: 'Rafael Lima', role: 'Gestor de Rede', scope: 'Rede', unit: '—', f2a: 'Ativo', last: '2h', status: 'Ativo' },
  { id: 'u3', name: 'Patrícia Souza', role: 'Financeiro', scope: 'Rede', unit: '—', f2a: 'Ativo', last: '1 dia', status: 'Ativo' },
  { id: 'u4', name: 'André Costa', role: 'Jurídico/DPO', scope: 'Rede', unit: '—', f2a: 'Ativo', last: '3h', status: 'Ativo' },
  {
    id: 'u5', name: 'Marina Reis', role: 'Marketing', scope: 'Rede', unit: '—', f2a: 'Pendente', last: '5h', status: 'Ativo',
    perms: [['Materiais & Marca', 'Editar'], ['Leads (origens)', 'Ver'], ['Captação', '—'], ['Financeiro', '—'], ['Score', 'Ver'], ['Acessos', '—'], ['Jurídico', '—']],
    sessions: 2, devices: 'Chrome · macOS · Recife',
    hist: [{ t: 'hoje 09:12', d: 'Login — falha no 2FA', warn: true }, { t: 'ontem 14:00', d: 'Editou banner de campanha' }, { t: '12/05', d: `Acesso criado por ${ceoPersona.nome} (CEO)` }],
  },
  { id: 'u6', name: 'Júlia Mendes', role: 'Curadoria', scope: 'Rede', unit: '—', f2a: 'Ativo', last: '1 dia', status: 'Ativo' },
  { id: 'u7', name: 'Pedro Alves', role: 'Franqueado', scope: 'Unidade', unit: `${demo.nomeCurto} Caruaru`, f2a: 'Ativo', last: '1 dia', status: 'Ativo' },
  { id: 'u8', name: 'Lucas Ferreira', role: 'Corretor', scope: 'Próprio', unit: `${demo.nomeCurto} Boa Viagem`, f2a: 'Ativo', last: '30 min', status: 'Ativo' },
  { id: 'u9', name: 'joao.silva@…', role: 'Franqueado', scope: 'Unidade', unit: `${demo.nomeCurto} Recife Centro`, f2a: '—', last: '—', status: 'Convite pendente' },
  { id: 'u10', name: 'Caio (parceiro de TI)', role: 'Desenvolvedor (TI)', scope: 'Rede', unit: '—', f2a: 'Ativo', last: '1h', status: 'Ativo' },
];

const AREAS = ['Visão geral', 'Rede', 'Operação', 'Financeiro', 'Cobranças', 'Crédito', 'Suporte', 'Leads', 'Radar', 'Parcerias', 'Marketing', 'Score', 'Acessos', 'TI', 'Custos', 'Jurídico', 'Relatórios'];
const E = 'Editar', V = 'Ver', N = '—';
const ROLES: any[] = [
  { role: 'CEO', scope: 'Rede', perms: [E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E] },
  { role: 'Gestor de Rede', scope: 'Rede', perms: [V, E, E, V, N, N, E, E, E, E, V, V, N, V, N, N, V] },
  { role: 'Financeiro', scope: 'Rede', perms: [V, N, N, E, E, E, N, N, N, N, N, N, N, V, V, N, V] },
  { role: 'Jurídico/DPO', scope: 'Rede', perms: [V, N, N, N, N, V, N, N, V, N, N, N, V, N, N, E, V] },
  { role: 'Marketing', scope: 'Rede', perms: [V, N, N, N, N, N, N, E, N, N, E, V, N, N, N, N, V] },
  { role: 'Curadoria', scope: 'Rede', perms: [V, E, N, N, N, N, N, N, E, N, N, V, N, N, N, N, N] },
  { role: 'Franqueado', scope: 'Unidade', perms: [V, E, N, V, N, N, V, E, E, E, V, V, N, N, N, N, V] },
  { role: 'Corretor', scope: 'Próprio', perms: [V, V, N, N, N, N, V, V, V, V, V, V, N, N, N, N, N] },
  { role: 'Desenvolvedor (TI)', scope: 'Rede', perms: [V, N, N, N, N, N, N, N, N, N, N, N, N, E, E, N, N] },
];
const permStyle = (p: any) => p === E ? [ad.success, ad.successBg, 'check-check'] : p === V ? [ad.info, ad.infoBg, 'eye'] : [ad.g300, ad.g100, 'minus'];

/* ---------------- SUMMARY ---------------- */
function AdSummary() {
  const cards: any[] = [
    { l: 'Administradores ativos', v: '18', ic: 'shield-check', hl: true },
    { l: 'Papéis configurados', v: '9', ic: 'users-round', tone: ad.primary },
    { l: '2FA ativo', v: '94%', ic: 'smartphone', tone: ad.success },
    { l: 'Sessões ativas', v: '27', ic: 'monitor', tone: ad.primary },
    { l: 'Convites pendentes', v: '3', ic: 'mail', tone: ad.warning },
    { l: 'Eventos de auditoria', v: '1.240', ic: 'scroll-text', tone: ad.info },
  ];
  return (
    <div className="ad-summary">
      {cards.map(c => (
        <div key={c.l} style={{ background: c.hl ? `linear-gradient(135deg, ${ad.primary}, ${ad.deep})` : '#fff', border: c.hl ? 'none' : `1px solid ${ad.g300}`, borderRadius: 14, padding: 15, boxShadow: c.hl ? 'var(--shadow-purple)' : 'none', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 30, height: 30, borderRadius: 8, background: c.hl ? 'rgba(255,255,255,.18)' : ad.lilac2, display: 'grid', placeItems: 'center', flexShrink: 0 }}><CIc n={c.ic} s={15} c={c.hl ? '#fff' : (c.tone || ad.primary)} /></span>
            <span style={{ fontSize: 11.5, fontWeight: 600, color: c.hl ? 'rgba(255,255,255,.85)' : ad.g500, lineHeight: 1.25 }}>{c.l}</span>
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 21, lineHeight: 1.15, color: c.hl ? '#fff' : ad.ink, marginTop: 11 }}>{c.v}</div>
        </div>
      ))}
    </div>
  );
}

/* ---------------- SELECT ---------------- */
function AdSelect({ value, onChange, options, icon }: any) {
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' } as React.CSSProperties}>
      {icon && <span style={{ position: 'absolute', left: 12, pointerEvents: 'none', display: 'flex' } as React.CSSProperties}><CIc n={icon} s={15} c={ad.g500} /></span>}
      <select value={value} onChange={(e: any) => onChange(e.target.value)} style={{ appearance: 'none', WebkitAppearance: 'none', border: `1px solid ${ad.g300}`, background: '#fff', borderRadius: 10, padding: icon ? '9px 32px 9px 34px' : '9px 32px 9px 13px', fontFamily: 'var(--font-body)', fontSize: 13.5, fontWeight: 600, color: ad.ink, cursor: 'pointer', outline: 'none' } as React.CSSProperties}>
        {options.map((o: any) => <option key={o} value={o}>{o}</option>)}
      </select>
      <span style={{ position: 'absolute', right: 11, pointerEvents: 'none', display: 'flex' } as React.CSSProperties}><CIc n="chevron-down" s={15} c={ad.g500} /></span>
    </div>
  );
}

/* ---------------- USERS TABLE ---------------- */
function AdTable({ onSelect }: any) {
  const [q, setQ] = useStateAd('');
  const [fRole, setFRole] = useStateAd('Todos os papéis');
  const [fScope, setFScope] = useStateAd('Todos os escopos');
  const rows = USERS.filter(u =>
    (q === '' || (u.name + u.role).toLowerCase().includes(q.toLowerCase())) &&
    (fRole === 'Todos os papéis' || u.role === fRole) &&
    (fScope === 'Todos os escopos' || u.scope === fScope)
  );
  const cols = ['Nome', 'Papel', 'Escopo', 'Unidade', '2FA', 'Último acesso', 'Status'];
  return (
    <div style={{ ...adCard, padding: 22 }}>
      <AdHead title="Administradores & usuários" sub={`${rows.length} de ${USERS.length}`} right={<button style={{ display: 'flex', alignItems: 'center', gap: 7, border: 'none', background: ad.primary, color: '#fff', borderRadius: 10, padding: '10px 16px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 13.5, boxShadow: 'var(--shadow-purple)' }}><CIc n="user-plus" s={16} c="#fff" /> Convidar</button>} />
      <div className="ad-filters">
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: ad.g100, borderRadius: 10, padding: '0 13px', height: 40, flex: 1, minWidth: 180 }}>
          <CIc n="search" s={17} c={ad.g500} />
          <input value={q} onChange={(e: any) => setQ(e.target.value)} placeholder="Buscar nome, papel…" style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontFamily: 'var(--font-body)', fontSize: 13.5, color: ad.ink }} />
        </div>
        <AdSelect icon="users-round" value={fRole} onChange={setFRole} options={['Todos os papéis', 'CEO', 'Gestor de Rede', 'Financeiro', 'Jurídico/DPO', 'Marketing', 'Curadoria', 'Franqueado', 'Corretor', 'Desenvolvedor (TI)']} />
        <AdSelect icon="git-branch" value={fScope} onChange={setFScope} options={['Todos os escopos', 'Rede', 'Unidade', 'Próprio']} />
      </div>

      <div className="ad-table-wrap" style={{ overflowX: 'auto', marginTop: 18 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 860 }}>
          <thead><tr>
            {cols.map(h => <th key={h} style={{ textAlign: 'left', fontSize: 11, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: ad.g500, padding: '0 12px 12px', borderBottom: `1px solid ${ad.g300}`, whiteSpace: 'nowrap' } as React.CSSProperties}>{h}</th>)}
          </tr></thead>
          <tbody>
            {rows.map(u => {
              const [scFg, scBg] = SCOPE_TONE[u.scope];
              const [stFg, stBg] = AD_STATUS[u.status];
              const pending = u.f2a === 'Pendente';
              return (
                <tr key={u.id} onClick={() => onSelect(u)} style={{ borderBottom: `1px solid ${ad.g100}`, cursor: 'pointer' }}
                  onMouseEnter={(e: any) => e.currentTarget.style.background = ad.lilac1}
                  onMouseLeave={(e: any) => e.currentTarget.style.background = '#fff'}>
                  <td style={{ padding: '12px', whiteSpace: 'nowrap' } as React.CSSProperties}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ width: 32, height: 32, borderRadius: '50%', background: u.status === 'Convite pendente' ? ad.g100 : `linear-gradient(135deg, ${ad.light}, ${ad.deep})`, color: u.status === 'Convite pendente' ? ad.g500 : '#fff', fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-display)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>{u.status === 'Convite pendente' ? '?' : u.name.split(' ').map((p: any) => p[0]).slice(0, 2).join('')}</span>
                      <span style={{ fontSize: 14, fontWeight: 600, color: ad.ink }}>{u.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px', fontSize: 13.5, color: ad.g700, whiteSpace: 'nowrap' } as React.CSSProperties}>{u.role}</td>
                  <td style={{ padding: '12px' }}><AdBadge text={u.scope} fg={scFg} bg={scBg} /></td>
                  <td style={{ padding: '12px', fontSize: 13, color: u.unit === '—' ? ad.g300 : ad.g700, whiteSpace: 'nowrap' } as React.CSSProperties}>{u.unit}</td>
                  <td style={{ padding: '12px' }}>{u.f2a === '—' ? <span style={{ color: ad.g300 }}>—</span> : <AdBadge text={`2FA ${u.f2a}`} fg={pending ? ad.warning : ad.success} bg={pending ? ad.warnBg : ad.successBg} />}</td>
                  <td style={{ padding: '12px', fontSize: 13, color: ad.g500, whiteSpace: 'nowrap' } as React.CSSProperties}>{u.last}</td>
                  <td style={{ padding: '12px' }}><AdBadge text={u.status} fg={stFg} bg={stBg} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="ad-table-cards" style={{ marginTop: 18, flexDirection: 'column', gap: 12 } as React.CSSProperties}>
        {rows.map(u => {
          const [scFg, scBg] = SCOPE_TONE[u.scope];
          const [stFg, stBg] = AD_STATUS[u.status];
          return (
            <button key={u.id} onClick={() => onSelect(u)} style={{ ...adCard, background: ad.page, padding: 16, textAlign: 'left', cursor: 'pointer', fontFamily: 'var(--font-body)', width: '100%' } as React.CSSProperties}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 14.5, fontWeight: 600, color: ad.ink }}>{u.name}</span>
                <AdBadge text={u.status} fg={stFg} bg={stBg} />
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' } as React.CSSProperties}>
                <span style={{ fontSize: 13, color: ad.g700 }}>{u.role}</span>
                <AdBadge text={u.scope} fg={scFg} bg={scBg} />
                {u.f2a !== '—' && <AdBadge text={`2FA ${u.f2a}`} fg={u.f2a === 'Pendente' ? ad.warning : ad.success} bg={u.f2a === 'Pendente' ? ad.warnBg : ad.successBg} />}
                <span style={{ fontSize: 12, color: ad.g500, marginLeft: 'auto' }}>{u.last}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- RBAC MATRIX ---------------- */
function AdRbac() {
  return (
    <div style={{ ...adCard, padding: 22 }}>
      <AdHead title="Papéis & permissões — RBAC" sub="9 papéis × 17 áreas · menor privilégio — inclui Desenvolvedor (TI), restrito a TI & Custos" right={
        <div style={{ display: 'flex', gap: 10 }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: 6, border: `1px solid ${ad.g300}`, background: '#fff', color: ad.primary, borderRadius: 10, padding: '8px 13px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13 }}><CIc n="plus" s={15} c={ad.primary} /> Novo papel</button>
          <button style={{ display: 'flex', alignItems: 'center', gap: 6, border: 'none', background: ad.primary, color: '#fff', borderRadius: 10, padding: '8px 14px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 13 }}><CIc n="save" s={15} c="#fff" /> Salvar permissões</button>
        </div>
      } />
      <div style={{ display: 'flex', gap: 16, marginBottom: 14, flexWrap: 'wrap' } as React.CSSProperties}>
        {[[E, ad.success, ad.successBg, 'check-check'], [V, ad.info, ad.infoBg, 'eye'], [N, ad.g500, ad.g100, 'minus']].map(([lbl, fg, bg, ic]) => (
          <span key={lbl} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: ad.g700 }}><span style={{ width: 22, height: 22, borderRadius: 6, background: bg, display: 'grid', placeItems: 'center' }}><CIc n={ic} s={13} c={fg} /></span> {lbl === '—' ? 'Sem acesso' : lbl}</span>
        ))}
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1240 }}>
          <thead><tr>
            <th style={{ textAlign: 'left', fontSize: 11, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: ad.g500, padding: '0 10px 12px', borderBottom: `1px solid ${ad.g300}`, position: 'sticky', left: 0, background: '#fff' } as React.CSSProperties}>Papel</th>
            {AREAS.map(a => <th key={a} style={{ textAlign: 'center', fontSize: 10, fontWeight: 700, letterSpacing: '.02em', textTransform: 'uppercase', color: ad.g500, padding: '0 6px 12px', borderBottom: `1px solid ${ad.g300}`, whiteSpace: 'nowrap' } as React.CSSProperties}>{a}</th>)}
          </tr></thead>
          <tbody>
            {ROLES.map(r => {
              const [scFg, scBg] = SCOPE_TONE[r.scope];
              return (
                <tr key={r.role} style={{ borderBottom: `1px solid ${ad.g100}` }}>
                  <td style={{ padding: '10px', position: 'sticky', left: 0, background: '#fff' } as React.CSSProperties}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: ad.ink, whiteSpace: 'nowrap' } as React.CSSProperties}>{r.role}</div>
                    <span style={{ fontSize: 10.5, fontWeight: 700, color: scFg, background: scBg, borderRadius: 999, padding: '1px 7px' }}>{r.scope}</span>
                  </td>
                  {r.perms.map((p: any, i: any) => {
                    const [fg, bg, ic] = permStyle(p);
                    return <td key={i} style={{ padding: '10px 6px', textAlign: 'center' } as React.CSSProperties}><span style={{ width: 26, height: 26, borderRadius: 7, background: bg, display: 'inline-grid', placeItems: 'center' }}><CIc n={ic} s={14} c={fg} /></span></td>;
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------------- SECURITY ---------------- */
function AdSecurity() {
  const items: any[] = [
    { l: '2FA obrigatório', v: 'Ligado', note: 'exigido no primeiro login', ic: 'smartphone', on: true },
    { l: 'Política de senha', v: 'Mín. 10 caracteres', note: 'com complexidade', ic: 'key-round' },
    { l: 'Expiração de sessão', v: '8h admin · 30d corretor', note: '', ic: 'timer' },
    { l: 'Bloqueio por tentativas', v: 'Após 5 tentativas', note: '', ic: 'lock' },
  ];
  const logins: any[] = [
    { t: 'hoje 09:12', who: 'marina@', res: 'Falha (2FA)', ok: false },
    { t: 'hoje 08:40', who: 'rafael@', res: 'Sucesso', ok: true },
    { t: 'ontem 22:05', who: 'desconhecido', res: 'Negado', ok: false },
  ];
  return (
    <div style={{ ...adCard, padding: 22 }}>
      <AdHead title="Segurança" sub="Política de acesso da plataforma" right={<button style={{ display: 'flex', alignItems: 'center', gap: 6, border: 'none', background: ad.primary, color: '#fff', borderRadius: 10, padding: '8px 14px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 13 }}><CIc n="save" s={15} c="#fff" /> Salvar política</button>} />
      <div className="ad-2col">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 } as React.CSSProperties}>
          {items.map(s => (
            <div key={s.l} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: ad.page, borderRadius: 11 }}>
              <span style={{ width: 34, height: 34, borderRadius: 9, background: '#fff', border: `1px solid ${ad.g300}`, display: 'grid', placeItems: 'center', flexShrink: 0 }}><CIc n={s.ic} s={17} c={ad.primary} /></span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: ad.ink }}>{s.l}</div>
                <div style={{ fontSize: 12, color: ad.g500 }}>{s.v}{s.note && ` · ${s.note}`}</div>
              </div>
              {s.on !== undefined && <span style={{ width: 40, height: 23, borderRadius: 999, background: ad.success, position: 'relative', flexShrink: 0 } as React.CSSProperties}><span style={{ position: 'absolute', top: 3, left: 20, width: 17, height: 17, borderRadius: '50%', background: '#fff' } as React.CSSProperties} /></span>}
            </div>
          ))}
        </div>
        <div>
          <div style={adSecLabel}>Logins recentes</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 } as React.CSSProperties}>
            {logins.map((l, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', background: ad.page, borderRadius: 10 }}>
                <CIc n={l.ok ? 'check-circle' : 'x-circle'} s={16} c={l.ok ? ad.success : ad.error} />
                <span style={{ flex: 1, fontSize: 13, color: ad.g700 }}><strong style={{ color: ad.ink }}>{l.who}</strong> · {l.t}</span>
                <AdBadge text={l.res} fg={l.ok ? ad.success : ad.error} bg={l.ok ? ad.successBg : ad.errBg} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- AUDIT LOG ---------------- */
function AdAudit() {
  const events: any[] = [
    { t: 'hoje 14:32', who: ceoPersona.nome, role: 'CEO', act: 'Alterou pesos do Score', alvo: 'Score', ok: true, ip: '187.xx' },
    { t: 'hoje 11:05', who: 'Rafael Lima', role: 'Gestor de Rede', act: 'Credenciou parceiro', alvo: 'Banco parceiro A', ok: true, ip: '187.xx' },
    { t: 'ontem 18:20', who: 'André Costa', role: 'Jurídico', act: 'Concluiu pedido de exclusão', alvo: 'Titular #1042', ok: true, ip: '200.xx' },
    { t: 'ontem 16:40', who: 'Lucas Ferreira', role: 'Corretor', act: 'Revelou contato de proprietário', alvo: 'Imóvel #3381', ok: true, ip: '177.xx', note: '1 crédito' },
    { t: 'ontem 09:12', who: 'desconhecido', role: '—', act: 'Tentativa de login', alvo: 'conta marina@', ok: false, ip: '45.xx', neg: '2FA' },
  ];
  return (
    <div style={{ ...adCard, padding: 22 }}>
      <AdHead title="Trilha de auditoria — AuditLog" />
      {/* integrity seal */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: ad.successBg, border: `1px solid ${ad.success}40`, borderRadius: 12, padding: '14px 18px', marginBottom: 16, flexWrap: 'wrap' } as React.CSSProperties}>
        <span style={{ width: 44, height: 44, borderRadius: 12, background: '#fff', display: 'grid', placeItems: 'center', flexShrink: 0 }}><CIc n="shield-check" s={24} c={ad.success} /></span>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: ad.ink }}>Integridade verificada ✓ · cadeia íntegra</div>
          <div style={{ fontSize: 12.5, color: ad.g700 }}>12.482 eventos · encadeados por <strong>SHA-256</strong> · append-only (não editável)</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: 6, border: `1px solid ${ad.success}`, background: '#fff', color: ad.success, borderRadius: 10, padding: '8px 13px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 13 }}><CIc n="badge-check" s={15} c={ad.success} /> Verificar</button>
          <button style={{ display: 'flex', alignItems: 'center', gap: 6, border: `1px solid ${ad.g300}`, background: '#fff', color: ad.g700, borderRadius: 10, padding: '8px 13px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13 }}><CIc n="download" s={15} c={ad.g700} /> Exportar</button>
        </div>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 820 }}>
          <thead><tr>
            {['Data/hora', 'Ator (papel)', 'Ação', 'Alvo', 'Resultado', 'Origem'].map(h => <th key={h} style={{ textAlign: 'left', fontSize: 11, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: ad.g500, padding: '0 12px 12px', borderBottom: `1px solid ${ad.g300}`, whiteSpace: 'nowrap' } as React.CSSProperties}>{h}</th>)}
          </tr></thead>
          <tbody>
            {events.map((e, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${ad.g100}` }}>
                <td style={{ padding: '12px', fontSize: 12.5, color: ad.g500, whiteSpace: 'nowrap' } as React.CSSProperties}>{e.t}</td>
                <td style={{ padding: '12px', whiteSpace: 'nowrap' } as React.CSSProperties}><span style={{ fontSize: 13.5, fontWeight: 600, color: ad.ink }}>{e.who}</span> <span style={{ fontSize: 12, color: ad.g500 }}>· {e.role}</span></td>
                <td style={{ padding: '12px', fontSize: 13, color: ad.g700, whiteSpace: 'nowrap' } as React.CSSProperties}>{e.act}</td>
                <td style={{ padding: '12px', fontSize: 13, color: ad.g700, whiteSpace: 'nowrap' } as React.CSSProperties}>{e.alvo}</td>
                <td style={{ padding: '12px', whiteSpace: 'nowrap' } as React.CSSProperties}><AdBadge text={e.ok ? (e.note ? `Sucesso · ${e.note}` : 'Sucesso') : `Negado · ${e.neg}`} fg={e.ok ? ad.success : ad.error} bg={e.ok ? ad.successBg : ad.errBg} /></td>
                <td style={{ padding: '12px', fontSize: 12.5, color: ad.g500, fontFamily: 'var(--font-body)', whiteSpace: 'nowrap' } as React.CSSProperties}>{e.ip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 14, fontSize: 12, color: ad.g500 }}>
        <CIc n="info" s={14} c={ad.g500} /> Fonte da verdade da auditoria. Jurídico & LGPD consome uma visão filtrada (acessos a dado pessoal).
      </div>
    </div>
  );
}

/* ---------------- DRAWER ---------------- */
function AdDrawer({ open, onClose, children, width = 500 }: any) {
  return (
    <React.Fragment>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(28,26,34,.45)', zIndex: 80, opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none', transition: 'opacity .2s ease' } as React.CSSProperties} />
      <div className="ad-drawer" style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width, maxWidth: '100vw', background: '#fff', zIndex: 81, boxShadow: 'var(--shadow-lg)', transform: open ? 'translateX(0)' : 'translateX(100%)', transition: 'transform .26s cubic-bezier(.2,.7,.3,1)', display: 'flex', flexDirection: 'column' } as React.CSSProperties}>
        {open && children}
      </div>
    </React.Fragment>
  );
}
function AdField({ l, v, tone }: any) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, padding: '9px 0', borderBottom: `1px solid ${ad.g100}` }}>
      <span style={{ fontSize: 13, color: ad.g500, flexShrink: 0 }}>{l}</span>
      <span style={{ fontSize: 13.5, fontWeight: 600, color: tone || ad.ink, textAlign: 'right' } as React.CSSProperties}>{v}</span>
    </div>
  );
}

/* ---------------- USER DETAIL ---------------- */
function AdDetail({ user, onClose }: any) {
  if (!user) return null;
  const u = user;
  const [scFg, scBg] = SCOPE_TONE[u.scope];
  const [stFg, stBg] = AD_STATUS[u.status];
  const pending = u.f2a === 'Pendente';
  const perms = u.perms || [['Visão geral', 'Ver'], ['Relatórios', 'Ver']];
  const permTone = (p: any) => p === 'Editar' ? ad.success : p === 'Ver' ? ad.info : ad.g500;
  return (
    <React.Fragment>
      <div style={{ padding: '20px 24px', borderBottom: `1px solid ${ad.g300}` }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <span style={{ width: 46, height: 46, borderRadius: '50%', background: `linear-gradient(135deg, ${ad.light}, ${ad.deep})`, color: '#fff', fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-display)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>{u.name.split(' ').map((p: any) => p[0]).slice(0, 2).join('').toUpperCase()}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: ad.ink, lineHeight: 1.2 }}>{u.name}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, flexWrap: 'wrap' } as React.CSSProperties}>
              <AdBadge text={u.role} fg={ad.primary} bg={ad.lilac2} />
              <AdBadge text={u.scope} fg={scFg} bg={scBg} />
              <AdBadge text={`2FA ${u.f2a}`} fg={pending ? ad.warning : ad.success} bg={pending ? ad.warnBg : ad.successBg} />
            </div>
          </div>
          <button onClick={onClose} style={{ width: 34, height: 34, border: `1px solid ${ad.g300}`, background: '#fff', borderRadius: 9, display: 'grid', placeItems: 'center', cursor: 'pointer', flexShrink: 0 }}><CIc n="x" s={18} c={ad.g700} /></button>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <button style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, border: `1px solid ${ad.g300}`, background: '#fff', color: ad.g700, borderRadius: 10, padding: '10px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13 }}><CIc n="user-cog" s={15} c={ad.g700} /> Mudar papel</button>
          {pending && <button style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, border: 'none', background: ad.warning, color: '#fff', borderRadius: 10, padding: '10px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 13 }}><CIc n="smartphone" s={15} c="#fff" /> Reenviar 2FA</button>}
          <button style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, border: `1px solid ${ad.g300}`, background: '#fff', color: ad.error, borderRadius: 10, padding: '10px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13 }}><CIc n="pause" s={15} c={ad.error} /> Suspender</button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' } as React.CSSProperties}>
        <div style={{ marginBottom: 22 }}>
          <div style={adSecLabel}>Acesso</div>
          <AdField l="Papel" v={u.role} />
          <AdField l="Escopo" v={u.scope === 'Rede' ? 'Rede inteira' : u.scope} />
          <AdField l="Unidade" v={u.unit} />
          <AdField l="Último acesso" v={u.last} />
        </div>

        <div style={{ marginBottom: 22 }}>
          <div style={adSecLabel}>Permissões efetivas</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 } as React.CSSProperties}>
            {perms.map(([area, lvl]: any) => (
              <div key={area} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, padding: '9px 0', borderBottom: `1px solid ${ad.g100}` }}>
                <span style={{ fontSize: 13, color: ad.g700 }}>{area}</span>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: permTone(lvl) }}>{lvl}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 22 }}>
          <div style={adSecLabel}>Segurança</div>
          {pending ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: ad.warnBg, borderRadius: 10, padding: '11px 14px', fontSize: 13, color: ad.g700, marginBottom: 10 }}><CIc n="alert-triangle" s={16} c={ad.warning} /> 2FA pendente — não concluiu o enrolamento.</div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: ad.successBg, borderRadius: 10, padding: '11px 14px', fontSize: 13, color: ad.g700, marginBottom: 10 }}><CIc n="shield-check" s={16} c={ad.success} /> 2FA ativo.</div>
          )}
          <AdField l="Sessões ativas" v={`${u.sessions || 1}`} />
          <AdField l="Dispositivos" v={u.devices || 'Chrome · Windows'} />
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ ...adSecLabel, margin: 0 }}>Histórico</span>
            <button style={{ display: 'flex', alignItems: 'center', gap: 5, border: 'none', background: 'transparent', color: ad.primary, cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 12.5 }}>Ver no AuditLog <CIc n="arrow-up-right" s={13} c={ad.primary} /></button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 } as React.CSSProperties}>
            {(u.hist || [{ t: 'hoje', d: 'Login com sucesso' }]).map((h: any, i: any) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', background: ad.page, borderRadius: 10 }}>
                <CIc n={h.warn ? 'alert-triangle' : 'circle-dot'} s={14} c={h.warn ? ad.warning : ad.g500} />
                <span style={{ flex: 1, fontSize: 13, color: ad.g700 }}>{h.d}</span>
                <span style={{ fontSize: 12, color: ad.g500 }}>{h.t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding: '12px 24px', borderTop: `1px solid ${ad.g300}` }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' } as React.CSSProperties}>
          {['Mudar papel', 'Revogar sessões', 'Suspender', 'Remover'].map(a => (
            <button key={a} style={{ flex: 1, minWidth: 100, border: `1px solid ${ad.g300}`, background: '#fff', color: a === 'Remover' || a === 'Suspender' ? ad.error : ad.g700, borderRadius: 9, padding: '9px 8px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 12.5 }}>{a}</button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, fontSize: 11, color: ad.g500 }}><CIc n="scroll-text" s={12} c={ad.g500} /> Cada ação é registrada na auditoria.</div>
      </div>
    </React.Fragment>
  );
}

/* ---------------- PERIOD ---------------- */
function AdPeriod() {
  const [p, setP] = useStateAd('Este mês');
  const periods = ['Este mês', 'Trimestre', 'Ano'];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <CIc n="calendar" s={16} c={ad.g500} />
      <div style={{ display: 'flex', background: ad.g100, borderRadius: 999, padding: 3 }}>
        {periods.map(x => <button key={x} onClick={() => setP(x)} style={{ border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, padding: '7px 14px', borderRadius: 999, background: p === x ? '#fff' : 'transparent', color: p === x ? ad.primary : ad.g500, boxShadow: p === x ? 'var(--shadow-sm)' : 'none' }}>{x}</button>)}
      </div>
    </div>
  );
}

/* ---------------- PAGE ---------------- */
function AcessosPage() {
  const [selected, setSelected] = useStateAd(null);
  return (
    <CeoChrome>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 } as React.CSSProperties}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap' } as React.CSSProperties}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 30, letterSpacing: '-0.02em', margin: 0, color: ad.ink }}>Administradores &amp; Acessos</h1>
          <div style={{ fontSize: 13.5, color: ad.g500, marginTop: 4 }}>Papéis, permissões, 2FA e auditoria à prova de adulteração</div>
        </div>
        <AdPeriod />
      </div>

      <AdSummary />
      <AdTable onSelect={setSelected} />
      <AdRbac />
      <AdSecurity />
      <AdAudit />

      <AdDrawer open={!!selected} onClose={() => setSelected(null)}>
        <AdDetail user={selected} onClose={() => setSelected(null)} />
      </AdDrawer>
    </div>
    </CeoChrome>
  );
}

export default AcessosPage;
