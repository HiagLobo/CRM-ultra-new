# O3 · S1 — Modo demonstração + boas-vindas

## O que entrega (negócio)
Ao entrar em qualquer painel, fica claro que é uma demonstração (banner) e aparece uma boas-vindas
explicando o que aquele painel faz — uma vez só, sem incomodar nas próximas visitas.

## Revalidação ao iniciar
- [ ] Onde fica o topo de cada painel? (`CeoChrome`, `CorretorChrome`, header do `franqueado`).
- [ ] `demoAccess`/sessão de persona disponível para saber qual painel está aberto.

## Mapear (≤5 linhas)
- Entrega: banner fixo + modal por painel. Sem PII/secret.
- Cria: `DemoBanner.tsx`, `WelcomeModal.tsx`, `src/content/guia.ts`, `src/lib/guiaState.ts`.
  Modifica: os 3 chromes/layouts p/ montar banner+modal.
- Sem corrida. Caminho simples: componente client lê painel atual + flag + estado local.

## Pode tocar
- `src/components/guia/DemoBanner.tsx` · `src/components/guia/WelcomeModal.tsx` ·
  `src/content/guia.ts` (catálogo) · `src/lib/guiaState.ts` · `src/components/ceo/CeoChrome.tsx` ·
  `src/components/corretor/CorretorChrome.tsx` · `src/app/franqueado/page.tsx` (montagem)

## Passos
1. `guia.ts`: catálogo `{ corretor, ceo, franqueado }` → cada um com `titulo`, `resumo`, `passos[]`.
2. `guiaState.ts`: `jaViu(painel)`, `marcarVisto(painel)`, `bannerOculto()` (localStorage).
3. `DemoBanner`: faixa fina no topo do painel — "🔎 Modo demonstração · dados fictícios" + link
   "saber mais" (abre modal) + fechar. Usar offset p/ não cobrir conteúdo. Respeita `brand.demoMode`.
4. `WelcomeModal`: ao entrar no painel, se `!jaViu(painel)` → abre com `titulo/resumo/passos`;
   "começar" → `marcarVisto`. Acessível (foco/ESC).
5. Montar banner+modal nos 3 chromes/headers.

## Pronto quando
- [ ] Banner aparece nos 3 painéis e some com a flag desligada.
- [ ] Modal abre 1x por painel; não reaparece após visto (persistido).
- [ ] Layout dos painéis intacto (sem cobrir conteúdo). `build`/`typecheck` limpos.

## Não fazer
- Sem dicas por seção/drawer (S2).
