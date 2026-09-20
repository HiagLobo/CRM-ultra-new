"use client";
/**
 * Seção "Orçamentos" do painel: as abas por situação, a lista em cartões e as
 * ações de cada proposta. Estados de carregando, erro, lista vazia e aba vazia
 * — nada de tela em branco.
 *
 * O estado e as chamadas moram no `useOrcamentosAdmin` (carregado lá em cima,
 * junto com os leads); o formulário fica no `PainelLeads`, acima das seções,
 * porque ele também abre da ficha do lead. A aba de abertura é decidida UMA
 * vez, quando a lista chega: recalcular a cada render faria a aba pular sozinha
 * depois de marcar enviado.
 */
import * as React from "react";
import { palette as p } from "@/lib/palette";
import { Ic } from "@/components/Icon";
import type { LeadAdmin } from "@/features/lead/admin";
import { ROTULO_STATUS, type OrcamentoAdmin, type StatusOrcamento } from "@/features/orcamento";
import Aviso, { FaixaErro, LinkAviso } from "./Aviso";
import FaixaAbas from "./FaixaAbas";
import LinhaOrcamento from "./LinhaOrcamento";
import ConfirmarExclusaoOrcamento from "./ConfirmarExclusaoOrcamento";
import { acao } from "./estilos";
import { formDoOrcamento, type FormOrcamento } from "./formOrcamento";
import { ABAS_ORCAMENTO, abaInicial, contarPorAba, filtrarPorAba, type AbaOrcamento } from "./listaOrcamentos";
import type { PainelOrcamentosEstado } from "./useOrcamentosAdmin";

