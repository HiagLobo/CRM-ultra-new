# O7 · S4 — Celular: menu do CEO, tour e botão Guia

## O que entrega (negócio)
Quem abre o demo pelo celular (link de WhatsApp/Instagram) consegue navegar nos 3 painéis.

## Fazer (achados do estudo)
1. **Menu do CEO não fecha** (`CeoChrome`): o wrapper `fixed` sem largura faz o `translateX(-100%)`
   não mover nada e o aside cobre ~70% da tela. Corrigir o transform/largura; X e overlay fecham.
2. **Tour aponta para elemento escondido**: filtrar passos por visibilidade real
   (`getClientRects().length`, largura/altura > 0, dentro da viewport nos dois eixos); estender
   `estaVisivel` para o eixo horizontal (teste).
3. **Tour do Atendimento descartado antes de aparecer**: esperar os alvos (poll/MutationObserver
   com teto ~3 s) antes de desistir; "fechou por falta de alvo" **não** marca como visto.
4. **Botão Guia cobre a aba Perfil** no corretor mobile: subir FAB/drawer acima da barra inferior.
5. **Franqueado sem navegação no celular** (a barra some e não há menu): reaproveitar o padrão do
   CEO (botão de menu + drawer) ou uma barra de atalhos — o mínimo que funcione.
6. Teclas do tour não sequestram quem digita (ignorar Enter/setas em input/textarea/botão).

## Pronto quando
- [ ] Testes de `tourPosicao` para o eixo horizontal; `tsc` + testes verdes.
- [ ] Conferência no navegador em 390 px (orquestrador, via Chrome headless).
