"use client";
/**
 * Painel de leads: contagens, busca/filtro, lista e follow-up.
 * O estado e as chamadas à API moram em `useLeadsAdmin`; aqui fica a composição.
 * Estados de carregando, erro, lista vazia e filtro sem resultado — nada de
 * tela em branco.
 */
import * as React from "react";
import { palette as p } from "@/lib/palette";
import { brand } from "@/config/brand";
import { Ic } from "@/components/Icon";
import type { LeadAdmin, ResumoLeads } from "@/features/lead/admin";
import TabelaLeads from "./TabelaLeads";
import BarraFiltros from "./BarraFiltros";
import ConfirmarExclusao from "./ConfirmarExclusao";
import { useLeadsAdmin } from "./useLeadsAdmin";
import { contarPorFiltro, filtrarLeads, textoContagem, type FiltroStatus } from "./filtroLeads";
import { acao } from "./estilos";

const CARDS: { chave: Exclude<keyof ResumoLeads, "porEtapa">; rotulo: string; sufixo?: string }[] = [
  { chave: "total", rotulo: "Pedidos de acesso" },
  { chave: "verificados", rotulo: "E-mail confirmado" },
  { chave: "emAndamento", rotulo: "Em andamento" },
  { chave: "conversaoPct", rotulo: "Conversão em cliente", sufixo: "%" },
];

export default function PainelLeads() {
  const painel = useLeadsAdmin();
  const [busca, setBusca] = React.useState("");
  const [status, setStatus] = React.useState<FiltroStatus>("todos");
  const [confirmando, setConfirmando] = React.useState<LeadAdmin | null>(null);

  const visiveis = React.useMemo(
    () => filtrarLeads(painel.leads, { busca, status }),
    [painel.leads, busca, status],
  );
  const contagem = React.useMemo(() => contarPorFiltro(painel.leads, busca), [painel.leads, busca]);

  async function excluir(lead: LeadAdmin) {
    if (await painel.excluir(lead.id)) setConfirmando(null);
  }

  function limparFiltros() {
    setBusca("");
    setStatus("todos");
  }

  return (
    <div style={{ minHeight: "100vh", background: p.page }}>
      <header style={{ background: "#fff", borderBottom: `1px solid ${p.g300}` }}>
        {/* celular: só ícones nos botões e sem o título, senão "Sair" sai da tela */}
        <style>{`@media (max-width: 640px) { .adm-titulo, .adm-rotulo { display: none; } .adm-topo { padding: 0 16px !important; gap: 10px !important; } .adm-topo img { height: 36px !important; } }`}</style>
        <div className="ds-pad adm-topo" style={{ maxWidth: 1240, margin: "0 auto", padding: "0 32px", height: 72, display: "flex", alignItems: "center", gap: 16 }}>
          <img src="/assets/logo.svg" alt={brand.nome} style={{ height: 44 }} />
          <span className="adm-titulo" style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, color: p.ink }}>
            Painel de leads
          </span>
          <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
            <button
              type="button"
              onClick={() => void painel.exportar()}
              aria-label="Exportar CSV"
              disabled={painel.exportando}
              className="ds-btnpop"
              style={{ ...acao(p.primary, true), opacity: painel.exportando ? 0.7 : 1 }}
            >
              <Ic n="download" s={16} c="#fff" /> <span className="adm-rotulo">{painel.exportando ? "Exportando…" : "Exportar CSV"}</span>
            </button>
            <button type="button" onClick={() => void painel.sair()} aria-label="Sair" style={acao(p.g500, false)}>
              <Ic n="log-out" s={16} c={p.g700} /> <span className="adm-rotulo">Sair</span>
            </button>
          </div>
        </div>
      </header>

      <main className="ds-pad" style={{ maxWidth: 1240, margin: "0 auto", padding: "32px" }}>
        {painel.erro && (
          <div role="alert" style={{ display: "flex", alignItems: "center", gap: 9, background: `${p.error}14`, border: `1px solid ${p.error}55`, borderRadius: 12, padding: "12px 14px", fontSize: 14, marginBottom: 20 }}>
            <Ic n="alert-triangle" s={17} c={p.error} /> {painel.erro}
            <button type="button" onClick={() => void painel.carregar()} style={{ marginLeft: "auto", background: "none", border: "none", color: p.primary, fontWeight: 700, cursor: "pointer", fontSize: 13.5 }}>
              Recarregar
            </button>
          </div>
        )}

        <div className="ds-cards" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
          {CARDS.map((c) => (
            <div key={c.chave} style={{ background: "#fff", border: `1px solid ${p.g300}`, borderRadius: 14, padding: 20 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: p.g500, marginBottom: 8 }}>{c.rotulo}</div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 30, color: p.ink }}>
                {painel.resumo ? `${painel.resumo[c.chave]}${c.sufixo ?? ""}` : "—"}
              </div>
            </div>
          ))}
        </div>

        {!painel.resumo ? (
          // sem dados ainda: carregando, ou a falha já está no aviso acima
          painel.carregando && <Aviso icone="loader">Carregando os leads…</Aviso>
        ) : painel.leads.length === 0 ? (
          <Aviso icone="inbox">
            Nenhum pedido de acesso ainda. Assim que alguém preencher o formulário da landing, ele
            aparece aqui.
          </Aviso>
        ) : (
          <>
            <BarraFiltros
              busca={busca}
              status={status}
              contagem={contagem}
              textoTotal={textoContagem(visiveis.length, painel.leads.length)}
              aoBuscar={setBusca}
              aoFiltrar={setStatus}
            />
            {visiveis.length === 0 ? (
              <Aviso icone="search-x">
                Nenhum lead com esse filtro.{" "}
                <button type="button" onClick={limparFiltros} style={{ background: "none", border: "none", padding: 0, color: p.primary, fontWeight: 700, cursor: "pointer", fontSize: "inherit", fontFamily: "inherit" }}>
                  Limpar busca e filtro
                </button>
              </Aviso>
            ) : (
              <TabelaLeads
                leads={visiveis}
                ocupado={painel.ocupado}
                aoMudarStatus={(id, s) => void painel.mudarStatus(id, s)}
                aoExcluir={setConfirmando}
              />
            )}
          </>
        )}
      </main>

      {confirmando && (
        <ConfirmarExclusao
          lead={confirmando}
          ocupado={painel.ocupado === confirmando.id}
          aoCancelar={() => setConfirmando(null)}
          aoConfirmar={() => void excluir(confirmando)}
        />
      )}
    </div>
  );
}

function Aviso({ icone, children }: { icone: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "#fff", border: `1px dashed ${p.g300}`, borderRadius: 16, padding: 48, textAlign: "center", color: p.g500 }}>
      <div style={{ width: 50, height: 50, borderRadius: "50%", background: p.lilac1, display: "grid", placeItems: "center", margin: "0 auto 14px" }}>
        <Ic n={icone} s={24} c={p.primary} />
      </div>
      <div style={{ fontSize: 14.5, maxWidth: 420, margin: "0 auto", lineHeight: 1.6 }}>{children}</div>
    </div>
  );
}
