# O4 · ESTADO — Admin de Leads

## Status das subs
| Sub | Status | Commit | Notas |
|-----|--------|--------|-------|
| S1 — Auth admin | ✅ feita | 576aee7 | `adminAuth.ts` + login/logout + tela; 10 testes (inclui `exigirAdmin`) + smoke de runtime |
| S2 — Dashboard de leads | ✅ feita | ef5bc78 | `admin.ts` + `auditoria.ts` + 2 rotas + painel; 9 testes; smoke completo |

**Onda O4 concluída** — aceite conferido no fim deste arquivo.

## Decisões tomadas
- **(S1) Cookie do admin:** `crm_admin`, HMAC com `APP_SECRET`, **12h**, httpOnly + SameSite=Lax + Secure em produção, `Path=/`. O payload carrega **só** `{ adm: true, exp }` — a senha nunca entra no cookie (teste dedicado abre o payload e confere).
- **(S1) Falha sempre genérica:** senha errada e body inválido devolvem o **mesmo** `401 credenciais_invalidas`. Qualquer diferença de mensagem ou de status ajuda quem está sondando.
- **(S1) Ordem no login:** Zod → rate-limit por IP → comparação da senha. O caminho do body inválido devolve 401 **antes** de consumir o limite (não testa senha nenhuma; poupar o balde evita que um flood de lixo bloqueie o admin de verdade).
- **(S1) `REGRA_LOGIN_ADMIN` = 5 tentativas / 5 min por IP.** O plano sugeria "5/min, depois atraso" — atraso artificial em serverless custa tempo de execução e atrapalha pouco quem ataca distribuído; a janela maior protege mais.
- **(S1) `exigirAdmin(req)` devolve `null` (autorizado) ou a resposta 401 pronta**, em vez de lançar: no handler vira `const barrado = exigirAdmin(req); if (barrado) return barrado;`. Lê o `APP_SECRET` internamente (env validado no boot); as funções puras recebem o secret injetado, para teste.
- **(S1) Logout não exige sessão válida:** apagar o próprio cookie não expõe nada, e exigir authz criaria um jeito de ficar preso numa sessão quebrada.
- **(S1) `token.ts` generalizado** (`assinarPayload`/`verificarPayload`): a sessão do admin e o token do demo passam a usar a mesma base HMAC, em vez de duplicar cripto. API pública do demo inalterada (os 6 testes da O1 seguem verdes). **Efeito colateral bom:** `verificarTokenDemo` agora exige e-mail no payload, então token de demo não vira sessão de admin nem o contrário — testado nos dois sentidos.
- **(S1) `ipDaRequisicao` extraído para `lib/req.ts`** — era a pendência registrada na O1·S3 ("extrair quando aparecer o 3º consumidor"). As duas rotas da O1 passaram a importar de lá.
- **(S1) A tela de login não navega para `/admin`** (que só existe na S2): confirma a sessão na própria tela, para não mandar o usuário a um 404. **(S2) trocado por `router.push("/admin")`.**
- **(S2) "Verificados" conta quem tem `verificadoEm`, não quem está no status `verificado`.** O status segue avançando para `contatado`; se a contagem olhasse o status, a conversão cairia justamente quando o follow-up acontecesse.
- **(S2) O guard do `/admin` é no SERVIDOR** (`cookies()` + `sessaoAdminValida` antes de renderizar, com `dynamic = "force-dynamic"` e `robots: noindex`). Diferente do gate do demo (client-side): aqui há PII de verdade atrás.
- **(S2) Auditoria append-only** (`data/auditoria.log`, uma linha JSON por evento) com **id, de/para e quantidade — nunca e-mail/telefone/CRECI**. O log de auditoria não pode virar uma segunda cópia da base de contatos. Falha de escrita **avisa e segue**: abortar um follow-up já persistido por causa do log seria pior.
- **(S2) CSV protegido contra injeção de fórmula:** célula que começa com `= + - @` recebe apóstrofo. São dados que o visitante digitou e Excel/Sheets executam fórmula ao abrir. Efeito colateral bom: o telefone E.164 (`+55…`) também fica protegido e o `+` para de ser comido pela planilha.
- **(S2) `atualizarStatus` só aceita `contatado`/`descartado`** (`STATUS_DO_ADMIN`): `novo` e `verificado` são conquistados pelo fluxo, não atribuídos à mão.
- **(S2) O `LeadStore` não busca por id** (a porta é por e-mail) — `atualizarStatus` lista e encontra. Aceitável no volume desta fase; com Postgres (O5) vira índice.

