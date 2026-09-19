# O9 · PLANO — Cadastro único, "Já tenho cadastro" e conferência do CRECI

## Decisões do fundador (2026-09-19)
| # | Decisão |
|---|---------|
| F1 | WhatsApp repetido (com outro e-mail) é **barrado**, com a dica do e-mail mascarado (`m•••••a@provedor.com.br`). |
| F2 | CRECI repetido é **barrado sempre** (inclusive CRECI-J). |
| F3 | **Nome completo obrigatório** no cadastro. |
| F4 | "Já tenho cadastro": e-mail que não existe → **avisar e oferecer o cadastro**. |
| F5 | CRECI **não** é validado automaticamente (sem API oficial; a busca dos conselhos tem captcha e não vamos contorná-lo). O fundador confere no painel. |

## Decisões técnicas do orquestrador
- **CRECI repetido sem dica**: o CRECI é público — mostrar o e-mail mascarado a quem digitar o
  CRECI de outro corretor exporia o e-mail dele. Mensagem: "Esse CRECI já tem cadastro. Entre com o
  e-mail que você usou ou fale com a gente."
- **UF obrigatória no CRECI do cadastro público** (cada conselho numera à parte: `PE 12345` e
  `SP 12345` são pessoas diferentes). O formulário tem **Estado** (lista, pré-escolhido pelo DDD do
  WhatsApp enquanto o usuário não mexer) + **Número**; a API continua recebendo um campo `creci`
  (`"PE 12345-F"`), normalizado por `normalizarCreci` e recusado se vier sem UF.
- **Chave de comparação do CRECI**: UF + número + categoria, com categoria ausente = `F`
  (`"PE 12345"` ≡ `"PE 12345-F"`; `"PE 12345-J"` é outro). Legado sem UF só casa com legado sem UF.
- **Nome**: 2 a 120 caracteres, pelo menos duas palavras ("nome e sobrenome"), só letras (com
  acento), espaço, hífen, apóstrofo e ponto.
- **E-mail que já existe no formulário completo**: NÃO regrava mais nada no pedido (hoje regrava
  telefone/CRECI antes de provar o e-mail — corrigido). Vira "entrar": manda o código e responde
  `existente: true`. Os dados novos digitados (nome, WhatsApp, CRECI) viajam no `verify` como
  `atualizacao` e só são aplicados **depois do código certo**, campo a campo, pulando o que colidir
  com outro lead (`naoAtualizados`).
- **Unicidade no app** (não índice UNIQUE: o banco de produção já tem repetidos de teste).
  Checagem **depois** do rate-limit (cada consulta gasta vaga → não vira ferramenta de varredura).
  Índices simples em `telefone` e `creci` para a busca.
- **Último acesso ao demo** (`ultimo_acesso_em`) carimbado a cada verificação com sucesso, em
  UPDATE separado e à prova de falha (se a coluna não existir, loga `db:42703` e o login segue).
- **Conferência do CRECI** no painel: `creci_conferencia` (`conferido` | `nao_confere` | vazio) +
  `creci_conferido_em`; link para a busca oficial do conselho da UF (mapa em `src/config/creciConsulta.ts`).
- **Ordem de publicação**: a `005` só ACRESCENTA colunas/índices → **roda ANTES do deploy** (o
  código da O8 ignora colunas a mais; o código da O9 grava nelas).

## Base pronta (orquestrador, antes das trilhas — não refazer)
- `creci.ts`: `LISTA_UFS`, `Uf`, `MENSAGEM_CRECI_SEM_UF`, `ufDoCreci`, `chaveCreci`, `formasEquivalentesCreci`.
- `ddd.ts` (novo, client-safe): `ufPorDdd`, `ufPorTelefone`.
- `schema.ts`: `creciComUfSchema`, `nomeSchema` + `MENSAGEM_NOME`, `AtualizacaoCadastroSchema`,
  `VerifyInputSchema.atualizacao?`, `EntrarSchema`. **Ainda não ligados** ao `LeadInputSchema` /
  `PedidoAcessoSchema` (a trilha A liga: `nome: nomeSchema`, `creci: creciComUfSchema`).
