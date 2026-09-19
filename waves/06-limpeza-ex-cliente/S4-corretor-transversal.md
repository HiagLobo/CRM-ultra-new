# O6 · S4 — Painel do corretor, /login e resíduos transversais

## O que entrega (negócio)
A porta de entrada do demo (`/login`) e o painel do corretor deixam de exibir o slogan, os
números, a persona e as alegações herdadas do ex-cliente.

## Pode tocar
- `src/app/corretor/**`, `src/components/corretor/**`, `src/app/login/page.tsx`,
  `src/app/primeiro-acesso/**` (apagar), `src/lib/auth.ts`, `src/config/brand.ts`,
  `next.config.mjs` (redirect de `/primeiro-acesso`)

## Trocas
1. `/login`: sai o slogan do ex-cliente (`brand.taglinePortal` deixa de existir), o bloco
   de números do ex-cliente, "Seja um corretor", o formulário de senha mock e a frase "autenticação em
   duas etapas" (falsa). Fica o cartão real: entrar no demo (se liberado) ou pedir acesso.
2. `/primeiro-acesso` (2FA falso, sem link de entrada) → removido, redirect para `/`.
3. `corretor/page.tsx`: citações atribuídas à persona que substituiu o sócio famoso do ex-cliente
   → dicas sem autoria de pessoa.
4. Onde "CRM Imobiliário Ultra" faz papel de imobiliária do corretor → `demo.*`; onde é o SaaS → `brand.*`.
5. `@crmultra.com.br` e URLs `crmultra.com.br/...` cravadas (personas, marketing, QR) → `demo.dominio`.
6. Radar Proprietários: endereço real com unidade → fictício; alegações jurídicas que não existem
   ("RIPD documentado", "bases licenciadas") → texto de exemplo neutro.

## Pronto quando
- [ ] grep das trocas na área = 0; `build` + `typecheck` + testes verdes; `/login` e `/corretor` abrem.
