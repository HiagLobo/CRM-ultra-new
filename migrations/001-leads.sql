-- CRM Ultra — tabela de leads (D1: Postgres em produção).
-- Rodar UMA vez no banco novo (Neon/Supabase → SQL Editor, ou psql):
--     psql "$DATABASE_URL" -f migrations/001-leads.sql
-- É idempotente: rodar de novo não quebra nada.

CREATE TABLE IF NOT EXISTS leads (
  id                      TEXT PRIMARY KEY,
  -- UNIQUE é o que torna o upsert por e-mail atômico de verdade
  email                   TEXT NOT NULL UNIQUE,
  telefone                TEXT NOT NULL,
  creci                   TEXT NOT NULL,
  status                  TEXT NOT NULL,

  -- consentimento (LGPD): o texto que a pessoa leu, quando e de onde
  consentimento_texto     TEXT        NOT NULL,
  consentimento_aceito_em TIMESTAMPTZ NOT NULL,
  consentimento_ip        TEXT        NOT NULL,

  -- código de verificação: SEMPRE hash, nunca o código em claro
  codigo_hash             TEXT        NOT NULL,
  codigo_expira_em        TIMESTAMPTZ NOT NULL,
  codigo_tentativas       INTEGER     NOT NULL DEFAULT 0,
  codigo_enviado_em       TIMESTAMPTZ NOT NULL,

  verificado_em           TIMESTAMPTZ,
  origem_utm              TEXT,
  origem_ref              TEXT,
  criado_em               TIMESTAMPTZ NOT NULL,
  atualizado_em           TIMESTAMPTZ NOT NULL
);

-- a listagem do admin é sempre por data, do mais recente para o mais antigo
CREATE INDEX IF NOT EXISTS leads_criado_em_idx ON leads (criado_em DESC);
