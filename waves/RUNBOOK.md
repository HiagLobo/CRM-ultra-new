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

Detalhe de cada uma em `.env.example`. **Quando** o app confere cada variável importa, porque muda
o sintoma:

- **No build.** O `next build` carrega `src/lib/env.ts`, que valida as variáveis. Faltou ou está
  inválida → o **deploy falha** com `[env] Configuração de ambiente inválida`, listando qual. Nada
  vai ao ar.
- **Na primeira requisição que precisa dela.** O deploy passa e o site abre, mas a primeira ação
  que usa a variável falha, e o log diz qual foi (`config:<VARIÁVEL>`, seção 6). É o caso de
  `DATABASE_URL`, `RESEND_API_KEY` e `EMAIL_FROM` ausentes.

| Variável | Conferida | Sem ela (ou errada) |
|----------|-----------|---------------------|
| `APP_SECRET` | build | o deploy falha (16+ caracteres) |
| `ADMIN_PASSWORD` | build | o deploy falha (8+ caracteres) |
| `DATABASE_URL` | 1ª requisição | em produção **nenhum lead é gravado**: o site abre, mas pedir acesso e entrar no `/admin` dão erro, e o log diz `config:DATABASE_URL`. Em dev, usa `data/leads.json` |
| `RESEND_API_KEY` | 1ª requisição | em produção o site **fica no ar**, mas nenhum código sai: todo lead **novo** é gravado sem código (a pessoa vê "Recebemos seus dados"); quem já tinha cadastro não tem nada gravado e vê "Não conseguimos enviar o código agora" (503). O log diz `config:RESEND_API_KEY`. Em dev, o código aparece na tela |
| `EMAIL_FROM` | build (formato) · 1ª requisição (ausência) | formato inválido: o deploy falha. Ausente: igual à linha de cima, log `config:EMAIL_FROM` |
| `LIMITE_ENVIOS_DIA` | build | opcional. Padrão 90 e-mails em 24h (códigos + avisos), abaixo dos 100/dia do Resend Free. Valor que não é número inteiro: o deploy falha |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` + `TURNSTILE_SECRET_KEY` | build | opcionais. Sem as duas, o formulário roda só com o campo-isca. **Uma sem a outra: o deploy falha** |
| `AVISO_LEADS_EMAIL` | build (formato) | opcional. Sem ela, você não recebe o e-mail "novo lead confirmado" |
| `DATABASE_POOL_MAX` | 1ª requisição | opcional. Não defina: o padrão (3 conexões por instância) é o certo para serverless |

**`NODE_ENV` não é variável sua.** A Vercel define sozinha. Criar `NODE_ENV` no painel quebra o
deploy: com `production` na instalação, as ferramentas de build (TypeScript) não são instaladas. Com
outro valor, o app passa a se comportar como em desenvolvimento, no ar.

O contato público (e-mail, telefone, CNPJ, razão social) **não** é variável de ambiente: sai de
`src/config/brand.ts`, que é a fonte única. Há teste garantindo que esses dados não apareçam
hardcoded em nenhum outro arquivo.

As duas travas de produção são propositais. Sem banco, a Vercel gravaria os leads em disco
temporário, e eles sumiriam na primeira reciclagem, em silêncio. A trava troca essa perda silenciosa
por um erro visível no log, na primeira requisição (não no boot). Sem Resend, a API devolveria o
código de verificação para quem pedisse. Essa trava **não derruba o cadastro**: o código nunca vai
na resposta, mas o contato é gravado e aparece no `/admin`. Confira o log depois do primeiro deploy
(seção 6) para não passar dias sem enviar código a ninguém.

---

## 3. Publicar (Vercel + Neon + Resend, domínio crmultra.com.br)

O setup escolhido:

- **Vercel**, plano Pro, com as funções em São Paulo (`gru1`);
- **Neon** (Postgres) em São Paulo;
- **Resend** enviando de `mail.crmultra.com.br`, em São Paulo;
- domínio **crmultra.com.br**, registrado no registro.br, com o DNS entregue à Vercel.

Tudo fica no Brasil: cada lead demora menos e os dados pessoais não saem do país à toa.

Faça **na ordem**, porque cada passo usa algo do anterior. Separe cerca de 1 hora (a maior parte é
esperar o DNS). Guarde os valores que for gerando num gerenciador de senhas. Nunca os coloque em
arquivo do repositório (ele é público) nem em chat.

### 3.1. Vercel: plano e projeto

1. O projeto precisa estar num time **Pro** (Vercel → seu time → **Settings → Billing**). O Hobby
   (grátis) é só para uso pessoal **não comercial**. Captar lead de um produto à venda é uso
   comercial, e a Vercel pode pausar o projeto. Além disso, no Hobby o log dura só 1 hora.
2. **Add New… → Project** → escolha o repositório no GitHub (autorize o GitHub se a Vercel pedir).
   O framework é detectado sozinho (**Next.js**). Não mexa em Build/Output e **deixe vazio o painel
   "Environment Variables" dessa tela** (variável criada ali vale para todos os ambientes, Preview
   incluído — elas entram no passo 3.6, só em Production). Clique em **Deploy**.
3. **Esse primeiro deploy vai falhar** com `[env] Configuração de ambiente inválida`. É o esperado:
   as variáveis entram no passo 3.6, e só em Production. O projeto já fica criado.
4. **Região das funções:** o `vercel.json` do repositório já fixa **São Paulo (`gru1`)**. Confira em
   projeto → **Settings → Functions → Function Region** que aparece **São Paulo, Brazil (gru1)**. Vale a partir do próximo deploy (passo 3.7). Sem isso as funções
   rodam nos EUA (`iad1`): cada lead faria mais de dez idas e voltas entre os EUA e o banco em São
   Paulo, o que põe 1 a 2 s a mais no formulário.

### 3.2. Domínio: registro.br → Vercel

1. Vercel → projeto → **Settings → Domains** → **Add** → `crmultra.com.br`. Aceite a sugestão de
   adicionar também `www.crmultra.com.br`, redirecionando para `crmultra.com.br`.
2. A Vercel mostra "Invalid Configuration" e as formas de apontar o domínio. Escolha **Nameservers**
   (Vercel DNS). Ela indica `ns1.vercel-dns.com` e `ns2.vercel-dns.com`.
3. [registro.br](https://registro.br) → entre na conta → clique em **crmultra.com.br** → na parte de
   DNS, **Alterar servidores DNS** → Servidor 1: `ns1.vercel-dns.com` · Servidor 2:
   `ns2.vercel-dns.com` → **Salvar alterações**. Se a tela mostrar campos de **DNSSEC** (DS),
   deixe-os **vazios**: um DS antigo publicado com servidores novos faz o domínio parar de resolver.
4. Espere a Vercel mostrar **Valid Configuration** no domínio. Leva de minutos a algumas horas (raramente
   até 48 h). O certificado HTTPS sai sozinho em seguida.

> **A ordem importa.** Adicione o domínio na Vercel (passo 1) **antes** de trocar os servidores no
> registro.br: é isso que faz os servidores da Vercel responderem por `crmultra.com.br`. Se o
> registro.br acusar erro nos servidores logo depois de salvar, espere: ele testa de novo sozinho.
>
> **Daqui em diante, os registros DNS do domínio ficam na Vercel** (aba DNS, passo 3.3), não no
> registro.br. Se um dia houver e-mail em `@crmultra.com.br` (Google Workspace, por exemplo), os
> registros MX dele também vão lá.

### 3.3. E-mail: Resend com `mail.crmultra.com.br`

1. [resend.com](https://resend.com) → **Domains → Add Domain** → Name: `mail.crmultra.com.br` →
   Region: **São Paulo (sa-east-1)** → **Add**. A região não muda depois. O subdomínio separa a
   reputação de envio do CRM do resto do domínio.
2. O Resend lista os registros DNS a publicar. Normalmente são um **MX** e um **TXT** em `send.mail`
   e um **TXT** de DKIM em `resend._domainkey.mail`.
3. Vercel → aba **Domains** do painel do time (não a do projeto) → `crmultra.com.br` → **DNS
   Records**. Para **cada** registro do Resend, clique em **Add Record** e copie o mesmo **Type**,
   **Name**, **Value** e, no MX, **Priority**. O Name na Vercel é relativo a `crmultra.com.br`: se o
   Resend mostrar o nome completo (`send.mail.crmultra.com.br`), digite só `send.mail`.
   Acrescente também o **DMARC** do subdomínio (Gmail e Yahoo pesam isso na entrega): **Add Record**
   → Type **TXT** → Name `_dmarc.mail` → Value `v=DMARC1; p=none; rua=mailto:SEU-EMAIL` (troque pelo
   e-mail que recebe os relatórios). Depois de algumas semanas sem problema, dá para subir para
   `p=quarantine`.
4. De volta ao Resend → **Verify DNS Records** → espere o status **Verified** (costuma levar
   minutos). **Sem Verified, o Resend só entrega no e-mail dono da conta.** Nenhum corretor recebe o
   código.
5. **API Keys → Create API Key** → Name: `crm-ultra-producao` → Permission: **Sending access** →
   Domain: `mail.crmultra.com.br` → **Add**. A chave começa com `re_` e aparece **uma vez só**: leve
   direto para `RESEND_API_KEY` no passo 3.6. Com "Sending access", a chave só envia, e só por esse
   domínio. Se vazar, não lê nem apaga nada da conta.
6. O remetente é `EMAIL_FROM = CRM Ultra <acesso@mail.crmultra.com.br>`. A caixa `acesso@` não
   precisa existir: as respostas do corretor vão para o e-mail de contato da marca
   (`brand.contato.email`, como reply-to). O endereço tem de terminar **exatamente** em
   `@mail.crmultra.com.br`. Com outro domínio, o Resend recusa o envio (log `email:validation_error`).

### 3.4. Banco: Neon em São Paulo

1. [console.neon.tech](https://console.neon.tech) → **New Project** → Name: `crm-ultra` → Region:
   **AWS São Paulo (sa-east-1)** → **Create**. A região não muda depois.
2. No painel do projeto, **Connect** → Branch: o principal (`production` ou `main`) · Database:
   `neondb` → ligue **Connection pooling** → copie a *connection string*. O host tem **`-pooler`**,
   e ela termina em `?sslmode=require&channel_binding=require`.
3. **Troque `sslmode=require` por `sslmode=verify-full`.** Fica assim (valores ilustrativos):

   ```text
   postgresql://neondb_owner:SENHA@ep-xxxx-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=verify-full&channel_binding=require
   ```

   O `verify-full` confere o certificado **e** o nome do servidor. Com `require`, cada instância nova
   escreve um "SECURITY WARNING" do driver no log, e a próxima versão dele deixaria de conferir o
   certificado. O `channel_binding` pode ficar (o app ignora).

   **Por que a pooled:** cada função da Vercel abre o próprio pool. Com a string direta, um pico de
   acessos estoura o limite de conexões do Postgres (log `db:53300`).
4. **As 7 migrações, uma vez só.** Neon → **SQL Editor** (branch principal, database `neondb`). Abra
   `migrations/001-leads.sql` no GitHub, copie **tudo**, cole e clique em **Run**. Repita com
   `002-auditoria.sql`, `003-rate-limit.sql`, `004-funil.sql`, `005-cadastro-unico.sql`,
   `006-avaliacoes.sql` e `007-orcamentos.sql`, nessa ordem. São idempotentes: rodar de novo não
   estraga nada. (Banco que já estava no ar: a 004 pelo passo 3.9, a 005 pelo 3.10, a 006 pelo 3.11
   e a 007 pelo 3.12.)
5. Confira no mesmo SQL Editor:

   ```sql
   SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY 1;
   ```

   Têm de voltar **`auditoria`, `avaliacoes`, `lead_notas`, `leads`, `orcamentos` e `rate_limit`**. Se faltar a
   `rate_limit` (migração 003), todo pedido de acesso e todo login do admin dão erro (log
   `db:42P01`). Se faltar a `auditoria` (002), o sistema funciona, mas a trilha de auditoria da LGPD
   **não grava**, em silêncio. Se faltar a `lead_notas` (004), o funil do `/admin` dá erro (passo
   3.9). Se faltar a `avaliacoes` (006), quem tentar avaliar o demo recebe erro (passo 3.11).

### 3.5. (Opcional) Turnstile e aviso de lead novo

- **Anti-robô Turnstile** (grátis): Cloudflare → **Turnstile → Add widget** → Hostnames:
  `crmultra.com.br` e `www.crmultra.com.br` → modo **Managed** → copie a **Site Key** e a **Secret
  Key**. As duas entram juntas no passo 3.6 (uma sem a outra faz o deploy falhar). Sem Turnstile, o
  campo-isca continua barrando robô simples.
- **Aviso de lead novo:** escolha o e-mail onde quer saber que entrou lead (`AVISO_LEADS_EMAIL`). O
  aviso não traz dado do lead, só o link do `/admin`.

### 3.6. Variáveis, só em Production

Vercel → projeto → **Settings → Environment Variables**. Para cada linha, preencha **Key** e
**Value** e, em **Environments**, marque **só Production** (desmarque Preview e Development). Se a
Vercel oferecer a opção **Sensitive**, ligue nas secretas.

| Key | Value |
|-----|-------|
| `APP_SECRET` | gere com `openssl rand -base64 32` (ou 32+ caracteres aleatórios do gerenciador de senhas). Secreta |
| `ADMIN_PASSWORD` | senha forte de verdade, só sua (16+ caracteres). Secreta |
| `DATABASE_URL` | a string pooled do passo 3.4, com `sslmode=verify-full`. Secreta |
| `RESEND_API_KEY` | a chave "Sending access" do passo 3.3. Secreta |
| `EMAIL_FROM` | `CRM Ultra <acesso@mail.crmultra.com.br>` |
| `LIMITE_ENVIOS_DIA` | opcional. No Resend Free, não crie (padrão 90). No plano pago, o limite diário do plano |
| `AVISO_LEADS_EMAIL` | opcional (passo 3.5) |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` + `TURNSTILE_SECRET_KEY` | opcionais, as duas juntas (passo 3.5). A secret é secreta; a site key é pública e entra no build |

