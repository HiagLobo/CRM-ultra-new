/**
 * Passos do fluxo de acesso (O9·S2), puro e testado à parte:
 * cadastro ⇄ entrar → código → liberado.
 *
 * O formulário do cadastro mora aqui — em memória, nunca em storage — para
 * sobreviver às idas e vindas ("Corrigir meus dados", "Já tenho cadastro",
 * "Quero me cadastrar") sem a pessoa redigitar tudo.
 *
 * Resposta atrasada não troca de tela: o resultado de um pedido só vale no
 * passo que o fez (cadastro, entrar ou código). Se a pessoa já saiu dali, é ignorado.
 */
import { FORM_VAZIO, type FormCadastro } from "./cadastro";
import type { DadosSolicitacao } from "./api";
import type { PedidoCodigo } from "./apiEntrar";
import type { CampoNaoAtualizado } from "./mensagens";

export type Passo = "dados" | "entrar" | "codigo" | "ok";

export const TITULOS: Record<Passo, { titulo: string; etapa: string }> = {
  dados: { titulo: "Acessar a demonstração", etapa: "Passo 1 de 2" },
  entrar: { titulo: "Entrar na demonstração", etapa: "Passo 1 de 2" },
  codigo: { titulo: "Confirme seu e-mail", etapa: "Passo 2 de 2" },
  ok: { titulo: "Tudo certo", etapa: "" },
};

export interface EstadoFluxo {
  passo: Passo;
  form: FormCadastro;
  /** E-mail que o passo Entrar abre preenchido. */
  emailEntrar: string;
  /** E-mail mascarado do dono do WhatsApp repetido: orienta o passo Entrar. */
  dica: string | null;
  pedido: PedidoCodigo | null;
  codigoDev?: string;
  naoAtualizados: CampoNaoAtualizado[];
  /**
   * E-mails cujo cadastro ESTE fluxo criou (200 novo ou 202 sem código). Se o
   * servidor responder `existente` para um deles no reenvio ou depois de corrigir
   * os dados, é o cadastro que a pessoa acabou de fazer — não "já tinha cadastro".
   * Todos, não só o último: A → corrigir para B → voltar para A continua sendo dela.
   */
  emailsCriados: string[];
}

export type AcaoFluxo =
  | { tipo: "form"; form: FormCadastro }
  | { tipo: "ir_entrar"; email?: string; dica?: string | null }
  | { tipo: "ir_cadastro"; email?: string }
  /** 202: gravado sem código. Só e-mail novo chega aqui; `existente` é defesa, se um dia vier junto. */
  | { tipo: "cadastro_sem_codigo"; email: string; existente?: boolean }
  | { tipo: "cadastro_enviado"; dados: DadosSolicitacao; existente: boolean; codigoDev?: string }
  | { tipo: "entrar_enviado"; email: string; codigoDev?: string }
  | { tipo: "voltar" }
  | { tipo: "verificado"; naoAtualizados?: CampoNaoAtualizado[] };

export function estadoInicial(passo: "dados" | "entrar" = "dados"): EstadoFluxo {
  return { passo, form: FORM_VAZIO, emailEntrar: "", dica: null, pedido: null, naoAtualizados: [], emailsCriados: [] };
}

/** Guarda o e-mail na lista dos criados por este fluxo (sem repetir). */
function comCriado(estado: EstadoFluxo, email: string): string[] {
  return estado.emailsCriados.includes(email) ? estado.emailsCriados : [...estado.emailsCriados, email];
}

export function fluxo(estado: EstadoFluxo, acao: AcaoFluxo): EstadoFluxo {
  switch (acao.tipo) {
    case "form":
      return { ...estado, form: acao.form };
    case "ir_entrar":
      return { ...estado, passo: "entrar", emailEntrar: acao.email?.trim() ?? "", dica: acao.dica ?? null };
    case "ir_cadastro": {
      const email = acao.email?.trim();
      return { ...estado, passo: "dados", dica: null, form: email ? { ...estado.form, email } : estado.form };
    }
    case "cadastro_sem_codigo":
      if (estado.passo !== "dados" || acao.existente === true) return estado;
      return { ...estado, emailsCriados: comCriado(estado, acao.email) };
    case "cadastro_enviado": {
      if (estado.passo !== "dados") return estado;
      const criadoAqui = estado.emailsCriados.includes(acao.dados.email);
      return {
        ...estado,
        passo: "codigo",
        codigoDev: acao.codigoDev,
        pedido: { tipo: "cadastro", dados: acao.dados, existente: acao.existente && !criadoAqui, atualizar: acao.existente },
        emailsCriados: acao.existente ? estado.emailsCriados : comCriado(estado, acao.dados.email),
      };
    }
    case "entrar_enviado":
      if (estado.passo !== "entrar") return estado;
      return {
        ...estado,
        passo: "codigo",
        codigoDev: acao.codigoDev,
        pedido: { tipo: "entrar", email: acao.email },
        emailEntrar: acao.email,
      };
    case "voltar":
      return { ...estado, passo: estado.pedido?.tipo === "entrar" ? "entrar" : "dados", codigoDev: undefined };
    case "verificado":
      if (estado.passo !== "codigo") return estado;
      return { ...estado, passo: "ok", naoAtualizados: acao.naoAtualizados ?? [] };
  }
}
