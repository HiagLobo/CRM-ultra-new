/**
 * Causa de um erro, segura para log nas rotas do admin: o nome do erro e,
 * quando houver, o código — SQLSTATE do Postgres (`db:42P01` = tabela que falta)
 * ou errno do Node (`Error:ECONNREFUSED` = banco fora do ar).
 *
 * Nunca a mensagem: a do pg traz os valores da linha (e-mail, telefone) e a de
 * rede traz host e porta. Local às rotas do admin de propósito — o diagnóstico
 * do painel não depende de helper de outra trilha.
 */
export function causaDoErro(erro: unknown): string {
  if (!(erro instanceof Error)) return "desconhecido";
  const nome = /^[A-Za-z]\w{0,39}$/.test(erro.name) ? erro.name : "Error";
  const codigo = (erro as { code?: unknown }).code;
  if (typeof codigo !== "string") return nome;
  if (/^E[A-Z]{2,29}$/.test(codigo)) return `${nome}:${codigo}`;
  // SQLSTATE: 5 caracteres, maiúsculas e dígitos, sempre com algum dígito
  if (/^[0-9A-Z]{5}$/.test(codigo) && /\d/.test(codigo)) return `db:${codigo}`;
  return nome;
}
