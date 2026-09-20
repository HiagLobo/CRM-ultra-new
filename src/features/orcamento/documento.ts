/**
 * Projeção do orçamento para a PÁGINA DO DOCUMENTO A4 (trilha B da O11).
 *
 * A trilha B renderiza o que este projeto guarda, então a rota do documento
 * devolve o registro inteiro MAIS estes campos com os nomes que a folha espera.
 * Nada é renomeado: `status`, `validadeEm`, `itens` e os `...Centavos`
 * continuam no corpo, e aqui entram os apelidos `situacao`, `validoAte`,
 * `assentos`, `extras` e os totais em REAIS.
 *
 * Reais só na borda: o domínio inteiro trabalha em centavos inteiros, e a
 * divisão por 100 acontece uma única vez, aqui, para a folha imprimir. Todo
 * valor vai TAMBÉM em texto pronto (`R$ 1.522,00`), porque somar dois números
 * em reais no navegador traz o ponto flutuante de volta
 * (1,5 + 4,9 + 17,4 = 23,799999999999997): quem imprime usa o texto, e quem
 * precisar somar usa os centavos, que continuam no corpo.
 *
 * `inclusos` e `franquias` NÃO são lidos da tabela na hora de imprimir: vêm do
 * registro, que guardou o texto do dia da emissão.
 */
import type { OrcamentoAdmin } from "./admin";
import type { FranquiaDoDia } from "./inclusos";
import type { ImplantacaoOrcamento, ItemOrcamento, StatusOrcamento, TotaisOrcamento } from "./orcamento";
import { formatarReais, implantacaoDoOrcamento, ROTULO_STATUS } from "./orcamento";
import { ROTULO_NIVEL, ROTULO_PUBLICO, type NivelAssento } from "./tabela";

/** Centavos inteiros → reais (179_00 vira 179; 8_499 vira 84.99). */
export function emReais(centavos: number): number {
  return Math.round(centavos) / 100;
}

export interface LinhaAssentoDocumento {
  /** "Pro" ou "Ultra", pronto para a coluna da tabela. */
  nivel: string;
  /** O código, para quem preferir comparar (`pro`/`ultra`). */
  codigo: NivelAssento;
  /** A faixa da escada que deu este preço. */
  faixa?: string;
  quantidade: number;
  precoUnitario: number;
  total: number;
  precoUnitarioTexto: string;
  totalTexto: string;
}

export interface LinhaExtraDocumento {
  rotulo: string;
  quantidade: number;
  precoUnitario: number;
  total: number;
  precoUnitarioTexto: string;
  totalTexto: string;
  /** "mensal" ou "unica". */
  recorrencia?: string;
}

/**
 * Os totais em reais, com a identidade que a folha pode conferir (exata em
 * centavos, sem tolerância nenhuma):
 *
 *   soma(assentos[].total) − desconto + soma(extras mensais[].total) = mensal
 *
 * As linhas de assento trazem o preço de TABELA, porque é assim que a proposta
 * se lê: o desconto aparece como abatimento, em linha própria. Os extras de
 * cobrança única (`recorrencia: "unica"`) ficam fora do mensal.
 */
export interface TotaisDocumento extends TotaisOrcamento {
  mensal: number;
  anual: number;
  implantacao: number;
  assentos: number;
  desconto: number;
  extrasMensais: number;
  extrasUnicos: number;
  /** Só no plano anual: os 2 meses poupados. */
  economiaAnual?: number;
  mensalTexto: string;
  anualTexto: string;
  implantacaoTexto: string;
  assentosTexto: string;
  descontoTexto: string;
  extrasMensaisTexto: string;
  extrasUnicosTexto: string;
  economiaAnualTexto?: string;
}

/**
 * A implantação em duas partes: entrada na assinatura e saldo na conclusão.
 * Não é diluída em 12 meses e não volta se o cliente sair (00-PLANO, 2026-09-20).
 */
export interface ImplantacaoDocumento extends ImplantacaoOrcamento {
  total: number;
  entrada: number;
  saldo: number;
  totalTexto: string;
  entradaTexto: string;
  saldoTexto: string;
}

