"use client";
import * as React from "react";
import CeoChrome, { ceoPalette, CIc } from "@/components/ceo/CeoChrome";
import { demo } from "@/config/demo";
const { useState, useEffect, useRef, useMemo, useCallback } = React;
const { useState: useStateCu } = React;

const cu: any = {
  ...ceoPalette,
  info: '#3E82E0', infoBg: '#E5EEFB',
  successBg: '#E6F4EC', warnBg: '#FBF1DC', errBg: '#FAE5E5',
};
const cuCard = { background: '#fff', border: `1px solid ${cu.g300}`, borderRadius: 16 };
const cuSecLabel = { fontSize: 11.5, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: cu.g500, margin: '0 0 12px' } as React.CSSProperties;

/* ---------------- DATA ---------------- */
const LISTINGS: any[] = [
  {
    id: 'l1', title: 'Apartamento 3 quartos', type: 'Apartamento', price: 'R$ 720.000', loc: 'Boa Viagem · Recife/PE',
    broker: 'Bruno Lima', unit: 'Franquia Recife', photos: 22, wait: '2h', ai: 'ok',
    area: '98 m²', addr: 'Rua Exemplo, 100 · ap. 101', addrPublic: 'Boa Viagem · Recife/PE',
    desc: 'Apartamento amplo com vista para o mar, 3 quartos sendo 1 suíte, varanda gourmet, 2 vagas. Andar alto, sol da manhã.',
    checks: [
      { l: 'Fotos', v: '22 (mín. 15)', ok: true }, { l: 'Contato no texto', v: 'nenhum detectado', ok: true },
      { l: 'Duplicidade (matrícula)', v: 'nenhuma', ok: true }, { l: 'Dados do proprietário', v: 'ok (interno)', ok: true }, { l: 'Qualidade das fotos', v: 'boa', ok: true },
    ],
  },
  {
    id: 'l2', title: 'Casa 4 quartos', type: 'Casa', price: 'R$ 1,2 mi', loc: 'Alphaville · Campinas/SP',
    broker: 'Juliana Moraes', unit: 'Associado Campinas', photos: 12, wait: '5h', ai: 'warn', alert: 'Fotos abaixo do mínimo (15)',
    area: '320 m²', addr: 'Alameda Exemplo, 200 · Alphaville', addrPublic: 'Alphaville · Campinas/SP',
    desc: 'Casa em condomínio fechado, 4 quartos, piscina, churrasqueira, 4 vagas. Segurança 24h.',
    checks: [
      { l: 'Fotos', v: '12 (mín. 15)', ok: false, note: 'abaixo do mínimo' }, { l: 'Contato no texto', v: 'nenhum detectado', ok: true },
      { l: 'Duplicidade (matrícula)', v: 'nenhuma', ok: true }, { l: 'Dados do proprietário', v: 'ok (interno)', ok: true }, { l: 'Qualidade das fotos', v: 'boa', ok: true },
    ],
  },
  {
    id: 'l3', title: 'Sala comercial', type: 'Comercial', price: 'R$ 480.000', loc: 'Pinheiros · SP',
    broker: 'Ricardo Almeida', unit: 'Matriz', photos: 18, wait: '1h', ai: 'warn', alert: 'Possível telefone na descrição',
    area: '64 m²', addr: 'Rua Exemplo, 300 · sala 1', addrPublic: 'Pinheiros · São Paulo/SP',
    desc: 'Sala comercial reformada, 64 m², 2 vagas, pé-direito alto. Excelente localização. Contato direto (11) 9XXXX-XXXX para agendar.',
    checks: [
      { l: 'Fotos', v: '18 (mín. 15)', ok: true }, { l: 'Contato no texto', v: 'possível telefone detectado', ok: false, note: 'remover contato direto' },
      { l: 'Duplicidade (matrícula)', v: 'nenhuma', ok: true }, { l: 'Dados do proprietário', v: 'ok (interno)', ok: true }, { l: 'Qualidade das fotos', v: 'boa', ok: true },
    ],
  },
  {
    id: 'l4', title: 'Cobertura 4 suítes', type: 'Cobertura', price: 'R$ 2,4 mi', loc: 'Meireles · Fortaleza/CE',
    broker: 'Ana Marques', unit: 'Matriz', photos: 28, wait: '4h', ai: 'ok',
    area: '240 m²', addr: 'Avenida Exemplo, 400 · cobertura', addrPublic: 'Meireles · Fortaleza/CE',
    desc: 'Cobertura duplex frente-mar, 4 suítes, piscina privativa, 4 vagas. Acabamento de altíssimo padrão.',
    checks: [
      { l: 'Fotos', v: '28 (mín. 15)', ok: true }, { l: 'Contato no texto', v: 'nenhum detectado', ok: true },
      { l: 'Duplicidade (matrícula)', v: 'nenhuma', ok: true }, { l: 'Dados do proprietário', v: 'ok (interno)', ok: true }, { l: 'Qualidade das fotos', v: 'excelente', ok: true },
    ],
  },
];

