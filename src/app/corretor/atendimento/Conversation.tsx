"use client";
import * as React from "react";
import { pal, Ic } from "@/components/corretor/CorretorChrome";
import { brand } from "@/config/brand";
import { TEMPLATES } from "./data";
import { MeetingEventCard } from "./MeetingDetail";

function Ticks({ status }: { status: string | null }) {
  if (!status) return null;
  const c = status === 'read' ? '#7CC4FF' : 'rgba(255,255,255,.7)';
  return <Ic n="check-check" s={14} c={c} style={{ marginLeft: 2 }} />;
}

function PropertyBubble({ conv }: { conv: any }) {
  return (
    <div style={{ alignSelf: 'flex-end', flexShrink: 0, maxWidth: 320, background: '#fff', borderRadius: '16px 16px 4px 16px', border: `1px solid ${pal.g300}`, overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
      <div style={{ height: 116, background: `linear-gradient(135deg, ${pal.lilac2}, #DCC9EC)`, position: 'relative', display: 'grid', placeItems: 'center' }}>
        <Ic n="building-2" s={34} c={pal.light} />
        <span style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(49,46,129,.82)', color: '#fff', fontSize: 10, fontWeight: 700, letterSpacing: '.04em', borderRadius: 6, padding: '3px 7px' }}>CÓD {conv.property.code}</span>
      </div>
      <div style={{ padding: '11px 13px' }}>
        <div style={{ fontWeight: 700, fontSize: 13.5, color: pal.ink }}>{conv.property.title}</div>
        <div style={{ fontSize: 12, color: pal.g500, marginTop: 2 }}>{conv.property.specs} · {conv.property.area}</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
          <span style={{ fontWeight: 800, fontSize: 15, color: pal.primary, fontFamily: 'var(--font-display)' }}>{conv.property.price}</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11.5, fontWeight: 600, color: pal.primary }}><Ic n="external-link" s={13} c={pal.primary} /> Ver imóvel</span>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 3, padding: '0 10px 7px' }}>
        <span style={{ fontSize: 10.5, color: pal.g500 }}>09:35</span>
        <Ic n="check-check" s={13} c="#7CC4FF" />
      </div>
    </div>
  );
}

function AudioBubble({ msg, bubbleFill }: { msg: any; bubbleFill: string }) {
  const me = msg.from === 'me';
  const solid = bubbleFill === 'Roxo sólido';
  const meBg = solid ? pal.primary : pal.lilac2;
  const fg = me ? (solid ? '#fff' : pal.ink) : pal.ink;
  const dim = me ? (solid ? 'rgba(255,255,255,.55)' : 'rgba(28,26,34,.3)') : pal.g300;
  const accent = me ? (solid ? '#fff' : pal.primary) : pal.primary;
  const bars = [9, 15, 22, 13, 19, 26, 16, 11, 20, 14, 24, 12, 18, 10, 16];
  return (
    <div style={{
      alignSelf: me ? 'flex-end' : 'flex-start', flexShrink: 0, maxWidth: '74%', display: 'flex', alignItems: 'center', gap: 11,
      background: me ? meBg : '#fff', border: me ? (solid ? 'none' : `1px solid ${pal.lilac2}`) : `1px solid ${pal.g300}`,
      borderRadius: me ? '16px 16px 4px 16px' : '16px 16px 16px 4px', padding: '10px 14px',
      boxShadow: me && solid ? 'var(--shadow-sm)' : 'none',
    }}>
      <span style={{ width: 32, height: 32, flexShrink: 0, borderRadius: '50%', background: me && solid ? 'rgba(255,255,255,.2)' : pal.lilac2, display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
        <Ic n="play" s={15} c={accent} />
      </span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 2.5, height: 28 }}>
        {bars.map((h, i) => <span key={i} style={{ width: 2.5, height: h, borderRadius: 2, background: i < 5 ? accent : dim } as React.CSSProperties} />)}
      </span>
      <span style={{ fontSize: 11.5, fontWeight: 600, color: me ? (solid ? 'rgba(255,255,255,.8)' : pal.g500) : pal.g500, flexShrink: 0 }}>{msg.dur}</span>
    </div>
  );
}

