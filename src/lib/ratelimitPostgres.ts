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
import type { LimiteChave, RateLimiter, RegraRate } from "./ratelimit";
import { causaDoErro } from "./erros";

/** Remove registros vencidos de vez em quando (1 chamada em ~20). */
const CHANCE_PODA = 20;

/**
 * Retenção da poda — **fixa, e maior que qualquer janela por pessoa** (a maior
 * é a de envio de código, 30 min).
 *
 * Não dá para podar usando a janela da regra que chamou: o login do admin (5
 * min) apagaria os registros de envio ainda válidos dentro dos 30 min, zerando
 * o limite de e-mails sem ninguém perceber.
 */
const RETENCAO_MS = 60 * 60_000;

/**
 * Chaves globais (ex.: `global:envio:dia`, o teto diário) têm janela de 24h e
 * ficam 25h. Só elas: as outras carregam e-mail/IP, que não devem ficar na
 * tabela mais que o necessário (LGPD) — por isso a retenção não sobe para todas.
 */
export const PREFIXO_GLOBAL = "global:";
const RETENCAO_GLOBAL_MS = 25 * 60 * 60_000;

export class PostgresRateLimiter implements RateLimiter {
  constructor(
    private readonly pool: Pool,
    /** Injetável para o teste não depender de sorteio. */
    private readonly sortear: () => number = Math.random,
  ) {}

  permitir(chaves: string[], regra: RegraRate, agora: Date = new Date()): Promise<boolean> {
    return this.permitirCada(
      chaves.map((chave) => ({ chave, regra })),
      agora,
    );
  }

  async permitirCada(limites: LimiteChave[], agora: Date = new Date()): Promise<boolean> {
    if (limites.length === 0) return true;
    const chaves = limites.map((l) => l.chave);
    const inicios = limites.map((l) => new Date(agora.getTime() - l.regra.janelaMs));
    const cliente = await this.pool.connect();

    try {
      await cliente.query("BEGIN");

      // trava as chaves em ordem estável — ordem diferente entre requisições
      // concorrentes daria deadlock. O lock morre junto com a transação.
      for (const chave of [...chaves].sort()) {
        await cliente.query("SELECT pg_advisory_xact_lock(hashtext($1))", [chave]);
      }

      // cada chave contada na SUA janela (e-mail 30 min, teto diário 24h...)
      const { rows } = await cliente.query(
        `SELECT chave, count(*)::int AS n
           FROM rate_limit r
           JOIN unnest($1::text[], $2::timestamptz[]) AS l(k, inicio)
             ON r.chave = l.k AND r.em > l.inicio
          GROUP BY chave`,
        [chaves, inicios],
      );
      const contagem = new Map((rows as { chave: string; n: number }[]).map((r) => [r.chave, r.n]));

      if (limites.some((l) => (contagem.get(l.chave) ?? 0) >= l.regra.max)) {
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
    const limiteGlobal = new Date(agora.getTime() - RETENCAO_GLOBAL_MS);
    try {
      await this.pool.query(
        `DELETE FROM rate_limit
          WHERE (chave NOT LIKE $3 AND em < $1)
             OR (chave LIKE $3 AND em < $2)`,
        [limite, limiteGlobal, `${PREFIXO_GLOBAL}%`],
      );
    } catch (err) {
      // limpeza é conveniência: falhar aqui não afeta a requisição, mas fica no log
      // (só a categoria, ex.: db:42P01 — nada de chave, que pode carregar e-mail/IP)
      const causa = causaDoErro(err, "db");
      console.warn("[rate-limit] poda falhou:", causa);
    }
  }
}
