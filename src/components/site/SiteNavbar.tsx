"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { palette as sitePalette } from "@/lib/palette";
import { Ic } from "@/components/Icon";
import PortalDemoBanner from "./PortalDemoBanner";
import TourDoPortal from "./TourDoPortal";
import MarcaDemo, { avisoContatoExemplo } from "./MarcaDemo";

/*
 * Site de exemplo (demo): só as telas que demonstram o produto — vitrine, busca,
 * favoritos e comparação. As páginas institucionais herdadas do protótipo
 * (sobre, blog, seja corretor, associadas...) saíram na O6·S2.
 */
const NAV: { label: string; href: string; icon: string }[] = [
  { label: "Home", href: "/demo/portal", icon: "home" },
  { label: "Buscar imóvel", href: "/demo/buscar", icon: "search" },
  { label: "Favoritos", href: "/demo/favoritos", icon: "heart" },
  { label: "Comparar", href: "/demo/comparar", icon: "git-compare" },
];

const estiloBotaoContato = {
  display: "flex", alignItems: "center", gap: 8, border: `1.5px solid ${sitePalette.g300}`,
  background: "#fff", borderRadius: 999, padding: "9px 16px", cursor: "pointer",
  fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 14, color: sitePalette.ink,
} as const;

export default function SiteNavbar({ current }: { current?: string }) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isActive = (href: string) => pathname.startsWith(href);

  // fecha o drawer ao trocar de rota
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  return (
    <>
    <PortalDemoBanner />
    <TourDoPortal />
    <header
      style={{
        position: "sticky", top: 0, zIndex: 50, background: "rgba(255,255,255,.86)",
        backdropFilter: "blur(10px)", borderBottom: `1px solid ${sitePalette.g300}`,
      }}
    >
      <div className="ds-pad" style={{ maxWidth: 1240, margin: "0 auto", padding: "0 32px", height: 72, display: "flex", alignItems: "center", gap: 32 }}>
        <Link href="/demo/portal" style={{ display: "flex", flexShrink: 0, textDecoration: "none" }}>
          <MarcaDemo />
        </Link>

        {/* ----- desktop nav ----- */}
        <nav className="ds-nav-desktop" style={{ gap: 4, marginLeft: 8, flexShrink: 0 }}>
          {NAV.map((i) => {
            const on = isActive(i.href) || current === i.label;
            return (
              <Link
                key={i.href}
                href={i.href}
                className={`ds-navlink${on ? " is-active" : ""}`}
                style={{
                  textDecoration: "none", whiteSpace: "nowrap",
                  fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 600,
                  padding: "8px 12px", borderRadius: 8,
                  color: on ? sitePalette.primary : sitePalette.g700,
                  background: on ? sitePalette.lilac2 : "transparent",
                }}
              >
                {i.label}
              </Link>
            );
          })}
        </nav>

        {/* ----- desktop right cluster ----- */}
        <div className="ds-nav-desktop" style={{ marginLeft: "auto", alignItems: "center", gap: 12 }}>
          <button type="button" onClick={avisoContatoExemplo} className="ds-btnpop" style={estiloBotaoContato}>
            <Ic n="message-circle" s={18} c={sitePalette.primary} /> WhatsApp
          </button>
        </div>

        {/* ----- mobile burger ----- */}
        <button
          aria-label="Menu"
          className="ds-nav-burger"
          onClick={() => setDrawerOpen((o) => !o)}
          style={{
            marginLeft: "auto", width: 44, height: 44, placeItems: "center", border: `1.5px solid ${sitePalette.g300}`,
            background: "#fff", borderRadius: 12, cursor: "pointer", color: sitePalette.ink,
          }}
        >
          <Ic n={drawerOpen ? "x" : "menu"} s={22} />
        </button>
      </div>

      {/* ----- mobile drawer ----- */}
      {drawerOpen && (
        <div
          className="ds-nav-burger"
          style={{
            borderTop: `1px solid ${sitePalette.g300}`, background: "#fff", padding: "10px 16px 18px",
            display: "block", boxShadow: "0 16px 40px rgba(49,46,129,.12)", maxHeight: "calc(100vh - 72px)", overflowY: "auto",
          }}
        >
          <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {NAV.map((i) => {
              const on = isActive(i.href);
              return (
                <Link
                  key={i.href}
                  href={i.href}
                  style={{
                    display: "flex", alignItems: "center", gap: 11,
                    textDecoration: "none", fontFamily: "var(--font-body)", fontSize: 15, fontWeight: 600,
                    padding: "12px 12px", borderRadius: 10,
                    color: on ? sitePalette.primary : sitePalette.g700,
                    background: on ? sitePalette.lilac2 : "transparent",
                  }}
                >
                  <Ic n={i.icon} s={17} c={sitePalette.primary} /> {i.label}
                </Link>
              );
            })}
          </nav>
          <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
            <button
              type="button"
              onClick={avisoContatoExemplo}
              style={{ ...estiloBotaoContato, flex: 1, justifyContent: "center", padding: "12px 16px" }}
            >
              <Ic n="message-circle" s={18} c={sitePalette.primary} /> WhatsApp
            </button>
          </div>
        </div>
      )}
    </header>
    </>
  );
}
