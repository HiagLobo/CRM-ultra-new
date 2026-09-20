/**
 * O que a folha precisa de um orçamento e como ele chega da API da trilha A
 * (`GET /api/admin/orcamentos/[id]`). A resposta é entrada externa como
 * qualquer outra: passa por Zod antes de virar documento.
 *
 * Tolerante de propósito. Obrigatório é só o que o papel não pode perder
 * (número, situação, datas, cliente e totais); o resto entra quando vier, para
 * a trilha A crescer o DTO sem quebrar a folha.
 *
 * Valores em REAIS (179 = R$ 179,00), como a tabela oficial da onda. Os preços
 * são os gravados no orçamento (o preço do dia), nunca recalculados aqui.
 */
import { z } from "zod";

export const NIVEIS = ["pro", "ultra"] as const;
export type Nivel = (typeof NIVEIS)[number];

export const SITUACOES = ["rascunho", "enviado", "aceito", "recusado"] as const;
export type Situacao = (typeof SITUACOES)[number];

/** Como cada situação aparece na barra do painel. */
export const ROTULO_SITUACAO: Record<Situacao, string> = {
  rascunho: "Rascunho",
  enviado: "Enviado",
  aceito: "Aceito",
  recusado: "Recusado",
};

/** Nome comercial de cada nível. "Ultra" nunca vira "completo": o produto ainda é demonstração. */
export const ROTULO_NIVEL: Record<Nivel, string> = { pro: "Pro", ultra: "Ultra" };

const dinheiro = z.number().finite();

const itemAssento = z.object({
  nivel: z.enum(NIVEIS),
  /** Faixa da escada ("1o e 2o assento"), quando a API mandar. */
  faixa: z.string().optional(),
  quantidade: z.number().int().nonnegative(),
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

/** Franquia de uso e o preço do excedente, do jeito que a tabela oficial descreve. */
const franquia = z.object({
  rotulo: z.string().min(1),
  incluso: z.string().min(1),
  excedente: z.string().optional(),
});
export type Franquia = z.infer<typeof franquia>;

export const orcamentoSchema = z.object({
  id: z.string().optional(),
  numero: z.string().min(1),
  situacao: z.enum(SITUACOES),
  criadoEm: z.string().min(1),
  validoAte: z.string().min(1),
  cliente: z.object({
    nome: z.string().min(1),
    email: z.string().optional(),
    telefone: z.string().optional(),
  }),
  publico: z.string().optional(),
  assentos: z.array(itemAssento).default([]),
  extras: z.array(itemExtra).default([]),
  totais: z.object({
    mensal: dinheiro,
    anual: dinheiro,
    implantacao: dinheiro.default(0),
    /** Economia dos 2 meses no anual, quando a API já calcula. */
    economiaAnual: dinheiro.optional(),
  }),
  anual: z.boolean().default(false),
  descontoPct: z.number().default(0),
  condicaoFundador: z.boolean().default(false),
  unidades: z.number().int().nonnegative().optional(),
  observacao: z.string().optional(),
  /**
   * O que está incluso em cada nível e as franquias de uso: nascem na
   * `src/features/orcamento/tabela.ts` (trilha A) e chegam pelo orçamento, que
   * grava o texto vigente na emissão. Ver `tabelaDaTrilhaA.ts`.
   */
  inclusos: z.record(z.array(z.string())).optional(),
  franquias: z.array(franquia).optional(),
});

export type Orcamento = z.infer<typeof orcamentoSchema>;

/** Níveis contratados, na ordem da tabela (Pro antes de Ultra), sem repetir. */
export function niveisContratados(orcamento: Orcamento): Nivel[] {
  return NIVEIS.filter((nivel) => orcamento.assentos.some((a) => a.nivel === nivel && a.quantidade > 0));
}

/** Total de assentos da conta: é ele que define a faixa da escada. */
export function totalDeAssentos(orcamento: Orcamento): number {
  return orcamento.assentos.reduce((soma, a) => soma + a.quantidade, 0);
}
