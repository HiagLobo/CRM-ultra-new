/**
 * Anti-robô do pedido de acesso (O7·S1): isca (honeypot) e Turnstile, no nível
 * do caso de uso — sem rede (o verificador é injetado).
 */
import { describe, it, expect, afterEach, vi } from "vitest";
import { MemoriaRateLimiter } from "../../lib/ratelimit";
import type { ResultadoDesafio } from "../../lib/turnstile";
import { brand } from "../../config/brand";
import { PedidoAcessoSchema } from "./schema";
import { solicitarAcesso, type DepsSolicitarAcesso } from "./solicitarAcesso";
import { EmailFake, capturarConsole, storesTemporarias } from "./apoioTestes";

const EMAIL = "corretor@exemplo.com";
const TELEFONE = "(11) 90000-0000";

const stores = storesTemporarias("leads-antirobo");
afterEach(async () => {
  await stores.limpar();
  vi.restoreAllMocks();
});

function pedido(over: Record<string, unknown> = {}) {
  return PedidoAcessoSchema.parse({ email: EMAIL, telefone: TELEFONE, creci: "SP 12345", consentimento: true, ...over });
}

function montarDeps(over: Partial<DepsSolicitarAcesso> = {}) {
  const deps: DepsSolicitarAcesso = {
    store: stores.nova(),
    email: new EmailFake(),
    limiter: new MemoriaRateLimiter(),
    brand,
    secret: "segredo-de-teste-1234567890",
    limiteEnviosDia: 90,
    ...over,
  };
  return { deps, email: deps.email as EmailFake };
}

/** Verificador falso: devolve a resposta escolhida e guarda os tokens recebidos. */
function verificador(resposta: ResultadoDesafio) {
  const tokens: (string | undefined)[] = [];
  const fn = vi.fn(async (token: string | undefined) => {
    tokens.push(token);
    return resposta;
  });
  return { fn, tokens };
}

describe("isca (honeypot)", () => {
  it("preenchida: sucesso falso, nada gravado, nada enviado, nenhuma vaga gasta", async () => {
    const { deps, email } = montarDeps();
    const permitirCada = vi.spyOn(deps.limiter, "permitirCada");

    const r = await solicitarAcesso(deps, pedido({ website: "https://spam.exemplo" }), { ip: "1.2.3.4" });

    expect(r).toEqual({ status: "robo" });
    expect(await deps.store.listar()).toHaveLength(0);
    expect(email.codigos).toHaveLength(0);
    expect(permitirCada).not.toHaveBeenCalled();
  });

  it("vazia (ou só espaço, ex.: autopreenchimento) segue o fluxo normal", async () => {
    const { deps } = montarDeps();
    expect((await solicitarAcesso(deps, pedido({ website: "" }), { ip: "1.2.3.4" })).status).toBe("enviado");
    expect((await solicitarAcesso(deps, pedido({ website: "  " }), { ip: "1.2.3.4" })).status).toBe("enviado");
  });

  it("a isca e o token nunca vão para o lead gravado", async () => {
    const { deps } = montarDeps();
    await solicitarAcesso(deps, pedido({ website: "", turnstileToken: "tok-123" }), { ip: "1.2.3.4" });
    const salvo = JSON.stringify(await deps.store.buscarPorEmail(EMAIL));
    expect(salvo).not.toContain("tok-123");
    expect(salvo).not.toContain("website");
  });
});

describe("Turnstile (opcional)", () => {
  it("sem as chaves no env (sem verificador) não exige token", async () => {
    const { deps } = montarDeps();
    expect((await solicitarAcesso(deps, pedido(), { ip: "1.2.3.4" })).status).toBe("enviado");
  });

  it("aprovado: segue o fluxo e o verificador recebe o token da tela", async () => {
    const { fn, tokens } = verificador("aprovado");
    const { deps } = montarDeps({ verificarHumano: fn });
    const r = await solicitarAcesso(deps, pedido({ turnstileToken: "tok-bom" }), { ip: "1.2.3.4" });
    expect(r.status).toBe("enviado");
    expect(tokens).toEqual(["tok-bom"]);
  });

  it("recusado: para antes de gravar, enviar ou gastar vaga do IP", async () => {
    const { fn } = verificador("recusado");
    const { deps, email } = montarDeps({ verificarHumano: fn });
    for (let i = 0; i < 15; i++) {
      expect(await solicitarAcesso(deps, pedido(), { ip: "7.7.7.7" })).toEqual({ status: "desafio_recusado" });
    }
    expect(await deps.store.listar()).toHaveLength(0);
    expect(email.codigos).toHaveLength(0);
    // robô barrado não esgota o IP de quem divide a rede com ele
    const humano = await solicitarAcesso({ ...deps, verificarHumano: verificador("aprovado").fn }, pedido(), {
      ip: "7.7.7.7",
    });
    expect(humano.status).toBe("enviado");
  });

  it("Cloudflare fora do ar: fecha a porta com resposta própria (não finge robô)", async () => {
    const { deps } = montarDeps({ verificarHumano: verificador("indisponivel").fn });
    expect(await solicitarAcesso(deps, pedido({ turnstileToken: "t" }), { ip: "1.2.3.4" })).toEqual({
      status: "desafio_indisponivel",
    });
    expect(await deps.store.listar()).toHaveLength(0);
  });
});

describe("PedidoAcessoSchema — campos anti-robô", () => {
  it("são opcionais (sem eles o pedido continua válido)", () => {
    expect(PedidoAcessoSchema.safeParse({ email: EMAIL, telefone: TELEFONE, creci: "SP 12345", consentimento: true }).success).toBe(true);
  });

  it("recusa token e isca gigantes (400 antes de qualquer lógica)", () => {
    const base = { email: EMAIL, telefone: TELEFONE, creci: "SP 12345", consentimento: true };
    expect(PedidoAcessoSchema.safeParse({ ...base, turnstileToken: "x".repeat(2049) }).success).toBe(false);
    expect(PedidoAcessoSchema.safeParse({ ...base, website: "x".repeat(501) }).success).toBe(false);
    expect(PedidoAcessoSchema.safeParse({ ...base, website: 123 }).success).toBe(false);
  });
});

describe("sem PII em log em nenhum caminho anti-robô", () => {
  it("isca, recusa e indisponibilidade não logam e-mail, telefone nem CRECI", async () => {
    const saida = capturarConsole();
    await solicitarAcesso(montarDeps().deps, pedido({ website: "x" }), { ip: "1.2.3.4" });
    await solicitarAcesso(montarDeps({ verificarHumano: verificador("recusado").fn }).deps, pedido(), { ip: "1.2.3.4" });
    await solicitarAcesso(montarDeps({ verificarHumano: verificador("indisponivel").fn }).deps, pedido(), {
      ip: "1.2.3.4",
    });
    for (const pii of [EMAIL, "90000-0000", "12345"]) expect(saida()).not.toContain(pii);
  });
});
