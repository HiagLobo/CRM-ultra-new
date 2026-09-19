"use client";
/**
 * Ponte entre as regras do tour e a página: acha o elemento de cada passo e
 * espera a tela assentar antes de começar. As decisões ficam em funções puras
 * (`tourPosicao`, `regrasDoTour`); aqui só se mede o DOM.
 */
import * as React from "react";
import { alvoNaTela, estaVisivel, type MedidaDoAlvo, type Viewport } from "@/lib/tourPosicao";
import type { PassoTour } from "@/content/guia";
import { decidirEspera } from "./regrasDoTour";

/** De quanto em quanto tempo a espera confere os alvos de novo. */
const INTERVALO_MS = 100;

export function viewportAtual(): Viewport {
  return { largura: window.innerWidth, altura: window.innerHeight };
}

function medir(el: Element): MedidaDoAlvo {
  const r = el.getBoundingClientRect();
  return {
    caixas: el.getClientRects().length,
    retangulo: { top: r.top, left: r.left, width: r.width, height: r.height },
    invisivel: getComputedStyle(el).visibility === "hidden",
  };
}

/**
 * Primeiro elemento do seletor que dá para destacar. O mesmo `data-tour` pode
 * marcar mais de um elemento — o menu lateral e o botão que abre a gaveta no
 * celular — e vale o que estiver na tela.
 */
export function localizarAlvo(seletor: string): Element | null {
  const viewport = viewportAtual();
  for (const el of Array.from(document.querySelectorAll(seletor))) {
    if (alvoNaTela(medir(el), viewport)) return el;
  }
  return null;
}

/** Índices dos passos cujo alvo dá para destacar agora, em ordem. */
export function passosDisponiveis(passos: PassoTour[]): number[] {
  return passos.flatMap((passo, i) => (localizarAlvo(passo.alvo) ? [i] : []));
}

/**
 * Traz o alvo para dentro da tela e diz se ele ficou visível nos dois eixos.
 * A rolagem é instantânea de propósito: a medida logo em seguida precisa ver a
 * posição nova (rolagem suave ainda estaria no meio do caminho). O recorte tem
 * transição própria, então o salto não aparece seco.
 */
export function trazerParaTela(el: Element): boolean {
  if (estaVisivel(medir(el).retangulo, viewportAtual())) return true;
  el.scrollIntoView({ block: "center", inline: "nearest", behavior: "instant" });
  return estaVisivel(medir(el).retangulo, viewportAtual());
}

/**
 * Espera os alvos aparecerem (a tela pode ainda estar no esqueleto de
 * carregamento). Devolve os passos disponíveis quando decidir abrir e chama
 * `aoDesistir` se, no teto, não houver alvo nenhum.
 */
export function useEsperaDosAlvos(passos: PassoTour[], aoDesistir: () => void): number[] | null {
  const [prontos, setProntos] = React.useState<number[] | null>(null);
  const desistir = React.useRef(aoDesistir);
  desistir.current = aoDesistir;

  React.useEffect(() => {
    setProntos(null);
    const inicio = Date.now();
    let chaveAnterior = "";
    let mudouEm = inicio;
    let espera = 0;

    const conferir = () => {
      const agora = Date.now();
      const disponiveis = passosDisponiveis(passos);
      const chave = disponiveis.join(",");
      if (chave !== chaveAnterior) {
        chaveAnterior = chave;
        mudouEm = agora;
      }
      const decisao = decidirEspera({
        presentes: disponiveis.length,
        total: passos.length,
        decorridoMs: agora - inicio,
        estavelHaMs: agora - mudouEm,
      });
      if (decisao === "abrir") setProntos(disponiveis);
      else if (decisao === "desistir") desistir.current();
      else espera = window.setTimeout(conferir, INTERVALO_MS);
    };

    conferir();
    return () => window.clearTimeout(espera);
  }, [passos]);

  return prontos;
}