function BlockedBubble({ msg }: { msg: any }) {
  return (
    <div style={{ alignSelf: 'flex-end', flexShrink: 0, maxWidth: '80%', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5 }}>
      <div style={{ background: '#fff', border: '1px dashed #E0A8A8', borderRadius: '16px 16px 4px 16px', padding: '9px 13px' }}>
        <div style={{ fontSize: 14, color: pal.g500, lineHeight: 1.5, textDecoration: 'line-through', textDecorationColor: 'rgba(214,69,69,.5)' }}>{msg.text}</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4, marginTop: 6, fontSize: 11, color: pal.error, fontWeight: 700 }}>
          <Ic n="ban" s={13} c={pal.error} /> Não enviada · {msg.time}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: pal.errorBg, border: '1px solid #F2C9C9', borderRadius: 10, padding: '7px 11px', maxWidth: '100%' }}>
        <Ic n="shield-alert" s={14} c={pal.error} style={{ flexShrink: 0 }} />
        <span style={{ fontSize: 11.5, color: '#9A3A3A', lineHeight: 1.4 }}>Pedir contato pessoal viola a política. Mantenha o atendimento por aqui.</span>
      </div>
    </div>
  );
}

function AdvisoryNote({ msg }: { msg: any }) {
  return (
    <div style={{ alignSelf: 'center', flexShrink: 0, maxWidth: '90%', display: 'flex', gap: 9, background: pal.warningBg, border: '1px solid #F0DCA8', borderRadius: 12, padding: '10px 13px', margin: '2px 0' }}>
      <Ic n="info" s={16} c="#C08A1E" style={{ flexShrink: 0, marginTop: 1 }} />
      <span style={{ fontSize: 12.5, color: '#8A5F0C', lineHeight: 1.5 }}>{msg.text}</span>
    </div>
  );
}

function MaskedBubble({ msg }: { msg: any }) {
  const parts = (msg.text || '').split('{num}');
  return (
    <div style={{ alignSelf: 'flex-start', flexShrink: 0, maxWidth: '80%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 5 }}>
      <div style={{ background: '#fff', border: `1px solid ${pal.g300}`, borderRadius: '16px 16px 16px 4px', padding: '9px 13px', fontSize: 14, color: pal.ink, lineHeight: 1.5 }}>
        {parts[0]}
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: pal.g100, color: pal.g500, borderRadius: 6, padding: '1px 8px', fontWeight: 700, letterSpacing: '.06em', verticalAlign: 'middle' }}>
          <Ic n="eye-off" s={12} c={pal.g500} /> •• ••••-••••
        </span>
        {parts[1]}
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, marginLeft: 8, fontSize: 10.5, color: pal.g500, position: 'relative', top: 4 }}>{msg.time}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: pal.g500 }}>
        <Ic n="shield-check" s={13} c={pal.success} /> Número ocultado automaticamente pelo {brand.nomeCurto}
      </div>
    </div>
  );
}

function AutoBubble({ msg }: { msg: any }) {
  return (
    <div style={{ alignSelf: 'flex-end', flexShrink: 0, maxWidth: '80%', background: pal.lilac2, border: `1px solid #DCC9EC`, borderRadius: '16px 16px 4px 16px', padding: '10px 13px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
        <Ic n="sparkles" s={13} c={pal.primary} />
        <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: pal.primary }}>Resposta automática</span>
      </div>
      <div style={{ fontSize: 14, color: pal.ink, lineHeight: 1.5 }}>{msg.text}</div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 3, marginTop: 4, fontSize: 10.5, color: pal.primary }}>
        {msg.time} <Ic n="check-check" s={13} c={pal.primary} />
      </div>
    </div>
  );
}

function TemplateBubble({ msg }: { msg: any }) {
  return (
    <div style={{ alignSelf: 'flex-end', flexShrink: 0, maxWidth: '78%', background: pal.primary, color: '#fff', borderRadius: '16px 16px 4px 16px', padding: '10px 13px 8px', boxShadow: 'var(--shadow-sm)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}>
        <Ic n="layout-template" s={12} c="rgba(255,255,255,.85)" />
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: 'rgba(255,255,255,.85)' }}>Modelo · {msg.templateName}</span>
      </div>
      <div style={{ fontSize: 14, lineHeight: 1.5 }}>{msg.text}</div>
      {msg.buttons && msg.buttons.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 9, paddingTop: 9, borderTop: '1px solid rgba(255,255,255,.22)' }}>
          {msg.buttons.map((b: string, i: number) => (
            <span key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: 'rgba(255,255,255,.16)', color: '#fff', borderRadius: 8, padding: '7px', fontSize: 12.5, fontWeight: 600 }}>
              <Ic n="square-mouse-pointer" s={13} c="#fff" /> {b}
            </span>
          ))}
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 3, marginTop: 5, fontSize: 10.5, color: 'rgba(255,255,255,.72)' }}>
        {msg.time} <Ic n="check-check" s={13} c={msg.status === 'read' ? '#7CC4FF' : 'rgba(255,255,255,.72)'} />
      </div>
    </div>
  );
}

