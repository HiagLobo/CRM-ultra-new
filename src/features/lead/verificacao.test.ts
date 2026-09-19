import { describe, it, expect, afterEach, vi } from "vitest";
import { promises as fs } from "fs";
import os from "os";
import path from "path";
import { randomUUID } from "crypto";
import { FileLeadStore } from "../../lib/leadStore";
import { MemoriaRateLimiter } from "../../lib/ratelimit";
import { LeadInputSchema, VerifyInputSchema } from "./schema";
import { criarOuAtualizarLead, MAX_TENTATIVAS, EXPIRACAO_CODIGO_MIN } from "./lead";
import { verificarCodigo, REGRA_VERIFICACAO } from "./verificacao";

const SECRET = "segredo-de-teste-1234567890";
const EMAIL = "corretor@exemplo.com";
const T0 = new Date("2026-06-17T12:00:00.000Z");
const IP = "1.2.3.4";

let arquivos: string[] = [];
function novaStore() {
  const arquivo = path.join(os.tmpdir(), `leads-s3-${randomUUID()}.json`);
  arquivos.push(arquivo);
  return new FileLeadStore(arquivo);
}
afterEach(async () => {
  await Promise.all(arquivos.map((a) => fs.rm(a, { force: true })));
  arquivos = [];
  vi.restoreAllMocks();
});

/** Cria um lead pendente com código conhecido (o mesmo caminho da S1/S2). */
async function leadPendente(agora: Date = T0) {
  const store = novaStore();
  const { codigo } = await criarOuAtualizarLead(
    store,
    LeadInputSchema.parse({
      nome: "Corretor Exemplo",
      email: EMAIL,
      telefone: "(11) 90000-0000",
      creci: "SP 12345",
      consentimento: true,
    }),
    { ip: IP, secret: SECRET, agora },
  );
  return { store, codigo, limiter: new MemoriaRateLimiter() };
}

const entrada = (codigo: string) => VerifyInputSchema.parse({ email: EMAIL, codigo });

