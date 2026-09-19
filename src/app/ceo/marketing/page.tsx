"use client";
import * as React from "react";
import CeoChrome, { ceoPalette, CIc } from "@/components/ceo/CeoChrome";
import { demo } from "@/config/demo";
const { useState } = React;

const mk: any = {
  ...ceoPalette,
  info: '#3E82E0', infoBg: '#E5EEFB',
  successBg: '#E6F4EC', warnBg: '#FBF1DC', errBg: '#FAE5E5',
  p3: '#818CF8', p3bg: '#E0E7FF',
};
const mkCard = { background: '#fff', border: `1px solid ${mk.g300}`, borderRadius: 16 };

function MkBadge({ text, fg, bg, ic }: any) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: fg, background: bg, borderRadius: 999, padding: '3px 10px', whiteSpace: 'nowrap' }}>
      {ic && <CIc n={ic} s={12} c={fg} />}{text}
    </span>
  );
}
function MkHead({ title, sub, right }: any) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
      <div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: mk.ink }}>{title}</div>
        {sub && <div style={{ fontSize: 13, color: mk.g500, marginTop: 2 }}>{sub}</div>}
      </div>
      {right}
    </div>
  );
}
const btnP: React.CSSProperties = { border: 'none', cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12.5, color: '#fff', background: mk.primary, borderRadius: 9, padding: '8px 14px' };
const btnO: React.CSSProperties = { border: `1px solid ${mk.g300}`, cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12.5, color: mk.g700, background: '#fff', borderRadius: 9, padding: '8px 14px' };

/* ---------------- DATA ---------------- */
const SECOES_SITE: any[] = [
  {
    id: 's1', n: 'Banner principal (hero)', desc: '"Alugue sem fiador com seguro-fiança" · imagem + CTA WhatsApp',
    st: 'Publicado', quando: '02/06 · por Camila (Marketing)', metr: '4,8% de clique',
  },
  {
    id: 's2', n: 'Faixa de destaque', desc: 'Campanha "Junho sem caução" — termina em 30/06',
    st: 'Publicado', quando: '01/06 · por Camila (Marketing)', metr: '2,1% de clique', expira: 'expira 30/06',
  },
  {
    id: 's3', n: 'Vitrine de imóveis em destaque', desc: '8 imóveis escolhidos pela curadoria · atualização semanal',
    st: 'Automático', quando: 'rotaciona toda segunda', metr: '12% dos cliques do site',
  },
  {
    id: 's4', n: 'Banner secundário', desc: `"Seja corretor ${demo.nomeCurto}" → /seja-corretor`,
    st: 'Rascunho', quando: 'editado hoje 10:12 · aguardando revisão', metr: null,
  },
];

const PECAS: any[] = [
  { t: 'Post de imóvel (feed)', q: 312, scans: null, leads: 41, ic: 'image' },
  { t: 'Story com link', q: 198, scans: null, leads: 28, ic: 'smartphone' },
  { t: 'Placa com QR code', q: 64, scans: 820, leads: 37, ic: 'qr-code' },
  { t: 'Cartão digital do corretor', q: 142, scans: 460, leads: 19, ic: 'id-card' },
];

const TOP_UNIDADES = [
  { u: `${demo.nomeCurto} Boa Viagem`, pecas: 184, leads: 52, c: mk.primary },
  { u: `${demo.nomeCurto} Recife Centro`, pecas: 151, leads: 38, c: mk.p3 },
  { u: `${demo.nomeCurto} Caruaru`, pecas: 96, leads: 21, c: mk.info },
  { u: `${demo.nomeCurto} Olinda`, pecas: 71, leads: 14, c: mk.warning },
];

