# Onda 7 — Prontidão de lançamento (cadastros funcionando de verdade)

**Objetivo:** o motor de cadastro aguenta tráfego real sem perder lead, sem ser abusado e sem
deixar o fundador no escuro — e o fundador tem um painel prático para trabalhar os contatos.
Origem: estudo de pré-lançamento (2026-09-18) + decisões do fundador (2026-09-19).

## Sub-entregas
- **S1 — Lead não se perde + anti-abuso + aviso de lead novo** → `S1-lead-anti-abuso.md`
- **S2 — Diagnóstico em produção + RUNBOOK do setup real** → `S2-diagnostico-runbook.md`
- **S3 — CRECI flexível, telefone colado e e-mail com remetente nomeado** → `S3-creci-remetente.md`
- **S4 — Celular: menu do CEO, tour e botão Guia** → `S4-celular.md`
- **S5 — Painel de leads prático** → `S5-painel-leads.md`

## Critérios de aceite da onda
1. Falha do Resend ou cota esgotada **não perde o lead**: ele fica no `/admin` para contato manual.
2. Um robô não esgota a cota diária de e-mail: teto global + honeypot (+ Turnstile, se configurado).
3. Todo 500 das rotas públicas e do admin deixa no log a **causa** (config/e-mail/banco), sem PII.
4. Corretor digitando o CRECI como está na carteira (`CRECI-PE 12.345-F`) passa.
5. No celular: menu do CEO abre e fecha, tour não aponta para o vazio, aba Perfil clicável.
6. No `/admin`: WhatsApp e e-mail a um clique, busca, filtro por status, CSV que abre certo no Excel.
7. RUNBOOK leva o fundador do zero ao ar no setup escolhido (registro.br → Vercel, Resend em
   `mail.crmultra.com.br`, Neon São Paulo) sem adivinhar nada.
8. `build` + `typecheck` + testes verdes; revisão de PR sem bloqueadores em cada sub.

## Pendências fora de escopo
_(preencher na execução)_
