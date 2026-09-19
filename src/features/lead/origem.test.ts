import { describe, it, expect } from "vitest";
import { LeadInputSchema } from "./schema";

const base = { nome: "Ana Exemplo", email: "ana@example.com", telefone: "(81) 99999-0000", creci: "PE 12345", consentimento: true as const };

describe("origem da campanha (utm/ref) vinda da API pública", () => {
  it("fica só com [A-Za-z0-9._-]: fórmula e separador de CSV não sobrevivem", () => {
    const r = LeadInputSchema.parse({ ...base, origem: { utm: 'x;=1+1&",=HYPERLINK("a")', ref: "insta_bio-2026.09" } });
    expect(r.origem?.utm).toBe("x11HYPERLINKa");
    expect(r.origem?.ref).toBe("insta_bio-2026.09");
    expect(r.origem?.utm).not.toMatch(/[=;,"+@]/);
  });

  it("corta em 100 caracteres e aceita ausência", () => {
    const r = LeadInputSchema.parse({ ...base, origem: { utm: "a".repeat(150) } });
    expect(r.origem?.utm).toHaveLength(100);
    expect(LeadInputSchema.parse(base).origem).toBeUndefined();
  });
});
