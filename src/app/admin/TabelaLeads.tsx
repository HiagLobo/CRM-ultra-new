"use client";
/**
 * Tabela de leads do admin: contato, origem, status e as ações de follow-up.
 * Contato em um clique: o telefone abre o WhatsApp com uma mensagem curta e o
 * e-mail abre o cliente de e-mail. Marcar "Contatado" continua sendo à mão.
 */
import * as React from "react";
import { palette as p } from "@/lib/palette";
import { Ic } from "@/components/Icon";
import type { StatusLead } from "@/features/lead/lead";
import { telefoneNacional, type LeadAdmin, type StatusDoAdmin } from "@/features/lead/admin";
import { linkEmailLead, linkWhatsappLead } from "./contatoLead";

const CORES: Record<StatusLead, { fundo: string; texto: string; rotulo: string }> = {
  novo: { fundo: p.g100, texto: p.g700, rotulo: "Novo" },
  verificado: { fundo: `${p.success}1A`, texto: p.success, rotulo: "Verificado" },
  contatado: { fundo: p.lilac1, texto: p.dark, rotulo: "Contatado" },
  descartado: { fundo: `${p.error}14`, texto: p.error, rotulo: "Descartado" },
};

const th: React.CSSProperties = {
  textAlign: "left",
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: ".04em",
  textTransform: "uppercase",
  color: p.g500,
  padding: "0 14px 10px",
  whiteSpace: "nowrap",
};
const td: React.CSSProperties = {
  fontSize: 14,
  color: p.ink,
  padding: "13px 14px",
  borderTop: `1px solid ${p.g100}`,
  whiteSpace: "nowrap",
};

const link: React.CSSProperties = {
  color: "inherit",
  textDecoration: "underline",
  textDecorationColor: p.g300,
  textUnderlineOffset: 3,
};

function dataCurta(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

/** Telefone formatado; com link de WhatsApp quando o número permite. */
function Telefone({ telefone }: { telefone: string }) {
  const legivel = telefoneNacional(telefone);
  const whatsapp = linkWhatsappLead(telefone);
  if (!whatsapp) return <>{legivel}</>;
  return (
    <a
      href={whatsapp}
      target="_blank"
      rel="noopener noreferrer"
      title="Abrir conversa no WhatsApp"
      style={{ ...link, display: "inline-flex", alignItems: "center", gap: 6 }}
    >
      <Ic n="message-circle" s={15} c={p.success} /> {legivel}
    </a>
  );
}

export default function TabelaLeads({
  leads,
  ocupado,
  aoMudarStatus,
  aoExcluir,
}: {
  leads: LeadAdmin[];
  ocupado: string | null;
  aoMudarStatus: (id: string, status: StatusDoAdmin) => void;
  /** LGPD: eliminação a pedido do titular. Destrutivo — confirmado no painel. */
  aoExcluir: (lead: LeadAdmin) => void;
}) {
  return (
    <div className="ds-scroll-x" style={{ background: "#fff", border: `1px solid ${p.g300}`, borderRadius: 16, padding: "18px 4px 4px" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={th}>E-mail</th>
            <th style={th}>Telefone</th>
            <th style={th}>CRECI</th>
            <th style={th}>Pedido em</th>
            <th style={th}>Origem</th>
            <th style={th}>Status</th>
            <th style={{ ...th, textAlign: "right" }}>Follow-up</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((l) => {
            const cor = CORES[l.status];
            const travado = ocupado === l.id;
            return (
              <tr key={l.id} style={{ opacity: travado ? 0.5 : 1 }}>
                <td style={{ ...td, fontWeight: 600 }}>
                  <a href={linkEmailLead(l.email)} title="Escrever e-mail" style={link}>
                    {l.email}
                  </a>
                  {l.verificadoEm && (
                    <span
                      title={`E-mail confirmado em ${dataCurta(l.verificadoEm)}`}
                      aria-label="e-mail confirmado"
                      style={{ display: "inline-flex", verticalAlign: "middle", marginLeft: 6 }}
                    >
                      <Ic n="badge-check" s={15} c={p.success} />
                    </span>
                  )}
                </td>
                <td style={td}>
                  <Telefone telefone={l.telefone} />
                </td>
                <td style={td}>{l.creci}</td>
                <td style={{ ...td, color: p.g700 }}>{dataCurta(l.criadoEm)}</td>
                <td style={{ ...td, color: p.g500 }}>{l.origem?.utm || l.origem?.ref || "—"}</td>
                <td style={td}>
                  <span
                    style={{
                      display: "inline-block",
                      background: cor.fundo,
                      color: cor.texto,
                      borderRadius: 999,
                      padding: "4px 11px",
                      fontSize: 12.5,
                      fontWeight: 700,
                    }}
                  >
                    {cor.rotulo}
                  </span>
                </td>
                <td style={{ ...td, textAlign: "right" }}>
                  <div style={{ display: "inline-flex", gap: 8 }}>
                    <button
                      type="button"
                      disabled={travado || l.status === "contatado"}
                      onClick={() => aoMudarStatus(l.id, "contatado")}
                      style={botao(l.status === "contatado" || travado, p.primary)}
                    >
                      <Ic n="check" s={14} c="currentColor" /> Contatado
                    </button>
                    <button
                      type="button"
                      disabled={travado || l.status === "descartado"}
                      onClick={() => aoMudarStatus(l.id, "descartado")}
                      style={botao(l.status === "descartado" || travado, p.g500)}
                    >
                      <Ic n="x" s={14} c="currentColor" /> Descartar
                    </button>
                    <button
                      type="button"
                      disabled={travado}
                      title="Excluir definitivamente (pedido do titular — LGPD)"
                      onClick={() => aoExcluir(l)}
                      style={{ ...botao(travado, p.error), borderColor: travado ? p.g300 : `${p.error}66` }}
                    >
                      <Ic n="user-x" s={14} c="currentColor" /> Excluir
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function botao(desabilitado: boolean, cor: string): React.CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    border: `1.5px solid ${desabilitado ? p.g300 : cor}`,
    background: "#fff",
    color: desabilitado ? p.g500 : cor,
    borderRadius: 999,
    padding: "7px 13px",
    fontSize: 13,
    fontWeight: 600,
    fontFamily: "var(--font-body)",
    cursor: desabilitado ? "default" : "pointer",
  };
}
