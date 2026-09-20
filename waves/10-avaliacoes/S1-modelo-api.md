# O10 · S1 — Modelo e API da avaliação

## O que entrega (negócio)
Quem está com o demo liberado consegue dar a nota e escrever o comentário, a média do site sobe na
hora, e nada vai ao ar sem a escolha de identificação da pessoa.

## Fazer
1. `migrations/006-avaliacoes.sql` (idempotente, só acrescenta): tabela `avaliacoes` com
   `id TEXT PK`, `lead_id TEXT NOT NULL REFERENCES leads(id) ON DELETE CASCADE`,
   `estrelas SMALLINT NOT NULL CHECK (estrelas BETWEEN 1 AND 5)`, `comentario TEXT`,
   `identificacao TEXT NOT NULL`, `status TEXT NOT NULL`, `consentimento_texto TEXT NOT NULL`,
   `consentimento_em TIMESTAMPTZ NOT NULL`, `consentimento_ip TEXT NOT NULL`, `criado_em`,
   `atualizado_em`; índice único em `lead_id`; índice de listagem por `status, criado_em DESC`.
   Teste estático no molde do `migracao005.test.ts`.
2. Domínio `src/features/avaliacao/`: tipos (`Avaliacao`, `Identificacao`, `StatusAvaliacao`),
   schema Zod da entrada, `textoConsentimentoAvaliacao(identificacao)` (client-safe, a tela mostra
   o mesmo que fica gravado) e `resumo(avaliacoes, doArquivo)` puro (média com 1 casa e contagem).
3. **Filtro automático** (`filtroComentario.ts`, puro, com teste): devolve `publicado` ou
   `pendente` + motivo. Cai em `pendente` com link (`http`, `www.`, QUALQUER domínio, inclusive
   disfarçado como `golpe . com`, `golpe(ponto)com` ou `golpe。com`), e-mail, telefone, 3 linhas em
   branco seguidas, CAPS em mais de 70% do texto, ou palavra da lista de baixo calão (lista curta,
   em arquivo próprio, sem palavrão escrito no teste principal; pega grafia espaçada, cortada e com
   dígito no lugar da letra). **Tamanho não é regra do filtro**: o Zod recusa acima de 400
   caracteres antes, com 400 na rota — regra de tamanho aqui seria código morto.
4. Store `AvaliacaoStore` (porta + arquivo em dev + Postgres): `salvar(lead, dados)` (upsert por
   `lead_id`), `doLead(leadId)`, `listarPublicadas(limite)`, `listarTodas()` (admin),
   `trocarStatus(id, status)`, `resumoContagem()`.
5. Casos de uso: `avaliar` (valida, monta consentimento com IP e data, aplica o filtro, grava,
   devolve o resumo) e `moderar` (admin muda o status, devolve auditoria `avaliacao.status`).
6. Rotas: `POST /api/avaliacao` (exige cookie `crm_demo`, lê o e-mail do token, acha o lead, rate
   limit 5/30 min por lead), `GET /api/avaliacoes` (público, cache 60 s) e
   `GET|PATCH /api/admin/avaliacoes` (com `exigirAdmin`). Contrato exato no 00-PLANO.
7. Aviso por e-mail ao fundador (reusa o módulo da O7): estrelas, situação (`publicado`/`pendente`)
   e link do `/admin`. **Sem nome, sem e-mail e sem o texto do comentário.**
8. RUNBOOK: seção da migração 006 (rodar ANTES do deploy) + como moderar; README atualizado.

## Pronto quando
- [ ] Testes: cada regra do filtro (link e disfarces, e-mail, telefone, CAPS, palavrão, texto normal);
      upsert de uma avaliação por lead; `nome_creci` sem nome no lead → 409; sem cookie → 401;
      cookie de lead excluído → 401; rate limit; `GET /api/avaliacoes` não devolve nome de quem
      escolheu anônimo nem texto de `pendente`/`recusado`; média com o arquivo somado; auditoria
      sem PII; exclusão do lead leva a avaliação junto.
- [ ] `tsc` + testes verdes; nenhum arquivo > 300 linhas nas áreas vigiadas.
