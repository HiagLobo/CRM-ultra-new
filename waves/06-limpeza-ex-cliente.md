# Onda 6 — Limpeza do ex-cliente (pré-requisito do lançamento)

**Objetivo:** o produto vai ao ar sem nenhum conteúdo, imagem, dado ou negócio do ex-cliente.
A O0 trocou **nomes** por `sed`; esta onda remove o que o `sed` não alcança: imagens com a marca
d'água do cliente, o site institucional dele, a tabela de preços, o produto de garantia, as bios
reescritas, os telefones/endereços das unidades dele e as empresas reais citadas nos mocks.

Origem: estudo de pré-lançamento de 2026-09-18 (10 áreas + verificação). Decisões do fundador
na mesma data (ver `06-limpeza-ex-cliente/00-PLANO.md`).

## Sub-entregas
- **S1 — Imagens** → `S1-imagens.md`
- **S2 — Portal de exemplo enxuto e isolado** → `S2-portal-demo.md`
- **S3 — Painéis CEO/franqueado com rede fictícia** → `S3-paineis-rede-ficticia.md`
- **S4 — Painel do corretor, /login e resíduos transversais** → `S4-corretor-transversal.md`
- **S5 — Guardas de regressão e documentos** → `S5-guardas-docs.md`
- **S6 — Repositório novo e limpo** → `S6-repo-limpo.md`

## Critérios de aceite da onda
1. `public/` não tem nenhum arquivo cujo hash coincida com o material do ex-cliente; toda imagem
   raster tem origem e licença registradas em `public/assets/CREDITOS.md`.
2. Nenhuma rota pública afirma ser imobiliária/rede, nem exibe números, depoimentos, ofertas de
   comissão, sócios ou parceiros que não existem; o portal de exemplo vive em `/demo/*` com
   `noindex` e identidade fictícia (sem razão social/CNPJ reais).
3. Painéis sem preços, produtos, termos comerciais ou pessoas do ex-cliente; nenhuma empresa real
   citada; nenhuma rota/e-mail/URL num domínio que não controlamos.
4. Guarda de regressão cobre: hashes das imagens antigas, telefones/CEP/endereços das unidades
   antigas, trechos das bios, monogramas `AN`/`WT`, marcas de terceiros citadas como parceiras.
5. `build` + `typecheck` + testes verdes; revisão de PR sem bloqueadores em cada sub.
6. O repositório publicado começa num commit único já limpo (o antigo fica arquivado, privado).

## Pendências fora de escopo
_(preencher na execução)_
