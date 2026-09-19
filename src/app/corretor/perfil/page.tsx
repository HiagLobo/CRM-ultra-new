"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import CorretorChrome, { pal, Ic } from "@/components/corretor/CorretorChrome";
import { brand } from "@/config/brand";
import { demo, emailDemo } from "@/config/demo";

/* ============================================================
   PERFIL — Porte fiel de perfil-data.jsx + perfil.jsx +
   perfil-sections.jsx + perfil-app.jsx
   ============================================================ */

/* ---------- DATA (perfil-data.jsx) ---------- */
const PF_AGENT = {
  name: "Ricardo Almeida",
  display: "Ricardo Almeida",
  creci: "CRECI-PE 00000-F",
  email: emailDemo("ricardo"),
  phone: "(81) 90000-0012",
  initials: "RA",
  bio: "Corretor há 12 anos em Recife, especialista em imóveis de alto padrão na orla de Boa Viagem. Atendimento próximo, do primeiro contato à entrega das chaves.",
  especialidades: ["Alto padrão", "Apartamentos"],
  regiao: "Boa Viagem · Recife",
  photoStatus: "aprovada" as "aprovada" | "analise" | "devolvida",
};

const PF_SPECIALTIES = ["Alto padrão", "Apartamentos", "Casas", "Comercial", "Lançamentos", "Terrenos", "Litoral", "Investimento"];

const PF_SESSIONS = [
  { id: "s1", device: "Chrome · Windows", local: "Recife, PE", last: "Agora", current: true, icon: "monitor" },
  { id: "s2", device: `App ${brand.nomeCurto} · iPhone 14`, local: "Recife, PE", last: "Há 2 horas", current: false, icon: "smartphone" },
  { id: "s3", device: "Safari · MacBook", local: "Olinda, PE", last: "Ontem · 18:40", current: false, icon: "laptop" },
];

const PF_NOTIFS = [
  { k: "lead", label: "Novo lead", desc: "Quando o assistente te passa um contato", push: true, email: true, whats: true },
  { k: "msg", label: "Nova mensagem", desc: "Cliente respondeu na conversa", push: true, email: false, whats: true },
  { k: "visita", label: "Visita", desc: "Agendamento, confirmação e lembrete", push: true, email: true, whats: false },
  { k: "comissao", label: "Comissão", desc: "Pagamento liberado ou a caminho", push: true, email: true, whats: false },
  { k: "curadoria", label: "Curadoria", desc: "Imóvel aprovado ou devolvido", push: true, email: false, whats: false },
];

const PF_DOCS = [
  { k: "contrato", name: "Contrato de associação", sub: "Assinado em 12/03/2024 · PDF", icon: "file-signature" },
  { k: "creci", name: "CRECI-PE 00000-F", sub: "Verificado · válido até 2027", icon: "badge-check" },
  { k: "lgpd", name: "Consentimento LGPD", sub: "Aceito em 12/03/2024 · PDF", icon: "shield-check" },
];

const PF_BACKUP_CODES = ["4F9K-2QX7", "B3MN-8PL1", "Z7TR-5WC4", "K2HD-9VB6", "Q8XN-3RM5", "7YJP-1LK9", "M4WC-6TZ2", "D9BV-4QH8"];

/* ---------- SHARED STYLES (perfil.jsx) ---------- */
const labelSt: React.CSSProperties = { fontSize: 11, fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: pal.g500, marginBottom: 6 };
const inputSt: React.CSSProperties = { width: "100%", border: `1px solid ${pal.g300}`, borderRadius: 10, padding: "11px 13px", fontFamily: "var(--font-body)", fontSize: 14, color: pal.ink, outline: "none", background: "#fff" };

