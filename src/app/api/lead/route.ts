/**
 * POST /api/lead — cadastro: captura o lead, carimba consentimento e dispara o código.
 * Rota fina: valida (Zod) e delega ao caso de uso `solicitarAcesso`, que decide
 * isca, Turnstile, limites, repetidos, teto diário e envio. Sem PII em log/response.
 * Em dev (sem Resend), devolve `codigoDev` para testar o fluxo.
 *
 * Respostas (O7·S1, O9):
 * - 200 `{ ok, status: "enviado", existente }` — o e-mail saiu. `existente: true` = o
 *   e-mail já tinha cadastro: virou "entrar" (nada foi regravado; os dados novos vão no verify).
 *   Robô: 200 `{ ok, status: "enviado" }` falso, sem `existente`;
 * - 202 `{ ok, status: "recebido_sem_codigo" }` — lead gravado, e-mail não saiu;
 * - 409 `{ ok: false, erro: "telefone_em_uso", dica }` — WhatsApp de outro lead; `dica` = e-mail
 *   mascarado do dono (`null` se ele não tem e-mail) · 409 `{ ok: false, erro: "creci_em_uso" }`;
 * - 400 dados inválidos · 403 anti-robô recusou · 429 limite · 503 anti-robô fora do ar · 500.
 *
 * O 500 loga a causa segura (O7·S2): `config:DATABASE_URL`, `db:42P01`,
 * `rede:ENOTFOUND`… — o RUNBOOK §6 diz o que fazer com cada uma.
 */
import { NextResponse, type NextRequest } from "next/server";
import { emailModoDev } from "@/lib/env";
import { ipDaRequisicao } from "@/lib/req";
import { causaDoErro } from "@/lib/erros";
import { PedidoAcessoSchema, solicitarAcesso } from "@/features/lead";
import { dadosInvalidos, depsEnvio, foiBarrado, lerCorpo, respostaBarrado } from "./acessoComum";

export const runtime = "nodejs"; // store/crypto exigem runtime Node (não Edge)
/**
 * Teto da função na Vercel, em segundos. Os prazos internos (Turnstile 5 s +
 * envio do código 8 s + banco) cabem com folga: a plataforma nunca corta a
 * requisição antes de o lead ser gravado.
 */
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const lido = await lerCorpo(req);
  if (!lido.ok) return lido.resposta;

  const parsed = PedidoAcessoSchema.safeParse(lido.corpo);
  if (!parsed.success) return dadosInvalidos(parsed.error.flatten().fieldErrors);

  try {
    const resultado = await solicitarAcesso(depsEnvio(), parsed.data, { ip: ipDaRequisicao(req) });
    if (foiBarrado(resultado)) return respostaBarrado(resultado);

    switch (resultado.status) {
      case "telefone_em_uso":
        return NextResponse.json({ ok: false, erro: "telefone_em_uso", dica: resultado.dica }, { status: 409 });
      case "creci_em_uso":
        return NextResponse.json({ ok: false, erro: "creci_em_uso" }, { status: 409 });
      case "recebido_sem_codigo": {
        // o lead está salvo; o log diz POR QUE o e-mail não saiu (categoria, sem PII)
        const causa = resultado.causa;
        console.error("[/api/lead] código não enviado; lead gravado sem código:", causa);
        return NextResponse.json({ ok: true, status: "recebido_sem_codigo" }, { status: 202 });
      }
      case "enviado":
        return NextResponse.json({
          ok: true,
          status: "enviado",
          existente: !resultado.novo,
          ...(emailModoDev ? { codigoDev: resultado.codigo } : {}),
        });
    }
  } catch (err) {
    // banco/config/bug: só a categoria (config:VAR, db:SQLSTATE, rede:errno) — nunca a
    // mensagem, que traz os valores da linha (e-mail, telefone) ou o host do banco.
    const causa = causaDoErro(err);
    console.error("[/api/lead] erro ao processar:", causa);
    return NextResponse.json({ ok: false, erro: "falha ao processar solicitação" }, { status: 500 });
  }
}
