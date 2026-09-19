/**
 * Leads com ação em andamento (O9·S3): a corrida da O8 era "A salvando, B
 * começa → A volta a ficar livre e aceita um 2º PATCH". Com o conjunto, terminar
 * ou começar a ação de um lead nunca mexe no outro.
 */
import { describe, it, expect } from "vitest";
import { liberarOcupado, marcarOcupado } from "./ocupados";

describe("ocupados (conjunto de leads salvando)", () => {
  it("A pendente e B começa: os dois ficam travados; terminar A não libera B (e vice-versa)", () => {
    const soA = marcarOcupado(new Set(), "A");
    const aEb = marcarOcupado(soA, "B");
    expect([...aEb].sort()).toEqual(["A", "B"]);
    expect(aEb.has("A")).toBe(true); // B começar não liberou A (era o bug)

    const soB = liberarOcupado(aEb, "A");
    expect([...soB]).toEqual(["B"]);
    expect([...liberarOcupado(aEb, "B")]).toEqual(["A"]);
    expect(liberarOcupado(soB, "B").size).toBe(0);
  });

  it("não muda o conjunto à toa (mesma referência: o React não re-renderiza por nada)", () => {
    const soA = marcarOcupado(new Set(), "A");
    expect(marcarOcupado(soA, "A")).toBe(soA);
    expect(liberarOcupado(soA, "X")).toBe(soA);
  });

  it("nunca altera o conjunto recebido (estado imutável)", () => {
    const original: ReadonlySet<string> = new Set(["A"]);
    marcarOcupado(original, "B");
    liberarOcupado(original, "A");
    expect([...original]).toEqual(["A"]);
  });
});
