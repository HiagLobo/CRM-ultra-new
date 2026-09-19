"use client";
import * as React from "react";
import Link from "next/link";
import { palette as sitePalette } from "@/lib/palette";
import { Ic } from "@/components/Icon";
import { brand } from "@/config/brand";
import { demo, emailDemo } from "@/config/demo";
import MarcaDemo from "./MarcaDemo";
import type { Imovel } from "@/types";

export interface PropertyCardProps {
  p: Imovel;
  /** modo controlado (home/buscar): coração salva nos favoritos de verdade */
  favorited?: boolean;
  onToggleFav?: (p: Imovel) => void;
  /** modo controlado: seleção para comparar (barra flutuante) */
  compared?: boolean;
  onToggleCompare?: (p: Imovel) => void;
}

/* ---------------- PROPERTY CARD ----------------
   Ref/DOM-driven gallery (arrows + dots + swipe). */
export function PropertyCard({ p, favorited, onToggleFav, compared, onToggleCompare }: PropertyCardProps) {
  const photos = p.photos || [
    "linear-gradient(135deg,#E0E7FF,#A5B4FC)",
    "linear-gradient(135deg,#C7D2FE,#818CF8)",
    "linear-gradient(135deg,#d8cae3,#b89bd0)",
  ];
  const rootRef = React.useRef<HTMLDivElement>(null);
  const idxRef = React.useRef(0);
  const favRef = React.useRef(p.fav || false);

  const go = (dir: number, abs?: number | null) => {
    const root = rootRef.current;
    if (!root) return;
    const n = photos.length;
    let i = abs != null ? abs : idxRef.current + dir;
    i = (i + n) % n;
    idxRef.current = i;
    const track = root.querySelector<HTMLElement>(".ds-track");
    if (track) track.style.transform = `translateX(${-i * 100}%)`;
    root.querySelectorAll<HTMLElement>(".ds-dot").forEach((d, di) => {
      d.style.background = di === i ? "#fff" : "rgba(255,255,255,.55)";
      d.style.width = di === i ? "18px" : "7px";
    });
  };

  /* modo não-controlado (cosmético, como no design original) */
  const toggleFavLocal = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    favRef.current = !favRef.current;
    const btn = e.currentTarget;
    const svg = btn.querySelector("svg");
    if (svg) (svg as SVGElement).style.fill = favRef.current ? sitePalette.primary : "transparent";
    btn.style.background = favRef.current ? sitePalette.lilac2 : "rgba(255,255,255,.92)";
  };

  // swipe
  const startX = React.useRef<number | null>(null);
  const onDown = (e: React.MouseEvent | React.TouchEvent) => {
    startX.current = "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
  };
  const onUp = (e: React.MouseEvent | React.TouchEvent) => {
    if (startX.current == null) return;
    const x = "changedTouches" in e ? e.changedTouches[0].clientX : (e as React.MouseEvent).clientX;
    const dx = x - startX.current;
    if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
    startX.current = null;
  };

  return (
    <div className="ds-pcard" ref={rootRef}>
      <div className="ds-gallery" onMouseDown={onDown} onMouseUp={onUp} onTouchStart={onDown} onTouchEnd={onUp}>
        <div className="ds-track">
          {photos.map((bg, i) => (
            <div key={i} className="ds-slide" style={{ background: bg }} />
          ))}
        </div>
        <span style={{ position: "absolute", top: 12, left: 12, background: sitePalette.primary, color: "#fff", fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 999, zIndex: 3 }}>Cód: {p.code}</span>
        {onToggleFav ? (
          <button
            onClick={(e) => { e.stopPropagation(); onToggleFav(p); }}
            aria-label={favorited ? "Remover dos favoritos" : "Favoritar"}
            title={favorited ? "Remover dos favoritos" : "Favoritar"}
            style={{
              position: "absolute", top: 12, right: 12, width: 34, height: 34, border: "none", zIndex: 3,
              background: favorited ? sitePalette.lilac2 : "rgba(255,255,255,.92)", borderRadius: "50%",
              display: "grid", placeItems: "center", cursor: "pointer",
            }}
          >
            <Ic n="heart" s={18} c={sitePalette.primary} style={{ fill: favorited ? sitePalette.primary : "transparent" }} />
          </button>
        ) : (
          <button onClick={toggleFavLocal} aria-label="Favoritar" style={{
            position: "absolute", top: 12, right: 12, width: 34, height: 34, border: "none", zIndex: 3,
            background: "rgba(255,255,255,.92)", borderRadius: "50%", display: "grid", placeItems: "center", cursor: "pointer",
          }}>
            <Ic n="heart" s={18} c={sitePalette.primary} style={{ fill: p.fav ? sitePalette.primary : "transparent" }} />
          </button>
        )}
        {p.tag && <span style={{ position: "absolute", bottom: 12, left: 12, background: p.tag === "Destaque" ? sitePalette.primary : "#fff", color: p.tag === "Destaque" ? "#fff" : sitePalette.ink, fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 999, zIndex: 3 }}>{p.tag}</span>}

        <button className="ds-arrow l" onClick={(e) => { e.stopPropagation(); go(-1); }} aria-label="Anterior">
          <Ic n="chevron-left" s={20} c={sitePalette.ink} />
        </button>
        <button className="ds-arrow r" onClick={(e) => { e.stopPropagation(); go(1); }} aria-label="Próxima">
          <Ic n="chevron-right" s={20} c={sitePalette.ink} />
        </button>
        <div style={{ position: "absolute", bottom: 12, right: 12, display: "flex", gap: 5, alignItems: "center", zIndex: 3 }}>
          {photos.map((_, i) => (
            <span key={i} className="ds-dot" onClick={(e) => { e.stopPropagation(); go(0, i); }}
              style={{ width: i === 0 ? 18 : 7, background: i === 0 ? "#fff" : "rgba(255,255,255,.55)" }} />
          ))}
        </div>
      </div>
      <div style={{ padding: "14px 16px 16px" }}>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 21, color: sitePalette.ink }}>{p.price}</div>
        <div style={{ fontWeight: 600, fontSize: 14, color: sitePalette.ink, marginTop: 4 }}>{p.title}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 5, color: sitePalette.g500, fontSize: 13, marginTop: 4 }}>
          <Ic n="map-pin" s={14} /> {p.location}
        </div>
        <div style={{ display: "flex", gap: 16, color: sitePalette.g700, fontSize: 13, marginTop: 12, paddingTop: 12, borderTop: `1px solid ${sitePalette.g100}` }}>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}><Ic n="bed-double" s={15} /> {p.beds}</span>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}><Ic n="bath" s={15} /> {p.baths}</span>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}><Ic n="ruler" s={15} /> {p.area} m²</span>
          {onToggleCompare ? (
            <span
              onClick={() => onToggleCompare(p)}
              title={compared ? "Tirar da comparação" : "Selecionar para comparar"}
              style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 5, color: sitePalette.primary, fontWeight: 600, cursor: "pointer" }}
            >
              <Ic n={compared ? "check-circle-2" : "git-compare"} s={15} /> {compared ? "Selecionado" : "Comparar"}
            </span>
          ) : (
            <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 5, color: sitePalette.primary, fontWeight: 600, cursor: "pointer" }}><Ic n="git-compare" s={15} /> Comparar</span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------- BENEFITS ---------------- */
