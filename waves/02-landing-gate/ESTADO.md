# O2 · ESTADO — Landing & Gate

## Status das subs
| Sub | Status | Commit | Notas |
|-----|--------|--------|-------|
| S1 — Landing de marketing | ✅ feita | 1097f5d | 11 arquivos novos em `components/landing/`; portal movido p/ `/demo/portal`; CTA já ligado ao gancho da S2 |
| S2 — Fluxo de captura | ✅ feita | e530a48 | `components/acesso/*` + `lib/demoAccess.ts`; 11 testes novos + smoke ponta a ponta contra o servidor real; clique na tela **não** verificado |
| S3 — Gate + 3 entradas | ✅ feita | e282267 | `AuthGate` exige acesso; `EscolhaPainel` no fim do fluxo e no login; 6 testes novos |

**Onda O2 concluída** — aceite conferido no fim deste arquivo (com 2 itens que dependem de conferência no navegador).

## Decisões tomadas
- **(S1) `/` é a landing; o portal virou `/demo/portal`** (`git mv`, sem alterar o código da página — todos os imports são `@/`). Links "Home" corrigidos em 8 pontos: `SiteNavbar` (logo + item), `SiteFooter` e os breadcrumbs de associadas/blog/comparar/corretores/favoritos/financiamentos.
- **(S1) Logo do `/login` e do painel do corretor continuam em `/`** (agora a landing) — "sair para a home do produto". Se a S3 quiser que voltem para o portal, é lá.
- **(S1) `LandingNav` separada, em vez de "variante de marketing" na `SiteNavbar`** (como sugeria o `S1-landing.md`): são duas navegações com objetivos diferentes (âncoras + CTA vs. menu do portal) e a `SiteNavbar` já tem 230 linhas. Um componente com dois modos ficaria pior que dois componentes.
- **(S1) `LandingFooter` próprio, em vez de reusar o `SiteFooter`** (o plano sugeria reusar): o footer do portal vende imóveis (buscar/anunciar/CRECI da imobiliária) e tem **contato cravado** — a landing vende software e tira tudo de `brand.*`.
- **(S1) Sem depoimentos fictícios.** Depoimento inventado apresentado como real engana o visitante. A seção de confiança afirma só o que a demonstração cumpre (demo real, dados fictícios, PII mínima) e deixa o espaço dos depoimentos **reservado e marcado** enquanto `brand.demoMode` estiver ligado.
- **(S1) Planos sem preço** ("Preço em definição" + aviso de que nada é cobrado): publicar valor que ainda não existe cria expectativa que o produto teria de honrar.
- **(S1) O CTA não fica mudo até a S2:** `AcessoEmBreve` (placeholder explícito, com saída real por e-mail do `brand`). **Todos** os "Acessar CRM" chamam o mesmo `abrirAcesso` em `app/page.tsx` — é ali que a S2 troca o placeholder pelo `AccessFlow`, num ponto só.
- **(S1) `ui.tsx` dividido** (`ui.tsx` + `botoes.tsx`) para respeitar a regra das 200 linhas. Maior arquivo da landing: 180.
- **(S2) `api.ts` é o único lugar do fluxo que fala HTTP.** Cada resposta das rotas vira um estado fechado (`enviado|limitado|invalido|erro` e `verificado|falha+motivo|invalido|erro`); a UI só decide o que mostrar. Falha de rede e resposta não-JSON também viram mensagem.
- **(S2) O client valida com o MESMO Zod da rota** (`LeadInputSchema`): o que passa na tela passa no servidor, e o telefone já sai em E.164. Sem regra de validação duplicada.
- **(S2) `TEXTO_CONSENTIMENTO` movido de `lead.ts` (server-only, usa `crypto`) para `schema.ts` (client-safe)**, re-exportado pelo domínio. Sem isso a tela teria de duplicar o texto e ele poderia divergir do que fica gravado no registro — o oposto do que a LGPD pede. (Ajuste de escopo, mesmo padrão da O1·S3.)
- **(S2) Reenvio com espera própria de 60s** (`ESPERA_REENVIO_S`), para o usuário não queimar o limite real de 3 envios/30 min do servidor sem perceber.
- **(S2) `demoAccess` guarda só a flag `crm_demo_liberado="1"`** — nenhum dado pessoal no localStorage. Forjar a flag não dá acesso: a verdade é o cookie httpOnly assinado. Todo acesso ao `localStorage` é protegido (SSR e modo privativo).
- **(S2) `StepOk` leva para `/login`** enquanto a escolha dos 3 painéis (S3) não existe — caminho real, não placeholder. **(substituído na S3 pelo `EscolhaPainel`.)**
- **(S3) Ordem das checagens no `AuthGate`:** sem acesso ao demo → `/` (a landing é onde se pede); sem sessão → `/login`; sessão de outro perfil → painel certo. A regra nova entra **antes** das que já existiam.
- **(S3) `entrarComoDemo(perfil)` não pede senha:** quem chega ali já provou o e-mail (token da O1·S3) e a senha do protótipo (`123`) não protege nada. Reusa `mockAuth.login` para a sessão continuar sendo gravada num lugar só.
- **(S3) Login com credencial de demo e sem acesso avisa na tela** em vez de empurrar para um painel que ia rebater no gate (evita o vai-e-volta sem explicação).
- **(S3) O CTA do login abre o `AccessFlow` na própria tela** — sem mandar o visitante para a landing e fazer ele procurar o botão.

