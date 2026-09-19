# O2 · PLANO — Landing & Gate

## Resultado da onda
Landing de marketing em `/`, fluxo de captura/verificação ligado à O1, e gate que exige o token de
demo para abrir os 3 painéis.

## Baseline de reuso (não recriar)
- Componentes de site: `src/components/site/{SiteNavbar,SiteHero,SiteComponents,FavCompare}.tsx`
  (reaproveitar navbar/footer/cards; ajustar copy p/ produto).
- `src/components/Icon.tsx`, CSS vars `--brand-*` (O0), `src/config/brand.ts`.
- Auth do protótipo: `src/lib/auth.ts` (`mockAuth`, `homeForPerfil`, `DEMO_USERS`),
  `src/components/AuthGate.tsx`, layouts `corretor|ceo|franqueado/layout.tsx`.
- Rotas da O1: `POST /api/lead`, `POST /api/lead/verify`.

## Estrutura nova
```
src/app/page.tsx                  -> reescrita: landing de marketing (hoje é portal)
src/components/landing/*          -> seções da landing (hero, features, planos-fake, prova, cta)
src/components/acesso/AccessFlow.tsx  -> modal/stepper: dados -> código -> sucesso
src/app/demo/portal/...           -> (opcional) realocar a home-portal atual como demo
src/lib/demoAccess.ts             -> ler/checar token de demo no client (espelho do cookie)
```

## Decisões
- Landing e fluxo de captura: o "Acessar CRM" abre `AccessFlow` (modal) em qualquer página.
- "Conhecer CRM": rola para as seções (ou página `/conhecer`). Manter simples: âncoras na própria `/`.
- Gate: `AuthGate` ganha checagem de **token de demo** (além da sessão de persona). Sem token →
  `/` (ou `/acesso`). Token presente + escolher persona → seta `mockAuth` e entra.

## Ordem
1. **S1** landing. 2. **S2** fluxo de captura (usa O1). 3. **S3** gate + 3 entradas.

## Revalidação ao iniciar
- [ ] O1 concluída (rotas respondem)? O0 (marca/paleta) aplicada?
- [ ] Confirmar que mover o portal atual não quebra links internos (buscar/favoritos/imóvel/[id]).

## Não fazer
- Sem guia/instruções (O3), sem admin (O4).
