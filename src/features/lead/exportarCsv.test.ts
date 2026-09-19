import { describe, it, expect, afterEach } from "vitest";
import { exportarCsv, COLUNAS_CSV } from "./exportarCsv";
import { criarLeads, leadCru, storesTemporarias } from "./apoioTestes";

const T0 = new Date("2026-06-17T12:00:00.000Z");
const stores = storesTemporarias("leads-csv");
afterEach(() => stores.limpar());

/** Lê uma linha como o Excel pt-BR: separa por `;`, respeitando aspas e `""`. */
function camposCsv(linha: string): string[] {
  const campos: string[] = [];
  let atual = "";
  let dentro = false;
  for (let i = 0; i < linha.length; i++) {
    const c = linha[i];
    if (dentro && c === '"' && linha[i + 1] === '"') {
      atual += '"';
      i++;
    } else if (c === '"') {
      dentro = !dentro;
    } else if (c === ";" && !dentro) {
      campos.push(atual);
      atual = "";
    } else {
      atual += c;
    }
  }
  return [...campos, atual];
}

/** 1ª linha de dados como { coluna: valor }. */
function primeiraLinha(csv: string): Record<string, string> {
  const campos = camposCsv(csv.trim().split("\r\n")[1]!);
  return Object.fromEntries(COLUNAS_CSV.map((c, i) => [c, campos[i]!]));
}

describe("exportarCsv (Excel em português)", () => {
  it("separa por ';', mantém o BOM e as aspas; telefone nacional sem apóstrofo", async () => {
    const store = stores.nova();
    await criarLeads(store, 2, T0);
    const { csv, linhas } = await exportarCsv(store);
    expect(linhas).toBe(2);
    expect(csv.startsWith("﻿")).toBe(true);
    const linhasCsv = csv.slice(1).trim().split("\r\n");
    expect(linhasCsv).toHaveLength(3);
    expect(linhasCsv[0]).toBe(
      '"id";"nome";"email";"telefone";"creci";"etapa";"canal";"verificado_em";"criado_em";' +
        '"proxima_acao_em";"retomar_em";"motivo";"origem_utm";"origem_ref";"creci_conferencia";"ultimo_acesso_em"',
    );
    // todo campo entre aspas, inclusive os vazios
    for (const l of linhasCsv) expect(l).toMatch(/^"(?:[^"]|"")*"(?:;"(?:[^"]|"")*")*$/);

    const campos = camposCsv(linhasCsv[1]!);
    expect(campos.slice(1, 9)).toEqual(
      ["Corretor B Exemplo", "corretor1@exemplo.com", "(11) 90000-0000", "SP 12341", "novo", "site", "", "17/06/2026 09:00"],
    );
    expect(csv).not.toContain("'+55"); // o apóstrofo de proteção não aparece no telefone
  });

  it("colunas do funil: nome, etapa, canal, próxima ação, retomar e motivo — sem as anotações", async () => {
    const store = stores.nova();
    await store.criar(
      leadCru({
        nome: "Ana Exemplo",
        status: "retomar",
        canal: "indicacao",
        retomarEm: "2026-10-01",
        motivo: "sem orçamento agora",
        proximaAcaoEm: "2026-09-25",
        proximaAcao: "ligar",
      }),
    );
    await store.adicionarNota("1", "texto-da-anotacao", T0.toISOString());

    const { csv } = await exportarCsv(store);
    expect(primeiraLinha(csv)).toMatchObject({
      nome: "Ana Exemplo",
      etapa: "retomar",
      canal: "indicacao",
      proxima_acao_em: "25/09/2026",
      retomar_em: "01/10/2026",
      motivo: "sem orçamento agora",
    });
    expect(csv).not.toContain("texto-da-anotacao");
    for (const sensivel of ["hash-do-codigo", "203.0.113.9", "texto-da-politica"]) expect(csv).not.toContain(sensivel);
  });

  it("lead manual sem e-mail e sem CRECI sai com as células vazias (não quebra o arquivo)", async () => {
    const store = stores.nova();
    await store.criar(leadCru({ email: undefined, creci: "", canal: "whatsapp" }));
    const linha = primeiraLinha((await exportarCsv(store)).csv);
    expect(linha).toMatchObject({ email: "", creci: "", canal: "whatsapp", telefone: "(81) 98888-7777" });
  });

  it("datas em dd/mm/aaaa hh:mm no fuso de Recife, inclusive na virada do dia", async () => {
    const store = stores.nova();
    await store.criar(leadCru({ criadoEm: "2026-06-18T02:30:00.000Z", verificadoEm: "2026-06-18T03:05:00.000Z" }));
    const linha = primeiraLinha((await exportarCsv(store)).csv);
    expect(linha.verificado_em).toBe("18/06/2026 00:05");
    expect(linha.criado_em).toBe("17/06/2026 23:30"); // 02:30 UTC ainda é dia 17 em Recife
  });

  it("neutraliza fórmula no início do campo, escapa aspas e prende o ';' interno", async () => {
    const store = stores.nova();
    await store.criar(
      leadCru({
        email: '=HYPERLINK("http://mau.example")',
        creci: '@SUM(1+1)"x',
        nome: "=cmd|' /C calc'!A0",
        status: "perdido",
        motivo: "+1;preço",
        origem: { utm: "x;=1+1&", ref: "-2+3;@z" },
      }),
    );
    const { csv } = await exportarCsv(store);
    expect(csv).toContain(`"'=HYPERLINK(""http://mau.example"")"`); // ' na frente + aspas dobradas
    expect(csv).toContain(`"'@SUM(1+1)""x"`);

    const campos = camposCsv(csv.trim().split("\r\n")[1]!);
    expect(campos).toHaveLength(COLUNAS_CSV.length); // o ';' de dentro não abriu coluna nova
    expect(primeiraLinha(csv)).toMatchObject({
      nome: "'=cmd|' /C calc'!A0",
      motivo: "'+1;preço",
      origem_utm: "x;=1+1&",
      origem_ref: "'-2+3;@z",
    });
    for (const c of campos) expect(c).not.toMatch(/^[=+\-@]/); // nenhuma célula vira fórmula
  });

  it("O9: conferência do CRECI e último acesso ao demo no fim (dd/mm/aaaa hh:mm de Recife); vazios sem valor", async () => {
    const store = stores.nova();
    await store.criar(leadCru({ creciConferencia: "nao_confere", creciConferidoEm: "2026-06-18T12:00:00.000Z", ultimoAcessoEm: "2026-06-19T13:30:00.000Z" }));
    await store.criar(leadCru({ id: "2", email: "outro@exemplo.com", criadoEm: "2026-06-16T12:00:00.000Z" }));
    const { csv } = await exportarCsv(store);
    expect(COLUNAS_CSV.slice(-2)).toEqual(["creci_conferencia", "ultimo_acesso_em"]);
    expect(primeiraLinha(csv)).toMatchObject({ creci_conferencia: "nao_confere", ultimo_acesso_em: "19/06/2026 10:30" });
    const segunda = camposCsv(csv.trim().split(String.fromCharCode(13, 10))[2]!);
    expect(segunda.slice(-2)).toEqual(["", ""]);
  });

  it("telefone fora do padrão brasileiro sai como veio (e ainda protegido)", async () => {
    const store = stores.nova();
    await store.criar(leadCru({ telefone: "+15550001111" }));
    expect((await exportarCsv(store)).csv).toContain(`"'+15550001111"`);
  });
});
