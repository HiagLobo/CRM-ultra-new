-- CRM Ultra — orçamentos gerados no painel (O11).
--
-- RODE ANTES DO DEPLOY DESTA VERSÃO (RUNBOOK 3.12). Só ACRESCENTA: cria a
-- tabela `orcamentos` e os índices dela. Não toca nas tabelas `leads` e
-- `avaliacoes`, não apaga nem reescreve dado nenhum — o código que está no ar
-- ignora tabela a mais.
-- Pré-requisito: a 001 (tabela `leads`) já aplicada.
-- Neon → SQL Editor (branch principal, database `neondb`) → cole o arquivo
-- INTEIRO → Run. É idempotente: rodar de novo não estraga nada.

-- 1. A proposta comercial guardada -------------------------------------------
-- ON DELETE CASCADE: excluir o lead (LGPD art. 18) leva os orçamentos dele
-- junto — nada do titular fica para trás.
-- `numero`: 'ORC-AAAA-NNN', sequencial por ano. O UNIQUE é o que garante a
-- numeração sob concorrência: duas gravações ao mesmo tempo não repetem.
-- `itens`, `totais` e `condicoes` são o RETRATO do preço do dia (JSONB). Mudar
-- a tabela de preços depois não altera orçamento já emitido, porque nada aqui
-- é recalculado na leitura.
-- `status`: 'rascunho', 'enviado', 'aceito' ou 'recusado'.
-- `validade_em`: até quando a proposta vale (é um dia, não um instante).
CREATE TABLE IF NOT EXISTS orcamentos (
  id            TEXT        PRIMARY KEY,
  numero        TEXT        NOT NULL UNIQUE,
  lead_id       TEXT        NOT NULL REFERENCES leads (id) ON DELETE CASCADE,
  publico       TEXT        NOT NULL,
  status        TEXT        NOT NULL,
  itens         JSONB       NOT NULL,
  totais        JSONB       NOT NULL,
  condicoes     JSONB       NOT NULL,
  validade_em   DATE        NOT NULL,
  observacao    TEXT,
  criado_em     TIMESTAMPTZ NOT NULL,
  atualizado_em TIMESTAMPTZ NOT NULL,
  enviado_em    TIMESTAMPTZ
);

-- 2. Os orçamentos de um lead (ficha do lead e exclusão LGPD) ------------------
CREATE INDEX IF NOT EXISTS orcamentos_lead_idx ON orcamentos (lead_id);

-- 3. Listagem do painel ------------------------------------------------------
-- as abas por situação pedem do mais recente para o mais antigo
CREATE INDEX IF NOT EXISTS orcamentos_status_criado_idx ON orcamentos (status, criado_em DESC);
