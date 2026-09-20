/**
 * Conferência do orçamento antes de virar papel. Zod garante o formato; aqui a
 * conta tem que fechar.
 *
 * Proposta que não fecha não é impressa: é mais barato o fundador refazer no
 * painel do que mandar para o cliente uma folha em que a soma das linhas não
 * bate com o total, ou que cobra implantação num plano em que ela é isenta.
 *
 * Puro e sem React: os problemas são frases de diagnóstico para o teste, não
 * texto de tela (a tela mostra uma mensagem só).
 */
import { niveisContratados, type Orcamento } from "./tiposOrcamento";

/** Um centavo de folga, para não brigar com ponto flutuante. */
const CENTAVO = 0.011;
const perto = (a: number, b: number) => Math.abs(a - b) <= CENTAVO;
const somar = (linhas: { total: number }[]) => linhas.reduce((s, l) => s + l.total, 0);

/**
 * Os números batem? Cada linha (quantidade x preço), a soma das linhas contra o
 * total mensal e a implantação (entrada + saldo, e isenção respeitada).
 *
 * A soma aceita duas leituras, porque a API pode cobrar extra fora da
 * mensalidade: só os assentos, ou assentos mais extras.
 */
export function conferirTotais(orcamento: Orcamento): string[] {
  const problemas: string[] = [];

  for (const linha of orcamento.assentos) {
    if (!perto(linha.quantidade * linha.precoUnitario, linha.total)) {
      problemas.push(`assento ${linha.codigo}: quantidade vezes preço não dá o total da linha`);
    }
  }
  for (const extra of orcamento.extras) {
    if (!perto(extra.quantidade * extra.precoUnitario, extra.total)) {
      problemas.push(`extra ${extra.item ?? extra.rotulo}: quantidade vezes preço não dá o total da linha`);
    }
  }

  const assentos = somar(orcamento.assentos);
  const comExtras = assentos + somar(orcamento.extras);
  const mensal = orcamento.totais.mensal;
  if (!perto(assentos, mensal) && !perto(comExtras, mensal)) {
    problemas.push("as linhas não somam o total mensal");
  }

  const implantacao = orcamento.implantacao;
  if (!implantacao && (orcamento.totais.implantacao ?? 0) > 0) {
    problemas.push("implantação sem entrada e saldo");
  }
  if (implantacao) {
    if (!perto(implantacao.entrada + implantacao.saldo, implantacao.total)) {
      problemas.push("entrada e saldo não somam a implantação");
    }
    if (implantacao.total > 0 && orcamento.anual) {
      problemas.push("implantação cobrada no plano anual, em que ela é isenta");
    }
    if (implantacao.total > 0 && orcamento.condicaoFundador) {
      problemas.push("implantação cobrada na condição de fundador, em que ela é isenta");
    }
  }

  return problemas;
}

/** Tudo que impede a impressão: os números e os blocos obrigatórios da tabela. */
export function problemasDoOrcamento(orcamento: Orcamento): string[] {
  const problemas = conferirTotais(orcamento);
  for (const nivel of niveisContratados(orcamento)) {
    const incluso = orcamento.inclusos[nivel.codigo];
    if (!incluso || incluso.length === 0) {
      problemas.push(`nível ${nivel.codigo} contratado sem a lista do que está incluso`);
    }
  }
  return problemas;
}
