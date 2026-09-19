"use client";
import * as React from "react";
import CeoChrome, { ceoPalette, CIc } from "@/components/ceo/CeoChrome";
import { demo } from "@/config/demo";
const { useState } = React;

const cd: any = {
  ...ceoPalette,
  info: '#3E82E0', infoBg: '#E5EEFB',
  successBg: '#E6F4EC', warnBg: '#FBF1DC', errBg: '#FAE5E5',
  p3: '#818CF8', p3bg: '#E0E7FF',
};
const cdCard = { background: '#fff', border: `1px solid ${cd.g300}`, borderRadius: 16 };

function CdBadge({ text, fg, bg, ic }: any) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: fg, background: bg, borderRadius: 999, padding: '3px 10px', whiteSpace: 'nowrap' }}>
      {ic && <CIc n={ic} s={12} c={fg} />}{text}
    </span>
  );
}
function CdHead({ title, sub, right }: any) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
      <div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: cd.ink }}>{title}</div>
        {sub && <div style={{ fontSize: 13, color: cd.g500, marginTop: 2 }}>{sub}</div>}
      </div>
      {right}
    </div>
  );
}
const th: React.CSSProperties = { textAlign: 'left', fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: cd.g500, padding: '10px 14px', borderBottom: `1px solid ${cd.g100}`, whiteSpace: 'nowrap' };
const td: React.CSSProperties = { padding: '13px 14px', fontSize: 13.5, color: cd.g700, borderBottom: `1px solid ${cd.g100}`, verticalAlign: 'middle' };
const btnP: React.CSSProperties = { border: 'none', cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12.5, color: '#fff', background: cd.primary, borderRadius: 9, padding: '8px 14px' };
const btnO: React.CSSProperties = { border: `1px solid ${cd.g300}`, cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12.5, color: cd.g700, background: '#fff', borderRadius: 9, padding: '8px 14px' };

const ETAPAS = ['Pré-cadastro', 'Documentos', 'CRECI', 'Entrevista', 'Aprovação'];
const ST_TONE: any = {
  'Pronto p/ aprovar': [cd.success, cd.successBg],
  'Docs pendentes': [cd.warning, cd.warnBg],
  'Divergência CRECI': [cd.error, cd.errBg],
  'Entrevista marcada': [cd.info, cd.infoBg],
  'Pré-cadastro': [cd.g700, cd.g100],
};

