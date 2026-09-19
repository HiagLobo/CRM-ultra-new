# O9 · ESTADO — Cadastro único, "Já tenho cadastro" e conferência do CRECI

## Status das subs
| Sub | Trilha | Status | Commits | Revisão cética |
|-----|--------|--------|---------|----------------|
| Base (orquestrador) | — | ✅ | `cafc8f1` + `4d1feaf` + `4756653` (emenda do contrato) | — |
| S1 — Regras do cadastro | A | ✅ | `aed2249` + `dfb8318` | **reprovada** na 1ª versão (não seguia a emenda: e-mail existente sem envio respondia 202) → corrigida, com mais 4 baixos (corrida do `existente`, conferência limpa na mesma escrita, `switch` exaustivo, testes) |
| S3 — Painel: conferir CRECI | A | ✅ | `dc8e16b` + `4571b54` | aprovada (1 médio: foco e anúncio no BlocoCreci; 6 baixos) → todos corrigidos |
| S2 — Telas de acesso | B | ✅ | `92a28b6` + `e3dab90` | aprovada (1 médio: resposta atrasada levava à tela errada; 5 baixos + lacuna do contrato) → todos corrigidos |
| Integração | — | ✅ | `68e950c` + `dd75eac` + este | comentário do `LIMITE_ENVIOS_DIA`, ESTADO e INDEX |

## Verificação (2026-09-19)
- `tsc` limpo · **793 testes** (79 arquivos) · `next build` verde · nenhum arquivo > 300 linhas nas áreas vigiadas.
- Smoke da API ponta a ponta (dev, store em arquivo, e-mail em modo dev) — **19/19**: nome sem
  sobrenome 400 · CRECI sem UF 400 · cadastro novo 200 `existente:false` · verify com cookie ·
  WhatsApp repetido 409 com dica `m•••••e@exemplo.com` · CRECI repetido (`PE 11111` ≡
  `CRECI-PE 11.111-F`) 409 sem dica · e-mail existente 200 `existente:true` **sem mexer no WhatsApp**
  · código errado com atualização não aplica nada · código certo aplica nome e WhatsApp e carimba o
  último acesso · entrar 404 `sem_cadastro` / 200 e o código libera o demo · PATCH conferência 200 /
  401 sem sessão · CSV com `creci_conferencia;ultimo_acesso_em` · DTO sem hash/IP/consentimento.
- Navegador (desktop 1366 e celular 390): Estado pré-escolhido pelo DDD, aviso de WhatsApp repetido
  com "Entrar com esse e-mail", Entrar com "Não achamos… Quero me cadastrar", `/?acesso=necessario`
  abre no Entrar, painel com nome em destaque e ✓ do CRECI, ficha com "Conferir no CRECI-PE"
  (busca oficial) / Copiar número / Confere · Não confere · Desfazer. 0 estouro lateral, 0 exceções JS.
- Crawl headless de **48 rotas**: 0 erros · roteiro **celular 390 px**: 20/20.
- Postgres de verdade (PGlite): 001–004 + leads repetidos + **005 duas vezes** + as 3 consultas do
  RUNBOOK 3.10 → 4 colunas, 2 índices, repetido listado, dados intactos.

## Decisões tomadas
- **CRECI repetido sem dica** (o CRECI é público; a dica exporia o e-mail do corretor a quem digitar
  o CRECI dele). WhatsApp repetido com dica mascarada (F1); `null` quando o dono não tem e-mail.
- **UF obrigatória** no cadastro público; chave do CRECI = UF + número + categoria (ausente = F).
  Formulário: Estado (pré-escolhido pelo DDD até a pessoa mexer) + Número.
- **E-mail existente não regrava nada no pedido**: vira "entrar" (`existente: true`); nome/WhatsApp/
  CRECI novos viajam no verify e só valem depois do código certo, campo a campo, pulando colisão com
  outro lead (`naoAtualizados`); consentimento recarimbado só se algo mudou; CRECI novo limpa a
  conferência **na mesma escrita**.
- **E-mail existente sem envio → 503 `envio_indisponivel`** (emenda): nada foi gravado, então não dá
  para dizer "recebemos seus dados". O 202 ficou só para e-mail novo.
- **Corrida de criação**: o pedido que perde grava só o código e responde `existente: true`.
- **Checagens depois do rate-limit** (cada consulta gasta vaga); unicidade no app, sem índice UNIQUE.
- **`registrarAcesso` à prova de falha**: sem a coluna, loga `db:42703` e o login segue.
- **Admin**: conferência em lead sem CRECI → 409 `sem_creci`; auditoria `lead.creci {id, resultado:
  conferido|nao_confere|desfeita}`; "ocupado" virou conjunto de ids (fechar A nunca libera B).
- **CRECI legado**: sigla de UF única no texto → essa UF; senão UF "provável" pelo DDD. TO não tem
  busca direta (a ficha avisa).
- **Telas**: `/login` abre com "Entrar com meu e-mail"; o aviso de acesso vencido some ao fechar o
  modal; resposta atrasada nunca troca a tela; a Política lista nome, CRECI + estado (com a
  conferência manual) e o último acesso.

## Pendências fora de escopo
- **Fundador — publicação**: rodar `migrations/005-cadastro-unico.sql` no Neon **antes** do deploy
  (RUNBOOK 3.10).
- **Fundador — DNS/e-mail**: excluir a zona antiga no registro.br (a.sec/c.sec.dns.br ainda
  respondem e o 1.1.1.1 gruda nela) + limpar o cache da Cloudflare; publicar o DKIM do Google
  (`google._domainkey`) na Vercel; `rua` no DMARC; Click/Open tracking do Resend desligados;
  alias `acesso@` para o `EMAIL_FROM`.
- **Risco aceito (F1/F2 "barrar sempre")**: o cadastro novo não precisa confirmar o e-mail para
  "ocupar" um WhatsApp/CRECI — alguém pode cadastrar o CRECI de outro corretor e travá-lo.
  Mitigação: **ligar o Turnstile em produção**; o fundador exclui o cadastro falso no painel.
- CRECI de lead anterior à O7 gravado cru não é achado pela trava de repetido (o selo do painel acha).
- Corrida checar → gravar pode gerar repetido sob concorrência (sem UNIQUE, por decisão); o selo cobre.
- RUNBOOK §3 ainda descreve o Resend em `mail.crmultra.com.br`; o real é a raiz `crmultra.com.br`.
- Contato do site/Reply-To ainda em `safeguardianrecife.com` (pergunta ao fundador) e razão social
  diferente da Receita ("SAFE GUARDIAN LTDA").
- A gaveta do admin é `aria-modal` mas não prende o foco (anterior à O9).
