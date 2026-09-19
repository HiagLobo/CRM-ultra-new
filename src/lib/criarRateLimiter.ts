/**
 * Escolhe o limitador por ambiente: Postgres quando há banco (compartilhado
 * entre instâncias), memória quando não há (dev e teste).
 *
 * Um limitador por **escopo** (envio, verificação, login), todos apontando para
 * a mesma tabela — as chaves já carregam o prefixo, então não se misturam.
 *
 * SERVER-ONLY.
 */
import { poolPostgres } from "./db";
import { MemoriaRateLimiter, type RateLimiter } from "./ratelimit";
import { PostgresRateLimiter } from "./ratelimitPostgres";

let cache: RateLimiter | null = null;

export function rateLimiter(): RateLimiter {
  if (cache) return cache;
  const pool = poolPostgres();
  cache = pool ? new PostgresRateLimiter(pool) : new MemoriaRateLimiter();
  return cache;
}
