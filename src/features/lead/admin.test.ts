import { describe, it, expect, afterEach, vi } from "vitest";
import { promises as fs } from "fs";
import os from "os";
import path from "path";
import { randomUUID } from "crypto";
import { FileLeadStore } from "../../lib/leadStore";
import { registrarAuditoria, lerAuditoria } from "../../lib/auditoria";
import { LeadInputSchema } from "./schema";
import { criarOuAtualizarLead } from "./lead";
import { calcularResumo, resumo, excluirLead, paraLeadAdmin, diaBR, telefoneNacional } from "./admin";
import { criarLeads, leadCru, SECRET_TESTE, storesTemporarias } from "./apoioTestes";
import type { Lead } from "./lead";

const T0 = new Date("2026-06-17T12:00:00.000Z");
const stores = storesTemporarias("leads-admin");

let arquivos: string[] = [];
function novoArquivo(prefixo: string) {
  const a = path.join(os.tmpdir(), `${prefixo}-${randomUUID()}`);
  arquivos.push(a);
  return a;
}
afterEach(async () => {
  await stores.limpar();
  await Promise.all(arquivos.map((a) => fs.rm(a, { force: true })));
  arquivos = [];
  vi.restoreAllMocks();
});

describe("calcularResumo (funil)", () => {
  it("conta por etapa; em andamento = contato + demonstração + negociação; conversão = clientes / total", () => {
    const base = { codigo: {}, consentimento: {} } as unknown as Lead;
    const verificado = { verificadoEm: "2026-06-17T12:00:00.000Z" };
    const leads = [
      { ...base, status: "novo" },
      { ...base, status: "em_contato", ...verificado },
      { ...base, status: "demonstracao" },
      { ...base, status: "negociacao", ...verificado },
      { ...base, status: "cliente", ...verificado },
      { ...base, status: "cliente" },
      { ...base, status: "retomar" },
      { ...base, status: "perdido" },
    ] as Lead[];

    expect(calcularResumo(leads)).toEqual({
      total: 8,
      verificados: 3, // e-mail confirmado é selo: conta em qualquer etapa
      porEtapa: { novo: 1, em_contato: 1, demonstracao: 1, negociacao: 1, cliente: 2, retomar: 1, perdido: 1 },
      emAndamento: 3,
      clientes: 2,
      conversaoPct: 25,
    });
  });

  it("base vazia não divide por zero", () => {
    const r = calcularResumo([]);
    expect(r.total).toBe(0);
    expect(r.conversaoPct).toBe(0);
    expect(Object.values(r.porEtapa).every((n) => n === 0)).toBe(true);
  });
});

describe("resumo (lista do store)", () => {
  it("devolve a lista do mais recente para o mais antigo", async () => {
    const store = stores.nova();
    await criarLeads(store, 3, T0);
    const r = await resumo(store);
    expect(r.resumo.total).toBe(3);
    expect(r.leads.map((l) => l.email)).toEqual([
      "corretor2@exemplo.com",
      "corretor1@exemplo.com",
      "corretor0@exemplo.com",
    ]);
  });

  it("lead do arquivo com status antigo aparece na etapa nova (nunca quebra o painel)", async () => {
    const arquivo = novoArquivo("leads-legado");
    const antigos = ["verificado", "contatado", "descartado"].map((status, i) =>
      leadCru({ id: `l${i}`, email: `l${i}@exemplo.com`, status: status as Lead["status"] }),
    );
    await fs.writeFile(arquivo, JSON.stringify(antigos.map(({ canal: _canal, ...semCanal }) => semCanal)), "utf8");
    const r = await resumo(new FileLeadStore(arquivo));
    expect(r.leads.map((l) => [l.id, l.status, l.canal])).toEqual([
      ["l0", "novo", "site"],
      ["l1", "em_contato", "site"],
      ["l2", "perdido", "site"],
    ]);
  });
});