/* ---------- SHARED COMPONENTS ---------- */
function SectionCard({ icon, title, sub, right, children }: { icon: string; title: string; sub?: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ background: "#fff", border: `1px solid ${pal.g300}`, borderRadius: 16, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "16px 18px", borderBottom: `1px solid ${pal.g100}` }}>
        <span style={{ width: 34, height: 34, flexShrink: 0, borderRadius: 9, background: pal.lilac2, display: "grid", placeItems: "center" }}><Ic n={icon} s={18} c={pal.primary} /></span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: pal.ink }}>{title}</div>
          {sub && <div style={{ fontSize: 12.5, color: pal.g500, marginTop: 1 }}>{sub}</div>}
        </div>
        {right}
      </div>
      <div style={{ padding: 18 }}>{children}</div>
    </div>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!value)} style={{ width: 42, height: 24, flexShrink: 0, borderRadius: 999, border: "none", background: value ? pal.primary : pal.g300, position: "relative", cursor: "pointer", transition: "background .15s" } as React.CSSProperties}>
      <span style={{ position: "absolute", top: 3, left: value ? 21 : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left .15s", boxShadow: "0 1px 2px rgba(0,0,0,.2)" } as React.CSSProperties} />
    </button>
  );
}

/* ---------- 1. PERFIL PÚBLICO ---------- */
function PhotoStatusBadge({ status }: { status: string }) {
  const map: any = {
    aprovada: ["#1E7A43", "#E6F4EC", "check-circle", "Foto aprovada"],
    analise: ["#B8860B", "#FBF1DC", "clock", "Foto em análise pelo marketing"],
    devolvida: ["#C0392B", "#FAE5E5", "rotate-ccw", "Foto devolvida — ajuste necessário"],
  };
  const [c, bg, icon, label] = map[status] || map.aprovada;
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: bg, color: c, fontSize: 11.5, fontWeight: 700, borderRadius: 999, padding: "4px 11px" }}><Ic n={icon} s={13} c={c} /> {label}</span>;
}

function PublicSection({ onToast }: { onToast: (m: string, i?: string) => void }) {
  const a = PF_AGENT;
  const [display, setDisplay] = React.useState(a.display);
  const [bio, setBio] = React.useState(a.bio);
  const [specs, setSpecs] = React.useState<string[]>(a.especialidades);
  const [regiao, setRegiao] = React.useState(a.regiao);
  const [photoStatus, setPhotoStatus] = React.useState(a.photoStatus);
  const [showSpec, setShowSpec] = React.useState(false);
  const toggleSpec = (s: string) => setSpecs((x) => x.includes(s) ? x.filter((y) => y !== s) : [...x, s]);

  return (
    <SectionCard icon="id-card" title="Perfil público" sub="O que o cliente vê na sua página">
      <div style={{ display: "flex", gap: 18, flexWrap: "wrap", marginBottom: 18, alignItems: "flex-start" }}>
        {/* photo */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 11, flexShrink: 0 }}>
          <div style={{ position: "relative" }}>
            <div style={{ width: 104, height: 104, borderRadius: "50%", background: `linear-gradient(135deg, ${pal.light}, ${pal.deep})`, display: "grid", placeItems: "center", color: "#fff", fontWeight: 700, fontFamily: "var(--font-display)", fontSize: 34 }}>{a.initials}</div>
            {photoStatus === "analise" && <span style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `3px dashed ${pal.warning}` }} />}
          </div>
          <button onClick={() => { setPhotoStatus("analise"); onToast("Foto enviada para aprovação do marketing", "upload"); }} style={{ display: "flex", alignItems: "center", gap: 6, border: `1px solid ${pal.g300}`, background: "#fff", borderRadius: 10, padding: "8px 14px", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13, color: pal.g700 }}><Ic n="camera" s={15} c={pal.primary} /> Alterar foto</button>
        </div>
        {/* photo status note */}
        <div style={{ flex: 1, minWidth: 200 }}>
          <PhotoStatusBadge status={photoStatus} />
          <p style={{ fontSize: 13, color: pal.g700, lineHeight: 1.55, marginTop: 10 }}>
            {photoStatus === "analise"
              ? "Sua nova foto está em análise. Enquanto não for aprovada, a foto atual continua na sua página pública — assim a vitrine nunca fica sem imagem."
              : "Sua foto passa pela curadoria do marketing antes de ir ao ar — mesma régua de qualidade dos anúncios, pra manter o padrão da marca."}
          </p>
        </div>
      </div>

      <div className="pf-grid2">
        <div>
          <div style={labelSt}>Nome de exibição</div>
          <input value={display} onChange={(e) => setDisplay(e.target.value)} style={inputSt} />
        </div>
        <div>
          <div style={labelSt}>CRECI</div>
          <div style={{ ...inputSt, display: "flex", alignItems: "center", gap: 8, background: pal.g100, color: pal.g700 }}>
            <span style={{ flex: 1 }}>{a.creci}</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11.5, fontWeight: 700, color: "#1E7A43" }}><Ic n="badge-check" s={14} c="#2E9E5B" /> Verificado</span>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 14 }}>
        <div style={labelSt}>Bio / apresentação</div>
        <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} style={{ ...inputSt, resize: "vertical", lineHeight: 1.5 } as React.CSSProperties} />
      </div>

      <div style={{ marginTop: 14 }}>
        <div style={labelSt}>Especialidades</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {specs.map((s) => (
            <span key={s} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: pal.lilac2, color: pal.primary, borderRadius: 999, padding: "6px 12px", fontSize: 12.5, fontWeight: 600 }}>
              {s}
              <button onClick={() => toggleSpec(s)} style={{ border: "none", background: "transparent", cursor: "pointer", display: "grid", placeItems: "center", padding: 0 }}><Ic n="x" s={13} c={pal.primary} /></button>
            </span>
          ))}
          <button onClick={() => setShowSpec((v) => !v)} style={{ display: "inline-flex", alignItems: "center", gap: 5, border: `1px dashed ${pal.g300}`, background: "#fff", color: pal.g700, borderRadius: 999, padding: "6px 12px", fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}><Ic n="plus" s={14} c={pal.primary} /> Adicionar</button>
        </div>
        {showSpec && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 10, padding: 12, background: pal.g100, borderRadius: 11 }}>
            {PF_SPECIALTIES.filter((s) => !specs.includes(s)).map((s) => (
              <button key={s} onClick={() => toggleSpec(s)} style={{ border: `1px solid ${pal.g300}`, background: "#fff", color: pal.g700, borderRadius: 999, padding: "6px 12px", fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}>+ {s}</button>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: 14 }}>
        <div style={labelSt}>Região de atuação</div>
        <input value={regiao} onChange={(e) => setRegiao(e.target.value)} style={inputSt} />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 16, fontSize: 12.5, color: pal.g500 }}>
        <Ic n="eye" s={15} c={pal.g500} /> Estas informações aparecem na sua página pública.
        <button onClick={() => onToast("Perfil público salvo", "check")} style={{ marginLeft: "auto", border: "none", background: pal.primary, color: "#fff", borderRadius: 10, padding: "10px 18px", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 13.5, boxShadow: "var(--shadow-purple)" }}>Salvar</button>
      </div>
    </SectionCard>
  );
}

