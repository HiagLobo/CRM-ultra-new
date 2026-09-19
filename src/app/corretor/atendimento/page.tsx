"use client";
import * as React from "react";
import CorretorChrome, { pal, Ic } from "@/components/corretor/CorretorChrome";
import { demo } from "@/config/demo";
import { SEED, MEETINGS, cloneDeep, nowTime } from "./data";
import { Inbox } from "./Inbox";
import { Conversation } from "./Conversation";
import { Ficha } from "./Ficha";
import { CreateMeetingModal } from "./Meeting";
import { MeetingDetail } from "./MeetingDetail";
import { TemplateModal } from "./Templates";

/* ---------- TOAST ---------- */
function Toast({ toast }: { toast: any }) {
  if (!toast) return null;
  return (
    <div key={toast.id} style={{
      position: 'fixed', bottom: 26, left: '50%', transform: 'translateX(-50%)', zIndex: 9000,
      display: 'flex', alignItems: 'center', gap: 10, background: pal.ink, color: '#fff',
      borderRadius: 12, padding: '12px 18px', boxShadow: 'var(--shadow-lg)', fontFamily: 'var(--font-body)',
      fontSize: 13.5, fontWeight: 500, animation: 'toastUp .26s cubic-bezier(.2,.7,.3,1)', maxWidth: 420,
    }}>
      <span style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(255,255,255,.14)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
        <Ic n={toast.icon || 'check'} s={15} c="#fff" />
      </span>
      <span>{toast.msg}</span>
    </div>
  );
}

