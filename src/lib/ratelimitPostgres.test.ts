/**
 * Limitador compartilhado: o que importa é ele contar certo entre instâncias e
 * não deixar passar quem estourou. Como o `pg` real exigiria um banco, aqui roda
 * um Postgres falso que registra a conversa (BEGIN/lock/SELECT/INSERT/COMMIT) —
 * o que se testa é a lógica e o protocolo, não o driver.
 */
import { describe, it, expect, vi } from "vitest";
import { PostgresRateLimiter } from "./ratelimitPostgres";
import type { RegraRate } from "./ratelimit";

const REGRA: RegraRate = { max: 3, janelaMs: 30 * 60_000 };
const T0 = new Date("2026-06-17T12:00:00.000Z");

/** Pool falso: devolve as contagens combinadas e guarda os comandos emitidos. */
function poolFake(contagens: Record<string, number> = {}, opts: { falhar?: boolean } = {}) {
  const comandos: string[] = [];
  const liberado: boolean[] = [];
  const cliente = {
    query: vi.fn(async (sql: string, params?: unknown[]) => {
      comandos.push(sql.trim().split("\n")[0]!.trim());
      if (opts.falhar && sql.includes("SELECT chave")) throw new Error("conexão caiu");
      if (sql.includes("SELECT chave")) {
        const chaves = (params?.[0] ?? []) as string[];
        return {
          rows: chaves
            .filter((c) => contagens[c] !== undefined)
            .map((c) => ({ chave: c, n: contagens[c]! })),
        };
      }
      return { rows: [] };
    }),
    release: vi.fn(() => void liberado.push(true)),
  };
  const pool = {
    connect: vi.fn(async () => cliente),
    // tipado com os parâmetros para o teste conseguir inspecionar a poda
    query: vi.fn(async (_sql: string, _params?: unknown[]) => ({ rows: [] as unknown[] })),
  };
  return { pool, cliente, comandos, liberado };
}

/** `sortear` fixo em 1 desliga a poda (só ligamos onde ela é o alvo). */
const semPoda = () => 1;

describe("PostgresRateLimiter", () => {
  it("dentro do limite: registra e permite", async () => {
    const { pool, comandos } = poolFake({ "email:a@x.com": 2 });
    const rl = new PostgresRateLimiter(pool as never, semPoda);

    expect(await rl.permitir(["email:a@x.com", "ip:1.1.1.1"], REGRA, T0)).toBe(true);
    expect(comandos).toContain("BEGIN");
    expect(comandos.some((c) => c.startsWith("INSERT INTO rate_limit"))).toBe(true);
    expect(comandos).toContain("COMMIT");
  });

  it("chave estourada barra e NÃO registra nada (nem para as outras chaves)", async () => {
    const { pool, comandos } = poolFake({ "email:a@x.com": 3 });
    const rl = new PostgresRateLimiter(pool as never, semPoda);

    expect(await rl.permitir(["email:a@x.com", "ip:1.1.1.1"], REGRA, T0)).toBe(false);
    expect(comandos.some((c) => c.startsWith("INSERT"))).toBe(false);
    expect(comandos).toContain("COMMIT"); // fecha a transação para soltar os locks
  });

  it("trava as chaves em ordem estável — ordem variável daria deadlock", async () => {
    const { pool, cliente } = poolFake();
    const rl = new PostgresRateLimiter(pool as never, semPoda);

    await rl.permitir(["z:2", "a:1", "m:3"], REGRA, T0);

    const travadas = cliente.query.mock.calls
      .filter(([sql]) => String(sql).includes("pg_advisory_xact_lock"))
      .map(([, params]) => (params as string[])[0]);
    expect(travadas).toEqual(["a:1", "m:3", "z:2"]);
  });

  it("checagem e registro na MESMA transação (senão dois requests simultâneos passam)", async () => {
    const { pool, comandos } = poolFake();
    const rl = new PostgresRateLimiter(pool as never, semPoda);

    await rl.permitir(["ip:1.1.1.1"], REGRA, T0);

    const iBegin = comandos.indexOf("BEGIN");
    const iSelect = comandos.findIndex((c) => c.startsWith("SELECT chave"));
    const iInsert = comandos.findIndex((c) => c.startsWith("INSERT INTO rate_limit"));
    const iCommit = comandos.indexOf("COMMIT");
    expect(iBegin).toBeLessThan(iSelect);
    expect(iSelect).toBeLessThan(iInsert);
    expect(iInsert).toBeLessThan(iCommit);
  });

  it("banco fora do ar: propaga (deixar passar seria abrir a porteira) e devolve a conexão", async () => {
    const { pool, cliente, comandos } = poolFake({}, { falhar: true });
    const rl = new PostgresRateLimiter(pool as never, semPoda);

    await expect(rl.permitir(["ip:1.1.1.1"], REGRA, T0)).rejects.toThrow();
    expect(comandos).toContain("ROLLBACK");
    expect(cliente.release).toHaveBeenCalled(); // conexão nunca vaza do pool
  });

  it("a poda usa retenção FIXA de 1h — não a janela da regra que chamou", async () => {
    // com a janela da regra, um login (5 min) apagaria envios ainda válidos (30 min)
    const { pool } = poolFake();
    const rl = new PostgresRateLimiter(pool as never, () => 0); // força a poda
    const regraCurta: RegraRate = { max: 5, janelaMs: 5 * 60_000 };

    await rl.permitir(["admin:login:1.1.1.1"], regraCurta, T0);
    await new Promise((r) => setTimeout(r, 0)); // a poda é disparada sem await

    const [sql, params] = pool.query.mock.calls[0]!;
    expect(String(sql)).toContain("DELETE FROM rate_limit");
    expect((params as Date[])[0]!.toISOString()).toBe(new Date(T0.getTime() - 3_600_000).toISOString());
  });

  it("lista de chaves vazia é permitida sem tocar no banco", async () => {
    const { pool } = poolFake();
    const rl = new PostgresRateLimiter(pool as never, semPoda);
    expect(await rl.permitir([], REGRA, T0)).toBe(true);
    expect(pool.connect).not.toHaveBeenCalled();
  });
});