**Não crie `NODE_ENV`** (seção 2).

**Por que só Production.** Os deploys de Preview (um por branch ou pull request) rodam código que
ainda não foi revisado. Com as variáveis de produção, eles gravariam na base real de leads e
mandariam e-mail de verdade. Sem elas, o build do Preview falha de propósito: nenhum preview roda
com dado real. Se um dia quiser um preview funcionando, crie um **branch do Neon** só para ele e
variáveis **próprias** no escopo Preview (outro `APP_SECRET`, outra senha). Nunca use as de produção.

### 3.7. Redeploy, toda vez que mexer em variável

Variável nova ou alterada **só vale num deploy novo**. Vercel → projeto → **Deployments** → o deploy
mais recente → menu **⋯** → **Redeploy** → confirme. Espere o status **Ready**. (Se o botão não
aparecer, qualquer commit novo na branch `main` também dispara um deploy com as variáveis atuais.)

Isso vale para sempre: trocou chave, senha, `DATABASE_URL`, limite ou Turnstile → **Redeploy**. Sem
isso, o site no ar continua usando o valor antigo.

### 3.8. Smoke em produção (faça sempre, na ordem)

1. Abrir `https://crmultra.com.br`. A landing carrega, com o cadeado no navegador.
2. **Acessar CRM** → preencher com nome completo e um e-mail **seu** (telefone e CRECI — com o
   estado — seus ou de teste). O e-mail
   com o código chega de `CRM Ultra <acesso@mail.crmultra.com.br>` (olhe também o spam). Se a
   tela disser "Recebemos seus dados. O e-mail com o código não saiu agora" (e-mail novo) ou "Não
   conseguimos enviar o código agora" (e-mail que já tinha cadastro), o e-mail **não** saiu: veja o
   log (seção 6).
