import { describe, it, expect } from "vitest";
import { mascararTelefone } from "./ui";
import { normalizarTelefoneBR } from "@/features/lead/schema";

/** Simula a digitação: cada tecla passa pela máscara com o valor já mascarado. */
function digitar(teclas: string): string {
  let valor = "";
  for (const t of teclas) valor = mascararTelefone(valor + t);
  return valor;
}

describe("mascararTelefone — número colado com DDI (achado captacao-8)", () => {
  it.each([
    ["+55 11 99999-8888", "(11) 99999-8888", "+5511999998888"],
    ["5581999998888", "(81) 99999-8888", "+5581999998888"],
    ["+55 81 3333-4444", "(81) 3333-4444", "+558133334444"],
    ["558133334444", "(81) 3333-4444", "+558133334444"],
    ["+55 (91) 3333-4444", "(91) 3333-4444", "+559133334444"],
    ["+55 55 99999-8888", "(55) 99999-8888", "+5555999998888"],
  ])("%j vira %j e continua válido no servidor", (colado, mascarado, e164) => {
    const r = mascararTelefone(colado);
    expect(r).toBe(mascarado);
    expect(normalizarTelefoneBR(r)).toBe(e164);
  });
});

describe("mascararTelefone — digitação", () => {
  it("formata conforme se digita", () => {
    expect(mascararTelefone("11")).toBe("11");
    expect(mascararTelefone("119")).toBe("(11) 9");
    expect(mascararTelefone("1133334444")).toBe("(11) 3333-4444");
    expect(mascararTelefone("11999998888")).toBe("(11) 99999-8888");
  });

  it("celular de DDD 55: dígito a mais é ignorado, não embaralha o número", () => {
    expect(digitar("55999998888")).toBe("(55) 99999-8888");
    expect(digitar("559999988887")).toBe("(55) 99999-8888");
  });

  it("quem digita o 55 do DDI chega ao número certo no fim", () => {
    const r = digitar("5581999998888");
    expect(r).toBe("(81) 99999-8888");
    expect(normalizarTelefoneBR(r)).toBe("+5581999998888");
  });

  it("nunca passa de 11 dígitos nacionais", () => {
    expect(mascararTelefone("11999998888777").replace(/\D/g, "")).toHaveLength(11);
  });
});
