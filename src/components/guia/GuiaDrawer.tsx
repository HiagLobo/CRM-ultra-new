"use client";
/**
 * Guia contextual: painel lateral com dicas da tela em que a pessoa está.
 *
 * Não bloqueia a navegação de propósito — sem fundo escurecido, o visitante lê a
 * dica e continua clicando no painel atrás. Rota sem dica própria cai nos passos
 * gerais do painel, então o guia nunca abre vazio.
 */
import * as React from "react";
import { usePathname } from "next/navigation";
import { palette as p } from "@/lib/palette";
import { Ic } from "@/components/Icon";
import { GUIA, secaoDaRota, type Painel } from "@/content/guia";

export default function GuiaDrawer({
  painel,
  aoFechar,
  aoRefazerTour,
}: {
  painel: Painel;
  aoFechar: () => void;
  /** Só aparece nas telas que têm tour. */
  aoRefazerTour?: () => void;
}) {
  const pathname = usePathname();
  const secao = secaoDaRota(pathname);
  const guia = GUIA[painel];

  const titulo = secao ? secao.titulo : guia.nome;
  const dicas = secao ? secao.dicas : guia.passos.map((s) => `${s.titulo}: ${s.texto}`);

  const fechar = React.useRef(aoFechar);
  fechar.current = aoFechar;
  React.useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape") fechar.current();
    };
    document.addEventListener("keydown", aoTeclar);
    return () => document.removeEventListener("keydown", aoTeclar);
  }, []);

  return (
    <aside
      aria-label="Guia da tela"
      style={{
        position: "fixed",
        right: 16,
        bottom: 84,
        zIndex: 250,
        width: "min(340px, calc(100vw - 32px))",
        maxHeight: "min(60vh, 520px)",
        overflowY: "auto",
        background: "#fff",
        border: `1px solid ${p.g300}`,
        borderRadius: 16,
        boxShadow: "0 24px 60px rgba(20,6,38,.28)",
        fontFamily: "var(--font-body)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "16px 16px 12px",
          borderBottom: `1px solid ${p.g100}`,
          position: "sticky",
          top: 0,
          background: "#fff",
        }}
      >
        <span style={{ width: 32, height: 32, borderRadius: 10, background: p.lilac1, display: "grid", placeItems: "center", flexShrink: 0 }}>
          <Ic n="help-circle" s={17} c={p.primary} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: p.g500 }}>
            Guia
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15.5, color: p.ink, lineHeight: 1.25 }}>
            {titulo}
          </div>
        </div>
        <button
          type="button"
          aria-label="Fechar guia"
          onClick={aoFechar}
          style={{ background: "none", border: "none", padding: 4, cursor: "pointer", display: "grid", placeItems: "center", flexShrink: 0 }}
        >
          <Ic n="x" s={17} c={p.g500} />
        </button>
      </div>

      <ul style={{ listStyle: "none", margin: 0, padding: "14px 16px 16px", display: "grid", gap: 12 }}>
        {dicas.map((dica) => (
          <li key={dica} style={{ display: "flex", gap: 9, fontSize: 13.5, lineHeight: 1.55, color: p.g700 }}>
            <span style={{ flexShrink: 0, marginTop: 3 }}>
              <Ic n="check-circle-2" s={14} c={p.primary} />
            </span>
            {dica}
          </li>
        ))}
      </ul>

      {!secao && (
        <div style={{ padding: "0 16px 16px", fontSize: 12, color: p.g500 }}>
          Esta tela ainda não tem dicas próprias — acima estão os passos gerais do painel.
        </div>
      )}

      {aoRefazerTour && (
        <div style={{ padding: "0 16px 16px" }}>
          <button
            type="button"
            onClick={aoRefazerTour}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              border: `1.5px solid ${p.g300}`,
              background: "#fff",
              color: p.primary,
              borderRadius: 999,
              padding: "10px 16px",
              fontSize: 13.5,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "var(--font-body)",
            }}
          >
            <Ic n="repeat" s={15} c={p.primary} /> Refazer o tour desta tela
          </button>
        </div>
      )}
    </aside>
  );
}
