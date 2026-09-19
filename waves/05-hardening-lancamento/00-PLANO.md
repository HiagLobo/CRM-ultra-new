# O5 · PLANO — Hardening & Lançamento

## Resultado da onda
Produto testado, revisado e **no ar**, com persistência e e-mail de produção resolvidos e um runbook
que qualquer pessoa segue.

## Baseline de reuso
- Testes já escritos nas ondas anteriores (consolidar, não duplicar).
- Portas `LeadStore`/`ProvedorEmail` — trocar adaptador, não o domínio.

## D1 — opções de persistência de produção (decidir aqui)
| Opção | Quando | O que muda |
|-------|--------|------------|
| Host Node persistente (Render/Railway/VPS) | mais simples | `FileLeadStore` já serve (volume persistente) |
| Vercel + Postgres (Neon/Supabase) via Prisma | serverless | novo adaptador `PrismaLeadStore` (mesma interface) |
| Vercel + KV (Upstash) | serverless leve | novo adaptador `KvLeadStore` |

## D2 — e-mail de produção
- Verificar domínio no Resend (registros DNS SPF/DKIM); `EMAIL_FROM` no domínio; testar entrega real.

## Ordem
1. **S1** testes & revisão. 2. **S2** deploy & runbook.

## Revalidação ao iniciar
- [ ] O0–O4 concluídas e marcadas no `00-INDEX.md`?
- [ ] D1 e D2 decididos com o fundador?

## Não fazer
- Sem features novas. Hardening é fechar o que existe, não abrir frente nova.