export default function PainelOrcamentos({
  painel,
  hoje,
  leadsPorId,
  recemSalvo,
  aoAbrirLead,
  aoNovoOrcamento,
}: {
  painel: PainelOrcamentosEstado;
  /** Dia de Recife (`AAAA-MM-DD`), para a validade vencida. */
  hoje: string;
  leadsPorId: Map<string, LeadAdmin>;
  /** O que acabou de ser salvo: a seção abre na aba dele e anuncia o número. */
  recemSalvo: OrcamentoAdmin | null;
  aoAbrirLead: (leadId: string) => void;
  aoNovoOrcamento: (lead: LeadAdmin | null, form?: FormOrcamento) => void;
}) {
  const [aba, setAba] = React.useState<AbaOrcamento | null>(null);
  const [confirmando, setConfirmando] = React.useState<OrcamentoAdmin | null>(null);
  const [erroExclusao, setErroExclusao] = React.useState<string | null>(null);
  const [errosPorId, setErrosPorId] = React.useState<Record<string, string>>({});
  /** O que a região viva anuncia: resultado da última ação, nada de total. */
  const [aviso, setAviso] = React.useState<string | null>(null);

  const contagem = React.useMemo(() => contarPorAba(painel.orcamentos), [painel.orcamentos]);
  const abaAtiva: AbaOrcamento = aba ?? "todos";
  const visiveis = React.useMemo(() => filtrarPorAba(painel.orcamentos, abaAtiva), [painel.orcamentos, abaAtiva]);

  React.useEffect(() => {
    if (painel.carregado && aba === null) setAba(abaInicial(contagem));
  }, [painel.carregado, aba, contagem]);

  /**
   * Acabou de salvar: a seção vai para a aba onde a proposta nova está (senão
   * ela some atrás de uma aba que o fundador não abriu) e o número é anunciado.
   */
  React.useEffect(() => {
    if (!recemSalvo) return;
    setAba((atual) => (atual === null || atual === "todos" ? atual : recemSalvo.status));
    setAviso(`Orçamento ${recemSalvo.numero} salvo em ${ROTULO_STATUS[recemSalvo.status]}.`);
  }, [recemSalvo]);

  /** Leva o foco para a aba de destino, em vez de deixá-lo cair no corpo da página. */
  function focarAba(valor: AbaOrcamento) {
    document.getElementById(`aba-orcamento-${valor}`)?.focus();
  }

  function guardarErro(id: string, erro: string | null) {
    setErrosPorId((atuais) => {
      const { [id]: _antigo, ...resto } = atuais;
      return erro ? { ...resto, [id]: erro } : resto;
    });
  }

  async function marcar(o: OrcamentoAdmin, status: StatusOrcamento) {
    guardarErro(o.id, null);
    setAviso(null);
    const r = await painel.trocarStatus(o.id, status);
    if (!r.ok) return guardarErro(o.id, r.erro);
    guardarErro(o.id, null);
    // numa aba por situação, marcar tira o cartão da lista: sem isto o foco caía
    // no corpo da página e nada era anunciado
    const saiuDaAba = abaAtiva !== "todos" && abaAtiva !== status;
    setAviso(
      saiuDaAba
        ? `${o.numero} agora está em ${ROTULO_STATUS[status]} e saiu desta aba.`
        : `${o.numero} agora está em ${ROTULO_STATUS[status]}.`,
    );
    if (saiuDaAba) focarAba(status);
  }

  async function excluir(o: OrcamentoAdmin) {
    setErroExclusao(null);
    const r = await painel.excluir(o.id);
    if (!r.ok) return setErroExclusao(r.erro);
    guardarErro(o.id, null);
    setConfirmando(null);
    setAviso(`${o.numero} foi excluído.`);
  }

  const novo = (
    <button type="button" onClick={() => aoNovoOrcamento(null)} className="ds-btnpop" style={acao(p.primary, true)}>
      <Ic n="calculator" s={16} c={p.white} /> Novo orçamento
    </button>
  );

  return (
    <div id="secao-orcamentos" role="tabpanel" aria-labelledby="secao-aba-orcamentos" tabIndex={0}>
      {painel.erro && <FaixaErro mensagem={painel.erro} aoRecarregar={() => void painel.carregar()} />}

      {/* região viva vazia: só fala quando uma ação termina */}
      <p role="status" style={{ margin: aviso ? "0 0 12px" : 0, fontSize: 13.5, color: p.g700 }}>
        {aviso ?? ""}
      </p>

      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
        <p style={{ margin: 0, fontSize: 13.5, color: p.g700, lineHeight: 1.5, maxWidth: 560 }}>
          A proposta sai com os preços do dia em que foi salva. Mudar a tabela depois não altera o que já foi
          enviado.
        </p>
        <span style={{ marginLeft: "auto" }}>{novo}</span>
      </div>

      {!painel.carregado ? (
        painel.carregando && <Aviso icone="loader">Carregando os orçamentos…</Aviso>
      ) : painel.orcamentos.length === 0 ? (
        <Aviso icone="calculator">
          Nenhum orçamento ainda. Monte o primeiro em <LinkAviso aoClicar={() => aoNovoOrcamento(null)}>Novo orçamento</LinkAviso>:
          escolha o cliente, os assentos e o desconto, e o documento sai pronto para imprimir.
        </Aviso>
      ) : (
        <>
          <FaixaAbas
            etiqueta="Situação dos orçamentos"
            idPrefixo="aba-orcamento"
            controla="lista-orcamentos"
            ativa={abaAtiva}
            opcoes={ABAS_ORCAMENTO}
            contagem={contagem}
            alerta={{ valor: "rascunho", fundo: p.warning, texto: p.ink }}
            aoEscolher={setAba}
          />

          <div id="lista-orcamentos" style={{ display: "grid", gap: 12 }}>
            {visiveis.length > 0 ? (
              visiveis.map((o) => (
                <LinhaOrcamento
                  key={o.id}
                  orcamento={o}
                  hoje={hoje}
                  ocupado={painel.ocupados.has(o.id)}
                  erro={errosPorId[o.id] ?? null}
                  aoAbrirLead={aoAbrirLead}
                  aoMarcar={(status) => void marcar(o, status)}
                  aoDuplicar={() => aoNovoOrcamento(leadsPorId.get(o.leadId) ?? null, formDoOrcamento(o))}
                  aoExcluir={() => {
                    setErroExclusao(null);
                    setConfirmando(o);
                  }}
                />
              ))
            ) : (
              <Aviso icone="inbox">
                Nenhum orçamento nesta situação. <LinkAviso aoClicar={() => setAba("todos")}>Ver todos</LinkAviso>
              </Aviso>
            )}
          </div>
        </>
      )}

      {confirmando && (
        <ConfirmarExclusaoOrcamento
          orcamento={confirmando}
          ocupado={painel.ocupados.has(confirmando.id)}
          erro={erroExclusao}
          aoCancelar={() => setConfirmando(null)}
          aoConfirmar={() => void excluir(confirmando)}
        />
      )}
    </div>
  );
}
