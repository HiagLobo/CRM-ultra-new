# O1 · ESTADO — Captação & Verificação

## Status das subs
| Sub | Status | Commit | Notas |
|-----|--------|--------|-------|
| S1 — Lead + LeadStore + Zod | ✅ feita | 1f0d06f | domínio puro + FileLeadStore + 11 testes; revisão seg/LGPD aprovada |
| S2 — ProvedorEmail + envio | ✅ feita | 186b106 | email.ts/ratelimit.ts/solicitarAcesso + POST /api/lead; 12 testes + smoke runtime; revisão dupla (qa REPROVOU 3 bloqueadores → corrigidos) |
| S3 — Verificação + token | ✅ feita | 3ca2056 | verificacao.ts/token.ts + POST /api/lead/verify; 16 testes + smoke runtime; timingSafeEqual em código e token |

**Onda O1 concluída** — critérios de aceite do arquivo-mãe conferidos (ver abaixo).

## Decisões tomadas
- **Código de verificação:** 6 dígitos (CSPRNG `randomInt`), expira **10 min** (`EXPIRACAO_CODIGO_MIN`), máx **5 tentativas** (`MAX_TENTATIVAS`). Guardado **só como HMAC-SHA256** com `APP_SECRET` (`hashCodigo`), nunca em claro. Rate-limit de envio (proposta: 3/30min por e-mail+IP) fica para a **S2**.
- **Tipos da captação no slice, não em `src/types/index.ts`:** já existe lá um `interface Lead` (mock do funil do protótipo) — colisão de nome. Para não colidir nem refatorar o mock, `Lead`/`StatusLead`/`Consentimento`/`CodigoVerificacao` ficam em `src/features/lead/lead.ts`. `src/types/index.ts` **não foi tocado**. (Premissa da S1 ajustada.)
- **`.gitignore`** já continha `/data` (não precisou editar).
- **Relógio injetável** (`ctx.agora`) no domínio para testar expiração sem `sleep`.
- **(S2) Rate-limit:** 3 envios / 30 min, por **e-mail E IP** (`REGRA_ENVIO_CODIGO`). `permitir([chaves], regra)` é **multi-chave atômico** — checa todas e só registra se todas passam (barrar por uma não consome a outra).
- **(S2) Ordem enviar-antes-de-persistir:** `solicitarAcesso` faz `prepararSolicitacao` (monta em memória) → `enviarCodigo` → `persistir`. Envio que falha não sobrescreve código válido nem cria lead órfão.
- **(S3) Código de uso único:** no sucesso o `hash` é zerado (string vazia — nunca casa com um HMAC de 64 hex). Anti-replay. **Idempotência é de estado**, não de resposta: reverificar não duplica lead, não rebaixa status e **preserva o `verificadoEm` original**; mas o mesmo código não vale duas vezes (se a resposta se perder no caminho, o usuário pede um código novo).
- **(S3) Não revelar quem é lead:** e-mail desconhecido responde exatamente como código errado (`codigo_invalido`), sem tocar o store.
- **(S3) Ordem das guardas** em `verificarCodigo`: rate-limit → lead existe → `tentativas >= MAX` → código ativo → expiração → comparação. Expirar **não** gasta tentativa; errar gasta e, ao estourar, invalida o código.
- **(S3) Rate-limit do verify: 20/10min por IP apenas** (`REGRA_VERIFICACAO`). Sem chave por e-mail de propósito: a conta já está protegida por `MAX_TENTATIVAS`, e limitar por e-mail permitiria a um terceiro travar a retentativa do dono.
- **(S3) Fail-closed no relógio:** `expiraEm` corrompido no store conta como **expirado**, nunca como eterno.
- **(S3) Secret injetado também no token:** `assinarTokenDemo(entrada, secret, agora?)` — `token.ts` não lê `env` (mesma regra do `hashCodigo`); a rota injeta `env.APP_SECRET`.
- **(S3) `MotivoFalha` → HTTP:** `codigo_invalido` 400 · `expirado` 410 · `tentativas_excedidas` 429 · `limitado` 429. A resposta traz `erro` (slug, para a UI da O2 ramificar) + `mensagem` (texto ao usuário) — a S2 devolve só texto humano em `erro`; a O2 lida com as duas formas.
- **(S3) `emailSchema` extraído** em `schema.ts` e reusado por `LeadInputSchema`/`VerifyInputSchema` (regra de e-mail em um lugar só).
- **(S3) Ajuste de escopo:** `schema.ts` não estava no "Pode tocar" da S3, mas o `00-PLANO.md` da onda define `VerifyInput` nele — seguido o arquivo-mãe, com aval do fundador.
- **(S2) `env.ts`:** campos opcionais (`RESEND_API_KEY`/`EMAIL_FROM`) tratam **string vazia** do `.env` como `undefined` (senão `.min(1)`/`.email()` barravam o build da rota). `APP_SECRET`/`ADMIN_PASSWORD` seguem fail-closed.

