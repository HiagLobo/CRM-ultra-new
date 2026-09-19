import { describe, it, expect } from "vitest";
import type { LeadAdmin } from "@/features/lead/admin";
import { ABAS, abaInicial, casaBusca, contarPorAba, estaNaAba, filtrarPorAba, textoContagem } from "./filtroLeads";

/** 19/09/2026 12:00 em Recife (UTC−3). */
const AGORA = new Date("2026-09-19T15:00:00.000Z");
const RECENTE = "2026-09-19T12:00:00.000Z"; // 3 h antes: ainda não é "novo parado"

const lead = (parcial: Partial<LeadAdmin>): LeadAdmin => ({
  id: "1",
  email: "ana.corretora@exemplo.com",
  telefone: "+5581988887777",
  creci: "PE 12.345-F",
  canal: "site",
  status: "novo",
  criadoEm: RECENTE,
  ...parcial,
});

const LEADS: LeadAdmin[] = [
  lead({ id: "a" }),
  lead({ id: "b", email: "bruno@exemplo.com", telefone: "+5511977776666", creci: "SP 54321", status: "demonstracao" }),
  lead({ id: "c", email: "carla@exemplo.com", telefone: "+5521966665555", creci: "RJ 99887", status: "em_contato", proximaAcaoEm: "2026-09-19", proximaAcao: "ligar" }),
  lead({ id: "d", email: "davi@exemplo.com", telefone: "+5531955554444", creci: "MG 11223", status: "perdido", motivo: "Preço" }),
];

describe("busca do painel (nome, e-mail, telefone, CRECI)", () => {
  it("e-mail por trecho, sem diferenciar maiúsculas", () => {
    expect(casaBusca(LEADS[0]!, "ANA.CORR")).toBe(true);
    expect(casaBusca(LEADS[1]!, "ana.corr")).toBe(false);
  });

  it("nome por trecho, sem maiúsculas nem acento", () => {
    const joao = lead({ nome: "João Araújo", email: undefined });
    expect(casaBusca(joao, "joao")).toBe(true);
    expect(casaBusca(joao, "ARAUJO")).toBe(true);
    expect(casaBusca(joao, "araú")).toBe(true);
    expect(casaBusca(joao, "maria")).toBe(false);
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

  it("lead cadastrado à mão sem e-mail nem CRECI: a busca por telefone segue valendo", () => {
    const semEmail = lead({ id: "e", email: undefined, creci: "", canal: "indicacao", telefone: "+5581977770000" });
    expect(casaBusca(semEmail, "ana")).toBe(false);
    expect(casaBusca(semEmail, "(81) 97777")).toBe(true);
    expect(casaBusca(semEmail, "")).toBe(true);
  });
});

describe("abas do funil", () => {
  it("a ordem das abas: Hoje, as 7 etapas na ordem do funil, Todos", () => {
    expect(ABAS.map((a) => a.valor)).toEqual([
      "hoje", "novo", "em_contato", "demonstracao", "negociacao", "cliente", "retomar", "perdido", "todos",
    ]);
  });

  it("cada aba de etapa mostra só a sua etapa; Todos mostra tudo", () => {
    expect(filtrarPorAba(LEADS, { aba: "demonstracao", busca: "" }, AGORA).map((l) => l.id)).toEqual(["b"]);
    expect(filtrarPorAba(LEADS, { aba: "perdido", busca: "" }, AGORA).map((l) => l.id)).toEqual(["d"]);
    expect(filtrarPorAba(LEADS, { aba: "todos", busca: "  " }, AGORA)).toHaveLength(4);
  });

  it("a busca vale sobre a aba", () => {
    expect(filtrarPorAba(LEADS, { aba: "novo", busca: "carla" }, AGORA)).toEqual([]);
    expect(filtrarPorAba(LEADS, { aba: "em_contato", busca: "carla" }, AGORA).map((l) => l.id)).toEqual(["c"]);
    expect(filtrarPorAba(LEADS, { aba: "hoje", busca: "bruno" }, AGORA)).toEqual([]);
    expect(filtrarPorAba(LEADS, { aba: "hoje", busca: "carla" }, AGORA).map((l) => l.id)).toEqual(["c"]);
  });

  it("Hoje segue as regras do relógio (ação do dia entra, o resto não)", () => {
    expect(estaNaAba(LEADS[2]!, "hoje", AGORA)).toBe(true);
    expect(estaNaAba(LEADS[0]!, "hoje", AGORA)).toBe(false); // novo de 3 h
    // no dia seguinte, o "novo" já passou das 24 h e a ação de ontem venceu
    const amanha = new Date("2026-09-20T15:00:00.000Z");
    expect(filtrarPorAba(LEADS, { aba: "hoje", busca: "" }, amanha).map((l) => l.id)).toEqual(["c", "a"]);
  });

  it("a contagem de cada aba respeita a busca e inclui o Hoje", () => {
    const zerado = { hoje: 0, novo: 0, em_contato: 0, demonstracao: 0, negociacao: 0, cliente: 0, retomar: 0, perdido: 0 };
    expect(contarPorAba(LEADS, "", AGORA)).toEqual({ ...zerado, todos: 4, hoje: 1, novo: 1, demonstracao: 1, em_contato: 1, perdido: 1 });
    expect(contarPorAba(LEADS, "bruno", AGORA)).toEqual({ ...zerado, todos: 1, demonstracao: 1 });
    expect(contarPorAba([], "", AGORA)).toEqual({ ...zerado, todos: 0 });
  });

  it("status antigo já normalizado pelo servidor cai na aba certa", () => {
    // a API normaliza verificado→novo, contatado→em_contato, descartado→perdido
    expect(estaNaAba(lead({ status: "em_contato" }), "em_contato", AGORA)).toBe(true);
  });

  it("aba de abertura: Hoje se há pendência, senão Todos", () => {
    expect(abaInicial(3)).toBe("hoje");
    expect(abaInicial(0)).toBe("todos");
  });
});

describe("texto da contagem visível", () => {
  it("singular, plural e parcial", () => {
    expect(textoContagem(4, 4)).toBe("4 leads");
    expect(textoContagem(1, 4)).toBe("1 de 4 leads");
    expect(textoContagem(1, 1)).toBe("1 lead");
    expect(textoContagem(0, 4)).toBe("0 de 4 leads");
  });
});
