# O10 · PLANO — Avaliação com estrelas dentro do demo

## Decisões do fundador (2026-09-19)
| # | Decisão |
|---|---------|
| F1 | O convite para avaliar aparece **depois de ~4 minutos navegando** no demo, uma vez por pessoa, e dá para dispensar. |
| F2 | O comentário **publica direto**, sem aprovação prévia (com as proteções automáticas do orquestrador). |
| F3 | Quem avalia escolhe: **nome + CRECI**, **só o nome** ou **anônimo**. |
| F4 | As três avaliações atuais **continuam no arquivo** (`src/content/depoimentos.ts`); as novas vêm do banco e o site soma as duas fontes. |
| F5 | Motivo do fundador: 3 avaliações parecem poucas, e ver a contagem subir com a própria nota tem peso. |

## Decisões técnicas do orquestrador
- **Só quem tem o demo liberado avalia**: o cookie `crm_demo` carrega o e-mail já verificado, e a
  avaliação é gravada no lead daquele e-mail. Sem cookie válido, 401. Isso também dá o nome e o
  CRECI sem pedir de novo.
- **Uma avaliação por lead**, editável (a pessoa pode mudar a nota ou o texto). Índice único por
  `lead_id`.
- **Publica direto, com rede de proteção** (F2): o comentário vai ao ar na hora, MENOS quando o
  filtro automático pega link, e-mail, telefone, texto gigante ou palavrão — aí entra como
  `pendente` e o painel mostra para o fundador decidir. Nota e contagem **sempre** entram na hora.
- **Remoção em 1 clique** no painel (`publicado` → `recusado`), sem apagar o registro (a nota
  continua contando, o texto some do site).
- **Aviso por e-mail** ao fundador quando uma avaliação é publicada ou cai em `pendente`: só
  estrelas, situação e o link do `/admin`, **sem nome e sem o texto** (mesma regra da O7).
- **A nota publicada é a que a pessoa deu.** Nada de filtrar por nota: 4 estrelas aparece igual.
- **LGPD**: o texto do consentimento escolhido (nome+CRECI / nome / anônimo) é gravado com data e
  IP, como no cadastro; excluir o lead apaga a avaliação (`ON DELETE CASCADE`); a pessoa pode
  trocar para anônimo reenviando o formulário.
- **Rótulo honesto**: continua "Quem testou a demonstração". Quem avalia está avaliando o demo.
- **Ordem de publicação**: a `006` só cria tabela e índices → **roda ANTES do deploy**.

## Contrato da API
**`POST /api/avaliacao`** (exige cookie `crm_demo` válido) — body
`{ estrelas: 1..5, comentario?: string(≤400), identificacao: "nome_creci" | "nome" | "anonimo" }`
- `200 { ok: true, status: "publicado" | "pendente", resumo: { media: number, quantas: number } }` — o `resumo` **já vem somado com o arquivo**, igual ao GET: quem mostra usa o número como chega
- `401 { ok: false, erro: "sem_acesso" }` (sem cookie ou cookie vencido)
- `400 { ok: false, erro: "dados_invalidos", mensagem: "dados inválidos", campos }` · `429 { ok: false, erro: "limitado", mensagem }` (código em snake, como o resto do projeto)
- `409 { ok: false, erro: "sem_nome" }` — pediu `nome_creci`/`nome` e o lead não tem nome gravado
  (lead antigo, anterior à O9): a tela cai para anônimo e avisa.
- `429` rate-limit (5 envios por lead a cada 30 min) · `500` como sempre.

**`GET /api/avaliacoes`** (público, sem cookie)
- `200 { media: number, quantas: number, comentarios: [{ id, estrelas, texto, nome?, creci?, em }] }`
- `media` e `quantas` somam o arquivo (F4) e o banco, contando **toda** avaliação válida,
  inclusive anônima e a que está `pendente`. `comentarios` traz só as `publicado` **com texto**, no
  máximo 12, da mais recente para a mais antiga; `nome`/`creci` só conforme a escolha da pessoa.
- Cache de 60 s na borda (`s-maxage=60, stale-while-revalidate=300`).

**Admin** (`exigirAdmin`)
- `GET /api/admin/avaliacoes` → lista com tudo (inclusive quem deu, para o fundador conferir).
- `PATCH /api/admin/avaliacoes` `{ id, status: "publicado" | "recusado" }` → 200; auditoria
  `avaliacao.status { id, de, para }`, sem texto e sem nome.

## Trilhas
| Trilha | Subs | Pode tocar |
|--------|------|------------|
| A — Modelo, API e painel | S1 → S3 | `migrations/006-*.sql`, `src/features/avaliacao/**` (novo), `src/lib/{leadStore*,avaliacaoStore*}.ts`, `src/app/api/avaliacao/**`, `src/app/api/avaliacoes/**`, `src/app/api/admin/avaliacoes/**`, `src/app/admin/**`, `src/lib/emailAviso*.ts`, `waves/RUNBOOK.md`, `README.md` |
| B — Convite no demo e vitrine | S2 | `src/components/avaliacao/**` (novo), `src/components/guia/**` (onde mora o banner do demo), `src/app/(paineis)/**` só para montar o convite, `src/components/landing/Prova.tsx`, `src/content/depoimentos.ts` (só para somar com o banco) |

## Não fazer
- Avaliação de quem não tem o demo liberado, ou por link público.
- Nota decimal, "curtir" avaliação, resposta pública do fundador, foto de perfil.
- Publicar nome ou CRECI sem a escolha explícita da pessoa.
- Mexer no funil, no cadastro ou no envio de código.