/** O corpo do `GET /api/admin/orcamentos/[id]`: o registro + os apelidos da folha. */
export interface OrcamentoDocumento extends Omit<OrcamentoAdmin, "totais"> {
  situacao: StatusOrcamento;
  situacaoRotulo: string;
  publicoRotulo: string;
  /** `AAAA-MM-DD`, o mesmo dia de `validadeEm`. */
  validoAte: string;
  assentos: LinhaAssentoDocumento[];
  extras: LinhaExtraDocumento[];
  totais: TotaisDocumento;
  implantacao: ImplantacaoDocumento;
  anual: boolean;
  descontoPct: number;
  condicaoFundador: boolean;
  unidades?: number;
  /** O que está incluso em cada nível contratado, como foi prometido no dia. */
  inclusos: { pro?: string[]; ultra?: string[] };
  /** Franquias de uso e preço do excedente, como foram prometidos no dia. */
  franquias: FranquiaDoDia[];
}

const ehAssento = (i: ItemOrcamento): boolean => i.tipo === "assento";

/** Valor em reais e em texto, o par que a folha usa em toda linha. */
const par = (centavos: number) => ({ valor: emReais(centavos), texto: formatarReais(centavos) });

function implantacaoDoDocumento(o: OrcamentoAdmin): ImplantacaoDocumento {
  const i = implantacaoDoOrcamento(o.totais, o.condicoes);
  return {
    ...i,
    total: emReais(i.totalCentavos),
    entrada: emReais(i.entradaCentavos),
    saldo: emReais(i.saldoCentavos),
    totalTexto: formatarReais(i.totalCentavos),
    entradaTexto: formatarReais(i.entradaCentavos),
    saldoTexto: formatarReais(i.saldoCentavos),
  };
}

export function paraDocumento(o: OrcamentoAdmin): OrcamentoDocumento {
  const c = o.condicoes;
  return {
    ...o,
    situacao: o.status,
    situacaoRotulo: ROTULO_STATUS[o.status],
    publicoRotulo: ROTULO_PUBLICO[o.publico],
    validoAte: o.validadeEm,
    assentos: o.itens.filter(ehAssento).map((i) => {
      const unitario = par(i.unitarioCentavos);
      const total = par(i.totalCentavos);
      return {
        nivel: ROTULO_NIVEL[i.codigo as NivelAssento] ?? i.descricao,
        codigo: i.codigo as NivelAssento,
        ...(i.faixa ? { faixa: i.faixa } : {}),
        quantidade: i.quantidade,
        precoUnitario: unitario.valor,
        total: total.valor,
        precoUnitarioTexto: unitario.texto,
        totalTexto: total.texto,
      };
    }),
    extras: o.itens
      .filter((i) => i.tipo === "extra")
      .map((i) => {
        const unitario = par(i.unitarioCentavos);
        const total = par(i.totalCentavos);
        return {
          rotulo: i.descricao,
          quantidade: i.quantidade,
          precoUnitario: unitario.valor,
          total: total.valor,
          precoUnitarioTexto: unitario.texto,
          totalTexto: total.texto,
          ...(i.recorrencia ? { recorrencia: i.recorrencia } : {}),
        };
      }),
    totais: {
      ...o.totais,
      mensal: emReais(o.totais.mensalCentavos),
      anual: emReais(o.totais.anoCentavos),
      implantacao: emReais(o.totais.implantacaoCentavos),
      assentos: emReais(o.totais.assentosCentavos),
      desconto: emReais(o.totais.descontoCentavos),
      extrasMensais: emReais(o.totais.extrasMensaisCentavos),
      extrasUnicos: emReais(o.totais.extrasUnicosCentavos),
      mensalTexto: formatarReais(o.totais.mensalCentavos),
      anualTexto: formatarReais(o.totais.anoCentavos),
      implantacaoTexto: formatarReais(o.totais.implantacaoCentavos),
      assentosTexto: formatarReais(o.totais.assentosCentavos),
      descontoTexto: formatarReais(o.totais.descontoCentavos),
      extrasMensaisTexto: formatarReais(o.totais.extrasMensaisCentavos),
      extrasUnicosTexto: formatarReais(o.totais.extrasUnicosCentavos),
      ...(c.anual
        ? {
            economiaAnual: emReais(o.totais.economiaAnualCentavos),
            economiaAnualTexto: formatarReais(o.totais.economiaAnualCentavos),
          }
        : {}),
    },
    implantacao: implantacaoDoDocumento(o),
    anual: c.anual,
    descontoPct: c.descontoPct,
    condicaoFundador: c.condicaoFundador,
    ...(c.unidades !== undefined ? { unidades: c.unidades } : {}),
    // registro gravado antes de a O11·S2 guardar os textos: a folha recebe listas
    // vazias e cai no texto neutro dela, em vez de inventar promessa nova
    inclusos: c.inclusos ?? {},
    franquias: c.franquias ?? [],
  };
}
