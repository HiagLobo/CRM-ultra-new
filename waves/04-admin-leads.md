# Onda 4 — Admin de Leads

**Objetivo:** o painel onde você (fundador) acompanha quem pediu acesso. Login protegido, contagens
(quantos acessos, quantos verificados) e a lista com contato para dar follow-up.

## Sub-entregas
- **S1 — Auth admin** → `S1-auth-admin.md`
- **S2 — Dashboard de leads** → `S2-dashboard-leads.md`

## Critérios de aceite da onda
1. `/admin` exige login (senha via env); sem cookie válido → 401/redirect; logout funciona.
2. `/api/admin/*` sempre atrás de `authz`; brute-force barrado (rate-limit/delay).
3. Dashboard mostra contagens (total, verificados, % conversão, por status) e a lista
   (e-mail/telefone/CRECI/data/origem/status).
4. Ações de follow-up (marcar **contatado**/**descartado**) persistem e são **auditadas**; export CSV.
5. **PII só para o admin autenticado**; nada em log. `build`/`typecheck` limpos.

## Pendências fora de escopo
**Onda concluída** (S1 `576aee7` · S2 `ef5bc78`). Aceite conferido em `04-admin-leads/ESTADO.md` —
os 5 critérios verdes. O que ficou para depois:

- ⚠️ **O5 — persistência:** `FileLeadStore` e `data/auditoria.log` não sobrevivem à Vercel
  (serverless). O painel abriria vazio em produção; depende do `PostgresLeadStore` (D1).
- ⚠️ **O5 — rate-limit compartilhado:** o limite do login conta por instância; distribuído entre
  lambdas, multiplica.
- ℹ️ **Sem paginação/busca/filtro** na lista (carrega tudo). Serve para dezenas/centenas de leads.
- ℹ️ **Sem renovação de sessão nem CSRF token** (SameSite=Lax cobre o caso realista).
- ℹ️ **Sem notificação de novo lead** (e-mail/Slack) — avaliar como melhoria depois do lançamento.
- ℹ️ **Sem teste de renderização do painel** (o projeto não tem jsdom/browser driver).
