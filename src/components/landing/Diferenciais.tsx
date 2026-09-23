"use client";
/**
 * Seção "Onde o Ultra é diferente": o que distingue o produto de qualquer outro
 * CRM imobiliário. Vem logo depois do Hero, antes de "Recursos", porque
 * recurso todo concorrente tem; estes seis mecanismos são o motivo da escolha.
 *
 * O texto mora em `src/content/diferenciais.ts`, com o teste que amarra cada
 * promessa a uma entrega datada no anexo da proposta. Aqui só tem tela.
 */
import * as React from "react";
import { Secao, Eyebrow, Titulo, Sub, Cartao } from "./ui";
import {
  DIFERENCIAIS,
  EYEBROW_DIFERENCIAIS,
  TITULO_DIFERENCIAIS,
  SUB_DIFERENCIAIS,
} from "@/content/diferenciais";

export default function Diferenciais() {
  // fundo branco de propósito: entra depois do Hero escuro e antes de "Recursos", que é cinza
  return (
    <Secao id="diferenciais">
      <div style={{ maxWidth: 720, marginBottom: 40 }}>
        <Eyebrow>{EYEBROW_DIFERENCIAIS}</Eyebrow>
        <Titulo>{TITULO_DIFERENCIAIS}</Titulo>
        <Sub>{SUB_DIFERENCIAIS}</Sub>
      </div>

      <div
        className="ds-cards"
        style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 22 }}
      >
        {DIFERENCIAIS.map((d) => (
          <Cartao key={d.id} icone={d.icone} titulo={d.titulo}>
            {d.texto}
          </Cartao>
        ))}
      </div>
    </Secao>
  );
}
