import { describe, it, expect } from "vitest";
import type { LeadAdmin } from "@/features/lead/admin";
import { casaBusca, contarPorFiltro, filtrarLeads, textoContagem } from "./filtroLeads";

const lead = (parcial: Partial<LeadAdmin>): LeadAdmin => ({
  id: "1",
  email: "ana.corretora@exemplo.com",
  telefone: "+5581988887777",
  creci: "PE 12.345-F",
  status: "novo",
  criadoEm: "2026-06-17T12:00:00.000Z",
  ...parcial,
});

const LEADS: LeadAdmin[] = [
  lead({ id: "a" }),
  lead({ id: "b", email: "bruno@exemplo.com", telefone: "+5511977776666", creci: "SP 54321", status: "verificado" }),
  lead({ id: "c", email: "carla@exemplo.com", telefone: "+5521966665555", creci: "RJ 99887", status: "contatado" }),
  lead({ id: "d", email: "davi@exemplo.com", telefone: "+5531955554444", creci: "MG 11223", status: "descartado" }),
];

describe("busca do painel (e-mail, telefone, CRECI)", () => {
  it("e-mail por trecho, sem diferenciar maiúsculas", () => {
    expect(casaBusca(LEADS[0]!, "ANA.CORR")).toBe(true);
    expect(casaBusca(LEADS[1]!, "ana.corr")).toBe(false);
  });

  it("telefone pelos dígitos, com ou sem máscara e DDI", () => {
    for (const termo of ["(81) 98888", "81 98888-7777", "+55 81 9888", "988887777"]) {
      expect(casaBusca(LEADS[0]!, termo), termo).toBe(true);
    }
    expect(casaBusca(LEADS[1]!, "(81) 98888")).toBe(false);
  });

  it("CRECI ignorando espaço, ponto e hífen", () => {
    expect(casaBusca(LEADS[0]!, "pe12345")).toBe(true);
    expect(casaBusca(LEADS[0]!, "PE 12.345-F")).toBe(true);
    expect(casaBusca(LEADS[1]!, "sp 543")).toBe(true);
  });

  it("termo com letras não casa por acaso com os dígitos do telefone", () => {
    expect(casaBusca(lead({ email: "x@exemplo.com", creci: "PE 1" }), "joao8")).toBe(false);
  });

  it("busca vazia mostra todos", () => {
    expect(filtrarLeads(LEADS, { busca: "  ", status: "todos" })).toHaveLength(4);
  });
});

describe("filtro por status e contagem", () => {
  it("cada filtro mostra só o seu status; busca e status se somam", () => {
    expect(filtrarLeads(LEADS, { busca: "", status: "verificado" }).map((l) => l.id)).toEqual(["b"]);
    expect(filtrarLeads(LEADS, { busca: "", status: "descartado" }).map((l) => l.id)).toEqual(["d"]);
    expect(filtrarLeads(LEADS, { busca: "carla", status: "novo" })).toEqual([]);
    expect(filtrarLeads(LEADS, { busca: "carla", status: "contatado" }).map((l) => l.id)).toEqual(["c"]);
  });

  it("a contagem de cada filtro respeita a busca", () => {
    expect(contarPorFiltro(LEADS, "")).toEqual({ todos: 4, novo: 1, verificado: 1, contatado: 1, descartado: 1 });
    expect(contarPorFiltro(LEADS, "bruno")).toEqual({ todos: 1, novo: 0, verificado: 1, contatado: 0, descartado: 0 });
  });

  it("texto da contagem visível", () => {
    expect(textoContagem(4, 4)).toBe("4 leads");
    expect(textoContagem(1, 4)).toBe("1 de 4 leads");
    expect(textoContagem(1, 1)).toBe("1 lead");
    expect(textoContagem(0, 4)).toBe("0 de 4 leads");
  });
});
