# O6 · S1 — Imagens

## O que entrega (negócio)
Nenhuma imagem do ex-cliente no produto. O portal de exemplo mostra fotos de imóveis com licença
de uso comercial, e fica ~10x mais leve (antes: capa de 2,3 MB + 12 fotos de ~500 KB).

## Revalidação ao iniciar
- [x] As 15 imagens raster de `public/` são byte a byte do design system do ex-cliente:
      `assets/properties/p1–p12.png` (marca d'água do ex-cliente),
      `img/site-hero.png` (= `assets/hero-house.png`, órfã), `img/financiamento.png`.
- [x] Só os SVGs (`logo*.svg`, `avatar-*.svg`, `icon.svg`) são do CRM Ultra.

## Mapear (≤5 linhas)
- Entrega: 12 fotos + 1 capa novas em WebP, ícone de financiamento em SVG/lucide; PNGs antigos apagados.
- PII/secret: nenhum. Risco é licença: só Unsplash não-premium, registrada em `CREDITOS.md`.
- Toca: `public/**`, `src/mock-data/imoveis.ts`, `src/app/{favoritos,comparar,corretores}/page.tsx`,
  `src/components/site/SiteHero.tsx`, `src/components/buscar/BuscarComponents.tsx`.
- Caminho simples: um helper `fotoImovel(n)` usado por todos; nomes novos (`/assets/imoveis/imovel-NN.webp`).

## Pode tocar
- `public/assets/properties/*` (apagar) · `public/assets/hero-house.png` (apagar) · `public/img/site-hero.png`,
  `public/img/financiamento.png` (apagar) · `public/assets/imoveis/*` (novo) · `public/img/capa-portal.webp` (novo)
- `public/assets/CREDITOS.md` (novo) · `src/mock-data/fotos.ts` (novo) · os consumidores listados acima

## Critério de escolha de cada foto
Combina com o imóvel do mock (cobertura, studio, casa com piscina…); sem logo, marca d'água,
texto, placa, rosto ou pessoa identificável; aparência plausível no Brasil; licença Unsplash
(não Unsplash+). Conferida visualmente antes de entrar.

## Pronto quando
- [ ] `public/` sem nenhum arquivo com hash do material do ex-cliente.
- [ ] Todas as referências apontam para arquivos que existem (guarda de existência verde).
- [ ] `CREDITOS.md` lista cada arquivo → id/URL da foto + autor + licença.
- [ ] `build` + `typecheck` + testes verdes.
