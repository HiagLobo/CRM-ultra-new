/**
 * Correções da revisão da O7·S1 — o lead não se perde nem quando o provedor de
 * e-mail nem sobe ou trava, e gravar o contato não desfaz uma verificação que
 * aconteceu durante o envio do e-mail.
 */
import { describe, it, expect, afterEach, vi } from "vitest";
import { MemoriaRateLimiter } from "../../lib/ratelimit";
import { ErroConfiguracao } from "../../lib/erros";
import { LeadInputSchema, PedidoAcessoSchema } from "./schema";
import { criarOuAtualizarLead, hashCodigo, prepararSolicitacao } from "./lead";
import { verificarCodigo } from "./verificacao";
import { solicitarAcesso, PRAZO_ENVIO_CODIGO_MS, type DepsSolicitarAcesso } from "./solicitarAcesso";
import { EmailFake, SECRET_TESTE, dadosCadastro, depsSolicitar, storesTemporarias } from "./apoioTestes";

const EMAIL = "corretor@exemplo.com";
const T0 = new Date("2026-06-17T12:00:00.000Z");
const IP = "5.5.5.5";

const stores = storesTemporarias("leads-sem-codigo");
afterEach(async () => {
  await stores.limpar();
  vi.restoreAllMocks();
});

const dados = (over: Record<string, unknown> = {}) => dadosCadastro({ email: EMAIL, ...over });
const pedido = (over: Record<string, unknown> = {}) => PedidoAcessoSchema.parse(dados(over));
const montarDeps = (over: Partial<DepsSolicitarAcesso> = {}) => depsSolicitar(stores.nova(), { agora: T0, ...over });

/** Confere um código direto no domínio (o mesmo que a rota de verify faz). */
const verificar = (deps: DepsSolicitarAcesso, codigo: string) =>
  verificarCodigo(
    { store: deps.store, limiter: new MemoriaRateLimiter(), secret: SECRET_TESTE, agora: T0 },
    { email: EMAIL, codigo },
    { ip: IP },
  );

describe("provedor de e-mail que nem sobe ou trava", () => {
  it("configuração faltando (produção sem RESEND_API_KEY): grava sem código e loga config:VAR", async () => {
    const { deps } = montarDeps({
      email: () => {
        throw new ErroConfiguracao("RESEND_API_KEY", "RESEND_API_KEY é obrigatória em produção");
      },
    });

    const r = await solicitarAcesso(deps, pedido(), { ip: IP });
    expect(r).toEqual({ status: "recebido_sem_codigo", motivo: "falha_envio", causa: "config:RESEND_API_KEY" });
    expect(await deps.store.buscarPorEmail(EMAIL)).toMatchObject({ status: "novo", codigo: { hash: "" } });
  });

  it("configuração faltando não gasta vaga do teto diário — consertou, a cota está lá", async () => {
    const quebrado = montarDeps({
      limiteEnviosDia: 1,
      email: () => {
        throw new ErroConfiguracao("EMAIL_FROM", "EMAIL_FROM é obrigatório");
      },
    });
    for (let n = 1; n <= 3; n++) {
      const unico = { email: `c${n}@exemplo.com`, telefone: `(11) 9100${n}-0000`, creci: `SP 3000${n}` };
      expect((await solicitarAcesso(quebrado.deps, pedido(unico), { ip: `10.0.0.${n}` })).status).toBe("recebido_sem_codigo");
    }

    const email = new EmailFake();
    const r = await solicitarAcesso({ ...quebrado.deps, email: () => email }, pedido(), { ip: IP });
    expect(r.status).toBe("enviado");
    expect(email.codigos).toHaveLength(1);
  });

  it("provedor pendurado: desiste no prazo e grava sem código (email:PrazoEsgotado)", async () => {
    const { deps, email } = montarDeps({ prazoEnvioMs: 5 });
    email.enviarCodigo = () => new Promise<void>(() => undefined);

    const r = await solicitarAcesso(deps, pedido(), { ip: IP });
    expect(r).toEqual({ status: "recebido_sem_codigo", motivo: "falha_envio", causa: "email:PrazoEsgotado" });
    expect(await deps.store.buscarPorEmail(EMAIL)).toMatchObject({ status: "novo", codigo: { hash: "" } });
  });

  it("o prazo padrão do envio fica abaixo de 10 s", () => {
    expect(PRAZO_ENVIO_CODIGO_MS).toBeLessThanOrEqual(10_000);
  });
});

