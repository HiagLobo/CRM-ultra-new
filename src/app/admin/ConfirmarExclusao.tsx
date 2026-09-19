"use client";
/**
 * Exclusão é irreversível — confirmação explícita, com o lead à vista.
 * Fecha no fundo, no "Cancelar" e no Esc; o foco começa no "Cancelar", a
 * escolha que não destrói nada. Falha aparece aqui mesmo (a gaveta está atrás).
 */
import * as React from "react";
import { palette as p } from "@/lib/palette";
import type { LeadAdmin } from "@/features/lead/admin";
import { identificacaoLead } from "./contatoLead";
import Dialogo from "./Dialogo";
import { acao, caixaErro } from "./estilos";

export default function ConfirmarExclusao({
  lead,
  ocupado,
  erro,
  aoCancelar,
  aoConfirmar,
}: {
  lead: LeadAdmin;
  ocupado: boolean;
  erro: string | null;
  aoCancelar: () => void;
  aoConfirmar: () => void;
}) {
  return (
    <Dialogo idTitulo="titulo-excluir-lead" titulo="Excluir este lead?" aoFechar={aoCancelar} ocupado={ocupado}>
      <p style={{ fontSize: 14.5, lineHeight: 1.6, color: p.g700, margin: "0 0 6px" }}>
        Todos os dados de <strong style={{ color: p.ink }}>{identificacaoLead(lead)}</strong> serão apagados:
        contato, consentimento, etapa e anotações. <strong>Não dá para desfazer.</strong>
      </p>
      <p style={{ fontSize: 13, color: p.g500, margin: "0 0 18px" }}>
        Use quando o titular pedir a eliminação dos dados (LGPD). Para só parar o follow-up, mova para
        &ldquo;Perdido&rdquo; ou &ldquo;Retomar depois&rdquo;. O histórico fica.
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
          {ocupado ? "Excluindo…" : "Excluir definitivamente"}
        </button>
      </div>
    </Dialogo>
  );
}
