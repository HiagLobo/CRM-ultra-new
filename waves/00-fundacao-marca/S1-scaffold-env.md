# O0 · S1 — Scaffold & env fail-closed

## O que entrega (negócio)
O projeto `crm-ultra-app` instala, **roda** (`dev`) e **builda**; as variáveis de ambiente são
validadas no boot (sem chave obrigatória faltando passar despercebido).

## Revalidação ao iniciar
- [ ] `node_modules` travado liberou? `rm -rf node_modules` funciona? Se **não**: renomear a pasta do
      projeto e re-copiar `src/`+`public/`+configs do protótipo original (sem `node_modules`).
- [ ] `package.json` veio do protótipo? Confirmar deps: `next 14`, `react 18`, `lucide-react`.

## Mapear (≤5 linhas)
- Entrega: ambiente buildando + `env.ts`. PII/secret: define os nomes das envs (não os valores).
- Cria: `src/lib/env.ts`. Modifica: `package.json` (add `resend`, script `typecheck`), `.env.example`.
- Sem risco de corrida/IDOR. Caminho mais simples: instalar, validar env com Zod, subir.

## Pode tocar
- `package.json` · `.env.example` · `src/lib/env.ts` (novo) · `tsconfig.json` (só se `typecheck` exigir)

## Passos
1. Resolver `node_modules` (revalidação). `npm install`. `npm install resend`.
2. `src/lib/env.ts`: Zod das envs com **fail-closed** no boot —
   `RESEND_API_KEY?` (opcional → liga fallback `ConsoleEmail`), `EMAIL_FROM?`, `ADMIN_PASSWORD`
   (obrigatória p/ O4), `APP_SECRET` (obrigatória p/ HMAC dos tokens), `NODE_ENV`.
   Exportar `env` tipado + flag `emailModoDev = !RESEND_API_KEY`.
3. `.env.example` com todas as chaves comentadas (sem valores reais).
4. `package.json`: script `"typecheck": "tsc --noEmit"`.
5. `npm run build` e `npm run dev` — ambos verdes.

## Pronto quando
- [ ] `npm run dev` sobe sem erro; home do protótipo abre.
- [ ] `npm run build` + `npm run typecheck` limpos.
- [ ] Faltando `APP_SECRET`/`ADMIN_PASSWORD`, o boot **falha com mensagem clara** (fail-closed),
      não silenciosamente.
- [ ] `.env.example` cobre todas as chaves; nenhum secret commitado.

## Testes mínimos
- `env.ts`: parse OK com envs válidas; **rejeita** (lança) quando falta obrigatória; `emailModoDev`
  reflete ausência de `RESEND_API_KEY`.

## Não fazer
- Nada de marca, leads, telas. Só ambiente + env.
