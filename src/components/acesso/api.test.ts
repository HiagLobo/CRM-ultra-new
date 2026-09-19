import { describe, it, expect, afterEach, vi } from "vitest";
import { solicitarAcesso, verificarCodigo } from "./api";

const DADOS = {
  email: "corretor@exemplo.com",
  telefone: "+5511900000000",
  creci: "SP 12345",
  consentimento: true,
} as const;

/** fetch falso: devolve status + corpo escolhidos e guarda o que foi enviado. */
function fetchFake(status: number, corpo: unknown, opts: { naoEhJson?: boolean } = {}) {
  const chamadas: { url: string; body: unknown }[] = [];
  const fake = vi.fn(async (url: string, init: RequestInit) => {
    chamadas.push({ url, body: JSON.parse(String(init.body)) });
    return {
      ok: status >= 200 && status < 300,
      status,
      json: async () => {
        if (opts.naoEhJson) throw new Error("não é json");
        return corpo;
      },
    } as unknown as Response;
  });
  vi.stubGlobal("fetch", fake);
  return chamadas;
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("solicitarAcesso (POST /api/lead)", () => {
  it("happy: 200 devolve enviado e repassa o codigoDev do fallback", async () => {
    const chamadas = fetchFake(200, { ok: true, codigoDev: "123456" });
    const r = await solicitarAcesso({ ...DADOS });
    expect(r).toEqual({ status: "enviado", codigoDev: "123456" });
    expect(chamadas[0]!.url).toBe("/api/lead");
    expect(chamadas[0]!.body).toEqual(DADOS); // envia o consentimento junto
  });

  it("sem codigoDev (produção) segue sendo sucesso", async () => {
    fetchFake(200, { ok: true });
    expect(await solicitarAcesso({ ...DADOS })).toEqual({ status: "enviado", codigoDev: undefined });
  });

  it("400 vira 'invalido' com os campos da API", async () => {
    fetchFake(400, { ok: false, erro: "dados inválidos", campos: { creci: ["CRECI inválido"] } });
    const r = await solicitarAcesso({ ...DADOS });
    expect(r.status).toBe("invalido");
    if (r.status !== "invalido") return;
    expect(r.campos?.creci).toEqual(["CRECI inválido"]);
  });

  it("429 vira 'limitado' com texto de espera", async () => {
    fetchFake(429, { ok: false, erro: "muitas solicitações" });
    const r = await solicitarAcesso({ ...DADOS });
    expect(r.status).toBe("limitado");
    expect(r.status === "limitado" && r.mensagem).toMatch(/aguarde/i);
  });

  it("500 e falha de rede viram erro com mensagem — nunca silêncio", async () => {
    fetchFake(500, { ok: false });
    expect((await solicitarAcesso({ ...DADOS })).status).toBe("erro");

    vi.stubGlobal("fetch", vi.fn(async () => {
      throw new Error("offline");
    }));
    const r = await solicitarAcesso({ ...DADOS });
    expect(r.status).toBe("erro");
    expect(r.status === "erro" && r.mensagem).toMatch(/conex/i);
  });

  it("resposta que não é JSON não quebra o fluxo", async () => {
    fetchFake(200, null, { naoEhJson: true });
    expect((await solicitarAcesso({ ...DADOS })).status).toBe("erro");
  });
});

describe("verificarCodigo (POST /api/lead/verify)", () => {
  it("happy: 200 devolve verificado", async () => {
    const chamadas = fetchFake(200, { ok: true });
    expect(await verificarCodigo(DADOS.email, "123456")).toEqual({ status: "verificado" });
    expect(chamadas[0]!.url).toBe("/api/lead/verify");
  });

  it("mapeia cada motivo do domínio, preservando a mensagem da API", async () => {
    const casos: [number, string][] = [
      [400, "codigo_invalido"],
      [410, "expirado"],
      [429, "tentativas_excedidas"],
      [429, "limitado"],
    ];
    for (const [status, motivo] of casos) {
      fetchFake(status, { ok: false, erro: motivo, mensagem: `texto de ${motivo}` });
      const r = await verificarCodigo(DADOS.email, "000000");
      expect(r).toEqual({ status: "falha", motivo, mensagem: `texto de ${motivo}` });
    }
  });

  it("erro de formato do código vira instrução clara", async () => {
    fetchFake(400, { ok: false, erro: "dados_invalidos", mensagem: "dados inválidos" });
    const r = await verificarCodigo(DADOS.email, "12");
    expect(r.status).toBe("invalido");
    expect(r.status === "invalido" && r.mensagem).toMatch(/6 números/);
  });

  it("500 vira erro genérico (não vaza detalhe do servidor)", async () => {
    fetchFake(500, { ok: false, erro: "falha_interna", mensagem: "falha ao processar verificação" });
    const r = await verificarCodigo(DADOS.email, "123456");
    expect(r.status).toBe("erro");
  });
});

describe("sem PII no console", () => {
  it("nenhum caminho loga e-mail, telefone, CRECI ou código", async () => {
    const logs: string[] = [];
    for (const nivel of ["log", "info", "warn", "error", "debug"] as const) {
      vi.spyOn(console, nivel).mockImplementation((...args: unknown[]) => {
        logs.push(args.map(String).join(" "));
      });
    }

    fetchFake(200, { ok: true, codigoDev: "123456" });
    await solicitarAcesso({ ...DADOS });
    fetchFake(400, { ok: false, erro: "codigo_invalido", mensagem: "código inválido" });
    await verificarCodigo(DADOS.email, "654321");
    vi.stubGlobal("fetch", vi.fn(async () => {
      throw new Error("offline");
    }));
    await solicitarAcesso({ ...DADOS });
    await verificarCodigo(DADOS.email, "654321");

    const saida = logs.join("\n");
    for (const pii of [DADOS.email, DADOS.telefone, DADOS.creci, "123456", "654321"]) {
      expect(saida).not.toContain(pii);
    }
  });
});
