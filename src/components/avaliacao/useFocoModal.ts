"use client";
/**
 * O que falta à moldura do fluxo de acesso para o modal da avaliação fechar o
 * padrão de diálogo (WAI-ARIA):
 *
 * 1. o foco entra no primeiro controle ao abrir;
 * 2. o Tab **não sai** do diálogo (vai e volta entre o primeiro e o último);
 * 3. ao fechar, o foco volta para onde estava (o cartão do convite ou o link do
 *    Guia), e não para o começo da página.
 *
 * Mora aqui, e não na moldura compartilhada, para não mexer no fluxo de acesso.
 */
import * as React from "react";

/** O que o Tab alcança dentro do diálogo (a estrela com `tabindex="-1"` fica de fora). */
const FOCAVEIS =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function focaveisDe(raiz: HTMLElement | null): HTMLElement[] {
  if (!raiz) return [];
  // `getClientRects` pega o que está de fato na tela; `offsetParent` mentiria
  // dentro do overlay, que é `position: fixed`
  return Array.from(raiz.querySelectorAll<HTMLElement>(FOCAVEIS)).filter(
    (el) => el.getClientRects().length > 0,
  );
}

export function useFocoModal(caixa: React.RefObject<HTMLElement>) {
  React.useEffect(() => {
    const raiz = caixa.current;
    const anterior = document.activeElement as HTMLElement | null;

    // primeiro controle do formulário: a nota. Sem ele (tela de agradecimento),
    // o primeiro focável serve — o foco nunca fica solto no fundo da página.
    const primeiroControle =
      raiz?.querySelector<HTMLElement>('[role="radio"][tabindex="0"]') ?? focaveisDe(raiz)[0];
    primeiroControle?.focus();

    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      // a lista é refeita a cada Tab: o conteúdo muda (formulário → agradecimento)
      const lista = focaveisDe(raiz);
      if (lista.length === 0) return;
      const primeiro = lista[0]!;
      const ultimo = lista[lista.length - 1]!;
      const ativo = document.activeElement;
      const fora = !raiz?.contains(ativo);

      if (e.shiftKey && (ativo === primeiro || fora)) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && (ativo === ultimo || fora)) {
        e.preventDefault();
        primeiro.focus();
      }
    };

    document.addEventListener("keydown", aoTeclar);
    return () => {
      document.removeEventListener("keydown", aoTeclar);
      // o convite some junto com o modal: só devolve o foco se o elemento ainda existe
      if (anterior && document.contains(anterior)) anterior.focus();
    };
  }, [caixa]);
}
