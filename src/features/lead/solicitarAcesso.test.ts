import { describe, it, expect, afterEach, vi } from "vitest";
import { MemoriaRateLimiter } from "../../lib/ratelimit";
import { PedidoAcessoSchema } from "./schema";
import { verificarCodigo } from "./verificacao";
import {
  solicitarAcesso,
  REGRA_ENVIO_POR_EMAIL,
  REGRA_ENVIO_POR_IP,
  type DepsSolicitarAcesso,
} from "./solicitarAcesso";
import { SECRET_TESTE as SECRET, dadosCadastro, depsSolicitar, storesTemporarias } from "./apoioTestes";

const EMAIL_TESTE = "corretor@exemplo.com";
const T0 = new Date("2026-06-17T12:00:00.000Z");

const stores = storesTemporarias("leads-solicitar");
afterEach(async () => {
  await stores.limpar();
  vi.restoreAllMocks();
});

function pedido(over: Record<string, unknown> = {}) {
  return PedidoAcessoSchema.parse(dadosCadastro({ email: "Corretor@Exemplo.com", ...over }));
}

/** Corretor n: e-mail, WhatsApp e CRECI só dele (O9 barra WhatsApp e CRECI repetidos). */
const corretor = (n: number, prefixo = "c") =>
  pedido({ email: `${prefixo}${n}@exemplo.com`, telefone: `(11) 9${1000 + n}-${String(n).padStart(4, "0")}`, creci: `SP ${20000 + n}` });

const montarDeps = (over: Partial<DepsSolicitarAcesso> = {}) => depsSolicitar(stores.nova(), { agora: T0, ...over });

describe("solicitarAcesso — happy path", () => {
  it("cria lead, carimba consentimento e envia o código", async () => {
    const { deps, email } = montarDeps();
    const r = await solicitarAcesso(deps, pedido(), { ip: "1.2.3.4" });
    expect(r.status).toBe("enviado");
    if (r.status !== "enviado") return;
    expect(r.novo).toBe(true);
    expect(r.codigo).toMatch(/^\d{6}$/);
    expect(email.codigos).toEqual([{ para: EMAIL_TESTE, codigo: r.codigo }]);
    const persistido = await deps.store.buscarPorEmail(EMAIL_TESTE);
    expect(persistido?.consentimento.ip).toBe("1.2.3.4");
    expect(persistido?.consentimento.texto.length).toBeGreaterThan(20);
    expect(persistido?.codigo.hash).toMatch(/^[a-f0-9]{64}$/);
  });
});

describe("lead não se perde quando o e-mail não sai (O7·S1)", () => {
  it("envio que falha GRAVA o lead novo, com status novo e código inutilizado", async () => {
    const { deps, email } = montarDeps();
    email.falharCodigo = new Error(`provedor caiu ao enviar para ${EMAIL_TESTE}`);

    const r = await solicitarAcesso(deps, pedido(), { ip: "5.5.5.5" });
    expect(r).toEqual({ status: "recebido_sem_codigo", motivo: "falha_envio", causa: "email:Error" });
    // a causa vai para o log: só o tipo do erro, nunca a mensagem (que tinha o e-mail)
    expect(r.status === "recebido_sem_codigo" && r.causa).not.toContain(EMAIL_TESTE);

    const salvo = await deps.store.buscarPorEmail(EMAIL_TESTE);
    expect(salvo?.status).toBe("novo");
    expect(salvo?.telefone).toBe("+5511900000000");
    expect(salvo?.creci).toBe("SP 12345");
    expect(salvo?.consentimento.ip).toBe("5.5.5.5");
    expect(salvo?.codigo.hash).toBe(""); // SEM_CODIGO: nenhum código confere
    const tentativa = await verificarCodigo(
      { store: deps.store, limiter: new MemoriaRateLimiter(), secret: SECRET, agora: T0 },
      { email: EMAIL_TESTE, codigo: "000000" },
      { ip: "5.5.5.5" },
    );
    expect(tentativa).toEqual({ status: "falha", motivo: "codigo_invalido" });
  });

  it("falha num lead existente NÃO sobrescreve o código válido nem grava contato — ele segue valendo", async () => {
    const { deps, email } = montarDeps();
    const r1 = await solicitarAcesso(deps, pedido(), { ip: "5.5.5.5" });
    if (r1.status !== "enviado") throw new Error("pré-condição: 1º envio sai");
    const hashA = (await deps.store.buscarPorEmail(EMAIL_TESTE))!.codigo.hash;

    email.falharCodigo = new Error("provedor caiu");
    const r2 = await solicitarAcesso(deps, pedido({ telefone: "(21) 98888-7777" }), { ip: "5.5.5.5" });
    expect(r2.status).toBe("recebido_sem_codigo");

    const salvo = (await deps.store.buscarPorEmail(EMAIL_TESTE))!;
    expect(salvo.codigo.hash).toBe(hashA); // código anterior preservado
    expect(salvo.telefone).toBe("+5511900000000"); // O9: sem provar o e-mail, o contato não muda
    expect(await deps.store.listar()).toHaveLength(1); // upsert, sem duplicar
    const v = await verificarCodigo(
      { store: deps.store, limiter: new MemoriaRateLimiter(), secret: SECRET, agora: T0 },
      { email: EMAIL_TESTE, codigo: r1.codigo },
      { ip: "5.5.5.5" },
    );
    expect(v.status).toBe("verificado");
  });

  it("falha num lead já verificado não rebaixa o status", async () => {
    const { deps, email } = montarDeps();
    const r1 = await solicitarAcesso(deps, pedido(), { ip: "5.5.5.5" });
    if (r1.status !== "enviado") throw new Error("pré-condição");
    const lim = new MemoriaRateLimiter();
    await verificarCodigo({ store: deps.store, limiter: lim, secret: SECRET, agora: T0 }, { email: EMAIL_TESTE, codigo: r1.codigo }, { ip: "5.5.5.5" });

    email.falharCodigo = new Error("provedor caiu");
    await solicitarAcesso(deps, pedido(), { ip: "5.5.5.5" });
    const salvo = (await deps.store.buscarPorEmail(EMAIL_TESTE))!;
    expect(salvo.status).toBe("novo"); // etapa intacta (a verificação não a muda)
    expect(salvo.verificadoEm).toBe(T0.toISOString());
  });
});

