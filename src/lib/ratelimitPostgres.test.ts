/**
 * Limitador compartilhado: o que importa é ele contar certo entre instâncias e
 * não deixar passar quem estourou. Como o `pg` real exigiria um banco, aqui roda
 * um Postgres falso que registra a conversa (BEGIN/lock/SELECT/INSERT/COMMIT) —
 * o que se testa é a lógica e o protocolo, não o driver.
 */
import { describe, it, expect, vi } from "vitest";
import { PostgresRateLimiter, PREFIXO_GLOBAL } from "./ratelimitPostgres";
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

  it("chaves globais (teto diário, sem PII) ficam 25h; as de e-mail/IP seguem com 1h", async () => {
    const { pool } = poolFake();
    const rl = new PostgresRateLimiter(pool as never, () => 0); // força a poda
    await rl.permitir(["global:envio:dia"], { max: 90, janelaMs: 24 * 3_600_000 }, T0);
    await new Promise((r) => setTimeout(r, 0));

    const [sql, params] = pool.query.mock.calls[0]!;
    const [curta, longa, prefixo] = params as [Date, Date, string];
    expect(String(sql)).toMatch(/chave NOT LIKE \$3 AND em < \$1/);
    expect(String(sql)).toMatch(/chave LIKE \$3 AND em < \$2/);
    expect(curta.toISOString()).toBe(new Date(T0.getTime() - 3_600_000).toISOString());
    expect(longa.toISOString()).toBe(new Date(T0.getTime() - 25 * 3_600_000).toISOString());
    expect(prefixo).toBe(`${PREFIXO_GLOBAL}%`);
  });

  it("poda que falha não derruba a requisição e fica no log sem a chave", async () => {
    const { pool } = poolFake();
    pool.query.mockRejectedValueOnce(Object.assign(new Error("x"), { code: "42P01" }));
    const avisos = vi.spyOn(console, "warn").mockImplementation(() => {});
    const rl = new PostgresRateLimiter(pool as never, () => 0);

    expect(await rl.permitir(["email:a@x.com"], REGRA, T0)).toBe(true);
    await new Promise((r) => setTimeout(r, 0));
    const log = avisos.mock.calls.map((c) => c.join(" ")).join("\n");
    expect(log).toContain("42P01");
    expect(log).not.toContain("a@x.com");
    avisos.mockRestore();
  });

  it("permitirCada: cada chave contada na SUA janela e barrada pelo SEU máximo", async () => {
    // IP com 9 envios (limite 10) passa; e-mail com 3 (limite 3) barra — e nada é gravado
    const { pool, cliente, comandos } = poolFake({ "ip:1.1.1.1": 9, "email:a@x.com": 3 });
    const rl = new PostgresRateLimiter(pool as never, semPoda);
    const porEmail: RegraRate = { max: 3, janelaMs: 30 * 60_000 };
    const porIp: RegraRate = { max: 10, janelaMs: 30 * 60_000 };

    expect(
      await rl.permitirCada(
        [
          { chave: "email:a@x.com", regra: porEmail },
          { chave: "ip:1.1.1.1", regra: porIp },
        ],
        T0,
      ),
    ).toBe(false);
    expect(comandos.some((c) => c.startsWith("INSERT"))).toBe(false);

    // o início de cada janela vai junto com a sua chave
    const select = cliente.query.mock.calls.find(([sql]) => String(sql).includes("SELECT chave"))!;
    const [chaves, inicios] = select[1] as [string[], Date[]];
    expect(chaves).toEqual(["email:a@x.com", "ip:1.1.1.1"]);
    expect(inicios.map((d) => d.toISOString())).toEqual([
      new Date(T0.getTime() - 30 * 60_000).toISOString(),
      new Date(T0.getTime() - 30 * 60_000).toISOString(),
    ]);
  });

  it("permitirCada: janelas diferentes (30 min × 24h) na mesma consulta", async () => {
    const { pool, cliente } = poolFake({ "global:envio:dia": 89 });
    const rl = new PostgresRateLimiter(pool as never, semPoda);

    expect(
      await rl.permitirCada(
        [
          { chave: "ip:1.1.1.1", regra: { max: 10, janelaMs: 30 * 60_000 } },
          { chave: "global:envio:dia", regra: { max: 90, janelaMs: 24 * 3_600_000 } },
        ],
        T0,
      ),
    ).toBe(true);
    const select = cliente.query.mock.calls.find(([sql]) => String(sql).includes("SELECT chave"))!;
    const [, inicios] = select[1] as [string[], Date[]];
    expect(inicios[1]!.toISOString()).toBe(new Date(T0.getTime() - 24 * 3_600_000).toISOString());
  });

  it("lista de chaves vazia é permitida sem tocar no banco", async () => {
    const { pool } = poolFake();
    const rl = new PostgresRateLimiter(pool as never, semPoda);
    expect(await rl.permitir([], REGRA, T0)).toBe(true);
    expect(pool.connect).not.toHaveBeenCalled();
  });
});