## Contratos definidos
- `adminAuth.ts`: `verificarSenha(informada, esperada)` · `criarSessaoAdmin(secret, agora?)` · `sessaoAdminValida(token, secret, agora?)` · `exigirAdmin(req) → NextResponse | null` · `respostaNaoAutorizado()` · `opcoesCookieAdmin(maxAgeSegundos)` · `COOKIE_ADMIN` · `VALIDADE_SESSAO_H = 12` · `REGRA_LOGIN_ADMIN`.
- `token.ts`: `assinarPayload(dados, secret, validadeSegundos, agora?)` · `verificarPayload(token, secret, agora?)` — base comum; os helpers do demo continuam existindo.
- `lib/req.ts`: `ipDaRequisicao(req)`.
- `POST /api/admin/login` → 200 `{ok:true}` + cookie · 401 `{ok:false,erro:"credenciais_invalidas"}` · 429 `{erro:"limitado"}`.
- `POST /api/admin/logout` → 200 `{ok:true}` + cookie zerado.

## Pendências fora de escopo
- ⚠️ **Rate-limit em memória não é compartilhado em serverless** (mesma limitação da O1): o atacante distribui as tentativas entre lambdas e o limite multiplica pelo nº de instâncias. Trocar por store compartilhado (Upstash/Postgres) na **O5**.
- ✅ **(resolvido na S2)** `exigirAdmin` agora protege `GET`/`PATCH /api/admin/leads` e `GET /api/admin/export` — os três provados com 401 sem cookie e com cookie forjado.
- ⚠️ **(S2) `FileLeadStore` não sobrevive à Vercel** (D1 = serverless): o painel abriria vazio em produção. Depende do `PostgresLeadStore` da **O5** — o painel não muda, só o adaptador.
- ⚠️ **(S2) `data/auditoria.log` é local e efêmero** pelo mesmo motivo. Em produção, a auditoria precisa ir para o banco junto com os leads (O5).
- ℹ️ **(S2) Sem paginação, busca ou filtro na lista** — carrega tudo de uma vez. Serve para dezenas/centenas de leads; se passar disso, paginar.
- ℹ️ **(S2) Sem teste de renderização do painel** (mesma limitação da O2: sem jsdom/browser driver). Coberto por teste de domínio + smoke de runtime nas rotas.
- ℹ️ **Sem "lembrar de mim" nem renovação de sessão:** passadas 12h, o admin loga de novo. Simples de propósito.
- ℹ️ **Sem CSRF token no login/logout.** SameSite=Lax cobre o caso realista (POST cross-site não leva o cookie); um logout forjado só causaria incômodo. Revisar se a área do admin crescer.

## Riscos
- A lista é dado sensível (PII de contatos). authz em TODA rota é bloqueador. Sem PII em log.
  → **(S1)** o portão está pronto e testado; a **S2** precisa chamá-lo em **todas** as rotas novas.
- Brute-force na senha → rate-limit + atraso. Senha forte via env (não commitar).
  → **(S1) resolvido** com 5/5min por IP + comparação em tempo constante + 401 genérico.

## Aceite da onda (conferido na S2, commit ef5bc78)
| # | Critério | Como foi provado |
|---|----------|------------------|
| 1 | `/admin` exige login; sem cookie válido → 401/redirect; logout funciona | runtime: `/admin` → **307** para `/admin/login` (guard de servidor); logout zera o cookie |
| 2 | `/api/admin/*` sempre atrás de `authz`; brute-force barrado | runtime: **401** em GET/PATCH `/leads` e GET `/export`, sem cookie **e** com cookie forjado; **429** na 6ª tentativa de login do mesmo IP; 10 testes de `adminAuth` |
| 3 | Contagens e lista (e-mail/telefone/CRECI/data/origem/status) | runtime com 2 leads reais criados pelo fluxo: `{total:2, verificados:1, conversaoPct:50}`; lista ordenada do mais recente |
| 4 | Follow-up persiste e é auditado; export CSV | `PATCH` → 200 (400 status inválido, 404 id inexistente) + `lead.status` no log; CSV com `Content-Disposition`, `no-store`, BOM e `lead.export` auditado |
| 5 | PII só para o admin; nada em log | **zero** ocorrências de e-mail/telefone/CRECI no log de auditoria e no log do servidor |

> Não coberto por teste automatizado: a **renderização do painel** (sem jsdom/browser driver no projeto).
> A lógica por trás dela está em teste de domínio e as rotas, no smoke.
