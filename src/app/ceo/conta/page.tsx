"use client";
import * as React from "react";
import CeoChrome, { ceoPalette, CIc, ceoPersona } from "@/components/ceo/CeoChrome";
const { useState } = React;

const mc: any = {
  ...ceoPalette,
  info: '#3E82E0', infoBg: '#E5EEFB',
  successBg: '#E6F4EC', warnBg: '#FBF1DC', errBg: '#FAE5E5',
};
const mcCard = { background: '#fff', border: `1px solid ${mc.g300}`, borderRadius: 16 };

function McBadge({ text, fg, bg, ic }: any) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: fg, background: bg, borderRadius: 999, padding: '3px 10px', whiteSpace: 'nowrap' }}>
      {ic && <CIc n={ic} s={12} c={fg} />}{text}
    </span>
  );
}
function McHead({ title, sub, right }: any) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
      <div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: mc.ink }}>{title}</div>
        {sub && <div style={{ fontSize: 13, color: mc.g500, marginTop: 2 }}>{sub}</div>}
      </div>
      {right}
    </div>
  );
}
const btnP: React.CSSProperties = { border: 'none', cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12.5, color: '#fff', background: mc.primary, borderRadius: 9, padding: '8px 14px' };
const btnO: React.CSSProperties = { border: `1px solid ${mc.g300}`, cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12.5, color: mc.g700, background: '#fff', borderRadius: 9, padding: '8px 14px' };

/* ---------------- DATA ---------------- */
const SESSOES = [
  { d: 'Chrome · macOS', onde: 'Recife/PE', quando: 'agora', atual: true },
  { d: 'Safari · iPhone 15', onde: 'Recife/PE', quando: 'há 2h', atual: false },
  { d: 'Chrome · Windows', onde: 'São Paulo/SP', quando: 'ontem 22:14', atual: false, estranha: true },
];

const EVENTOS = [
  { d: 'Login confirmado com MFA', det: 'Chrome · macOS · Recife', t: 'hoje 08:02', ic: 'shield-check', ok: true },
  { d: 'Login de novo dispositivo — alerta enviado por WhatsApp', det: 'Chrome · Windows · São Paulo', t: 'ontem 22:14', ic: 'alert-triangle', warn: true },
  { d: 'Senha alterada', det: 'pelo próprio usuário', t: '28/05 16:40', ic: 'key-round' },
];

const NOTIF = [
  { g: 'Operação', itens: ['Fila com SLA estourando', 'Lead sem resposta (15 min)'] },
  { g: 'Financeiro', itens: ['Divergência de conciliação', 'Antecipação aguardando aprovação'] },
  { g: 'Resumo', itens: ['Resumo diário da rede (8h)', 'Relatório semanal (seg)'] },
];

/* ---------------- PERFIL ---------------- */
function McPerfil() {
  return (
    <div style={{ ...mcCard, padding: 22 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: `linear-gradient(135deg, ${mc.light}, ${mc.deep})`, display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 800, fontFamily: 'var(--font-display)', fontSize: 22 }}>{ceoPersona.iniciais}</div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 19, color: mc.ink }}>{ceoPersona.nome}</div>
          <div style={{ fontSize: 13, color: mc.g500, marginTop: 2 }}>{ceoPersona.email} · +55 81 9••••-••01</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <McBadge text="Diretora · CEO" fg={mc.primary} bg={mc.lilac2} ic="shield" />
            <McBadge text="acesso: Rede inteira" fg={mc.g700} bg={mc.g100} ic="network" />
          </div>
        </div>
        <button style={btnO}>Editar dados</button>
      </div>
    </div>
  );
}

