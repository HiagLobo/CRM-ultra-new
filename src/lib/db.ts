/**
 * Pool de conexões do Postgres, **compartilhado por todos os stores**.
 *
 * Um pool por instância, não um por store: em serverless cada lambda abre o
 * próprio, e dois pools dobrariam as conexões contra o mesmo banco à toa.
 *
 * `null` em desenvolvimento sem `DATABASE_URL` — aí cada store cai no adaptador
 * de arquivo. Em produção, a ausência da URL **para o boot**: gravar em disco
 * efêmero perderia os dados na primeira reciclagem, em silêncio.
 *
 * SERVER-ONLY.
 */
import { Pool } from "pg";
import { env } from "./env";

let pool: Pool | null = null;
let avaliado = false;

export function poolPostgres(): Pool | null {
  if (avaliado) return pool;

  const url = process.env.DATABASE_URL;
  if (!url) {
    if (env.NODE_ENV === "production") {
      throw new Error(
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
    // Neon/Supabase exigem TLS; o certificado é da nuvem, não auto-assinado
    ssl: url.includes("localhost") ? undefined : { rejectUnauthorized: true },
  });
  avaliado = true;
  return pool;
}
