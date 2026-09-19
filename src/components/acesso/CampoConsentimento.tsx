"use client";
/**
 * Consentimento do cadastro (LGPD): a caixa mostra EXATAMENTE o texto que o
 * servidor carimba no registro (`TEXTO_CONSENTIMENTO`), com o link da política.
 * Nunca vem marcada: cada envio do cadastro é uma autorização explícita.
 */
import * as React from "react";
import { palette as p } from "@/lib/palette";
import { TEXTO_CONSENTIMENTO } from "@/features/lead/schema";
import { ID_CAMPO } from "./cadastro";

const ID = ID_CAMPO.consentimento;
const ID_ERRO = `${ID}-erro`;

export default function CampoConsentimento({
  marcado,
  aoMudar,
  erro,
}: {
  marcado: boolean;
  aoMudar: (marcado: boolean) => void;
  erro?: string;
}) {
  return (
    <div>
      <label
        htmlFor={ID}
        style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 13.5, lineHeight: 1.55, color: p.g700, cursor: "pointer" }}
      >
        <input
          id={ID}
          type="checkbox"
          checked={marcado}
          onChange={(e) => aoMudar(e.target.checked)}
          aria-invalid={!!erro}
          aria-describedby={erro ? ID_ERRO : undefined}
          style={{ marginTop: 2, width: 17, height: 17, accentColor: p.primary, flexShrink: 0 }}
        />
        <span>
          {TEXTO_CONSENTIMENTO}{" "}
          <a
            href="/privacidade"
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()} // abrir a política não marca a caixa
            style={{ color: p.primary, fontWeight: 600, whiteSpace: "nowrap" }}
          >
            Ler a política
          </a>
        </span>
      </label>
      {erro && (
        <div id={ID_ERRO} role="alert" style={{ fontSize: 13, color: p.error, marginTop: 6 }}>
          {erro}
        </div>
      )}
    </div>
  );
}
