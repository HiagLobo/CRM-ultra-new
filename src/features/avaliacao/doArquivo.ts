/**
 * As avaliações que continuam no ARQUIVO (decisão F4): as três primeiras
 * pessoas avaliaram por WhatsApp, antes de existir o formulário, e ficam em
 * `src/content/depoimentos.ts` com a autorização registrada.
 *
 * A média e a contagem do site somam **arquivo + banco** (contrato da O10), e
 * a soma acontece aqui, no servidor: a tela recebe o número pronto e nunca
 * soma o arquivo outra vez — somar duas vezes é o jeito mais fácil de publicar
 * um número errado.
 *
 * Só LÊ o arquivo; quem edita depoimento é a trilha da vitrine.
 */
import { DEPOIMENTOS } from "../../content/depoimentos";

/** As notas do arquivo no formato do resumo. Depoimento sem nota não conta. */
export function notasDoArquivo(): { estrelas: number }[] {
  return DEPOIMENTOS.filter((d) => d.avaliacao).map((d) => ({ estrelas: d.avaliacao!.estrelas }));
}
