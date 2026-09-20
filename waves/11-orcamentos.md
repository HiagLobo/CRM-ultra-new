# Onda 11 — Gerador de orçamento no painel

**Objetivo:** o fundador para de montar proposta na mão. Ele preenche assentos, desconto e extras, o
sistema aplica a tabela oficial, trava o piso e entrega uma proposta A4 com a cara do produto, pronta
para virar PDF e ir para o cliente. Decisões do fundador em 2026-09-20 (ver `11-orcamentos/00-PLANO.md`).

## Sub-entregas
- **S1 — Modelo, cálculo e API** (migração 007, tabela oficial em código, escada por assento, pisos,
  anual, implantação, extras, numeração e histórico ligado ao lead) → `S1-modelo-api.md`
- **S2 — Painel** (seção Orçamentos, formulário com cálculo ao vivo, situações, duplicar, bloco na
  ficha do lead) → `S2-painel.md`
- **S3 — Documento A4 e acerto do demo** (página de impressão, conteúdo obrigatório, e as telas do
  demo que espelhavam a tabela real ou entregavam a margem) → `S3-documento.md`

## Critérios de aceite da onda
1. O preço nunca é digitado: sai da tabela em `src/features/orcamento/tabela.ts`, testada.
2. Desconto avisa a partir de 15% e **bloqueia** abaixo do piso (Pro R$ 85, Ultra R$ 109 efetivos).
3. O orçamento guarda os valores do dia: mudar a tabela depois não altera proposta já emitida.
4. Cada orçamento fica ligado a um lead; excluir o lead (LGPD) leva os orçamentos junto.
5. O documento sai em A4, sem menu nem botão no papel, com número, validade, CNPJ, totais mensal e
   anual, implantação em destaque, franquias, anexo datado e LGPD. Sem promessa de resultado.
6. A landing **continua sem preço**; nenhuma tela do demo espelha a tabela real nem revela margem.
7. Migração 007 idempotente e aplicada **antes** do deploy; `build` + `typecheck` + testes verdes;
   revisão sem bloqueadores; conferência no navegador, inclusive na visualização de impressão.

## Pendências fora de escopo
_(preencher na execução)_
