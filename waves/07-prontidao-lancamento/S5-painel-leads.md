# O7 · S5 — Painel de leads prático

## O que entrega (negócio)
O fundador abre o `/admin`, acha o lead, fala com ele em um clique e marca o que fez. Simples.

## Fazer
1. Telefone vira link de **WhatsApp** (`https://wa.me/<dígitos>` com mensagem curta pré-preenchida
   citando o CRM Ultra); e-mail vira `mailto:`.
2. **Busca** (e-mail, telefone, CRECI) e **filtro por status** (Todos · Novos · Verificados ·
   Contatados · Descartados) no cliente, sobre a lista já carregada; contagem visível.
3. **CSV**: separador `;` (Excel em português abre em colunas), BOM mantido, todos os campos entre
   aspas, datas em `dd/mm/aaaa hh:mm` no fuso de Recife, telefone legível sem o apóstrofo de
   proteção (formato nacional não começa com `+`); neutralização de fórmula continua valendo.
4. API do admin devolve só o que a tela usa (sem hash do código, IP e texto de consentimento).
5. Login do admin: erro de servidor (5xx) aparece como "erro no servidor, tente de novo", não
   como "senha incorreta"; rota com try/catch e log da causa.
6. Arquivos acima de 300 linhas são bloqueador: dividir `PainelLeads` por responsabilidade.

## Pronto quando
- [ ] Testes: CSV (`;`, datas, telefone, injeção), DTO sem campos sensíveis, login 5xx.
- [ ] `tsc` + testes verdes; guarda de tamanho verde.
