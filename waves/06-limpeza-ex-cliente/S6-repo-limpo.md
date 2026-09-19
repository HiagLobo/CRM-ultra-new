# O6 · S6 — Repositório novo e limpo

## O que entrega (negócio)
O repositório que vai para a Vercel (e que um dia pode ser compartilhado) nasce limpo: nenhum
commit antigo com imagens de pessoas reais, marca do ex-cliente ou e-mail de pessoa real.

## Revalidação ao iniciar
- [ ] S1–S5 mescladas na `main`, com `build` + `typecheck` + testes verdes.

## Depende do fundador (GitHub)
1. Renomear `HiagLobo/CRM-ULTRA` para um nome de arquivo (ex.: `CRM-ULTRA-arquivo`), mantendo privado.
2. Criar um repositório novo, **privado e vazio** (sem README), com o nome definitivo.

## Passos (agente)
1. Branch órfã a partir da árvore da `main` → **um commit** "estado inicial limpo (O0–O6)".
2. `origin` passa a ser o repo novo; o antigo fica como remoto `arquivo` (só leitura).
3. Push da branch única como `main` do repo novo.
4. Prova: clonar o repo novo numa pasta temporária → 1 commit no log → varredura de todo o histórico
   (textos proibidos + hashes das imagens antigas) = 0 → `npm ci` + `build` + testes verdes no clone.

## Nota
Os hashes de commit citados em `waves/**` passam a se referir ao repositório arquivado — registrar
isso no `00-INDEX.md`.
