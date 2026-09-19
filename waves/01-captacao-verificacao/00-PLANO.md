# O1 · PLANO — Captação & Verificação

## Resultado da onda
Rotas e domínio para capturar lead, enviar código (Resend/fallback) e verificar, emitindo token de
demo. Tudo atrás de portas (`LeadStore`, `ProvedorEmail`) para trocar fornecedor sem mexer no domínio.

## Arquitetura (vertical slice)
```
src/features/lead/
  schema.ts        Zod: LeadInput (email, telefone E.164, creci), VerifyInput (email, codigo)
  lead.ts          domínio: criarOuAtualizarLead, gerarCodigo, registrarConsentimento
  verificacao.ts   domínio: verificarCodigo, consumirTentativa, emitirTokenDemo
  lead.test.ts     testes co-localizados
  index.ts         API pública do slice
src/lib/
  leadStore.ts     porta LeadStore + FileLeadStore (data/leads.json)
  email.ts         porta ProvedorEmail + ResendEmail + ConsoleEmail (fallback)
  ratelimit.ts     limitador simples por chave (email/IP) em memória/arquivo
  token.ts         HMAC sign/verify (APP_SECRET) p/ token de demo
src/app/api/lead/route.ts          POST  -> cria lead + envia código
src/app/api/lead/verify/route.ts   POST  -> verifica + emite token (cookie httpOnly)
```

## Baseline de reuso
- `src/lib/env.ts` (O0·S1) — ler `RESEND_API_KEY`, `EMAIL_FROM`, `APP_SECRET`, `emailModoDev`.
- `src/config/brand.ts` (O0·S2) — nome/remetente/copy do e-mail (marca via config).
- `src/types/index.ts` — adicionar tipo `Lead`, `StatusLead`.

## Modelo Lead (campos)
`id` · `email` · `telefone`(E.164) · `creci` · `status`('novo'|'verificado'|'contatado'|'descartado')
· `consentimento`{ `texto`, `aceitoEm`, `ip` } · `codigo`{ `hash`, `expiraEm`, `tentativas`, `enviadoEm` }
· `verificadoEm?` · `origem`(utm/ref) · `criadoEm` · `atualizadoEm`.

## Ordem
1. **S1** domínio + store + Zod (sem rede). 2. **S2** e-mail + envio + rate-limit (`POST /api/lead`).
3. **S3** verificação + token (`POST /api/lead/verify`).

## Revalidação ao iniciar
- [ ] O0 concluída (env.ts e brand.ts existem)?
- [ ] D1 ainda em aberto não bloqueia: `FileLeadStore` cobre dev. Persistência de produção é O5.

## Não fazer
- Sem telas de marketing/fluxo (O2), sem admin (O4). Só rotas + domínio + testes.
