"use client";
/** Atalhos de data ("Amanhã", "Em 1 mês"…): um toque preenche o campo de dia. */
import * as React from "react";
import { somarDias } from "./datas";
import { chip } from "./estilos";

export default function AtalhosDia({
  hoje,
  atalhos,
  valor,
  aoEscolher,
}: {
  /** Dia de hoje em Recife (`AAAA-MM-DD`). */
  hoje: string;
  atalhos: ReadonlyArray<{ rotulo: string; dias: number }>;
  valor: string;
  aoEscolher: (dia: string) => void;
}) {
  return (
    <div role="group" aria-label="Atalhos de data" style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
      {atalhos.map((a) => {
        const dia = somarDias(hoje, a.dias);
        return (
          <button key={a.rotulo} type="button" aria-pressed={valor === dia} onClick={() => aoEscolher(dia)} style={chip(valor === dia)}>
            {a.rotulo}
          </button>
        );
      })}
    </div>
  );
}
