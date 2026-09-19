"use client";
import * as React from "react";
import CeoChrome, { ceoPalette, CIc } from "@/components/ceo/CeoChrome";
import { demo } from "@/config/demo";
const { useState } = React;

const ch: any = {
  ...ceoPalette,
  info: '#3E82E0', infoBg: '#E5EEFB',
  successBg: '#E6F4EC', warnBg: '#FBF1DC', errBg: '#FAE5E5',
  p3: '#818CF8', p3bg: '#E0E7FF',
};
const chCard = { background: '#fff', border: `1px solid ${ch.g300}`, borderRadius: 16 };

function ChBadge({ text, fg, bg, ic }: any) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: fg, background: bg, borderRadius: 999, padding: '3px 10px', whiteSpace: 'nowrap' }}>
      {ic && <CIc n={ic} s={12} c={fg} />}{text}
    </span>
  );
}
function ChHead({ title, sub, right }: any) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
      <div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: ch.ink }}>{title}</div>
        {sub && <div style={{ fontSize: 13, color: ch.g500, marginTop: 2 }}>{sub}</div>}
      </div>
      {right}
    </div>
  );
}
const th: React.CSSProperties = { textAlign: 'left', fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: ch.g500, padding: '10px 14px', borderBottom: `1px solid ${ch.g100}`, whiteSpace: 'nowrap' };
const td: React.CSSProperties = { padding: '13px 14px', fontSize: 13.5, color: ch.g700, borderBottom: `1px solid ${ch.g100}`, verticalAlign: 'middle' };
const btnP: React.CSSProperties = { border: 'none', cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12.5, color: '#fff', background: ch.primary, borderRadius: 9, padding: '8px 14px' };
const btnO: React.CSSProperties = { border: `1px solid ${ch.g300}`, cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12.5, color: ch.g700, background: '#fff', borderRadius: 9, padding: '8px 14px' };

const CAT_TONE: any = {
  'Financeiro': [ch.info, ch.infoBg, 'wallet'],
  'Técnico': [ch.p3, ch.p3bg, 'wrench'],
  'Operacional': [ch.warning, ch.warnBg, 'settings-2'],
  'Dúvida': [ch.g700, ch.g100, 'help-circle'],
};
const PRI_TONE: any = { 'Alta': [ch.error, ch.errBg], 'Média': [ch.warning, ch.warnBg], 'Baixa': [ch.g700, ch.g100] };
const SLA_TONE: any = { ok: [ch.success, ch.successBg], warn: [ch.warning, ch.warnBg], err: [ch.error, ch.errBg] };

