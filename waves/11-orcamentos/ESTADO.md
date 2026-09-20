# O11 · ESTADO — Gerador de orçamento no painel

## Status das subs
| Sub | Trilha | Status | Commits | Revisão cética |
|-----|--------|--------|---------|----------------|
| S1 — Modelo, cálculo e API | A | ✅ | `onda-11/sub-S1` + `correcoes da revisao` | 🚨 REPROVADO na 1ª revisão: o **anual furava o piso** (o teto era checado no mensal) e o `lpad` do Postgres **truncava** o número 1000. Corrigido, com teste para cada achado. |
| S2 — Painel | A | ⬜ | `onda-11/sub-S2` | 🚨 REPROVADO na 1ª revisão: o erro dos extras era calculado e jogado fora, o diálogo abria sem foco e a troca de situação não anunciava nada. Correções em andamento. |
| S3 — Documento A4 e demo | B | ⬜ | — | |

## Decisões tomadas
- **Implantação com entrada e saldo** (fundador, 2026-09-20, substitui a amortização): é a
  personalização do software para aquela empresa, mais migração e treinamento. **Entrada na
  assinatura (padrão 50%, `entradaPct` de 10 a 100 por orçamento) e saldo na conclusão.** Não é
  diluída em 12 meses e não volta na saída. O centavo quebrado da divisão fica na **entrada**.
  **Não há multa de saída** em nenhum plano; no mensal, aviso por escrito com 30 dias.
- **O piso vale sobre o que o cliente PAGA** (achado da revisão): o anual dá 12 meses pelo preço de
  10, então o efetivo é `mensal × 10 ÷ 12` e é ESSE número que é comparado com o piso. Antes, 10
  assentos Pro com 41,37% no anual passavam a R$ 70,84 efetivos, contra um piso de R$ 85,00. Com a
  correção, o teto do desconto no anual cai para 29,65% (10 Pro) e 56,25% (2 Ultra).
- **O desconto do anual vale só na linha dos assentos** (decisão): consumo medido (IA excedente,
  Radar, bureau, baixa extra) é pago por uso e não ganha dois meses de graça. Fórmula:
  `ano = assentos com desconto × 10 + extras mensais × 12`, e `economia = assentos × 2`.
- **O piso é a MÉDIA do nível na conta**, não o preço de cada degrau da escada (decisão, mantida
  como está). Cobrar degrau a degrau limitaria o desconto a ~10% numa conta grande e inviabilizaria
  negociação de volume. Consequência conhecida, registrada de propósito:

  | Conta | Desconto | Faixa de 100+ fica em | Média do nível |
  |---|---|---|---|
  | 600 assentos Pro | 13,05% | ~R$ 82,60 (abaixo do piso) | R$ 85,00 (exatamente no piso) |

  Ou seja: num contrato grande, os assentos da última faixa saem abaixo de R$ 85,00 desde que a
  média do nível fique no piso. É a leitura de "preço efetivo por assento" do 00-PLANO.
- **Escada com níveis misturados**: os assentos **Ultra ocupam as primeiras posições** da escada e os
  Pro seguem depois. O 00-PLANO não diz a ordem numa conta misturada; esta é a leitura consistente
  com F3 (ancorar alto, com margem para descontar) e a única determinística. Com 3 Ultra + 5 Pro dá
  R$ 1.522,00 (2x299 + 1x229 + 5x139).
- **A tabela já é a ancorada** (F3): `tabela.ts` traz os valores do 00-PLANO e o cálculo **não**
  multiplica nada por 1,2 (ancorar de novo dobraria a âncora).
- **Implantação de imobiliária acima de 49 assentos**: vale a faixa de R$ 2.990 (o 00-PLANO só
  escreve "de 10 a 49"). Inventar uma faixa a mais seria escrever preço fora da decisão do fundador.
- **Recusa do cálculo = 409**, com código próprio: `abaixo_do_piso` (com `nivel`, `piso` e `efetivo`),
  `assentos_abaixo_do_minimo` (com `minimo` e `assentos`) e `sem_assentos`. É conflito de regra, não
  corpo malformado, como `fora_da_fila` no PATCH do lead. O Zod continua devolvendo 400.
- **Condição de fundador** só isenta a implantação (está escrito no 00-PLANO). "Ultra pelo preço do
  Pro" continua sendo negociação por desconto, com o piso valendo.
- **Extras**: consumo (IA, reunião, Radar, bureau, baixa) entra como **mensal**; pacote, migração de
  lote e turma extra como **cobrança única**, em total separado do mensal.
- **DELETE de orçamento** também é auditado (`orcamento.excluido { id }`): é ação material do admin.
- **Cliente no DTO**: nome, e-mail e telefone (a S3 imprime os três no documento). Nunca
  consentimento, IP ou hash do código.
- **Integração com a trilha B (pedido do orquestrador)**: `GET /api/admin/orcamentos/[id]` devolve o
  registro **inteiro** mais os apelidos da folha, sem renomear nada: `situacao` (código) e
  `situacaoRotulo`, `validoAte`, `publicoRotulo`, `assentos[]`, `extras[]`, totais também em reais
  (`mensal`, `anual`, `implantacao`, `economiaAnual`), `anual`, `descontoPct`, `condicaoFundador`,
  `unidades`, `inclusos` e `franquias`. O `publico` segue sendo o **código** (o painel usa assim); o
  rótulo está em `publicoRotulo`.
- **`inclusos` e `franquias` são texto do dia**: ficam gravados em `condicoes` na emissão, e o
  documento nunca os lê da tabela de hoje. Radar e baixas automáticas só aparecem quando há assento
  Ultra na conta.

## Pendências fora de escopo
- `src/components/Icon.tsx` não tem ícone de lixeira nem de cópia (`trash-2`, `copy`). A lista de
  orçamentos usa `minus` e `layers`; trocar quando alguém puder acrescentá-los ao mapa de ícones.
- Enviar o orçamento por e-mail pelo sistema continua fora (o fundador baixa e manda no WhatsApp).
- Reajuste anual e amortização da implantação são texto no documento, não cálculo no sistema.
