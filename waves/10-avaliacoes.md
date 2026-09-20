# Onda 10 — Avaliação com estrelas dentro do demo

**Objetivo:** transformar quem testa o demo em prova social de verdade. O corretor avalia dentro do
produto, com o e-mail já confirmado e o CRECI no cadastro, escolhe como quer aparecer e vê a
contagem do site subir com a nota dele. Decisões do fundador em 2026-09-19 (ver
`10-avaliacoes/00-PLANO.md`).

## Sub-entregas
- **S1 — Modelo e API** (migração 006, tabela `avaliacoes`, filtro automático, rotas pública,
  do demo e do admin, aviso sem PII) → `S1-modelo-api.md`
- **S2 — Convite no demo e vitrine** (relógio de 4 minutos, convite, formulário com estrelas e
  escolha de identificação, média ao vivo na página inicial) → `S2-convite-demo.md`
- **S3 — Painel** (lista das avaliações, tirar do site, liberar o que o filtro segurou) → `S3-painel.md`

## Critérios de aceite da onda
1. Só quem tem o demo liberado avalia, e cada lead tem **uma** avaliação, que pode trocar.
2. A nota entra na média **na hora**; o comentário publica direto, menos quando o filtro pega link,
   contato, tamanho, CAPS ou baixo calão, e aí espera o fundador.
3. Nome e CRECI só aparecem quando a pessoa escolhe, com o consentimento gravado (texto, data, IP).
4. Excluir o lead (LGPD) apaga a avaliação junto.
5. A página inicial mostra a média e a contagem somando as três avaliações do arquivo com as do
   banco, e continua funcionando se a API falhar.
6. O painel mostra tudo, tira do site em um clique e libera o que ficou pendente.
7. Migração 006 idempotente e aplicada **antes** do deploy; `build` + `typecheck` + testes verdes;
   revisão sem bloqueadores; conferência no navegador (desktop e 390 px).

## Pendências fora de escopo
_(preencher na execução)_
