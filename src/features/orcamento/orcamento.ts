/**
 * Domínio do orçamento (O11) — tipos, numeração e formatação. Puro e
 * CLIENT-SAFE (sem fs, sem crypto, sem env): a mesma função que escreve
 * "R$ 1.784,99" no painel escreve no documento A4.
 *
 * O registro guarda o PREÇO DO DIA: `itens`, `totais` e `condicoes` são um
 * retrato do que foi proposto. Mudar a `tabela.ts` depois não mexe em orçamento
 * já emitido, e é por isso que nada aqui recalcula na leitura.
 */
import type { CodigoExtra, NivelAssento, PublicoOrcamento, Recorrencia } from "./tabela";
import type { FranquiaDoDia } from "./inclusos";

/** Situação da proposta no funil do orçamento. */
export const STATUS_ORCAMENTO = ["rascunho", "enviado", "aceito", "recusado"] as const;
export type StatusOrcamento = (typeof STATUS_ORCAMENTO)[number];

export const ROTULO_STATUS: Record<StatusOrcamento, string> = {
  rascunho: "Rascunho",
  enviado: "Enviado",
  aceito: "Aceito",
  recusado: "Recusado",
};

/** Uma linha do orçamento, com o preço unitário do dia já congelado. */
export interface ItemOrcamento {
  tipo: "assento" | "extra" | "implantacao";
  /** `pro`/`ultra` no assento, o código do extra no extra, `implantacao` nela. */
  codigo: NivelAssento | CodigoExtra | "implantacao";
  /** O que o cliente lê na linha. */
  descricao: string;
  quantidade: number;
  unitarioCentavos: number;
  totalCentavos: number;
  /** Só no assento: a faixa da escada que gerou o preço. */
  faixa?: string;
  /** Só no extra: entra todo mês ou é cobrança única. */
  recorrencia?: Recorrencia;
}

/**
 * A implantação da proposta, em duas partes: entrada na assinatura e saldo na
 * conclusão. Não é diluída em 12 meses e não volta se o cliente sair (decisão
 * do fundador em 2026-09-20).
 */
export interface ImplantacaoOrcamento {
  totalCentavos: number;
  entradaCentavos: number;
  saldoCentavos: number;
  entradaPct: number;
}

export interface TotaisOrcamento {
  /** Assentos antes do desconto. */
  assentosCentavos: number;
  /** Quanto o desconto tirou (só da linha de assento). */
  descontoCentavos: number;
  /** Extras que entram todo mês. */
  extrasMensaisCentavos: number;
  /** Extras de cobrança única (pacotes, migração de lote, turma extra). */
  extrasUnicosCentavos: number;
  /** Assentos com desconto + extras mensais. */
  mensalCentavos: number;
  /** Mensal x 12, ou x 10 no anual. */
  anoCentavos: number;
  /** Os 2 meses que o anual poupa (0 no mensal). */
  economiaAnualCentavos: number;
  /** Implantação cobrada (0 quando isenta). */
  implantacaoCentavos: number;
  /** Implantação de tabela, mesmo quando isenta: o documento mostra o que foi abatido. */
  implantacaoCheiaCentavos: number;
  /** Parte paga na assinatura. Centavo quebrado fica aqui, nunca no saldo. */
  implantacaoEntradaCentavos: number;
  /** Parte paga na conclusão da implantação. */
  implantacaoSaldoCentavos: number;
}

/** As condições do dia, escritas junto com os valores. */
export interface CondicoesOrcamento {
  assentos: { pro: number; ultra: number };
  /** Só na rede: unidades ativas (entram no mínimo e na implantação). */
  unidades?: number;
  descontoPct: number;
  anual: boolean;
  implantacaoIsenta: boolean;
  condicaoFundador: boolean;
  /** Pisos do dia, para o documento e para conferência depois. */
  pisos: Record<NivelAssento, number>;
  /** Preço efetivo por assento, já com desconto (0 no nível sem assento). */
  efetivoPorAssento: Record<NivelAssento, number>;
  validadeDias: number;
  /** Quanto da implantação entra na assinatura (o resto é saldo na conclusão). */
  entradaPct: number;
  /** O desconto passou do limite que o painel avisa. */
  descontoAlto: boolean;
  /**
   * O que foi prometido por escrito, copiado da tabela no dia da emissão (só
   * os níveis contratados). Ausente em registro gravado antes da O11·S2.
   */
  inclusos?: { pro?: string[]; ultra?: string[] };
  /** Franquias de uso e preço do excedente, também do dia da emissão. */
  franquias?: FranquiaDoDia[];
}

