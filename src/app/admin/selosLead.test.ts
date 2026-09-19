/**
 * Regras da O9·S3 no painel: onde conferir o CRECI (UF provável pelo DDD no
 * legado), repetidos da lista e "voltou ao demo" (relógio injetado).
 */
import { describe, it, expect } from "vitest";
import { consultaDoCreci, numeroDoCreci, textoConferencia } from "./creciPainel";
import { dataHoraCurta, repetidosDaLista, textoRepetido, voltouAoDemo } from "./selosLead";

const AGORA = new Date("2026-06-20T12:00:00.000Z");
const horasAntes = (h: number) => new Date(AGORA.getTime() - h * 3_600_000).toISOString();

describe("consultaDoCreci", () => {
  it("CRECI com UF → busca do conselho dessa UF, sem 'provável'", () => {
    expect(consultaDoCreci({ creci: "PE 12345-F", telefone: "+5511900000000" })).toEqual({
      uf: "PE",
      url: "https://www.crecipe.conselho.net.br/form_pesquisa_cadastro_geral_site.php",
      provavel: false,
    });
  });

  it("legado sem UF → UF provável pelo DDD do WhatsApp", () => {
    expect(consultaDoCreci({ creci: "12345", telefone: "+5521988887777" })).toMatchObject({ uf: "RJ", provavel: true });
    expect(consultaDoCreci({ creci: "CRECI 12.345", telefone: "+5561988887777" })).toMatchObject({ uf: "DF", provavel: true });
  });

  it("legado cru com UF (antes da O7) é normalizado antes", () => {
    expect(consultaDoCreci({ creci: "CRECI-SP 12.345", telefone: "+5581988887777" })).toMatchObject({ uf: "SP", provavel: false });
  });

  it("sem CRECI, ou sem UF e com DDD desconhecido → null", () => {
    expect(consultaDoCreci({ creci: "", telefone: "+5581988887777" })).toBeNull();
    expect(consultaDoCreci({ creci: "12345", telefone: "+15550001111" })).toBeNull();
  });

  it("número para colar na busca e texto da conferência", () => {
    expect(numeroDoCreci("PE 12345-F")).toBe("12345");
    expect(numeroDoCreci("CRECI-PE 12.345-J")).toBe("12345");
    expect(textoConferencia({ creciConferencia: "conferido", creciConferidoEm: "2026-06-18T15:00:00.000Z" })).toBe("Confere · conferido em 18/06");
    expect(textoConferencia({ creciConferencia: "nao_confere" })).toBe("Não confere");
    expect(textoConferencia({})).toBeNull();
  });
});

describe("repetidosDaLista", () => {
  it("mesmo WhatsApp e mesma chave de CRECI (PE 12345 ≡ PE 12345-F); J, outra UF e vazio não contam", () => {
    const r = repetidosDaLista([
      { id: "a", telefone: "+5581900000001", creci: "PE 12345" },
      { id: "b", telefone: "+5581900000001", creci: "PE 12345-F" },
      { id: "c", telefone: "+5581900000002", creci: "PE 12345-J" },
      { id: "d", telefone: "+5581900000003", creci: "SP 12345" },
      { id: "e", telefone: "+5581900000004", creci: "" },
      { id: "f", telefone: "+5581900000005", creci: "" },
    ]);
    expect(Object.fromEntries(r)).toEqual({ a: ["telefone", "creci"], b: ["telefone", "creci"] });
    expect(textoRepetido(r.get("a")!)).toBe("Outro lead tem o mesmo WhatsApp e o mesmo CRECI.");
  });

  it("legado sem UF só casa com legado sem UF; grafia antiga é normalizada", () => {
    const r = repetidosDaLista([
      { id: "a", telefone: "+5581900000001", creci: "12345" },
      { id: "b", telefone: "+5581900000002", creci: "12.345-F" },
      { id: "c", telefone: "+5581900000003", creci: "PE 12345" },
      { id: "d", telefone: "+5581900000004", creci: "CRECI-PE 12.345" },
    ]);
    expect(Object.fromEntries(r)).toEqual({ a: ["creci"], b: ["creci"], c: ["creci"], d: ["creci"] });
    expect(r.get("a")).toEqual(["creci"]);
  });

  it("lista sem repetidos → vazio", () => {
    expect(repetidosDaLista([{ id: "a", telefone: "+5581900000001", creci: "PE 1" }]).size).toBe(0);
  });
});

describe("voltouAoDemo", () => {
  it("último acesso nos últimos 7 dias e ≥ 1 h depois da 1ª verificação", () => {
    expect(voltouAoDemo({ verificadoEm: horasAntes(48), ultimoAcessoEm: horasAntes(2) }, AGORA)).toBe(true);
    expect(voltouAoDemo({ verificadoEm: horasAntes(3), ultimoAcessoEm: horasAntes(2) }, AGORA)).toBe(true); // exatamente 1 h
  });

  it("não: só a 1ª entrada (ou menos de 1 h depois), acesso antigo, ou sem datas", () => {
    expect(voltouAoDemo({ verificadoEm: horasAntes(2), ultimoAcessoEm: horasAntes(2) }, AGORA)).toBe(false);
    expect(voltouAoDemo({ verificadoEm: horasAntes(2), ultimoAcessoEm: horasAntes(1.5) }, AGORA)).toBe(false);
    expect(voltouAoDemo({ verificadoEm: horasAntes(24 * 30), ultimoAcessoEm: horasAntes(24 * 7 + 1) }, AGORA)).toBe(false);
    expect(voltouAoDemo({ verificadoEm: horasAntes(24 * 30) }, AGORA)).toBe(false);
    expect(voltouAoDemo({ ultimoAcessoEm: horasAntes(1) }, AGORA)).toBe(false);
    expect(voltouAoDemo({ verificadoEm: "lixo", ultimoAcessoEm: horasAntes(1) }, AGORA)).toBe(false);
  });

  it("a janela anda com o relógio: 7 dias depois do acesso, o selo some", () => {
    const lead = { verificadoEm: "2026-06-01T12:00:00.000Z", ultimoAcessoEm: "2026-06-10T12:00:00.000Z" };
    expect(voltouAoDemo(lead, new Date("2026-06-17T12:00:00.000Z"))).toBe(true);
    expect(voltouAoDemo(lead, new Date("2026-06-17T12:00:00.001Z"))).toBe(false);
  });

  it("dataHoraCurta: dd/mm hh:mm no fuso de Recife", () => {
    expect(dataHoraCurta("2026-06-18T02:30:00.000Z")).toBe("17/06 23:30");
    expect(dataHoraCurta(undefined)).toBe("");
  });
});