/* portals each listing publishes to (on) and is boosted on (boosted) */
const CHANNELS: any = {
  l1: [{ n: `Site ${demo.nomeCurto}`, on: true, boosted: true }, { n: 'ZAP Imóveis', on: true, boosted: true }, { n: 'Viva Real', on: true, boosted: false }, { n: 'OLX', on: true, boosted: false }, { n: 'Chaves na Mão', on: false, boosted: false }],
  l2: [{ n: `Site ${demo.nomeCurto}`, on: true, boosted: false }, { n: 'ZAP Imóveis', on: true, boosted: false }, { n: 'Viva Real', on: false, boosted: false }, { n: 'OLX', on: true, boosted: false }, { n: 'Chaves na Mão', on: false, boosted: false }],
  l3: [{ n: `Site ${demo.nomeCurto}`, on: true, boosted: true }, { n: 'ZAP Imóveis', on: true, boosted: true }, { n: 'Viva Real', on: true, boosted: false }, { n: 'OLX', on: false, boosted: false }, { n: 'Chaves na Mão', on: true, boosted: false }],
  l4: [{ n: `Site ${demo.nomeCurto}`, on: true, boosted: true }, { n: 'ZAP Imóveis', on: true, boosted: true }, { n: 'Viva Real', on: true, boosted: true }, { n: 'OLX', on: true, boosted: false }, { n: 'Chaves na Mão', on: true, boosted: false }],
};

const PHOTOS: any[] = [
  { id: 'p1', name: 'Carla Dias', unit: 'Matriz', wait: '3h' },
  { id: 'p2', name: 'Pedro Nunes', unit: 'Franquia Recife', wait: '6h' },
];

function initialsCu(n: any) { return n.split(' ').map((p: any) => p[0]).slice(0, 2).join(''); }
const typeIcon: any = { Apartamento: 'building', Casa: 'home', Comercial: 'briefcase', Cobertura: 'building-2' };

/* ---------------- SUMMARY ---------------- */
function CuSummary() {
  const cards = [
    { l: 'Anúncios na fila', v: '18', ic: 'clipboard-list', tone: cu.primary },
    { l: 'Fotos na fila', v: '5', ic: 'image', tone: cu.info },
    { l: 'Tempo médio', v: '3h', ic: 'timer', tone: cu.primary },
    { l: 'Taxa de devolução', v: '12%', ic: 'corner-up-left', tone: cu.warning },
    { l: 'Aprovados hoje', v: '24', ic: 'check-circle', tone: cu.success },
  ];
  return (
    <div className="cu-summary">
      {cards.map(c => (
        <div key={c.l} style={{ ...cuCard, padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ width: 38, height: 38, borderRadius: 10, background: cu.lilac2, display: 'grid', placeItems: 'center', flexShrink: 0 }}><CIc n={c.ic} s={18} c={c.tone} /></span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: cu.ink, lineHeight: 1.1 }}>{c.v}</div>
            <div style={{ fontSize: 12, color: cu.g500, lineHeight: 1.3 }}>{c.l}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------------- AI SEAL ---------------- */
function AiSeal({ listing, compact }: any) {
  if (listing.ai === 'ok') {
    return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: cu.success, background: cu.successBg, borderRadius: 999, padding: '3px 9px' }}><CIc n="sparkles" s={13} c={cu.success} /> IA: ok</span>;
  }
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: cu.warning, background: cu.warnBg, borderRadius: 999, padding: '3px 9px', maxWidth: compact ? 200 : 'none' }}><CIc n="alert-triangle" s={13} c={cu.warning} /> {compact ? listing.alert : `IA: ${listing.alert}`}</span>;
}

