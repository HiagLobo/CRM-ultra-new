"use client";
/**
 * Faixa fina no topo do painel: deixa claro que é demonstração e que os dados
 * são inventados. Fica **no fluxo** (não é `fixed`) de propósito — assim empurra
 * o conteúdo em vez de cobrir a topbar do painel.
 *
 * O8·S3: o destaque é o "Quero usar no meu time" (botão preenchido, abre o
 * WhatsApp comercial). No celular os textos encurtam e as ações descem para uma
 * segunda linha, alinhadas à direita — a faixa fica mais baixa que antes e
 * continua sem cobrir nada. Só CSS (media query): nada de `window` no render.
 */
import * as React from "react";
import { palette as p } from "@/lib/palette";
import { brand } from "@/config/brand";
import { Ic } from "@/components/Icon";
import { BotaoQueroUsar, ROTULO_QUERO_USAR } from "@/components/acesso/QueroUsar";

/** Largura (px) em que os textos encurtam e as ações vão para a segunda linha. */
export const LARGURA_CELULAR_BANNER = 720;

export const CSS_BANNER = `
.db-curto { display: none; }
@media (max-width: ${LARGURA_CELULAR_BANNER}px) {
  .db-longo { display: none; }
  .db-curto { display: inline; }
  .db-faixa { padding: 8px 12px !important; }
  .db-acoes { order: 3; flex-basis: 100%; justify-content: flex-end; }
}`;

/** Texto completo na tela larga, curto no celular — as duas versões no HTML, o CSS escolhe. */
function Rotulo({ longo, curto }: { longo: React.ReactNode; curto: React.ReactNode }) {
  return (
    <>
      <span className="db-longo">{longo}</span>
      <span className="db-curto">{curto}</span>
    </>
  );
}

export default function DemoBanner({
  aoSaberMais,
  aoFechar,
}: {
  aoSaberMais: () => void;
  aoFechar: () => void;
}) {
  return (
    <div
      role="status"
      className="db-faixa"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px 12px",
        flexWrap: "wrap",
        flexShrink: 0,
        background: p.lilac1,
        borderBottom: `1px solid ${p.lilac2}`,
        color: p.dark,
        padding: "8px 16px",
        fontSize: 13.5,
        fontFamily: "var(--font-body)",
      }}
    >
      <style>{CSS_BANNER}</style>
      <span style={{ display: "flex", alignItems: "center", gap: 10, flex: "1 1 260px", minWidth: 0 }}>
        <span style={{ flexShrink: 0, display: "grid" }}>
          <Ic n="sparkles" s={16} c={p.primary} />
        </span>
        <Rotulo
          longo={
            <>
              <strong style={{ fontWeight: 700 }}>Modo demonstração</strong> — você está explorando o{" "}
              {brand.nomeCurto} com dados fictícios. Nada aqui é de cliente real.
            </>
          }
          curto={
            <>
              <strong style={{ fontWeight: 700 }}>Modo demonstração</strong> · dados fictícios
            </>
          }
        />
      </span>

      <div className="db-acoes" style={{ display: "flex", alignItems: "center", gap: 12, marginLeft: "auto" }}>
        <button
          type="button"
          onClick={aoSaberMais}
          style={{
            background: "none",
            border: "none",
            padding: 0,
            color: p.primary,
            fontWeight: 700,
            fontSize: 13.5,
            fontFamily: "var(--font-body)",
            cursor: "pointer",
            textDecoration: "underline",
            whiteSpace: "nowrap",
          }}
        >
          <Rotulo longo="Como usar este painel" curto="Como usar" />
        </button>
        <BotaoQueroUsar compacto>
          <Rotulo longo={ROTULO_QUERO_USAR} curto="Quero usar" />
        </BotaoQueroUsar>
      </div>

      <button
        type="button"
        aria-label="Ocultar aviso de demonstração"
        onClick={aoFechar}
        style={{
          background: "none",
          border: "none",
          padding: 4,
          cursor: "pointer",
          color: p.g500,
          display: "grid",
          placeItems: "center",
          flexShrink: 0,
        }}
      >
        <Ic n="x" s={16} c={p.g500} />
      </button>
    </div>
  );
}
