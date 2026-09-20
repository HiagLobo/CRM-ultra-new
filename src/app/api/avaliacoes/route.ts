/**
 * GET /api/avaliacoes — o que a landing mostra: média, quantidade e os
 * comentários no ar. **Público, sem cookie.**
 *
 * O que NUNCA sai daqui (provado em teste): e-mail de quem quer que seja, nome
 * de quem escolheu `anônimo`, CRECI de quem não escolheu `nome + CRECI` e o
 * texto de avaliação `pendente` ou `recusado`.
 *
 * `media`/`quantas` já vêm SOMADAS: banco + as três avaliações que continuam
 * em `src/content/depoimentos.ts` (decisão F4). Quem exibe usa o número como
 * ele chega e nunca soma o arquivo de novo.
 *
 * **Cache**: a rota é `force-dynamic` (a lista vem do banco, não do build), e o
 * Next carimba `no-store` nesse caso — o `s-maxage` que tentamos mandar era
 * ignorado pela borda (conferido em produção em 2026-09-20). Então a proteção
 * do banco mora aqui: a resposta boa fica 60 s na memória da função, que a
 * plataforma reaproveita entre requisições. Erro nunca é guardado, e uma
 * avaliação nova aparece no site em até 1 minuto.
 */
import { NextResponse } from "next/server";
import { leadStore } from "@/lib/criarLeadStore";
import { avaliacaoStore } from "@/lib/criarAvaliacaoStore";
import { causaDoErro } from "@/lib/erros";
import { vitrine } from "@/features/avaliacao";
import { guardarVitrine, vitrineGuardada } from "./cacheVitrine";

export const runtime = "nodejs"; // o store (arquivo/pg) exige runtime Node
export const dynamic = "force-dynamic";

export async function GET() {
  const agora = Date.now();
  const guardado = vitrineGuardada(agora);
  if (guardado) return NextResponse.json(guardado);

  try {
    const dados = await vitrine({ avaliacoes: avaliacaoStore(), leads: leadStore() });
    guardarVitrine(dados, agora);
    return NextResponse.json(dados);
  } catch (err) {
    // a vitrine não pode derrubar a landing: o erro vira 500 sem detalhe e a
    // tela cai para as avaliações do arquivo (decisão F4)
    const causa = causaDoErro(err);
    console.error("[/api/avaliacoes] GET:", causa);
    return NextResponse.json({ ok: false, erro: "falha_interna" }, { status: 500 });
  }
}