/* ---------------- DATA ---------------- */
const CHAMADOS: any[] = [
  {
    id: '#1042', titulo: 'Boleto pago continua como atrasado', corretor: 'Renata Alves', unidade: `${demo.nomeCurto} Recife Centro`, tier: 'Consolidado',
    cat: 'Financeiro', pri: 'Alta', status: 'Em atendimento', atribuido: 'Suporte · Carla M.', sla: 'Vence em 40 min', slaTone: 'err', aberto: 'hoje 09:12',
    anteriores: '3 chamados · satisfação média 5,0',
    thread: [
      { de: 'corretor', t: '09:12', m: 'Oi! O boleto do meu cliente (contrato #C-204) foi pago ontem mas continua como atrasado no sistema. Ele tá me cobrando, podem verificar?' },
      { de: 'suporte', t: '09:31', m: 'Oi Renata! Localizei aqui — o aviso de pagamento do banco atrasou. A conferência diária já baixou a cobrança agora de manhã. Pede pra ele conferir, e o comprovante já aparece no painel dele. 😊' },
      { de: 'corretor', t: '09:40', m: 'Apareceu sim! Mas a multa que ele pagou vai ser devolvida? Pagou um dia depois.' },
    ],
  },
  {
    id: '#1041', titulo: `Não consigo subir fotos do imóvel ${demo.sigla}-1502`, corretor: 'Lucas Ferreira', unidade: `${demo.nomeCurto} Boa Viagem`, tier: 'Elite',
    cat: 'Técnico', pri: 'Média', status: 'Em atendimento', atribuido: 'Suporte · Tiago R.', sla: '3h 20min', slaTone: 'ok', aberto: 'hoje 08:55',
    anteriores: '1 chamado · satisfação 4,0',
    thread: [
      { de: 'corretor', t: '08:55', m: `O upload trava em 80% nas fotos do ${demo.sigla}-1502. Já tentei pelo celular e pelo notebook. Anexei o print do erro.`, anexo: 'print-erro-upload.png' },
      { de: 'suporte', t: '09:20', m: 'Bom dia, Lucas! Recebemos o print. As fotos têm mais de 25 MB cada — o limite por arquivo. Pode reduzir a resolução ou mandar que a gente otimiza por aqui.' },
    ],
  },
  {
    id: '#1039', titulo: 'Como funciona o rateio na co-corretagem?', corretor: 'Bruno Tavares', unidade: `${demo.nomeCurto} Caruaru`, tier: 'Consolidado',
    cat: 'Dúvida', pri: 'Baixa', status: 'Aberto', atribuido: '— não atribuído —', sla: '7h 10min', slaTone: 'ok', aberto: 'hoje 07:48',
    anteriores: '5 chamados · satisfação média 4,6',
    thread: [
      { de: 'corretor', t: '07:48', m: `Fechei uma venda em parceria com a Joana (${demo.nomeCurto} Boa Viagem). Como o sistema divide a comissão entre a gente? 50/50 automático?` },
    ],
  },
  {
    id: '#1036', titulo: 'Lead distribuído fora da minha região', corretor: 'Helena Rocha', unidade: `${demo.nomeCurto} Olinda`, tier: 'Iniciante',
    cat: 'Operacional', pri: 'Média', status: 'Resolvido', atribuido: 'Suporte · Carla M.', sla: 'Resolvido em 2h 04min', slaTone: 'ok', aberto: 'ontem 15:30', nota: 5,
    anteriores: 'primeiro chamado',
    thread: [
      { de: 'corretor', t: '15:30', m: 'Recebi um lead de Garanhuns, mas atendo só Olinda e Paulista. Tem como ajustar?' },
      { de: 'suporte', t: '16:05', m: 'Oi Helena! Sua área de atuação estava como "PE inteiro" no cadastro. Já ajustei para Olinda + Paulista — os próximos leads respeitam isso. O de Garanhuns voltou para a fila e foi redistribuído. ✅' },
      { de: 'corretor', t: '17:34', m: 'Perfeito, obrigada!' },
    ],
  },
];

const CATS_MES = [
  { l: 'Financeiro', v: 34, c: ch.info },
  { l: 'Técnico', v: 27, c: ch.p3 },
  { l: 'Operacional', v: 22, c: ch.warning },
  { l: 'Dúvida', v: 17, c: ch.g500 },
];

/* ---------------- SUMMARY ---------------- */
function ChSummary() {
  const cards = [
    { l: 'Abertos agora', v: '12', d: '1 estourando SLA', ic: 'inbox', hl: true },
    { l: 'Vencendo SLA (2h)', v: '1', d: '#1042 · financeiro', ic: 'alarm-clock' },
    { l: 'Tempo médio de resolução', v: '4h 10m', d: 'meta: 8h úteis', ic: 'timer', good: true },
    { l: 'Satisfação (CSAT)', v: '4,6', d: '92 avaliações no mês', ic: 'star', good: true },
    { l: 'Resolvidos no mês', v: '98', d: '+12% vs. maio', ic: 'check-check' },
    { l: 'Reabertos', v: '3', d: 'dentro dos 7 dias', ic: 'rotate-ccw' },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(172px, 1fr))', gap: 14 }}>
      {cards.map((c) => (
        <div key={c.l} style={{ background: c.hl ? `linear-gradient(135deg, ${ch.primary}, ${ch.deep})` : '#fff', border: c.hl ? 'none' : `1px solid ${ch.g300}`, borderRadius: 16, padding: 18, boxShadow: c.hl ? 'var(--shadow-purple)' : 'none', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: c.hl ? 'rgba(255,255,255,.85)' : ch.g500, lineHeight: 1.3 }}>{c.l}</span>
            <span style={{ width: 30, height: 30, borderRadius: 8, background: c.hl ? 'rgba(255,255,255,.18)' : ch.lilac2, display: 'grid', placeItems: 'center', flexShrink: 0 }}><CIc n={c.ic} s={15} c={c.hl ? '#fff' : ch.primary} /></span>
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, lineHeight: 1.15, color: c.hl ? '#fff' : ch.ink, marginTop: 14, letterSpacing: '-0.01em' }}>{c.v}</div>
          <div style={{ fontSize: 11.5, color: c.hl ? 'rgba(255,255,255,.7)' : c.good ? ch.success : ch.g500, marginTop: 9, fontWeight: c.good ? 700 : 400 }}>{c.d}</div>
        </div>
      ))}
    </div>
  );
}

