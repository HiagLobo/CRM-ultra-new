/**
 * A aba "Hoje" e o "próximo passo": relógio injetado, dia de Recife (UTC−3).
 * As viradas de dia são o ponto sensível — 23:30 em Recife já é o dia
 * seguinte em UTC, e o "Hoje" não pode adiantar a fila.
 */
import { describe, it, expect } from "vitest";
import type { LeadAdmin } from "@/features/lead/admin";
import { HORAS_NOVO_PARADO, leadsDeHoje, motivoHoje, proximoPasso } from "./hoje";

/** 19/09/2026 12:00 em Recife. */
const AGORA = new Date("2026-09-19T15:00:00.000Z");
/** 19/09/2026 23:30 em Recife — em UTC já é 20/09. */
const NOITE = new Date("2026-09-20T02:30:00.000Z");

const lead = (parcial: Partial<LeadAdmin>): LeadAdmin => ({
  id: "x",
  telefone: "+5581988887777",
  creci: "",
  canal: "site",
  status: "em_contato",
  criadoEm: "2026-09-01T12:00:00.000Z",
  ...parcial,
});

const horasAntes = (h: number, de: Date = AGORA) => new Date(de.getTime() - h * 3_600_000).toISOString();

describe("quem entra no Hoje", () => {
  it("próxima ação vencida ou do dia entra; a de amanhã não", () => {
    expect(motivoHoje(lead({ proximaAcaoEm: "2026-09-18" }), AGORA)).toBe("acao_vencida");
    expect(motivoHoje(lead({ proximaAcaoEm: "2026-09-19" }), AGORA)).toBe("acao_hoje");
    expect(motivoHoje(lead({ proximaAcaoEm: "2026-09-20" }), AGORA)).toBeNull();
  });

  it("o dia é o de Recife: às 23:30 de 19/09 a ação de 20/09 ainda não é de hoje", () => {
    expect(motivoHoje(lead({ proximaAcaoEm: "2026-09-20" }), NOITE)).toBeNull();
    expect(motivoHoje(lead({ proximaAcaoEm: "2026-09-19" }), NOITE)).toBe("acao_hoje");
    // meia-noite em Recife (03:00 UTC): virou o dia
    expect(motivoHoje(lead({ proximaAcaoEm: "2026-09-20" }), new Date("2026-09-20T03:00:00.000Z"))).toBe("acao_hoje");
  });

  it("retomar depois: entra com a data até hoje, fica de fora antes dela", () => {
    expect(motivoHoje(lead({ status: "retomar", retomarEm: "2026-09-19" }), AGORA)).toBe("retomar");
    expect(motivoHoje(lead({ status: "retomar", retomarEm: "2026-09-10" }), AGORA)).toBe("retomar");
    expect(motivoHoje(lead({ status: "retomar", retomarEm: "2026-09-20" }), AGORA)).toBeNull();
    expect(motivoHoje(lead({ status: "retomar", retomarEm: "2026-09-20" }), NOITE)).toBeNull();
  });

  it("novo sem contato entra a partir de 24 h da criação", () => {
    expect(HORAS_NOVO_PARADO).toBe(24);
    expect(motivoHoje(lead({ status: "novo", criadoEm: horasAntes(23.9) }), AGORA)).toBeNull();
    expect(motivoHoje(lead({ status: "novo", criadoEm: horasAntes(24) }), AGORA)).toBe("novo_parado");
    expect(motivoHoje(lead({ status: "novo", criadoEm: horasAntes(72) }), AGORA)).toBe("novo_parado");
  });

  it("novo com próxima ação marcada para depois espera o dia dela", () => {
    expect(motivoHoje(lead({ status: "novo", criadoEm: horasAntes(72), proximaAcaoEm: "2026-09-22" }), AGORA)).toBeNull();
  });

  it("quem já está em contato, é cliente ou perdido sem ação não entra", () => {
    for (const status of ["em_contato", "demonstracao", "negociacao", "cliente", "perdido"] as const) {
      expect(motivoHoje(lead({ status, criadoEm: horasAntes(200) }), AGORA), status).toBeNull();
    }
  });

  it("data de criação ilegível nunca empurra o lead para o Hoje", () => {
    expect(motivoHoje(lead({ status: "novo", criadoEm: "ontem" }), AGORA)).toBeNull();
  });
});

