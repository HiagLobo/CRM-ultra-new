# O11 · S2 — Painel: criar, acompanhar e reaproveitar orçamentos

## O que entrega (negócio)
O fundador monta um orçamento em menos de um minuto, vê o total mudar enquanto mexe nos assentos e
no desconto, salva ligado ao lead e acompanha o que foi enviado, aceito ou recusado.

## Fazer
1. **Seção "Orçamentos"** no `/admin`, no mesmo seletor que já tem Leads e Avaliações: lista da mais
   recente para a mais antiga com número, cliente, público, total mensal, situação e validade.
   Abas por situação (Todos · Rascunho · Enviados · Aceitos · Recusados) com contagem.
2. **"+ Novo orçamento"**: escolhe o lead (busca por nome, e-mail ou telefone entre os leads que já
   existem) ou abre o "+ Novo lead" que já existe quando o cliente ainda não está no funil.
3. **Formulário** com cálculo ao vivo (a conta é a função pura da S1, nunca refeita na tela):
   público, assentos Pro e Ultra, unidades (rede), desconto em %, anual sim/não, implantação
   (valor sugerido pelo porte, com opção de isentar), extras com quantidade, condição de fundador,
   validade em dias (padrão 15) e observação livre.
   - o total mensal, o total do ano e a implantação aparecem o tempo todo;
   - **aviso amarelo a partir de 15% de desconto** e **bloqueio com explicação** abaixo do piso,
     mostrando o piso do plano e o preço efetivo por assento;
   - erro do servidor aparece onde o fundador está olhando, não só no topo.
4. **Ações por orçamento**: abrir o documento (`/admin/orcamento/[id]`, a página da S3), marcar
   enviado, aceito ou recusado, duplicar (abre o formulário preenchido com os mesmos dados) e
   excluir com confirmação.
5. **Ficha do lead**: bloco "Orçamentos" com os deste lead (número, total, situação, data) e um
   atalho para criar um novo já com o lead escolhido.
6. Celular 390 px: formulário em uma coluna, lista em cartões, sem estouro lateral.

## Pronto quando
- [ ] Testes das funções puras da tela: montagem do corpo do POST, leitura de cada resposta
      (incluindo 409 abaixo do piso), filtro por aba, rótulos de situação e o resumo do que vai na
      lista.
- [ ] `tsc` + testes verdes; arquivos de `src/app/admin` ≤ 300 linhas; desktop e 390 px conferidos.
