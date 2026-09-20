# CRM Imobiliário Ultra — Plano de Ondas (00-INDEX)

> **Histórico:** os hashes de commit citados em `waves/` (O0–O6) são do repositório original,
> arquivado e privado. Este repositório começa num commit único com o estado limpo (2026-09-19).
>
> Memória-mestre do produto. A conversa não é memória — **este arquivo e os `ESTADO.md` são.**
> Atualizar ao fim de cada onda. Protocolo de execução: `waves/PROTOCOLO-EXECUCAO.md`.

---

## 1. O que é o CRM Imobiliário Ultra

SaaS de CRM para corretores e imobiliárias. **Motor de entrada no mercado (esta fase):** uma
landing pública onde um corretor (com CRECI) pede acesso a um **demo navegável** do produto. O
acesso é liberado após **verificação de e-mail por código** (Resend). Cada pedido vira um **lead**
que cai num **painel admin** para o fundador dar follow-up.

O demo é o protótipo original **rebatizado** para CRM Ultra — mesmas telas, marca trocada,
dados fictícios. Três entradas de demonstração: **Painel do Corretor**, **CEO com associados**,
**CEO com franquias**.

---

## 2. Escopo FECHADO desta fase

**Dentro (vamos construir):**
1. Rebranding do protótipo: marca antiga → CRM Ultra, **marca via config** (nunca cravada).
2. Landing de marketing com CTAs "Conhecer CRM" e "Acessar CRM".
3. Captura de lead (e-mail + telefone + CRECI) com **verificação por código via Resend**.
4. Gate de acesso ao demo + 3 entradas de demonstração.
5. Guia/instruções contextuais enquanto o visitante usa o demo.
6. Painel admin de leads (contagens, lista, follow-up, export).

**Fora (trilha futura "Plataforma" — NÃO nesta fase):**
- Backend real do CRM (Fastify/Prisma/Outbox, 13 módulos, multi-tenant) — os painéis seguem **MOCK**,
  exatamente como no protótipo original.
- Dados reais de clientes/imóveis. Aqui é tudo **seed fictício** (Lei da migração — LGPD).
- Pagamento/assinatura, integrações externas do CRM.

> Mudou o escopo? Atualiza-se este bloco **antes** de codar. "Aproveitar para arrumar" é proibido.

---

## 3. Decisões de arquitetura (ADR-lite Ultra)

| ID | Decisão | Porquê |
|----|---------|--------|
| **U1** | Next 14 App Router (mantém o do protótipo); backend leve via **Route Handlers** (sem Fastify nesta fase). | Menor caminho que cumpre o objetivo; protótipo já é Next. |
| **U2** | **Marca nunca cravada** → `src/config/brand.ts` + CSS vars `--brand-*` + `<BrandLogo/>` SVG; default neutro. | Invariante #1 da skill. É exatamente o que torna o rebrand sustentável. marca antiga em `src` = **0**. |
| **U3** | Leads atrás da porta **`LeadStore`** com adaptador `FileLeadStore` (JSON) hoje; adaptador de produção definido em **D1**. | Troca de persistência sem mexer no domínio (fronteira de fornecedor). |
| **U4** | E-mail atrás da porta **`ProvedorEmail`** → `ResendEmail` + fallback `ConsoleEmail` (sem chave → mostra/loga o código em dev). | Testável sem Resend; espelha `Provedor*` da skill. |
| **U5** | Verificação = código **6 dígitos**, expira (10 min), tentativas limitadas, **rate-limit por e-mail/IP**; emite **token de demo HMAC** em cookie httpOnly. | Anti-abuso/custo + acesso controlado. |
| **U6** | Admin = senha única via env (`ADMIN_PASSWORD`), sessão cookie httpOnly assinado, `authz` em todo `/api/admin/*`, anti brute-force. | Lista de leads é dado sensível. Secret só via env (fail-closed no boot). |
| **U7** | LGPD na superfície pública: Zod estrito, telefone E.164, **consentimento carimbado (ts+IP+texto)**, opt-out, **PII fora de logs**, auditoria das ações materiais do admin. | Segurança/LGPD desde a primeira linha. |

