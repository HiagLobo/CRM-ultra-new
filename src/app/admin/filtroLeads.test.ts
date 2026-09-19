import { describe, it, expect } from "vitest";
import type { LeadAdmin } from "@/features/lead/admin";
import { casaBusca, contarPorFiltro, filtrarLeads, textoContagem } from "./filtroLeads";

const lead = (parcial: Partial<LeadAdmin>): LeadAdmin => ({
  id: "1",
  email: "ana.corretora@exemplo.com",
  telefone: "+5581988887777",
  creci: "PE 12.345-F",
  canal: "site",
  status: "novo",
  criadoEm: "2026-06-17T12:00:00.000Z",
  ...parcial,
});

const LEADS: LeadAdmin[] = [
  lead({ id: "a" }),
  lead({ id: "b", email: "bruno@exemplo.com", telefone: "+5511977776666", creci: "SP 54321", status: "demonstracao" }),
  lead({ id: "c", email: "carla@exemplo.com", telefone: "+5521966665555", creci: "RJ 99887", status: "em_contato" }),
  lead({ id: "d", email: "davi@exemplo.com", telefone: "+5531955554444", creci: "MG 11223", status: "perdido" }),
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
    expect(filtrarLeads(LEADS, { busca: "", status: "demonstracao" }).map((l) => l.id)).toEqual(["b"]);
    expect(filtrarLeads(LEADS, { busca: "", status: "perdido" }).map((l) => l.id)).toEqual(["d"]);
    expect(filtrarLeads(LEADS, { busca: "carla", status: "novo" })).toEqual([]);
    expect(filtrarLeads(LEADS, { busca: "carla", status: "em_contato" }).map((l) => l.id)).toEqual(["c"]);
  });

  it("a contagem de cada filtro respeita a busca", () => {
    const zerado = { novo: 0, em_contato: 0, demonstracao: 0, negociacao: 0, cliente: 0, retomar: 0, perdido: 0 };
    expect(contarPorFiltro(LEADS, "")).toEqual({ ...zerado, todos: 4, novo: 1, demonstracao: 1, em_contato: 1, perdido: 1 });
    expect(contarPorFiltro(LEADS, "bruno")).toEqual({ ...zerado, todos: 1, demonstracao: 1 });
  });

  it("lead cadastrado à mão sem e-mail: a busca por telefone e CRECI segue valendo", () => {
    const semEmail = lead({ id: "e", email: undefined, canal: "indicacao", telefone: "+5581977770000" });
    expect(casaBusca(semEmail, "ana")).toBe(false);
    expect(casaBusca(semEmail, "(81) 97777")).toBe(true);
    expect(casaBusca(semEmail, "")).toBe(true);
  });

  it("texto da contagem visível", () => {
    expect(textoContagem(4, 4)).toBe("4 leads");
    expect(textoContagem(1, 4)).toBe("1 de 4 leads");
    expect(textoContagem(1, 1)).toBe("1 lead");
    expect(textoContagem(0, 4)).toBe("0 de 4 leads");
  });
});
