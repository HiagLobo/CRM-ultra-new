# RUNBOOK — CRM Imobiliário Ultra

Manual de operação. Escrito para quem nunca viu o projeto conseguir rodar, publicar e resolver
problema sem adivinhar nada.

---

## 1. Rodar na sua máquina

```bash
npm install
cp .env.example .env.local     # preencha APP_SECRET e ADMIN_PASSWORD
npm run dev                    # http://localhost:3000
```

Gerar um `APP_SECRET`: `openssl rand -base64 32` (ou qualquer texto aleatório de 16+ caracteres).

Em desenvolvimento **não precisa** de banco nem de Resend:

- os leads vão para `data/leads.json` (gitignored);
- o código de verificação aparece **na própria tela**, no lugar do e-mail.

Comandos:

| Comando | O que faz |
|---------|-----------|
| `npm run dev` | sobe em modo desenvolvimento |
| `npm run build` | build de produção (falha se houver erro de tipo) |
| `npm run typecheck` | só a checagem de tipos |
| `npm test` | a suíte inteira (inclui as guardas de marca, PII e conteúdo do ex-cliente) |
| `npm run seed` | popula o painel com 8 leads fictícios (só dev) |

> **Não rode `npm run build` com o `npm run dev` aberto.** Os dois escrevem em `.next` e o servidor
> de dev passa a devolver 500 (`__webpack_modules__ is not a function`). Pare um antes de rodar o outro.

---

## 2. As variáveis (o que é cada uma)

Detalhe completo em `.env.example`. Resumo do que **quebra** se faltar:

| Variável | Sem ela |
|----------|---------|
| `APP_SECRET` | o app não sobe (nada de token de demo nem sessão de admin) |
| `ADMIN_PASSWORD` | o app não sobe |
| `DATABASE_URL` | **em produção o boot para**; em dev, usa `data/leads.json` |
| `RESEND_API_KEY` | **em produção o boot para**; em dev, o código aparece na tela |
| `EMAIL_FROM` | o envio falha se houver `RESEND_API_KEY` |

O contato público (e-mail, telefone, CNPJ, razão social) **não** é variável de ambiente: sai de
`src/config/brand.ts`, que é a fonte única. Há teste garantindo que esses dados não apareçam
hardcoded em nenhum outro arquivo.

As duas travas de produção são propositais: sem banco os leads se perdem em silêncio, e sem Resend
a API devolveria o código de verificação para quem pedisse.

---

## 3. Publicar (Vercel + Postgres)

