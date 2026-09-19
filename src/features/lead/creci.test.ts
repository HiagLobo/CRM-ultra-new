import { describe, it, expect } from "vitest";
import { normalizarCreci, EXEMPLO_CRECI, MENSAGEM_CRECI_INVALIDO } from "./creci";
import { LeadInputSchema } from "./schema";

/**
 * Formatos reais que a regex antiga recusava (achado captacao-7 do estudo da O7),
 * cada um com a forma canônica que fica gravada.
 */
const ACEITOS: [string, string][] = [
  ["CRECI-PE 12.345-F", "PE 12345-F"],
  ["CRECI 12345", "12345"],
  ["12.345-F", "12345-F"],
  ["J-12345", "12345-J"],
  ["12345/SP", "SP 12345"],
  ["CRECI-SP 12345", "SP 12345"],
  ["CRECI/PE 12345", "PE 12345"],
  ["CRECI 12345-F", "12345-F"],
  ["SP-12345", "SP 12345"],
  ["12.345", "12345"],
  ["SP 12.345", "SP 12345"],
  ["12345-SP", "SP 12345"],
  ["12345 F", "12345-F"],
  ["PE 12345 F", "PE 12345-F"],
  // variações de caixa, rótulo e categoria
  ["creci-pe 12345-f", "PE 12345-F"],
  ["CRECIPE12345F", "PE 12345-F"],
  ["CRECI nº 12.345", "12345"],
  ["CRECI: 12345-J", "12345-J"],
  ["12345-PJ", "12345-J"],
  ["12345 PF", "12345-F"],
  ["12345-E", "12345-E"],
  ["CRECI-SP J-12345", "SP 12345-J"],
  ["12345-F (PE)", "PE 12345-F"],
  ["  SP   12345  ", "SP 12345"],
];

const RECUSADOS = [
  "",
  "??",
  "CRECI",
  "abc",
  "ab123_", // lixo que a regex antiga aceitava
  "XX 12345", // UF que não existe
  "SP 1", // um dígito só
  "12345678", // longo demais para um registro
  "12345 67890", // dois números: qual é o registro?
  "SP 12345 PE", // duas UFs diferentes
  "12345-F-J", // duas categorias diferentes
  "=12345", // começo de fórmula de planilha
  "12345; DROP",
  "PÉ 12345",
];

describe("normalizarCreci", () => {
  it.each(ACEITOS)("aceita %j → %j", (bruto, esperado) => {
    expect(normalizarCreci(bruto)).toBe(esperado);
  });

  it.each(RECUSADOS)("recusa %j", (bruto) => {
    expect(normalizarCreci(bruto)).toBeNull();
  });

  it("é idempotente: o valor normalizado passa de novo sem mudar (cliente → rota)", () => {
    for (const [, esperado] of ACEITOS) {
      expect(normalizarCreci(esperado)).toBe(esperado);
    }
  });

  it("o exemplo mostrado na mensagem é ele mesmo um CRECI válido", () => {
    expect(normalizarCreci(EXEMPLO_CRECI)).toBe(EXEMPLO_CRECI);
    expect(MENSAGEM_CRECI_INVALIDO).toContain(EXEMPLO_CRECI);
  });

  it("a forma canônica nunca começa com caractere de fórmula (CSV do admin)", () => {
    for (const [, esperado] of ACEITOS) expect(esperado).toMatch(/^[A-Z0-9]/);
  });
});

describe("LeadInputSchema.creci", () => {
  const base = { email: "corretor@exemplo.com", telefone: "(11) 90000-0000", consentimento: true };

  it("grava o CRECI normalizado", () => {
    const r = LeadInputSchema.parse({ ...base, creci: "CRECI-PE 12.345-F" });
    expect(r.creci).toBe("PE 12345-F");
  });

  it("recusa com mensagem que traz o exemplo", () => {
    const r = LeadInputSchema.safeParse({ ...base, creci: "sem número" });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.flatten().fieldErrors.creci).toEqual([MENSAGEM_CRECI_INVALIDO]);
  });

  it("recusa entrada gigante antes de normalizar (anti-abuso)", () => {
    const r = LeadInputSchema.safeParse({ ...base, creci: `SP 12345${" ".repeat(100)}` });
    expect(r.success).toBe(false);
  });
});