/* ---------- 2. CONTA ---------- */
function AccountSection({ onToast }: { onToast: (m: string, i?: string) => void }) {
  const a = PF_AGENT;
  const row = (icon: string, label: string, value: string, note: string | null, btn: string) => (
    <div style={{ display: "flex", alignItems: "center", gap: 13, padding: "14px 0", borderTop: `1px solid ${pal.g100}` }}>
      <span style={{ width: 36, height: 36, flexShrink: 0, borderRadius: 9, background: pal.g100, display: "grid", placeItems: "center" }}><Ic n={icon} s={18} c={pal.g600} /></span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11.5, color: pal.g500 }}>{label}</div>
        <div style={{ fontSize: 14, fontWeight: 600, color: pal.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{value}</div>
        {note && <div style={{ fontSize: 11.5, color: pal.g500, marginTop: 2, lineHeight: 1.4 }}>{note}</div>}
      </div>
      <button onClick={() => onToast(btn + "…", "pencil")} style={{ flexShrink: 0, border: `1px solid ${pal.g300}`, background: "#fff", color: pal.g700, borderRadius: 9, padding: "8px 14px", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13 }}>{btn}</button>
    </div>
  );
  return (
    <SectionCard icon="user-cog" title="Conta" sub="Seus dados de acesso">
      <div style={{ marginTop: -14 }}>
        {row("mail", "E-mail", a.email, "Usado para login e recuperação de conta", "Alterar")}
        {row("phone", "Telefone pessoal", a.phone, "Usado para login, 2FA e avisos — não é o número que o cliente vê.", "Alterar")}
        {row("key-round", "Senha", "••••••••••", "Última troca há 3 meses", "Alterar")}
      </div>
      <div style={{ display: "flex", gap: 9, marginTop: 14, background: pal.lilac1, border: `1px solid ${pal.lilac2}`, borderRadius: 11, padding: "12px 14px" }}>
        <Ic n="shield-alert" s={17} c={pal.primary} style={{ flexShrink: 0, marginTop: 1 }} />
        <span style={{ fontSize: 12.5, color: pal.g700, lineHeight: 1.5 }}>Seu telefone pessoal é só da <strong>conta</strong>. O cliente sempre fala pelo número da {demo.nomeCurto} — são coisas separadas, de propósito.</span>
      </div>
    </SectionCard>
  );
}

