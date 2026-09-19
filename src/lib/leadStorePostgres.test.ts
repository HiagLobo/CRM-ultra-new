/**
 * `atualizarContato` no Postgres (O7·S1): o UPDATE do pedido de acesso não pode
 * tocar em status, `verificado_em` nem `criado_em` — é isso que impede o
 * reenvio de desfazer uma verificação feita durante o envio do e-mail. Pool
 * falso: o que se testa é o SQL emitido, não o driver.
 */
import { describe, it, expect, vi } from "vitest";
import { PostgresLeadStore } from "./leadStorePostgres";
import type { AtualizacaoContato } from "./leadStore";

function poolFake(linhasDevolvidas: unknown[] = [{ id: "lead-1" }]) {
  const consultas: { sql: string; params: unknown[] }[] = [];
  const cliente = {
    query: vi.fn(async (sql: string, params: unknown[] = []) => {
      consultas.push({ sql, params });
      return { rows: linhasDevolvidas };
    }),
    release: vi.fn(),
  };
  return { pool: { connect: vi.fn(async () => cliente) }, consultas, cliente };
}

const CONTATO: AtualizacaoContato = {
  telefone: "+5511900000000",
  creci: "SP 12345",
  origem: { utm: "campanha" },
  consentimento: { texto: "texto da política", aceitoEm: "2026-06-17T12:00:00.000Z", ip: "1.2.3.4" },
  atualizadoEm: "2026-06-17T12:00:00.000Z",
};

/** Colunas que aparecem no SET, na ordem. */
const colunasDoSet = (sql: string) =>
  sql
    .replace(/^UPDATE leads SET /, "")
    .replace(/ WHERE id = \$1 RETURNING id$/, "")
    .split(", ")
    .map((a) => a.split(" = ")[0]);

describe("PostgresLeadStore.atualizarContato", () => {
  it("sem código: atualiza só contato, origem, consentimento e atualizado_em", async () => {
    const { pool, consultas, cliente } = poolFake();
    await new PostgresLeadStore(pool as never).atualizarContato("lead-1", CONTATO);

    const { sql, params } = consultas[0]!;
    expect(colunasDoSet(sql)).toEqual([
      "telefone",
      "creci",
      "origem_utm",
      "origem_ref",
      "consentimento_texto",
      "consentimento_aceito_em",
      "consentimento_ip",
      "atualizado_em",
    ]);
    expect(params).toEqual([
      "lead-1",
      "+5511900000000",
      "SP 12345",
      "campanha",
      null,
      "texto da política",
      "2026-06-17T12:00:00.000Z",
      "1.2.3.4",
      "2026-06-17T12:00:00.000Z",
    ]);
    expect(cliente.release).toHaveBeenCalledTimes(1);
  });

  it("com código: acrescenta as 4 colunas do código — e nada de status/verificado_em/criado_em", async () => {
    const { pool, consultas } = poolFake();
    const codigo = { hash: "a".repeat(64), expiraEm: "2026-06-17T12:10:00.000Z", tentativas: 0, enviadoEm: "2026-06-17T12:00:00.000Z" };
    await new PostgresLeadStore(pool as never).atualizarContato("lead-1", { ...CONTATO, codigo });

    const { sql, params } = consultas[0]!;
    expect(colunasDoSet(sql).slice(-4)).toEqual(["codigo_hash", "codigo_expira_em", "codigo_tentativas", "codigo_enviado_em"]);
    expect(params.slice(-4)).toEqual([codigo.hash, codigo.expiraEm, 0, codigo.enviadoEm]);
    for (const intocavel of ["status", "verificado_em", "criado_em", "email"]) {
      expect(colunasDoSet(sql)).not.toContain(intocavel);
    }
  });

  it("lead que sumiu (excluído nesse meio): erro, como o atualizar", async () => {
    const { pool } = poolFake([]);
    await expect(new PostgresLeadStore(pool as never).atualizarContato("lead-x", CONTATO)).rejects.toThrow(
      "lead não encontrado para atualizar",
    );
  });
});
