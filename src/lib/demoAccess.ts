/**
 * Espelho **de UX** do acesso ao demo, no localStorage.
 *
 * A verdade do acesso é o cookie httpOnly assinado (O1·S3) — que o JavaScript
 * não lê de propósito. Isto aqui só serve para a interface saber o que mostrar
 * (o gate da O2·S3, as 3 entradas no login) sem uma ida ao servidor.
 * Apagar esta chave não dá acesso a nada; forjá-la também não.
 */
const CHAVE = "crm_demo_liberado"; // prefixo crm_ — padrão de storage da O0

/**
 * Marca na URL que um painel recusou o acesso (o gate do servidor rejeitou o
 * cookie). Mora aqui, e não no `exigirDemo`, porque a landing é componente de
 * cliente e não pode importar módulo que usa `next/headers`.
 */
export const PARAM_ACESSO = "acesso";
export const VALOR_ACESSO_NECESSARIO = "necessario";

function storage(): Storage | null {
  // SSR e navegadores com storage bloqueado (modo privativo/cookies off)
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

/** Marca na interface que o e-mail foi verificado. */
export function liberar(): void {
  try {
    storage()?.setItem(CHAVE, "1");
  } catch {
    // storage cheio/bloqueado: o acesso segue valendo pelo cookie — só a UI perde a dica
  }
}

/** A interface deve tratar este visitante como já liberado? */
export function estaLiberado(): boolean {
  try {
    return storage()?.getItem(CHAVE) === "1";
  } catch {
    return false;
  }
}

/** Limpa o espelho (sair da demonstração). Não invalida o cookie. */
export function limpar(): void {
  try {
    storage()?.removeItem(CHAVE);
  } catch {
    // nada a fazer: sem storage, não havia espelho para limpar
  }
}
