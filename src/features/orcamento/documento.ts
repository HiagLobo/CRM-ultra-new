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
 * divisão por 100 acontece uma única vez, aqui, para a folha imprimir.
 * `inclusos` e `franquias` NÃO são lidos da tabela na hora de imprimir: vêm do
 * registro, que guardou o texto do dia da emissão.
 */
import type { OrcamentoAdmin } from "./admin";
import type { FranquiaDoDia } from "./inclusos";
import type { ItemOrcamento, StatusOrcamento, TotaisOrcamento } from "./orcamento";
import { ROTULO_STATUS } from "./orcamento";
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
}

export interface LinhaExtraDocumento {
  rotulo: string;
  quantidade: number;
  precoUnitario: number;
  total: number;
  /** "mensal" ou "unica". */
  recorrencia?: string;
}

export interface TotaisDocumento extends TotaisOrcamento {
  mensal: number;
  anual: number;
  implantacao: number;
  /** Só no plano anual: os 2 meses poupados. */
  economiaAnual?: number;
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

export function paraDocumento(o: OrcamentoAdmin): OrcamentoDocumento {
  const c = o.condicoes;
  return {
    ...o,
    situacao: o.status,
    situacaoRotulo: ROTULO_STATUS[o.status],
    publicoRotulo: ROTULO_PUBLICO[o.publico],
    validoAte: o.validadeEm,
    assentos: o.itens.filter(ehAssento).map((i) => ({
      nivel: ROTULO_NIVEL[i.codigo as NivelAssento] ?? i.descricao,
      codigo: i.codigo as NivelAssento,
      ...(i.faixa ? { faixa: i.faixa } : {}),
      quantidade: i.quantidade,
      precoUnitario: emReais(i.unitarioCentavos),
      total: emReais(i.totalCentavos),
    })),
    extras: o.itens
      .filter((i) => i.tipo === "extra")
      .map((i) => ({
        rotulo: i.descricao,
        quantidade: i.quantidade,
        precoUnitario: emReais(i.unitarioCentavos),
        total: emReais(i.totalCentavos),
        ...(i.recorrencia ? { recorrencia: i.recorrencia } : {}),
      })),
    totais: {
      ...o.totais,
      mensal: emReais(o.totais.mensalCentavos),
      anual: emReais(o.totais.anoCentavos),
      implantacao: emReais(o.totais.implantacaoCentavos),
      ...(c.anual ? { economiaAnual: emReais(o.totais.economiaAnualCentavos) } : {}),
    },
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
