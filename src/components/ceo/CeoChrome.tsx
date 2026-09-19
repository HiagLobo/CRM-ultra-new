"use client";
import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { mockAuth } from "@/lib/auth";
import { Ic } from "@/components/corretor/PanelIcon";
import GuiaDemo from "@/components/guia/GuiaDemo";
import { brand } from "@/config/brand";
import { demo, emailDemo } from "@/config/demo";

/* Paleta do Painel do CEO (igual ao CeoShell.jsx do handoff). */
export const ceoPalette = {
  primary: "#4F46E5", dark: "#4338CA", deep: "#312E81", light: "#6366F1",
  lilac2: "#E0E7FF", lilac1: "#EEF2FF", ink: "#1C1A22",
  g700: "#4A4754", g500: "#807C8A", g300: "#D8D5DE", g100: "#F2F1F5",
  page: "#FAFAFB", white: "#FFFFFF",
  success: "#2E9E5B", warning: "#E0A82E", error: "#D64545",
};

/* Persona CEO do demo (fictícia) — a mesma no topo, em Minha conta, Acessos e Relatórios. */
const CEO_NOME = "Marina Duarte";
export const ceoPersona = {
  nome: CEO_NOME,
  email: emailDemo("marina"),
  iniciais: CEO_NOME.split(" ").map((p) => p[0]).slice(0, 2).join(""),
};

/* Ícone — mesma API `CIc` do handoff, sobre o resolvedor dinâmico do Lucide. */
export function CIc({ n, s = 20, c = "currentColor", sw = 1.75, style }: { n: string; s?: number; c?: string; sw?: number; style?: React.CSSProperties }) {
  return <span style={{ width: s, height: s, color: c, display: "inline-flex", flex: "0 0 auto", ...style }}><Ic n={n} s={s} c={c} sw={sw} /></span>;
}

interface NavItem { label: string; icon: string; route: string }
export const CEO_NAV: { title: string | null; items: NavItem[] }[] = [
  { title: null, items: [
    { label: "Visão geral", icon: "layout-dashboard", route: "/ceo/visao-geral" },
  ] },
  { title: "Rede", items: [
    { label: "Associados & Franquias", icon: "building-2", route: "/ceo/associados" },
    { label: "Corretores", icon: "users", route: "/ceo/corretores" },
    { label: "Curadoria", icon: "clipboard-check", route: "/ceo/curadoria" },
  ] },
  { title: "Operação", items: [
    { label: "Atendimento & filas", icon: "inbox", route: "/ceo/operacao" },
    { label: "Fechamentos", icon: "badge-check", route: "/ceo/fechamentos" },
    { label: "Candidatos a corretor", icon: "user-plus", route: "/ceo/candidatos" },
  ] },
  { title: "Financeiro", items: [
    { label: "Financeiro", icon: "wallet", route: "/ceo/financeiro" },
    { label: "Cobranças & repasses", icon: "receipt", route: "/ceo/cobrancas" },
    { label: "Crédito & reputação", icon: "scan-search", route: "/ceo/credito" },
    { label: "Locação & Garantia", icon: "shield-check", route: "/ceo/locacao" },
    { label: "Planos & Assinaturas", icon: "credit-card", route: "/ceo/planos" },
  ] },
  { title: "Suporte", items: [
    { label: "Chamados", icon: "life-buoy", route: "/ceo/chamados" },
  ] },
  { title: "Crescimento", items: [
    { label: "Leads & Distribuição", icon: "megaphone", route: "/ceo/leads" },
    { label: "Captação & Radar", icon: "radar", route: "/ceo/radar" },
    { label: "Parcerias", icon: "handshake", route: "/ceo/parcerias" },
    { label: "Marketing & Site", icon: "layout-template", route: "/ceo/marketing" },
  ] },
  { title: "Configuração", items: [
    { label: "Score", icon: "gauge", route: "/ceo/score" },
    { label: "Administradores & Acessos", icon: "shield", route: "/ceo/acessos" },
    { label: "TI & Plataforma", icon: "server-cog", route: "/ceo/ti" },
    { label: "Custos do sistema", icon: "calculator", route: "/ceo/custos" },
    { label: "Jurídico & LGPD", icon: "scale", route: "/ceo/juridico" },
  ] },
  { title: null, items: [
    { label: "Relatórios", icon: "bar-chart-3", route: "/ceo/relatorios" },
  ] },
];
export const CEO_ROUTES = CEO_NAV.flatMap((g) => g.items);

const navBtnStyle: React.CSSProperties = {
  width: 34, height: 34, flexShrink: 0, border: "1px solid rgba(255,255,255,.18)", background: "rgba(255,255,255,.06)",
  borderRadius: 9, display: "grid", placeItems: "center", cursor: "pointer", color: "#fff",
};

