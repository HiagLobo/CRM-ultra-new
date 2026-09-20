# O10 · ESTADO — Avaliação com estrelas dentro do demo

## Status das subs
| Sub | Trilha | Status | Commits | Revisão cética |
|-----|--------|--------|---------|----------------|
| S1 — Modelo e API | A | ⬜ | — | |
| S3 — Painel | A | ⬜ | — | |
| S2 — Convite no demo e vitrine | B | ✅ | `onda-10/sub-S2` | ✅ aprovado |

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
- **"Agora não" vale para as próximas visitas também** (F1: "uma vez por pessoa"); o link
  "Avaliar o demo" no Guia desfaz a dispensa e abre o formulário.

## Pendências fora de escopo

- `src/lib/regressao.test.ts` lista as áreas onde a regra das 300 linhas é cobrada
  (`AREAS_DAS_ONDAS`) e **não inclui** `src/components/avaliacao/` nem `src/components/guia/`.
  Todos os arquivos novos da S2 estão abaixo de 230 linhas, mas a guarda não vigia a pasta. O
  arquivo é da trilha A (`src/lib/**`) — incluir as duas pastas na lista fica para quem fechar a onda.
- A conferência no navegador da S2 depende da API da trilha A; até ela subir, o `GET
  /api/avaliacoes` responde 404, a vitrine fica com os três do arquivo (comportamento correto) e o
  DevTools mostra o 404 da rede — nada escrito pelo nosso código.
