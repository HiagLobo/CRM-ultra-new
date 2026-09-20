"use client";
/**
 * Um orçamento na lista do painel: número, cliente (abre a ficha), o que foi
 * proposto, a situação e a validade. É um CARTÃO, e não uma linha de tabela:
 * no celular empilha sem estouro lateral.
 *
 * Os três botões de situação ficam SEMPRE montados; o que já está em vigor é
 * `aria-pressed` e ignora o clique, então o foco do teclado nunca cai para o
 * começo da página depois de marcar enviado. O erro da ação aparece no próprio
 * cartão, onde o fundador clicou.
 */
import * as React from "react";
import { palette as p } from "@/lib/palette";
import { Ic } from "@/components/Icon";
import { formatarReais, ROTULO_STATUS, STATUS_ORCAMENTO, type OrcamentoAdmin, type StatusOrcamento } from "@/features/orcamento";
import { botaoContorno, caixaErro } from "./estilos";
import { COR_STATUS, linkDocumento, resumoDaLinha, textoValidade, venceu } from "./listaOrcamentos";

const selo = (cor: string): React.CSSProperties => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 5,
  border: `1px solid ${cor}66`,
  background: `${cor}14`,
  color: p.ink,
  borderRadius: 999,
  padding: "2px 10px",
  fontSize: 12.5,
  fontWeight: 600,
});

/** Só as três que o fundador marca: "rascunho" é como a proposta nasce. */
const MARCAVEIS = STATUS_ORCAMENTO.filter((s) => s !== "rascunho");

/** Só ícones que existem no `Icon` (nome fora do mapa viraria interrogação). */
const ICONE: Record<StatusOrcamento, string> = {
  rascunho: "file-text",
  enviado: "send",
  aceito: "handshake",
  recusado: "x",
};

export default function LinhaOrcamento({
  orcamento,
  hoje,
  ocupado,
  erro,
  aoAbrirLead,
  aoMarcar,
  aoDuplicar,
  aoExcluir,
}: {
  orcamento: OrcamentoAdmin;
  /** Dia de Recife (`AAAA-MM-DD`), para saber se a validade passou. */
  hoje: string;
  ocupado: boolean;
  /** Falha da última ação neste orçamento. */
  erro: string | null;
  aoAbrirLead: (leadId: string) => void;
  aoMarcar: (status: StatusOrcamento) => void;
  aoDuplicar: () => void;
  aoExcluir: () => void;
}) {
  const vencido = venceu(orcamento, hoje);
  const cliente = orcamento.cliente.nome?.trim() || orcamento.cliente.email || "lead sem nome";

  return (
    <article style={{ background: p.white, border: `1px solid ${p.g300}`, borderRadius: 14, padding: "14px 16px", display: "grid", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: p.ink }}>{orcamento.numero}</span>
        <span style={selo(COR_STATUS[orcamento.status])}>{ROTULO_STATUS[orcamento.status]}</span>
        {orcamento.condicoes.anual && <span style={selo(p.primary)}>Anual</span>}
        {orcamento.condicoes.condicaoFundador && <span style={selo(p.primary)}>Fundador</span>}
        <span style={{ fontSize: 12.5, color: vencido ? p.error : p.g500, marginLeft: "auto" }}>
          {textoValidade(orcamento, hoje)}
        </span>
      </div>

      <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.6, color: p.ink, overflowWrap: "anywhere" }}>
        {resumoDaLinha(orcamento)}
      </p>
      {orcamento.totais.implantacaoCentavos > 0 && (
        <p style={{ margin: 0, fontSize: 13, color: p.g700 }}>
          Implantação: {formatarReais(orcamento.totais.implantacaoCentavos)} no go live
        </p>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={() => aoAbrirLead(orcamento.leadId)}
          title="Abrir a ficha do cliente"
          style={{ background: "none", border: "none", padding: 0, color: p.primary, fontWeight: 700, fontSize: 13.5, fontFamily: "var(--font-body)", cursor: "pointer", textAlign: "left", overflowWrap: "anywhere" }}
        >
          {cliente}
        </button>
        <a
          href={linkDocumento(orcamento.id)}
          target="_blank"
          rel="noopener noreferrer"
          style={{ ...botaoContorno(p.primary), marginLeft: "auto" }}
        >
          <Ic n="file-text" s={14} c="currentColor" /> Abrir documento
        </a>
      </div>

      <div role="group" aria-label="Situação da proposta" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {MARCAVEIS.map((status) => {
          const jaEsta = orcamento.status === status;
          const cor = COR_STATUS[status];
          return (
            <button
              key={status}
              type="button"
              aria-pressed={jaEsta}
              aria-disabled={ocupado || undefined}
              onClick={() => {
                if (ocupado || jaEsta) return;
                aoMarcar(status);
              }}
              style={jaEsta ? { ...botaoContorno(cor), background: `${cor}14`, cursor: "default" } : botaoContorno(cor, ocupado)}
            >
              <Ic n={ICONE[status]} s={14} c="currentColor" /> {ROTULO_STATUS[status]}
            </button>
          );
        })}
        <button type="button" onClick={aoDuplicar} disabled={ocupado} style={{ ...botaoContorno(p.g500, ocupado), marginLeft: "auto" }}>
          <Ic n="layers" s={14} c="currentColor" /> Duplicar
        </button>
        <button type="button" onClick={aoExcluir} disabled={ocupado} style={botaoContorno(p.error, ocupado)}>
          <Ic n="minus" s={14} c="currentColor" /> Excluir
        </button>
      </div>

      <p role="status" style={{ margin: 0, fontSize: 12.5, color: p.g500 }}>
        {ocupado ? "Salvando…" : `Total do ano: ${formatarReais(orcamento.totais.anoCentavos)}`}
      </p>
      {erro && <div role="alert" style={caixaErro}>{erro}</div>}
    </article>
  );
}
