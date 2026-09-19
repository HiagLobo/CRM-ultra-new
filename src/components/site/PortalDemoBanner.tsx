"use client";
/**
 * Faixa do portal de imóveis dentro do demo.
 *
 * Resolve duas coisas que faltavam:
 * 1. **Honestidade** — o portal mostra 8 anúncios com preço e foto. Sem aviso,
 *    quem cai direto em `/demo/portal` pensa que são imóveis à venda de verdade.
 * 2. **Saída** — a navegação do portal só aponta para o próprio portal; quem
 *    entrava ficava preso lá, sem caminho de volta para o CRM.
 *
 * Some junto com `brand.demoMode`, quando isto virar o site real de um cliente.
 */
import * as React from "react";
import Link from "next/link";
import { palette as p } from "@/lib/palette";
import { brand } from "@/config/brand";
import { Ic } from "@/components/Icon";

export default function PortalDemoBanner() {
  if (!brand.demoMode) return null;

  return (
    <div
      role="status"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        flexWrap: "wrap",
        background: p.lilac1,
        borderBottom: `1px solid ${p.lilac2}`,
        color: p.dark,
        padding: "8px 16px",
        fontSize: 13.5,
        fontFamily: "var(--font-body)",
      }}
    >
      <Ic n="building" s={16} c={p.primary} />
      <span>
        <strong style={{ fontWeight: 700 }}>Site de exemplo</strong> — é assim que a carteira de uma
        imobiliária aparece para o público no {brand.nomeCurto}. Tudo aqui é fictício: a imobiliária,
        os imóveis e os preços; as fotos são ilustrativas.
      </span>
      <Link
        href="/"
        style={{
          marginLeft: "auto",
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          color: p.primary,
          fontWeight: 700,
          fontSize: 13.5,
          textDecoration: "none",
          whiteSpace: "nowrap",
        }}
      >
        Voltar ao {brand.nomeCurto} <Ic n="arrow-right" s={15} c={p.primary} />
      </Link>
    </div>
  );
}