/* ---------------- DATA ---------------- */
const CANDIDATOS: any[] = [
  {
    id: 'k1', nome: 'Joana Reis', cidade: 'Recife/PE', unidade: `${demo.nomeCurto} Boa Viagem`, origem: 'Indicação do franqueado',
    status: 'Pronto p/ aprovar', etapa: 5, dias: 6, creci: 'CRECI-PE 00000-F · validado',
    docs: [
      { d: 'Documento de identidade (frente/verso)', ok: true },
      { d: 'Comprovante de residência', ok: true },
      { d: 'Carteirinha CRECI vigente', ok: true },
    ],
    timeline: [
      { t: '05/06', d: `Indicada pelo franqueado da ${demo.nomeCurto} Boa Viagem (Bruno T.) — vínculo de unidade fixado`, ic: 'building-2' },
      { t: '06/06', d: 'Documentos enviados pelo link seguro · 3/3 aceitos', ic: 'file-check-2', ok: true },
      { t: '08/06', d: 'CRECI validado junto ao Conselho — nome e situação ativos', ic: 'id-card', ok: true },
      { t: '10/06', d: 'Entrevista com gestor concluída — parecer positivo', ic: 'video', ok: true },
    ],
    assento: `${demo.nomeCurto} Boa Viagem: 2 assentos livres de 40 — aprovação consome 1`,
  },
  {
    id: 'k2', nome: 'Marcos Lima', cidade: 'Caruaru/PE', unidade: `${demo.nomeCurto} Caruaru`, origem: 'Site (quero ser corretor)',
    status: 'Docs pendentes', etapa: 2, dias: 4, creci: 'CRECI-PE 00000-F · aguardando docs',
    docs: [
      { d: 'Documento de identidade', ok: true },
      { d: 'Comprovante de residência', ok: false, nota: 'reenvio solicitado — foto ilegível · IA cobrou ontem pelo WhatsApp' },
      { d: 'Carteirinha CRECI vigente', ok: true },
    ],
    timeline: [
      { t: '07/06', d: 'Pré-cadastro pelo site · região: Caruaru', ic: 'globe' },
      { t: '08/06', d: 'Documentos: 2/3 aceitos · comprovante ilegível', ic: 'file-x-2', warn: true },
      { t: '10/06', d: 'Lembrete automático de reenvio (WhatsApp oficial)', ic: 'bot' },
    ],
    assento: `${demo.nomeCurto} Caruaru: 5 assentos livres de 20`,
  },
  {
    id: 'k3', nome: 'Helena Rocha', cidade: 'Recife/PE', unidade: `${demo.nomeCurto} Recife Centro`, origem: 'Indicação de corretor (Renata A.)',
    status: 'Divergência CRECI', etapa: 3, dias: 8, creci: 'CRECI-PE 00000-F · divergência de nome',
    docs: [
      { d: 'Documento de identidade', ok: true },
      { d: 'Comprovante de residência', ok: true },
      { d: 'Carteirinha CRECI vigente', ok: true },
    ],
    timeline: [
      { t: '03/06', d: 'Indicada por Renata A. (bônus de indicação no Score se aprovada)', ic: 'users' },
      { t: '05/06', d: 'Docs completos · 3/3 aceitos', ic: 'file-check-2', ok: true },
      { t: '09/06', d: 'Conselho retorna "Helena R. da Silva" × cadastro "Helena Rocha" — análise manual', ic: 'alert-triangle', warn: true },
    ],
    assento: `${demo.nomeCurto} Recife Centro: 1 assento livre de 30`,
  },
  {
    id: 'k4', nome: 'Felipe Andrade', cidade: 'Olinda/PE', unidade: `${demo.nomeCurto} Olinda`, origem: 'Site (quero ser corretor)',
    status: 'Entrevista marcada', etapa: 4, dias: 5, creci: 'CRECI-PE 00000-F · validado',
    docs: [{ d: 'Documentação completa', ok: true }],
    timeline: [
      { t: '06/06', d: 'Pré-cadastro + docs no mesmo dia', ic: 'zap', ok: true },
      { t: '09/06', d: 'CRECI validado', ic: 'id-card', ok: true },
      { t: '12/06', d: 'Entrevista agendada — Google Meet, amanhã 10h (convite enviado)', ic: 'video' },
    ],
    assento: `${demo.nomeCurto} Olinda: 8 assentos livres de 20`,
  },
  {
    id: 'k5', nome: 'Patrícia Gomes', cidade: 'Jaboatão/PE', unidade: '— a definir —', origem: 'Site (quero ser corretor)',
    status: 'Pré-cadastro', etapa: 1, dias: 1, creci: 'não informado ainda',
    docs: [{ d: 'Aguardando envio de documentos (link expira em 7 dias)', ok: false }],
    timeline: [{ t: 'ontem 18:22', d: `Pré-cadastro pelo site · sem unidade na região — sugerir ${demo.nomeCurto} Recife Centro`, ic: 'globe' }],
    assento: 'definir unidade antes da aprovação',
  },
];

const ORIGENS = [
  { l: 'Site (quero ser corretor)', v: 46, c: cd.primary },
  { l: 'Indicação de franqueado', v: 28, c: cd.p3 },
  { l: 'Indicação de corretor', v: 18, c: cd.info },
  { l: 'Eventos & parcerias', v: 8, c: cd.warning },
];

const ASSENTOS = [
  { u: `${demo.nomeCurto} Boa Viagem`, usado: 38, total: 40 },
  { u: `${demo.nomeCurto} Recife Centro`, usado: 29, total: 30 },
  { u: `${demo.nomeCurto} Caruaru`, usado: 15, total: 20 },
  { u: `${demo.nomeCurto} Olinda`, usado: 12, total: 20 },
];

