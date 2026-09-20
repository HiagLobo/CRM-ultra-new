/**
 * O que depende do PORTE do cliente: o mínimo faturável e a implantação.
 * Puro e client-safe, separado do `calculo.ts` porque é a única parte que olha
 * o público (autônomo, imobiliária, rede) em vez de olhar assento por assento.
 */
import { NOME_IMPLANTACAO, ROTULO_PUBLICO, TABELA, type PublicoOrcamento, type TabelaPrecos } from "./tabela";

/** Mínimo faturável de assentos do público (na rede, por unidade ativa). */
export function minimoFaturavel(
  publico: PublicoOrcamento,
  unidades: number,
  tabela: TabelaPrecos = TABELA,
): number {
  const base = tabela.minimoFaturavel[publico];
  return publico === "rede" ? base * Math.max(1, unidades) : base;
}

/**
 * Implantação de tabela (antes de qualquer isenção), com o porte por escrito
 * para o documento: é cobrada no go live e amortizada em 1/12 por mês.
 */
export function implantacaoDoPorte(
  publico: PublicoOrcamento,
  assentos: number,
  unidades: number,
  tabela: TabelaPrecos = TABELA,
): { centavos: number; descricao: string } {
  if (publico === "autonomo") {
    return { centavos: tabela.implantacao.autonomo, descricao: `${NOME_IMPLANTACAO}, corretor autônomo` };
  }
  if (publico === "rede") {
    const { matriz, porUnidade } = tabela.implantacao.rede;
    const ativas = Math.max(1, unidades);
    return {
      centavos: matriz + porUnidade * ativas,
      descricao: `${NOME_IMPLANTACAO}, matriz mais ${ativas} ${ativas === 1 ? "unidade ativada" : "unidades ativadas"}`,
    };
  }
  const faixas = tabela.implantacao.imobiliaria;
  const escolhida = faixas.find((f) => f.ate === null || assentos <= f.ate) ?? faixas[faixas.length - 1]!;
  return {
    centavos: escolhida.centavos,
    descricao: `${NOME_IMPLANTACAO}, ${ROTULO_PUBLICO[publico].toLowerCase()} ${escolhida.rotulo}`,
  };
}
