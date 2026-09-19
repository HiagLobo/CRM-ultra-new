# O1 · S3 — Verificação + token de demo

## O que entrega (negócio)
O lead digita o código; se bater (e não expirou nem estourou tentativas), ele é marcado como
**verificado** e recebe um **token de acesso ao demo** (cookie httpOnly). É esse token que a O2·S3
exige para abrir os painéis.

## Revalidação ao iniciar
- [ ] S1/S2 concluídas (`leadStore`, `hashCodigo`, `expiraEm`, `tentativas`)?
- [ ] `env.APP_SECRET` obrigatório disponível?

## Mapear (≤5 linhas)
- Entrega: rota de verificação + emissão de token. PII: e-mail (não logar).
- Cria: `src/lib/token.ts`, `src/app/api/lead/verify/route.ts`. Modifica: `src/features/lead/verificacao.ts`.
- Risco: brute-force do código → tentativas limitadas + expiração + (rate-limit reaproveitado).
  Caminho simples: comparar hash com `timingSafeEqual`, emitir HMAC.

## Pode tocar
- `src/lib/token.ts` (novo: `assinarTokenDemo`, `verificarTokenDemo`) ·
  `src/features/lead/verificacao.ts` (novo) · `src/app/api/lead/verify/route.ts` (novo) ·
  `src/features/lead/index.ts`

## Passos
1. `verificacao.ts`: `verificarCodigo(email, codigo, agora)` — busca lead; checa `expiraEm` e
   `tentativas`; compara `hashCodigo(codigo)` com o salvo via **timingSafeEqual**; sucesso →
   `verificadoEm=agora`, zera código; falha → `consumirTentativa` (incrementa; estoura → invalida).
   **Clock injetado** (param `agora`), nunca `Date.now()` direto no domínio.
2. `token.ts`: `assinarTokenDemo({email})` = base64(payload).HMAC-SHA256(APP_SECRET), com `exp`
   (ex.: 7 dias); `verificarTokenDemo(token)` valida assinatura+exp (timingSafeEqual).
3. `verify/route.ts` (`POST /api/lead/verify`): Zod (email, codigo) → `verificarCodigo` →
   sucesso: `Set-Cookie` httpOnly+SameSite=Lax+Secure(prod) com o token; `{ ok:true }`.
   falha: 400/410 com motivo claro (`codigo_invalido` | `expirado` | `tentativas_excedidas`).
4. Testes: happy (código certo → verificado + cookie com token válido); errado (tentativa consumida);
   expirado (clock fake → 410); excedido (N+1 → bloqueia); token (assinado verifica; adulterado falha);
   sem PII em log.

## Pronto quando
- [ ] Código correto marca `verificado` e emite token httpOnly válido.
- [ ] Errado/expirado/excedido falham com estado claro e tentativa contabilizada.
- [ ] Token assinado é validável e expira; adulteração rejeitada (timingSafeEqual).
- [ ] **Critérios de aceite da O1** (arquivo-mãe) verdes → atualizar `00-INDEX.md`. Testes verdes.

## Não fazer
- Sem UI (O2). Sem gate dos painéis (O2·S3 consome este token).
