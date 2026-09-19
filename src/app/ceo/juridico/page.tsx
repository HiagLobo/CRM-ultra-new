"use client";
import * as React from "react";
import CeoChrome, { ceoPalette, CIc, ceoPersona } from "@/components/ceo/CeoChrome";
import { demo, emailDemo } from "@/config/demo";
const { useState, useEffect, useRef, useMemo, useCallback } = React;
const { useState: useStateJu } = React;

const ju: any = {
  ...ceoPalette,
  info: '#3E82E0', infoBg: '#E5EEFB',
  successBg: '#E6F4EC', warnBg: '#FBF1DC', errBg: '#FAE5E5',
  p3: '#818CF8',
};
const juCard = { background: '#fff', border: `1px solid ${ju.g300}`, borderRadius: 16 };
const juSecLabel = { fontSize: 11.5, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: ju.g500, margin: '0 0 12px' } as React.CSSProperties;

function JuBadge({ text, fg, bg }: any) {
  return <span style={{ fontSize: 12, fontWeight: 700, color: fg, background: bg, borderRadius: 999, padding: '3px 10px', whiteSpace: 'nowrap' }}>{text}</span>;
}
function JuHead({ title, sub, right }: any) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
      <div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: ju.ink }}>{title}</div>
        {sub && <div style={{ fontSize: 13, color: ju.g500, marginTop: 2 }}>{sub}</div>}
      </div>
      {right}
    </div>
  );
}

const TYPE_TONE: any = { 'Exclusão': [ju.error, ju.errBg], 'Acesso': [ju.info, ju.infoBg], 'Correção': [ju.warning, ju.warnBg], 'Portabilidade': [ju.p3, '#E0E7FF'], 'Revogação de consentimento': [ju.g700, ju.g100] };
const JU_STATUS: any = { 'Recebido': [ju.info, ju.infoBg], 'Em análise': [ju.warning, ju.warnBg], 'Concluído': [ju.success, ju.successBg], 'Recusado': [ju.error, ju.errBg] };
const LEGAL_TONE: any = { 'Legítimo interesse': [ju.p3, '#E0E7FF'], 'Execução de contrato': [ju.info, ju.infoBg], 'Consentimento': [ju.success, ju.successBg], 'Obrigação legal': [ju.warning, ju.warnBg], 'Obrigação legal (RFB)': [ju.warning, ju.warnBg], 'Execução de contrato + Obrigação legal': [ju.info, ju.infoBg] };

/* ---------------- DATA ---------------- */
const REQUESTS: any[] = [
  {
    id: 'r1', titular: 'João P.', tipo: 'Exclusão', origem: 'Portal do titular', prazo: 9, status: 'Em análise', dpo: 'André Costa',
    pedido: 'Eliminação dos dados pessoais', entrada: '03/06/2026', canal: 'Portal do titular',
    dados: [`Lead no CRM (${demo.nomeCurto} Recife Centro)`, 'Contato registrado em 1 captação'],
    analise: 'Dado de lead pode ser eliminado. Não há contrato ativo. Sem retenção obrigatória aplicável.',
    hist: [{ t: '03/06', d: 'Pedido recebido' }, { t: '04/06', d: 'Em análise pelo DPO' }],
  },
  { id: 'r2', titular: 'Maria S.', tipo: 'Acesso', origem: 'E-mail do DPO', prazo: 12, status: 'Recebido', dpo: 'André Costa' },
  { id: 'r3', titular: 'Helena R.', tipo: 'Exclusão', origem: 'Encaminhado (Captação)', prazo: 4, status: 'Em análise', dpo: 'André Costa' },
  { id: 'r4', titular: 'Construtora X', tipo: 'Correção', origem: 'Portal do titular', prazo: 11, status: 'Em análise', dpo: 'André Costa' },
  { id: 'r5', titular: 'Pedro N.', tipo: 'Revogação de consentimento', origem: 'Portal do titular', prazo: null, status: 'Concluído', dpo: 'André Costa' },
];