export function windowState(conv: any): string {
  if (conv.windowHrs == null) return 'fechada';
  if (conv.windowHrs <= 3) return 'fechando';
  return 'aberta';
}

function WindowPill({ conv }: { conv: any }) {
  const st = windowState(conv);
  const map: Record<string, any> = {
    aberta:   { bg: pal.successBg, c: '#1E7A43', ic: 'unlock', icc: '#2E9E5B', txt: `Janela aberta · faltam ${conv.windowHrs}h` },
    fechando: { bg: pal.warningBg, c: '#9A6B0E', ic: 'clock-alert', icc: '#C08A1E', txt: `A janela fecha em ${conv.windowHrs}h` },
    fechada:  { bg: pal.errorBg, c: '#9A3A3A', ic: 'lock', icc: '#D64545', txt: 'Janela fechada · envie um modelo para retomar' },
  };
  const mv = map[st];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6, borderRadius: 999, padding: '5px 11px',
      fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-body)', background: mv.bg, color: mv.c,
    }}>
      <Ic n={mv.ic} s={13} c={mv.icc} /> {mv.txt}
    </span>
  );
}

function HandoffCard({ conv }: { conv: any }) {
  const [open, setOpen] = React.useState(true);
  const h = conv.handoff;
  return (
    <div data-tour="atendimento-ia" style={{ alignSelf: 'stretch', flexShrink: 0, background: '#fff', border: `1px solid ${pal.lilac2}`, borderRadius: 16, boxShadow: 'var(--shadow-sm)', overflow: 'hidden', margin: '0 0 4px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '12px 14px', background: 'linear-gradient(180deg, #EEF2FF, #fff)' }}>
        <span style={{ width: 34, height: 34, flexShrink: 0, borderRadius: 10, background: pal.lilac2, display: 'grid', placeItems: 'center' }}>
          <Ic n="bot" s={19} c={pal.primary} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ fontWeight: 700, fontSize: 13.5, color: pal.ink }}>Resumo do pré-atendimento</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10, fontWeight: 700, letterSpacing: '.03em', textTransform: 'uppercase', color: pal.primary, background: pal.lilac2, borderRadius: 999, padding: '2px 7px' }}>
              <Ic n="sparkles" s={11} c={pal.primary} /> {h.botQualify}
            </span>
          </div>
          <div style={{ fontSize: 11.5, color: pal.g500, marginTop: 1 }}>Assistente de IA · transferido {h.time}</div>
        </div>
        <button onClick={() => setOpen((o: boolean) => !o)} style={{ width: 30, height: 30, flexShrink: 0, borderRadius: 8, border: 'none', background: 'transparent', display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
          <span style={{ display: 'inline-flex', transition: 'transform .2s ease', transform: open ? 'rotate(180deg)' : 'none' }}><Ic n="chevron-down" s={17} c={pal.g500} /></span>
        </button>
      </div>
      {open && (
        <div style={{ padding: '4px 14px 14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 14px', padding: '6px 0 12px' }}>
            {h.fields.map(([ic, label, val]: [string, string, string], i: number) => (
              <div key={i} style={{ display: 'flex', gap: 9, minWidth: 0 }}>
                <Ic n={ic} s={16} c={pal.g500} style={{ marginTop: 2 }} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '.03em', textTransform: 'uppercase', color: pal.g500 }}>{label}</div>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: pal.ink, lineHeight: 1.35 }}>{val}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, background: pal.lilac1, border: `1px solid ${pal.lilac2}`, borderRadius: 10, padding: '10px 12px' }}>
            <Ic n="quote" s={14} c={pal.light} style={{ marginTop: 2, flexShrink: 0 }} />
            <span style={{ fontSize: 12.5, color: pal.g700, lineHeight: 1.5 }}>{h.resumo}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10, fontSize: 11.5, color: pal.g500 }}>
            <Ic n="gauge" s={13} c={pal.warning} /> Urgência: <strong style={{ color: pal.g700, fontWeight: 600 }}>{conv.handoff.urgencia}</strong>
          </div>
        </div>
      )}
    </div>
  );
}