---

## 4. As ondas

| Onda | Nome | Entrega | Depende de |
|------|------|---------|------------|
| **O0** | Fundação & Marca | Projeto rodando + de-branding completo (marca via config, paleta Ultra, personas fictícias) | — |
| **O1** | Captação & Verificação | Backend: Lead + ProvedorEmail (Resend) + código + token de demo | O0 |
| **O2** | Landing & Gate | Landing de marketing + fluxo de captura + gate dos 3 painéis-demo | O1 |
| **O3** | Guia do Demo | Modo demonstração, boas-vindas e guia contextual | O2·S3 |
| **O4** | Admin de Leads | Login admin + dashboard (contagens, lista, follow-up, export) | O1·S1 |
| **O5** | Hardening & Lançamento | Testes mínimos, build/typecheck, deploy, domínio Resend, runbook | O0–O4 |
| **O6** | Limpeza do ex-cliente | Tirar do produto todo conteúdo, imagem e negócio do ex-cliente (pré-requisito do deploy) | O0–O5 código |
| **O7** | Prontidão de lançamento | Cadastro que não perde lead, anti-abuso, logs com causa, CRECI flexível, celular e painel de leads prático | O6 |
| **O8** | Funil de leads e conversão | Etapas + retomar depois + Hoje, anotações e próxima ação, cadastro manual, "Quero usar" no demo, origem da campanha | O7 |
| **O9** | Cadastro único e conferência do CRECI | Nome e UF no cadastro, WhatsApp/CRECI sem repetido, "Já tenho cadastro" (só e-mail + código), dados novos só depois do código, conferir CRECI no painel, "voltou ao demo" | O8 |
| **O10** | Avaliação no demo | Convite depois de 4 min no demo, estrelas e comentário com escolha de identificação, média ao vivo na landing, moderação no painel | O9 |
| **O11** | Orçamento no painel | Tabela oficial em código, escada por assento com piso travado, histórico ligado ao lead e proposta A4 pronta para virar PDF | O10 |

### Sub-entregas e "Pronto quando"

**O0 — Fundação & Marca**
- **S1 · Scaffold & env** — instalar deps + `resend`, subir `next dev`, `src/lib/env.ts` fail-closed, `.env.example`. *Pronto:* dev sobe, build limpo, env validado no boot.
- **S2 · Engine de branding** — `src/config/brand.ts`, `<BrandLogo/>`, CSS vars `--brand-*`, trocar os ~10 `<img logo>`, metadata via brand. *Pronto:* marca antiga em `src` = 0; logo em site/login/painéis.
- **S3 · Paleta Ultra + personas** — re-skin indigo, `icon.svg`, remover as pessoas reais do ex-cliente → personas fictícias. *Pronto:* nenhuma pessoa real; visual coeso; favicon novo.

**O1 — Captação & Verificação**
- **S1 · Lead + LeadStore + Zod** — tipos/Zod do Lead (email, telefone E.164, CRECI, status, consentimento, código, datas, origem) + `FileLeadStore`. *Pronto:* testes de store verdes; Zod valida/rejeita.
- **S2 · ProvedorEmail + envio de código** — `ResendEmail`+`ConsoleEmail`, template (marca via brand), rate-limit, `POST /api/lead` (upsert + consentimento + envia). *Pronto:* com chave envia / sem chave fallback; rate-limit barra; sem PII em log; lead persistido.
- **S3 · Verificação + token** — `POST /api/lead/verify` (confere hash/expiração/tentativas; marca verificado; emite token HMAC). *Pronto:* certo verifica e libera; errado/expirado/excedido falha com estado claro.

