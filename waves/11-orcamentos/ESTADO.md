# O11 · ESTADO — Gerador de orçamento no painel

## Status das subs
| Sub | Trilha | Status | Commits | Revisão cética |
|-----|--------|--------|---------|----------------|
| S1 — Modelo, cálculo e API | A | ⬜ | — | |
| S2 — Painel | A | ⬜ | — | |
| S3 — Documento A4 e demo | B | ✅ | branch `onda-11/b-doc` (2 commits) | **reprovada** (4 bloqueadores: "no ar hoje" com entrega do fornecedor, cláusulas de implantação e de saída se contradizendo, cobrança dobrada na saída, blocos obrigatórios com texto de enchimento) → corrigida |

## Verificação (S3, 2026-09-20)
- `tsc` limpo · **1080 testes** (107 arquivos, +67 desta sub) · `next build` verde, rota
  `/admin/orcamento/[id]` em 11 kB · maior arquivo novo: 217 linhas (`textos.test.ts`); o maior de
  produção é `FolhaOrcamento.tsx`, com 212.
- Dev server com sessão de admin de verdade: `/admin/orcamento/exemplo` desenha a folha inteira
  (marca, CNPJ, número, validade, cliente, escada, implantação com total/entrada/saldo, extras,
  totais com o primeiro ano, incluso, franquias, anexo datado, condições, LGPD e rodapé). Conferido
  no HTML: "amortiz" não aparece, "multa" aparece uma vez e é para dizer que não há, e a primeira
  vez que "go live" sai no papel vem com a tradução ao lado.

## Decisões tomadas

### S3 (trilha B) — documento A4 e telas do demo

- **O documento lê o orçamento, não a tabela viva.** O 00-PLANO decidiu que o orçamento guarda o
  preço do dia; ler `tabela.ts` na hora de imprimir faria proposta antiga mudar sozinha. Todo
  número da folha vem do DTO, e a única amarra com a trilha A é `tabelaDaTrilhaA.ts` (duas funções,
  com o import comentado para quem quiser trocar por leitura direta da tabela depois do merge).
- **`inclusos` e `franquias` são obrigatórios no DTO** (o que cada nível inclui e a franquia com o
  preço do excedente, gravados na emissão como o preço). Faltou, o documento é **recusado**: bloco
  obrigatório com frase de enchimento é pior do que não imprimir.
- **Nenhum preço escrito na tela**: teste de guarda recusa `R$ <número>` nos componentes da folha.
- **Impressão é a do navegador** (`window.print()`), sem biblioteca nova. CSS no bloco marcado do
  `globals.css`: A4 com 15 mm, `.orc-naoimprime` some no papel, `.orc-bloco` não parte no meio.
- **O título da aba vira o nome sugerido do PDF** ("Proposta ORC-2026-007.pdf").
- **`/admin/orcamento/exemplo` só fora de produção**, para conferir folha e impressão antes da API.
- **Anexo datado e texto jurídico em módulo próprio** (`anexo.ts`, `legais.ts`): muda a cada onda
  sem tocar em preço. Teste recusa promessa de resultado e a palavra "completo" para o Ultra.
