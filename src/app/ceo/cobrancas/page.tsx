"use client";
import * as React from "react";
import CeoChrome, { ceoPalette, CIc } from "@/components/ceo/CeoChrome";
const { useState } = React;

const cb: any = {
  ...ceoPalette,
  info: '#3E82E0', infoBg: '#E5EEFB',
  successBg: '#E6F4EC', warnBg: '#FBF1DC', errBg: '#FAE5E5',
  p3: '#818CF8', p3bg: '#E0E7FF',
};
const cbCard = { background: '#fff', border: `1px solid ${cb.g300}`, borderRadius: 16 };

function CbBadge({ text, fg, bg, ic }: any) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: fg, background: bg, borderRadius: 999, padding: '3px 10px', whiteSpace: 'nowrap' }}>
      {ic && <CIc n={ic} s={12} c={fg} />}{text}
    </span>
  );
}
function CbHead({ title, sub, right }: any) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
      <div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: cb.ink }}>{title}</div>
        {sub && <div style={{ fontSize: 13, color: cb.g500, marginTop: 2 }}>{sub}</div>}
      </div>
      {right}
    </div>
  );
}
const th: React.CSSProperties = { textAlign: 'left', fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: cb.g500, padding: '10px 14px', borderBottom: `1px solid ${cb.g100}`, whiteSpace: 'nowrap' };
const td: React.CSSProperties = { padding: '13px 14px', fontSize: 13.5, color: cb.g700, borderBottom: `1px solid ${cb.g100}`, verticalAlign: 'middle' };
const btnP: React.CSSProperties = { border: 'none', cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12.5, color: '#fff', background: cb.primary, borderRadius: 9, padding: '8px 14px' };
const btnO: React.CSSProperties = { border: `1px solid ${cb.g300}`, cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12.5, color: cb.g700, background: '#fff', borderRadius: 9, padding: '8px 14px' };

const ST_TONE: any = {
  'Paga': [cb.success, cb.successBg], 'Em aberto': [cb.info, cb.infoBg], 'Atrasada': [cb.error, cb.errBg],
  'Estornada': [cb.g700, cb.g100], 'Cancelada': [cb.g500, cb.g100],
};

/* ---------------- DATA ---------------- */
const DIVERGENCIAS: any[] = [
  { id: 'dv1', tipo: 'Valor a maior', ref: 'aluguel:c-204:2026-06', quem: 'Apto Espinheiro · M. Souza', nosso: 'R$ 3.200,00', asaas: 'R$ 3.350,00', causa: 'Provável multa+juros pagos no boleto — confirmar antes de baixar', sev: 'warn' },
  { id: 'dv2', tipo: 'Cobrança desconhecida', ref: 'pay_99812 (só no Asaas)', quem: '—', nosso: '—', asaas: 'R$ 99,00', causa: 'Pagamento sem cobrança correspondente no sistema', sev: 'err' },
  { id: 'dv3', tipo: 'Estorno c/ repasse liquidado', ref: 'aluguel:c-088:2026-05', quem: 'Apto Pina · P. Nunes', nosso: 'R$ 2.400,00', asaas: 'estornado', causa: 'Repasse ao proprietário já foi pago — decidir compensação no próximo ciclo', sev: 'err' },
  { id: 'dv4', tipo: 'Pago após cancelamento', ref: 'assinatura:u-12:2026-06', quem: 'Unidade Caruaru', nosso: 'cancelada', asaas: 'R$ 1.900,00', causa: 'Boleto antigo pago após troca de plano', sev: 'warn' },
];

