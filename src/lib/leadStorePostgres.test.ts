/**
 * Escritas direcionadas no Postgres (O7·S1, O8): cada fluxo grava só as suas
 * colunas — o pedido de acesso o contato, a verificação o código, o admin o
 * funil. Pool falso: o que se testa é o SQL emitido, não o driver.
 * A leitura tolera linha antiga (status da O7, colunas da 004 ausentes).
 */
import { describe, it, expect, vi } from "vitest";
import { PostgresLeadStore } from "./leadStorePostgres";
import { diaDoBanco } from "./leadStorePostgresLinha";
import type { AtualizacaoContato } from "./leadStore";
import { leadCru } from "../features/lead/apoioTestes";

function poolFake(linhasDevolvidas: unknown[] = [{ id: "lead-1" }], erro?: unknown) {
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

const loja = (pool: unknown) => new PostgresLeadStore(pool as never);
const T = "2026-06-17T12:00:00.000Z";

const CONTATO: AtualizacaoContato = {
  nome: "Corretor Exemplo",
  telefone: "+5511900000000",
  creci: "SP 12345",
  consentimento: { texto: "texto da política", aceitoEm: "2026-06-17T12:00:00.000Z", ip: "1.2.3.4" },
  atualizadoEm: "2026-06-17T12:00:00.000Z",
};

/** Colunas que aparecem no SET, na ordem. */
const colunasDoSet = (sql: string) =>
  sql
    .replace(/^UPDATE leads SET /, "")
    .replace(/ WHERE id = \$1 RETURNING .+$/, "")
    .split(", ")
    .map((a) => a.split(" = ")[0]);

/** Linha como o `pg` devolve do `SELECT *` de antes da migração 004 (status antigo, sem as colunas novas). */
function linhaO7(over: Record<string, unknown> = {}) {
  const d = new Date(T);
  return {
    id: "lead-1",
    email: "corretor@exemplo.com",
    telefone: "+5511900000000",
    creci: "SP 12345",
    status: "verificado",
    consentimento_texto: "texto",
    consentimento_aceito_em: d,
    consentimento_ip: "1.2.3.4",
    codigo_hash: "",
    codigo_expira_em: d,
    codigo_tentativas: 0,
    codigo_enviado_em: d,
    verificado_em: d,
    origem_utm: null,
    origem_ref: null,
    criado_em: d,
    atualizado_em: d,
    ...over,
  };
}

describe("PostgresLeadStore.atualizarContato (O9: só depois do código certo)", () => {
  it("grava nome, telefone, CRECI e consentimento — e nada de código, origem, status, verificado_em", async () => {
    const { pool, consultas, cliente } = poolFake();
    await loja(pool).atualizarContato("lead-1", CONTATO);

    const { sql, params } = consultas[0]!;
    expect(colunasDoSet(sql)).toEqual([
      "nome",
      "telefone",
      "creci",
      "consentimento_texto",
      "consentimento_aceito_em",
      "consentimento_ip",
      "atualizado_em",
    ]);
    expect(params).toEqual([
      "lead-1",
      "Corretor Exemplo",
      "+5511900000000",
      "SP 12345",
      "texto da política",
      "2026-06-17T12:00:00.000Z",
      "1.2.3.4",
      "2026-06-17T12:00:00.000Z",
    ]);
    for (const intocavel of ["status", "verificado_em", "criado_em", "email", "canal", "codigo_hash", "origem_utm", "origem_ref"]) {
      expect(colunasDoSet(sql)).not.toContain(intocavel);
    }
    expect(cliente.release).toHaveBeenCalledTimes(1);
  });

  it("campo ausente não entra no SQL (o WhatsApp de outro lead fica para trás, o resto grava)", async () => {
    const { pool, consultas } = poolFake();
    const { telefone: _t, ...semTelefone } = CONTATO;
    await loja(pool).atualizarContato("lead-1", semTelefone);
    expect(colunasDoSet(consultas[0]!.sql).slice(0, 2)).toEqual(["nome", "creci"]);
  });

  it("lead que sumiu (excluído nesse meio): erro", async () => {
    const { pool } = poolFake([]);
    await expect(loja(pool).atualizarContato("lead-x", CONTATO)).rejects.toThrow("lead não encontrado para atualizar");
  });
});

describe("PostgresLeadStore — leitura tolerante (O8)", () => {
  it("linha da O7 (status antigo, sem as colunas da 004) vira etapa nova, canal site", async () => {
    const { pool, consultas } = poolFake([
      linhaO7(),
      linhaO7({ id: "lead-2", status: "contatado" }),
      linhaO7({ id: "lead-3", status: "descartado" }),
    ]);
    const leads = await loja(pool).listar();
    expect(consultas[0]!.sql).toMatch(/^SELECT \* FROM leads/);
    expect(leads.map((l) => [l.status, l.canal])).toEqual([
      ["novo", "site"],
      ["em_contato", "site"],
      ["perdido", "site"],
    ]);
    expect(leads[0]!.verificadoEm).toBe(T); // o selo continua
    for (const campo of ["nome", "retomarEm", "motivo", "proximaAcaoEm", "proximaAcao"]) {
      expect(leads[0]).not.toHaveProperty(campo);
    }
  });

  it("colunas da 004: DATE (meia-noite local) → AAAA-MM-DD, e-mail NULL → lead sem e-mail", async () => {
    const { pool } = poolFake([
      linhaO7({
        status: "retomar",
        email: null,
        nome: "Ana Exemplo",
        canal: "indicacao",
        retomar_em: new Date(2026, 6, 1),
        motivo: "viajando",
        proxima_acao_em: "2026-06-20",
        proxima_acao: "ligar",
      }),
    ]);
    const lead = await loja(pool).buscarPorId("lead-1");
    expect(lead).toMatchObject({
      status: "retomar",
      nome: "Ana Exemplo",
      canal: "indicacao",
      retomarEm: "2026-07-01",
      motivo: "viajando",
      proximaAcaoEm: "2026-06-20",
      proximaAcao: "ligar",
    });
    expect(lead).not.toHaveProperty("email");
    expect(diaDoBanco(new Date(Number.NaN))).toBeUndefined();
    expect(diaDoBanco("lixo")).toBeUndefined();
  });
});

describe("PostgresLeadStore — criar (O8)", () => {
  const colunasDoInsert = (sql: string) => /INSERT INTO leads \(([^)]+)\)/.exec(sql)![1]!.split(", ");

  it("lead do site: só as colunas da O7 (grava mesmo antes da migração 004; canal vem do padrão do banco)", async () => {
    const { pool, consultas } = poolFake([]);
    await loja(pool).criar(leadCru());
    const colunas = colunasDoInsert(consultas[0]!.sql);
    expect(colunas).toHaveLength(17);
    for (const nova of ["nome", "canal", "retomar_em", "motivo", "proxima_acao_em", "proxima_acao"]) {
      expect(colunas).not.toContain(nova);
    }
  });

  it("lead manual: e-mail NULL, nome e canal gravados", async () => {
    const { pool, consultas } = poolFake([]);
    await loja(pool).criar(leadCru({ email: undefined, nome: "Bruna", canal: "evento" }));
    const { sql, params } = consultas[0]!;
    const colunas = colunasDoInsert(sql);
    expect(params[colunas.indexOf("email")]).toBeNull();
    expect(params[colunas.indexOf("nome")]).toBe("Bruna");
    expect(params[colunas.indexOf("canal")]).toBe("evento");
  });

  it("e-mail repetido (23505) → a mesma mensagem do adaptador de arquivo", async () => {
    const { pool } = poolFake([], Object.assign(new Error("dup"), { code: "23505" }));
    await expect(loja(pool).criar(leadCru())).rejects.toThrow("já existe lead com este e-mail");
  });
});

