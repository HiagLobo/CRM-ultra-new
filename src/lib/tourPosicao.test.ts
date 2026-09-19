import { describe, it, expect } from "vitest";
import {
  posicaoDoBalao,
  estaVisivel,
  larguraDoBalao,
  ESPACO,
  MARGEM,
  type Retangulo,
  type Viewport,
} from "./tourPosicao";

const TELA: Viewport = { largura: 1280, altura: 800 };
const CELULAR: Viewport = { largura: 380, altura: 720 };
const BALAO = { largura: 340, altura: 180 };

const ret = (top: number, left: number, width = 200, height = 40): Retangulo => ({
  top,
  left,
  width,
  height,
});

describe("posicaoDoBalao", () => {
  it("elemento no topo: balão vai abaixo", () => {
    const p = posicaoDoBalao(ret(100, 500), TELA, BALAO);
    expect(p.lado).toBe("abaixo");
    expect(p.top).toBe(100 + 40 + ESPACO);
  });

  it("elemento no rodapé: balão sobe para não sair da tela", () => {
    const p = posicaoDoBalao(ret(720, 500), TELA, BALAO);
    expect(p.lado).toBe("acima");
    expect(p.top).toBe(720 - BALAO.altura - ESPACO);
    expect(p.top).toBeGreaterThanOrEqual(MARGEM);
  });

  it("não cabe em cima nem embaixo: centraliza em vez de cortar", () => {
    // elemento ocupando quase toda a altura de uma tela curta
    const p = posicaoDoBalao(ret(10, 100, 200, 600), { largura: 1280, altura: 640 }, BALAO);
    expect(p.lado).toBe("centro");
    expect(p.top).toBeGreaterThanOrEqual(MARGEM);
    expect(p.top + BALAO.altura).toBeLessThanOrEqual(640);
  });

  it("centraliza pelo alvo quando há espaço nos dois lados", () => {
    const alvo = ret(100, 500, 200);
    const p = posicaoDoBalao(alvo, TELA, BALAO);
    expect(p.left).toBe(Math.round(500 + 100 - 170)); // centro do alvo − metade do balão
  });

  it("alvo colado na esquerda: o balão não passa da margem", () => {
    const p = posicaoDoBalao(ret(100, 0, 60), TELA, BALAO);
    expect(p.left).toBe(MARGEM);
  });

  it("alvo colado na direita: o balão não vaza para fora da tela", () => {
    const p = posicaoDoBalao(ret(100, 1240, 40), TELA, BALAO);
    expect(p.left + BALAO.largura).toBeLessThanOrEqual(TELA.largura - MARGEM);
  });

  it("celular: cabe na tela em qualquer posição do alvo", () => {
    const largura = larguraDoBalao(CELULAR);
    for (const left of [0, 100, 200, 340]) {
      for (const top of [0, 300, 700]) {
        const p = posicaoDoBalao(ret(top, left, 60), CELULAR, { largura, altura: 200 });
        expect(p.left, `left=${left} top=${top}`).toBeGreaterThanOrEqual(MARGEM);
        expect(p.left + largura, `left=${left} top=${top}`).toBeLessThanOrEqual(CELULAR.largura);
        expect(p.top).toBeGreaterThanOrEqual(0);
      }
    }
  });
});

describe("larguraDoBalao", () => {
  it("usa a largura desejada quando cabe", () => {
    expect(larguraDoBalao(TELA)).toBe(340);
  });

  it("num celular estreito encolhe em vez de nascer cortado", () => {
    // 380px ainda comporta os 340 desejados (380 − 24 = 356); 320px não
    expect(larguraDoBalao(CELULAR)).toBe(340);
    const estreito: Viewport = { largura: 320, altura: 640 };
    expect(larguraDoBalao(estreito)).toBe(320 - MARGEM * 2);
    expect(larguraDoBalao(estreito)).toBeLessThan(estreito.largura);
  });
});

describe("estaVisivel", () => {
  it("reconhece elemento na tela, acima e abaixo dela", () => {
    expect(estaVisivel(ret(100, 0), TELA)).toBe(true);
    expect(estaVisivel(ret(-100, 0, 200, 40), TELA)).toBe(false); // rolou para cima
    expect(estaVisivel(ret(900, 0), TELA)).toBe(false); // ainda abaixo
    expect(estaVisivel(ret(-20, 0, 200, 40), TELA)).toBe(true); // metade aparecendo
  });
});