/* ---------------- SUMMARY ---------------- */
function CdSummary() {
  const cards = [
    { l: 'Candidatos em análise', v: '5', d: '1 pronto p/ aprovar', ic: 'user-plus', hl: true },
    { l: 'Aprovados no mês', v: '7', d: 'tempo médio: 9 dias', ic: 'badge-check', good: true },
    { l: 'Docs pendentes', v: '2', d: 'IA cobra reenvio sozinha', ic: 'file-clock' },
    { l: 'Divergências CRECI', v: '1', d: 'análise manual', ic: 'alert-triangle' },
    { l: 'Assentos livres na rede', v: '16', d: 'de 110 contratados', ic: 'armchair' },
    { l: 'Desistências (90d)', v: '12%', d: 'maioria na etapa de docs', ic: 'user-minus' },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(172px, 1fr))', gap: 14 }}>
      {cards.map((c) => (
        <div key={c.l} style={{ background: c.hl ? `linear-gradient(135deg, ${cd.primary}, ${cd.deep})` : '#fff', border: c.hl ? 'none' : `1px solid ${cd.g300}`, borderRadius: 16, padding: 18, boxShadow: c.hl ? 'var(--shadow-purple)' : 'none', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: c.hl ? 'rgba(255,255,255,.85)' : cd.g500, lineHeight: 1.3 }}>{c.l}</span>
            <span style={{ width: 30, height: 30, borderRadius: 8, background: c.hl ? 'rgba(255,255,255,.18)' : cd.lilac2, display: 'grid', placeItems: 'center', flexShrink: 0 }}><CIc n={c.ic} s={15} c={c.hl ? '#fff' : cd.primary} /></span>
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, lineHeight: 1.15, color: c.hl ? '#fff' : cd.ink, marginTop: 14, letterSpacing: '-0.01em' }}>{c.v}</div>
          <div style={{ fontSize: 11.5, color: c.hl ? 'rgba(255,255,255,.7)' : c.good ? cd.success : cd.g500, marginTop: 9, fontWeight: c.good ? 700 : 400 }}>{c.d}</div>
        </div>
      ))}
    </div>
  );
}