/* ---------------- PHOTO PLACEHOLDER ---------------- */
function PhotoPlaceholder({ h = 150, icon = 'building-2', label }: any) {
  return (
    <div style={{ height: h, background: `linear-gradient(135deg, ${cu.lilac2}, ${cu.lilac1})`, display: 'grid', placeItems: 'center', position: 'relative' }}>
      <CIc n={icon} s={h > 120 ? 34 : 24} c={cu.light} />
      {label && <span style={{ position: 'absolute', bottom: 8, right: 10, fontSize: 10.5, fontWeight: 600, color: cu.g500 }}>{label}</span>}
    </div>
  );
}

/* ---------------- LISTING CARD ---------------- */
function CuListingCard({ listing, onSelect }: any) {
  return (
    <button onClick={() => onSelect(listing)} style={{ ...cuCard, padding: 0, overflow: 'hidden', textAlign: 'left', cursor: 'pointer', fontFamily: 'var(--font-body)', display: 'flex', flexDirection: 'column' } as React.CSSProperties}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}>
      <div style={{ position: 'relative' }}>
        <PhotoPlaceholder h={150} icon={typeIcon[listing.type] || 'building-2'} />
        <span style={{ position: 'absolute', top: 10, left: 10 }}><AiSeal listing={listing} compact /></span>
        <span style={{ position: 'absolute', bottom: 10, left: 10, display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, fontWeight: 600, color: '#fff', background: 'rgba(28,26,34,.6)', borderRadius: 999, padding: '3px 9px' }}><CIc n="image" s={13} c="#fff" /> {listing.photos} fotos</span>
      </div>
      <div style={{ padding: 16, flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: cu.ink }}>{listing.title}</span>
          <span style={{ fontSize: 11, color: cu.g500, whiteSpace: 'nowrap' } as React.CSSProperties}><CIc n="clock" s={12} c={cu.g500} style={{ verticalAlign: '-1px' }} /> {listing.wait}</span>
        </div>
        <div style={{ fontSize: 13, color: cu.g500, marginTop: 3 }}>{listing.type} · {listing.loc}</div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, color: cu.primary, marginTop: 8 }}>{listing.price}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, paddingTop: 12, borderTop: `1px solid ${cu.g100}` }}>
          <span style={{ width: 28, height: 28, borderRadius: '50%', background: `linear-gradient(135deg, ${cu.light}, ${cu.deep})`, color: '#fff', fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-display)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>{initialsCu(listing.broker)}</span>
          <span style={{ fontSize: 12.5, color: cu.g700 }}>{listing.broker} <span style={{ color: cu.g500 }}>· {listing.unit}</span></span>
        </div>
      </div>
    </button>
  );
}

/* ---------------- SELECT ---------------- */
function CuSelect({ value, onChange, options, icon }: any) {
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      {icon && <span style={{ position: 'absolute', left: 12, pointerEvents: 'none', display: 'flex' }}><CIc n={icon} s={15} c={cu.g500} /></span>}
      <select value={value} onChange={e => onChange(e.target.value)} style={{ appearance: 'none', WebkitAppearance: 'none', border: `1px solid ${cu.g300}`, background: '#fff', borderRadius: 10, padding: icon ? '9px 32px 9px 34px' : '9px 32px 9px 13px', fontFamily: 'var(--font-body)', fontSize: 13.5, fontWeight: 600, color: cu.ink, cursor: 'pointer', outline: 'none' } as React.CSSProperties}>
        {options.map((o: any) => <option key={o} value={o}>{o}</option>)}
      </select>
      <span style={{ position: 'absolute', right: 11, pointerEvents: 'none', display: 'flex' }}><CIc n="chevron-down" s={15} c={cu.g500} /></span>
    </div>
  );
}

