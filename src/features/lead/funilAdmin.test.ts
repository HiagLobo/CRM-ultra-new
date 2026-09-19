import { describe, it, expect, afterEach } from "vitest";
import { conferirCreci, definirProximaAcao, mudarEtapa } from "./funilAdmin";
import { criarLeads, leadCru, storesTemporarias } from "./apoioTestes";
import { ETAPAS_SIMPLES } from "./funil";

// 2026-06-17 09:00 em Recife
const T0 = new Date("2026-06-17T12:00:00.000Z");
const HOJE = "2026-06-17";
const AMANHA = "2026-06-18";
const stores = storesTemporarias("leads-funil");
afterEach(() => stores.limpar());

async function umLead() {
  const store = stores.nova();
  const [lead] = await criarLeads(store, 1, T0);
  return { store, id: lead!.id };
}

/** O que o fluxo público grava e o funil nunca pode tocar. */
async function intocaveis(store: Awaited<ReturnType<typeof umLead>>["store"], id: string) {
  const l = (await store.buscarPorId(id))!;
  return { email: l.email, telefone: l.telefone, creci: l.creci, codigo: l.codigo, consentimento: l.consentimento };
}

describe("mudarEtapa — cada transição", () => {
  it.each(ETAPAS_SIMPLES)("novo → %s grava a etapa e devolve a auditoria {id, de, para}", async (etapa) => {
    const { store, id } = await umLead();
    const antes = await intocaveis(store, id);
    const r = await mudarEtapa(store, id, { etapa }, T0);
    if (r.status !== "ok") throw new Error(`esperava ok, veio ${r.status}`);
    expect(r.lead.status).toBe(etapa);
    expect(r.auditoria).toEqual({ acao: "lead.etapa", dados: { id, de: "novo", para: etapa } });
    expect((await store.buscarPorId(id))!.status).toBe(etapa);
    expect(await intocaveis(store, id)).toEqual(antes); // escrita direcionada: contato e código intactos
  });

  it("retomar depois: exige dia DEPOIS de hoje (Recife) e guarda data e motivo", async () => {
    const { store, id } = await umLead();
    expect(await mudarEtapa(store, id, { etapa: "retomar", retomarEm: HOJE }, T0)).toEqual({
      status: "data_invalida",
      campo: "retomarEm",
    });
    expect(await mudarEtapa(store, id, { etapa: "retomar", retomarEm: "2026-06-01" }, T0)).toMatchObject({
      status: "data_invalida",
    });
    expect(await mudarEtapa(store, id, { etapa: "retomar", retomarEm: "2026-02-30" }, T0)).toMatchObject({
      status: "data_invalida",
    });
    expect((await store.buscarPorId(id))!.status).toBe("novo"); // recusado: nada gravado

    const r = await mudarEtapa(store, id, { etapa: "retomar", retomarEm: AMANHA, motivo: "viajando" }, T0);
    expect(r).toMatchObject({ status: "ok", lead: { status: "retomar", retomarEm: AMANHA, motivo: "viajando" } });
  });

  it("'amanhã' é pelo relógio de Recife: 23:30 do dia 17 em Recife ainda aceita o dia 18", async () => {
    const { store, id } = await umLead();
    const noite = new Date("2026-06-18T02:30:00.000Z"); // 23:30 do dia 17 em Recife
    expect(await mudarEtapa(store, id, { etapa: "retomar", retomarEm: AMANHA }, noite)).toMatchObject({ status: "ok" });
  });

  it("perdido guarda o motivo e a data de retomar some", async () => {
    const { store, id } = await umLead();
    await mudarEtapa(store, id, { etapa: "retomar", retomarEm: AMANHA, motivo: "viajando" }, T0);
    const r = await mudarEtapa(store, id, { etapa: "perdido", motivo: "já usa outro CRM" }, T0);
    expect(r).toMatchObject({ status: "ok", lead: { status: "perdido", motivo: "já usa outro CRM" } });
    const salvo = (await store.buscarPorId(id))!;
    expect(salvo.retomarEm).toBeUndefined();
    if (r.status === "ok") expect(r.auditoria.dados).toEqual({ id, de: "retomar", para: "perdido" });
  });

  it("saindo de retomar/perdido, data e motivo são limpos", async () => {
    const { store, id } = await umLead();
    await mudarEtapa(store, id, { etapa: "retomar", retomarEm: AMANHA, motivo: "viajando" }, T0);
    await mudarEtapa(store, id, { etapa: "em_contato" }, T0);
    const salvo = (await store.buscarPorId(id))!;
    expect(salvo).toMatchObject({ status: "em_contato" });
    expect(salvo.retomarEm).toBeUndefined();
    expect(salvo.motivo).toBeUndefined();
  });

  it("indo para retomar ou perdido, a próxima ação sai da fila; nas outras etapas ela fica", async () => {
    const { store, id } = await umLead();
    await definirProximaAcao(store, id, { em: AMANHA, texto: "ligar" }, T0);
    await mudarEtapa(store, id, { etapa: "demonstracao" }, T0);
    expect((await store.buscarPorId(id))!.proximaAcao).toBe("ligar");

    await mudarEtapa(store, id, { etapa: "perdido", motivo: "sem resposta" }, T0);
    const salvo = (await store.buscarPorId(id))!;
    expect(salvo.proximaAcao).toBeUndefined();
    expect(salvo.proximaAcaoEm).toBeUndefined();
  });

  it("lead que não existe → nao_encontrado, sem criar nada", async () => {
    const { store } = await umLead();
    expect(await mudarEtapa(store, "nao-existe", { etapa: "cliente" }, T0)).toEqual({ status: "nao_encontrado" });
    expect(await store.listar()).toHaveLength(1);
  });

  it("a auditoria não leva motivo, contato nem nada além de id e etapas", async () => {
    const { store, id } = await umLead();
    const r = await mudarEtapa(store, id, { etapa: "perdido", motivo: "achou caro, falou com a esposa" }, T0);
    if (r.status !== "ok") throw new Error("esperava ok");
    expect(Object.keys(r.auditoria.dados).sort()).toEqual(["de", "id", "para"]);
    const json = JSON.stringify(r.auditoria);
    for (const pii of ["esposa", "@exemplo.com", "90000", "SP 1234"]) expect(json).not.toContain(pii);
  });
});

