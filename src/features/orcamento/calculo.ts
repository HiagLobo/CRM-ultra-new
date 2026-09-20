/**
 * O cálculo do orçamento (O11) — função pura, sem HTTP e sem banco: o painel
 * calcula ao vivo e o servidor grava com a MESMA função, então a tela nunca
 * mostra um total diferente do que foi salvo.
 *
 * Tudo em centavos inteiros. O desconto vira centésimos de por cento
 * (`12,5% → 1250`) antes de qualquer conta: assim nenhuma divisão de ponto
 * flutuante entra no caminho do preço, e o arredondamento do preço final é
 * sempre para CIMA (`Math.ceil`), a favor de quem vende.
 *
 * Erro aqui é RESULTADO, não exceção: `sem_assentos`,
 * `assentos_abaixo_do_minimo`, `abaixo_do_piso` e `extra_desconhecido` voltam
 * como valor para a tela explicar e a rota devolver o status certo.
 */
import {
  DESCONTO_QUE_AVISA,
  ROTULO_NIVEL,
  TABELA,
  VALIDADE_PADRAO_DIAS,
  type CodigoExtra,
  type FaixaAssento,
  type NivelAssento,
  type PublicoOrcamento,
  type TabelaPrecos,
} from "./tabela";
import { implantacaoDoPorte, minimoFaturavel } from "./porte";
import { textosDoDia } from "./inclusos";
import type { CondicoesOrcamento, ImplantacaoOrcamento, ItemOrcamento, TotaisOrcamento } from "./orcamento";

export interface ExtraPedido {
  item: CodigoExtra;
  quantidade: number;
}

/** O que o painel manda calcular (o mesmo corpo do POST, sem o lead). */
export interface PedidoOrcamento {
  publico: PublicoOrcamento;
  assentos: { pro: number; ultra: number };
  descontoPct?: number;
  anual?: boolean;
  implantacaoIsenta?: boolean;
  /** Só na rede: unidades ativas. */
  unidades?: number;
  extras?: readonly ExtraPedido[];
  condicaoFundador?: boolean;
  validadeDias?: number;
  /** Quanto da implantação entra na assinatura (padrão da tabela). */
  entradaPct?: number;
}

export interface CalculoOrcamento {
  itens: ItemOrcamento[];
  totais: TotaisOrcamento;
  condicoes: CondicoesOrcamento;
  /** As três partes da implantação juntas (o documento e a tela pedem assim). */
  implantacao: ImplantacaoOrcamento;
}

export type ResultadoCalculo =
  | { ok: true; calculo: CalculoOrcamento }
  | { ok: false; erro: "sem_assentos" }
  | { ok: false; erro: "assentos_abaixo_do_minimo"; minimo: number; assentos: number }
  | { ok: false; erro: "abaixo_do_piso"; nivel: NivelAssento; piso: number; efetivo: number }
  | { ok: false; erro: "extra_desconhecido" };

/**
 * A implantação em duas partes: entrada na assinatura e saldo na conclusão
 * (decisão do fundador em 2026-09-20). O centavo quebrado fica na ENTRADA: o
 * saldo é o que falta, nunca um arredondamento para cima depois de pago.
 */
export function partirImplantacao(totalCentavos: number, entradaPct: number): ImplantacaoOrcamento {
  const entradaCentavos = Math.ceil((totalCentavos * entradaPct) / 100);
  return { totalCentavos, entradaCentavos, saldoCentavos: totalCentavos - entradaCentavos, entradaPct };
}

/** Desconto em centésimos de por cento: 12,5% vira 1250 (inteiro, exato). */
const emCentesimos = (pct: number) => Math.round(pct * 100);

/** Preço final com desconto, arredondado para cima no centavo. */
function comDesconto(centavos: number, centesimos: number): number {
  return Math.ceil((centavos * (10_000 - centesimos)) / 10_000);
}

/**
 * Quantos assentos caem em cada faixa, a partir da posição `inicio` (1 = o
 * primeiro assento da conta). É a escada marginal: 8 assentos = 2 na primeira
 * faixa + 6 na segunda, nunca 8 na segunda.
 */
function distribuir(
  inicio: number,
  quantidade: number,
  faixas: readonly FaixaAssento[],
): { faixa: FaixaAssento; quantidade: number }[] {
  const fim = inicio + quantidade - 1;
  const linhas: { faixa: FaixaAssento; quantidade: number }[] = [];
  for (const faixa of faixas) {
    const de = Math.max(inicio, faixa.de);
    const ate = Math.min(fim, faixa.ate ?? Number.MAX_SAFE_INTEGER);
    if (ate >= de) linhas.push({ faixa, quantidade: ate - de + 1 });
  }
  return linhas;
}

