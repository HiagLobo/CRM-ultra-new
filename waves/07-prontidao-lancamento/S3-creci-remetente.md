# O7 · S3 — CRECI flexível, telefone colado e e-mail com remetente nomeado

## O que entrega (negócio)
Menos corretor travado no primeiro campo, e o e-mail do código chega com cara de produto
(remetente "CRM Ultra", link do site) — menos chance de ser ignorado ou cair no spam.

## Fazer
1. CRECI: normalizar antes de validar (tirar prefixo "CRECI", `/`, `.`, espaços extras); aceitar
   UF antes ou depois, sufixo F/J/E/PF/PJ com ou sem hífen, prefixo `J-`; rejeitar lixo sem dígitos.
   Guardar o valor normalizado. Mensagem com exemplo (`ex.: PE 12345-F`). Testes com os formatos
   reais do estudo (`CRECI-PE 12.345-F`, `CRECI 12345`, `12.345-F`, `J-12345`, `12345/SP`...).
2. Máscara do telefone: número colado com `+55`/`55` (12–13 dígitos) não é mais cortado.
3. `EMAIL_FROM` aceita `endereço` ou `Nome <endereço>` (sem quebrar o build); se vier só o
   endereço, o envio usa `"{brand.nomeCurto} <endereço>"`.
4. E-mail do código: `reply_to` = `brand.contato.email`; rodapé com o site (`brand.dominio`) e
   quem envia; validade vinda de `EXPIRACAO_CODIGO_MIN` (não cravada). Tela do código: "não
   chegou? confira spam/Promoções".

## Pronto quando
- [ ] Testes de CRECI (aceita/rejeita), telefone colado, `EMAIL_FROM` nos dois formatos.
- [ ] `tsc` + testes verdes.
