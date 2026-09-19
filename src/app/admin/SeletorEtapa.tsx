"use client";
/**
 * Seletor de etapa (na linha da tabela e na gaveta), com a cor da etapa atual.
 * É controlado pela etapa gravada: escolher "Retomar depois" ou "Perdido" abre
 * o mini-formulário e o seletor só muda quando o servidor confirmar.
 */
import * as React from "react";
import { ETAPAS, type StatusLead } from "@/features/lead/funil";
import { COR_ETAPA, ROTULO_ETAPA } from "./etapas";

export default function SeletorEtapa({
  etapa,
  desabilitado,
  aoEscolher,
  rotuloAcessivel = "Etapa do lead",
}: {
  etapa: StatusLead;
  desabilitado?: boolean;
  aoEscolher: (etapa: StatusLead) => void;
  rotuloAcessivel?: string;
}) {
  const cor = COR_ETAPA[etapa];
  return (
    <select
      value={etapa}
      disabled={desabilitado}
      aria-label={rotuloAcessivel}
      // na tabela a linha inteira abre a gaveta: o clique no seletor fica nele
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => {
        const escolhida = e.target.value as StatusLead;
        if (escolhida !== etapa) aoEscolher(escolhida);
      }}
      style={{
        appearance: "auto",
        background: cor.fundo,
        color: cor.texto,
        border: "none",
        borderRadius: 999,
        padding: "6px 10px",
        fontSize: 13,
        fontWeight: 700,
        fontFamily: "var(--font-body)",
        cursor: desabilitado ? "default" : "pointer",
        maxWidth: "100%",
      }}
    >
      {ETAPAS.map((e) => (
        <option key={e} value={e}>
          {ROTULO_ETAPA[e]}
        </option>
      ))}
    </select>
  );
}
