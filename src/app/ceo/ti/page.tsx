"use client";
import * as React from "react";
import CeoChrome, { ceoPalette, CIc } from "@/components/ceo/CeoChrome";
const { useState } = React;

const ti: any = {
  ...ceoPalette,
  info: '#3E82E0', infoBg: '#E5EEFB',
  successBg: '#E6F4EC', warnBg: '#FBF1DC', errBg: '#FAE5E5',
  p3: '#818CF8', p3bg: '#E0E7FF',
};
const tiCard = { background: '#fff', border: `1px solid ${ti.g300}`, borderRadius: 16 };

function TiBadge({ text, fg, bg, ic }: any) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: fg, background: bg, borderRadius: 999, padding: '3px 10px', whiteSpace: 'nowrap' }}>
      {ic && <CIc n={ic} s={12} c={fg} />}{text}
    </span>
  );
}
function TiHead({ title, sub, right }: any) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
      <div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: ti.ink }}>{title}</div>
        {sub && <div style={{ fontSize: 13, color: ti.g500, marginTop: 2 }}>{sub}</div>}
      </div>
      {right}
    </div>
  );
}
const th: React.CSSProperties = { textAlign: 'left', fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: ti.g500, padding: '10px 14px', borderBottom: `1px solid ${ti.g100}`, whiteSpace: 'nowrap' };
const td: React.CSSProperties = { padding: '13px 14px', fontSize: 13.5, color: ti.g700, borderBottom: `1px solid ${ti.g100}`, verticalAlign: 'middle' };

const SEV_TONE: any = { 'Crítica': [ti.error, ti.errBg], 'Alta': [ti.error, ti.errBg], 'Média': [ti.warning, ti.warnBg], 'Baixa': [ti.g700, ti.g100] };
const ST_TONE: any = {
  'Em triagem': [ti.info, ti.infoBg], 'Em correção': [ti.primary, ti.lilac2],
  'Aguardando usuário': [ti.warning, ti.warnBg], 'Resolvido': [ti.success, ti.successBg],
};

/* ---------------- DATA ---------------- */
const SERVICOS = [
  { n: 'Aplicação (painéis e site)', up: '99,98%', lat: '180 ms', ok: true },
  { n: 'WhatsApp oficial + IA', up: '99,95%', lat: '2,1 s/resposta', ok: true },
  { n: 'Pagamentos (Asaas)', up: '99,99%', lat: '320 ms', ok: true },
  { n: 'Radar & mapas', up: '99,90%', lat: '450 ms', ok: true, manut: 'manutenção sáb 02h–04h' },
  { n: 'Consultas de bureau', up: '99,7%', lat: '4–6 s', ok: true },
  { n: 'Fila de processamento', up: '—', lat: '0 pendências antigas', ok: true },
];

const CHAMADOS_TI: any[] = [
  {
    id: '#T-208', titulo: 'Upload de fotos trava em 80%', quem: 'Júlia Castro · Corretora', papel: 'Corretor',
    sev: 'Média', status: 'Aguardando usuário', dev: 'Parceiro de TI · Caio', aberto: 'ontem 16:40',
    contexto: '/corretor/imoveis · Chrome 126 · Android', afeta: '3 usuários relataram',
    diag: 'Arquivos acima do limite de 25 MB — aviso da tela aparece tarde demais. Correção de UX programada para a v1.8.3.',
  },
  {
    id: '#T-207', titulo: 'Relatório mensal exporta com fuso errado', quem: 'Marina Costa · Financeiro', papel: 'Financeiro',
    sev: 'Baixa', status: 'Em correção', dev: 'Parceiro de TI · Caio', aberto: '09/06',
    contexto: '/ceo/relatorios · Edge 125 · Windows', afeta: 'só exportação CSV',
    diag: 'Datas em UTC no CSV. Correção pronta em homologação — entra na v1.8.3 (sex).',
  },
  {
    id: '#T-205', titulo: 'IA respondeu fora de contexto em 2 conversas', quem: 'Rafael Lima · Operação', papel: 'Operação',
    sev: 'Alta', status: 'Em triagem', dev: '— triagem —', aberto: 'hoje 07:15',
    contexto: 'fila de atendimento · conversas #4812 e #4815', afeta: '2 conversas (clientes já atendidos por humano)',
    diag: 'Conversas adicionadas ao conjunto de testes da IA. Investigando se o caso entra na regra de transferência por baixa confiança.',
  },
  {
    id: '#T-201', titulo: 'Lentidão no funil no fim do dia', quem: 'Júlia Castro · Corretora', papel: 'Corretor',
    sev: 'Baixa', status: 'Resolvido', dev: 'Parceiro de TI · Caio', aberto: '02/06', nota: 4,
    contexto: '/corretor/funil · pico 18h', afeta: 'rede inteira no horário de pico',
    diag: 'Consulta do funil otimizada na v1.8.2. Tempo de carga: 3,2s → 0,8s.',
  },
];

