"use client";
import * as React from "react";
import CeoChrome, { ceoPalette, CIc } from "@/components/ceo/CeoChrome";
const { useState } = React;

const cr: any = {
  ...ceoPalette,
  info: '#3E82E0', infoBg: '#E5EEFB',
  successBg: '#E6F4EC', warnBg: '#FBF1DC', errBg: '#FAE5E5',
  p3: '#818CF8', p3bg: '#E0E7FF',
};
const crCard = { background: '#fff', border: `1px solid ${cr.g300}`, borderRadius: 16 };

function CrBadge({ text, fg, bg, ic }: any) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: fg, background: bg, borderRadius: 999, padding: '3px 10px', whiteSpace: 'nowrap' }}>
      {ic && <CIc n={ic} s={12} c={fg} />}{text}
    </span>
  );
}
function CrHead({ title, sub, right }: any) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
      <div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: cr.ink }}>{title}</div>
        {sub && <div style={{ fontSize: 13, color: cr.g500, marginTop: 2 }}>{sub}</div>}
      </div>
      {right}
    </div>
  );
}
const th: React.CSSProperties = { textAlign: 'left', fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: cr.g500, padding: '10px 14px', borderBottom: `1px solid ${cr.g100}`, whiteSpace: 'nowrap' };
const td: React.CSSProperties = { padding: '13px 14px', fontSize: 13.5, color: cr.g700, borderBottom: `1px solid ${cr.g100}`, verticalAlign: 'middle' };
const btnP: React.CSSProperties = { border: 'none', cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12.5, color: '#fff', background: cr.primary, borderRadius: 9, padding: '8px 14px' };
const btnO: React.CSSProperties = { border: `1px solid ${cr.g300}`, cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12.5, color: cr.g700, background: '#fff', borderRadius: 9, padding: '8px 14px' };

/* ---------------- DATA ---------------- */
const BUREAUS = [
  { n: 'SPC Brasil', custo: 'R$ 9,90', tempo: '~4 s', cobre: 'negativação, protestos' },
  { n: 'Serasa Experian', custo: 'R$ 14,00', tempo: '~6 s', cobre: 'score, dívidas, renda presumida' },
  { n: 'Quod', custo: 'R$ 11,50', tempo: '~5 s', cobre: 'cadastro positivo, comportamento' },
];

const FILA: any[] = [
  {
    id: 'an1', nome: 'Maria Souza', doc: 'CPF ***.***.***-44', fin: 'Seguro-fiança do parceiro · locação', ctx: 'Apto Espinheiro · aluguel R$ 3.200',
    status: 'Pendente', espera: '2h', dedup: null,
  },
  {
    id: 'an2', nome: 'Tech Soluções Ltda', doc: 'CNPJ **.***.***/0001-**', fin: 'Fechamento · locação comercial', ctx: 'Sala Ilha do Leite · R$ 5.500/mês',
    status: 'Pendente', espera: '40 min', dedup: null,
  },
  {
    id: 'an3', nome: 'Pedro Nunes', doc: 'CPF ***.***.***-71', fin: 'Seguro-fiança do parceiro · renovação', ctx: 'Apto Pina · contrato #C-088',
    status: 'Concluída', espera: '—', dedup: 'consulta de 28/05 reaproveitada, sem novo custo',
    resultado: { bureau: 'Serasa Experian', score: 780, faixa: 'Baixo risco', pend: 'nenhuma negativação', renda: 'compatível (3,4× o aluguel)', decisao: 'Aprovado', quando: '28/05 · por Marina C.' },
  },
  {
    id: 'an4', nome: 'Juliana Castro', doc: 'CPF ***.***.***-19', fin: 'Fechamento · financiamento', ctx: 'Apto Graças · entrada R$ 230 mil',
    status: 'Concluída', espera: '—', dedup: null,
    resultado: { bureau: 'SPC Brasil', score: 612, faixa: 'Risco moderado', pend: '1 protesto (R$ 1.240 · 2024), quitado', renda: 'não avaliada pelo SPC', decisao: 'Aprovado com ressalva', quando: 'hoje 09:12 · por Marina C.' },
  },
];

const CRECI: any[] = [
  { nome: 'Joana Reis', creci: 'CRECI-PE 00000-F', st: 'Validado', ev: 'consulta ao Conselho · 10/06', tone: 'ok' },
  { nome: 'Marcos Lima', creci: 'CRECI-PE 00000-F', st: 'Divergência de nome', ev: 'registro: "Marcos A. de Lima" × cadastro: "Marcos Lima"', tone: 'warn' },
  { nome: 'Helena Rocha', creci: 'CRECI-PE 00000-F', st: 'Aguardando evidência', ev: 'candidata enviou carteirinha, conferir validade', tone: 'info' },
];