function Bubble({ msg, conv, bubbleFill }: { msg: any; conv: any; bubbleFill: string }) {
  if (msg.time === 'card') return <PropertyBubble conv={conv} />;
  if (msg.kind === 'blocked') return <BlockedBubble msg={msg} />;
  if (msg.kind === 'advisory') return <AdvisoryNote msg={msg} />;
  if (msg.kind === 'masked') return <MaskedBubble msg={msg} />;
  if (msg.kind === 'auto') return <AutoBubble msg={msg} />;
  if (msg.kind === 'template') return <TemplateBubble msg={msg} />;
  if (msg.type === 'audio') return <AudioBubble msg={msg} bubbleFill={bubbleFill} />;
  const me = msg.from === 'me';
  const solid = bubbleFill === 'Roxo sólido';
  const meBg = solid ? pal.primary : pal.lilac2;
  const meColor = solid ? '#fff' : pal.ink;
  const meTime = solid ? 'rgba(255,255,255,.72)' : pal.g500;
  return (
    <div style={{
      alignSelf: me ? 'flex-end' : 'flex-start', flexShrink: 0, maxWidth: '74%',
      background: me ? meBg : '#fff', color: me ? meColor : pal.ink,
      border: me ? (solid ? 'none' : `1px solid ${pal.lilac2}`) : `1px solid ${pal.g300}`,
      borderRadius: me ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
      padding: '9px 13px 7px', fontSize: 14, lineHeight: 1.5, fontFamily: 'var(--font-body)',
      boxShadow: me && solid ? 'var(--shadow-sm)' : 'none', position: 'relative',
    }}>
      <span>{msg.text}</span>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, marginLeft: 8, fontSize: 10.5, color: me ? meTime : pal.g500, float: 'right', position: 'relative', top: 5 }}>
        {msg.time}
        {me && (solid ? <Ticks status={msg.status} /> : <Ic n="check-check" s={13} c={msg.status === 'read' ? pal.primary : pal.g500} style={{ marginLeft: 2 }} />)}
      </span>
    </div>
  );
}

