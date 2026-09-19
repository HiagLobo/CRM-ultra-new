-- CRM Ultra — registro de auditoria das ações materiais do admin (LGPD).
-- Em produção o log de arquivo não serve: o disco da lambda é efêmero e um
-- registro que some não é registro.
-- Rodar UMA vez, junto da 001:
--     psql "$DATABASE_URL" -f migrations/002-auditoria.sql
-- É idempotente.

CREATE TABLE IF NOT EXISTS auditoria (
  id    BIGSERIAL   PRIMARY KEY,
  em    TIMESTAMPTZ NOT NULL,
  acao  TEXT        NOT NULL,
  -- só o mínimo para reconstituir a ação (id do lead, status de/para, nº de
  -- linhas exportadas). NUNCA e-mail, telefone ou CRECI: o log de auditoria não
  -- pode virar uma segunda cópia da base de contatos.
  dados JSONB       NOT NULL DEFAULT '{}'::jsonb
);

-- a consulta é sempre "o que aconteceu por último"
CREATE INDEX IF NOT EXISTS auditoria_em_idx ON auditoria (em DESC);