- **Demo (F5)**: a rede fictícia ganhou outra granularidade (unidade com assentos inclusos, corretor
  cobrado por trimestre), outros valores e "Corretor Pro" virou "Corretor Elite"; os agregados
  (MRR, ARR, ARPU, inadimplência, add-ons) foram recalculados para continuarem coerentes.
  `/ceo/custos` perdeu a linha "mensalidade mínima cobre 8×" (virou "base do rateio entre as
  unidades") e o boleto saiu de R$ 1,50, que batia com o excedente de IA da tabela real.
- **Guarda `src/app/ceo/demoNaoEspelhaTabela.test.ts`**: compara os valores das telas de preço do
  demo com a tabela oficial (lida do 00-PLANO e, quando existir, da `tabela.ts`) e recusa colisão,
  nome de plano "Pro"/"Ultra" e múltiplo de custo na tela de custos. Pega preço escrito, calculado
  (`money(179)`), interpolado e concatenado, e tem teste do próprio extrator.

### S3 · correções da revisão (mesma sub, 2º commit)

- **Decisões novas do fundador sobre a implantação**: serviço entregue e personalizado, pago em
  **entrada na assinatura (padrão 50%, editável no painel) e saldo na conclusão (go live)**, nunca
  diluído em 1/12 e **não devolvido** na saída. A API manda
  `implantacao { total, entrada, saldo, entradaPct }` e a folha imprime os três valores.
- **Saída sem multa**, no mensal (30 dias de aviso, sem prazo mínimo) e na condição de fundador
  (12 meses de compromisso, sem multa antes ou depois dos 90 dias). Nenhum valor de multa é
  impresso, porque nenhum foi aprovado.
- **LGPD**: exclusão em até 30 dias nos ambientes de produção e cópias de segurança expirando no
  ciclo normal, em até 35 dias, sem uso. Exportar e apagar pela própria tela virou entrega datada
  no anexo (é o painel do fundador que tem isso hoje, não o do cliente), com o caminho por e-mail
  enquanto não chega.
- **"No ar hoje" só tem o que o cliente pagante usa** (a demonstração navegável e o acesso da
  equipe). Painel de leads com funil e exportação, site com avaliações e moderação são do
  fornecedor: viraram entrega com mês marcado.
- **O rodapé parou de anular o anexo**: saiu "não cria obrigação de resultado para nenhuma das
  partes", ficou "proposta comercial, não é o contrato: fixa preço, prazo e anexo".
- **Conta que não fecha não vira papel**: `conferencia.ts` (`conferirTotais`) recusa linha em que
  quantidade vezes preço não dá o total, soma das linhas diferente do mensal, entrada mais saldo
  diferente da implantação, implantação cobrada onde ela é isenta e nível contratado sem incluso.
  Sem assentos também é recusa. Nesses casos **o botão "Baixar PDF" some**.
- **Totais**: "Total de 12 meses de mensalidade" e, quando há implantação, "Primeiro ano, com a
  implantação" (antes o papel mostrava um primeiro ano 40% abaixo do desembolso real).
- **Impressão**: `print-color-adjust` e o fundo branco agora valem só dentro de `.orc-folha`
  (antes a capa do site saía chapada de indigo), a tabela inteira deixou de ser bloco indivisível
  (o cabeçalho repetido volta a ter função) e o anexo virou um bloco por sub-seção.
- **Demo**: Franquia e Premium mudaram os assentos inclusos, porque R$ 2.150 por 12 assentos dava
  R$ 179,17, em cima da primeira faixa real; churn e movimentos do MRR foram refeitos para bater
  com os preços novos (2 cancelamentos, R$ 2,7 mil).
- **Exemplo**: passou a usar a tabela oficial (escada 179/139/189, implantação de rede
  11.900 + 990 por unidade, excedentes 1,50 · 4,90 · 2,90 · 0,90), para quem confere a folha não
  aprender número errado.

## Pendências fora de escopo

- **Os meses do anexo precisam do ok do fundador**: novembro/2026 (painel do corretor e da
  imobiliária, migração, exportação e exclusão pela tela), dezembro/2026 (IA e reunião),
  fevereiro/2027 (Radar e avaliação) e abril/2027 (locação, painel da rede e site com avaliações).
  Cada item atrasado custa um mês de mensalidade.
- **Condições de pagamento e de saída** já estão no papel como o fundador decidiu (entrada e saldo,
  sem multa, implantação não devolvida). Falta só o contrato repetir o mesmo texto.
- **Unidade monetária**: a folha assume reais (179 = R$ 179,00). Se a trilha A gravar centavos,
  muda `formato.ts` em uma linha.
- **"Baixar PDF" depende do diálogo do navegador**: no Safari do iPhone o caminho é "Compartilhar",
  não "Salvar como PDF".
- Enviar a proposta por e-mail pelo sistema segue fora (o fundador baixa e manda no WhatsApp).
