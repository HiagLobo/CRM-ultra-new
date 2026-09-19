"use client";
/**
 * Fundo decorativo das faixas do portal — gradiente da paleta + textura vetorial.
 *
 * Existe porque as fotos originais dessas faixas traziam a marca do cliente
 * antigo (e, em duas delas, o rosto e o nome de duas pessoas reais). Foram
 * removidas do repositório. Isto ocupa o mesmo espaço sem depender de imagem de
 * terceiro: escala em qualquer tamanho, pesa ~1 KB e acompanha a paleta.
 */
import * as React from "react";
import { palette as p } from "@/lib/palette";

export default function FundoMarca({
  variante = "noite",
  children,
  style,
}: {
  /** `noite`: banda escura (heros). `claro`: bloco suave (cartões e CTAs). */
  variante?: "noite" | "claro";
  children?: React.ReactNode;
  style?: React.CSSProperties;
}) {
  const escuro = variante === "noite";
  const traco = escuro ? "rgba(255,255,255,.07)" : "rgba(79,70,229,.09)";

  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        background: escuro
          ? `linear-gradient(120deg, ${p.deep} 0%, ${p.dark} 52%, ${p.primary} 100%)`
          : `linear-gradient(120deg, ${p.lilac1} 0%, ${p.lilac2} 100%)`,
        ...style,
      }}
    >
      {/* silhueta de skyline + brilho: puro SVG, sem arquivo externo */}
      <svg
        aria-hidden="true"
        viewBox="0 0 1200 400"
        preserveAspectRatio="xMidYMax slice"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      >
        <defs>
          <linearGradient id="fm-brilho" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={escuro ? p.light : p.primary} stopOpacity={escuro ? 0.35 : 0.18} />
            <stop offset="70%" stopColor={escuro ? p.deep : p.lilac1} stopOpacity="0" />
          </linearGradient>
        </defs>
        <circle cx="980" cy="70" r="260" fill="url(#fm-brilho)" />
        <g fill={traco}>
          {/* prédios: alturas fixas para o desenho ser estável entre servidor e cliente */}
          {[
            [40, 250], [96, 190], [150, 300], [214, 150], [268, 235], [330, 120],
            [386, 275], [450, 165], [508, 215], [570, 130], [628, 260], [690, 180],
            [750, 305], [812, 145], [872, 230], [934, 175], [996, 285], [1058, 200],
            [1120, 245],
          ].map(([x, h]) => (
            <rect key={x} x={x} y={400 - h!} width="38" height={h} rx="3" />
          ))}
        </g>
      </svg>
      {children}
    </div>
  );
}
