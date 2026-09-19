"use client";
import * as React from "react";
import CeoChrome, { ceoPalette, CIc } from "@/components/ceo/CeoChrome";
import { demo } from "@/config/demo";
const { useState } = React;

const op: any = {
  ...ceoPalette,
  info: '#3E82E0', infoBg: '#E5EEFB',
  successBg: '#E6F4EC', warnBg: '#FBF1DC', errBg: '#FAE5E5',
  p3: '#818CF8', p3bg: '#E0E7FF',
};
const opCard = { background: '#fff', border: `1px solid ${op.g300}`, borderRadius: 16 };

function OpBadge({ text, fg, bg, ic }: any) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: fg, background: bg, borderRadius: 999, padding: '3px 10px', whiteSpace: 'nowrap' }}>
      {ic && <CIc n={ic} s={12} c={fg} />}{text}
    </span>
  );
}
function OpHead({ title, sub, right }: any) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
      <div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: op.ink }}>{title}</div>
        {sub && <div style={{ fontSize: 13, color: op.g500, marginTop: 2 }}>{sub}</div>}
      </div>
      {right}
    </div>
  );
}
const th: React.CSSProperties = { textAlign: 'left', fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: op.g500, padding: '10px 14px', borderBottom: `1px solid ${op.g100}`, whiteSpace: 'nowrap' };
const td: React.CSSProperties = { padding: '13px 14px', fontSize: 13.5, color: op.g700, borderBottom: `1px solid ${op.g100}`, verticalAlign: 'middle' };

const CAT_TONE: any = {
  'Suporte cliente': [op.info, op.infoBg, 'life-buoy'],
  'Fechamento': [op.success, op.successBg, 'badge-check'],
  'Transferência': [op.p3, op.p3bg, 'arrow-right-left'],
  'SEM_MATCH': [op.g700, op.g100, 'help-circle'],
};
const SLA_TONE: any = {
  'No prazo': [op.success, op.successBg],
  'Vencendo': [op.warning, op.warnBg],
  'Estourado': [op.error, op.errBg],
  'Redistribuído': [op.primary, op.lilac2],
};

