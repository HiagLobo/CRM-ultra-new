import { describe, it, expect } from "vitest";
import {
  posicaoDoBalao,
  estaVisivel,
  dentroNaHorizontal,
  alvoNaTela,
  larguraDoBalao,
  ESPACO,
  MARGEM,
  type MedidaDoAlvo,
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

  it("não cabe em cima, embaixo nem ao lado: centraliza em vez de cortar", () => {
    // elemento ocupando quase toda a altura de uma tela curta e estreita
    const p = posicaoDoBalao(ret(10, 100, 200, 600), { largura: 600, altura: 640 }, BALAO);
    expect(p.lado).toBe("centro");
    expect(p.top).toBeGreaterThanOrEqual(MARGEM);
    expect(p.top + BALAO.altura).toBeLessThanOrEqual(640);
  });

  it("alvo da altura da tela (menu lateral): balão ao lado, sem cobrir o menu", () => {
    const menu = ret(0, 0, 268, TELA.altura);
    const p = posicaoDoBalao(menu, TELA, BALAO);
    expect(p.lado).toBe("direita");
    expect(p.left).toBe(268 + ESPACO);
    expect(p.left + BALAO.largura).toBeLessThanOrEqual(TELA.largura - MARGEM);
    expect(p.top).toBeGreaterThanOrEqual(MARGEM);
    expect(p.top + BALAO.altura).toBeLessThanOrEqual(TELA.altura - MARGEM);
  });

  it("alvo alto no celular: sem espaço ao lado, continua centralizado", () => {
    const p = posicaoDoBalao(ret(0, 0, 300, CELULAR.altura), CELULAR, { largura: larguraDoBalao(CELULAR), altura: 200 });
    expect(p.lado).toBe("centro");
    expect(p.left).toBeGreaterThanOrEqual(MARGEM);
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

  it("eixo horizontal: gaveta empurrada para fora da tela não conta como visível", () => {
    const TELA_390: Viewport = { largura: 390, altura: 844 };
    // menu de 268 px com translateX(-100%): termina exatamente na borda esquerda
    expect(estaVisivel(ret(0, -268, 268, 844), TELA_390)).toBe(false);
    // painel que sai pela direita (translateX(100%))
    expect(estaVisivel(ret(0, 390, 340, 844), TELA_390)).toBe(false);
    // gaveta no meio da animação: um pedaço já aparece
    expect(estaVisivel(ret(0, -100, 268, 844), TELA_390)).toBe(true);
    expect(estaVisivel(ret(0, 350, 100, 40), TELA_390)).toBe(true);
  });
});

describe("dentroNaHorizontal", () => {
  it("borda encostada não é estar dentro", () => {
    expect(dentroNaHorizontal(ret(0, -200, 200, 40), TELA)).toBe(false); // right = 0
    expect(dentroNaHorizontal(ret(0, TELA.largura, 50, 40), TELA)).toBe(false); // left = largura
    expect(dentroNaHorizontal(ret(0, -199, 200, 40), TELA)).toBe(true);
  });
});

describe("alvoNaTela — o que o tour pode destacar", () => {
  const CEL: Viewport = { largura: 390, altura: 844 };
  const medida = (r: Retangulo, extra: Partial<MedidaDoAlvo> = {}): MedidaDoAlvo => ({
    caixas: 1,
    retangulo: r,
    invisivel: false,
    ...extra,
  });

  it("elemento normal na tela: sim", () => {
    expect(alvoNaTela(medida(ret(16, 16, 42, 42)), CEL)).toBe(true);
  });

  it("display:none (barra do franqueado no celular): retângulo 0×0 e sem caixas — não", () => {
    expect(alvoNaTela(medida(ret(0, 0, 0, 0), { caixas: 0 }), CEL)).toBe(false);
  });

  it("tamanho zero mesmo com caixa (elemento vazio): não", () => {
    expect(alvoNaTela(medida(ret(100, 100, 0, 40)), CEL)).toBe(false);
    expect(alvoNaTela(medida(ret(100, 100, 200, 0)), CEL)).toBe(false);
  });

  it("gaveta do menu fechada, fora da tela pela esquerda: não", () => {
    expect(alvoNaTela(medida(ret(0, -268, 268, 844)), CEL)).toBe(false);
    // item do menu dentro da gaveta fechada
    expect(alvoNaTela(medida(ret(120, -256, 244, 40)), CEL)).toBe(false);
  });

  it("visibility:hidden (gaveta fechada que só saiu de cena): não", () => {
    expect(alvoNaTela(medida(ret(0, 0, 268, 844), { invisivel: true }), CEL)).toBe(false);
  });

  it("abaixo da dobra, mas na coluna da tela: sim — o tour rola até ele", () => {
    expect(alvoNaTela(medida(ret(2000, 16, 358, 300)), CEL)).toBe(true);
  });
});
