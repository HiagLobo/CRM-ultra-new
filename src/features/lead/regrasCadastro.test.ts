/**
 * Regras do cadastro único (O9·S1), no caso de uso `solicitarAcesso`: um lead
 * por pessoa (WhatsApp e CRECI não se repetem), e-mail que já existe vira
 * "entrar" sem regravar nada, e cada checagem gasta vaga do rate-limit.
 * Tudo fictício, store em tmpdir, e-mail falso.
 */
import { describe, it, expect, afterEach, vi } from "vitest";
import { PedidoAcessoSchema } from "./schema";
import { solicitarAcesso, type DepsSolicitarAcesso } from "./solicitarAcesso";
import { prepararSolicitacao, criarOuAtualizarLead, hashCodigo } from "./lead";
import { mascararEmail } from "./mascaraEmail";
import { capturarConsole, dadosCadastro, depsSolicitar, leadCru, SECRET_TESTE, storesTemporarias } from "./apoioTestes";

const T0 = new Date("2026-06-17T12:00:00.000Z");
const IP = "203.0.113.30";
const DONA = "maria.dona@exemplo.com";

const stores = storesTemporarias("leads-regras-o9");
afterEach(async () => {
  await stores.limpar();
  vi.restoreAllMocks();
});

const pedido = (over: Record<string, unknown> = {}) => PedidoAcessoSchema.parse(dadosCadastro(over));
const montarDeps = (over: Partial<DepsSolicitarAcesso> = {}) => depsSolicitar(stores.nova(), { agora: T0, ...over });

/** A dona do WhatsApp (81) 90000-0001 e do CRECI PE 12345 — lead que já existe. */
async function comDona(deps: DepsSolicitarAcesso) {
  await deps.store.criar(leadCru({ id: "dona", email: DONA, telefone: "+5581900000001", creci: "PE 12345", nome: "Maria Dona" }));
}

describe("mascararEmail", () => {
  it.each([
    ["maria@provedor.com.br", "m•••••a@provedor.com.br"],
    ["jo@exemplo.com", "j•••••@exemplo.com"],
    ["a@exemplo.com", "a•••••@exemplo.com"],
    ["ana.b@exemplo.com", "a•••••b@exemplo.com"],
    ["sem-arroba", "•••••"],
  ])("%s → %s", (email, esperado) => {
    expect(mascararEmail(email)).toBe(esperado);
  });

  it("a máscara tem tamanho fixo (não entrega o tamanho do e-mail)", () => {
    expect(mascararEmail("abc@x.com").length).toBe(mascararEmail("abcdefghijk@x.com").length);
  });
});

describe("e-mail que já tem cadastro vira 'entrar'", () => {
  it("manda o código, responde novo=false e NÃO regrava nome, telefone, CRECI, origem nem consentimento", async () => {
    const { deps, email } = montarDeps();
    await comDona(deps);
    const antes = (await deps.store.buscarPorId("dona"))!;

    const r = await solicitarAcesso(
      deps,
      pedido({ email: DONA, nome: "Outra Pessoa", telefone: "(21) 98888-7777", creci: "RJ 999", origem: { utm: "x" } }),
      { ip: IP },
    );
    expect(r).toMatchObject({ status: "enviado", novo: false });
    if (r.status !== "enviado") return;
    expect(email.codigos).toEqual([{ para: DONA, codigo: r.codigo }]);

    const depois = (await deps.store.buscarPorId("dona"))!;
    expect(depois).toEqual({ ...antes, codigo: depois.codigo, atualizadoEm: T0.toISOString() });
    expect(depois.codigo.hash).toBe(hashCodigo(r.codigo, SECRET_TESTE));
    expect(await deps.store.listar()).toHaveLength(1);
  });

  it("e-mail existente não passa pela checagem de repetidos (o WhatsApp dela é dela)", async () => {
    const { deps } = montarDeps();
    await comDona(deps);
    const r = await solicitarAcesso(deps, pedido({ email: DONA, telefone: "(81) 90000-0001", creci: "PE 12345" }), { ip: IP });
    expect(r.status).toBe("enviado");
  });
});

describe("WhatsApp repetido (F1): barrado com a dica do e-mail mascarado", () => {
  it("dono com e-mail → telefone_em_uso com a dica; nada gravado nem enviado", async () => {
    const { deps, email } = montarDeps();
    await comDona(deps);
    const r = await solicitarAcesso(deps, pedido({ email: "novo@exemplo.com", telefone: "+55 81 90000-0001" }), { ip: IP });
    expect(r).toEqual({ status: "telefone_em_uso", dica: "m•••••a@exemplo.com" });
    expect(email.codigos).toHaveLength(0);
    expect(await deps.store.listar()).toHaveLength(1);
  });

  it("dono sem e-mail (cadastro manual) → sem dica", async () => {
    const { deps } = montarDeps();
    await deps.store.criar(leadCru({ id: "manual", email: undefined, telefone: "+5581900000001", creci: "", canal: "whatsapp" }));
    const r = await solicitarAcesso(deps, pedido({ email: "novo@exemplo.com", telefone: "(81) 90000-0001" }), { ip: IP });
    expect(r).toEqual({ status: "telefone_em_uso", dica: null });
  });

  it("repetidos antigos: a dica é do que tem e-mail", async () => {
    const { deps } = montarDeps();
    await deps.store.criar(leadCru({ id: "manual", email: undefined, telefone: "+5581900000001", creci: "", criadoEm: "2026-01-01T00:00:00.000Z" }));
    await comDona(deps);
    const r = await solicitarAcesso(deps, pedido({ email: "novo@exemplo.com", telefone: "(81) 90000-0001" }), { ip: IP });
    expect(r).toEqual({ status: "telefone_em_uso", dica: "m•••••a@exemplo.com" });
  });
});

