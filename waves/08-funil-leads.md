# Onda 8 — Funil de leads e conversão

**Objetivo:** o `/admin` deixa de ser só uma lista e vira o lugar onde o fundador trabalha cada
contato até virar cliente — sem virar um CRM dentro do CRM. E o demo passa a ter próximo passo.
Decisões do fundador em 2026-09-19 (ver `08-funil-leads/00-PLANO.md`).

## Sub-entregas
- **S1 — Modelo e API do funil** (migração 004, etapas, retomar/perdido, próxima ação,
  anotações, cadastro manual) → `S1-modelo-api.md`
- **S2 — Painel: abas do funil, "Hoje", gaveta do lead e "+ Novo lead"** → `S2-painel.md`
- **S3 — Conversão: "Quero usar" no demo e origem da campanha (UTM)** → `S3-conversao.md`

## Critérios de aceite da onda
1. Etapas Novo → Em contato → Demonstração → Negociação → Cliente, mais **Retomar depois** (com
   data e motivo) e **Perdido** (com motivo); leads existentes migrados sem perda.
2. Aba **Hoje**: próximas ações vencidas/do dia, retornos do dia e novos sem contato há 24 h+.
3. Cada lead tem **anotações** (histórico) e **próxima ação** (data + texto).
4. **Cadastro manual** com canal (indicação/evento/WhatsApp/outro), base legal registrada, sem
   código de verificação; exclusão LGPD apaga lead **e** anotações.
5. Demo com botão **"Quero usar"** para o WhatsApp comercial; cadastro grava a **origem da
   campanha** (utm) e o admin mostra.
6. Migração 004 idempotente; código tolerante aos status antigos; RUNBOOK diz a ordem
   (migração **antes** do deploy).
7. `build` + `typecheck` + testes verdes; revisão de PR sem bloqueadores; conferência no navegador.

## Pendências fora de escopo
_(preencher na execução)_