/* hook de viewport — desktop por padrão no SSR, corrige no mount */
function useViewportMobile(bp = 880) {
  const [m, setM] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${bp}px)`);
    const on = () => setM(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [bp]);
  return m;
}

/* ---------------- SIDEBAR ---------------- */
function CeoSidebar({ activeRoute, navigate, collapsed, setCollapsed, mobileOpen, setMobileOpen, isMobile }: {
  activeRoute: string; navigate: (r: string) => void; collapsed: boolean; setCollapsed: (f: (c: boolean) => boolean) => void;
  mobileOpen: boolean; setMobileOpen: (v: boolean) => void; isMobile: boolean;
}) {
  const W = collapsed && !isMobile ? 76 : 268;
  const inner = (
    <aside data-tour="ceo-menu" style={{
      width: W, minWidth: W, maxWidth: W, background: ceoPalette.dark, color: "#fff",
      display: "flex", flexDirection: "column", flexShrink: 0,
      height: isMobile ? "100%" : "100vh",
      position: isMobile ? "fixed" : "sticky", top: 0, left: 0, zIndex: 60,
      transition: "width .22s cubic-bezier(.2,.7,.3,1)", overflowX: "hidden",
    }}>
      {/* Brand + collapse */}
      <div style={{ padding: collapsed && !isMobile ? "20px 0 14px" : "20px 18px 14px", display: "flex", alignItems: "center", justifyContent: collapsed && !isMobile ? "center" : "space-between" }}>
        {(!collapsed || isMobile) && <img src="/assets/logo-white.svg" alt={brand.nome} style={{ height: 44 }} />}
        {isMobile ? (
          <button onClick={() => setMobileOpen(false)} title="Fechar" style={navBtnStyle}><CIc n="x" s={18} c="#fff" /></button>
        ) : (
          <button onClick={() => setCollapsed((c) => !c)} title={collapsed ? "Expandir" : "Recolher"} style={navBtnStyle}><CIc n={collapsed ? "chevrons-right" : "chevrons-left"} s={18} c="#fff" /></button>
        )}
      </div>

      {/* Context badge */}
      {(!collapsed || isMobile) && (
        <div style={{ margin: "0 16px 8px", padding: "8px 12px", background: "rgba(255,255,255,.08)", borderRadius: 10, display: "flex", alignItems: "center", gap: 8 }}>
          <CIc n="shield" s={15} c="#fff" />
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".04em" }}>PAINEL DO CEO</span>
        </div>
      )}

      {/* Nav */}
      <nav className="ceo-nav" style={{ padding: "4px 12px", flex: 1, overflowY: "auto" }}>
        {CEO_NAV.map((group, gi) => (
          <div key={gi} data-tour={`ceo-grupo-${(group.title ?? "inicio").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().split(" ")[0]}`} style={{ marginBottom: 6 }}>
            {group.title
              ? ((!collapsed || isMobile)
                  ? <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".07em", textTransform: "uppercase", color: "rgba(255,255,255,.42)", padding: "14px 14px 6px" }}>{group.title}</div>
                  : <div style={{ height: 1, background: "rgba(255,255,255,.12)", margin: "12px 8px" }} />)
              : (gi > 0 && collapsed && !isMobile && <div style={{ height: 1, background: "rgba(255,255,255,.12)", margin: "12px 8px" }} />)}
            {group.items.map((it) => {
              const on = activeRoute === it.route;
              return (
                <button key={it.route} onClick={() => navigate(it.route)} title={collapsed && !isMobile ? it.label : undefined} style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 12, border: "none", cursor: "pointer",
                  fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 600, textAlign: "left",
                  padding: collapsed && !isMobile ? "11px 0" : "10px 14px", justifyContent: collapsed && !isMobile ? "center" : "flex-start",
                  borderRadius: 10, marginBottom: 2, position: "relative",
                  background: on ? "rgba(255,255,255,.16)" : "transparent",
                  color: on ? "#fff" : "rgba(255,255,255,.78)", transition: "background .15s ease",
                } as React.CSSProperties}
                  onMouseEnter={(e) => { if (!on) (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,.08)"; }}
                  onMouseLeave={(e) => { if (!on) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}>
                  {on && (!collapsed || isMobile) && <span style={{ position: "absolute", left: 0, top: 8, bottom: 8, width: 3, borderRadius: 999, background: "#fff" }} />}
                  <CIc n={it.icon} s={20} c={on ? "#fff" : "rgba(255,255,255,.72)"} />
                  {(!collapsed || isMobile) && <span style={{ flex: 1, lineHeight: 1.2 }}>{it.label}</span>}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer network summary */}
      {(!collapsed || isMobile) && (
        <div style={{ padding: 14, margin: 12, background: "rgba(255,255,255,.08)", borderRadius: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{demo.nome}</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,.7)", lineHeight: 1.5 }}>342 corretores · 86 unidades</div>
        </div>
      )}
    </aside>
  );

  if (isMobile) {
    return (
      <>
        <div onClick={() => setMobileOpen(false)} style={{
          position: "fixed", inset: 0, background: "rgba(28,26,34,.45)", zIndex: 55,
          opacity: mobileOpen ? 1 : 0, pointerEvents: mobileOpen ? "auto" : "none", transition: "opacity .2s ease",
        }} />
        <div style={{ transform: mobileOpen ? "translateX(0)" : "translateX(-100%)", transition: "transform .24s cubic-bezier(.2,.7,.3,1)", position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 60 }}>
          {inner}
        </div>
      </>
    );
  }
  return inner;
}

/* ---------------- UNIT SELECTOR ---------------- */
const UNITS = [
  { label: "Rede inteira", sub: "86 unidades", icon: "network" },
  { label: "Matriz", sub: "São Paulo · SP", icon: "building" },
  { label: "Franquia", sub: "Selecionar franquia", icon: "store" },
  { label: "Associado", sub: "Selecionar associado", icon: "handshake" },
];

function UnitSelector() {
  const [open, setOpen] = React.useState(false);
  const [unit, setUnit] = React.useState(UNITS[0]);
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button onClick={() => setOpen((o) => !o)} style={{
        display: "flex", alignItems: "center", gap: 10, border: `1px solid ${ceoPalette.g300}`, background: "#fff",
        borderRadius: 999, padding: "8px 14px", cursor: "pointer", fontFamily: "var(--font-body)", color: ceoPalette.ink,
      }}>
        <span style={{ width: 30, height: 30, borderRadius: "50%", background: ceoPalette.lilac2, display: "grid", placeItems: "center", flexShrink: 0 }}>
          <CIc n={unit.icon} s={16} c={ceoPalette.primary} />
        </span>
        <span style={{ textAlign: "left", lineHeight: 1.15 }}>
          <span style={{ display: "block", fontSize: 13.5, fontWeight: 700 }}>{unit.label}</span>
          <span style={{ display: "block", fontSize: 11.5, color: ceoPalette.g500 }}>{unit.sub}</span>
        </span>
        <CIc n="chevron-down" s={16} c={ceoPalette.g500} />
      </button>
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 8px)", left: 0, minWidth: 240, background: "#fff", border: `1px solid ${ceoPalette.g300}`, borderRadius: 14, boxShadow: "var(--shadow-lg)", padding: 6, zIndex: 40 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: ceoPalette.g500, padding: "8px 12px 4px" }}>Ver dados de</div>
          {UNITS.map((u) => {
            const on = u.label === unit.label;
            return (
              <button key={u.label} onClick={() => { setUnit(u); setOpen(false); }} style={{
                width: "100%", display: "flex", alignItems: "center", gap: 10, border: "none", cursor: "pointer",
                background: on ? ceoPalette.lilac1 : "transparent", borderRadius: 10, padding: "9px 12px", textAlign: "left",
                fontFamily: "var(--font-body)",
              }}
                onMouseEnter={(e) => { if (!on) (e.currentTarget as HTMLButtonElement).style.background = ceoPalette.g100; }}
                onMouseLeave={(e) => { if (!on) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}>
                <span style={{ width: 30, height: 30, borderRadius: "50%", background: ceoPalette.lilac2, display: "grid", placeItems: "center", flexShrink: 0 }}>
                  <CIc n={u.icon} s={16} c={ceoPalette.primary} />
                </span>
                <span style={{ flex: 1, lineHeight: 1.2 }}>
                  <span style={{ display: "block", fontSize: 14, fontWeight: 600, color: ceoPalette.ink }}>{u.label}</span>
                  <span style={{ display: "block", fontSize: 12, color: ceoPalette.g500 }}>{u.sub}</span>
                </span>
                {on && <CIc n="check" s={16} c={ceoPalette.primary} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ---------------- USER MENU ---------------- */
const menuRow: React.CSSProperties = {
  width: "100%", display: "flex", alignItems: "center", gap: 10, border: "none", cursor: "pointer",
  background: "transparent", borderRadius: 10, padding: "9px 12px", textAlign: "left",
  fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 500, color: ceoPalette.ink,
};

function UserMenu() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const logout = () => { mockAuth.logout(); router.push("/login"); };
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button onClick={() => setOpen((o) => !o)} style={{ display: "flex", alignItems: "center", gap: 10, border: "none", background: "transparent", cursor: "pointer", padding: "4px 6px 4px 4px", borderRadius: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: "50%", background: `linear-gradient(135deg, ${ceoPalette.light}, ${ceoPalette.deep})`, display: "grid", placeItems: "center", color: "#fff", fontWeight: 700, fontFamily: "var(--font-display)" }}>{ceoPersona.iniciais}</div>
        <div style={{ lineHeight: 1.2, textAlign: "left" }} className="ceo-hide-sm">
          <div style={{ fontSize: 13, fontWeight: 600, color: ceoPalette.ink }}>{ceoPersona.nome}</div>
          <div style={{ fontSize: 12, color: ceoPalette.g500 }}>Diretora · CEO</div>
        </div>
        <CIc n="chevron-down" s={16} c={ceoPalette.g500} style={{ marginLeft: 2 }} />
      </button>
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, minWidth: 220, background: "#fff", border: `1px solid ${ceoPalette.g300}`, borderRadius: 14, boxShadow: "var(--shadow-lg)", padding: 6, zIndex: 40 }}>
          <div style={{ padding: "10px 12px", borderBottom: `1px solid ${ceoPalette.g100}`, marginBottom: 4 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: ceoPalette.ink }}>{ceoPersona.nome}</div>
            <div style={{ fontSize: 12, color: ceoPalette.g500 }}>{ceoPersona.email}</div>
          </div>
          {([["user", "Meu perfil", "/ceo/conta"], ["settings", "Preferências", "/ceo/conta"], ["life-buoy", "Ajuda & suporte", "/ceo/ti"]] as [string, string, string][]).map(([ic, lb, rt]) => (
            <button key={lb} onClick={() => { setOpen(false); router.push(rt); }} style={menuRow}
              onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.background = ceoPalette.g100}
              onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.background = "transparent"}>
              <CIc n={ic} s={17} c={ceoPalette.g700} /> {lb}
            </button>
          ))}
          <div style={{ height: 1, background: ceoPalette.g100, margin: "4px 0" }} />
          <button onClick={logout} style={{ ...menuRow, color: ceoPalette.error }}
            onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.background = ceoPalette.g100}
            onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.background = "transparent"}>
            <CIc n="log-out" s={17} c={ceoPalette.error} /> Sair
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------------- TOPBAR ---------------- */
function CeoTopbar({ isMobile, onBurger }: { isMobile: boolean; onBurger: () => void }) {
  return (
    <header style={{ minHeight: 72, background: "#fff", borderBottom: `1px solid ${ceoPalette.g300}`, display: "flex", alignItems: "center", padding: isMobile ? "0 16px" : "0 28px", gap: 16, position: "sticky", top: 0, zIndex: 30 }}>
      {isMobile && (
        <button onClick={onBurger} title="Menu" style={{ width: 42, height: 42, border: `1px solid ${ceoPalette.g300}`, background: "#fff", borderRadius: 12, display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 }}>
          <CIc n="menu" s={22} c={ceoPalette.ink} />
        </button>
      )}

      {!isMobile && <UnitSelector />}

      {/* Search */}
      <div className="ceo-search" style={{ flex: 1, maxWidth: 420, display: "flex", alignItems: "center", gap: 10, background: ceoPalette.g100, border: "1px solid transparent", borderRadius: 999, padding: "0 16px", height: 44 }}>
        <CIc n="search" s={18} c={ceoPalette.g500} />
        <input placeholder="Buscar na rede…" style={{ flex: 1, border: "none", background: "transparent", outline: "none", fontFamily: "var(--font-body)", fontSize: 14, color: ceoPalette.ink, minWidth: 0 }} />
      </div>

      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 14 }}>
        <button title="Notificações" style={{ width: 42, height: 42, border: `1px solid ${ceoPalette.g300}`, background: "#fff", borderRadius: 12, display: "grid", placeItems: "center", cursor: "pointer", position: "relative", flexShrink: 0 }}>
          <CIc n="bell" s={20} c={ceoPalette.g700} />
          <span style={{ position: "absolute", top: 9, right: 10, width: 8, height: 8, borderRadius: "50%", background: ceoPalette.error, border: "2px solid #fff" }} />
        </button>
        <div className="ceo-divider" style={{ width: 1, height: 30, background: ceoPalette.g300 }} />
        <UserMenu />
      </div>
    </header>
  );
}

/* ---------------- CHROME (layout) ---------------- */
export default function CeoChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isMobile = useViewportMobile(880);
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const navigate = React.useCallback((r: string) => { router.push(r); setMobileOpen(false); }, [router]);

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <CeoSidebar
        activeRoute={pathname} navigate={navigate}
        collapsed={collapsed} setCollapsed={setCollapsed}
        mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} isMobile={isMobile} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <GuiaDemo painel="ceo" />
        <CeoTopbar isMobile={isMobile} onBurger={() => setMobileOpen(true)} />
        <main style={{ padding: isMobile ? 18 : 28, flex: 1, overflow: "auto" }}>{children}</main>
      </div>
    </div>
  );
}
