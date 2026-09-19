# O2 · S3 — Gate + 3 entradas de demo

## O que entrega (negócio)
Só quem verificou o e-mail entra no demo. Depois de liberado, o visitante escolhe um dos três
painéis: **Painel do Corretor**, **CEO com associados**, **CEO com franquias** — também disponíveis
na tela de login.

## Revalidação ao iniciar
- [ ] S2 grava `demoAccess` ao verificar? Cookie de token (O1·S3) presente?
- [ ] Mapear quem usa `AuthGate`: `corretor/layout.tsx`, `ceo/layout.tsx`, `franqueado/layout.tsx`.
- [ ] `homeForPerfil`: ceo→`/ceo/visao-geral`, franqueado→`/franqueado`, corretor→`/corretor`.

## Mapear (≤5 linhas)
- Entrega: gate de demo + seletor de persona. Sem PII nova.
- Modifica: `AuthGate.tsx` (exigir token de demo), `login/page.tsx` (3 entradas), cria seletor.
- Risco: travar acesso legítimo. Caminho simples: se sem token → manda p/ `/` (abre fluxo); com token,
  escolher persona seta `mockAuth` e navega.

## Pode tocar
- `src/components/AuthGate.tsx` (add checagem de demo) · `src/app/login/page.tsx` (3 botões de entrada)
  · `src/components/acesso/EscolhaPainel.tsx` (novo, usado no StepOk e no login) · `src/lib/demoAccess.ts`
  · `src/lib/auth.ts` (helper `entrarComoDemo(perfil)` que seta a sessão de persona)

## Passos
1. `AuthGate`: além de `mockAuth.getSession()`, exigir `demoAccess.estaLiberado()`. Sem acesso →
   `router.replace("/")` (ou `/acesso`) abrindo o fluxo. Mantém o comportamento de perfil-errado.
2. `auth.ts`: `entrarComoDemo(perfil)` → seta sessão da persona fictícia correspondente
   (corretor/ceo/franqueado) reusando `DEMO_USERS`.
3. `EscolhaPainel.tsx`: três cards — **Painel do Corretor** (`/corretor`), **CEO com associados**
   (`/ceo` → `/ceo/visao-geral`), **CEO com franquias** (`/franqueado`). Clicar → `entrarComoDemo` +
   navega. Descrição curta em cada card (o que a pessoa vai ver).
4. `login/page.tsx`: abaixo do form, seção "Entrar na demonstração" com as 3 entradas (visível quando
   `demoAccess.estaLiberado()`; senão, CTA para pedir acesso).
5. Conferir os 3 painéis abrindo certo e o AuthGate barrando sem acesso.

## Pronto quando
- [ ] Sem token/acesso, abrir `/corretor`/`/ceo`/`/franqueado` redireciona para o gate (não vaza painel).
- [ ] Com acesso, as 3 entradas abrem os painéis corretos (corretor, CEO-associados, CEO-franquias).
- [ ] As 3 entradas aparecem também no `/login`.
- [ ] **Critérios de aceite da O2** verdes → atualizar `00-INDEX.md`. `build`/`typecheck` limpos.

## Não fazer
- Sem instruções/guia dentro do painel (O3).
