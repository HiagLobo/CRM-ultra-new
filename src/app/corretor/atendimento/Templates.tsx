"use client";
import * as React from "react";
import { pal, Ic } from "@/components/corretor/CorretorChrome";
import { demo } from "@/config/demo";
import { ModalShell } from "./Meeting";

function buildTemplates(conv: any): any[] {
  const nome = (conv.name || '').split(' ')[0];
  const parts = (conv.property.title || '').split('·');
  const imovel = (parts[0] || 'imóvel').trim();
  const bairro = (parts[1] || '').trim();
  const emBairro = bairro ? `, em ${bairro}` : '';
  return [
    { id: 'visita', name: 'Lembrete de visita', icon: 'calendar-check', cat: 'Utilidade',
      buttons: ['Confirmar visita', 'Reagendar'],
      text: `Olá, ${nome}! Confirmando sua visita ao ${imovel}${emBairro}, no dia 14/06 às 10h. Posso confirmar?` },
    { id: 'retomar', name: 'Retomar conversa', icon: 'message-circle', cat: 'Atendimento',
      buttons: [],
      text: `Olá, ${nome}! Aqui é o Ricardo, da ${demo.nome}. Podemos continuar sobre o ${imovel}${emBairro}?` },
    { id: 'update', name: 'Atualização do imóvel', icon: 'bell', cat: 'Atualização',
      buttons: ['Ver novidade'],
      text: `Olá, ${nome}! Tenho uma novidade sobre o ${imovel} que você acompanhava. Quer saber mais?` },
    { id: 'posvisita', name: 'Pós-visita', icon: 'star', cat: 'Atendimento',
      buttons: ['Avaliar imóvel'],
      text: `Olá, ${nome}! Obrigado pela visita ao ${imovel} hoje. O que você achou?` },
    { id: 'reuniao', name: 'Convite para reunião online', icon: 'video', cat: 'Reunião',
      buttons: ['Agendar reunião'],
      text: `Olá, ${nome}! Que tal uma reunião online rápida sobre o ${imovel}${emBairro}? Te envio o link por aqui.` },
  ];
}