/* ---------- 3. SEGURANÇA ---------- */
function BackupCodesModal({ onClose, onToast }: { onClose: () => void; onToast: (m: string, i?: string) => void }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 8000, background: "rgba(28,22,40,.5)", display: "grid", placeItems: "center", padding: 24 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: 460, maxWidth: "100%", background: "#fff", borderRadius: 18, overflow: "hidden", boxShadow: "var(--shadow-lg)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 18px", borderBottom: `1px solid ${pal.g100}` }}>
          <span style={{ width: 38, height: 38, borderRadius: 10, background: pal.lilac2, display: "grid", placeItems: "center" }}><Ic n="key-round" s={19} c={pal.primary} /></span>
          <div style={{ flex: 1 }}><div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: pal.ink }}>Códigos de backup</div><div style={{ fontSize: 12, color: pal.g500 }}>Use se perder acesso ao autenticador</div></div>
          <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: 10, border: "none", background: pal.g100, display: "grid", placeItems: "center", cursor: "pointer" }}><Ic n="x" s={19} c={pal.g700} /></button>
        </div>
        <div style={{ padding: 18 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
            {PF_BACKUP_CODES.map((c) => (
              <div key={c} style={{ fontFamily: "monospace", fontSize: 14, fontWeight: 600, color: pal.ink, background: pal.g100, borderRadius: 8, padding: "10px 12px", textAlign: "center", letterSpacing: ".06em" }}>{c}</div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 9 }}>
            <button onClick={() => onToast("Códigos copiados", "copy")} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, border: `1px solid ${pal.g300}`, background: "#fff", color: pal.g700, borderRadius: 10, padding: "11px", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13.5 }}><Ic n="copy" s={16} c={pal.primary} /> Copiar</button>
            <button onClick={() => onToast("Códigos baixados (.txt)", "download")} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, border: `1px solid ${pal.g300}`, background: "#fff", color: pal.g700, borderRadius: 10, padding: "11px", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13.5 }}><Ic n="download" s={16} c={pal.primary} /> Baixar</button>
            <button onClick={() => onToast("Novos códigos gerados", "refresh-cw")} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, border: "none", background: pal.primary, color: "#fff", borderRadius: 10, padding: "11px", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 13.5, boxShadow: "var(--shadow-purple)" }}><Ic n="refresh-cw" s={16} c="#fff" /> Regenerar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SecuritySection({ onToast }: { onToast: (m: string, i?: string) => void }) {
  const [codes, setCodes] = React.useState(false);
  const [sessions, setSessions] = React.useState<any[]>(PF_SESSIONS);
  const endSession = (id: string) => { setSessions((s) => s.filter((x) => x.id !== id)); onToast("Sessão encerrada", "log-out"); };
  return (
    <React.Fragment>
      <SectionCard icon="shield-check" title="Segurança" sub="Proteção da sua conta">
        {/* 2FA */}
        <div style={{ display: "flex", alignItems: "center", gap: 13, background: "#E6F4EC", border: "1px solid #BFE3CD", borderRadius: 12, padding: "14px 15px", marginBottom: 16, flexWrap: "wrap" }}>
          <span style={{ width: 40, height: 40, flexShrink: 0, borderRadius: 10, background: "#fff", display: "grid", placeItems: "center" }}><Ic n="shield-check" s={20} c="#2E9E5B" /></span>
          <div style={{ flex: 1, minWidth: 160 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}><span style={{ fontSize: 14, fontWeight: 700, color: pal.ink }}>Verificação em duas etapas</span><span style={{ fontSize: 10.5, fontWeight: 700, color: "#1E7A43", background: "#fff", borderRadius: 999, padding: "2px 8px" }}>ATIVADA</span></div>
            <div style={{ fontSize: 12.5, color: "#1E7A43", marginTop: 2 }}>App autenticador · obrigatória</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => onToast("Trocar método de 2FA", "repeat")} style={{ border: "1px solid #BFE3CD", background: "#fff", color: "#1E7A43", borderRadius: 9, padding: "8px 13px", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 12.5 }}>Trocar método</button>
            <button onClick={() => setCodes(true)} style={{ border: "none", background: pal.primary, color: "#fff", borderRadius: 9, padding: "8px 13px", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 12.5 }}>Códigos de backup</button>
          </div>
        </div>
        {/* sessions */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: pal.g500 }}>Sessões ativas</span>
          <button onClick={() => { setSessions((s) => s.filter((x) => x.current)); onToast("Todas as outras sessões encerradas", "log-out"); }} style={{ border: "none", background: "transparent", color: pal.error, fontWeight: 600, fontSize: 12.5, cursor: "pointer" }}>Encerrar todas as outras</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {sessions.map((s) => (
            <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12, border: `1px solid ${pal.g300}`, borderRadius: 11, padding: "11px 13px" }}>
              <span style={{ width: 36, height: 36, flexShrink: 0, borderRadius: 9, background: pal.g100, display: "grid", placeItems: "center" }}><Ic n={s.icon} s={18} c={pal.g600} /></span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}><span style={{ fontSize: 13.5, fontWeight: 600, color: pal.ink }}>{s.device}</span>{s.current && <span style={{ fontSize: 10, fontWeight: 700, color: "#1E7A43", background: "#E6F4EC", borderRadius: 999, padding: "1px 7px" }}>ESTE DISPOSITIVO</span>}</div>
                <div style={{ fontSize: 11.5, color: pal.g500, marginTop: 1 }}>{s.local} · {s.last}</div>
              </div>
              {!s.current && <button onClick={() => endSession(s.id)} style={{ flexShrink: 0, border: `1px solid ${pal.g300}`, background: "#fff", color: pal.error, borderRadius: 9, padding: "7px 13px", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 12.5 }}>Encerrar</button>}
            </div>
          ))}
        </div>
      </SectionCard>
      {codes && <BackupCodesModal onClose={() => setCodes(false)} onToast={onToast} />}
    </React.Fragment>
  );
}

