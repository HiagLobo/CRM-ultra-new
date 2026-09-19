# O7 · PLANO — Prontidão de lançamento

## Decisões (fundador, 2026-09-19)
| # | Tema | Decisão |
|---|------|---------|
| P1 | Domínio | `crmultra.com.br` registrado; DNS apontado para a Vercel. `brand.dominio` continua o mesmo. |
| P2 | Remetente | Subdomínio dedicado `mail.crmultra.com.br` verificado no Resend (região São Paulo) — nunca a raiz da Safe Guardian. |
| P3 | Escopo | As 4 frentes do estudo (lead/anti-abuso, logs+RUNBOOK, CRECI+remetente, celular) + painel de leads prático. |
| P4 | Painel | Simples: o objetivo é ter o contato e gerenciar o lead — nada de CRM dentro do CRM. |

## Decisões técnicas do orquestrador
- **Lead que falha no envio é gravado** com status `novo` e código inutilizado (sem migração nova):
  o fundador vê no `/admin` e liga/WhatsApp. A pessoa vê mensagem honesta ("recebemos seus dados").
- **Teto global diário** de envios (`LIMITE_ENVIOS_DIA`, padrão 90 — abaixo dos 100/dia do Resend Free).
  Estourou → mesmo tratamento: lead gravado, e-mail não sai.
- **Limite por IP** sobe de 3 para 10 envios/30 min (redes de escritório/CGNAT); por e-mail segue 3.
- **Honeypot** sempre ligado; **Cloudflare Turnstile** só quando as duas chaves estiverem no env.
- **Aviso de lead novo** (`AVISO_LEADS_EMAIL`, opcional): e-mail ao fundador a cada verificação
  nova, **sem PII** — só "novo lead confirmado" + link do `/admin`.
- **Log de erro** = categoria segura (`config:VAR`, `email:<nome do erro do Resend>`, `db:<SQLSTATE>`).

## Trilhas (paralelas, sem arquivo em comum)
| Trilha | Subs (em ordem) | Pode tocar |
|--------|-----------------|------------|
| A — Motor de cadastro | S3 → S1 → S2 | `src/features/lead/**` (exceto `admin*.ts`), `src/lib/{env,email,db,req,ratelimit*,criarRateLimiter,criarLeadStore,leadStore*}.ts` (+ testes), `src/app/api/lead/**`, `src/components/acesso/**`, `.env.example`, `README.md`, `waves/RUNBOOK.md`, `waves/05-hardening-lancamento/ESTADO.md` |
| B — Celular | S4 | `src/components/guia/**`, `src/lib/tourPosicao.ts` (+ teste), `src/lib/useIsMobile.ts`, `src/components/ceo/CeoChrome.tsx`, `src/components/corretor/CorretorChrome.tsx`, `src/app/franqueado/page.tsx`, `src/content/guia.ts` |
| C — Painel | S5 | `src/app/admin/**`, `src/app/api/admin/**`, `src/features/lead/admin.ts` (+ teste) |

## Não fazer
- Nada de migração de banco nesta onda (o que precisa cabe no schema atual).
- Não redesenhar telas; não mexer no conteúdo do demo (a O6 fechou isso).