const COBRANCAS: any[] = [
  {
    id: 'c1', quem: 'Maria Souza', det: 'Aluguel · Apto Espinheiro', ref: 'aluguel:c-204:2026-06', tipo: 'Aluguel',
    valor: 'R$ 3.200,00', venc: '10/06', status: 'Paga', metodo: 'Boleto',
    trilha: [
      { t: '01/06', d: 'Cobrança criada (chave idempotente — reprocessar não duplica)', ic: 'file-plus' },
      { t: '01/06', d: 'Boleto enviado por WhatsApp + e-mail', ic: 'send' },
      { t: '11/06', d: 'Webhook Asaas: PAGA · R$ 3.350,00 (multa+juros) → divergência aberta', ic: 'alert-triangle', warn: true },
    ],
  },
  {
    id: 'c2', quem: 'Imobiliária Costa & Filhos', det: 'Assinatura · plano Associado', ref: 'assinatura:u-7:2026-06', tipo: 'Assinatura',
    valor: 'R$ 450,00', venc: '05/06', status: 'Atrasada', metodo: 'Boleto',
    trilha: [
      { t: '25/05', d: 'Cobrança recorrente gerada', ic: 'repeat' },
      { t: '06/06', d: '1º lembrete automático (WhatsApp oficial)', ic: 'bot' },
      { t: '09/06', d: '2º lembrete + aviso de suspensão de assentos em D+10', ic: 'bell-ring', warn: true },
    ],
  },
  {
    id: 'c3', quem: 'Pedro Nunes', det: 'Aluguel · Apto Pina', ref: 'aluguel:c-088:2026-05', tipo: 'Aluguel',
    valor: 'R$ 2.400,00', venc: '12/05', status: 'Estornada', metodo: 'Pix',
    trilha: [
      { t: '12/05', d: 'Paga via Pix', ic: 'check', ok: true },
      { t: '14/05', d: 'Repasse ao proprietário liquidado (R$ 2.112,00)', ic: 'arrow-up-from-line', ok: true },
      { t: '09/06', d: 'ESTORNO solicitado (pagamento em duplicidade) · Financeiro + justificativa', ic: 'undo-2' },
      { t: '09/06', d: 'Estorno lançado no razão espelhando o original · repasse já pago → divergência aberta para compensação', ic: 'alert-triangle', warn: true },
    ],
  },
  {
    id: 'c4', quem: 'Tech Soluções Ltda', det: '1º aluguel · Sala Ilha do Leite', ref: 'aluguel:c-310:2026-06', tipo: 'Aluguel',
    valor: 'R$ 5.500,00', venc: '15/06', status: 'Em aberto', metodo: 'Boleto',
    trilha: [{ t: '10/06', d: 'Cobrança criada junto com o contrato (mesma transação — ou tudo, ou nada)', ic: 'file-plus' }],
  },
  {
    id: 'c5', quem: 'Lucas Ferreira (corretor)', det: 'Pacote de créditos Radar · 5.000', ref: 'credito:lf-9:2026-06', tipo: 'Créditos',
    valor: 'R$ 119,00', venc: '08/06', status: 'Paga', metodo: 'Cartão',
    trilha: [
      { t: '08/06', d: 'Compra no painel do corretor', ic: 'shopping-cart' },
      { t: '08/06', d: 'Webhook: PAGA → créditos liberados na hora (bolso COMPRA, não expira)', ic: 'zap', ok: true },
    ],
  },
];

const REPASSES: any[] = [
  { quem: 'Heloísa Quintas', det: 'Apto Madalena · junho', liq: 'R$ 2.540,00', st: 'Transferido', tone: ['', ''] },
  { quem: 'Rodrigo Tenório', det: 'Casa Setúbal · junho', liq: 'R$ 3.190,00', st: 'Sem dado bancário', nota: 'IA pediu os dados por WhatsApp — 2º lembrete hoje' },
  { quem: 'Beatriz Nóbrega', det: 'Apto Casa Amarela · junho', liq: 'R$ 1.640,00', st: 'Falhou — reprocessar', nota: 'conta encerrada no banco · retry é idempotente, não paga 2×' },
];
const REP_TONE: any = { 'Transferido': [cb.success, cb.successBg], 'Sem dado bancário': [cb.warning, cb.warnBg], 'Falhou — reprocessar': [cb.error, cb.errBg] };

const ANTECIPACOES: any[] = [
  { quem: 'Lucas Ferreira', tier: 'Elite · score 912', base: 'Comissão confirmada — Casa Candeias', val: 'R$ 40.000,00', liq: 'R$ 39.000,00', alerta: 'acima do limite de auto-aprovação (R$ 25 mil)' },
  { quem: 'Renata Alves', tier: 'Consolidado · score 740', base: 'Comissão confirmada — Apto Graças', val: 'R$ 15.000,00', liq: 'R$ 14.625,00', alerta: 'teto mensal da rede em 82% — conferido na aprovação' },
];

