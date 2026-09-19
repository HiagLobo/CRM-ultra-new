import { describe, it, expect, afterEach } from "vitest";
import { anotar, listarNotasDoLead } from "./notas";
import { excluirLead } from "./admin";
import { criarLeads, storesTemporarias } from "./apoioTestes";

const T0 = new Date("2026-06-17T12:00:00.000Z");
const depois = (min: number) => new Date(T0.getTime() + min * 60_000);
const stores = storesTemporarias("leads-notas");
afterEach(() => stores.limpar());

describe("anotações do lead", () => {
  it("grava e lista da mais recente para a mais antiga", async () => {
    const store = stores.nova();
    const [lead] = await criarLeads(store, 1, T0);
    await anotar(store, lead!.id, "primeira conversa", T0);
    await anotar(store, lead!.id, "pediu proposta", depois(5));

    const r = await listarNotasDoLead(store, lead!.id);
    if (r.status !== "ok") throw new Error("esperava ok");
    expect(r.notas.map((n) => n.texto)).toEqual(["pediu proposta", "primeira conversa"]);
    expect(r.notas[0]).toMatchObject({ em: depois(5).toISOString() });
    expect(r.notas[0]!.id).toBeTruthy();
  });

  it("anotação de um lead não aparece no outro", async () => {
    const store = stores.nova();
    const [a, b] = await criarLeads(store, 2, T0);
    await anotar(store, a!.id, "só do A", T0);
    expect(await listarNotasDoLead(store, b!.id)).toEqual({ status: "ok", notas: [] });
  });

  it("lead inexistente: listar e anotar → nao_encontrado (nota solta nunca é gravada)", async () => {
    const store = stores.nova();
    await criarLeads(store, 1, T0);
    expect(await listarNotasDoLead(store, "nao-existe")).toEqual({ status: "nao_encontrado" });
    expect(await anotar(store, "nao-existe", "texto", T0)).toEqual({ status: "nao_encontrado" });
  });

  it("a auditoria registra que houve anotação (ids), nunca o texto", async () => {
    const store = stores.nova();
    const [lead] = await criarLeads(store, 1, T0);
    const r = await anotar(store, lead!.id, "ligou do (81) 99999-0000, falar com Maria", T0);
    if (r.status !== "ok") throw new Error("esperava ok");
    expect(r.auditoria).toEqual({ acao: "lead.nota", dados: { id: lead!.id, nota: r.nota.id } });
    expect(JSON.stringify(r.auditoria)).not.toMatch(/Maria|99999/);
  });

  it("excluir o lead (LGPD) apaga as anotações junto", async () => {
    const store = stores.nova();
    const [lead, outro] = await criarLeads(store, 2, T0);
    await anotar(store, lead!.id, "anotação que precisa sumir", T0);
    await anotar(store, outro!.id, "anotação do outro", T0);

    expect(await excluirLead(store, lead!.id)).toBe(true);
    expect(await store.listarNotas(lead!.id)).toEqual([]);
    expect(await listarNotasDoLead(store, lead!.id)).toEqual({ status: "nao_encontrado" });
    // o outro lead segue com a dele
    expect((await store.listarNotas(outro!.id)).map((n) => n.texto)).toEqual(["anotação do outro"]);
  });
});