const ROPA: any[] = [
  { op: 'Captação e prospecção', cat: 'Contato de proprietário', tit: 'Proprietários', base: 'Legítimo interesse', ret: 'Até captação ou solicitação', share: '—' },
  { op: 'Atendimento e negociação', cat: 'Contato e interesse', tit: 'Compradores/locatários', base: 'Execução de contrato', ret: '12 meses', share: 'Corretor responsável' },
  { op: 'Administração de locação', cat: 'Inquilino/proprietário + crédito', tit: 'Inquilinos/proprietários', base: 'Execução de contrato + Obrigação legal', ret: 'Vigência + prazo legal', share: 'Seguradora/garantidora' },
  { op: 'Marketing', cat: 'Contato', tit: 'Leads/clientes', base: 'Consentimento', ret: 'Até revogação', share: 'Ferramenta de marketing' },
  { op: 'Obrigações fiscais', cat: 'Dados de transação', tit: 'Clientes', base: 'Obrigação legal (RFB)', ret: 'Prazo legal fiscal', share: 'RFB' },
];

/* ---------------- SUMMARY ---------------- */
function JuSummary() {
  const cards = [
    { l: 'Pedidos de titulares abertos', v: '9', sub: '6 de exclusão', ic: 'user-cog', hl: true },
    { l: 'Prazo médio de resposta', v: '6 dias', ic: 'timer', tone: ju.success },
    { l: 'Acessos a dado pessoal', v: '3.420', ic: 'eye', tone: ju.primary },
    { l: 'Incidentes abertos', v: '0', ic: 'shield-check', tone: ju.success },
    { l: 'Contratos a vencer (90d)', v: '14', ic: 'file-text', tone: ju.warning },
    { l: 'Disputas abertas', v: '2', ic: 'scale', tone: ju.error },
  ];
  return (
    <div className="ju-summary">
      {cards.map(c => (
        <div key={c.l} style={{ background: c.hl ? `linear-gradient(135deg, ${ju.primary}, ${ju.deep})` : '#fff', border: c.hl ? 'none' : `1px solid ${ju.g300}`, borderRadius: 14, padding: 15, boxShadow: c.hl ? 'var(--shadow-purple)' : 'none', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 30, height: 30, borderRadius: 8, background: c.hl ? 'rgba(255,255,255,.18)' : ju.lilac2, display: 'grid', placeItems: 'center', flexShrink: 0 }}><CIc n={c.ic} s={15} c={c.hl ? '#fff' : (c.tone || ju.primary)} /></span>
            <span style={{ fontSize: 11.5, fontWeight: 600, color: c.hl ? 'rgba(255,255,255,.85)' : ju.g500, lineHeight: 1.25 }}>{c.l}</span>
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 21, lineHeight: 1.15, color: c.hl ? '#fff' : ju.ink, marginTop: 11 }}>{c.v}{c.sub && <span style={{ fontSize: 11.5, fontWeight: 600, color: c.hl ? 'rgba(255,255,255,.7)' : ju.g500 }}> · {c.sub}</span>}</div>
        </div>
      ))}
    </div>
  );
}

/* ---------------- SELECT ---------------- */
function JuSelect({ value, onChange, options, icon }: any) {
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      {icon && <span style={{ position: 'absolute', left: 12, pointerEvents: 'none', display: 'flex' }}><CIc n={icon} s={15} c={ju.g500} /></span>}
      <select value={value} onChange={e => onChange(e.target.value)} style={{ appearance: 'none', WebkitAppearance: 'none', border: `1px solid ${ju.g300}`, background: '#fff', borderRadius: 10, padding: icon ? '9px 32px 9px 34px' : '9px 32px 9px 13px', fontFamily: 'var(--font-body)', fontSize: 13.5, fontWeight: 600, color: ju.ink, cursor: 'pointer', outline: 'none' } as React.CSSProperties}>
        {options.map((o: any) => <option key={o} value={o}>{o}</option>)}
      </select>
      <span style={{ position: 'absolute', right: 11, pointerEvents: 'none', display: 'flex' }}><CIc n="chevron-down" s={15} c={ju.g500} /></span>
    </div>
  );
}