## Contratos definidos
- `LeadStore` (porta, `src/lib/leadStore.ts`): `criar`, `buscarPorEmail`, `atualizar`, `listar`. Adaptador `FileLeadStore(arquivo?)` — path injetável p/ testes.
- `criarOuAtualizarLead(store, input, { ip, secret, agora? }) → { lead, codigo, novo }` — `codigo` em claro só para envio (S2), nunca persistido/logado.
- `prepararSolicitacao(store, input, ctx) → { lead, codigo, novo, persistir() }` — monta sem persistir; `persistir()` cai para atualizar se houver corrida de criação.
- `ProvedorEmail` (`src/lib/email.ts`): `enviarCodigo(para, codigo, brand)`; impls `ResendEmail` + `ConsoleEmail` (fallback dev); `criarProvedorEmail()` seleciona por `emailModoDev`; `mascararEmail` p/ log.
- `RateLimiter` (`src/lib/ratelimit.ts`): `permitir(chaves[], regra, agora?)`; impl `MemoriaRateLimiter`.
- `solicitarAcesso(deps, input, {ip}) → {status:'enviado'|'limitado', ...}` — caso de uso da rota `POST /api/lead`.
- `verificarCodigo(deps, input, {ip}) → {status:'verificado'|'falha'|'limitado'}` (`src/features/lead/verificacao.ts`) — `deps: {store, limiter, secret, agora?}`; sucesso devolve `{email, jaVerificado}`. `consumirTentativa(store, lead, agora)` exportado. `REGRA_VERIFICACAO = {max:20, janelaMs:10min}`.
- `VerifyInputSchema` (`schema.ts`): `{ email, codigo: /^\d{6}$/ }`.
- Token demo (`src/lib/token.ts`): `assinarTokenDemo({email}, secret, agora?)` → `base64url(payload).base64url(HMAC-SHA256)`; `verificarTokenDemo(token, secret, agora?) → PayloadTokenDemo | null` (assinatura em `timingSafeEqual` + `exp`). Payload `{ email, exp }` (epoch s). `COOKIE_TOKEN_DEMO = "crm_demo"`, `VALIDADE_TOKEN_DIAS = 7`. **É este o contrato que a O2·S3 consome no `AuthGate`.**
- `POST /api/lead/verify` — 200 `{ok:true}` + cookie `crm_demo` (httpOnly, SameSite=lax, Secure em prod, Path=/, Max-Age 7d).

## Pendências fora de escopo
- ⚠️ Persistência de produção: D1 = **Vercel (serverless)** → `FileLeadStore` não serve lá; criar adaptador `PostgresLeadStore` (Prisma) na O5. Em O1–O4 o `FileLeadStore` cobre dev.
- ⚠️ **FileLeadStore é last-write-wins entre processos** (a fila só serializa dentro de 1 processo). OK para dev/O1–O4; **proibido** em produção multi-instância — resolvido pelo `PostgresLeadStore` (unique em email + upsert) na O5.
- ✅ **(resolvido na S2)** Corrida de criação concorrente: `persistir()` faz catch → `buscarPorEmail`+`atualizar` em vez de erro 500. Não duplica nem trava na corrida.
- ⚠️ **Rate-limit em memória não é compartilhado em serverless** (singletons por instância em `route.ts`). Atacante distribui entre lambdas e o limite multiplica pelo nº de instâncias. Trocar por store compartilhado (Upstash/Postgres) junto da O5.
- ⚠️ **`MemoriaRateLimiter`: leak residual** — chaves só são podadas/removidas quando re-consultadas; chaves que nunca recorrem ficam no Map. Limitado pelo volume da janela; some com o store compartilhado da O5.
- ℹ️ **IP "desconhecido"** quando sem `x-forwarded-for`/`x-real-ip` → clientes assim compartilham um bucket. Na Vercel o header é setado (IP real); só relevante atrás de proxy mal-configurado.
- ℹ️ **Rota `POST /api/lead` não tem teste de unidade** (singletons usam o caminho real `data/leads.json`); verificada por **smoke test de runtime** (200/400/429, sem PII, só hash). Branch `ResendEmail` não roda nesta fase (só `ConsoleEmail`).

