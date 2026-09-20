import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

/** localStorage de mentira, no mesmo molde do teste do `guiaState`. */
function storageFake() {
  const dados = new Map<string, string>();
  return {
    getItem: (k: string) => dados.get(k) ?? null,
    setItem: (k: string, v: string) => void dados.set(k, v),
    removeItem: (k: string) => void dados.delete(k),
    get chaves() {
      return [...dados.keys()];
    },
    crua: (k: string) => dados.get(k) ?? null,
    plantar: (k: string, v: string) => void dados.set(k, v),
  };
}

let fake = storageFake();

beforeEach(() => {
  fake = storageFake();
  vi.stubGlobal("window", { localStorage: fake });
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
});

const mod = () => import("./estado");

describe("memória do convite (crm_avaliacao)", () => {
  it("primeira visita: nada guardado, nada dispensado, nada respondido", async () => {
    const { lerEstado } = await mod();
    expect(lerEstado()).toEqual({ segundos: 0, dispensado: false, respondido: false });
  });

  it("guarda o tempo navegado e devolve na visita seguinte", async () => {
    const { salvarSegundos, lerEstado } = await mod();
    salvarSegundos(150);
    expect(lerEstado().segundos).toBe(150);
    salvarSegundos(220);
    expect(lerEstado().segundos).toBe(220);
  });

  it('"Agora não" fica marcado, e o link do Guia reabre o convite', async () => {
    const { marcarDispensado, reabrirConvite, lerEstado, salvarSegundos } = await mod();
    salvarSegundos(240);
    marcarDispensado();
    expect(lerEstado().dispensado).toBe(true);

    reabrirConvite();
    expect(lerEstado().dispensado).toBe(false);
    expect(lerEstado().segundos).toBe(240); // reabrir não zera o tempo navegado
  });

  it("quem respondeu não recebe convite de novo (nem depois de reabrir)", async () => {
    const { marcarRespondido, reabrirConvite, lerEstado } = await mod();
    marcarRespondido();
    expect(lerEstado().respondido).toBe(true);
    reabrirConvite();
    expect(lerEstado().respondido).toBe(true);
  });

  it("guarda SÓ tempo e dois sinais — nenhum campo de pessoa entra no storage", async () => {
    const { salvarSegundos, marcarRespondido } = await mod();
    salvarSegundos(240);
    marcarRespondido();
    expect(fake.chaves).toEqual(["crm_avaliacao"]);
    const salvo = JSON.parse(fake.crua("crm_avaliacao")!);
    expect(Object.keys(salvo).sort()).toEqual(["dispensado", "respondido", "segundos"]);
    // nota, comentário, nome, e-mail e CRECI vivem no servidor — nunca aqui
    expect(JSON.stringify(salvo)).not.toMatch(/@|estrelas|comentario|nome|creci/i);
  });

  it("valor corrompido ou adulterado vira primeira visita, sem quebrar a tela", async () => {
    const { lerEstado } = await mod();
    fake.plantar("crm_avaliacao", "{não é json");
    expect(lerEstado()).toEqual({ segundos: 0, dispensado: false, respondido: false });

    fake.plantar("crm_avaliacao", JSON.stringify({ segundos: "muito", dispensado: "sim", email: "x@y.z" }));
    expect(lerEstado()).toEqual({ segundos: 0, dispensado: false, respondido: false });
  });

  it("campo estranho plantado no storage não sobrevive à primeira gravação", async () => {
    const { salvarSegundos } = await mod();
    fake.plantar("crm_avaliacao", JSON.stringify({ segundos: 10, email: "alguem@exemplo.com" }));
    salvarSegundos(20);
    expect(fake.crua("crm_avaliacao")).not.toMatch(/email|exemplo/);
  });

  it("storage bloqueado (modo privativo) não quebra nada", async () => {
    vi.stubGlobal("window", {
      get localStorage(): Storage {
        throw new Error("bloqueado");
      },
    });
    const { lerEstado, salvarSegundos, marcarDispensado, limparAvaliacao } = await mod();
    expect(() => {
      salvarSegundos(30);
      marcarDispensado();
      limparAvaliacao();
    }).not.toThrow();
    expect(lerEstado()).toEqual({ segundos: 0, dispensado: false, respondido: false });
  });

  it("limpar devolve o demo ao estado de primeira visita", async () => {
    const { salvarSegundos, marcarDispensado, limparAvaliacao, lerEstado } = await mod();
    salvarSegundos(300);
    marcarDispensado();
    limparAvaliacao();
    expect(lerEstado()).toEqual({ segundos: 0, dispensado: false, respondido: false });
    expect(fake.chaves).toEqual([]);
  });
});
