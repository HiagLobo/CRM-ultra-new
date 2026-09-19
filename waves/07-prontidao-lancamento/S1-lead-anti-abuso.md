# O7 · S1 — Lead não se perde + anti-abuso + aviso de lead novo

## O que entrega (negócio)
Nenhum corretor que pediu acesso some porque o e-mail falhou; um robô não derruba a captação do
dia; o fundador fica sabendo quando entra lead novo.

## Mapear
- Hoje: `solicitarAcesso` prepara → envia → só então persiste; falha no Resend = lead perdido e 500.
- Rate-limit: 3/30 min somando e-mail E IP (IP apertado demais para escritório/CGNAT); sem teto global.

## Fazer
1. Falha no envio (erro do provedor) **ou** teto diário estourado → persistir o lead com status
   `novo` e código inutilizado (`SEM_CODIGO`), sem sobrescrever um código válido de lead existente;
   resposta distinta (ex.: `status: "recebido_sem_codigo"`), 202, mensagem honesta na UI
   ("Recebemos seus dados. O e-mail com o código não saiu agora — tente reenviar em alguns
   minutos ou fale com a gente"). Atualizar o teste que hoje exige "não cria lead órfão".
2. Teto global diário: chave `global:envio:dia`, `LIMITE_ENVIOS_DIA` (env, padrão 90).
3. Por IP: 10/30 min; por e-mail: 3/30 min (regras separadas).
4. Honeypot no `StepDados` (campo escondido, `tabIndex=-1`, `autoComplete="off"`, `aria-hidden`):
   preenchido → resposta de sucesso falsa, nada gravado, nada enviado.
5. Turnstile opcional: `NEXT_PUBLIC_TURNSTILE_SITE_KEY` + `TURNSTILE_SECRET_KEY` presentes →
   widget no form e verificação no servidor (`challenges.cloudflare.com/turnstile/v0/siteverify`);
   ausentes → não exige.
6. Aviso: `AVISO_LEADS_EMAIL` presente → ao verificar pela primeira vez (`!jaVerificado`), envia
   e-mail sem PII com link para `https://{brand.dominio}/admin`. Falha no aviso nunca quebra a
   verificação (loga a causa).

## Pronto quando
- [ ] Testes: envio falha → lead gravado sem código; teto diário barra o envio e grava; honeypot
      não grava; IP 10/e-mail 3; aviso só na 1ª verificação e sem PII no corpo.
- [ ] `tsc` + testes verdes.