/* ---------- SKELETON ---------- */
function Skeleton() {
  const bar = (w: string, h = 12, mt = 0) => <div className="sk" style={{ width: w, height: h, borderRadius: 6, marginTop: mt }} />;
  return (
    <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
      <div style={{ width: 332, borderRight: `1px solid ${pal.g300}`, background: '#fff', padding: 16 }}>
        {bar('45%', 18)}{bar('100%', 38, 16)}
        {[0, 1, 2, 3, 4].map(i => (
          <div key={i} style={{ display: 'flex', gap: 12, marginTop: 20 }}>
            <div className="sk" style={{ width: 44, height: 44, borderRadius: '50%' }} />
            <div style={{ flex: 1 }}>{bar('60%', 13)}{bar('90%', 11, 8)}{bar('40%', 16, 10)}</div>
          </div>
        ))}
      </div>
      <div style={{ flex: 1, background: pal.page, padding: 18 }}>
        {bar('30%', 18)}
        <div style={{ marginTop: 30, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="sk" style={{ width: '50%', height: 40, borderRadius: 14, alignSelf: 'flex-start' }} />
          <div className="sk" style={{ width: '55%', height: 56, borderRadius: 14, alignSelf: 'flex-end' }} />
          <div className="sk" style={{ width: '40%', height: 40, borderRadius: 14, alignSelf: 'flex-start' }} />
        </div>
      </div>
      <div style={{ width: 336, borderLeft: `1px solid ${pal.g300}`, background: '#fff', padding: 18 }}>
        <div className="sk" style={{ width: 64, height: 64, borderRadius: '50%', margin: '0 auto' }} />
        {bar('60%', 16, 14)}{bar('100%', 56, 20)}{bar('100%', 120, 16)}
      </div>
    </div>
  );
}

/* ---------- EMPTY STATE ---------- */
function EmptyState() {
  return (
    <div style={{ flex: 1, display: 'grid', placeItems: 'center', background: pal.page }}>
      <div style={{ textAlign: 'center', maxWidth: 320 }}>
        <div style={{ width: 72, height: 72, borderRadius: 20, background: pal.lilac2, display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}>
          <Ic n="messages-square" s={32} c={pal.primary} />
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 19, color: pal.ink }}>Nenhuma conversa selecionada</div>
        <div style={{ fontSize: 13.5, color: pal.g500, marginTop: 6, lineHeight: 1.55 }}>Escolha uma conversa à esquerda para atender o lead pelo número da {demo.nomeCurto}.</div>
      </div>
    </div>
  );
}

export default function AtendimentoPage() {
  /* tweaks defaults (from TWEAK_DEFAULTS in original) */
  const [bubbleFill] = React.useState('Roxo sólido');
  const [density] = React.useState('Confortável');
  const [showBadges] = React.useState(true);
  const [wallpaper] = React.useState('Sutil');

  const [convs, setConvs] = React.useState<any[]>(() => cloneDeep(SEED));
  const [activeId, setActiveId] = React.useState<string>('mariana');
  const [filter, setFilter] = React.useState('Todos');
  const [query, setQuery] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [toast, setToast] = React.useState<any>(null);
  const [isMobile, setIsMobile] = React.useState(false);
  const [mobileView, setMobileView] = React.useState<'list' | 'chat' | 'ficha'>('list');
  const [meetings, setMeetings] = React.useState<any>(() => cloneDeep(MEETINGS));
  const [modal, setModal] = React.useState<any>(null);
  const [tplModal, setTplModal] = React.useState<any>(null);
  const toastTimer = React.useRef<any>(null);

  const mpatch = (id: string, fn: (list: any[]) => any[]) =>
    setMeetings((ms: any) => ({ ...ms, [id]: fn(ms[id] ? cloneDeep(ms[id]) : []) }));

  React.useEffect(() => {
    const onResize = () => {
      const w = window.innerWidth;
      setIsMobile(w < 1024);
    };
    onResize();
    window.addEventListener('resize', onResize);
    const t0 = setTimeout(() => setLoading(false), 850);
    return () => { window.removeEventListener('resize', onResize); clearTimeout(t0); };
  }, []);

  const fire = (msg: string, icon?: string) => {
    setToast({ msg, icon, id: Date.now() });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  };

  const activeConv = convs.find((c: any) => c.id === activeId) || null;

  const filtered = convs.filter((c: any) => {
    const q = query.trim().toLowerCase();
    if (q && !c.name.toLowerCase().includes(q) && !c.property.title.toLowerCase().includes(q)) return false;
    if (filter === 'Novos') return c.novo;
    if (filter === 'Aguardando') return c.unread > 0;
    if (filter === 'Agendados') return c.stage === 'Visita';
    if (filter === 'Negociação') return c.stage === 'Negociação';
    return true;
  });

  const patch = (id: string, fn: (c: any) => any) =>
    setConvs((cs: any[]) => cs.map((c: any) => c.id === id ? fn(cloneDeep(c)) : c));

  const selectConv = (id: string) => {
    setActiveId(id);
    patch(id, (c: any) => { c.unread = 0; return c; });
    if (isMobile) setMobileView('chat');
  };

  const onSend = (id: string, text: string) => {
    patch(id, (c: any) => {
      c.messages.push({ from: 'me', text, time: nowTime(), status: 'sent' });
      c.lastTime = nowTime(); c.unread = 0; c.sla = null;
      if (c.windowHrs == null) c.windowHrs = 24;
      return c;
    });
    setTimeout(() => patch(id, (c: any) => {
      const last = c.messages[c.messages.length - 1];
      if (last && last.from === 'me') last.status = 'read';
      return c;
    }), 1100);
  };

  const onAttachImovel = (id: string) => {
    patch(id, (c: any) => { c.messages.push({ from: 'me', text: '', time: 'card', status: 'read' }); c.lastTime = nowTime(); return c; });
    fire('Imóvel enviado na conversa', 'building-2');
  };

  const onSendAudio = (id: string, dur: string) => {
    patch(id, (c: any) => {
      c.messages.push({ from: 'me', type: 'audio', dur, time: nowTime(), status: 'sent' });
      c.lastTime = nowTime(); c.unread = 0; c.sla = null;
      if (c.windowHrs == null) c.windowHrs = 24;
      return c;
    });
    fire('Áudio enviado (' + dur + ')', 'mic');
    setTimeout(() => patch(id, (c: any) => {
      const last = c.messages[c.messages.length - 1];
      if (last && last.from === 'me') last.status = 'read';
      return c;
    }), 1100);
  };

  const onStageChange = (id: string, stage: string) => {
    patch(id, (c: any) => { c.stage = stage; return c; });
    fire('Etapa movida para ' + stage, 'check');
  };

  const onQualify = (id: string, q: string) => {
    patch(id, (c: any) => { c.qualify = q; return c; });
    fire('Lead marcado como ' + q + ' · score não afetado', 'shield-check');
  };

  const onAction = (id: string, key: string) => {
    if (key === 'visita') {
      patch(id, (c: any) => {
        c.stage = 'Visita';
        c.timeline.push({ t: 'Visita agendada: amanhã 15h', d: 'Agora', icon: 'calendar-check', accent: true });
        return c;
      });
      fire('Visita agendada · etapa movida para Visita', 'calendar-check');
    } else if (key === 'reuniao') {
      setModal({ type: 'create', convId: id });
    } else if (key === 'proposta') {
      patch(id, (c: any) => {
        c.stage = 'Proposta';
        c.timeline.push({ t: 'Proposta enviada', d: 'Agora', icon: 'file-text', accent: true });
        return c;
      });
      fire('Proposta gerada · etapa movida para Proposta', 'file-text');
    } else if (key === 'desfecho') {
      fire('Registrar desfecho da negociação', 'flag');
    } else if (key === 'transferir') {
      fire('Lead transferido para a fila de plantão', 'user-round-cog');
    }
  };

  /* ----- MEETINGS ----- */
  const openMeeting = (convId: string, meetingId: string) => setModal({ type: 'detail', convId, meetingId });

  const createMeeting = (convId: string, d: any) => {
    const c = convs.find((x: any) => x.id === convId);
    const mtg = {
      id: 'mtg-' + Date.now(), title: d.title || 'Reunião online',
      status: d.mode === 'agora' ? 'andamento' : 'agendada',
      date: d.mode === 'agora' ? 'Hoje' : (d.date ? d.date.split('-').reverse().join('/') : 'A definir'),
      time: d.mode === 'agora' ? nowTime() : (d.time || ''), dur: d.dur, meetLink: d.link,
      participants: [
        { name: 'Ricardo Almeida', role: 'Corretor', initials: 'RA', me: true },
        { name: c ? c.name : 'Cliente', role: 'Cliente', initials: c ? c.initials : 'CL', me: false },
      ],
      summary: '', pontos: [], proximos: [], transcript: [],
    };
    mpatch(convId, (list: any[]) => [...list, mtg]);
    patch(convId, (cc: any) => {
      cc.messages.push({ from: 'me', text: 'Segue o link da nossa reunião no Google Meet: https://' + d.link, time: nowTime(), status: 'sent' });
      cc.lastTime = nowTime();
      cc.timeline.push({ t: d.mode === 'agora' ? 'Reunião online iniciada' : 'Reunião online agendada', d: 'Agora', icon: 'video', accent: true });
      return cc;
    });
  };

  const realizarMeeting = (convId: string, meetingId: string) => {
    mpatch(convId, (list: any[]) => list.map((mt: any) => mt.id === meetingId ? { ...mt, status: 'processando' } : mt));
    setTimeout(() => {
      mpatch(convId, (list: any[]) => list.map((mt: any) => {
        if (mt.id !== meetingId) return mt;
        const filled = mt.summary ? mt : {
          ...mt,
          summary: 'Conversa produtiva. O cliente alinhou expectativas sobre o imóvel, valores e condições, e ficou de retornar após avaliar os próximos passos apresentados.',
          pontos: ['Faixa de preço dentro do orçamento', 'Pediu detalhes de documentação e financiamento', 'Demonstrou intenção de avançar'],
          proximos: [
            { t: 'Enviar simulação de financiamento', action: 'Criar tarefa', icon: 'file-text', kind: 'tarefa' },
            { t: 'Agendar visita presencial', action: 'Agendar visita', icon: 'calendar-plus', kind: 'visita' },
          ],
          transcript: [
            { time: nowTime(), who: 'Ricardo', me: true, text: 'Obrigado pelo tempo! Como combinamos, te envio os próximos passos por aqui.' },
            { time: nowTime(), who: ((mt.participants[1] || {}).name || 'Cliente').split(' ')[0], me: false, text: 'Perfeito, fico no aguardo!' },
          ],
        };
        return { ...filled, status: 'realizada', recordingUrl: '#' };
      }));
      patch(convId, (cc: any) => { cc.timeline.push({ t: 'Reunião realizada · resumo gerado', d: 'Agora', icon: 'circle-check', accent: true }); return cc; });
      fire('Resumo da reunião gerado', 'sparkles');
    }, 2600);
  };

  const nextStep = (convId: string, step: any) => {
    if (step.kind === 'visita') {
      patch(convId, (cc: any) => { cc.stage = 'Visita'; cc.timeline.push({ t: 'Visita agendada (pós-reunião)', d: 'Agora', icon: 'calendar-check', accent: true }); return cc; });
      fire('Visita agendada · etapa movida para Visita', 'calendar-check');
    } else {
      fire('Tarefa criada: ' + step.t, 'square-check');
    }
  };

  const modalConv = modal ? convs.find((c: any) => c.id === modal.convId) : null;
  const modalMeeting = modal && modal.meetingId ? (meetings[modal.convId] || []).find((m: any) => m.id === modal.meetingId) : null;

  /* ----- TEMPLATES (janela fechada) ----- */
  const openTemplates = (convId: string) => setTplModal({ convId });
  const sendTemplate = (convId: string, text: string, name: string, buttons: string[]) => {
    patch(convId, (c: any) => {
      c.messages.push({ from: 'me', kind: 'template', text, templateName: name, buttons: buttons || [], time: nowTime(), status: 'sent' });
      c.lastTime = nowTime(); c.awaitingReopen = true;
      c.timeline.push({ t: 'Modelo enviado · ' + name, d: 'Agora', icon: 'layout-template', accent: true });
      return c;
    });
    fire('Modelo enviado · aguardando resposta', 'layout-template');
    setTimeout(() => patch(convId, (c: any) => { const last = c.messages[c.messages.length - 1]; if (last && last.from === 'me') last.status = 'read'; return c; }), 1100);
    setTimeout(() => {
      patch(convId, (c: any) => {
        c.messages.push({ from: 'them', text: 'Oi! Pode continuar sim, por favor.', time: nowTime(), status: null });
        c.windowHrs = 24; c.awaitingReopen = false; c.lastTime = nowTime(); c.unread = 0;
        c.timeline.push({ t: 'Cliente respondeu · janela reaberta', d: 'Agora', icon: 'unlock', accent: true });
        return c;
      });
      fire('Cliente respondeu · janela reaberta', 'unlock');
    }, 5200);
  };
  const tplConv = tplModal ? convs.find((c: any) => c.id === tplModal.convId) : null;

  const meetingModals = (
    <React.Fragment>
      {modal && modal.type === 'create' && modalConv && (
        <CreateMeetingModal conv={modalConv} isMobile={isMobile} onClose={() => setModal(null)} onCreate={createMeeting} onToast={fire} />
      )}
      {modal && modal.type === 'detail' && modalConv && modalMeeting && (
        <MeetingDetail conv={modalConv} meeting={modalMeeting} isMobile={isMobile} onClose={() => setModal(null)} onRealizar={realizarMeeting} onNextStep={nextStep} onToast={fire} />
      )}
      {tplModal && tplConv && (
        <TemplateModal conv={tplConv} isMobile={isMobile} onClose={() => setTplModal(null)} onSend={sendTemplate} onToast={fire} />
      )}
    </React.Fragment>
  );

  const inboxEl = (
    <Inbox convs={filtered} activeId={activeId} onSelect={selectConv}
      filter={filter} setFilter={setFilter} query={query} setQuery={setQuery}
      density={density} showBadges={showBadges} />
  );
  const convEl = activeConv ? (
    <Conversation conv={activeConv} meetings={meetings[activeId] || []} onOpenMeeting={openMeeting} onChooseTemplate={openTemplates}
      onSend={onSend} onSendAudio={onSendAudio} onAttachImovel={onAttachImovel}
      bubbleFill={bubbleFill} wallpaper={wallpaper} isMobile={isMobile}
      onBack={() => setMobileView('list')} onOpenFicha={() => setMobileView('ficha')} />
  ) : <EmptyState />;
  const fichaEl = activeConv ? (
    <Ficha conv={activeConv} onStageChange={onStageChange} onAction={onAction} onQualify={onQualify}
      isMobile={isMobile} onBack={() => setMobileView('chat')} />
  ) : null;

  /* Panel content */
  const panelContent = loading ? <Skeleton /> : (
    isMobile ? (
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        {mobileView === 'list' ? inboxEl
          : mobileView === 'ficha' && fichaEl ? fichaEl
          : convEl}
      </div>
    ) : (
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        <div style={{ width: 336, minWidth: 336, borderRight: `1px solid ${pal.g300}` }}>{inboxEl}</div>
        <div style={{ flex: 1, minWidth: 0 }}>{convEl}</div>
        {fichaEl && <div style={{ width: 340, minWidth: 340 }}>{fichaEl}</div>}
      </div>
    )
  );

  return (
    <CorretorChrome
      title="Central de Conversa"
      subtitle={`Atenda, qualifique e avance leads pelo canal da ${demo.nomeCurto}.`}
      searchPlaceholder="Buscar cliente ou imóvel"
      mobileTab="Atendimento"
    >
      <style>{`
        @keyframes toastUp { from { opacity: 0; transform: translateX(-50%) translateY(12px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
        @keyframes rec-pulse { 0%,100% { opacity: 1; } 50% { opacity: .3; } }
        .rec-dot { animation: rec-pulse 1.2s ease-in-out infinite; }
        .sk { background: linear-gradient(90deg, ${pal.g100} 25%, ${pal.g300} 50%, ${pal.g100} 75%); background-size: 200% 100%; animation: sk-shimmer 1.4s infinite; }
        @keyframes sk-shimmer { from { background-position: 200% 0; } to { background-position: -200% 0; } }
        .hide-scroll { scrollbar-width: none; }
        .hide-scroll::-webkit-scrollbar { display: none; }
      `}</style>
      <div style={{ display: 'flex', flex: 1, flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        {panelContent}
      </div>
      <Toast toast={toast} />
      {meetingModals}
    </CorretorChrome>
  );
}
