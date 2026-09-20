"use client";
/**
 * "+ Novo orçamento": escolhe o cliente, monta a proposta e vê o total mudar a
 * cada tecla. A conta é a função pura do domínio (`previaDoForm`), e a
 * validação é o MESMO schema Zod do servidor: o erro aparece no campo antes de
 * enviar, e o servidor confere de novo.
 *
 * Abaixo do piso o botão de salvar fica desligado, com a explicação no quadro
 * de totais. Se ainda assim o servidor recusar (409), a mensagem dele aparece
 * ao lado do botão, e não só no topo.
 */
import * as React from "react";
import { palette as p } from "@/lib/palette";
import {
  CODIGOS_EXTRA,
  EXTRAS,
  LIMITE_OBSERVACAO,
  PUBLICOS,
  ROTULO_PUBLICO,
  formatarReais,
  type OrcamentoAdmin,
  type PublicoOrcamento,
} from "@/features/orcamento";
import type { LeadAdmin } from "@/features/lead/admin";
import Dialogo from "./Dialogo";
import Campo from "./Campo";
import EscolherLead from "./EscolherLead";
import ResumoOrcamento from "./ResumoOrcamento";
import { acao, caixaErro, rotuloCampo } from "./estilos";
import { identificacaoLead } from "./contatoLead";
import {
  FORM_ORCAMENTO_VAZIO,
  previaDoForm,
  validarOrcamento,
  type CampoOrcamento,
  type FormOrcamento,
  type ResultadoOrcamentoTela,
} from "./formOrcamento";

const caixaMarcar: React.CSSProperties = {
  display: "flex",
  gap: 10,
  alignItems: "flex-start",
  fontSize: 14,
  lineHeight: 1.5,
  color: p.ink,
  cursor: "pointer",
  marginBottom: 10,
};

