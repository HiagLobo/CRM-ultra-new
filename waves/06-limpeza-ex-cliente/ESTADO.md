# O6 · ESTADO — Limpeza do ex-cliente

## Status das subs
| Sub | Status | Commit | Notas |
|-----|--------|--------|-------|
| S1 — Imagens | ✅ | `21d2fbd` | 13 fotos Unsplash (~1 MB no total, antes ~9 MB); 15 arquivos do ex-cliente apagados; créditos em `public/assets/CREDITOS.md`; conferido em screenshot headless |
| S2 — Portal de exemplo | ✅ | `e524a0a` | 4 telas em `/demo/*` com noindex + `Disallow`; 9 páginas e 2 pastas de componentes do protótipo removidas, com redirect 307; identidade fictícia no cabeçalho/rodapé; conferido em HTTP e screenshot |
| S3 — Painéis CEO/franqueado | ✅ | `be058d1` + `5041d92` | agente + revisão cética (reprovou 1ª versão: gráfico ≠ card, volumes da planilha antiga, recorrência 2%) + correção |
| S4 — Corretor, /login, transversal | ✅ | `ee24f7b` + `243bb9f` | agente + revisão cética (reprovou: taxa 3% do ex-cliente, e-mails de terceiros no domínio da rede, logradouros reais) + correção |
| Integração S3+S4 | ✅ | `57cde68` | recorrência 1,5% sem "vitalício", split 60/40, pacotes do Radar novos, locação com garantia sempre do parceiro. Agente caiu por falha de rede; diff conferido conta a conta e completado |
| S5 — Guardas e documentos | ✅ | `df702fb` + _(este)_ | docs anonimizados; guarda por hash (`exCliente.test.ts`, 9 testes); crawl de 48 rotas com cookie válido: 0 exceções JS |
| S6 — Repositório novo | ✅ | commit inicial do repo novo | o repositório atual nasce de um commit único com a árvore limpa (varredura de todos os arquivos versionados: 0 termo, telefone, imagem, segredo ou e-mail pessoal). O histórico anterior fica no repositório original, arquivado e privado |

## Revisão de PR — S1
```
REVISÃO DE PR — onda-06/sub-S1: imagens
VEREDICTO: ✅ APROVADO
ARQUIVOS: novos 16 (fotos.ts 16 linhas · CREDITOS.md · 13 .webp) · modificados 7 (só troca de
  caminho/gradiente: imoveis.ts, favoritos, comparar, corretores, SiteHero, SiteComponents,
  BuscarComponents) · apagados 15 (PNGs do ex-cliente)
BLOQUEADORES: (nenhum)
PIOR CASO EM PRODUÇÃO: caminho errado → card sem foto (cai no gradiente). Conferido por build
  + screenshot de /demo/portal e /buscar. Recupera trocando o caminho em mock-data/fotos.ts.
DECISÃO: AUTORIZADO PARA COMMIT
```

## Revisão de PR — S2
```
REVISÃO DE PR — onda-06/sub-S2: portal de exemplo enxuto e isolado
VEREDICTO: ✅ APROVADO
ARQUIVOS: novos 3 (config/demo.ts em commit próprio · site/MarcaDemo.tsx 42 · app/demo/layout.tsx 16)
  · movidos 3 (buscar, favoritos, comparar → app/demo/) · apagados 9 rotas + components/{sobre,seja}
  · modificados: SiteNavbar (reescrito, 238→150), SiteComponents (sai StatBand, rodapé novo),
    SiteHero/PortalDemoBanner (copy), FavCompare/portal/guia/useTour/TourDoPortal (links),
    EscolhaPainel (descrição), brand.ts (sai taglinePortal), robots.ts, next.config.mjs (redirects)
BLOQUEADORES: (nenhum)
PIOR CASO EM PRODUÇÃO: link antigo para rota removida → 307 para /demo/portal ou /. Tour da busca
  mudou de chave (/buscar → /demo/buscar): quem já tinha visto o tour vê de novo uma vez.
DECISÃO: AUTORIZADO PARA COMMIT
```

