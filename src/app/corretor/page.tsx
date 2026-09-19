"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import CorretorChrome, { pal, Ic } from "@/components/corretor/CorretorChrome";

/* ============================================================
   INÍCIO — Painel do dia (porte fiel de inicio.jsx)
   ============================================================ */

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

const PILLARS: [string, number, number, string][] = [
  ["Resultados", 232, 300, "#4F46E5"],
  ["Atendimento & Qualidade", 198, 250, "#2563A8"],
  ["Carteira", 162, 200, "#2E9E5B"],
  ["CRM & Acompanhamento", 96, 150, "#E0A82E"],
  ["Disciplina & Planejamento", 54, 100, "#807C8A"],
];
const SCORE = 742;

function ScoreDial({ animate }: { animate: boolean }) {
  const max = 1000;
  const arc = 0.75;
  const frac = animate ? SCORE / max : 0;
  const size = 230, r = 95, cx = size / 2, cy = size / 2;
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(135deg)" }}>
        <defs>
          <linearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#6366F1" /><stop offset="1" stopColor="#4338CA" />
          </linearGradient>
        </defs>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={pal.g100} strokeWidth={16} pathLength={1000} strokeDasharray={`${1000 * arc} 1000`} strokeLinecap="round" />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="url(#scoreGrad)" strokeWidth={16} pathLength={1000} strokeDasharray={`${1000 * arc * frac} 1000`} strokeLinecap="round" style={{ transition: "stroke-dasharray 1.1s cubic-bezier(.2,.7,.3,1)" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2 }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: pal.g500 }}>Seu score</span>
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 52, color: pal.ink, lineHeight: 1 }}>{SCORE}</span>
        <span style={{ fontSize: 13, color: pal.g500, fontWeight: 600 }}>de 1000</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 4, fontSize: 12.5, fontWeight: 700, color: pal.success, background: pal.successBg, borderRadius: 999, padding: "3px 10px" }}>
          <Ic n="trending-up" s={14} c={pal.success} /> +12 na semana
        </span>
      </div>
    </div>
  );
}

function ScoreCard({ animate }: { animate: boolean }) {
  return (
    <div style={{ background: "#fff", border: `1px solid ${pal.g300}`, borderRadius: 18, padding: 22, boxShadow: "var(--shadow-sm)", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <ScoreDial animate={animate} />
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#FBF1DC", color: "#B8860B", borderRadius: 999, padding: "5px 12px", fontSize: 12.5, fontWeight: 700 }}><Ic n="medal" s={14} c="#E0A82E" /> Liga Ouro</span>
        <span style={{ fontSize: 12.5, color: pal.g500, fontWeight: 600 }}>#3 de 308</span>
      </div>
      <div style={{ display: "flex", gap: 9, marginTop: 16, width: "100%", background: pal.lilac1, border: `1px solid ${pal.lilac2}`, borderRadius: 12, padding: "12px 14px" }}>
        <Ic n="sparkles" s={17} c={pal.primary} style={{ flexShrink: 0, marginTop: 1 }} />
        <div style={{ fontSize: 13, color: pal.g700, lineHeight: 1.45 }}><strong style={{ color: pal.ink }}>Para subir 3 pontos:</strong> responda as 2 conversas aguardando ainda hoje.</div>
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 10, width: "100%", alignItems: "flex-start" }}>
        <Ic n="trending-up" s={16} c={pal.success} style={{ flexShrink: 0, marginTop: 1 }} />
        <div style={{ fontSize: 12.5, color: pal.g500, lineHeight: 1.45 }}>Subiu <strong style={{ color: pal.success }}>+12</strong> esta semana: 1 visita realizada e CSAT 5★ de um cliente.</div>
      </div>
    </div>
  );
}

