"use client";
/**
 * Painel do fundador, em duas seções: **Leads** (cards do funil, abas por
 * etapa, busca, lista e gaveta) e **Avaliações** (O10·S3). O estado e as
 * chamadas à API moram em `useLeadsAdmin` e `useAvaliacoesAdmin`; as regras
 * (Hoje, abas, formulários) em funções puras; aqui fica a composição. Estados
 * de carregando, erro, lista vazia e aba vazia — nada de tela em branco.
 *
 * A gaveta do lead fica fora das seções, de propósito: clicar em quem avaliou
 * abre a ficha por cima da lista de avaliações, sem perder o lugar. Por isso a
 * falha do carregamento dos leads é anunciada ACIMA do seletor de seção
 * (revisão da O10·S3): com o aviso dentro da seção "Leads", clicar em quem
 * avaliou não abria nada e não explicava nada.
 */
import * as React from "react";
import { palette as p } from "@/lib/palette";
import type { LeadAdmin } from "@/features/lead/admin";
import type { StatusLead } from "@/features/lead/funil";
import CabecalhoPainel from "./CabecalhoPainel";
import CardsTopo from "./CardsTopo";
import AbasFunil from "./AbasFunil";
import BarraFiltros from "./BarraFiltros";
import TabelaLeads from "./TabelaLeads";
import GavetaLead from "./GavetaLead";
import ModalEtapa from "./ModalEtapa";
import ModalNovoLead from "./ModalNovoLead";
import ConfirmarExclusao from "./ConfirmarExclusao";
import Aviso, { FaixaErro, LinkAviso } from "./Aviso";
import SeletorSecao, { type Secao } from "./SeletorSecao";
import PainelAvaliacoes from "./PainelAvaliacoes";
import PainelOrcamentos from "./PainelOrcamentos";
import ModalOrcamento from "./ModalOrcamento";
import { useLeadsAdmin, type ResultadoAcao } from "./useLeadsAdmin";
import { useAvaliacoesAdmin } from "./useAvaliacoesAdmin";
import { useOrcamentosAdmin } from "./useOrcamentosAdmin";
import { contarPorAba as contarAvaliacoes, porLead } from "./listaAvaliacoes";
import { contarPorAba as contarOrcamentos, porLead as orcamentosPorLead } from "./listaOrcamentos";
import { diaEmRecife } from "@/features/orcamento";
import { useNovoOrcamento } from "./useNovoOrcamento";
import { useAgora } from "./useAgora";
import { pedeDetalhe, type EtapaComDetalhe } from "./etapas";
import { abaInicial, contarPorAba, filtrarPorAba, textoContagem, type Aba } from "./filtroLeads";
import { repetidosDaLista } from "./selosLead";

const AVISO_OBSERVACAO = "Lead cadastrado, mas a observação não foi salva. Escreva de novo em Anotações.";

