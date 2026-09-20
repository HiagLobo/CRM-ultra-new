/**
 * Escolhe o adaptador de persistência das avaliações por ambiente — o mesmo
 * arranjo do `criarLeadStore.ts`, e o único lugar que sabe qual banco está em uso.
 *
 * Com `DATABASE_URL`: Postgres (produção). Sem ela: arquivo (dev). A trava de
 * produção mora no `poolPostgres()`, junto com o pool compartilhado.
 *
 * SERVER-ONLY.
 */
import { poolPostgres } from "./db";
import { FileAvaliacaoStore, type AvaliacaoStore } from "./avaliacaoStore";
import { PostgresAvaliacaoStore } from "./avaliacaoStorePostgres";

let cache: AvaliacaoStore | null = null;

/**
 * Store da aplicação, criado sob demanda (nunca no import: o `next build`
 * avalia os módulos das rotas como produção e exigiria a URL para compilar).
 */
export function avaliacaoStore(): AvaliacaoStore {
  if (cache) return cache;
  const pool = poolPostgres();
  cache = pool ? new PostgresAvaliacaoStore(pool) : new FileAvaliacaoStore();
  return cache;
}
