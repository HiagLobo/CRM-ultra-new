/**
 * Caso de uso: "Já tenho cadastro" (O9) — quem já é lead entra só com o e-mail
 * e o código. Sem HTTP; a rota fina (POST /api/lead/entrar) só faz o wiring.
 *
 * Mesma ordem do pedido de acesso, com as MESMAS chaves de limite e o mesmo
 * teto diário: isca → Turnstile → limite → busca → provedor → teto → envio com
 * prazo → grava o código (`atualizarCodigo`: nada além do código muda).
 *
 * E-mail sem cadastro → `sem_cadastro` (decisão do fundador, F4: avisar e
 * oferecer o cadastro). A busca vem DEPOIS do limite: cada consulta gasta vaga,
 * então a porta não serve para varrer quem é lead.
 *
 * Diferente do cadastro, o envio que falha aqui não grava nada — o lead já
 * existe; a tela oferece o WhatsApp.
 */
import { enviarComTeto, portaria, type Barrado, type DepsEnvioCodigo, type MotivoSemCodigo } from "./envioCodigo";
import { novoCodigo } from "./lead";
import type { PedidoEntrar } from "./schema";

export type ResultadoEntrar =
  | { status: "enviado"; codigo: string }
  | { status: "sem_cadastro" }
  /** Provedor fora, falha/prazo do envio ou teto diário. `causa` é segura para log (sem PII). */
  | { status: "envio_indisponivel"; motivo: MotivoSemCodigo; causa: string }
  | Barrado;

export async function entrar(
  deps: DepsEnvioCodigo,
  pedido: PedidoEntrar,
  ctx: { ip: string },
): Promise<ResultadoEntrar> {
  const agora = deps.agora ?? new Date();
  const { website, turnstileToken, email } = pedido;

  const barrado = await portaria(deps, { website, turnstileToken }, email, ctx.ip, agora);
  if (barrado) return barrado;

  const lead = await deps.store.buscarPorEmail(email);
  if (!lead) return { status: "sem_cadastro" };

  const { codigo, registro } = novoCodigo(deps.secret, agora);
  const envio = await enviarComTeto(deps, email, codigo, agora);
  if (envio.status === "nao_enviado") {
    // o código anterior (se ainda vale) continua valendo: nada foi gravado
    return { status: "envio_indisponivel", motivo: envio.motivo, causa: envio.causa };
  }

  // só o código: o carimbo de quem já verificou fica (COALESCE), a etapa nem aparece
  await deps.store.atualizarCodigo(lead.id, { codigo: registro, atualizadoEm: agora.toISOString() });
  return { status: "enviado", codigo };
}
