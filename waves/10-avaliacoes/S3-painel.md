# O10 · S3 — Painel: ver, remover e liberar avaliações

## O que entrega (negócio)
O fundador vê todas as avaliações com quem deu cada uma, tira do site em um clique o que não quiser
e libera o que o filtro automático segurou.

## Fazer
1. **Aba "Avaliações"** no `/admin` (ou seção própria, seguindo o padrão das abas do funil):
   lista da mais recente para a mais antiga com estrelas, trecho do comentário, identificação
   escolhida, situação (`publicado` · `pendente` · `recusado`) e a data.
2. **Ações por linha**: "Tirar do site" (`recusado`), "Publicar" (`publicado`) e, para o que o
   filtro segurou, o motivo em texto ("tem link", "tem telefone"…). Confirmação só na remoção.
3. **Ligação com o lead**: cada avaliação mostra de quem é (nome ou e-mail) e abre a ficha do lead;
   a ficha ganha a linha "Avaliou o demo: ★★★★★ em dd/mm" quando houver.
4. **Cartão no topo**: média e quantidade de avaliações, do mesmo jeito que o site mostra.
5. Celular: lista em cartões, sem estouro lateral.

## Pronto quando
- [ ] Testes: filtro/ordenação da lista, rótulos de situação e motivo, 401 sem sessão nas rotas
      novas, e a ficha do lead mostrando a avaliação.
- [ ] `tsc` + testes verdes; arquivos de `src/app/admin` ≤ 300 linhas; desktop e 390 px conferidos.
