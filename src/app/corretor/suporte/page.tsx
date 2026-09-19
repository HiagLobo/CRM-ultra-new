"use client";
import * as React from "react";
import CorretorChrome, { pal, Ic } from "@/components/corretor/CorretorChrome";
import { brand } from "@/config/brand";
import { demo } from "@/config/demo";
const { useState } = React;

const sp: any = { ...pal, info: '#3E82E0', infoBg: '#E5EEFB', p3: '#818CF8', p3bg: '#E0E7FF' };
const spCard = { background: '#fff', border: `1px solid ${sp.g300}`, borderRadius: 16 };

function SpBadge({ text, fg, bg, ic }: any) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: fg, background: bg, borderRadius: 999, padding: '3px 10px', whiteSpace: 'nowrap' }}>
      {ic && <Ic n={ic} s={12} c={fg} />}{text}
    </span>
  );
}
const btnP: React.CSSProperties = { border: 'none', cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: '#fff', background: sp.primary, borderRadius: 10, padding: '10px 18px' };
const btnO: React.CSSProperties = { border: `1px solid ${sp.g300}`, cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12.5, color: sp.g700, background: '#fff', borderRadius: 9, padding: '8px 14px' };

const ST_TONE: any = {
  'Aberto': [sp.info, sp.infoBg],
  'Em atendimento': [sp.primary, sp.lilac2],
  'Aguardando você': [sp.warning, sp.warningBg],
  'Resolvido': [sp.success, sp.successBg],
};

/* ---------------- DATA ---------------- */
const MEUS_REDE: any[] = [
  {
    id: '#1051', titulo: 'Dúvida sobre o rateio da parceria com a Joana', cat: 'Dúvida', quando: 'hoje 08:30',
    status: 'Em atendimento', resp: `Suporte ${demo.nomeCurto} · Carla M.`, sla: 'resposta até 16:30',
    thread: [
      { de: 'eu', t: '08:30', m: 'Fechei uma venda em co-corretagem. O sistema divide a comissão automaticamente ou preciso pedir?' },
      { de: 'sup', t: '09:10', m: 'Oi, Júlia! Divide sim — pelo percentual combinado na parceria (no seu caso 50/50). Você acompanha em Comissões > a receber. 😊' },
    ],
  },
  {
    id: '#1033', titulo: 'Cliente não recebeu o boleto da reserva', cat: 'Financeiro', quando: '08/06',
    status: 'Resolvido', resp: `Suporte ${demo.nomeCurto} · Tiago R.`, nota: 5,
    thread: [
      { de: 'eu', t: '08/06 14:20', m: 'Minha cliente do Apto Graças diz que o boleto não chegou no e-mail.' },
      { de: 'sup', t: '08/06 14:55', m: 'E-mail estava com erro de digitação no cadastro. Corrigi e reenviei — chegou agora. Confere com ela?' },
      { de: 'eu', t: '08/06 15:30', m: 'Chegou! Obrigada 🙏' },
    ],
  },
];

const MEUS_TI: any[] = [
  {
    id: '#T-208', titulo: `Upload de fotos trava em 80% no ${demo.sigla}-1502`, cat: 'Erro', quando: 'ontem 16:40',
    status: 'Aguardando você', resp: `Equipe técnica · ${brand.nomeCurto}`, sev: 'Média',
    contexto: 'Capturado automaticamente: página /corretor/imoveis · Chrome 126 · Android',
    thread: [
      { de: 'eu', t: 'ontem 16:40', m: 'O upload trava em 80% sempre nas mesmas 3 fotos. Print anexado.', anexo: 'print-erro.png' },
      { de: 'dev', t: 'hoje 09:05', m: 'Olá, Júlia! Identificamos: as 3 fotos passam de 25 MB (limite por arquivo). Vamos subir o aviso mais cedo na tela — enquanto isso, pode reduzir a resolução e tentar de novo?' },
    ],
  },
  {
    id: '#T-194', titulo: 'Lentidão no funil no fim do dia', cat: 'Lentidão', quando: '02/06',
    status: 'Resolvido', resp: `Equipe técnica · ${brand.nomeCurto}`, sev: 'Baixa', nota: 4,
    contexto: 'Capturado: página /corretor/funil · pico 18h',
    thread: [
      { de: 'eu', t: '02/06', m: 'Todo fim de tarde o funil demora pra carregar.' },
      { de: 'dev', t: '04/06', m: 'Otimizamos a consulta do funil na versão 1.8.2 (publicada hoje). Deve carregar em menos de 1s agora — qualquer coisa, reabre este chamado em até 7 dias.' },
    ],
  },
];

