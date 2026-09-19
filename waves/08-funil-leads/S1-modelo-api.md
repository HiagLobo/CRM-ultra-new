# O8 · S1 — Modelo e API do funil

## O que entrega (negócio)
O backend do funil: cada lead tem etapa, próxima ação, anotações e pode ser cadastrado à mão —
com os dados antigos migrados e a exclusão LGPD continuando completa.

## Fazer
1. `migrations/004-funil.sql` (idempotente): colunas novas em `leads` (ver 00-PLANO), `email`
   sem `NOT NULL`, conversão dos status antigos, tabela `lead_notas` (FK com `ON DELETE CASCADE`,
   índice por `lead_id, em DESC`).
2. Domínio: `StatusLead` → etapas novas; normalizador de status legado na leitura (Postgres e
   arquivo); `verificarCodigo` deixa de trocar a etapa; tipos para próxima ação, motivo, canal, nome.
3. Store (`LeadStore` + adaptadores arquivo e Postgres): `atualizarFunil(id, campos)` (UPDATE só
   das colunas do funil), `listarNotas(leadId)`, `adicionarNota(leadId, texto, em)`,
   `criar` aceitando lead manual; `excluir` apaga as notas (Postgres por cascade; arquivo à mão).
4. Casos de uso (admin): `mudarEtapa` (retomar exige data futura; perdido exige motivo),
   `definirProximaAcao` (data + texto, ou limpar), `anotar`, `cadastrarManual` (Zod, dedupe por
   e-mail/telefone → 409), todos auditados sem PII (`lead.etapa {id,de,para}`, `lead.nota {id}`,
   `lead.manual {id,canal}`, `lead.proxima_acao {id}`).
5. API (todas com `exigirAdmin`): `PATCH /api/admin/leads` (etapa/próxima ação), `POST
   /api/admin/leads` (manual), `GET|POST /api/admin/leads/[id]/notas`. DTO do admin ganha os campos
   novos (nada de hash/IP/consentimento). CSV ganha `nome;etapa;canal;proxima_acao_em;retomar_em;motivo`
   (sem anotações).
6. RUNBOOK: seção "migração 004 — rode ANTES do deploy desta versão" + como usar o funil;
   README atualizado.

## Pronto quando
- [ ] Testes: normalização de status legado; cada transição (inclusive retomar sem data e perdido
      sem motivo → 400); notas criadas/listadas e apagadas com o lead; manual com dedupe e sem código;
      DTO sem campos sensíveis; 401 sem sessão em toda rota nova; CSV com colunas novas.
- [ ] `tsc` + testes verdes; nenhum arquivo > 300 linhas nas áreas vigiadas.
