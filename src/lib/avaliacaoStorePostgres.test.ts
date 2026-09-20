/**
 * O adaptador de produção das avaliações. Pool falso: o que se testa é o SQL
 * emitido (upsert por `lead_id`, a situação anterior para a auditoria, a
 * listagem que só traz as publicadas COM texto), não o driver.
 */
import { describe, it, expect, vi } from "vitest";
import { PostgresAvaliacaoStore, paraDominio, type LinhaAvaliacao } from "./avaliacaoStorePostgres";
import type { DadosAvaliacao } from "./avaliacaoStorePorta";

const T = "2026-09-19T15:00:00.000Z";

function poolFake(linhasDevolvidas: unknown[] = [linha()], erro?: unknown) {
  const consultas: { sql: string; params: unknown[] }[] = [];
  const cliente = {
    query: vi.fn(async (sql: string, params: unknown[] = []) => {
      consultas.push({ sql, params });
      if (erro) throw erro;
      return { rows: linhasDevolvidas };
    }),
    release: vi.fn(),
  };
  return { pool: { connect: vi.fn(async () => cliente) }, consultas, cliente };
}

const loja = (pool: unknown) => new PostgresAvaliacaoStore(pool as never);

function linha(over: Partial<LinhaAvaliacao> = {}): LinhaAvaliacao {
  const d = new Date(T);
  return {
    id: "aval-1",
    lead_id: "lead-1",
    estrelas: 5,
    comentario: "Organizou meu dia.",
    identificacao: "nome",
    status: "publicado",
    consentimento_texto: "Autorizo…",
    consentimento_em: d,
    consentimento_ip: "203.0.113.9",
    criado_em: d,
    atualizado_em: d,
    ...over,
  };
}

const DADOS: DadosAvaliacao = {
  estrelas: 4,
  comentario: "Bom, mas faltou integração.",
  identificacao: "nome_creci",
  status: "publicado",
  consentimento: { texto: "Autorizo…", em: T, ip: "203.0.113.9" },
  em: T,
};

describe("salvar (upsert por lead)", () => {
  it("INSERT … ON CONFLICT (lead_id) DO UPDATE — sem tocar em id, lead_id e criado_em", async () => {
    const { pool, consultas, cliente } = poolFake();
    await loja(pool).salvar("lead-1", DADOS);

    const { sql, params } = consultas[0]!;
    expect(sql).toContain("ON CONFLICT (lead_id) DO UPDATE SET");
    const set = /DO UPDATE SET (.+) RETURNING/.exec(sql)![1]!.split(", ").map((a) => a.split(" = ")[0]);
    expect(set).toEqual([
      "estrelas",
      "comentario",
      "identificacao",
      "status",
      "consentimento_texto",
      "consentimento_em",
      "consentimento_ip",
      "atualizado_em",
    ]);
    for (const intocavel of ["id =", "lead_id =", "criado_em ="]) expect(sql).not.toContain(intocavel);
    expect(params.slice(1)).toEqual([
      "lead-1",
      4,
      "Bom, mas faltou integração.",
      "nome_creci",
      "publicado",
      "Autorizo…",
      T,
      "203.0.113.9",
      T,
      T,
    ]);
    expect(cliente.release).toHaveBeenCalledTimes(1);
  });

  it("sem comentário grava NULL (e não string vazia)", async () => {
    const { pool, consultas } = poolFake();
    const { comentario: _sem, ...soNota } = DADOS;
    await loja(pool).salvar("lead-1", soNota);
    expect(consultas[0]!.params[3]).toBeNull();
  });
});

describe("leituras", () => {
  it("listarPublicadas: só publicado COM texto, da mais recente para a mais antiga", async () => {
    const { pool, consultas } = poolFake([linha()]);
    await loja(pool).listarPublicadas(12);
    const { sql, params } = consultas[0]!;
    expect(sql).toContain("WHERE status = 'publicado'");
    expect(sql).toContain("comentario IS NOT NULL AND btrim(comentario) <> ''");
    expect(sql).toContain("ORDER BY criado_em DESC LIMIT $1");
    expect(params).toEqual([12]);
  });

  it("resumoContagem conta TODAS as situações (o que sai do ar é o texto, não a nota)", async () => {
    const { pool, consultas } = poolFake([{ soma: 13, quantas: 3 }]);
    expect(await loja(pool).resumoContagem()).toEqual({ soma: 13, quantas: 3 });
    expect(consultas[0]!.sql).not.toContain("WHERE");
  });

  it("tabela vazia: soma e quantidade zeradas, sem NaN", async () => {
    const { pool } = poolFake([]);
    expect(await loja(pool).resumoContagem()).toEqual({ soma: 0, quantas: 0 });
  });

  it("linha do banco → domínio: datas em ISO, comentário NULL vira ausência", () => {
    expect(paraDominio(linha())).toMatchObject({
      id: "aval-1",
      leadId: "lead-1",
      estrelas: 5,
      comentario: "Organizou meu dia.",
      criadoEm: T,
      consentimento: { texto: "Autorizo…", em: T, ip: "203.0.113.9" },
    });
    expect(paraDominio(linha({ comentario: null }))).not.toHaveProperty("comentario");
  });

  it("valor estranho na coluna: identificação vira anônima e situação vira pendente", () => {
    const fora = paraDominio(linha({ identificacao: "inventado", status: "sei_la" }));
    expect(fora).toMatchObject({ identificacao: "anonimo", status: "pendente" });
  });
});

describe("trocarStatus (moderação)", () => {
  it("a CTE devolve a situação anterior junto com a linha nova", async () => {
    const { pool, consultas } = poolFake([{ ...linha({ status: "recusado" }), status_anterior: "publicado" }]);
    const troca = await loja(pool).trocarStatus("aval-1", "recusado", T);

    expect(consultas[0]!.sql).toContain("WITH antiga AS (SELECT id, status FROM avaliacoes WHERE id = $1)");
    expect(consultas[0]!.sql).toContain("RETURNING antiga.status AS status_anterior, a.*");
    expect(consultas[0]!.params).toEqual(["aval-1", "recusado", T]);
    expect(troca).toMatchObject({ anterior: "publicado", avaliacao: { status: "recusado" } });
  });

  it("id que não existe → null (nada é criado)", async () => {
    const { pool } = poolFake([]);
    expect(await loja(pool).trocarStatus("nao-existe", "recusado", T)).toBeNull();
  });

  it("migração 006 pendente (42P01) sobe como erro do banco, com a causa na rota", async () => {
    const { pool } = poolFake([], Object.assign(new Error('relation "avaliacoes" does not exist'), { code: "42P01" }));
    await expect(loja(pool).listarTodas()).rejects.toMatchObject({ code: "42P01" });
  });
});
