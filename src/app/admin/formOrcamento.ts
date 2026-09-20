/**
 * O formulário do orçamento: o que a tela guarda, como vira o corpo do POST e
 * o que fazer com cada resposta. A CONTA nunca é refeita aqui — a prévia ao
 * vivo chama `calcularOrcamento`, a mesma função pura que o servidor usa para
 * gravar, e a validação usa o MESMO schema Zod do servidor.
 *
 * Puro (sem React), para o teste cobrir campo a campo.
 */
import {
  NovoOrcamentoSchema,
  calcularOrcamento,
  formatarReais,
  ROTULO_NIVEL,
  VALIDADE_PADRAO_DIAS,
  type CodigoExtra,
  type NovoOrcamento,
  type OrcamentoAdmin,
  type PedidoOrcamento,
  type PublicoOrcamento,
  type ResultadoCalculo,
} from "@/features/orcamento";
import type { Validacao } from "./formEtapa";
import { errosPorCampo, mensagemDeErro, type RespostaApi } from "./mensagensApi";

/** Tudo em texto: é o que o `input` guarda, e vazio conta como não informado. */
export interface FormOrcamento {
  publico: PublicoOrcamento;
  pro: string;
  ultra: string;
  /** Só na rede. */
  unidades: string;
  descontoPct: string;
  anual: boolean;
  implantacaoIsenta: boolean;
  condicaoFundador: boolean;
  validadeDias: string;
  observacao: string;
  /** Quantidade por extra; vazio ou 0 = não entra no orçamento. */
  extras: Partial<Record<CodigoExtra, string>>;
}

export type CampoOrcamento = "leadId" | "publico" | "assentos" | "unidades" | "descontoPct" | "extras" | "validadeDias" | "observacao";

export const CAMPOS_ORCAMENTO: readonly CampoOrcamento[] = [
  "leadId",
  "publico",
  "assentos",
  "unidades",
  "descontoPct",
  "extras",
  "validadeDias",
  "observacao",
];

export const FORM_ORCAMENTO_VAZIO: FormOrcamento = {
  publico: "imobiliaria",
  pro: "3",
  ultra: "0",
  unidades: "",
  descontoPct: "0",
  anual: false,
  implantacaoIsenta: false,
  condicaoFundador: false,
  validadeDias: String(VALIDADE_PADRAO_DIAS),
  observacao: "",
  extras: {},
};

/**
 * Texto do campo → número. Vazio vira o padrão; texto que não é número vira
 * `NaN`, que o Zod recusa com a mensagem do campo (em vez de virar 0 calado).
 */
function numeroDoCampo(texto: string, vazio: number): number {
  const limpo = texto.trim().replace(",", ".");
  if (limpo === "") return vazio;
  const n = Number(limpo);
  return Number.isFinite(n) ? n : Number.NaN;
}

/** Os extras com quantidade de verdade, na ordem em que o fundador marcou. */
export function extrasDoForm(form: FormOrcamento): { item: CodigoExtra; quantidade: number }[] {
  return Object.entries(form.extras)
    .map(([item, texto]) => ({ item: item as CodigoExtra, quantidade: numeroDoCampo(texto ?? "", 0) }))
    .filter((e) => e.quantidade > 0);
}

/** O corpo do POST, do jeito que a API espera (e que o Zod confere). */
export function corpoDoForm(form: FormOrcamento, leadId: string): Record<string, unknown> {
  const extras = extrasDoForm(form);
  return {
    leadId,
    publico: form.publico,
    assentos: { pro: numeroDoCampo(form.pro, 0), ultra: numeroDoCampo(form.ultra, 0) },
    descontoPct: numeroDoCampo(form.descontoPct, 0),
    anual: form.anual,
    implantacaoIsenta: form.implantacaoIsenta,
    condicaoFundador: form.condicaoFundador,
    validadeDias: numeroDoCampo(form.validadeDias, VALIDADE_PADRAO_DIAS),
    ...(form.publico === "rede" ? { unidades: numeroDoCampo(form.unidades, Number.NaN) } : {}),
    ...(extras.length ? { extras } : {}),
    ...(form.observacao.trim() ? { observacao: form.observacao } : {}),
  };
}

/** Confere com o schema do servidor; o erro aparece no campo antes de enviar. */
export function validarOrcamento(form: FormOrcamento, leadId: string): Validacao<NovoOrcamento, CampoOrcamento> {
  const r = NovoOrcamentoSchema.safeParse(corpoDoForm(form, leadId));
  if (r.success) return { ok: true, valor: r.data };
  const { fieldErrors } = r.error.flatten();
  const erros: Partial<Record<CampoOrcamento, string>> = {};
  for (const campo of CAMPOS_ORCAMENTO) {
    const mensagem = (fieldErrors as Partial<Record<CampoOrcamento, string[]>>)[campo]?.[0];
    if (mensagem) erros[campo] = mensagem;
  }
  return { ok: false, erros };
}