**O2 — Landing & Gate**
- **S1 · Landing de marketing (/)** — hero, seções "Conhecer CRM", prova social fictícia, CTAs. *Pronto:* responsiva, CTAs abrem o fluxo, zero marca antiga.
- **S2 · Fluxo de captura** — form (email/telefone/CRECI/consentimento) → código → verificação; estados vazio/erro/carregando/reenviar. *Pronto:* fluxo ponta a ponta (com fallback dev); erros claros.
- **S3 · Gate + 3 entradas** — escolha pós-verificação + entradas no `/login`; `AuthGate` exige token. *Pronto:* sem token não acessa painel; com token, 3 entradas abrem Corretor/CEO-associados/CEO-franquias.

**O3 — Guia do Demo**
- **S1 · Modo demonstração + boas-vindas** — banner + modal por painel, dismissal em localStorage.
- **S2 · Guia contextual** — drawer "Guia" com dicas por seção + ajuda flutuante.

**O4 — Admin de Leads**
- **S1 · Auth admin** — `POST /api/admin/login` (senha env, cookie assinado), `authz` em `/api/admin/*`, anti brute-force, logout.
- **S2 · Dashboard** — `/admin` contagens + tabela + marcar contatado/descartado (auditado) + export CSV.

**O5 — Hardening & Lançamento**
- **S1 · Testes & revisão** — testes mínimos (happy, inválido, rate-limit, código expirado/excedido, admin 401 sem cookie, sem PII), build/typecheck limpos, revisão de PR.
- **S2 · Deploy & runbook** — resolver D1, env de produção, domínio Resend (DNS), build, README/runbook, apresentar.

**O6 — Limpeza do ex-cliente** (`waves/06-limpeza-ex-cliente.md`)
- **S1 · Imagens** — fotos Unsplash no lugar das do ex-cliente. **S2 · Portal** — só vitrine/busca/favoritos/comparar em `/demo/*`, noindex, identidade fictícia. **S3 · Painéis CEO/franqueado** — rede fictícia, preços/produtos/empresas genéricos. **S4 · Corretor + /login**. **S5 · Guardas + docs**. **S6 · Repo novo e limpo**.

---

## 5. Decisões em aberto (precisam de você)

- **D1 — ✅ DECIDIDO (2026-06-17): Vercel + Postgres (Neon/Supabase via Prisma).** Em dev e nas O1–O4 usa-se `FileLeadStore` (JSON) atrás da porta `LeadStore`; como Vercel é serverless e `FileLeadStore` não sobrevive lá, o adaptador `PostgresLeadStore` (Prisma) entra na **O5**. O domínio não muda — só o adaptador.
- **D2 — Domínio de e-mail:** o Resend só envia para terceiros com **domínio verificado** (ex.: `crmultra.com.br` com registros DNS). Sem domínio, em teste só envia para o e-mail da sua conta Resend.
- **D3 — Marca definitiva:** "CRM Imobiliário Ultra" + wordmark provisório. Conferir **marca registrada (INPI)** antes de material impresso/anúncios.

---

## 6. Riscos & invariantes herdados

- **IP do ex-cliente:** a O0 trocou nomes, logo e cores, mas **não** removeu imagens, textos, preços e o produto de garantia do protótipo — o estudo de 2026-09-18 achou tudo isso. A **O6** remove; até ela fechar, a afirmação "nenhum conteúdo proprietário permanece" **não vale**. (Não é aconselhamento jurídico.)
- **`node_modules` travado pelo host** (resíduo de cópia interrompida): resolver na O0·S1 (renomear pasta ou aguardar o Windows liberar os arquivos).
- **Custo/spam do Resend:** rate-limit no envio (O1·S2) é requisito, não enfeite.
- **Bloqueadores de PR sempre valem** (ver PROTOCOLO): secret hardcoded, marca cravada, PII em log, arquivo >300 linhas, sem testes mínimos, perda silenciosa.

---

## 7. Estado geral