const CUSTOS = [
  { b: 'Serasa Experian', q: 31, v: 434, c: '#818CF8' },
  { b: 'SPC Brasil', q: 24, v: 237.6, c: '#4F46E5' },
  { b: 'Quod', q: 8, v: 92, c: '#3E82E0' },
];

/* ---------------- SUMMARY ---------------- */
function CrSummary() {
  const cards = [
    { l: 'Análises pendentes', v: '4', d: '2 de garantia, 2 de fechamento', ic: 'scan-search', hl: true },
    { l: 'Concluídas no mês', v: '63', d: '87% aprovadas', ic: 'check-check', good: true },
    { l: 'Tempo médio de análise', v: '11 min', d: 'da fila à decisão', ic: 'timer', good: true },
    { l: 'Gasto com bureaus (jun)', v: 'R$ 764', d: '63 consultas', ic: 'receipt' },
    { l: 'Economia por reuso', v: 'R$ 182', d: '14 consultas reaproveitadas', ic: 'piggy-bank', good: true },
    { l: 'CRECI a validar', v: '2', d: '1 divergência de nome', ic: 'id-card' },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(172px, 1fr))', gap: 14 }}>
      {cards.map((c) => (
        <div key={c.l} style={{ background: c.hl ? `linear-gradient(135deg, ${cr.primary}, ${cr.deep})` : '#fff', border: c.hl ? 'none' : `1px solid ${cr.g300}`, borderRadius: 16, padding: 18, boxShadow: c.hl ? 'var(--shadow-purple)' : 'none', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: c.hl ? 'rgba(255,255,255,.85)' : cr.g500, lineHeight: 1.3 }}>{c.l}</span>
            <span style={{ width: 30, height: 30, borderRadius: 8, background: c.hl ? 'rgba(255,255,255,.18)' : cr.lilac2, display: 'grid', placeItems: 'center', flexShrink: 0 }}><CIc n={c.ic} s={15} c={c.hl ? '#fff' : cr.primary} /></span>
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, lineHeight: 1.15, color: c.hl ? '#fff' : cr.ink, marginTop: 14, letterSpacing: '-0.01em' }}>{c.v}</div>
          <div style={{ fontSize: 11.5, color: c.hl ? 'rgba(255,255,255,.7)' : c.good ? cr.success : cr.g500, marginTop: 9, fontWeight: c.good ? 700 : 400 }}>{c.d}</div>
        </div>
      ))}
    </div>
  );
}