describe("CRECI repetido (F2): barrado sempre, sem dica", () => {
  it.each(["PE 12345", "PE 12345-F", "CRECI-PE 12.345-F", "12345/PE"])("%s de outro lead → creci_em_uso", async (creci) => {
    const { deps, email } = montarDeps();
    await comDona(deps);
    const r = await solicitarAcesso(deps, pedido({ email: "novo@exemplo.com", telefone: "(81) 97777-0000", creci }), { ip: IP });
    expect(r).toEqual({ status: "creci_em_uso" });
    expect(email.codigos).toHaveLength(0);
    expect(await deps.store.listar()).toHaveLength(1);
  });

  it("CRECI-J (outra série) e o mesmo número em outra UF são outros registros", async () => {
    const { deps } = montarDeps();
    await comDona(deps);
    const j = await solicitarAcesso(deps, pedido({ email: "imob@exemplo.com", telefone: "(81) 97777-0001", creci: "PE 12345-J" }), { ip: IP });
    const sp = await solicitarAcesso(deps, pedido({ email: "sp@exemplo.com", telefone: "(11) 97777-0002", creci: "SP 12345" }), { ip: IP });
    expect([j.status, sp.status]).toEqual(["enviado", "enviado"]);
  });

  it("CRECI-J repetido também é barrado (F2: inclusive CRECI-J)", async () => {
    const { deps } = montarDeps();
    await deps.store.criar(leadCru({ id: "imob", email: "imob@exemplo.com", telefone: "+5581900000002", creci: "PE 12345-J" }));
    const r = await solicitarAcesso(deps, pedido({ email: "outra@exemplo.com", telefone: "(81) 97777-0003", creci: "PE 12345-J" }), { ip: IP });
    expect(r).toEqual({ status: "creci_em_uso" });
  });
});

describe("cada checagem gasta vaga do rate-limit (a porta não vira varredura)", () => {
  it("mesmo e-mail batendo no WhatsApp de outro: 3 × 409, a 4ª é limitada", async () => {
    const { deps } = montarDeps();
    await comDona(deps);
    const tentar = () => solicitarAcesso(deps, pedido({ email: "curioso@exemplo.com", telefone: "(81) 90000-0001" }), { ip: IP });
    for (let i = 0; i < 3; i++) expect((await tentar()).status).toBe("telefone_em_uso");
    expect((await tentar()).status).toBe("limitado");
  });

  it("mesmo IP varrendo CRECIs com e-mails diferentes: 10 × 409, a 11ª é limitada", async () => {
    const { deps } = montarDeps();
    await comDona(deps);
    const tentar = (n: number) =>
      solicitarAcesso(deps, pedido({ email: `v${n}@exemplo.com`, telefone: `(81) 9${1000 + n}-0000`, creci: "PE 12345" }), { ip: IP });
    for (let n = 1; n <= 10; n++) expect((await tentar(n)).status).toBe("creci_em_uso");
    expect((await tentar(11)).status).toBe("limitado");
  });
});

describe("cadastro novo grava o nome; a corrida não regrava contato", () => {
  it("lead novo nasce com o nome completo", async () => {
    const { deps } = montarDeps();
    await solicitarAcesso(deps, pedido({ nome: "  Ana   O'Neil " }), { ip: IP });
    expect((await deps.store.buscarPorEmail("corretor@exemplo.com"))?.nome).toBe("Ana O'Neil");
  });

  it("outro pedido criou o mesmo e-mail no meio: o e-mail saiu → grava só o código novo", async () => {
    const store = stores.nova();
    const ctx = { ip: IP, secret: SECRET_TESTE, agora: T0 };
    const prep = await prepararSolicitacao(store, PedidoAcessoSchema.parse(dadosCadastro({ creci: "PE 54321" })), ctx);
    const outro = await criarOuAtualizarLead(store, PedidoAcessoSchema.parse(dadosCadastro()), ctx);

    await prep.persistir();
    const salvo = (await store.buscarPorEmail("corretor@exemplo.com"))!;
    expect(salvo).toMatchObject({ id: outro.lead.id, creci: "SP 12345" }); // o contato do outro pedido fica
    expect(salvo.codigo.hash).toBe(hashCodigo(prep.codigo, SECRET_TESTE)); // o código deste vale
  });
});

describe("sem PII em log nas regras novas", () => {
  it("repetidos e e-mail existente não logam e-mail, telefone, CRECI nem nome", async () => {
    const saida = capturarConsole();
    const { deps } = montarDeps();
    await comDona(deps);
    await solicitarAcesso(deps, pedido({ email: DONA }), { ip: IP });
    await solicitarAcesso(deps, pedido({ email: "novo@exemplo.com", telefone: "(81) 90000-0001" }), { ip: IP });
    await solicitarAcesso(deps, pedido({ email: "novo@exemplo.com", telefone: "(81) 97777-0000", creci: "PE 12345" }), { ip: IP });
    for (const pii of [DONA, "novo@exemplo.com", "90000-0001", "12345", "Maria", "Corretor Exemplo"]) {
      expect(saida()).not.toContain(pii);
    }
  });
});
