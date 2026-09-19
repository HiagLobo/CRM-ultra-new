/**
 * Verificação do Turnstile no servidor — com `fetch` falso, sem rede.
 * O que importa: aprovado só com `success: true`; robô ≠ Cloudflare fora do ar ≠
 * segredo errado; token e segredo nunca vão para log.
 */
import { describe, it, expect, afterEach, vi } from "vitest";
import { criarVerificadorTurnstile, hostnameAceito, URL_SITEVERIFY } from "./turnstile";

const SEGREDO = "segredo-turnstile-de-teste";
const TOKEN = "token-do-widget-de-teste";

afterEach(() => vi.restoreAllMocks());

/** fetch falso: devolve status + corpo escolhidos e guarda a requisição. */
function fetchFalso(status: number, corpo: unknown, opts: { naoEhJson?: boolean } = {}) {
  const chamadas: { url: string; init: RequestInit }[] = [];
  const fn = vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
    chamadas.push({ url: String(url), init: init ?? {} });
    return {
      ok: status >= 200 && status < 300,
      status,
      json: async () => {
        if (opts.naoEhJson) throw new SyntaxError("não é json");
        return corpo;
      },
    } as unknown as Response;
  });
  return { fn: fn as unknown as typeof fetch, chamadas, espiao: fn };
}

function capturarLogs() {
  const linhas: string[] = [];
  for (const nivel of ["log", "warn", "error"] as const) {
    vi.spyOn(console, nivel).mockImplementation((...a: unknown[]) => void linhas.push(a.map(String).join(" ")));
  }
  return () => linhas.join("\n");
}

describe("criarVerificadorTurnstile", () => {
  it("aprovado: consulta o siteverify com segredo + token (sem o IP do visitante)", async () => {
    const { fn, chamadas } = fetchFalso(200, { success: true, "error-codes": [] });
    const verificar = criarVerificadorTurnstile({ secret: SEGREDO, fetch: fn });

    expect(await verificar(TOKEN)).toBe("aprovado");
    expect(chamadas).toHaveLength(1);
    expect(chamadas[0]!.url).toBe(URL_SITEVERIFY);
    expect(chamadas[0]!.init.method).toBe("POST");
    const corpo = new URLSearchParams(String(chamadas[0]!.init.body));
    expect(corpo.get("secret")).toBe(SEGREDO);
    expect(corpo.get("response")).toBe(TOKEN);
    expect(corpo.has("remoteip")).toBe(false);
  });

  it("sem token: recusa sem nem chamar a Cloudflare", async () => {
    const { fn, espiao } = fetchFalso(200, { success: true });
    const verificar = criarVerificadorTurnstile({ secret: SEGREDO, fetch: fn });
    expect(await verificar(undefined)).toBe("recusado");
    expect(await verificar("")).toBe("recusado");
    expect(espiao).not.toHaveBeenCalled();
  });

  it("token inválido ou reusado: recusado", async () => {
    capturarLogs();
    for (const codigo of ["invalid-input-response", "timeout-or-duplicate"]) {
      const { fn } = fetchFalso(200, { success: false, "error-codes": [codigo] });
      expect(await criarVerificadorTurnstile({ secret: SEGREDO, fetch: fn })(TOKEN)).toBe("recusado");
    }
  });

  it("segredo errado é erro NOSSO: 'indisponivel' + log apontando a variável", async () => {
    const saida = capturarLogs();
    const { fn } = fetchFalso(200, { success: false, "error-codes": ["invalid-input-secret"] });
    expect(await criarVerificadorTurnstile({ secret: SEGREDO, fetch: fn })(TOKEN)).toBe("indisponivel");
    expect(saida()).toContain("TURNSTILE_SECRET_KEY");
  });

  it("Cloudflare fora do ar (rede, prazo, HTTP 5xx, resposta estranha): indisponivel", async () => {
    capturarLogs();
    const semRede = vi.fn(async () => {
      throw new TypeError("fetch failed");
    }) as unknown as typeof fetch;
    expect(await criarVerificadorTurnstile({ secret: SEGREDO, fetch: semRede })(TOKEN)).toBe("indisponivel");

    const prazo = vi.fn(async () => {
      throw Object.assign(new Error("tempo esgotado"), { name: "TimeoutError" });
    }) as unknown as typeof fetch;
    expect(await criarVerificadorTurnstile({ secret: SEGREDO, fetch: prazo })(TOKEN)).toBe("indisponivel");

    expect(await criarVerificadorTurnstile({ secret: SEGREDO, fetch: fetchFalso(502, {}).fn })(TOKEN)).toBe(
      "indisponivel",
    );
    const naoJson = fetchFalso(200, null, { naoEhJson: true }).fn;
    expect(await criarVerificadorTurnstile({ secret: SEGREDO, fetch: naoJson })(TOKEN)).toBe("indisponivel");
    const semSuccess = fetchFalso(200, { ok: true }).fn; // fora do formato: não conta como aprovado
    expect(await criarVerificadorTurnstile({ secret: SEGREDO, fetch: semSuccess })(TOKEN)).toBe("indisponivel");
  });

  it("nenhum caminho loga o token ou o segredo", async () => {
    const saida = capturarLogs();
    const respostas: [number, unknown][] = [
      [200, { success: false, "error-codes": ["invalid-input-response"] }],
      [200, { success: false, "error-codes": ["invalid-input-secret"] }],
      [500, {}],
    ];
    for (const [status, corpo] of respostas) {
      await criarVerificadorTurnstile({ secret: SEGREDO, fetch: fetchFalso(status, corpo).fn })(TOKEN);
    }
    expect(saida()).not.toContain(TOKEN);
    expect(saida()).not.toContain(SEGREDO);
  });
});

describe("hostname do token (produção)", () => {
  const DOMINIO = "exemplo.com.br";
  const aprovadoEm = (hostname?: string) =>
    fetchFalso(200, { success: true, "error-codes": [], ...(hostname ? { hostname } : {}) }).fn;

  it("aceita o domínio da marca, subdomínios e o endereço .vercel.app do projeto", async () => {
    for (const host of ["exemplo.com.br", "www.exemplo.com.br", "WWW.Exemplo.com.br", "crm-ultra.vercel.app"]) {
      const verificar = criarVerificadorTurnstile({ secret: SEGREDO, fetch: aprovadoEm(host), dominio: DOMINIO });
      expect(await verificar(TOKEN), host).toBe("aprovado");
    }
  });

  it("token emitido em outro lugar (ex.: localhost liberado no widget para teste) é recusado", async () => {
    const saida = capturarLogs();
    for (const host of ["localhost", "exemplo.com.br.golpe.com", "outroexemplo.com.br", undefined]) {
      const verificar = criarVerificadorTurnstile({ secret: SEGREDO, fetch: aprovadoEm(host), dominio: DOMINIO });
      expect(await verificar(TOKEN), String(host)).toBe("recusado");
    }
    expect(saida()).toContain("[turnstile] token emitido fora do domínio");
    expect(saida()).not.toContain(TOKEN);
  });

  it("sem domínio configurado (dev) não confere o hostname", async () => {
    const verificar = criarVerificadorTurnstile({ secret: SEGREDO, fetch: aprovadoEm("localhost") });
    expect(await verificar(TOKEN)).toBe("aprovado");
  });

  it("hostnameAceito não confunde sufixo solto com subdomínio", () => {
    expect(hostnameAceito("golpeexemplo.com.br", DOMINIO)).toBe(false);
    expect(hostnameAceito("a.b.exemplo.com.br", DOMINIO)).toBe(true);
  });
});
