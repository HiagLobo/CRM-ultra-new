-- CRM Ultra — funil de leads (O8): etapas, próxima ação, anotações e cadastro manual.
--
-- RODE ANTES DO DEPLOY DESTA VERSÃO. Neon → SQL Editor (branch principal,
-- database `neondb`) → cole o arquivo INTEIRO → Run.
-- É idempotente: rodar de novo não estraga nada (e converte algum status antigo
-- que o código anterior tenha gravado entre a migração e o deploy).
-- Não apaga nem reescreve dado de contato: só acrescenta colunas, afrouxa o
-- NOT NULL do e-mail e traduz os 3 status antigos para as etapas novas.

-- 1. Colunas novas do funil ------------------------------------------------
-- nome: opcional (o formulário público não pede; o cadastro manual pode ter)
ALTER TABLE leads ADD COLUMN IF NOT EXISTS nome TEXT;
-- canal: de onde o lead veio — 'site' (formulário), 'indicacao', 'evento',
-- 'whatsapp' ou 'outro'. Os leads que já existem vieram todos do site.
ALTER TABLE leads ADD COLUMN IF NOT EXISTS canal TEXT NOT NULL DEFAULT 'site';
-- "Retomar depois": a data (dia, sem hora) em que o lead volta para a fila
ALTER TABLE leads ADD COLUMN IF NOT EXISTS retomar_em DATE;
-- motivo da etapa "retomar depois" ou "perdido" (texto curto do admin)
ALTER TABLE leads ADD COLUMN IF NOT EXISTS motivo TEXT;
-- próxima ação combinada com o lead: o dia e o que fazer
ALTER TABLE leads ADD COLUMN IF NOT EXISTS proxima_acao_em DATE;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS proxima_acao TEXT;

-- 2. E-mail passa a ser opcional (só o lead cadastrado à mão pode vir sem) -----
-- O UNIQUE continua valendo: dois leads nunca têm o mesmo e-mail. Vários sem
-- e-mail (NULL) podem existir — no Postgres, NULL não conflita com NULL.
ALTER TABLE leads ALTER COLUMN email DROP NOT NULL;

-- 3. Status antigos → etapas novas -----------------------------------------
-- "verificado" deixa de ser etapa: e-mail confirmado agora é o selo
-- (coluna verificado_em, que não muda). Só estas 3 linhas mexem em dado.
UPDATE leads SET status = 'novo'       WHERE status = 'verificado';
UPDATE leads SET status = 'em_contato' WHERE status = 'contatado';
UPDATE leads SET status = 'perdido'    WHERE status = 'descartado';

-- 4. Anotações do admin sobre cada lead ------------------------------------
-- ON DELETE CASCADE: excluir o lead (LGPD, direito à eliminação) apaga junto
-- todas as anotações dele — nada fica para trás.
CREATE TABLE IF NOT EXISTS lead_notas (
  id       TEXT        PRIMARY KEY,
  lead_id  TEXT        NOT NULL REFERENCES leads (id) ON DELETE CASCADE,
  -- até 2.000 caracteres (conferido pelo app). NUNCA vai para log nem auditoria.
  texto    TEXT        NOT NULL,
  em       TIMESTAMPTZ NOT NULL
);

-- a gaveta do lead lista as anotações dele, da mais recente para a mais antiga
CREATE INDEX IF NOT EXISTS lead_notas_lead_em_idx ON lead_notas (lead_id, em DESC);
