import { describe, it, expect } from "vitest";
import { CadastroManualSchema, NotaSchema, PatchLeadSchema } from "./schemaAdmin";

const campos = (r: { success: boolean; error?: { flatten(): { fieldErrors: Record<string, string[] | undefined> } } }) =>
  r.success ? {} : r.error!.flatten().fieldErrors;

describe("PatchLeadSchema — etapa", () => {
  it("etapa simples vira a mudança tipada", () => {
    expect(PatchLeadSchema.parse({ id: "a", etapa: "demonstracao" })).toEqual({
      tipo: "etapa",
      id: "a",
      mudanca: { etapa: "demonstracao" },
    });
  });

  it("retomar exige a data; perdido exige o motivo (400 com o campo certo)", () => {
    expect(campos(PatchLeadSchema.safeParse({ id: "a", etapa: "retomar" }))).toHaveProperty("retomarEm");
    expect(campos(PatchLeadSchema.safeParse({ id: "a", etapa: "perdido" }))).toHaveProperty("motivo");
    expect(campos(PatchLeadSchema.safeParse({ id: "a", etapa: "perdido", motivo: "   " }))).toHaveProperty("motivo");
  });

  it("retomar com data (e motivo opcional) e perdido com motivo passam", () => {
    expect(PatchLeadSchema.parse({ id: "a", etapa: "retomar", retomarEm: "2026-10-01" })).toMatchObject({
      mudanca: { etapa: "retomar", retomarEm: "2026-10-01" },
    });
    expect(PatchLeadSchema.parse({ id: "a", etapa: "perdido", motivo: " preço " })).toMatchObject({
      mudanca: { etapa: "perdido", motivo: "preço" },
    });
  });

  it("data inexistente, motivo fora de retomar/perdido e data de retomar em outra etapa → 400", () => {
    expect(PatchLeadSchema.safeParse({ id: "a", etapa: "retomar", retomarEm: "2026-02-30" }).success).toBe(false);
    expect(PatchLeadSchema.safeParse({ id: "a", etapa: "cliente", motivo: "x" }).success).toBe(false);
    expect(PatchLeadSchema.safeParse({ id: "a", etapa: "cliente", retomarEm: "2026-10-01" }).success).toBe(false);
    expect(PatchLeadSchema.safeParse({ id: "a", etapa: "perdido", motivo: "x".repeat(201) }).success).toBe(false);
  });

  it("status antigo, etapa desconhecida e campo a mais são recusados", () => {
    for (const corpo of [
      { id: "a", etapa: "contatado" },
      { id: "a", status: "contatado" },
      { id: "a", etapa: "novo", email: "x@exemplo.com" },
      { etapa: "novo" },
      { id: "", etapa: "novo" },
    ]) {
      expect(PatchLeadSchema.safeParse(corpo).success, JSON.stringify(corpo)).toBe(false);
    }
  });
});

describe("PatchLeadSchema — próxima ação", () => {
  it("define (dia + texto) ou limpa (null)", () => {
    expect(PatchLeadSchema.parse({ id: "a", proximaAcao: { em: "2026-06-20", texto: " ligar " } })).toEqual({
      tipo: "proxima_acao",
      id: "a",
      proximaAcao: { em: "2026-06-20", texto: "ligar" },
    });
    expect(PatchLeadSchema.parse({ id: "a", proximaAcao: null })).toEqual({ tipo: "proxima_acao", id: "a", proximaAcao: null });
  });

  it("uma coisa de cada vez: etapa E próxima ação, ou nenhuma das duas → 400", () => {
    expect(PatchLeadSchema.safeParse({ id: "a" }).success).toBe(false);
    expect(PatchLeadSchema.safeParse({ id: "a", etapa: "novo", proximaAcao: null }).success).toBe(false);
  });

  it("texto vazio, longo demais ou data inválida → 400", () => {
    expect(PatchLeadSchema.safeParse({ id: "a", proximaAcao: { em: "2026-06-20", texto: "" } }).success).toBe(false);
    expect(PatchLeadSchema.safeParse({ id: "a", proximaAcao: { em: "2026-06-20", texto: "x".repeat(201) } }).success).toBe(false);
    expect(PatchLeadSchema.safeParse({ id: "a", proximaAcao: { em: "20/06/2026", texto: "ligar" } }).success).toBe(false);
  });
});