/* ---------------- FILA DE ANÁLISES ---------------- */
function CrFila() {
  const [openId, setOpenId] = useState<string | null>('an1');
  const [bureau, setBureau] = useState<string | null>(null);
  return (
    <div style={{ ...crCard, padding: 22 }}>
      <CrHead title="Fila de análises" sub="Garantia, fechamento e candidatos. O analista escolhe o bureau na hora, vendo o custo"
        right={<CrBadge text="resultado nunca aparece ao corretor" fg={cr.error} bg={cr.errBg} ic="eye-off" />} />
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 760 }}>
          <thead><tr>
            <th style={th}>Pessoa / documento</th><th style={th}>Finalidade</th><th style={th}>Contexto</th><th style={th}>Espera</th><th style={th}>Status</th><th style={th}></th>
          </tr></thead>
          <tbody>
            {FILA.map((r) => {
              const open = openId === r.id;
              const done = r.status === 'Concluída';
              return (
                <React.Fragment key={r.id}>
                  <tr onClick={() => { setOpenId(open ? null : r.id); setBureau(null); }} style={{ cursor: 'pointer', background: open ? cr.lilac1 : 'transparent' }}
                    onMouseEnter={(e) => { if (!open) (e.currentTarget as HTMLTableRowElement).style.background = cr.lilac1; }}
                    onMouseLeave={(e) => { if (!open) (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'; }}>
                    <td style={td}>
                      <div style={{ fontWeight: 700, color: cr.ink }}>{r.nome}</div>
                      <div style={{ fontSize: 12, color: cr.g500, display: 'flex', alignItems: 'center', gap: 5 }}><CIc n="lock" s={11} c={cr.g500} />{r.doc}</div>
                    </td>
                    <td style={td}><CrBadge text={r.fin} fg={cr.primary} bg={cr.lilac2} /></td>
                    <td style={{ ...td, fontSize: 12.5 }}>{r.ctx}</td>
                    <td style={{ ...td, fontWeight: 700, color: cr.ink }}>{r.espera}</td>
                    <td style={td}><CrBadge text={r.status} fg={done ? cr.success : cr.warning} bg={done ? cr.successBg : cr.warnBg} /></td>
                    <td style={{ ...td, textAlign: 'right' }}>
                      <button onClick={(e) => e.stopPropagation()} style={{ ...btnO, padding: '7px 14px', fontSize: 12, color: cr.primary }}>{done ? 'Ver análise' : 'Analisar'}</button>
                    </td>
                  </tr>
                  {open && (
                    <tr><td colSpan={6} style={{ padding: 0, borderBottom: `1px solid ${cr.g100}` }}>
                      <div style={{ background: cr.lilac1, padding: '18px 22px' }}>
                        {!done ? (
                          <>
                            <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: cr.g500, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                              <CIc n="scan-search" s={13} c={cr.g500} /> Escolha o bureau para esta consulta
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 12, marginBottom: 14 }}>
                              {BUREAUS.map((b) => {
                                const sel = bureau === b.n;
                                return (
                                  <button key={b.n} onClick={() => setBureau(b.n)} style={{ textAlign: 'left', cursor: 'pointer', background: sel ? '#fff' : '#fff', border: `2px solid ${sel ? cr.primary : cr.g300}`, borderRadius: 12, padding: '13px 15px', fontFamily: 'var(--font-body)', boxShadow: sel ? 'var(--shadow-purple)' : 'none' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                      <span style={{ fontWeight: 800, fontSize: 13.5, color: cr.ink, fontFamily: 'var(--font-display)' }}>{b.n}</span>
                                      {sel && <CIc n="check-circle-2" s={17} c={cr.primary} />}
                                    </div>
                                    <div style={{ fontSize: 12, color: cr.g500, marginTop: 4 }}>{b.cobre}</div>
                                    <div style={{ display: 'flex', gap: 8, marginTop: 9 }}>
                                      <CrBadge text={b.custo} fg={cr.primary} bg={cr.lilac2} ic="coins" />
                                      <CrBadge text={b.tempo} fg={cr.g700} bg={cr.g100} ic="zap" />
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                              <button disabled={!bureau} style={{ ...btnP, opacity: bureau ? 1 : .45, cursor: bureau ? 'pointer' : 'not-allowed' }}>
                                {bureau ? `Consultar no ${bureau}` : 'Selecione um bureau'}
                              </button>
                              <span style={{ fontSize: 12, color: cr.g500, display: 'flex', alignItems: 'center', gap: 6 }}>
                                <CIc n="info" s={13} c={cr.g500} /> Se houver consulta dos últimos 30 dias, o sistema reaproveita, sem cobrar de novo.
                              </span>
                            </div>
                          </>
                        ) : (
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
                            <div>
                              <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: cr.g500, marginBottom: 10 }}>Resultado normalizado · {r.resultado.bureau}</div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
                                <div style={{ width: 74, height: 74, borderRadius: '50%', background: `conic-gradient(${r.resultado.score >= 700 ? cr.success : cr.warning} ${(r.resultado.score / 1000) * 360}deg, ${cr.g100} 0deg)`, display: 'grid', placeItems: 'center' }}>
                                  <div style={{ width: 58, height: 58, borderRadius: '50%', background: '#fff', display: 'grid', placeItems: 'center', textAlign: 'center' }}>
                                    <div>
                                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, color: cr.ink, lineHeight: 1 }}>{r.resultado.score}</div>
                                      <div style={{ fontSize: 9, color: cr.g500 }}>score</div>
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <CrBadge text={r.resultado.faixa} fg={r.resultado.score >= 700 ? cr.success : cr.warning} bg={r.resultado.score >= 700 ? cr.successBg : cr.warnBg} />
                                  <div style={{ fontSize: 12.5, color: cr.g700, marginTop: 7, lineHeight: 1.5 }}>
                                    Pendências: <b style={{ color: cr.ink }}>{r.resultado.pend}</b><br />Renda: <b style={{ color: cr.ink }}>{r.resultado.renda}</b>
                                  </div>
                                </div>
                              </div>
                              {r.dedup && (
                                <div style={{ padding: '8px 12px', background: cr.successBg, borderRadius: 9, fontSize: 12, color: cr.success, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                  <CIc n="piggy-bank" s={13} c={cr.success} /> {r.dedup}
                                </div>
                              )}
                            </div>
                            <div>
                              <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: cr.g500, marginBottom: 10 }}>Decisão</div>
                              <div style={{ background: '#fff', border: `1px solid ${cr.g300}`, borderRadius: 12, padding: '13px 16px', marginBottom: 12 }}>
                                <CrBadge text={r.resultado.decisao} fg={cr.success} bg={cr.successBg} ic="badge-check" />
                                <div style={{ fontSize: 12, color: cr.g500, marginTop: 7 }}>{r.resultado.quando}</div>
                              </div>
                              <button style={{ ...btnO, display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                                <CIc n="file-lock-2" s={14} c={cr.g700} /> Ver retorno bruto do bureau
                              </button>
                              <div style={{ fontSize: 11.5, color: cr.g500, marginTop: 7, display: 'flex', alignItems: 'center', gap: 5 }}>
                                <CIc n="eye" s={12} c={cr.g500} /> Abrir o dado bruto fica registrado na trilha de auditoria: quem viu, quando e por quê.
                              </div>
                            </div>
                          </div>
                        )}
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

/* ---------------- CRECI & REPUTAÇÃO ---------------- */
function CrCreci() {
  const TONE: any = { ok: [cr.success, cr.successBg], warn: [cr.warning, cr.warnBg], info: [cr.info, cr.infoBg] };
  return (
    <div style={{ ...crCard, padding: 22 }}>
      <CrHead title="Reputação & CRECI" sub="Validação de registro profissional: exige evidência antes de aprovar" />
      {CRECI.map((c, i) => {
        const [fg, bg] = TONE[c.tone];
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 4px', borderBottom: i < CRECI.length - 1 ? `1px solid ${cr.g100}` : 'none', flexWrap: 'wrap' }}>
            <span style={{ width: 34, height: 34, borderRadius: 10, background: bg, display: 'grid', placeItems: 'center', flexShrink: 0 }}><CIc n="id-card" s={16} c={fg} /></span>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: cr.ink }}>{c.nome} <span style={{ fontWeight: 600, color: cr.g500, fontSize: 12 }}>· {c.creci}</span></div>
              <div style={{ fontSize: 12, color: cr.g500, marginTop: 2 }}>{c.ev}</div>
            </div>
            <CrBadge text={c.st} fg={fg} bg={bg} />
            {c.tone !== 'ok' && <button style={{ ...btnO, padding: '6px 12px', fontSize: 12 }}>Resolver</button>}
          </div>
        );
      })}
    </div>
  );
}

/* ---------------- CUSTOS ---------------- */
function CrCustos() {
  const max = Math.max(...CUSTOS.map((c) => c.v));
  const total = CUSTOS.reduce((s, c) => s + c.v, 0);
  return (
    <div style={{ ...crCard, padding: 22 }}>
      <CrHead title="Custo das consultas em junho" sub="Por bureau · o reuso de 30 dias derruba o custo por análise"
        right={<CrBadge text={`Total R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} fg={cr.primary} bg={cr.lilac2} />} />
      {CUSTOS.map((c) => (
        <div key={c.b} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <span style={{ width: 130, fontSize: 12.5, color: cr.g700, flexShrink: 0 }}>{c.b}</span>
          <div style={{ flex: 1, height: 12, background: cr.g100, borderRadius: 999, overflow: 'hidden' }}>
            <div style={{ width: `${(c.v / max) * 100}%`, height: '100%', background: c.c, borderRadius: 999 }} />
          </div>
          <span style={{ width: 110, fontSize: 12.5, fontWeight: 700, color: cr.ink, textAlign: 'right', whiteSpace: 'nowrap' }}>{c.q}× · R$ {c.v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
        </div>
      ))}
      <div style={{ display: 'flex', gap: 16, marginTop: 16, paddingTop: 14, borderTop: `1px solid ${cr.g100}`, flexWrap: 'wrap' }}>
        {[['Custo médio por análise', 'R$ 12,13'], ['Consultas reaproveitadas', '14 (18%)'], ['Repassado na taxa de garantia', '100%']].map(([l, v]) => (
          <div key={l}>
            <div style={{ fontSize: 11.5, color: cr.g500 }}>{l}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16, color: cr.ink, marginTop: 2 }}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- PAGE ---------------- */
export default function CeoCreditoPage() {
  return (
    <CeoChrome>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 30, letterSpacing: '-0.02em', margin: 0, color: cr.ink }}>Crédito & reputação</h1>
            <div style={{ fontSize: 13.5, color: cr.g500, marginTop: 4 }}>Rede inteira · análises de crédito multi-bureau, CRECI e o custo de cada consulta</div>
          </div>
          <CrBadge text="SPC · Serasa · Quod conectados" fg={cr.success} bg={cr.successBg} ic="plug-zap" />
        </div>

        <CrSummary />
        <CrFila />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 18 }}>
          <CrCreci />
          <CrCustos />
        </div>
      </div>
    </CeoChrome>
  );
}
