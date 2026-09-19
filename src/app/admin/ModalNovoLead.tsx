"use client";
/**
 * "+ Novo lead" — cadastro manual (indicação, evento, WhatsApp). Telefone e
 * canal obrigatórios; a observação vira a 1ª anotação; o checkbox "a pessoa
 * sabe e concordou em ser contatada" é obrigatório (base do registro — LGPD).
 * Contato que já existe (409) não vira outro lead: o aviso leva ao existente.
 */
import * as React from "react";
import { palette as p } from "@/lib/palette";
import { CANAIS_MANUAIS, LIMITE_NOTA, ROTULO_CANAL, type CanalManual } from "@/features/lead/funil";
import type { LeadAdmin } from "@/features/lead/admin";
import Dialogo from "./Dialogo";
import Campo from "./Campo";
import { acao, caixaErro, mensagemErroCampo } from "./estilos";
import {
  FORM_NOVO_LEAD_VAZIO,
  validarNovoLead,
  type CampoNovoLead,
  type FormNovoLead,
  type ResultadoCadastroTela,
} from "./formNovoLead";

export default function ModalNovoLead({
  aoFechar,
  aoCadastrar,
  aoCadastrado,
  aoAbrirExistente,
}: {
  aoFechar: () => void;
  aoCadastrar: (form: FormNovoLead) => Promise<ResultadoCadastroTela>;
  aoCadastrado: (lead: LeadAdmin, observacaoNaoSalva: boolean) => void;
  aoAbrirExistente: (id: string) => void;
}) {
  const [form, setForm] = React.useState<FormNovoLead>(FORM_NOVO_LEAD_VAZIO);
  const [erros, setErros] = React.useState<Partial<Record<CampoNovoLead, string>>>({});
  const [falha, setFalha] = React.useState<string | null>(null);
  const [existente, setExistente] = React.useState<{ id: string; mensagem: string } | null>(null);
  const [enviando, setEnviando] = React.useState(false);

  const mudar = (parcial: Partial<FormNovoLead>) => {
    setForm((f) => ({ ...f, ...parcial }));
    setExistente(null);
  };
  const mudarTexto = (campo: "nome" | "telefone" | "email" | "creci", valor: string) => {
    setForm((f) => ({ ...f, [campo]: valor }));
    setExistente(null);
  };

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setFalha(null);
    setExistente(null);
    const v = validarNovoLead(form);
    if (!v.ok) return setErros(v.erros);
    setErros({});
    setEnviando(true);
    const r = await aoCadastrar(v.valor);
    setEnviando(false);
    if (r.status === "ok") aoCadastrado(r.lead, r.observacaoNaoSalva);
    else if (r.status === "duplicado") setExistente({ id: r.id, mensagem: r.mensagem });
    else if (r.status === "invalido") setErros(r.erros);
    else setFalha(r.erro);
  }

  const texto = (campo: "nome" | "telefone" | "email" | "creci", rotulo: string, extra: React.InputHTMLAttributes<HTMLInputElement>) => (
    <Campo id={`novo-${campo}`} rotulo={rotulo} erro={erros[campo]}>
      {(props) => <input {...props} {...extra} value={form[campo]} onChange={(e) => mudarTexto(campo, e.target.value)} />}
    </Campo>
  );

  return (
    <Dialogo idTitulo="titulo-novo-lead" titulo="Novo lead" aoFechar={aoFechar} ocupado={enviando} fecharNoFundo={false} largura={520}>
      <form onSubmit={enviar} noValidate>
        {texto("nome", "Nome", { type: "text", maxLength: 120, autoComplete: "off", autoFocus: true })}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", columnGap: 12 }}>
          {texto("telefone", "Telefone (WhatsApp) *", { type: "tel", inputMode: "tel", placeholder: "(81) 98888-7777", autoComplete: "off" })}
          <Campo id="novo-canal" rotulo="Canal *" erro={erros.canal}>
            {(props) => (
              <select {...props} value={form.canal} onChange={(e) => mudar({ canal: e.target.value as CanalManual | "" })}>
                <option value="">Escolha…</option>
                {CANAIS_MANUAIS.map((c) => (
                  <option key={c} value={c}>
                    {ROTULO_CANAL[c].charAt(0).toUpperCase() + ROTULO_CANAL[c].slice(1)}
                  </option>
                ))}
              </select>
            )}
          </Campo>
          {texto("email", "E-mail", { type: "email", inputMode: "email", autoComplete: "off" })}
          {texto("creci", "CRECI", { type: "text", placeholder: "PE 12345-F", autoComplete: "off" })}
        </div>
        <Campo id="novo-observacao" rotulo="Observação" erro={erros.observacao} ajuda="Vira a primeira anotação do lead.">
          {(props) => (
            <textarea {...props} rows={3} maxLength={LIMITE_NOTA} value={form.observacao} onChange={(e) => mudar({ observacao: e.target.value })} style={{ ...props.style, resize: "vertical" }} />
          )}
        </Campo>

        <label style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 14, lineHeight: 1.5, color: p.ink, cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={form.consentimento}
            onChange={(e) => mudar({ consentimento: e.target.checked })}
            aria-invalid={!!erros.consentimento}
            style={{ width: 18, height: 18, marginTop: 2, accentColor: p.primary, flexShrink: 0 }}
          />
          <span>A pessoa sabe e concordou em ser contatada. *</span>
        </label>
        {erros.consentimento && <div role="alert" style={mensagemErroCampo}>{erros.consentimento}</div>}

        {existente && (
          <div role="alert" style={{ ...caixaErro, marginTop: 14, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
            {existente.mensagem}
            <button type="button" onClick={() => aoAbrirExistente(existente.id)} style={{ background: "none", border: "none", padding: 0, color: p.primary, fontWeight: 700, cursor: "pointer", fontSize: 13.5, fontFamily: "inherit" }}>
              Abrir o existente
            </button>
          </div>
        )}
        {falha && <div role="alert" style={{ ...caixaErro, marginTop: 14 }}>{falha}</div>}

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap", marginTop: 18 }}>
          <button type="button" onClick={aoFechar} disabled={enviando} style={acao(p.g500, false)}>
            Cancelar
          </button>
          <button type="submit" disabled={enviando} style={{ ...acao(p.primary, true), opacity: enviando ? 0.6 : 1 }}>
            {enviando ? "Cadastrando…" : "Cadastrar lead"}
          </button>
        </div>
      </form>
    </Dialogo>
  );
}
