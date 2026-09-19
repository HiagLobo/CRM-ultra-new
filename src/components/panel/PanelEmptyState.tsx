"use client";
import * as React from "react";
import { palette as P } from "@/lib/palette";
import { Icon } from "@/components/Icon";

/**
 * Placeholder "em breve" — exatamente como no design. Usado nas subpáginas
 * dos painéis que ainda não têm tela desenhada.
 */
export default function PanelEmptyState({ label, hint }: { label: string; hint?: React.ReactNode }) {
  return (
    <div style={{ display: "grid", placeItems: "center", minHeight: 460 }}>
      <div style={{ textAlign: "center", maxWidth: 380 }}>
        <div style={{ width: 60, height: 60, borderRadius: 16, background: P.lilac2, display: "grid", placeItems: "center", margin: "0 auto 16px" }}>
          <Icon n="hammer" s={28} c={P.primary} />
        </div>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, color: P.ink }}>{label} em breve</div>
        <div style={{ fontSize: 14, color: P.g500, marginTop: 6, lineHeight: 1.55 }}>
          {hint || <>Esta tela será desenhada na sequência.</>}
        </div>
      </div>
    </div>
  );
}