/* ---------- 4. NOTIFICAÇÕES ---------- */
function NotifSection({ onToast }: { onToast: (m: string, i?: string) => void }) {
  const [notifs, setNotifs] = React.useState<any[]>(PF_NOTIFS);
  const set = (k: string, ch: string, v: boolean) => setNotifs((ns) => ns.map((n) => n.k === k ? { ...n, [ch]: v } : n));
  const chans: [string, string][] = [["push", "Push"], ["email", "E-mail"], ["whats", "WhatsApp"]];
  return (
    <SectionCard icon="bell" title="Notificações" sub="Como você quer ser avisado">
      {/* header row */}
      <div className="pf-notif-head" style={{ display: "flex", alignItems: "center", paddingBottom: 10, borderBottom: `1px solid ${pal.g100}` }}>
        <span style={{ flex: 1 }} />
        {chans.map(([k, l]) => <span key={k} style={{ width: 64, textAlign: "center", fontSize: 11, fontWeight: 700, letterSpacing: ".03em", textTransform: "uppercase", color: pal.g500 }}>{l}</span>)}
      </div>
      {notifs.map((n) => (
        <div key={n.k} style={{ display: "flex", alignItems: "center", padding: "13px 0", borderBottom: `1px solid ${pal.g100}` }}>
          <div style={{ flex: 1, minWidth: 0, paddingRight: 12 }}>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: pal.ink }}>{n.label}</div>
            <div style={{ fontSize: 12, color: pal.g500, marginTop: 1 }}>{n.desc}</div>
          </div>
          {chans.map(([ch]) => <div key={ch} style={{ width: 64, display: "flex", justifyContent: "center" }}><Toggle value={n[ch]} onChange={(v) => set(n.k, ch, v)} /></div>)}
        </div>
      ))}
    </SectionCard>
  );
}

