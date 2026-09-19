# Onda 2 — Landing & Gate

**Objetivo:** a cara pública do produto. Uma landing de marketing do CRM Ultra com "Conhecer CRM" e
"Acessar CRM"; o fluxo que captura e-mail/telefone/CRECI e verifica o código (consumindo a O1); e o
**gate** que só libera os 3 painéis-demo (Corretor, CEO associados, CEO franquias) para quem verificou.

## Decisão de rota
- `/` passa a ser a **landing de marketing** do CRM (hoje é o portal de imóveis).
- O portal de imóveis atual vira parte do **demo** (ex.: acessível pelos painéis / rota `/demo/portal`),
  não some — é uma feature do produto, mas não é mais a porta de entrada.

## Sub-entregas
- **S1 — Landing de marketing (/)** → `S1-landing.md`
- **S2 — Fluxo de captura (form → código → verifica)** → `S2-fluxo-captura.md`
- **S3 — Gate + 3 entradas de demo** → `S3-gate-entradas.md`

## Critérios de aceite da onda
1. Landing responsiva, marca 100% via `brand.*`, CTAs "Conhecer CRM" (âncora/seções) e "Acessar CRM"
   (abre o fluxo).
2. Fluxo ponta a ponta: form válido → recebe código (ou fallback dev) → verifica → desbloqueia.
3. Sem token de demo, os painéis **não abrem** (AuthGate manda pro gate/landing).
4. Com token, as 3 entradas abrem Corretor `/corretor`, CEO-associados `/ceo`, CEO-franquias `/franqueado`.
5. Estados vazio/erro/carregando em todo o fluxo; `build`/`typecheck` limpos.

## Pendências fora de escopo
**Onda concluída** (S1 `1097f5d` · S2 `e530a48` · S3 `e282267`). Aceite conferido em
`02-landing-gate/ESTADO.md` — os critérios 3 e 4 pedem uma passada manual no navegador.
O que ficou para depois:

- 🚨 **Gate de verdade (servidor):** o `AuthGate` é de experiência (lê o `localStorage`). Enquanto os
  painéis forem mock, tudo bem; com dado real, validar o cookie httpOnly com `verificarTokenDemo`
  em middleware/route. Pré-requisito da trilha "Plataforma".
- 🚨 **Política de Privacidade:** o formulário já grava "conforme a Política de Privacidade" e não há
  página. Conteúdo jurídico com os dados do controlador — precisa do fundador.
- 🚨 **Contato cravado no portal** (`SiteFooter`/`SiteNavbar`, herdado da O0): telefone, e-mail,
  endereço, CRECI e razão social fora de `brand.*`. Se forem dados reais, é bloqueador.
- ⚠️ **Sem teste de UI:** o projeto não tem `jsdom`/`testing-library` nem browser driver. Decidir se
  entram como dev-deps (O5·S1) ou se a conferência segue manual.
- ⚠️ **Banners em `public/img`** ainda não revisados (podem ter foto de pessoa real / imagem do
  cliente antigo). O `/demo/portal` exibe `site-recruitment.png`.
- ℹ️ **`vitest` não resolve o alias `@/`** — adicionar quando entrarem testes de componente.