/**
 * Os assentos Ultra ocupam as PRIMEIRAS posições da escada, e os Pro seguem
 * depois. O 00-PLANO não diz a ordem numa conta misturada; esta é a leitura
 * consistente com a decisão F3 (ancorar alto, com margem para descontar) e a
 * única determinística: com 3 Ultra + 5 Pro o total não depende de sorteio.
 */
function linhasDeAssento(
  assentos: { pro: number; ultra: number },
  faixas: readonly FaixaAssento[],
): { itens: ItemOrcamento[]; porNivel: Record<NivelAssento, number> } {
  const itens: ItemOrcamento[] = [];
  const porNivel: Record<NivelAssento, number> = { pro: 0, ultra: 0 };
  let posicao = 1;
  for (const nivel of ["ultra", "pro"] as const) {
    const quantos = assentos[nivel];
    if (quantos <= 0) continue;
    for (const linha of distribuir(posicao, quantos, faixas)) {
      const unitario = linha.faixa[nivel];
      const total = unitario * linha.quantidade;
      porNivel[nivel] += total;
      itens.push({
        tipo: "assento",
        codigo: nivel,
        descricao: `Assento ${ROTULO_NIVEL[nivel]}`,
        quantidade: linha.quantidade,
        unitarioCentavos: unitario,
        totalCentavos: total,
        faixa: linha.faixa.rotulo,
      });
    }
    posicao += quantos;
  }
  return { itens, porNivel };
}

/** Linhas dos extras, separadas pelo que entra todo mês e pelo que é cobrança única. */
function linhasDeExtra(
  pedidos: readonly ExtraPedido[],
  tabela: TabelaPrecos,
): { itens: ItemOrcamento[]; mensais: number; unicos: number } | null {
  const itens: ItemOrcamento[] = [];
  let mensais = 0;
  let unicos = 0;
  for (const pedido of pedidos) {
    const extra = tabela.extras.find((e) => e.codigo === pedido.item);
    if (!extra) return null; // código que a tabela não conhece: nada some em silêncio
    // quantidade negativa ou quebrada (chamada direta, sem passar pelo Zod) viraria
    // desconto disfarçado no total mensal: aqui ela é aparada antes de multiplicar
    const quantidade = Math.max(0, Math.trunc(pedido.quantidade));
    if (quantidade === 0) continue;
    const total = extra.centavos * quantidade;
    if (extra.recorrencia === "mensal") mensais += total;
    else unicos += total;
    itens.push({
      tipo: "extra",
      codigo: extra.codigo,
      descricao: extra.nome,
      quantidade,
      unitarioCentavos: extra.centavos,
      totalCentavos: total,
      recorrencia: extra.recorrencia,
    });
  }
  return { itens, mensais, unicos };
}

/**
 * O orçamento inteiro a partir do pedido. A `tabela` entra por parâmetro para
 * o teste provar que orçamento emitido não muda quando a tabela muda.
 */
