"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { mockAuth } from "@/lib/auth";
import { ceoPalette, CIc } from "@/components/ceo/CeoChrome";
import { brand } from "@/config/brand";
import { demo } from "@/config/demo";
import GuiaDemo from "@/components/guia/GuiaDemo";
const { useState } = React;

const fq: any = {
  ...ceoPalette,
  info: '#3E82E0', infoBg: '#E5EEFB',
  successBg: '#E6F4EC', warnBg: '#FBF1DC', errBg: '#FAE5E5',
  p3: '#818CF8', p3bg: '#E0E7FF',
};
const fqCard = { background: '#fff', border: `1px solid ${fq.g300}`, borderRadius: 16 };

function FqBadge({ text, fg, bg, ic }: any) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: fg, background: bg, borderRadius: 999, padding: '3px 10px', whiteSpace: 'nowrap' }}>
      {ic && <CIc n={ic} s={12} c={fg} />}{text}
    </span>
  );
}
function FqHead({ title, sub, right }: any) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
      <div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: fq.ink }}>{title}</div>
        {sub && <div style={{ fontSize: 13, color: fq.g500, marginTop: 2 }}>{sub}</div>}
      </div>
      {right}
    </div>
  );
}
const btnP: React.CSSProperties = { border: 'none', cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12.5, color: '#fff', background: fq.primary, borderRadius: 9, padding: '8px 14px' };
const btnO: React.CSSProperties = { border: `1px solid ${fq.g300}`, cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12.5, color: fq.g700, background: '#fff', borderRadius: 9, padding: '8px 14px' };
const th: React.CSSProperties = { textAlign: 'left', fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: fq.g500, padding: '10px 14px', borderBottom: `1px solid ${fq.g100}`, whiteSpace: 'nowrap' };
const td: React.CSSProperties = { padding: '13px 14px', fontSize: 13.5, color: fq.g700, borderBottom: `1px solid ${fq.g100}`, verticalAlign: 'middle' };

/* ---------------- NAV (âncoras — tudo nesta página) ---------------- */
const NAV = [
  { id: 'visao', label: 'Visão da unidade', icon: 'layout-dashboard' },
  { id: 'time', label: 'Meu time', icon: 'users' },
  { id: 'leads', label: 'Leads & funil', icon: 'megaphone' },
  { id: 'plano', label: 'Plano & assentos', icon: 'credit-card' },
  { id: 'candidatos', label: 'Indicar corretor', icon: 'user-plus' },
  { id: 'ranking', label: 'Minha posição na rede', icon: 'trophy' },
];

/* ---------------- DATA ---------------- */
const TIME: any[] = [
  { n: 'Lucas Ferreira', score: 912, tier: 'Elite', vendas: 4, locacoes: 1, leads: 38, conv: '10,5%' },
  { n: 'Renata Alves', score: 786, tier: 'Consolidado', vendas: 2, locacoes: 3, leads: 41, conv: '7,3%' },
  { n: 'Bruno Tavares', score: 740, tier: 'Consolidado', vendas: 2, locacoes: 0, leads: 29, conv: '6,9%' },
  { n: 'Camila Rocha', score: 545, tier: 'Iniciante', vendas: 1, locacoes: 2, leads: 33, conv: '4,1%' },
];
const RECEITA_6M = [
  { m: 'Jan', v: 96 }, { m: 'Fev', v: 104 }, { m: 'Mar', v: 99 },
  { m: 'Abr', v: 121 }, { m: 'Mai', v: 138 }, { m: 'Jun', v: 152 },
];
const FUNIL = [
  { e: 'Leads recebidos', v: 420, c: fq.primary },
  { e: 'Em atendimento', v: 244, c: fq.p3 },
  { e: 'Visita', v: 96, c: fq.info },
  { e: 'Proposta', v: 44, c: fq.warning },
  { e: 'Fechados', v: 30, c: fq.success },
];
const RANKING = [
  { pos: 1, u: 'Unidade ★', fat: 'R$ 188 mil', voce: false },
  { pos: 2, u: `${demo.nomeCurto} Boa Viagem (você)`, fat: 'R$ 152 mil', voce: true },
  { pos: 3, u: 'Unidade B', fat: 'R$ 134 mil', voce: false },
  { pos: 4, u: 'Unidade C', fat: 'R$ 118 mil', voce: false },
];