/* ---------------- LISTINGS QUEUE ---------------- */
function CuListings({ onSelect }: any) {
  const [fUnit, setFUnit] = useStateCu('Todas as unidades');
  const [fType, setFType] = useStateCu('Todos os tipos');
  const [order, setOrder] = useStateCu('Mais antigo primeiro');
  const rows = LISTINGS.filter(l =>
    (fUnit === 'Todas as unidades' || l.unit === fUnit) &&
    (fType === 'Todos os tipos' || l.type === fType)
  );
  const ordered = [...rows].sort((a, b) => order === 'Mais antigo primeiro' ? parseInt(b.wait) - parseInt(a.wait) : parseInt(a.wait) - parseInt(b.wait));
  return (
    <React.Fragment>
      <div className="cu-filters" style={{ marginBottom: 18 }}>
        <CuSelect icon="building-2" value={fUnit} onChange={setFUnit} options={['Todas as unidades', 'Matriz', 'Franquia Recife', 'Associado Campinas']} />
        <CuSelect icon="layers" value={fType} onChange={setFType} options={['Todos os tipos', 'Apartamento', 'Casa', 'Comercial', 'Cobertura']} />
        <CuSelect icon="arrow-down-up" value={order} onChange={setOrder} options={['Mais antigo primeiro', 'Mais recente primeiro']} />
        <span style={{ marginLeft: 'auto', fontSize: 13, color: cu.g500, alignSelf: 'center' }}>{ordered.length} de 18 na fila</span>
      </div>
      <div className="cu-grid">
        {ordered.map(l => <CuListingCard key={l.id} listing={l} onSelect={onSelect} />)}
      </div>
    </React.Fragment>
  );
}

/* ---------------- PHOTO QUEUE ---------------- */
function CuPhotoQueue() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 } as React.CSSProperties}>
      {PHOTOS.map(p => (
        <div key={p.id} style={{ ...cuCard, padding: 18 }}>
          <div className="cu-photo-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, flex: 1 }}>
              <div style={{ textAlign: 'center' } as React.CSSProperties}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: cu.g500, marginBottom: 8 } as React.CSSProperties}>Atual</div>
                <div style={{ width: 88, height: 88, borderRadius: '50%', background: `linear-gradient(135deg, ${cu.light}, ${cu.deep})`, color: '#fff', fontSize: 26, fontWeight: 700, fontFamily: 'var(--font-display)', display: 'grid', placeItems: 'center' }}>{initialsCu(p.name)}</div>
              </div>
              <CIc n="arrow-right" s={22} c={cu.g300} />
              <div style={{ textAlign: 'center' } as React.CSSProperties}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: cu.primary, marginBottom: 8 } as React.CSSProperties}>Nova</div>
                <div style={{ width: 88, height: 88, borderRadius: '50%', overflow: 'hidden', border: `2px solid ${cu.primary}` }}><PhotoPlaceholder h={88} icon="user" /></div>
              </div>
              <div style={{ marginLeft: 8 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: cu.ink }}>{p.name}</div>
                <div style={{ fontSize: 13, color: cu.g500 }}>{p.unit}</div>
                <div style={{ fontSize: 12, color: cu.g500, marginTop: 4 }}><CIc n="clock" s={12} c={cu.g500} style={{ verticalAlign: '-1px' }} /> aguarda {p.wait}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button style={{ display: 'flex', alignItems: 'center', gap: 7, border: 'none', background: cu.success, color: '#fff', borderRadius: 10, padding: '10px 16px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 13.5 }}><CIc n="check" s={16} c="#fff" /> Aprovar</button>
              <button style={{ display: 'flex', alignItems: 'center', gap: 7, border: `1px solid ${cu.g300}`, background: '#fff', color: cu.error, borderRadius: 10, padding: '10px 16px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13.5 }}><CIc n="x" s={16} c={cu.error} /> Recusar</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------------- DRAWER SHELL ---------------- */
function CuDrawer({ open, onClose, children, width = 540 }: any) {
  return (
    <React.Fragment>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(28,26,34,.45)', zIndex: 80, opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none', transition: 'opacity .2s ease' } as React.CSSProperties} />
      <div className="cu-drawer" style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width, maxWidth: '100vw', background: '#fff', zIndex: 81, boxShadow: 'var(--shadow-lg)', transform: open ? 'translateX(0)' : 'translateX(100%)', transition: 'transform .26s cubic-bezier(.2,.7,.3,1)', display: 'flex', flexDirection: 'column' } as React.CSSProperties}>
        {open && children}
      </div>
    </React.Fragment>
  );
}