3. Digitar o código → cai na escolha dos 3 painéis → abrir um. Com `AVISO_LEADS_EMAIL`, chega também
   o aviso "novo lead confirmado".
4. Entrar em `https://crmultra.com.br/admin/login` com a `ADMIN_PASSWORD`. O seu lead aparece na
   lista, na etapa **Novo**, com o selo de e-mail confirmado.
5. Na linha do lead, mudar a etapa para **Em contato** → clicar na linha (abre a ficha do lead) →
   escrever uma anotação → fechar a ficha → **Exportar CSV** → abrir no Excel
   (colunas separadas, datas legíveis, colunas `etapa` e `canal`). Depois, no Neon → SQL Editor,
   confira a auditoria:

   ```sql
   SELECT acao, em FROM auditoria ORDER BY em DESC LIMIT 5;
   ```

   Têm de aparecer `lead.export`, `lead.nota` e `lead.etapa`.

**Terminado o smoke, exclua o lead de teste:** `/admin` → clique na linha dele → no fim da ficha,
**Excluir (LGPD)** → confirme. Ele
sai da lista e dos números do funil. A auditoria guarda só `lead.exclusao` com o id (motivo:
pedido do titular, que no caso é você).

Se algum passo falhar, veja a seção 6.

### 3.9. Migração 004 (funil) — publique a versão nova e rode a 004 logo em seguida

Para quem já está no ar com as migrações 001 a 003. (Banco novo: o passo 3.4 já inclui a 004.) A
versão com o funil de leads usa colunas e uma tabela que só a `004-funil.sql` cria.

**A ordem é: publicar primeiro, migrar logo depois.** O motivo:

- o painel **antigo** (O7) não conhece as etapas novas. Se a 004 rodar antes, ela converte
  `contatado` → `em_contato` e `descartado` → `perdido`, e o `/admin` antigo quebra ao abrir
  (até o deploy novo sair);
- o código **novo** aguenta o banco antigo: lê com `SELECT *`, entende os status antigos e só grava
  as colunas novas quando elas têm valor. Captação, verificação e a lista do `/admin` seguem
  funcionando. Só as ações novas (mudar etapa, próxima ação, anotar, cadastrar à mão) esperam a 004.

Passo a passo:

1. **Backup.** Neon → **Branches → Create branch** a partir do principal, com a data no nome (ex.:
   `antes-004-2026-09-20`). Veja "Backup" na seção 4.
2. **Publique**: merge/push na `main` (deploy automático) e espere o deploy ficar **Ready** na Vercel.
3. **Logo em seguida**, Neon → **SQL Editor** (branch principal, database `neondb`) → abra
   `migrations/004-funil.sql` no GitHub → copie **tudo** → cole → **Run**. Não precisa de Redeploy.
4. Confira, no mesmo SQL Editor:

   ```sql
   SELECT column_name FROM information_schema.columns
    WHERE table_name = 'leads'
      AND column_name IN ('nome', 'canal', 'retomar_em', 'motivo', 'proxima_acao_em', 'proxima_acao')
    ORDER BY 1;
   ```

   Têm de voltar as **6** colunas.

   ```sql
   SELECT status, count(*) FROM leads GROUP BY status ORDER BY status;
   ```

   Só etapas novas (`novo`, `em_contato`, `perdido`…). Nenhum `verificado`, `contatado` ou
   `descartado`.

   ```sql
   SELECT to_regclass('public.lead_notas');
   ```

   Tem de voltar `lead_notas`. Vazio quer dizer que a tabela das anotações não foi criada.
5. No `/admin`: mude a etapa de um lead, escreva uma anotação e cadastre um lead de teste à mão
   (depois exclua). Se algum der erro, veja a causa no log (abaixo).

**O que a 004 faz:** acrescenta as colunas do funil (nome, canal, retomar em, motivo, próxima ação),
deixa o e-mail opcional (só o lead cadastrado à mão pode não ter; dois leads continuam sem poder ter
o mesmo e-mail), traduz `verificado` → `novo`, `contatado` → `em_contato` e `descartado` → `perdido`,
e cria a tabela `lead_notas` das anotações. **Não apaga nada** e pode rodar de novo sem estrago.

**Entre o deploy e a 004** (ou se esquecer de rodar): mudar etapa, definir próxima ação, anotar e
cadastrar à mão dão erro, com `db:42703` (coluna que não existe) ou `db:42P01` (tabela
`lead_notas` que não existe) no log `[/api/admin/...]`. Rode a 004 (passos 3 e 4).

### 3.10. Migração 005 (cadastro único) — rode a 005 ANTES de publicar a versão nova

Para quem já está no ar com as migrações 001 a 004. (Banco novo: o passo 3.4 já inclui a 005.) A
versão com o cadastro único — "Já tenho cadastro", WhatsApp e CRECI sem repetir, conferência do CRECI
no painel e "voltou ao demo" — grava em 3 colunas que só a `005-cadastro-unico.sql` cria.

**A ordem é: migrar primeiro, publicar depois** (o contrário da 004). O motivo:

- a 005 só **acrescenta** (3 colunas e 2 índices): o código que está no ar ignora colunas a mais,
  então rodá-la antes não quebra nada;
- o código **novo** grava nelas: sem a 005, marcar "Confere"/"Não confere" no CRECI dá erro, e o
  último acesso ao demo não é registrado (o login segue; o log avisa);
- **a 004 tem de estar aplicada** (3.9): o cadastro novo grava o **nome**, que é coluna da 004. Sem
  ela, **todo cadastro dá erro** (`db:42703`).

Passo a passo:

1. **Backup.** Neon → **Branches → Create branch** a partir do principal, com a data no nome (ex.:
   `antes-005-2026-09-20`). Veja "Backup" na seção 4.
2. Neon → **SQL Editor** (branch principal, database `neondb`) → abra
   `migrations/005-cadastro-unico.sql` no GitHub → copie **tudo** → cole → **Run**.
3. Confira, no mesmo SQL Editor:

   ```sql
   SELECT column_name FROM information_schema.columns
    WHERE table_name = 'leads'
      AND column_name IN ('nome', 'creci_conferencia', 'creci_conferido_em', 'ultimo_acesso_em')
    ORDER BY 1;
   ```

   Têm de voltar as **4** colunas. Faltou o `nome`? A 004 não rodou: faça o 3.9 antes de seguir.

   ```sql
   SELECT indexname FROM pg_indexes
    WHERE tablename = 'leads'
      AND indexname IN ('leads_telefone_idx', 'leads_creci_idx')
    ORDER BY 1;
   ```

   Têm de voltar os **2** índices (a busca de WhatsApp e CRECI repetidos no cadastro).
4. **Só então publique**: merge/push na `main` (deploy automático) e espere o deploy ficar **Ready**
   na Vercel.
5. Smoke: o 3.8 inteiro (agora o cadastro pede **nome completo** e o **estado** do CRECI) e, com o
   seu e-mail, **"Já tenho cadastro"** → o código chega → entra no demo. No `/admin`, a ficha do seu
   lead mostra o último acesso; marque **Confere** no CRECI e depois desfaça.

**O que a 005 faz:** acrescenta `creci_conferencia` e `creci_conferido_em` (a conferência que você
marca no painel) e `ultimo_acesso_em` (carimbado a cada entrada no demo), e cria os índices de
`telefone` e `creci`. Índices **simples**, não `UNIQUE`: o banco já tem repetidos de teste, e a regra
(barrar o repetido com a mensagem certa) mora no app. **Não apaga nada** e pode rodar de novo sem
estrago.

