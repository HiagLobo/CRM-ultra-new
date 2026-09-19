# O0 · S2 — Engine de branding (de-branding)

## O que entrega (negócio)
Toda a marca (nome, logo, cores, contato, copy) passa a sair de **um lugar** (`src/config/brand.ts`).
Trocar o nome ali muda o app inteiro. Zero nome da marca antiga cravado no `src`.

## Revalidação ao iniciar
- [ ] Listar usos de marca: `grep -ri "<marca antiga>" src` (baseline ~37 arquivos).
- [ ] Listar logos: `grep -rn "logo" src | grep -i "assets\|\.png"` (~10 pontos).
- [ ] Confirmar que `globals.css :root` é a fonte das cores e `palette.ts` espelha os mesmos hexes.

## Mapear (≤5 linhas)
- Entrega: config de marca + componente de logo + tema por var, substituindo strings/`<img>` cravados.
- Toca muitos arquivos, mas **só troca marca** (nome/logo/metadata) — não muda lógica nem layout.
- Cria: `src/config/brand.ts`, `src/components/BrandLogo.tsx`. Modifica: `globals.css`, `layout.tsx`,
  ~10 arquivos com `<img logo>`, e textos com o nome antigo.
- Sem corrida/IDOR. Caminho simples: config → logo SVG → `grep` dirigindo as trocas.

## Pode tocar
- `src/config/brand.ts` (novo) · `src/components/BrandLogo.tsx` (novo) · `src/app/globals.css`
  (só comentário do header + manter vars) · `src/app/layout.tsx` (metadata via brand) ·
  arquivos com `<img ... logo ...>`: `login/page.tsx`, `primeiro-acesso/page.tsx`, `franqueado/page.tsx`,
  `corretor/marketing/page.tsx`, `components/ceo/CeoChrome.tsx`, `components/corretor/CorretorChrome.tsx`,
  `components/seja/RecruitSections.tsx`, `components/site/SiteComponents.tsx`, `components/site/SiteNavbar.tsx` ·
  arquivos com o nome antigo.

## Passos
1. `src/config/brand.ts` — `BrandConfig`: `nome` ("CRM Imobiliário Ultra"), `nomeCurto` ("CRM Ultra"),
   `tagline`, `contato` (e-mail/telefone/whatsapp **fictícios** ou oficiais seus), `dominio`,
   `social`. Export `brand` const tipada.
2. `src/components/BrandLogo.tsx` — wordmark **SVG inline** (marca + "CRM Ultra"); props
   `variant: "color"|"white"|"mono"` e `height`; usa `currentColor`/CSS var. Sem PNG.
3. Substituir cada `<img ... logo ...>` por `<BrandLogo variant=… height=… />` (manter alturas atuais).
4. `layout.tsx`: `metadata.title/description` a partir de `brand`.
5. Trocar todo nome e sigla antigos visíveis por `brand.nome`/`brand.nomeCurto`
   (ou texto neutro). Chaves internas de storage (prefixo antigo) podem virar `crm_session` (cuidado:
   alinhar com quem lê — registrar no ESTADO).
6. **Classes com o prefixo antigo** (em `globals.css` + usos) → renomear para `ds-*`
   (invariante de design system: nada de prefixo de marca cravado). Renomear definição + todos os usos.
7. `grep -ri "<marca antiga>" src` → **0**.

## Pronto quando
- [ ] `grep -ri "<marca antiga>" src` = 0 ocorrências (inclui o prefixo antigo das classes).
- [ ] Logo aparece via `<BrandLogo/>` em site, login e nos 3 painéis (sem `404` de `/assets/logo.png`).
- [ ] Mudar `brand.nome` para "Acme" reflete em site/login/painéis (teste manual) e reverter.
- [ ] `build` + `typecheck` limpos; layout idêntico ao protótipo (só marca mudou).

## Testes mínimos
- `BrandLogo` renderiza nas 3 variantes sem quebrar. (UI: comparar com protótipo — só a marca muda.)

## Não fazer
- Não trocar a paleta ainda (é a S3). Não mexer em mock-data/fotos (S3). Não tocar lógica de auth.
