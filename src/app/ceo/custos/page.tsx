"use client";
import * as React from "react";
import CeoChrome, { ceoPalette, CIc } from "@/components/ceo/CeoChrome";
import { demo } from "@/config/demo";
const { useState, useMemo } = React;

const cs: any = {
  ...ceoPalette,
  info: '#3E82E0', infoBg: '#E5EEFB',
  successBg: '#E6F4EC', warnBg: '#FBF1DC', errBg: '#FAE5E5',
  p3: '#818CF8', p3bg: '#E0E7FF',
};
const csCard = { background: '#fff', border: `1px solid ${cs.g300}`, borderRadius: 16 };

function CsBadge({ text, fg, bg, ic }: any) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: fg, background: bg, borderRadius: 999, padding: '3px 10px', whiteSpace: 'nowrap' }}>
      {ic && <CIc n={ic} s={12} c={fg} />}{text}
    </span>
  );
}
function CsHead({ title, sub, right }: any) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
      <div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: cs.ink }}>{title}</div>
        {sub && <div style={{ fontSize: 13, color: cs.g500, marginTop: 2 }}>{sub}</div>}
      </div>
      {right}
    </div>
  );
}
const btnP: React.CSSProperties = { border: 'none', cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12.5, color: '#fff', background: cs.primary, borderRadius: 9, padding: '8px 14px' };
const btnO: React.CSSProperties = { border: `1px solid ${cs.g300}`, cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12.5, color: cs.g700, background: '#fff', borderRadius: 9, padding: '8px 14px' };
const inp: React.CSSProperties = { border: `1px solid ${cs.g300}`, borderRadius: 8, padding: '6px 9px', fontFamily: 'var(--font-body)', fontSize: 12.5, outline: 'none', background: '#fff', width: 90 };

const money = (n: number) => 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/* ---------------- DATA (valores de exemplo, fictícios) ---------------- */
type Item = { id: string; nome: string; det: string; qtd: number; un: string; vu: number; repasse?: string };

const FIXOS_INI: Item[] = [
  { id: 'f1', nome: 'Hospedagem (site + painéis)', det: 'plano profissional · frontend', qtd: 1, un: 'mês', vu: 120 },
  { id: 'f2', nome: 'Servidor de aplicação', det: 'API, IA e processamento', qtd: 1, un: 'mês', vu: 180 },
  { id: 'f3', nome: 'Banco de dados gerenciado', det: 'PostgreSQL + ambiente de testes', qtd: 1, un: 'mês', vu: 110 },
  { id: 'f4', nome: 'Armazenamento de arquivos', det: 'fotos, documentos, áudios', qtd: 1, un: 'mês', vu: 40 },
  { id: 'f5', nome: 'E-mail transacional', det: 'boletos, avisos, notificações', qtd: 1, un: 'mês', vu: 90 },
  { id: 'f6', nome: 'Monitoramento & logs', det: 'alertas, uptime, rastreio de erros', qtd: 1, un: 'mês', vu: 80 },
  { id: 'f7', nome: 'Domínio, DNS & proteção de borda', det: 'anti-bot e firewall de aplicação', qtd: 1, un: 'mês', vu: 75 },
  { id: 'f8', nome: 'Suíte de produtividade', det: 'e-mail corporativo e reuniões', qtd: 1, un: 'mês', vu: 150 },
];

const VAR_INI: Item[] = [
  { id: 'v1', nome: 'IA — atendimento completo', det: 'conversa + extração CRM + resumo + áudio + template', qtd: 6200, un: 'atendimento', vu: 0.15 },
  { id: 'v2', nome: 'IA — resumo de reunião', det: 'transcrição + resumo', qtd: 260, un: 'reunião', vu: 0.05 },
  { id: 'v3', nome: 'Radar — sinais + geocodificação', det: 'análise de oportunidade', qtd: 4100, un: 'oportunidade', vu: 0.02 },
  { id: 'v4', nome: 'Avaliação de imóvel (AVM)', det: 'comparáveis próprios + modelo de IA', qtd: 380, un: 'avaliação', vu: 0.01 },
  { id: 'v5', nome: 'Bureau de crédito', det: 'média ponderada entre bureaus', qtd: 65, un: 'consulta', vu: 10, repasse: 'repassado na taxa de análise' },
  { id: 'v6', nome: 'Validação CRECI', det: 'serviço de consulta · por uso', qtd: 14, un: 'consulta', vu: 0.8 },
  { id: 'v7', nome: 'Boleto', det: 'emissão · tabela do gateway', qtd: 1050, un: 'boleto', vu: 1.5, repasse: `conta do gateway em nome da ${demo.nomeCurto}` },
];