export function BenefitsRow() {
  const items: [string, string, string][] = [
    ["shield-check", "Imóveis verificados", "Cada anúncio é checado pela nossa equipe antes de ir ao ar."],
    ["handshake", "Sem burocracia", "Da visita à assinatura, um processo guiado e seguro."],
    ["lock", "Pagamento protegido", "Transações com garantia em todas as etapas."],
  ];
  return (
    <div className="ds-cards" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 22 }}>
      <style>{`
        @keyframes dsRise { from { opacity: 0; transform: translateY(26px); } to { opacity: 1; transform: none; } }
        .ds-benefit {
          position: relative; background: #fff; border-radius: 18px; border: 1px solid ${sitePalette.g300};
          padding: 30px 26px 28px; overflow: hidden; opacity: 0;
          animation: dsRise .7s cubic-bezier(.2,.7,.3,1) both;
          transition: transform .45s cubic-bezier(.2,.7,.3,1), box-shadow .35s ease, border-color .35s ease;
        }
        .ds-benefit:nth-child(2) { animation-delay: .12s; }
        .ds-benefit:nth-child(3) { animation-delay: .24s; }
        .ds-benefit:hover { transform: translateY(-6px); box-shadow: 0 20px 44px rgba(49,46,129,.14); border-color: ${sitePalette.lilac2}; }
        .ds-accent {
          position: absolute; top: 0; left: 0; height: 3px; width: 100%;
          background: linear-gradient(90deg, ${sitePalette.primary}, ${sitePalette.light});
          transform: scaleX(0); transform-origin: left; transition: transform .45s cubic-bezier(.2,.7,.3,1);
        }
        .ds-benefit:hover .ds-accent { transform: scaleX(1); }
        .ds-bicon {
          width: 54px; height: 54px; border-radius: 14px; display: grid; place-items: center; margin-bottom: 18px;
          background: ${sitePalette.lilac2}; color: ${sitePalette.primary};
          transition: background .4s cubic-bezier(.2,.7,.3,1), color .4s ease, transform .4s cubic-bezier(.2,.7,.3,1), box-shadow .4s ease;
        }
        .ds-benefit:hover .ds-bicon {
          background: linear-gradient(135deg, ${sitePalette.primary}, ${sitePalette.light}); color: #fff;
          transform: translateY(-2px); box-shadow: 0 8px 20px rgba(79,70,229,.32);
        }
        @media (prefers-reduced-motion: reduce) { .ds-benefit { animation: none; opacity: 1; } }
      `}</style>
      {items.map(([ic, t, b]) => (
        <div className="ds-benefit" key={t}>
          <div className="ds-accent"></div>
          <div className="ds-bicon"><Ic n={ic} s={24} c="currentColor" /></div>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 19, color: sitePalette.ink }}>{t}</div>
          <div style={{ color: sitePalette.g700, fontSize: 14.5, lineHeight: 1.55, marginTop: 8 }}>{b}</div>
        </div>
      ))}
    </div>
  );
}

