/**
 * O que a proposta promete por escrito: o que está incluso em cada nível
 * CONTRATADO e as franquias de uso com o preço do excedente.
 *
 * É texto montado a partir da `tabela.ts` (nenhum número novo mora aqui), e
 * fica GRAVADO no orçamento junto com os valores: o documento de uma proposta
 * antiga continua dizendo o que foi prometido naquele dia, mesmo depois de a
 * franquia ou o preço do excedente mudarem.
 *
 * Puro e client-safe.
 */
import { formatarReais } from "./orcamento";
import { ROTULO_NIVEL, TABELA, type CodigoExtra, type NivelAssento, type TabelaPrecos } from "./tabela";

/** Uma linha da tabela de franquias no documento. */
export interface FranquiaDoDia {
  rotulo: string;
  /** O que entra sem custo ("25 por assento/mês"). */
  incluso: string;
  /** O preço de quem passar da franquia ("R$ 1,50 cada"). */
  excedente: string;
}

/** Os textos do dia, guardados com o orçamento. */
export interface TextosDoDia {
  /** Só os níveis contratados (o documento não promete o que não foi vendido). */
  inclusos: { pro?: string[]; ultra?: string[] };
  franquias: FranquiaDoDia[];
}

/** "R$ 1,50 cada", a partir do extra da tabela. Extra que sumiu vira texto neutro. */
function excedenteDe(codigo: CodigoExtra, tabela: TabelaPrecos): string {
  const extra = tabela.extras.find((e) => e.codigo === codigo);
  return extra ? `${formatarReais(extra.centavos)} cada` : "sob consulta";
}

/**
 * Radar e baixas automáticas são do Ultra: numa conta só de assentos Pro as
 * duas linhas ficam de fora, para o documento não prometer o que essa conta
 * não tem (o Radar avulso numa conta Pro é um extra, com preço próprio).
 */
export function textosDoDia(
  assentos: { pro: number; ultra: number },
  tabela: TabelaPrecos = TABELA,
): TextosDoDia {
  const inclusos: TextosDoDia["inclusos"] = {};
  for (const nivel of ["pro", "ultra"] as const) {
    if (assentos[nivel] > 0) inclusos[nivel] = [...tabela.inclusos[nivel]];
  }

  const f = tabela.franquias;
  const franquias: FranquiaDoDia[] = [
    {
      rotulo: "Atendimentos de IA",
      incluso: `${f.iaPorAssento} por assento/mês`,
      excedente: excedenteDe("ia_excedente", tabela),
    },
    {
      rotulo: "Reuniões transcritas",
      incluso: `${f.reunioesPorAssento} por assento/mês`,
      excedente: excedenteDe("reuniao_excedente", tabela),
    },
  ];
  if (assentos.ultra > 0) {
    franquias.push(
      {
        rotulo: `Consultas de Radar (assento ${ROTULO_NIVEL.ultra})`,
        incluso: `${f.radarPorAssentoUltra} por assento/mês`,
        excedente: excedenteDe("radar_avulso", tabela),
      },
      {
        rotulo: `Baixas automáticas (conta com ${ROTULO_NIVEL.ultra})`,
        incluso: `${f.baixasPorConta} por conta/mês`,
        excedente: excedenteDe("baixa_excedente", tabela),
      },
    );
  }
  return { inclusos, franquias };
}
