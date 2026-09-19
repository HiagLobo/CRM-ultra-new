"use client";
import * as React from "react";
import { pal, Ic } from "@/components/corretor/CorretorChrome";
import { StatusPill, MeetMark, ModalShell, copyLink } from "./Meeting";

function MeetingEventCardH({ icon, ic_c, children, right }: {
  icon: string; ic_c?: string; children: React.ReactNode; right?: React.ReactNode;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
      <Ic n={icon} s={16} c={ic_c || pal.primary} />
      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: pal.ink, flex: 1 }}>{children}</span>
      {right}
    </div>
  );
}

export function MeetingEventCard({ meeting, onOpen, onToast }: {
  meeting: any; onOpen: (id: string) => void; onToast?: (msg: string, icon?: string) => void;
}) {
  const done = meeting.status === 'realizada';
  return (
    <div style={{ alignSelf: 'stretch', flexShrink: 0, background: '#fff', border: `1px solid ${pal.g300}`, borderRadius: 14, padding: 13, boxShadow: 'var(--shadow-sm)', margin: '2px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
        <span style={{ width: 38, height: 38, flexShrink: 0, borderRadius: 10, background: '#E8F0FE', display: 'grid', placeItems: 'center' }}>
          <Ic n="video" s={19} c="#1A73E8" />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ fontWeight: 700, fontSize: 13.5, color: pal.ink }}>{done ? 'Reunião realizada' : 'Reunião online agendada'}</span>
            <StatusPill status={meeting.status} />
          </div>
          <div style={{ fontSize: 12, color: pal.g500, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {meeting.title} · {meeting.date} {meeting.time}{meeting.dur ? ' · ' + meeting.dur : ''}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 11 }}>
        {done ? (
          <button onClick={() => onOpen(meeting.id)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, border: 'none', background: pal.primary, color: '#fff', borderRadius: 10, padding: '9px 12px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13, boxShadow: 'var(--shadow-purple)' }}>
            <Ic n="sparkles" s={15} c="#fff" /> Ver resumo
          </button>
        ) : (
          <React.Fragment>
            <a href={'https://' + meeting.meetLink} target="_blank" rel="noreferrer" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, border: 'none', background: pal.primary, color: '#fff', borderRadius: 10, padding: '9px 12px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13, textDecoration: 'none', boxShadow: 'var(--shadow-purple)' }}>
              <Ic n="external-link" s={15} c="#fff" /> Entrar no Meet
            </a>
            <button onClick={() => onOpen(meeting.id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, border: `1px solid ${pal.g300}`, background: '#fff', color: pal.g700, borderRadius: 10, padding: '9px 13px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13 }}>
              Detalhes
            </button>
          </React.Fragment>
        )}
      </div>
    </div>
  );
}

export function MeetingDetail({ conv, meeting, isMobile, onClose, onRealizar, onNextStep, onToast }: {
  conv: any; meeting: any; isMobile: boolean; onClose: () => void;
  onRealizar: (convId: string, meetId: string) => void;
  onNextStep: (convId: string, step: any) => void;
  onToast: (msg: string, icon?: string) => void;
}) {
  const [showTrans, setShowTrans] = React.useState(false);
  const st = meeting.status;

  const participants = meeting.participants || [
    { name: 'Ricardo Almeida', role: 'Corretor', initials: 'RA', me: true },
    { name: conv.name, role: 'Cliente', initials: conv.initials, me: false },
  ];

  return (
    <ModalShell isMobile={isMobile} onClose={onClose} w={600}>
      {/* header */}
      <div style={{ padding: '16px 18px', borderBottom: `1px solid ${pal.g100}`, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <StatusPill status={st} />
              <MeetMark small />
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: pal.ink, lineHeight: 1.25 }}>{meeting.title}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 6, fontSize: 12.5, color: pal.g500, flexWrap: 'wrap' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Ic n="calendar" s={14} c={pal.g500} /> {meeting.date} · {meeting.time}</span>
              {meeting.dur && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Ic n="clock" s={14} c={pal.g500} /> {meeting.dur}</span>}
            </div>
          </div>
          <button onClick={onClose} style={{ width: 36, height: 36, flexShrink: 0, borderRadius: 10, border: 'none', background: pal.g100, display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
            <Ic n="x" s={19} c={pal.g700} />
          </button>
        </div>
        {/* participants */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 12 }}>
          {participants.map((p: any, i: number) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: p.me ? `linear-gradient(135deg, ${pal.light}, ${pal.deep})` : `linear-gradient(135deg, #6366F1, #312E81)`, display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 700, fontSize: 11, fontFamily: 'var(--font-display)' }}>{p.initials}</div>
              <div style={{ lineHeight: 1.2 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: pal.ink }}>{p.name}</div>
                <div style={{ fontSize: 11, color: pal.g500 }}>{p.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 18, background: pal.page }}>
        {st === 'realizada' && (
          <button onClick={() => onToast('Abrindo gravação no Google Meet…', 'play')} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, border: `1px solid ${pal.g300}`, background: '#fff', borderRadius: 12, padding: '12px 14px', cursor: 'pointer', marginBottom: 16, textAlign: 'left' }}>
            <span style={{ width: 40, height: 40, flexShrink: 0, borderRadius: 10, background: pal.lilac2, display: 'grid', placeItems: 'center' }}><Ic n="play" s={18} c={pal.primary} /></span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: pal.ink }}>Assistir gravação</div>
              <div style={{ fontSize: 12, color: pal.g500, marginTop: 1 }}>{meeting.dur} · armazenada com segurança</div>
            </div>
            <Ic n="external-link" s={17} c={pal.g500} />
          </button>
        )}

        {(st === 'agendada' || st === 'andamento') && (
          <div>
            <div style={{ display: 'flex', gap: 10, background: pal.warningBg, border: '1px solid #F0DCA8', borderRadius: 12, padding: '13px 15px', marginBottom: 16 }}>
              <Ic n="sparkles" s={18} c="#C08A1E" style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: '#8A5F0C' }}>O resumo aparece automaticamente após a reunião</div>
                <div style={{ fontSize: 12.5, color: '#9A6B0E', marginTop: 2, lineHeight: 1.45 }}>Quando a chamada terminar, a gravação, o resumo por IA e a transcrição ficam aqui anexados ao lead.</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <a href={'https://' + meeting.meetLink} target="_blank" rel="noreferrer" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, border: 'none', background: pal.primary, color: '#fff', borderRadius: 11, padding: '11px 14px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 14, textDecoration: 'none', boxShadow: 'var(--shadow-purple)' }}>
                <Ic n="external-link" s={16} c="#fff" /> Entrar no Meet
              </a>
              <button onClick={() => copyLink(meeting.meetLink, onToast)} style={{ display: 'flex', alignItems: 'center', gap: 6, border: `1px solid ${pal.g300}`, background: '#fff', borderRadius: 11, padding: '11px 14px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13.5, color: pal.g700 }}>
                <Ic n="copy" s={15} c={pal.g700} /> Copiar link
              </button>
            </div>
            <button onClick={() => onRealizar(conv.id, meeting.id)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, border: `1px dashed ${pal.g300}`, background: '#fff', borderRadius: 11, padding: '10px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13, color: pal.g500 }}>
              <Ic n="circle-check" s={15} c={pal.g500} /> Encerrar reunião e gerar resumo
            </button>
          </div>
        )}

        {st === 'processando' && (
          <div style={{ textAlign: 'center', padding: '20px 10px 24px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 9, background: pal.lilac2, color: pal.primary, borderRadius: 999, padding: '8px 16px', fontSize: 13.5, fontWeight: 700 }}>
              <span className="rec-dot" style={{ width: 9, height: 9, borderRadius: '50%', background: pal.primary }} /> Gerando resumo da reunião…
            </div>
            <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {['70%', '94%', '88%', '60%'].map((w, i) => <div key={i} className="sk" style={{ height: 13, borderRadius: 6, width: w, alignSelf: 'flex-start' }} />)}
              <div className="sk" style={{ height: 64, borderRadius: 12, marginTop: 8 }} />
            </div>
          </div>
        )}

        {st === 'realizada' && (
          <React.Fragment>
            <div style={{ background: '#fff', border: `1px solid ${pal.lilac2}`, borderRadius: 14, padding: 16, marginBottom: 14 }}>
              <MeetingEventCardH icon="sparkles" right={<span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.03em', textTransform: 'uppercase', color: pal.primary, background: pal.lilac2, borderRadius: 999, padding: '2px 8px' }}>Gerado por IA</span>}>Resumo da reunião</MeetingEventCardH>
              <p style={{ margin: 0, fontSize: 14, color: pal.g700, lineHeight: 1.6 }}>{meeting.summary}</p>
            </div>

            <div style={{ background: '#fff', border: `1px solid ${pal.g300}`, borderRadius: 14, padding: 16, marginBottom: 14 }}>
              <MeetingEventCardH icon="list-checks">Pontos principais</MeetingEventCardH>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                {(meeting.pontos || []).map((p: string, i: number) => (
                  <div key={i} style={{ display: 'flex', gap: 9 }}>
                    <Ic n="check" s={16} c={pal.success} style={{ flexShrink: 0, marginTop: 2 }} />
                    <span style={{ fontSize: 13.5, color: pal.g700, lineHeight: 1.45 }}>{p}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: '#fff', border: `1px solid ${pal.g300}`, borderRadius: 14, padding: 16, marginBottom: 14 }}>
              <MeetingEventCardH icon="flag">Próximos passos</MeetingEventCardH>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                {(meeting.proximos || []).map((p: any, i: number) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 11, background: pal.lilac1, border: `1px solid ${pal.lilac2}`, borderRadius: 11, padding: '10px 12px' }}>
                    <span style={{ width: 24, height: 24, flexShrink: 0, borderRadius: 7, background: '#fff', display: 'grid', placeItems: 'center', border: `1px solid ${pal.lilac2}` }}><Ic n={p.icon} s={14} c={pal.primary} /></span>
                    <span style={{ flex: 1, fontSize: 13.5, color: pal.ink, fontWeight: 500, lineHeight: 1.35 }}>{p.t}</span>
                    <button onClick={() => onNextStep(conv.id, p)} style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5, border: 'none', background: pal.primary, color: '#fff', borderRadius: 8, padding: '6px 11px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 12 }}>
                      <Ic n={p.kind === 'visita' ? 'calendar-plus' : 'plus'} s={13} c="#fff" /> {p.action}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* transcript collapsible */}
            <div style={{ background: '#fff', border: `1px solid ${pal.g300}`, borderRadius: 14, overflow: 'hidden', marginBottom: 14 }}>
              <button onClick={() => setShowTrans((s: boolean) => !s)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, border: 'none', background: 'transparent', cursor: 'pointer', padding: 16 }}>
                <Ic n="file-text" s={16} c={pal.primary} />
                <span style={{ flex: 1, textAlign: 'left', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: pal.ink }}>Transcrição</span>
                <span style={{ fontSize: 12, color: pal.g500 }}>{(meeting.transcript || []).length} trechos</span>
                <span style={{ display: 'inline-flex', transition: 'transform .2s ease', transform: showTrans ? 'rotate(180deg)' : 'none' }}><Ic n="chevron-down" s={17} c={pal.g500} /></span>
              </button>
              {showTrans && (
                <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {(meeting.transcript || []).map((t: any, i: number) => (
                    <div key={i} style={{ display: 'flex', gap: 10 }}>
                      <span style={{ fontSize: 11.5, fontWeight: 600, color: pal.g500, width: 38, flexShrink: 0, paddingTop: 1 }}>{t.time}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ fontSize: 12.5, fontWeight: 700, color: t.me ? pal.primary : pal.ink }}>{t.who}</span>
                        <p style={{ margin: '2px 0 0', fontSize: 13, color: pal.g700, lineHeight: 1.5 }}>{t.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </React.Fragment>
        )}

        {/* attached note */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, justifyContent: 'center', fontSize: 12, color: pal.g500, padding: '4px 0' }}>
          <Ic n="paperclip" s={13} c={pal.g500} /> Registro anexado ao lead <strong style={{ color: pal.g700, fontWeight: 600 }}>{conv.name}</strong>
        </div>
      </div>
    </ModalShell>
  );
}