const CHANGELOG = [
  { v: '1.8.2', data: '04/06', itens: ['Funil 4× mais rápido no horário de pico', 'Correção: notificação duplicada no sino', 'Novo: filtro por categoria na fila de atendimento'], tipo: 'atual' },
  { v: '1.8.1', data: '21/05', itens: ['Segurança: dependências atualizadas (rotina mensal)', 'Correção: máscara de telefone em leads de portal'], tipo: '' },
  { v: '1.8.0', data: '07/05', itens: ['Novo: aprovação de antecipações em lote', 'Melhoria: busca global 2× mais rápida'], tipo: '' },
];

/* ---------------- SUMMARY ---------------- */
function TiSummary() {
  const cards = [
    { l: 'Status geral', v: 'Operacional', d: 'uptime 99,97% (30d)', ic: 'activity', good: true, hl: true },
    { l: 'Chamados técnicos abertos', v: '3', d: '1 de severidade alta', ic: 'bug' },
    { l: 'Tempo médio de correção', v: '2,1 dias', d: 'SLA: crítica 4h · alta 24h', ic: 'timer', good: true },
    { l: 'Horas do contrato (jun)', v: '13,5/24h', d: '10,5h disponíveis', ic: 'hourglass' },
    { l: 'Incidentes técnicos (30d)', v: '0', d: 'último: nenhum', ic: 'shield-check', good: true },
    { l: 'Próxima versão', v: '1.8.3', d: 'sexta · 2 correções', ic: 'rocket' },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(172px, 1fr))', gap: 14 }}>
      {cards.map((c) => (
        <div key={c.l} style={{ background: c.hl ? `linear-gradient(135deg, ${ti.primary}, ${ti.deep})` : '#fff', border: c.hl ? 'none' : `1px solid ${ti.g300}`, borderRadius: 16, padding: 18, boxShadow: c.hl ? 'var(--shadow-purple)' : 'none', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: c.hl ? 'rgba(255,255,255,.85)' : ti.g500, lineHeight: 1.3 }}>{c.l}</span>
            <span style={{ width: 30, height: 30, borderRadius: 8, background: c.hl ? 'rgba(255,255,255,.18)' : ti.lilac2, display: 'grid', placeItems: 'center', flexShrink: 0 }}><CIc n={c.ic} s={15} c={c.hl ? '#fff' : ti.primary} /></span>
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: c.hl ? 21 : 24, lineHeight: 1.15, color: c.hl ? '#fff' : ti.ink, marginTop: 14, letterSpacing: '-0.01em' }}>{c.v}</div>
          <div style={{ fontSize: 11.5, color: c.hl ? 'rgba(255,255,255,.7)' : c.good ? ti.success : ti.g500, marginTop: 9, fontWeight: c.good ? 700 : 400 }}>{c.d}</div>
        </div>
      ))}
    </div>
  );
}

