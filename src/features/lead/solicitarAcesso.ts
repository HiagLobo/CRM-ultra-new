/**
 * Caso de uso: solicitar acesso ao demo (criar o lead + disparar código).
 * Sem HTTP — as dependências (store, e-mail, rate-limit, anti-robô) são injetadas,
 * então é testável sem rede/Resend. A rota fina (POST /api/lead) só faz o wiring.
 *
 * Ordem (O7·S1, O9) — do mais barato ao mais caro, e nada é gravado antes de passar:
 * 1–3. isca → Turnstile → limite por e-mail e por IP (`portaria`);
 * 4. e-mail que JÁ tem lead → vira "entrar": só um código novo, nenhum dado
 *    regravado (os dados novos vão no verify, depois do código certo);
 * 5. e-mail novo com WhatsApp de outro lead → barrado, com a dica do e-mail
 *    mascarado do dono; CRECI de outro lead → barrado, SEM dica (o CRECI é
 *    público: a dica exporia o e-mail de outro corretor);
 * 6–8. provedor → teto diário → envio com prazo (`enviarComTeto`). Falhou →
 *    - e-mail NOVO: lead gravado SEM código (o fundador liga) → `recebido_sem_codigo`;
 *    - e-mail que JÁ tinha lead (ou criado por outro pedido nesse meio): nada é
 *      gravado → `envio_indisponivel` (a rota responde 503, nunca "recebemos seus
 *      dados": não havia nada a receber — emenda do contrato da O9);
 * 9. e-mail saiu → persiste o código novo (`novo` = este pedido criou o lead).
 */
import { formasEquivalentesCreci } from "./creci";
import { enviarComTeto, portaria, type Barrado, type DepsEnvioCodigo, type MotivoSemCodigo } from "./envioCodigo";
import { mascararEmail } from "./mascaraEmail";
import type { LeadInput, PedidoAcesso } from "./schema";
import { prepararSolicitacao } from "./lead";
import type { LeadStore } from "../../lib/leadStore";

export {
  REGRA_ENVIO_POR_EMAIL,
  REGRA_ENVIO_POR_IP,
  CHAVE_TETO_DIARIO,
  regraTetoDiario,
  PRAZO_ENVIO_CODIGO_MS,
} from "./envioCodigo";
export type { MotivoSemCodigo } from "./envioCodigo";

/** As mesmas dependências do "entrar" (a portaria e o envio são os mesmos). */
export type DepsSolicitarAcesso = DepsEnvioCodigo;

/** Cadastro barrado por repetido (O9). `dica`: e-mail mascarado do dono do WhatsApp, ou `null`. */
export type Repetido = { status: "telefone_em_uso"; dica: string | null } | { status: "creci_em_uso" };

export type ResultadoSolicitacao =
  /** `novo: false` = o e-mail já tinha lead (a rota responde `existente: true`). */
  | { status: "enviado"; novo: boolean; codigo: string }
  /** E-mail NOVO, código não saiu: lead gravado sem código. `causa` é categoria segura para log (sem PII). */
  | { status: "recebido_sem_codigo"; motivo: MotivoSemCodigo; causa: string }
  /** E-mail que JÁ tinha lead, código não saiu: nada gravado. `causa` idem. */
  | { status: "envio_indisponivel"; motivo: MotivoSemCodigo; causa: string }
  | Repetido
  | Barrado;

/**
 * WhatsApp e CRECI de um cadastro NOVO não podem ser de outro lead (O9 · F1, F2).
 * Sem índice UNIQUE (o banco já tem repetidos de teste): a regra mora aqui.
 */
async function acharRepetido(store: LeadStore, input: LeadInput): Promise<Repetido | null> {
  const dono = await store.buscarPorTelefone(input.telefone);
  if (dono) return { status: "telefone_em_uso", dica: dono.email ? mascararEmail(dono.email) : null };
  if (await store.buscarPorCreci(formasEquivalentesCreci(input.creci))) return { status: "creci_em_uso" };
  return null;
}

export async function solicitarAcesso(
  deps: DepsSolicitarAcesso,
  pedido: PedidoAcesso,
  ctx: { ip: string },
): Promise<ResultadoSolicitacao> {
  const agora = deps.agora ?? new Date();
  const { website, turnstileToken, ...input } = pedido;

  const barrado = await portaria(deps, { website, turnstileToken }, input.email, ctx.ip, agora);
  if (barrado) return barrado;

  const prep = await prepararSolicitacao(deps.store, input, { ip: ctx.ip, secret: deps.secret, agora });
  if (prep.novo) {
    const repetido = await acharRepetido(deps.store, input);
    if (repetido) return repetido;
  }

  const envio = await enviarComTeto(deps, input.email, prep.codigo, agora);
  if (envio.status === "nao_enviado") {
    const { motivo, causa } = envio;
    // e-mail que já tinha lead: nada a gravar (o código anterior, se no prazo, segue valendo)
    if (!prep.novo) return { status: "envio_indisponivel", motivo, causa };
    // lead novo: o contato fica gravado mesmo assim; a causa (sem PII) vai para o log.
    // Corrida (outro pedido criou o e-mail nesse meio): nada foi gravado → como acima.
    const gravacao = await prep.persistirSemCodigo();
    return gravacao === "criado"
      ? { status: "recebido_sem_codigo", motivo, causa }
      : { status: "envio_indisponivel", motivo, causa };
  }

  const gravacao = await prep.persistir();
  return { status: "enviado", novo: gravacao === "criado", codigo: prep.codigo };
}
