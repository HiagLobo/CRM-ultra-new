"use client";
import * as React from "react";
import CeoChrome, { ceoPalette, CIc } from "@/components/ceo/CeoChrome";
import { demo } from "@/config/demo";
const { useState } = React;

const fc: any = {
  ...ceoPalette,
  info: '#3E82E0', infoBg: '#E5EEFB',
  successBg: '#E6F4EC', warnBg: '#FBF1DC', errBg: '#FAE5E5',
  p3: '#818CF8', p3bg: '#E0E7FF',
};
const fcCard = { background: '#fff', border: `1px solid ${fc.g300}`, borderRadius: 16 };

function FcBadge({ text, fg, bg, ic }: any) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: fg, background: bg, borderRadius: 999, padding: '3px 10px', whiteSpace: 'nowrap' }}>
      {ic && <CIc n={ic} s={12} c={fg} />}{text}
    </span>
  );
}
function FcHead({ title, sub, right }: any) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
      <div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: fc.ink }}>{title}</div>
        {sub && <div style={{ fontSize: 13, color: fc.g500, marginTop: 2 }}>{sub}</div>}
      </div>
      {right}
    </div>
  );
}
const th: React.CSSProperties = { textAlign: 'left', fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: fc.g500, padding: '10px 14px', borderBottom: `1px solid ${fc.g100}`, whiteSpace: 'nowrap' };
const td: React.CSSProperties = { padding: '13px 14px', fontSize: 13.5, color: fc.g700, borderBottom: `1px solid ${fc.g100}`, verticalAlign: 'middle' };

const ETAPAS = ['Proposta aceita', 'Documentação', 'Crédito & garantia', 'Contrato', 'Assinatura'];
const ETAPA_TONE: any = {
  'Proposta aceita': [fc.info, fc.infoBg],
  'Documentação': [fc.p3, fc.p3bg],
  'Crédito & garantia': [fc.warning, fc.warnBg],
  'Contrato': [fc.primary, fc.lilac2],
  'Assinatura': [fc.success, fc.successBg],
};