/* ---------------- SIDEBAR ---------------- */
function FqSidebar({ active, go, aberto, fechar }: { active: string; go: (id: string) => void; aberto: boolean; fechar: () => void }) {
  return (
    <aside className={`fq-side${aberto ? ' aberto' : ''}`} data-tour="fq-menu" style={{ width: 268, minWidth: 268, background: fq.dark, color: '#fff', display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh', flexShrink: 0 }}>
      <div style={{ padding: '20px 18px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <img src="/assets/logo-white.svg" alt={brand.nome} style={{ height: 44 }} />
        <button className="fq-fechar" onClick={fechar} title="Fechar" aria-label="Fechar menu" style={{ width: 34, height: 34, border: '1px solid rgba(255,255,255,.18)', background: 'rgba(255,255,255,.06)', borderRadius: 9, placeItems: 'center', cursor: 'pointer' }}>
          <CIc n="x" s={18} c="#fff" />
        </button>
      </div>
      <div style={{ margin: '0 16px 8px', padding: '8px 12px', background: 'rgba(255,255,255,.08)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
        <CIc n="store" s={15} c="#fff" />
        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.04em' }}>PAINEL DA FRANQUIA</span>
      </div>
      <nav style={{ padding: '8px 12px', flex: 1, overflowY: 'auto' }}>
        {NAV.map((it) => {
          const on = active === it.id;
          return (
            <button key={it.id} onClick={() => go(it.id)} data-tour={`fq-nav-${it.id}`} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 12, border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, textAlign: 'left',
              padding: '10px 14px', borderRadius: 10, marginBottom: 2, position: 'relative',
              background: on ? 'rgba(255,255,255,.16)' : 'transparent',
              color: on ? '#fff' : 'rgba(255,255,255,.78)', transition: 'background .15s ease',
            }}
              onMouseEnter={(e) => { if (!on) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,.08)'; }}
              onMouseLeave={(e) => { if (!on) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}>
              {on && <span style={{ position: 'absolute', left: 0, top: 8, bottom: 8, width: 3, borderRadius: 999, background: '#fff' }} />}
              <CIc n={it.icon} s={20} c={on ? '#fff' : 'rgba(255,255,255,.72)'} />
              <span style={{ flex: 1, lineHeight: 1.2 }}>{it.label}</span>
            </button>
          );
        })}
      </nav>
      <div style={{ padding: 14, margin: 12, background: 'rgba(255,255,255,.08)', borderRadius: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{demo.nomeCurto} Boa Viagem</div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,.7)', lineHeight: 1.5 }}>38 corretores · plano Franquia Premium</div>
      </div>
    </aside>
  );
}

/* ---------------- TOPBAR ---------------- */
function FqTopbar({ abrirMenu }: { abrirMenu: () => void }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  return (
    <header className="fq-top" style={{ minHeight: 72, background: '#fff', borderBottom: `1px solid ${fq.g300}`, display: 'flex', alignItems: 'center', padding: '0 28px', gap: 16, position: 'sticky', top: 0, zIndex: 30 }}>
      {/* mesmo data-tour do menu: no celular o tour destaca o botão que abre a gaveta */}
      <button className="fq-burger" onClick={abrirMenu} title="Menu" aria-label="Abrir menu" data-tour="fq-menu" style={{ width: 42, height: 42, border: `1px solid ${fq.g300}`, background: '#fff', borderRadius: 12, placeItems: 'center', cursor: 'pointer', flexShrink: 0 }}>
        <CIc n="menu" s={22} c={fq.ink} />
      </button>
      <div className="fq-unidade" title="Seu acesso é limitado à sua unidade, garantido pelo servidor" style={{ display: 'flex', alignItems: 'center', gap: 10, border: `1px solid ${fq.g300}`, background: fq.lilac1, borderRadius: 999, padding: '8px 14px', cursor: 'not-allowed' }}>
        <span style={{ width: 30, height: 30, borderRadius: '50%', background: fq.lilac2, display: 'grid', placeItems: 'center' }}>
          <CIc n="store" s={16} c={fq.primary} />
        </span>
        <span style={{ textAlign: 'left', lineHeight: 1.15 }}>
          <span style={{ display: 'block', fontSize: 13.5, fontWeight: 700, color: fq.ink }}>{demo.nomeCurto} Boa Viagem</span>
          <span style={{ display: 'block', fontSize: 11.5, color: fq.g500 }}>sua unidade</span>
        </span>
        <CIc n="lock" s={14} c={fq.g500} />
      </div>
      <div style={{ flex: 1, maxWidth: 420, minWidth: 0, display: 'flex', alignItems: 'center', gap: 10, background: fq.g100, borderRadius: 999, padding: '0 16px', height: 44 }}>
        <CIc n="search" s={18} c={fq.g500} />
        <input placeholder="Buscar na sua unidade…" style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontFamily: 'var(--font-body)', fontSize: 14, color: fq.ink, minWidth: 0 }} />
      </div>
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 14, position: 'relative' }}>
        <button title="Notificações" style={{ width: 42, height: 42, border: `1px solid ${fq.g300}`, background: '#fff', borderRadius: 12, display: 'grid', placeItems: 'center', cursor: 'pointer', position: 'relative' }}>
          <CIc n="bell" s={20} c={fq.g700} />
          <span style={{ position: 'absolute', top: 9, right: 10, width: 8, height: 8, borderRadius: '50%', background: fq.error, border: '2px solid #fff' }} />
        </button>
        <button onClick={() => setOpen((o) => !o)} style={{ display: 'flex', alignItems: 'center', gap: 10, border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px 6px 4px 4px', borderRadius: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: `linear-gradient(135deg, ${fq.light}, ${fq.deep})`, display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 700, fontFamily: 'var(--font-display)' }}>BT</div>
          <div className="fq-nome" style={{ lineHeight: 1.2, textAlign: 'left' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: fq.ink }}>Bruno Tavares</div>
            <div style={{ fontSize: 12, color: fq.g500 }}>Franqueado · Boa Viagem</div>
          </div>
          <CIc n="chevron-down" s={16} c={fq.g500} />
        </button>
        {open && (
          <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, minWidth: 200, background: '#fff', border: `1px solid ${fq.g300}`, borderRadius: 14, boxShadow: 'var(--shadow-lg)', padding: 6, zIndex: 40 }}>
            <button onClick={() => { mockAuth.logout(); router.push('/login'); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, border: 'none', cursor: 'pointer', background: 'transparent', borderRadius: 10, padding: '9px 12px', textAlign: 'left', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 500, color: fq.error }}>
              <CIc n="log-out" s={17} c={fq.error} /> Sair
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

/* ---------------- SEÇÕES ---------------- */
function FqVisao() {
  const cards = [
    { l: 'Faturamento da unidade (jun)', v: 'R$ 152 mil', d: '+10% vs. maio', ic: 'wallet', good: true, hl: true },
    { l: 'Comissões do time', v: 'R$ 96 mil', d: '30 negócios fechados', ic: 'hand-coins' },
    { l: 'Leads recebidos da rede', v: '420', d: 'distribuição automática', ic: 'inbox' },
    { l: 'Conversão da unidade', v: '7,1%', d: 'rede: 6,2%', ic: 'trending-up', good: true },
    { l: 'Score médio do time', v: '746', d: 'meta: 750', ic: 'gauge' },
    { l: 'Posição na rede', v: '2º', d: 'de 86 unidades', ic: 'trophy', good: true },
  ];
  const max = Math.max(...RECEITA_6M.map((x) => x.v));
  return (
    <section id="visao" style={{ scrollMarginTop: 90 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(172px, 1fr))', gap: 14, marginBottom: 18 }}>
        {cards.map((c) => (
          <div key={c.l} style={{ background: c.hl ? `linear-gradient(135deg, ${fq.primary}, ${fq.deep})` : '#fff', border: c.hl ? 'none' : `1px solid ${fq.g300}`, borderRadius: 16, padding: 18, boxShadow: c.hl ? 'var(--shadow-purple)' : 'none', minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <span style={{ fontSize: 12.5, fontWeight: 600, color: c.hl ? 'rgba(255,255,255,.85)' : fq.g500, lineHeight: 1.3 }}>{c.l}</span>
              <span style={{ width: 30, height: 30, borderRadius: 8, background: c.hl ? 'rgba(255,255,255,.18)' : fq.lilac2, display: 'grid', placeItems: 'center', flexShrink: 0 }}><CIc n={c.ic} s={15} c={c.hl ? '#fff' : fq.primary} /></span>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, lineHeight: 1.15, color: c.hl ? '#fff' : fq.ink, marginTop: 14, letterSpacing: '-0.01em' }}>{c.v}</div>
            <div style={{ fontSize: 11.5, color: c.hl ? 'rgba(255,255,255,.7)' : c.good ? fq.success : fq.g500, marginTop: 9, fontWeight: c.good ? 700 : 400 }}>{c.d}</div>
          </div>
        ))}
      </div>
      <div style={{ ...fqCard, padding: 22 }}>
        <FqHead title="Crescimento da unidade" sub="Faturamento mensal nos últimos 6 meses (R$ mil)"
          right={<FqBadge text="+58% no semestre" fg={fq.success} bg={fq.successBg} ic="trending-up" />} />
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, height: 160, padding: '0 4px' }}>
          {RECEITA_6M.map((x, i) => (
            <div key={x.m} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: i === RECEITA_6M.length - 1 ? fq.primary : fq.g700, fontFamily: 'var(--font-display)' }}>{x.v}</span>
              <div style={{ width: '100%', maxWidth: 52, height: `${(x.v / max) * 100}%`, minHeight: 8, background: i === RECEITA_6M.length - 1 ? `linear-gradient(180deg, ${fq.light}, ${fq.primary})` : fq.lilac2, borderRadius: '8px 8px 3px 3px', boxShadow: i === RECEITA_6M.length - 1 ? 'var(--shadow-purple)' : 'none' }} />
              <span style={{ fontSize: 11.5, color: fq.g500 }}>{x.m}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 14, marginTop: 16, paddingTop: 14, borderTop: `1px solid ${fq.g100}`, flexWrap: 'wrap' }}>
          {[['bot', 'Atendimento IA 24/7 incluso'], ['inbox', 'Leads distribuídos pela rede'], ['badge-check', 'Fechamento conduzido pela rede'], ['shield-check', 'Seguro-fiança do parceiro para locação']].map(([ic, lb]) => (
            <span key={lb} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 12.5, color: fq.g700, background: fq.lilac1, border: `1px solid ${fq.lilac2}`, borderRadius: 999, padding: '6px 13px' }}>
              <CIc n={ic} s={14} c={fq.primary} /> {lb}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function FqTime() {
  const TIER: any = { 'Elite': [fq.primary, fq.lilac2], 'Consolidado': [fq.info, fq.infoBg], 'Iniciante': [fq.g700, fq.g100] };
  return (
    <section id="time" style={{ scrollMarginTop: 90 }}>
      <div style={{ ...fqCard, padding: 22 }}>
        <FqHead title="Meu time" sub="Os corretores da sua unidade: score, produção e conversão"
          right={<FqBadge text="38/40 assentos em uso" fg={fq.warning} bg={fq.warnBg} ic="armchair" />} />
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
            <thead><tr>
              <th style={th}>Corretor</th><th style={th}>Score</th><th style={th}>Vendas (jun)</th><th style={th}>Locações</th><th style={th}>Leads</th><th style={th}>Conversão</th>
            </tr></thead>
            <tbody>
              {TIME.map((c) => {
                const [tfg, tbg] = TIER[c.tier];
                return (
                  <tr key={c.n}
                    onMouseEnter={(e) => (e.currentTarget as HTMLTableRowElement).style.background = fq.lilac1}
                    onMouseLeave={(e) => (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'}>
                    <td style={td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: '50%', background: `linear-gradient(135deg, ${fq.light}, ${fq.deep})`, display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 700, fontFamily: 'var(--font-display)', fontSize: 12 }}>{c.n.split(' ').map((x: string) => x[0]).slice(0, 2).join('')}</div>
                        <span style={{ fontWeight: 700, color: fq.ink }}>{c.n}</span>
                      </div>
                    </td>
                    <td style={td}><FqBadge text={`${c.score} · ${c.tier}`} fg={tfg} bg={tbg} /></td>
                    <td style={{ ...td, fontWeight: 700, color: fq.ink }}>{c.vendas}</td>
                    <td style={td}>{c.locacoes}</td>
                    <td style={td}>{c.leads}</td>
                    <td style={{ ...td, fontWeight: 700, color: parseFloat(c.conv) >= 7 ? fq.success : fq.g700 }}>{c.conv}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: 12, fontSize: 12, color: fq.g500, display: 'flex', alignItems: 'center', gap: 6 }}>
          <CIc n="info" s={13} c={fq.g500} /> +34 corretores · o Score sobe com vendas, captações, avaliação do cliente e uso dos materiais oficiais.
        </div>
      </div>
    </section>
  );
}

function FqLeads() {
  const max = FUNIL[0].v;
  return (
    <section id="leads" style={{ scrollMarginTop: 90 }}>
      <div style={{ ...fqCard, padding: 22 }}>
        <FqHead title="Leads & funil da unidade" sub="O que a rede entregou para o seu time em junho, e onde está cada lead"
          right={<FqBadge text="1ª resposta média: 7 min" fg={fq.success} bg={fq.successBg} ic="timer" />} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {FUNIL.map((f) => (
            <div key={f.e} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ width: 130, fontSize: 12.5, color: fq.g700, flexShrink: 0 }}>{f.e}</span>
              <div style={{ flex: 1, height: 26, background: fq.g100, borderRadius: 8, overflow: 'hidden' }}>
                <div style={{ width: `${(f.v / max) * 100}%`, height: '100%', background: f.c, borderRadius: 8, display: 'flex', alignItems: 'center', paddingLeft: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)' }}>{f.v}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 14, padding: '10px 14px', background: fq.lilac1, border: `1px solid ${fq.lilac2}`, borderRadius: 10, fontSize: 12.5, color: fq.g700, display: 'flex', alignItems: 'center', gap: 8 }}>
          <CIc n="bot" s={14} c={fq.primary} />
          A IA da {demo.nomeCurto} atende, qualifica e agenda: seu time recebe o lead pronto. Quem não responde em 15 min perde o lead para o rodízio.
        </div>
      </div>
    </section>
  );
}

function FqPlano() {
  return (
    <section id="plano" style={{ scrollMarginTop: 90 }}>
      <div className="fq-2col" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(360px, 100%), 1fr))', gap: 18 }}>
        <div style={{ ...fqCard, padding: 22 }}>
          <FqHead title="Plano & assentos" sub={`Sua assinatura da ${demo.nome}`} right={<FqBadge text="em dia" fg={fq.success} bg={fq.successBg} ic="check" />} />
          <div style={{ background: `linear-gradient(135deg, ${fq.primary}, ${fq.deep})`, borderRadius: 14, padding: '18px 20px', color: '#fff', marginBottom: 14, boxShadow: 'var(--shadow-purple)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18 }}>Franquia Premium</div>
                <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,.75)', marginTop: 2 }}>40 assentos · marca {demo.nomeCurto} · leads da rede · IA 24/7</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20 }}>R$ 3.600<span style={{ fontSize: 12, fontWeight: 600 }}>/mês</span></div>
                <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,.7)' }}>próxima fatura 05/07</div>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 6 }}>
            <span style={{ color: fq.g700, fontWeight: 600 }}>38 assentos em uso</span>
            <span style={{ color: fq.warning, fontWeight: 700 }}>2 livres</span>
          </div>
          <div style={{ height: 12, background: fq.g100, borderRadius: 999, overflow: 'hidden', marginBottom: 14 }}>
            <div style={{ width: '95%', height: '100%', background: `linear-gradient(90deg, ${fq.success}, ${fq.warning})`, borderRadius: 999 }} />
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button style={btnP}>Ampliar plano (+10 assentos)</button>
            <button style={btnO}>Ver faturas</button>
          </div>
        </div>
        <div style={{ ...fqCard, padding: 22 }}>
          <FqHead title="Sua conta com a rede em junho" sub="Transparência total do que entra e do que sai" />
          {[
            { l: 'Comissões do time (bruto)', v: '+ R$ 96.000', ok: true },
            { l: 'Participação da unidade', v: '+ R$ 38.400', ok: true },
            { l: 'Assinatura Franquia Premium', v: '− R$ 3.600' },
            { l: 'Royalties (5% s/ comissões)', v: '− R$ 4.800' },
            { l: 'Créditos Radar comprados', v: '− R$ 357' },
          ].map((x, i, arr) => (
            <div key={x.l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 4px', borderBottom: i < arr.length - 1 ? `1px solid ${fq.g100}` : 'none' }}>
              <span style={{ fontSize: 13, color: fq.g700 }}>{x.l}</span>
              <span style={{ fontSize: 13.5, fontWeight: 800, fontFamily: 'var(--font-display)', color: x.ok ? fq.success : fq.ink }}>{x.v}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, padding: '12px 16px', background: fq.successBg, borderRadius: 12 }}>
            <span style={{ fontSize: 13.5, fontWeight: 700, color: fq.ink }}>Resultado da unidade</span>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, color: fq.success }}>+ R$ 125.643</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function FqCandidatos() {
  return (
    <section id="candidatos" style={{ scrollMarginTop: 90 }}>
      <div style={{ ...fqCard, padding: 22 }}>
        <FqHead title="Indicar corretor para a minha unidade" sub={`Você indica, a ${demo.nomeCurto} valida CRECI e documentos: a aprovação ocupa um dos seus assentos`}
          right={<button style={btnP}>+ Indicar candidato</button>} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 4px', borderBottom: `1px solid ${fq.g100}`, flexWrap: 'wrap' }}>
          <span style={{ width: 34, height: 34, borderRadius: 10, background: fq.successBg, display: 'grid', placeItems: 'center' }}><CIc n="user-check" s={16} c={fq.success} /></span>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: fq.ink }}>Joana Reis</div>
            <div style={{ fontSize: 12, color: fq.g500 }}>indicada por você em 05/06 · CRECI validado · entrevista concluída</div>
          </div>
          <FqBadge text={`Pronta p/ aprovação da ${demo.nomeCurto}`} fg={fq.success} bg={fq.successBg} ic="badge-check" />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 4px', flexWrap: 'wrap' }}>
          <span style={{ width: 34, height: 34, borderRadius: 10, background: fq.warnBg, display: 'grid', placeItems: 'center' }}><CIc n="file-clock" s={16} c={fq.warning} /></span>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: fq.ink }}>Diego Martins</div>
            <div style={{ fontSize: 12, color: fq.g500 }}>indicado em 09/06 · aguardando documentos (lembrete automático enviado)</div>
          </div>
          <FqBadge text="Docs pendentes" fg={fq.warning} bg={fq.warnBg} />
        </div>
        <div style={{ marginTop: 12, padding: '10px 14px', background: fq.lilac1, border: `1px solid ${fq.lilac2}`, borderRadius: 10, fontSize: 12.5, color: fq.g700, display: 'flex', alignItems: 'center', gap: 8 }}>
          <CIc n="armchair" s={14} c={fq.primary} />
          Você tem <b>2 assentos livres</b>. Sem assento, a aprovação fica retida. Amplie o plano antes.
        </div>
      </div>
    </section>
  );
}

function FqRanking() {
  return (
    <section id="ranking" style={{ scrollMarginTop: 90 }}>
      <div style={{ ...fqCard, padding: 22 }}>
        <FqHead title="Minha posição na rede" sub="Compare-se com a rede, sem ver os dados das outras unidades"
          right={<FqBadge text="outras unidades anonimizadas" fg={fq.g700} bg={fq.g100} ic="eye-off" />} />
        {RANKING.map((r) => (
          <div key={r.pos} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 16px', borderRadius: 12, marginBottom: 8, background: r.voce ? fq.lilac1 : 'transparent', border: r.voce ? `2px solid ${fq.primary}` : `1px solid ${fq.g100}` }}>
            <span style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, background: r.pos === 1 ? fq.warnBg : r.voce ? fq.primary : fq.g100, display: 'grid', placeItems: 'center', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 14, color: r.pos === 1 ? fq.warning : r.voce ? '#fff' : fq.g700 }}>{r.pos}º</span>
            <span style={{ flex: 1, fontSize: 13.5, fontWeight: r.voce ? 800 : 600, color: fq.ink }}>{r.u}</span>
            <span style={{ fontSize: 13.5, fontWeight: 700, color: r.voce ? fq.primary : fq.g500, fontFamily: 'var(--font-display)' }}>{r.voce || r.pos === 1 ? r.fat : '•••'}</span>
          </div>
        ))}
        <div style={{ marginTop: 10, padding: '10px 14px', background: fq.lilac1, border: `1px solid ${fq.lilac2}`, borderRadius: 10, fontSize: 12.5, color: fq.g700, display: 'flex', alignItems: 'center', gap: 8 }}>
          <CIc n="shield-check" s={14} c={fq.primary} />
          Franquias são independentes entre si: você vê a sua posição e a referência do 1º lugar, <b>nunca os números das demais</b>. Esse recorte é garantido pelo servidor, não pela tela.
        </div>
      </div>
    </section>
  );
}

/* ---------------- PAGE ---------------- */
/* No celular a barra lateral vira gaveta (o mesmo padrão do painel do CEO): antes ela
   só sumia, e o painel ficava sem navegação. Fechada, fica invisível — fora do Tab e
   do tour. A topbar perde o que não cabe em 390 px (unidade e nome, que já estão na
   gaveta e no título). CSS, e não hook de viewport: sem piscar a barra no 1º render. */
const CSS_CELULAR = `
  .fq-burger, .fq-fechar { display: none; }
  @media (max-width: 880px) {
    .fq-burger, .fq-fechar { display: grid !important; }
    .fq-side { position: fixed !important; top: 0; left: 0; bottom: 0; height: auto !important; z-index: 60;
      transform: translateX(-100%); visibility: hidden;
      transition: transform .24s cubic-bezier(.2,.7,.3,1), visibility 0s linear .24s; }
    .fq-side.aberto { transform: translateX(0); visibility: visible; transition: transform .24s cubic-bezier(.2,.7,.3,1); }
    .fq-overlay { position: fixed; inset: 0; background: rgba(28,26,34,.45); z-index: 55; }
    .fq-top { padding: 0 16px !important; gap: 12px !important; }
    .fq-unidade, .fq-nome { display: none !important; }
    .fq-main { padding: 18px !important; }
  }
  @media (min-width: 881px) { .fq-overlay { display: none; } }
`;

export default function FranqueadoPage() {
  const [active, setActive] = useState('visao');
  const [menuAberto, setMenuAberto] = useState(false);
  const go = (id: string) => {
    setActive(id);
    setMenuAberto(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <style>{CSS_CELULAR}</style>
      {menuAberto && <div className="fq-overlay" onClick={() => setMenuAberto(false)} />}
      <FqSidebar active={active} go={go} aberto={menuAberto} fechar={() => setMenuAberto(false)} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <GuiaDemo painel="franqueado" />
        <FqTopbar abrirMenu={() => setMenuAberto(true)} />
        <main className="fq-main" style={{ padding: 28, flex: 1, overflow: 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1180 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap' }}>
              <div>
                <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 30, letterSpacing: '-0.02em', margin: 0, color: fq.ink }}>Bem-vindo, Bruno 👋</h1>
                <div style={{ fontSize: 13.5, color: fq.g500, marginTop: 4 }}>{demo.nomeCurto} Boa Viagem · quinta, 11 de junho · sua franquia em uma tela</div>
              </div>
              <FqBadge text="2º lugar na rede 🏆" fg={fq.primary} bg={fq.lilac2} />
            </div>
            <FqVisao />
            <FqTime />
            <FqLeads />
            <FqPlano />
            <FqCandidatos />
            <FqRanking />
          </div>
        </main>
      </div>
    </div>
  );
}
