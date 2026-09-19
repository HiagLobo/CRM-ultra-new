# O9 · S3 — Painel: conferir CRECI, selos de repetido e "voltou ao demo"

## O que entrega (negócio)
O fundador confere o CRECI de cada lead em ~20 s na busca oficial do conselho, marca o resultado,
enxerga repetidos antigos e sabe quando um lead voltou a usar o demo.

## Fazer
1. `src/config/creciConsulta.ts`: UF → página oficial de busca (conferidas em 2026-09-19):
   - `https://www.creci{uf}.conselho.net.br/form_pesquisa_cadastro_geral_site.php` para RO, RJ,
     PE, GO, BA, SC, PA, MS, CE, SE, RN, AM, MT, MA, PB, AL, PI, AC, RR, AP;
   - PR `https://www.crecipr.gov.br/pesquisa-credenciados` · DF `https://crecidf.gov.br/localizar-corretor/`
     · SP `https://www.crecisp.gov.br/cidadao/buscaporcorretores` · RS
     `https://www.creci-rs.gov.br/siteNovo/pesquisaInscrito.php` · ES
     `https://area-restrita.crecies.gov.br/pesquisa-de-corretor-imobiliaria` · MG
     `https://crecimg.spiderware.com.br/spw/consultacadastral/Principal.aspx` · TO
     `https://crecito.gov.br/` (sem página de busca direta).
   CRECI sem UF (legado) → UF provável pelo DDD do WhatsApp, rotulada "provável".
2. **Ficha do lead** — bloco CRECI: número + botão **copiar número** + link **"Conferir no
   CRECI-PE ↗"** (nova aba, `rel="noopener noreferrer"`) + **✓ Confere** / **✗ Não confere** /
   desfazer, com "conferido em dd/mm". Nome do lead no topo (já existe).
3. **Lista**: selo ao lado do CRECI (✓ verde / ✗ vermelho); selo **"repetido"** quando outro lead
   da lista tem o mesmo WhatsApp ou a mesma chave de CRECI (função pura — cobre os repetidos que
   já existem no banco); nome em destaque quando houver (e-mail embaixo).
4. **Voltou ao demo**: ficha mostra "Último acesso ao demo: dd/mm hh:mm"; lista mostra o selo
   "voltou ao demo" quando o último acesso é dos últimos 7 dias e veio pelo menos 1 h depois da
   primeira verificação.
5. Busca da lista passa a achar pelo nome (se ainda não acha).

## Pronto quando
- [ ] Testes: mapa cobre as 27 UFs com URL https; UF provável pelo DDD; repetidos (telefone e
      chave de CRECI, legado sem UF); regra do "voltou ao demo" (relógio injetável).
- [ ] `tsc` + testes verdes; arquivos de `src/app/admin` ≤ 300 linhas; desktop e 390 px sem
      estouro lateral.
