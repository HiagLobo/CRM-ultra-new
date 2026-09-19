# O6 · S5 — Guardas de regressão e documentos

## O que entrega (negócio)
A limpeza não volta: o teste quebra se alguém reintroduzir qualquer resíduo do ex-cliente. E os
documentos do repositório deixam de citar o ex-cliente e as pessoas dele pelo nome.

## Pode tocar
- `src/lib/regressao.test.ts` · `README.md` · `HANDOFF-CLAUDE-CODE.md` (sai do repo) · `waves/**`

## Guardas novas (`regressao.test.ts`)
- SHA-256 das 15 imagens antigas: nenhum arquivo de `public/` pode ter esses hashes.
- Toda imagem raster de `public/` tem linha em `public/assets/CREDITOS.md`.
- Textos proibidos — comparados por **hash SHA-256** (o teste não guarda o dado que proíbe):
  nome/sigla do ex-cliente e das pessoas dele (em todo o repositório, docs inclusive);
  telefones/CEP/logradouros das unidades antigas, bios, superlativos, ofertas de comissão, o
  produto de garantia e empresas reais citadas (em `src/` e `public/`).
- Monogramas `AN`/`WT` em avatar; `crmultra.com.br` fora do `brand.ts`.
- Documentos (`README`, `waves/**`): sem o nome do ex-cliente nem de pessoas reais.

## Documentos
- `HANDOFF-CLAUDE-CODE.md` sai (briefing de uso único; o conteúdo vivo está em `waves/`).
- `waves/**`: ex-cliente e pessoas passam a ser citados genericamente ("ex-cliente",
  "pessoa real do ex-cliente"); caminhos do protótipo viram "protótipo original".
- `README.md`: Stack atualizada (Next 15.5); afirmação "pessoas do demo são fictícias" verdadeira.
- `00-INDEX.md`: O6 na tabela de ondas e no estado geral; §6 corrigido.

## Pronto quando
- [ ] Guardas novas falham se um resíduo for reintroduzido (conferido revertendo um caso).
- [ ] `build` + `typecheck` + testes verdes.