export function calcularOrcamento(pedido: PedidoOrcamento, tabela: TabelaPrecos = TABELA): ResultadoCalculo {
  const pro = Math.trunc(pedido.assentos.pro);
  const ultra = Math.trunc(pedido.assentos.ultra);
  const total = pro + ultra;
  if (total <= 0) return { ok: false, erro: "sem_assentos" };

  const unidades = pedido.publico === "rede" ? Math.max(1, Math.trunc(pedido.unidades ?? 1)) : undefined;
  const minimo = minimoFaturavel(pedido.publico, unidades ?? 1, tabela);
  if (total < minimo) return { ok: false, erro: "assentos_abaixo_do_minimo", minimo, assentos: total };

  const assentos = linhasDeAssento({ pro, ultra }, tabela.faixas);
  const centesimos = emCentesimos(pedido.descontoPct ?? 0);
  // O anual entra ANTES da trava: quem paga 10 mensalidades por 12 meses paga
  // menos por assento, e é sobre esse número que o piso vale. Sem isto, anual e
  // desconto se empilhavam e furavam o piso em 16,67% (achado da revisão).
  const anual = pedido.anual === true;
  const mesesPagos = anual ? tabela.mesesPagosNoAnual : tabela.mesesDoAno;

  // desconto nível a nível: a soma das linhas é o total, sem sobra de arredondamento
  const quantidade: Record<NivelAssento, number> = { pro, ultra };
  const efetivoPorAssento: Record<NivelAssento, number> = { pro: 0, ultra: 0 };
  let assentosComDesconto = 0;
  for (const nivel of ["pro", "ultra"] as const) {
    if (quantidade[nivel] === 0) continue;
    const doNivel = comDesconto(assentos.porNivel[nivel], centesimos);
    assentosComDesconto += doNivel;
    // o que o cliente paga por este nível ao longo do ano, e o mensal que isso
    // representa por assento (no anual, 10 mensalidades divididas por 12 meses)
    const pagoNoAno = doNivel * mesesPagos;
    efetivoPorAssento[nivel] = Math.floor(pagoNoAno / (quantidade[nivel] * tabela.mesesDoAno));
    const piso = tabela.pisos[nivel];
    // comparação em inteiros: o piso vale por assento/mês, então multiplica em vez de dividir
    if (pagoNoAno < piso * quantidade[nivel] * tabela.mesesDoAno) {
      return { ok: false, erro: "abaixo_do_piso", nivel, piso, efetivo: efetivoPorAssento[nivel] };
    }
  }

  const extras = linhasDeExtra(pedido.extras ?? [], tabela);
  if (!extras) return { ok: false, erro: "extra_desconhecido" };

  const cheia = implantacaoDoPorte(pedido.publico, total, unidades ?? 1, tabela);
  // anual e condição de fundador já vêm com a implantação isenta (00-PLANO)
  const isenta = anual || pedido.implantacaoIsenta === true || pedido.condicaoFundador === true;
  const implantacaoCentavos = isenta ? 0 : cheia.centavos;

  const assentosCentavos = assentos.porNivel.pro + assentos.porNivel.ultra;
  const mensalCentavos = assentosComDesconto + extras.mensais;
  const entradaPct = pedido.entradaPct ?? tabela.entradaPadraoPct;
  const implantacao = partirImplantacao(implantacaoCentavos, entradaPct);
  const totais: TotaisOrcamento = {
    assentosCentavos,
    descontoCentavos: assentosCentavos - assentosComDesconto,
    extrasMensaisCentavos: extras.mensais,
    extrasUnicosCentavos: extras.unicos,
    mensalCentavos,
    // o "12 meses pelo preço de 10" é da ASSINATURA: consumo medido (IA, Radar,
    // bureau, baixa extra) é pago por uso e não ganha dois meses de graça
    anoCentavos: assentosComDesconto * mesesPagos + extras.mensais * tabela.mesesDoAno,
    economiaAnualCentavos: anual ? assentosComDesconto * (tabela.mesesDoAno - tabela.mesesPagosNoAnual) : 0,
    implantacaoCentavos,
    implantacaoCheiaCentavos: cheia.centavos,
    implantacaoEntradaCentavos: implantacao.entradaCentavos,
    implantacaoSaldoCentavos: implantacao.saldoCentavos,
  };

  const itemImplantacao: ItemOrcamento = {
    tipo: "implantacao",
    codigo: "implantacao",
    descricao: isenta ? `${cheia.descricao} (isenta)` : cheia.descricao,
    quantidade: 1,
    unitarioCentavos: implantacaoCentavos,
    totalCentavos: implantacaoCentavos,
    recorrencia: "unica",
  };

  const condicoes: CondicoesOrcamento = {
    assentos: { pro, ultra },
    ...(unidades !== undefined ? { unidades } : {}),
    descontoPct: pedido.descontoPct ?? 0,
    anual,
    implantacaoIsenta: isenta,
    condicaoFundador: pedido.condicaoFundador === true,
    pisos: { ...tabela.pisos },
    efetivoPorAssento,
    validadeDias: pedido.validadeDias ?? VALIDADE_PADRAO_DIAS,
    entradaPct,
    descontoAlto: (pedido.descontoPct ?? 0) >= DESCONTO_QUE_AVISA,
    // texto do dia: o documento de uma proposta antiga continua dizendo o que
    // foi prometido naquele dia, mesmo depois de a tabela mudar
    ...textosDoDia({ pro, ultra }, tabela),
  };

  return {
    ok: true,
    calculo: { itens: [...assentos.itens, ...extras.itens, itemImplantacao], totais, condicoes, implantacao },
  };
}