describe("excluirLead (LGPD art. 18 — direito à eliminação)", () => {
  it("apaga de vez: some da lista e do arquivo", async () => {
    const store = stores.nova();
    const criados = await criarLeads(store, 2, T0);
    expect(await excluirLead(store, criados[0]!.id)).toBe(true);

    const restantes = await store.listar();
    expect(restantes).toHaveLength(1);
    expect(restantes[0]!.email).toBe("corretor1@exemplo.com");
    expect(await store.buscarPorEmail("corretor0@exemplo.com")).toBeNull();
  });

  it("é idempotente: pedir a exclusão duas vezes não vira erro", async () => {
    const store = stores.nova();
    const [lead] = await criarLeads(store, 1, T0);
    expect(await excluirLead(store, lead!.id)).toBe(true);
    expect(await excluirLead(store, lead!.id)).toBe(false);
    expect(await excluirLead(store, "nunca-existiu")).toBe(false);
  });

  it("o e-mail excluído pode pedir acesso de novo (nada fica bloqueado)", async () => {
    const store = stores.nova();
    const [antigo] = await criarLeads(store, 1, T0);
    await excluirLead(store, antigo!.id);
    const { lead } = await criarOuAtualizarLead(
      store,
      LeadInputSchema.parse({
        email: "corretor0@exemplo.com",
        telefone: "(11) 90000-0000",
        creci: "SP 12340",
        consentimento: true,
      }),
      { ip: "1.2.3.4", secret: SECRET_TESTE, agora: T0 },
    );
    expect(lead.email).toBe("corretor0@exemplo.com");
    expect(await store.listar()).toHaveLength(1);
  });
});

describe("o painel recebe só o contato e o funil (LeadAdmin)", () => {
  it("a lista sai com os campos do funil e sem hash do código, IP e texto do consentimento", async () => {
    const store = stores.nova();
    await store.criar(
      leadCru({
        origem: { utm: "google", ref: "parceiro" },
        nome: "Ana Exemplo",
        status: "retomar",
        retomarEm: "2026-07-01",
        motivo: "sem orçamento agora",
      }),
    );
    const { leads } = await resumo(store);

    expect(Object.keys(leads[0]!).sort()).toEqual([
      "canal",
      "creci",
      "criadoEm",
      "email",
      "id",
      "motivo",
      "nome",
      "origem",
      "proximaAcao",
      "proximaAcaoEm",
      "retomarEm",
      "status",
      "telefone",
      "verificadoEm",
    ]);
    expect(leads[0]).toMatchObject({ nome: "Ana Exemplo", status: "retomar", retomarEm: "2026-07-01" });
    const json = JSON.stringify(leads[0]);
    for (const sensivel of ["hash-do-codigo", "203.0.113.9", "texto-da-politica", "tentativas", "consentimento"]) {
      expect(json).not.toContain(sensivel);
    }
  });

  it("a projeção não carrega campo que não conhece (anotações de dev nunca vão junto)", () => {
    const comExtra = { ...leadCru(), notas: [{ id: "n", texto: "segredo", em: T0.toISOString() }] } as Lead;
    expect(JSON.stringify(paraLeadAdmin(comExtra))).not.toContain("segredo");
  });
});

describe("formatos do painel e do CSV", () => {
  it("telefone nacional e dia dd/mm/aaaa", () => {
    expect(telefoneNacional("+5581988887777")).toBe("(81) 98888-7777");
    expect(telefoneNacional("+558133334444")).toBe("(81) 3333-4444");
    expect(diaBR("2026-09-05")).toBe("05/09/2026");
    expect(diaBR(undefined)).toBe("");
    expect(diaBR("lixo")).toBe("lixo");
  });
});

describe("auditoria", () => {
  it("registra o evento sem PII — só id, de/para e quando", async () => {
    const log = novoArquivo("auditoria");
    await registrarAuditoria("lead.etapa", { id: "abc-123", de: "novo", para: "em_contato" }, log, T0);
    await registrarAuditoria("lead.export", { linhas: 2 }, log, T0);

    const eventos = await lerAuditoria(log);
    expect(eventos).toHaveLength(2);
    expect(eventos[0]).toEqual({
      em: T0.toISOString(),
      acao: "lead.etapa",
      dados: { id: "abc-123", de: "novo", para: "em_contato" },
    });

    const bruto = await fs.readFile(log, "utf8");
    for (const pii of ["@exemplo.com", "90000-0000", "SP 12345"]) {
      expect(bruto).not.toContain(pii);
    }
  });

  it("log vazio/ausente devolve lista vazia; falha de escrita não derruba a ação", async () => {
    expect(await lerAuditoria(novoArquivo("nao-existe"))).toEqual([]);
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    await expect(
      registrarAuditoria("x", {}, path.join(os.tmpdir(), "nao-existe", "\0invalido")),
    ).resolves.toBeUndefined();
    expect(spy).toHaveBeenCalled(); // falhou, mas avisou (nada de silêncio)
  });
});
