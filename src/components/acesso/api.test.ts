import { describe, it, expect, afterEach, vi } from "vitest";
import { solicitarAcesso, verificarCodigo, MENSAGEM_SEM_CODIGO } from "./api";

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

describe("solicitarAcesso — O7·S1 (lead sem código e anti-robô)", () => {
  it("202 vira 'recebido_sem_codigo' com a mensagem honesta", async () => {
    fetchFake(202, { ok: true, status: "recebido_sem_codigo" });
    const r = await solicitarAcesso({ ...DADOS });
    expect(r).toEqual({ status: "recebido_sem_codigo", mensagem: MENSAGEM_SEM_CODIGO });
    expect(MENSAGEM_SEM_CODIGO).toMatch(/Recebemos seus dados/);
    expect(MENSAGEM_SEM_CODIGO).toMatch(/não saiu agora/);
  });

  it("manda o token do Turnstile e a isca quando existem; nada extra quando vazios", async () => {
    const chamadas = fetchFake(200, { ok: true, status: "enviado" });
    await solicitarAcesso({ ...DADOS }, { turnstileToken: "tok-1", website: "" });
    expect(chamadas[0]!.body).toEqual({ ...DADOS, turnstileToken: "tok-1" });

    await solicitarAcesso({ ...DADOS }, { website: "robô preencheu" });
    expect(chamadas[1]!.body).toEqual({ ...DADOS, website: "robô preencheu" });
  });

  it("anti-robô recusou (403) ou fora do ar (503): 'desafio' com mensagem própria", async () => {
    fetchFake(403, { ok: false, erro: "verificacao_humana" });
    const recusado = await solicitarAcesso({ ...DADOS });
    expect(recusado.status).toBe("desafio");
    expect(recusado.status === "desafio" && recusado.mensagem).toMatch(/pessoa/);

    fetchFake(503, { ok: false, erro: "verificacao_indisponivel" });
    const fora = await solicitarAcesso({ ...DADOS });
    expect(fora.status).toBe("desafio");
    expect(fora.status === "desafio" && fora.mensagem).toMatch(/fora do ar/);
  });

  it("travou sem gravar (anti-robô fora do ar, 500, rede): a tela oferece o WhatsApp; recusado não", async () => {
    fetchFake(503, { ok: false, erro: "verificacao_indisponivel" });
    expect(await solicitarAcesso({ ...DADOS })).toMatchObject({ status: "desafio", whatsapp: true });
    fetchFake(403, { ok: false, erro: "verificacao_humana" });
    expect(await solicitarAcesso({ ...DADOS })).not.toHaveProperty("whatsapp");
    fetchFake(500, { ok: false });
    expect(await solicitarAcesso({ ...DADOS })).toMatchObject({ status: "erro", whatsapp: true });
    vi.stubGlobal("fetch", vi.fn(async () => {
      throw new Error("offline");
    }));
    expect(await solicitarAcesso({ ...DADOS })).toMatchObject({ status: "erro", whatsapp: true });
  });

  it("503 que não é do anti-robô (ex.: plataforma) segue sendo erro genérico", async () => {
    fetchFake(503, null, { naoEhJson: true });
    expect((await solicitarAcesso({ ...DADOS })).status).toBe("erro");
  });

  it("origem da campanha (O8·S3): vai quando existe; campo vazio é omitido, nunca \"\"", async () => {
    const chamadas = fetchFake(200, { ok: true, status: "enviado" });
    await solicitarAcesso({ ...DADOS, origem: { utm: "instagram.cpc.set", ref: "l.instagram.com" } });
    expect(chamadas[0]!.body).toEqual({ ...DADOS, origem: { utm: "instagram.cpc.set", ref: "l.instagram.com" } });

    await solicitarAcesso({ ...DADOS, origem: { utm: "google", ref: "" } });
    expect(chamadas[1]!.body).toEqual({ ...DADOS, origem: { utm: "google" } });

    await solicitarAcesso({ ...DADOS, origem: { utm: "  ", ref: "💥" } });
    expect(chamadas[2]!.body).not.toHaveProperty("origem");

    await solicitarAcesso({ ...DADOS, origem: { utm: "x".repeat(300) } });
    expect((chamadas[3]!.body as { origem: { utm: string } }).origem.utm).toHaveLength(100);
  });

  it("429 explica que o limite pode ser da rede, sem culpar a pessoa", async () => {
    fetchFake(429, { ok: false });
    const r = await solicitarAcesso({ ...DADOS });
    expect(r.status === "limitado" && r.mensagem).toMatch(/rede/);
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
