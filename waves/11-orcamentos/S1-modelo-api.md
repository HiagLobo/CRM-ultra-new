# O11 · S1 — Modelo, cálculo e API do orçamento

## O que entrega (negócio)
O painel calcula o orçamento certo sozinho: escada por assento, mínimo faturável, desconto com piso
travado, anual, implantação e extras. E guarda o que foi proposto, ligado ao lead.

## Fazer
1. `migrations/007-orcamentos.sql` (idempotente, só acrescenta): tabela `orcamentos` com
   `id TEXT PK`, `numero TEXT NOT NULL UNIQUE`, `lead_id TEXT NOT NULL REFERENCES leads (id) ON DELETE CASCADE`,
   `publico TEXT NOT NULL`, `status TEXT NOT NULL`, `itens JSONB NOT NULL`, `totais JSONB NOT NULL`,
   `condicoes JSONB NOT NULL`, `validade_em DATE NOT NULL`, `observacao TEXT`, `criado_em`,
   `atualizado_em`, `enviado_em TIMESTAMPTZ`; índice por `lead_id` e por `status, criado_em DESC`.
   Teste estático no molde do `migracao006.test.ts`.
2. `src/features/orcamento/tabela.ts` (puro, client-safe): a tabela do 00-PLANO em constantes
   (faixas, pisos, mínimos, franquias, implantação por porte, extras, texto da condição de
   fundador). **Nenhum número escrito fora daqui.**
3. `src/features/orcamento/calculo.ts` (puro): `calcularOrcamento(pedido)` devolve itens com preço
   unitário e total, subtotal mensal, desconto, total mensal, total do ano (anual = 12 pelo preço de
   10), implantação (com isenção no anual), extras e o piso do plano. Regras: escada marginal sobre
   o **total** de assentos; mínimo faturável por público; desconto aplicado sobre a linha de assento,
   nunca sobre extras nem implantação; arredondamento em centavos, sempre para cima no preço final.
4. Erros do cálculo (não são exceção, são resultado): `abaixo_do_piso` (com o piso e o preço
   efetivo), `assentos_abaixo_do_minimo`, `sem_assentos`.
5. Schema Zod da entrada (mesmo do contrato no 00-PLANO) e numeração `ORC-AAAA-NNN` no servidor,
   atômica o suficiente para não repetir sob concorrência (teste com duas criações ao mesmo tempo).
6. Store `OrcamentoStore` (porta + arquivo em dev + Postgres): `criar`, `listar`, `doLead`,
   `buscarPorId`, `trocarStatus`, `excluir`, `removerDoLead` (chamado pelo DELETE do lead, como a O10 fez).
7. Rotas `GET|POST|PATCH|DELETE /api/admin/orcamentos` e `GET /api/admin/orcamentos/[id]`, todas
   com `exigirAdmin`. Auditoria `orcamento.criado {id, publico, assentos}` e
   `orcamento.status {id, de, para}`, **sem valores, sem nome e sem observação**.
8. RUNBOOK: seção da 007 (rodar ANTES do deploy) e como usar o gerador; README atualizado.

## Pronto quando
- [ ] Testes do cálculo, com a conta na asserção: 1 assento Pro · 8 assentos (3 Ultra + 5 Pro, faixa
      pelo total) · 150 assentos · desconto até o piso · desconto abaixo do piso recusado · anual
      (12 por 10 e implantação isenta) · mínimo faturável por público · extras somados sem desconto
      · implantação de rede com unidades.
- [ ] Testes da API: 401 sem sessão em todas · 404 lead inexistente · 409 abaixo do piso · numeração
      sequencial sem repetir · o orçamento guarda os valores do dia (mudar a tabela depois não muda o
      emitido) · exclusão do lead leva os orçamentos · DTO sem dado sensível do lead.
- [ ] `tsc` + testes verdes; nenhum arquivo > 300 linhas nas áreas vigiadas.
