"use client";
/**
 * Seção "Avaliações" do painel: o cartão com a média que o site mostra, as
 * abas por situação, a lista em cartões e as ações de cada uma. Estados de
 * carregando, erro, lista vazia e aba vazia — nada de tela em branco.
 *
 * O estado e as chamadas moram no `useAvaliacoesAdmin` (carregado lá em cima,
 * junto com os leads); aqui fica a composição. A aba de abertura é decidida
 * UMA vez, quando a lista chega (revisão da O10·S3): recalcular a cada render
 * fazia a aba pular sozinha depois de publicar ou tirar do ar. O erro de uma
 * ação fica no cartão dela, não só na faixa do topo.
 */
import * as React from "react";
import { palette as p } from "@/lib/palette";
import type { AvaliacaoAdmin } from "@/features/avaliacao/admin";
import Aviso, { FaixaErro, LinkAviso } from "./Aviso";
import FaixaAbas from "./FaixaAbas";
import LinhaAvaliacao from "./LinhaAvaliacao";
import ConfirmarRemocaoAvaliacao from "./ConfirmarRemocaoAvaliacao";
import { ABAS_AVALIACAO, abaInicial, contarPorAba, filtrarPorAba, type AbaAvaliacao } from "./listaAvaliacoes";
import { resumoEmTexto } from "./rotulosAvaliacao";
import type { PainelAvaliacoesEstado } from "./useAvaliacoesAdmin";

export default function PainelAvaliacoes({
  painel,
  aoAbrirLead,
}: {
  painel: PainelAvaliacoesEstado;
  aoAbrirLead: (leadId: string) => void;
}) {
  const [aba, setAba] = React.useState<AbaAvaliacao | null>(null);
  const [confirmando, setConfirmando] = React.useState<AvaliacaoAdmin | null>(null);
  const [erroRemocao, setErroRemocao] = React.useState<string | null>(null);
  const [errosPorId, setErrosPorId] = React.useState<Record<string, string>>({});

  const contagem = React.useMemo(() => contarPorAba(painel.avaliacoes), [painel.avaliacoes]);
  const abaAtiva: AbaAvaliacao = aba ?? "todas";
  const visiveis = React.useMemo(() => filtrarPorAba(painel.avaliacoes, abaAtiva), [painel.avaliacoes, abaAtiva]);

  // a aba de abertura é decidida uma vez, com a lista carregada (mesmo arranjo do
  // funil): depois disso `aba` já não é nula, e só o fundador troca
  React.useEffect(() => {
    if (painel.carregado && aba === null) setAba(abaInicial(contagem));
  }, [painel.carregado, aba, contagem]);

  function guardarErro(id: string, erro: string | null) {
    setErrosPorId((atuais) => {
      const { [id]: _antigo, ...resto } = atuais;
      return erro ? { ...resto, [id]: erro } : resto;
    });
  }

  async function publicar(a: AvaliacaoAdmin) {
    guardarErro(a.id, null);
    const r = await painel.moderar(a.id, "publicado");
    guardarErro(a.id, r.ok ? null : r.erro);
  }

  async function tirarDoSite(a: AvaliacaoAdmin) {
    setErroRemocao(null);
    const r = await painel.moderar(a.id, "recusado");
    if (!r.ok) return setErroRemocao(r.erro);
    guardarErro(a.id, null);
    setConfirmando(null);
  }

  return (
    <div id="secao-avaliacoes" role="tabpanel" aria-labelledby="secao-aba-avaliacoes" tabIndex={0}>
      {painel.erro && <FaixaErro mensagem={painel.erro} aoRecarregar={() => void painel.carregar()} />}

      <div style={{ background: p.white, border: `1px solid ${p.g300}`, borderRadius: 14, padding: "16px 20px", marginBottom: 20 }}>
        <div style={{ fontSize: 12.5, fontWeight: 600, color: p.g500, marginBottom: 6 }}>Nota do demo</div>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 30, color: p.ink }}>
          {painel.carregado ? resumoEmTexto(painel.resumo) : "—"}
        </div>
        <div style={{ fontSize: 12.5, color: p.g500, marginTop: 4 }}>
          O mesmo número que aparece no site (conta as três avaliações antigas e todas as do demo, inclusive as que
          você tirou do ar).
        </div>
      </div>

      {!painel.carregado ? (
        painel.carregando && <Aviso icone="loader">Carregando as avaliações…</Aviso>
      ) : painel.avaliacoes.length === 0 ? (
        <Aviso icone="star">
          Nenhuma avaliação ainda. Quem está com o demo liberado recebe o convite depois de alguns minutos navegando,
          e as respostas aparecem aqui.
        </Aviso>
      ) : (
        <>
          <FaixaAbas
            etiqueta="Situação das avaliações"
            idPrefixo="aba-avaliacao"
            controla="lista-avaliacoes"
            ativa={abaAtiva}
            opcoes={ABAS_AVALIACAO}
            contagem={contagem}
            alerta={{ valor: "pendente", fundo: p.warning, texto: p.ink }}
            aoEscolher={setAba}
          />

          <div id="lista-avaliacoes" style={{ display: "grid", gap: 12 }}>
            {visiveis.length > 0 ? (
              visiveis.map((a) => (
                <LinhaAvaliacao
                  key={a.id}
                  avaliacao={a}
                  ocupado={painel.ocupados.has(a.id)}
                  erro={errosPorId[a.id] ?? null}
                  aoAbrirLead={aoAbrirLead}
                  aoPublicar={() => void publicar(a)}
                  aoTirarDoSite={() => {
                    setErroRemocao(null);
                    setConfirmando(a);
                  }}
                />
              ))
            ) : (
              <Aviso icone="inbox">
                Nenhuma avaliação nesta situação. <LinkAviso aoClicar={() => setAba("todas")}>Ver todas</LinkAviso>
              </Aviso>
            )}
          </div>
        </>
      )}

      {confirmando && (
        <ConfirmarRemocaoAvaliacao
          avaliacao={confirmando}
          ocupado={painel.ocupados.has(confirmando.id)}
          erro={erroRemocao}
          aoCancelar={() => setConfirmando(null)}
          aoConfirmar={() => void tirarDoSite(confirmando)}
        />
      )}
    </div>
  );
}