/* ---------------- SUMMARY ---------------- */
function MkSummary() {
  const cards = [
    { l: 'Visitas no site (jun)', v: '38,4 mil', d: '+11% vs. maio', ic: 'globe', good: true, hl: true },
    { l: 'Leads vindos do site', v: '486', d: '12,7 por mil visitas', ic: 'magnet' },
    { l: 'Peças geradas pela rede', v: '716', d: 'no mês · por 198 corretores', ic: 'palette' },
    { l: 'Scans de QR', v: '1.280', d: '→ 56 leads rastreados', ic: 'qr-code' },
    { l: 'Custo por lead (blended)', v: 'R$ 18,40', d: 'orgânico + pago', ic: 'coins', good: true },
    { l: 'Banners ativos', v: '3', d: '1 rascunho aguardando', ic: 'layout-template' },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(172px, 1fr))', gap: 14 }}>
      {cards.map((c) => (
        <div key={c.l} style={{ background: c.hl ? `linear-gradient(135deg, ${mk.primary}, ${mk.deep})` : '#fff', border: c.hl ? 'none' : `1px solid ${mk.g300}`, borderRadius: 16, padding: 18, boxShadow: c.hl ? 'var(--shadow-purple)' : 'none', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: c.hl ? 'rgba(255,255,255,.85)' : mk.g500, lineHeight: 1.3 }}>{c.l}</span>
            <span style={{ width: 30, height: 30, borderRadius: 8, background: c.hl ? 'rgba(255,255,255,.18)' : mk.lilac2, display: 'grid', placeItems: 'center', flexShrink: 0 }}><CIc n={c.ic} s={15} c={c.hl ? '#fff' : mk.primary} /></span>
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, lineHeight: 1.15, color: c.hl ? '#fff' : mk.ink, marginTop: 14, letterSpacing: '-0.01em' }}>{c.v}</div>
          <div style={{ fontSize: 11.5, color: c.hl ? 'rgba(255,255,255,.7)' : c.good ? mk.success : mk.g500, marginTop: 9, fontWeight: c.good ? 700 : 400 }}>{c.d}</div>
        </div>
      ))}
    </div>
  );
}

