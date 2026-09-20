# O11 · ESTADO — Gerador de orçamento no painel

## Status das subs
| Sub | Trilha | Status | Commits | Revisão cética |
|-----|--------|--------|---------|----------------|
| S1 — Modelo, cálculo e API | A | ✅ | `onda-11/sub-S1` | aprovada: piso travado no servidor, auditoria sem dinheiro |
| S2 — Painel | A | ✅ | `onda-11/sub-S2` | aprovada: a tela nunca refaz conta nem escreve preço |
| S3 — Documento A4 e demo | B | ⬜ | — | |

## Decisões tomadas
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
