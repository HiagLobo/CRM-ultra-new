/**
 * O que a folha precisa de um orçamento e como ele chega da API da trilha A
 * (`GET /api/admin/orcamentos/[id]`). A resposta é entrada externa como
 * qualquer outra: passa por Zod antes de virar documento.
 *
 * Estrito no que o papel não pode errar. Falta de assentos, de franquias ou do
 * que está incluso **recusa o documento** (a proposta sairia com preço e sem
 * linha, ou com bloco obrigatório vazio). O que é enfeite (rótulo pronto,
 * observação) continua opcional.
 *
 * A API manda código e rótulo lado a lado (`situacao`/`situacaoRotulo`,
 * `publico`/`publicoRotulo`, `assentos[].codigo`/`assentos[].nivel`): o
 * documento imprime o rótulo e decide pelo código.
 *
 * Valores em REAIS (179 = R$ 179,00), como a tabela oficial. São os preços
 * gravados no orçamento (o preço do dia), nunca recalculados aqui.
 */
import { z } from "zod";
import { diaValido } from "@/features/lead/funil";

export const NIVEIS = ["pro", "ultra"] as const;
export type Nivel = (typeof NIVEIS)[number];

export const SITUACOES = ["rascunho", "enviado", "aceito", "recusado"] as const;
export type Situacao = (typeof SITUACOES)[number];

/** Como cada situação aparece na barra do painel, quando a API não manda rótulo. */
export const ROTULO_SITUACAO: Record<Situacao, string> = {
  rascunho: "Rascunho",
  enviado: "Enviado",
  aceito: "Aceito",
  recusado: "Recusado",
};

/** Nome do nível, quando a API não manda rótulo. "Ultra" nunca vira "completo". */
export const ROTULO_NIVEL: Record<Nivel, string> = { pro: "Pro", ultra: "Ultra" };

const dinheiro = z.number().finite().nonnegative();
/** `AAAA-MM-DD` que existe no calendário (31/02 não passa). */
const dia = z.string().refine(diaValido, "data fora do formato AAAA-MM-DD");
/** Dia ou instante ISO: o documento só usa os 10 primeiros caracteres. */
const instante = z.string().refine((v) => diaValido(v.slice(0, 10)), "data fora do formato AAAA-MM-DD");

const itemAssento = z.object({
  codigo: z.enum(NIVEIS),
  /** Rótulo pronto da API ("Pro", "Ultra"). */
  nivel: z.string().min(1),
  /** Faixa da escada ("1o e 2o assento"). */
  faixa: z.string().optional(),
  quantidade: z.number().int().positive(),
  precoUnitario: dinheiro,
  total: dinheiro,
});
export type ItemAssento = z.infer<typeof itemAssento>;

const itemExtra = z.object({
  item: z.string().optional(),
  rotulo: z.string().min(1),
  quantidade: z.number().nonnegative(),
  precoUnitario: dinheiro,
  total: dinheiro,
});
export type ItemExtra = z.infer<typeof itemExtra>;

/** Franquia de uso e o preço do excedente, como a tabela oficial descreve. */
const franquia = z.object({
  rotulo: z.string().min(1),
  incluso: z.string().min(1),
  excedente: z.string().optional(),
});
export type Franquia = z.infer<typeof franquia>;

/**
 * Implantação: serviço entregue uma vez, pago em duas partes (entrada na
 * assinatura e saldo na conclusão). Ausente = isenta nesta proposta.
 */
const implantacao = z.object({
  total: dinheiro,
  entrada: dinheiro,
  saldo: dinheiro,
  entradaPct: z.number().min(0).max(100),
});
export type Implantacao = z.infer<typeof implantacao>;

export const orcamentoSchema = z.object({
  id: z.string().optional(),
  numero: z.string().min(1),
  situacao: z.enum(SITUACOES),
  situacaoRotulo: z.string().optional(),
  criadoEm: instante,
  validoAte: dia,
  cliente: z.object({
    nome: z.string().min(1),
    email: z.string().optional(),
    telefone: z.string().optional(),
  }),
  publico: z.string().optional(),
  publicoRotulo: z.string().optional(),
  /** Proposta com preço e sem linha de assento não vira papel. */
  assentos: z.array(itemAssento).min(1),
  extras: z.array(itemExtra).default([]),
  totais: z.object({
    mensal: dinheiro,
    anual: dinheiro,
    /** Economia dos 2 meses no anual. */
    economiaAnual: dinheiro.optional(),
    /** Formato antigo (só o número): a conferência recusa, porque falta entrada e saldo. */
    implantacao: dinheiro.optional(),
    /**
     * As três parcelas do mensal, como a trilha A calcula:
     * `assentos - desconto + extrasMensais = mensal`. A conferência usa isto;
     * sem elas (registro antigo) ela cai na leitura sem desconto.
     */
    assentos: dinheiro.optional(),
    desconto: dinheiro.optional(),
    extrasMensais: dinheiro.optional(),
    /** Cobrança única (pacote, migração de lote, turma extra): fora do mensal. */
    extrasUnicos: dinheiro.optional(),
  }),
  implantacao: implantacao.optional(),
  anual: z.boolean().default(false),
  descontoPct: z.number().default(0),
  condicaoFundador: z.boolean().default(false),
  unidades: z.number().int().nonnegative().optional(),
  observacao: z.string().optional(),
  /**
   * Copiados da `src/features/orcamento/tabela.ts` na emissão, como o preço.
   * Obrigatórios: sem eles a proposta sai sem dois blocos que o cliente lê.
   */
  inclusos: z.record(z.array(z.string())),
  franquias: z.array(franquia).min(1),
});

export type Orcamento = z.infer<typeof orcamentoSchema>;

/** Níveis contratados, na ordem da tabela, com o rótulo que a API mandou. */
export function niveisContratados(orcamento: Orcamento): { codigo: Nivel; rotulo: string }[] {
  return NIVEIS.filter((codigo) => orcamento.assentos.some((a) => a.codigo === codigo)).map((codigo) => ({
    codigo,
    rotulo: orcamento.assentos.find((a) => a.codigo === codigo)?.nivel ?? ROTULO_NIVEL[codigo],
  }));
}

/** Total de assentos da conta: é ele que define a faixa da escada. */
export function totalDeAssentos(orcamento: Orcamento): number {
  return orcamento.assentos.reduce((soma, a) => soma + a.quantidade, 0);
}
