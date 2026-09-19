# PROTOCOLO DE EXECUÇÃO — CRM Ultra

Adaptação enxuta da skill de execução por ondas ao escopo desta fase (demo + captação, sem o backend
pesado da plataforma). O que não se aplica aqui (Outbox, filas, 13 módulos, RLS, multi-tenant) fica
para a trilha "Plataforma". **O que se aplica, vale integralmente.**

## Ciclo da sessão — 1 sessão = 1 sub-entrega = 1 commit

1. **ABRIR** — ler `Sx-*.md` da sub + `ESTADO.md` da onda + este protocolo. Rodar a *Revalidação ao
   iniciar* da sub (conferir premissas contra o código real). Premissa furada → ajustar e registrar
   no ESTADO **antes** de codar.
2. **MAPEAR** (≤5 linhas, antes do código): o que entrega em linguagem de negócio · que PII/secret
   toca · que arquivos cria/modifica (bate com "Pode tocar"?) · qual o caminho mais simples.
3. **CONSTRUIR** na ordem: `schema.ts` (Zod + tipos) → **teste** (existe? atualiza, não duplica;
   antes da lógica) → `use-case.ts` (puro, sem HTTP) → `handler`/route (fino) → UI (**copiar o
   protótipo**, nunca redesenhar; estados vazio/erro/carregando sempre).
4. **VERIFICAR** — `build` + `typecheck` + testes (todos). Cada "Pronto quando" provado, não presumido.
5. **REVISAR** — checklist de PR abaixo. Bloqueador → corrigir **antes** do commit.
6. **FECHAR** — commit `onda-NN/sub-Sx: descrição` → atualizar `ESTADO.md` (status ✅, decisões,
   pendências fora de escopo). Última sub da onda: rodar aceite do arquivo-mãe + atualizar `00-INDEX.md`.

## Escopo fechado (anti-deriva)

- Só toque nos arquivos do **"Pode tocar"** da sub. Faltou um? PARE, anote em *Pendências fora de
  escopo* no ESTADO, peça decisão. Nunca "aproveite para arrumar".
- Proibido refatorar fora do escopo e recriar o que existe (`grep` + reuso antes de criar).

## Arquitetura — imutáveis

- **Vertical slice**: cada feature na própria pasta (`handler`/route · `use-case` · `schema` ·
  `*.test` · `index`). Sem `services/`/`repositories/` genéricos.
- **Regra das 200 linhas** (bloqueador >300). Dividir por responsabilidade, nunca `parte1/parte2`.
- **YAGNI** — exceção oficial: portas de fornecedor `LeadStore`, `ProvedorEmail` (troca sem reescrever
  o domínio). Nenhuma outra interface especulativa.
- **Nomes em PT-BR do domínio** (`criarLeadComCodigo`, `verificarCodigo`, `consumirTentativa`).
- **Marca via config** (`brand.*` + CSS vars `--brand-*`), default neutro, `<BrandLogo/>`. Marca
  cravada = bloqueador.

## Segurança — camadas aplicáveis (todas obrigatórias aqui)

1. **Validação**: todo input externo passa por **Zod** estrito antes de qualquer lógica. Telefone →
   E.164. Nunca usar body cru.
2. **Autorização**: `/api/admin/*` sempre atrás do `authz` (cookie assinado). Sem cookie → **401**.
3. **Secrets & PII**: secret só via env, validado no boot (fail-closed). **PII (e-mail, telefone,
   CRECI) nunca em log**; response retorna o mínimo. Código de verificação guardado como **hash**.
4. **Anti-abuso**: rate-limit no envio de código (custo Resend) e no login admin (brute-force).
   Código expira + tentativas limitadas.
5. **Idempotência**: reenviar código não duplica lead (upsert por e-mail); verificar é idempotente.

## LGPD

- **Consentimento carimbado** (timestamp + IP + texto da política) no form público; opt-out funcional.
- **Sem dado real de pessoa** no demo — seed/persona fictícia sempre (Lei da migração).
- **Ação material do admin** (marcar contatado/descartado, exportar) → registro de auditoria simples.

## Testes mínimos por sub

1. Happy path ponta a ponta. 2. Input inválido → Zod rejeita (400). 3. Anti-abuso → rate-limit/tentativas
barram. 4. Autorização → admin sem cookie = 401. 5. Sem PII → response/log não vazam telefone/e-mail/CRECI
(grep no teste). Extra: tempo → clock injetado (expiração do código), nunca `sleep`.

## Revisão de PR — antes de TODO commit

```
══════════════════════════════════════════
REVISÃO DE PR — onda-NN/sub-Sx: [nome]
VEREDICTO: ✅ APROVADO | ⚠️ COM RESSALVAS | 🚨 REPROVADO
ARQUIVOS: novos [N] (linhas cada) · modificados [N] (justificar)
BLOQUEADORES: [lista ou "(nenhum)"]
PIOR CASO EM PRODUÇÃO: o que quebra, quem é afetado, como recupera
DECISÃO: AUTORIZADO PARA COMMIT | CORRIGIR ANTES
══════════════════════════════════════════
```

### Bloqueadores absolutos (impedem o commit)

1. Secret hardcoded. 2. Marca cravada (cor/nome/logo/domínio fixo fora de `brand.*`). 3. PII em log ou
em response além do necessário. 4. Código de verificação em texto puro (sem hash) ou sem expiração.
5. Rota admin sem `authz`. 6. Sem rate-limit no envio de código / login admin. 7. Arquivo >300 linhas.
8. Ausência dos testes mínimos · typecheck quebrado. 9. Perda silenciosa (catch vazio, erro sem estado
visível). 10. Dado real de pessoa no demo.

> Na dúvida entre permitir e bloquear: **bloqueie**. Entre criar e reusar: **reuse**. Entre esperto e
> legível: **legível**.
