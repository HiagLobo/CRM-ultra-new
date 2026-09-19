# O5 · ESTADO — Hardening & Lançamento

## Status das subs
| Sub | Status | Commit | Notas |
|-----|--------|--------|-------|
| S1 — Testes & revisão | ✅ feita | f15ea84 | 90 testes (+24); **1 bloqueador achado e corrigido**; 2 ressalvas registradas |
| S2 — Deploy & runbook | 🟦 **código feito, publicação pendente** | c753e54 | adaptador Postgres + exclusão LGPD + README/RUNBOOK prontos; **provisionar banco, verificar domínio e publicar dependem do fundador** |

> **A O5 não está fechada** e não vou marcá-la como se estivesse: os critérios de aceite dizem
> "app em produção, e-mail real chega, leads persistem" — nada disso pode ser provado daqui.
> O que faltava de **código** está pronto e testado; o que falta é execução nas suas contas
> (seção "Checklist de publicação" abaixo).

## Bloqueador encontrado na revisão (corrigido)
**Fallback de e-mail valia em produção.** `emailModoDev` era só `!RESEND_API_KEY`: subir sem a chave
configurada faria `POST /api/lead` **devolver o código de verificação na resposta** — qualquer pessoa
entraria no demo com o e-mail de qualquer outra. Correção em três partes:

1. `env.ts` — `emailModoDev` exige `NODE_ENV !== "production"`.
2. `email.ts` — `criarProvedorEmail()` falha com mensagem clara se faltar a chave fora de dev
   (fail-closed, em vez de cair num provedor que "funciona" vazando o código).
3. `email.ts` + `api/lead/route.ts` — provedor criado **sob demanda**. A primeira versão quebrou o
   `next build`, que avalia os módulos das rotas com `NODE_ENV=production`: a trava tem de valer no
   request, não no import.

## Decisões tomadas
- **(S1) Guardas de regressão viraram teste** (`lib/regressao.test.ts`), não conferência manual: marca
  antiga = 0 em `src`, tamanho de arquivo, `exigirAdmin` por handler em `/api/admin/*` e nenhuma rota
  logando o objeto de erro cru. O que depende de alguém lembrar de rodar um `grep` não é guarda.
- **(S1) Authz do admin testada nos handlers de verdade** (`lib/adminRotas.test.ts`), importando as
  rotas — não em mock. Só caminhos que não escrevem em disco; `PATCH`/`export` autorizados continuam
  cobertos por teste de domínio + smoke.
- **(S1) Alias `@/` no `vitest.config.ts`** — pendência registrada na O2·S2; sem ele não dava para
  importar as rotas nos testes.
- **(S1) A guarda de tamanho cobre só as áreas construídas nas ondas.** As telas do protótipo nasceram
  fora deste plano; dividi-las seria refatorar fora de escopo (proibido pelo PROTOCOLO).

## Cobertura (checklist do `S1-testes-revisao.md`)
| Alvo | Onde |
|------|------|
| Lead/Zod: e-mail, telefone e CRECI inválidos rejeitam | `lead.test.ts` |
| Envio: happy com fallback dev · rate-limit barra o 4º · sem PII em log | `solicitarAcesso.test.ts` |
| Verificação: certo → token · errado → tentativa · expirado → 410 · excedido → bloqueia | `verificacao.test.ts` |
| Token: assinado verifica · adulterado falha · demo ≠ admin | `token.test.ts`, `adminAuth.test.ts` |
| Admin: sem cookie → 401 em todas as rotas · senha errada → 401 · rate-limit no login | `adminRotas.test.ts` |
| Sem PII em log/response | `verificacao.test.ts`, `api.test.ts`, `admin.test.ts`, `adminAuth.test.ts` |
| Marca: 0 ocorrências da marca antiga | `regressao.test.ts` |

## Pendências fora de escopo
- 🚨 **LGPD — opt-out/exclusão de lead não existe.** O PROTOCOLO exige "opt-out funcional", mas o
  `LeadStore` não tem `excluir()` e o admin não tem a ação: atender um pedido de exclusão hoje é
  editar `data/leads.json` na mão. **É obrigação legal, não melhoria** — recomendado resolver na S2,
  junto do adaptador de produção (`excluir(id)` na porta + ação no painel, auditada).
