# O2 · S2 — Fluxo de captura (form → código → verifica)

## O que entrega (negócio)
O "Acessar CRM" abre um passo a passo: o corretor informa e-mail, telefone e CRECI (com
consentimento), recebe o código, digita, e é liberado. É a ponte visual para a O1.

## Revalidação ao iniciar
- [ ] O1 responde (`POST /api/lead`, `POST /api/lead/verify`)? Em dev retorna `codigoDev`?
- [ ] `brand.*` para textos; CSS vars para estilo.

## Mapear (≤5 linhas)
- Entrega: componente de fluxo (stepper/modal) que consome a O1. PII no client (não logar no console).
- Cria: `src/components/acesso/AccessFlow.tsx` (+ passos). Liga: botões "Acessar CRM" (S1).
- Sem corrida. Caminho simples: 2 passos (dados → código), fetch nas rotas, estados claros.

## Pode tocar
- `src/components/acesso/AccessFlow.tsx` (novo) · `src/components/acesso/{StepDados,StepCodigo,StepOk}.tsx`
  (novos) · pontos que disparam o fluxo (Hero/Navbar da S1) · `src/lib/demoAccess.ts` (espelho leve do
  acesso liberado p/ a UI)

## Passos
1. **StepDados**: campos e-mail, telefone (máscara BR → E.164 no envio), CRECI; checkbox de
   **consentimento** com link de política; validação leve client; submit → `POST /api/lead`.
   Estados: carregando, erro (mensagem da API), sucesso → vai p/ StepCodigo. Em dev, se vier
   `codigoDev`, pré-exibir dica (só dev).
2. **StepCodigo**: input de 6 dígitos; botão verificar → `POST /api/lead/verify`; **reenviar**
   (respeita rate-limit, mostra contador); erros: inválido/expirado/excedido com texto claro.
   Sucesso → grava espelho em `demoAccess` (localStorage) e vai p/ StepOk.
3. **StepOk**: "acesso liberado" + leva para a escolha das 3 entradas (handoff p/ S3).
4. `demoAccess.ts`: `estaLiberado()` (lê flag), `liberar()`, `limpar()` — apenas UX; a verdade é o
   cookie httpOnly da O1.
5. Acessibilidade: foco no primeiro campo, labels, navegação por teclado.

## Pronto quando
- [ ] Fluxo completo funciona com o fallback dev (sem Resend configurado).
- [ ] Erros de cada etapa aparecem claros; reenviar respeita rate-limit.
- [ ] Consentimento é obrigatório para enviar. Nenhum PII logado no console.
- [ ] `build`/`typecheck` limpos.

## Não fazer
- Não decidir destino dos painéis aqui (S3). Sem admin (O4).
