/**
 * O que a O9 pede ao store, nos dois adaptadores: achar lead pelo WhatsApp e
 * pelo CRECI (repetidos), carimbar o último acesso em escrita separada e gravar
 * a conferência do CRECI. Postgres com pool falso (o que se testa é o SQL);
 * arquivo em tmpdir.
 */
import { describe, it, expect, vi, afterEach } from "vitest";
import { PostgresLeadStore } from "./leadStorePostgres";
import { leadCru, storesTemporarias } from "../features/lead/apoioTestes";

const T = "2026-06-17T12:00:00.000Z";

function poolFake(linhas: unknown[] = []) {
  const consultas: { sql: string; params: unknown[] }[] = [];
  const cliente = {
    query: vi.fn(async (sql: string, params: unknown[] = []) => {
      consultas.push({ sql, params });
      return { rows: linhas };
    }),
    release: vi.fn(),
  };
  return { loja: new PostgresLeadStore({ connect: vi.fn(async () => cliente) } as never), consultas };
}

/** Linha do `SELECT *` com as colunas da 004 e da 005. */
function linha(over: Record<string, unknown> = {}) {
  const d = new Date(T);
  return {
    id: "lead-1",
    email: "corretor@exemplo.com",
    telefone: "+5581900000001",
    creci: "PE 12345",
    status: "novo",
    canal: "site",
    nome: "Corretor Exemplo",
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

describe("PostgresLeadStore — O9", () => {
  it("buscarPorTelefone: repetido antigo com e-mail primeiro, depois o mais antigo", async () => {
    const { loja, consultas } = poolFake([linha()]);
    expect(await loja.buscarPorTelefone("+5581900000001")).toMatchObject({ id: "lead-1", telefone: "+5581900000001" });
    expect(consultas[0]!.sql).toBe("SELECT * FROM leads WHERE telefone = $1 ORDER BY (email IS NULL), criado_em LIMIT 1");
    expect(consultas[0]!.params).toEqual(["+5581900000001"]);
    expect(await poolFake([]).loja.buscarPorTelefone("+5581900000009")).toBeNull();
  });

  it("buscarPorCreci: qualquer uma das grafias (array no ANY); lista vazia nem consulta", async () => {
    const { loja, consultas } = poolFake([linha()]);
    expect(await loja.buscarPorCreci(["PE 12345-F", "PE 12345"])).toMatchObject({ id: "lead-1" });
    expect(consultas[0]!.sql).toBe("SELECT * FROM leads WHERE creci = ANY($1::text[]) ORDER BY criado_em LIMIT 1");
    expect(consultas[0]!.params).toEqual([["PE 12345-F", "PE 12345"]]);
    const vazio = poolFake([linha()]);
    expect(await vazio.loja.buscarPorCreci([])).toBeNull();
    expect(vazio.consultas).toHaveLength(0);
  });

  it("registrarAcesso: UPDATE só de ultimo_acesso_em (nem atualizado_em)", async () => {
    const { loja, consultas } = poolFake();
    await loja.registrarAcesso("lead-1", T);
    expect(consultas).toEqual([{ sql: "UPDATE leads SET ultimo_acesso_em = $2 WHERE id = $1", params: ["lead-1", T] }]);
  });

  it("atualizarFunil com a conferência: só as 2 colunas + atualizado_em; null desfaz", async () => {
    const { loja, consultas } = poolFake([linha({ creci_conferencia: "conferido", creci_conferido_em: new Date(T) })]);
    const lead = await loja.atualizarFunil("lead-1", { creciConferencia: "conferido", creciConferidoEm: T, atualizadoEm: T });
    expect(consultas[0]!.sql).toBe(
      "UPDATE leads SET creci_conferencia = $2, creci_conferido_em = $3, atualizado_em = $4 WHERE id = $1 RETURNING *",
    );
    expect(lead).toMatchObject({ creciConferencia: "conferido", creciConferidoEm: T });

    const desfaz = poolFake([linha()]);
    await desfaz.loja.atualizarFunil("lead-1", { creciConferencia: null, creciConferidoEm: null, atualizadoEm: T });
    expect(desfaz.consultas[0]!.params).toEqual(["lead-1", null, null, T]);
  });

  it("leitura: colunas da 005 viram campos; valor de conferência desconhecido e colunas ausentes somem", async () => {
    const { loja } = poolFake([
      linha({ ultimo_acesso_em: new Date("2026-06-20T10:00:00.000Z"), creci_conferencia: "nao_confere" }),
      linha({ id: "lead-2", creci_conferencia: "talvez" }),
      linha({ id: "lead-3" }), // antes da 005: nem as colunas existem
    ]);
    const [a, b, c] = await loja.listar();
    expect(a).toMatchObject({ ultimoAcessoEm: "2026-06-20T10:00:00.000Z", creciConferencia: "nao_confere" });
    expect(b).not.toHaveProperty("creciConferencia");
    for (const campo of ["ultimoAcessoEm", "creciConferencia", "creciConferidoEm"]) expect(c).not.toHaveProperty(campo);
  });
});

describe("FileLeadStore — O9", () => {
  const stores = storesTemporarias("leads-store-o9");
  afterEach(() => stores.limpar());

  it("buscarPorTelefone: o que tem e-mail primeiro, depois o mais antigo; buscarPorCreci: o mais antigo", async () => {
    const store = stores.nova();
    await store.criar(leadCru({ id: "manual", email: undefined, telefone: "+5581900000001", creci: "", criadoEm: "2026-06-01T00:00:00.000Z" }));
    await store.criar(leadCru({ id: "novo", email: "b@exemplo.com", telefone: "+5581900000001", creci: "PE 12345-F" }));
    await store.criar(leadCru({ id: "velho", email: "a@exemplo.com", telefone: "+5581900000001", creci: "PE 12345", criadoEm: "2026-06-10T00:00:00.000Z" }));
    await store.criar(leadCru({ id: "sem-creci", email: "c@exemplo.com", telefone: "+5581900000002", creci: "" }));

    expect((await store.buscarPorTelefone("+5581900000001"))?.id).toBe("velho");
    expect(await store.buscarPorTelefone("+5581900000009")).toBeNull();
    expect((await store.buscarPorCreci(["PE 12345-F", "PE 12345"]))?.id).toBe("velho");
    expect((await store.buscarPorCreci(["PE 12345-F"]))?.id).toBe("novo");
    expect(await store.buscarPorCreci(["PE 12345-J"])).toBeNull();
    expect(await store.buscarPorCreci([""])).toBeNull(); // lead sem CRECI não é "repetido" de ninguém
  });

  it("registrarAcesso grava só ultimoAcessoEm; id que sumiu não é erro", async () => {
    const store = stores.nova();
    await store.criar(leadCru());
    const antes = (await store.buscarPorId("1"))!;
    await store.registrarAcesso("1", "2026-06-20T10:00:00.000Z");
    expect(await store.buscarPorId("1")).toEqual({ ...antes, ultimoAcessoEm: "2026-06-20T10:00:00.000Z" });
    await expect(store.registrarAcesso("x", T)).resolves.toBeUndefined();
  });

  it("atualizarContato grava só os campos presentes; conferência marca e desfaz", async () => {
    const store = stores.nova();
    await store.criar(leadCru({ nome: "Nome Antigo" }));
    const consentimento = { texto: "novo texto", aceitoEm: T, ip: "203.0.113.1" };
    await store.atualizarContato("1", { creci: "PE 54321", consentimento, atualizadoEm: T });
    expect(await store.buscarPorId("1")).toMatchObject({ nome: "Nome Antigo", telefone: "+5581988887777", creci: "PE 54321", consentimento });

    expect(await store.atualizarFunil("1", { creciConferencia: "conferido", creciConferidoEm: T, atualizadoEm: T })).toMatchObject({
      creciConferencia: "conferido",
      creciConferidoEm: T,
    });
    const desfeito = await store.atualizarFunil("1", { creciConferencia: null, creciConferidoEm: null, atualizadoEm: T });
    expect(desfeito).not.toHaveProperty("creciConferencia");
    expect(desfeito).not.toHaveProperty("creciConferidoEm");
    await expect(store.atualizarContato("x", { consentimento, atualizadoEm: T })).rejects.toThrow("lead não encontrado");
  });
});