/* ---------------- SITE PÚBLICO ---------------- */
function MkSite() {
  const ST: any = { 'Publicado': [mk.success, mk.successBg], 'Rascunho': [mk.warning, mk.warnBg], 'Automático': [mk.info, mk.infoBg] };
  const [sel, setSel] = useState('s4');
  return (
    <div style={{ ...mkCard, padding: 22 }}>
      <MkHead title={`Site público — ${demo.dominio}`} sub="Banners e textos editados aqui aparecem no site na hora, sem precisar de programador"
        right={<MkBadge text="toda publicação é auditada" fg={mk.g700} bg={mk.g100} ic="scroll-text" />} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {SECOES_SITE.map((s) => {
          const [fg, bg] = ST[s.st];
          const on = sel === s.id;
          return (
            <div key={s.id} onClick={() => setSel(on ? '' : s.id)} style={{ border: `1px solid ${on ? mk.primary : mk.g300}`, borderRadius: 12, padding: '14px 16px', cursor: 'pointer', background: on ? mk.lilac1 : '#fff', transition: 'background .15s ease' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <span style={{ width: 38, height: 38, borderRadius: 10, background: mk.lilac2, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <CIc n="layout-template" s={18} c={mk.primary} />
                </span>
                <div style={{ flex: 1, minWidth: 220 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: mk.ink }}>{s.n} {s.expira && <span style={{ fontSize: 11.5, fontWeight: 700, color: mk.warning }}>· {s.expira}</span>}</div>
                  <div style={{ fontSize: 12.5, color: mk.g500, marginTop: 2 }}>{s.desc}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <MkBadge text={s.st} fg={fg} bg={bg} />
                  <div style={{ fontSize: 11.5, color: mk.g500, marginTop: 5 }}>{s.metr ?? 'sem métrica ainda'}</div>
                </div>
              </div>
              {on && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${mk.g300}`, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 12, color: mk.g500 }}>{s.quando}</span>
                  <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                    <button style={btnO} onClick={(e) => e.stopPropagation()}>Pré-visualizar</button>
                    <button style={btnO} onClick={(e) => e.stopPropagation()}>Editar</button>
                    {s.st === 'Rascunho' && <button style={btnP} onClick={(e) => e.stopPropagation()}>Publicar agora</button>}
                    {s.st === 'Publicado' && <button style={{ ...btnO, color: mk.error, borderColor: mk.error }} onClick={(e) => e.stopPropagation()}>Despublicar</button>}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 14, padding: '10px 14px', background: mk.lilac1, border: `1px solid ${mk.lilac2}`, borderRadius: 10, fontSize: 12.5, color: mk.g700, display: 'flex', alignItems: 'center', gap: 8 }}>
        <CIc n="zap" s={14} c={mk.primary} />
        Publicou, apareceu: o site atualiza em segundos, sem deploy. Imagens passam pela validação do servidor (tipo e tamanho) antes de subir.
      </div>
    </div>
  );
}

/* ---------------- MATERIAIS DA REDE ---------------- */
function MkPecas() {
  return (
    <div style={{ ...mkCard, padding: 22 }}>
      <MkHead title="Materiais da rede" sub="Peças geradas pelos corretores nos templates oficiais — com QR rastreável até o lead" />
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
          <thead><tr>
            {['Tipo de peça', 'Geradas (jun)', 'Scans', 'Leads rastreados'].map((h) => (
              <th key={h} style={{ textAlign: 'left', fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: mk.g500, padding: '10px 14px', borderBottom: `1px solid ${mk.g100}`, whiteSpace: 'nowrap' }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {PECAS.map((p) => (
              <tr key={p.t}>
                <td style={{ padding: '12px 14px', borderBottom: `1px solid ${mk.g100}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ width: 32, height: 32, borderRadius: 9, background: mk.lilac2, display: 'grid', placeItems: 'center' }}><CIc n={p.ic} s={15} c={mk.primary} /></span>
                    <span style={{ fontSize: 13.5, fontWeight: 600, color: mk.ink }}>{p.t}</span>
                  </div>
                </td>
                <td style={{ padding: '12px 14px', borderBottom: `1px solid ${mk.g100}`, fontSize: 13.5, fontWeight: 700, color: mk.ink }}>{p.q}</td>
                <td style={{ padding: '12px 14px', borderBottom: `1px solid ${mk.g100}`, fontSize: 13.5, color: mk.g700 }}>{p.scans ?? '—'}</td>
                <td style={{ padding: '12px 14px', borderBottom: `1px solid ${mk.g100}` }}><MkBadge text={`${p.leads} leads`} fg={mk.success} bg={mk.successBg} ic="magnet" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 14, fontSize: 12, color: mk.g500, display: 'flex', alignItems: 'center', gap: 6 }}>
        <CIc n="info" s={13} c={mk.g500} /> Cada QR identifica corretor e peça — o lead que escaneia já cai distribuído para quem gerou.
      </div>
    </div>
  );
}

function MkUnidades() {
  const max = Math.max(...TOP_UNIDADES.map((u) => u.pecas));
  return (
    <div style={{ ...mkCard, padding: 22 }}>
      <MkHead title="Engajamento por unidade" sub="Peças geradas × leads — junho" />
      {TOP_UNIDADES.map((u) => (
        <div key={u.u} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <span style={{ width: 140, fontSize: 12.5, color: mk.g700, flexShrink: 0 }}>{u.u}</span>
          <div style={{ flex: 1, height: 12, background: mk.g100, borderRadius: 999, overflow: 'hidden' }}>
            <div style={{ width: `${(u.pecas / max) * 100}%`, height: '100%', background: u.c, borderRadius: 999 }} />
          </div>
          <span style={{ width: 110, fontSize: 12.5, fontWeight: 700, color: mk.ink, textAlign: 'right', whiteSpace: 'nowrap' }}>{u.pecas} peças · {u.leads} leads</span>
        </div>
      ))}
      <div style={{ marginTop: 14, padding: '10px 14px', background: mk.lilac1, border: `1px solid ${mk.lilac2}`, borderRadius: 10, fontSize: 12.5, color: mk.g700, display: 'flex', alignItems: 'center', gap: 8 }}>
        <CIc n="lightbulb" s={14} c={mk.primary} />
        Corretor que usa os materiais oficiais gera 1,8× mais leads — e ganha pontos de marketing no Score.
      </div>
    </div>
  );
}

/* ---------------- PAGE ---------------- */
export default function CeoMarketingPage() {
  return (
    <CeoChrome>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 30, letterSpacing: '-0.02em', margin: 0, color: mk.ink }}>Marketing & Site</h1>
            <div style={{ fontSize: 13.5, color: mk.g500, marginTop: 4 }}>O site público nas mãos do Marketing e os materiais da rede — tudo rastreado até o lead</div>
          </div>
          <MkBadge text="site no ar · atualiza sem deploy" fg={mk.success} bg={mk.successBg} ic="globe" />
        </div>

        <MkSummary />
        <MkSite />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 18 }}>
          <MkPecas />
          <MkUnidades />
        </div>
      </div>
    </CeoChrome>
  );
}
