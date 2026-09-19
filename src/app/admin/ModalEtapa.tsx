"use client";
/**
 * Mini-formulário para mover o lead para "Retomar depois" (dia + motivo) ou
 * "Perdido" (motivo da lista; "Outro" pede um texto curto). Valida com as
 * regras do servidor antes de enviar; a falha do envio aparece aqui mesmo.
 */
import * as React from "react";
import { palette as p } from "@/lib/palette";
import { LIMITE_MOTIVO, diaRecife, type MudancaEtapa } from "@/features/lead/funil";
import type { LeadAdmin } from "@/features/lead/admin";
import Dialogo from "./Dialogo";
import Campo from "./Campo";
import AtalhosDia from "./AtalhosDia";
import { identificacaoLead } from "./contatoLead";
import { somarDias } from "./datas";
import { acao, caixaErro, chip, mensagemErroCampo } from "./estilos";
import {
  ATALHOS_RETOMAR,
  LIMITE_OUTRO_MOTIVO,
  MOTIVOS_PERDA,
  formRetomarDoLead,
  montarMudancaEtapa,
  type FormEtapa,
} from "./formEtapa";
import type { ResultadoAcao } from "./useLeadsAdmin";

export default function ModalEtapa({
  lead,
  etapa,
  agora,
  aoFechar,
  aoConfirmar,
}: {
  lead: LeadAdmin;
  etapa: "retomar" | "perdido";
  agora: Date;
  aoFechar: () => void;
  aoConfirmar: (mudanca: MudancaEtapa) => Promise<ResultadoAcao>;
}) {
  const [form, setForm] = React.useState<FormEtapa>(() => formRetomarDoLead(lead));
  const [erros, setErros] = React.useState<Partial<Record<keyof FormEtapa, string>>>({});
  const [erroEnvio, setErroEnvio] = React.useState<string | null>(null);
  const [enviando, setEnviando] = React.useState(false);
  const hoje = diaRecife(agora);
  const mudar = (parcial: Partial<FormEtapa>) => setForm((f) => ({ ...f, ...parcial }));

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    const v = montarMudancaEtapa(etapa, form, agora);
    if (!v.ok) return setErros(v.erros);
    setErros({});
    setErroEnvio(null);
    setEnviando(true);
    const r = await aoConfirmar(v.valor);
    setEnviando(false);
    if (r.ok) aoFechar();
    else setErroEnvio(r.erro);
  }

  const retomar = etapa === "retomar";
  return (
    <Dialogo
      idTitulo="titulo-etapa"
      titulo={retomar ? "Retomar depois" : "Marcar como perdido"}
      aoFechar={aoFechar}
      ocupado={enviando}
      fecharNoFundo={false}
    >
      <p style={{ fontSize: 14, color: p.g700, margin: "-6px 0 16px", lineHeight: 1.5 }}>
        {identificacaoLead(lead)} —{" "}
        {retomar ? "sai da fila e volta para o “Hoje” no dia escolhido." : "sai da fila; o histórico fica."}
      </p>
      <form onSubmit={enviar} noValidate>
        {retomar ? (
          <>
            <Campo id="etapa-retomar-em" rotulo="Retomar em" erro={erros.retomarEm}>
              {(props) => (
                <input {...props} type="date" min={somarDias(hoje, 1)} value={form.retomarEm} onChange={(e) => mudar({ retomarEm: e.target.value })} />
              )}
            </Campo>
            <div style={{ margin: "-6px 0 14px" }}>
              <AtalhosDia hoje={hoje} atalhos={ATALHOS_RETOMAR} valor={form.retomarEm} aoEscolher={(dia) => mudar({ retomarEm: dia })} />
            </div>
            <Campo id="etapa-motivo-retomar" rotulo="Motivo (opcional)" erro={erros.motivoRetomar}>
              {(props) => (
                <input
                  {...props}
                  type="text"
                  maxLength={LIMITE_MOTIVO}
                  placeholder="ex.: pediu para falar depois das férias"
                  value={form.motivoRetomar}
                  onChange={(e) => mudar({ motivoRetomar: e.target.value })}
                />
              )}
            </Campo>
          </>
        ) : (
          <fieldset style={{ border: "none", padding: 0, margin: "0 0 14px" }}>
            <legend style={{ fontSize: 13, fontWeight: 600, color: p.g700, marginBottom: 8, padding: 0 }}>Motivo</legend>
            <div role="radiogroup" aria-label="Motivo da perda" style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {MOTIVOS_PERDA.map((m) => (
                <button
                  key={m.valor}
                  type="button"
                  role="radio"
                  aria-checked={form.motivoPerda === m.valor}
                  onClick={() => mudar({ motivoPerda: m.valor })}
                  style={chip(form.motivoPerda === m.valor)}
                >
                  {m.rotulo}
                </button>
              ))}
            </div>
            {erros.motivoPerda && <div role="alert" style={mensagemErroCampo}>{erros.motivoPerda}</div>}
            {form.motivoPerda === "outro" && (
              <div style={{ marginTop: 12 }}>
                <Campo id="etapa-outro-motivo" rotulo="Qual?" erro={erros.outroMotivo}>
                  {(props) => (
                    <input
                      {...props}
                      type="text"
                      autoFocus
                      maxLength={LIMITE_OUTRO_MOTIVO}
                      value={form.outroMotivo}
                      onChange={(e) => mudar({ outroMotivo: e.target.value })}
                    />
                  )}
                </Campo>
              </div>
            )}
          </fieldset>
        )}

        {erroEnvio && <div role="alert" style={{ ...caixaErro, marginBottom: 14 }}>{erroEnvio}</div>}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
          <button type="button" onClick={aoFechar} disabled={enviando} style={acao(p.g500, false)}>
            Cancelar
          </button>
          <button type="submit" disabled={enviando} style={{ ...acao(retomar ? p.primary : p.error, true), opacity: enviando ? 0.6 : 1 }}>
            {enviando ? "Salvando…" : retomar ? "Mover para Retomar" : "Marcar perdido"}
          </button>
        </div>
      </form>
    </Dialogo>
  );
}