/* ---------------- REQUESTS TABLE ---------------- */
function JuTable({ onSelect }: any) {
  const [q, setQ] = useStateJu('');
  const [fType, setFType] = useStateJu('Todos os tipos');
  const [fStatus, setFStatus] = useStateJu('Todos os status');
  const rows = REQUESTS.filter(r =>
    (q === '' || (r.titular + r.tipo).toLowerCase().includes(q.toLowerCase())) &&
    (fType === 'Todos os tipos' || r.tipo === fType) &&
    (fStatus === 'Todos os status' || r.status === fStatus)
  );
  const cols = ['Titular', 'Tipo', 'Origem', 'Prazo', 'Status', 'Responsável'];
  return (
    <div style={{ ...juCard, padding: 22 }}>
      <JuHead title="Pedidos dos titulares (LGPD)" sub={`${rows.length} de ${REQUESTS.length} · prazo legal ~15 dias`} />
      <div className="ju-filters">
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: ju.g100, borderRadius: 10, padding: '0 13px', height: 40, flex: 1, minWidth: 180 }}>
          <CIc n="search" s={17} c={ju.g500} />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar titular…" style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontFamily: 'var(--font-body)', fontSize: 13.5, color: ju.ink }} />
        </div>
        <JuSelect icon="filter" value={fType} onChange={setFType} options={['Todos os tipos', 'Exclusão', 'Acesso', 'Correção', 'Portabilidade', 'Revogação de consentimento']} />
        <JuSelect icon="activity" value={fStatus} onChange={setFStatus} options={['Todos os status', 'Recebido', 'Em análise', 'Concluído', 'Recusado']} />
      </div>

      <div className="ju-table-wrap" style={{ overflowX: 'auto', marginTop: 18 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 760 }}>
          <thead><tr>
            {cols.map(h => <th key={h} style={{ textAlign: 'left', fontSize: 11, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: ju.g500, padding: '0 12px 12px', borderBottom: `1px solid ${ju.g300}`, whiteSpace: 'nowrap' }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {rows.map(r => {
              const [tFg, tBg] = TYPE_TONE[r.tipo];
              const [sFg, sBg] = JU_STATUS[r.status];
              const short = r.prazo != null && r.prazo <= 5;
              return (
                <tr key={r.id} onClick={() => onSelect(r)} style={{ borderBottom: `1px solid ${ju.g100}`, cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = ju.lilac1}
                  onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                  <td style={{ padding: '13px 12px', fontSize: 14, fontWeight: 600, color: ju.ink, whiteSpace: 'nowrap' }}>{r.titular}</td>
                  <td style={{ padding: '13px 12px' }}><JuBadge text={r.tipo === 'Revogação de consentimento' ? 'Revogação' : r.tipo} fg={tFg} bg={tBg} /></td>
                  <td style={{ padding: '13px 12px', fontSize: 13, color: ju.g700, whiteSpace: 'nowrap' }}>{r.origem}</td>
                  <td style={{ padding: '13px 12px', whiteSpace: 'nowrap' }}>{r.prazo == null ? <span style={{ fontSize: 13, color: ju.g300 }}>—</span> : <span style={{ fontSize: 13, fontWeight: 700, color: short ? ju.error : ju.g700 }}>{r.prazo} dias{short && ' ⚠'}</span>}</td>
                  <td style={{ padding: '13px 12px' }}><JuBadge text={r.status} fg={sFg} bg={sBg} /></td>
                  <td style={{ padding: '13px 12px', fontSize: 13, color: ju.g700, whiteSpace: 'nowrap' }}>{r.dpo}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="ju-table-cards" style={{ marginTop: 18, flexDirection: 'column', gap: 12 }}>
        {rows.map(r => {
          const [tFg, tBg] = TYPE_TONE[r.tipo];
          const [sFg, sBg] = JU_STATUS[r.status];
          const short = r.prazo != null && r.prazo <= 5;
          return (
            <button key={r.id} onClick={() => onSelect(r)} style={{ ...juCard, background: ju.page, padding: 16, textAlign: 'left', cursor: 'pointer', fontFamily: 'var(--font-body)', width: '100%' } as React.CSSProperties}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 14.5, fontWeight: 600, color: ju.ink }}>{r.titular}</span>
                <JuBadge text={r.status} fg={sFg} bg={sBg} />
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                <JuBadge text={r.tipo === 'Revogação de consentimento' ? 'Revogação' : r.tipo} fg={tFg} bg={tBg} />
                <span style={{ fontSize: 12.5, color: ju.g500 }}>{r.origem}</span>
                {r.prazo != null && <span style={{ fontSize: 12.5, fontWeight: 700, color: short ? ju.error : ju.g700, marginLeft: 'auto' }}>{r.prazo} dias</span>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- ACCESS & INCIDENTS ---------------- */
function JuAccess() {
  const top = [[`${demo.nomeCurto} Boa Viagem`, 980], [`${demo.nomeCurto} Recife Centro`, 720], [`${demo.nomeCurto} Caruaru`, 410], ['Independentes', 360]];
  const maxC = 980;
  return (
    <div style={{ ...juCard, padding: 22 }}>
      <JuHead title="Registro de acessos & incidentes" sub="Visão filtrada do AuditLog · dado pessoal" right={<button style={{ display: 'flex', alignItems: 'center', gap: 6, border: `1px solid ${ju.g300}`, background: '#fff', borderRadius: 10, padding: '8px 13px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13, color: ju.primary }}>Ver no AuditLog <CIc n="arrow-up-right" s={14} c={ju.primary} /></button>} />
      <div className="ju-2col">
        <div>
          <div style={juSecLabel}>Acessos a dado pessoal · {`3.420`} no período</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
            {top.map(([u, v]) => (
              <div key={u} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 140, fontSize: 13, color: ju.g700, flexShrink: 0 }}>{u}</span>
                <div style={{ flex: 1, height: 14, background: ju.g100, borderRadius: 5, overflow: 'hidden' }}><div style={{ width: `${((v as number) / maxC) * 100}%`, height: '100%', background: ju.primary, borderRadius: 5 }} /></div>
                <span style={{ width: 38, textAlign: 'right', fontSize: 13, fontWeight: 700, color: ju.ink }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9, background: ju.errBg, borderRadius: 10, padding: '11px 13px', fontSize: 12.5, color: ju.g700, lineHeight: 1.5 }}>
            <CIc n="alert-octagon" s={16} c={ju.error} style={{ marginTop: 1, flexShrink: 0 }} /> <span><strong style={{ color: ju.ink }}>Anomalia:</strong> 1 corretor com volume de acesso acima do padrão, revisar.</span>
          </div>
        </div>
        <div>
          <div style={juSecLabel}>Incidentes (LGPD)</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: ju.successBg, borderRadius: 11, padding: '14px 16px', marginBottom: 14 }}>
            <CIc n="shield-check" s={20} c={ju.success} />
            <span style={{ flex: 1, fontSize: 14, fontWeight: 700, color: ju.ink }}>Nenhum incidente aberto</span>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, color: ju.success }}>0</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
            {['Detectar', 'Conter', 'Avaliar', 'Notificar ANPD/titulares'].map((s, i) => (
              <React.Fragment key={s}>
                <span style={{ fontSize: 12, fontWeight: 600, color: ju.g700, background: ju.page, border: `1px solid ${ju.g300}`, borderRadius: 8, padding: '6px 10px' }}>{s}</span>
                {i < 3 && <CIc n="chevron-right" s={14} c={ju.g300} />}
              </React.Fragment>
            ))}
          </div>
          <button style={{ display: 'flex', alignItems: 'center', gap: 7, border: `1px solid ${ju.g300}`, background: '#fff', color: ju.g700, borderRadius: 10, padding: '9px 14px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13 }}><CIc n="plus" s={15} c={ju.g700} /> Registrar incidente</button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- GATE DO RADAR & 72H ---------------- */
function JuGateRadar() {
  const aprovacoes = [
    { quem: 'Jurídico/DPO · André Costa', st: 'confirmado', t: 'hoje 09:40', parecer: 'Parecer PJ-2026/014' },
    { quem: `CEO · ${ceoPersona.nome}`, st: 'pendente', t: null, parecer: null },
  ];
  const trilha = [
    { t: '02/05', d: 'Gate ABERTO (Jurídico + CEO · parecer PJ-2026/009), vigência 30 dias', ic: 'lock-open' },
    { t: '14/05', d: 'Kill switch acionado pelo DPO: revisão de base legal de uma fonte', ic: 'octagon-x', warn: true },
    { t: '01/06', d: 'Gate FECHADO desde então · aba Proprietários opera só com dado permitido', ic: 'lock' },
  ];
  return (
    <div style={{ ...juCard, padding: 22 }}>
      <JuHead title="Gate do Radar (dados de proprietários)" sub="A torneira de dado pessoal da prospecção: fechada por padrão, só abre com dupla confirmação"
        right={<JuBadge text="🔒 FECHADO" fg={ju.error} bg={ju.errBg} />} />
      <div className="ju-2col">
        <div>
          <div style={juSecLabel}>Abertura em andamento · exige 2 confirmações</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
            {aprovacoes.map((a) => (
              <div key={a.quem} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: ju.page, borderRadius: 11, border: `1px solid ${a.st === 'confirmado' ? ju.success : ju.g300}` }}>
                <span style={{ width: 34, height: 34, borderRadius: 9, background: a.st === 'confirmado' ? ju.successBg : ju.g100, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <CIc n={a.st === 'confirmado' ? 'check' : 'clock'} s={17} c={a.st === 'confirmado' ? ju.success : ju.g500} />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: ju.ink }}>{a.quem}</div>
                  <div style={{ fontSize: 12, color: ju.g500 }}>{a.st === 'confirmado' ? `confirmou ${a.t} · ${a.parecer}` : 'aguardando confirmação, solicitada hoje 09:41'}</div>
                </div>
                {a.st === 'confirmado' ? <JuBadge text="Confirmado" fg={ju.success} bg={ju.successBg} /> : <button style={{ border: 'none', background: ju.primary, color: '#fff', borderRadius: 9, padding: '8px 14px', cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12.5 }}>Confirmar como CEO</button>}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <button style={{ display: 'inline-flex', alignItems: 'center', gap: 7, border: `1px solid ${ju.error}`, background: ju.errBg, color: ju.error, borderRadius: 10, padding: '9px 15px', cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 12.5 }}>
              <CIc n="octagon-x" s={15} c={ju.error} /> KILL SWITCH: fechar agora
            </button>
            <span style={{ fontSize: 12, color: ju.g500 }}>fecha na hora, sem confirmação (auditado)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9, background: ju.lilac1, border: `1px solid ${ju.lilac2}`, borderRadius: 10, padding: '11px 13px', fontSize: 12.5, color: ju.g700, lineHeight: 1.5, marginTop: 12 }}>
            <CIc n="shield-check" s={15} c={ju.primary} style={{ marginTop: 1, flexShrink: 0 }} />
            <span>Uma confirmação só <strong style={{ color: ju.ink }}>não abre nada</strong>: o servidor exige as duas, com referência de parecer. Tentar por outro caminho é recusado e registrado.</span>
          </div>
        </div>
        <div>
          <div style={juSecLabel}>Histórico do gate · incidente reportável = relógio de 72h</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 14 }}>
            {trilha.map((h, i) => (
              <div key={i} style={{ display: 'flex', gap: 12 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span style={{ width: 28, height: 28, borderRadius: '50%', background: h.warn ? ju.errBg : ju.lilac2, display: 'grid', placeItems: 'center', flexShrink: 0 }}><CIc n={h.ic} s={14} c={h.warn ? ju.error : ju.primary} /></span>
                  {i < trilha.length - 1 && <span style={{ width: 1, flex: 1, background: ju.g300, marginTop: 2 }} />}
                </div>
                <div style={{ paddingBottom: 14 }}><div style={{ fontSize: 13, color: ju.ink, lineHeight: 1.45 }}>{h.d}</div><div style={{ fontSize: 12, color: ju.g500 }}>{h.t}</div></div>
              </div>
            ))}
          </div>
          <div style={{ background: ju.page, border: `1px solid ${ju.g300}`, borderRadius: 12, padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <CIc n="alarm-clock" s={17} c={ju.warning} />
              <span style={{ fontSize: 13, fontWeight: 700, color: ju.ink }}>Simulado de incidente · 22/05 (exercício)</span>
              <JuBadge text="concluído em 31h" fg={ju.success} bg={ju.successBg} />
            </div>
            <div style={{ height: 12, background: ju.g100, borderRadius: 999, overflow: 'hidden', marginBottom: 7 }}>
              <div style={{ width: '43%', height: '100%', background: `linear-gradient(90deg, ${ju.success}, ${ju.warning})`, borderRadius: 999 }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: ju.g500 }}>
              <span>detecção</span><span style={{ fontWeight: 700, color: ju.ink }}>31h: ANPD + titulares notificados</span><span>limite 72h</span>
            </div>
            <div style={{ fontSize: 12, color: ju.g500, marginTop: 9, lineHeight: 1.5 }}>Incidente classificado como reportável dispara o relógio automaticamente: alertas em D-1, templates de comunicação prontos e cada passo carimbado no AuditLog.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- RoPA & DPO ---------------- */
function JuRopa() {
  return (
    <div style={{ ...juCard, padding: 22 }}>
      <JuHead title="Base legal & RoPA" sub="Registro de Operações de Tratamento (art. 37)" right={<button style={{ display: 'flex', alignItems: 'center', gap: 6, border: 'none', background: ju.primary, color: '#fff', borderRadius: 10, padding: '9px 16px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 13.5, boxShadow: 'var(--shadow-purple)' }}><CIc n="plus" s={16} c="#fff" /> Adicionar operação</button>} />
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 920 }}>
          <thead><tr>
            {['Operação / Finalidade', 'Categorias de dado', 'Titulares', 'Base legal', 'Retenção', 'Compartilhamento'].map(h => <th key={h} style={{ textAlign: 'left', fontSize: 11, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: ju.g500, padding: '0 12px 12px', borderBottom: `1px solid ${ju.g300}`, whiteSpace: 'nowrap' }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {ROPA.map(r => {
              const [bFg, bBg] = LEGAL_TONE[r.base] || [ju.g700, ju.g100];
              return (
                <tr key={r.op} style={{ borderBottom: `1px solid ${ju.g100}` }}>
                  <td style={{ padding: '12px', fontSize: 13.5, fontWeight: 600, color: ju.ink }}>{r.op}</td>
                  <td style={{ padding: '12px', fontSize: 12.5, color: ju.g700 }}>{r.cat}</td>
                  <td style={{ padding: '12px', fontSize: 12.5, color: ju.g700 }}>{r.tit}</td>
                  <td style={{ padding: '12px' }}><JuBadge text={r.base} fg={bFg} bg={bBg} /></td>
                  <td style={{ padding: '12px', fontSize: 12.5, color: ju.g700 }}>{r.ret}</td>
                  <td style={{ padding: '12px', fontSize: 12.5, color: r.share === '—' ? ju.g300 : ju.g700 }}>{r.share}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 18, background: ju.lilac1, border: `1px solid ${ju.lilac2}`, borderRadius: 12, padding: '14px 18px', flexWrap: 'wrap' }}>
        <span style={{ width: 44, height: 44, borderRadius: '50%', background: `linear-gradient(135deg, ${ju.light}, ${ju.deep})`, color: '#fff', fontWeight: 700, fontFamily: 'var(--font-display)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>AC</span>
        <div style={{ flex: 1, minWidth: 180 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: ju.ink }}>André Costa · Encarregado/DPO</div>
          <div style={{ fontSize: 12.5, color: ju.g500 }}>{emailDemo('dpo')} · Encarregado pelo Tratamento de Dados (LGPD, art. 41)</div>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: 6, border: `1px solid ${ju.g300}`, background: '#fff', color: ju.g700, borderRadius: 10, padding: '8px 13px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13 }}><CIc n="pencil" s={14} c={ju.g700} /> Editar</button>
      </div>
    </div>
  );
}

/* ---------------- CONTRACTS & DISPUTES ---------------- */
function JuLegal() {
  const contracts = [
    { l: 'Locação', n: 312, venc: 9, ic: 'key-round' },
    { l: 'Compra e venda', n: 86, venc: 2, ic: 'home' },
    { l: 'Franquia', n: 4, venc: 1, ic: 'store' },
    { l: 'Parceria', n: 24, venc: 2, ic: 'handshake' },
    { l: 'Prestação de serviço', n: 14, venc: 0, ic: 'briefcase' },
  ];
  return (
    <div className="ju-2col">
      <div style={{ ...juCard, padding: 22 }}>
        <JuHead title="Contratos" sub="Modelos, vigência e assinatura eletrônica" right={<JuBadge text="14 a vencer (90d)" fg={ju.warning} bg={ju.warnBg} />} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {contracts.map(c => (
            <div key={c.l} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', background: ju.page, borderRadius: 11 }}>
              <span style={{ width: 34, height: 34, borderRadius: 9, background: ju.lilac2, display: 'grid', placeItems: 'center', flexShrink: 0 }}><CIc n={c.ic} s={17} c={ju.primary} /></span>
              <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600, color: ju.ink }}>{c.l}</span>
              <span style={{ fontSize: 13.5, fontWeight: 700, color: ju.ink }}>{c.n}</span>
              {c.venc > 0 ? <JuBadge text={`${c.venc} a vencer`} fg={ju.warning} bg={ju.warnBg} /> : <span style={{ fontSize: 12, color: ju.success, fontWeight: 600 }}>em dia</span>}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 12, fontSize: 11.5, color: ju.g500 }}><CIc n="info" s={13} c={ju.g500} /> A carteira e o risco da locação ficam em Locação & Garantia.</div>
      </div>
      <div style={{ ...juCard, padding: 22 }}>
        <JuHead title="Disputas & conformidade" sub="Inclui co-corretagem (de Parcerias)" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { t: 'Disputa de comissão', s: 'Parceria Cobertura Boa Viagem · 2 partes', st: 'Em análise' },
            { t: 'Rescisão contestada', s: 'Locação Apto Espinheiro · inquilino', st: 'Em análise' },
          ].map(d => (
            <div key={d.t} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: ju.page, borderRadius: 11 }}>
              <span style={{ width: 34, height: 34, borderRadius: 9, background: ju.errBg, display: 'grid', placeItems: 'center', flexShrink: 0 }}><CIc n="scale" s={17} c={ju.error} /></span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: ju.ink }}>{d.t}</div>
                <div style={{ fontSize: 12, color: ju.g500 }}>{d.s}</div>
              </div>
              <JuBadge text={d.st} fg={ju.warning} bg={ju.warnBg} />
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 14, background: ju.successBg, borderRadius: 11, padding: '12px 14px' }}>
          <CIc n="badge-check" s={18} c={ju.success} />
          <span style={{ flex: 1, fontSize: 13, color: ju.g700 }}>CRECI dos corretores</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: ju.success }}>96% válidos</span>
          <span style={{ fontSize: 12, color: ju.warning, fontWeight: 600 }}>· 4 a regularizar</span>
        </div>
      </div>
    </div>
  );
}

/* ---------------- DRAWER ---------------- */
function JuDrawer({ open, onClose, children, width = 500 }: any) {
  return (
    <React.Fragment>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(28,26,34,.45)', zIndex: 80, opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none', transition: 'opacity .2s ease' }} />
      <div className="ju-drawer" style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width, maxWidth: '100vw', background: '#fff', zIndex: 81, boxShadow: 'var(--shadow-lg)', transform: open ? 'translateX(0)' : 'translateX(100%)', transition: 'transform .26s cubic-bezier(.2,.7,.3,1)', display: 'flex', flexDirection: 'column' }}>
        {open && children}
      </div>
    </React.Fragment>
  );
}

/* ---------------- REQUEST DETAIL ---------------- */
function JuDetail({ req, onClose }: any) {
  if (!req) return null;
  const r = req;
  const [tFg, tBg] = TYPE_TONE[r.tipo];
  const [sFg, sBg] = JU_STATUS[r.status];
  const short = r.prazo != null && r.prazo <= 5;
  return (
    <React.Fragment>
      <div style={{ padding: '20px 24px', borderBottom: `1px solid ${ju.g300}` }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <span style={{ width: 46, height: 46, borderRadius: 11, background: ju.lilac2, display: 'grid', placeItems: 'center', flexShrink: 0 }}><CIc n="user-cog" s={22} c={ju.primary} /></span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: ju.ink, lineHeight: 1.2 }}>{r.titular}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
              <JuBadge text={r.tipo} fg={tFg} bg={tBg} />
              <JuBadge text={r.status} fg={sFg} bg={sBg} />
              {r.prazo != null && <span style={{ fontSize: 12.5, fontWeight: 700, color: short ? ju.error : ju.g500 }}>{r.prazo} dias restantes</span>}
            </div>
          </div>
          <button onClick={onClose} style={{ width: 34, height: 34, border: `1px solid ${ju.g300}`, background: '#fff', borderRadius: 9, display: 'grid', placeItems: 'center', cursor: 'pointer', flexShrink: 0 }}><CIc n="x" s={18} c={ju.g700} /></button>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <button style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, border: 'none', background: ju.success, color: '#fff', borderRadius: 10, padding: '10px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 13.5 }}><CIc n="check" s={16} c="#fff" /> Atender</button>
          <button style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, border: `1px solid ${ju.g300}`, background: '#fff', color: ju.error, borderRadius: 10, padding: '10px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13.5 }}><CIc n="x" s={16} c={ju.error} /> Recusar</button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
        <div style={{ marginBottom: 22 }}>
          <div style={juSecLabel}>Solicitação</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: ju.ink, marginBottom: 8 }}>{r.pedido || `Pedido de ${r.tipo.toLowerCase()}`}</div>
          <div style={{ display: 'flex', gap: 16, fontSize: 12.5, color: ju.g500 }}><span>Entrada: <strong style={{ color: ju.g700 }}>{r.entrada || '—'}</strong></span><span>Canal: <strong style={{ color: ju.g700 }}>{r.canal || r.origem}</strong></span></div>
        </div>

        <div style={{ marginBottom: 22 }}>
          <div style={juSecLabel}>Dados envolvidos</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(r.dados || ['Contato registrado na plataforma']).map((d: any) => (
              <div key={d} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: ju.page, borderRadius: 10, fontSize: 13, color: ju.g700 }}><CIc n="database" s={15} c={ju.primary} /> {d}</div>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 22 }}>
          <div style={juSecLabel}>Análise / base legal</div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: ju.infoBg, borderRadius: 11, padding: '13px 15px', fontSize: 13, color: ju.g700, lineHeight: 1.55 }}>
            <CIc n="scale" s={17} c={ju.info} style={{ marginTop: 1, flexShrink: 0 }} /> {r.analise || 'Em avaliação pelo DPO conforme a base legal aplicável.'}
          </div>
        </div>

        <div>
          <div style={juSecLabel}>Histórico</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {(r.hist || [{ t: 'hoje', d: 'Pedido recebido' }]).map((h: any, i: any, arr: any) => (
              <div key={i} style={{ display: 'flex', gap: 12 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span style={{ width: 28, height: 28, borderRadius: '50%', background: ju.lilac2, display: 'grid', placeItems: 'center', flexShrink: 0 }}><CIc n="circle-dot" s={14} c={ju.primary} /></span>
                  {i < arr.length - 1 && <span style={{ width: 1, flex: 1, background: ju.g300, marginTop: 2 }} />}
                </div>
                <div style={{ paddingBottom: 14 }}><div style={{ fontSize: 13, color: ju.ink }}>{h.d}</div><div style={{ fontSize: 12, color: ju.g500 }}>{h.t}</div></div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, fontSize: 11.5, color: ju.g500 }}><CIc n="scroll-text" s={12} c={ju.g500} /> Ações registradas no AuditLog.</div>
        </div>
      </div>

      <div style={{ padding: '14px 24px', borderTop: `1px solid ${ju.g300}`, display: 'flex', gap: 10 }}>
        <button style={{ flex: 1.4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, border: 'none', background: ju.success, color: '#fff', borderRadius: 10, padding: '11px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 13 }}><CIc n="check" s={15} c="#fff" /> Atender (excluir/anonimizar)</button>
        <button style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, border: `1px solid ${ju.g300}`, background: '#fff', color: ju.g700, borderRadius: 10, padding: '11px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13 }}><CIc n="download" s={15} c={ju.g700} /> Exportar</button>
      </div>
    </React.Fragment>
  );
}

/* ---------------- PERIOD ---------------- */
function JuPeriod() {
  const [p, setP] = useStateJu('Este mês');
  const periods = ['Este mês', 'Trimestre', 'Ano'];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <CIc n="calendar" s={16} c={ju.g500} />
      <div style={{ display: 'flex', background: ju.g100, borderRadius: 999, padding: 3 }}>
        {periods.map(x => <button key={x} onClick={() => setP(x)} style={{ border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, padding: '7px 14px', borderRadius: 999, background: p === x ? '#fff' : 'transparent', color: p === x ? ju.primary : ju.g500, boxShadow: p === x ? 'var(--shadow-sm)' : 'none' }}>{x}</button>)}
      </div>
    </div>
  );
}

/* ---------------- PAGE ---------------- */
function Juridico() {
  const [selected, setSelected] = useStateJu(null);
  return (
    <CeoChrome>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 30, letterSpacing: '-0.02em', margin: 0, color: ju.ink }}>Jurídico &amp; LGPD</h1>
          <div style={{ fontSize: 13.5, color: ju.g500, marginTop: 4 }}>Direitos dos titulares, base legal, contratos e disputas</div>
        </div>
        <JuPeriod />
      </div>

      <JuSummary />
      <JuTable onSelect={setSelected} />
      <JuAccess />
      <JuGateRadar />
      <JuRopa />
      <JuLegal />

      <JuDrawer open={!!selected} onClose={() => setSelected(null)}>
        <JuDetail req={selected} onClose={() => setSelected(null)} />
      </JuDrawer>
    </div>
    </CeoChrome>
  );
}

export default function JuridicoPage() {
  return <Juridico />;
}
