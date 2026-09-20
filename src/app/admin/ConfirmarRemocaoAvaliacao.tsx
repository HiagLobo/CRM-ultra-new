"use client";
/**
 * Tirar do site é o único caminho que apaga alguma coisa da vista do público —
 * por isso confirma (publicar de volta não confirma: não estraga nada).
 * O foco começa em "Cancelar". Falha aparece aqui mesmo.
 */
import * as React from "react";
import { palette as p } from "@/lib/palette";
import { estrelasEmTexto } from "@/features/avaliacao/avaliacao";
import type { AvaliacaoAdmin } from "@/features/avaliacao/admin";
import Dialogo from "./Dialogo";
import { acao, caixaErro } from "./estilos";
import { SEM_COMENTARIO, trecho } from "./rotulosAvaliacao";

export default function ConfirmarRemocaoAvaliacao({
  avaliacao,
  ocupado,
  erro,
  aoCancelar,
  aoConfirmar,
}: {
  avaliacao: AvaliacaoAdmin;
  ocupado: boolean;
  erro: string | null;
  aoCancelar: () => void;
  aoConfirmar: () => void;
}) {
  return (
    <Dialogo idTitulo="titulo-tirar-avaliacao" titulo="Tirar esta avaliação do site?" aoFechar={aoCancelar} ocupado={ocupado}>
      <p style={{ fontSize: 14.5, lineHeight: 1.6, color: p.g700, margin: "0 0 10px" }}>
        O comentário some da landing na hora. <strong style={{ color: p.ink }}>A nota continua contando</strong> na
        média: o que sai do ar é o texto, não a avaliação que a pessoa deu.
      </p>
      <blockquote
        style={{
          margin: "0 0 14px",
          padding: "10px 12px",
          background: p.g100,
          borderRadius: 10,
          fontSize: 13.5,
          lineHeight: 1.6,
          color: p.ink,
          overflowWrap: "anywhere",
        }}
      >
        <span role="img" aria-label={`${avaliacao.estrelas} de 5 estrelas`} style={{ color: p.gold, letterSpacing: 1 }}>
          {estrelasEmTexto(avaliacao.estrelas)}
        </span>{" "}
        {avaliacao.comentario ? trecho(avaliacao.comentario, 200) : SEM_COMENTARIO}
      </blockquote>
      <p style={{ fontSize: 13, color: p.g500, margin: "0 0 18px" }}>
        Dá para publicar de volta depois, aqui mesmo.
      </p>
      {erro && (
        <div role="alert" style={{ ...caixaErro, marginBottom: 14 }}>
          {erro}
        </div>
      )}
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
        <button type="button" autoFocus onClick={aoCancelar} disabled={ocupado} style={{ ...acao(p.g500, false), padding: "11px 18px" }}>
          Cancelar
        </button>
        <button
          type="button"
          onClick={aoConfirmar}
          disabled={ocupado}
          style={{ ...acao(p.error, true), padding: "11px 18px", opacity: ocupado ? 0.6 : 1 }}
        >
          {ocupado ? "Tirando…" : "Tirar do site"}
        </button>
      </div>
    </Dialogo>
  );
}