- ⚠️ **~20 arquivos acima de 300 linhas, todos telas herdadas do protótipo** (maior: 952 linhas em
  `corretor/imoveis/page.tsx`). Nenhum é código das ondas. Dividir é refatoração fora de escopo —
  fica como dívida consciente da trilha "Plataforma".
- ⚠️ **Rotas públicas sem teste de unidade** (`POST /api/lead`, `/api/lead/verify`): instanciam
  `FileLeadStore` no caminho real, então testá-las escreveria em `data/` do projeto. Cobertas por
  teste de domínio + smoke. Some quando o store de produção for injetável por env (S2).
- ℹ️ **Sem teste de renderização** em nenhuma tela (o projeto não tem jsdom/testing-library nem
  browser driver). Decisão do fundador se entram como dev-deps.

## Decisões da S2
- **(S2) D1 mantido (Vercel + Postgres), mas sem Prisma.** O Prisma 7 removeu `url` do schema e agora
  exige `prisma.config.ts` + driver adapter; para **uma** tabela e cinco operações isso é mais
  maquinário do que a fatia justifica. Adaptador escrito direto sobre `pg` + um `.sql` versionado.
  A porta já isolava a escolha — trocar de novo é escrever outro adaptador.
- **(S2) Sem `DATABASE_URL` em produção, o boot para.** Subir na Vercel com o store de arquivo
  perderia todo lead na primeira reciclagem da lambda, **em silêncio** — o pior tipo de falha.
- **(S2) `email UNIQUE` no banco** torna o upsert atômico de verdade (o de arquivo era
  last-write-wins entre processos) e o erro `23505` vira a **mesma** mensagem do `FileLeadStore`,
  para o domínio tratar a corrida igual nos dois adaptadores.
- **(S2) Exclusão apaga de vez, não marca como excluído.** O titular pediu para sumir dos registros.
  A auditoria guarda id + motivo, **nunca** o contato apagado: registrar o e-mail manteria justamente
  o dado que se pediu para eliminar.
- **(S2) "Excluir" é separado de "Descartar"** e tem confirmação própria: um é obrigação legal
  irreversível, o outro é follow-up e preserva o histórico.

## Achado grave da S2 (corrigido)
**O `README.md` ainda era o do cliente antigo:** título com a marca antiga, credenciais no domínio dela e
o **e-mail real de uma pessoa** do ex-cliente — a mesma pessoa que a O0 removeu do
`src`. O de-branding da O0 varreu só `src/`, e o README é o primeiro arquivo que qualquer um abre no
repositório. Reescrito para o CRM Ultra, e a guarda de regressão passou a cobrir os documentos
publicados da raiz, inclusive procurando e-mail de pessoa real.

## Checklist de publicação (depende do fundador)
Passo a passo detalhado na **seção 3 do `waves/RUNBOOK.md`**. Resumo do que só você pode fazer:

- [ ] **Banco:** criar o Postgres (Neon/Supabase) e rodar `migrations/001-leads.sql` uma vez.
      Usar a connection string **pooled**.
- [ ] **E-mail:** adicionar o domínio no Resend, publicar SPF/DKIM no DNS, esperar verificar, gerar a
      API key. **Sem isso o Resend só entrega no e-mail dono da conta** — nenhum corretor recebe código.
- [ ] **Deploy:** importar o repo na Vercel e configurar `APP_SECRET`, `ADMIN_PASSWORD`,
      `DATABASE_URL`, `RESEND_API_KEY`, `EMAIL_FROM`.
- [ ] **Smoke em produção** (5 passos da seção 3.4 do runbook) — é o que fecha os critérios 1 e 2 da onda.
- [ ] **Política de Privacidade** publicada (o consentimento já cita ela).
- [ ] **Contato cravado** no rodapé do portal trocado por `brand.contato` ou removido.

## Riscos
- Deploy sem resolver D1 = **perder leads** (FileLeadStore não sobrevive à Vercel). Bloqueia a S2.
  → **(S2) resolvido no código:** adaptador Postgres pronto + boot que para sem a URL.
- Deploy sem D2 (domínio no Resend) = e-mail não chega a terceiros → ninguém verifica → ninguém entra.
- As 3 pendências 🚨 herdadas seguem abertas e dependem do fundador: **Política de Privacidade**
  (o formulário já grava referência a ela), **contato cravado** no rodapé do portal e **gate
  server-side** quando algum painel mostrar dado real.