/* ---------------- CHANNELS (canais de publicação) ---------------- */
function CuChannels({ listingId }: any) {
  const [chs, setChs] = useStateCu(() => (CHANNELS[listingId] || CHANNELS.l1).map((c: any) => ({ ...c })));
  const toggleOn = (i: any) => setChs((arr: any) => arr.map((c: any, j: any) => j === i ? { ...c, on: !c.on, boosted: !c.on ? c.boosted : false } : c));
  const toggleBoost = (i: any) => setChs((arr: any) => arr.map((c: any, j: any) => j === i ? { ...c, boosted: !c.boosted } : c));
  const nOn = chs.filter((c: any) => c.on).length;
  const nBoost = chs.filter((c: any) => c.boosted).length;
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <CIc n="share-2" s={16} c={cu.primary} />
        <span style={{ ...cuSecLabel, margin: 0, flex: 1 }}>Canais de publicação</span>
        <span style={{ fontSize: 11.5, color: cu.g500 }}>{nOn} portais · {nBoost} impulsionados</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 } as React.CSSProperties}>
        {chs.map((c: any, i: any) => (
          <div key={c.n} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: c.on ? cu.page : '#fff', border: `1px solid ${cu.g300}`, borderRadius: 11, opacity: c.on ? 1 : 0.6 }}>
            <span style={{ width: 34, height: 34, borderRadius: 9, background: c.on ? cu.lilac2 : cu.g100, display: 'grid', placeItems: 'center', flexShrink: 0 }}><CIc n={c.n.includes('Site') ? 'globe' : 'megaphone'} s={17} c={c.on ? cu.primary : cu.g500} /></span>
            <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600, color: c.on ? cu.ink : cu.g500 }}>{c.n}</span>
            {c.on && (
              <button onClick={() => toggleBoost(i)} title="Impulsionar" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, border: c.boosted ? 'none' : `1px solid ${cu.g300}`, background: c.boosted ? cu.warnBg : '#fff', color: c.boosted ? cu.warning : cu.g500, borderRadius: 999, padding: '4px 10px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 11.5, fontWeight: 700 }}>
                <CIc n={c.boosted ? 'zap' : 'zap-off'} s={13} c={c.boosted ? cu.warning : cu.g500} /> {c.boosted ? 'Impulsionado' : 'Impulsionar'}
              </button>
            )}
            <button onClick={() => toggleOn(i)} title={c.on ? 'Publicado' : 'Não publica'} style={{ width: 40, height: 23, borderRadius: 999, border: 'none', background: c.on ? cu.success : cu.g300, position: 'relative', cursor: 'pointer', flexShrink: 0, transition: 'background .15s ease' } as React.CSSProperties}>
              <span style={{ position: 'absolute', top: 3, left: c.on ? 20 : 3, width: 17, height: 17, borderRadius: '50%', background: '#fff', transition: 'left .15s ease' } as React.CSSProperties} />
            </button>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginTop: 10, fontSize: 11.5, color: cu.g500, lineHeight: 1.5 }}>
        <CIc n="info" s={14} c={cu.g500} style={{ marginTop: 1, flexShrink: 0 }} /> Ao aprovar, o anúncio é publicado nos portais ativados. Os impulsionados <CIc n="zap" s={11} c={cu.warning} style={{ verticalAlign: '-1px' }} /> recebem destaque pago.
      </div>
    </div>
  );
}

