import { describe, it, expect } from "vitest";
import { ETAPAS, diaRecife, diaValido, normalizarCanal, normalizarStatus } from "./funil";

describe("normalizarStatus (status gravado → etapa do funil)", () => {
  it("traduz os 3 status antigos da O7", () => {
    expect(normalizarStatus("verificado")).toBe("novo"); // e-mail confirmado virou selo
    expect(normalizarStatus("contatado")).toBe("em_contato");
    expect(normalizarStatus("descartado")).toBe("perdido");
  });

  it("etapa nova passa como está", () => {
    for (const etapa of ETAPAS) expect(normalizarStatus(etapa)).toBe(etapa);
  });

  it("valor desconhecido, vazio ou de outro tipo vira 'novo' — o lead nunca some do painel", () => {
    for (const lixo of ["", "VERIFICADO", "arquivado", null, undefined, 3, {}]) {
      expect(normalizarStatus(lixo)).toBe("novo");
    }
  });
});

describe("normalizarCanal", () => {
  it("canal conhecido passa; ausente ou desconhecido é 'site' (a origem de toda linha antiga)", () => {
    expect(normalizarCanal("indicacao")).toBe("indicacao");
    expect(normalizarCanal("whatsapp")).toBe("whatsapp");
    expect(normalizarCanal(undefined)).toBe("site");
    expect(normalizarCanal(null)).toBe("site");
    expect(normalizarCanal("tiktok")).toBe("site");
  });
});

describe("diaRecife (hoje no fuso do fundador)", () => {
  it("02:30 UTC ainda é o dia anterior em Recife (UTC−3)", () => {
    expect(diaRecife(new Date("2026-06-18T02:30:00.000Z"))).toBe("2026-06-17");
    expect(diaRecife(new Date("2026-06-18T03:00:00.000Z"))).toBe("2026-06-18");
  });

  it("virada de ano", () => {
    expect(diaRecife(new Date("2027-01-01T01:00:00.000Z"))).toBe("2026-12-31");
  });
});

describe("diaValido (AAAA-MM-DD que existe)", () => {
  it("aceita dia real, inclusive 29/02 de ano bissexto", () => {
    expect(diaValido("2026-09-19")).toBe(true);
    expect(diaValido("2028-02-29")).toBe(true);
  });

  it("recusa dia que não existe, formato errado e data com hora", () => {
    for (const ruim of ["2026-02-29", "2026-02-30", "2026-13-01", "19/09/2026", "2026-9-1", "2026-09-19T10:00", ""]) {
      expect(diaValido(ruim), ruim).toBe(false);
    }
  });
});
