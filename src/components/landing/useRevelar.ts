"use client";
/**
 * Revela os blocos `.lp-rise` conforme entram na tela.
 *
 * Duas travas contra o pior caso desse padrão — conteúdo que **nunca aparece**:
 * 1. sem `IntersectionObserver` (navegador antigo), revela tudo de uma vez;
 * 2. quem já está visível no primeiro quadro é revelado na hora, sem esperar
 *    rolagem — senão o que nasce acima da dobra ficaria invisível.
 *
 * Observa também o que chega depois (o React monta seções aos poucos).
 */
import * as React from "react";

export function useRevelar(): void {
  React.useEffect(() => {
    const alvos = () => Array.from(document.querySelectorAll<HTMLElement>(".lp-rise:not(.in)"));

    if (typeof IntersectionObserver === "undefined") {
      alvos().forEach((el) => el.classList.add("in"));
      return;
    }

    const observador = new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) {
          if (!entrada.isIntersecting) continue;
          entrada.target.classList.add("in");
          observador.unobserve(entrada.target);
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.05 },
    );

    alvos().forEach((el) => observador.observe(el));

    // seções montadas depois do primeiro render entram na observação
    const mutacoes = new MutationObserver(() => alvos().forEach((el) => observador.observe(el)));
    mutacoes.observe(document.body, { childList: true, subtree: true });

    return () => {
      observador.disconnect();
      mutacoes.disconnect();
    };
  }, []);
}
