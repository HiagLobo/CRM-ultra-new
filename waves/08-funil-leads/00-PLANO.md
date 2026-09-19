# O8 · PLANO — Funil de leads e conversão

## Decisões do fundador (2026-09-19)
| # | Decisão |
|---|---------|
| F1 | Funil com etapas + "Retomar depois" (quarentena com data e motivo) + "Perdido" com motivo + aba "Hoje". |
| F2 | Anotações e próxima ação por lead. |
| F3 | Cadastro manual de leads (indicação, evento, WhatsApp). |
| F4 | Conversão: botão "Quero usar" dentro do demo + origem da campanha (UTM). |
| F5 | Visual: **lista com abas por etapa** (a tabela de hoje), não kanban. |

## Decisões técnicas do orquestrador
- **Etapas** (campo `status`, reaproveitado): `novo`, `em_contato`, `demonstracao`,
  `negociacao`, `cliente`, `retomar`, `perdido`. "E-mail confirmado" deixa de ser etapa — é o selo
  de `verificadoEm`. A verificação **não muda mais** a etapa.
- **Status antigos** (`verificado`, `contatado`, `descartado`) → `novo`, `em_contato`, `perdido`:
  a migração 004 converte e o código **também normaliza na leitura** (arquivo de dev e qualquer
  linha antiga) — nunca quebra por valor legado.
- **Campos novos** em `leads`: `nome`, `canal` (`site` padrão · `indicacao` · `evento` ·
  `whatsapp` · `outro`), `retomar_em`, `motivo`, `proxima_acao_em`, `proxima_acao`.
  `email` passa a aceitar vazio (NULL) **só** para lead manual (o `UNIQUE` continua valendo).
- **Anotações** em tabela própria `lead_notas` com `ON DELETE CASCADE`: a exclusão LGPD leva junto.
  Texto até 2.000 caracteres. Auditoria registra que houve anotação (id), nunca o texto.
- **Atualizações direcionadas** no store (só as colunas do funil/próxima ação) — nada de regravar
  a linha inteira (corrida com o fluxo público).
- **Cadastro manual**: telefone obrigatório; e-mail e CRECI opcionais; deduplicação por e-mail e
  por telefone (409 com o id do existente); consentimento gravado como "cadastro manual pelo
  administrador — canal X — base legal: legítimo interesse (contato iniciado pelo titular ou
  indicação consentida)" + `ip = "admin"`; checkbox obrigatório "a pessoa sabe e concordou em ser
  contatada". Sem código de verificação.
- **Ordem de publicação**: migração 004 no Neon **antes** do deploy do código.

## Trilhas
| Trilha | Subs | Pode tocar |
|--------|------|------------|
| A — Funil | S1 → S2 | `migrations/004-*.sql`, `src/features/lead/**`, `src/lib/{leadStore,leadStorePostgres,criarLeadStore}.ts` (+ testes), `src/app/api/admin/**`, `src/app/admin/**`, `src/lib/adminRotas.test.ts`, `README.md`, `waves/RUNBOOK.md` |
| B — Conversão | S3 | `src/components/guia/{DemoBanner,GuiaDrawer}.tsx`, `src/components/acesso/**`, `src/app/page.tsx`, `src/lib/origemCampanha.ts` (novo, + teste), `src/app/privacidade/page.tsx` |

## Não fazer
- Kanban, arrastar-e-soltar, multiusuário, lembrete por e-mail/agenda, paginação no servidor.
- Mexer no demo além do botão "Quero usar".
