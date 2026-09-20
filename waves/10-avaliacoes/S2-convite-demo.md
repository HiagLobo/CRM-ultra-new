# O10 · S2 — Convite no demo e vitrine na página inicial

## O que entrega (negócio)
Depois de uns 4 minutos rodando o demo, o corretor recebe um convite discreto para avaliar, vê a
contagem subir com a nota dele e decide como quer aparecer. Na página inicial, a média e os
comentários novos aparecem junto com os três que já existem.

## Fazer
1. **Relógio do convite** (`tempoNoDemo.ts`, puro, com teste): soma só o tempo com a aba visível
   (`visibilitychange`), em qualquer painel do demo; dispara em **4 minutos**. Guarda o estado em
   `localStorage` (`crm_avaliacao`): `dispensado`, `respondido` ou o tempo acumulado. Nunca guarda
   PII. Respeita `prefers-reduced-motion` na animação de entrada.
2. **Convite** (`ConviteAvaliacao.tsx`): cartão discreto no canto inferior, com "Avaliar o demo" e
   "Agora não". "Agora não" não volta a aparecer nesta visita; um link no Guia permite reabrir.
3. **Formulário** (`ModalAvaliacao.tsx`): 5 estrelas clicáveis (e pelo teclado, com `radiogroup`),
   comentário opcional (contador até 400), escolha de identificação em 3 opções (nome + CRECI, só
   nome, anônimo) mostrando exatamente o texto do consentimento que será gravado, e o botão
   "Enviar avaliação". Erros da API no lugar certo; 409 `sem_nome` cai para anônimo com aviso.
4. **Depois de enviar**: agradecimento com a média e a contagem novas ("sua nota entrou: agora são
   N avaliações, média X"), e aviso quando o texto ficou para conferência (`pendente`).
5. **Vitrine** (`Prova.tsx`): busca `GET /api/avaliacoes` no cliente, **começando pelos três do
   arquivo** (sem tela vazia nem pulo de layout) e somando o que vier do banco: média, contagem e
   até 12 comentários. Falha de rede: fica com os três do arquivo, sem erro na tela.
6. Celular 390 px: convite e formulário sem estouro lateral, sem cobrir a barra do demo.

## Pronto quando
- [ ] Testes das funções puras: relógio (aba escondida não conta, 4 min dispara, dispensa e
      resposta não repetem), montagem do corpo do POST, leitura de cada resposta da API, soma
      arquivo + banco.
- [ ] `tsc` + testes verdes; conferência no navegador (desktop e 390 px) com o servidor da trilha A.