**Repetidos que já existem** não quebram nada: o painel mostra o selo "repetido". Para listá-los:

```sql
SELECT telefone, count(*) FROM leads GROUP BY telefone HAVING count(*) > 1 ORDER BY 2 DESC;
```

Os de teste, exclua pelo `/admin` (ficha do lead → **Excluir (LGPD)**).

**Se publicar antes da 005** (ou esquecer): cadastro, "Já tenho cadastro" e login seguem. Marcar a
conferência do CRECI dá erro, com `db:42703` no log `[/api/admin/leads] PATCH`, e cada entrada no demo
loga `[verify] último acesso não registrado: db:42703`. Rode a 005 (passos 2 e 3); não precisa de
Redeploy.

### 3.11. Migração 006 (avaliações) — rode a 006 ANTES de publicar a versão nova

Para quem já está no ar com as migrações 001 a 005. (Banco novo: o passo 3.4 já inclui a 006.) A
versão com a **avaliação por estrelas dentro do demo** grava numa tabela nova, `avaliacoes`, que só
a `006-avaliacoes.sql` cria.

**A ordem é: migrar primeiro, publicar depois** (como na 005). O motivo:

- a 006 só **acrescenta** (uma tabela nova e dois índices): o código que está no ar nem sabe que ela
  existe, então rodá-la antes não muda nada no site;
- o código **novo** grava nela: sem a 006, o convite para avaliar aparece, a pessoa dá a nota e
  recebe erro — o pior momento possível para falhar.

Passo a passo:

1. **Backup.** Neon → **Branches → Create branch** a partir do principal, com a data no nome (ex.:
   `antes-006-2026-09-20`). Veja "Backup" na seção 4.
2. Neon → **SQL Editor** (branch principal, database `neondb`) → abra `migrations/006-avaliacoes.sql`
   no GitHub → copie **tudo** → cole → **Run**.
3. Confira, no mesmo SQL Editor:

   ```sql
   SELECT column_name FROM information_schema.columns
    WHERE table_name = 'avaliacoes'
    ORDER BY 1;
   ```

   Têm de voltar as **11** colunas (`atualizado_em`, `comentario`, `consentimento_em`,
   `consentimento_ip`, `consentimento_texto`, `criado_em`, `estrelas`, `id`, `identificacao`,
   `lead_id`, `status`). Não voltou nada? A 006 não rodou.

   ```sql
   SELECT indexname FROM pg_indexes
    WHERE tablename = 'avaliacoes'
    ORDER BY 1;
   ```

   Têm de voltar `avaliacoes_lead_idx` (o único, que garante **uma avaliação por corretor**),
   `avaliacoes_status_criado_idx` e a chave primária.
4. **Só então publique**: merge/push na `main` (deploy automático) e espere o deploy ficar **Ready**
   na Vercel.
5. Smoke: entre no demo com o seu e-mail, avalie com **4 estrelas** e um comentário comum. A landing
   tem de mostrar a contagem subindo, e o `/admin` → **Avaliações** tem de listar a sua. Depois
   **Tirar do site** e confira que o texto some da landing e a nota continua na média.

**O que a 006 faz:** cria a tabela `avaliacoes` (nota de 1 a 5, comentário opcional, escolha de
identificação, situação e o carimbo do consentimento), com `ON DELETE CASCADE` no lead — excluir um
lead pelo `/admin` (LGPD) apaga a avaliação dele junto — e os dois índices. **Não apaga nada**, não
toca na tabela `leads` e pode rodar de novo sem estrago.

**Se publicar antes da 006** (ou esquecer): o site segue normal, mas quem tentar avaliar recebe erro,
com `db:42P01` no log `[/api/avaliacao]`, e a landing mostra só as avaliações do arquivo (a vitrine
loga `[/api/avaliacoes] GET: db:42P01`). Rode a 006 (passos 2 e 3); não precisa de Redeploy.

---

### 3.12. Migração 007 (orçamentos) — rode a 007 ANTES de publicar a versão nova

Para quem já está no ar com as migrações 001 a 006. (Banco novo: o passo 3.4 já inclui a 007.) A
versão com o **gerador de orçamento no painel** grava numa tabela nova, `orcamentos`, que só a
`007-orcamentos.sql` cria.

**A ordem é: migrar primeiro, publicar depois** (como na 005 e na 006). O motivo:

- a 007 só **acrescenta** (uma tabela nova e dois índices): o código que está no ar nem sabe que ela
  existe, então rodá-la antes não muda nada no site;
- o código **novo** grava nela: sem a 007, a aba Orçamentos abre, o fundador monta a proposta
  inteira e recebe erro ao salvar.

Passo a passo:

1. **Backup.** Neon → **Branches → Create branch** a partir do principal, com a data no nome (ex.:
   `antes-007-2026-09-20`). Veja "Backup" na seção 4.
2. Neon → **SQL Editor** (branch principal, database `neondb`) → abra `migrations/007-orcamentos.sql`
   no GitHub → copie **tudo** → cole → **Run**.
3. Confira, no mesmo SQL Editor:

   ```sql
   SELECT column_name FROM information_schema.columns
    WHERE table_name = 'orcamentos'
    ORDER BY 1;
   ```

   Têm de voltar as **13** colunas (`atualizado_em`, `condicoes`, `criado_em`, `enviado_em`, `id`,
   `itens`, `lead_id`, `numero`, `observacao`, `publico`, `status`, `totais`, `validade_em`). Não
   voltou nada? A 007 não rodou.

   ```sql
   SELECT indexname FROM pg_indexes
    WHERE tablename = 'orcamentos'
    ORDER BY 1;
   ```

   Têm de voltar `orcamentos_lead_idx`, `orcamentos_status_criado_idx`, a chave primária e o índice
   único do `numero` (é ele que garante que dois orçamentos salvos ao mesmo tempo não recebam o
   mesmo `ORC-AAAA-NNN`).
4. **Só então publique**: merge/push na `main` (deploy automático) e espere o deploy ficar **Ready**
   na Vercel.
5. Smoke: `/admin` → **Orçamentos** → **+ Novo orçamento**, escolha um lead de teste, 5 assentos Pro,
   salve e confira na lista o número `ORC-AAAA-001`, o total mensal e a validade. Depois **Excluir**
   para não deixar proposta de teste na base.
   *(O passo de abrir o documento A4 em `/admin/orcamento/<id>` só vale depois que a S3 da O11
   estiver publicada: até lá o link leva a uma página que ainda não existe.)*

**O que a 007 faz:** cria a tabela `orcamentos` (número, situação, itens, totais e condições em
JSONB, validade e observação), com `ON DELETE CASCADE` no lead — excluir um lead pelo `/admin`
(LGPD) apaga os orçamentos dele junto — e os dois índices. **Não apaga nada**, não toca nas tabelas
`leads` e `avaliacoes` e pode rodar de novo sem estrago.

**Se publicar antes da 007** (ou esquecer): o site e o funil seguem normais, mas salvar orçamento dá
erro, com `db:42P01` no log `[/api/admin/orcamentos]`. Rode a 007 (passos 2 e 3); não precisa de
Redeploy.

### 3.13. Ligar a contagem de visitas (Vercel Analytics)

**Já está funcionando** (conferido em 21/09/2026: a visita à landing e ao `/demo/portal` chegou ao
contador, e o painel não mandou nada). Não tem variável de ambiente para criar. O que fazer é só
olhar: Vercel → projeto → aba **Analytics**. Se um dia aparecer o botão **Enable**, é porque a
medição foi desligada; ligue e faça um **Redeploy**.

