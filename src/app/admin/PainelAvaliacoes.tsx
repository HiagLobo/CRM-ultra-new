"use client";
/**
 * Seção "Avaliações" do painel: o cartão com a média que o site mostra, as
 * abas por situação, a lista em cartões e as ações de cada uma. Estados de
 * carregando, erro e lista vazia — nada de tela em branco.
 *
 * O estado e as chamadas moram no `useAvaliacoesAdmin` (carregado lá em cima,
 * junto com os leads); aqui fica a composição.
 */
import * as React from "react";
import { palette as p } from "@/lib/palette";
import type { AvaliacaoAdmin } from "@/features/avaliacao";
import Aviso, { FaixaErro, LinkAviso } from "./Aviso";
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

  const contagem = React.useMemo(() => contarPorAba(painel.avaliacoes), [painel.avaliacoes]);
  const abaAtiva: AbaAvaliacao = aba ?? abaInicial(contagem);
  const visiveis = React.useMemo(() => filtrarPorAba(painel.avaliacoes, abaAtiva), [painel.avaliacoes, abaAtiva]);

  async function publicar(a: AvaliacaoAdmin) {
    const r = await painel.moderar(a.id, "publicado");
    painel.mostrarErro(r.ok ? null : r.erro);
  }

  async function tirarDoSite(a: AvaliacaoAdmin) {
    setErroRemocao(null);
    const r = await painel.moderar(a.id, "recusado");
    if (!r.ok) return setErroRemocao(r.erro);
    setConfirmando(null);
  }

  return (
    <div id="secao-avaliacoes" role="tabpanel">
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
          Nenhuma avaliação ainda. Quem está com o demo liberado recebe o convite depois de alguns minutos navegando —
          as respostas aparecem aqui.
        </Aviso>
      ) : (
        <>
          <div role="tablist" aria-label="Situação das avaliações" style={{ display: "flex", gap: 6, overflowX: "auto", maxWidth: "100%", padding: "2px 2px 8px", marginBottom: 10 }}>
            {ABAS_AVALIACAO.map((a) => {
              const selecionada = a.valor === abaAtiva;
              const alerta = a.valor === "pendente" && contagem.pendente > 0;
              return (
                <button
                  key={a.valor}
                  type="button"
                  role="tab"
                  aria-selected={selecionada}
                  aria-controls="lista-avaliacoes"
                  onClick={() => setAba(a.valor)}
                  style={{
                    flexShrink: 0,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 7,
                    border: `1.5px solid ${selecionada ? p.primary : p.g300}`,
                    background: selecionada ? p.lilac1 : p.white,
                    color: selecionada ? p.dark : p.g700,
                    borderRadius: 999,
                    padding: "7px 13px",
                    fontSize: 13.5,
                    fontWeight: 600,
                    fontFamily: "var(--font-body)",
                    whiteSpace: "nowrap",
                    cursor: "pointer",
                  }}
                >
                  {a.rotulo}
                  <span style={{ minWidth: 20, textAlign: "center", borderRadius: 999, padding: "1px 6px", fontSize: 12, fontWeight: 700, background: alerta ? p.warning : "transparent", color: alerta ? p.white : selecionada ? p.primary : p.g500 }}>
                    {contagem[a.valor]}
                  </span>
                </button>
              );
            })}
          </div>

          <div id="lista-avaliacoes" style={{ display: "grid", gap: 12 }}>
            {visiveis.length > 0 ? (
              visiveis.map((a) => (
                <LinhaAvaliacao
                  key={a.id}
                  avaliacao={a}
                  ocupado={painel.ocupados.has(a.id)}
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