describe("verificarCodigo (POST /api/lead/verify, nível de domínio)", () => {
  it("happy: código certo carimba o e-mail confirmado e consome o código (uso único)", async () => {
    const { store, codigo, limiter } = await leadPendente();
    const r = await verificarCodigo({ store, limiter, secret: SECRET, agora: T0 }, entrada(codigo), {
      ip: IP,
    });

    expect(r).toEqual({ status: "verificado", email: EMAIL, jaVerificado: false });
    const salvo = await store.buscarPorEmail(EMAIL);
    expect(salvo?.status).toBe("novo"); // e-mail confirmado é selo, não etapa (O8)
    expect(salvo?.verificadoEm).toBe(T0.toISOString());
    expect(salvo?.codigo.hash).toBe(""); // código consumido: não serve mais
    expect(salvo?.codigo.tentativas).toBe(0);
  });

  it("código errado falha e contabiliza a tentativa", async () => {
    const { store, codigo, limiter } = await leadPendente();
    const errado = codigo === "000000" ? "111111" : "000000";
    const r = await verificarCodigo({ store, limiter, secret: SECRET, agora: T0 }, entrada(errado), {
      ip: IP,
    });

    expect(r).toEqual({ status: "falha", motivo: "codigo_invalido" });
    const salvo = await store.buscarPorEmail(EMAIL);
    expect(salvo?.codigo.tentativas).toBe(1);
    expect(salvo?.status).toBe("novo");
    expect(salvo?.verificadoEm).toBeUndefined();
    expect(salvo?.codigo.hash).not.toBe(""); // ainda dá para acertar
  });

  it("código expirado falha mesmo estando correto (relógio injetado)", async () => {
    const { store, codigo, limiter } = await leadPendente();
    const depois = new Date(T0.getTime() + (EXPIRACAO_CODIGO_MIN + 1) * 60_000);
    const r = await verificarCodigo(
      { store, limiter, secret: SECRET, agora: depois },
      entrada(codigo),
      { ip: IP },
    );

    expect(r).toEqual({ status: "falha", motivo: "expirado" });
    const salvo = await store.buscarPorEmail(EMAIL);
    expect(salvo?.status).toBe("novo");
    expect(salvo?.codigo.tentativas).toBe(0); // expirar não gasta tentativa
  });

  it("tentativas excedidas invalidam o código — nem o correto passa depois", async () => {
    const { store, codigo, limiter } = await leadPendente();
    const errado = codigo === "000000" ? "111111" : "000000";
    const deps = { store, limiter, secret: SECRET, agora: T0 };

    for (let i = 1; i < MAX_TENTATIVAS; i++) {
      expect(await verificarCodigo(deps, entrada(errado), { ip: IP })).toEqual({
        status: "falha",
        motivo: "codigo_invalido",
      });
    }
    expect(await verificarCodigo(deps, entrada(errado), { ip: IP })).toEqual({
      status: "falha",
      motivo: "tentativas_excedidas",
    });
    expect(await verificarCodigo(deps, entrada(codigo), { ip: IP })).toEqual({
      status: "falha",
      motivo: "tentativas_excedidas",
    });

    const salvo = await store.buscarPorEmail(EMAIL);
    expect(salvo?.codigo.hash).toBe(""); // invalidado ao estourar
    expect(salvo?.status).toBe("novo");
  });

  it("e-mail desconhecido responde igual a código errado (não revela quem é lead)", async () => {
    const store = novaStore();
    const limiter = new MemoriaRateLimiter();
    const r = await verificarCodigo(
      { store, limiter, secret: SECRET, agora: T0 },
      VerifyInputSchema.parse({ email: "ninguem@exemplo.com", codigo: "123456" }),
      { ip: IP },
    );
    expect(r).toEqual({ status: "falha", motivo: "codigo_invalido" });
    expect(await store.listar()).toHaveLength(0);
  });

  it("idempotente: reverificar não duplica, não rebaixa nem re-carimba", async () => {
    const { store, codigo, limiter } = await leadPendente();
    const deps = { store, limiter, secret: SECRET, agora: T0 };
    await verificarCodigo(deps, entrada(codigo), { ip: IP });

    const depois = new Date(T0.getTime() + 60_000);
    const r2 = await verificarCodigo(
      { ...deps, agora: depois },
      entrada(codigo),
      { ip: IP },
    );

    expect(r2).toEqual({ status: "falha", motivo: "codigo_invalido" }); // código é de uso único
    const salvo = await store.buscarPorEmail(EMAIL);
    expect(salvo?.status).toBe("novo"); // a etapa não é da verificação
    expect(salvo?.verificadoEm).toBe(T0.toISOString()); // carimbo original preservado
    expect(await store.listar()).toHaveLength(1);
  });

  it("hash salvo corrompido não derruba a rota (comparação tolera tamanhos diferentes)", async () => {
    const { store, codigo, limiter } = await leadPendente();
    const lead = (await store.buscarPorEmail(EMAIL))!;
    await store.atualizarCodigo(lead.id, { codigo: { ...lead.codigo, hash: "abc" }, atualizadoEm: T0.toISOString() });

    const r = await verificarCodigo({ store, limiter, secret: SECRET, agora: T0 }, entrada(codigo), {
      ip: IP,
    });
    expect(r).toEqual({ status: "falha", motivo: "codigo_invalido" });
  });

  it("expiraEm corrompido é tratado como expirado (fail-closed)", async () => {
    const { store, codigo, limiter } = await leadPendente();
    const lead = (await store.buscarPorEmail(EMAIL))!;
    await store.atualizarCodigo(lead.id, {
      codigo: { ...lead.codigo, expiraEm: "nao-e-data" },
      atualizadoEm: T0.toISOString(),
    });

    const r = await verificarCodigo({ store, limiter, secret: SECRET, agora: T0 }, entrada(codigo), {
      ip: IP,
    });
    expect(r).toEqual({ status: "falha", motivo: "expirado" });
  });

  it("anti-martelada: estourar a regra por IP barra antes de tocar o lead", async () => {
    const { store, codigo, limiter } = await leadPendente();
    const deps = { store, limiter, secret: SECRET, agora: T0 };
    const errado = codigo === "000000" ? "111111" : "000000";

    for (let i = 0; i < REGRA_VERIFICACAO.max; i++) {
      await verificarCodigo(deps, entrada(errado), { ip: "9.9.9.9" });
    }
    expect(await verificarCodigo(deps, entrada(codigo), { ip: "9.9.9.9" })).toEqual({
      status: "limitado",
    });
    // outro IP não é afetado pelo limite (mas o código já foi invalidado pelas tentativas)
    expect(await verificarCodigo(deps, entrada(codigo), { ip: "8.8.8.8" })).not.toEqual({
      status: "limitado",
    });
  });

  it("não mexe na etapa que o admin deu, nem nos campos do funil (O8)", async () => {
    const { store, codigo, limiter } = await leadPendente();
    const lead = (await store.buscarPorEmail(EMAIL))!;
    await store.atualizarFunil(lead.id, {
      status: "negociacao",
      proximaAcaoEm: "2026-06-20",
      proximaAcao: "mandar proposta",
      atualizadoEm: T0.toISOString(),
    });

    const r = await verificarCodigo({ store, limiter, secret: SECRET, agora: T0 }, entrada(codigo), { ip: IP });
    // o desfecho da operação continua "verificado" — é dele que o aviso de lead novo depende
    expect(r).toEqual({ status: "verificado", email: EMAIL, jaVerificado: false });
    const salvo = (await store.buscarPorEmail(EMAIL))!;
    expect(salvo).toMatchObject({ status: "negociacao", proximaAcaoEm: "2026-06-20", proximaAcao: "mandar proposta" });
    expect(salvo.verificadoEm).toBe(T0.toISOString());
  });

  it("não loga PII (e-mail ou código) em nenhum caminho", async () => {
    const logs: string[] = [];
    for (const nivel of ["log", "info", "warn", "error"] as const) {
      vi.spyOn(console, nivel).mockImplementation((...args: unknown[]) => {
        logs.push(args.map(String).join(" "));
      });
    }
    const { store, codigo, limiter } = await leadPendente();
    const deps = { store, limiter, secret: SECRET, agora: T0 };
    await verificarCodigo(deps, entrada("000000"), { ip: IP });
    await verificarCodigo(deps, entrada(codigo), { ip: IP });

    const saida = logs.join("\n");
    expect(saida).not.toContain(EMAIL);
    expect(saida).not.toContain(codigo);
    expect(saida).not.toContain("90000-0000");
  });
});
