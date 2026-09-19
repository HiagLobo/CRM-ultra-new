/**
 * "Já tenho cadastro" (O9·S2): `POST /api/lead/entrar` e o reenvio do código
 * pelo caminho de onde a pessoa veio — cadastro reenvia o cadastro com os
 * mesmos dados; entrar reenvia só o e-mail.
 *
 * Regra: PII (e-mail, telefone, CRECI, código) NUNCA vai para o console.
 */
import {
  FALHA_REDE,
  codigoDevDe,
  falhaComum,
  postar,
  sinaisAntiRobo,
  solicitarAcesso,
  type AntiRobo,
  type Atualizacao,
  type DadosSolicitacao,
  type FalhaComum,
} from "./api";
import { MENSAGEM_CRECI_EM_USO, MENSAGEM_ENVIO_INDISPONIVEL, MENSAGEM_SEM_CADASTRO, mensagemTelefoneEmUso } from "./mensagens";

export type ResultadoEntrar =
  | { status: "enviado"; codigoDev?: string }
  /** 404: nenhum cadastro com esse e-mail — a tela oferece o cadastro. */
  | { status: "sem_cadastro" }
  /** 503: provedor fora, envio falhou/estourou o prazo ou teto do dia — a tela oferece o WhatsApp. */
  | { status: "envio_indisponivel"; mensagem: string }
  | FalhaComum;

/** `POST /api/lead/entrar` — manda um código para quem já tem cadastro. */
export async function entrarComEmail(email: string, antiRobo: AntiRobo = {}): Promise<ResultadoEntrar> {
  const r = await postar("/api/lead/entrar", { email, ...sinaisAntiRobo(antiRobo) });
  if (!r) return FALHA_REDE;
  const { res, corpo } = r;

  if (res.ok && corpo?.ok) {
    // fora do contrato, mas honesto: se um dia vier "sem código", a tela não finge que enviou
    if (corpo.status === "recebido_sem_codigo") return { status: "envio_indisponivel", mensagem: MENSAGEM_ENVIO_INDISPONIVEL };
    return { status: "enviado", codigoDev: codigoDevDe(corpo) };
  }
  if (corpo?.erro === "sem_cadastro") return { status: "sem_cadastro" };
  if (corpo?.erro === "envio_indisponivel") return { status: "envio_indisponivel", mensagem: MENSAGEM_ENVIO_INDISPONIVEL };
  return falhaComum(res, corpo);
}

/** De onde veio o código — decide o reenvio e o que vai junto no `verify`. */
export type PedidoCodigo =
  | {
      tipo: "cadastro";
      dados: DadosSolicitacao;
      /** O e-mail já tinha cadastro antes deste fluxo: a tela avisa que o código é para entrar. */
      existente: boolean;
      /** O servidor não regravou nada no pedido: nome/WhatsApp/CRECI vão no `verify`. */
      atualizar: boolean;
    }
  | { tipo: "entrar"; email: string };

export function emailDoPedido(pedido: PedidoCodigo): string {
  return pedido.tipo === "cadastro" ? pedido.dados.email : pedido.email;
}

/** O que vai como `atualizacao` no `verify` — só no cadastro de e-mail que já existia. */
export function atualizacaoDoPedido(pedido: PedidoCodigo): Atualizacao | undefined {
  if (pedido.tipo !== "cadastro" || !pedido.atualizar) return undefined;
  const { nome, telefone, creci } = pedido.dados;
  return { nome, telefone, creci };
}

export type ResultadoReenvio =
  | { status: "enviado"; codigoDev?: string }
  /** O código novo não saiu (202 do cadastro ou 503 do entrar): um anterior no prazo segue valendo. */
  | { status: "sem_codigo"; mensagem: string }
  | { status: "limitado"; mensagem: string }
  | { status: "erro"; mensagem: string };

/** "Reenviar código": chama o MESMO endpoint do passo de origem, com os mesmos dados. */
export async function reenviarCodigo(pedido: PedidoCodigo, antiRobo: AntiRobo = {}): Promise<ResultadoReenvio> {
  const r =
    pedido.tipo === "cadastro" ? await solicitarAcesso(pedido.dados, antiRobo) : await entrarComEmail(pedido.email, antiRobo);
  switch (r.status) {
    case "enviado":
      return { status: "enviado", codigoDev: r.codigoDev };
    case "recebido_sem_codigo":
    case "envio_indisponivel":
      return { status: "sem_codigo", mensagem: r.mensagem };
    case "limitado":
      return { status: "limitado", mensagem: r.mensagem };
    // no reenvio o e-mail já é conhecido, então repetido/sem cadastro não deveriam voltar — mas, se voltarem, a tela diz
    case "telefone_em_uso":
      return { status: "erro", mensagem: mensagemTelefoneEmUso(r.dica) };
    case "creci_em_uso":
      return { status: "erro", mensagem: MENSAGEM_CRECI_EM_USO };
    case "sem_cadastro":
      return { status: "erro", mensagem: MENSAGEM_SEM_CADASTRO };
    default:
      return { status: "erro", mensagem: r.mensagem };
  }
}
