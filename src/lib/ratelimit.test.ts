import { describe, it, expect } from "vitest";
import { MemoriaRateLimiter } from "./ratelimit";

const T0 = new Date("2026-06-17T12:00:00.000Z");

describe("MemoriaRateLimiter (janela deslizante)", () => {
  it("barra ao estourar e libera após a janela", async () => {
    const rl = new MemoriaRateLimiter();
    const regra = { max: 2, janelaMs: 1000 };
    expect(await rl.permitir(["k"], regra, T0)).toBe(true);
    expect(await rl.permitir(["k"], regra, T0)).toBe(true);
    expect(await rl.permitir(["k"], regra, T0)).toBe(false);
    expect(await rl.permitir(["k"], regra, new Date(T0.getTime() + 1001))).toBe(true);
  });

  it("barrar por uma chave NÃO consome o limite da outra", async () => {
    const rl = new MemoriaRateLimiter();
    const regra = { max: 1, janelaMs: 1000 };
    expect(await rl.permitir(["b"], regra, T0)).toBe(true); // b atinge o limite
    expect(await rl.permitir(["a", "b"], regra, T0)).toBe(false); // barrado por b
    expect(await rl.permitir(["a"], regra, T0)).toBe(true); // 'a' não foi consumido
  });
});

describe("MemoriaRateLimiter.permitirCada (cada chave com a sua regra) — O7·S1", () => {
  const porEmail = { max: 3, janelaMs: 30 * 60_000 };
  const porIp = { max: 10, janelaMs: 30 * 60_000 };
  const limites = (email: string, ip: string) => [
    { chave: `email:${email}`, regra: porEmail },
    { chave: `ip:${ip}`, regra: porIp },
  ];

  it("cada chave barra pelo SEU máximo", async () => {
    const rl = new MemoriaRateLimiter();
    for (let i = 0; i < 3; i++) expect(await rl.permitirCada(limites("a@x.com", "1.1.1.1"), T0)).toBe(true);
    expect(await rl.permitirCada(limites("a@x.com", "1.1.1.1"), T0)).toBe(false); // e-mail: 3
    // o IP só gastou 3: aguenta mais 7 e-mails diferentes
    for (let i = 0; i < 7; i++) expect(await rl.permitirCada(limites(`o${i}@x.com`, "1.1.1.1"), T0)).toBe(true);
    expect(await rl.permitirCada(limites("z@x.com", "1.1.1.1"), T0)).toBe(false); // IP: 10
  });

  it("cada chave conta na SUA janela", async () => {
    const rl = new MemoriaRateLimiter();
    const curta = { chave: "curta", regra: { max: 1, janelaMs: 1000 } };
    const longa = { chave: "longa", regra: { max: 2, janelaMs: 24 * 3_600_000 } };
    expect(await rl.permitirCada([curta, longa], T0)).toBe(true);
    const depois = new Date(T0.getTime() + 2000);
    expect(await rl.permitirCada([curta, longa], depois)).toBe(true); // curta já liberou
    expect(await rl.permitirCada([longa], depois)).toBe(false); // longa segue contando
  });

  it("lista vazia é permitida", async () => {
    expect(await new MemoriaRateLimiter().permitirCada([], T0)).toBe(true);
  });
});