describe("ordem do Hoje", () => {
  it("vencidas (mais antiga antes) → retomar → do dia → novos parados (mais antigo antes)", () => {
    const leads = [
      lead({ id: "novo-recente", status: "novo", criadoEm: horasAntes(30) }),
      lead({ id: "do-dia", proximaAcaoEm: "2026-09-19" }),
      lead({ id: "retomar", status: "retomar", retomarEm: "2026-09-19" }),
      lead({ id: "vencida-ontem", proximaAcaoEm: "2026-09-18" }),
      lead({ id: "novo-antigo", status: "novo", criadoEm: horasAntes(90) }),
      lead({ id: "fora", proximaAcaoEm: "2026-09-25" }),
      lead({ id: "vencida-semana", proximaAcaoEm: "2026-09-12" }),
    ];
    expect(leadsDeHoje(leads, AGORA).map((l) => l.id)).toEqual([
      "vencida-semana",
      "vencida-ontem",
      "retomar",
      "do-dia",
      "novo-antigo",
      "novo-recente",
    ]);
  });
});

describe("próximo passo (coluna da lista)", () => {
  it("ação atrasada, de hoje e marcada", () => {
    expect(proximoPasso(lead({ proximaAcaoEm: "2026-09-18", proximaAcao: "ligar" }), AGORA)).toEqual({ texto: "Atrasada (ontem) · ligar", tom: "atrasado" });
    expect(proximoPasso(lead({ proximaAcaoEm: "2026-09-10", proximaAcao: "ligar" }), AGORA)).toEqual({ texto: "Atrasada (10/09) · ligar", tom: "atrasado" });
    expect(proximoPasso(lead({ proximaAcaoEm: "2026-09-19", proximaAcao: "mandar proposta" }), AGORA)).toEqual({ texto: "Hoje · mandar proposta", tom: "hoje" });
    expect(proximoPasso(lead({ proximaAcaoEm: "2026-09-20", proximaAcao: "ligar" }), AGORA)).toEqual({ texto: "Amanhã · ligar", tom: "agendado" });
    expect(proximoPasso(lead({ proximaAcaoEm: "2027-01-05", proximaAcao: "ligar" }), AGORA)).toEqual({ texto: "05/01/2027 · ligar", tom: "agendado" });
  });

  it("retomar: com a data e o motivo", () => {
    expect(proximoPasso(lead({ status: "retomar", retomarEm: "2026-10-19", motivo: "depois das férias" }), AGORA)).toEqual({
      texto: "Retomar em 19/10 · depois das férias",
      tom: "agendado",
    });
    expect(proximoPasso(lead({ status: "retomar", retomarEm: "2026-09-20" }), AGORA).texto).toBe("Retomar amanhã");
    expect(proximoPasso(lead({ status: "retomar", retomarEm: "2026-09-19" }), AGORA)).toEqual({ texto: "Retomar hoje", tom: "hoje" });
    expect(proximoPasso(lead({ status: "retomar", retomarEm: "2026-09-15" }), AGORA)).toEqual({ texto: "Retomar (desde 15/09)", tom: "atrasado" });
  });

  it("perdido mostra o motivo; novo parado mostra há quantos dias", () => {
    expect(proximoPasso(lead({ status: "perdido", motivo: "Preço" }), AGORA)).toEqual({ texto: "Preço", tom: "nenhum" });
    expect(proximoPasso(lead({ status: "perdido" }), AGORA).texto).toBe("Sem motivo registrado");
    expect(proximoPasso(lead({ status: "novo", criadoEm: horasAntes(30) }), AGORA)).toEqual({ texto: "Sem contato há 1 dia", tom: "atrasado" });
    expect(proximoPasso(lead({ status: "novo", criadoEm: horasAntes(50) }), AGORA).texto).toBe("Sem contato há 2 dias");
    expect(proximoPasso(lead({ status: "novo", criadoEm: horasAntes(2) }), AGORA)).toEqual({ texto: "Sem próxima ação", tom: "nenhum" });
    expect(proximoPasso(lead({ status: "negociacao" }), AGORA)).toEqual({ texto: "Sem próxima ação", tom: "nenhum" });
  });
});
