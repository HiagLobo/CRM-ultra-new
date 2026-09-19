-- CRM Ultra — cadastro único, "Já tenho cadastro" e conferência do CRECI (O9).
--
-- RODE ANTES DO DEPLOY DESTA VERSÃO (RUNBOOK 3.10). Só ACRESCENTA colunas e
-- índices: o código da O8 ignora colunas a mais; o código da O9 grava nelas.
-- Pré-requisito: a 004 já aplicada (a O9 grava o nome no cadastro público).
-- Neon → SQL Editor (branch principal, database `neondb`) → cole o arquivo
-- INTEIRO → Run. É idempotente: rodar de novo não estraga nada.
-- Não apaga nem reescreve dado nenhum.

-- 1. Conferência do CRECI pelo fundador, no painel --------------------------
-- 'conferido' (achou na busca oficial do conselho), 'nao_confere' ou NULL (não
-- conferido ainda). O app só grava esses dois valores.
ALTER TABLE leads ADD COLUMN IF NOT EXISTS creci_conferencia TEXT;
-- quando o fundador marcou a conferência (NULL quando desfeita)
ALTER TABLE leads ADD COLUMN IF NOT EXISTS creci_conferido_em TIMESTAMPTZ;

-- 2. Último acesso ao demo ---------------------------------------------------
-- carimbado a cada verificação de código com sucesso ("voltou ao demo")
ALTER TABLE leads ADD COLUMN IF NOT EXISTS ultimo_acesso_em TIMESTAMPTZ;

-- 3. Busca de repetidos no cadastro ------------------------------------------
-- O app confere se o WhatsApp ou o CRECI já têm cadastro antes de criar o lead.
-- Índices simples, NÃO UNIQUE: o banco já tem repetidos de teste, e a regra
-- (barrar o repetido com a mensagem certa) mora no app.
CREATE INDEX IF NOT EXISTS leads_telefone_idx ON leads (telefone);
CREATE INDEX IF NOT EXISTS leads_creci_idx ON leads (creci);
