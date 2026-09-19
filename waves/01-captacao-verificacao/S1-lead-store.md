# O1 · S1 — Lead + LeadStore + Zod

## O que entrega (negócio)
O domínio do lead: validar os dados de um corretor (e-mail, telefone, CRECI), guardar com
consentimento carimbado e poder ler/atualizar — tudo testável sem HTTP nem rede.

## Revalidação ao iniciar
- [ ] `src/lib/env.ts` existe (O0·S1)? `src/types/index.ts` editável?
- [ ] Confirmar diretório de dados: `data/` (criar; adicionar ao `.gitignore`).

## Mapear (≤5 linhas)
- Entrega: tipos + Zod + store de leads em arquivo. PII: e-mail/telefone/CRECI (não logar).
- Cria: `src/features/lead/schema.ts`, `lead.ts`, `lead.test.ts`, `index.ts`; `src/lib/leadStore.ts`;
  `src/types` (tipo Lead). Modifica: `.gitignore` (add `data/`).
- Sem corrida relevante (arquivo com escrita serializada). Caminho simples: Zod + funções puras + JSON.

## Pode tocar
- `src/features/lead/{schema,lead,lead.test,index}.ts` (novos) · `src/lib/leadStore.ts` (novo) ·
  `src/types/index.ts` (add `Lead`, `StatusLead`) · `.gitignore`

## Passos
1. `schema.ts`: `LeadInput` (email válido; telefone normalizado p/ **E.164**; CRECI não-vazio com
   formato leve `^[A-Za-z]{0,2}\s?\d{3,6}(-?\w)?$`); `consentimentoObrigatorio` (boolean true).
2. `leadStore.ts`: interface `LeadStore` + `FileLeadStore` (lê/escreve `data/leads.json` com escrita
   atômica — tmp+rename; fila simples p/ evitar corrida). Métodos: `criar`, `buscarPorEmail`,
   `atualizar`, `listar`.
3. `lead.ts`: `criarOuAtualizarLead(input, ctx{ip})` → upsert por e-mail; `registrarConsentimento`;
   `gerarCodigo()` (6 dígitos) + `hashCodigo()` (sha256+salt do `APP_SECRET`); nunca guardar código cru.
4. Testes: happy (cria+lê); inválido (Zod rejeita e-mail/telefone/CRECI ruins → erro 400-like);
   upsert (mesmo e-mail não duplica); **sem PII** (store serializa, mas teste garante que `hash` ≠ código).

## Pronto quando
- [ ] Criar/ler/atualizar lead funciona sobre `data/leads.json`.
- [ ] Zod rejeita entradas inválidas; telefone normalizado E.164.
- [ ] Código guardado só como **hash** (+ expiração/tentativas no objeto).
- [ ] `typecheck` limpo; testes verdes; `data/` no `.gitignore`.

## Não fazer
- Sem envio de e-mail (S2), sem rota HTTP ainda (a rota entra na S2), sem token (S3).
