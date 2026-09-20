# O11 · ESTADO — Gerador de orçamento no painel

## Status das subs
| Sub | Trilha | Status | Commits | Revisão cética |
|-----|--------|--------|---------|----------------|
| S1 — Modelo, cálculo e API | A | ⬜ | — | |
| S2 — Painel | A | ⬜ | — | |
| S3 — Documento A4 e demo | B | ✅ | branch `onda-11/b-doc` | pendente (rodar antes do merge) |

## Verificação (S3, 2026-09-20)
- `tsc` limpo · **1048 testes** (105 arquivos, +35 desta sub) · `next build` verde, rota
  `/admin/orcamento/[id]` em 9,58 kB · nenhum arquivo novo acima de 190 linhas.
- Dev server com sessão de admin de verdade: `/admin/orcamento/exemplo` desenha a folha inteira
  (marca, CNPJ, número, validade, cliente, escada, implantação, extras, totais, incluso, franquias,
  anexo datado, condições, condição de fundador, LGPD e rodapé).

## Decisões tomadas

### S3 (trilha B) — documento A4 e telas do demo

- **O documento lê o orçamento, não a tabela viva.** O 00-PLANO decidiu que o orçamento guarda o
  preço do dia; ler `tabela.ts` na hora de imprimir faria proposta antiga mudar sozinha. Todo
  número da folha vem do DTO, e a única amarra com a trilha A é `tabelaDaTrilhaA.ts` (duas funções,
  com o import comentado para quem quiser trocar por leitura direta da tabela depois do merge).
- **A API precisa mandar `inclusos` e `franquias`** (o que cada nível inclui e a franquia com o
  preço do excedente, gravados na emissão como o preço). Enquanto não vierem, os dois blocos
  mantêm o título e caem numa frase neutra, em vez de sumir do papel.
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
  nome de plano "Pro"/"Ultra" e múltiplo de custo na tela de custos.

## Pendências fora de escopo

- **Datas do anexo e condições comerciais precisam do ok do fundador**: os meses das entregas, a
  ausência de fidelidade no mensal com 30 dias de aviso e a devolução dos dados em 30 dias foram
  escritos de forma conservadora, mas são compromisso de contrato.
- **Unidade monetária**: a folha assume reais (179 = R$ 179,00). Se a trilha A gravar centavos,
  muda `formato.ts` em uma linha.
- **"Baixar PDF" depende do diálogo do navegador**: no Safari do iPhone o caminho é "Compartilhar",
  não "Salvar como PDF".
- Enviar a proposta por e-mail pelo sistema segue fora (o fundador baixa e manda no WhatsApp).