export function TemplateModal({ conv, isMobile, onClose, onSend, onToast }: {
  conv: any; isMobile: boolean; onClose: () => void;
  onSend: (convId: string, text: string, name: string, buttons: string[]) => void;
  onToast: (msg: string, icon?: string) => void;
}) {
  const templates = buildTemplates(conv);
  const [selected, setSelected] = React.useState<any>(null);
  const [text, setText] = React.useState('');
  const [sending, setSending] = React.useState(false);

  const pick = (t: any) => { setSelected(t); setText(t.text); };
  const back = () => { setSelected(null); setText(''); };
  const submit = () => {
    if (sending) return;
    setSending(true);
    setTimeout(() => { onSend(conv.id, text.trim() || selected.text, selected.name, selected.buttons); onClose(); }, 650);
  };

  return (
    <ModalShell isMobile={isMobile} onClose={onClose} w={540}>
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 18px', borderBottom: `1px solid ${pal.g100}`, flexShrink: 0 }}>
        {selected && (
          <button onClick={back} style={{ width: 34, height: 34, flexShrink: 0, borderRadius: 9, border: 'none', background: pal.g100, display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
            <Ic n="arrow-left" s={18} c={pal.g700} />
          </button>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: pal.ink }}>{selected ? 'Revisar modelo' : 'Escolher modelo'}</div>
          <div style={{ fontSize: 12.5, color: pal.g500, marginTop: 2 }}>{selected ? selected.name : 'Modelos aprovados para retomar a conversa'}</div>
        </div>
        <button onClick={onClose} style={{ width: 36, height: 36, flexShrink: 0, borderRadius: 10, border: 'none', background: pal.g100, display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
          <Ic n="x" s={19} c={pal.g700} />
        </button>
      </div>

      {!selected ? (
        /* LIST */
        <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
          {templates.map((t: any) => (
            <button key={t.id} onClick={() => pick(t)} style={{ width: '100%', textAlign: 'left', display: 'flex', gap: 12, alignItems: 'flex-start', border: `1px solid ${pal.g100}`, background: '#fff', borderRadius: 12, padding: 13, cursor: 'pointer', marginBottom: 8, fontFamily: 'var(--font-body)' }}
              onMouseEnter={(e: any) => { e.currentTarget.style.background = pal.lilac1; e.currentTarget.style.borderColor = pal.lilac2; }}
              onMouseLeave={(e: any) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = pal.g100; }}>
              <span style={{ width: 38, height: 38, flexShrink: 0, borderRadius: 10, background: pal.lilac2, display: 'grid', placeItems: 'center' }}>
                <Ic n={t.icon} s={19} c={pal.primary} />
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3 }}>
                  <span style={{ fontWeight: 700, fontSize: 13.5, color: pal.ink }}>{t.name}</span>
                  {t.buttons.length > 0 && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10, fontWeight: 700, color: pal.primary, background: pal.lilac2, borderRadius: 999, padding: '2px 7px' }}>
                      <Ic n="square-mouse-pointer" s={11} c={pal.primary} /> com botões
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 12.5, color: pal.g500, lineHeight: 1.45, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' } as React.CSSProperties}>{t.text}</div>
              </div>
              <Ic n="chevron-right" s={17} c={pal.g300} style={{ flexShrink: 0, marginTop: 9 }} />
            </button>
          ))}
        </div>
      ) : (
        /* PREVIEW */
        <div style={{ flex: 1, overflowY: 'auto', padding: 18 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: pal.g500, marginBottom: 7 }}>Mensagem (ajuste as variáveis)</div>
          <textarea value={text} onChange={(e: any) => setText(e.target.value)} rows={5} style={{ width: '100%', border: `1px solid ${pal.g300}`, borderRadius: 12, padding: '12px 14px', fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: 1.5, color: pal.ink, outline: 'none', resize: 'vertical' }} />

          {selected.buttons.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: pal.g500, marginBottom: 7 }}>Botões do modelo</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {selected.buttons.map((b: string, i: number) => (
                  <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, border: `1px solid ${pal.lilac2}`, background: pal.lilac1, color: pal.primary, borderRadius: 9, padding: '8px 12px', fontSize: 12.5, fontWeight: 600 }}>
                    <Ic n="square-mouse-pointer" s={14} c={pal.primary} /> {b}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* live preview bubble */}
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: pal.g500, marginBottom: 8 }}>Prévia</div>
            <div style={{ background: pal.page, borderRadius: 12, padding: 14, display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ maxWidth: '85%', background: pal.primary, color: '#fff', borderRadius: '16px 16px 4px 16px', padding: '10px 13px', fontSize: 13.5, lineHeight: 1.5 }}>
                {text}
                {selected.buttons.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 9, paddingTop: 9, borderTop: '1px solid rgba(255,255,255,.22)' }}>
                    {selected.buttons.map((b: string, i: number) => <span key={i} style={{ textAlign: 'center', background: 'rgba(255,255,255,.16)', borderRadius: 8, padding: '6px', fontSize: 12, fontWeight: 600 }}>{b}</span>)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* footer */}
      {selected && (
        <div style={{ display: 'flex', gap: 10, padding: '14px 18px', borderTop: `1px solid ${pal.g100}`, flexShrink: 0 }}>
          <button onClick={back} style={{ border: `1px solid ${pal.g300}`, background: '#fff', borderRadius: 11, padding: '11px 16px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14, color: pal.g700 }}>Voltar</button>
          <button onClick={submit} disabled={sending} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, border: 'none', background: pal.primary, color: '#fff', borderRadius: 11, padding: '11px 16px', cursor: sending ? 'default' : 'pointer', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 14, boxShadow: 'var(--shadow-purple)', opacity: sending ? 0.8 : 1 }}>
            {sending ? <React.Fragment><span className="rec-dot" style={{ width: 9, height: 9, borderRadius: '50%', background: '#fff' }} /> Enviando…</React.Fragment>
              : <React.Fragment><Ic n="send-horizontal" s={17} c="#fff" /> Enviar modelo</React.Fragment>}
          </button>
        </div>
      )}
    </ModalShell>
  );
}
