# O11 · S3 — O documento A4 e o acerto das telas do demo

## O que entrega (negócio)
Uma proposta com a cara do CRM Ultra, pronta para virar PDF em dois cliques e ser mandada no
WhatsApp, sem nada que o cliente possa usar contra você depois.

## Fazer
1. **Página `/admin/orcamento/[id]`** (exige `exigirAdmin`): o documento em A4.
   - **Na tela**: cabeçalho do painel com "Voltar", "Baixar PDF" (chama `window.print()`) e a
     situação atual.
   - **No papel** (`@media print`): só o documento. Sem menu, sem botão, sem fundo escuro, margem de
     15 mm, quebra de página limpa (`break-inside: avoid` nos blocos), tamanho A4 (`@page`).
2. **Conteúdo do documento**, nesta ordem:
   - marca, razão social e CNPJ (`brand`), número do orçamento, data e **validade**;
   - cliente (nome do lead, e-mail e telefone) e o público;
   - **tabela dos assentos**: nível, quantidade, preço por assento e total, com a escada explicada
     em uma linha ("cada assento entra pela faixa dele");
   - **implantação** com o mesmo destaque do mensal, dizendo que é cobrada no go live e amortizada
     em 1/12 por mês;
   - extras contratados, se houver;
   - **totais**: mensal, do ano e, no anual, a economia dos 2 meses;
   - **o que está incluso** em cada nível contratado, em lista curta (vem da `tabela.ts`);
   - **franquias de uso** e o preço do excedente, em texto claro;
   - **anexo datado**: o que existe hoje e o que entra em qual mês, com a frase do mês grátis por
     item atrasado (texto vem de um módulo próprio, fácil de atualizar a cada onda);
   - **condições**: pagamento, prazo, saída, amortização da implantação, e a condição de fundador
     quando marcada;
   - **LGPD**: quem é operador e quem é controlador, e que a carteira é exportável;
   - rodapé com "proposta comercial, não é contrato" e o contato da marca.
   - **Nenhuma promessa de resultado** e nenhuma palavra "completo" enquanto o produto for
     demonstração.
3. **Ajustes nas telas do demo** (decisão F5, com a rede fictícia continuando coerente):
   - `src/app/ceo/planos/page.tsx`: trocar os valores para que **não espelhem a tabela real** do
     CRM Ultra (outros números, outra granularidade) e conferir que nenhum nome de plano colida com
     "Pro" e "Ultra";
   - `src/app/ceo/custos/page.tsx`: tirar a linha que entrega a margem ("mensalidade mínima cobre
     8×") e trocar por uma leitura que faça sentido para a rede fictícia, sem revelar múltiplo de
     custo.
4. Conferir no navegador o resultado impresso (visualização de impressão), em uma e em duas páginas.

## Pronto quando
- [ ] Testes: o documento tem os blocos obrigatórios (número, validade, CNPJ, totais, anexo datado,
      LGPD, aviso de proposta) e não tem promessa de resultado; 401 sem sessão; o que o demo mostra
      não bate com a tabela real (teste de guarda comparando com `tabela.ts`).
- [ ] `tsc` + testes verdes; impressão conferida; sem travessão em texto de tela.