/* ---------------- FILA ---------------- */
function ChFila() {
  const [f, setF] = useState('Todos');
  const [openId, setOpenId] = useState<string | null>('#1042');
  const filtros = ['Todos', 'Aberto', 'Em atendimento', 'Resolvido'];
  const rows = CHAMADOS.filter((r) => f === 'Todos' || r.status === f);
  return (
    <div style={{ ...chCard, padding: 22 }}>
      <ChHead title="Fila de chamados" sub="Ordenada por SLA — quem está estourando aparece primeiro"
        right={<ChBadge text="reabrir vale por 7 dias após resolver" fg={ch.g700} bg={ch.g100} ic="rotate-ccw" />} />
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
        {filtros.map((x) => (
          <button key={x} onClick={() => setF(x)} style={{ border: `1px solid ${f === x ? ch.primary : ch.g300}`, cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: 600, padding: '6px 14px', borderRadius: 999, background: f === x ? ch.primary : '#fff', color: f === x ? '#fff' : ch.g700 }}>{x}</button>
        ))}
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 820 }}>
          <thead><tr>
            <th style={th}>Chamado</th><th style={th}>Corretor</th><th style={th}>Categoria</th><th style={th}>Prioridade</th><th style={th}>SLA</th><th style={th}>Atribuído</th><th style={th}></th>
          </tr></thead>
          <tbody>
            {rows.map((r) => {
              const [cfg, cbg, cic] = CAT_TONE[r.cat];
              const [pfg, pbg] = PRI_TONE[r.pri];
              const [sfg, sbg] = SLA_TONE[r.slaTone];
              const open = openId === r.id;
              return (
                <React.Fragment key={r.id}>
                  <tr onClick={() => setOpenId(open ? null : r.id)} style={{ cursor: 'pointer', background: open ? ch.lilac1 : 'transparent' }}
                    onMouseEnter={(e) => { if (!open) (e.currentTarget as HTMLTableRowElement).style.background = ch.lilac1; }}
                    onMouseLeave={(e) => { if (!open) (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'; }}>
                    <td style={td}>
                      <div style={{ fontWeight: 700, color: ch.ink }}>{r.id} · {r.titulo}</div>
                      <div style={{ fontSize: 12, color: ch.g500 }}>aberto {r.aberto}</div>
                    </td>
                    <td style={td}>
                      <div style={{ fontWeight: 600, color: ch.ink }}>{r.corretor}</div>
                      <div style={{ fontSize: 12, color: ch.g500 }}>{r.unidade}</div>
                    </td>
                    <td style={td}><ChBadge text={r.cat} fg={cfg} bg={cbg} ic={cic} /></td>
                    <td style={td}><ChBadge text={r.pri} fg={pfg} bg={pbg} /></td>
                    <td style={td}><ChBadge text={r.sla} fg={sfg} bg={sbg} ic="alarm-clock" /></td>
                    <td style={{ ...td, fontSize: 12.5 }}>{r.atribuido}</td>
                    <td style={{ ...td, textAlign: 'right' }}>
                      <button onClick={(e) => e.stopPropagation()} style={{ ...btnO, padding: '7px 14px', fontSize: 12, color: ch.primary }}>{r.atribuido.startsWith('—') ? 'Assumir' : 'Abrir'}</button>
                    </td>
                  </tr>
                  {open && (
                    <tr><td colSpan={7} style={{ padding: 0, borderBottom: `1px solid ${ch.g100}` }}>
                      <div className="ch-detail" style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1.3fr) minmax(240px, .9fr)', background: ch.lilac1 }}>
                        {/* thread */}
                        <div style={{ padding: '18px 22px', borderRight: `1px solid ${ch.g300}`, display: 'flex', flexDirection: 'column' }}>
                          <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: ch.g500, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <CIc n="messages-square" s={13} c={ch.g500} /> Conversa do chamado
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 12 }}>
                            {r.thread.map((m: any, i: number) => (
                              <div key={i} style={{ alignSelf: m.de === 'corretor' ? 'flex-start' : 'flex-end', maxWidth: '85%', background: m.de === 'corretor' ? '#fff' : ch.lilac2, border: `1px solid ${m.de === 'corretor' ? ch.g300 : 'transparent'}`, borderRadius: 12, padding: '9px 13px' }}>
                                <div style={{ fontSize: 13, color: ch.ink, lineHeight: 1.45 }}>{m.m}</div>
                                {m.anexo && (
                                  <div style={{ marginTop: 6, display: 'inline-flex', alignItems: 'center', gap: 6, background: ch.g100, borderRadius: 8, padding: '5px 10px', fontSize: 11.5, fontWeight: 600, color: ch.g700 }}>
                                    <CIc n="paperclip" s={12} c={ch.g700} /> {m.anexo}
                                  </div>
                                )}
                                <div style={{ fontSize: 10.5, color: ch.g500, marginTop: 4 }}>{m.de === 'corretor' ? r.corretor : r.atribuido.replace('Suporte · ', `Suporte ${demo.nomeCurto} · `)} · {m.t}</div>
                              </div>
                            ))}
                          </div>
                          {r.status !== 'Resolvido' ? (
                            <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                              <input placeholder="Responder ao corretor…" style={{ flex: 1, border: `1px solid ${ch.g300}`, borderRadius: 10, padding: '9px 13px', fontFamily: 'var(--font-body)', fontSize: 13, outline: 'none', background: '#fff' }} />
                              <button style={btnP}>Enviar</button>
                              <button style={{ ...btnO, color: ch.success, borderColor: ch.success }}>Resolver</button>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 'auto', padding: '9px 13px', background: ch.successBg, borderRadius: 10 }}>
                              <CIc n="star" s={15} c={ch.warning} />
                              <span style={{ fontSize: 12.5, fontWeight: 700, color: ch.ink }}>Avaliado com nota {r.nota}/5</span>
                              <span style={{ fontSize: 12, color: ch.g500 }}>· resolução exige resposta final — avaliação chega por WhatsApp</span>
                            </div>
                          )}
                        </div>
                        {/* contexto */}
                        <div style={{ padding: '18px 22px' }}>
                          <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: ch.g500, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <CIc n="user" s={13} c={ch.g500} /> Contexto do corretor
                          </div>
                          <div style={{ background: '#fff', border: `1px solid ${ch.g300}`, borderRadius: 12, padding: '13px 15px', marginBottom: 10 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div style={{ width: 38, height: 38, borderRadius: '50%', background: `linear-gradient(135deg, ${ch.light}, ${ch.deep})`, display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 700, fontFamily: 'var(--font-display)', fontSize: 13 }}>{r.corretor.split(' ').map((x: string) => x[0]).slice(0, 2).join('')}</div>
                              <div>
                                <div style={{ fontWeight: 700, color: ch.ink, fontSize: 13.5 }}>{r.corretor}</div>
                                <div style={{ fontSize: 11.5, color: ch.g500 }}>{r.unidade} · tier {r.tier}</div>
                              </div>
                            </div>
                            <div style={{ fontSize: 12, color: ch.g700, marginTop: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                              <CIc n="history" s={12} c={ch.g500} /> {r.anteriores}
                            </div>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                            {[['arrow-right-left', 'Reatribuir chamado'], ['flag', 'Mudar prioridade'], ['merge', 'Vincular a outro chamado']].map(([ic, lb]) => (
                              <button key={lb} style={{ ...btnO, display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-start', fontSize: 12 }}>
                                <CIc n={ic} s={14} c={ch.g700} /> {lb}
                              </button>
                            ))}
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

/* ---------------- CATEGORIAS & SATISFAÇÃO ---------------- */
function ChCategorias() {
  const max = Math.max(...CATS_MES.map((m) => m.v));
  return (
    <div style={{ ...chCard, padding: 22 }}>
      <ChHead title="Sobre o que os corretores chamam" sub="Chamados por categoria — junho" />
      {CATS_MES.map((m) => (
        <div key={m.l} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 11 }}>
          <span style={{ width: 110, fontSize: 12.5, color: ch.g700, flexShrink: 0 }}>{m.l}</span>
          <div style={{ flex: 1, height: 10, background: ch.g100, borderRadius: 999, overflow: 'hidden' }}>
            <div style={{ width: `${(m.v / max) * 100}%`, height: '100%', background: m.c, borderRadius: 999 }} />
          </div>
          <span style={{ width: 38, fontSize: 12.5, fontWeight: 700, color: ch.ink, textAlign: 'right' }}>{m.v}%</span>
        </div>
      ))}
      <div style={{ marginTop: 14, padding: '10px 14px', background: ch.lilac1, border: `1px solid ${ch.lilac2}`, borderRadius: 10, fontSize: 12.5, color: ch.g700, display: 'flex', alignItems: 'center', gap: 8 }}>
        <CIc n="lightbulb" s={14} c={ch.primary} />
        1 em cada 3 chamados é dúvida financeira — candidatos naturais para a base de conhecimento da fase 2.
      </div>
    </div>
  );
}

function ChSatisfacao() {
  const notas = [
    { n: 5, v: 71 }, { n: 4, v: 18 }, { n: 3, v: 7 }, { n: 2, v: 3 }, { n: 1, v: 1 },
  ];
  return (
    <div style={{ ...chCard, padding: 22 }}>
      <ChHead title="Satisfação do suporte" sub="Avaliação pós-resolução (1 a 5) — junho" right={<ChBadge text="CSAT 4,6" fg={ch.success} bg={ch.successBg} ic="star" />} />
      {notas.map((x) => (
        <div key={x.n} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
          <span style={{ width: 44, fontSize: 12.5, color: ch.g700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>{x.n} <CIc n="star" s={11} c={ch.warning} /></span>
          <div style={{ flex: 1, height: 10, background: ch.g100, borderRadius: 999, overflow: 'hidden' }}>
            <div style={{ width: `${x.v}%`, height: '100%', background: x.n >= 4 ? ch.success : x.n === 3 ? ch.warning : ch.error, borderRadius: 999 }} />
          </div>
          <span style={{ width: 38, fontSize: 12.5, fontWeight: 700, color: ch.ink, textAlign: 'right' }}>{x.v}%</span>
        </div>
      ))}
      <div style={{ display: 'flex', gap: 16, marginTop: 16, paddingTop: 14, borderTop: `1px solid ${ch.g100}`, flexWrap: 'wrap' }}>
        {[['1ª resposta (média)', '38 min'], ['Resolução no 1º contato', '64%'], ['Sem avaliação', '11%']].map(([l, v]) => (
          <div key={l}>
            <div style={{ fontSize: 11.5, color: ch.g500 }}>{l}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16, color: ch.ink, marginTop: 2 }}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- PAGE ---------------- */
export default function CeoChamadosPage() {
  return (
    <CeoChrome>
      <style>{`@media (max-width: 920px){ .ch-detail { grid-template-columns: 1fr !important; } .ch-detail > div:first-child { border-right: none !important; border-bottom: 1px solid ${ch.g300}; } }`}</style>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 30, letterSpacing: '-0.02em', margin: 0, color: ch.ink }}>Chamados</h1>
            <div style={{ fontSize: 13.5, color: ch.g500, marginTop: 4 }}>Suporte da {demo.nomeCurto} aos corretores · SLA interno por prioridade · avaliação pós-resolução</div>
          </div>
          <ChBadge text="SLA: alta 2h · média 8h · baixa 24h" fg={ch.primary} bg={ch.lilac2} ic="alarm-clock" />
        </div>

        <ChSummary />
        <ChFila />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 18 }}>
          <ChCategorias />
          <ChSatisfacao />
        </div>
      </div>
    </CeoChrome>
  );
}
