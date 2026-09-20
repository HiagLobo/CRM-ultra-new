"use client";
/**
 * Faixa de abas do painel, uma só para o funil e para as avaliações (O10·S3,
 * revisão): eram dois desenhos iguais copiados, e a cópia já tinha perdido a
 * rolagem suave do celular.
 *
 * No celular as abas rolam na horizontal dentro da própria faixa — a página
 * não estoura para o lado. A aba que pede atenção ganha fundo no número, com a
 * cor do texto escolhida por quem chama (contraste é decisão de cada caso).
 */
import * as React from "react";
import { palette as p } from "@/lib/palette";

export interface OpcaoAba<T extends string> {
  valor: T;
  rotulo: string;
}

export default function FaixaAbas<T extends string>({
  etiqueta,
  idPrefixo,
  controla,
  ativa,
  opcoes,
  contagem,
  alerta,
  aoEscolher,
}: {
  /** Nome da faixa para quem usa leitor de tela ("Etapas do funil"). */
  etiqueta: string;
  /** Prefixo dos ids das abas (o painel aponta para eles com `aria-labelledby`). */
  idPrefixo: string;
  /** id do bloco que a faixa comanda. */
  controla: string;
  ativa: T;
  opcoes: ReadonlyArray<OpcaoAba<T>>;
  contagem: Record<T, number>;
  /** Aba cujo número pede atenção quando não está zerada. */
  alerta?: { valor: T; fundo: string; texto: string };
  aoEscolher: (valor: T) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label={etiqueta}
      style={{
        display: "flex",
        gap: 6,
        overflowX: "auto",
        maxWidth: "100%",
        padding: "2px 2px 8px",
        marginBottom: 10,
        scrollbarWidth: "thin",
        WebkitOverflowScrolling: "touch",
      }}
    >
      {opcoes.map((o) => {
        const selecionada = o.valor === ativa;
        const chamando = !!alerta && o.valor === alerta.valor && contagem[o.valor] > 0;
        return (
          <button
            key={o.valor}
            id={`${idPrefixo}-${o.valor}`}
            type="button"
            role="tab"
            aria-selected={selecionada}
            aria-controls={controla}
            onClick={() => aoEscolher(o.valor)}
            style={{
              flexShrink: 0,
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              border: `1.5px solid ${selecionada ? p.primary : p.g300}`,
              background: selecionada ? p.lilac1 : p.white,
              color: selecionada ? p.dark : p.g700,
              borderRadius: 999,
              padding: "7px 13px",
              fontSize: 13.5,
              fontWeight: 600,
              fontFamily: "var(--font-body)",
              whiteSpace: "nowrap",
              cursor: "pointer",
            }}
          >
            {o.rotulo}
            <span
              style={{
                minWidth: 20,
                textAlign: "center",
                borderRadius: 999,
                padding: "1px 6px",
                fontSize: 12,
                fontWeight: 700,
                background: chamando ? alerta.fundo : "transparent",
                color: chamando ? alerta.texto : selecionada ? p.primary : p.g500,
              }}
            >
              {contagem[o.valor]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