export interface Orcamento {
  id: string;
  /** `ORC-AAAA-NNN`, sequencial por ano, gerado no servidor. */
  numero: string;
  leadId: string;
  publico: PublicoOrcamento;
  status: StatusOrcamento;
  itens: ItemOrcamento[];
  totais: TotaisOrcamento;
  condicoes: CondicoesOrcamento;
  /** `AAAA-MM-DD` — até quando a proposta vale. */
  validadeEm: string;
  observacao?: string;
  criadoEm: string;
  atualizadoEm: string;
  /** Quando foi marcado como enviado (a 1ª vez fica). */
  enviadoEm?: string;
}

/**
 * A implantação do registro remontada em um objeto só (o documento e a tela
 * pedem as três partes juntas). Lê o que está gravado, nunca recalcula.
 */
export function implantacaoDoOrcamento(
  totais: Pick<TotaisOrcamento, "implantacaoCentavos" | "implantacaoEntradaCentavos" | "implantacaoSaldoCentavos">,
  condicoes: Pick<CondicoesOrcamento, "entradaPct">,
): ImplantacaoOrcamento {
  return {
    totalCentavos: totais.implantacaoCentavos,
    entradaCentavos: totais.implantacaoEntradaCentavos,
    saldoCentavos: totais.implantacaoSaldoCentavos,
    entradaPct: condicoes.entradaPct,
  };
}

/**
 * Situação vinda do banco. Desconhecida (linha mexida à mão, versão futura) →
 * `rascunho`: na dúvida, a proposta não consta como enviada nem aceita.
 */
export function normalizarStatusOrcamento(valor: unknown): StatusOrcamento {
  return STATUS_ORCAMENTO.find((s) => s === valor) ?? "rascunho";
}

const PUBLICOS_CONHECIDOS: readonly PublicoOrcamento[] = ["autonomo", "imobiliaria", "rede"];

/** Público vindo do banco. Desconhecido → `imobiliaria` (o caso mais comum). */
export function normalizarPublico(valor: unknown): PublicoOrcamento {
  return PUBLICOS_CONHECIDOS.find((p) => p === valor) ?? "imobiliaria";
}

export const PREFIXO_NUMERO = "ORC";

/** `ORC-2026-007` — três dígitos, mais quando passar de 999 (nunca corta). */
export function formatarNumero(ano: number, sequencia: number): string {
  return `${PREFIXO_NUMERO}-${ano}-${String(sequencia).padStart(3, "0")}`;
}

/** A sequência daquele número, ou 0 se não for um número deste ano. */
export function sequenciaDoNumero(numero: string, ano: number): number {
  const m = new RegExp(`^${PREFIXO_NUMERO}-${ano}-(\\d+)$`).exec(numero);
  return m ? Number(m[1]) : 0;
}

/**
 * Próximo número do ano, olhando os que já existem. A corrida é resolvida por
 * quem grava (fila no arquivo, índice único no Postgres): aqui é só a conta.
 */
export function proximoNumero(ano: number, usados: readonly string[]): string {
  const maior = usados.reduce((maximo, n) => Math.max(maximo, sequenciaDoNumero(n, ano)), 0);
  return formatarNumero(ano, maior + 1);
}

/** O ano do orçamento é o do fuso de Recife, onde o fundador trabalha. */
const FORMATO_DIA_RECIFE = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Recife",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** `AAAA-MM-DD` do instante, no fuso de Recife (o dia que o fundador vê). */
export function diaEmRecife(quando: Date): string {
  const parte: Record<string, string> = {};
  for (const { type, value } of FORMATO_DIA_RECIFE.formatToParts(quando)) parte[type] = value;
  return `${parte.year}-${parte.month}-${parte.day}`;
}

export function anoEmRecife(quando: Date): number {
  return Number(diaEmRecife(quando).slice(0, 4));
}

/** Dia `AAAA-MM-DD` + dias corridos, sem fuso (é um dia, não um instante). */
export function diaMaisDias(dia: string, dias: number): string {
  const [ano, mes, d] = dia.split("-").map(Number);
  const base = new Date(Date.UTC(ano ?? 1970, (mes ?? 1) - 1, d ?? 1));
  base.setUTCDate(base.getUTCDate() + dias);
  return base.toISOString().slice(0, 10);
}

/**
 * Centavos → `R$ 1.784,99`. Inteiro entra, inteiro sai: nenhuma divisão em
 * ponto flutuante no meio do caminho (o `Intl` recebe reais e centavos já
 * separados). Valor negativo sai com o sinal na frente.
 */
export function formatarReais(centavos: number): string {
  const inteiro = Math.trunc(Math.abs(centavos));
  const reais = Math.floor(inteiro / 100);
  const resto = inteiro % 100;
  const sinal = centavos < 0 ? "-" : "";
  const milhar = reais.toLocaleString("pt-BR", { useGrouping: true, maximumFractionDigits: 0 });
  return `${sinal}R$ ${milhar},${String(resto).padStart(2, "0")}`;
}

/** Dia `AAAA-MM-DD` → `dd/mm/aaaa`. Fora do formato, sai como veio. */
export function diaBR(dia: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dia);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : dia;
}
