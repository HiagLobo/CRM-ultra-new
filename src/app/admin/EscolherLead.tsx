"use client";
/**
 * Escolher o cliente do orçamento entre os leads que já existem: busca por
 * nome, e-mail, telefone ou CRECI (a MESMA regra da busca do painel), com os
 * primeiros resultados clicáveis. Quem ainda não está no funil entra pelo
 * "+ Novo lead", que já existe.
 *
 * A lista não aparece inteira de uma vez de propósito: com o funil cheio, uma
 * lista de 200 nomes dentro do diálogo não ajuda ninguém a achar o cliente.
 */
import * as React from "react";
import { palette as p } from "@/lib/palette";
import { Ic } from "@/components/Icon";
import { telefoneNacional, type LeadAdmin } from "@/features/lead/admin";
import Campo from "./Campo";
import { botaoContorno } from "./estilos";
import { casaBusca } from "./filtroLeads";
import { identificacaoLead } from "./contatoLead";

const QUANTOS_MOSTRAR = 6;

export default function EscolherLead({
  leads,
  busca,
  erro,
  aoBuscar,
  aoEscolher,
  aoNovoLead,
}: {
  leads: ReadonlyArray<LeadAdmin>;
  busca: string;
  erro?: string;
  aoBuscar: (texto: string) => void;
  aoEscolher: (lead: LeadAdmin) => void;
  aoNovoLead: () => void;
}) {
  const achados = React.useMemo(
    () => (busca.trim() ? leads.filter((l) => casaBusca(l, busca)).slice(0, QUANTOS_MOSTRAR) : []),
    [leads, busca],
  );

  return (
    <div>
      <Campo id="orcamento-cliente" rotulo="Cliente *" erro={erro} ajuda="Busque por nome, e-mail, telefone ou CRECI.">
        {(props) => (
          <input
            {...props}
            type="search"
            autoFocus
            autoComplete="off"
            placeholder="Nome, e-mail ou telefone"
            value={busca}
            onChange={(e) => aoBuscar(e.target.value)}
          />
        )}
      </Campo>

      {busca.trim() && (
        <div style={{ display: "grid", gap: 6, marginTop: -6, marginBottom: 14 }}>
          {achados.map((lead) => (
            <button
              key={lead.id}
              type="button"
              onClick={() => aoEscolher(lead)}
              style={{
                display: "grid",
                gap: 2,
                textAlign: "left",
                border: `1px solid ${p.g300}`,
                background: p.white,
                borderRadius: 10,
                padding: "8px 12px",
                cursor: "pointer",
                fontFamily: "var(--font-body)",
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 600, color: p.ink, overflowWrap: "anywhere" }}>
                {identificacaoLead(lead)}
              </span>
              <span style={{ fontSize: 12.5, color: p.g500, overflowWrap: "anywhere" }}>
                {telefoneNacional(lead.telefone)}
                {lead.email ? ` · ${lead.email}` : ""}
              </span>
            </button>
          ))}
          {achados.length === 0 && (
            <p style={{ margin: 0, fontSize: 13.5, color: p.g700, lineHeight: 1.5 }}>
              Nenhum lead com essa busca. Cadastre o cliente primeiro:
            </p>
          )}
          <button type="button" onClick={aoNovoLead} style={{ ...botaoContorno(p.primary), justifySelf: "start" }}>
            <Ic n="user-plus" s={14} c="currentColor" /> Novo lead
          </button>
        </div>
      )}
    </div>
  );
}
