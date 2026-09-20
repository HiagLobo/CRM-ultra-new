/**
 * GET /api/avaliacoes — o que a landing mostra: média, quantidade e os
 * comentários no ar. **Público, sem cookie.**
 *
 * O que NUNCA sai daqui (provado em teste): e-mail de quem quer que seja, nome
 * de quem escolheu `anônimo`, CRECI de quem não escolheu `nome + CRECI` e o
 * texto de avaliação `pendente` ou `recusado`.
 *
 * `media`/`quantas` são só do BANCO. As três avaliações que continuam em
 * `src/content/depoimentos.ts` (decisão F4) são somadas por quem exibe — a API
 * não importa aquele arquivo.
 *
 * Cache de 60 s na borda: a landing é a página mais visitada, e a média não
 * precisa ser do segundo. `force-dynamic` porque a lista vem do banco, e não
 * do build.
 */
import { NextResponse } from "next/server";
import { leadStore } from "@/lib/criarLeadStore";
import { avaliacaoStore } from "@/lib/criarAvaliacaoStore";
import { causaDoErro } from "@/lib/erros";
import { vitrine } from "@/features/avaliacao";

export const runtime = "nodejs"; // o store (arquivo/pg) exige runtime Node
export const dynamic = "force-dynamic";

const CACHE = "s-maxage=60, stale-while-revalidate=300";

export async function GET() {
  try {
    const dados = await vitrine({ avaliacoes: avaliacaoStore(), leads: leadStore() });
    return NextResponse.json(dados, { headers: { "Cache-Control": CACHE } });
  } catch (err) {
    // a vitrine não pode derrubar a landing: o erro vira 500 sem detalhe e a
    // tela cai para as avaliações do arquivo (decisão F4)
    const causa = causaDoErro(err);
    console.error("[/api/avaliacoes] GET:", causa);
    return NextResponse.json({ ok: false, erro: "falha_interna" }, { status: 500 });
  }
}
