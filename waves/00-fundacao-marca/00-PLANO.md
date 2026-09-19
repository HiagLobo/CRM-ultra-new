# O0 · PLANO — Fundação & Marca

## Resultado da onda
`crm-ultra-app` roda, builda e está livre da marca antiga; marca 100% vinda de `src/config/brand.ts`
+ CSS vars `--brand-*`; paleta indigo "Ultra"; personas fictícias; favicon novo.

## Baseline de reuso (conferir ANTES de criar qualquer coisa)
O protótipo já tem peças que NÃO se recriam — adaptam-se:

| Já existe | Onde | Como usar nesta onda |
|-----------|------|----------------------|
| Paleta central | `src/lib/palette.ts` | re-skin: trocar valores hex (não a estrutura) |
| CSS vars da marca | `src/app/globals.css` (`:root`) | fonte do tema; vira `--brand-*` |
| Ícones | `src/components/Icon.tsx` | reusar no `<BrandLogo/>` se útil |
| Logos atuais | `public/assets/logo.png`, `logo-white.png` | **substituídos** por `<BrandLogo/>` SVG |
| Mock de pessoas | `src/mock-data/*` e as fotos das pessoas reais em `public/img/` | trocar por personas fictícias |
| Metadata | `src/app/layout.tsx` | passa a ler de `brand.ts` |

## Ordem (cada uma é 1 sessão = 1 commit)
1. **S1 — Scaffold & env**: instalar deps + `resend`, subir dev/build, `env.ts` fail-closed.
2. **S2 — Engine de branding**: `brand.ts` + `<BrandLogo/>` + `--brand-*` + trocar `<img logo>` + metadata.
3. **S3 — Paleta Ultra + personas + favicon**: re-skin indigo, `icon.svg`, remover pessoas reais.

> Ordem importa: sem a engine (S2) o re-skin (S3) viraria mais marca cravada. S2 antes de S3.

## Pode tocar (visão da onda — detalhe em cada Sx)
- `package.json`, `.env.example`, `src/lib/env.ts` (S1)
- `src/config/brand.ts` (novo), `src/components/BrandLogo.tsx` (novo), `src/app/globals.css`,
  `src/app/layout.tsx`, os ~10 arquivos com `<img ... logo ...>` (S2)
- `src/lib/palette.ts`, `src/app/globals.css`, `src/mock-data/*`, `src/app/**` com hex/nome cravado,
  `public/` (favicon/fotos) (S3)

## Revalidação ao iniciar a onda
- [ ] `node_modules` travado já liberou? (senão: renomear pasta `crm-ultra-app` → nova e re-copiar fonte)
- [ ] confirmar contagem de marca: `grep -ri "<marca antiga>" src` (baseline a zerar)
- [ ] confirmar hexes da marca: `#6A2C91 / #4E2470 / #3A1652 / #8246A8 / #EFE6F5 / #F8F4FB`

## Não-fazer nesta onda
- Nada de backend, landing nova, leads ou admin (são O1+). Aqui é **só** rodar + de-branding.