/* ---------------- SUMMARY ---------------- */
function CbSummary() {
  const cards = [
    { l: 'Conciliados hoje', v: '307/312', d: '98,4% automático', ic: 'check-check', good: true },
    { l: 'Divergências abertas', v: '4', d: 'decisão humana', ic: 'alert-triangle', hl: true },
    { l: 'Cobranças atrasadas', v: '23', d: 'R$ 86 mil · 3,2%', ic: 'clock-alert' },
    { l: 'Repasses pendentes', v: '2', d: '1 falha bancária', ic: 'arrow-up-from-line' },
    { l: 'Antecipações p/ aprovar', v: '2', d: 'R$ 55 mil solicitados', ic: 'hand-coins' },
    { l: 'Estornos no mês', v: '3', d: 'R$ 7,1 mil', ic: 'undo-2' },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(172px, 1fr))', gap: 14 }}>
      {cards.map((c) => (
        <div key={c.l} style={{ background: c.hl ? `linear-gradient(135deg, ${cb.primary}, ${cb.deep})` : '#fff', border: c.hl ? 'none' : `1px solid ${cb.g300}`, borderRadius: 16, padding: 18, boxShadow: c.hl ? 'var(--shadow-purple)' : 'none', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: c.hl ? 'rgba(255,255,255,.85)' : cb.g500, lineHeight: 1.3 }}>{c.l}</span>
            <span style={{ width: 30, height: 30, borderRadius: 8, background: c.hl ? 'rgba(255,255,255,.18)' : cb.lilac2, display: 'grid', placeItems: 'center', flexShrink: 0 }}><CIc n={c.ic} s={15} c={c.hl ? '#fff' : cb.primary} /></span>
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, lineHeight: 1.15, color: c.hl ? '#fff' : cb.ink, marginTop: 14, letterSpacing: '-0.01em' }}>{c.v}</div>
          <div style={{ fontSize: 11.5, color: c.hl ? 'rgba(255,255,255,.7)' : c.good ? cb.success : cb.g500, marginTop: 9, fontWeight: c.good ? 700 : 400 }}>{c.d}</div>
        </div>
      ))}
    </div>
  );
}

/* ---------------- CONCILIAÇÃO ---------------- */
function CbConciliacao() {
  return (
    <div style={{ ...cbCard, padding: 22 }}>
      <CbHead title="Conciliação — fila de divergências" sub="O que o sistema registra × o que o Asaas confirma. O caso seguro se autocorrige; estes precisam de você"
        right={<CbBadge text="resolução exige justificativa" fg={cb.warning} bg={cb.warnBg} ic="file-text" />} />
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 780 }}>
          <thead><tr>
            <th style={th}>Tipo</th><th style={th}>Referência</th><th style={th}>Nosso valor</th><th style={th}>Asaas</th><th style={th}>Causa provável</th><th style={th}></th>
          </tr></thead>
          <tbody>
            {DIVERGENCIAS.map((d) => (
              <tr key={d.id}>
                <td style={td}><CbBadge text={d.tipo} fg={d.sev === 'err' ? cb.error : cb.warning} bg={d.sev === 'err' ? cb.errBg : cb.warnBg} ic="alert-triangle" /></td>
                <td style={td}>
                  <div style={{ fontFamily: 'monospace', fontSize: 12, color: cb.ink, fontWeight: 600 }}>{d.ref}</div>
                  <div style={{ fontSize: 11.5, color: cb.g500 }}>{d.quem}</div>
                </td>
                <td style={{ ...td, fontWeight: 700, color: cb.ink, whiteSpace: 'nowrap' }}>{d.nosso}</td>
                <td style={{ ...td, fontWeight: 700, color: cb.ink, whiteSpace: 'nowrap' }}>{d.asaas}</td>
                <td style={{ ...td, maxWidth: 260, fontSize: 12.5, lineHeight: 1.4 }}>{d.causa}</td>
                <td style={{ ...td, textAlign: 'right' }}><button style={{ ...btnP, padding: '7px 14px', fontSize: 12 }}>Resolver</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 14, padding: '10px 14px', background: cb.lilac1, border: `1px solid ${cb.lilac2}`, borderRadius: 10, fontSize: 12.5, color: cb.g700, display: 'flex', alignItems: 'center', gap: 8 }}>
        <CIc n="shield-check" s={14} c={cb.primary} />
        Todo dia o sistema confere com o Asaas as cobranças que mudaram — se um aviso de pagamento se perder, a conferência diária pega. Nenhum pagamento fica para trás.
      </div>
    </div>
  );
}

