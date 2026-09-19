"use client";
import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { mockAuth } from "@/lib/auth";
import { Ic } from "@/components/corretor/PanelIcon";
import GuiaDemo from "@/components/guia/GuiaDemo";
import { brand } from "@/config/brand";

/* Paleta do painel (igual ao shell.jsx do handoff). */
export const pal = {
  primary: "#4F46E5", dark: "#4338CA", deep: "#312E81", light: "#6366F1",
  lilac2: "#E0E7FF", lilac1: "#EEF2FF", ink: "#1C1A22",
  g700: "#4A4754", g600: "#605C6B", g500: "#807C8A", g300: "#D8D5DE", g100: "#F2F1F5",
  page: "#FAFAFB", white: "#FFFFFF",
  success: "#2E9E5B", warning: "#E0A82E", error: "#D64545",
  successBg: "#E6F4EC", warningBg: "#FBF1DC", errorBg: "#FAE5E5",
};

export { Ic };

interface NavItem { label: string; icon: string; href: string; badge?: number }
const SIDEBAR_GROUPS: { title: string; items: NavItem[] }[] = [
  { title: "Geral", items: [
    { label: "Início", icon: "layout-dashboard", href: "/corretor" },
    { label: "Atendimento", icon: "messages-square", badge: 3, href: "/corretor/atendimento" },
    { label: "Radar", icon: "radar", href: "/corretor/radar" },
    { label: "Funil", icon: "kanban-square", href: "/corretor/funil" },
  ] },
  { title: "Negócios", items: [
    { label: "Imóveis", icon: "building-2", href: "/corretor/imoveis" },
    { label: "Agenda", icon: "calendar", badge: 2, href: "/corretor/agenda" },
    { label: "Comissões", icon: "wallet", href: "/corretor/comissoes" },
    { label: "Marketing", icon: "megaphone", href: "/corretor/marketing" },
    { label: "Parcerias", icon: "handshake", href: "/corretor/parcerias" },
  ] },
  { title: "Conta", items: [
    { label: "Suporte", icon: "life-buoy", href: "/corretor/suporte" },
    { label: "Perfil", icon: "user-round", href: "/corretor/perfil" },
  ] },
];

/* abas inferiores no mobile (do InTabBar do handoff) */
const M_TABS: { k: string; icon: string; href: string; badge?: number }[] = [
  { k: "Início", icon: "layout-dashboard", href: "/corretor" },
  { k: "Atendimento", icon: "messages-square", badge: 3, href: "/corretor/atendimento" },
  { k: "Imóveis", icon: "building-2", href: "/corretor/imoveis" },
  { k: "Agenda", icon: "calendar", badge: 2, href: "/corretor/agenda" },
  { k: "Perfil", icon: "user-round", href: "/corretor/perfil" },
];

function isActive(pathname: string, href: string) {
  if (href === "/corretor") return pathname === "/corretor";
  if (href === "/corretor/radar") return pathname.startsWith("/corretor/radar");
  return pathname === href || pathname.startsWith(href + "/");
}

