# O11 · PLANO — Gerador de orçamento no painel

## Decisões do fundador (2026-09-20)
| # | Decisão |
|---|---------|
| F1 | O painel gera o orçamento: ele preenche os dados e sai uma **página A4 pronta para imprimir** (botão "Baixar PDF" abre a impressão já configurada). Sem biblioteca de PDF nova. |
| F2 | Cada orçamento fica **guardado e ligado ao lead**, com situação (rascunho, enviado, aceito, recusado), para reabrir e duplicar. Migração 007. |
| F3 | **Ancorar 20% acima** da tabela recomendada, com os mesmos pisos: há margem para descontar na negociação. |
| F4 | **A landing continua sem preço.** Os valores vão por orçamento, um a um, para os leads. `Planos.tsx` fica como está. |
| F5 | Ajustar as telas do demo que espelham a tabela real (`/ceo/planos`) e que entregam a margem (`/ceo/custos`). |

## Tabela oficial (é o que o sistema calcula; muda aqui, muda no orçamento)
**Escada marginal por assento**: cada assento entra pelo preço da faixa dele, como imposto de renda.

| Assentos na conta | PRO | ULTRA |
|---|---|---|
| 1º e 2º | R$ 179 | R$ 299 |
| 3º ao 9º | R$ 139 | R$ 229 |
| 10º ao 29º | R$ 119 | R$ 189 |
| 30º ao 99º | R$ 105 | R$ 165 |
| 100º em diante | R$ 95 | R$ 149 |

- **Nível por assento**, não por conta: a mesma empresa pode ter assentos Pro e Ultra, e a faixa de desconto sai do **total** de assentos.
- **Mínimo faturável**: autônomo 1 · imobiliária 3 · rede 5 por unidade ativa.
- **Pisos travados no sistema** (preço efetivo por assento, depois do desconto): **Pro R$ 85 · Ultra R$ 109**.
  O sistema avisa a partir de 15% de desconto e **bloqueia** abaixo do piso.
- **Anual**: 12 meses pelo preço de 10 (16,67%) e implantação isenta.
- **Implantação** (decisão do fundador em 2026-09-20, substitui a amortização): é a personalização
  do software para aquela empresa, mais migração de carteira e treinamento. **Entrada na assinatura
  (padrão 50%, editável no orçamento) e saldo na conclusão da implantação.** Não é diluída em 12
  meses e **não é devolvida** se o cliente sair depois: o serviço já foi entregue. Valores:
  autônomo **R$ 0** · imobiliária até 9 assentos **R$ 1.790** · de 10 a 49 **R$ 2.990** ·
  rede **R$ 11.900 na matriz + R$ 990 por unidade ativada**.

**Franquias de uso inclusas** (por assento/mês, salvo indicação): 25 atendimentos de IA · 2 reuniões
transcritas · 8 consultas de Radar (só Ultra) · 300 baixas automáticas por conta (só Ultra).

**Extras e repasses** (preço fechado em reais, nunca "repasse de custo"):

| Item | Preço |
|---|---|
| Atendimento de IA acima da franquia | R$ 1,50 |
| Reunião transcrita acima da franquia | R$ 4,90 |
| Consulta de Radar avulsa | R$ 2,90 |
| Pacote de 50 consultas de Radar | R$ 119 |
| Pacote de 250 consultas de Radar | R$ 497 |
| Radar avulso numa conta Pro | R$ 99 por assento/mês |
| Análise de crédito com bureau | R$ 89 |
| Baixa automática acima de 300 na conta | R$ 0,90 |
| Migração de lote extra | R$ 1.290 |
| Turma extra de treinamento | R$ 690 |
| Número de WhatsApp oficial adicional | R$ 149/mês |
| Suporte síncrono, 2 h por mês | R$ 290/mês |

**Saída** (decisão do fundador em 2026-09-20): no mensal não há prazo mínimo, basta pedido por
escrito com 30 dias de antecedência. **Não há multa de saída em nenhum plano**: o que sustenta o
compromisso é a implantação já paga, que não volta.