/* ---------- 5. DOCUMENTOS ---------- */
function DocsSection({ onToast }: { onToast: (m: string, i?: string) => void }) {
  return (
    <SectionCard icon="folder" title="Meus documentos" sub="Transparência — veja e baixe">
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {PF_DOCS.map((d) => (
          <div key={d.k} style={{ display: "flex", alignItems: "center", gap: 13, border: `1px solid ${pal.g300}`, borderRadius: 11, padding: "12px 14px" }}>
            <span style={{ width: 38, height: 38, flexShrink: 0, borderRadius: 9, background: pal.lilac2, display: "grid", placeItems: "center" }}><Ic n={d.icon} s={18} c={pal.primary} /></span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: pal.ink }}>{d.name}</div>
              <div style={{ fontSize: 12, color: pal.g500, marginTop: 1 }}>{d.sub}</div>
            </div>
            <button onClick={() => onToast("Baixando " + d.name + "…", "download")} style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 6, border: `1px solid ${pal.g300}`, background: "#fff", color: pal.g700, borderRadius: 9, padding: "8px 14px", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13 }}><Ic n="download" s={15} c={pal.primary} /> Baixar</button>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

/* ---------- DISPONIBILIDADE (atalho sidebar) ---------- */
function AvailShortcutMini({ onToast, router }: { onToast: (m: string, i?: string) => void; router: any }) {
  return (
    <button onClick={() => router.push("/corretor/agenda")} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", border: `1px solid ${pal.g300}`, background: "#fff", borderRadius: 11, padding: "11px 13px", cursor: "pointer", textAlign: "left", fontFamily: "var(--font-body)" }}>
      <span style={{ width: 30, height: 30, flexShrink: 0, borderRadius: 8, background: pal.lilac2, display: "grid", placeItems: "center" }}><Ic n="clock" s={16} c={pal.primary} /></span>
      <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 12.5, fontWeight: 600, color: pal.ink }}>Disponibilidade</div><div style={{ fontSize: 11, color: pal.g500 }}>na Agenda</div></div>
      <Ic n="arrow-up-right" s={15} c={pal.g500} />
    </button>
  );
}

/* ---------- DISPONIBILIDADE (atalho mobile stacked) ---------- */
function AvailShortcut({ router }: { router: any }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 13, background: "#fff", border: `1px solid ${pal.g300}`, borderRadius: 16, padding: "16px 18px" }}>
      <span style={{ width: 40, height: 40, flexShrink: 0, borderRadius: 10, background: pal.lilac2, display: "grid", placeItems: "center" }}><Ic n="clock" s={20} c={pal.primary} /></span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: pal.ink }}>Disponibilidade</div>
        <div style={{ fontSize: 12.5, color: pal.g500, marginTop: 1 }}>Seus horários de atendimento ficam na Agenda, junto do calendário.</div>
      </div>
      <button onClick={() => router.push("/corretor/agenda")} style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 6, border: `1px solid ${pal.g300}`, background: "#fff", color: pal.g700, borderRadius: 10, padding: "9px 15px", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13 }}>Abrir na Agenda <Ic n="arrow-right" s={15} c={pal.primary} /></button>
    </div>
  );
}

/* ---------- TOAST ---------- */
interface ToastT { id: number; msg: string; icon?: string }
function Toast({ toast }: { toast: ToastT | null }) {
  if (!toast) return null;
  return (
    <div key={toast.id} style={{ position: "fixed", bottom: 26, left: "50%", transform: "translateX(-50%)", zIndex: 9000, display: "flex", alignItems: "center", gap: 10, background: pal.ink, color: "#fff", borderRadius: 12, padding: "12px 18px", boxShadow: "var(--shadow-lg)", fontFamily: "var(--font-body)", fontSize: 13.5, fontWeight: 500, animation: "toastUp .26s cubic-bezier(.2,.7,.3,1)", maxWidth: 440 }}>
      <span style={{ width: 26, height: 26, borderRadius: "50%", background: "rgba(255,255,255,.14)", display: "grid", placeItems: "center", flexShrink: 0 }}><Ic n={toast.icon || "check"} s={15} c="#fff" /></span>
      <span>{toast.msg}</span>
    </div>
  );
}

