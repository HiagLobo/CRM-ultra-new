/**
 * Emenda do contrato da O9 (achado da revisão): e-mail que JÁ tem lead e o
 * código não sai (provedor fora, falha/prazo ou teto) → `envio_indisponivel`
 * (a rota responde 503) e NADA é gravado. `recebido_sem_codigo` (202) é só do
 * e-mail NOVO. E a corrida de criação: o e-mail criado por outro pedido nesse
 * meio conta como existente (`novo: false`) e, sem envio, também não grava nada.
 */
import { describe, it, expect, afterEach, vi } from "vitest";
import { ErroConfiguracao } from "../../lib/erros";
import { PedidoAcessoSchema } from "./schema";
import { solicitarAcesso, type DepsSolicitarAcesso } from "./solicitarAcesso";
import { hashCodigo } from "./lead";
import { dadosCadastro, depsSolicitar, leadCru, SECRET_TESTE, storesTemporarias } from "./apoioTestes";

const T0 = new Date("2026-06-17T12:00:00.000Z");
const IP = "203.0.113.80";
const EMAIL = "corretor@exemplo.com";

const stores = storesTemporarias("leads-envio-indisponivel");
afterEach(async () => {
  await stores.limpar();
  vi.restoreAllMocks();
});

const pedido = (over: Record<string, unknown> = {}) => PedidoAcessoSchema.parse(dadosCadastro(over));

/** Deps com um lead que já tem este e-mail (verificado, em negociação, com código anterior). */
async function comLeadExistente(over: Partial<DepsSolicitarAcesso> = {}) {
  const r = depsSolicitar(stores.nova(), { agora: T0, ...over });
  await r.deps.store.criar(leadCru({ status: "negociacao", verificadoEm: "2026-06-01T00:00:00.000Z" }));
  return { ...r, antes: (await r.deps.store.buscarPorEmail(EMAIL))! };
}

describe("e-mail que já existe e o código não sai → envio_indisponivel, nada gravado", () => {
  it("provedor recusou", async () => {
    const { deps, email, antes } = await comLeadExistente();
    email.falharCodigo = new Error(`recusado para ${EMAIL}`);
    const r = await solicitarAcesso(deps, pedido({ telefone: "(21) 98888-7777" }), { ip: IP });
    expect(r).toEqual({ status: "envio_indisponivel", motivo: "falha_envio", causa: "email:Error" });
    expect(await deps.store.buscarPorEmail(EMAIL)).toEqual(antes);
    expect(await deps.store.listar()).toHaveLength(1);
  });

  it("provedor nem sobe (config) e provedor pendurado (prazo)", async () => {
    const quebrado = await comLeadExistente({
      email: () => {
        throw new ErroConfiguracao("RESEND_API_KEY", "RESEND_API_KEY é obrigatória em produção");
      },
    });
    expect(await solicitarAcesso(quebrado.deps, pedido(), { ip: IP })).toEqual({
      status: "envio_indisponivel",
      motivo: "falha_envio",
      causa: "config:RESEND_API_KEY",
    });
    expect(await quebrado.deps.store.buscarPorEmail(EMAIL)).toEqual(quebrado.antes);

    const pendurado = await comLeadExistente({ prazoEnvioMs: 5 });
    pendurado.email.enviarCodigo = () => new Promise<void>(() => undefined);
    expect(await solicitarAcesso(pendurado.deps, pedido(), { ip: IP })).toEqual({
      status: "envio_indisponivel",
      motivo: "falha_envio",
      causa: "email:PrazoEsgotado",
    });
    expect(await pendurado.deps.store.buscarPorEmail(EMAIL)).toEqual(pendurado.antes);
  });

  it("teto diário estourado", async () => {
    const { deps, email, antes } = await comLeadExistente({ limiteEnviosDia: 1 });
    const outro = pedido({ email: "outro@exemplo.com", telefone: "(81) 97777-0001", creci: "PE 999" });
    expect((await solicitarAcesso(deps, outro, { ip: IP })).status).toBe("enviado"); // gasta a vaga do dia

    const r = await solicitarAcesso(deps, pedido(), { ip: IP });
    expect(r).toEqual({ status: "envio_indisponivel", motivo: "teto_diario", causa: "teto_diario" });
    expect(await deps.store.buscarPorEmail(EMAIL)).toEqual(antes);
    expect(email.codigos.map((c) => c.para)).toEqual(["outro@exemplo.com"]);
  });

  it("e-mail NOVO continua como antes: 202 recebido_sem_codigo, lead gravado sem código", async () => {
    const { deps, email } = depsSolicitar(stores.nova(), { agora: T0 });
    email.falharCodigo = new Error("provedor caiu");
    expect(await solicitarAcesso(deps, pedido(), { ip: IP })).toEqual({
      status: "recebido_sem_codigo",
      motivo: "falha_envio",
      causa: "email:Error",
    });
    expect(await deps.store.buscarPorEmail(EMAIL)).toMatchObject({ nome: "Corretor Exemplo", codigo: { hash: "" } });
  });
});

describe("corrida de criação: outro pedido cria o mesmo e-mail logo antes do nosso criar", () => {
  /** O `criar` deste pedido perde a corrida: o outro lead (mesmo e-mail) é gravado primeiro. */
  function perderCorrida(deps: DepsSolicitarAcesso) {
    const criar = deps.store.criar.bind(deps.store);
    vi.spyOn(deps.store, "criar").mockImplementationOnce(async (lead) => {
      await criar(leadCru({ id: "do-outro-pedido", email: lead.email, telefone: "+5581900000009", creci: "PE 55555" }));
      return criar(lead);
    });
  }

  it("e-mail saiu: grava só o código por cima e responde novo=false (a rota diz existente: true)", async () => {
    const { deps } = depsSolicitar(stores.nova(), { agora: T0 });
    perderCorrida(deps);
    const r = await solicitarAcesso(deps, pedido(), { ip: IP });
    expect(r).toMatchObject({ status: "enviado", novo: false });
    if (r.status !== "enviado") return;
    const salvo = (await deps.store.buscarPorEmail(EMAIL))!;
    expect(salvo).toMatchObject({ id: "do-outro-pedido", telefone: "+5581900000009", creci: "PE 55555" });
    expect(salvo.codigo.hash).toBe(hashCodigo(r.codigo, SECRET_TESTE));
    expect(await deps.store.listar()).toHaveLength(1);
  });

  it("e-mail não saiu: nada gravado → envio_indisponivel (não é \"recebemos seus dados\")", async () => {
    const { deps, email } = depsSolicitar(stores.nova(), { agora: T0 });
    email.falharCodigo = new Error("provedor caiu");
    perderCorrida(deps);
    const r = await solicitarAcesso(deps, pedido(), { ip: IP });
    expect(r).toEqual({ status: "envio_indisponivel", motivo: "falha_envio", causa: "email:Error" });
    expect(await deps.store.listar()).toEqual([
      leadCru({ id: "do-outro-pedido", email: EMAIL, telefone: "+5581900000009", creci: "PE 55555" }),
    ]);
  });
});
