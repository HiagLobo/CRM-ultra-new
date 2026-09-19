"use client";
/**
 * Próxima ação na gaveta: mostra o dia e o que fazer (vermelho se atrasada),
 * com "Editar" e "Limpar"; sem ação marcada, abre direto o formulário.
 * Mesmas regras do servidor: dia de hoje em diante (Recife), até 200 caracteres.
 */
import * as React from "react";
import { palette as p } from "@/lib/palette";
import { Ic } from "@/components/Icon";
import { LIMITE_PROXIMA_ACAO, diaRecife, type ProximaAcao } from "@/features/lead/funil";
import type { LeadAdmin } from "@/features/lead/admin";
import Campo from "./Campo";
import AtalhosDia from "./AtalhosDia";
import { rotuloDia } from "./datas";
import { acao, botaoContorno, caixaErro } from "./estilos";
import { ATALHOS_ACAO, validarProximaAcao, type FormProximaAcao } from "./formEtapa";
import type { ResultadoAcao } from "./useLeadsAdmin";

const formDoLead = (lead: LeadAdmin): FormProximaAcao => ({ em: lead.proximaAcaoEm ?? "", texto: lead.proximaAcao ?? "" });

export default function BlocoProximaAcao({
  lead,
  agora,
  ocupado,
  aoSalvar,
}: {
  lead: LeadAdmin;
  agora: Date;
  ocupado: boolean;
  aoSalvar: (acao: ProximaAcao | null) => Promise<ResultadoAcao>;
}) {
  const [editando, setEditando] = React.useState(!lead.proximaAcaoEm);
  const [form, setForm] = React.useState<FormProximaAcao>(() => formDoLead(lead));
  const [erros, setErros] = React.useState<Partial<Record<keyof FormProximaAcao, string>>>({});
  const [erroEnvio, setErroEnvio] = React.useState<string | null>(null);
  const hoje = diaRecife(agora);

  async function enviar(valor: ProximaAcao | null) {
    setErroEnvio(null);
    const r = await aoSalvar(valor);
    if (!r.ok) return setErroEnvio(r.erro);
    setEditando(valor === null);
    setForm(valor ? { em: valor.em, texto: valor.texto } : { em: "", texto: "" });
  }

  function salvar(e: React.FormEvent) {
    e.preventDefault();
    const v = validarProximaAcao(form, agora);
    if (!v.ok) return setErros(v.erros);
    setErros({});
    void enviar(v.valor);
  }

  const erro = erroEnvio && <div role="alert" style={{ ...caixaErro, marginTop: 10 }}>{erroEnvio}</div>;

  if (!editando && lead.proximaAcaoEm) {
    const atrasada = lead.proximaAcaoEm < hoje;
    const cor = atrasada ? p.error : lead.proximaAcaoEm === hoje ? p.dark : p.ink;
    return (
      <div>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          <Ic n="alarm-clock" s={18} c={cor} style={{ marginTop: 2 }} />
          <div style={{ fontSize: 14.5, lineHeight: 1.5, color: p.ink, overflowWrap: "anywhere" }}>
            <strong style={{ color: cor }}>
              {atrasada ? `Atrasada (${rotuloDia(lead.proximaAcaoEm, hoje)})` : rotuloDia(lead.proximaAcaoEm, hoje)}
            </strong>{" "}
            · {lead.proximaAcao}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
          <button type="button" disabled={ocupado} onClick={() => { setForm(formDoLead(lead)); setEditando(true); }} style={botaoContorno(p.primary, ocupado)}>
            <Ic n="pen-line" s={14} c="currentColor" /> Editar
          </button>
          <button type="button" disabled={ocupado} title="Feita ou cancelada" onClick={() => void enviar(null)} style={botaoContorno(p.g700, ocupado)}>
            <Ic n="check" s={14} c="currentColor" /> Limpar
          </button>
        </div>
        {erro}
      </div>
    );
  }

  return (
    <form onSubmit={salvar} noValidate>
      <Campo id="acao-em" rotulo="Quando" erro={erros.em}>
        {(props) => <input {...props} type="date" min={hoje} value={form.em} onChange={(e) => setForm((f) => ({ ...f, em: e.target.value }))} />}
      </Campo>
      <div style={{ margin: "-6px 0 14px" }}>
        <AtalhosDia hoje={hoje} atalhos={ATALHOS_ACAO} valor={form.em} aoEscolher={(dia) => setForm((f) => ({ ...f, em: dia }))} />
      </div>
      <Campo id="acao-texto" rotulo="O que fazer" erro={erros.texto}>
        {(props) => (
          <input
            {...props}
            type="text"
            maxLength={LIMITE_PROXIMA_ACAO}
            placeholder="ex.: ligar às 10h, mandar proposta"
            value={form.texto}
            onChange={(e) => setForm((f) => ({ ...f, texto: e.target.value }))}
          />
        )}
      </Campo>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button type="submit" disabled={ocupado} style={{ ...acao(p.primary, true), padding: "8px 16px", opacity: ocupado ? 0.6 : 1 }}>
          {ocupado ? "Salvando…" : "Salvar próxima ação"}
        </button>
        {lead.proximaAcaoEm && (
          <button type="button" disabled={ocupado} onClick={() => { setErros({}); setEditando(false); }} style={{ ...acao(p.g500, false), padding: "8px 16px" }}>
            Cancelar
          </button>
        )}
      </div>
      {erro}
    </form>
  );
}