## Decisões tomadas
- **(S5) Guarda por hash, não por texto**: o teste que proíbe o nome, os telefones e as imagens do ex-cliente guarda só SHA-256 — o próprio teste não pode ser uma cópia do dado proibido. Pegou 3 nomes de arquivo com o nome de pessoas reais em docs que o grep manual deixou passar.
- **(S5) Valores fictícios de negócio escolhidos pelo orquestrador** dentro da decisão L3: planos 450/1.900/3.600 (+ adesões 1.500/20.000/40.000), corretor 99/199, antecipação 2,5%, split 60/40, recorrência 1,5%, pacotes Radar 59/119/209.
- **(S1) Proveniência provada por hash**, não por inspeção: as 15 imagens raster eram cópias byte a
  byte do design system do ex-cliente. Só os SVGs eram do projeto.
- **(S1) Caminhos novos** (`/assets/imoveis/imovel-NN.webp`, `/img/capa-portal.webp`) em vez de
  sobrescrever os antigos: um link cacheado para o arquivo antigo dá 404 em vez de servir a imagem
  errada, e a guarda da S5 pode proibir os caminhos antigos.
- **(S1) Fonte única** `src/mock-data/fotos.ts` para todos os consumidores (antes, 4 helpers `IMG`).
- **(S1) Resíduos roxos da paleta antiga** trocados por indigo na mesma passada: película da capa
  (`rgba(45,15,68)`) e os gradientes de fallback dos cards (`#cdbcdb/#a98cc4`, `#b9a6cf/#8b6cae`).
- **(S1) Card de financiamento** usa ícone (`hand-coins`) em vez da ilustração 3D do ex-cliente.
- **(S2) Identidade fictícia "Rede Exemplo Imóveis"** (`src/config/demo.ts`, domínio reservado `.example`): nomes "naturais" testados (Rede Modelo, Exemplo Imóveis…) já têm domínio registrado por terceiros; um nome que se declara exemplo não confunde ninguém com empresa real. Troca em uma linha.
- **(S2) Site de exemplo não fala pela empresa real**: rodapé sem razão social/CNPJ/contato da Safe Guardian; só "Feito com {brand.nome}" levando à landing. WhatsApp do portal mostra aviso de exemplo em vez de abrir o número real.
- **(S2) Redirect 307, não 308**: `/sobre` e `/contato` podem voltar como páginas reais da empresa; 308 ficaria preso no cache do navegador.
- **(S2) Conferência**: a primeira rodada de HTTP deu falso positivo (um `next start` antigo seguia na porta); refeita contra o build certo. Lição: encerrar servidor pelo PID, não pelo wrapper.

## Pendências fora de escopo
- (S3) Nomes das unidades (Boa Viagem, Recife Centro, Caruaru, Olinda, Petrolina, Pina) — confirmar com o fundador se reproduzem a rede real do ex-cliente.
- (S3) Guia de `/ceo/associados` chama a tela de "Corretores associados", mas ela lista unidades (título preso a `guiaState.test.ts`) — UX, não resíduo.
- (S3/S4) Integrações mostradas como "conectadas" (bureaus, pagamentos, portais, WhatsApp oficial), datas fixas em junho/2026, persona do corretor inconsistente (Júlia × Ricardo), QR vazio em /corretor/marketing, "2FA ativado" no perfil mock — registrados no estudo; fora da limpeza.
- (S4) `/login` ainda pula direto para o último painel quando há persona salva (trocar de painel exige "Sair").
- (S2) `robots.ts` ainda declara `host` com `brand.dominio` (crmultra.com.br, não registrado) — resolve com a decisão de domínio (D2), no lançamento.
- (S2) `linhaCopyright()` em `brand.ts` ficou sem uso (era do rodapé do portal); fica para a landing decidir se exibe CNPJ.