- Testes em `cadastroUnico.test.ts`.

## Contrato da API (as duas trilhas seguem isto à risca)
**`POST /api/lead`** — body `{ nome, email, telefone, creci, consentimento: true, origem?, website?, turnstileToken? }`
- `200 { ok: true, status: "enviado", existente: boolean, codigoDev? }`
- `202 { ok: true, status: "recebido_sem_codigo" }` — **só para e-mail NOVO** (o lead foi gravado sem código)
- `503 { ok: false, erro: "envio_indisponivel" }` — e-mail que JÁ existe e o código não saiu (provedor fora, falha/prazo ou teto): nada foi gravado, então não dá para dizer "recebemos seus dados" *(emenda de 2026-09-19, achado da revisão da trilha B)*
- `409 { ok: false, erro: "telefone_em_uso", dica: string | null }` — `dica` = e-mail mascarado do lead dono do WhatsApp (`null` se ele não tem e-mail)
- `409 { ok: false, erro: "creci_em_uso" }`
- `400 { ok: false, erro: "dados inválidos", campos: { nome?, email?, telefone?, creci?, ... } }`
- `403 / 503 / 429 / 500` como hoje (robô → `200` falso, sem `existente`).

**`POST /api/lead/entrar`** (novo) — body `{ email, website?, turnstileToken? }`
- `200 { ok: true, status: "enviado", codigoDev? }`
- `404 { ok: false, erro: "sem_cadastro" }`
- `503 { ok: false, erro: "envio_indisponivel" }` — provedor fora, falha/prazo do envio ou teto diário
- `400 / 403 / 429 / 500` como no `/api/lead`. Mesmas chaves de rate-limit do `/api/lead`
  (`email:<e-mail>` 3/30 min e `ip:<ip>` 10/30 min) e mesmo teto diário.

**`POST /api/lead/verify`** — body `{ email, codigo, atualizacao?: { nome, telefone, creci } }`
- `200 { ok: true, ..., naoAtualizados?: ("telefone" | "creci")[] }` + cookie (como hoje)
- demais respostas como hoje. `atualizacao` passa pelo mesmo Zod do cadastro.

**Admin**
- `PATCH /api/admin/leads` ganha `{ id, creciConferencia: "conferido" | "nao_confere" | null }` → `200 { ok, lead }`; auditoria `lead.creci { id, resultado }`.
- `LeadAdmin` (DTO) ganha `creciConferencia?`, `creciConferidoEm?`, `ultimoAcessoEm?`.
- `POST /api/admin/leads` (manual): `409 { erro: "lead_existente", id, campo: "email" | "telefone" | "creci" }`.
- CSV ganha `creci_conferencia;ultimo_acesso_em`.

## Trilhas
| Trilha | Subs | Pode tocar |
|--------|------|------------|
| A — Regras e painel | S1 → S3 | `migrations/005-*.sql`, `src/features/lead/**`, `src/lib/{leadStore,leadStorePostgres,criarLeadStore}*.ts` (+ testes; pode criar arquivos novos em `src/lib/` para dividir), `src/app/api/**`, `src/app/admin/**`, `src/config/creciConsulta.ts` (novo), `src/lib/adminRotas.test.ts`, `README.md`, `waves/RUNBOOK.md` |
| B — Telas de acesso | S2 | `src/components/acesso/**`, `src/app/page.tsx`, `src/app/login/page.tsx`, `src/app/privacidade/page.tsx` |

## Não fazer
- Consulta automática ao CRECI (scraping, quebra de captcha, serviço de terceiros).
- Código por SMS/WhatsApp; login com senha; índice UNIQUE em telefone/CRECI.
- Mexer nos painéis do demo, no funil (etapas) ou no visual do admin além do descrito.
