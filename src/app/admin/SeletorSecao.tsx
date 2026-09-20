"use client";
/**
 * Troca entre as duas seções do painel: **Leads** (o funil) e **Avaliações**
 * (o que o pessoal escreveu no demo). Mesmo desenho das abas do funil, num
 * nível acima — e com o número do que espera conferência, para não passar batido.
 */
import * as React from "react";
import { palette as p } from "@/lib/palette";
import { Ic } from "@/components/Icon";

export type Secao = "leads" | "avaliacoes";

const SECOES: ReadonlyArray<{ valor: Secao; rotulo: string; icone: string }> = [
  { valor: "leads", rotulo: "Leads", icone: "users" },
  { valor: "avaliacoes", rotulo: "Avaliações", icone: "star" },
];

export default function SeletorSecao({
  ativa,
  paraConferir,
  aoEscolher,
}: {
  ativa: Secao;
  /** Quantas avaliações o filtro automático segurou (0 esconde o número). */
  paraConferir: number;
  aoEscolher: (secao: Secao) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Seções do painel"
      style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}
    >
      {SECOES.map((s) => {
        const selecionada = s.valor === ativa;
        const alerta = s.valor === "avaliacoes" && paraConferir > 0;
        return (
          <button
            key={s.valor}
            type="button"
            role="tab"
            aria-selected={selecionada}
            aria-controls={`secao-${s.valor}`}
            onClick={() => aoEscolher(s.valor)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              border: `1.5px solid ${selecionada ? p.primary : p.g300}`,
              background: selecionada ? p.primary : p.white,
              color: selecionada ? p.white : p.g700,
              borderRadius: 999,
              padding: "9px 16px",
              fontSize: 14,
              fontWeight: 700,
              fontFamily: "var(--font-body)",
              cursor: "pointer",
            }}
          >
            <Ic n={s.icone} s={16} c={selecionada ? p.white : p.g700} />
            {s.rotulo}
            {alerta && (
              <span
                style={{
                  minWidth: 20,
                  textAlign: "center",
                  borderRadius: 999,
                  padding: "1px 7px",
                  fontSize: 12,
                  fontWeight: 700,
                  background: p.warning,
                  color: p.white,
                }}
                title="Avaliações que o filtro automático segurou"
              >
                {paraConferir}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