**O que é medido:** só as páginas públicas (landing, política, `/demo`, e as telas de demonstração
`/ceo`, `/corretor`, `/franqueado`). O painel (`/admin`), a entrada dele (`/login`) e as rotas de
API **ficam de fora**: naquele endereço vai o identificador do cliente do orçamento, e ele não sai
do seu navegador. Quem garante isso é `src/lib/medicao.ts`, com teste ao lado.

**Sem cookie e sem nome:** a contagem é por página, anônima, e está escrita na Política de
Privacidade (seções 2 e 4). Se um dia ligar outra ferramenta de medição, a política precisa mudar
junto.

**Se a aba Analytics ficar vazia:** abra o site, tecle F12 → **Network** e procure
um `script.js` fora de `_next` (a Vercel serve por um endereço camuflado, para driblar bloqueador
de anúncio). Nenhum script assim = a medição foi desligada na aba Analytics. Nada aparecendo =
você está numa página do painel, que por regra não é contada.

---

## 4. Operação do dia a dia

**Ver os leads:** `/admin/login` → `/admin`. A sessão dura 12h.

**Moderar as avaliações do demo.** Quem está com o demo liberado dá a nota e, se quiser, escreve um
comentário. O comentário **publica direto**; o filtro automático segura no `pendente` só o que tem
link, e-mail, telefone, texto gigante, muitas linhas em branco, quase tudo em maiúsculas ou
palavrão — e o painel mostra o motivo em português ("tem link", "tem telefone"…). No `/admin`, aba
**Avaliações**: **Publicar** põe no ar, **Tirar do site** remove o texto. A **nota continua contando
na média** nos dois casos: o que sai do ar é o comentário, não a avaliação. Cada mudança fica na
auditoria como `avaliacao.status` com o id e a situação de/para — nunca o texto nem quem escreveu.
Se `AVISO_LEADS_EMAIL` estiver configurada, chega um e-mail a cada avaliação nova (ou quando ela
muda de situação) com **só a nota, a situação e o link do painel**.

**Montar um orçamento.** `/admin` → aba **Orçamentos** → **+ Novo orçamento**. Escolha o lead (quem
ainda não está no funil entra pelo **+ Novo lead**), o público (autônomo, imobiliária ou rede), a
quantidade de assentos Pro e Ultra, o desconto, se é anual e os extras. O total mensal, o total do
ano e a implantação mudam na hora, e **a conta é sempre a do sistema**: a tabela de preços mora em
`src/features/orcamento/tabela.ts` e nenhuma tela escreve valor na mão.

Duas travas, de propósito diferentes: a partir de **15% de desconto** aparece um aviso amarelo (dá
para seguir), e **abaixo do piso do plano** (R$ 85,00 por assento no Pro, R$ 109,00 no Ultra) o
servidor recusa com 409 — não adianta insistir pela tela nem chamar a API direto.

O piso vale sobre **o que o cliente paga**. No anual, que dá 12 meses pelo preço de 10, o efetivo
por assento é `mensal × 10 ÷ 12`, e é esse número que é comparado com o piso: por isso o teto do
desconto no anual é bem menor que no mensal (com 10 assentos Pro, cai de ~41% para ~29%). O
desconto do anual vale **só na linha dos assentos**: consumo medido (IA acima da franquia, Radar,
bureau, baixa extra) é pago por uso e não ganha dois meses de graça.

A **implantação** (personalização do software, migração de carteira e treinamento) é paga em duas
partes: **entrada na assinatura** (padrão 50%, no campo "Entrada (%)") e **saldo na conclusão**.
Ela não é diluída em 12 meses e **não é devolvida** se o cliente sair depois: o serviço já foi
entregue. Também **não há multa de saída** em nenhum plano; no mensal basta aviso por escrito com
30 dias de antecedência.

Salvo, o orçamento nasce **rascunho**, ganha o número `ORC-AAAA-NNN` e guarda **os preços do dia**:
mudar a tabela depois não altera proposta já emitida.

Cada orçamento abre o documento A4 em `/admin/orcamento/<id>` (botão **Baixar PDF** = impressão do
navegador, "Salvar como PDF"). No painel dá para marcar **enviado**, **aceito** ou **recusado**,
duplicar e excluir. As mudanças ficam na auditoria como `orcamento.criado` e `orcamento.status`, com
id, público e quantidade de assentos — **nunca valores, nome de cliente ou observação**.

**Tour guiado.** Na primeira visita de cada tela com tour (os 3 painéis, atendimento, radar e a busca
do portal — 6 tours, 33 passos) a orientação aparece sozinha: destaque no elemento + balão explicando. Pular ou concluir
faz ele não insistir; para rever, o botão **Guia** tem "Refazer o tour desta tela".

**Painel vazio para explorar?** `npm run seed` cria 8 leads fictícios com status variados. O script
recusa rodar se encontrar `NODE_ENV=production` ou `DATABASE_URL` — semear a base real falsearia os
números do seu funil.

**Lead que chegou sem código.** Se o e-mail com o código não sai (Resend fora do ar ou travado por
mais de 8 s, domínio não verificado, cota do dia, `RESEND_API_KEY`/`EMAIL_FROM` faltando) ou o teto
diário (`LIMITE_ENVIOS_DIA`) estourou, o lead **novo** é **gravado mesmo assim**, com status "novo", e a pessoa vê "Recebemos seus dados. O e-mail com o código não saiu
agora — tente reenviar em alguns minutos ou fale com a gente", com um botão de WhatsApp. No
`/admin` ele aparece como qualquer lead novo: é só ligar ou chamar no WhatsApp. O motivo fica no
log (seção 6).

Já o e-mail que **já tinha cadastro** (cadastro de novo ou "Já tenho cadastro") não tem nada a
gravar: a resposta é 503 e a pessoa vê "Não conseguimos enviar o código agora. Tente de novo em alguns minutos ou fale com a gente.",
com o WhatsApp. O lead continua no `/admin` com os dados de antes, e um código anterior ainda no
prazo segue valendo. Log: `[/api/lead] código não enviado; e-mail já cadastrado, nada gravado: <causa>`
(ou `[/api/lead/entrar] código não enviado: <causa>`).

**Aviso de lead novo.** Com `AVISO_LEADS_EMAIL` definida, cada lead que confirma o e-mail pela
**primeira** vez gera um aviso "novo lead confirmado" com o link do `/admin` — sem e-mail, telefone
ou CRECI do lead no corpo. Pedir código de novo e reverificar não avisa outra vez. Se o aviso falhar,
a verificação do corretor segue normal e o log registra `[aviso-lead]`.

**Anti-robô.** O formulário tem um campo-isca invisível (robô preenche, gente não vê): quem
preenche recebe um "sucesso" falso e nada é gravado nem enviado. Com as duas chaves do Turnstile
no env, entra também o desafio da Cloudflare — quase sempre invisível; só aparece quando a
Cloudflare desconfia.

**O painel, em uma olhada.** No topo, 4 números: **Para hoje**, **Em andamento** (contato,
demonstração ou negociação), **Clientes** e **Conversão**. Embaixo, uma aba por etapa, com a
contagem: **Hoje** · Novos · Em contato · Demonstração · Negociação · Clientes · Retomar depois ·
Perdidos · Todos. A busca (nome, e-mail, telefone ou CRECI) vale dentro da aba aberta. No celular as
abas rolam para o lado e cada lead vira um cartão.

**A aba Hoje** é a sua lista do dia (sempre no horário de Recife). Entra nela:

- lead com a **próxima ação** vencida ou marcada para hoje;
- lead em **Retomar depois** cuja data chegou (ou passou);
- lead **Novo** criado há 24 h ou mais, sem ninguém ter falado com ele e sem próxima ação marcada.

