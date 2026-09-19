# O4 · PLANO — Admin de Leads

## Resultado da onda
Área `/admin` protegida por senha, com dashboard de leads (contagens + lista + follow-up + export),
lendo do mesmo `LeadStore` da O1.

## Arquitetura
```
src/lib/adminAuth.ts                porta de sessão admin (cookie httpOnly assinado) + authz()
src/app/api/admin/login/route.ts    POST senha -> cookie
src/app/api/admin/logout/route.ts   POST limpa cookie
src/app/api/admin/leads/route.ts    GET lista+contagens (authz) ; PATCH status (authz, auditado)
src/app/api/admin/export/route.ts   GET CSV (authz, auditado)
src/app/admin/login/page.tsx        form de senha
src/app/admin/page.tsx              dashboard (server-guard + client table)
src/features/lead/admin.ts          casos de uso: resumo(), atualizarStatus(), exportarCsv()
src/lib/auditoria.ts                 registrarAuditoria() simples (append em data/auditoria.log)
```

## Baseline de reuso
- `LeadStore` (O1·S1), `env.ADMIN_PASSWORD` + `APP_SECRET` (O0·S1), `token.ts` (padrão HMAC),
  `ratelimit.ts` (O1·S2) para anti brute-force.

## Decisões
- 1 admin, senha única via env (sem cadastro de usuários nesta fase).
- `authz` central: todo handler `/api/admin/*` chama `exigirAdmin(req)` → 401 sem cookie válido.
- Auditoria simples (append-only) para ações materiais (status/export) — espelha o invariante LGPD.

## Ordem
1. **S1** auth (login/logout/authz). 2. **S2** dashboard + ações + export.

## Revalidação ao iniciar
- [ ] O1·S1 (LeadStore) e O0·S1 (env: ADMIN_PASSWORD, APP_SECRET) prontos?

## Não fazer
- Sem multi-usuário/RBAC, sem edição de lead além de status. Sem deploy (O5).
