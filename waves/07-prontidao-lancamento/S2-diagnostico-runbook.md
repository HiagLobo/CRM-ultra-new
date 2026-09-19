# O7 · S2 — Diagnóstico em produção + RUNBOOK do setup real

## O que entrega (negócio)
No primeiro deploy e em qualquer incidente, o log diz **o que** quebrou (config, e-mail, banco)
sem expor dado pessoal; e o RUNBOOK leva o fundador do zero ao ar no setup que ele escolheu.

## Fazer
1. Erros com causa segura: `ErroConfiguracao` (nome da variável), `ErroEnvioEmail` (nome do erro
   do Resend, ex. `daily_quota_exceeded`), erro do `pg` → `db:<SQLSTATE>`; helper que devolve a
   categoria. Nas rotas: `const causa = causaDoErro(err); console.error("[rota] erro:", causa)` —
   a guarda `regressao.test.ts` proíbe `console.error(... err)` cru.
2. `pool.on("error", ...)` no `db.ts` (conexão ociosa que cai não derruba a instância).
3. RUNBOOK §2/§3/§6 reescritos para o setup real: registro.br → nameservers da Vercel; domínio na
   Vercel; Resend com `mail.crmultra.com.br` (São Paulo) e chave "Sending access"; Neon São Paulo,
   string *pooled* com `sslmode=verify-full`, as **3** migrações; variáveis só em Production (Preview
   sem banco de produção); região das funções `gru1`; plano Pro (Hobby proíbe uso comercial); não
   definir `NODE_ENV`; **redeploy após trocar variável**; onde ver logs e o que cada causa significa;
   backup (branch do Neon antes de SQL manual + CSV semanal); smoke com exclusão do lead de teste.
   Variáveis novas da O7 (`LIMITE_ENVIOS_DIA`, Turnstile, `AVISO_LEADS_EMAIL`).
4. `.env.example`, README e `waves/05-hardening-lancamento/ESTADO.md`: 3 migrações; a trava de
   produção dispara na **primeira requisição**, não no boot.

## Pronto quando
- [ ] Teste de `causaDoErro` para cada categoria; guarda de regressão verde.
- [ ] RUNBOOK seguível de ponta a ponta sem conhecimento prévio.