describe("definirProximaAcao", () => {
  it("define (dia + texto) e limpa com null; a auditoria diz só qual das duas", async () => {
    const { store, id } = await umLead();
    const r = await definirProximaAcao(store, id, { em: HOJE, texto: "mandar proposta" }, T0);
    expect(r).toMatchObject({ status: "ok", lead: { proximaAcaoEm: HOJE, proximaAcao: "mandar proposta" } });
    if (r.status === "ok") expect(r.auditoria).toEqual({ acao: "lead.proxima_acao", dados: { id, acao: "definida" } });

    const limpa = await definirProximaAcao(store, id, null, T0);
    if (limpa.status !== "ok") throw new Error("esperava ok");
    expect(limpa.lead.proximaAcaoEm).toBeUndefined();
    expect(limpa.lead.proximaAcao).toBeUndefined();
    expect(limpa.auditoria.dados).toEqual({ id, acao: "limpa" });
  });

  it("dia antes de hoje ou inexistente → data_invalida; a etapa não muda", async () => {
    const { store, id } = await umLead();
    expect(await definirProximaAcao(store, id, { em: "2026-06-16", texto: "x" }, T0)).toEqual({
      status: "data_invalida",
      campo: "proximaAcao",
    });
    expect(await definirProximaAcao(store, id, { em: "2026-06-31", texto: "x" }, T0)).toMatchObject({
      status: "data_invalida",
    });
    const salvo = (await store.buscarPorId(id))!;
    expect(salvo.proximaAcaoEm).toBeUndefined();
    expect(salvo.status).toBe("novo");
  });

  it("lead que não existe → nao_encontrado", async () => {
    const { store } = await umLead();
    expect(await definirProximaAcao(store, "x", { em: AMANHA, texto: "ligar" }, T0)).toEqual({
      status: "nao_encontrado",
    });
  });

  it("lead em retomar/perdido → fora_da_fila (nada gravado); limpar continua valendo", async () => {
    const { store, id } = await umLead();
    await mudarEtapa(store, id, { etapa: "perdido", motivo: "preço" }, T0);
    expect(await definirProximaAcao(store, id, { em: AMANHA, texto: "ligar" }, T0)).toEqual({ status: "fora_da_fila" });
    expect((await store.buscarPorId(id))!.proximaAcaoEm).toBeUndefined();

    await mudarEtapa(store, id, { etapa: "retomar", retomarEm: "2026-07-01" }, T0);
    expect(await definirProximaAcao(store, id, { em: AMANHA, texto: "ligar" }, T0)).toEqual({ status: "fora_da_fila" });
    expect(await definirProximaAcao(store, id, null, T0)).toMatchObject({ status: "ok" });
  });
});

describe("conferirCreci (O9)", () => {
  it("marca com o carimbo, troca e desfaz; auditoria só {id, resultado}; contato e código intactos", async () => {
    const { store, id } = await umLead();
    const antes = await intocaveis(store, id);

    const r = await conferirCreci(store, id, "conferido", T0);
    if (r.status !== "ok") throw new Error(`esperava ok, veio ${r.status}`);
    expect(r.lead).toMatchObject({ creciConferencia: "conferido", creciConferidoEm: T0.toISOString() });
    expect(r.auditoria).toEqual({ acao: "lead.creci", dados: { id, resultado: "conferido" } });

    expect(await conferirCreci(store, id, "nao_confere", T0)).toMatchObject({ lead: { creciConferencia: "nao_confere" } });
    const desfeito = await conferirCreci(store, id, null, T0);
    if (desfeito.status !== "ok") throw new Error("esperava ok");
    expect(desfeito.lead.creciConferencia).toBeUndefined();
    expect(desfeito.lead.creciConferidoEm).toBeUndefined();
    expect(desfeito.auditoria.dados).toEqual({ id, resultado: "desfeita" });
    expect(await intocaveis(store, id)).toEqual(antes);
  });

  it("lead sem CRECI → sem_creci (desfazer vale); id inexistente → nao_encontrado", async () => {
    const store = stores.nova();
    await store.criar(leadCru({ id: "manual", creci: "" }));
    expect(await conferirCreci(store, "manual", "conferido", T0)).toEqual({ status: "sem_creci" });
    expect((await conferirCreci(store, "manual", null, T0)).status).toBe("ok");
    expect(await conferirCreci(store, "x", "conferido", T0)).toEqual({ status: "nao_encontrado" });
  });
});
