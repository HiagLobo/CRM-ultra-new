# O3 · S2 — Guia contextual (drawer + dicas)

## O que entrega (negócio)
Um botão de ajuda sempre à mão que abre um guia com dicas da seção em que a pessoa está (ex.: no
funil do corretor, explica o que é cada coluna). Ajuda quem está explorando sem ler manual.

## Revalidação ao iniciar
- [ ] S1 concluída (catálogo `guia.ts` e `guiaState` existem)?
- [ ] Como saber a seção atual? (rota/pathname via `usePathname`).

## Mapear (≤5 linhas)
- Entrega: FAB de ajuda + drawer com dicas por rota. Sem PII.
- Cria: `HelpFab.tsx`, `GuiaDrawer.tsx`; estende `guia.ts` com dicas por seção/rota.
- Sem corrida. Caminho simples: mapear `pathname` → chave de seção → dicas.

## Pode tocar
- `src/components/guia/HelpFab.tsx` · `src/components/guia/GuiaDrawer.tsx` ·
  `src/content/guia.ts` (add `secoes[]` por rota) · `src/lib/guiaState.ts` (recolhido/aberto) ·
  montagem nos 3 chromes/layouts

## Passos
1. Estender `guia.ts`: `secoes` mapeando rota → `{ titulo, dicas[] }` para as principais telas de cada
   painel (corretor: funil, atendimento, imóveis, radar; ceo: visão-geral, associados, financeiro;
   franqueado: visão da unidade, time, leads).
2. `HelpFab`: botão flutuante (canto) com ícone de ajuda; abre `GuiaDrawer`.
3. `GuiaDrawer`: lê `usePathname` → escolhe seção → lista dicas; fallback p/ dicas gerais do painel se
   a rota não tiver entrada. Botão recolher (estado persistido). Não bloqueia a tela (overlay lateral).
4. Montar FAB+drawer nos 3 painéis.

## Pronto quando
- [ ] FAB visível nos painéis; drawer mostra dicas corretas conforme a tela.
- [ ] Rotas sem entrada caem no fallback (sem tela vazia).
- [ ] Estado (aberto/recolhido) persistido; navegação não é bloqueada.
- [ ] **Critérios de aceite da O3** verdes → atualizar `00-INDEX.md`. `build`/`typecheck` limpos.

## Não fazer
- Sem highlight/tour passo-a-passo com setas (fica como melhoria futura, anotar no ESTADO).