/* ---------------- DATA ---------------- */
const FILA: any[] = [
  {
    id: 'a1', nome: 'Pedro Nunes', fone: '(81) 9••••-••44', cat: 'Suporte cliente', motivo: '2ª via de boleto — Apto Pina (contrato #C-088)',
    origem: 'WhatsApp', espera: '22 min', sla: 'Vencendo', vinculo: 'Inquilino · contrato ativo desde 03/2025',
    conversa: [
      { de: 'cliente', t: '09:12', m: 'Bom dia! O boleto do aluguel venceu ontem e perdi o e-mail. Conseguem me mandar a 2ª via?' },
      { de: 'ia', t: '09:12', m: 'Bom dia, Pedro! Localizei seu contrato do Apto Pina. Vou te transferir para a equipe emitir a 2ª via atualizada com os encargos. 😊' },
    ],
    timeline: [
      { t: '09:12', d: 'Identificado pela cascata: telefone → contrato #C-088 (degrau 2)', ic: 'fingerprint' },
      { t: '09:12', d: 'IA classificou: SUPORTE_CLIENTE · confiança 0,96 → transferido à fila', ic: 'bot' },
      { t: '09:27', d: 'Aguardando humano · SLA interno vence em 8 min', ic: 'alarm-clock', warn: true },
    ],
  },
  {
    id: 'a2', nome: 'Mariana Alves', fone: '(81) 9••••-••07', cat: 'Fechamento', motivo: `Proposta aceita — Cobertura Boa Viagem (${demo.sigla}-1300)`,
    origem: 'Site', espera: '4 min', sla: 'No prazo', vinculo: `Lead do corretor Lucas F. · ref ${demo.sigla}-1300`,
    conversa: [
      { de: 'cliente', t: '10:40', m: 'O proprietário aceitou a proposta? Como seguimos com a documentação?' },
      { de: 'ia', t: '10:41', m: `Ótima notícia, Mariana — aceitou sim! A partir daqui o time da ${demo.nomeCurto} conduz a documentação com você. Já estou te conectando. 🎉` },
    ],
    timeline: [
      { t: '10:40', d: `Identificada por refPublica ${demo.sigla}-1300 (degrau 1)`, ic: 'fingerprint' },
      { t: '10:41', d: 'Estágio do funil: PROPOSTA → fechamento assume a conversa (regra: corretor não conduz contrato)', ic: 'badge-check', ok: true },
    ],
  },
  {
    id: 'a3', nome: 'Lead sem cadastro', fone: '+55 81 9••••-••91', cat: 'SEM_MATCH', motivo: '"vi um apto de vocês no ZAP, ainda tá disponível?"',
    origem: 'Portal ZAP', espera: '11 min', sla: 'No prazo', vinculo: 'Nenhum vínculo encontrado (cascata: 5 degraus sem match)',
    conversa: [
      { de: 'cliente', t: '10:51', m: 'oi, vi um apto de vocês no ZAP, ainda tá disponível?' },
      { de: 'ia', t: '10:51', m: `Olá! Sim, posso te ajudar 😊 Você lembra o código do anúncio (algo como ${demo.sigla}-1234) ou a região do imóvel?` },
      { de: 'cliente', t: '10:53', m: 'não lembro não, era perto da praia' },
    ],
    timeline: [
      { t: '10:51', d: 'Cascata esgotada sem identificação → fila SEM_MATCH para triagem humana', ic: 'help-circle', warn: true },
      { t: '10:53', d: 'IA segue coletando contexto enquanto aguarda (região: orla)', ic: 'bot' },
    ],
  },
  {
    id: 'a4', nome: 'Construtora parceira A', fone: '(81) 3•••-••20', cat: 'Transferência', motivo: 'Dúvida jurídica sobre minuta de permuta — corretor pediu apoio',
    origem: 'Corretor (Renata A.)', espera: '31 min', sla: 'Estourado', vinculo: 'Parceiro · 3 negócios fechados',
    conversa: [
      { de: 'cliente', t: '10:31', m: `Renata, nosso jurídico apontou uma cláusula na permuta. Quem da ${demo.nomeCurto} pode alinhar com a gente?` },
    ],
    timeline: [
      { t: '10:31', d: 'Renata A. transferiu com nota: "precisa do jurídico, cliente grande"', ic: 'arrow-right-left' },
      { t: '10:46', d: 'SLA interno de 15 min estourado — ninguém assumiu', ic: 'alarm-clock', warn: true },
      { t: '11:02', d: 'Escalado: alerta enviado ao gestor da Operação', ic: 'bell-ring', warn: true },
    ],
  },
  {
    id: 'a5', nome: 'Fernanda Souza', fone: '(81) 9••••-••18', cat: 'Suporte cliente', motivo: 'Vistoria de saída — agendamento (contrato #C-141)',
    origem: 'WhatsApp', espera: '2 min', sla: 'No prazo', vinculo: 'Inquilina · aviso de saída registrado',
    conversa: [
      { de: 'cliente', t: '11:04', m: 'Oi! Preciso agendar a vistoria de saída, entrego as chaves dia 30.' },
    ],
    timeline: [
      { t: '11:04', d: 'Identificada (degrau 2) · contrato #C-141 com aviso de saída ativo', ic: 'fingerprint' },
    ],
  },
];

const ANTIDESINT: any[] = [
  { id: 'd1', quem: 'Ricardo M. (corretor) → lead', trecho: '"me chama no meu zap pessoal 9 9821-…"', acao: 'Mensagem bloqueada', quando: 'hoje 09:48', risco: 'Alto' },
  { id: 'd2', quem: 'Lead → Bruno T. (corretor)', trecho: 'Lead enviou o próprio número — mascarado automaticamente', acao: 'Número mascarado', quando: 'hoje 08:15', risco: 'Baixo' },
  { id: 'd3', quem: 'Carlos R. (corretor) → lead', trecho: '"te passo meu e-mail pra gente seguir por lá"', acao: 'Retida p/ revisão', quando: 'ontem 17:22', risco: 'Médio' },
];

const TRANSFER_MOTIVOS = [
  { l: 'Pedido de humano', v: 38, c: op.primary },
  { l: 'Suporte de contrato', v: 24, c: op.info },
  { l: 'Fechamento (proposta)', v: 17, c: op.success },
  { l: 'Baixa confiança da IA', v: 12, c: op.warning },
  { l: 'Reclamação', v: 9, c: op.error },
];

