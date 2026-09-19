/**
 * "Já tenho cadastro" (O9·S1) no caso de uso `entrar`: achou → código; não
 * achou → sem_cadastro; robô, limite, provedor fora e teto — tudo sem gravar
 * nada além do código. Mesmas chaves de limite do cadastro.
 */
import { describe, it, expect, afterEach, vi } from "vitest";
import { MemoriaRateLimiter } from "../../lib/ratelimit";
import { ErroConfiguracao } from "../../lib/erros";
import type { ResultadoDesafio } from "../../lib/turnstile";
import { EntrarSchema, PedidoAcessoSchema } from "./schema";
import { entrar } from "./entrar";
import { solicitarAcesso, type DepsSolicitarAcesso } from "./solicitarAcesso";
import { verificarCodigo } from "./verificacao";
import { hashCodigo } from "./lead";
import { capturarConsole, dadosCadastro, depsSolicitar, leadCru, SECRET_TESTE, storesTemporarias } from "./apoioTestes";

const T0 = new Date("2026-06-17T12:00:00.000Z");
const IP = "203.0.113.40";
const EMAIL = "corretor@exemplo.com";

const stores = storesTemporarias("leads-entrar");
afterEach(async () => {
  await stores.limpar();
  vi.restoreAllMocks();
});

const pedido = (over: Record<string, unknown> = {}) => EntrarSchema.parse({ email: " Corretor@Exemplo.com ", ...over });

/** Deps com um lead já cadastrado (verificado, na etapa "negociacao"). */
async function comLead(over: Partial<DepsSolicitarAcesso> = {}) {
  const r = depsSolicitar(stores.nova(), { agora: T0, ...over });
  await r.deps.store.criar(leadCru({ status: "negociacao", verificadoEm: "2026-06-01T00:00:00.000Z" }));
  return r;
}

describe("entrar — achou", () => {
  it("manda o código e grava SÓ o código (etapa, carimbo e contato intactos)", async () => {
    const { deps, email } = await comLead();
    const antes = (await deps.store.buscarPorId("1"))!;
    const r = await entrar(deps, pedido(), { ip: IP });
    expect(r).toMatchObject({ status: "enviado" });
    if (r.status !== "enviado") return;
    expect(email.codigos).toEqual([{ para: EMAIL, codigo: r.codigo }]);

    const depois = (await deps.store.buscarPorId("1"))!;
    expect(depois).toEqual({ ...antes, codigo: depois.codigo, atualizadoEm: T0.toISOString() });
    expect(depois.codigo).toMatchObject({ hash: hashCodigo(r.codigo, SECRET_TESTE), tentativas: 0 });
  });

  it("o código libera o demo no verify (reverificação: não re-carimba)", async () => {
    const { deps } = await comLead();
    const r = await entrar(deps, pedido(), { ip: IP });
    if (r.status !== "enviado") throw new Error("esperava enviado");
    const v = await verificarCodigo(
      { store: deps.store, limiter: new MemoriaRateLimiter(), secret: SECRET_TESTE, agora: T0 },
      { email: EMAIL, codigo: r.codigo },
      { ip: IP },
    );
    expect(v).toEqual({ status: "verificado", email: EMAIL, jaVerificado: true });
  });
});