export function Conversation({ conv, meetings, onOpenMeeting, onChooseTemplate, onSend, onSendAudio, onAttachImovel, bubbleFill, wallpaper, isMobile, onBack, onOpenFicha }: {
  conv: any; meetings: any[]; onOpenMeeting: (convId: string, meetId: string) => void;
  onChooseTemplate: (convId: string) => void; onSend: (id: string, text: string) => void;
  onSendAudio: (id: string, dur: string) => void; onAttachImovel: (id: string) => void;
  bubbleFill: string; wallpaper: string; isMobile: boolean; onBack: () => void; onOpenFicha: () => void;
}) {
  const [draft, setDraft] = React.useState('');
  const [showTpl, setShowTpl] = React.useState(false);
  const [recording, setRecording] = React.useState(false);
  const [recSecs, setRecSecs] = React.useState(0);
  const recTimer = React.useRef<any>(null);
  const threadRef = React.useRef<any>(null);
  const winSt = windowState(conv);
  const fechada = winSt === 'fechada';
  const awaiting = !!conv.awaitingReopen;

  const fmtRec = (s: number) => '0:' + String(s).padStart(2, '0');
  const startRec = () => {
    setRecording(true); setRecSecs(0);
    recTimer.current = setInterval(() => setRecSecs((s: number) => s + 1), 1000);
  };
  const stopRec = (sendIt: boolean) => {
    clearInterval(recTimer.current);
    if (sendIt) onSendAudio(conv.id, fmtRec(Math.max(recSecs, 1)));
    setRecording(false); setRecSecs(0);
  };
  React.useEffect(() => () => clearInterval(recTimer.current), []);

  React.useEffect(() => {
    const el = threadRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [conv.id, conv.messages.length]);

  const send = () => {
    const v = draft.trim();
    if (!v) return;
    onSend(conv.id, v);
    setDraft('');
    setShowTpl(false);
  };

  return (
    <div data-tour="atendimento-conversa" style={{ display: 'flex', flexDirection: 'column', height: '100%', background: pal.page, minWidth: 0 }}>
      {/* header */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9, padding: '11px 16px', background: '#fff', borderBottom: `1px solid ${pal.g300}`, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          {isMobile && (
            <button onClick={onBack} style={{ width: 36, height: 36, borderRadius: 10, border: 'none', background: pal.g100, display: 'grid', placeItems: 'center', cursor: 'pointer', flexShrink: 0 }}>
              <Ic n="arrow-left" s={19} c={pal.ink} />
            </button>
          )}
          <div style={{ width: 42, height: 42, borderRadius: '50%', flexShrink: 0, background: `linear-gradient(135deg, ${conv.av[0]}, ${conv.av[1]})`, display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 700, fontFamily: 'var(--font-display)', fontSize: 14 }}>{conv.initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 15.5, color: pal.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{conv.name}</div>
            <div style={{ fontSize: 12.5, color: pal.g500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {conv.property.title} · {conv.property.price}
            </div>
          </div>
          {isMobile && (
            <button onClick={onOpenFicha} title="Ficha" style={{ width: 38, height: 38, borderRadius: 10, border: `1px solid ${pal.g300}`, background: '#fff', display: 'grid', placeItems: 'center', cursor: 'pointer', flexShrink: 0 }}>
              <Ic n="panel-right" s={18} c={pal.primary} />
            </button>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <WindowPill conv={conv} />
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, color: pal.g500, fontWeight: 500 }}>
            <Ic n="shield-check" s={13} c={pal.success} /> Contato protegido
          </span>
        </div>
      </div>

      {/* thread */}
      <div ref={threadRef} data-thread="1" style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '18px 18px 8px', display: 'flex', flexDirection: 'column', gap: 9,
        background: wallpaper === 'Sutil' ? 'radial-gradient(circle at 1px 1px, rgba(79,70,229,.055) 1px, transparent 0) 0 0 / 20px 20px, ' + pal.page : pal.page }}>
        <HandoffCard conv={conv} />
        {(meetings || []).map((mtg: any) => <MeetingEventCard key={mtg.id} meeting={mtg} onOpen={() => onOpenMeeting(conv.id, mtg.id)} />)}
        <div style={{ alignSelf: 'center', flexShrink: 0, background: 'rgba(255,255,255,.85)', backdropFilter: 'blur(4px)', color: pal.g500, fontSize: 11.5, fontWeight: 600, borderRadius: 999, padding: '4px 12px', margin: '2px 0 6px', boxShadow: 'var(--shadow-sm)' }}>Hoje</div>
        {conv.messages.map((msg: any, i: number) => <Bubble key={i} msg={msg} conv={conv} bubbleFill={bubbleFill} />)}
      </div>

      {/* templates flyout */}
      {showTpl && !fechada && (
        <div style={{ margin: '0 18px 8px', background: '#fff', border: `1px solid ${pal.g300}`, borderRadius: 14, boxShadow: 'var(--shadow-lg)', overflow: 'hidden' }}>
          <div style={{ padding: '10px 14px', borderBottom: `1px solid ${pal.g100}`, fontSize: 12, fontWeight: 700, color: pal.g500, letterSpacing: '.04em', textTransform: 'uppercase' }}>Respostas rápidas</div>
          {TEMPLATES.map((t: any, i: number) => (
            <button key={i} onClick={() => { setDraft(t.text); setShowTpl(false); }} style={{ width: '100%', textAlign: 'left', border: 'none', background: 'transparent', cursor: 'pointer', padding: '11px 14px', borderBottom: i < TEMPLATES.length - 1 ? `1px solid ${pal.g100}` : 'none', fontFamily: 'var(--font-body)' }}
              onMouseEnter={(e: any) => e.currentTarget.style.background = pal.lilac1}
              onMouseLeave={(e: any) => e.currentTarget.style.background = 'transparent'}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: pal.primary, marginBottom: 2 }}>{t.label}</div>
              <div style={{ fontSize: 12.5, color: pal.g700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.text}</div>
            </button>
          ))}
        </div>
      )}

      {/* composer */}
      <div style={{ padding: '12px 18px 16px', background: '#fff', borderTop: `1px solid ${pal.g300}`, flexShrink: 0 }}>
        {fechada ? (
          awaiting ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 11, background: pal.warningBg, border: '1px solid #F0DCA8', borderRadius: 14, padding: '13px 15px' }}>
              <span className="rec-dot" style={{ width: 10, height: 10, borderRadius: '50%', background: pal.warning, flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: '#8A5F0C', fontWeight: 500, lineHeight: 1.4 }}>Modelo enviado · aguardando resposta para reabrir a conversa.</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: pal.g100, borderRadius: 12, padding: '11px 14px' }}>
                <Ic n="lock" s={16} c={pal.g500} style={{ flexShrink: 0 }} />
                <span style={{ fontSize: 12.5, color: pal.g500, lineHeight: 1.4 }}>Para escrever livremente, o cliente precisa responder primeiro.</span>
              </div>
              <button onClick={() => onChooseTemplate(conv.id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, width: '100%', border: 'none', background: pal.primary, color: '#fff', borderRadius: 12, padding: '13px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 14.5, boxShadow: 'var(--shadow-purple)' }}>
                <Ic n="layout-template" s={19} c="#fff" /> Escolher modelo para retomar
              </button>
            </div>
          )
        ) : recording ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: pal.errorBg, border: '1px solid #F2C9C9', borderRadius: 14, padding: '9px 12px' }}>
            <button onClick={() => stopRec(false)} title="Cancelar" style={{ width: 38, height: 38, flexShrink: 0, borderRadius: 11, border: 'none', background: '#fff', display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
              <Ic n="trash-2" s={18} c={pal.error} />
            </button>
            <span className="rec-dot" style={{ width: 11, height: 11, borderRadius: '50%', background: pal.error, flexShrink: 0 }} />
            <span style={{ fontSize: 14, fontWeight: 700, color: pal.error, fontVariantNumeric: 'tabular-nums' }}>{fmtRec(recSecs)}</span>
            <span style={{ flex: 1, fontSize: 13, color: '#9A4A4A' }}>Gravando áudio…</span>
            <button onClick={() => stopRec(true)} title="Enviar áudio" style={{ width: 46, height: 46, flexShrink: 0, borderRadius: 14, border: 'none', background: pal.primary, display: 'grid', placeItems: 'center', cursor: 'pointer', boxShadow: 'var(--shadow-purple)' }}>
              <Ic n="send-horizontal" s={20} c="#fff" />
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 9 }}>
            <button onClick={() => setShowTpl((s: boolean) => !s)} title="Respostas rápidas" style={{ width: 42, height: 42, flexShrink: 0, borderRadius: 12, border: `1px solid ${showTpl ? pal.primary : pal.g300}`, background: showTpl ? pal.lilac2 : '#fff', display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
              <Ic n="zap" s={19} c={pal.primary} />
            </button>
            <button onClick={() => onAttachImovel(conv.id)} title="Anexar imóvel" style={{ width: 42, height: 42, flexShrink: 0, borderRadius: 12, border: `1px solid ${pal.g300}`, background: '#fff', display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
              <Ic n="building-2" s={19} c={pal.g700} />
            </button>
            <button title="Anexar arquivo" className="composer-clip" style={{ width: 42, height: 42, flexShrink: 0, borderRadius: 12, border: `1px solid ${pal.g300}`, background: '#fff', display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
              <Ic n="paperclip" s={19} c={pal.g700} />
            </button>
            <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', background: pal.g100, borderRadius: 14, padding: '4px 6px 4px 16px' }}>
              <input value={draft} onChange={(e: any) => setDraft(e.target.value)} onKeyDown={(e: any) => { if (e.key === 'Enter') send(); }}
                placeholder="Escreva uma mensagem…"
                style={{ flex: 1, minWidth: 0, width: '100%', border: 'none', background: 'transparent', outline: 'none', fontFamily: 'var(--font-body)', fontSize: 14, color: pal.ink, padding: '9px 0' }} />
            </div>
            {draft.trim() ? (
              <button onClick={send} title="Enviar" style={{ width: 46, height: 46, flexShrink: 0, borderRadius: 14, border: 'none', background: pal.primary, color: '#fff', display: 'grid', placeItems: 'center', cursor: 'pointer', boxShadow: 'var(--shadow-purple)', transition: 'background .15s ease' }}>
                <Ic n="send-horizontal" s={20} c="#fff" />
              </button>
            ) : (
              <button onClick={startRec} title="Gravar áudio" style={{ width: 46, height: 46, flexShrink: 0, borderRadius: 14, border: 'none', background: pal.primary, color: '#fff', display: 'grid', placeItems: 'center', cursor: 'pointer', boxShadow: 'var(--shadow-purple)' }}>
                <Ic n="mic" s={20} c="#fff" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
