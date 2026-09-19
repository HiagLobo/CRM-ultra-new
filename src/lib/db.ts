/**
 * Pool de conexões do Postgres, **compartilhado por todos os stores**.
 *
 * Um pool por instância, não um por store: em serverless cada lambda abre o
 * próprio, e dois pools dobrariam as conexões contra o mesmo banco à toa.
 *
 * `null` em desenvolvimento sem `DATABASE_URL` — aí cada store cai no adaptador
 * de arquivo. Em produção, a ausência da URL é recusada: gravar em disco efêmero
 * perderia os dados na primeira reciclagem, em silêncio. A trava dispara na
 * **primeira requisição** que precisa do banco (não no boot nem no build — o pool
 * é criado sob demanda): a requisição responde 500 e o log diz
 * `config:DATABASE_URL` (O7·S2).
 *
 * SERVER-ONLY.
 */
import { Pool } from "pg";
import { env } from "./env";
import { ErroConfiguracao, causaDoErro } from "./erros";

let pool: Pool | null = null;
let avaliado = false;

/**
 * Conexão ociosa que cai (o Neon suspende o compute parado, o pooler reinicia,
 * a rede oscila) faz o pool emitir `error`. Sem ouvinte, o Node trata como
 * exceção não capturada e derruba a instância — e com ela as requisições em
 * andamento. O pool já descartou o cliente morto; a próxima consulta abre outro.
 * Só a causa vai ao log: o erro carrega o cliente, com a senha da connection string.
 */
export function aoPerderConexaoOciosa(erro: unknown): void {
  const causa = causaDoErro(erro, "db");
  console.error("[db] conexão ociosa caiu (o pool abre outra):", causa);
}

export function poolPostgres(): Pool | null {
  if (avaliado) return pool;

  const url = process.env.DATABASE_URL;
  if (!url) {
    if (env.NODE_ENV === "production") {
      throw new ErroConfiguracao(
        "DATABASE_URL",
        "DATABASE_URL é obrigatória em produção — sem ela os dados seriam gravados em disco efêmero e perdidos",
      );
    }
    avaliado = true;
    return null;
  }

  pool = new Pool({
    connectionString: url,
    // serverless: poucas conexões por instância, devolvidas rápido
    max: Number(process.env.DATABASE_POOL_MAX ?? 3),
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 10_000,
    // Neon/Supabase exigem TLS; o certificado é da nuvem, não auto-assinado.
    // O `sslmode` da URL tem precedência sobre esta opção (o pg aplica a string por
    // cima): use `sslmode=verify-full` (RUNBOOK §3) — `require` gera "SECURITY
    // WARNING" no log e, no pg 9, deixaria de conferir o certificado.
    ssl: url.includes("localhost") ? undefined : { rejectUnauthorized: true },
  });
  pool.on("error", aoPerderConexaoOciosa);
  avaliado = true;
  return pool;
}