describe("entrar — não achou, robô, limite", () => {
  it("e-mail sem cadastro → sem_cadastro, nada enviado nem criado", async () => {
    const { deps, email } = await comLead();
    expect(await entrar(deps, pedido({ email: "ninguem@exemplo.com" }), { ip: IP })).toEqual({ status: "sem_cadastro" });
    expect(email.codigos).toHaveLength(0);
    expect(await deps.store.listar()).toHaveLength(1);
  });

  it("isca preenchida → robô: nada consultado, nada enviado, nenhuma vaga gasta", async () => {
    const { deps, email } = await comLead();
    const buscar = vi.spyOn(deps.store, "buscarPorEmail");
    const permitirCada = vi.spyOn(deps.limiter, "permitirCada");
    expect(await entrar(deps, pedido({ website: "https://spam.exemplo" }), { ip: IP })).toEqual({ status: "robo" });
    expect(buscar).not.toHaveBeenCalled();
    expect(permitirCada).not.toHaveBeenCalled();
    expect(email.codigos).toHaveLength(0);
  });

  it("Turnstile recusou ou está fora → para antes do limite e da busca", async () => {
    for (const [desafio, status] of [["recusado", "desafio_recusado"], ["indisponivel", "desafio_indisponivel"]] as const) {
      const { deps } = await comLead({ verificarHumano: async (): Promise<ResultadoDesafio> => desafio });
      const buscar = vi.spyOn(deps.store, "buscarPorEmail");
      expect(await entrar(deps, pedido({ turnstileToken: "tok" }), { ip: IP })).toEqual({ status });
      expect(buscar).not.toHaveBeenCalled();
    }
  });

  it("a busca vem DEPOIS do limite: e-mails inexistentes gastam a vaga do IP (10/30 min)", async () => {
    const { deps } = await comLead();
    for (let n = 1; n <= 10; n++) {
      expect(await entrar(deps, pedido({ email: `x${n}@exemplo.com` }), { ip: IP })).toEqual({ status: "sem_cadastro" });
    }
    expect(await entrar(deps, pedido(), { ip: IP })).toEqual({ status: "limitado" });
  });

  it("mesmas chaves do cadastro: 3 pedidos de acesso com o e-mail esgotam o 'entrar' dele", async () => {
    const { deps } = await comLead();
    const cadastro = PedidoAcessoSchema.parse(dadosCadastro());
    for (let i = 0; i < 3; i++) expect((await solicitarAcesso(deps, cadastro, { ip: `10.1.1.${i}` })).status).toBe("enviado");
    expect(await entrar(deps, pedido(), { ip: "10.1.1.9" })).toEqual({ status: "limitado" });
  });
});

describe("entrar — o e-mail não sai (nada é gravado; o código anterior segue valendo)", () => {
  it("provedor nem sobe → envio_indisponivel com config:VAR", async () => {
    const { deps } = await comLead({
      email: () => {
        throw new ErroConfiguracao("RESEND_API_KEY", "RESEND_API_KEY é obrigatória em produção");
      },
    });
    const antes = (await deps.store.buscarPorId("1"))!;
    expect(await entrar(deps, pedido(), { ip: IP })).toEqual({
      status: "envio_indisponivel",
      motivo: "falha_envio",
      causa: "config:RESEND_API_KEY",
    });
    expect(await deps.store.buscarPorId("1")).toEqual(antes);
  });

  it("provedor recusa ou trava → envio_indisponivel, sem o destinatário na causa", async () => {
    const { deps, email } = await comLead({ prazoEnvioMs: 5 });
    email.falharCodigo = new Error(`recusado para ${EMAIL}`);
    expect(await entrar(deps, pedido(), { ip: IP })).toMatchObject({ status: "envio_indisponivel", causa: "email:Error" });

    email.falharCodigo = undefined;
    email.enviarCodigo = () => new Promise<void>(() => undefined);
    expect(await entrar(deps, pedido(), { ip: "10.0.0.2" })).toMatchObject({ causa: "email:PrazoEsgotado" });
  });

  it("teto diário estourado → envio_indisponivel (teto_diario), nada enviado", async () => {
    const { deps, email } = await comLead({ limiteEnviosDia: 1 });
    expect((await entrar(deps, pedido(), { ip: IP })).status).toBe("enviado");
    expect(await entrar(deps, pedido(), { ip: "10.0.0.3" })).toEqual({
      status: "envio_indisponivel",
      motivo: "teto_diario",
      causa: "teto_diario",
    });
    expect(email.codigos).toHaveLength(1);
  });

  it("nenhum caminho loga o e-mail", async () => {
    const saida = capturarConsole();
    const { deps, email } = await comLead();
    await entrar(deps, pedido(), { ip: IP });
    await entrar(deps, pedido({ email: "ninguem@exemplo.com" }), { ip: IP });
    email.falharCodigo = new Error(`recusado para ${EMAIL}`);
    await entrar(deps, pedido(), { ip: IP });
    expect(saida()).not.toContain("exemplo.com");
  });
});
