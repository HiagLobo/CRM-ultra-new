import { describe, it, expect } from "vitest";
import { NOTAS, ehFocavel, notaDaTecla, proximaNota, rotuloDaNota } from "./Estrelas";

describe("proximaNota — anda de 1 a 5 sem dar a volta", () => {
  it("sem nota (0) o primeiro passo vai para 1, nunca para 2", () => {
    expect(proximaNota(0, 1)).toBe(1);
    expect(proximaNota(0, -1)).toBe(1);
  });

  it("não passa de 5 nem cai abaixo de 1 (sem wrap)", () => {
    expect(proximaNota(5, 1)).toBe(5);
    expect(proximaNota(1, -1)).toBe(1);
  });

  it("anda um a um nos dois sentidos", () => {
    expect(proximaNota(3, -1)).toBe(2);
    expect(proximaNota(3, 1)).toBe(4);
    expect(proximaNota(4, 1)).toBe(5);
    expect(proximaNota(2, -1)).toBe(1);
  });
});

describe("teclado do radiogroup (padrão WAI-ARIA)", () => {
  it("direita e para baixo avançam; esquerda e para cima voltam", () => {
    expect(notaDaTecla("ArrowRight", 3)).toBe(4);
    expect(notaDaTecla("ArrowDown", 3)).toBe(4);
    expect(notaDaTecla("ArrowLeft", 3)).toBe(2);
    expect(notaDaTecla("ArrowUp", 3)).toBe(2);
  });

  it("Home e End vão para as pontas, de qualquer nota", () => {
    expect(notaDaTecla("Home", 4)).toBe(1);
    expect(notaDaTecla("End", 2)).toBe(5);
    expect(notaDaTecla("Home", 0)).toBe(1);
    expect(notaDaTecla("End", 0)).toBe(5);
  });

  it("sem nota ainda, qualquer seta escolhe 1", () => {
    expect(notaDaTecla("ArrowRight", 0)).toBe(1);
    expect(notaDaTecla("ArrowLeft", 0)).toBe(1);
  });

  it("nas pontas, a seta não dá a volta", () => {
    expect(notaDaTecla("ArrowRight", 5)).toBe(5);
    expect(notaDaTecla("ArrowLeft", 1)).toBe(1);
  });

  it("tecla de fora do grupo devolve null (o navegador segue o caminho normal)", () => {
    for (const tecla of ["Tab", "Enter", " ", "a", "Escape", "PageUp"]) {
      expect(notaDaTecla(tecla, 3)).toBeNull();
    }
  });
});

describe("roving tabindex — um só ponto de entrada no grupo", () => {
  it("sem nota, quem entra na ordem do Tab é a primeira estrela", () => {
    expect(NOTAS.filter((n) => ehFocavel(0, n))).toEqual([1]);
  });

  it("com nota, é a estrela escolhida", () => {
    expect(NOTAS.filter((n) => ehFocavel(4, n))).toEqual([4]);
    expect(NOTAS.filter((n) => ehFocavel(5, n))).toEqual([5]);
  });

  it("nunca há duas estrelas focáveis ao mesmo tempo", () => {
    for (const valor of [0, 1, 2, 3, 4, 5]) {
      expect(NOTAS.filter((n) => ehFocavel(valor, n))).toHaveLength(1);
    }
  });
});

describe("rótulo das estrelas", () => {
  it("fala no singular e no plural, para o leitor de tela", () => {
    expect(rotuloDaNota(1)).toBe("1 estrela");
    expect(rotuloDaNota(4)).toBe("4 estrelas");
  });

  it("nenhum travessão no que vai para a tela", () => {
    for (const n of NOTAS) expect(rotuloDaNota(n)).not.toMatch(/—/);
  });
});
