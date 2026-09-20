"use client";
/**
 * `/admin/orcamento/[id]` na tela: barra do painel (Voltar, situação e Baixar
 * PDF) e, abaixo dela, a folha A4. No papel a barra some e sobra o documento
 * (ver o bloco de impressão em `globals.css`).
 *
 * "Baixar PDF" é a impressão do navegador (`window.print()`): o próprio diálogo
 * oferece "Salvar como PDF", e nenhuma biblioteca nova entra no projeto.
 *
 * Falha nunca fica muda: sem conexão, orçamento apagado ou resposta estranha
 * viram texto na tela, com "Tentar de novo".
 */
import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { palette as p } from "@/lib/palette";
import { Ic } from "@/components/Icon";
import Aviso from "../Aviso";
import { acao } from "../estilos";
import { buscarOrcamento, type BuscaOrcamento } from "./api";
import { ORCAMENTO_EXEMPLO } from "./exemplo";
import FolhaOrcamento from "./FolhaOrcamento";
import { ROTULO_SITUACAO } from "./tiposOrcamento";

/** `/admin/orcamento/exemplo` desenha a folha sem API, só em desenvolvimento. */
const ehExemplo = (id: string) => id === "exemplo" && process.env.NODE_ENV !== "production";

function Situacao({ busca }: { busca: BuscaOrcamento | null }) {
  if (busca?.estado !== "ok") return null;
  return (
    <span
      style={{
        fontSize: 13,
        fontWeight: 700,
        color: p.dark,
        background: p.lilac1,
        border: `1px solid ${p.lilac2}`,
        borderRadius: 999,
        padding: "6px 12px",
        whiteSpace: "nowrap",
      }}
    >
      {ROTULO_SITUACAO[busca.orcamento.situacao]}
    </span>
  );
}

export default function DocumentoOrcamento({ id }: { id: string }) {
  const router = useRouter();
  const [busca, setBusca] = React.useState<BuscaOrcamento | null>(() =>
    ehExemplo(id) ? { estado: "ok", orcamento: ORCAMENTO_EXEMPLO } : null,
  );

  const carregar = React.useCallback(async () => {
    if (ehExemplo(id)) {
      setBusca({ estado: "ok", orcamento: ORCAMENTO_EXEMPLO });
      return;
    }
    setBusca(null);
    const resultado = await buscarOrcamento(id);
    if (resultado.estado === "sessao") {
      router.replace("/admin/login");
      return;
    }
    setBusca(resultado);
  }, [id, router]);

  React.useEffect(() => {
    void carregar();
  }, [carregar]);

  /** O título da aba vira o nome sugerido do PDF: "Proposta ORC-2026-007.pdf". */
  React.useEffect(() => {
    if (busca?.estado !== "ok") return;
    const anterior = document.title;
    document.title = `Proposta ${busca.orcamento.numero}`;
    return () => {
      document.title = anterior;
    };
  }, [busca]);

  return (
    <div className="orc-tela" style={{ minHeight: "100vh", background: p.page, paddingBottom: 40 }}>
      <header
        className="orc-naoimprime"
        style={{
          background: p.white,
          borderBottom: `1px solid ${p.g300}`,
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        <Link href="/admin" style={acao(p.g500, false)} aria-label="Voltar para o painel">
          <Ic n="arrow-left" s={16} c={p.g700} /> Voltar
        </Link>
        <Situacao busca={busca} />
        <button
          type="button"
          onClick={() => window.print()}
          disabled={busca?.estado !== "ok"}
          aria-label="Baixar PDF do orçamento"
          style={{ ...acao(p.primary, true), marginLeft: "auto", opacity: busca?.estado === "ok" ? 1 : 0.6 }}
        >
          <Ic n="download" s={16} c={p.white} /> Baixar PDF
        </button>
      </header>

      <main style={{ padding: "22px 16px 0" }}>
        {busca === null && <Aviso icone="loader">Abrindo o orçamento…</Aviso>}

        {busca?.estado === "nao_encontrado" && (
          <Aviso icone="search-x">
            Esse orçamento não existe mais (pode ter sido excluído junto com o lead). Volte ao painel e abra a lista de
            orçamentos.
          </Aviso>
        )}

        {busca?.estado === "erro" && (
          <Aviso icone="alert-triangle">
            <span role="alert">{busca.mensagem}</span>
            <div style={{ marginTop: 14 }}>
              <button type="button" onClick={() => void carregar()} style={acao(p.primary, true)}>
                <Ic n="repeat" s={16} c={p.white} /> Tentar de novo
              </button>
            </div>
          </Aviso>
        )}

        {busca?.estado === "ok" && <FolhaOrcamento orcamento={busca.orcamento} />}
      </main>
    </div>
  );
}
