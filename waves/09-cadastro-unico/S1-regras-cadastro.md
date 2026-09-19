# O9 · S1 — Regras do cadastro: um lead por pessoa, "entrar" e dados novos só depois do código

## O que entrega (negócio)
Ninguém cria um segundo cadastro com o mesmo WhatsApp ou o mesmo CRECI; quem já tem cadastro
entra só com o e-mail e o código; e ninguém consegue trocar o WhatsApp de outra pessoa digitando o
e-mail dela.

## Fazer
1. `migrations/005-cadastro-unico.sql` (idempotente, só acrescenta): `creci_conferencia TEXT`,
   `creci_conferido_em TIMESTAMPTZ`, `ultimo_acesso_em TIMESTAMPTZ`, índices `leads_telefone_idx`
   e `leads_creci_idx`. Cabeçalho: "RODE ANTES DO DEPLOY DESTA VERSÃO". Teste estático no molde do
   `migracao004.test.ts`.
2. `creci.ts`: `chaveCreci(canonico)` e `formasEquivalentesCreci(canonico)` (categoria ausente =
   F); `schema.ts`: `nome` obrigatório (regra do 00-PLANO), CRECI do cadastro público **com UF**
   ("informe o estado do CRECI"), `VerifySchema` com `atualizacao?`; `EntrarSchema` (`email`,
   `website?`, `turnstileToken?`). Texto do consentimento passa a citar o **nome**.
3. `mascararEmail(email)` (puro): 1ª e última letra da parte local + `•••••` + `@domínio`
   (parte local com 1–2 letras → 1ª letra + `•••••`).
4. Store: `buscarPorTelefone(e164)`, `buscarPorCreci(formas: string[])` (arquivo e Postgres);
   `AtualizacaoContato` ganha `nome?`; `AtualizacaoFunil` ganha `creciConferencia?` e
   `creciConferidoEm?`; `registrarAcesso(id, em)` (UPDATE só de `ultimo_acesso_em`). O
   `leadStorePostgres.ts` já tem 275 linhas: divida (ex.: mapeamento de linha em arquivo próprio)
   para ficar ≤ 300.
5. `solicitarAcesso`: depois do rate-limit — e-mail existente → só gera/manda o código
   (`atualizarCodigo`), nada de contato; e-mail novo → WhatsApp em uso (409 + dica) → CRECI em uso
   (409) → segue o fluxo atual gravando `nome`. Resultado ganha `existente`.
6. Caso de uso `entrar` + rota `POST /api/lead/entrar` (contrato do 00-PLANO): mesma ordem (isca →
   Turnstile → rate-limit → busca → provedor → teto → envio com prazo → `atualizarCodigo`).
7. `verificarCodigo`: no sucesso, `registrarAcesso` à prova de falha (log `causaDoErro`, login
   segue) e, se vier `atualizacao`, aplica nome/WhatsApp/CRECI que mudaram e não colidem com
   OUTRO lead (+ consentimento carimbado de novo); devolve `naoAtualizados`.
8. Admin: PATCH `creciConferencia` (auditoria `lead.creci {id,resultado}`), DTO e CSV com os campos
   novos, cadastro manual barrando CRECI repetido (409 `campo: "creci"`).
9. RUNBOOK: seção **3.10 Migração 005** (backup → SQL Editor → conferir → só então deploy) com as
   consultas de conferência (com aspas!); README atualizado.

## Pronto quando
- [ ] Testes: chave/formas do CRECI; nome (aceita "Maria da Silva", "Ana O'Neil", "João P. Souza";
      recusa "Maria", "123 45"); CRECI sem UF recusado no público e aceito no manual; máscara;
      e-mail existente NÃO muda telefone/CRECI e responde `existente`; WhatsApp em uso → 409 com
      dica (e sem dica quando o dono não tem e-mail); CRECI em uso (inclusive `PE 12345` vs
      `PE 12345-F`) → 409; cada checagem gasta vaga do rate-limit; `entrar` (achou, não achou,
      robô, limitado, provedor fora, teto); verify com `atualizacao` (aplica, pula colisão, não
      aplica com código errado); `registrarAcesso` falhando não derruba o login; PATCH da
      conferência (+401 sem sessão); CSV/DTO com os campos novos e sem campo sensível.
- [ ] `tsc` + testes verdes; nenhum arquivo > 300 linhas nas áreas vigiadas.
