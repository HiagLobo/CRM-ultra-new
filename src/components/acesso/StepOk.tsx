"use client";
/** Passo 3 — acesso liberado: escolha por qual dos três painéis começar. */
import * as React from "react";
import { palette as p } from "@/lib/palette";
import { brand } from "@/config/brand";
import { Ic } from "@/components/Icon";
import EscolhaPainel from "./EscolhaPainel";

export default function StepOk({ aoFechar }: { aoFechar: () => void }) {
  return (
    <div style={{ display: "grid", gap: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span
          style={{
            width: 46,
            height: 46,
            borderRadius: "50%",
            background: `${p.success}1A`,
            display: "grid",
            placeItems: "center",
            flexShrink: 0,
          }}
        >
          <Ic n="check-circle-2" s={24} c={p.success} />
        </span>
        <p style={{ fontSize: 14.5, lineHeight: 1.55, color: p.g700, margin: 0 }}>
          E-mail confirmado. A demonstração do {brand.nomeCurto} está liberada — escolha por onde
          começar.
        </p>
      </div>

      <EscolhaPainel aoEscolher={aoFechar} />

      <p style={{ fontSize: 12.5, color: p.g500, margin: 0 }}>
        Você pode voltar e testar os outros painéis quando quiser, pelo{" "}
        <strong style={{ color: p.g700 }}>Entrar</strong> do site.
      </p>
    </div>
  );
}
