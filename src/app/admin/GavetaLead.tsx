"use client";
/**
 * Gaveta do lead (abre ao clicar na linha): contato em um clique, CRECI com a
 * conferência (O9), etapa, próxima ação, anotações, dados de origem (com o
 * último acesso ao demo) e a exclusão (LGPD). Lateral no
 * computador; tela cheia no celular (`min(480px, 100%)`). Esc e o fundo fecham.
 */
import * as React from "react";
import { palette as p } from "@/lib/palette";
import { Ic } from "@/components/Icon";
import { dataHoraRecife, diaBR, telefoneNacional, type LeadAdmin } from "@/features/lead/admin";
import type { AvaliacaoAdmin } from "@/features/avaliacao";
import { ROTULO_CANAL, type ProximaAcao, type StatusLead } from "@/features/lead/funil";
import type { ConferenciaCreci } from "@/features/lead/creci";
import SeletorEtapa from "./SeletorEtapa";
import BlocoProximaAcao from "./BlocoProximaAcao";
import BlocoNotas from "./BlocoNotas";
import BlocoCreci from "./BlocoCreci";
import Dados from "./Dados";
import { dataHoraCurta, textoRepetido, type Repetido } from "./selosLead";
import { ROTULO_SITUACAO, avaliacaoNaFicha } from "./rotulosAvaliacao";
import { identificacaoLead, linkEmailLead, linkWhatsappLead } from "./contatoLead";
import { acao, botaoContorno, caixaErro, tituloSecao } from "./estilos";
import type { ResultadoAcao } from "./useLeadsAdmin";

const caixaAviso: React.CSSProperties = { ...caixaErro, background: `${p.warning}1F`, borderColor: `${p.warning}88` };