/* ---------------- DATA ---------------- */
const NEGOCIOS: any[] = [
  {
    id: 'n1', cliente: 'Mariana Alves', imovel: 'Cobertura · Boa Viagem', ref: `${demo.sigla}-1300`, tipo: 'Venda',
    valor: 'R$ 1.380.000', etapa: 'Documentação', resp: `Equipe ${demo.nomeCurto} · Paula R.`, corretor: 'Lucas Ferreira', dias: 4, saude: 'No prazo',
    comissao: 'R$ 82.800 (6%) · corretor 60%: R$ 49.680',
    docs: [
      { d: 'Matrícula atualizada do imóvel', ok: true },
      { d: 'Certidões do vendedor (5)', ok: true },
      { d: 'Comprovante de renda do comprador', ok: false, nota: 'solicitado ontem, IA cobrou no WhatsApp hoje 09:00' },
      { d: 'ITBI: guia emitida', ok: false },
    ],
    timeline: [
      { t: '07/06', d: `Proposta aceita pelo proprietário, o negócio passou do corretor para o time da ${demo.nomeCurto}`, ic: 'badge-check', ok: true },
      { t: '08/06', d: 'Checklist de documentação aberto · 2 de 4 itens recebidos', ic: 'clipboard-list' },
      { t: '10/06', d: 'IA lembrou o comprador dos documentos pendentes (template oficial)', ic: 'bot' },
    ],
  },
  {
    id: 'n2', cliente: 'Fernanda Souza', imovel: 'Apto 2q · Pina', ref: `${demo.sigla}-1150`, tipo: 'Venda',
    valor: 'R$ 520.000', etapa: 'Crédito & garantia', resp: `Equipe ${demo.nomeCurto} · Diego M.`, corretor: 'Renata Alves', dias: 9, saude: 'Atenção',
    comissao: 'R$ 31.200 (6%) · corretor 60%: R$ 18.720',
    docs: [
      { d: 'Documentação completa', ok: true },
      { d: 'Análise de crédito (financiamento CEF)', ok: false, nota: 'banco pediu complemento de renda · 3º dia aguardando' },
    ],
    timeline: [
      { t: '02/06', d: 'Proposta aceita · entrada de R$ 120 mil + financiamento', ic: 'badge-check', ok: true },
      { t: '04/06', d: 'Dossiê enviado ao banco (CEF)', ic: 'landmark' },
      { t: '08/06', d: 'Banco solicitou complemento, prazo estimado +5 dias úteis', ic: 'alarm-clock', warn: true },
    ],
  },
  {
    id: 'n3', cliente: 'Tech Soluções Ltda', imovel: 'Sala comercial · Ilha do Leite', ref: `${demo.sigla}-0972`, tipo: 'Locação',
    valor: 'R$ 5.500/mês', etapa: 'Contrato', resp: `Equipe ${demo.nomeCurto} · Paula R.`, corretor: 'Bruno Tavares', dias: 6, saude: 'No prazo',
    comissao: '1º aluguel · corretor 60%: R$ 3.300',
    docs: [
      { d: 'Sindicância do locatário (CNPJ)', ok: true },
      { d: 'Seguro-fiança do parceiro aprovado, score 812', ok: true },
      { d: 'Minuta de contrato em revisão jurídica', ok: false, nota: 'jurídico devolve até amanhã' },
    ],
    timeline: [
      { t: '05/06', d: 'Proposta de locação aceita · seguro-fiança do parceiro escolhido', ic: 'badge-check', ok: true },
      { t: '06/06', d: 'Análise de crédito aprovada (Serasa) · score 812', ic: 'gauge', ok: true },
      { t: '09/06', d: 'Minuta gerada e enviada ao jurídico', ic: 'scale' },
    ],
  },
  {
    id: 'n4', cliente: 'Carlos Mendes', imovel: 'Casa · Candeias', ref: `${demo.sigla}-1411`, tipo: 'Venda',
    valor: 'R$ 890.000', etapa: 'Assinatura', resp: `Equipe ${demo.nomeCurto} · Diego M.`, corretor: 'Lucas Ferreira', dias: 14, saude: 'No prazo',
    comissao: 'R$ 53.400 (6%) · corretor 60%: R$ 32.040',
    docs: [{ d: 'Tudo pronto, aguardando assinatura digital das partes (2 de 3 assinaram)', ok: false, nota: 'falta o vendedor · lembrete automático enviado' }],
    timeline: [
      { t: '28/05', d: 'Proposta aceita', ic: 'badge-check', ok: true },
      { t: '09/06', d: 'Contrato liberado para assinatura digital (3 partes)', ic: 'pen-line' },
      { t: '10/06', d: 'Comprador e cônjuge assinaram · falta o vendedor', ic: 'clock', warn: true },
    ],
  },
  {
    id: 'n5', cliente: 'Juliana Castro', imovel: 'Apto 3q · Graças', ref: `${demo.sigla}-1287`, tipo: 'Venda',
    valor: 'R$ 760.000', etapa: 'Proposta aceita', resp: 'a atribuir', corretor: 'Renata Alves', dias: 0, saude: 'Novo',
    comissao: 'R$ 45.600 (6%) · corretor 60%: R$ 27.360',
    docs: [{ d: 'Checklist será aberto ao atribuir responsável', ok: false }],
    timeline: [{ t: 'hoje 10:15', d: 'Proposta aceita, entrou na fila de fechamento', ic: 'badge-check', ok: true }],
  },
];

const SAUDE_TONE: any = { 'No prazo': [fc.success, fc.successBg], 'Atenção': [fc.warning, fc.warnBg], 'Travado': [fc.error, fc.errBg], 'Novo': [fc.info, fc.infoBg] };

/* ---------------- SUMMARY ---------------- */
function FcSummary() {
  const cards = [
    { l: 'Em fechamento agora', v: '7', d: 'R$ 4,9 mi em negociação', ic: 'briefcase', hl: true },
    { l: 'Tempo médio até assinar', v: '18 dias', d: 'meta: 21 dias', ic: 'timer', good: true },
    { l: 'Assinados no mês', v: '11', d: 'R$ 6,2 mi · 9 vendas, 2 locações', ic: 'pen-line' },
    { l: 'Conversão proposta→contrato', v: '84%', d: '+6 p.p. vs. maio', ic: 'trending-up', good: true },
    { l: 'Aguardando atribuição', v: '1', d: 'entrou hoje', ic: 'user-plus' },
    { l: 'Travados > 7 dias', v: '1', d: 'financiamento CEF', ic: 'alert-triangle' },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(172px, 1fr))', gap: 14 }}>
      {cards.map((c) => (
        <div key={c.l} style={{ background: c.hl ? `linear-gradient(135deg, ${fc.primary}, ${fc.deep})` : '#fff', border: c.hl ? 'none' : `1px solid ${fc.g300}`, borderRadius: 16, padding: 18, boxShadow: c.hl ? 'var(--shadow-purple)' : 'none', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: c.hl ? 'rgba(255,255,255,.85)' : fc.g500, lineHeight: 1.3 }}>{c.l}</span>
            <span style={{ width: 30, height: 30, borderRadius: 8, background: c.hl ? 'rgba(255,255,255,.18)' : fc.lilac2, display: 'grid', placeItems: 'center', flexShrink: 0 }}><CIc n={c.ic} s={15} c={c.hl ? '#fff' : fc.primary} /></span>
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, lineHeight: 1.15, color: c.hl ? '#fff' : fc.ink, marginTop: 14, letterSpacing: '-0.01em' }}>{c.v}</div>
          <div style={{ fontSize: 11.5, color: c.hl ? 'rgba(255,255,255,.7)' : c.good ? fc.success : fc.g500, marginTop: 9, fontWeight: c.good ? 700 : 400 }}>{c.d}</div>
        </div>
      ))}
    </div>
  );
}

