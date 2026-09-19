/**
 * FileLeadStore (dev) nas operações da O8: leitura tolerante a status antigo,
 * escritas direcionadas e anotações no mesmo arquivo — apagadas com o lead.
 */
import { describe, it, expect, afterEach } from "vitest";
import { promises as fs } from "fs";
import os from "os";
import path from "path";
import { randomUUID } from "crypto";
import { FileLeadStore } from "./leadStore";
import { leadCru } from "../features/lead/apoioTestes";

const T0 = "2026-06-17T12:00:00.000Z";
let arquivos: string[] = [];
function novo() {
  const arquivo = path.join(os.tmpdir(), `leads-store-${randomUUID()}.json`);
  arquivos.push(arquivo);
  return { arquivo, store: new FileLeadStore(arquivo) };
}
afterEach(async () => {
  await Promise.all(arquivos.map((a) => fs.rm(a, { force: true })));
  arquivos = [];
});

const lerArquivo = async (arquivo: string) => JSON.parse(await fs.readFile(arquivo, "utf8")) as Record<string, unknown>[];

describe("FileLeadStore — leitura", () => {
  it("arquivo da O7 (status antigo, sem canal) é lido com etapa e canal novos, sem regravar", async () => {
    const { arquivo, store } = novo();
    const { canal: _canal, ...semCanal } = leadCru({ status: "contatado" as never });
    await fs.writeFile(arquivo, JSON.stringify([semCanal]), "utf8");

    expect(await store.buscarPorId("1")).toMatchObject({ status: "em_contato", canal: "site" });
    expect(await store.buscarPorEmail("corretor@exemplo.com")).toMatchObject({ status: "em_contato" });
    expect((await lerArquivo(arquivo))[0]!.status).toBe("contatado"); // leitura não escreve
  });
});

describe("FileLeadStore — escritas direcionadas", () => {
  it("atualizarFunil grava só o funil; null limpa; o resto do lead fica igual", async () => {
    const { store } = novo();
    await store.criar(leadCru({ proximaAcaoEm: "2026-06-20", proximaAcao: "ligar" }));
    const antes = (await store.buscarPorId("1"))!;

    const depois = await store.atualizarFunil("1", {
      status: "retomar",
      retomarEm: "2026-07-01",
      motivo: "viajando",
      proximaAcaoEm: null,
      proximaAcao: null,
      atualizadoEm: T0,
    });
    expect(depois).toMatchObject({ status: "retomar", retomarEm: "2026-07-01", motivo: "viajando" });
    expect(depois!.proximaAcao).toBeUndefined();
    const { status: _s, retomarEm: _r, motivo: _m, proximaAcao: _p, proximaAcaoEm: _pe, ...resto } = depois!;
    const { status: _s2, proximaAcao: _p2, proximaAcaoEm: _pe2, ...restoAntes } = antes;
    expect(resto).toEqual(restoAntes);
  });

  it("atualizarFunil de id inexistente → null (sem criar)", async () => {
    const { store } = novo();
    expect(await store.atualizarFunil("x", { status: "cliente", atualizadoEm: T0 })).toBeNull();
    expect(await store.listar()).toEqual([]);
  });

  it("atualizarCodigo não re-carimba quem já verificou e não mexe na etapa", async () => {
    const { store } = novo();
    await store.criar(leadCru({ status: "negociacao", verificadoEm: "2026-06-01T00:00:00.000Z" }));
    const codigo = { hash: "", expiraEm: T0, tentativas: 0, enviadoEm: T0 };
    await store.atualizarCodigo("1", { codigo, verificadoEm: T0, atualizadoEm: T0 });
    expect(await store.buscarPorId("1")).toMatchObject({
      status: "negociacao",
      verificadoEm: "2026-06-01T00:00:00.000Z",
      codigo,
    });
    await expect(store.atualizarCodigo("x", { codigo, atualizadoEm: T0 })).rejects.toThrow("lead não encontrado");
  });

  it("lead sem e-mail (cadastro manual) não conflita com outro sem e-mail; e-mail repetido sim", async () => {
    const { store } = novo();
    await store.criar(leadCru({ id: "a", email: undefined }));
    await store.criar(leadCru({ id: "b", email: undefined, telefone: "+5581900000000" }));
    await store.criar(leadCru({ id: "c" }));
    await expect(store.criar(leadCru({ id: "d" }))).rejects.toThrow("já existe lead com este e-mail");
    expect((await store.listar()).map((l) => l.id)).toEqual(["a", "b", "c"]);
  });
});

describe("FileLeadStore — anotações", () => {
  it("moram dentro do lead no mesmo JSON, mas não vazam no listar/buscar", async () => {
    const { arquivo, store } = novo();
    await store.criar(leadCru());
    const nota = await store.adicionarNota("1", "texto-da-anotacao", T0);
    expect(nota).toMatchObject({ texto: "texto-da-anotacao", em: T0 });

    expect((await lerArquivo(arquivo))[0]!.notas).toEqual([nota]);
    expect(JSON.stringify(await store.listar())).not.toContain("texto-da-anotacao");
    expect(JSON.stringify(await store.buscarPorId("1"))).not.toContain("texto-da-anotacao");
  });

  it("escritas do fluxo público e do funil preservam as anotações", async () => {
    const { store } = novo();
    await store.criar(leadCru());
    await store.adicionarNota("1", "fica", T0);
    const lead = (await store.buscarPorId("1"))!;
    await store.atualizarContato("1", { telefone: lead.telefone, creci: lead.creci, consentimento: lead.consentimento, atualizadoEm: T0 });
    await store.atualizarCodigo("1", { codigo: lead.codigo, atualizadoEm: T0 });
    await store.atualizarFunil("1", { status: "cliente", atualizadoEm: T0 });
    expect((await store.listarNotas("1")).map((n) => n.texto)).toEqual(["fica"]);
  });

  it("nota para lead inexistente → null, nada gravado", async () => {
    const { arquivo, store } = novo();
    await store.criar(leadCru());
    expect(await store.adicionarNota("x", "solta", T0)).toBeNull();
    expect(await fs.readFile(arquivo, "utf8")).not.toContain("solta");
  });

  it("excluir o lead tira as anotações do arquivo (exclusão LGPD completa)", async () => {
    const { arquivo, store } = novo();
    await store.criar(leadCru());
    await store.adicionarNota("1", "anotacao-sensivel", T0);
    expect(await store.excluir("1")).toBe(true);
    expect(await fs.readFile(arquivo, "utf8")).not.toContain("anotacao-sensivel");
    expect(await store.listarNotas("1")).toEqual([]);
  });
});
