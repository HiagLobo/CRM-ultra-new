/**
 * Erros com causa segura para log (O7) — a categoria diz O QUE quebrou sem
 * carregar dado pessoal. Da mensagem de um erro NUNCA sai nada: a do Resend
 * pode trazer o destinatário, a do Postgres traz os valores da linha (e-mail,
 * telefone) e a de rede traz host e porta. Só saem nomes e códigos, e só no
 * formato esperado (um nome "esquisito" vira o genérico).
 *
 * Categorias — o RUNBOOK §6 diz o que fazer com cada uma:
 * - `config:<VARIÁVEL>` — falta ou está errada uma variável de ambiente;
 * - `email:<código do Resend>` — o Resend recusou (ex.: `email:daily_quota_exceeded`);
 * - `db:<SQLSTATE>` — o Postgres recusou (ex.: `db:42P01`, tabela que não existe);
 * - `db:PrazoConexao` · `db:ConexaoEncerrada` — o banco não respondeu a tempo / derrubou a conexão;
 * - `rede:<errno>` — não alcançou o servidor (ex.: `rede:ENOTFOUND`, host errado);
 * - `tls:<código>` — o certificado do servidor não passou na verificação;
 * - `<prefixo>:<nome do erro>` — o resto (ex.: `email:PrazoEsgotado`, `erro:TypeError`).
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

/** Código de erro do Resend (`error.name` da API): `daily_quota_exceeded`, `invalid_api_Key`… */
const CODIGO_PROVEDOR = /^[A-Za-z][A-Za-z0-9_]{0,59}$/;

/**
 * O provedor de e-mail recusou o envio. Carrega só o código do erro do Resend —
 * a mensagem dele pode citar o destinatário, então nem entra aqui.
 */
export class ErroEnvioEmail extends Error {
  override readonly name = "ErroEnvioEmail";
  /** Código validado; fora do formato esperado vira `desconhecido`. */
  readonly codigo: string;

  constructor(codigoProvedor: unknown) {
    const codigo =
      typeof codigoProvedor === "string" && CODIGO_PROVEDOR.test(codigoProvedor) ? codigoProvedor : "desconhecido";
    super(`falha no envio de e-mail (${codigo})`);
    this.codigo = codigo;
  }
}

const NOME_SEGURO = /^[A-Za-z]\w{0,39}$/;
const VARIAVEL = /^[A-Z][A-Z0-9_]{0,63}$/;
/** SQLSTATE: 5 caracteres, maiúsculas e dígitos — sempre com algum dígito (ex.: 42P01, XX000). */
const SQLSTATE = /^(?=.*\d)[0-9A-Z]{5}$/;
/**
 * errno de rede do Node: ENOTFOUND, ECONNREFUSED, ETIMEDOUT, EAI_AGAIN… — e não
 * os códigos internos `ERR_*` (ex.: `ERR_INVALID_ARG_TYPE` é bug, não rede).
 */
const ERRNO = /^E(?!RR_)[A-Z][A-Z_]{1,28}$/;
/** Códigos do TLS do Node: CERT_HAS_EXPIRED, ERR_TLS_CERT_ALTNAME_INVALID… */
const CODIGO_TLS = /^(?=.*(?:CERT|TLS|SSL))[A-Z][A-Z0-9_]{2,59}$/;

/**
 * Erros de conexão do `pg`/`pg-pool` vêm sem código — só com estas mensagens,
 * que são constantes da biblioteca (sem dado nenhum). Comparação exata: uma
 * mensagem fora da lista cai no genérico, e nada dela vai para a causa.
 */
const CONEXAO_PG = new Map<string, string>([
  ["timeout exceeded when trying to connect", "db:PrazoConexao"],
  ["Connection terminated due to connection timeout", "db:PrazoConexao"],
  ["Connection terminated unexpectedly", "db:ConexaoEncerrada"],
]);

/** Categoria pelo `code` do erro (Postgres, rede ou TLS), ou `null`. */
function causaPeloCodigo(codigo: unknown): string | null {
  if (typeof codigo !== "string") return null;
  if (SQLSTATE.test(codigo)) return `db:${codigo}`;
  if (ERRNO.test(codigo)) return `rede:${codigo}`;
  if (CODIGO_TLS.test(codigo)) return `tls:${codigo}`;
  return null;
}

/**
 * Categoria segura de um erro qualquer, para `console.error("[rota] …:", causa)`.
 * `prefixo` rotula o que não tem categoria própria (padrão: `erro`).
 *
 * Reconhece os erros próprios pelo nome + formato, não por `instanceof`: o
 * módulo pode existir em duas cópias (bundle, `vi.resetModules`) e a causa não
 * pode depender disso.
 */
export function causaDoErro(erro: unknown, prefixo = "erro"): string {
  if (!(erro instanceof Error)) return `${prefixo}:desconhecido`;

  const campos = erro as Error & { variavel?: unknown; codigo?: unknown; code?: unknown };
  if (erro.name === "ErroConfiguracao" && typeof campos.variavel === "string" && VARIAVEL.test(campos.variavel)) {
    return `config:${campos.variavel}`;
  }
  if (erro.name === "ErroEnvioEmail" && typeof campos.codigo === "string" && CODIGO_PROVEDOR.test(campos.codigo)) {
    return `email:${campos.codigo}`;
  }

  const daConexao = CONEXAO_PG.get(erro.message);
  if (daConexao) return daConexao;

  const doCodigo = causaPeloCodigo(campos.code);
  if (doCodigo) return doCodigo;

  return `${prefixo}:${NOME_SEGURO.test(erro.name) ? erro.name : "Error"}`;
}
