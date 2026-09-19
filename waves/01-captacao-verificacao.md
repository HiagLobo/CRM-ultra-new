# Onda 1 — Captação & Verificação

**Objetivo:** o backend real desta fase. Capturar o lead (e-mail + telefone + CRECI + consentimento),
enviar um **código de verificação** por e-mail (Resend, com fallback dev) e, ao confirmar, emitir um
**token de acesso ao demo**. Nada de UI de marketing aqui (é a O2) — só as rotas e o domínio.

## Por que agora
A O2 (landing/fluxo) e a O4 (admin) consomem este backend. Construir o domínio + portas primeiro
deixa a UI fina e testável, e mantém PII/secret sob controle desde o início.

## Sub-entregas
- **S1 — Lead + LeadStore + Zod** → `S1-lead-store.md`
- **S2 — ProvedorEmail + envio de código** → `S2-email-codigo.md`
- **S3 — Verificação + token de demo** → `S3-verificacao-token.md`

## Critérios de aceite da onda
1. `POST /api/lead` cria/atualiza lead com consentimento carimbado (ts+IP+texto) e dispara o código.
2. Com `RESEND_API_KEY` o e-mail sai; sem chave, o código aparece no fallback dev (log/response dev).
3. `POST /api/lead/verify` confirma código correto, marca `verificadoEm` e emite token HMAC válido;
   código errado/expirado/excedido falha com estado claro.
4. **Sem PII em log** (grep nos testes); código guardado como **hash**, nunca em texto puro.
5. **Rate-limit** barra reenvio abusivo por e-mail/IP. Reenviar não duplica o lead (upsert).
6. Testes mínimos verdes; `build`/`typecheck` limpos.

## Pendências fora de escopo
**Onda concluída** (S1 `1f0d06f` · S2 `186b106` · S3 `3ca2056`). Aceite conferido em
`01-captacao-verificacao/ESTADO.md`. O que ficou para depois:

- **O5 — persistência e limites de verdade:** `FileLeadStore` e o rate-limit em memória não
  sobrevivem à Vercel (serverless). Trocar por `PostgresLeadStore` (Prisma) + limiter compartilhado
  (Upstash/Postgres) sem tocar no domínio.
- **O5 — D2 (domínio Resend):** a branch `ResendEmail` nunca foi executada; o envio real só pode ser
  provado com domínio verificado (critério 2 do aceite).
- **O4 — lead descartado:** a verificação não olha o `status`; decidir se um lead descartado ainda
  pode abrir o demo (hoje pode, se tiver código válido).
- **O4 — `ipDaRequisicao`:** duplicado nas duas rotas; extrair para lib quando o login admin virar o
  3º consumidor.
- **CRECI:** regex leve pode rejeitar formato jurídico ("J-12345"); confirmar com o fundador.
