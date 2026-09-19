# O8 · S2 — Painel: abas do funil, "Hoje", gaveta do lead e "+ Novo lead"

## O que entrega (negócio)
O fundador abre o `/admin`, vê o que precisa fazer hoje, abre um lead, lê o histórico, fala com
ele em um clique, anota, marca a próxima ação e move de etapa — no computador e no celular.

## Fazer
1. **Abas com contagem**: Hoje · Novos · Em contato · Demonstração · Negociação · Clientes ·
   Retomar depois · Perdidos · Todos. Busca continua valendo sobre a aba.
2. **Hoje** (função pura, com relógio injetável e fuso de Recife): próxima ação vencida ou do dia;
   "retomar" com data até hoje; "novo" sem contato criado há 24 h+.
3. **Linha da tabela**: seletor de etapa. Escolher "Retomar depois" abre um mini-formulário (data +
   motivo); "Perdido" pede o motivo (lista: preço, já usa outro CRM, sem interesse, sem resposta,
   outro + texto curto). Selo de e-mail confirmado e WhatsApp/e-mail continuam.
4. **Gaveta do lead** (clicar na linha): contato (WhatsApp, e-mail), nome/canal/origem/datas, etapa,
   próxima ação (data + texto, editar/limpar), **anotações** (lista da mais recente + campo para
   adicionar), e "Excluir (LGPD)" com a confirmação que já existe.
5. **"+ Novo lead"**: formulário (nome, telefone*, e-mail, CRECI, canal*, observação vira a 1ª
   anotação, checkbox obrigatório "a pessoa sabe e concordou em ser contatada"); 409 mostra
   "já existe" com atalho para abrir o existente.
6. Cards do topo coerentes com o funil (ex.: Hoje · Em andamento · Clientes · Conversão).
7. Celular: abas roláveis na horizontal, gaveta em tela cheia, sem estouro lateral.

## Pronto quando
- [ ] Testes das funções puras (Hoje, filtros por aba, contagens, validação do formulário).
- [ ] `tsc` + testes verdes; arquivos de `src/app/admin` ≤ 300 linhas (dividir por responsabilidade).
- [ ] Conferência no navegador (orquestrador): desktop e 390 px.
