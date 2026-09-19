# O9 · S2 — Telas de acesso: nome, estado do CRECI, "Já tenho cadastro" e mensagens de repetido

## O que entrega (negócio)
O corretor se cadastra com nome, WhatsApp e CRECI do estado certo; quem já tem cadastro entra só
com o e-mail; e quem cai num repetido entende o que fazer em vez de travar.

## Fazer
1. **Cadastro** (`StepDados`): campos Nome completo · E-mail · WhatsApp · CRECI = **Estado**
   (lista das 27 UFs; pré-escolhe pelo DDD do WhatsApp enquanto a pessoa não mexer no Estado) +
   **Número** (aceita `12345`, `12345-F`, `12.345-J`). Envia `creci` = `"UF NÚMERO"`. Validação no
   cliente com o mesmo schema do servidor (`src/features/lead/schema.ts`, client-safe).
2. Link **"Já tenho cadastro"** no cadastro → passo **Entrar** (`StepEntrar`, novo): só e-mail
   (+ isca e Turnstile, como o cadastro) → `POST /api/lead/entrar` → passo do código.
   `404 sem_cadastro` → "Não achamos cadastro com esse e-mail." + botão **"Quero me cadastrar"**
   (volta ao cadastro com o e-mail já preenchido). `503` → mensagem + atalho do WhatsApp.
3. **Repetidos** (409 do `/api/lead`): `telefone_em_uso` com dica → "Esse WhatsApp já tem cadastro
   com m•••••a@provedor.com.br." + botão **"Entrar com esse e-mail"** (vai para Entrar); sem dica →
   "Esse WhatsApp já tem cadastro. Fale com a gente." + WhatsApp. `creci_em_uso` → "Esse CRECI já
   tem cadastro. Entre com o e-mail que você usou ou fale com a gente." + os dois atalhos.
4. **E-mail que já existe** (`existente: true`): o passo do código diz "Esse e-mail já tem
   cadastro — enviamos um código para você entrar." e o `verify` leva `atualizacao` com nome,
   WhatsApp e CRECI digitados. `naoAtualizados` na resposta → o passo final avisa ("Não
   atualizamos seu WhatsApp: ele já está em outro cadastro. Fale com a gente.").
5. **Acesso vencido** (`avisoAcesso`, vindo de um painel): o modal abre direto no **Entrar**.
   "Reenviar código" usa o endpoint do passo de origem (cadastro ou entrar).
6. Títulos/etapas: Entrar = "Entrar na demonstração" · "Passo 1 de 2".
7. Política de Privacidade: o **nome** entra na lista de dados coletados.

## Pronto quando
- [ ] Testes (funções puras e cliente da API): UF pelo DDD (todas as UFs; DDD desconhecido →
      vazio), montagem do `creci`, leitura de cada resposta nova (409 com/sem dica, `creci_em_uso`,
      `sem_cadastro`, `envio_indisponivel`, `existente`, `naoAtualizados`).
- [ ] `tsc` + testes verdes; celular 390 px sem estouro lateral; nada de PII em storage/console.
