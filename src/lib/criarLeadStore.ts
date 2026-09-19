/**
 * Escolhe o adaptador de persistência de leads por ambiente — o único lugar do
 * código que sabe qual banco está em uso.
 *
 * Com `DATABASE_URL`: Postgres (produção). Sem ela: arquivo (dev). A trava de
 * produção mora no `poolPostgres()`, junto com o pool compartilhado.
 *
 * SERVER-ONLY.
 */
import { poolPostgres } from "./db";
import { FileLeadStore, type LeadStore } from "./leadStore";
import { PostgresLeadStore } from "./leadStorePostgres";

let cache: LeadStore | null = null;

/**
 * Store da aplicação, criado sob demanda (nunca no import: o `next build`
 * avalia os módulos das rotas como produção e exigiria a URL para compilar).
 */
export function leadStore(): LeadStore {
  if (cache) return cache;
  const pool = poolPostgres();
  cache = pool ? new PostgresLeadStore(pool) : new FileLeadStore();
  return cache;
}
