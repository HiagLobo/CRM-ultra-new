"use client";
/**
 * Navbar da landing de marketing: logo, âncoras das seções e o CTA "Acessar CRM".
 * Separada da `SiteNavbar` (que é a navegação do portal de imóveis, agora sob o
 * demo): outra navegação, outro objetivo — juntar as duas viraria um componente
 * com dois modos. Reusa as classes ds-nav-* do globals.css para o mobile.
 */
import * as React from "react";
import Link from "next/link";
import { palette as p } from "@/lib/palette";
import { brand } from "@/config/brand";
import { Ic } from "@/components/Icon";
import { BotaoAcessar } from "./botoes";

export const ANCORAS: { label: string; href: string }[] = [
  { label: "Recursos", href: "#recursos" },
  { label: "Para quem", href: "#publico" },
  { label: "Site de imóveis", href: "#site" },
  { label: "Planos", href: "#planos" },
];

export default function LandingNav({ onAcessar }: { onAcessar: () => void }) {
  const [drawerAberto, setDrawerAberto] = React.useState(false);

  const link: React.CSSProperties = {
    textDecoration: "none",
    whiteSpace: "nowrap",
    fontFamily: "var(--font-body)",
    fontSize: 14,
    fontWeight: 600,
    padding: "8px 12px",
    borderRadius: 8,
    color: p.g700,
  };

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(255,255,255,.88)",
        backdropFilter: "blur(10px)",
        borderBottom: `1px solid ${p.g300}`,
      }}
    >
      <div
        className="ds-pad"
        style={{
          maxWidth: 1240,
          margin: "0 auto",
          padding: "0 32px",
          height: 72,
          display: "flex",
          alignItems: "center",
          gap: 24,
        }}
      >
        <Link href="/" style={{ display: "flex", flexShrink: 0 }} aria-label={brand.nome}>
          <img src="/assets/logo.svg" alt={brand.nome} style={{ height: 52, display: "block" }} />
        </Link>

        <nav className="ds-nav-desktop" style={{ gap: 4, marginLeft: 8 }}>
          {ANCORAS.map((a) => (
            <a key={a.href} href={a.href} className="ds-navlink" style={link}>
              {a.label}
            </a>
          ))}
        </nav>

        <div className="ds-nav-desktop" style={{ marginLeft: "auto", alignItems: "center", gap: 10 }}>
          <Link href="/login" className="ds-navlink" style={link}>
            Já tenho acesso
          </Link>
          <BotaoAcessar onAcessar={onAcessar} />
        </div>

        <button
          aria-label="Menu"
          aria-expanded={drawerAberto}
          className="ds-nav-burger"
          onClick={() => setDrawerAberto((o) => !o)}
          style={{
            marginLeft: "auto",
            width: 44,
            height: 44,
            placeItems: "center",
            border: `1.5px solid ${p.g300}`,
            background: "#fff",
            borderRadius: 12,
            cursor: "pointer",
            color: p.ink,
          }}
        >
          <Ic n={drawerAberto ? "x" : "menu"} s={22} />
        </button>
      </div>

      {drawerAberto && (
        <div
          className="ds-nav-burger"
          style={{
            borderTop: `1px solid ${p.g300}`,
            background: "#fff",
            padding: "10px 16px 18px",
            display: "block",
            boxShadow: "0 16px 40px rgba(49,46,129,.12)",
          }}
        >
          <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {ANCORAS.map((a) => (
              <a
                key={a.href}
                href={a.href}
                onClick={() => setDrawerAberto(false)}
                style={{ ...link, fontSize: 15, padding: "12px" }}
              >
                {a.label}
              </a>
            ))}
            <Link
              href="/login"
              onClick={() => setDrawerAberto(false)}
              style={{ ...link, fontSize: 15, padding: "12px" }}
            >
              Já tenho acesso
            </Link>
          </nav>
          <div style={{ marginTop: 12 }}>
            <BotaoAcessar
              onAcessar={() => {
                setDrawerAberto(false);
                onAcessar();
              }}
            />
          </div>
        </div>
      )}
    </header>
  );
}
