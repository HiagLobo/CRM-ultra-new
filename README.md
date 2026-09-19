# CRM Imobiliário Ultra

SaaS de CRM para o mercado imobiliário: **funil, atendimento, carteira de imóveis, Radar de captação
e comissões** — para o corretor autônomo, para a imobiliária com associados e para a rede de
franquias.

Esta fase entrega o **motor de entrada no mercado**: uma landing que vende o produto, um fluxo que
captura o corretor (e-mail + telefone + CRECI, com consentimento LGPD), verificação por código
enviado por e-mail, acesso a um **demo navegável** dos três painéis, e um **painel de leads** com funil — etapas,
"retomar depois", próxima ação, anotações e cadastro manual — onde o fundador trabalha cada contato.

Os painéis do CRM são **demonstração**: telas completas com dados fictícios. O backend real do
produto é outra fase.

---

## Rodar

```bash
npm install
cp .env.example .env.local     # preencha APP_SECRET e ADMIN_PASSWORD
npm run dev                    # http://localhost:3000
```

Em desenvolvimento não precisa de banco nem de conta de e-mail: os leads vão para `data/leads.json`
e o código de verificação aparece na própria tela.

| Comando | O quê |
|---------|-------|
| `npm run dev` | desenvolvimento |
| `npm run build` | build de produção |
| `npm run typecheck` | checagem de tipos |
| `npm test` | a suíte completa (inclui as guardas de marca, PII e conteúdo do ex-cliente) |
| `npm run seed` | 8 leads fictícios para o painel do admin (só dev) |

**Operar, publicar e resolver problema: [`waves/RUNBOOK.md`](waves/RUNBOOK.md).** Produção: Vercel
(plano Pro, funções em `gru1`) + Neon Postgres (São Paulo, 4 migrações em `migrations/`) + Resend
(`mail.crmultra.com.br`, São Paulo), domínio `crmultra.com.br` — passo a passo na seção 3.

---

## Como está montado

```
src/
  app/                    rotas (App Router)
    page.tsx              landing de marketing
    demo/                 site de exemplo: vitrine, busca, favoritos, comparar (noindex)
    corretor|ceo|franqueado/   os 3 painéis do demo (mock)
    admin/                painel de leads (guard no servidor)
    api/lead/             captura + verificação
    api/admin/            sessão e leads (todas atrás de authz)
  features/lead/          domínio: Zod, criação, verificação, funil e casos de uso do admin
  lib/                    portas e adaptadores (store, e-mail, token, auditoria)
  components/
    landing/ acesso/      landing e fluxo de acesso
    site/ corretor/ ceo/  telas do demo
  config/brand.ts         marca — fonte única (a empresa real)
  config/demo.ts          identidade FICTÍCIA da rede do demo (domínio .example)
migrations/               SQL do Postgres de produção
waves/                    o plano por ondas, o estado de cada uma e o runbook
```

**Princípio que sustenta o resto:** o domínio fala com **portas** (`LeadStore`, `ProvedorEmail`),
nunca com fornecedor. Trocar arquivo por Postgres, ou Resend por outro provedor, é escrever um
adaptador — o domínio não muda.

---

## Segurança e LGPD (o que está garantido)

- Todo input externo passa por **Zod** antes de qualquer lógica; telefone normalizado para E.164 e
  CRECI para a forma canônica (`PE 12345-F`), aceitando o jeito que o corretor digita.
- Código de verificação guardado **só como hash** (HMAC-SHA256), com expiração de 10 min, máximo de
  5 tentativas e uso único. Comparação em tempo constante.
- **Rate-limit** no envio do código (3/30 min por e-mail, 10/30 min por IP — escritório e CGNAT
  dividem IP), **teto diário** de e-mails do app (`LIMITE_ENVIOS_DIA`, padrão 90) e no login do
  admin (5/5 min por IP).
- **Anti-robô**: campo-isca sempre ligado (robô recebe sucesso falso, nada é gravado) e Cloudflare
  **Turnstile** opcional (liga com as duas chaves no env).
- **Lead não se perde**: se o e-mail com o código não sai (falha do provedor ou teto do dia), o
  contato é gravado assim mesmo e a pessoa recebe uma mensagem honesta, com saída pelo WhatsApp.
- **Aviso de lead novo** opcional (`AVISO_LEADS_EMAIL`): um e-mail sem PII, só com o link do `/admin`.
- Acesso ao demo e sessão do admin em **cookie httpOnly assinado**, validados **no servidor** (os 3
  painéis nem renderizam sem token); `/api/admin/*` inteiro atrás de
  autorização, com guard de servidor no `/admin`.
- **PII nunca vai para log** — há teste que prova isso em cada caminho.
- **Consentimento carimbado** com o texto exato que a pessoa leu + data/hora + IP.
- **Exclusão de lead** (LGPD art. 18) no painel, com confirmação e auditoria — as anotações do
  lead vão junto.
- **Funil do admin** sem vazamento: cada fluxo grava só as colunas dele (a verificação do e-mail não
  desfaz a etapa dada pelo admin, e vice-versa); a auditoria registra ids e etapas, nunca o texto de
  anotação, motivo ou próxima ação. Lead cadastrado à mão carimba de onde veio e a base legal.
- Segredos só por env, validados com Zod: sem `APP_SECRET`/`ADMIN_PASSWORD` o **build** falha. Em
  produção, `DATABASE_URL` é exigida na **primeira requisição** que usa o banco (não no boot): sem
  ela o app não cai no disco temporário, onde os leads se perderiam em silêncio — a requisição
  responde 500 e o log diz `config:DATABASE_URL`. Sem `RESEND_API_KEY`, o código nunca vai na resposta: o lead é gravado sem
  código, aparece no `/admin` e o log diz `config:RESEND_API_KEY`.
- **Diagnóstico sem PII**: os erros das rotas vão ao log como uma causa curta — `config:<VARIÁVEL>`,
  `email:<código do Resend>`, `db:<SQLSTATE>`, `rede:<errno>` — nunca a mensagem, que pode ter
  e-mail, telefone ou o host do banco. O que fazer com cada causa: seção 6 do runbook.

Pendências abertas antes de divulgar publicamente estão na **seção 7 do runbook**.

---

## Demonstração

O acesso é liberado pelo fluxo da landing (e-mail verificado). Depois disso, as três entradas
aparecem no `/login` e no fim do fluxo: **Painel do Corretor**, **CEO com associados** e
**CEO com franquias**. Todos os dados e pessoas do demo são **fictícios** — a rede que aparece
nos painéis e no site de exemplo (`/demo`) é a "Rede Exemplo Imóveis" (`src/config/demo.ts`).
As fotos têm licença Unsplash, com origem registrada em `public/assets/CREDITOS.md`.

---

## Stack

Next.js 15.5 (App Router) · TypeScript · React 18 · Zod · Resend · `pg` · Vitest · lucide-react.
Estilo: CSS variables + estilos inline, herdados do design original.
