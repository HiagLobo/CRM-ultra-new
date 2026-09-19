import { describe, it, expect, afterEach, vi } from "vitest";
import { comPrazo, PRAZO_ESGOTADO } from "./prazo";

afterEach(() => vi.useRealTimers());

describe("comPrazo", () => {
  it("devolve o resultado da tarefa que termina a tempo e desarma o relógio", async () => {
    vi.useFakeTimers();
    await expect(comPrazo(Promise.resolve("ok"), 1_000)).resolves.toBe("ok");
    expect(vi.getTimerCount()).toBe(0); // nada pendurado segurando a função
  });

  it("tarefa pendurada: rejeita com PrazoEsgotado no prazo", async () => {
    const pendurada = new Promise<void>(() => undefined);
    const erro = await comPrazo(pendurada, 5).catch((e: Error) => e);
    expect(erro).toBeInstanceOf(Error);
    expect((erro as Error).name).toBe(PRAZO_ESGOTADO);
  });

  it("erro da tarefa passa adiante como veio", async () => {
    const falha = Object.assign(new Error("recusado"), { name: "validation_error" });
    await expect(comPrazo(Promise.reject(falha), 1_000)).rejects.toBe(falha);
  });
});
