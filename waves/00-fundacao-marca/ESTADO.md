# O0 · ESTADO — Fundação & Marca

> Memória da onda. Atualizar ao fim de cada sub. A conversa não conta — isto conta.

## Status das subs
| Sub | Status | Commit | Notas |
|-----|--------|--------|-------|
| S1 — Scaffold & env | 🟦 código pronto (build pendente) | — | env.ts + env.test.ts + vitest.config + .env.example + scripts; sintaxe TS OK |
| S2 — Engine de branding | 🟦 código pronto (build pendente) | — | brand.ts + logos SVG + de-branding total; metadata via brand |
| S3 — Paleta Ultra + personas | 🟦 código pronto (build pendente) | — | indigo aplicado; personas fictícias; avatares+favicon SVG; fotos/logos da marca antiga → .trash |

## Decisões tomadas
- **S2 — logo via asset SVG** (`public/assets/logo.svg` + `logo-white.svg`) e troca de caminho
  `.png`→`.svg`, em vez de um componente `<BrandLogo>` editando 10 arquivos. Motivo: sem build
  para validar, minimizar edições arriscadas em JSX. `BrandLogo`/`--brand-*` ficam como melhoria futura.
- **S2 — marca em texto agora é literal do novo nome** (de-branding via sed: nome antigo→`CRM
  Imobiliário Ultra`, sigla antiga→`Ultra`, prefixo antigo das classes→`ds-`, das chaves→`crm_`,
  e-mails antigos→`@crmultra.com.br`). `brand.ts` é a fonte canônica (nome/contato/domínio).
  Migrar TODO o texto para `brand.*` é dívida da trilha white-label (não single-product).
- **S2 — preservado o termo "wizard" de formulário em etapas** (componente/estado `Wizard`) — não é marca.
- **S3 — ramp indigo proposto:** 6A2C91→4F46E5 · 4E2470→4338CA · 3A1652→312E81 · 8246A8→6366F1 ·
  EFE6F5→E0E7FF · F8F4FB→EEF2FF · sombras 106,44,145→79,70,229 e 58,22,82→49,46,129.

## Fatos do código (preenchidos na revalidação)
- Marca cravada (baseline a zerar): **~37 arquivos** em `src` com a marca antiga.
- Hexes da marca a remapear: `#6A2C91`(primary) `#4E2470`(dark) `#3A1652`(deep) `#8246A8`(light)
  `#EFE6F5`(lilac200) `#F8F4FB`(lilac100); sombras `rgba(106,44,145)` e `rgba(58,22,82)`.
- Logos referenciados em ~10 pontos (`/assets/logo.png`, `/assets/logo-white.png`, 1 relativo `?v=3`).
- Pessoas reais a remover: as 2 fotos em `public/img/` + nomes no mock/telas.

## Pendências fora de escopo (anotar, NÃO consertar agora)
- ✅ `node_modules` parcial travado → movido para `.nm_trash_*` (gitignored). Resolvido.
- ⚠️ **Ambiente do sandbox não builda este projeto:** rede do npm estrangulada (~10s/req, nem 1
  pacote instala) + disco Windows lento/trava para `node_modules`. Verificação que depende de
  `npm install` (typecheck/test/next build) precisa rodar na máquina do usuário (rede rápida).
- Decisão operacional: autoria com **checagem de sintaxe TS offline** (`node --experimental-strip-types
  --check`) como proxy; build/test completos no ambiente do usuário ao fim da onda.

## Verificação da S1 (rodar na máquina do usuário)
```
cd crm-ultra-app
npm install
npm run typecheck   # tsc --noEmit
npm run test        # vitest (env.test.ts)
npm run dev         # sobe o protótipo
```
Esperado: typecheck/test verdes; faltando APP_SECRET/ADMIN_PASSWORD num contexto que importe env.ts,
erro claro (fail-closed).

## Resultado do de-branding (verificado por grep)
- marca antiga em `src` = 0; `wizard` sobra só como termo de **formulário em etapas** (`Wizard`/`view==="wizard"`)
  em `corretor/imoveis` e `corretor/radar/avaliacao` — NÃO é marca, mantido de propósito.
- Personas reais = 0 (as 2 pessoas reais do ex-cliente → personas **Ricardo Brandão** e **Marina Duarte**).
- Hexes roxos antigos = 0 (paleta indigo aplicada). Resta `#7A2E4C` (acento vinho, não-marca).
- Fotos/logos da marca antiga e `icon.png` → movidos para `/.trash` (host trava `rm`; rename funciona; gitignored).

## Pendências fora de escopo / a revisar pelo usuário
- ⚠️ **Banners em `public/img`** (`seja-hero-banner.png`, `site-recruitment.png`, `announce-banner.png`,
  `sobre-office-hero.png`, etc.): não consigo inspecionar o conteúdo. O `seja-hero-banner` tinha alt
  citando as pessoas reais — **revisar/trocar** se contiverem rostos reais ou imagem do cliente.
- `BrandLogo` componente + `--brand-*` vars: melhoria futura (hoje logo é asset SVG).
- Migrar menções de marca em TEXTO para `brand.*` (dívida white-label, não single-product).

## Riscos abertos
- D1 (deploy/persistência) ainda não decidido — não bloqueia O0, mas bloqueia O5.
- Build/typecheck/test não rodados aqui (sandbox sem npm) — rodar na máquina do usuário.
