/**
 * Prazo para chamadas a fornecedor (O7) — o SDK do Resend usa `fetch` sem
 * timeout: um provedor que trava em vez de falhar seguraria a função até a
 * Vercel cortá-la, e aí o lead se perderia antes de ser gravado.
 */

/** Nome do erro quando o prazo estoura — vira a causa `email:PrazoEsgotado` no log. */
export const PRAZO_ESGOTADO = "PrazoEsgotado";

/**
 * Corre a tarefa contra o relógio: estourou, rejeita com `PrazoEsgotado`.
 * A tarefa não é cancelada (o SDK não aceita sinal de aborto) — só deixamos de
 * esperar por ela. Um erro dela depois do prazo não vira rejeição solta: o
 * `race` já está ouvindo.
 */
export function comPrazo<T>(tarefa: Promise<T>, ms: number): Promise<T> {
  let relogio: ReturnType<typeof setTimeout> | undefined;
  const estouro = new Promise<never>((_, rejeitar) => {
    relogio = setTimeout(
      () => rejeitar(Object.assign(new Error(`prazo de ${ms} ms esgotado`), { name: PRAZO_ESGOTADO })),
      ms,
    );
  });
  return Promise.race([tarefa, estouro]).finally(() => clearTimeout(relogio));
}
