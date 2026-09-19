-- CRM Ultra — rate-limit compartilhado entre instâncias.
-- Em serverless o limitador em memória conta por lambda: com N instâncias
-- quentes, o limite real vira N × o configurado. Para o envio de código isso é
-- custo de e-mail e reputação de domínio; para o login do admin, força bruta
-- com N vezes mais fôlego.
-- Rodar UMA vez, junto das outras:
--     psql "$DATABASE_URL" -f migrations/003-rate-limit.sql
-- É idempotente.

CREATE TABLE IF NOT EXISTS rate_limit (
  id    BIGSERIAL   PRIMARY KEY,
  -- já vem com o escopo no prefixo: "email:...", "ip:...", "verify:ip:...",
  -- "admin:login:..." — por isso uma tabela só atende todos os limites
  chave TEXT        NOT NULL,
  em    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- a consulta é sempre "quantos eventos desta chave na janela"
CREATE INDEX IF NOT EXISTS rate_limit_chave_em_idx ON rate_limit (chave, em DESC);