## Pendências fora de escopo
- 🚨 **Contato cravado no portal (herdado da O0, decisão do fundador):** `SiteFooter` traz telefone, e-mail, endereço e CRECI do ex-cliente e razão social; a `SiteNavbar` tem o WhatsApp do ex-cliente. Nada disso vem de `brand.*`. **Se forem dados reais (do cliente antigo ou seus), é bloqueador de marca/LGPD.** Trocar por `brand.contato` — provavelmente na O5·S1.
- 🚨 **Política de Privacidade não existe — agora o formulário já está no ar.** O consentimento exibido (e gravado) diz "conforme a Política de Privacidade", mas não há página para linkar; a S2 mostra o texto **sem link** para não criar link quebrado. Precisa da página antes de qualquer divulgação pública — é conteúdo jurídico com os dados reais do controlador, não dá para eu inventar.
- ⚠️ **(S2) Sem teste de renderização.** O projeto não tem `jsdom`/`@testing-library/react` nem browser driver: os 11 testes cobrem a camada de API e o smoke cobriu o caminho HTTP real com o código do client, mas **o clique na tela não foi verificado**. Instalar as dev-deps (decisão do fundador) ou conferir na mão.
- ℹ️ **(S2) `vitest` não resolve o alias `@/`** — os testes usam import relativo. Adicionar o alias no `vitest.config.ts` quando entrarem testes de componente (`StepDados` importa `@/features/lead/schema`).
- ✅ **(resolvido na S3)** Ainda não havia gate: `/corretor`, `/ceo` e `/franqueado` abriam sem verificação.
- 🚨 **(S3) O gate é de EXPERIÊNCIA, não de segurança.** Roda no cliente e lê o espelho do `localStorage`: quem abrir o devtools e setar `crm_demo_liberado="1"` entra nos painéis. **Vale hoje porque atrás deles só existe mock** — nenhum dado real, nenhuma API protegida. No dia em que um painel mostrar dado de verdade, a checagem tem de ir para o servidor, validando o cookie httpOnly com `verificarTokenDemo` (middleware ou route handler). Registrar como pré-requisito da trilha "Plataforma".
- ⚠️ **(S3) Redirect e clique nas entradas não foram executados** — dependem de navegador (o projeto não tem browser driver). O que está provado: os 3 painéis servem só o gate no SSR, o `/login` esconde as entradas sem acesso, e `demoAccess`/`entrarComoDemo` estão cobertos por teste.
- ⚠️ **Banners em `public/img`** (`site-recruitment.png`, `seja-hero-banner.png`) ainda não revisados — podem ter fotos de pessoas reais / imagem do cliente antigo (pendência herdada do handoff). O `/demo/portal` ainda exibe `site-recruitment.png`.
- ℹ️ **Landing sem teste automatizado** — é página estática, sem lógica; provada por `build` + checagem de runtime (rotas 200, CTAs presentes, zero marca antiga). Nenhuma página do protótipo tem teste.
- ℹ️ **Ambiente (Windows):** houve uma janela em que **todo** `rename` no `%TEMP%` falhou com `EBUSY` (reproduzido fora do projeto: 60/60), derrubando 16 testes; passou sozinho. O `FileLeadStore` não tem retry para `EBUSY` — em dev no Windows isso vira 500. Resolver junto do `PostgresLeadStore` (O5).
- ℹ️ **Não rodar `next build` com `next dev` aberto** — os dois escrevem em `.next` e o dev passa a devolver 500 (`__webpack_modules__ is not a function`). Não é bug do app.

## Riscos
- Mover a home-portal pode quebrar links (`/buscar`, `/favoritos`, `/imovel/[id]`). Mapear antes.
  → **(S1) resolvido:** mapeado por `grep`, 8 pontos corrigidos, rotas conferidas em runtime (`/`, `/demo/portal`, `/favoritos`, `/associadas`, `/buscar`, `/sobre`, `/login`, `/corretor`, `/ceo`, `/franqueado` = 200).
- AuthGate é client-side (protótipo) — o token de demo aqui é UX-gate, não segurança de dados
  (não há dado real atrás dele nesta fase). Registrar essa premissa.
  → **(S3) confirmado e registrado** como pendência 🚨 acima. A premissa vale enquanto os painéis
  forem 100% mock.

## Aceite da onda (conferido na S3, commit e282267)
| # | Critério | Como foi provado |
|---|----------|------------------|
| 1 | Landing responsiva, marca via `brand.*`, CTAs "Conhecer CRM" e "Acessar CRM" | runtime: âncoras `#recursos/#publico/#planos`, 3 CTAs, zero contato cravado, zero marca antiga. **Responsividade vem das classes `ds-*` já usadas no app — não medida em viewport real.** |
| 2 | Fluxo ponta a ponta: form → código (fallback dev) → verifica → desbloqueia | smoke executando o **código do client** contra o servidor: máscara → Zod → E.164 → envio → código errado → certo → reuso barrado → consentimento barrado → 4º envio limitado |
| 3 | Sem token, os painéis não abrem | **parcial:** SSR dos 3 painéis entrega só o gate (nenhuma label do painel no HTML) e `estaLiberado` está coberto por teste; **o redirect no navegador não foi executado** |
| 4 | Com token, as 3 entradas abrem os painéis certos | **parcial:** `entrarComoDemo` + `homeForPerfil` testados para os 3 perfis; **a navegação real não foi executada** |
| 5 | Estados vazio/erro/carregando no fluxo; `build`/`typecheck` limpos | cada desfecho da API vira estado visível (11 testes de mapeamento); build + `tsc --noEmit` limpos; **56 testes** |

> Os itens 3 e 4 pedem **uma passada manual de 2 minutos** no navegador: pedir acesso, verificar com
> o código que aparece em dev, escolher um painel; depois limpar `crm_demo_liberado` no devtools e
> confirmar que `/corretor` rebate para a landing.