describe("verificação durante o envio do e-mail não é desfeita", () => {
  /** 1º pedido sai; no 2º, o lead verifica o código anterior enquanto o e-mail está "saindo". */
  async function verificaDuranteOReenvio(reenvio: "falha" | "sai") {
    const { deps, email } = montarDeps();
    const r1 = await solicitarAcesso(deps, pedido(), { ip: IP });
    if (r1.status !== "enviado") throw new Error("pré-condição: 1º envio sai");

    email.enviarCodigo = async (para, codigo) => {
      expect((await verificar(deps, r1.codigo)).status).toBe("verificado");
      if (reenvio === "falha") throw new Error("provedor caiu");
      email.codigos.push({ para, codigo });
    };
    const r2 = await solicitarAcesso(deps, pedido({ telefone: "(21) 98888-7777" }), { ip: IP });
    return { deps, email, r1, r2, salvo: (await deps.store.buscarPorEmail(EMAIL))! };
  }

  it("sem código: status, verificadoEm e contato ficam; o código consumido NÃO ressuscita", async () => {
    const { deps, r1, r2, salvo } = await verificaDuranteOReenvio("falha");
    expect(r2.status).toBe("recebido_sem_codigo");
    expect(salvo.status).toBe("novo"); // a etapa é do admin; o selo é o verificadoEm
    expect(salvo.verificadoEm).toBe(T0.toISOString());
    expect(salvo.codigo.hash).toBe(""); // consumido na verificação — uso único
    expect(salvo.telefone).toBe("+5511900000000"); // O9: e-mail existente não regrava o contato
    expect(await verificar(deps, r1.codigo)).toEqual({ status: "falha", motivo: "codigo_invalido" });
  });

  it("com código novo: grava o código novo sem rebaixar o status", async () => {
    const { deps, r2, salvo } = await verificaDuranteOReenvio("sai");
    if (r2.status !== "enviado") throw new Error("o reenvio devia sair");
    expect(salvo.status).toBe("novo"); // a etapa é do admin; o selo é o verificadoEm
    expect(salvo.verificadoEm).toBe(T0.toISOString());
    expect(salvo.codigo.hash).toBe(hashCodigo(r2.codigo, SECRET_TESTE));
    expect(await verificar(deps, r2.codigo)).toMatchObject({ status: "verificado", jaVerificado: true });
  });

  it("lead criado e verificado por outro pedido no meio: nada é gravado por cima (O9: nem o contato)", async () => {
    const store = stores.nova();
    const ctx = { ip: IP, secret: SECRET_TESTE, agora: T0 };
    const prep = await prepararSolicitacao(store, LeadInputSchema.parse(dados({ creci: "PE 54321-F" })), ctx);

    const outro = await criarOuAtualizarLead(store, LeadInputSchema.parse(dados()), ctx);
    const deps = montarDeps({ store }).deps;
    expect((await verificar(deps, outro.codigo)).status).toBe("verificado");

    await prep.persistirSemCodigo();
    const salvo = (await store.buscarPorEmail(EMAIL))!;
    expect(await store.listar()).toHaveLength(1);
    expect(salvo).toMatchObject({ id: outro.lead.id, status: "novo", creci: "SP 12345" }); // o contato do outro pedido fica
    expect(salvo.verificadoEm).toBe(T0.toISOString()); // a verificação do outro pedido ficou
    expect(salvo.codigo.hash).toBe("");
  });
});
