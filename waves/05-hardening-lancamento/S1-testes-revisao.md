# O5 · S1 — Testes & revisão final

## O que entrega (negócio)
Confiança para lançar: os caminhos críticos têm teste, nada vaza PII, e o código passou por uma
revisão final com a régua de bloqueadores.

## Revalidação ao iniciar
- [ ] O0–O4 concluídas? Testes de cada onda existem (consolidar)?

## Mapear (≤5 linhas)
- Entrega: suíte consolidada + relatório de revisão. Sem PII.
- Cria/ajusta: testes faltantes; script de teste no `package.json`. Não muda comportamento.
- Caminho simples: rodar tudo, cobrir buracos, revisar com checklist do PROTOCOLO.

## Pode tocar
- Arquivos `*.test.ts` das features · `package.json` (script `test`) · pequenas correções pontuais
  apontadas pela revisão (registrar cada uma)

## Checklist de testes mínimos (cobertura-alvo)
- [ ] **Lead/Zod**: input inválido (e-mail/telefone/CRECI) → rejeita.
- [ ] **Envio**: happy (fallback dev mostra código); rate-limit barra 4º envio; sem PII em log.
- [ ] **Verificação**: certo → token; errado → tentativa; expirado (clock fake) → 410; excedido → bloqueia.
- [ ] **Token**: assinado verifica; adulterado falha.
- [ ] **Admin**: sem cookie → 401 em todas as rotas; senha errada → 401; rate-limit no login.
- [ ] **Sem PII**: grep nos testes garante que logs/response não trazem telefone/e-mail/CRECI/senha.
- [ ] **Marca**: `grep -ri "<marca antiga>" src` = 0 (regressão de branding).

## Passos
1. Rodar `build`+`typecheck`+`test`; listar lacunas; escrever os testes que faltam.
2. Revisão de PR final (formato do PROTOCOLO) por área sensível (lead/verificação/admin) — registrar
   veredicto e corrigir bloqueadores.
3. Conferir regra das 200 linhas (nenhum arquivo >300).

## Pronto quando
- [ ] `build`/`typecheck`/`test` verdes; cobertura mínima acima satisfeita.
- [ ] Revisão final sem bloqueadores; correções registradas no ESTADO.

## Não fazer
- Sem deploy ainda (S2).
