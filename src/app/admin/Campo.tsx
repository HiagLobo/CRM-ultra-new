"use client";
/**
 * Um campo de formulário do painel: rótulo, o controle e o erro logo abaixo
 * (ligado por `aria-describedby`). O controle vem de quem chama — input,
 * select ou textarea — com o `id` e o estilo que este componente passa.
 */
import * as React from "react";
import { palette as p } from "@/lib/palette";
import { campo, mensagemErroCampo, rotuloCampo } from "./estilos";

export interface PropsControle {
  id: string;
  style: React.CSSProperties;
  "aria-invalid": boolean;
  "aria-describedby"?: string;
}

export default function Campo({
  id,
  rotulo,
  erro,
  ajuda,
  children,
}: {
  id: string;
  rotulo: string;
  erro?: string;
  /** Texto curto sob o campo quando não há erro. */
  ajuda?: string;
  children: (props: PropsControle) => React.ReactNode;
}) {
  const idErro = `${id}-erro`;
  return (
    <div style={{ marginBottom: 14 }}>
      <label htmlFor={id} style={rotuloCampo}>
        {rotulo}
      </label>
      {children({
        id,
        style: campo(!!erro),
        "aria-invalid": !!erro,
        ...(erro ? { "aria-describedby": idErro } : {}),
      })}
      {erro ? (
        <div id={idErro} role="alert" style={mensagemErroCampo}>
          {erro}
        </div>
      ) : (
        ajuda && <div style={{ ...mensagemErroCampo, color: p.g500 }}>{ajuda}</div>
      )}
    </div>
  );
}
