"use client";
/**
 * Troca entre as duas seções do painel: **Leads** (o funil) e **Avaliações**
 * (o que o pessoal escreveu no demo). Mesmo desenho das abas do funil, num
 * nível acima, com o número do que espera conferência para não passar batido.
 *
 * Revisão da O10·S3: o número usa texto escuro sobre o amarelo (branco sobre
 * amarelo fica ilegível), e quando a lista de avaliações NÃO carrega o seletor
 * diz isso — antes, a falha virava um silêncio: nenhum número, nenhum aviso.
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
  falhou,
  aoEscolher,
}: {
  ativa: Secao;
  /** Quantas avaliações o filtro automático segurou (0 esconde o número). */
  paraConferir: number;
  /** A lista de avaliações não carregou: o seletor avisa em vez de ficar mudo. */
  falhou: boolean;
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
        const problema = s.valor === "avaliacoes" && falhou;
        const alerta = s.valor === "avaliacoes" && !falhou && paraConferir > 0;
        return (
          <button
            key={s.valor}
            id={`secao-aba-${s.valor}`}
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
            {(alerta || problema) && (
              <span
                style={{
                  minWidth: 20,
                  textAlign: "center",
                  borderRadius: 999,
                  padding: "1px 7px",
                  fontSize: 12,
                  fontWeight: 700,
                  background: problema ? p.error : p.warning,
                  color: problema ? p.white : p.ink,
                }}
                title={problema ? "Não deu para carregar as avaliações" : "Avaliações que o filtro automático segurou"}
              >
                {problema ? "!" : paraConferir}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