/* ---------------- TABELA EDITÁVEL ---------------- */
function CsTabela({ titulo, sub, itens, setItens, fixo }: any) {
  const [novo, setNovo] = useState(false);
  const [nNome, setNNome] = useState(''); const [nQtd, setNQtd] = useState('1'); const [nVu, setNVu] = useState('');
  const total = itens.reduce((s: number, i: Item) => s + i.qtd * i.vu, 0);
  const upd = (id: string, campo: 'qtd' | 'vu', val: string) => {
    const n = parseFloat(val.replace(',', '.'));
    setItens((arr: Item[]) => arr.map((i) => i.id === id ? { ...i, [campo]: isNaN(n) ? 0 : n } : i));
  };
  const remover = (id: string) => setItens((arr: Item[]) => arr.filter((i) => i.id !== id));
  const adicionar = () => {
    if (!nNome.trim()) return;
    const vu = parseFloat(nVu.replace(',', '.')) || 0;
    const qtd = parseFloat(nQtd.replace(',', '.')) || 1;
    setItens((arr: Item[]) => [...arr, { id: 'n' + Date.now(), nome: nNome.trim(), det: 'adicionado manualmente', qtd, un: fixo ? 'mês' : 'unidade', vu }]);
    setNovo(false); setNNome(''); setNQtd('1'); setNVu('');
  };
  return (
    <div style={{ ...csCard, padding: 22 }}>
      <CsHead title={titulo} sub={sub}
        right={<CsBadge text={`subtotal ${money(total)}/mês`} fg={cs.primary} bg={cs.lilac2} />} />
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
          <thead><tr>
            {['Item', fixo ? '' : 'Volume/mês', 'Custo unitário', 'Total/mês', ''].filter((h, i) => !(fixo && i === 1)).map((h) => (
              <th key={h || 'a'} style={{ textAlign: h === 'Item' ? 'left' : 'right', fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: cs.g500, padding: '8px 12px', borderBottom: `1px solid ${cs.g100}`, whiteSpace: 'nowrap' }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {itens.map((i: Item) => (
              <tr key={i.id}
                onMouseEnter={(e) => (e.currentTarget as HTMLTableRowElement).style.background = cs.lilac1}
                onMouseLeave={(e) => (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'}>
                <td style={{ padding: '11px 12px', borderBottom: `1px solid ${cs.g100}` }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: cs.ink }}>{i.nome}</div>
                  <div style={{ fontSize: 11.5, color: cs.g500 }}>{i.det}</div>
                  {i.repasse && <div style={{ marginTop: 4 }}><CsBadge text={i.repasse} fg={cs.success} bg={cs.successBg} ic="corner-up-right" /></div>}
                </td>
                {!fixo && (
                  <td style={{ padding: '11px 12px', borderBottom: `1px solid ${cs.g100}`, textAlign: 'right' }}>
                    <input style={{ ...inp, textAlign: 'right' }} defaultValue={i.qtd} onBlur={(e) => upd(i.id, 'qtd', e.target.value)} />
                    <div style={{ fontSize: 10.5, color: cs.g500, marginTop: 2 }}>{i.un}s</div>
                  </td>
                )}
                <td style={{ padding: '11px 12px', borderBottom: `1px solid ${cs.g100}`, textAlign: 'right' }}>
                  <input style={{ ...inp, textAlign: 'right' }} defaultValue={i.vu.toLocaleString('pt-BR', { maximumFractionDigits: 4 })} onBlur={(e) => upd(i.id, 'vu', e.target.value)} />
                  <div style={{ fontSize: 10.5, color: cs.g500, marginTop: 2 }}>por {i.un}</div>
                </td>
                <td style={{ padding: '11px 12px', borderBottom: `1px solid ${cs.g100}`, textAlign: 'right', fontWeight: 800, fontFamily: 'var(--font-display)', fontSize: 14, color: cs.ink, whiteSpace: 'nowrap' }}>{money(i.qtd * i.vu)}</td>
                <td style={{ padding: '11px 6px', borderBottom: `1px solid ${cs.g100}`, textAlign: 'right' }}>
                  <button title="Remover item" onClick={() => remover(i.id)} style={{ width: 30, height: 30, border: `1px solid ${cs.g300}`, background: '#fff', borderRadius: 8, display: 'inline-grid', placeItems: 'center', cursor: 'pointer' }}>
                    <CIc n="trash-2" s={14} c={cs.error} />
                  </button>
                </td>
              </tr>
            ))}
            {novo && (
              <tr style={{ background: cs.lilac1 }}>
                <td style={{ padding: '11px 12px' }}>
                  <input autoFocus placeholder="Nome do custo…" value={nNome} onChange={(e) => setNNome(e.target.value)} style={{ ...inp, width: 220 }} />
                </td>
                {!fixo && <td style={{ padding: '11px 12px', textAlign: 'right' }}><input placeholder="qtd" value={nQtd} onChange={(e) => setNQtd(e.target.value)} style={{ ...inp, textAlign: 'right' }} /></td>}
                <td style={{ padding: '11px 12px', textAlign: 'right' }}><input placeholder="R$" value={nVu} onChange={(e) => setNVu(e.target.value)} style={{ ...inp, textAlign: 'right' }} /></td>
                <td colSpan={2} style={{ padding: '11px 12px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                  <button onClick={adicionar} style={{ ...btnP, padding: '7px 12px', marginRight: 6 }}>Salvar</button>
                  <button onClick={() => setNovo(false)} style={{ ...btnO, padding: '7px 12px' }}>Cancelar</button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {!novo && (
        <button onClick={() => setNovo(true)} style={{ ...btnO, marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 7 }}>
          <CIc n="plus" s={14} c={cs.g700} /> Adicionar custo
        </button>
      )}
    </div>
  );
}

/* ---------------- PAGE ---------------- */
export default function CeoCustosPage() {
  const [fixos, setFixos] = useState<Item[]>(FIXOS_INI);
  const [vars, setVars] = useState<Item[]>(VAR_INI);

  const totFixo = useMemo(() => fixos.reduce((s, i) => s + i.qtd * i.vu, 0), [fixos]);
  const totVar = useMemo(() => vars.reduce((s, i) => s + i.qtd * i.vu, 0), [vars]);
  const totRepasse = useMemo(() => vars.filter((i) => i.repasse).reduce((s, i) => s + i.qtd * i.vu, 0), [vars]);
  const total = totFixo + totVar;
  const liquido = total - totRepasse;
  const corretores = 342;

  const kpis = [
    { l: 'Custo total do sistema', v: money(total), d: 'junho · 342 corretores na rede', ic: 'server', hl: true },
    { l: 'Custo líquido (após repasses)', v: money(liquido), d: `${money(totRepasse)} repassados`, ic: 'wallet', good: true },
    { l: 'Fixo (infra)', v: money(totFixo), d: `${fixos.length} serviços`, ic: 'database' },
    { l: 'Variável (por uso)', v: money(totVar), d: 'cresce com o negócio', ic: 'trending-up' },
    { l: 'Custo por corretor', v: money(total / corretores), d: 'mensalidade mínima cobre 8×', ic: 'users', good: true },
    { l: 'Projeção no dobro (684)', v: money(totFixo + totVar * 2), d: 'fixo não dobra — escala bem', ic: 'rocket' },
  ];

  return (
    <CeoChrome>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 30, letterSpacing: '-0.02em', margin: 0, color: cs.ink }}>Custos do sistema</h1>
            <div style={{ fontSize: 13.5, color: cs.g500, marginTop: 4 }}>Quanto custa rodar a plataforma — alimentado pela TI, visível só para CEO e TI</div>
          </div>
          <CsBadge text="acesso restrito: CEO + TI" fg={cs.error} bg={cs.errBg} ic="lock" />
        </div>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(172px, 1fr))', gap: 14 }}>
          {kpis.map((c) => (
            <div key={c.l} style={{ background: c.hl ? `linear-gradient(135deg, ${cs.primary}, ${cs.deep})` : '#fff', border: c.hl ? 'none' : `1px solid ${cs.g300}`, borderRadius: 16, padding: 18, boxShadow: c.hl ? 'var(--shadow-purple)' : 'none', minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <span style={{ fontSize: 12.5, fontWeight: 600, color: c.hl ? 'rgba(255,255,255,.85)' : cs.g500, lineHeight: 1.3 }}>{c.l}</span>
                <span style={{ width: 30, height: 30, borderRadius: 8, background: c.hl ? 'rgba(255,255,255,.18)' : cs.lilac2, display: 'grid', placeItems: 'center', flexShrink: 0 }}><CIc n={c.ic} s={15} c={c.hl ? '#fff' : cs.primary} /></span>
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 21, lineHeight: 1.15, color: c.hl ? '#fff' : cs.ink, marginTop: 14, letterSpacing: '-0.01em' }}>{c.v}</div>
              <div style={{ fontSize: 11.5, color: c.hl ? 'rgba(255,255,255,.7)' : c.good ? cs.success : cs.g500, marginTop: 9, fontWeight: c.good ? 700 : 400 }}>{c.d}</div>
            </div>
          ))}
        </div>

        {/* composição visual */}
        <div style={{ ...csCard, padding: 22 }}>
          <CsHead title="Composição do custo mensal" sub="Fixo escala devagar; variável acompanha o uso — repassáveis em verde" />
          <div style={{ height: 18, borderRadius: 999, overflow: 'hidden', display: 'flex', marginBottom: 12 }}>
            <div title="Infra fixa" style={{ width: `${(totFixo / total) * 100}%`, background: cs.primary }} />
            <div title="Variável (líquido)" style={{ width: `${((totVar - totRepasse) / total) * 100}%`, background: cs.p3 }} />
            <div title="Repassado" style={{ width: `${(totRepasse / total) * 100}%`, background: cs.success }} />
          </div>
          <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
            {[['Infra fixa', money(totFixo), cs.primary], ['Variável (custo nosso)', money(totVar - totRepasse), cs.p3], ['Repassado (bureau + boleto)', money(totRepasse), cs.success]].map(([l, v, c]: any) => (
              <span key={l} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 12.5, color: cs.g700 }}>
                <span style={{ width: 10, height: 10, borderRadius: 3, background: c }} /> {l}: <b style={{ color: cs.ink }}>{v}</b>
              </span>
            ))}
          </div>
        </div>

        <CsTabela titulo="Infra fixa" sub={`Serviços contratados — todos nas contas do CNPJ da ${demo.nomeCurto}`} itens={fixos} setItens={setFixos} fixo />
        <CsTabela titulo="Variáveis por uso" sub="Volume editável — total recalcula na hora · valores unitários de exemplo (jun/2026)" itens={vars} setItens={setVars} />

        <div style={{ ...csCard, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <CIc n="history" s={16} c={cs.primary} />
          <span style={{ fontSize: 12.5, color: cs.g700, flex: 1 }}>
            Toda alteração fica registrada (quem mudou, o quê, quando) — no sistema real, com trilha de auditoria e histórico mensal para comparar a evolução.
          </span>
          <button style={btnO}>Exportar (planilha)</button>
          <button style={btnP}>Salvar fechamento de junho</button>
        </div>
      </div>
    </CeoChrome>
  );
}