export default function ModalOrcamento({
  leads,
  leadInicial,
  formInicial,
  aoFechar,
  aoSalvar,
  aoSalvo,
  aoNovoLead,
}: {
  leads: ReadonlyArray<LeadAdmin>;
  /** Já vem escolhido quando o orçamento nasce da ficha do lead ou de "Duplicar". */
  leadInicial: LeadAdmin | null;
  formInicial?: FormOrcamento;
  aoFechar: () => void;
  aoSalvar: (form: FormOrcamento, leadId: string) => Promise<ResultadoOrcamentoTela>;
  aoSalvo: (orcamento: OrcamentoAdmin) => void;
  aoNovoLead: () => void;
}) {
  const [lead, setLead] = React.useState<LeadAdmin | null>(leadInicial);
  const [busca, setBusca] = React.useState("");
  const [form, setForm] = React.useState<FormOrcamento>(formInicial ?? FORM_ORCAMENTO_VAZIO);
  const [erros, setErros] = React.useState<Partial<Record<CampoOrcamento, string>>>({});
  const [falha, setFalha] = React.useState<string | null>(null);
  const [enviando, setEnviando] = React.useState(false);

  const previa = React.useMemo(() => previaDoForm(form), [form]);
  const mudar = (parcial: Partial<FormOrcamento>) => {
    setForm((f) => ({ ...f, ...parcial }));
    setFalha(null);
  };

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setFalha(null);
    if (!lead) return setErros({ leadId: "escolha o cliente" });
    const v = validarOrcamento(form, lead.id);
    if (!v.ok) return setErros(v.erros);
    setErros({});
    setEnviando(true);
    const r = await aoSalvar(form, lead.id);
    setEnviando(false);
    if (r.status === "ok") aoSalvo(r.orcamento);
    else if (r.status === "invalido") setErros(r.erros);
    else setFalha(r.status === "recusado" ? r.mensagem : r.erro);
  }

  const numero = (campo: "pro" | "ultra" | "unidades" | "descontoPct" | "validadeDias", rotulo: string, erro?: string, extra?: React.InputHTMLAttributes<HTMLInputElement>) => (
    <Campo id={`orcamento-${campo}`} rotulo={rotulo} erro={erro}>
      {(props) => (
        <input
          {...props}
          type="number"
          inputMode="decimal"
          min={0}
          value={form[campo]}
          onChange={(e) => mudar({ [campo]: e.target.value } as Partial<FormOrcamento>)}
          {...extra}
        />
      )}
    </Campo>
  );

  return (
    <Dialogo idTitulo="titulo-novo-orcamento" titulo="Novo orçamento" aoFechar={aoFechar} ocupado={enviando} fecharNoFundo={false} largura={620}>
      <form onSubmit={enviar} noValidate>
        {lead ? (
          <p style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, margin: "0 0 14px", fontSize: 14.5, color: p.ink }}>
            <strong style={{ overflowWrap: "anywhere" }}>{identificacaoLead(lead)}</strong>
            <button
              type="button"
              onClick={() => {
                setLead(null);
                setBusca("");
              }}
              style={{ background: "none", border: "none", padding: 0, color: p.primary, fontWeight: 700, fontSize: 13.5, fontFamily: "inherit", cursor: "pointer" }}
            >
              Trocar de cliente
            </button>
          </p>
        ) : (
          <EscolherLead
            leads={leads}
            busca={busca}
            erro={erros.leadId}
            aoBuscar={setBusca}
            aoEscolher={(l) => {
              setLead(l);
              setErros((e) => ({ ...e, leadId: undefined }));
            }}
            aoNovoLead={aoNovoLead}
          />
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", columnGap: 12 }}>
          <Campo id="orcamento-publico" rotulo="Público *" erro={erros.publico}>
            {(props) => (
              <select {...props} value={form.publico} onChange={(e) => mudar({ publico: e.target.value as PublicoOrcamento })}>
                {PUBLICOS.map((valor) => (
                  <option key={valor} value={valor}>
                    {ROTULO_PUBLICO[valor]}
                  </option>
                ))}
              </select>
            )}
          </Campo>
          {numero("pro", "Assentos Pro", erros.assentos, { step: 1 })}
          {numero("ultra", "Assentos Ultra", undefined, { step: 1 })}
          {form.publico === "rede" && numero("unidades", "Unidades ativas *", erros.unidades, { step: 1, min: 1 })}
          {numero("descontoPct", "Desconto (%)", erros.descontoPct, { step: 0.5, max: 100 })}
          {numero("validadeDias", "Validade (dias)", erros.validadeDias, { step: 1, min: 1 })}
        </div>

        <label style={caixaMarcar}>
          <input type="checkbox" checked={form.anual} onChange={(e) => mudar({ anual: e.target.checked })} style={{ width: 18, height: 18, marginTop: 2, accentColor: p.primary, flexShrink: 0 }} />
          <span>Plano anual: 12 meses pelo preço de 10, com implantação isenta.</span>
        </label>
        <label style={caixaMarcar}>
          <input type="checkbox" checked={form.implantacaoIsenta} onChange={(e) => mudar({ implantacaoIsenta: e.target.checked })} style={{ width: 18, height: 18, marginTop: 2, accentColor: p.primary, flexShrink: 0 }} />
          <span>Isentar a implantação (migração de carteira e treinamento).</span>
        </label>
        <label style={caixaMarcar}>
          <input type="checkbox" checked={form.condicaoFundador} onChange={(e) => mudar({ condicaoFundador: e.target.checked })} style={{ width: 18, height: 18, marginTop: 2, accentColor: p.primary, flexShrink: 0 }} />
          <span>Condição de fundador (as contrapartidas saem escritas na proposta).</span>
        </label>

        <details style={{ margin: "6px 0 14px" }}>
          <summary style={{ ...rotuloCampo, cursor: "pointer", marginBottom: 10 }}>Extras e repasses</summary>
          <div style={{ display: "grid", gap: 8 }}>
            {CODIGOS_EXTRA.map((codigo) => {
              const extra = EXTRAS.find((x) => x.codigo === codigo)!;
              return (
                <label key={codigo} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13.5, color: p.g700 }}>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    inputMode="numeric"
                    aria-label={`Quantidade: ${extra.nome}`}
                    value={form.extras[codigo] ?? ""}
                    onChange={(e) => mudar({ extras: { ...form.extras, [codigo]: e.target.value } })}
                    style={{ width: 78, padding: "6px 8px", border: `1.5px solid ${p.g300}`, borderRadius: 8, fontFamily: "var(--font-body)", fontSize: 14 }}
                  />
                  <span style={{ overflowWrap: "anywhere" }}>
                    {extra.nome} · {formatarReais(extra.centavos)}
                    {extra.recorrencia === "mensal" ? " por mês" : " uma vez"}
                  </span>
                </label>
              );
            })}
          </div>
        </details>

        <Campo id="orcamento-observacao" rotulo="Observação" erro={erros.observacao} ajuda="Sai no documento, abaixo dos totais.">
          {(props) => (
            <textarea {...props} rows={2} maxLength={LIMITE_OBSERVACAO} value={form.observacao} onChange={(e) => mudar({ observacao: e.target.value })} style={{ ...props.style, resize: "vertical" }} />
          )}
        </Campo>

        <ResumoOrcamento previa={previa} />

        {falha && <div role="alert" style={{ ...caixaErro, marginBottom: 14 }}>{falha}</div>}

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
          <button type="button" onClick={aoFechar} disabled={enviando} style={acao(p.g500, false)}>
            Cancelar
          </button>
          <button
            type="submit"
            disabled={enviando || !previa.ok}
            title={previa.ok ? undefined : "Ajuste os assentos ou o desconto para salvar"}
            style={{ ...acao(p.primary, true), opacity: enviando || !previa.ok ? 0.6 : 1 }}
          >
            {enviando ? "Salvando…" : "Salvar orçamento"}
          </button>
        </div>
      </form>
    </Dialogo>
  );
}