| Onda | Status |
|------|--------|
| O0 | ✅ concluída (build 59 rotas + typecheck + 4 testes verdes; marca CRM Ultra indigo confirmada em runtime; commit genesis) |
| O1 | ✅ concluída (S1 `1f0d06f` · S2 `186b106` · S3 `3ca2056`; `POST /api/lead` + `POST /api/lead/verify`, código hash+expiração+tentativas, token de demo HMAC em cookie httpOnly; 39 testes + build + typecheck verdes; aceite conferido, só o critério 2 "Resend envia" pendente da D2 → O5) |
| O2 | ✅ concluída (S1 `1097f5d` · S2 `e530a48` · S3 `e282267`; `/` virou a landing e o portal foi para `/demo/portal`; fluxo dados→código→liberado consumindo a O1; gate + 3 entradas no fim do fluxo e no `/login`; 56 testes + build + typecheck verdes). **Ressalvas:** gate é client-side (UX, não segurança — vale enquanto os painéis forem mock) e os critérios 3/4 do aceite pedem uma passada manual no navegador. |
| O3 | ✅ concluída (S1 `5b3c068` · S2 `efe4da2`; banner de modo demonstração, boas-vindas 1x por painel e guia contextual com 13 seções por rota, tudo alimentado por `src/content/guia.ts` e desligável por `brand.demoMode`; 108 testes + build + typecheck verdes). **Ressalva:** a aparência na tela não foi verificada (sem browser driver). |
| O4 | ✅ concluída (S1 `576aee7` · S2 `ef5bc78`; login por senha com rate-limit e sessão de 12h, `exigirAdmin` em todas as rotas, painel com contagens/lista/follow-up auditado/CSV; **guard de servidor**, ao contrário do gate do demo; 75 testes + build + typecheck verdes). **Ressalva:** `FileLeadStore` e `auditoria.log` são locais — em produção dependem do Postgres da O5. |
| O5 | 🟦 em andamento — **S1 ✅** `f15ea84` (90 testes, **1 bloqueador corrigido**: fallback de e-mail valia em produção e devolvia o código na resposta) · **S2 código ✅** `c753e54` (adaptador Postgres + exclusão LGPD + README/RUNBOOK; **README ainda era do cliente antigo, com e-mail real de pessoa** — corrigido). **Falta publicar**: banco, domínio no Resend e deploy dependem das contas do fundador (checklist no ESTADO da O5 e seção 3 do RUNBOOK). |
| O6 | ✅ concluída (2026-09-19) — S1 fotos Unsplash · S2 site de exemplo em /demo (noindex, rede fictícia) · S3/S4 painéis sem preços, produto, pessoas e empresas do ex-cliente · S5 docs anonimizados + guarda por hash · S6 repositório novo, nascido de um commit único. Ver `06-limpeza-ex-cliente/ESTADO.md`. |
| O7 | ✅ código concluído (2026-09-19) — lead nunca se perde (falha/cota/timeout do e-mail), anti-abuso (limites, isca, Turnstile opcional), aviso de lead novo, log com causa, RUNBOOK do setup real, CRECI flexível, remetente nomeado, celular (menus, tour, Guia) e painel de leads prático (WhatsApp, busca, filtro, CSV pt-BR). 400 testes + crawl desktop/celular. Ver `07-prontidao-lancamento/ESTADO.md`. **Falta publicar (O5):** Neon, Resend, Vercel e smoke — nas contas do fundador, RUNBOOK §3. |
| O8 | ✅ código concluído (2026-09-19) — funil com 7 etapas em abas (Hoje, Novos, Em contato, Demonstração, Negociação, Clientes, Retomar depois, Perdidos, Todos), retomar com data e motivo, perdido com motivo, próxima ação e anotações na ficha do lead, cadastro manual com dedupe, "Quero usar" no demo e origem da campanha (UTM/ref) no pedido de acesso. 576 testes + crawl desktop/celular. Ver `08-funil-leads/ESTADO.md`. **Publicar:** deploy primeiro, `migrations/004-funil.sql` no Neon logo em seguida (RUNBOOK 3.9). |

