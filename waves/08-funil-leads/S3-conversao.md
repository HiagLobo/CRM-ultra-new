# O8 · S3 — Conversão: "Quero usar" no demo e origem da campanha

## O que entrega (negócio)
O corretor que gostou do demo tem um próximo passo a um clique; e o fundador sabe qual anúncio,
post ou link trouxe cada lead.

## Fazer
1. **"Quero usar no meu time"** no `DemoBanner` (todos os painéis) e no rodapé do `GuiaDrawer`:
   abre o WhatsApp comercial (`linkWhatsapp` do `brand`) com mensagem pronta, em nova aba. Na tela
   de acesso liberado (`StepOk`), uma linha "Quer conversar? Fale com a gente no WhatsApp".
2. **Origem da campanha**: na landing, ler `utm_source`, `utm_medium`, `utm_campaign` e `ref` da
   URL (e, sem eles, o domínio do `document.referrer`), guardar em `sessionStorage` e enviar em
   `origem` no pedido de acesso (`utm` = fonte.meio.campanha; `ref` = ref ou domínio de origem).
   Módulo puro `src/lib/origemCampanha.ts` com teste; o servidor já saneia (`[A-Za-z0-9._-]`, 100).
3. Política de Privacidade: citar que a origem do link (campanha) é registrada junto do pedido.

## Pronto quando
- [ ] Teste do módulo de origem (UTM completo, parcial, referrer, nada, valores estranhos).
- [ ] `tsc` + testes verdes; botão visível no desktop e no celular sem cobrir nada.
