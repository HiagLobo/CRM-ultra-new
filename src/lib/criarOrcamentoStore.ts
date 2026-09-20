/**
 * Escolhe o adaptador de persistência dos orçamentos por ambiente — o mesmo
 * arranjo do `criarAvaliacaoStore.ts`, e o único lugar que sabe qual banco está
 * em uso.
 *
 * Com `DATABASE_URL`: Postgres (produção). Sem ela: arquivo (dev). A trava de
 * produção mora no `poolPostgres()`, junto com o pool compartilhado.
 *
 * SERVER-ONLY.
 */
import { poolPostgres } from "./db";
import { FileOrcamentoStore, type OrcamentoStore } from "./orcamentoStore";
import { PostgresOrcamentoStore } from "./orcamentoStorePostgres";

let cache: OrcamentoStore | null = null;

/**
 * Store da aplicação, criado sob demanda (nunca no import: o `next build`
 * avalia os módulos das rotas como produção e exigiria a URL para compilar).
 */
export function orcamentoStore(): OrcamentoStore {
  if (cache) return cache;
  const pool = poolPostgres();
  cache = pool ? new PostgresOrcamentoStore(pool) : new FileOrcamentoStore();
  return cache;
}
