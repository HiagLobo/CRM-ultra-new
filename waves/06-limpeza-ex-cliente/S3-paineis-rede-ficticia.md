# O6 · S3 — Painéis CEO/franqueado com rede fictícia

## O que entrega (negócio)
O demo do CEO e do franqueado continua mostrando todos os módulos, mas com uma rede fictícia no
papel da imobiliária — e sem os preços, o produto de garantia, os termos comerciais e as empresas
reais herdados do protótipo do ex-cliente.

## Revalidação ao iniciar
- [ ] `src/config/demo.ts` existe (criado na S2)? Senão, criar aqui com o mesmo contrato.

## Pode tocar
- `src/app/ceo/**`, `src/app/franqueado/**`, `src/components/ceo/**`, `src/config/demo.ts`

## Trocas (lista do estudo de 2026-09-18)
1. **Preços do ex-cliente** (a tabela real de planos, adesões e a taxa de antecipação dele) → valores fictícios diferentes, coerentes entre `planos`, `cobrancas`,
   `franqueado`.
2. **Produto de garantia do ex-cliente** (só renomeado pelo sed da O0) e o fiador digital com o nome
   da marca → nome genérico ("seguro-fiança do parceiro", "fiador digital do parceiro"); fechamento
   "conduzido pela marca" → "pela rede"; tirar a rede financiando antecipações e ganhando spread.
3. **Marca do SaaS fazendo papel de imobiliária** ("Matriz CRM Imobiliário Ultra", "Rede Ultra",
   CRECI-J/CNPJ da matriz, "time Ultra", "número da Ultra", "CNPJ Ultra") → `demo.*`.
4. **Domínio não controlado** (`@crmultra.com.br`, "site no ar crmultra.com.br", `dpo@…`,
   `ds-recife.com.br`) → domínio reservado `demo.dominio` (`.example`).
5. **Empresas reais** (uma imobiliária com e-mail em domínio real, incorporadoras e um banco) →
   nomes genéricos de exemplo.
6. **Termos da proposta ao ex-cliente** (TI: fornecedor e banco de horas da proposta; Custos:
   referência à planilha de custos feita para ele) → fornecedor e números fictícios, sem referência à planilha.
7. **Iniciais "AN"** da pessoa real → derivadas do nome da persona; persona CEO única (Marina Duarte)
   também em `acessos` e `relatorios`.
8. **Endereços com número de unidade e CRECIs em formato válido** → visivelmente fictícios.

## Pronto quando
- [ ] grep das trocas 1–8 na área = 0; `demo.*` é a única origem do nome/domínio da rede.
- [ ] `build` + `typecheck` + testes verdes; tour do CEO/franqueado sem passo órfão.
