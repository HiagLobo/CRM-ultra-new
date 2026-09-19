/**
 * Respostas comuns das rotas `/api/admin/*` — o mesmo formato em todas, e o
 * 500 sempre com a causa segura no log (`causaDoErro`), nunca o erro cru:
 * a mensagem do Postgres traz os valores da linha (e-mail, telefone).
 *
 * Não é rota (não exporta handler): a authz continua em cada `route.ts`.
 */
import { NextResponse, type NextRequest } from "next/server";
import type { ZodError } from "zod";
import { causaDoErro } from "@/lib/erros";

export type CorpoLido = { ok: true; corpo: unknown } | { ok: false; resposta: NextResponse };

/** Corpo JSON da requisição; ilegível → 400 `json_invalido` pronto para devolver. */
export async function lerJson(req: NextRequest): Promise<CorpoLido> {
  try {
    return { ok: true, corpo: await req.json() };
  } catch {
    return { ok: false, resposta: NextResponse.json({ ok: false, erro: "json_invalido" }, { status: 400 }) };
  }
}

/** 400 com as mensagens por campo (as do schema — nenhuma repete o valor recebido). */
export function dadosInvalidos(erro: ZodError): NextResponse {
  const { fieldErrors, formErrors } = erro.flatten();
  return NextResponse.json(
    { ok: false, erro: "dados_invalidos", campos: fieldErrors, ...(formErrors.length ? { gerais: formErrors } : {}) },
    { status: 400 },
  );
}

export function leadNaoEncontrado(): NextResponse {
  return NextResponse.json({ ok: false, erro: "lead_nao_encontrado" }, { status: 404 });
}

/** 500 genérico; o log leva `[rota] MÉTODO:` + a causa (ex.: `db:42P01`), nada do erro em si. */
export function falhaInterna(onde: string, erro: unknown): NextResponse {
  const causa = causaDoErro(erro, "admin");
  console.error(`${onde}:`, causa);
  return NextResponse.json({ ok: false, erro: "falha_interna" }, { status: 500 });
}
