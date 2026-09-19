/**
 * Erros com causa segura para log (O7) — a categoria diz O QUE quebrou sem
 * carregar dado pessoal: a mensagem de um erro qualquer pode trazer o
 * destinatário, então dela só sai o nome.
 *
 * - `config:<VARIÁVEL>` — falta ou está errada uma variável de ambiente;
 * - `<prefixo>:<nome do erro>` — o resto (ex.: `email:PrazoEsgotado`).
 */

/** Configuração faltando/inválida. Carrega o NOME da variável, nunca o valor. */
export class ErroConfiguracao extends Error {
  override readonly name = "ErroConfiguracao";

  constructor(
    readonly variavel: string,
    mensagem: string,
  ) {
    super(mensagem);
  }
}

/** Categoria segura de um erro qualquer, para `console.error("[rota] …:", causa)`. */
export function causaDoErro(erro: unknown, prefixo: string): string {
  if (erro instanceof ErroConfiguracao) return `config:${erro.variavel}`;
  return `${prefixo}:${erro instanceof Error ? erro.name : "desconhecido"}`;
}