/** Número que serve para a prévia (o que ainda não é número conta como 0). */
const paraPrevia = (texto: string, vazio: number) => {
  const n = numeroDoCampo(texto, vazio);
  return Number.isFinite(n) ? n : 0;
};

/**
 * A prévia ao vivo: a MESMA função do servidor, com os números do formulário.
 * Recusa (piso, mínimo, sem assento) também é prévia: a tela mostra o motivo
 * antes de o fundador tentar salvar.
 */
export function previaDoForm(form: FormOrcamento): ResultadoCalculo {
  const pedido: PedidoOrcamento = {
    publico: form.publico,
    assentos: { pro: paraPrevia(form.pro, 0), ultra: paraPrevia(form.ultra, 0) },
    descontoPct: paraPrevia(form.descontoPct, 0),
    anual: form.anual,
    implantacaoIsenta: form.implantacaoIsenta,
    condicaoFundador: form.condicaoFundador,
    extras: extrasDoForm(form),
    validadeDias: paraPrevia(form.validadeDias, VALIDADE_PADRAO_DIAS),
    ...(form.publico === "rede" ? { unidades: paraPrevia(form.unidades, 1) } : {}),
  };
  return calcularOrcamento(pedido);
}

/** O 409 do servidor (e a recusa da prévia) em português, com o número na frente. */
export function mensagemDaRecusa(corpo: unknown): string {
  const c = (corpo ?? {}) as { erro?: unknown; nivel?: unknown; piso?: unknown; efetivo?: unknown; minimo?: unknown; assentos?: unknown };
  if (c.erro === "abaixo_do_piso" && typeof c.piso === "number" && typeof c.efetivo === "number") {
    const nivel = c.nivel === "ultra" ? ROTULO_NIVEL.ultra : ROTULO_NIVEL.pro;
    return `Esse desconto fura o piso do ${nivel}: ficaria em ${formatarReais(c.efetivo)} por assento, e o mínimo é ${formatarReais(c.piso)}. Diminua o desconto.`;
  }
  if (c.erro === "assentos_abaixo_do_minimo" && typeof c.minimo === "number") {
    const lancados = typeof c.assentos === "number" ? ` (você lançou ${c.assentos})` : "";
    return `O mínimo faturável desse público é ${c.minimo} ${c.minimo === 1 ? "assento" : "assentos"}${lancados}.`;
  }
  if (c.erro === "sem_assentos") return "Lance pelo menos um assento Pro ou Ultra.";
  return "Esses números não fecham com a tabela. Confira os assentos e o desconto.";
}

/** A recusa da prévia usa a mesma frase do servidor (nada de dois textos para a mesma regra). */
export function mensagemDaPrevia(resultado: ResultadoCalculo): string | null {
  return resultado.ok ? null : mensagemDaRecusa(resultado);
}

/** O que a tela faz com a resposta do POST (201 · 409 · 404 · 400 · o resto). */
export type ResultadoOrcamentoTela =
  | { status: "ok"; orcamento: OrcamentoAdmin }
  | { status: "recusado"; mensagem: string }
  | { status: "invalido"; erros: Partial<Record<CampoOrcamento, string>> }
  | { status: "erro"; erro: string };

export function lerRespostaOrcamento(r: RespostaApi): ResultadoOrcamentoTela {
  const corpo = (r.corpo ?? {}) as { ok?: boolean; orcamento?: OrcamentoAdmin };
  if (r.status === 201 && corpo.ok === true && corpo.orcamento) return { status: "ok", orcamento: corpo.orcamento };
  if (r.status === 409) return { status: "recusado", mensagem: mensagemDaRecusa(r.corpo) };
  if (r.status === 400) {
    const erros = errosPorCampo(r.corpo, CAMPOS_ORCAMENTO);
    if (Object.keys(erros).length) return { status: "invalido", erros };
  }
  return { status: "erro", erro: mensagemDeErro(r, "salvar o orçamento") };
}

/** Duplicar: o formulário volta com as condições da proposta que já existe. */
export function formDoOrcamento(o: OrcamentoAdmin): FormOrcamento {
  const extras: Partial<Record<CodigoExtra, string>> = {};
  for (const item of o.itens) {
    if (item.tipo === "extra") extras[item.codigo as CodigoExtra] = String(item.quantidade);
  }
  return {
    publico: o.publico,
    pro: String(o.condicoes.assentos.pro),
    ultra: String(o.condicoes.assentos.ultra),
    unidades: o.condicoes.unidades === undefined ? "" : String(o.condicoes.unidades),
    descontoPct: String(o.condicoes.descontoPct),
    anual: o.condicoes.anual,
    // a isenção volta desmarcada quando veio do anual ou da condição de fundador:
    // marcá-la à mão é decisão de quem monta a proposta nova
    implantacaoIsenta: o.condicoes.implantacaoIsenta && !o.condicoes.anual && !o.condicoes.condicaoFundador,
    condicaoFundador: o.condicoes.condicaoFundador,
    validadeDias: String(o.condicoes.validadeDias),
    observacao: o.observacao ?? "",
    extras,
  };
}
