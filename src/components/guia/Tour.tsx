"use client";
/**
 * Tour guiado: escurece a tela, recorta o elemento da vez e explica num balão.
 *
 * Diferente do guia do drawer (passivo, só responde se a pessoa clicar), este é
 * ativo — leva pela mão na primeira visita, que é justamente quando ninguém sabe
 * o que cada parte do menu faz.
 *
 * Decisões que importam:
 * - **Passo sem elemento na tela é pulado**, não trava o tour. No celular a
 *   barra lateral não existe, e metade dos alvos some junto.
 * - O recorte acompanha a tela a cada quadro: rolagem, resize e layout que
 *   assenta depois do carregamento moviam o buraco para o lugar errado.
 * - O fundo escuro **não** bloqueia clique no elemento destacado: quem quiser
 *   experimentar no meio da explicação, experimenta.
 */
import * as React from "react";
import { palette as p } from "@/lib/palette";
import { Ic } from "@/components/Icon";
import {
  posicaoDoBalao,
  larguraDoBalao,
  estaVisivel,
  type Retangulo,
} from "@/lib/tourPosicao";
import type { PassoTour } from "@/content/guia";

const ALTURA_ESTIMADA = 190; // usada só para escolher o lado; o balão ajusta sozinho

export default function Tour({
  passos,
  aoSair,
}: {
  passos: PassoTour[];
  /** `concluiu` = chegou ao fim (em vez de pular). */
  aoSair: (concluiu: boolean) => void;
}) {
  const [indice, setIndice] = React.useState(0);
  const [alvo, setAlvo] = React.useState<Retangulo | null>(null);
  const [viewport, setViewport] = React.useState({ largura: 0, altura: 0 });

  // só os passos cujo elemento existe agora (mobile esconde a barra lateral)
  const visiveis = React.useMemo(
    () => passos.filter((passo) => document.querySelector(passo.alvo)),
    [passos],
  );
  const passo = visiveis[indice];

  const sair = React.useRef(aoSair);
  sair.current = aoSair;

  // nenhum alvo na tela: não faz sentido abrir o tour
  React.useEffect(() => {
    if (visiveis.length === 0) sair.current(false);
  }, [visiveis.length]);

  // traz o elemento para a área visível ao trocar de passo
  React.useEffect(() => {
    if (!passo) return;
    const el = document.querySelector(passo.alvo);
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (!estaVisivel(r, { largura: window.innerWidth, altura: window.innerHeight })) {
      el.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  }, [passo]);

  // acompanha o elemento quadro a quadro (rolagem, resize, layout assentando)
  React.useEffect(() => {
    if (!passo) return;
    let quadro = 0;
    let anterior = "";

    const medir = () => {
      const el = document.querySelector(passo.alvo);
      if (el) {
        const r = el.getBoundingClientRect();
        const chave = `${r.top}|${r.left}|${r.width}|${r.height}|${window.innerWidth}`;
        if (chave !== anterior) {
          anterior = chave;
          setAlvo({ top: r.top, left: r.left, width: r.width, height: r.height });
          setViewport({ largura: window.innerWidth, altura: window.innerHeight });
        }
      }
      quadro = requestAnimationFrame(medir);
    };
    quadro = requestAnimationFrame(medir);
    return () => cancelAnimationFrame(quadro);
  }, [passo]);

  /**
   * O `sair` fica FORA do updater de estado de propósito. Chamado lá dentro,
   * ele rodava durante o render e disparava o clássico "Cannot update a
   * component while rendering a different component" — o updater tem de ser
   * função pura.
   */
  const avancar = React.useCallback(() => {
    if (indice + 1 >= visiveis.length) {
      sair.current(true);
      return;
    }
    setIndice(indice + 1);
  }, [indice, visiveis.length]);

  const voltar = React.useCallback(() => setIndice((i) => Math.max(0, i - 1)), []);

  React.useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape") sair.current(false);
      if (e.key === "ArrowRight" || e.key === "Enter") avancar();
      if (e.key === "ArrowLeft") voltar();
    };
    document.addEventListener("keydown", aoTeclar);
    return () => document.removeEventListener("keydown", aoTeclar);
  }, [avancar, voltar]);

  if (!passo || !alvo || viewport.largura === 0) return null;

  const largura = larguraDoBalao(viewport);
  const { top, left } = posicaoDoBalao(alvo, viewport, { largura, altura: ALTURA_ESTIMADA });
  const ultimo = indice === visiveis.length - 1;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 400, pointerEvents: "none" }}>
      {/* recorte: a sombra gigante escurece tudo, menos o buraco */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          top: alvo.top - 6,
          left: alvo.left - 6,
          width: alvo.width + 12,
          height: alvo.height + 12,
          borderRadius: 12,
          boxShadow: `0 0 0 9999px rgba(28,10,46,.72)`,
          outline: `2px solid ${p.light}`,
          transition: "top .18s ease, left .18s ease, width .18s ease, height .18s ease",
        }}
      />

      <div
        role="dialog"
        aria-modal="false"
        aria-labelledby="tour-titulo"
        style={{
          position: "fixed",
          top,
          left,
          width: largura,
          background: "#fff",
          borderRadius: 14,
          boxShadow: "0 24px 60px rgba(20,6,38,.4)",
          padding: 18,
          pointerEvents: "auto",
          fontFamily: "var(--font-body)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: p.primary }}>
            Passo {indice + 1} de {visiveis.length}
          </span>
          <button
            type="button"
            onClick={() => sair.current(false)}
            style={{ marginLeft: "auto", background: "none", border: "none", padding: 2, cursor: "pointer", color: p.g500, display: "grid" }}
            aria-label="Fechar o tour"
          >
            <Ic n="x" s={16} c={p.g500} />
          </button>
        </div>

        <h3 id="tour-titulo" style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, margin: "0 0 6px", color: p.ink }}>
          {passo.titulo}
        </h3>
        <p style={{ fontSize: 14, lineHeight: 1.55, color: p.g700, margin: 0 }}>{passo.texto}</p>

        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 16 }}>
          <button
            type="button"
            onClick={() => sair.current(false)}
            style={{ background: "none", border: "none", padding: 0, color: p.g500, fontSize: 13, cursor: "pointer", fontFamily: "var(--font-body)" }}
          >
            Pular
          </button>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            {indice > 0 && (
              <button
                type="button"
                onClick={voltar}
                style={{ border: `1.5px solid ${p.g300}`, background: "#fff", color: p.g700, borderRadius: 999, padding: "9px 16px", fontSize: 13.5, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-body)" }}
              >
                Anterior
              </button>
            )}
            <button
              type="button"
              onClick={avancar}
              className="ds-btnpop"
              style={{ border: "none", background: p.primary, color: "#fff", borderRadius: 999, padding: "9px 18px", fontSize: 13.5, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 7, fontFamily: "var(--font-body)" }}
            >
              {ultimo ? "Concluir" : "Próximo"}
              {!ultimo && <Ic n="arrow-right" s={15} c="#fff" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
