/**
 * O que a tela de login diz para cada resposta de erro da API.
 * Só o 401 é senha errada: um 5xx dizendo "senha incorreta" manda o fundador
 * trocar a senha quando o problema é o servidor (banco, tabela, variável).
 */
export function mensagemDeFalhaNoLogin(status: number): string {
  if (status === 401) return "senha incorreta.";
  if (status === 429) return "muitas tentativas. Aguarde alguns minutos e tente de novo.";
  if (status >= 500) return "erro no servidor, tente de novo.";
  return "não foi possível entrar. Tente de novo.";
}
