/**
 * Pool do Postgres (O7·S2): a trava de produção dá causa legível no log, e uma
 * conexão ociosa que cai não derruba a instância. Nada conecta de verdade — o
 * `pg.Pool` só abre conexão na primeira consulta, e aqui não há consulta.
 */
import { describe, it, expect, afterEach, vi } from "vitest";
import { causaDoErro } from "./erros";

/** Connection string fictícia: host inexistente (.invalid) e senha de mentira. */
const URL_FICTICIA = "postgresql://usuario:senha-ficticia@db.exemplo.invalid/banco?sslmode=verify-full";

async function carregar(ambiente: { NODE_ENV: string; DATABASE_URL: string }) {
  vi.resetModules(); // o pool é cache do módulo: cada teste parte do zero
  vi.stubEnv("NODE_ENV", ambiente.NODE_ENV);
  vi.stubEnv("DATABASE_URL", ambiente.DATABASE_URL);
  return import("./db");
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("poolPostgres — sem DATABASE_URL", () => {
  it("desenvolvimento: null (os stores caem no arquivo)", async () => {
    const { poolPostgres } = await carregar({ NODE_ENV: "development", DATABASE_URL: "" });
    expect(poolPostgres()).toBeNull();
  });

  it("produção: recusa na hora do uso, com causa config:DATABASE_URL para o log", async () => {
    const { poolPostgres } = await carregar({ NODE_ENV: "production", DATABASE_URL: "" });
    const erro = (() => {
      try {
        poolPostgres();
      } catch (e) {
        return e;
      }
    })();
    expect(erro).toBeInstanceOf(Error);
    expect(causaDoErro(erro)).toBe("config:DATABASE_URL");
    // não fica "avaliado": configurada a variável, a próxima instância sobe normal
    expect(() => poolPostgres()).toThrow(/DATABASE_URL é obrigatória em produção/);
  });
});

describe("poolPostgres — conexão ociosa que cai", () => {
  it("o pool tem ouvinte de 'error': emitir não lança e o log leva só a causa", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const { poolPostgres } = await carregar({ NODE_ENV: "production", DATABASE_URL: URL_FICTICIA });
    const pool = poolPostgres()!;
    expect(pool.listenerCount("error")).toBe(1);

    // como o pg-pool emite: o erro do servidor com o cliente (e a senha) pendurado
    const queda = Object.assign(new Error("terminating connection due to administrator command"), {
      code: "57P01",
      client: { connectionParameters: { host: "db.exemplo.invalid", password: "senha-ficticia" } },
    });
    expect(() => pool.emit("error", queda, {})).not.toThrow();

    const saida = log.mock.calls.map((c) => c.join(" ")).join("\n");
    expect(saida).toContain("[db] conexão ociosa caiu (o pool abre outra): db:57P01");
    expect(saida).not.toContain("senha-ficticia");
    expect(saida).not.toContain("db.exemplo.invalid");
    await pool.end();
  });

  it("queda sem código (rede) também vira causa, nunca o erro cru", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const { aoPerderConexaoOciosa } = await carregar({ NODE_ENV: "production", DATABASE_URL: URL_FICTICIA });
    aoPerderConexaoOciosa(new Error("Connection terminated unexpectedly"));
    aoPerderConexaoOciosa(Object.assign(new Error("read ECONNRESET db.exemplo.invalid:5432"), { code: "ECONNRESET" }));
    expect(log.mock.calls.map((c) => c[1])).toEqual(["db:ConexaoEncerrada", "rede:ECONNRESET"]);
  });
});