/* ---------------- SERVIÇOS ---------------- */
function TiServicos() {
  return (
    <div style={{ ...tiCard, padding: 22 }}>
      <TiHead title="Status dos serviços" sub="Monitorado de fora a cada minuto — o mesmo status que corretores veem na página de Suporte"
        right={<TiBadge text="página pública de status" fg={ti.primary} bg={ti.lilac2} ic="external-link" />} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10 }}>
        {SERVICOS.map((s) => (
          <div key={s.n} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 15px', background: ti.page, borderRadius: 12, border: `1px solid ${ti.g100}` }}>
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: ti.success, boxShadow: `0 0 0 3px ${ti.successBg}`, flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: ti.ink }}>{s.n}</div>
              <div style={{ fontSize: 11.5, color: ti.g500 }}>{s.manut ? s.manut : `latência ${s.lat}`}</div>
            </div>
            <span style={{ fontSize: 12.5, fontWeight: 800, color: ti.success, fontFamily: 'var(--font-display)' }}>{s.up}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- CHAMADOS ---------------- */
function TiChamados() {
  const [openId, setOpenId] = useState<string | null>('#T-205');
  return (
    <div style={{ ...tiCard, padding: 22 }}>
      <TiHead title="Chamados técnicos" sub="Abertos por qualquer papel — do corretor ao CEO — e triados pela equipe de desenvolvimento"
        right={<TiBadge text="responsável: parceiro de TI" fg={ti.g700} bg={ti.g100} ic="wrench" />} />
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 820 }}>
          <thead><tr>
            <th style={th}>Chamado</th><th style={th}>Aberto por</th><th style={th}>Severidade</th><th style={th}>Status</th><th style={th}>Responsável</th><th style={th}></th>
          </tr></thead>
          <tbody>
            {CHAMADOS_TI.map((r) => {
              const [vfg, vbg] = SEV_TONE[r.sev];
              const [sfg, sbg] = ST_TONE[r.status];
              const open = openId === r.id;
              return (
                <React.Fragment key={r.id}>
                  <tr onClick={() => setOpenId(open ? null : r.id)} style={{ cursor: 'pointer', background: open ? ti.lilac1 : 'transparent' }}
                    onMouseEnter={(e) => { if (!open) (e.currentTarget as HTMLTableRowElement).style.background = ti.lilac1; }}
                    onMouseLeave={(e) => { if (!open) (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'; }}>
                    <td style={td}>
                      <div style={{ fontWeight: 700, color: ti.ink }}>{r.id} · {r.titulo}</div>
                      <div style={{ fontSize: 12, color: ti.g500 }}>aberto {r.aberto} · {r.afeta}</div>
                    </td>
                    <td style={td}>
                      <div style={{ fontWeight: 600, color: ti.ink, fontSize: 13 }}>{r.quem.split(' · ')[0]}</div>
                      <div style={{ fontSize: 12, color: ti.g500 }}>{r.papel}</div>
                    </td>
                    <td style={td}><TiBadge text={r.sev} fg={vfg} bg={vbg} /></td>
                    <td style={td}><TiBadge text={r.status} fg={sfg} bg={sbg} /></td>
                    <td style={{ ...td, fontSize: 12.5 }}>{r.dev}</td>
                    <td style={{ ...td, textAlign: 'right' }}>
                      <CIc n={open ? 'chevron-up' : 'chevron-down'} s={16} c={ti.g500} />
                    </td>
                  </tr>
                  {open && (
                    <tr><td colSpan={6} style={{ padding: 0, borderBottom: `1px solid ${ti.g100}` }}>
                      <div style={{ background: ti.lilac1, padding: '16px 22px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: ti.g500, background: '#fff', border: `1px solid ${ti.g300}`, borderRadius: 999, padding: '4px 11px', marginBottom: 10 }}>
                          <CIc n="monitor-smartphone" s={12} c={ti.g500} /> contexto capturado: {r.contexto}
                        </div>
                        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', background: '#fff', border: `1px solid ${ti.g300}`, borderRadius: 12, padding: '13px 16px' }}>
                          <CIc n="stethoscope" s={16} c={ti.primary} style={{ marginTop: 1 }} />
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: ti.g500, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 4 }}>Diagnóstico da equipe</div>
                            <div style={{ fontSize: 13, color: ti.ink, lineHeight: 1.5 }}>{r.diag}</div>
                          </div>
                        </div>
                        {r.nota && (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, marginTop: 10, padding: '7px 12px', background: ti.successBg, borderRadius: 10, fontSize: 12.5, fontWeight: 700, color: ti.ink }}>
                            <CIc n="star" s={13} c={ti.warning} /> avaliado pelo usuário com {r.nota}/5
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
      <div style={{ marginTop: 14, padding: '10px 14px', background: ti.lilac1, border: `1px solid ${ti.lilac2}`, borderRadius: 10, fontSize: 12.5, color: ti.g700, display: 'flex', alignItems: 'center', gap: 8 }}>
        <CIc n="siren" s={14} c={ti.primary} />
        Severidade <b>crítica</b> (sistema fora do ar) aciona a equipe a qualquer hora, com SLA de 4h — e abre incidente automaticamente se afetar dados.
      </div>
    </div>
  );
}

/* ---------------- CONTRATO & CHANGELOG ---------------- */
function TiContrato() {
  const usado = 13.5, total = 24;
  const breakdown = [
    { l: 'Correções e chamados', v: 6.0, c: ti.error },
    { l: 'Melhorias solicitadas', v: 4.5, c: ti.primary },
    { l: 'Monitoramento & rotina', v: 3.0, c: ti.info },
  ];
  return (
    <div style={{ ...tiCard, padding: 22 }}>
      <TiHead title="Contrato de manutenção — junho" sub="Parceiro de TI · 24h/mês"
        right={<TiBadge text={`${(total - usado).toLocaleString('pt-BR')}h disponíveis`} fg={ti.success} bg={ti.successBg} />} />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 6 }}>
        <span style={{ color: ti.g700, fontWeight: 600 }}>{usado.toLocaleString('pt-BR')}h usadas</span>
        <span style={{ color: ti.g500 }}>{total}h contratadas</span>
      </div>
      <div style={{ height: 14, background: ti.g100, borderRadius: 999, overflow: 'hidden', display: 'flex', marginBottom: 16 }}>
        {breakdown.map((b) => (
          <div key={b.l} style={{ width: `${(b.v / total) * 100}%`, height: '100%', background: b.c }} />
        ))}
      </div>
      {breakdown.map((b) => (
        <div key={b.l} style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 8 }}>
          <span style={{ width: 10, height: 10, borderRadius: 3, background: b.c, flexShrink: 0 }} />
          <span style={{ flex: 1, fontSize: 12.5, color: ti.g700 }}>{b.l}</span>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: ti.ink }}>{b.v.toLocaleString('pt-BR')}h</span>
        </div>
      ))}
      <div style={{ marginTop: 12, padding: '10px 14px', background: ti.page, border: `1px solid ${ti.g100}`, borderRadius: 10, fontSize: 12, color: ti.g500, lineHeight: 1.5 }}>
        Horas não usadas não acumulam · demandas acima do teto viram orçamento à parte, aprovado antes.
      </div>
    </div>
  );
}

function TiChangelog() {
  return (
    <div style={{ ...tiCard, padding: 22 }}>
      <TiHead title="O que mudou — changelog" sub="Cada versão publicada, em linguagem de gente" right={<TiBadge text="v1.8.2 atual" fg={ti.primary} bg={ti.lilac2} ic="rocket" />} />
      {CHANGELOG.map((c, i) => (
        <div key={c.v} style={{ display: 'flex', gap: 12, marginBottom: i < CHANGELOG.length - 1 ? 4 : 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ width: 30, height: 30, borderRadius: '50%', background: c.tipo === 'atual' ? ti.primary : ti.lilac2, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <CIc n="git-commit-horizontal" s={15} c={c.tipo === 'atual' ? '#fff' : ti.primary} />
            </span>
            {i < CHANGELOG.length - 1 && <span style={{ width: 1, flex: 1, background: ti.g300, margin: '2px 0' }} />}
          </div>
          <div style={{ paddingBottom: 16, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 14.5, color: ti.ink }}>v{c.v}</span>
              <span style={{ fontSize: 12, color: ti.g500 }}>{c.data}</span>
            </div>
            <ul style={{ margin: '6px 0 0', paddingLeft: 18 }}>
              {c.itens.map((it) => <li key={it} style={{ fontSize: 12.5, color: ti.g700, lineHeight: 1.55 }}>{it}</li>)}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------------- PAGE ---------------- */
export default function CeoTiPage() {
  return (
    <CeoChrome>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 30, letterSpacing: '-0.02em', margin: 0, color: ti.ink }}>TI & Plataforma</h1>
            <div style={{ fontSize: 13.5, color: ti.g500, marginTop: 4 }}>Saúde do sistema, chamados técnicos e o contrato de manutenção — em um lugar só</div>
          </div>
          <TiBadge text="Operacional · uptime 99,97%" fg={ti.success} bg={ti.successBg} ic="activity" />
        </div>

        <TiSummary />
        <TiServicos />
        <TiChamados />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 18 }}>
          <TiContrato />
          <TiChangelog />
        </div>
      </div>
    </CeoChrome>
  );
}
