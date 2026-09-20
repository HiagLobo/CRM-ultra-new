# O10 · ESTADO — Avaliação com estrelas dentro do demo

## Status das subs
| Sub | Trilha | Status | Commits | Revisão cética |
|-----|--------|--------|---------|----------------|
| S1 — Modelo e API | A | ⬜ | — | |
| S3 — Painel | A | ⬜ | — | |
| S2 — Convite no demo e vitrine | B | ✅ | `onda-10/sub-S2` + correções | 🚨 reprovado → corrigido |

## Decisões tomadas

### S2 (trilha B) — leitura do contrato e escolhas de tela

- **A média e a contagem são as do servidor.** O contrato diz que `media`/`quantas` do
  `GET /api/avaliacoes` **já somam arquivo + banco**; o cliente usa o número como veio. Somar de
  novo contaria os três do arquivo duas vezes. `quantas: 0` cai na média do arquivo.
- **`comentarios` da API é só do banco.** Os três do arquivo entram primeiro na vitrine, depois
  até 12 do banco (o teto do contrato é reforçado no cliente).
- **Nenhuma opção de identificação vem marcada.** Mesma regra do cadastro (O1·S2): consentimento
  pré-marcado não é consentimento. Sem escolha, o envio explica o que falta.
- **O texto do consentimento mora em `identificacao.ts`** (puro, testado) e é exatamente o que a
  tela mostra. A trilha A precisa carimbar **este mesmo texto** no registro — se mudar de um lado,
  muda dos dois.
- **Status desconhecido no 200 conta como `publicado`**: a nota entrou de qualquer jeito.
- **401 e 409 sem corpo também são tratados pelo código HTTP** (não só pelo campo `erro`).
- **Posição do convite**: canto inferior direito, na mesma faixa do guia (acima do botão Guia) e
  some quando guia, boas-vindas ou tour estão abertos — nunca dois cartões empilhados, nunca por
  cima da faixa do demo (que fica no fluxo, no topo) nem da barra de abas do celular.
- **Relógio**: conta só com a aba visível, salva a cada 15 s, ao esconder a aba, ao sair da página
  e ao trocar de tela do demo. Storage `crm_avaliacao` guarda **só** `segundos`, `dispensado` e
  `respondido` — nenhum campo de pessoa.
- **"Agora não" vale para as próximas visitas também** (F1: "uma vez por pessoa"). O link
  "Avaliar o demo" no Guia abre o formulário direto e **não** desfaz a dispensa: quem pediu para
  não ser incomodado continua sem o convite automático.

### S2 — correções da revisão cética

- **Travessão fora do texto de tela.** O convite perdeu o único que tinha. Os textos de
  consentimento, os rótulos das estrelas e as mensagens da API estão cobertos por teste
  (`identificacao.test.ts`, `Estrelas.test.ts`).
- **Empilhamento.** O modal ganhou camada própria (`z-index: 310` no invólucro, dentro da
  `src/components/avaliacao/**`): acima do botão Guia e do painel do guia (250) e das boas-vindas
  (300), abaixo do tour (400). Antes abria por baixo do guia, porque a moldura do acesso é 200.
- **Duas abas.** A regra do convite lê o storage **na hora** a cada conferência, em vez de uma
  cópia do início: dispensar ou avaliar numa aba esconde o cartão na outra em até 15 s.
- **Foco do diálogo.** `useFocoModal`: foco no primeiro controle, Tab preso dentro do cartão e
  foco devolvido ao elemento de origem quando fecha.
- **`lerResumo` recusa média fora de 0 a 5** (resposta quebrada não vira "12,0 de 5" na tela).
- **Vitrine**: o teto de 12 passou a ser do **total** na tela (os três do arquivo nunca caem) e
  ids repetidos da API não geram chave repetida no React.
- **401 deixou de ser beco sem saída**: o erro leva o link para a landing com o
  `PARAM_ACESSO`, que já abre o "Entrar" explicando a sessão vencida (O9·S2).
- **Aviso do 409** some quando a pessoa troca a identificação; setas do grupo de estrelas seguem
  o padrão WAI-ARIA (direita/baixo avançam); o grupo aponta o erro por `aria-errormessage`.

## Pendências fora de escopo

- `src/lib/regressao.test.ts` lista as áreas onde a regra das 300 linhas é cobrada
  (`AREAS_DAS_ONDAS`) e **não inclui** `src/components/avaliacao/` nem `src/components/guia/`.
  Todos os arquivos novos da S2 estão abaixo de 230 linhas, mas a guarda não vigia a pasta. O
  arquivo é da trilha A (`src/lib/**`) — incluir as duas pastas na lista fica para quem fechar a onda.
- A conferência no navegador da S2 depende da API da trilha A; até ela subir, o `GET
  /api/avaliacoes` responde 404, a vitrine fica com os três do arquivo (comportamento correto) e o
  DevTools mostra o 404 da rede — nada escrito pelo nosso código.
- Quem abre o formulário pelo cartão e fecha sem enviar não é incomodado de novo **naquela tela**;
  ao trocar de tela do demo o componente remonta e o cartão pode voltar. Transformar isso em
  memória de visita exigiria um terceiro sinal no storage — fica para o fundador decidir.
- O texto do consentimento está duplicado entre as trilhas (cliente e servidor), preso por teste
  golden dos dois lados. Na integração, `identificacao.ts` passa a importar do módulo canônico da
  trilha A e o golden continua valendo.
