# Onda 5 — Hardening & Lançamento

**Objetivo:** fechar a fase com qualidade e colocar no ar. Testes mínimos completos, build/typecheck
limpos, revisão final, e o deploy real (com a persistência e o e-mail de produção resolvidos).

## Sub-entregas
- **S1 — Testes & revisão final** → `S1-testes-revisao.md`
- **S2 — Deploy & runbook** → `S2-deploy-runbook.md`

## Critérios de aceite da onda
1. Suíte de testes mínimos cobrindo: happy, input inválido, rate-limit, código expirado/excedido,
   admin 401 sem cookie, **sem PII em log/response**.
2. `npm run build` + `typecheck` + testes verdes; revisão de PR sem bloqueadores.
3. **D1 resolvido**: persistência de produção definida e plugada (mantendo a porta `LeadStore`).
4. App no ar; e-mail real chega (domínio Resend verificado — **D2**); `/admin` acessível em produção.
5. README/runbook completo: rodar local, variáveis, deploy, LGPD/opt-out, troubleshooting.

## Pendências fora de escopo
_(preencher na execução)_
