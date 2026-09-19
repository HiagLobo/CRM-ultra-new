"use client";
/** Faixa final: o último empurrão para pedir o acesso ao demo. */
import * as React from "react";
import { palette as p } from "@/lib/palette";
import { brand } from "@/config/brand";
import { Ic } from "@/components/Icon";
import { BotaoAcessar } from "./botoes";

const PASSOS = [
  "Você informa e-mail, telefone e CRECI",
  "Confirma o código que enviamos por e-mail",
  "Escolhe um dos três painéis e explora",
];

export default function CTAFinal({ onAcessar }: { onAcessar: () => void }) {
  return (
    <section style={{ background: p.deep, color: "#fff" }}>
      <div
        className="ds-pad ds-2col lp-rise"
        style={{
          maxWidth: 1240,
          margin: "0 auto",
          padding: "72px 32px",
          display: "grid",
          gridTemplateColumns: "1.2fr .8fr",
          gap: 40,
          alignItems: "center",
        }}
      >
        <div>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "clamp(26px, 3.4vw, 36px)",
              lineHeight: 1.15,
              margin: 0,
            }}
          >
            Veja o {brand.nomeCurto} funcionando em três minutos
          </h2>
          <p style={{ fontSize: 17, lineHeight: 1.6, color: "rgba(255,255,255,.85)", margin: "14px 0 0", maxWidth: 560 }}>
            Acesso liberado na hora, sem cartão e sem instalar nada.
          </p>
          <div style={{ marginTop: 28 }}>
            <BotaoAcessar onAcessar={onAcessar} grande invertido>
              Acessar CRM
            </BotaoAcessar>
          </div>
        </div>

        <ol style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 14 }}>
          {PASSOS.map((passo, i) => (
            <li key={passo} style={{ display: "flex", alignItems: "center", gap: 13, fontSize: 15.5, color: "rgba(255,255,255,.92)" }}>
              <span
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,.14)",
                  border: "1px solid rgba(255,255,255,.28)",
                  display: "grid",
                  placeItems: "center",
                  fontWeight: 700,
                  fontSize: 14,
                  flexShrink: 0,
                }}
              >
                {i + 1}
              </span>
              {passo}
            </li>
          ))}
          <li style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13.5, color: "rgba(255,255,255,.7)", marginTop: 4 }}>
            <Ic n="shield-check" s={16} c="rgba(255,255,255,.7)" /> Usamos seus dados só para liberar o
            acesso e falar com você.
          </li>
        </ol>
      </div>
    </section>
  );
}