**3.1. Banco.** Crie um Postgres no [Neon](https://neon.tech) ou [Supabase](https://supabase.com) e
rode as **três** migrações, uma vez:

```bash
psql "$DATABASE_URL" -f migrations/001-leads.sql
psql "$DATABASE_URL" -f migrations/002-auditoria.sql
psql "$DATABASE_URL" -f migrations/003-rate-limit.sql
```

(ou cole o conteúdo dos arquivos no SQL Editor do painel). São idempotentes.
Use a connection string **pooled** do provedor — em serverless cada instância abre o próprio pool.

**3.2. E-mail.** No [Resend](https://resend.com): adicione o domínio, publique os registros SPF/DKIM
no DNS e espere verificar. Sem domínio verificado o Resend **só entrega no e-mail dono da conta** —
ou seja, nenhum corretor recebe o código. Depois gere a API key e defina `EMAIL_FROM` no domínio
verificado (ex.: `acesso@crmultra.com.br`).

**3.3. Deploy.** Importe o repositório na Vercel (framework Next.js, detectado sozinho).

> ⚠️ **Configure as variáveis ANTES do primeiro deploy.** Sem `APP_SECRET` e `ADMIN_PASSWORD`, o
> **build falha** — não é erro em runtime, é na hora de compilar: as rotas importam `env.ts`, que
> valida no boot, e o `next build` avalia esses módulos. O erro que aparece no log da Vercel é
> `[env] Configuração de ambiente inválida`, listando o que falta.

As cinco de produção, todas em **Production** (e também em Preview, se quiser que os previews
funcionem):

| Variável | Onde nasce |
|----------|------------|
| `APP_SECRET` | você gera: `openssl rand -base64 32` |
| `ADMIN_PASSWORD` | você escolhe — senha forte de verdade |
| `DATABASE_URL` | Neon → **Connection string** → a versão **Pooled** |
| `RESEND_API_KEY` | Resend → API Keys |
| `EMAIL_FROM` | um endereço no domínio verificado no Resend |

**Neon, passo a passo:** crie o projeto (região mais perto do Brasil), copie a *connection string*
**pooled** — a que tem `-pooler` no host — e cole em `DATABASE_URL`. A string já vem com
`sslmode=require`, que é o que o app espera. Depois rode as três migrações da seção 3.1 pelo **SQL
Editor** do Neon, colando o conteúdo de cada arquivo.

**Por que a pooled:** cada função serverless da Vercel abre o próprio pool. Com a string direta, um
pico de tráfego estoura o limite de conexões do Postgres; a pooled resolve isso no lado do Neon.

**3.4. Smoke em produção** (faça sempre, na ordem):

1. Abrir `/` — a landing carrega.
2. "Acessar CRM" → preencher com um e-mail **seu** → o e-mail chega de verdade.
3. Digitar o código → cai na escolha dos 3 painéis → abrir um.
4. Entrar em `/admin/login` com a `ADMIN_PASSWORD` → o lead aparece na lista.
5. Marcar "Contatado" → exportar CSV → conferir o arquivo.

Se qualquer passo falhar, veja a seção 6.

---

## 4. Operação do dia a dia

**Ver os leads:** `/admin/login` → `/admin`. A sessão dura 12h.

**Tour guiado.** Na primeira visita de cada tela com tour (os 3 painéis, atendimento, radar e a busca
do portal — 6 tours, 33 passos) a orientação aparece sozinha: destaque no elemento + balão explicando. Pular ou concluir
faz ele não insistir; para rever, o botão **Guia** tem "Refazer o tour desta tela".

**Painel vazio para explorar?** `npm run seed` cria 8 leads fictícios com status variados. O script
recusa rodar se encontrar `NODE_ENV=production` ou `DATABASE_URL` — semear a base real falsearia os
números do seu funil.

**Follow-up:** "Contatado" e "Descartar" mudam o status e ficam registrados na auditoria.
"Descartar" **preserva** o histórico — use para parar o follow-up.

**Exportar:** botão "Exportar CSV". Abre em Excel/Sheets. O arquivo tem PII: trate como documento
confidencial (não mande por grupo de WhatsApp, não suba em drive público).

---

## 5. LGPD

**Consentimento.** O formulário só envia com o checkbox marcado, e grava o **texto exato** que a
pessoa leu + data/hora + IP. O texto vive em `src/features/lead/schema.ts`
(`TEXTO_CONSENTIMENTO`) — mudou o texto, mudou o que é gravado dali em diante.

**Pedido de exclusão (art. 18).** No `/admin`, botão **Excluir** na linha do lead → confirmação →
apaga de vez (contato, consentimento e histórico). Fica na auditoria que houve exclusão e de qual
id — nunca o contato apagado, senão o log manteria o que se pediu para eliminar.
Depois de excluído, a pessoa pode pedir acesso de novo normalmente.

**Auditoria.** Uma entrada por ação material: `lead.status`, `lead.export`, `lead.exclusao`.
Em **produção** vai para a tabela `auditoria` do Postgres; em **dev**, para `data/auditoria.log`
(uma linha JSON por evento). O destino é escolhido pelo ambiente — não há o que configurar.

**O que ainda falta para uma operação 100% em conformidade** — ver seção 7.

---

## 6. Quando der problema

| Sintoma | Causa provável | O que fazer |
|---------|----------------|-------------|
| **Build falha na Vercel** com `[env] Configuração de ambiente inválida` | as variáveis não foram configuradas antes do deploy | configurar `APP_SECRET` e `ADMIN_PASSWORD` em Settings → Environment Variables e refazer o deploy |
| App não sobe, erro `[env]` | falta `APP_SECRET`/`ADMIN_PASSWORD` | conferir as env vars do host |
| App não sobe: "DATABASE_URL é obrigatória" | produção sem banco | criar o Postgres e configurar |
| App não sobe: "RESEND_API_KEY é obrigatória" | produção sem Resend | configurar a key (a trava é proposital) |
| E-mail não chega | domínio não verificado no Resend | verificar o domínio (SPF/DKIM); antes disso só chega no e-mail da conta |
| "Código expirado" | passou de 10 min | pedir novo código (botão reenviar) |
| "Tentativas esgotadas" | 5 erros no mesmo código | pedir novo código |
| "Muitas solicitações" (429) | 3 envios em 30 min pelo mesmo e-mail/IP | esperar a janela |
| Login do admin em 429 | 5 tentativas em 5 min | esperar 5 min |
| `/admin` volta para o login | sessão de 12h expirou | logar de novo |
| Painel do demo rebate para a landing | sem cookie de acesso válido (expira em 7 dias) | pedir acesso e verificar o e-mail |
| Painel de leads vazio em produção | `DATABASE_URL` errada ou migração não rodada | conferir a URL e rodar as migrações de `migrations/` |

**Rotacionar segredos.** Trocar `APP_SECRET` derruba **todos** os acessos ao demo e sessões de admin
(é o efeito desejado se vazar). Trocar `ADMIN_PASSWORD` só afeta logins novos — as sessões abertas
seguem válidas até 12h; para cortar na hora, troque também o `APP_SECRET`.

---

## 7. Pendências antes de divulgar publicamente

Estas **não** são opinião de estilo — são coisas que faltam para a operação ficar redonda:

1. ⚠️ **Política de Privacidade: falta a revisão jurídica.** A página existe em `/privacidade`, o
   controlador está identificado (Safe Guardian Segurança Cibernética · CNPJ 50.997.804/0001-85) e o
   texto descreve corretamente o que o sistema faz. O que falta é um advogado ler: descrever o
   sistema é engenharia, redigir documento legal não é. Confirme também se a **controladora** dos
   dados é mesmo a Safe Guardian, e não outra entidade que venha a operar o CRM Ultra.
2. ℹ️ **`npm audit`**: o que sobra não tem exposição de produção. `postcss` vem pinado pelo próprio
   Next; `sharp` é o otimizador de imagem (não usamos `next/image` — todas as imagens são `<img>`
   simples, e na Vercel a otimização é da plataforma); `vite`/`vitest`/`esbuild` são só de
   desenvolvimento e não vão para o build. Reavaliar quando o Next publicar as atualizações.

---

## 7b. Varredura de pré-lançamento (2026-08-12)

| Frente | Resultado |
|--------|-----------|
| Injeção de SQL | **ok** — tudo parametrizado (`$1`), nenhuma query concatenada |
| XSS | **ok** — nenhum `dangerouslySetInnerHTML`/`eval`; entrada barrada pelo Zod |
| Open redirect | **ok** — todos os destinos são constantes internas |
| CSRF | **ok** — `SameSite=Lax` não envia cookie em requisição de outro site |
| Cookies | **ok** — `httpOnly` + `SameSite` + `Secure` em produção |
| Segredo no git | **ok** — só chaves vazias no `.env.example` |
| Vazamento em erro | **ok** — resposta genérica, log só com o tipo do erro |
| Payload de 10 MB | **ok** — 400 em 0,06s, servidor de pé |
| Rotas de admin sem sessão | **ok** — 401 |
| Cabeçalhos de segurança | **corrigido** — HSTS, frame-ancestors, nosniff, Referrer-Policy, Permissions-Policy |
| `X-Powered-By` | **corrigido** — removido |
| `/admin/login` indexável | **corrigido** — `noindex` no segmento + `robots.txt` |
| Cache de `/admin` e `/api` | **corrigido** — `no-store` |

**Fica para depois (com o navegador aberto):** uma CSP completa. O app usa estilo inline em todo
lugar e o Next injeta script inline para hidratar — uma CSP restritiva exigiria nonce em tudo e
quebraria a tela sem dar para ver o estrago. O `frame-ancestors` já cobre o risco real
(clickjacking).

**Sobre o `npm audit`:** em produção sobram `postcss` (pinado pelo próprio Next, build-time) e
`sharp` (otimizador de imagem que o projeto **não usa** — não há `next/image` em lugar nenhum).
O resto é toolchain de teste, que não vai para o build.

---

## 8. Mapa rápido do código

| Onde | O quê |
|------|-------|
| `src/config/brand.ts` | marca (nome, contato, domínio) — fonte única |
| `src/config/demo.ts` | identidade fictícia da rede do demo (nunca a empresa real) |
| `src/features/lead/` | domínio: schema Zod, criação, verificação, casos de uso do admin |
| `src/lib/leadStore.ts` | **porta** de persistência + adaptador de arquivo (dev) |
| `src/lib/leadStorePostgres.ts` | adaptador de produção |
| `src/lib/db.ts` | pool do Postgres, compartilhado por todos os stores |
| `src/lib/ratelimit*.ts` | limite de uso (Postgres em prod, memória em dev) |
| `src/lib/auditoria.ts` | registro das ações do admin (banco em prod, arquivo em dev) |
| `src/lib/criarLeadStore.ts` | escolhe o adaptador por ambiente |
| `src/lib/email.ts` | porta de e-mail + Resend + fallback de dev |
| `src/lib/token.ts` / `adminAuth.ts` | HMAC do token de demo e da sessão de admin |
| `src/components/landing/` · `acesso/` | landing e fluxo de acesso |
| `src/app/admin/` | painel de leads |
| `waves/` | o plano por ondas e o estado de cada uma |

Trocar de banco = escrever um adaptador novo com a mesma interface `LeadStore` e ensinar o
`criarLeadStore.ts` a escolhê-lo. O domínio não muda.