const SERVICOS = [
  { n: 'Plataforma (app e site)', st: 'Operacional', ok: true },
  { n: 'WhatsApp oficial (IA)', st: 'Operacional', ok: true },
  { n: 'Pagamentos (boletos/Pix)', st: 'Operacional', ok: true },
  { n: 'Radar & mapas', st: 'Manutenção sáb 02h–04h', ok: true, manut: true },
];

/* ---------------- STATUS BANNER ---------------- */
function SpStatus() {
  return (
    <div style={{ ...spCard, padding: '16px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: sp.success, boxShadow: `0 0 0 4px ${sp.successBg}` }} />
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15, color: sp.ink }}>Todos os sistemas operacionais</span>
        <span style={{ fontSize: 12, color: sp.g500 }}>· atualizado agora · versão 1.8.2</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8 }}>
        {SERVICOS.map((s) => (
          <div key={s.n} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 11px', background: sp.page, borderRadius: 10 }}>
            <Ic n={s.manut ? 'wrench' : 'check-circle-2'} s={14} c={s.manut ? sp.warning : sp.success} />
            <span style={{ flex: 1, fontSize: 12.5, color: sp.g700 }}>{s.n}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: s.manut ? sp.warning : sp.success }}>{s.st}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- ABRIR CHAMADO ---------------- */
function SpAbrir({ tipo }: { tipo: 'rede' | 'ti' }) {
  const cats = tipo === 'rede' ? ['Financeiro', 'Operacional', 'Dúvida'] : ['Erro', 'Lentidão', 'Dúvida técnica', 'Sugestão'];
  const [cat, setCat] = useState<string | null>(null);
  return (
    <div style={{ ...spCard, padding: 22, border: `2px dashed ${sp.g300}`, background: sp.page }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <span style={{ width: 38, height: 38, borderRadius: 11, background: sp.lilac2, display: 'grid', placeItems: 'center' }}>
          <Ic n={tipo === 'rede' ? 'life-buoy' : 'bug'} s={19} c={sp.primary} />
        </span>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15.5, color: sp.ink }}>
            {tipo === 'rede' ? `Abrir chamado para o time da ${demo.nomeCurto}` : 'Reportar problema com o sistema'}
          </div>
          <div style={{ fontSize: 12.5, color: sp.g500 }}>
            {tipo === 'rede' ? 'Dúvidas de comissão, leads, contratos e operação' : 'Vai direto para a equipe técnica — a página atual e o navegador são anexados automaticamente'}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        {cats.map((c) => (
          <button key={c} onClick={() => setCat(c)} style={{ border: `1px solid ${cat === c ? sp.primary : sp.g300}`, cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: 600, padding: '7px 15px', borderRadius: 999, background: cat === c ? sp.primary : '#fff', color: cat === c ? '#fff' : sp.g700 }}>{c}</button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <input placeholder={tipo === 'rede' ? 'Descreva em uma frase…' : 'O que aconteceu? Em qual tela?'} style={{ flex: 1, minWidth: 220, border: `1px solid ${sp.g300}`, borderRadius: 10, padding: '10px 14px', fontFamily: 'var(--font-body)', fontSize: 13.5, outline: 'none', background: '#fff' }} />
        <button style={{ ...btnO, display: 'inline-flex', alignItems: 'center', gap: 6 }}><Ic n="paperclip" s={14} c={sp.g700} /> Anexar print</button>
        <button style={btnP}>Abrir chamado</button>
      </div>
      {tipo === 'ti' && (
        <div style={{ fontSize: 11.5, color: sp.g500, marginTop: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Ic n="info" s={12} c={sp.g500} /> Problema grave (sistema fora do ar)? Marque "Erro" — severidade alta aciona a equipe na hora, qualquer dia/horário.
        </div>
      )}
    </div>
  );
}

/* ---------------- LISTA ---------------- */
function SpLista({ itens, tipo }: { itens: any[]; tipo: 'rede' | 'ti' }) {
  const [openId, setOpenId] = useState<string | null>(itens[0]?.id ?? null);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {itens.map((r) => {
        const [sfg, sbg] = ST_TONE[r.status];
        const open = openId === r.id;
        return (
          <div key={r.id} style={{ ...spCard, overflow: 'hidden' }}>
            <button onClick={() => setOpenId(open ? null : r.id)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '15px 18px', border: 'none', background: open ? sp.lilac1 : '#fff', cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font-body)' }}>
              <span style={{ width: 36, height: 36, borderRadius: 10, background: sp.lilac2, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <Ic n={tipo === 'rede' ? 'life-buoy' : 'bug'} s={17} c={sp.primary} />
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: sp.ink, lineHeight: 1.3 }}>{r.id} · {r.titulo}</div>
                <div style={{ fontSize: 12, color: sp.g500, marginTop: 2 }}>{r.cat} · aberto {r.quando} · {r.resp}{r.sla ? ` · ${r.sla}` : ''}</div>
              </div>
              <SpBadge text={r.status} fg={sfg} bg={sbg} />
              <Ic n={open ? 'chevron-up' : 'chevron-down'} s={16} c={sp.g500} />
            </button>
            {open && (
              <div style={{ borderTop: `1px solid ${sp.g100}`, padding: '16px 18px', background: sp.lilac1 }}>
                {r.contexto && (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: sp.g500, background: '#fff', border: `1px solid ${sp.g300}`, borderRadius: 999, padding: '4px 11px', marginBottom: 12 }}>
                    <Ic n="monitor-smartphone" s={12} c={sp.g500} /> {r.contexto}
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 12 }}>
                  {r.thread.map((m: any, i: number) => (
                    <div key={i} style={{ alignSelf: m.de === 'eu' ? 'flex-end' : 'flex-start', maxWidth: '88%', background: m.de === 'eu' ? sp.lilac2 : '#fff', border: `1px solid ${m.de === 'eu' ? 'transparent' : sp.g300}`, borderRadius: 12, padding: '9px 13px' }}>
                      <div style={{ fontSize: 13, color: sp.ink, lineHeight: 1.45 }}>{m.m}</div>
                      {m.anexo && (
                        <div style={{ marginTop: 6, display: 'inline-flex', alignItems: 'center', gap: 6, background: sp.g100, borderRadius: 8, padding: '5px 10px', fontSize: 11.5, fontWeight: 600, color: sp.g700 }}>
                          <Ic n="paperclip" s={12} c={sp.g700} /> {m.anexo}
                        </div>
                      )}
                      <div style={{ fontSize: 10.5, color: sp.g500, marginTop: 4 }}>{m.de === 'eu' ? 'Você' : m.de === 'dev' ? 'Equipe técnica' : `Suporte ${demo.nomeCurto}`} · {m.t}</div>
                    </div>
                  ))}
                </div>
                {r.status === 'Resolvido' ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 13px', background: sp.successBg, borderRadius: 10, fontSize: 12.5, fontWeight: 700, color: sp.ink }}>
                      <Ic n="star" s={14} c={sp.warning} /> Você avaliou com {r.nota}/5
                    </div>
                    <button style={btnO}>Reabrir (até 7 dias)</button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input placeholder="Responder…" style={{ flex: 1, border: `1px solid ${sp.g300}`, borderRadius: 10, padding: '9px 13px', fontFamily: 'var(--font-body)', fontSize: 13, outline: 'none', background: '#fff' }} />
                    <button style={{ ...btnP, padding: '8px 16px' }}>Enviar</button>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ---------------- PAGE ---------------- */
export default function CorretorSuportePage() {
  const [tab, setTab] = useState<'rede' | 'ti'>('rede');
  return (
    <CorretorChrome title="Suporte" subtitle={`Precisa de ajuda? O time da ${demo.nomeCurto} e a equipe técnica respondem por aqui.`} searchPlaceholder="Buscar chamado">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 980 }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <SpBadge text="resposta em até 8h úteis" fg={sp.primary} bg={sp.lilac2} ic="alarm-clock" />
        </div>

        <SpStatus />

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 6, background: sp.g100, borderRadius: 12, padding: 4, alignSelf: 'flex-start' }}>
          {([['rede', 'life-buoy', `Suporte ${demo.nomeCurto}`], ['ti', 'bug', 'Problema com o sistema']] as any[]).map(([k, ic, lb]) => (
            <button key={k} onClick={() => setTab(k)} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, border: 'none', cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, padding: '9px 18px', borderRadius: 9, background: tab === k ? '#fff' : 'transparent', color: tab === k ? sp.primary : sp.g500, boxShadow: tab === k ? 'var(--shadow-sm)' : 'none' }}>
              <Ic n={ic} s={15} c={tab === k ? sp.primary : sp.g500} /> {lb}
            </button>
          ))}
        </div>

        <SpAbrir tipo={tab} />
        <SpLista itens={tab === 'rede' ? MEUS_REDE : MEUS_TI} tipo={tab} />
      </div>
    </CorretorChrome>
  );
}