describe("teto global diário (LIMITE_ENVIOS_DIA)", () => {
  it("estourou: não envia, mas grava o lead sem código", async () => {
    const { deps, email } = montarDeps({ limiteEnviosDia: 2 });
    const pedir = (n: number) => solicitarAcesso(deps, corretor(n, "corretor"), { ip: `10.0.0.${n}` });

    expect((await pedir(1)).status).toBe("enviado");
    expect((await pedir(2)).status).toBe("enviado");
    expect(await pedir(3)).toEqual({ status: "recebido_sem_codigo", motivo: "teto_diario", causa: "teto_diario" });

    expect(email.codigos).toHaveLength(2); // o 3º não gastou cota do provedor
    expect(await deps.store.listar()).toHaveLength(3); // mas o contato ficou
    expect((await deps.store.buscarPorEmail("corretor3@exemplo.com"))?.codigo.hash).toBe("");
  });

  it("a janela é de 24h: no dia seguinte volta a enviar", async () => {
    const { deps } = montarDeps({ limiteEnviosDia: 1 });
    const pedir = (n: number, agora: Date) => solicitarAcesso({ ...deps, agora }, corretor(n), { ip: `10.0.1.${n}` });

    expect((await pedir(1, T0)).status).toBe("enviado");
    expect((await pedir(2, new Date(T0.getTime() + 23 * 3_600_000))).status).toBe("recebido_sem_codigo");
    expect((await pedir(3, new Date(T0.getTime() + 24 * 3_600_000 + 1))).status).toBe("enviado");
  });
});

describe("rate-limit por pessoa: e-mail 3/30 min, IP 10/30 min", () => {
  it("usa as regras separadas", () => {
    expect(REGRA_ENVIO_POR_EMAIL).toEqual({ max: 3, janelaMs: 30 * 60_000 });
    expect(REGRA_ENVIO_POR_IP).toEqual({ max: 10, janelaMs: 30 * 60_000 });
  });

  it("mesmo e-mail: o 4º em 30 min barra; reenviar não duplica lead", async () => {
    const { deps, email } = montarDeps();
    const chamar = () => solicitarAcesso(deps, pedido(), { ip: "9.9.9.9" });
    for (let i = 0; i < 3; i++) expect((await chamar()).status).toBe("enviado");
    expect((await chamar()).status).toBe("limitado");
    expect(email.codigos).toHaveLength(3);
    expect(await deps.store.listar()).toHaveLength(1);
  });

  it("mesmo IP (escritório/CGNAT): 10 corretores passam, o 11º barra; outro IP segue", async () => {
    const { deps } = montarDeps();
    const pedir = (n: number, ip: string) => solicitarAcesso(deps, corretor(n), { ip });
    for (let n = 1; n <= 10; n++) expect((await pedir(n, "200.1.1.1")).status).toBe("enviado");
    expect((await pedir(11, "200.1.1.1")).status).toBe("limitado");
    expect((await pedir(11, "200.2.2.2")).status).toBe("enviado");
  });

  it("barrado pelo e-mail NÃO gasta a vaga do IP (checagem atômica)", async () => {
    const { deps } = montarDeps();
    const ip = "200.3.3.3";
    for (let i = 0; i < 3; i++) await solicitarAcesso(deps, pedido(), { ip });
    expect((await solicitarAcesso(deps, pedido(), { ip })).status).toBe("limitado"); // pelo e-mail
    // o IP gastou só 3 das 10 vagas: mais 7 corretores diferentes passam
    for (let n = 1; n <= 7; n++) {
      expect((await solicitarAcesso(deps, corretor(n, "o"), { ip })).status).toBe("enviado");
    }
    expect((await solicitarAcesso(deps, corretor(8, "o"), { ip })).status).toBe("limitado");
  });
});
