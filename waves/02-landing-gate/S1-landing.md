# O2 · S1 — Landing de marketing (/)

## O que entrega (negócio)
A página que vende o CRM Ultra: o corretor entende o produto e tem dois caminhos claros — "Conhecer
CRM" (ler mais) e "Acessar CRM" (pedir acesso ao demo).

## Revalidação ao iniciar
- [ ] O0 aplicada (marca/paleta via config)? Componentes de site reaproveitáveis identificados?
- [ ] O que fazer com a home-portal atual (`src/app/page.tsx`)? Mover p/ `/demo/portal` (registrar).

## Mapear (≤5 linhas)
- Entrega: nova `/` de marketing. Sem PII/secret.
- Cria: `src/components/landing/*`; reescreve `src/app/page.tsx`. Move: portal atual → `src/app/demo/portal/`.
- Sem corrida/IDOR. Caminho simples: compor seções estáticas reusando navbar/footer/Icon e `brand.*`.

## Pode tocar
- `src/app/page.tsx` (reescrita) · `src/components/landing/{Hero,Features,Publico,Planos,Prova,CTA}.tsx`
  (novos) · `src/components/site/SiteNavbar.tsx` (variante de marketing: links + botão "Acessar CRM") ·
  realocação do portal: `src/app/demo/portal/*` (mover, ajustar imports relativos)

## Passos
1. Seções da landing (copy em PT-BR, marca via `brand.*`):
   - **Hero**: headline ("O CRM imobiliário que fecha mais negócios"), sub, CTAs **Acessar CRM**
     (abre fluxo — O2·S2) e **Conhecer CRM** (rola p/ features).
   - **Features**: blocos do que o CRM faz (funil, atendimento, Radar de captação, gestão CEO,
     franquias) — espelhando os painéis do demo.
   - **Para quem**: Corretor / Imobiliária (CEO) / Rede de franquias.
   - **Planos** (placeholder, sem checkout) e **Prova social** fictícia (depoimentos genéricos).
   - **CTA final** + footer (reusar `SiteComponents` footer, marca via config).
2. Navbar de marketing: logo (`<BrandLogo/>`), âncoras, botão "Acessar CRM".
3. Mover o portal atual para `/demo/portal` (ou manter sob o demo) e corrigir links.
4. Responsivo (reusar utilidades existentes); estados não se aplicam (estático), mas imagens com fallback.

## Pronto quando
- [ ] `/` mostra a landing de marketing; zero marca antiga; responsiva.
- [ ] "Conhecer CRM" navega pelas seções; "Acessar CRM" tem o gancho para o fluxo (ligado na S2).
- [ ] Portal antigo acessível como demo, sem links quebrados. `build`/`typecheck` limpos.

## Não fazer
- Não implementar o fluxo de captura aqui (S2) — só o botão/gancho. Sem gate (S3).
