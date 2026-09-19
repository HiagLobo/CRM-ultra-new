# O1 · S2 — ProvedorEmail + envio de código

## O que entrega (negócio)
Ao pedir acesso, o lead recebe um código no e-mail. Em dev (sem chave Resend), o código aparece no
fallback para testar o fluxo inteiro sem configurar nada. Reenvio abusivo é barrado.

## Revalidação ao iniciar
- [ ] S1 concluída (`leadStore`, `gerarCodigo`, `hashCodigo`)?
- [ ] `env.ts` expõe `RESEND_API_KEY?`, `EMAIL_FROM?`, `emailModoDev`?
- [ ] `brand.ts` tem nome/remetente/copy para o template?

## Mapear (≤5 linhas)
- Entrega: porta de e-mail + adaptadores + rota que cria lead e dispara código. PII: e-mail (não logar).
- Cria: `src/lib/email.ts`, `src/lib/ratelimit.ts`, `src/app/api/lead/route.ts`. Usa: `leadStore`, `lead.ts`.
- Risco: custo/spam → rate-limit. Caminho simples: `ProvedorEmail` + `resend` SDK + limiter por chave.

## Pode tocar
- `src/lib/email.ts` (novo: `ProvedorEmail`, `ResendEmail`, `ConsoleEmail`) ·
  `src/lib/ratelimit.ts` (novo) · `src/app/api/lead/route.ts` (novo) ·
  `src/features/lead/index.ts` (expor caso de uso `solicitarAcesso`)

## Passos
1. `email.ts`: interface `ProvedorEmail.enviarCodigo(para, codigo, brand)`; `ResendEmail` usa
   `new Resend(env.RESEND_API_KEY)` e `EMAIL_FROM`; `ConsoleEmail` (quando `emailModoDev`) loga
   **só** que enviou + retorna o código para a camada dev. Seleção: `emailModoDev ? Console : Resend`.
2. Template do e-mail: assunto/corpo com `brand.nome`, código destacado, validade 10 min, aviso
   anti-phishing. HTML simples inline.
3. `ratelimit.ts`: `permitir(chave, regra)` — ex.: 3 envios / 30 min por e-mail **e** por IP.
4. `route.ts` (`POST /api/lead`): Zod do body → `criarOuAtualizarLead` (com consentimento+IP) →
   rate-limit → `gerarCodigo`+`hashCodigo`+`expiraEm` salvos → `ProvedorEmail.enviarCodigo`.
   Response: `{ ok: true }` (em dev, incluir `codigoDev` quando `emailModoDev`). **Nunca** retornar PII
   extra nem o hash.
5. Testes: happy (cria lead + "envia" via Console, código presente só em dev); inválido (Zod 400);
   rate-limit (4º envio em 30min barra); **sem PII em log** (grep no teste: nenhum e-mail/telefone logado).

## Pronto quando
- [ ] `POST /api/lead` cria/atualiza lead, carimba consentimento (ts+IP+texto) e dispara o código.
- [ ] Com chave → Resend; sem chave → fallback dev mostra o código.
- [ ] Rate-limit barra reenvio abusivo; reenviar não duplica lead.
- [ ] Logs/response sem PII além do necessário; código só como hash no store. Testes verdes.

## Não fazer
- Sem verificação/token (S3). Sem UI (O2).
