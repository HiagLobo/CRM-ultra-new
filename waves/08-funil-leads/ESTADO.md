# O8 · ESTADO — Funil de leads e conversão

## Status das subs
| Sub | Trilha | Status | Commits | Revisão cética |
|-----|--------|--------|---------|----------------|
| S1 — Modelo e API do funil | A | ✅ | `73ef11b` | aprovada (5 baixos; ordem da 004 e motivo vazio corrigidos na integração, próxima ação fora da fila no fechamento) |
| S2 — Painel | A | ✅ | `9ac9d67` | aprovada (8 baixos; "ocupado" entre leads e próxima ação fora da fila corrigidos no fechamento) |
| S3 — Conversão | B | ✅ | `d5c8ea4` | aprovada (5 baixos; texto da Política corrigido na integração) |
| Integração | — | ✅ | `265bc95` + `d0c2a38` + este | `/login` registra a origem, "Quero usar" no site de exemplo, ordem segura de publicação, motivo vazio |

## Verificação (2026-09-19)
- `tsc` limpo · **576 testes** (60 arquivos) · `next build` verde · nenhum arquivo > 280 linhas nas áreas vigiadas.
- Crawl headless de **48 rotas**: 0 exceções JS · roteiro **celular 390 px**: 20/20.
- API do funil ponta a ponta (dev, store em arquivo): cadastro manual 201 · repetido 409 com id ·
  retomar sem data 400 · retomar ok · perdido sem motivo 400 · anotação 201 · anotação vazia 400 ·
  sem sessão 401 · DTO sem hash/IP/consentimento · CSV com as colunas novas.
- Painel no navegador (desktop 1366 e celular 390): abas com contagem, cards, lista, ficha do lead
  (etapa, próxima ação, anotações), "+ Novo lead" — 0 estouro lateral, 0 exceções JS.

## Decisões tomadas
- **Etapas**: novo · em_contato · demonstracao · negociacao · cliente · retomar · perdido. Status
  antigos normalizados na leitura (verificado→novo, contatado→em_contato, descartado→perdido) e
  convertidos pela `004`. "E-mail confirmado" virou selo (`verificadoEm`), não etapa.
- **Retomar depois** exige um dia depois de hoje (Recife), motivo opcional. **Perdido** exige
  motivo. Entrar em qualquer um dos dois limpa a próxima ação; lead fora da fila não recebe
  próxima ação (409 `fora_da_fila`, a ficha mostra o aviso no lugar do formulário).
- **Próxima ação**: dia de hoje em diante (atraso se resolve andando a data).
- **Hoje**: próxima ação vencida ou do dia · retomar com data até hoje · novo sem contato há 24 h+.
- **Cadastro manual**: telefone e canal obrigatórios, consentimento declarado pelo fundador,
  dedupe por e-mail/telefone → 409 com o id (o painel oferece abrir o existente), observação vira a
  1ª anotação, sem código de verificação.
- **Escrita direcionada**: `atualizarFunil` (só colunas do funil) e `atualizarCodigo` (COALESCE) —
  fecha a pendência do O7 de regravar a linha inteira.
- **Auditoria sem PII**: `lead.etapa {id,de,para}`, `lead.nota {id,nota}`, `lead.manual {id,canal}`,
  `lead.proxima_acao {id,acao}`. Anotações não vão para o CSV.
- **Publicação**: deploy primeiro, `004` logo em seguida (RUNBOOK 3.9). O código novo tolera o banco
  antigo (`SELECT *`, colunas novas só no INSERT quando têm valor); o painel do O7 quebra com as
  etapas novas.
- **(S3) "Quero usar"** abre o WhatsApp comercial da marca com mensagem pronta (banner dos painéis,
  Guia, tela de acesso liberado e barra do site de exemplo).
- **(S3) Origem**: `utm` = fonte.meio.campanha; `ref` = `ref` da URL ou domínio do referrer (também
  quando há UTM sem `ref`); guardada em `sessionStorage` (`crm_origem_campanha`); a Política diz
  "e/ou o domínio do site de onde você veio".

## Pendências fora de escopo
- **Fundador**: rodar `migrations/004-funil.sql` no Neon logo depois do deploy (RUNBOOK 3.9).
- **`.env.local` com a `DATABASE_URL` de produção**: teste local grava no banco real. Usar uma
  branch de desenvolvimento do Neon (ou deixar vazio para o store em arquivo).
- Painel (baixos): diálogos sem prender o foco e abas sem setas do teclado; "+ Novo lead" não trava
  a rolagem de trás no celular; `escolherNaLinha` limpa o erro ao só abrir o mini-formulário;
  "abrir o existente" (409) não avisa quando o lead some da lista.
- Regex de acentos com os combinantes literais (`filtroLeads.ts`, `origemCampanha.ts`) — trocar por
  `̀-ͯ` (funciona, só é ilegível).
- Rodapé fixo do Guia (~88 px) aperta a aba Atendimento em telas baixas.
- Sem teste ponta a ponta de `registrarOrigemDaVisita()` na landing/login (só o módulo é testado).
- Política de Privacidade: revisão jurídica (já no RUNBOOK §7).