describe("PatchLeadSchema — conferência do CRECI (O9)", () => {
  it("conferido, nao_confere e null (desfazer) viram o pedido tipado", () => {
    expect(PatchLeadSchema.parse({ id: "a", creciConferencia: "conferido" })).toEqual({ tipo: "creci", id: "a", conferencia: "conferido" });
    expect(PatchLeadSchema.parse({ id: "a", creciConferencia: "nao_confere" })).toMatchObject({ conferencia: "nao_confere" });
    expect(PatchLeadSchema.parse({ id: "a", creciConferencia: null })).toEqual({ tipo: "creci", id: "a", conferencia: null });
  });

  it("valor desconhecido ou junto com etapa/próxima ação → 400", () => {
    expect(PatchLeadSchema.safeParse({ id: "a", creciConferencia: "talvez" }).success).toBe(false);
    expect(PatchLeadSchema.safeParse({ id: "a", creciConferencia: "conferido", etapa: "novo" }).success).toBe(false);
    expect(PatchLeadSchema.safeParse({ id: "a", creciConferencia: null, proximaAcao: null }).success).toBe(false);
  });
});

describe("NotaSchema", () => {
  it("apara espaços; vazio e mais de 2.000 caracteres → 400", () => {
    expect(NotaSchema.parse({ texto: "  ligou  " })).toEqual({ texto: "ligou" });
    expect(NotaSchema.safeParse({ texto: "   " }).success).toBe(false);
    expect(NotaSchema.safeParse({ texto: "x".repeat(2001) }).success).toBe(false);
    expect(NotaSchema.safeParse({ texto: "x".repeat(2000) }).success).toBe(true);
  });
});

describe("CadastroManualSchema", () => {
  const base = { telefone: "(81) 97777-6666", canal: "whatsapp", consentimento: true };

  it("só telefone, canal e o checkbox são obrigatórios; vazio conta como não informado", () => {
    expect(CadastroManualSchema.parse({ ...base, nome: "", email: " ", creci: "", observacao: "" })).toEqual({
      telefone: "+5581977776666",
      canal: "whatsapp",
      consentimento: true,
    });
  });

  it("sem telefone, telefone inválido, canal 'site' ou sem o checkbox → 400 no campo certo", () => {
    expect(campos(CadastroManualSchema.safeParse({ ...base, telefone: undefined }))).toHaveProperty("telefone");
    expect(campos(CadastroManualSchema.safeParse({ ...base, telefone: "123" }))).toHaveProperty("telefone");
    expect(campos(CadastroManualSchema.safeParse({ ...base, canal: "site" }))).toHaveProperty("canal");
    expect(campos(CadastroManualSchema.safeParse({ ...base, consentimento: false }))).toHaveProperty("consentimento");
    expect(campos(CadastroManualSchema.safeParse({ ...base, email: "nao-e-email" }))).toHaveProperty("email");
    expect(campos(CadastroManualSchema.safeParse({ ...base, creci: "??" }))).toHaveProperty("creci");
  });

  it("O9: o manual continua aceitando CRECI sem UF (o público exige)", () => {
    expect(CadastroManualSchema.parse({ ...base, creci: "12345" }).creci).toBe("12345");
  });

  it("campo desconhecido (ex.: tentar forçar a etapa ou o IP) é recusado", () => {
    expect(CadastroManualSchema.safeParse({ ...base, status: "cliente" }).success).toBe(false);
    expect(CadastroManualSchema.safeParse({ ...base, ip: "1.2.3.4" }).success).toBe(false);
  });

  it("as mensagens de erro não repetem o que foi digitado", () => {
    const r = CadastroManualSchema.safeParse({ ...base, telefone: "81 7070", email: "maria.silva@", creci: "XYZ-999999999" });
    expect(JSON.stringify(r.success ? {} : r.error.flatten())).not.toMatch(/maria|7070|XYZ|99999/);
  });
});

describe("PatchLeadSchema — motivo vazio (achado da revisão da O8·S1)", () => {
  it("retomar com motivo vazio é aceito como sem motivo; perdido com motivo vazio pede o motivo", () => {
    const retomar = PatchLeadSchema.safeParse({ id: "x", etapa: "retomar", retomarEm: "2099-01-10", motivo: "  " });
    expect(retomar.success).toBe(true);
    const perdido = PatchLeadSchema.safeParse({ id: "x", etapa: "perdido", motivo: "" });
    expect(perdido.success).toBe(false);
  });
});