/* ---------------- SUMMARY ---------------- */
function OpSummary() {
  const cards = [
    { l: 'Na fila agora', v: '23', d: '6 vencendo SLA', ic: 'inbox', hl: true },
    { l: 'Tempo de 1ª resposta', v: '9 min', d: 'meta: 15 min', ic: 'timer', good: true },
    { l: 'Resolvidas pela IA hoje', v: '142', d: '81% sem humano', ic: 'bot', good: true },
    { l: 'Redistribuídos por SLA', v: '4', d: 'hoje', ic: 'shuffle' },
    { l: 'SEM_MATCH a triar', v: '4', d: 'cascata esgotada', ic: 'help-circle' },
    { l: 'Bloqueios anti-desint.', v: '3', d: '1 p/ revisão', ic: 'shield-alert' },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(172px, 1fr))', gap: 14 }}>
      {cards.map((c) => (
        <div key={c.l} style={{ background: c.hl ? `linear-gradient(135deg, ${op.primary}, ${op.deep})` : '#fff', border: c.hl ? 'none' : `1px solid ${op.g300}`, borderRadius: 16, padding: 18, boxShadow: c.hl ? 'var(--shadow-purple)' : 'none', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: c.hl ? 'rgba(255,255,255,.85)' : op.g500, lineHeight: 1.3 }}>{c.l}</span>
            <span style={{ width: 30, height: 30, borderRadius: 8, background: c.hl ? 'rgba(255,255,255,.18)' : op.lilac2, display: 'grid', placeItems: 'center', flexShrink: 0 }}><CIc n={c.ic} s={15} c={c.hl ? '#fff' : op.primary} /></span>
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, lineHeight: 1.15, color: c.hl ? '#fff' : op.ink, marginTop: 14, letterSpacing: '-0.01em' }}>{c.v}</div>
          <div style={{ fontSize: 11.5, color: c.hl ? 'rgba(255,255,255,.7)' : c.good ? op.success : op.g500, marginTop: 9, fontWeight: c.good ? 700 : 400 }}>{c.d}</div>
        </div>
      ))}
    </div>
  );
}