/* Dica do dia: prática de trabalho, sem autoria de pessoa. `tema` é o que aparece embaixo. */
const DICAS = [
  { t: "Responda cada lead novo no mesmo dia e registre a conversa: ninguém fica sem retorno.", tema: "Atendimento" },
  { t: "Antes de cada visita, confirme horário e endereço com o cliente pelo canal do atendimento.", tema: "Agenda" },
  { t: "Imóvel parado há mais de 30 dias pede foto nova, preço revisto ou descrição reescrita.", tema: "Carteira" },
  { t: "Feche o dia movendo cada negociação para a etapa certa do funil.", tema: "Funil" },
  { t: "Reserve um horário fixo na semana para revisar a meta e os próximos passos.", tema: "Planejamento" },
  { t: "Depois da visita, anote o que o cliente gostou e o que faltou: a próxima sugestão acerta mais.", tema: "Acompanhamento" },
  { t: "Peça a avaliação do cliente logo depois do fechamento, enquanto a experiência está fresca.", tema: "Qualidade" },
  { t: "Use o Radar para achar onde há procura e pouca oferta no seu bairro.", tema: "Captação" },
];
const DICA = DICAS[Math.floor((new Date().getFullYear() * 366 + (new Date().getMonth() * 31 + new Date().getDate())) % DICAS.length)];

function MoneyStat({ label, value, c, bg }: { label: string; value: string; c: string; bg: string }) {
  return (
    <div style={{ flex: 1, minWidth: 0, background: bg, borderRadius: 12, padding: "13px 15px" }}>
      <div style={{ fontSize: 12, color: pal.g500, fontWeight: 600 }}>{label}</div>
      <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 24, color: c, marginTop: 3, whiteSpace: "nowrap" }}>{value}</div>
    </div>
  );
}
function MoneyCard({ animate, onToast, isMobile }: { animate: boolean; onToast: (m: string, i?: string) => void; isMobile: boolean }) {
  return (
    <div style={{ background: "#fff", border: `1px solid ${pal.g300}`, borderRadius: 18, padding: 22, boxShadow: "var(--shadow-sm)", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <span style={{ width: 32, height: 32, flexShrink: 0, borderRadius: 9, background: "#E6F4EC", display: "grid", placeItems: "center" }}><Ic n="wallet" s={18} c="#2E9E5B" /></span>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, margin: 0, color: pal.ink }}>Seu dinheiro este mês</h2>
        </div>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#FBF1DC", color: "#B8860B", borderRadius: 999, padding: "4px 11px", fontSize: 11.5, fontWeight: 700, whiteSpace: "nowrap" }}><Ic n="trophy" s={13} c="#E0A82E" /> Recorde R$ 96 mil</span>
      </div>
      <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 12, marginBottom: 18 }}>
        <MoneyStat label="Comissão a receber" value="R$ 84.000" c={pal.primary} bg={pal.lilac1} />
        <MoneyStat label="Recebido no mês" value="R$ 31.500" c="#1E7A43" bg="#E6F4EC" />
      </div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 7 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: pal.ink }}>Meta do mês</span>
          <span style={{ fontSize: 13, color: pal.g500, fontWeight: 600 }}><strong style={{ color: pal.ink }}>R$ 612 mil</strong> de R$ 900 mil</span>
        </div>
        <div style={{ height: 10, borderRadius: 999, background: pal.g100, overflow: "hidden" }}>
          <div style={{ height: "100%", width: animate ? "68%" : 0, background: `linear-gradient(90deg, ${pal.light}, ${pal.primary})`, borderRadius: 999, transition: "width 1s cubic-bezier(.2,.7,.3,1)" }} />
        </div>
        <div style={{ fontSize: 12, color: pal.g500, marginTop: 6 }}>68% · faltam <strong style={{ color: pal.g700 }}>R$ 288 mil</strong> · 11 dias restantes</div>
      </div>
      <div style={{ display: "flex", gap: 11, background: pal.lilac1, border: `1px solid ${pal.lilac2}`, borderRadius: 12, padding: "13px 15px", marginBottom: 14 }}>
        <Ic n="lightbulb" s={17} c={pal.light} style={{ flexShrink: 0, marginTop: 2 }} />
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", color: pal.g500, marginBottom: 4 }}>Dica do dia</div>
          <div style={{ fontSize: 13.5, color: pal.ink, lineHeight: 1.5 }}>{DICA.t}</div>
          <div style={{ fontSize: 12, color: pal.primary, fontWeight: 600, marginTop: 5 }}>{DICA.tema}</div>
        </div>
      </div>
      <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 11, background: "#fff", border: `1px solid ${pal.g300}`, borderRadius: 12, padding: "12px 14px" }}>
        <Ic n="zap" s={18} c={pal.primary} style={{ flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: pal.ink }}>Antecipação disponível: <strong style={{ color: pal.primary }}>R$ 40.000</strong></div>
          <div style={{ fontSize: 11.5, color: pal.g500, marginTop: 1 }}>Receba sua comissão antes do prazo.</div>
        </div>
        <button onClick={() => onToast("Simulação de antecipação aberta", "wallet")} style={{ flexShrink: 0, border: "none", background: pal.primary, color: "#fff", borderRadius: 10, padding: "9px 15px", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13 }}>Antecipar</button>
      </div>
    </div>
  );
}