A ordem é a da urgência: ações vencidas (a mais antiga primeiro), retornos, ações do dia, novos
parados. O painel abre na aba Hoje quando há o que fazer; com tudo em dia, abre em **Todos**. A
coluna **Próximo passo** diz o que falta em cada lead (em vermelho quando está atrasado).

**A ficha do lead.** Clique na linha (no celular, no cartão): abre a ficha, com os botões de
WhatsApp e e-mail, a etapa, a próxima ação (editar ou limpar), as anotações, de onde o lead veio e o
**Excluir (LGPD)**. Esc ou o X fecham.

**Conferir o CRECI** (não há consulta automática: os conselhos não têm API oficial e as buscas têm
captcha). Na ficha, bloco **CRECI**: **Copiar número** → **Conferir no CRECI-PE ↗** (abre a busca
oficial do conselho em outra aba) → cole o número e confira nome e situação → volte e marque
**✓ Confere** ou **✗ Não confere** ("Desfazer" limpa). A lista mostra o selo ao lado do CRECI. CRECI
antigo sem estado: o link diz **(provável)** — a UF é palpite pelo DDD do WhatsApp; se não achar,
confira no conselho de outro estado. O CRECI-TO não tem página de busca direta: o link abre o site
do conselho, e ali se procura a consulta de inscritos. Se o corretor trocar o CRECI pelo site, a
conferência antiga é desfeita sozinha (na mesma gravação do CRECI novo). Os endereços das buscas ficam em `src/config/creciConsulta.ts`.

**Selos da lista.** **repetido**: outro lead tem o mesmo WhatsApp ou o mesmo CRECI (o cadastro novo
já barra; o selo mostra os que vieram de antes — abra a ficha para ver qual dado repete e se é o
mesmo lead nos dois; CRECI antigo sem estado aparece como "mesmo número de CRECI (sem estado)", que
pode ser de conselhos diferentes). No celular, o ✓/✗ da conferência fica ao lado do nome.
**voltou ao demo**: o lead entrou de novo no demo nos últimos 7 dias (a ficha mostra o "Último
acesso ao demo") — bom momento para puxar conversa.

**Funil de leads.** Cada lead está numa **etapa**: **Novo** → **Em contato** → **Demonstração** →
**Negociação** → **Cliente**. A etapa muda no seletor da própria linha ou na ficha. Fora da fila de
trabalho ficam **Retomar depois** e **Perdido**:

- **Retomar depois** pede o dia de voltar (depois de hoje, no horário de Recife, com os atalhos
  "em 1 semana", "em 1 mês" e "em 3 meses") e, se quiser, o motivo. É a "quarentena" de quem
  recusou por agora: no dia marcado, o lead volta sozinho para a aba Hoje. Para mudar a data, abra
  a ficha → **Alterar**.
- **Perdido** pede o motivo (preço, já usa outro CRM, sem interesse, sem resposta, outro).
- Indo para uma dessas duas, a próxima ação é limpa: o lead sai da fila. Saindo delas, a data de
  retomar e o motivo são limpos.
- **E-mail confirmado não é etapa.** É o selo de quem digitou o código. Confirmar o e-mail não muda
  a etapa que você deu.

**Próxima ação:** o dia (hoje ou depois) e o que fazer ("ligar às 10h", "mandar proposta"). Dá para
limpar.

**Anotações:** o histórico da conversa com o lead, até 2.000 caracteres cada, da mais recente para a
mais antiga. Não vão para o CSV e somem junto com o lead na exclusão (seção 5).

**Cadastro manual ("+ Novo lead").** Para quem chegou por indicação, evento ou WhatsApp. Telefone e
canal são obrigatórios; nome, e-mail, CRECI e observação são opcionais (a observação vira a primeira
anotação). A caixa "a pessoa sabe e concordou em ser contatada" é obrigatória: marque só se for
verdade, porque é a base do registro (seção 5). O lead manual não recebe código. Telefone ou e-mail
que já existe não vira um segundo lead: o painel avisa e oferece **Abrir o existente**. Cadastrado,
a ficha do lead abre sozinha. O botão de WhatsApp de um lead manual abre a conversa com um "Oi!"
neutro (ele não pediu o demo pelo site). Se a pessoa depois pedir acesso pelo site com o mesmo
e-mail, continua sendo o mesmo lead.

Toda mudança de etapa, próxima ação, anotação e cadastro manual fica na auditoria (seção 5), sem o
texto do motivo, da ação ou da anotação.

**Exportar:** botão "Exportar CSV". Abre em Excel/Sheets, com nome, contato, etapa, canal, próxima
ação, retomar em e motivo (as anotações ficam de fora). O arquivo tem PII: trate como documento
confidencial (não mande por grupo de WhatsApp, não suba em drive público).

**Backup.** Duas rotinas, e as duas valem sempre:

- **Toda semana:** `/admin` → **Exportar CSV** → guarde o arquivo num lugar privado (pasta pessoal
  protegida, nunca drive público nem grupo de WhatsApp, porque tem dado pessoal). É a cópia que
  sobrevive a qualquer problema no banco.
- **Antes de qualquer SQL manual que altere ou apague** (`UPDATE`, `DELETE`, `ALTER`, migração nova):
  Neon → **Branches → Create branch** a partir do branch principal, com a data no nome (ex.:
  `antes-2026-10-01`). O branch é uma cópia do banco naquele instante. Se der errado, os dados de
  antes estão nele: dá para conferir, copiar de volta ou restaurar o branch principal pelo
  **Restore** do Neon. Quando tiver certeza de que está tudo certo, apague o branch de backup (o
  plano Free limita o número de branches).

O Neon Free guarda histórico para restauração por poucas horas. Se a base crescer, avalie um plano
com janela maior.

---

## 5. LGPD

**Consentimento.** O formulário só envia com o checkbox marcado, e grava o **texto exato** que a
pessoa leu + data/hora + IP. O texto vive em `src/features/lead/schema.ts`
(`TEXTO_CONSENTIMENTO`) — mudou o texto, mudou o que é gravado dali em diante.

**Pedido de exclusão (art. 18).** No `/admin`, abra o lead → **Excluir (LGPD)** → confirmação → apaga de vez
(contato, consentimento, etapa, próxima ação e **todas as anotações**). Fica na auditoria que houve
exclusão e de qual id — nunca o contato apagado, senão o log manteria o que se pediu para eliminar.

**Lead cadastrado à mão.** Não passou pelo formulário, então o consentimento gravado é outro:
"Cadastro manual pelo administrador — canal X — base legal: legítimo interesse (contato iniciado
pelo titular ou indicação consentida)", com a data e `admin` no lugar do IP. O cadastro só é aceito
com a caixa "a pessoa sabe e concordou em ser contatada" marcada. Inclua esse texto na revisão
jurídica da seção 7.
Depois de excluído, a pessoa pode pedir acesso de novo normalmente.

**Auditoria.** Uma entrada por ação material: `lead.etapa` (id, etapa de/para),
`lead.proxima_acao` (id, definida ou limpa), `lead.nota` (id do lead e da anotação), `lead.manual`
(id, canal), `lead.export` (quantas linhas) e `lead.exclusao` (id). Nunca o contato, o nome nem o
texto do motivo, da ação ou da anotação. Registros de antes do funil trazem `lead.status`.
Em **produção** vai para a tabela `auditoria` do Postgres; em **dev**, para `data/auditoria.log`
(uma linha JSON por evento). O destino é escolhido pelo ambiente — não há o que configurar.

**O que ainda falta para uma operação 100% em conformidade** — ver seção 7.

---

## 6. Quando der problema

### Onde olhar