describe("PostgresLeadStore — escritas do funil e do código (O8)", () => {
  it("atualizarFunil: SET só das colunas do funil que vieram + atualizado_em, e devolve o lead", async () => {
    const { pool, consultas } = poolFake([linhaO7({ status: "perdido", motivo: "preço" })]);
    const lead = await loja(pool).atualizarFunil("lead-1", {
      status: "perdido",
      motivo: "preço",
      retomarEm: null,
      atualizadoEm: T,
    });

    const { sql, params } = consultas[0]!;
    expect(sql).toMatch(/RETURNING \*$/);
    expect(colunasDoSet(sql)).toEqual(["status", "retomar_em", "motivo", "atualizado_em"]);
    expect(params).toEqual(["lead-1", "perdido", null, "preço", T]);
    for (const intocavel of ["email", "telefone", "creci", "codigo_hash", "verificado_em", "consentimento_texto", "nome", "canal"]) {
      expect(colunasDoSet(sql)).not.toContain(intocavel);
    }
    expect(lead).toMatchObject({ status: "perdido", motivo: "preço" });
  });

  it("atualizarFunil de lead que não existe → null", async () => {
    const { pool } = poolFake([]);
    expect(await loja(pool).atualizarFunil("x", { status: "cliente", atualizadoEm: T })).toBeNull();
  });

  it("atualizarCodigo: código + COALESCE do carimbo — a etapa nem aparece", async () => {
    const { pool, consultas } = poolFake();
    const codigo = { hash: "", expiraEm: T, tentativas: 0, enviadoEm: T };
    await loja(pool).atualizarCodigo("lead-1", { codigo, verificadoEm: T, atualizadoEm: T });
    const { sql, params } = consultas[0]!;
    expect(sql).toContain("verificado_em = COALESCE(verificado_em, $6)");
    expect(sql).not.toMatch(/\bstatus\b|retomar_em|motivo|proxima_acao/);
    expect(params).toEqual(["lead-1", "", T, 0, T, T, T]);

    const vazio = poolFake([]);
    await expect(loja(vazio.pool).atualizarCodigo("x", { codigo, atualizadoEm: T })).rejects.toThrow("lead não encontrado");
  });
});

describe("PostgresLeadStore — anotações (O8)", () => {
  it("adicionarNota grava na lead_notas; lead inexistente (FK 23503) → null; outro erro sobe", async () => {
    const ok = poolFake([]);
    const nota = await loja(ok.pool).adicionarNota("lead-1", "texto", T);
    expect(ok.consultas[0]!.sql).toMatch(/^INSERT INTO lead_notas \(id, lead_id, texto, em\)/);
    expect(ok.consultas[0]!.params).toEqual([nota!.id, "lead-1", "texto", T]);

    const semLead = poolFake([], Object.assign(new Error("fk"), { code: "23503" }));
    expect(await loja(semLead.pool).adicionarNota("x", "texto", T)).toBeNull();

    const fora = poolFake([], Object.assign(new Error("sem tabela"), { code: "42P01" }));
    await expect(loja(fora.pool).adicionarNota("lead-1", "texto", T)).rejects.toThrow("sem tabela");
  });

  it("listarNotas: só do lead, da mais recente para a mais antiga", async () => {
    const { pool, consultas } = poolFake([{ id: "n1", texto: "oi", em: new Date(T) }]);
    expect(await loja(pool).listarNotas("lead-1")).toEqual([{ id: "n1", texto: "oi", em: T }]);
    expect(consultas[0]!.sql).toMatch(/WHERE lead_id = \$1 ORDER BY em DESC/);
    expect(consultas[0]!.params).toEqual(["lead-1"]);
  });
});