**Condição de fundador** (10 primeiros contratos, marcável no orçamento): preço congelado por 24
meses · pagamento começa no go live · implantação isenta · Ultra pelo preço do Pro por 12 meses ·
saída sem multa nos primeiros 90 dias. Em troca, escrito na proposta: 12 meses contados do go live,
uso do case e depoimento, uma conversa de feedback por mês e uma visita de referência.

## Decisões técnicas do orquestrador
- **Números só no domínio**: a tabela, as franquias e os extras moram em
  `src/features/orcamento/tabela.ts`, puro e testado. Nenhuma tela escreve preço na mão.
- **O orçamento guarda o preço do dia**: ao salvar, os valores usados ficam gravados no registro
  (itens e totais). Mudar a tabela depois **não** altera orçamento já emitido.
- **Numeração** `ORC-AAAA-NNN` por ano, sequencial, gerada no servidor.
- **Sempre ligado a um lead** (`lead_id`, `ON DELETE CASCADE`): excluir o lead pela LGPD leva os
  orçamentos dele junto. Prospect que ainda não é lead entra pelo "+ Novo lead" que já existe.
- **A página de impressão é `/admin/orcamento/[id]`**, com `@media print` em A4, sem menu e sem
  botão no papel. Exige `exigirAdmin`: proposta tem preço e dado de cliente.
- **Conteúdo obrigatório no documento** (CDC art. 31 e 37, e o que a revisão de preço apontou):
  razão social e CNPJ do `brand`; nome do cliente; número e data; **validade** (padrão 15 dias);
  total **mensal** e total do **ano**; implantação em destaque igual ao mensal; o que está incluso
  em cada nível; o **anexo datado** do que existe hoje e do que entra em qual mês, com um mês grátis
  por item atrasado; condições de pagamento e de saída; LGPD (quem é operador e quem é controlador).
  **Nenhuma promessa de resultado.**
- **Ordem de publicação**: a `007` só cria tabela e índices → **roda ANTES do deploy**.

## Contrato da API (admin, todas com `exigirAdmin`)
- `GET /api/admin/orcamentos` → `{ ok, orcamentos: OrcamentoAdmin[] }` (lista, mais recente primeiro).
- `POST /api/admin/orcamentos` → cria. Body: `{ leadId, publico, assentos: { pro, ultra },
  descontoPct?, anual?, implantacaoIsenta?, unidades?, extras?: [{ item, quantidade }],
  condicaoFundador?, validadeDias?, observacao? }` → `201 { ok, orcamento }`.
  `409 { erro: "abaixo_do_piso", piso }` quando o desconto fura o piso. `404` lead inexistente.
- `PATCH /api/admin/orcamentos` `{ id, status: "rascunho" | "enviado" | "aceito" | "recusado" }` → `200`.
  Auditoria `orcamento.status { id, de, para }`, sem valores e sem nome.
- `DELETE /api/admin/orcamentos` `{ id }` → `200`.
- DTO `OrcamentoAdmin`: número, situação, datas, cliente (nome do lead), público, itens com preço
  unitário e total, totais (mensal, anual, implantação), desconto aplicado e piso do plano.
  **Nunca** devolve consentimento, IP ou hash de código do lead.

## Trilhas
| Trilha | Subs | Pode tocar |
|--------|------|------------|
| A — Modelo, API e painel | S1 → S2 | `migrations/007-*.sql`, `src/features/orcamento/**` (novo), `src/lib/{orcamentoStore*,criarOrcamentoStore}.ts`, `src/app/api/admin/orcamentos/**`, `src/app/admin/**`, `waves/RUNBOOK.md`, `README.md` |
| B — Documento e demo | S3 | `src/app/admin/orcamento/**` (novo), `src/app/ceo/planos/page.tsx`, `src/app/ceo/custos/page.tsx`, `src/app/globals.css` (só o bloco de impressão), `src/config/brand.ts` (só leitura) |

## Não fazer
- **Não publicar preço na landing** (`Planos.tsx` continua como está, F4).
- Biblioteca de PDF, gerador de contrato, assinatura eletrônica, cobrança da assinatura.
- Enviar o orçamento por e-mail pelo sistema (por ora o fundador baixa e manda no WhatsApp).
- Preço escrito na tela: tudo sai de `tabela.ts`.
