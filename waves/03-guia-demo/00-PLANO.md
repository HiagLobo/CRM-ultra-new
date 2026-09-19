# O3 · PLANO — Guia do Demo

## Resultado da onda
Camada de orientação sobre os painéis: banner de modo demo, boas-vindas por painel e guia
contextual por seção — tudo alimentado por um catálogo único de conteúdo.

## Baseline de reuso
- Chrome dos painéis: `src/components/ceo/CeoChrome.tsx`, `src/components/corretor/CorretorChrome.tsx`,
  `src/app/franqueado/page.tsx` (header próprio). É onde o banner/ajuda se encaixam.
- `Icon.tsx`, CSS vars `--brand-*`, `demoAccess` (O2).

## Estrutura nova
```
src/components/guia/DemoBanner.tsx     faixa fixa "modo demonstração"
src/components/guia/WelcomeModal.tsx   boas-vindas por painel (1x)
src/components/guia/GuiaDrawer.tsx     drawer com passos/dicas da seção atual
src/components/guia/HelpFab.tsx        botão flutuante de ajuda
src/content/guia.ts                    CATÁLOGO: textos por painel/seção (única fonte)
src/lib/guiaState.ts                   dismissal/visto em localStorage
```

## Decisões
- **Conteúdo separado do componente** (`src/content/guia.ts`) para você editar textos sem mexer em UI.
- Flag `brand.demoMode` (ou env) liga/desliga o banner — quando virar produto real, desliga.
- Persistência só de UX (localStorage): "já vi o painel X", "guia recolhido".

## Ordem
1. **S1** banner + boas-vindas. 2. **S2** drawer + dicas + FAB.

## Revalidação ao iniciar
- [ ] O2·S3 concluída (entra-se nos painéis via demo)?
- [ ] Onde injetar sem quebrar layout: dentro de cada `*Chrome`/layout de painel.

## Não fazer
- Sem admin (O4). Sem mudar dados/telas do painel — só sobrepor orientação.
