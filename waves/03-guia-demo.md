# Onda 3 — Guia do Demo

**Objetivo:** orientar o visitante enquanto ele usa o demo. Deixar claro que é uma demonstração,
explicar cada painel ao entrar e dar dicas contextuais por seção — sem atrapalhar a navegação.

## Sub-entregas
- **S1 — Modo demonstração + boas-vindas** → `S1-modo-demo-boasvindas.md`
- **S2 — Guia contextual (drawer + dicas)** → `S2-guia-contextual.md`

## Critérios de aceite da onda
1. Banner "Modo demonstração" visível nos painéis (com aviso de dados fictícios), desligável por flag.
2. Modal de boas-vindas aparece **1x por painel** (corretor/ceo/franqueado), com dismissal persistido.
3. Drawer "Guia" com dicas por seção do painel atual; botão de ajuda flutuante; estado persistido.
4. Nada quebra o layout dos painéis; conteúdo do guia vem de um único lugar (fácil editar).
5. `build`/`typecheck` limpos.

## Pendências fora de escopo
**Onda concluída** (S1 `5b3c068` · S2 `efe4da2`). Aceite conferido em `03-guia-demo/ESTADO.md` —
os 5 critérios verdes, com a ressalva de que a **aparência** depende de conferência no navegador.

- ℹ️ **Tour passo-a-passo com destaque/setas** — deixado como melhoria futura (o próprio
  `S2-guia-contextual.md` mandava). O catálogo `SECOES` já serve de base.
- ℹ️ **13 seções cobrem as telas principais**, não as ~40 do protótipo; o resto cai no fallback.
  Adicionar dica = uma entrada em `src/content/guia.ts`.
- ℹ️ **Guia não aparece no `/demo/portal`** nem no admin — só nos 3 painéis.
- ⚠️ **Aparência não verificada** (sem browser driver no projeto).
