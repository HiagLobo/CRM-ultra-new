/**
 * Rate-limit compartilhado entre instâncias (Postgres).
 *
 * Em serverless o limitador em memória conta por lambda: com N instâncias
 * quentes, o limite real vira N × o configurado. Para o envio de código isso é
 * dinheiro (cada e-mail custa) e reputação de domínio; para o login do admin, é
 * força bruta com N vezes mais fôlego.
 *
 * Atomicidade: a checagem e o registro rodam na MESMA transação, com lock
 * consultivo por chave — sem isso, duas requisições simultâneas leriam a mesma
 * contagem e ambas passariam.
 *
 * SERVER-ONLY.
 */
import type { Pool } from "pg";
import type { RateLimiter, RegraRate } from "./ratelimit";

/** Remove registros vencidos de vez em quando (1 chamada em ~20). */
const CHANCE_PODA = 20;

/**
 * Retenção da poda — **fixa, e maior que qualquer janela do app** (a maior é a
 * de envio de código, 30 min).
 *
 * Não dá para podar usando a janela da regra que chamou: o login do admin (5
 * min) apagaria os registros de envio ainda válidos dentro dos 30 min, zerando
 * o limite de e-mails sem ninguém perceber.
 */
const RETENCAO_MS = 60 * 60_000;

export class PostgresRateLimiter implements RateLimiter {
  constructor(
    private readonly pool: Pool,
    /** Injetável para o teste não depender de sorteio. */
    private readonly sortear: () => number = Math.random,
  ) {}

  async permitir(chaves: string[], regra: RegraRate, agora: Date = new Date()): Promise<boolean> {
    if (chaves.length === 0) return true;
    const inicioJanela = new Date(agora.getTime() - regra.janelaMs);
    const cliente = await this.pool.connect();

    try {
      await cliente.query("BEGIN");

      // trava as chaves em ordem estável — ordem diferente entre requisições
      // concorrentes daria deadlock. O lock morre junto com a transação.
      for (const chave of [...chaves].sort()) {
        await cliente.query("SELECT pg_advisory_xact_lock(hashtext($1))", [chave]);
      }

      const { rows } = await cliente.query(
        `SELECT chave, count(*)::int AS n
           FROM rate_limit
          WHERE chave = ANY($1::text[]) AND em > $2
          GROUP BY chave`,
        [chaves, inicioJanela],
      );

      if (rows.some((r: { n: number }) => r.n >= regra.max)) {
        await cliente.query("COMMIT"); // nada foi escrito; só solta os locks
        return false;
      }

      await cliente.query(
        `INSERT INTO rate_limit (chave, em) SELECT unnest($1::text[]), $2`,
        [chaves, agora],
      );
      await cliente.query("COMMIT");
      return true;
    } catch (err) {
      await cliente.query("ROLLBACK").catch(() => undefined);
      // não engole: sem contador confiável, deixar passar seria abrir a porteira.
      // A rota transforma isso em 500 — e o fluxo dependeria do banco de todo jeito.
      throw err;
    } finally {
      cliente.release();
      void this.podarDeVezEmQuando(agora);
    }
  }

  /** Poda oportunista: mantém a tabela pequena sem precisar de cron. */
  private async podarDeVezEmQuando(agora: Date): Promise<void> {
    if (this.sortear() * CHANCE_PODA >= 1) return;
    const limite = new Date(agora.getTime() - RETENCAO_MS);
    try {
      await this.pool.query("DELETE FROM rate_limit WHERE em < $1", [limite]);
    } catch {
      // limpeza é conveniência: falhar aqui não pode afetar a requisição
    }
  }
}