- ⚠️ **(S3) Rate-limit do verify herda a limitação da S2** (memória por instância; em serverless o limite multiplica pelo nº de lambdas). Mesmo conserto: store compartilhado na O5.
- ⚠️ **(S3) Lead `descartado` pelo admin (O4) com código válido ainda consegue token.** O status não é consultado na verificação. Decidir na **O4** se descartado bloqueia o demo.
- ℹ️ **(S3) `ipDaRequisicao` duplicado** nas duas rotas (5 linhas). Extrair para lib compartilhada quando aparecer o 3º consumidor (login admin, O4) — evitar tocar a rota da S2 fora de escopo agora.
- ℹ️ **(S3) `POST /api/lead/verify` sem teste de unidade** (mesmo motivo da S2: singletons no caminho real `data/leads.json`); coberta por **smoke de runtime** (200 + cookie, 400 errado, 400 reuso, 429 na 5ª tentativa, 400 Zod, disco só com hash, zero PII no log).
- ℹ️ **(S3) Token não é revogável** (stateless, 7 dias). Revogar exigiria lista de bloqueio no store — só faz sentido se a O4 pedir "cortar acesso de um lead".

## Obrigações herdadas (status)
- ✅ **S2 (feito):** erro do store/e-mail na rota **não vaza** caminho/conteúdo/PII (catch loga só `err.name`; response genérica 500).
- ✅ **S2 (feito):** **fail-closed** de `APP_SECRET` — importar a rota dispara `parseEnv()`; `min(16)` barra vazio/curto; secret injetado do env validado.
- ✅ **S3 (feito):** hash do código comparado com **`timingSafeEqual`** (com guarda de tamanho, para não lançar); a assinatura do token também.
- ℹ️ CRECI usa validação **leve** (`^[A-Za-z]{0,2}\s?\d{3,6}(-?\w)?$`) — pode rejeitar formato jurídico ("J-12345") ou número >6 dígitos; revisar com o fundador se necessário.

## Riscos
- Custo Resend → rate-limit obrigatório (S2). Sem domínio verificado (D2), só envia ao e-mail da conta.

## Aceite da onda (conferido na S3, commit 3ca2056)
| # | Critério | Como foi provado |
|---|----------|------------------|
| 1 | `POST /api/lead` cria/atualiza com consentimento carimbado e dispara o código | testes S1/S2 + smoke: `{ok:true,codigoDev}` e `consentimento{texto,aceitoEm,ip}` no disco |
| 2 | Com chave o e-mail sai; sem chave, fallback dev | **parcial:** `ConsoleEmail` + `codigoDev` provados; **branch `ResendEmail` nunca executada** (depende da D2 — validar na O5) |
| 3 | `/api/lead/verify` confirma, marca `verificadoEm`, emite token; errado/expirado/excedido falham com estado claro | 10 testes de domínio + smoke (200+cookie / 400 / 410 / 429) |
| 4 | Sem PII em log; código sempre como hash | testes com spy de console + grep no log do dev; `codigo` no disco só `{hash,expiraEm,tentativas,enviadoEm}` |
| 5 | Rate-limit barra reenvio abusivo; reenviar não duplica | testes S2 (4º envio 429, `listar()` = 1) |
| 6 | Testes mínimos verdes; `build`/`typecheck` limpos | **39 testes**, build (`/api/lead` + `/api/lead/verify`), `tsc --noEmit` limpo |

> Único ponto não fechado: o critério 2 na parte "com `RESEND_API_KEY` o e-mail sai" — sem domínio
> verificado (D2) não dá para provar de verdade. Fica no aceite da **O5·S2**.
