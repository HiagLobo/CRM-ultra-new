import { describe, it, expect, afterEach } from "vitest";
import { promises as fs } from "fs";
import os from "os";
import path from "path";
import { randomUUID } from "crypto";
import { FileLeadStore } from "../../lib/leadStore";
import { LeadInputSchema, normalizarTelefoneBR } from "./schema";
import { criarOuAtualizarLead, hashCodigo } from "./lead";

const SECRET = "segredo-de-teste-1234567890";

function inputValido(over: Record<string, unknown> = {}) {
  return {
    nome: "Corretor Exemplo",
    email: "Corretor@Exemplo.com",
    telefone: "(11) 90000-0000",
    creci: "SP 12345",
    consentimento: true,
    ...over,
  };
}

let arquivos: string[] = [];
function novaStore() {
  const arquivo = path.join(os.tmpdir(), `leads-test-${randomUUID()}.json`);
  arquivos.push(arquivo);
  return { store: new FileLeadStore(arquivo), arquivo };
}
afterEach(async () => {
  await Promise.all(arquivos.map((a) => fs.rm(a, { force: true })));
  arquivos = [];
});

describe("LeadInputSchema (validação Zod)", () => {
  it("normaliza telefone p/ E.164 e e-mail p/ minúsculas", () => {
    const r = LeadInputSchema.parse(inputValido());
    expect(r.telefone).toBe("+5511900000000");
    expect(r.email).toBe("corretor@exemplo.com");
  });
  it("rejeita e-mail inválido", () => {
    expect(LeadInputSchema.safeParse(inputValido({ email: "naoehemail" })).success).toBe(false);
  });
  it("rejeita telefone inválido", () => {
    expect(LeadInputSchema.safeParse(inputValido({ telefone: "123" })).success).toBe(false);
  });
  it("rejeita CRECI inválido", () => {
    expect(LeadInputSchema.safeParse(inputValido({ creci: "??" })).success).toBe(false);
  });
  it("exige consentimento = true", () => {
    expect(LeadInputSchema.safeParse(inputValido({ consentimento: false })).success).toBe(false);
  });
  it("O9: exige nome completo e CRECI com a UF (no cadastro público)", () => {
    const semNome = LeadInputSchema.safeParse(inputValido({ nome: undefined }));
    expect(semNome.success).toBe(false);
    if (!semNome.success) expect(semNome.error.flatten().fieldErrors).toHaveProperty("nome");
    expect(LeadInputSchema.safeParse(inputValido({ nome: "Maria" })).success).toBe(false);
    const semUf = LeadInputSchema.safeParse(inputValido({ creci: "12345" }));
    expect(semUf.success).toBe(false);
    if (!semUf.success) expect(semUf.error.flatten().fieldErrors.creci).toEqual(["informe o estado do CRECI"]);
    expect(LeadInputSchema.parse(inputValido({ nome: "  Maria   da Silva " })).nome).toBe("Maria da Silva");
  });
});

describe("normalizarTelefoneBR", () => {
  it("aceita formatos comuns BR", () => {
    expect(normalizarTelefoneBR("+55 11 90000-0000")).toBe("+5511900000000");
    expect(normalizarTelefoneBR("11900000000")).toBe("+5511900000000");
  });
  it("rejeita entradas inválidas", () => {
    expect(normalizarTelefoneBR("123")).toBeNull();
    expect(normalizarTelefoneBR("abc")).toBeNull();
  });
});

describe("criarOuAtualizarLead (upsert + consentimento + código)", () => {
  it("cria lead novo e o persiste, lido por e-mail", async () => {
    const { store } = novaStore();
    const input = LeadInputSchema.parse(inputValido());
    const { lead, codigo, novo } = await criarOuAtualizarLead(store, input, {
      ip: "1.2.3.4",
      secret: SECRET,
    });
    expect(novo).toBe(true);
    expect(lead.status).toBe("novo");
    expect(lead.nome).toBe("Corretor Exemplo");
    expect(lead.telefone).toBe("+5511900000000");
    expect(lead.consentimento.ip).toBe("1.2.3.4");
    expect(lead.consentimento.texto.length).toBeGreaterThan(10);
    expect(codigo).toMatch(/^\d{6}$/);
    const lido = await store.buscarPorEmail("corretor@exemplo.com");
    expect(lido?.id).toBe(lead.id);
  });

  it("reenviar não duplica (upsert por e-mail), renova o código e NÃO regrava o contato (O9)", async () => {
    const { store } = novaStore();
    const r1 = await criarOuAtualizarLead(store, LeadInputSchema.parse(inputValido()), {
      ip: "1.1.1.1",
      secret: SECRET,
    });
    const r2 = await criarOuAtualizarLead(
      store,
      LeadInputSchema.parse(inputValido({ telefone: "(21) 98888-7777" })),
      { ip: "2.2.2.2", secret: SECRET },
    );
    expect(r2.novo).toBe(false);
    expect(r2.lead.id).toBe(r1.lead.id);
    expect(r2.lead.codigo.hash).not.toBe(r1.lead.codigo.hash);
    expect(await store.listar()).toHaveLength(1);
    // quem digita o e-mail de outra pessoa não troca o WhatsApp nem o consentimento dela
    const salvo = (await store.buscarPorEmail("corretor@exemplo.com"))!;
    expect(salvo.telefone).toBe("+5511900000000");
    expect(salvo.consentimento.ip).toBe("1.1.1.1");
    expect(salvo.codigo.hash).toBe(r2.lead.codigo.hash);
  });

  it("guarda o código só como hash — texto puro não vai ao disco", async () => {
    const { store, arquivo } = novaStore();
    const { lead, codigo } = await criarOuAtualizarLead(
      store,
      LeadInputSchema.parse(inputValido()),
      { ip: "9.9.9.9", secret: SECRET },
    );
    expect(lead.codigo.hash).toMatch(/^[a-f0-9]{64}$/);
    expect(lead.codigo.hash).not.toBe(codigo);
    expect(lead.codigo.hash).toBe(hashCodigo(codigo, SECRET));
    // o objeto persistido guarda SÓ o hash (+ metadados) — nenhum campo em claro
    const persistido = JSON.parse(await fs.readFile(arquivo, "utf8"))[0];
    expect(persistido.codigo).toEqual({
      hash: hashCodigo(codigo, SECRET),
      expiraEm: lead.codigo.expiraEm,
      tentativas: 0,
      enviadoEm: lead.codigo.enviadoEm,
    });
    expect(Object.values(persistido)).not.toContain(codigo);
  });

  it("usa o relógio injetado para a expiração (10 min)", async () => {
    const { store } = novaStore();
    const agora = new Date("2026-06-17T12:00:00.000Z");
    const { lead } = await criarOuAtualizarLead(store, LeadInputSchema.parse(inputValido()), {
      ip: "1.2.3.4",
      secret: SECRET,
      agora,
    });
    expect(lead.codigo.enviadoEm).toBe("2026-06-17T12:00:00.000Z");
    expect(lead.codigo.expiraEm).toBe("2026-06-17T12:10:00.000Z");
    expect(lead.codigo.tentativas).toBe(0);
  });

  it("grava o CRECI na forma normalizada (O7·S3)", async () => {
    const { store } = novaStore();
    const input = LeadInputSchema.parse(inputValido({ creci: "CRECI-PE 12.345-F" }));
    await criarOuAtualizarLead(store, input, { ip: "1.2.3.4", secret: SECRET });
    const lido = await store.buscarPorEmail("corretor@exemplo.com");
    expect(lido?.creci).toBe("PE 12345-F");
  });
});