/* ---------------- FILA ---------------- */
function OpFila() {
  const [cat, setCat] = useState('Todas');
  const [openId, setOpenId] = useState<string | null>('a1');
  const cats = ['Todas', 'Suporte cliente', 'Fechamento', 'Transferência', 'SEM_MATCH'];
  const rows = FILA.filter((r) => cat === 'Todas' || r.cat === cat);
  return (
    <div style={{ ...opCard, padding: 22 }}>
      <OpHead
        title="Fila de atendimento"
        sub="Conversas do WhatsApp oficial que a IA transferiu para uma pessoa — categoria editável na triagem"
        right={
          <button style={{ display: 'inline-flex', alignItems: 'center', gap: 7, border: 'none', cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: '#fff', background: op.primary, borderRadius: 10, padding: '9px 16px' }}>
            <CIc n="shuffle" s={15} c="#fff" /> Redistribuir vencidos
          </button>
        }
      />
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
        {cats.map((x) => (
          <button key={x} onClick={() => setCat(x)} style={{ border: `1px solid ${cat === x ? op.primary : op.g300}`, cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: 600, padding: '6px 14px', borderRadius: 999, background: cat === x ? op.primary : '#fff', color: cat === x ? '#fff' : op.g700 }}>
            {x}{x === 'Todas' ? ` (${FILA.length})` : ''}
          </button>
        ))}
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 760 }}>
          <thead><tr>
            <th style={th}>Contato</th><th style={th}>Categoria</th><th style={th}>Motivo</th><th style={th}>Origem</th><th style={th}>Espera</th><th style={th}>SLA</th><th style={th}></th>
          </tr></thead>
          <tbody>
            {rows.map((r) => {
              const [cfg, cbg, cic] = CAT_TONE[r.cat];
              const [sfg, sbg] = SLA_TONE[r.sla];
              const open = openId === r.id;
              return (
                <React.Fragment key={r.id}>
                  <tr onClick={() => setOpenId(open ? null : r.id)} style={{ cursor: 'pointer', background: open ? op.lilac1 : 'transparent' }}
                    onMouseEnter={(e) => { if (!open) (e.currentTarget as HTMLTableRowElement).style.background = op.lilac1; }}
                    onMouseLeave={(e) => { if (!open) (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'; }}>
                    <td style={td}>
                      <div style={{ fontWeight: 700, color: op.ink }}>{r.nome}</div>
                      <div style={{ fontSize: 12, color: op.g500, display: 'flex', alignItems: 'center', gap: 5 }}><CIc n="lock" s={11} c={op.g500} />{r.fone}</div>
                    </td>
                    <td style={td}><OpBadge text={r.cat} fg={cfg} bg={cbg} ic={cic} /></td>
                    <td style={{ ...td, maxWidth: 280 }}><span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.motivo}</span></td>
                    <td style={td}>{r.origem}</td>
                    <td style={{ ...td, fontWeight: 700, color: op.ink, whiteSpace: 'nowrap' }}>{r.espera}</td>
                    <td style={td}><OpBadge text={r.sla} fg={sfg} bg={sbg} /></td>
                    <td style={{ ...td, textAlign: 'right' }}>
                      <button onClick={(e) => e.stopPropagation()} style={{ border: `1px solid ${op.g300}`, cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12.5, color: op.primary, background: '#fff', borderRadius: 9, padding: '7px 14px', whiteSpace: 'nowrap' }}>Assumir</button>
                    </td>
                  </tr>
                  {open && (
                    <tr><td colSpan={7} style={{ padding: 0, borderBottom: `1px solid ${op.g100}` }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1.2fr) minmax(260px, 1fr)', gap: 0, background: op.lilac1 }} className="op-detail">
                        {/* conversa */}
                        <div style={{ padding: '18px 22px', borderRight: `1px solid ${op.g300}` }}>
                          <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: op.g500, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <CIc n="message-circle" s={13} c={op.g500} /> Conversa (WhatsApp oficial)
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                            {r.conversa.map((m: any, i: number) => (
                              <div key={i} style={{ alignSelf: m.de === 'cliente' ? 'flex-start' : 'flex-end', maxWidth: '85%', background: m.de === 'cliente' ? '#fff' : op.lilac2, border: `1px solid ${m.de === 'cliente' ? op.g300 : 'transparent'}`, borderRadius: 12, padding: '9px 13px' }}>
                                <div style={{ fontSize: 13, color: op.ink, lineHeight: 1.45 }}>{m.m}</div>
                                <div style={{ fontSize: 10.5, color: op.g500, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                                  {m.de === 'ia' && <CIc n="bot" s={11} c={op.primary} />}{m.de === 'ia' ? `IA ${demo.nomeCurto}` : r.nome} · {m.t}
                                </div>
                              </div>
                            ))}
                          </div>
                          <div style={{ marginTop: 12, fontSize: 12, color: op.g500, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <CIc n="link" s={12} c={op.g500} /> {r.vinculo}
                          </div>
                        </div>
                        {/* timeline */}
                        <div style={{ padding: '18px 22px' }}>
                          <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: op.g500, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <CIc n="history" s={13} c={op.g500} /> Linha do tempo
                          </div>
                          {r.timeline.map((t: any, i: number) => (
                            <div key={i} style={{ display: 'flex', gap: 11, marginBottom: i < r.timeline.length - 1 ? 13 : 0 }}>
                              <span style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0, background: t.warn ? op.warnBg : t.ok ? op.successBg : '#fff', border: `1px solid ${t.warn ? op.warning : t.ok ? op.success : op.g300}`, display: 'grid', placeItems: 'center' }}>
                                <CIc n={t.ic} s={14} c={t.warn ? op.warning : t.ok ? op.success : op.g700} />
                              </span>
                              <div>
                                <div style={{ fontSize: 12.5, color: op.ink, lineHeight: 1.4 }}>{t.d}</div>
                                <div style={{ fontSize: 11, color: op.g500, marginTop: 2 }}>{t.t}</div>
                              </div>
                            </div>
                          ))}
                          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                            <button style={{ border: 'none', cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12.5, color: '#fff', background: op.primary, borderRadius: 9, padding: '8px 14px' }}>Assumir conversa</button>
                            <button style={{ border: `1px solid ${op.g300}`, cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12.5, color: op.g700, background: '#fff', borderRadius: 9, padding: '8px 14px' }}>Reatribuir</button>
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

/* ---------------- ANTI-DESINTERMEDIAÇÃO ---------------- */
function OpAntiDesint() {
  const RISCO_TONE: any = { Alto: [op.error, op.errBg], 'Médio': [op.warning, op.warnBg], Baixo: [op.success, op.successBg] };
  return (
    <div style={{ ...opCard, padding: 22 }}>
      <OpHead title="Anti-desintermediação" sub="Tentativas de levar a conversa para fora do WhatsApp oficial — bloqueio automático, revisão humana" />
      {ANTIDESINT.map((d, i) => {
        const [fg, bg] = RISCO_TONE[d.risco];
        return (
          <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 4px', borderBottom: i < ANTIDESINT.length - 1 ? `1px solid ${op.g100}` : 'none', flexWrap: 'wrap' }}>
            <span style={{ width: 34, height: 34, borderRadius: 10, background: bg, display: 'grid', placeItems: 'center', flexShrink: 0 }}><CIc n="shield-alert" s={17} c={fg} /></span>
            <div style={{ flex: 1, minWidth: 220 }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: op.ink }}>{d.quem}</div>
              <div style={{ fontSize: 12.5, color: op.g500, marginTop: 2, fontStyle: 'italic' }}>{d.trecho}</div>
            </div>
            <OpBadge text={d.acao} fg={op.primary} bg={op.lilac2} />
            <OpBadge text={`risco ${d.risco}`} fg={fg} bg={bg} />
            <span style={{ fontSize: 12, color: op.g500, whiteSpace: 'nowrap' }}>{d.quando}</span>
            <div style={{ display: 'flex', gap: 7 }}>
              <button style={{ border: `1px solid ${op.g300}`, cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12, color: op.g700, background: '#fff', borderRadius: 8, padding: '6px 12px' }}>Liberar</button>
              <button style={{ border: 'none', cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12, color: '#fff', background: op.primary, borderRadius: 8, padding: '6px 12px' }}>Manter bloqueio</button>
            </div>
          </div>
        );
      })}
      <div style={{ marginTop: 14, padding: '10px 14px', background: op.lilac1, border: `1px solid ${op.lilac2}`, borderRadius: 10, fontSize: 12.5, color: op.g700, display: 'flex', alignItems: 'center', gap: 8 }}>
        <CIc n="info" s={14} c={op.primary} />
        O telefone do lead fica mascarado para o corretor até a fase de visita — toda revelação é registrada na trilha de auditoria.
      </div>
    </div>
  );
}

/* ---------------- SAÚDE DO BOT ---------------- */
function OpBotSaude() {
  const max = Math.max(...TRANSFER_MOTIVOS.map((m) => m.v));
  return (
    <div style={{ ...opCard, padding: 22 }}>
      <OpHead title="Saúde do atendimento IA" sub="Por que as conversas chegam a um humano — hoje" right={<OpBadge text="janela 24h: 96% dentro" fg={op.success} bg={op.successBg} ic="clock" />} />
      {TRANSFER_MOTIVOS.map((m) => (
        <div key={m.l} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 11 }}>
          <span style={{ width: 168, fontSize: 12.5, color: op.g700, flexShrink: 0, lineHeight: 1.25 }}>{m.l}</span>
          <div style={{ flex: 1, height: 10, background: op.g100, borderRadius: 999, overflow: 'hidden' }}>
            <div style={{ width: `${(m.v / max) * 100}%`, height: '100%', background: m.c, borderRadius: 999 }} />
          </div>
          <span style={{ width: 34, fontSize: 12.5, fontWeight: 700, color: op.ink, textAlign: 'right' }}>{m.v}</span>
        </div>
      ))}
      <div style={{ display: 'flex', gap: 18, marginTop: 16, paddingTop: 14, borderTop: `1px solid ${op.g100}`, flexWrap: 'wrap' }}>
        {[['IA resolveu sozinha', '81%', op.success], ['Transferiu p/ humano', '14%', op.info], ['Sem resposta do lead', '5%', op.g500]].map(([l, v, c]: any) => (
          <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ width: 9, height: 9, borderRadius: 3, background: c }} />
            <span style={{ fontSize: 12.5, color: op.g700 }}>{l}</span>
            <span style={{ fontSize: 12.5, fontWeight: 800, color: op.ink }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- PAGE ---------------- */
export default function CeoOperacaoPage() {
  return (
    <CeoChrome>
      <style>{`@media (max-width: 920px){ .op-detail { grid-template-columns: 1fr !important; } .op-detail > div:first-child { border-right: none !important; border-bottom: 1px solid ${op.g300}; } }`}</style>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 30, letterSpacing: '-0.02em', margin: 0, color: op.ink }}>Atendimento & filas</h1>
            <div style={{ fontSize: 13.5, color: op.g500, marginTop: 4 }}>Rede inteira · quinta, 11 de junho · o que a IA transferiu e precisa de uma pessoa</div>
          </div>
          <OpBadge text="Tempo real" fg={op.success} bg={op.successBg} ic="activity" />
        </div>

        <OpSummary />
        <OpFila />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 18 }}>
          <OpAntiDesint />
          <OpBotSaude />
        </div>
      </div>
    </CeoChrome>
  );
}
