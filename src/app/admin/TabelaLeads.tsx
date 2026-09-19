"use client";
/**
 * Lista de leads da aba: quem é, contato em um clique (WhatsApp com mensagem
 * curta, e-mail), entrada, próximo passo e o seletor de etapa. Clicar na linha
 * (ou no nome, pelo teclado) abre a gaveta do lead.
 * Celular: cada linha vira um cartão (nome + etapa, telefone, próximo passo).
 */
import * as React from "react";
import { palette as p } from "@/lib/palette";
import { Ic } from "@/components/Icon";
import { dataHoraRecife, telefoneNacional, type LeadAdmin } from "@/features/lead/admin";
import { ROTULO_CANAL, type StatusLead } from "@/features/lead/funil";
import SeletorEtapa from "./SeletorEtapa";
import { identificacaoLead, linkEmailLead, linkWhatsappLead } from "./contatoLead";
import { proximoPasso, type TomPasso } from "./hoje";

const COR_TOM: Readonly<Record<TomPasso, string>> = {
  atrasado: p.error,
  hoje: p.dark,
  agendado: p.g700,
  nenhum: p.g500,
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
const td: React.CSSProperties = { fontSize: 14, color: p.ink, padding: "12px 14px", borderTop: `1px solid ${p.g100}`, whiteSpace: "nowrap" };
const link: React.CSSProperties = { color: "inherit", textDecoration: "underline", textDecorationColor: p.g300, textUnderlineOffset: 3 };
const pararClique = (e: React.MouseEvent) => e.stopPropagation();

/** Desktop: tabela. Até 640 px: cada linha vira cartão em grade (sem rolagem lateral). */
const CSS_LISTA = `
.adm-lista { overflow-x: auto; }
.adm-lista table { min-width: 760px; }
.adm-linha { cursor: pointer; }
.adm-linha:hover > td, .adm-linha:focus-within > td { background: ${p.page}; }
@media (max-width: 640px) {
  .adm-lista { padding: 0 !important; }
  .adm-lista table, .adm-lista tbody { display: block; min-width: 0; }
  .adm-lista thead { display: none; }
  .adm-linha { display: grid; grid-template-columns: minmax(0, 1fr) auto; grid-template-areas: "lead etapa" "tel tel" "passo passo"; gap: 6px 10px; padding: 14px 16px; border-top: 1px solid ${p.g100}; }
  .adm-linha:first-child { border-top: none; }
  .adm-linha > td { display: block; padding: 0 !important; border: none !important; white-space: normal !important; max-width: none !important; background: none !important; }
  .adm-c-lead { grid-area: lead; min-width: 0; } .adm-c-etapa { grid-area: etapa; }
  .adm-c-tel { grid-area: tel; } .adm-c-passo { grid-area: passo; }
  .adm-c-creci, .adm-c-entrada { display: none !important; }
}`;

export default function TabelaLeads({
  leads,
  agora,
  ocupado,
  aoAbrir,
  aoEscolherEtapa,
}: {
  leads: LeadAdmin[];
  agora: Date;
  ocupado: string | null;
  aoAbrir: (id: string) => void;
  aoEscolherEtapa: (lead: LeadAdmin, etapa: StatusLead) => void;
}) {
  return (
    <div className="adm-lista" style={{ background: p.white, border: `1px solid ${p.g300}`, borderRadius: 16, padding: "16px 4px 4px" }}>
      <style>{CSS_LISTA}</style>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={th}>Lead</th>
            <th style={th}>Telefone</th>
            <th style={th}>CRECI</th>
            <th style={th}>Entrada</th>
            <th style={th}>Próximo passo</th>
            <th style={th}>Etapa</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((l) => {
            const travado = ocupado === l.id;
            const passo = proximoPasso(l, agora);
            const whatsapp = linkWhatsappLead(l.telefone, l.canal);
            return (
              <tr key={l.id} className="adm-linha" onClick={() => aoAbrir(l.id)} style={{ opacity: travado ? 0.5 : 1 }}>
                <td className="adm-c-lead" style={{ ...td, maxWidth: 260 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        aoAbrir(l.id);
                      }}
                      style={{ background: "none", border: "none", padding: 0, font: "inherit", fontWeight: 700, color: p.ink, cursor: "pointer", textAlign: "left", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: 0 }}
                    >
                      {identificacaoLead(l)}
                    </button>
                    {l.verificadoEm && (
                      <span title={`E-mail confirmado em ${dataHoraRecife(l.verificadoEm)}`} aria-label="e-mail confirmado" style={{ display: "inline-flex", flexShrink: 0 }}>
                        <Ic n="badge-check" s={15} c={p.success} />
                      </span>
                    )}
                  </div>
                  {l.nome && l.email && (
                    <a href={linkEmailLead(l.email)} onClick={pararClique} title="Escrever e-mail" style={{ ...link, display: "block", fontSize: 12.5, color: p.g500, overflow: "hidden", textOverflow: "ellipsis" }}>
                      {l.email}
                    </a>
                  )}
                  {!l.nome && l.email && (
                    <a href={linkEmailLead(l.email)} onClick={pararClique} style={{ ...link, fontSize: 12.5, color: p.g500 }}>
                      escrever e-mail
                    </a>
                  )}
                </td>
                <td className="adm-c-tel" style={td}>
                  {whatsapp ? (
                    <a href={whatsapp} target="_blank" rel="noopener noreferrer" onClick={pararClique} title="Abrir conversa no WhatsApp" style={{ ...link, display: "inline-flex", alignItems: "center", gap: 6 }}>
                      <Ic n="message-circle" s={15} c={p.success} /> {telefoneNacional(l.telefone)}
                    </a>
                  ) : (
                    telefoneNacional(l.telefone)
                  )}
                </td>
                <td className="adm-c-creci" style={{ ...td, color: p.g700 }}>{l.creci || "—"}</td>
                <td className="adm-c-entrada" style={{ ...td, color: p.g700, fontSize: 13 }}>
                  {dataHoraRecife(l.criadoEm).slice(0, 10)}
                  <div style={{ fontSize: 12, color: p.g500 }}>{ROTULO_CANAL[l.canal]}{l.origem?.utm ? ` · ${l.origem.utm}` : ""}</div>
                </td>
                <td className="adm-c-passo" title={passo.texto} style={{ ...td, maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", color: COR_TOM[passo.tom], fontWeight: passo.tom === "nenhum" ? 400 : 600, fontSize: 13.5 }}>
                  {passo.tom !== "nenhum" && <Ic n="alarm-clock" s={14} c={COR_TOM[passo.tom]} style={{ verticalAlign: "-2px", marginRight: 6 }} />}
                  {passo.texto}
                </td>
                <td className="adm-c-etapa" style={td} onClick={pararClique}>
                  <SeletorEtapa etapa={l.status} desabilitado={travado} aoEscolher={(e) => aoEscolherEtapa(l, e)} rotuloAcessivel={`Etapa de ${identificacaoLead(l)}`} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
