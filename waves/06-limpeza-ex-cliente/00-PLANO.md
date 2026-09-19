# O6 · PLANO — Limpeza do ex-cliente

## Resultado da onda
Nada que um visitante, um buscador ou alguém com acesso ao repositório veja remete ao
ex-cliente, às pessoas dele ou ao negócio dele. O demo continua mostrando o produto inteiro.

## Decisões do fundador (2026-09-18)
| # | Tema | Decisão |
|---|------|---------|
| L1 | Fotos | Trocar por fotos **Unsplash** (licença de uso comercial livre), conferidas uma a uma (sem logo/texto/pessoa identificável), otimizadas para WebP, origem registrada. |
| L2 | Portal de exemplo | **Enxugar e isolar**: fica só o que demonstra o produto (vitrine, busca, favoritos, comparar) sob `/demo/*`, `noindex`, identidade de rede fictícia, aviso "todo o conteúdo é fictício". Saem `/sobre`, `/blog`, `/seja-corretor`, `/associadas`, `/anunciar`, `/financiamentos`, `/corretores`, `/contato`, `/imovel/[id]`. |
| L3 | Painéis CEO/franqueado | **Rede fictícia + genérico**: uma identidade fictícia única para a rede do demo (config), valores fictícios coerentes entre telas, produto de garantia com nome genérico, sem spread/proposta/planilha do cliente, empresas reais → fictícias. Os módulos ficam. |
| L4 | Histórico git | **Repositório novo** começando de um commit único com o estado limpo; o atual fica arquivado e privado. |

## Identidade fictícia do demo
`src/config/demo.ts` passa a ser a fonte única da rede do demo (nome, nome curto, domínio
reservado `.example`, unidades). **Nunca** usar `brand.*` (a empresa real) como se fosse a
imobiliária do demo — `brand` é quem vende o CRM; `demo` é o cliente fictício que usa o CRM.

## Baseline de reuso
- `PropertyCard` já tem fallback de gradiente; `sharp` já está no `node_modules` (dependência do Next).
- `regressao.test.ts` já é o lugar das guardas de marca — estender, não duplicar.
- Redirects do Next (`next.config.mjs`) para as rotas que saem, em vez de deixar 404.

## Ordem
S1 → S2 → S3 → S4 → S5 → S6. S3 e S4 não tocam os mesmos arquivos e podem andar em paralelo.

## Revalidação ao iniciar
- [x] `build`/`typecheck`/`test` verdes na `main` (2026-09-18: 145 testes, build OK).
- [x] Proveniência das imagens conferida por hash contra o design system do ex-cliente.

## Não fazer
- Não consertar bugs de UX/mobile, SEO, região da Vercel etc. aqui — são do lançamento (O5),
  registrados no estudo. Exceção: o que for resíduo do ex-cliente dentro da tela tocada.
- Não redesenhar telas: trocar conteúdo, preservar layout.
