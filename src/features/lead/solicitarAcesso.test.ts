import { describe, it, expect, afterEach, vi } from "vitest";
import { promises as fs } from "fs";
import os from "os";
import path from "path";
import { randomUUID } from "crypto";
import { FileLeadStore } from "../../lib/leadStore";
import { ConsoleEmail, mascararEmail, type ProvedorEmail } from "../../lib/email";
import { MemoriaRateLimiter } from "../../lib/ratelimit";
import { brand } from "../../config/brand";
import type { BrandConfig } from "../../config/brand";
import { LeadInputSchema } from "./schema";
import { solicitarAcesso, REGRA_ENVIO_CODIGO } from "./solicitarAcesso";

const SECRET = "segredo-de-teste-1234567890";
const EMAIL_TESTE = "corretor@exemplo.com";
const TELEFONE_TESTE = "(11) 90000-0000";

function inputValido(over: Record<string, unknown> = {}) {
  return { email: "Corretor@Exemplo.com", telefone: TELEFONE_TESTE, creci: "SP 12345", consentimento: true, ...over };
}

/** E-mail fake: registra os envios sem rede. */
class EmailFake implements ProvedorEmail {
  enviadas: { para: string; codigo: string }[] = [];
  async enviarCodigo(para: string, codigo: string, _brand: BrandConfig): Promise<void> {
    this.enviadas.push({ para, codigo });
  }
}

let arquivos: string[] = [];
function novaStore() {
  const arquivo = path.join(os.tmpdir(), `leads-s2-${randomUUID()}.json`);
  arquivos.push(arquivo);
  return new FileLeadStore(arquivo);
}
afterEach(async () => {
  await Promise.all(arquivos.map((a) => fs.rm(a, { force: true })));
  arquivos = [];
  vi.restoreAllMocks();
});

describe("solicitarAcesso (rota POST /api/lead, nível de domínio)", () => {
  it("happy: cria lead, carimba consentimento e 'envia' o código", async () => {
    const store = novaStore();
    const email = new EmailFake();
    const limiter = new MemoriaRateLimiter();
    const r = await solicitarAcesso(
      { store, email, limiter, brand, secret: SECRET },
      LeadInputSchema.parse(inputValido()),
      { ip: "1.2.3.4" },
    );
    expect(r.status).toBe("enviado");
    if (r.status !== "enviado") return;
    expect(r.novo).toBe(true);
    expect(r.codigo).toMatch(/^\d{6}$/);
    expect(email.enviadas).toEqual([{ para: EMAIL_TESTE, codigo: r.codigo }]);
    const persistido = await store.buscarPorEmail(EMAIL_TESTE);
    expect(persistido?.consentimento.ip).toBe("1.2.3.4");
    expect(persistido?.consentimento.texto.length).toBeGreaterThan(20);
    expect(persistido?.consentimento.aceitoEm).toBeTruthy();
    expect(persistido?.codigo.hash).toMatch(/^[a-f0-9]{64}$/);
  });

  it("envio que falha NÃO sobrescreve um código válido nem cria lead órfão", async () => {
    const store = novaStore();
    const limiter = new MemoriaRateLimiter();
    // 1º envio OK → lead com código A
    const r1 = await solicitarAcesso(
      { store, email: new EmailFake(), limiter, brand, secret: SECRET },
      LeadInputSchema.parse(inputValido()),
      { ip: "5.5.5.5" },
    );
    expect(r1.status).toBe("enviado");
    const hashA = (await store.buscarPorEmail(EMAIL_TESTE))!.codigo.hash;
    // reenvio cujo e-mail FALHA → não pode persistir o código novo
    const emailQuebrado: ProvedorEmail = {
      enviarCodigo: async () => {
        throw new Error("provedor caiu");
      },
    };
    await expect(
      solicitarAcesso(
        { store, email: emailQuebrado, limiter, brand, secret: SECRET },
        LeadInputSchema.parse(inputValido()),
        { ip: "5.5.5.5" },
      ),
    ).rejects.toThrow();
    const hashDepois = (await store.buscarPorEmail(EMAIL_TESTE))!.codigo.hash;
    expect(hashDepois).toBe(hashA); // código válido preservado
    expect(await store.listar()).toHaveLength(1);
  });

  it("rate-limit: 4º envio em 30min barra; reenviar não duplica lead", async () => {
    const store = novaStore();
    const email = new EmailFake();
    const limiter = new MemoriaRateLimiter();
    const agora = new Date("2026-06-17T12:00:00.000Z");
    const chamar = () =>
      solicitarAcesso(
        { store, email, limiter, brand, secret: SECRET, agora },
        LeadInputSchema.parse(inputValido()),
        { ip: "9.9.9.9" },
      );
    expect((await chamar()).status).toBe("enviado");
    expect((await chamar()).status).toBe("enviado");
    expect((await chamar()).status).toBe("enviado");
    expect((await chamar()).status).toBe("limitado");
    expect(email.enviadas).toHaveLength(3); // o 4º não envia
    expect(await store.listar()).toHaveLength(1); // upsert: nunca duplica
  });

  it("usa a regra de 3 envios / 30 min", () => {
    expect(REGRA_ENVIO_CODIGO).toEqual({ max: 3, janelaMs: 30 * 60_000 });
  });
});

describe("ConsoleEmail (fallback dev) — sem PII em log", () => {
  it("não loga o e-mail completo, o telefone nem o código", async () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    await new ConsoleEmail().enviarCodigo(EMAIL_TESTE, "123456", brand);
    const logado = spy.mock.calls.map((c) => c.join(" ")).join("\n");
    expect(logado).not.toContain(EMAIL_TESTE);
    expect(logado).not.toContain("90000-0000");
    expect(logado).not.toContain("123456");
    expect(logado).toContain(mascararEmail(EMAIL_TESTE)); // só a forma mascarada
  });
});

describe("MemoriaRateLimiter (janela deslizante)", () => {
  it("barra ao estourar e libera após a janela", async () => {
    const rl = new MemoriaRateLimiter();
    const regra = { max: 2, janelaMs: 1000 };
    const t0 = new Date("2026-06-17T12:00:00.000Z");
    expect(await rl.permitir(["k"], regra, t0)).toBe(true);
    expect(await rl.permitir(["k"], regra, t0)).toBe(true);
    expect(await rl.permitir(["k"], regra, t0)).toBe(false);
    const depois = new Date(t0.getTime() + 1001);
    expect(await rl.permitir(["k"], regra, depois)).toBe(true);
  });

  it("barrar por uma chave NÃO consome o limite da outra", async () => {
    const rl = new MemoriaRateLimiter();
    const regra = { max: 1, janelaMs: 1000 };
    const t = new Date("2026-06-17T12:00:00.000Z");
    expect(await rl.permitir(["b"], regra, t)).toBe(true); // b atinge o limite
    expect(await rl.permitir(["a", "b"], regra, t)).toBe(false); // barrado por b
    expect(await rl.permitir(["a"], regra, t)).toBe(true); // 'a' não foi consumido
  });
});
