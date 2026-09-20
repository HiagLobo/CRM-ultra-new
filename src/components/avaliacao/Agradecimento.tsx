"use client";
/**
 * Depois de enviar: a pessoa vê a contagem subir com a própria nota (F5) e,
 * quando o texto caiu para conferência (`pendente`), fica sabendo — nota na
 * média na hora, comentário no site depois da olhada do fundador.
 *
 * Sem resumo do servidor (resposta sem os números), o agradecimento não inventa
 * média nenhuma: agradece e pronto.
 */
import * as React from "react";
import { palette as p } from "@/lib/palette";
import { Ic } from "@/components/Icon";
import { notaEmTexto } from "@/content/depoimentos";
import { Aviso } from "@/components/acesso/ui";
import { EstrelasNota } from "./Estrelas";
import type { Resumo } from "./api";

export default function Agradecimento({
  resumo,
  pendente,
  aoFechar,
}: {
  resumo: Resumo | null;
  /** O comentário ficou para conferência (filtro automático pegou algo). */
  pendente: boolean;
  aoFechar: () => void;
}) {
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span
          style={{ width: 42, height: 42, borderRadius: 12, background: p.lilac1, display: "grid", placeItems: "center", flexShrink: 0 }}
        >
          <Ic n="check-circle-2" s={21} c={p.success} />
        </span>
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.55, color: p.ink }}>
          {resumo ? (
            <>
              Sua nota entrou: agora são <strong>{resumo.quantas}</strong>{" "}
              {resumo.quantas === 1 ? "avaliação" : "avaliações"}, média{" "}
              <strong>{notaEmTexto(resumo.media)}</strong>.
            </>
          ) : (
            <>Sua nota entrou. Obrigado por testar a demonstração!</>
          )}
        </p>
      </div>

      {resumo && (
        <div style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 13.5, color: p.g700 }}>
          <EstrelasNota nota={resumo.media} rotulo={`média de ${notaEmTexto(resumo.media)} estrelas`} tamanho={18} />
          <span>média de quem testou a demonstração</span>
        </div>
      )}

      {pendente && (
        <Aviso tipo="info">
          Seu comentário ficou para uma conferência rápida antes de ir ao site. Sua nota já está contando na média.
        </Aviso>
      )}

      <button
        type="button"
        onClick={aoFechar}
        autoFocus
        className="ds-btnpop"
        style={{
          width: "100%",
          border: "none",
          borderRadius: 999,
          padding: "13px 24px",
          background: p.primary,
          color: "#fff",
          fontFamily: "var(--font-body)",
          fontWeight: 700,
          fontSize: 15,
          cursor: "pointer",
        }}
      >
        Voltar para o demo
      </button>
    </div>
  );
}
