# O0 · S3 — Paleta Ultra + personas fictícias + favicon

## O que entrega (negócio)
Identidade visual própria do CRM Ultra (paleta indigo), favicon novo e **nenhuma pessoa real** no
demo — fechando o de-branding.

## Revalidação ao iniciar
- [ ] S2 concluída (marca via config, grep = 0)? Senão, voltar.
- [ ] Mapear hexes: `grep -rin "6A2C91\|4E2470\|3A1652\|8246A8\|EFE6F5\|F8F4FB" src | wc -l`.
- [ ] Mapear pessoas reais: `grep -rin "<pessoas reais>" src` + fotos das 2 pessoas em `public/img/`.

## Mapear (≤5 linhas)
- Entrega: re-skin de cor + favicon + troca de personas. Toca PII? Sim — remove **dados de pessoas
  reais** (LGPD).
- Modifica: `palette.ts`, `globals.css` (valores das vars), arquivos com hex cravado, `mock-data/*`,
  telas que citam nomes, `public/` (favicon + fotos).
- Sem corrida/IDOR. Caminho simples: `sed` dirigido no ramp de cor + substituição de personas.

## Ramp de cor (proposto — confirmar/ajustar no ESTADO)
| Papel | Roxo antigo → | Indigo Ultra |
|-------|-----------|--------------|
| primary | `#6A2C91` → | `#4F46E5` |
| dark | `#4E2470` → | `#4338CA` |
| deep | `#3A1652` → | `#312E81` |
| light/hover | `#8246A8` → | `#6366F1` |
| lilac-200 | `#EFE6F5` → | `#E0E7FF` |
| lilac-100 | `#F8F4FB` → | `#EEF2FF` |
| sombra | `rgba(106,44,145,…)` → | `rgba(79,70,229,…)` |
| sombra deep | `rgba(58,22,82,…)` → | `rgba(49,46,129,…)` |

## Pode tocar
- `src/lib/palette.ts` · `src/app/globals.css` (valores das vars + sombras) · arquivos `src/**` com os
  hexes acima · `src/mock-data/*` · telas com nomes reais · `public/` (favicon, fotos de pessoas) ·
  `src/app/icon.png` → substituir por `src/app/icon.svg`.

## Passos
1. Re-skin: substituir cada hex do ramp (CSS vars, `palette.ts`, hardcoded) pelos indigo. Conferir
   contraste (texto branco sobre primary/dark continua AA).
2. Favicon: criar `src/app/icon.svg` (marca Ultra) e remover `icon.png`.
3. Personas: trocar as pessoas reais do ex-cliente e fotos por **personas fictícias**
   (ex.: "Ricardo Alves", "Marina Costa") + avatares neutros/gerados. Atualizar `auth.ts`
   (e-mails demo → `@crmultra.com.br` fictício) e `mock-data`.
4. `grep` final: hexes do ramp antigo = 0; pessoas reais = 0.

## Pronto quando
- [ ] Visual coeso indigo em site/login/painéis; nenhum roxo antigo remanescente.
- [ ] Favicon novo aparece na aba.
- [ ] `grep -rin "<pessoas reais>" src` = 0; nenhuma foto de pessoa real em `public/`.
- [ ] Contraste de texto sobre cor primária ≥ AA. `build`/`typecheck` limpos.
- [ ] **Critérios de aceite da Onda 0** (arquivo-mãe) todos verdes → atualizar `00-INDEX.md`.

## Testes mínimos
- Snapshot/spot visual: 1 tela de cada área (site, login, corretor, ceo, franqueado) — só cor/persona
  mudou, layout intacto.

## Não fazer
- Não introduzir landing/leads/admin. Fim da fundação aqui.
