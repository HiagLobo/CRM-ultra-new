# O7 · ESTADO — Prontidão de lançamento

## Status das subs
| Sub | Trilha | Status | Commits | Revisão cética |
|-----|--------|--------|---------|----------------|
| S3 — CRECI e remetente | A | ✅ | `e541fab` | aprovada (4 achados baixos) |
| S1 — Lead e anti-abuso | A | ✅ | `b9f82a1` + `f3d97a6` | **reprovada** na 1ª versão (produção sem `RESEND_API_KEY` ainda perdia o lead) → corrigida |
| S2 — Diagnóstico e RUNBOOK | A | ✅ | `232b4a8` | aprovada (6 baixos; 3 notas de RUNBOOK aplicadas na integração) |
| S4 — Celular | B | ✅ | `53ab070` + `355751b` | aprovada (4 baixos; setas do tour corrigidas) |
| S5 — Painel de leads | C | ✅ | `ed9b055` + ajuste do cabeçalho no celular | aprovada (5 baixos; utm/ref saneados na integração) |
| Integração | — | ✅ | `bf6ece8` + este | causa única no log, auditoria com causa, `vercel.json` (gru1) |

## Verificação (2026-09-19)
- `tsc` limpo · **400 testes** (41 arquivos) · `next build` verde.
- Crawl headless de **48 rotas** com cookie de demo válido: 0 exceções JS.
- Roteiro **celular 390 px** (CDP, toque): 20/20 — menu do CEO e do franqueado abrem/fecham,
  tours aparecem (CEO, franqueado, Atendimento), aba Perfil clicável, nenhuma tela rola para o lado.
- Smoke ponta a ponta (dev): honeypot não grava · `CRECI-PE 12.345-F` → `PE 12345-F` · telefone
  colado com +55 aceito · utm `insta;=1+1` → `insta11` · admin sem campo sensível · CSV com `;`,
  datas de Recife e telefone `(81) 9…` · exclusão ok.

## Decisões tomadas
- **(S1) Lead nunca some**: falha/timeout (8 s) do Resend, cota diária estourada ou Resend não
  configurado em produção → lead gravado sem código, resposta 202 "recebemos seus dados", log com a
  causa. Reenvio só atualiza as colunas de contato (`atualizarContato`), sem corrida com o admin.
- **(S1) Anti-abuso**: por e-mail 3/30 min, por IP 10/30 min, teto global `LIMITE_ENVIOS_DIA`
  (padrão 90), campo-isca sempre ligado, Turnstile quando as 2 chaves existem (confere hostname).
- **(S1) Aviso de lead novo** (`AVISO_LEADS_EMAIL`): só na 1ª verificação, sem PII, só o link do `/admin`.
- **(S2) Causa segura no log**: `config:VAR`, `email:<erro do Resend>`, `db:<SQLSTATE>`, `rede:<errno>`;
  tabela "causa → o que fazer" no RUNBOOK §6.
- **(S3) CRECI** gravado na forma canônica `[UF ]NÚMERO[-SUFIXO]` (27 UFs, 2–7 dígitos);
  `EMAIL_FROM` aceita `Nome <endereço>`; reply-to = contato da marca.
- **(S5) API do admin** devolve DTO (`LeadAdmin`) montado no domínio — nunca o `Lead` inteiro.
- **(Integração) utm/ref** saneados para `[A-Za-z0-9._-]` (100 caracteres); região `gru1` no
  `vercel.json`.

## Pendências fora de escopo
- Abrir um CSV exportado no Excel do fundador (duplo clique) e conferir colunas/acentos — não dá
  para testar daqui.
- Corridas restantes (baixas): `verificarCodigo` e o `marcarStatus` do admin ainda regravam a linha
  inteira; `DATABASE_POOL_MAX` não é validada; `admin.test.ts` com 291 linhas (perto do limite).
- Tour do Radar no celular pula o passo do botão de créditos (fica fora da faixa com rolagem lateral).
- Política de Privacidade: revisão jurídica (operadores e transferência internacional, prazo de
  retenção, Marco Civil art. 15, consentimento como condição) — já no RUNBOOK §7.
- Rótulos de menu da Vercel/Neon/Resend/registro.br no RUNBOOK §3 seguem as interfaces conhecidas;
  o fundador confirma ao executar.
