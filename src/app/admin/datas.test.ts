import { describe, it, expect } from "vitest";
import { diasDesde, diasEntre, horasDesde, rotuloDia, somarDias } from "./datas";

describe("contas com dias AAAA-MM-DD", () => {
  it("somar dias atravessa mês, ano e fevereiro de ano bissexto", () => {
    expect(somarDias("2026-09-19", 1)).toBe("2026-09-20");
    expect(somarDias("2026-09-30", 1)).toBe("2026-10-01");
    expect(somarDias("2026-12-31", 1)).toBe("2027-01-01");
    expect(somarDias("2028-02-28", 1)).toBe("2028-02-29");
    expect(somarDias("2026-09-19", -19)).toBe("2026-08-31");
    expect(somarDias("2026-09-19", 90)).toBe("2026-12-18");
    expect(somarDias("lixo", 1)).toBe("lixo");
  });

  it("dias entre dois dias (negativo quando volta)", () => {
    expect(diasEntre("2026-09-19", "2026-09-19")).toBe(0);
    expect(diasEntre("2026-09-19", "2026-10-19")).toBe(30);
    expect(diasEntre("2026-09-19", "2026-09-12")).toBe(-7);
  });

  it("dias e horas desde um instante; data ilegível ou futura conta 0", () => {
    const agora = new Date("2026-09-19T15:00:00.000Z");
    expect(diasDesde("2026-09-18T15:00:00.000Z", agora)).toBe(1);
    expect(diasDesde("2026-09-18T15:00:01.000Z", agora)).toBe(0);
    expect(horasDesde("2026-09-19T12:00:00.000Z", agora)).toBe(3);
    expect(horasDesde("não é data", agora)).toBe(0);
    expect(diasDesde("2026-09-25T00:00:00.000Z", agora)).toBe(0);
  });

  it("rótulo do dia: hoje, amanhã, ontem, dd/mm no ano, dd/mm/aaaa fora dele", () => {
    const hoje = "2026-09-19";
    expect(rotuloDia("2026-09-19", hoje)).toBe("hoje");
    expect(rotuloDia("2026-09-20", hoje)).toBe("amanhã");
    expect(rotuloDia("2026-09-18", hoje)).toBe("ontem");
    expect(rotuloDia("2026-10-03", hoje)).toBe("03/10");
    expect(rotuloDia("2027-01-03", hoje)).toBe("03/01/2027");
    expect(rotuloDia("2026-02-31", hoje)).toBe("2026-02-31"); // inválido sai como veio
  });
});