/* ---------------- REVIEW DRAWER ---------------- */
function CuReview({ listing, onClose }: any) {
  const [mode, setMode] = useStateCu('view');
  const [reason, setReason] = useStateCu('');
  const [pend, setPend] = useStateCu<any>({});
  if (!listing) return null;
  const pendOptions = ['Fotos insuficientes', 'Contato direto no texto', 'Descrição incompleta', 'Fotos de baixa qualidade', 'Dados do imóvel divergentes'];
  const togglePend = (k: any) => setPend((p: any) => ({ ...p, [k]: !p[k] }));

  return (
    <React.Fragment>
      {/* header */}
      <div style={{ padding: '18px 24px', borderBottom: `1px solid ${cu.g300}`, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 19, color: cu.ink }}>{listing.title}</div>
          <div style={{ fontSize: 13, color: cu.g500, marginTop: 2 }}>{listing.type} · {listing.loc}</div>
        </div>
        <AiSeal listing={listing} />
        <button onClick={onClose} style={{ width: 34, height: 34, border: `1px solid ${cu.g300}`, background: '#fff', borderRadius: 9, display: 'grid', placeItems: 'center', cursor: 'pointer', flexShrink: 0 }}><CIc n="x" s={18} c={cu.g700} /></button>
      </div>

      {/* body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 0 20px' } as React.CSSProperties}>
        {/* gallery */}
        <div style={{ borderRadius: 0 }}>
          <PhotoPlaceholder h={220} icon={typeIcon[listing.type] || 'building-2'} label={`capa · ${listing.photos} fotos`} />
          <div style={{ display: 'flex', gap: 8, padding: '12px 24px 4px', overflowX: 'auto' } as React.CSSProperties}>
            {[0, 1, 2, 3, 4].map(i => (
              <div key={i} style={{ width: 72, height: 56, borderRadius: 8, background: cu.lilac1, border: `1px solid ${cu.g300}`, display: 'grid', placeItems: 'center', flexShrink: 0 }}><CIc n="image" s={18} c={cu.light} /></div>
            ))}
            <div style={{ width: 72, height: 56, borderRadius: 8, background: cu.lilac2, display: 'grid', placeItems: 'center', flexShrink: 0, fontSize: 13, fontWeight: 700, color: cu.primary }}>+{listing.photos - 5}</div>
          </div>
        </div>

        <div style={{ padding: '16px 24px' }}>
          {/* price + broker */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, color: cu.primary }}>{listing.price}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 28, height: 28, borderRadius: '50%', background: `linear-gradient(135deg, ${cu.light}, ${cu.deep})`, color: '#fff', fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-display)', display: 'grid', placeItems: 'center' }}>{initialsCu(listing.broker)}</span>
              <span style={{ fontSize: 12.5, color: cu.g700 }}>{listing.broker} · {listing.unit}</span>
            </span>
          </div>

          {/* dados */}
          <div style={{ marginBottom: 24 }}>
            <div style={cuSecLabel}>Dados do anúncio</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, padding: '9px 0', borderBottom: `1px solid ${cu.g100}` }}><span style={{ fontSize: 13, color: cu.g500 }}>Tipo</span><span style={{ fontSize: 13.5, fontWeight: 600, color: cu.ink }}>{listing.type}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, padding: '9px 0', borderBottom: `1px solid ${cu.g100}` }}><span style={{ fontSize: 13, color: cu.g500 }}>Área</span><span style={{ fontSize: 13.5, fontWeight: 600, color: cu.ink }}>{listing.area}</span></div>
            <div style={{ padding: '9px 0', borderBottom: `1px solid ${cu.g100}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: cu.g500 }}>Endereço <span style={{ fontSize: 11, fontWeight: 700, color: cu.warning, background: cu.warnBg, borderRadius: 999, padding: '1px 7px', marginLeft: 4 }}>INTERNO</span></span>
                <span style={{ fontSize: 13.5, fontWeight: 600, color: cu.ink, textAlign: 'right' } as React.CSSProperties}>{listing.addr}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center', marginTop: 6 }}>
                <span style={{ fontSize: 12.5, color: cu.g500 }}>Exibido <span style={{ fontSize: 11, fontWeight: 700, color: cu.success, background: cu.successBg, borderRadius: 999, padding: '1px 7px', marginLeft: 4 }}>PÚBLICO</span></span>
                <span style={{ fontSize: 12.5, color: cu.g700, textAlign: 'right' } as React.CSSProperties}>{listing.addrPublic}</span>
              </div>
            </div>
            <div style={{ padding: '12px 0 0' }}>
              <div style={{ fontSize: 13, color: cu.g500, marginBottom: 6 }}>Descrição</div>
              <div style={{ fontSize: 13.5, color: cu.g700, lineHeight: 1.55, background: cu.page, borderRadius: 10, padding: '12px 14px' }}>{listing.desc}</div>
            </div>
          </div>

          {/* verificações */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <CIc n="sparkles" s={16} c={cu.primary} />
              <span style={{ ...cuSecLabel, margin: 0 }}>Verificações automáticas (IA)</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 } as React.CSSProperties}>
              {listing.checks.map((c: any) => (
                <div key={c.l} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '10px 12px', background: c.ok ? cu.page : cu.warnBg, borderRadius: 10, border: `1px solid ${c.ok ? cu.g300 : cu.warning + '55'}` }}>
                  <CIc n={c.ok ? 'check-circle' : 'alert-triangle'} s={18} c={c.ok ? cu.success : cu.warning} />
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: cu.ink }}>{c.l}</span>
                  <span style={{ fontSize: 12.5, color: c.ok ? cu.g500 : cu.warning, fontWeight: c.ok ? 400 : 700, textAlign: 'right' } as React.CSSProperties}>{c.v}</span>
                </div>
              ))}
            </div>
            {listing.checks.some((c: any) => c.l === 'Contato no texto' && !c.ok) && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9, marginTop: 12, background: cu.errBg, borderRadius: 10, padding: '11px 13px', fontSize: 12.5, color: cu.g700, lineHeight: 1.5 }}>
                <CIc n="shield-alert" s={16} c={cu.error} style={{ marginTop: 1, flexShrink: 0 }} />
                <span>Anúncios <strong style={{ color: cu.ink }}>não podem conter telefone/WhatsApp direto</strong>. O contato é sempre pela plataforma, no número da {demo.nomeCurto} (anti-vazamento).</span>
              </div>
            )}
          </div>

          {/* canais de publicação */}
          <CuChannels listingId={listing.id} />

          {/* devolver mode */}
          {mode === 'return' && (
            <div style={{ marginBottom: 12, background: cu.warnBg, border: `1px solid ${cu.warning}55`, borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: cu.ink, marginBottom: 10 }}>Devolver ao corretor</div>
              <div style={{ fontSize: 12, color: cu.g700, marginBottom: 8 }}>Pendências a corrigir</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 } as React.CSSProperties}>
                {pendOptions.map(o => (
                  <label key={o} style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer', fontSize: 13, color: cu.g700 }}>
                    <span onClick={() => togglePend(o)} style={{ width: 18, height: 18, borderRadius: 5, border: `1.5px solid ${pend[o] ? cu.primary : cu.g300}`, background: pend[o] ? cu.primary : '#fff', display: 'grid', placeItems: 'center', flexShrink: 0 }}>{pend[o] && <CIc n="check" s={13} c="#fff" />}</span>
                    {o}
                  </label>
                ))}
              </div>
              <textarea value={reason} onChange={e => setReason(e.target.value)} rows={3} placeholder="Mensagem ao corretor (opcional)…" style={{ width: '100%', border: `1px solid ${cu.g300}`, borderRadius: 10, padding: '10px 12px', fontFamily: 'var(--font-body)', fontSize: 13, color: cu.ink, outline: 'none', resize: 'vertical' } as React.CSSProperties} />
            </div>
          )}
        </div>
      </div>

      {/* footer actions */}
      <div style={{ padding: '14px 24px', borderTop: `1px solid ${cu.g300}` }}>
        {mode === 'view' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 } as React.CSSProperties}>
            <button style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, border: 'none', background: cu.success, color: '#fff', borderRadius: 10, padding: '12px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 14.5 }}><CIc n="check-circle" s={18} c="#fff" /> Aprovar e publicar</button>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setMode('return')} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, border: `1px solid ${cu.g300}`, background: '#fff', color: cu.error, borderRadius: 10, padding: '10px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13.5 }}><CIc n="corner-up-left" s={16} c={cu.error} /> Devolver</button>
              <button style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, border: `1px solid ${cu.g300}`, background: '#fff', color: cu.g700, borderRadius: 10, padding: '10px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13.5 }}><CIc n="pencil" s={16} c={cu.g700} /> Aprovar com ajustes</button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setMode('view')} style={{ flex: 1, border: `1px solid ${cu.g300}`, background: '#fff', color: cu.g700, borderRadius: 10, padding: '11px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14 }}>Cancelar</button>
            <button onClick={onClose} style={{ flex: 1.6, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, border: 'none', background: cu.error, color: '#fff', borderRadius: 10, padding: '11px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 14 }}><CIc n="corner-up-left" s={17} c="#fff" /> Devolver ao corretor</button>
          </div>
        )}
      </div>
    </React.Fragment>
  );
}

/* ---------------- PAGE ---------------- */
export default function CuradoriaPage() {
  const [seg, setSeg] = useStateCu('Anúncios');
  const [selected, setSelected] = useStateCu<any>(null);
  return (
    <CeoChrome>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 } as React.CSSProperties}>
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 30, letterSpacing: '-0.02em', margin: 0, color: cu.ink }}>Curadoria</h1>
        <div style={{ fontSize: 13.5, color: cu.g500, marginTop: 4 }}>Aprovação de anúncios e fotos · qualidade e conformidade da rede</div>
      </div>

      <CuSummary />

      {/* segment toggle */}
      <div style={{ display: 'flex', background: cu.g100, borderRadius: 999, padding: 4, alignSelf: 'flex-start' }}>
        {([['Anúncios', 'clipboard-list', 18], ['Fotos de perfil', 'image', 5]] as any[]).map(([s, ic, n]) => (
          <button key={s} onClick={() => setSeg(s)} style={{
            display: 'flex', alignItems: 'center', gap: 8, border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600,
            padding: '9px 18px', borderRadius: 999, transition: 'all .15s ease',
            background: seg === s ? '#fff' : 'transparent', color: seg === s ? cu.primary : cu.g500, boxShadow: seg === s ? 'var(--shadow-sm)' : 'none',
          }}>
            <CIc n={ic} s={16} c={seg === s ? cu.primary : cu.g500} /> {s}
            <span style={{ fontSize: 11.5, fontWeight: 700, color: seg === s ? '#fff' : cu.g500, background: seg === s ? cu.primary : cu.g300, borderRadius: 999, padding: '1px 7px' }}>{n}</span>
          </button>
        ))}
      </div>

      {seg === 'Anúncios' ? <CuListings onSelect={setSelected} /> : <CuPhotoQueue />}

      <CuDrawer open={!!selected} onClose={() => setSelected(null)}>
        <CuReview listing={selected} onClose={() => setSelected(null)} />
      </CuDrawer>
    </div>
    </CeoChrome>
  );
}