/* hook de viewport — desktop por padrão no SSR, corrige no mount */
function useViewportMobile(bp = 860) {
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

function Sidebar({ open, onNavigate, collapsed, setCollapsed }: {
  open: boolean; onNavigate: () => void; collapsed: boolean; setCollapsed: (f: (c: boolean) => boolean) => void;
}) {
  const pathname = usePathname();
  const W = collapsed ? 76 : 256;
  return (
    <aside
      className={`ds-sidebar${open ? " open" : ""}`}
      data-tour="menu-lateral"
      style={{
        width: W, minWidth: W, maxWidth: W, background: pal.dark, color: "#fff", display: "flex", flexDirection: "column",
        flexShrink: 0, height: "100vh", transition: "width .22s cubic-bezier(.2,.7,.3,1)", position: "relative", overflowX: "hidden",
      }}
    >
      <div style={{ padding: collapsed ? "20px 0 16px" : "20px 18px 16px", display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "space-between" }}>
        {!collapsed && (
          <Link href="/" onClick={onNavigate}><img src="/assets/logo-white.svg" alt={brand.nome} style={{ height: 44 }} /></Link>
        )}
        <button onClick={() => setCollapsed((c) => !c)} title={collapsed ? "Expandir" : "Recolher"} style={{
          width: 34, height: 34, flexShrink: 0, border: "1px solid rgba(255,255,255,.18)", background: "rgba(255,255,255,.06)",
          borderRadius: 9, display: "grid", placeItems: "center", cursor: "pointer", color: "#fff",
        }}>
          <Ic n={collapsed ? "chevrons-right" : "chevrons-left"} s={18} c="#fff" />
        </button>
      </div>

      <nav className="hide-scroll" style={{ padding: "4px 12px", flex: 1, overflowY: "auto" }}>
        {SIDEBAR_GROUPS.map((group, gi) => (
          <div key={group.title} style={{ marginBottom: 8 }}>
            {collapsed
              ? (gi > 0 && <div style={{ height: 1, background: "rgba(255,255,255,.12)", margin: "10px 8px" }} />)
              : <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".07em", textTransform: "uppercase", color: "rgba(255,255,255,.45)", padding: "12px 14px 6px" }}>{group.title}</div>}
            {group.items.map((it) => {
              const on = isActive(pathname, it.href);
              return (
                <Link key={it.label} href={it.href} onClick={onNavigate} title={collapsed ? it.label : undefined} data-tour={`nav-${it.href.split("/").pop()}`} style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 12, border: "none", cursor: "pointer", textDecoration: "none",
                  fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 600, textAlign: "left",
                  padding: collapsed ? "11px 0" : "11px 14px", justifyContent: collapsed ? "center" : "flex-start",
                  borderRadius: 10, marginBottom: 3, position: "relative",
                  background: on ? "rgba(255,255,255,.16)" : "transparent",
                  color: on ? "#fff" : "rgba(255,255,255,.78)", transition: "background .15s ease",
                }}
                  onMouseEnter={(e) => { if (!on) e.currentTarget.style.background = "rgba(255,255,255,.08)"; }}
                  onMouseLeave={(e) => { if (!on) e.currentTarget.style.background = "transparent"; }}>
                  {on && !collapsed && <span style={{ position: "absolute", left: 0, top: 9, bottom: 9, width: 3, borderRadius: 999, background: "#fff" }} />}
                  <Ic n={it.icon} s={20} c={on ? "#fff" : "rgba(255,255,255,.72)"} />
                  {!collapsed && <span style={{ flex: 1 }}>{it.label}</span>}
                  {!collapsed && it.badge && <span style={{ background: pal.light, color: "#fff", fontSize: 11, fontWeight: 700, borderRadius: 999, padding: "1px 7px" }}>{it.badge}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* selo Premium — discreto e sofisticado */}
      {!collapsed && (
        <div style={{ margin: 12, padding: "11px 13px", background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.10)", borderRadius: 12, display: "flex", alignItems: "center", gap: 11 }}>
          <span style={{ width: 32, height: 32, flexShrink: 0, borderRadius: 9, background: "rgba(214,170,84,.16)", display: "grid", placeItems: "center" }}>
            <Ic n="crown" s={16} c="#E6C079" />
          </span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>Premium</div>
            <div style={{ fontSize: 11.5, color: "rgba(255,255,255,.55)" }}>Plano ativo</div>
          </div>
        </div>
      )}
    </aside>
  );
}

function Topbar({ title, subtitle, searchPlaceholder = "Buscar imóvel, cliente ou código", right, onBurger }: {
  title: string; subtitle?: string; searchPlaceholder?: string; right?: React.ReactNode; onBurger: () => void;
}) {
  const router = useRouter();
  const logout = () => { mockAuth.logout(); router.push("/login"); };
  return (
    <header style={{ minHeight: 68, height: 68, background: "#fff", borderBottom: `1px solid ${pal.g300}`, display: "flex", alignItems: "center", padding: "0 24px", gap: 16, flexShrink: 0 }}>
      <button aria-label="Menu" className="ds-panel-burger" onClick={onBurger} style={{
        width: 40, height: 40, placeItems: "center", border: `1px solid ${pal.g300}`, background: "#fff", borderRadius: 11, cursor: "pointer", color: pal.ink, flexShrink: 0,
      }}>
        <Ic n="menu" s={20} />
      </button>
      <div style={{ lineHeight: 1.2, minWidth: 0 }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, margin: 0, color: pal.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</h1>
        {subtitle && <div style={{ fontSize: 12.5, color: pal.g500, marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{subtitle}</div>}
      </div>
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 14 }}>
        {right}
        <div className="ds-panel-topsearch" data-tour="topbar-busca" style={{ display: "flex", alignItems: "center", gap: 8, background: pal.g100, borderRadius: 999, padding: "9px 16px", width: 260 }}>
          <Ic n="search" s={18} c={pal.g500} />
          <input placeholder={searchPlaceholder} style={{ border: "none", background: "transparent", outline: "none", fontFamily: "var(--font-body)", fontSize: 14, flex: 1, color: pal.ink }} />
        </div>
        <button style={{ width: 42, height: 42, border: `1px solid ${pal.g300}`, background: "#fff", borderRadius: 12, display: "grid", placeItems: "center", cursor: "pointer", position: "relative" }}>
          <Ic n="bell" s={20} c={pal.g700} />
          <span style={{ position: "absolute", top: 9, right: 10, width: 8, height: 8, borderRadius: "50%", background: pal.error, border: "2px solid #fff" }} />
        </button>
        <button onClick={logout} title="Sair" style={{ width: 42, height: 42, border: `1px solid ${pal.g300}`, background: "#fff", borderRadius: 12, display: "grid", placeItems: "center", cursor: "pointer" }}>
          <Ic n="log-out" s={20} c={pal.g700} />
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: `linear-gradient(135deg, ${pal.light}, ${pal.deep})`, display: "grid", placeItems: "center", color: "#fff", fontWeight: 700, fontFamily: "var(--font-display)", fontSize: 14 }}>RA</div>
          <div className="ds-panel-topsearch" style={{ lineHeight: 1.2 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: pal.ink }}>Ricardo Almeida</div>
            <div style={{ fontSize: 12, color: pal.g500 }}>Corretor · 123 imóveis</div>
          </div>
        </div>
      </div>
    </header>
  );
}

/* ---------------- RADAR SUB-TABS (routed) ---------------- */
const RADAR_SUBTABS = [
  { k: "Oportunidades", icon: "sparkles", href: "/corretor/radar" },
  { k: "Mapa", icon: "map-pinned", href: "/corretor/radar/mapa" },
  { k: "Avaliação", icon: "gauge", href: "/corretor/radar/avaliacao" },
  { k: "Alertas", icon: "bell-ring", href: "/corretor/radar/alertas" },
  { k: "Proprietários", icon: "users", href: "/corretor/radar/proprietarios" },
];
export function RadarTabs({ active, right }: { active: string; right?: React.ReactNode }) {
  return (
    <div className="hide-scroll" data-tour="radar-abas" style={{ display: "flex", gap: 4, alignItems: "center", background: "#fff", borderBottom: `1px solid ${pal.g300}`, padding: "0 24px", flexShrink: 0, overflowX: "auto" }}>
      {RADAR_SUBTABS.map((t) => {
        const on = active === t.k;
        return (
          <Link key={t.k} href={t.href}
            style={{ display: "flex", alignItems: "center", gap: 7, border: "none", background: "transparent", cursor: "pointer", padding: "13px 6px", margin: "0 8px", position: "relative", fontFamily: "var(--font-body)", fontWeight: on ? 700 : 600, fontSize: 13.5, color: on ? pal.primary : pal.g600, whiteSpace: "nowrap", textDecoration: "none" }}>
            <Ic n={t.icon} s={16} c={on ? pal.primary : pal.g500} /> {t.k}
            {on && <span style={{ position: "absolute", left: 6, right: 6, bottom: 0, height: 2.5, borderRadius: 999, background: pal.primary }} />}
          </Link>
        );
      })}
      {right ? <div style={{ marginLeft: "auto", paddingLeft: 12, flexShrink: 0 }}>{right}</div> : null}
    </div>
  );
}

/* ---------------- MOBILE CHROME (top bar + content + bottom tabs) ---------------- */
/* Distância do botão Guia até a base: barra de abas ≈ 60 px; a caixa de mensagem do
   Atendimento soma mais ≈ 75 px por cima dela. */
const FOLGA_ABAS = 72;
const FOLGA_ATENDIMENTO = 148;
function MobileChrome({ tab, title, subtitle, children }: { tab: string; title: string; subtitle?: string; children: React.ReactNode }) {
  const router = useRouter();
  const logout = () => { mockAuth.logout(); router.push("/login"); };
  return (
    <div className="ds-mobile-shell" style={{ display: "flex", flexDirection: "column", background: pal.page, overflow: "hidden" }}>
      {/* o botão Guia sobe acima da barra de abas (antes cobria a aba Perfil) — e, no
          Atendimento, também acima da caixa de mensagem, para não cobrir o Enviar */}
      <GuiaDemo painel="corretor" folgaInferior={tab === "Atendimento" ? FOLGA_ATENDIMENTO : FOLGA_ABAS} />
      <header style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "#fff", borderBottom: `1px solid ${pal.g300}`, flexShrink: 0 }}>
        <div style={{ lineHeight: 1.2, minWidth: 0, flex: 1 }}>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, color: pal.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</div>
          {subtitle && <div style={{ fontSize: 12, color: pal.g500, marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{subtitle}</div>}
        </div>
        <button style={{ width: 38, height: 38, border: `1px solid ${pal.g300}`, background: "#fff", borderRadius: 11, display: "grid", placeItems: "center", cursor: "pointer", position: "relative", flexShrink: 0 }}>
          <Ic n="bell" s={19} c={pal.g700} />
          <span style={{ position: "absolute", top: 8, right: 9, width: 7, height: 7, borderRadius: "50%", background: pal.error, border: "2px solid #fff" }} />
        </button>
        <button onClick={logout} title="Sair" style={{ width: 38, height: 38, border: `1px solid ${pal.g300}`, background: "#fff", borderRadius: 11, display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 }}>
          <Ic n="log-out" s={19} c={pal.g700} />
        </button>
      </header>

      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", overflowX: "hidden", WebkitOverflowScrolling: "touch", background: pal.page }}>{children}</div>

      <nav style={{ display: "flex", borderTop: `1px solid ${pal.g300}`, background: "#fff", flexShrink: 0, paddingBottom: "max(4px, env(safe-area-inset-bottom))" }}>
        {M_TABS.map((t) => {
          const on = t.k === tab;
          return (
            <Link key={t.k} href={t.href} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, textDecoration: "none", padding: "9px 0 5px" }}>
              <span style={{ position: "relative", display: "inline-flex" }}>
                <Ic n={t.icon} s={23} c={on ? pal.primary : pal.g500} />
                {t.badge && <span style={{ position: "absolute", top: -4, right: -9, minWidth: 15, height: 15, padding: "0 4px", borderRadius: 999, background: pal.error, color: "#fff", fontSize: 9.5, fontWeight: 700, display: "grid", placeItems: "center", border: "1.5px solid #fff" }}>{t.badge}</span>}
              </span>
              <span style={{ fontSize: 10.5, fontWeight: on ? 700 : 600, color: on ? pal.primary : pal.g500, fontFamily: "var(--font-body)" }}>{t.k}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

/* ---------------- CHROME (sidebar + topbar [+ radar tabs] + main) ---------------- */
export default function CorretorChrome({
  title, subtitle, searchPlaceholder, right, radar, radarRight, mobileTab, children,
}: {
  title: string; subtitle?: string; searchPlaceholder?: string; right?: React.ReactNode;
  radar?: string; radarRight?: React.ReactNode; mobileTab?: string; children: React.ReactNode;
}) {
  const isMobile = useViewportMobile(860);
  const [open, setOpen] = React.useState(false);
  const [collapsed, setCollapsed] = React.useState(false);
  const close = React.useCallback(() => setOpen(false), []);

  React.useEffect(() => {
    const onResize = () => { if (window.innerWidth < 1240) setCollapsed(true); };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  /* mobile: barra de abas inferior (só para páginas com mobileTab) */
  if (mobileTab && isMobile) {
    return <MobileChrome tab={mobileTab} title={title} subtitle={subtitle}>{children}</MobileChrome>;
  }

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {open && <div className="ds-sidebar-overlay" onClick={close} />}
      <Sidebar open={open} onNavigate={close} collapsed={collapsed} setCollapsed={setCollapsed} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <GuiaDemo painel="corretor" />
        <Topbar title={title} subtitle={subtitle} searchPlaceholder={searchPlaceholder} right={right} onBurger={() => setOpen(true)} />
        {radar && <RadarTabs active={radar} right={radarRight} />}
        <main style={{ flex: 1, overflowY: "auto", minHeight: 0, background: pal.page }}>{children}</main>
      </div>
    </div>
  );
}