/* ---------------- COBRANÇAS ---------------- */
function CbCobrancas() {
  const [f, setF] = useState('Todas');
  const [openId, setOpenId] = useState<string | null>('c3');
  const filtros = ['Todas', 'Paga', 'Em aberto', 'Atrasada', 'Estornada'];
  const rows = COBRANCAS.filter((r) => f === 'Todas' || r.status === f);
  return (
    <div style={{ ...cbCard, padding: 22 }}>
      <CbHead title="Cobranças" sub="Aluguel, assinaturas, créditos e taxas — clique para ver a trilha completa" />
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
        {filtros.map((x) => (
          <button key={x} onClick={() => setF(x)} style={{ border: `1px solid ${f === x ? cb.primary : cb.g300}`, cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: 600, padding: '6px 14px', borderRadius: 999, background: f === x ? cb.primary : '#fff', color: f === x ? '#fff' : cb.g700 }}>{x}</button>
        ))}
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
          <thead><tr>
            <th style={th}>Pagador</th><th style={th}>Tipo</th><th style={th}>Valor</th><th style={th}>Venc.</th><th style={th}>Método</th><th style={th}>Status</th><th style={th}></th>
          </tr></thead>
          <tbody>
            {rows.map((r) => {
              const [sfg, sbg] = ST_TONE[r.status];
              const open = openId === r.id;
              const podeEstornar = r.status === 'Paga';
              return (
                <React.Fragment key={r.id}>
                  <tr onClick={() => setOpenId(open ? null : r.id)} style={{ cursor: 'pointer', background: open ? cb.lilac1 : 'transparent' }}
                    onMouseEnter={(e) => { if (!open) (e.currentTarget as HTMLTableRowElement).style.background = cb.lilac1; }}
                    onMouseLeave={(e) => { if (!open) (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'; }}>
                    <td style={td}>
                      <div style={{ fontWeight: 700, color: cb.ink }}>{r.quem}</div>
                      <div style={{ fontSize: 12, color: cb.g500 }}>{r.det}</div>
                    </td>
                    <td style={td}><CbBadge text={r.tipo} fg={cb.primary} bg={cb.lilac2} /></td>
                    <td style={{ ...td, fontWeight: 700, color: cb.ink, whiteSpace: 'nowrap' }}>{r.valor}</td>
                    <td style={td}>{r.venc}</td>
                    <td style={td}>{r.metodo}</td>
                    <td style={td}><CbBadge text={r.status} fg={sfg} bg={sbg} /></td>
                    <td style={{ ...td, textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <button onClick={(e) => e.stopPropagation()} style={{ ...btnO, padding: '6px 11px', fontSize: 12, marginRight: 6 }}>2ª via</button>
                      <button onClick={(e) => e.stopPropagation()} disabled={!podeEstornar} title={podeEstornar ? 'Estornar (exige justificativa)' : 'Só cobrança paga pode ser estornada — o servidor recusa as demais'}
                        style={{ ...btnO, padding: '6px 11px', fontSize: 12, color: podeEstornar ? cb.error : cb.g300, borderColor: podeEstornar ? cb.error : cb.g100, cursor: podeEstornar ? 'pointer' : 'not-allowed' }}>Estornar</button>
                    </td>
                  </tr>
                  {open && (
                    <tr><td colSpan={7} style={{ padding: 0, borderBottom: `1px solid ${cb.g100}` }}>
                      <div style={{ background: cb.lilac1, padding: '18px 22px' }}>
                        <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: cb.g500, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <CIc n="history" s={13} c={cb.g500} /> Trilha — <span style={{ fontFamily: 'monospace', textTransform: 'none', letterSpacing: 0 }}>{r.ref}</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px 22px' }}>
                          {r.trilha.map((t: any, i: number) => (
                            <div key={i} style={{ display: 'flex', gap: 11 }}>
                              <span style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0, background: t.warn ? cb.warnBg : t.ok ? cb.successBg : '#fff', border: `1px solid ${t.warn ? cb.warning : t.ok ? cb.success : cb.g300}`, display: 'grid', placeItems: 'center' }}>
                                <CIc n={t.ic} s={14} c={t.warn ? cb.warning : t.ok ? cb.success : cb.g700} />
                              </span>
                              <div>
                                <div style={{ fontSize: 12.5, color: cb.ink, lineHeight: 1.4 }}>{t.d}</div>
                                <div style={{ fontSize: 11, color: cb.g500, marginTop: 2 }}>{t.t}</div>
                              </div>
                            </div>
                          ))}
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
      <div style={{ marginTop: 14, padding: '10px 14px', background: cb.errBg, border: `1px solid #f0c9c9`, borderRadius: 10, fontSize: 12.5, color: cb.g700, display: 'flex', alignItems: 'center', gap: 8 }}>
        <CIc n="undo-2" s={14} c={cb.error} />
        <span><b style={{ color: cb.ink }}>Regra do estorno:</b> só cobrança <b>paga</b> estorna, sempre com justificativa. Se o repasse ou a comissão já foram pagos, o sistema <b>não desfaz sozinho</b> — abre uma divergência para o Financeiro decidir a compensação.</span>
      </div>
    </div>
  );
}

/* ---------------- REPASSES & ANTECIPAÇÕES ---------------- */
function CbRepasses() {
  return (
    <div style={{ ...cbCard, padding: 22 }}>
      <CbHead title="Repasses aos proprietários" sub="Junho · aluguel recebido − taxa de administração" right={<CbBadge text="R$ 520 mil no mês" fg={cb.primary} bg={cb.lilac2} ic="arrow-up-from-line" />} />
      {REPASSES.map((r, i) => {
        const [fg, bg] = REP_TONE[r.st];
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 4px', borderBottom: i < REPASSES.length - 1 ? `1px solid ${cb.g100}` : 'none', flexWrap: 'wrap' }}>
            <span style={{ width: 34, height: 34, borderRadius: 10, background: bg || cb.successBg, display: 'grid', placeItems: 'center', flexShrink: 0 }}><CIc n="landmark" s={16} c={fg || cb.success} /></span>
            <div style={{ flex: 1, minWidth: 180 }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: cb.ink }}>{r.quem}</div>
              <div style={{ fontSize: 12, color: cb.g500 }}>{r.det}{r.nota ? <span style={{ color: cb.warning, fontWeight: 600 }}> · {r.nota}</span> : ''}</div>
            </div>
            <span style={{ fontWeight: 800, color: cb.ink, fontFamily: 'var(--font-display)', fontSize: 14.5, whiteSpace: 'nowrap' }}>{r.liq}</span>
            <CbBadge text={r.st} fg={fg} bg={bg} />
            {r.st === 'Falhou — reprocessar' && <button style={{ ...btnO, padding: '6px 12px', fontSize: 12 }}>Reprocessar</button>}
          </div>
        );
      })}
    </div>
  );
}

function CbAntecipacoes() {
  return (
    <div style={{ ...cbCard, padding: 22 }}>
      <CbHead title="Antecipações — aprovação" sub="Comissão confirmada · taxa de 2,5% · acima do limite de auto-aprovação" right={<CbBadge text="teto do mês: 82% usado" fg={cb.warning} bg={cb.warnBg} ic="gauge" />} />
      {ANTECIPACOES.map((a, i) => (
        <div key={i} style={{ border: `1px solid ${cb.g300}`, borderRadius: 12, padding: '14px 16px', marginBottom: i < ANTECIPACOES.length - 1 ? 12 : 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 180 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: cb.ink }}>{a.quem}</div>
              <div style={{ fontSize: 12, color: cb.g500, marginTop: 2 }}>{a.tier} · {a.base}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 17, color: cb.ink }}>{a.liq}</div>
              <div style={{ fontSize: 11.5, color: cb.g500 }}>solicitado {a.val}</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={btnP}>Aprovar</button>
              <button style={{ ...btnO, color: cb.error, borderColor: cb.error }}>Recusar</button>
            </div>
          </div>
          <div style={{ marginTop: 10, fontSize: 12, color: cb.warning, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
            <CIc n="alert-triangle" s={13} c={cb.warning} /> {a.alerta}
          </div>
        </div>
      ))}
      <div style={{ marginTop: 14, padding: '10px 14px', background: cb.lilac1, border: `1px solid ${cb.lilac2}`, borderRadius: 10, fontSize: 12.5, color: cb.g700, display: 'flex', alignItems: 'center', gap: 8 }}>
        <CIc n="shield-check" s={14} c={cb.primary} />
        Ao aprovar, o sistema reconfere <b>na hora</b> elegibilidade, tier e teto do mês — se algo mudou desde que a tela abriu, a aprovação é recusada com o motivo.
      </div>
    </div>
  );
}

/* ---------------- PAGE ---------------- */
export default function CeoCobrancasPage() {
  return (
    <CeoChrome>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 30, letterSpacing: '-0.02em', margin: 0, color: cb.ink }}>Cobranças & repasses</h1>
            <div style={{ fontSize: 13.5, color: cb.g500, marginTop: 4 }}>Rede inteira · quinta, 11 de junho · o dia a dia do dinheiro — conciliação, estorno e aprovações</div>
          </div>
          <CbBadge text="Asaas conectado · sandbox" fg={cb.success} bg={cb.successBg} ic="plug-zap" />
        </div>

        <CbSummary />
        <CbConciliacao />
        <CbCobrancas />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 18 }}>
          <CbRepasses />
          <CbAntecipacoes />
        </div>
      </div>
    </CeoChrome>
  );
}
