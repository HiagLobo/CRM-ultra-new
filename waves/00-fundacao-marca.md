# Onda 0 — Fundação & Marca

**Objetivo:** transformar a cópia do protótipo original num projeto `crm-ultra-app` que **roda** e está
**100% livre da marca antiga** — com a marca vinda de config (nunca cravada), paleta "Ultra"
e nenhuma pessoa real nos dados de demonstração.

## Por que esta onda primeiro

O protótipo é difícil de rebatizar justamente porque a marca está **cravada** (nome, roxo e logo
espalhados em ~37 arquivos + ~98 hexes + fotos de pessoas reais). Resolver isso com uma **engine de
branding** (config + CSS vars) não é só estética: é o que torna todo o resto sustentável e o que
protege você de carregar IP do cliente. Tudo depende desta base.

## Sub-entregas

- **S1 — Scaffold & env fail-closed** → `S1-scaffold-env.md`
- **S2 — Engine de branding (de-branding)** → `S2-engine-branding.md`
- **S3 — Paleta Ultra + personas fictícias + favicon** → `S3-paleta-personas.md`

## Critérios de aceite da onda (rodar na última sub)

1. `npm run dev` e `npm run build` sobem sem erro; `typecheck` limpo.
2. `grep -ri "<marca antiga>" src` → **0 ocorrências**.
3. Nenhuma foto/nome de pessoa real no app (as pessoas reais do ex-cliente removidas).
4. Logo, nome, cores e contato saem **todos** de `src/config/brand.ts` / CSS vars `--brand-*`.
5. Trocar o nome em `brand.ts` muda o app inteiro (teste manual: mudar para "Acme" reflete em
   site, login e painéis) — prova de que a marca não está cravada.
6. Visual coeso na paleta indigo "Ultra"; favicon novo.

## Pendências fora de escopo encontradas

_(preencher durante a execução)_
