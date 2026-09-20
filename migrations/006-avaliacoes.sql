-- CRM Ultra — avaliação com estrelas dentro do demo (O10).
--
-- RODE ANTES DO DEPLOY DESTA VERSÃO (RUNBOOK 3.11). Só ACRESCENTA: cria a
-- tabela `avaliacoes` e os índices dela. Não toca na tabela `leads`, não apaga
-- nem reescreve dado nenhum — o código que está no ar ignora tabela a mais.
-- Pré-requisito: a 001 (tabela `leads`) já aplicada.
-- Neon → SQL Editor (branch principal, database `neondb`) → cole o arquivo
-- INTEIRO → Run. É idempotente: rodar de novo não estraga nada.

-- 1. A avaliação de quem testou o demo --------------------------------------
-- ON DELETE CASCADE: excluir o lead (LGPD art. 18) leva a avaliação junto —
-- nada do titular fica para trás.
-- `comentario` é opcional: dar só a nota é uma avaliação completa.
-- `identificacao`: 'nome_creci', 'nome' ou 'anonimo' — a escolha da pessoa.
-- `status`: 'publicado', 'pendente' (o filtro automático segurou o texto) ou
-- 'recusado' (o fundador tirou do site). A NOTA conta nos três.
-- O consentimento é carimbado como no cadastro: texto exibido + data + IP.
CREATE TABLE IF NOT EXISTS avaliacoes (
  id                  TEXT        PRIMARY KEY,
  lead_id             TEXT        NOT NULL REFERENCES leads (id) ON DELETE CASCADE,
  estrelas            SMALLINT    NOT NULL CHECK (estrelas BETWEEN 1 AND 5),
  comentario          TEXT,
  identificacao       TEXT        NOT NULL,
  status              TEXT        NOT NULL,
  consentimento_texto TEXT        NOT NULL,
  consentimento_em    TIMESTAMPTZ NOT NULL,
  consentimento_ip    TEXT        NOT NULL,
  criado_em           TIMESTAMPTZ NOT NULL,
  atualizado_em       TIMESTAMPTZ NOT NULL
);

-- 2. Uma avaliação por lead, editável ----------------------------------------
-- UNIQUE de verdade (tabela nova, sem repetido herdado): o upsert por lead_id
-- é atômico e ninguém avalia duas vezes nem em corrida.
CREATE UNIQUE INDEX IF NOT EXISTS avaliacoes_lead_idx ON avaliacoes (lead_id);

-- 3. Listagem do site e do painel --------------------------------------------
-- a vitrine pede as publicadas da mais recente para a mais antiga
CREATE INDEX IF NOT EXISTS avaliacoes_status_criado_idx ON avaliacoes (status, criado_em DESC);
