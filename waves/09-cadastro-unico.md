# Onda 9 — Cadastro único, "Já tenho cadastro" e conferência do CRECI

**Objetivo:** cada corretor tem um cadastro só, entra de novo com o e-mail e o código, e o
fundador sabe quem tem CRECI de verdade — sem travar o cadastro de quem é legítimo e sem contornar
a proteção dos conselhos. Decisões do fundador em 2026-09-19 (ver `09-cadastro-unico/00-PLANO.md`).

## Sub-entregas
- **S1 — Regras do cadastro** (migração 005, nome e UF, WhatsApp/CRECI sem repetido, e-mail
  existente vira "entrar", `/api/lead/entrar`, dados novos só depois do código, último acesso,
  conferência na API do admin) → `S1-regras-cadastro.md`
- **S2 — Telas de acesso** (nome, estado do CRECI, "Já tenho cadastro", mensagens de repetido,
  acesso vencido abre no Entrar) → `S2-telas-acesso.md`
- **S3 — Painel: conferir CRECI, selos de repetido e "voltou ao demo"** → `S3-painel-creci.md`

## Critérios de aceite da onda
1. Cadastro pede **nome completo** e CRECI **com estado**; WhatsApp e CRECI de outro lead são
   barrados (WhatsApp com a dica do e-mail mascarado; CRECI sem dica).
2. Digitar o e-mail de outra pessoa **não altera** nada do lead dela; dados novos só valem depois
   do código certo.
3. **"Já tenho cadastro"**: só e-mail → código → demo; e-mail sem cadastro oferece o cadastro;
   acesso vencido abre direto nesse modo.
4. Painel: **Conferir CRECI** abre a busca oficial da UF; marcar confere/não confere; selos de
   repetido e "voltou ao demo".
5. Migração 005 idempotente, só acrescenta; RUNBOOK diz a ordem (005 **antes** do deploy).
6. `build` + `typecheck` + testes verdes; revisão sem bloqueadores; conferência no navegador
   (desktop e 390 px).

## Pendências fora de escopo
Ver `09-cadastro-unico/ESTADO.md` (DNS/e-mail do domínio, Turnstile em produção contra cadastro que "ocupa" o CRECI de outro corretor, RUNBOOK §3 do Resend na raiz).
