# O6 · S2 — Portal de exemplo enxuto e isolado

## O que entrega (negócio)
O "site de divulgação" continua no demo como vitrine do produto, mas deixa de ser o site da
imobiliária do ex-cliente: sai da raiz do domínio, sai do Google, perde as páginas institucionais
dele e passa a ter uma identidade fictícia explícita — sem o CNPJ da Safe Guardian no rodapé.

## Revalidação ao iniciar
- [ ] S1 feita (fotos novas já no ar)?
- [ ] Links internos para as rotas que saem mapeados (SiteNavbar, SiteFooter, FavCompare,
      demo/portal, login, comparar, favoritos, imovel)?

## Mapear (≤5 linhas)
- Entrega: portal em `/demo/{portal,buscar,favoritos,comparar}` com layout `noindex`; resto removido
  com redirect; rodapé/cabeçalho com a rede fictícia (`src/config/demo.ts`); aviso "todo o conteúdo é fictício".
- PII: os formulários que pediam dados e não enviavam nada saem junto com as páginas.
- Caminho simples: mover pastas, apagar páginas + componentes exclusivos, redirects no `next.config.mjs`.

## Pode tocar
- `src/app/{buscar,favoritos,comparar}` → `src/app/demo/*` · `src/app/demo/layout.tsx` (novo, noindex)
- apagar `src/app/{sobre,blog,seja-corretor,associadas,anunciar,financiamentos,corretores,contato,imovel}`
  e `src/components/{sobre,seja}` se ficarem sem uso
- `src/components/site/*`, `src/components/buscar/*`, `src/components/landing/SiteImoveis.tsx`,
  `src/components/acesso/EscolhaPainel.tsx`, `src/content/guia.ts` (chave do tour `/buscar`)
- `src/config/demo.ts` (novo) · `src/app/robots.ts` · `next.config.mjs` (redirects)

## O que sai do conteúdo que fica
A faixa de números do ex-cliente (StatBand), o superlativo e a promessa de verificação dele,
o slogan dele no h1, a faixa "Seja corretor", razão
social/CNPJ/contatos reais no rodapé, WhatsApp levando a número real.

## Redirects (não deixar 404 em link antigo)
`/buscar|/favoritos|/comparar` → `/demo/…` · `/sobre`, `/contato` → `/` · demais rotas removidas → `/demo/portal`.

## Pronto quando
- [ ] Só 4 rotas de portal, todas sob `/demo/*`, com `robots: noindex` e `Disallow: /demo/`.
- [ ] Nenhuma página do portal mostra `brand.empresa` nem contato real; identidade vem de `demo.*`.
- [ ] Nenhum link interno aponta para rota removida (grep + build).
- [ ] Tour do portal continua abrindo na busca; testes do guia verdes.
