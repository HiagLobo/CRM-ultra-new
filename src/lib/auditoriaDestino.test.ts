/**
 * Para onde a auditoria vai: banco quando existe, arquivo quando não.
 * É a parte que some em silêncio se estiver errada — em produção ninguém repara
 * que o registro não foi gravado até precisar dele.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { promises as fs } from "fs";
import os from "os";
import path from "path";
import { randomUUID } from "crypto";

const { estado } = vi.hoisted(() => ({ estado: { pool: null as { query: unknown } | null } }));
vi.mock("./db", () => ({ poolPostgres: () => estado.pool }));

import { registrarAuditoria, lerAuditoria } from "./auditoria";

const T0 = new Date("2026-06-17T12:00:00.000Z");
let arquivos: string[] = [];
function novoArquivo() {
  const a = path.join(os.tmpdir(), `auditoria-${randomUUID()}.log`);
  arquivos.push(a);
  return a;
}

beforeEach(() => {
  estado.pool = null;
});
afterEach(async () => {
  await Promise.all(arquivos.map((a) => fs.rm(a, { force: true })));
  arquivos = [];
  vi.restoreAllMocks();
});

describe("destino da auditoria", () => {
  it("com banco: grava no Postgres e NÃO toca no disco", async () => {
    const query = vi.fn().mockResolvedValue({ rows: [] });
    estado.pool = { query };
    // espiona a escrita em si — a versão anterior deste teste checava se o
    // arquivo data/auditoria.log existia, e falhava em qualquer máquina onde o
    // app já tivesse rodado. Teste não pode depender do estado da pasta.
    const escreveu = vi.spyOn(fs, "appendFile");

    await registrarAuditoria("lead.exclusao", { id: "abc", motivo: "pedido_do_titular" }, undefined, T0);

    expect(query).toHaveBeenCalledTimes(1);
    const [sql, params] = query.mock.calls[0]!;
    expect(sql).toContain("INSERT INTO auditoria");
    expect(params[0]).toBe(T0.toISOString());
    expect(params[1]).toBe("lead.exclusao");
    expect(JSON.parse(params[2])).toEqual({ id: "abc", motivo: "pedido_do_titular" });
    expect(escreveu).not.toHaveBeenCalled();
  });

  it("sem banco: cai no arquivo (dev)", async () => {
    const log = novoArquivo();
    await registrarAuditoria("lead.status", { id: "x", de: "novo", para: "contatado" }, log, T0);
    const eventos = await lerAuditoria(log);
    expect(eventos).toHaveLength(1);
    expect(eventos[0]!.acao).toBe("lead.status");
  });

  it("caminho explícito usa o arquivo mesmo havendo banco (testes ficam determinísticos)", async () => {
    const query = vi.fn().mockResolvedValue({ rows: [] });
    estado.pool = { query };
    const log = novoArquivo();

    await registrarAuditoria("lead.export", { linhas: 3 }, log, T0);

    expect(query).not.toHaveBeenCalled();
    expect(await lerAuditoria(log)).toHaveLength(1);
  });

  it("banco fora do ar não derruba a ação auditada — só registra o tipo do erro", async () => {
    const erros: string[] = [];
    vi.spyOn(console, "error").mockImplementation((...a: unknown[]) => void erros.push(a.map(String).join(" ")));
    estado.pool = { query: vi.fn().mockRejectedValue(new Error("conexão recusada")) };

    // não pode lançar: abortar um follow-up já persistido seria pior que perder a linha do log
    await expect(
      registrarAuditoria("lead.status", { id: "x" }, undefined, T0),
    ).resolves.toBeUndefined();

    expect(erros.join("\n")).toContain("[auditoria] falha ao registrar");
    expect(erros.join("\n")).not.toContain("conexão recusada"); // sem detalhe do erro
  });

  it("leitura do banco devolve os eventos mais recentes primeiro", async () => {
    estado.pool = {
      query: vi.fn().mockResolvedValue({
        rows: [{ em: T0, acao: "lead.exclusao", dados: { id: "abc" } }],
      }),
    };
    const eventos = await lerAuditoria();
    expect(eventos).toEqual([{ em: T0.toISOString(), acao: "lead.exclusao", dados: { id: "abc" } }]);
  });
});
