"use client";
import * as React from "react";
import { pal, Ic } from "@/components/corretor/CorretorChrome";
import { STAGE_META } from "./data";

const FILTERS = ['Todos', 'Novos', 'Aguardando', 'Agendados', 'Negociação'];

function StageTag({ stage, small }: { stage: string; small?: boolean }) {
  const meta = STAGE_META[stage];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5, background: meta.bg, color: meta.c,
      fontSize: small ? 10.5 : 11, fontWeight: 700, borderRadius: 999, padding: small ? '2px 8px' : '3px 9px',
      fontFamily: 'var(--font-body)', whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: meta.dot }} />
      {stage}
    </span>
  );
}

function Selo({ conv }: { conv: any }) {
  if (conv.sla) {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: pal.errorBg, color: pal.error, fontSize: 10.5, fontWeight: 700, borderRadius: 999, padding: '2px 7px' }}>
        <Ic n="alarm-clock" s={12} c={pal.error} /> {conv.sla}
      </span>
    );
  }
  if (conv.quente) {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#FCEBDD', color: '#C2410C', fontSize: 10.5, fontWeight: 700, borderRadius: 999, padding: '2px 7px' }}>
        <Ic n="flame" s={12} c="#EA580C" /> Quente
      </span>
    );
  }
  if (conv.novo) {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: pal.lilac2, color: pal.primary, fontSize: 10.5, fontWeight: 700, borderRadius: 999, padding: '2px 7px' }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: pal.primary }} /> Novo
      </span>
    );
  }
  return null;
}

function Avatar({ conv, size = 44 }: { conv: any; size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: `linear-gradient(135deg, ${conv.av[0]}, ${conv.av[1]})`,
      display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 700,
      fontFamily: 'var(--font-display)', fontSize: size * 0.34,
    }}>{conv.initials}</div>
  );
}

function ConvCard({ conv, active, onSelect, density, showBadges }: {
  conv: any; active: boolean; onSelect: (id: string) => void; density: string; showBadges: boolean;
}) {
  const compact = density === 'Compacta';
  const lastMsg = conv.messages[conv.messages.length - 1];
  const body = lastMsg.type === 'audio' ? 'Áudio'
    : lastMsg.kind === 'masked' ? (lastMsg.text || '').replace('{num}', '•••')
    : lastMsg.kind === 'blocked' ? 'Mensagem bloqueada'
    : lastMsg.kind === 'advisory' ? 'Aviso da plataforma'
    : (lastMsg.text || 'Imóvel');
  const preview = lastMsg.from === 'me' ? 'Você: ' + body : body;
  return (
    <button onClick={() => onSelect(conv.id)} style={{
      width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer', position: 'relative',
      display: 'flex', gap: 12, padding: compact ? '10px 14px' : '13px 16px', borderRadius: 12,
      background: active ? pal.lilac2 : 'transparent', fontFamily: 'var(--font-body)',
      transition: 'background .14s ease',
    }}
      onMouseEnter={(e: any) => { if (!active) e.currentTarget.style.background = pal.lilac1; }}
      onMouseLeave={(e: any) => { if (!active) e.currentTarget.style.background = 'transparent'; }}>
      {active && <span style={{ position: 'absolute', left: 0, top: 12, bottom: 12, width: 3, borderRadius: 999, background: pal.primary }} />}
      <Avatar conv={conv} size={compact ? 38 : 44} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontWeight: 700, fontSize: 14, color: pal.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>{conv.name}</span>
          <span style={{ fontSize: 11.5, color: conv.sla ? pal.error : pal.g500, fontWeight: conv.sla ? 700 : 500, flexShrink: 0 }}>{conv.lastTime}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 3 }}>
          <span style={{ flex: 1, minWidth: 0, fontSize: 13, color: pal.g700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{preview}</span>
          {conv.unread > 0 && (
            <span style={{ flexShrink: 0, minWidth: 18, height: 18, padding: '0 5px', borderRadius: 999, background: pal.primary, color: '#fff', fontSize: 11, fontWeight: 700, display: 'grid', placeItems: 'center' }}>{conv.unread}</span>
          )}
        </div>
        {!compact && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
            <StageTag stage={conv.stage} small />
            {showBadges && <Selo conv={conv} />}
          </div>
        )}
      </div>
    </button>
  );
}

export function Inbox({ convs, activeId, onSelect, filter, setFilter, query, setQuery, density, showBadges }: {
  convs: any[]; activeId: string | null; onSelect: (id: string) => void;
  filter: string; setFilter: (f: string) => void; query: string; setQuery: (q: string) => void;
  density: string; showBadges: boolean;
}) {
  return (
    <div data-tour="atendimento-inbox" style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff', minWidth: 0 }}>
      {/* header */}
      <div style={{ padding: '16px 16px 12px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, margin: 0, color: pal.ink }}>Conversas</h2>
            <span style={{ fontSize: 12.5, color: pal.g500, fontWeight: 600 }}>{convs.length}</span>
          </div>
          <button title="Nova conversa" style={{ width: 34, height: 34, borderRadius: 10, border: 'none', background: pal.primary, color: '#fff', display: 'grid', placeItems: 'center', cursor: 'pointer', boxShadow: 'var(--shadow-purple)' }}>
            <Ic n="pen-line" s={17} c="#fff" />
          </button>
        </div>
        {/* search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: pal.g100, borderRadius: 999, padding: '9px 14px' }}>
          <Ic n="search" s={17} c={pal.g500} />
          <input value={query} onChange={(e: any) => setQuery(e.target.value)} placeholder="Buscar conversa" style={{ border: 'none', background: 'transparent', outline: 'none', fontFamily: 'var(--font-body)', fontSize: 13.5, flex: 1, color: pal.ink }} />
        </div>
      </div>
      {/* filter pills */}
      <div className="hide-scroll" style={{ display: 'flex', gap: 7, padding: '0 16px 12px', overflowX: 'auto', flexShrink: 0 }}>
        {FILTERS.map(f => {
          const on = filter === f;
          return (
            <button key={f} onClick={() => setFilter(f)} style={{
              flexShrink: 0, border: on ? `1px solid ${pal.primary}` : `1px solid ${pal.g300}`,
              background: on ? pal.primary : '#fff', color: on ? '#fff' : pal.g700,
              fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: 600, borderRadius: 999,
              padding: '6px 13px', cursor: 'pointer', transition: 'all .14s ease', whiteSpace: 'nowrap',
            }}>{f}</button>
          );
        })}
      </div>
      {/* list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px 12px' }}>
        {convs.length === 0 ? (
          <div style={{ padding: '40px 24px', textAlign: 'center', color: pal.g500 }}>
            <Ic n="search-x" s={28} c={pal.g300} />
            <div style={{ fontSize: 13.5, marginTop: 10 }}>Nenhuma conversa encontrada.</div>
          </div>
        ) : convs.map((c: any) => (
          <ConvCard key={c.id} conv={c} active={c.id === activeId} onSelect={onSelect} density={density} showBadges={showBadges} />
        ))}
      </div>
    </div>
  );
}