/* ---------------- FOOTER ----------------
   Rodapé do site de EXEMPLO: identidade da rede fictícia (demo.*). A empresa
   real (brand) aparece só como quem fez o CRM — nunca como imobiliária, e sem
   CNPJ/contato, que não têm nada a ver com os imóveis fictícios. */
export function SiteFooter() {
  const navCol = (title: string, links: { label: string; href: string }[]) => (
    <div>
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: "rgba(255,255,255,.55)", marginBottom: 16 }}>{title}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
        {links.map((l) => (
          <Link key={l.label} href={l.href} style={{ fontSize: 14, color: "rgba(255,255,255,.85)", textDecoration: "none", cursor: "pointer" }}>{l.label}</Link>
        ))}
      </div>
    </div>
  );
  const contato: [string, string][] = [
    ["phone", demo.telefone],
    ["mail", emailDemo("contato")],
  ];
  return (
    <footer style={{ background: sitePalette.deep, color: "#fff" }}>
      <div className="ds-pad ds-2col" style={{ maxWidth: 1240, margin: "0 auto", padding: "56px 32px 32px", display: "grid", gridTemplateColumns: "1.7fr 1fr 1fr", gap: 48 }}>
        <div>
          <MarcaDemo claro />
          <p style={{ fontSize: 13.5, color: "rgba(255,255,255,.72)", margin: "16px 0 0", maxWidth: 360, lineHeight: 1.55 }}>
            Imobiliária fictícia do site de exemplo. Os contatos abaixo são ilustrativos e não recebem mensagens.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 320, marginTop: 16 }}>
            {contato.map(([ic, txt]) => (
              <div key={ic} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 13.5, color: "rgba(255,255,255,.82)", lineHeight: 1.5 }}>
                <span style={{ flexShrink: 0, marginTop: 1 }}><Ic n={ic} s={16} c="rgba(255,255,255,.6)" /></span>
                <span>{txt}</span>
              </div>
            ))}
          </div>
        </div>
        {navCol("Imóveis", [
          { label: "Home", href: "/demo/portal" },
          { label: "Buscar imóvel", href: "/demo/buscar" },
        ])}
        {navCol("Sua seleção", [
          { label: "Favoritos", href: "/demo/favoritos" },
          { label: "Comparar", href: "/demo/comparar" },
        ])}
      </div>
      <div className="ds-pad" style={{ maxWidth: 1240, margin: "0 auto", padding: "20px 32px", borderTop: "1px solid rgba(255,255,255,.15)", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, fontSize: 13, color: "rgba(255,255,255,.6)" }}>
        <span>{demo.nome}: site de exemplo com dados fictícios</span>
        <Link href="/" style={{ color: "rgba(255,255,255,.85)", textDecoration: "none", fontWeight: 600 }}>
          Feito com {brand.nome}
        </Link>
      </div>
    </footer>
  );
}
