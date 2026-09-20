import { describe, it, expect } from "vitest";
import {
  ALVO_SEGUNDOS,
  TETO_SEGUNDOS,
  atingiuAlvo,
  comVisibilidade,
  deveConvidar,
  iniciarRelogio,
  segundosDe,
  segundosValidos,
} from "./tempoNoDemo";

/** Instante base qualquer; o que importa é a diferença, nunca a hora do relógio real. */
const T0 = 1_700_000_000_000;
const min = (m: number) => m * 60_000;

describe("relógio do convite — só conta com a aba visível", () => {
  it("quatro minutos de aba visível disparam o convite (e nem um segundo antes)", () => {
    const r = iniciarRelogio(0, true, T0);
    expect(segundosDe(r, T0)).toBe(0);
    expect(atingiuAlvo(r, T0 + min(3.9))).toBe(false);
    expect(segundosDe(r, T0 + min(4))).toBe(ALVO_SEGUNDOS);
    expect(atingiuAlvo(r, T0 + min(4))).toBe(true);
  });

  it("aba escondida não conta: meia hora fora não aproxima o convite", () => {
    let r = iniciarRelogio(0, true, T0);
    r = comVisibilidade(r, false, T0 + min(1)); // saiu com 1 minuto navegado
    expect(segundosDe(r, T0 + min(31))).toBe(60); // 30 min de aba escondida
    expect(atingiuAlvo(r, T0 + min(31))).toBe(false);

    r = comVisibilidade(r, true, T0 + min(31)); // voltou
    expect(atingiuAlvo(r, T0 + min(33))).toBe(false); // 1 + 2 = 3 min
    expect(atingiuAlvo(r, T0 + min(34))).toBe(true); // 1 + 3 = 4 min
  });

  it("o mesmo estado duas vezes não conta em dobro nem zera o trecho aberto", () => {
    let r = iniciarRelogio(0, true, T0);
    r = comVisibilidade(r, true, T0 + min(2)); // "visível" repetido (evento duplicado)
    expect(segundosDe(r, T0 + min(4))).toBe(ALVO_SEGUNDOS); // continua contando desde T0

    r = comVisibilidade(r, false, T0 + min(4));
    r = comVisibilidade(r, false, T0 + min(9)); // "escondido" repetido
    expect(segundosDe(r, T0 + min(9))).toBe(ALVO_SEGUNDOS);
  });

  it("retoma o tempo guardado da visita anterior", () => {
    const r = iniciarRelogio(180, true, T0); // já tinha 3 minutos
    expect(atingiuAlvo(r, T0 + min(0.9))).toBe(false);
    expect(atingiuAlvo(r, T0 + min(1))).toBe(true);
  });

  it("começa parado quando a aba abre escondida (link aberto em segundo plano)", () => {
    const r = iniciarRelogio(0, false, T0);
    expect(r.desde).toBeNull();
    expect(segundosDe(r, T0 + min(10))).toBe(0);
  });
});

describe("relógio — valores impossíveis nunca viram convite instantâneo", () => {
  it("lixo no storage vira zero", () => {
    for (const valor of [undefined, null, "240", NaN, Infinity, -5, {}, []]) {
      expect(segundosValidos(valor)).toBe(0);
    }
    expect(segundosValidos(12.9)).toBe(12);
  });

  it("acumulado e tempo corrido respeitam o teto (relógio do sistema mudando)", () => {
    expect(segundosValidos(999_999)).toBe(TETO_SEGUNDOS);
    const r = iniciarRelogio(0, true, T0);
    expect(segundosDe(r, T0 + min(600))).toBe(TETO_SEGUNDOS);
    expect(segundosDe(r, T0 - min(10))).toBe(0); // relógio andou para trás
  });
});

describe("deveConvidar — dispensa e resposta não voltam sozinhas", () => {
  const pronto = iniciarRelogio(ALVO_SEGUNDOS, true, T0);

  it("convida quando deu o tempo e a pessoa nunca respondeu nem dispensou", () => {
    expect(deveConvidar(pronto, T0, { dispensado: false, respondido: false })).toBe(true);
  });

  it('"Agora não" e "já avaliei" seguram o convite mesmo com o tempo cumprido', () => {
    expect(deveConvidar(pronto, T0, { dispensado: true, respondido: false })).toBe(false);
    expect(deveConvidar(pronto, T0, { dispensado: false, respondido: true })).toBe(false);
  });

  it("sem o tempo cumprido não convida ninguém", () => {
    const cedo = iniciarRelogio(10, true, T0);
    expect(deveConvidar(cedo, T0, { dispensado: false, respondido: false })).toBe(false);
  });
});
