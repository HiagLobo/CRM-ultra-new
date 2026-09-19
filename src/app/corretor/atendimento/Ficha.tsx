"use client";
import * as React from "react";
import { pal, Ic } from "@/components/corretor/CorretorChrome";
import { brand } from "@/config/brand";
import { STAGES, STAGE_META } from "./data";

function SectionLabel({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: pal.g500 }}>{children}</span>
      {right}
    </div>
  );
}

const QUALIFY = [
  { k: 'Quente', c: '#EA580C', bg: '#FCEBDD', icon: 'flame' },
  { k: 'Morno', c: '#C08A1E', bg: pal.warningBg, icon: 'thermometer' },
  { k: 'Frio', c: '#2563A8', bg: '#E5EEF7', icon: 'snowflake' },
  { k: 'Descartar', c: pal.g500, bg: pal.g100, icon: 'archive' },
];

export function Ficha({ conv, onStageChange, onAction, onQualify, isMobile, onBack }: {
  conv: any; onStageChange: (id: string, stage: string) => void;
  onAction: (id: string, key: string) => void; onQualify: (id: string, q: string) => void;
  isMobile: boolean; onBack: () => void;
}) {
  const actions = [
    { k: 'visita', label: 'Agendar visita', icon: 'calendar-plus', primary: true },
    { k: 'reuniao', label: 'Reunião online', icon: 'video' },
    { k: 'proposta', label: 'Gerar proposta', icon: 'file-text' },
    { k: 'desfecho', label: 'Registrar desfecho', icon: 'flag' },
    { k: 'transferir', label: 'Transferir', icon: 'user-round-cog' },
  ];
  return (
    <div data-tour="atendimento-ficha" style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff', borderLeft: `1px solid ${pal.g300}`, minWidth: 0 }}>
      {isMobile && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderBottom: `1px solid ${pal.g300}`, flexShrink: 0 }}>
          <button onClick={onBack} style={{ width: 36, height: 36, borderRadius: 10, border: 'none', background: pal.g100, display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
            <Ic n="arrow-left" s={19} c={pal.ink} />
          </button>
          <span style={{ fontWeight: 700, fontSize: 15, color: pal.ink }}>Ficha do lead</span>
        </div>
      )}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 18px 28px' }}>
        {/* contact */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', paddingBottom: 18, borderBottom: `1px solid ${pal.g100}` }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: `linear-gradient(135deg, ${conv.av[0]}, ${conv.av[1]})`, display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 700, fontFamily: 'var(--font-display)', fontSize: 22 }}>{conv.initials}</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: pal.ink, marginTop: 10 }}>{conv.name}</div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: pal.g500, marginTop: 5, background: pal.g100, borderRadius: 999, padding: '4px 11px' }}>
            <Ic n="shield-check" s={13} c={pal.success} /> Contato protegido · via {brand.nomeCurto}
          </div>
        </div>

        {/* etapa do funil */}
        <div data-tour="atendimento-etapa" style={{ padding: '18px 0', borderBottom: `1px solid ${pal.g100}` }}>
          <SectionLabel right={<span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10.5, color: pal.success, fontWeight: 600 }}><Ic n="sparkles" s={12} c={pal.success} /> automático</span>}>Etapa do funil</SectionLabel>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
            {STAGES.map((s: string) => {
              const on = conv.stage === s;
              const meta = STAGE_META[s];
              return (
                <button key={s} onClick={() => onStageChange(conv.id, s)} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5, borderRadius: 999,
                  border: on ? `1.5px solid ${meta.c}` : `1px solid ${pal.g300}`,
                  background: on ? meta.bg : '#fff', color: on ? meta.c : pal.g700,
                  fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: on ? 700 : 600,
                  padding: on ? '6px 12px' : '6.5px 12px', cursor: 'pointer',
                }}>
                  {on && <Ic n="check" s={13} c={meta.c} />}
                  {s}
                </button>
              );
            })}
          </div>
        </div>

        {/* imóvel de interesse */}
        <div style={{ padding: '18px 0', borderBottom: `1px solid ${pal.g100}` }}>
          <SectionLabel>Imóvel de interesse</SectionLabel>
          <div style={{ display: 'flex', gap: 11, background: pal.lilac1, border: `1px solid ${pal.lilac2}`, borderRadius: 12, padding: 10 }}>
            <div style={{ width: 58, height: 58, borderRadius: 9, flexShrink: 0, background: `linear-gradient(135deg, ${pal.lilac2}, #DCC9EC)`, display: 'grid', placeItems: 'center' }}>
              <Ic n="building-2" s={22} c={pal.light} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: pal.ink, lineHeight: 1.3 }}>{conv.property.title}</div>
              <div style={{ fontSize: 11.5, color: pal.g500, marginTop: 2 }}>Cód {conv.property.code} · {conv.property.area}</div>
              <div style={{ fontWeight: 800, fontSize: 14, color: pal.primary, fontFamily: 'var(--font-display)', marginTop: 4 }}>{conv.property.price}</div>
            </div>
          </div>
        </div>

        {/* etiquetas */}
        <div style={{ padding: '18px 0', borderBottom: `1px solid ${pal.g100}` }}>
          <SectionLabel>Etiquetas</SectionLabel>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
            {[['wallet', conv.budget], ['target', conv.finalidade]].map(([ic, txt], i) => (
              <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: pal.g100, color: pal.g700, fontSize: 12, fontWeight: 600, borderRadius: 999, padding: '5px 11px' }}>
                <Ic n={ic} s={13} c={pal.g500} /> {txt}
              </span>
            ))}
          </div>
        </div>

        {/* qualificar */}
        <div style={{ padding: '18px 0', borderBottom: `1px solid ${pal.g100}` }}>
          <SectionLabel right={<span style={{ fontSize: 10.5, color: pal.g500, fontWeight: 500 }}>não afeta o score</span>}>Qualificar</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
            {QUALIFY.map((q: any) => {
              const on = conv.qualify === q.k;
              return (
                <button key={q.k} onClick={() => onQualify(conv.id, q.k)} style={{
                  display: 'flex', alignItems: 'center', gap: 7, borderRadius: 10,
                  border: on ? `1.5px solid ${q.c}` : `1px solid ${pal.g300}`,
                  background: on ? q.bg : '#fff', color: on ? q.c : pal.g700,
                  fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: on ? 700 : 600,
                  padding: '8px 11px', cursor: 'pointer',
                }}>
                  <Ic n={q.icon} s={14} c={on ? q.c : pal.g500} /> {q.k}
                </button>
              );
            })}
          </div>
        </div>

        {/* ações rápidas */}
        <div data-tour="atendimento-acoes" style={{ padding: '18px 0', borderBottom: `1px solid ${pal.g100}` }}>
          <SectionLabel>Ações rápidas</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {actions.map((a: any) => (
              <button key={a.k} onClick={() => onAction(conv.id, a.k)} style={{
                display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                border: a.primary ? 'none' : `1px solid ${pal.g300}`,
                background: a.primary ? pal.primary : '#fff', color: a.primary ? '#fff' : pal.ink,
                borderRadius: 11, padding: '11px 14px', cursor: 'pointer', fontFamily: 'var(--font-body)',
                fontWeight: 600, fontSize: 13.5, textAlign: 'left', transition: 'all .14s ease',
                boxShadow: a.primary ? 'var(--shadow-purple)' : 'none',
              }}
                onMouseEnter={(e: any) => { if (!a.primary) e.currentTarget.style.background = pal.lilac1; }}
                onMouseLeave={(e: any) => { if (!a.primary) e.currentTarget.style.background = '#fff'; }}>
                <Ic n={a.icon} s={18} c={a.primary ? '#fff' : pal.primary} />
                <span style={{ flex: 1 }}>{a.label}</span>
                <Ic n="chevron-right" s={16} c={a.primary ? 'rgba(255,255,255,.7)' : pal.g300} />
              </button>
            ))}
          </div>
        </div>

        {/* linha do tempo */}
        <div style={{ paddingTop: 18 }}>
          <SectionLabel>Linha do tempo</SectionLabel>
          <div style={{ position: 'relative', paddingLeft: 6 }}>
            {conv.timeline.map((ev: any, i: number) => {
              const last = i === conv.timeline.length - 1;
              const color = ev.warn ? pal.error : ev.accent ? pal.primary : pal.g300;
              return (
                <div key={i} style={{ display: 'flex', gap: 12, paddingBottom: last ? 0 : 16, position: 'relative' }}>
                  {!last && <span style={{ position: 'absolute', left: 13, top: 28, bottom: 0, width: 1.5, background: pal.g100 }} />}
                  <div style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, background: ev.warn ? pal.errorBg : ev.accent ? pal.lilac2 : pal.g100, display: 'grid', placeItems: 'center' }}>
                    <Ic n={ev.icon} s={15} c={color} />
                  </div>
                  <div style={{ paddingTop: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: ev.warn ? pal.error : pal.ink, lineHeight: 1.3 }}>{ev.t}</div>
                    <div style={{ fontSize: 11.5, color: pal.g500, marginTop: 1 }}>{ev.d}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