/* ---------------- SEGURANÇA ---------------- */
function McSeguranca() {
  return (
    <div style={{ ...mcCard, padding: 22 }}>
      <McHead title="Segurança" sub="MFA é obrigatório para papéis administrativos — não dá para desligar, só reconfigurar" />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: mc.successBg, borderRadius: 12, marginBottom: 12 }}>
        <span style={{ width: 38, height: 38, borderRadius: 10, background: '#fff', display: 'grid', placeItems: 'center' }}><CIc n="smartphone" s={18} c={mc.success} /></span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: mc.ink }}>Verificação em 2 passos ativa</div>
          <div style={{ fontSize: 12, color: mc.g700 }}>App autenticador configurado em 12/03 · 8 códigos de recuperação restantes</div>
        </div>
        <McBadge text="Ativo" fg={mc.success} bg="#fff" ic="check" />
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        <button style={btnO}>Reconfigurar autenticador</button>
        <button style={btnO}>Ver códigos de recuperação</button>
        <button style={btnO}>Alterar senha</button>
      </div>
      <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: mc.g500, marginBottom: 10 }}>Atividade recente da conta</div>
      {EVENTOS.map((e, i) => (
        <div key={i} style={{ display: 'flex', gap: 11, marginBottom: i < EVENTOS.length - 1 ? 12 : 0 }}>
          <span style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0, background: e.warn ? mc.warnBg : e.ok ? mc.successBg : mc.g100, display: 'grid', placeItems: 'center' }}>
            <CIc n={e.ic} s={14} c={e.warn ? mc.warning : e.ok ? mc.success : mc.g700} />
          </span>
          <div>
            <div style={{ fontSize: 12.5, color: mc.ink, lineHeight: 1.4 }}>{e.d}</div>
            <div style={{ fontSize: 11, color: mc.g500, marginTop: 2 }}>{e.det} · {e.t}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------------- SESSÕES ---------------- */
function McSessoes() {
  return (
    <div style={{ ...mcCard, padding: 22 }}>
      <McHead title="Sessões ativas" sub="Onde sua conta está conectada agora" right={<button style={{ ...btnO, color: mc.error, borderColor: mc.error }}>Encerrar todas as outras</button>} />
      {SESSOES.map((s, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 4px', borderBottom: i < SESSOES.length - 1 ? `1px solid ${mc.g100}` : 'none' }}>
          <span style={{ width: 34, height: 34, borderRadius: 10, background: s.estranha ? mc.warnBg : mc.lilac2, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <CIc n={s.d.includes('iPhone') ? 'smartphone' : 'monitor'} s={16} c={s.estranha ? mc.warning : mc.primary} />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: mc.ink }}>{s.d} {s.estranha && <span style={{ fontSize: 11.5, color: mc.warning, fontWeight: 700 }}>· local incomum</span>}</div>
            <div style={{ fontSize: 12, color: mc.g500 }}>{s.onde} · {s.quando}</div>
          </div>
          {s.atual ? <McBadge text="esta sessão" fg={mc.success} bg={mc.successBg} /> : <button style={{ ...btnO, padding: '6px 12px', fontSize: 12 }}>Encerrar</button>}
        </div>
      ))}
      <div style={{ marginTop: 12, padding: '10px 14px', background: mc.lilac1, border: `1px solid ${mc.lilac2}`, borderRadius: 10, fontSize: 12.5, color: mc.g700, display: 'flex', alignItems: 'center', gap: 8 }}>
        <CIc n="info" s={14} c={mc.primary} />
        Encerrar uma sessão derruba o acesso na hora — inclusive em quem estiver com a tela aberta.
      </div>
    </div>
  );
}

/* ---------------- NOTIFICAÇÕES ---------------- */
function McNotificacoes() {
  const canais = ['No app', 'WhatsApp', 'E-mail'];
  const [prefs, setPrefs] = useState<Record<string, boolean>>({
    'Fila com SLA estourando|No app': true, 'Fila com SLA estourando|WhatsApp': true,
    'Lead sem resposta (15 min)|No app': true,
    'Divergência de conciliação|No app': true, 'Divergência de conciliação|E-mail': true,
    'Antecipação aguardando aprovação|No app': true, 'Antecipação aguardando aprovação|WhatsApp': true,
    'Resumo diário da rede (8h)|WhatsApp': true,
    'Relatório semanal (seg)|E-mail': true,
  });
  const toggle = (k: string) => setPrefs((p) => ({ ...p, [k]: !p[k] }));
  return (
    <div style={{ ...mcCard, padding: 22 }}>
      <McHead title="Notificações" sub="O que chega para você, e por onde" right={<McBadge text="horário silencioso: 22h–7h" fg={mc.g700} bg={mc.g100} ic="moon" />} />
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 480 }}>
          <thead><tr>
            <th style={{ textAlign: 'left', fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: mc.g500, padding: '8px 12px', borderBottom: `1px solid ${mc.g100}` }}>Evento</th>
            {canais.map((c) => <th key={c} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: mc.g500, padding: '8px 12px', borderBottom: `1px solid ${mc.g100}`, whiteSpace: 'nowrap' }}>{c}</th>)}
          </tr></thead>
          <tbody>
            {NOTIF.map((g) => (
              <React.Fragment key={g.g}>
                <tr><td colSpan={4} style={{ padding: '12px 12px 6px', fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: mc.primary }}>{g.g}</td></tr>
                {g.itens.map((it) => (
                  <tr key={it}>
                    <td style={{ padding: '9px 12px', fontSize: 13, color: mc.ink, borderBottom: `1px solid ${mc.g100}` }}>{it}</td>
                    {canais.map((c) => {
                      const k = `${it}|${c}`;
                      const on = !!prefs[k];
                      return (
                        <td key={c} style={{ textAlign: 'center', borderBottom: `1px solid ${mc.g100}` }}>
                          <button onClick={() => toggle(k)} style={{ width: 40, height: 22, borderRadius: 999, border: 'none', cursor: 'pointer', background: on ? mc.primary : mc.g300, position: 'relative', transition: 'background .15s ease' }}>
                            <span style={{ position: 'absolute', top: 3, left: on ? 21 : 3, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left .15s ease', boxShadow: 'var(--shadow-sm)' }} />
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14 }}>
        <button style={btnP}>Salvar preferências</button>
      </div>
    </div>
  );
}

/* ---------------- PAGE ---------------- */
export default function CeoContaPage() {
  return (
    <CeoChrome>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 980 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 30, letterSpacing: '-0.02em', margin: 0, color: mc.ink }}>Minha conta</h1>
          <div style={{ fontSize: 13.5, color: mc.g500, marginTop: 4 }}>Perfil, segurança e como você quer ser avisado</div>
        </div>

        <McPerfil />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 18 }}>
          <McSeguranca />
          <McSessoes />
        </div>
        <McNotificacoes />
      </div>
    </CeoChrome>
  );
}