- **Log do app:** Vercel → projeto → **Logs**. Filtre pelo nível **Error**/**Warning** ou busque
  pela rota (ex.: `[/api/lead]`). No plano Pro o log fica cerca de **1 dia**: olhe no mesmo dia e,
  se precisar guardar, copie a linha.
- **Resend:** aba **Emails** (cada envio: entregue, devolvido, marcado como spam) e aba **Logs**
  (cada chamada ao Resend, com o erro de cada recusa).
- **Neon:** **Monitoring** (conexões e uso) e o armazenamento do projeto (no plano Free, 0,5 GB;
  cheio, nada mais é gravado).

Nas primeiras semanas, abra o log e o `/admin` uma vez por dia.

### Causa no log → o que fazer

As linhas de erro do cadastro e do banco terminam numa **causa**: uma categoria curta, sem dado
pessoal, que diz o que quebrou (`src/lib/erros.ts`). Exemplos de linha:

```text
[/api/lead] erro ao processar: config:DATABASE_URL
[/api/lead] código não enviado; lead gravado sem código: email:daily_quota_exceeded
[/api/lead] código não enviado; e-mail já cadastrado, nada gravado: email:PrazoEsgotado
[/api/lead/verify] erro ao processar: db:42P01
[/api/lead/entrar] código não enviado: teto_diario
[verify] último acesso não registrado: db:42703
[aviso-lead] aviso de lead novo não saiu: email:PrazoEsgotado
[db] conexão ociosa caiu (o pool abre outra): db:57P01
```

| Causa | O que quebrou | O que fazer |
|-------|---------------|-------------|
| `config:DATABASE_URL` | produção sem a variável do banco: **nenhum lead é gravado** | criar `DATABASE_URL` em Production (3.6) → **Redeploy** (3.7) |
| `config:RESEND_API_KEY` · `config:EMAIL_FROM` | produção sem a variável do Resend: os leads **novos** entram **sem código**; quem já tinha cadastro recebe 503 e nada é gravado | criar a variável (3.6) → **Redeploy**. Os leads desse meio estão no `/admin`: fale com eles |
| `teto_diario` | o dia bateu o `LIMITE_ENVIOS_DIA` (a proteção da cota do Resend) | o lead está no `/admin` (o novo, gravado sem código; quem já tinha cadastro, com os dados de antes): fale com ele. Volta sozinho em 24 h. No plano pago do Resend, suba o limite → Redeploy |
| `email:daily_quota_exceeded` · `email:monthly_quota_exceeded` | acabou a cota do Resend (Free: 100 por dia, 3.000 por mês) | os leads estão no `/admin`. Espere virar o dia/mês ou mude de plano no Resend (e suba o `LIMITE_ENVIOS_DIA`) |
| `email:rate_limit_exceeded` | envios demais por segundo | passageiro. Se repetir, pode ser robô no formulário: ligue o Turnstile (3.5) |
| `email:validation_error` · `email:invalid_from_address` | domínio não verificado, ou `EMAIL_FROM` fora de `@mail.crmultra.com.br` | Resend → Domains: `mail.crmultra.com.br` está **Verified**? O `EMAIL_FROM` termina exatamente nele? Corrigiu a variável → Redeploy |
| `email:missing_api_key` · `email:invalid_api_key` · `email:invalid_api_Key` · `email:restricted_api_key` | chave errada, revogada ou sem permissão para esse domínio | criar uma chave nova "Sending access" para `mail.crmultra.com.br` (3.3) → trocar `RESEND_API_KEY` → Redeploy |
| `email:PrazoEsgotado` | o Resend não respondeu em 8 s | quase sempre passageiro. Se repetir, veja o status do Resend (resend-status.com) |
| `email:application_error` · `email:internal_server_error` | falha do lado do Resend, ou da rede até ele | idem: status do Resend. O lead está no `/admin` |
| `db:42P01` | uma tabela não existe: migração não rodada | rodar as migrações (3.4, passos 4 e 5; a 004 pelo 3.9, a 006 pelo 3.11) |
| `db:42703` | uma coluna não existe. Em `[/api/lead]` (todo cadastro falha) ou no funil do `/admin`: a 004 não rodou. Em `[verify] último acesso…` ou ao marcar a conferência do CRECI: a 005 não rodou (o login segue) | rodar a 004 (3.9) ou a 005 (3.10) |
| `db:28P01` · `db:28000` | usuário ou senha do banco errados (ou a senha foi trocada no Neon) | copiar de novo a string pooled (3.4) → `DATABASE_URL` → Redeploy |
| `db:3D000` | o banco do fim da string não existe | copiar de novo a string do Neon, sem editar o nome do banco |
| `db:53300` | acabaram as conexões | usar a string **pooled** (host com `-pooler`) → Redeploy |
| `db:53100` | banco cheio (Free: 0,5 GB) | Neon → armazenamento do projeto; mudar de plano |
| `db:57P01` · `db:57P03` · `db:08006` · `db:ConexaoEncerrada` | o banco reiniciou ou derrubou a conexão (o Neon suspende o banco parado e o acorda na próxima consulta) | uma vez só, nada a fazer: o app reconecta sozinho. Muitas seguidas: veja o status do Neon |
| `db:PrazoConexao` | o banco não respondeu em 10 s | status do Neon. Confira também se o host da `DATABASE_URL` é o do seu projeto |
| `db:XX000` | erro interno do Neon, por exemplo projeto suspenso ou cota de processamento do plano Free esgotada | Neon → painel do projeto: há aviso? Resolva lá (ou mude de plano) |
| `db:<outro código>` | o Postgres recusou por outro motivo | procure o código em postgresql.org/docs/current/errcodes-appendix.html |
| `rede:ENOTFOUND` · `rede:EAI_AGAIN` | o host do banco não existe (string errada ou cortada), ou o DNS falhou | copiar de novo a string pooled inteira → Redeploy |
| `rede:ECONNREFUSED` · `rede:ETIMEDOUT` · `rede:ECONNRESET` | o app não alcançou o banco | status do Neon. Se persistir, confira a string |
| `tls:<código>` | o certificado do banco não confere (ex.: host trocado por um IP, ou um servidor que não é o do Neon) | usar o host exatamente como o Neon mostra |
| `erro:<Nome>` | erro inesperado no código (bug) | anote a hora e a linha do log e abra uma tarefa |

> As rotas do painel (`[/api/admin/...]`) usam as mesmas causas da tabela. Só o bug muda de
> prefixo: aparece como `admin:<Nome>` (ex.: `admin:TypeError`). O que fazer é o mesmo.

### Sintoma → causa

| Sintoma | Causa provável | O que fazer |
|---------|----------------|-------------|
| **Deploy falha na Vercel** com `[env] Configuração de ambiente inválida` | variável conferida no build faltando ou inválida (a mensagem lista qual) | corrigir em Settings → Environment Variables (Production) → Redeploy |
| Deploy falha com `EMAIL_FROM: use "endereço" ou "Nome <endereço>"` | `EMAIL_FROM` fora dos dois formatos (ex.: só o nome, sem `<…>`) | corrigir para `CRM Ultra <acesso@mail.crmultra.com.br>` → Redeploy |
| Deploy falha dizendo que falta o TypeScript (`do not have the required package(s) installed`) | alguém criou `NODE_ENV` nas variáveis | apagar `NODE_ENV` → Redeploy |
| Deploy de **Preview** (branch ou PR) falha com `[env]` | esperado: as variáveis são só de Production (3.6) | nada. Ou configure um Preview com banco e variáveis próprios |
| Trocou uma variável e nada mudou | falta o Redeploy | 3.7 |
| Domínio não abre, ou "Invalid Configuration" na Vercel | DNS ainda propagando, ou servidores errados no registro.br | conferir `ns1.vercel-dns.com` e `ns2.vercel-dns.com` no registro.br e esperar |
| Site abre, mas **pedir acesso dá "algo falhou do nosso lado"** e o `/admin` não entra | log `config:DATABASE_URL`, `db:*` ou `rede:*` | tabela "Causa no log" acima |
| **Todo** corretor novo vê "Recebemos seus dados…" (e quem já tinha cadastro, "Não conseguimos enviar o código agora") | log `config:RESEND_API_KEY`, `config:EMAIL_FROM` ou `email:*` | tabela "Causa no log" acima |
| E-mail não chega e não há erro no log | caiu no spam, ou o endereço devolveu | Resend → Emails: veja o status do envio. Se "Delivered", peça para a pessoa olhar o spam |
| "Código expirado" | passou de 10 min | pedir novo código (botão reenviar) |
| "Tentativas esgotadas" | 5 erros no mesmo código | pedir novo código |
| "Muitas solicitações" (429) | 3 envios em 30 min pelo mesmo e-mail, ou 10 pela mesma rede (IP) | esperar a janela |
| Corretor vê "Recebemos seus dados. O e-mail com o código não saiu agora" | e-mail novo; log `[/api/lead] código não enviado; lead gravado sem código: <causa>` | o lead está no `/admin`: fale com ele. A causa diz o resto (tabela acima) |
| Corretor que já tinha cadastro vê "Não conseguimos enviar o código agora" (503 no `/api/lead` ou no `/api/lead/entrar`) | log `[/api/lead] código não enviado; e-mail já cadastrado, nada gravado: <causa>` ou `[/api/lead/entrar] código não enviado: <causa>` | nada foi gravado: o lead já está no `/admin`, com os dados de antes — fale com ele. A causa diz o resto (tabela acima) |
| Tela pede "verificação de segurança" / 403 no `/api/lead` | Turnstile recusou o token (robô, ou widget expirado); log `token emitido fora do domínio: <host>` = o widget rodou fora de `brand.dominio`/subdomínio/`.vercel.app` | a pessoa refaz a verificação; se for com todo mundo, confira se a site key é do mesmo widget da secret e se o site está sendo aberto pelo domínio |
| 503 no `/api/lead` + log `[turnstile]` | Cloudflare fora do ar, ou `TURNSTILE_SECRET_KEY` errada (log diz `config:TURNSTILE_SECRET_KEY`) | conferir a chave; se a Cloudflare estiver fora, tirar as duas chaves do Turnstile e fazer Redeploy desliga o desafio |
| Não chega o aviso de lead novo | `AVISO_LEADS_EMAIL` vazia, teto diário atingido ou envio recusado (log `[aviso-lead]` com a causa) | conferir a variável e a causa; os leads continuam no `/admin` |
| Login do admin em 429 | 5 tentativas em 5 min | esperar 5 min |
| Login do admin dá erro de servidor | log `[/api/admin/login]` com a causa; o mais comum é `db:42P01` (falta a migração 003) | tabela "Causa no log" acima |
| `/admin` volta para o login | sessão de 12h expirou | logar de novo |
| Painel do demo rebate para a landing | sem cookie de acesso válido (expira em 7 dias) | pedir acesso e verificar o e-mail |
| Painel de leads vazio em produção | `DATABASE_URL` aponta para outro banco ou branch, ou a migração não rodou | conferir a string (3.4) e o log |
| No `/admin`, mudar etapa, anotar ou cadastrar lead dá erro (a lista abre) | log `[/api/admin/leads...]` com `db:42703` ou `db:42P01`: a migração 004 não rodou | 3.9 |
| No `/admin`, marcar "Confere"/"Não confere" no CRECI dá erro | log `[/api/admin/leads] PATCH: db:42703`: a migração 005 não rodou | 3.10 |
| Corretor diz que o cadastro responde "Esse WhatsApp já tem cadastro" (ou "Esse CRECI…") | é a regra do cadastro único: outro lead já tem esse WhatsApp/CRECI. Se o lead antigo tem e-mail, a tela mostra a dica mascarada e oferece "Entrar com esse e-mail" | procure o WhatsApp/CRECI no `/admin`. Mesma pessoa com outro e-mail: ela entra pelo "Já tenho cadastro" com o e-mail antigo. Lead de teste: exclua |
| "Já tenho cadastro" diz que não achou o e-mail | não há lead com esse e-mail (a tela oferece o cadastro) | nada: é o fluxo. Erro 503 nessa tela = o e-mail não saiu (log `[/api/lead/entrar] código não enviado: <causa>`) |

**Rotacionar segredos.** Trocar `APP_SECRET` derruba **todos** os acessos ao demo e sessões de admin
(é o efeito desejado se vazar). Trocar `ADMIN_PASSWORD` só afeta logins novos — as sessões abertas
seguem válidas até 12h; para cortar na hora, troque também o `APP_SECRET`. **Nos dois casos, só vale
depois do Redeploy** (3.7).

**Se algum segredo vazar:** troque o que vazou, e na dúvida todos: `APP_SECRET`, `ADMIN_PASSWORD`,
a senha do banco (Neon → Roles → reset, e depois a nova `DATABASE_URL`) e a chave do Resend (apague
a antiga em API Keys e crie outra). Faça o Redeploy e confira a auditoria. Vazamento de dado pessoal
pode exigir comunicação à ANPD e aos titulares em prazo curto: fale com o advogado no mesmo dia.

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
| Vazamento em erro | **ok** — resposta genérica, log só com a causa (categoria sem PII, seção 6) |
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
| `src/features/lead/funil.ts` · `funilAdmin.ts` · `notas.ts` · `cadastroManual.ts` | o funil: etapas (e a tradução dos status antigos), próxima ação, anotações, cadastro manual |
| `src/lib/leadStorePorta.ts` · `leadStore.ts` | **porta** de persistência · adaptador de arquivo (dev) |
| `src/lib/leadStorePostgres.ts` · `leadStorePostgresLinha.ts` | adaptador de produção · linha do banco ⇄ lead |
| `src/features/lead/solicitarAcesso.ts` · `entrar.ts` · `envioCodigo.ts` | cadastro (com as regras de repetido) · "Já tenho cadastro" · portaria e envio comuns às duas portas |
| `src/lib/db.ts` | pool do Postgres, compartilhado por todos os stores (com ouvinte para conexão que cai) |
| `src/lib/ratelimit*.ts` | limite de uso (Postgres em prod, memória em dev) |
| `src/lib/auditoria.ts` | registro das ações do admin (banco em prod, arquivo em dev) |
| `src/lib/criarLeadStore.ts` | escolhe o adaptador por ambiente |
| `src/features/orcamento/tabela.ts` | **a tabela de preços** (faixas, pisos, mínimos, franquias, extras) — fonte única, em centavos |
| `src/features/orcamento/calculo.ts` · `porte.ts` | escada marginal, desconto com piso, anual e extras · mínimo faturável e implantação |
| `src/lib/orcamentoStorePorta.ts` · `orcamentoStore.ts` · `orcamentoStorePostgres.ts` | **porta** dos orçamentos · arquivo (dev) · Postgres (numeração atômica) |
| `src/lib/email.ts` | porta de e-mail + Resend + fallback de dev |
| `src/lib/erros.ts` | a causa segura do log (`config:`, `email:`, `db:`, `rede:`) — seção 6 |
| `src/lib/turnstile.ts` · `prazo.ts` | anti-robô da Cloudflare · prazo das chamadas a fornecedor |
| `src/lib/token.ts` / `adminAuth.ts` | HMAC do token de demo e da sessão de admin |
| `src/components/landing/` · `acesso/` | landing e fluxo de acesso |
| `src/app/admin/` | painel de leads |
| `migrations/` | as 7 migrações do Postgres (seção 3.4; a 004 também no 3.9, a 005 no 3.10, a 006 no 3.11, a 007 no 3.12) |
| `waves/` | o plano por ondas e o estado de cada uma |

Trocar de banco = escrever um adaptador novo com a mesma interface `LeadStore` e ensinar o
`criarLeadStore.ts` a escolhê-lo. O domínio não muda.