/* ---------- SKELETON ---------- */
function Skeleton() {
  return (
    <div style={{ padding: 28, maxWidth: 820, margin: "0 auto" }}>
      {[220, 200, 240, 200].map((h, i) => <div key={i} className="sk" style={{ height: h, borderRadius: 16, marginBottom: 18 }} />)}
    </div>
  );
}

/* ---------- SECTIONS CONFIG ---------- */
const SECTIONS = [
  { k: "publico", label: "Perfil público", icon: "id-card" },
  { k: "conta", label: "Conta", icon: "user-cog" },
  { k: "seguranca", label: "Segurança", icon: "shield-check" },
  { k: "notif", label: "Notificações", icon: "bell" },
  { k: "docs", label: "Documentos", icon: "folder" },
];

/* ---------- PAGE ---------- */
export default function PerfilPage() {
  const router = useRouter();
  const [isMobile, setIsMobile] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [sec, setSec] = React.useState("publico");
  const [toast, setToast] = React.useState<ToastT | null>(null);
  const toastTimer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  React.useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 1024);
    onResize();
    window.addEventListener("resize", onResize);
    const t0 = setTimeout(() => setLoading(false), 800);
    return () => { window.removeEventListener("resize", onResize); clearTimeout(t0); };
  }, []);

  const fire = (msg: string, icon?: string) => {
    setToast({ msg, icon, id: Date.now() });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  };

  const renderSection = (k: string) => {
    if (k === "publico") return <PublicSection onToast={fire} />;
    if (k === "conta") return <AccountSection onToast={fire} />;
    if (k === "seguranca") return <SecuritySection onToast={fire} />;
    if (k === "notif") return <NotifSection onToast={fire} />;
    if (k === "docs") return <DocsSection onToast={fire} />;
    return null;
  };

  const content = loading ? <Skeleton /> : (
    <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: isMobile ? 14 : 24, padding: isMobile ? "14px 14px 22px" : 28, maxWidth: 1100, margin: "0 auto", alignItems: isMobile ? "stretch" : "flex-start" }}>
      {/* left nav */}
      <div className={isMobile ? "hide-scroll" : undefined} style={{ width: isMobile ? "100%" : 220, flexShrink: 0, position: isMobile ? "static" : "sticky", top: 0, display: "flex", flexDirection: isMobile ? "row" : "column", gap: isMobile ? 6 : 4, overflowX: isMobile ? "auto" : "visible", paddingBottom: isMobile ? 2 : 0 }}>
        {SECTIONS.map((s) => {
          const on = sec === s.k;
          return (
            <button key={s.k} onClick={() => setSec(s.k)}
              style={{ display: "flex", alignItems: "center", gap: 11, border: "none", background: on ? pal.lilac2 : "transparent", color: on ? pal.primary : pal.g700, borderRadius: 11, padding: "11px 14px", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: on ? 700 : 600, fontSize: 14, textAlign: "left", position: "relative", flexShrink: 0, whiteSpace: "nowrap" } as React.CSSProperties}
              onMouseEnter={(e) => { if (!on) (e.currentTarget as any).style.background = pal.lilac1; }}
              onMouseLeave={(e) => { if (!on) (e.currentTarget as any).style.background = "transparent"; }}>
              {on && <span style={{ position: "absolute", left: 0, top: 10, bottom: 10, width: 3, borderRadius: 999, background: pal.primary }} />}
              <Ic n={s.icon} s={19} c={on ? pal.primary : pal.g500} /> {s.label}
            </button>
          );
        })}
        <div style={{ marginTop: 10, display: isMobile ? "none" : "block" }}><AvailShortcutMini onToast={fire} router={router} /></div>
      </div>
      {/* content */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 18 }}>
        {renderSection(sec)}
        {sec === "seguranca" && <div style={{ fontSize: 12, color: pal.g500, textAlign: "center", padding: "4px 0" }}><Ic n="lock" s={12} c={pal.g500} style={{ verticalAlign: "middle", marginRight: 4 }} /> Recomendamos app autenticador + códigos de backup (mais seguro que SMS).</div>}
      </div>
    </div>
  );

  return (
    <CorretorChrome title="Meu perfil" subtitle="Identidade, conta e segurança." searchPlaceholder="Buscar" mobileTab="Perfil">
      {content}
      <Toast toast={toast} />
    </CorretorChrome>
  );
}