/* ---------------- TABELA ---------------- */
function CdTabela() {
  const [openId, setOpenId] = useState<string | null>('k1');
  return (
    <div style={{ ...cdCard, padding: 22 }}>
      <CdHead title="Candidatos" sub="Do pré-cadastro à aprovação — clique para abrir o dossiê"
        right={<CdBadge text="aprovar consome 1 assento da unidade" fg={cd.warning} bg={cd.warnBg} ic="armchair" />} />
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 840 }}>
          <thead><tr>
            <th style={th}>Candidato</th><th style={th}>Unidade destino</th><th style={th}>Origem</th><th style={th}>Progresso</th><th style={th}>Dias</th><th style={th}>Status</th><th style={th}></th>
          </tr></thead>
          <tbody>
            {CANDIDATOS.map((r) => {
              const [sfg, sbg] = ST_TONE[r.status];
              const open = openId === r.id;
              const pronto = r.status === 'Pronto p/ aprovar';
              return (
                <React.Fragment key={r.id}>
                  <tr onClick={() => setOpenId(open ? null : r.id)} style={{ cursor: 'pointer', background: open ? cd.lilac1 : 'transparent' }}
                    onMouseEnter={(e) => { if (!open) (e.currentTarget as HTMLTableRowElement).style.background = cd.lilac1; }}
                    onMouseLeave={(e) => { if (!open) (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'; }}>
                    <td style={td}>
                      <div style={{ fontWeight: 700, color: cd.ink }}>{r.nome}</div>
                      <div style={{ fontSize: 12, color: cd.g500 }}>{r.cidade} · {r.creci}</div>
                    </td>
                    <td style={td}>{r.unidade}</td>
                    <td style={{ ...td, fontSize: 12.5 }}>{r.origem}</td>
                    <td style={td}>
                      <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                        {ETAPAS.map((e, i) => (
                          <span key={e} title={e} style={{ width: 22, height: 7, borderRadius: 999, background: i < r.etapa ? cd.primary : cd.g100 }} />
                        ))}
                      </div>
                      <div style={{ fontSize: 11, color: cd.g500, marginTop: 4 }}>{ETAPAS[r.etapa - 1]}</div>
                    </td>
                    <td style={{ ...td, fontWeight: 700, color: r.dias > 7 ? cd.warning : cd.ink }}>{r.dias}d</td>
                    <td style={td}><CdBadge text={r.status} fg={sfg} bg={sbg} /></td>
                    <td style={{ ...td, textAlign: 'right' }}>
                      <button onClick={(e) => e.stopPropagation()} style={pronto ? { ...btnP, padding: '7px 14px', fontSize: 12 } : { ...btnO, padding: '7px 14px', fontSize: 12, color: cd.primary }}>
                        {pronto ? 'Aprovar' : 'Abrir'}
                      </button>
                    </td>
                  </tr>
                  {open && (
                    <tr><td colSpan={7} style={{ padding: 0, borderBottom: `1px solid ${cd.g100}` }}>
                      <div className="cd-detail" style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) minmax(280px, 1fr)', background: cd.lilac1 }}>
                        <div style={{ padding: '18px 22px', borderRight: `1px solid ${cd.g300}` }}>
                          <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: cd.g500, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <CIc n="clipboard-list" s={13} c={cd.g500} /> Documentos
                          </div>
                          {r.docs.map((d: any, i: number) => (
                            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10 }}>
                              <span style={{ width: 22, height: 22, borderRadius: 7, flexShrink: 0, background: d.ok ? cd.successBg : '#fff', border: `1px solid ${d.ok ? cd.success : cd.g300}`, display: 'grid', placeItems: 'center', marginTop: 1 }}>
                                <CIc n={d.ok ? 'check' : 'minus'} s={13} c={d.ok ? cd.success : cd.g500} />
                              </span>
                              <div>
                                <div style={{ fontSize: 13, color: d.ok ? cd.g500 : cd.ink, fontWeight: d.ok ? 400 : 600, lineHeight: 1.4 }}>{d.d}</div>
                                {d.nota && <div style={{ fontSize: 11.5, color: cd.warning, fontWeight: 600, marginTop: 2 }}>{d.nota}</div>}
                              </div>
                            </div>
                          ))}
                          <div style={{ marginTop: 14, padding: '9px 13px', background: '#fff', border: `1px solid ${cd.g300}`, borderRadius: 10, fontSize: 12.5, color: cd.g700, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                            <CIc n="armchair" s={14} c={cd.primary} style={{ marginTop: 1 }} />
                            <span>{r.assento}</span>
                          </div>
                        </div>
                        <div style={{ padding: '18px 22px' }}>
                          <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: cd.g500, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <CIc n="history" s={13} c={cd.g500} /> Linha do tempo
                          </div>
                          {r.timeline.map((t: any, i: number) => (
                            <div key={i} style={{ display: 'flex', gap: 11, marginBottom: i < r.timeline.length - 1 ? 13 : 0 }}>
                              <span style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0, background: t.warn ? cd.warnBg : t.ok ? cd.successBg : '#fff', border: `1px solid ${t.warn ? cd.warning : t.ok ? cd.success : cd.g300}`, display: 'grid', placeItems: 'center' }}>
                                <CIc n={t.ic} s={14} c={t.warn ? cd.warning : t.ok ? cd.success : cd.g700} />
                              </span>
                              <div>
                                <div style={{ fontSize: 12.5, color: cd.ink, lineHeight: 1.4 }}>{t.d}</div>
                                <div style={{ fontSize: 11, color: cd.g500, marginTop: 2 }}>{t.t}</div>
                              </div>
                            </div>
                          ))}
                          <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
                            {r.status === 'Pronto p/ aprovar' && <button style={btnP}>Aprovar e ocupar assento</button>}
                            {r.status === 'Divergência CRECI' && <button style={btnP}>Resolver divergência</button>}
                            {r.status === 'Docs pendentes' && <button style={btnO}>Cobrar documentos</button>}
                            <button style={{ ...btnO, color: cd.error, borderColor: cd.error }}>Recusar candidatura</button>
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
      <div style={{ marginTop: 14, padding: '10px 14px', background: cd.lilac1, border: `1px solid ${cd.lilac2}`, borderRadius: 10, fontSize: 12.5, color: cd.g700, display: 'flex', alignItems: 'center', gap: 8 }}>
        <CIc n="shield-check" s={14} c={cd.primary} />
        Sem assento livre, a aprovação fica <b>retida</b> — o sistema confere a vaga no momento do clique e sugere ampliar o plano da unidade.
      </div>
    </div>
  );
}

/* ---------------- ORIGENS & ASSENTOS ---------------- */
function CdOrigens() {
  const max = Math.max(...ORIGENS.map((m) => m.v));
  return (
    <div style={{ ...cdCard, padding: 22 }}>
      <CdHead title="De onde vêm os candidatos" sub="Últimos 90 dias" />
      {ORIGENS.map((m) => (
        <div key={m.l} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 11 }}>
          <span style={{ width: 190, fontSize: 12.5, color: cd.g700, flexShrink: 0, lineHeight: 1.25 }}>{m.l}</span>
          <div style={{ flex: 1, height: 10, background: cd.g100, borderRadius: 999, overflow: 'hidden' }}>
            <div style={{ width: `${(m.v / max) * 100}%`, height: '100%', background: m.c, borderRadius: 999 }} />
          </div>
          <span style={{ width: 38, fontSize: 12.5, fontWeight: 700, color: cd.ink, textAlign: 'right' }}>{m.v}%</span>
        </div>
      ))}
      <div style={{ marginTop: 14, padding: '10px 14px', background: cd.lilac1, border: `1px solid ${cd.lilac2}`, borderRadius: 10, fontSize: 12.5, color: cd.g700, display: 'flex', alignItems: 'center', gap: 8 }}>
        <CIc n="lightbulb" s={14} c={cd.primary} />
        Indicação converte 2,3× mais que o site — quem indica ganha pontos no Score quando o indicado é aprovado.
      </div>
    </div>
  );
}

function CdAssentos() {
  return (
    <div style={{ ...cdCard, padding: 22 }}>
      <CdHead title="Assentos por unidade" sub="Contratados no plano × em uso — aprovar sem vaga é retido" right={<CdBadge text="16 livres na rede" fg={cd.success} bg={cd.successBg} ic="armchair" />} />
      {ASSENTOS.map((a) => {
        const pct = (a.usado / a.total) * 100;
        const cheio = pct >= 95;
        return (
          <div key={a.u} style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
              <span style={{ fontSize: 12.5, fontWeight: 600, color: cd.ink }}>{a.u}</span>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: cheio ? cd.error : cd.g700 }}>{a.usado}/{a.total}{cheio ? ' · quase cheio' : ''}</span>
            </div>
            <div style={{ height: 10, background: cd.g100, borderRadius: 999, overflow: 'hidden' }}>
              <div style={{ width: `${pct}%`, height: '100%', background: cheio ? cd.error : pct > 80 ? cd.warning : cd.success, borderRadius: 999 }} />
            </div>
          </div>
        );
      })}
      <div style={{ fontSize: 12, color: cd.g500, marginTop: 4 }}>Unidade quase cheia? O sistema sugere ampliar o plano antes da próxima aprovação.</div>
    </div>
  );
}

/* ---------------- PAGE ---------------- */
export default function CeoCandidatosPage() {
  return (
    <CeoChrome>
      <style>{`@media (max-width: 920px){ .cd-detail { grid-template-columns: 1fr !important; } .cd-detail > div:first-child { border-right: none !important; border-bottom: 1px solid ${cd.g300}; } }`}</style>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 30, letterSpacing: '-0.02em', margin: 0, color: cd.ink }}>Candidatos a corretor</h1>
            <div style={{ fontSize: 13.5, color: cd.g500, marginTop: 4 }}>Rede inteira · onboarding com CRECI validado, documentos e assento garantido</div>
          </div>
          <CdBadge text={`link público: ${demo.dominio}/seja-corretor`} fg={cd.primary} bg={cd.lilac2} ic="link" />
        </div>

        <CdSummary />
        <CdTabela />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 18 }}>
          <CdOrigens />
          <CdAssentos />
        </div>
      </div>
    </CeoChrome>
  );
}