| O9 | ✅ código concluído (2026-09-19) — cadastro com nome completo e Estado do CRECI, WhatsApp e CRECI sem repetido (WhatsApp com dica do e-mail mascarado), e-mail existente não regrava nada (dados novos só depois do código), "Já tenho cadastro" (só e-mail + código; acesso vencido abre nele), conferência do CRECI na busca oficial de cada conselho, selos de repetido e "voltou ao demo". 793 testes + smoke 19/19 + crawl desktop/celular. Ver `09-cadastro-unico/ESTADO.md`. **Publicar:** `migrations/005-cadastro-unico.sql` no Neon ANTES do deploy (RUNBOOK 3.10). |
| O10 | ✅ código concluído (2026-09-20) — convite para avaliar depois do tempo navegado no demo, estrelas e comentário com escolha de identificação (nome+CRECI, nome, anônimo), publicação direta com filtro automático de link/contato/palavrão, média e contagem ao vivo na landing, seção Avaliações no painel (publicar/tirar do site) e aviso por e-mail sem PII. 1012 testes + smoke 17/17 + navegador desktop/celular. Ver `10-avaliacoes/ESTADO.md`. **Publicar:** `migrations/006-avaliacoes.sql` no Neon ANTES do deploy (RUNBOOK 3.11). |
| O11 | ✅ código concluído (2026-09-20) — tabela oficial em código (escada por assento, pisos travados, anual só no assento), orçamento ligado ao lead com histórico e situações, formulário com cálculo ao vivo e piso à vista, documento A4 pronto para virar PDF (anexo datado, franquias, LGPD) e telas do demo sem espelhar a tabela real. 1233 testes + smoke 15/15 + PDF A4 conferido. Ver `11-orcamentos/ESTADO.md`. **Publicar:** `migrations/007-orcamentos.sql` no Neon ANTES do deploy (RUNBOOK 3.12). |
_Legenda: ⬜ pendente · 🟦 em andamento · ✅ concluída._

### Rodada de hardening (fora do plano de ondas, 2026-08-12)

Depois das ondas, uma passada de revisão fechou as pendências que estavam registradas como
conscientes. O que mudou:

| # | O quê | Commit |
|---|-------|--------|
| 1 | **Contato cravado** saiu de 6 telas → tudo em `brand.*` (razão social e CRECI viraram opcionais) | `e14638c` |
| 2 | **Política de Privacidade** (`/privacidade`) criada e linkada do consentimento e dos rodapés | `e14638c` |
| 3 | **Auditoria** persistida em produção (tabela `auditoria`; antes morria com a lambda) | `7591388` |
| 4 | 🚨 **Imagens com a marca antiga e o rosto/nome de 2 pessoas reais** removidas e recompostas em SVG | `b12f47d` |
| 5 | **Rate-limit compartilhado** (Postgres, transacional) — em memória contava por lambda | `309c326` |
| 6 | **Next 14.2.15 → 15.5.23**: 21 advisories, nenhum com correção na linha 14. React 18 mantido | `b66145b` |
| 7 | **Gate do demo no servidor** (`exigirDemo`): painéis não renderizam sem cookie assinado | `edab938` |
| 8 | Rebote do painel passa a **explicar o motivo** (cookie de 7 dias vs espelho eterno) | `27f9ec0` |

**Suíte:** 130 testes (eram 39 ao fim da O1). **Pendências abertas:** só as duas que dependem do
fundador — preencher `brand.empresa`/`brand.contato` e a revisão jurídica da política.

> **U1 desatualizado:** o projeto roda em **Next 15.5** desde a rodada de hardening (o ADR foi
> escrito na época do Next 14). A decisão de fundo — App Router + Route Handlers — continua valendo.