function HeroBlock({ animate, onToast, isMobile }: { animate: boolean; onToast: (m: string, i?: string) => void; isMobile: boolean }) {
  return (
    <div className="hero-grid" style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.25fr 1fr", gap: 16, alignItems: "stretch" }}>
      <MoneyCard animate={animate} onToast={onToast} isMobile={isMobile} />
      <ScoreCard animate={animate} />
    </div>
  );
}

function BlockHead({ icon, title, sub }: { icon: string; title: string; sub?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
      <span style={{ width: 32, height: 32, borderRadius: 9, background: pal.lilac2, display: "grid", placeItems: "center" }}><Ic n={icon} s={18} c={pal.primary} /></span>
      <div>
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, margin: 0, color: pal.ink }}>{title}</h2>
        {sub && <div style={{ fontSize: 12.5, color: pal.g500 }}>{sub}</div>}
      </div>
    </div>
  );
}

const ACTIONS = [
  { icon: "message-circle", iconBg: "#FAE5E5", iconC: "#D64545", title: "Fernanda Lima aguarda resposta", detail: "Apto Pina · há 3h", sla: true, cta: "Responder", go: "at" },
  { icon: "messages-square", iconBg: "#E0E7FF", iconC: "#4F46E5", title: "2 conversas aguardando resposta", detail: "Mantenha o SLA para pontuar", cta: "Abrir", go: "at" },
  { icon: "calendar-check", iconBg: "#E6F4EC", iconC: "#2E9E5B", title: "3 visitas agendadas para hoje", detail: "10h, 15h e 17h", cta: "Ver agenda", go: "t" },
  { icon: "file-text", iconBg: "#FBF1DC", iconC: "#B8860B", title: "1 proposta aguardando retorno", detail: "Carlos Eduardo · Cobertura", cta: "Ver", go: "at" },
  { icon: "user-plus", iconBg: "#E5EEF7", iconC: "#2563A8", title: "4 leads novos para atender", detail: "Transferidos pelo Assistente", cta: "Atender", go: "at" },
];
function ActionZone({ onGo }: { onGo: (g: string) => void }) {
  return (
    <div>
      <BlockHead icon="zap" title="Precisa de você agora" sub="O que move o resultado do dia e alimenta seu score sozinho." />
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {ACTIONS.map((a, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 13, background: "#fff", border: `1px solid ${a.sla ? "#F2C9C9" : pal.g300}`, borderRadius: 13, padding: "13px 15px" }}>
            <span style={{ width: 40, height: 40, flexShrink: 0, borderRadius: 11, background: a.iconBg, display: "grid", placeItems: "center" }}><Ic n={a.icon} s={20} c={a.iconC} /></span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                <span style={{ fontWeight: 700, fontSize: 14, color: pal.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", minWidth: 0 }}>{a.title}</span>
                {a.sla && <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: pal.errorBg, color: pal.error, fontSize: 10.5, fontWeight: 700, borderRadius: 999, padding: "2px 8px" }}><Ic n="alarm-clock" s={12} c={pal.error} /> SLA</span>}
              </div>
              <div style={{ fontSize: 12.5, color: pal.g500, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.detail}</div>
            </div>
            <button onClick={() => onGo(a.go)} style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 6, border: a.sla ? "none" : `1px solid ${pal.g300}`, background: a.sla ? pal.primary : "#fff", color: a.sla ? "#fff" : pal.g700, borderRadius: 10, padding: "9px 15px", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13, boxShadow: a.sla ? "var(--shadow-purple)" : "none" }}>
              {a.cta} <Ic n="arrow-right" s={15} c={a.sla ? "#fff" : pal.g500} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

const INDS: [string, string, string, string, string][] = [
  ["Negócios fechados", "3", "handshake", "#2E9E5B", "#E6F4EC"],
  ["VGV do mês", "R$ 2,4 mi", "trending-up", "#4F46E5", "#E0E7FF"],
  ["Propostas", "12", "file-text", "#2563A8", "#E5EEF7"],
  ["Visitas", "19", "map-pin", "#C2557A", "#FAE7EF"],
  ["Imóveis ativos", "123", "building-2", "#4A4754", "#EEEDF1"],
];
function Indicadores() {
  return (
    <div>
      <BlockHead icon="bar-chart-3" title="Indicadores do mês" sub="Como você vem indo: o essencial, sem parede de gráficos." />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: 12 }}>
        {INDS.map(([label, val, icon, c, bg], i) => (
          <div key={i} style={{ background: "#fff", border: `1px solid ${pal.g300}`, borderRadius: 14, padding: "15px 16px" }}>
            <span style={{ width: 32, height: 32, borderRadius: 9, background: bg, display: "grid", placeItems: "center" }}><Ic n={icon} s={17} c={c} /></span>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 23, color: pal.ink, marginTop: 10 }}>{val}</div>
            <div style={{ fontSize: 12.5, color: pal.g500, marginTop: 1 }}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

const TIPS = [
  { t: "Responda a conversa da Fernanda", d: "Aguardando há 3h · evite o SLA", pts: "+3", bonus: "+2 se até as 10h", icon: "message-circle" },
  { t: "Agende 2 visitas esta semana", d: "Visitas pesam em Resultados", pts: "+2", icon: "calendar-plus" },
  { t: "Complete seu planejamento semanal", d: "Leva 2 min · organiza o seu dia", pts: "+1", bonus: "+1 se até segunda", icon: "list-checks" },
];
const MEDALS: [string, string, string, string][] = [
  ["zap", "Resposta rápida", "#4F46E5", "#E0E7FF"],
  ["medal", "Top 3 Ouro", "#B8860B", "#FBF1DC"],
  ["building-2", "100+ imóveis", "#2E9E5B", "#E6F4EC"],
];
function GrowthCard({ onToast, animate, isMobile }: { onToast: (m: string, i?: string) => void; animate: boolean; isMobile: boolean }) {
  return (
    <div>
      <BlockHead icon="rocket" title="Como crescer" sub="O caminho pra subir e o reconhecimento pelo progresso." />
      <div className="grow-grid" style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.4fr 1fr", gap: 16 }}>
        <div style={{ background: "#fff", border: `1px solid ${pal.g300}`, borderRadius: 16, padding: 18 }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: pal.g500, marginBottom: 12 }}>Sugestões para você</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {TIPS.map((t, i) => (
              <button key={i} onClick={() => onToast("Vamos lá: " + t.t, t.icon)} style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", textAlign: "left", background: pal.lilac1, border: `1px solid ${pal.lilac2}`, borderRadius: 12, padding: "12px 14px", cursor: "pointer", fontFamily: "var(--font-body)" }}>
                <span style={{ width: 36, height: 36, flexShrink: 0, borderRadius: 10, background: "#fff", display: "grid", placeItems: "center", border: `1px solid ${pal.lilac2}` }}><Ic n={t.icon} s={18} c={pal.primary} /></span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: pal.ink }}>{t.t}</div>
                  <div style={{ fontSize: 12, color: pal.g500, marginTop: 1 }}>{t.d}</div>
                </div>
                <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
                  <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 15, color: pal.success }}>{t.pts}</span>
                  {t.bonus && <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 9.5, fontWeight: 700, color: "#B8860B", background: "#FBF1DC", borderRadius: 999, padding: "1px 6px", whiteSpace: "nowrap" }}><Ic n="zap" s={10} c="#E0A82E" /> {t.bonus}</span>}
                </div>
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ background: `linear-gradient(135deg, ${pal.primary}, ${pal.deep})`, borderRadius: 16, padding: 18, color: "#fff" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <Ic n="flame" s={22} c="#FFB877" />
              <div><div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 24 }}>12 dias</div><div style={{ fontSize: 12, color: "rgba(255,255,255,.8)" }}>de sequência ativa</div></div>
            </div>
          </div>
          <div style={{ background: "#fff", border: `1px solid ${pal.g300}`, borderRadius: 16, padding: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: pal.ink }}>Meta do mês</span>
              <span style={{ fontSize: 12, color: pal.g500, fontWeight: 600 }}>3 de 5 negócios</span>
            </div>
            <div style={{ height: 9, borderRadius: 999, background: pal.g100, overflow: "hidden" }}>
              <div style={{ height: "100%", width: animate ? "60%" : 0, background: pal.primary, borderRadius: 999, transition: "width 1s cubic-bezier(.2,.7,.3,1) .2s" }} />
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
              {MEDALS.map(([icon, label, c, bg], i) => (
                <div key={i} title={label} style={{ display: "flex", alignItems: "center", gap: 6, background: bg, borderRadius: 999, padding: "6px 11px" }}>
                  <Ic n={icon} s={14} c={c} /><span style={{ fontSize: 11.5, fontWeight: 700, color: c }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div style={{ padding: 28, maxWidth: 1100, margin: "0 auto" }}>
      <div className="sk" style={{ height: 280, borderRadius: 18 }} />
      <div className="sk" style={{ height: 22, width: 220, borderRadius: 8, margin: "28px 0 14px" }} />
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{[0, 1, 2].map((i) => <div key={i} className="sk" style={{ height: 66, borderRadius: 13 }} />)}</div>
    </div>
  );
}

export default function InicioPage() {
  const router = useRouter();
  const [isMobile, setIsMobile] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [animate, setAnimate] = React.useState(false);
  const [toast, setToast] = React.useState<ToastT | null>(null);
  const toastTimer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  React.useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 1024);
    onResize();
    window.addEventListener("resize", onResize);
    const t0 = setTimeout(() => { setLoading(false); setTimeout(() => setAnimate(true), 80); }, 800);
    return () => { window.removeEventListener("resize", onResize); clearTimeout(t0); };
  }, []);

  const fire = (msg: string, icon?: string) => { setToast({ msg, icon, id: Date.now() }); clearTimeout(toastTimer.current); toastTimer.current = setTimeout(() => setToast(null), 2600); };
  const onGo = (g: string) => { if (g === "at") router.push("/corretor/atendimento"); else router.push("/corretor/agenda"); };

  const content = loading ? <Skeleton /> : (
    <div style={{ padding: isMobile ? "18px 16px 24px" : 28, maxWidth: 1100, margin: "0 auto", display: "flex", flexDirection: "column", gap: 32 }}>
      <HeroBlock animate={animate} onToast={fire} isMobile={isMobile} />
      <ActionZone onGo={onGo} />
      <Indicadores />
      <GrowthCard onToast={fire} animate={animate} isMobile={isMobile} />
    </div>
  );

  return (
    <CorretorChrome title="Bom dia, Ricardo" subtitle="Aqui está o seu dia: status, ações e como crescer." searchPlaceholder="Buscar imóvel, cliente ou código" mobileTab="Início">
      {content}
      <Toast toast={toast} />
    </CorretorChrome>
  );
}
