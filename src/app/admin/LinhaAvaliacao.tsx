"use client";
/**
 * Uma avaliação na lista do painel: estrelas, trecho do comentário, quem deu
 * (abre a ficha do lead), como escolheu aparecer, a situação e o dia. Para o
 * que o filtro segurou, o motivo em português.
 *
 * É um CARTÃO, e não uma linha de tabela: no celular empilha sem estouro
 * lateral, e no computador continua legível. Confirmação só na remoção — pôr
 * de volta no ar não estraga nada.
 *
 * Foco (revisão da O10·S3, mesma regra do `BlocoCreci`): os dois botões ficam
 * SEMPRE montados; o que não se aplica agora é `aria-disabled` e ignora o
 * clique, e a situação em vigor é `aria-pressed`. Assim o foco do teclado nunca
 * cai para o começo da página depois de publicar ou tirar do ar. A situação é
 * anunciada (`role="status"`), e o erro da ação aparece no próprio cartão.
 */
import * as React from "react";
import { palette as p } from "@/lib/palette";
import { Ic } from "@/components/Icon";
import { estrelasEmTexto } from "@/features/avaliacao/avaliacao";
import type { AvaliacaoAdmin } from "@/features/avaliacao/admin";
import { botaoContorno, caixaErro } from "./estilos";
import {
  COR_SITUACAO,
  ROTULO_IDENTIFICACAO,
  ROTULO_SITUACAO,
  SEM_COMENTARIO,
  diaDaAvaliacao,
  motivoDaPendente,
  quemAvaliou,
  trecho,
} from "./rotulosAvaliacao";

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

export default function LinhaAvaliacao({
  avaliacao,
  ocupado,
  erro,
  aoAbrirLead,
  aoPublicar,
  aoTirarDoSite,
}: {
  avaliacao: AvaliacaoAdmin;
  ocupado: boolean;
  /** Falha da última ação nesta avaliação — mostrada aqui, onde o fundador clicou. */
  erro: string | null;
  aoAbrirLead: (leadId: string) => void;
  aoPublicar: () => void;
  aoTirarDoSite: () => void;
}) {
  const motivo = motivoDaPendente(avaliacao);
  const noSite = avaliacao.status === "publicado";
  const foraDoSite = avaliacao.status === "recusado";

  /** Clique que não se aplica (salvando, ou já está assim) não faz nada — e o foco fica onde está. */
  const aoClicar = (jaEsta: boolean, acao: () => void) => () => {
    if (ocupado || jaEsta) return;
    acao();
  };

  return (
    <article style={{ background: p.white, border: `1px solid ${p.g300}`, borderRadius: 14, padding: "14px 16px", display: "grid", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <span role="img" aria-label={`${avaliacao.estrelas} de 5 estrelas`} style={{ color: p.gold, fontSize: 17, letterSpacing: 1 }}>
          {estrelasEmTexto(avaliacao.estrelas)}
        </span>
        <span style={selo(COR_SITUACAO[avaliacao.status])}>{ROTULO_SITUACAO[avaliacao.status]}</span>
        <span style={{ fontSize: 12.5, color: p.g500 }}>{ROTULO_IDENTIFICACAO[avaliacao.identificacao]}</span>
        <span style={{ fontSize: 12.5, color: p.g500, marginLeft: "auto" }}>{diaDaAvaliacao(avaliacao.criadoEm)}</span>
      </div>

      <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.6, color: avaliacao.comentario ? p.ink : p.g500, overflowWrap: "anywhere" }}>
        {avaliacao.comentario ? trecho(avaliacao.comentario) : SEM_COMENTARIO}
      </p>

      {motivo && (
        <p style={{ margin: 0, fontSize: 13, color: p.g700, display: "flex", alignItems: "center", gap: 6 }}>
          <Ic n="alert-triangle" s={14} c={p.warning} /> {motivo}
        </p>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={() => aoAbrirLead(avaliacao.leadId)}
          title="Abrir a ficha de quem avaliou"
          style={{ background: "none", border: "none", padding: 0, color: p.primary, fontWeight: 700, fontSize: 13.5, fontFamily: "var(--font-body)", cursor: "pointer", textAlign: "left", overflowWrap: "anywhere" }}
        >
          {quemAvaliou(avaliacao.autor)}
        </button>
        <div role="group" aria-label="Situação no site" style={{ display: "flex", gap: 8, marginLeft: "auto", flexWrap: "wrap" }}>
          <button
            type="button"
            aria-pressed={noSite}
            aria-disabled={ocupado || undefined}
            onClick={aoClicar(noSite, aoPublicar)}
            style={noSite ? { ...botaoContorno(p.success), background: `${p.success}14`, cursor: "default" } : botaoContorno(p.success, ocupado)}
          >
            <Ic n="check" s={14} c="currentColor" /> Publicar
          </button>
          <button
            type="button"
            aria-pressed={foraDoSite}
            aria-disabled={ocupado || undefined}
            onClick={aoClicar(foraDoSite, aoTirarDoSite)}
            style={foraDoSite ? { ...botaoContorno(p.error), background: `${p.error}14`, cursor: "default" } : botaoContorno(p.error, ocupado)}
          >
            <Ic n="eye-off" s={14} c="currentColor" /> Tirar do site
          </button>
        </div>
      </div>

      <p role="status" style={{ margin: 0, fontSize: 12.5, color: p.g500 }}>
        {ocupado ? "Salvando…" : `No site: ${noSite ? "sim" : "não"}`}
      </p>
      {erro && <div role="alert" style={caixaErro}>{erro}</div>}
    </article>
  );
}
