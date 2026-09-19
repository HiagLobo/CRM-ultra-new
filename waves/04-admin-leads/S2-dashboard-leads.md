# O4 · S2 — Dashboard de leads

## O que entrega (negócio)
A tela onde você vê quantos pediram acesso, quantos confirmaram o e-mail, e a lista com contato para
ligar/escrever. Marcar quem já foi contatado e exportar para planilha.

## Revalidação ao iniciar
- [ ] S1 concluída (`exigirAdmin`)? `LeadStore.listar()` disponível (O1·S1)?
- [ ] `auditoria.ts` existe? Senão, criar nesta sub (append-only em `data/auditoria.log`).

## Mapear (≤5 linhas)
- Entrega: API de leads (resumo+lista+status+export) + tela admin. PII: exibida só ao admin; nunca em log.
- Cria: `api/admin/leads/route.ts`, `api/admin/export/route.ts`, `app/admin/page.tsx`,
  `src/features/lead/admin.ts`, `src/lib/auditoria.ts`.
- Risco: vazar PII sem authz. Caminho simples: todo handler chama `exigirAdmin` antes de tudo.

## Pode tocar
- `src/features/lead/admin.ts` (`resumo`, `atualizarStatus`, `exportarCsv`) ·
  `src/app/api/admin/leads/route.ts` (GET resumo+lista, PATCH status) ·
  `src/app/api/admin/export/route.ts` (GET CSV) · `src/app/admin/page.tsx` · `src/lib/auditoria.ts`

## Passos
1. `admin.ts`: `resumo()` → `{ total, verificados, novos, contatados, descartados, conversaoPct }`;
   `atualizarStatus(id, status)` (valida transição); `exportarCsv()` (string CSV).
2. `leads/route.ts`: `GET` (authz) → resumo + lista (ordenável por data); `PATCH` (authz, Zod) →
   `atualizarStatus` + `registrarAuditoria('lead.status', {id, de, para, em})`.
3. `export/route.ts`: `GET` (authz) → CSV (Content-Disposition) + auditoria `lead.export`.
4. `auditoria.ts`: `registrarAuditoria(acao, dados)` append-only (sem PII sensível além do necessário —
   guardar id, não o telefone).
5. `admin/page.tsx`: guard server (cookie) + tabela client — cards de contagem no topo, tabela
   (e-mail/telefone/CRECI/data/origem/status) com ação de status e botão Export. Estados
   vazio/carregando/erro.
6. Testes: authz (sem cookie → 401 em todas as rotas); resumo bate com o store; PATCH muda status +
   audita; export gera CSV; **sem PII em log**.

## Pronto quando
- [ ] `/admin` (logado) mostra contagens corretas e a lista real do store.
- [ ] Marcar contatado/descartado persiste e gera auditoria; export baixa CSV.
- [ ] Todas as rotas `/api/admin/*` barram sem cookie (401). PII só para o admin; nada em log.
- [ ] **Critérios de aceite da O4** verdes → atualizar `00-INDEX.md`. `build`/`typecheck` limpos.

## Não fazer
- Sem deploy/persistência de produção (O5). Sem multi-usuário.