export default function PainelLeads() {
  const painel = useLeadsAdmin();
  const avaliacoes = useAvaliacoesAdmin();
  const orcamentos = useOrcamentosAdmin();
  const agora = useAgora();
  const [secao, setSecao] = React.useState<Secao>("leads");
  const [busca, setBusca] = React.useState("");
  const [aba, setAba] = React.useState<Aba | null>(null);
  const [abertoId, setAbertoId] = React.useState<string | null>(null);
  const [avisoGaveta, setAvisoGaveta] = React.useState<string | null>(null);
  const [pedidoEtapa, setPedidoEtapa] = React.useState<{ lead: LeadAdmin; etapa: EtapaComDetalhe } | null>(null);
  const [confirmando, setConfirmando] = React.useState<LeadAdmin | null>(null);
  const [erroExclusao, setErroExclusao] = React.useState<string | null>(null);
  const [novoAberto, setNovoAberto] = React.useState(false);
  // o formulário do orçamento fica ACIMA das seções: ele também abre da ficha do lead
  const novoOrcamento = useNovoOrcamento();

  const contagem = React.useMemo(() => contarPorAba(painel.leads, busca, agora), [painel.leads, busca, agora]);
  const pendentesHoje = React.useMemo(() => contarPorAba(painel.leads, "", agora).hoje, [painel.leads, agora]);
  const abaAtiva: Aba = aba ?? abaInicial(pendentesHoje);
  const visiveis = React.useMemo(
    () => filtrarPorAba(painel.leads, { aba: abaAtiva, busca }, agora),
    [painel.leads, abaAtiva, busca, agora],
  );
  const aberto = abertoId ? (painel.leads.find((l) => l.id === abertoId) ?? null) : null;
  const repetidos = React.useMemo(() => repetidosDaLista(painel.leads), [painel.leads]);
  const avaliacaoPorLead = React.useMemo(() => porLead(avaliacoes.avaliacoes), [avaliacoes.avaliacoes]);
  const paraConferir = React.useMemo(() => contarAvaliacoes(avaliacoes.avaliacoes).pendente, [avaliacoes.avaliacoes]);
  const orcamentosDoLead = React.useMemo(() => orcamentosPorLead(orcamentos.orcamentos), [orcamentos.orcamentos]);
  const rascunhos = React.useMemo(() => contarOrcamentos(orcamentos.orcamentos).rascunho, [orcamentos.orcamentos]);
  const leadsPorId = React.useMemo(() => new Map(painel.leads.map((l) => [l.id, l] as const)), [painel.leads]);
  const hoje = React.useMemo(() => diaEmRecife(agora), [agora]);

  // a aba de abertura é decidida uma vez, com a lista carregada — depois, só o fundador troca
  React.useEffect(() => {
    if (painel.carregado && aba === null) setAba(abaInicial(pendentesHoje));
  }, [painel.carregado, aba, pendentesHoje]);

  const fecharGaveta = React.useCallback(() => {
    setAbertoId(null);
    setAvisoGaveta(null);
  }, []);

  function abrirLead(id: string) {
    setAbertoId(id);
    setAvisoGaveta(null);
    if (!painel.leads.some((l) => l.id === id)) void painel.carregar(); // entrou depois da última carga
  }

  /** Etapa simples muda na hora; "retomar"/"perdido" abrem o mini-formulário. */
  async function escolherEtapa(lead: LeadAdmin, etapa: StatusLead): Promise<ResultadoAcao> {
    if (pedeDetalhe(etapa)) {
      setPedidoEtapa({ lead, etapa });
      return { ok: true };
    }
    return painel.mudarEtapa(lead.id, { etapa });
  }

  async function escolherNaLinha(lead: LeadAdmin, etapa: StatusLead) {
    const r = await escolherEtapa(lead, etapa);
    painel.mostrarErro(r.ok ? null : r.erro);
  }

  async function excluir(lead: LeadAdmin) {
    setErroExclusao(null);
    const r = await painel.excluir(lead.id);
    if (!r.ok) return setErroExclusao(r.erro);
    setConfirmando(null);
    fecharGaveta();
  }

  function cadastrado(lead: LeadAdmin, observacaoNaoSalva: boolean) {
    setNovoAberto(false);
    setBusca("");
    // veio do "+ Novo orçamento": volta para o formulário com o que já estava
    // digitado e o cliente novo escolhido, em vez de jogar a proposta fora
    if (novoOrcamento.voltarDoNovoLead(lead)) return;
    setAbertoId(lead.id);
    setAvisoGaveta(observacaoNaoSalva ? AVISO_OBSERVACAO : null);
  }

  return (
    <div style={{ minHeight: "100vh", background: p.page }}>
      <CabecalhoPainel
        exportando={painel.exportando}
        aoNovoLead={() => setNovoAberto(true)}
        aoExportar={() => void painel.exportar()}
        aoSair={() => void painel.sair()}
      />

      <main className="ds-pad" style={{ maxWidth: 1240, margin: "0 auto", padding: "28px 32px 40px" }}>
        {/* fora das seções: a ficha do lead abre das duas, e a falha vale para as duas */}
        {painel.erro && <FaixaErro mensagem={painel.erro} aoRecarregar={() => void painel.carregar()} />}

        <SeletorSecao
          ativa={secao}
          sinais={{
            avaliacoes: {
              numero: paraConferir,
              falhou: !avaliacoes.carregado && !!avaliacoes.erro,
              titulo: "Avaliações que o filtro automático segurou",
            },
            orcamentos: {
              numero: rascunhos,
              falhou: !orcamentos.carregado && !!orcamentos.erro,
              titulo: "Orçamentos ainda em rascunho",
            },
          }}
          aoEscolher={setSecao}
        />

        {secao === "avaliacoes" ? (
          <PainelAvaliacoes painel={avaliacoes} aoAbrirLead={abrirLead} />
        ) : secao === "orcamentos" ? (
          <PainelOrcamentos
            painel={orcamentos}
            hoje={hoje}
            leadsPorId={leadsPorId}
            recemSalvo={novoOrcamento.salvo}
            aoAbrirLead={abrirLead}
            aoNovoOrcamento={novoOrcamento.abrir}
          />
        ) : (
        <div id="secao-leads" role="tabpanel" aria-labelledby="secao-aba-leads" tabIndex={0}>
        <CardsTopo leads={painel.leads} carregado={painel.carregado} agora={agora} aoAbrirAba={setAba} />

        {!painel.carregado ? (
          // sem dados ainda: carregando, ou a falha já está no aviso acima
          painel.carregando && <Aviso icone="loader">Carregando os leads…</Aviso>
        ) : painel.leads.length === 0 ? (
          <Aviso icone="inbox">
            Nenhum lead ainda. Quem pedir acesso pelo site aparece aqui; quem chegou por indicação, evento
            ou WhatsApp, cadastre em <LinkAviso aoClicar={() => setNovoAberto(true)}>+ Novo lead</LinkAviso>.
          </Aviso>
        ) : (
          <>
            <AbasFunil ativa={abaAtiva} contagem={contagem} aoEscolher={setAba} />
            <BarraFiltros busca={busca} textoTotal={textoContagem(visiveis.length, painel.leads.length)} aoBuscar={setBusca} />
            <div id="lista-leads">
              {visiveis.length > 0 ? (
                <TabelaLeads leads={visiveis} agora={agora} ocupados={painel.ocupados} repetidos={repetidos} aoAbrir={abrirLead} aoEscolherEtapa={(l, e) => void escolherNaLinha(l, e)} />
              ) : busca.trim() ? (
                <Aviso icone="search-x">
                  Nenhum lead com essa busca nesta aba. <LinkAviso aoClicar={() => setBusca("")}>Limpar a busca</LinkAviso>
                </Aviso>
              ) : abaAtiva === "hoje" ? (
                <Aviso icone="check-circle-2">
                  Tudo em dia. Ações vencidas ou do dia, retornos marcados e leads novos parados há 24 h aparecem
                  aqui. <LinkAviso aoClicar={() => setAba("todos")}>Ver todos os leads</LinkAviso>
                </Aviso>
              ) : (
                <Aviso icone="inbox">
                  Nenhum lead nesta etapa. <LinkAviso aoClicar={() => setAba("todos")}>Ver todos</LinkAviso>
                </Aviso>
              )}
            </div>
          </>
        )}
        </div>
        )}
      </main>

      {aberto && (
        <GavetaLead
          key={aberto.id}
          lead={aberto}
          agora={agora}
          ocupado={painel.ocupados.has(aberto.id)}
          repetido={repetidos.get(aberto.id)}
          avaliacao={avaliacaoPorLead.get(aberto.id)}
          avaliacoesIndisponiveis={!avaliacoes.carregado && !avaliacoes.carregando}
          orcamentos={orcamentosDoLead.get(aberto.id) ?? []}
          orcamentosIndisponiveis={!orcamentos.carregado && !orcamentos.carregando}
          hoje={hoje}
          escAtivo={!pedidoEtapa && !confirmando && !novoAberto && !novoOrcamento.pedido}
          aviso={avisoGaveta}
          aoFechar={fecharGaveta}
          aoEscolherEtapa={(etapa) => escolherEtapa(aberto, etapa)}
          aoAlterarRetomar={() => setPedidoEtapa({ lead: aberto, etapa: "retomar" })}
          aoDefinirProximaAcao={(acao) => painel.definirProximaAcao(aberto.id, acao)}
          aoConferirCreci={(conferencia) => painel.conferirCreci(aberto.id, conferencia)}
          aoNovoOrcamento={() => novoOrcamento.abrir(aberto)}
          aoExcluir={() => {
            setErroExclusao(null);
            setConfirmando(aberto);
          }}
        />
      )}

      {pedidoEtapa && (
        <ModalEtapa
          lead={pedidoEtapa.lead}
          etapa={pedidoEtapa.etapa}
          agora={agora}
          aoFechar={() => setPedidoEtapa(null)}
          aoConfirmar={(mudanca) => painel.mudarEtapa(pedidoEtapa.lead.id, mudanca)}
        />
      )}

      {novoAberto && (
        <ModalNovoLead
          aoFechar={() => {
            setNovoAberto(false);
            novoOrcamento.voltarDoNovoLead(null); // desistiu: volta para a proposta
          }}
          aoCadastrar={painel.cadastrar}
          aoCadastrado={cadastrado}
          aoAbrirExistente={(id) => {
            setNovoAberto(false);
            abrirLead(id);
          }}
        />
      )}

      {novoOrcamento.pedido && (
        <ModalOrcamento
          leads={painel.leads}
          leadInicial={novoOrcamento.pedido.lead}
          formInicial={novoOrcamento.pedido.form}
          aoFechar={novoOrcamento.fechar}
          aoSalvar={orcamentos.criar}
          aoSalvo={(orcamento) => {
            novoOrcamento.salvou(orcamento);
            fecharGaveta();
            setSecao("orcamentos");
          }}
          aoNovoLead={(form) => {
            novoOrcamento.irParaNovoLead(form);
            setNovoAberto(true);
          }}
        />
      )}

      {confirmando && (
        <ConfirmarExclusao
          lead={confirmando}
          ocupado={painel.ocupados.has(confirmando.id)}
          erro={erroExclusao}
          aoCancelar={() => setConfirmando(null)}
          aoConfirmar={() => void excluir(confirmando)}
        />
      )}
    </div>
  );
}