/* ---------------- PIPELINE ---------------- */
function FcPipeline() {
  const counts: any = { 'Proposta aceita': 1, 'Documentação': 2, 'Crédito & garantia': 2, 'Contrato': 1, 'Assinatura': 1 };
  return (
    <div style={{ ...fcCard, padding: 22 }}>
      <FcHead title="Esteira de fechamento" sub={`Da proposta aceita à assinatura, conduzida pelo time da ${demo.nomeCurto}, nunca pelo corretor`} />
      <div style={{ display: 'flex', gap: 0, overflowX: 'auto', paddingBottom: 4 }}>
        {ETAPAS.map((e, i) => {
          const [fg, bg] = ETAPA_TONE[e];
          return (
            <div key={e} style={{ flex: 1, minWidth: 150, position: 'relative' }}>
              <div style={{ margin: '0 6px', background: bg, border: `1px solid ${fg}22`, borderRadius: 12, padding: '14px 14px 12px', textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 26, color: fg }}>{counts[e]}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: fc.g700, marginTop: 2, lineHeight: 1.25 }}>{e}</div>
              </div>
              {i < ETAPAS.length - 1 && (
                <span style={{ position: 'absolute', right: -7, top: '50%', transform: 'translateY(-50%)', zIndex: 2, background: '#fff', borderRadius: '50%', width: 22, height: 22, display: 'grid', placeItems: 'center', border: `1px solid ${fc.g300}` }}>
                  <CIc n="chevron-right" s={13} c={fc.g500} />
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- TABELA DE NEGÓCIOS ---------------- */
function FcNegocios() {
  const [etapa, setEtapa] = useState('Todas');
  const [openId, setOpenId] = useState<string | null>('n1');
  const tabs = ['Todas', ...ETAPAS];
  const rows = NEGOCIOS.filter((r) => etapa === 'Todas' || r.etapa === etapa);
  return (
    <div style={{ ...fcCard, padding: 22 }}>
      <FcHead title="Negócios em fechamento" sub="Clique para abrir o dossiê: checklist, partes e linha do tempo" />
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
        {tabs.map((x) => (
          <button key={x} onClick={() => setEtapa(x)} style={{ border: `1px solid ${etapa === x ? fc.primary : fc.g300}`, cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: 600, padding: '6px 14px', borderRadius: 999, background: etapa === x ? fc.primary : '#fff', color: etapa === x ? '#fff' : fc.g700 }}>{x}</button>
        ))}
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 820 }}>
          <thead><tr>
            <th style={th}>Cliente / imóvel</th><th style={th}>Tipo</th><th style={th}>Valor</th><th style={th}>Etapa</th><th style={th}>Responsável da rede</th><th style={th}>Dias</th><th style={th}>Saúde</th>
          </tr></thead>
          <tbody>
            {rows.map((r) => {
              const [efg, ebg] = ETAPA_TONE[r.etapa];
              const [sfg, sbg] = SAUDE_TONE[r.saude];
              const open = openId === r.id;
              return (
                <React.Fragment key={r.id}>
                  <tr onClick={() => setOpenId(open ? null : r.id)} style={{ cursor: 'pointer', background: open ? fc.lilac1 : 'transparent' }}
                    onMouseEnter={(e) => { if (!open) (e.currentTarget as HTMLTableRowElement).style.background = fc.lilac1; }}
                    onMouseLeave={(e) => { if (!open) (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'; }}>
                    <td style={td}>
                      <div style={{ fontWeight: 700, color: fc.ink }}>{r.cliente}</div>
                      <div style={{ fontSize: 12, color: fc.g500 }}>{r.imovel} · <span style={{ fontWeight: 600 }}>{r.ref}</span></div>
                    </td>
                    <td style={td}><FcBadge text={r.tipo} fg={r.tipo === 'Venda' ? fc.primary : fc.info} bg={r.tipo === 'Venda' ? fc.lilac2 : fc.infoBg} /></td>
                    <td style={{ ...td, fontWeight: 700, color: fc.ink, whiteSpace: 'nowrap' }}>{r.valor}</td>
                    <td style={td}><FcBadge text={r.etapa} fg={efg} bg={ebg} /></td>
                    <td style={td}>{r.resp}</td>
                    <td style={{ ...td, fontWeight: 700, color: r.dias > 7 ? fc.warning : fc.ink }}>{r.dias}d</td>
                    <td style={td}><FcBadge text={r.saude} fg={sfg} bg={sbg} /></td>
                  </tr>
                  {open && (
                    <tr><td colSpan={7} style={{ padding: 0, borderBottom: `1px solid ${fc.g100}` }}>
                      <div className="fc-detail" style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1.1fr) minmax(260px, 1fr)', background: fc.lilac1 }}>
                        {/* checklist */}
                        <div style={{ padding: '18px 22px', borderRight: `1px solid ${fc.g300}` }}>
                          <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: fc.g500, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <CIc n="clipboard-list" s={13} c={fc.g500} /> Checklist do dossiê
                          </div>
                          {r.docs.map((d: any, i: number) => (
                            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10 }}>
                              <span style={{ width: 22, height: 22, borderRadius: 7, flexShrink: 0, background: d.ok ? fc.successBg : '#fff', border: `1px solid ${d.ok ? fc.success : fc.g300}`, display: 'grid', placeItems: 'center', marginTop: 1 }}>
                                <CIc n={d.ok ? 'check' : 'minus'} s={13} c={d.ok ? fc.success : fc.g500} />
                              </span>
                              <div>
                                <div style={{ fontSize: 13, color: d.ok ? fc.g500 : fc.ink, fontWeight: d.ok ? 400 : 600, textDecoration: d.ok ? 'line-through' : 'none', lineHeight: 1.4 }}>{d.d}</div>
                                {d.nota && <div style={{ fontSize: 11.5, color: fc.warning, fontWeight: 600, marginTop: 2 }}>{d.nota}</div>}
                              </div>
                            </div>
                          ))}
                          <div style={{ marginTop: 14, padding: '9px 13px', background: '#fff', border: `1px solid ${fc.g300}`, borderRadius: 10, fontSize: 12.5, color: fc.g700, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <CIc n="hand-coins" s={14} c={fc.primary} />
                            <span><b style={{ color: fc.ink }}>Comissão ao fechar:</b> {r.comissao}</span>
                          </div>
                        </div>
                        {/* timeline */}
                        <div style={{ padding: '18px 22px' }}>
                          <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: fc.g500, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <CIc n="history" s={13} c={fc.g500} /> Linha do tempo
                          </div>
                          {r.timeline.map((t: any, i: number) => (
                            <div key={i} style={{ display: 'flex', gap: 11, marginBottom: i < r.timeline.length - 1 ? 13 : 0 }}>
                              <span style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0, background: t.warn ? fc.warnBg : t.ok ? fc.successBg : '#fff', border: `1px solid ${t.warn ? fc.warning : t.ok ? fc.success : fc.g300}`, display: 'grid', placeItems: 'center' }}>
                                <CIc n={t.ic} s={14} c={t.warn ? fc.warning : t.ok ? fc.success : fc.g700} />
                              </span>
                              <div>
                                <div style={{ fontSize: 12.5, color: fc.ink, lineHeight: 1.4 }}>{t.d}</div>
                                <div style={{ fontSize: 11, color: fc.g500, marginTop: 2 }}>{t.t}</div>
                              </div>
                            </div>
                          ))}
                          <div style={{ marginTop: 14, fontSize: 12, color: fc.g500, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <CIc n="user" s={12} c={fc.g500} /> Corretor de origem: <b style={{ color: fc.g700 }}>{r.corretor}</b>, acompanha pelo painel dele, sem conduzir o contrato
                          </div>
                          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                            <button style={{ border: 'none', cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12.5, color: '#fff', background: fc.primary, borderRadius: 9, padding: '8px 14px' }}>Avançar etapa</button>
                            <button style={{ border: `1px solid ${fc.g300}`, cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12.5, color: fc.g700, background: '#fff', borderRadius: 9, padding: '8px 14px' }}>Abrir conversa</button>
                          </div>
                        </div>
                      </div>
                    </td></tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------------- ASSINATURAS PENDENTES ---------------- */
function FcAssinaturas() {
  const itens = [
    { quem: 'Carlos Mendes (Casa Candeias)', falta: 'Vendedor (Sr. Otávio)', enviado: '09/06', lembrete: 'hoje 08:00' },
    { quem: 'Locação (Sala Ilha do Leite)', falta: 'Fiador digital do parceiro (auto)', enviado: '10/06', lembrete: '—' },
  ];
  return (
    <div style={{ ...fcCard, padding: 22 }}>
      <FcHead title="Assinaturas pendentes" sub="Contratos liberados aguardando assinatura digital" right={<FcBadge text="2 documentos" fg={fc.primary} bg={fc.lilac2} ic="pen-line" />} />
      {itens.map((a, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 4px', borderBottom: i < itens.length - 1 ? `1px solid ${fc.g100}` : 'none', flexWrap: 'wrap' }}>
          <span style={{ width: 34, height: 34, borderRadius: 10, background: fc.warnBg, display: 'grid', placeItems: 'center', flexShrink: 0 }}><CIc n="pen-line" s={16} c={fc.warning} /></span>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: fc.ink }}>{a.quem}</div>
            <div style={{ fontSize: 12, color: fc.g500, marginTop: 2 }}>Falta: <b style={{ color: fc.g700 }}>{a.falta}</b> · enviado {a.enviado} · último lembrete {a.lembrete}</div>
          </div>
          <button style={{ border: `1px solid ${fc.g300}`, cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12, color: fc.g700, background: '#fff', borderRadius: 8, padding: '6px 12px' }}>Reenviar lembrete</button>
        </div>
      ))}
    </div>
  );
}

/* ---------------- POR QUE TRAVA ---------------- */
function FcGargalos() {
  const itens = [
    { l: 'Financiamento bancário', v: 42, c: fc.warning },
    { l: 'Documentação das partes', v: 28, c: fc.info },
    { l: 'Revisão jurídica', v: 16, c: fc.p3 },
    { l: 'Assinatura pendente', v: 14, c: fc.g500 },
  ];
  const max = Math.max(...itens.map((m) => m.v));
  return (
    <div style={{ ...fcCard, padding: 22 }}>
      <FcHead title="Onde os fechamentos demoram" sub="Dias parados por causa nos últimos 90 dias" />
      {itens.map((m) => (
        <div key={m.l} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 11 }}>
          <span style={{ width: 168, fontSize: 12.5, color: fc.g700, flexShrink: 0, lineHeight: 1.25 }}>{m.l}</span>
          <div style={{ flex: 1, height: 10, background: fc.g100, borderRadius: 999, overflow: 'hidden' }}>
            <div style={{ width: `${(m.v / max) * 100}%`, height: '100%', background: m.c, borderRadius: 999 }} />
          </div>
          <span style={{ width: 40, fontSize: 12.5, fontWeight: 700, color: fc.ink, textAlign: 'right' }}>{m.v}%</span>
        </div>
      ))}
      <div style={{ marginTop: 14, padding: '10px 14px', background: fc.lilac1, border: `1px solid ${fc.lilac2}`, borderRadius: 10, fontSize: 12.5, color: fc.g700, display: 'flex', alignItems: 'center', gap: 8 }}>
        <CIc n="lightbulb" s={14} c={fc.primary} />
        A IA cobra documentos e lembra assinaturas automaticamente pelo WhatsApp, sem ninguém precisar lembrar.
      </div>
    </div>
  );
}

/* ---------------- PAGE ---------------- */
export default function CeoFechamentosPage() {
  return (
    <CeoChrome>
      <style>{`@media (max-width: 920px){ .fc-detail { grid-template-columns: 1fr !important; } .fc-detail > div:first-child { border-right: none !important; border-bottom: 1px solid ${fc.g300}; } }`}</style>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 30, letterSpacing: '-0.02em', margin: 0, color: fc.ink }}>Fechamentos</h1>
            <div style={{ fontSize: 13.5, color: fc.g500, marginTop: 4 }}>Rede inteira · da proposta aceita à assinatura, conduzido pelo time da {demo.nomeCurto}</div>
          </div>
          <FcBadge text="R$ 4,9 mi em negociação" fg={fc.primary} bg={fc.lilac2} ic="briefcase" />
        </div>

        <FcSummary />
        <FcPipeline />
        <FcNegocios />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 18 }}>
          <FcAssinaturas />
          <FcGargalos />
        </div>
      </div>
    </CeoChrome>
  );
}
