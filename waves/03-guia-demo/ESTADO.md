# O3 · ESTADO — Guia do Demo

## Status das subs
| Sub | Status | Commit | Notas |
|-----|--------|--------|-------|
| S1 — Modo demo + boas-vindas | ✅ feita | 5b3c068 | catálogo + estado + banner + modal, montados nos 3 painéis |
| S2 — Guia contextual | ✅ feita | efe4da2 | 13 seções por rota + drawer + FAB; os chromes não mudaram de novo |

**Onda O3 concluída** — aceite no fim deste arquivo.

## Decisões tomadas
- **(S1) Um ponto único de montagem (`GuiaDemo`).** Os 3 chromes chamam uma linha só; a S2 plugou o
  drawer e o FAB lá dentro sem tocar em `CorretorChrome`, `CeoChrome` nem no header do franqueado.
  Foi o que fez a S2 não repetir o trabalho de montagem da S1.
- **(S1) O banner fica no fluxo, não `position: fixed`.** Assim empurra o conteúdo em vez de cobrir a
  topbar do painel — o critério era "não quebrar o layout", e faixa fixa quebraria.
- **(S1) Estado do storage só lido no `useEffect`.** Ler no render divergiria entre o HTML do
  servidor e o primeiro render do navegador (erro de hidratação).
- **(S1) Tudo desliga com `brand.demoMode`** — quando virar produto real, some sem remover código.
- **(S1) `limparGuia()`** existe para reapresentar o demo a outra pessoa na mesma máquina.
- **(S2) O drawer não bloqueia a navegação:** sem fundo escurecido, dá para ler a dica e continuar
  clicando no painel atrás. Guia que trava a tela atrapalha quem está explorando.
- **(S2) `secaoDaRota` resolve pela correspondência mais específica**, então `/corretor/radar/mapa`
  herda as dicas do Radar em vez de cair no genérico.
- **(S2) Rota sem dica própria cai nos passos gerais do painel** e diz isso na tela — o guia nunca
  abre vazio (tem teste cobrindo 4 rotas sem entrada).
- **(S1+S2) Conteúdo separado da UI** em `src/content/guia.ts`: dá para reescrever a copy inteira sem
  abrir arquivo de componente. É o maior arquivo do conjunto (235 linhas) porque é texto, não lógica.

## Pendências fora de escopo
- ℹ️ **Sem tour passo-a-passo com destaque/setas** — o `S2-guia-contextual.md` já mandava deixar como
  melhoria futura. O catálogo atual (`SECOES`) serviria de base se um dia isso for feito.
- ℹ️ **13 seções cobrem as telas principais**, não as ~40 do protótipo. As demais caem no fallback,
  que é um resultado aceitável, não um buraco. Adicionar dica nova = uma entrada em `SECOES`.
- ⚠️ **A aparência não foi verificada na tela** (mesma limitação da O2/O4): os painéis ficam atrás do
  `AuthGate`, o SSR entrega só o gate e o projeto não tem browser driver. Provado: mapeamento
  rota→dicas, fallback, persistência, build e typecheck.
- ℹ️ **O guia não aparece no `/demo/portal`** (portal de imóveis) nem no admin — só nos 3 painéis.
  Se o portal virar parte do roteiro de demonstração, vale uma entrada própria.

## Aceite da onda (conferido na S2, commit efe4da2)
| # | Critério | Como foi provado |
|---|----------|------------------|
| 1 | Banner "Modo demonstração" nos painéis, desligável por flag | montado nos 3 (corretor desktop+mobile, ceo, franqueado); `GuiaDemo` retorna `null` com `brand.demoMode` desligado |
| 2 | Boas-vindas 1x por painel, dismissal persistido | 6 testes de `guiaState` (por painel, sem duplicar, corrompido, SSR) |
| 3 | Drawer com dicas da seção + FAB + estado persistido | 13 seções, `secaoDaRota` com 3 testes, estado do drawer no storage |
| 4 | Layout intacto; conteúdo num lugar só | banner no fluxo (não cobre a topbar); todo texto em `src/content/guia.ts` |
| 5 | `build`/`typecheck` limpos | ambos verdes; **108 testes** |

> Ressalva do critério 1 e 3: **a aparência** (banner não cobrindo nada, drawer legível) depende de
> conferência no navegador — o que está provado é a montagem, o conteúdo e o comportamento.
