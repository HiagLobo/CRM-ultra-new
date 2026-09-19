# O4 · S1 — Auth admin

## O que entrega (negócio)
Uma porta de entrada só sua: login por senha, sessão segura por cookie e proteção de todas as rotas
do admin. Sem isso, a lista de leads (PII) ficaria exposta.

## Revalidação ao iniciar
- [ ] `env.ADMIN_PASSWORD` e `env.APP_SECRET` validados no boot (O0·S1)?
- [ ] `ratelimit.ts` (O1·S2) reutilizável para o login?

## Mapear (≤5 linhas)
- Entrega: login/logout + `authz` central do admin. Secret: senha via env (nunca em código/log).
- Cria: `src/lib/adminAuth.ts`, `api/admin/login/route.ts`, `api/admin/logout/route.ts`,
  `app/admin/login/page.tsx`.
- Risco: brute-force → rate-limit + comparação `timingSafeEqual`. Caminho simples: senha → cookie HMAC.

## Pode tocar
- `src/lib/adminAuth.ts` (novo: `criarSessaoAdmin`, `exigirAdmin`, `encerrarSessao`) ·
  `src/app/api/admin/login/route.ts` · `src/app/api/admin/logout/route.ts` ·
  `src/app/admin/login/page.tsx` · `src/lib/ratelimit.ts` (reuso)

## Passos
1. `adminAuth.ts`: `verificarSenha(senha)` com `timingSafeEqual` contra `env.ADMIN_PASSWORD`;
   `criarSessaoAdmin()` → cookie httpOnly assinado HMAC (`APP_SECRET`, exp 12h, SameSite=Lax,
   Secure em prod); `exigirAdmin(req)` → valida cookie ou lança 401; `encerrarSessao()`.
2. `login/route.ts` (`POST`): Zod (senha) → rate-limit por IP (ex.: 5/min, depois atraso) →
   `verificarSenha` → set cookie. Falha → 401 genérico (não revelar detalhes). **Senha nunca em log.**
3. `logout/route.ts` (`POST`): limpa cookie.
4. `admin/login/page.tsx`: form simples (senha), estados erro/carregando; sucesso → `/admin`.
5. Testes: senha certa → cookie; errada → 401; rota protegida sem cookie → 401; rate-limit barra
   tentativas; nenhum log com a senha.

## Pronto quando
- [ ] Login com senha correta cria sessão; errada barra; logout limpa.
- [ ] `exigirAdmin` retorna 401 sem cookie válido (testado).
- [ ] Brute-force barrado; senha fora de logs. `build`/`typecheck` limpos.

## Não fazer
- Sem dashboard/listagem ainda (S2).
