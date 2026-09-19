# O5 · S2 — Deploy & runbook

## O que entrega (negócio)
O CRM Ultra no ar, com e-mail real funcionando e os leads sendo guardados de verdade — e um manual
para operar e evoluir.

## Revalidação ao iniciar
- [ ] S1 verde? D1 (persistência) e D2 (domínio Resend) decididos?

## Mapear (≤5 linhas)
- Entrega: app publicado + adaptador de persistência de produção + runbook. Secrets via env do host.
- Cria: adaptador `LeadStore` de produção (se D1 ≠ arquivo); `README.md`/`RUNBOOK.md`; config de deploy.
- Risco: perder leads (serverless + arquivo) → resolver D1 antes de publicar.

## Pode tocar
- `src/lib/leadStore.ts` (add adaptador prod, **mesma interface**) · config de deploy
  (`vercel.json`/Dockerfile/Procfile conforme D1) · `.env.example` (chaves de prod) ·
  `README.md` + `waves/RUNBOOK.md` (novo)

## Passos
1. **D1**: implementar o adaptador escolhido (`PrismaLeadStore`/`KvLeadStore`) **sem mexer no
   domínio** — só troca quem o `LeadStore` instancia por ambiente. Migrar dados de teste não é preciso.
2. **D2**: verificar domínio no Resend (SPF/DKIM no DNS); setar `EMAIL_FROM`; enviar e-mail real de teste.
3. Configurar envs de produção no host (`RESEND_API_KEY`, `EMAIL_FROM`, `ADMIN_PASSWORD`, `APP_SECRET`,
   flag `demoMode`). Build de produção.
4. Smoke test em produção: landing → pedir acesso → receber e-mail real → verificar → entrar no demo →
   ver o lead no `/admin`.
5. **Runbook**: rodar local, variáveis (o que é cada uma), como dar deploy, como rotacionar
   `APP_SECRET`/senha, LGPD (consentimento, opt-out/exclusão de lead), troubleshooting (e-mail não
   chega, código expira, etc.).

## Pronto quando
- [ ] App em produção; landing pública; e-mail real chega; verificação libera o demo.
- [ ] Leads persistem no adaptador de produção; `/admin` acessível e protegido.
- [ ] `README`/`RUNBOOK` completos. **Critérios de aceite da O5** verdes → `00-INDEX.md` atualizado.
- [ ] Apresentar ao fundador (present_files) + checklist D1/D2/D3 fechado.

## Não fazer
- Sem começar a trilha "Plataforma" (backend real do CRM) — é outra fase, outro plano de ondas.