export default function GavetaLead({
  lead,
  agora,
  ocupado,
  repetido,
  avaliacao,
  escAtivo,
  aviso,
  aoFechar,
  aoEscolherEtapa,
  aoAlterarRetomar,
  aoDefinirProximaAcao,
  aoConferirCreci,
  aoExcluir,
}: {
  lead: LeadAdmin;
  agora: Date;
  ocupado: boolean;
  /** O que este lead divide com outros da lista (o selo "repetido"; no celular, só aqui dá para ler o motivo). */
  repetido?: Repetido;
  /** A avaliação que esta pessoa deu ao demo (O10), quando houver. */
  avaliacao?: AvaliacaoAdmin;
  /** Desligado enquanto um diálogo está aberto por cima (o Esc é dele). */
  escAtivo: boolean;
  aviso: string | null;
  aoFechar: () => void;
  aoEscolherEtapa: (etapa: StatusLead) => Promise<ResultadoAcao>;
  aoAlterarRetomar: () => void;
  aoDefinirProximaAcao: (acao: ProximaAcao | null) => Promise<ResultadoAcao>;
  aoConferirCreci: (conferencia: ConferenciaCreci | null) => Promise<ResultadoAcao>;
  aoExcluir: () => void;
}) {
  const [erroEtapa, setErroEtapa] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!escAtivo) return;
    const aoTeclar = (e: KeyboardEvent) => e.key === "Escape" && aoFechar();
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [escAtivo, aoFechar]);

  // a página de trás não rola junto (no celular, o dedo rolaria a lista)
  React.useEffect(() => {
    const antes = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = antes;
    };
  }, []);

  async function escolherEtapa(etapa: StatusLead) {
    setErroEtapa(null);
    const r = await aoEscolherEtapa(etapa);
    if (!r.ok) setErroEtapa(r.erro);
  }

  const whatsapp = linkWhatsappLead(lead.telefone, lead.canal);
  const origem = [lead.origem?.utm, lead.origem?.ref].filter(Boolean).join(" · ");

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="titulo-gaveta" style={{ position: "fixed", inset: 0, zIndex: 150 }}>
      <div onClick={aoFechar} style={{ position: "absolute", inset: 0, background: "rgba(28,10,46,.35)" }} />
      <aside
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          width: "min(480px, 100%)",
          background: p.white,
          boxShadow: "-20px 0 60px rgba(20,6,38,.25)",
          overflowY: "auto",
          overscrollBehavior: "contain",
          boxSizing: "border-box",
        }}
      >
        <header style={{ position: "sticky", top: 0, zIndex: 1, background: p.white, borderBottom: `1px solid ${p.g100}`, padding: "16px 20px", display: "flex", alignItems: "center", gap: 10 }}>
          <h2 id="titulo-gaveta" style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 19, margin: 0, color: p.ink, minWidth: 0, overflowWrap: "anywhere" }}>
            {identificacaoLead(lead)}
          </h2>
          {lead.verificadoEm && (
            <span role="img" title={`E-mail confirmado em ${dataHoraRecife(lead.verificadoEm)}`} aria-label="e-mail confirmado" style={{ display: "inline-flex" }}>
              <Ic n="badge-check" s={18} c={p.success} />
            </span>
          )}
          <button type="button" autoFocus onClick={aoFechar} aria-label="Fechar" style={{ marginLeft: "auto", background: p.g100, border: "none", borderRadius: "50%", width: 36, height: 36, display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 }}>
            <Ic n="x" s={18} c={p.g700} />
          </button>
        </header>

        <div style={{ padding: "18px 20px 28px", display: "grid", gap: 24 }}>
          {aviso && <div role="status" style={caixaAviso}>{aviso}</div>}
          {repetido && <p style={{ ...caixaAviso, margin: 0 }}><strong>Repetido:</strong> {textoRepetido(repetido)}</p>}

          <section aria-label="Contato">
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
              {whatsapp && (
                <a href={whatsapp} target="_blank" rel="noopener noreferrer" style={{ ...acao(p.success, true), padding: "9px 16px" }}>
                  <Ic n="message-circle" s={16} c={p.white} /> WhatsApp
                </a>
              )}
              {lead.email && (
                <a href={linkEmailLead(lead.email)} style={{ ...acao(p.primary, false), padding: "9px 16px" }}>
                  <Ic n="mail" s={16} c={p.primary} /> E-mail
                </a>
              )}
            </div>
            <Dados
              itens={[
                ["Telefone", telefoneNacional(lead.telefone)],
                ["E-mail", lead.email ?? "—"],
              ]}
            />
          </section>

          <BlocoCreci lead={lead} ocupado={ocupado} aoConferir={aoConferirCreci} />

          <section aria-labelledby="gaveta-etapa">
            <h3 id="gaveta-etapa" style={tituloSecao}>Etapa</h3>
            <SeletorEtapa etapa={lead.status} desabilitado={ocupado} aoEscolher={(e) => void escolherEtapa(e)} />
            {lead.status === "retomar" && lead.retomarEm && (
              <p style={{ fontSize: 14, color: p.g700, margin: "10px 0 0", lineHeight: 1.5, overflowWrap: "anywhere" }}>
                Retomar em <strong style={{ color: p.ink }}>{diaBR(lead.retomarEm)}</strong>
                {lead.motivo ? ` · ${lead.motivo}` : ""}{" "}
                <button type="button" onClick={aoAlterarRetomar} disabled={ocupado} style={{ ...botaoContorno(p.primary, ocupado), padding: "3px 10px", marginLeft: 4 }}>
                  Alterar
                </button>
              </p>
            )}
            {lead.status === "perdido" && (
              <p style={{ fontSize: 14, color: p.g700, margin: "10px 0 0", overflowWrap: "anywhere" }}>
                Motivo: <strong style={{ color: p.ink }}>{lead.motivo || "não registrado"}</strong>
              </p>
            )}
            {erroEtapa && <div role="alert" style={{ ...caixaErro, marginTop: 10 }}>{erroEtapa}</div>}
          </section>

          <section aria-labelledby="gaveta-acao">
            <h3 id="gaveta-acao" style={tituloSecao}>Próxima ação</h3>
            {lead.status === "retomar" || lead.status === "perdido" ? (
              <p style={{ fontSize: 14, color: p.g700, margin: 0, lineHeight: 1.5 }}>
                Fora da fila de trabalho. Para marcar uma próxima ação, mude a etapa.
              </p>
            ) : (
              <BlocoProximaAcao key={`${lead.proximaAcaoEm}|${lead.proximaAcao}`} lead={lead} agora={agora} ocupado={ocupado} aoSalvar={aoDefinirProximaAcao} />
            )}
          </section>

          <section aria-labelledby="gaveta-notas">
            <h3 id="gaveta-notas" style={tituloSecao}>Anotações</h3>
            <BlocoNotas leadId={lead.id} />
          </section>

          <section aria-labelledby="gaveta-dados">
            <h3 id="gaveta-dados" style={tituloSecao}>Origem</h3>
            <Dados
              itens={[
                ["Canal", ROTULO_CANAL[lead.canal]],
                ["Campanha", origem || "—"],
                ["Entrou em", dataHoraRecife(lead.criadoEm)],
                ["E-mail confirmado", lead.verificadoEm ? dataHoraRecife(lead.verificadoEm) : "não"],
                ["Último acesso ao demo", lead.ultimoAcessoEm ? dataHoraCurta(lead.ultimoAcessoEm) : "—"],
                // a nota que a pessoa deu, com a situação do texto no site (O10·S3)
                ...(avaliacao
                  ? ([["Avaliou o demo", `${avaliacaoNaFicha(avaliacao)} · ${ROTULO_SITUACAO[avaliacao.status]}`]] as const)
                  : []),
              ]}
            />
          </section>

          <section style={{ borderTop: `1px solid ${p.g100}`, paddingTop: 18 }}>
            <button type="button" onClick={aoExcluir} disabled={ocupado} title="Excluir definitivamente (pedido do titular, LGPD)" style={botaoContorno(p.error, ocupado)}>
              <Ic n="user-x" s={14} c="currentColor" /> Excluir (LGPD)
            </button>
          </section>
        </div>
      </aside>
    </div>
  );
}

