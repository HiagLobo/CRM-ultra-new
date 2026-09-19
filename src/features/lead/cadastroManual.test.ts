import { describe, it, expect, afterEach, vi } from "vitest";
import { cadastrarManual, IP_CADASTRO_MANUAL, textoConsentimentoManual } from "./cadastroManual";
import { CadastroManualSchema } from "./schemaAdmin";
import { MemoriaRateLimiter } from "../../lib/ratelimit";
import { criarOuAtualizarLead } from "./lead";
import { LeadInputSchema, VerifyInputSchema } from "./schema";
import { verificarCodigo } from "./verificacao";
import { capturarConsole, criarLeads, dadosCadastro, leadCru, SECRET_TESTE, storesTemporarias } from "./apoioTestes";

const T0 = new Date("2026-06-17T12:00:00.000Z");
const stores = storesTemporarias("leads-manual");
afterEach(async () => {
  await stores.limpar();
  vi.restoreAllMocks();
});

/** Dados fictícios do formulário "+ Novo lead", já pelo Zod (como a rota faz). */
const dados = (over: Record<string, unknown> = {}) =>
  CadastroManualSchema.parse({
    nome: "Bruna Exemplo",
    telefone: "(81) 97777-6666",
    canal: "indicacao",
    consentimento: true,
    ...over,
  });

describe("cadastrarManual", () => {
  it("happy: grava sem código, sem e-mail, com canal e consentimento de cadastro manual", async () => {
    const store = stores.nova();
    const r = await cadastrarManual(store, dados(), T0);
    if (r.status !== "ok") throw new Error("esperava ok");

    expect(r.lead).toMatchObject({ nome: "Bruna Exemplo", telefone: "+5581977776666", canal: "indicacao", status: "novo" });
    expect(r.lead.email).toBeUndefined();
    expect(r.auditoria).toEqual({ acao: "lead.manual", dados: { id: r.lead.id, canal: "indicacao" } });

    const salvo = (await store.buscarPorId(r.lead.id))!;
    expect(salvo.codigo.hash).toBe(""); // sem código de verificação: nunca valida
    expect(salvo.verificadoEm).toBeUndefined();
    expect(salvo.creci).toBe("");
    expect(salvo.consentimento).toEqual({
      texto: textoConsentimentoManual("indicacao"),
      aceitoEm: T0.toISOString(),
      ip: IP_CADASTRO_MANUAL,
    });
    expect(salvo.consentimento.texto).toMatch(/cadastro manual pelo administrador — canal indicação — base legal: legítimo interesse/i);
  });

  it("e-mail e CRECI opcionais são normalizados como no formulário público", async () => {
    const store = stores.nova();
    const r = await cadastrarManual(store, dados({ email: " Bruna@Exemplo.com ", creci: "CRECI-PE 12.345-F" }), T0);
    expect(r).toMatchObject({ status: "ok", lead: { email: "bruna@exemplo.com", creci: "PE 12345-F" } });
  });

  it("dois leads sem e-mail (telefones diferentes) convivem", async () => {
    const store = stores.nova();
    expect((await cadastrarManual(store, dados(), T0)).status).toBe("ok");
    expect((await cadastrarManual(store, dados({ telefone: "(81) 96666-5555" }), T0)).status).toBe("ok");
    expect(await store.listar()).toHaveLength(2);
  });

  it("telefone repetido → duplicado com o id do existente, e nada é criado", async () => {
    const store = stores.nova();
    const primeiro = await cadastrarManual(store, dados(), T0);
    if (primeiro.status !== "ok") throw new Error("esperava ok");
    const r = await cadastrarManual(store, dados({ telefone: "+55 81 97777-6666", nome: "Outra" }), T0);
    expect(r).toEqual({ status: "duplicado", id: primeiro.lead.id, campo: "telefone" });
    expect(await store.listar()).toHaveLength(1);
  });

  it("e-mail que já veio pelo site → duplicado (por e-mail), mesmo com telefone novo", async () => {
    const store = stores.nova();
    const [doSite] = await criarLeads(store, 1, T0);
    const r = await cadastrarManual(store, dados({ email: "corretor0@exemplo.com" }), T0);
    expect(r).toEqual({ status: "duplicado", id: doSite!.id, campo: "email" });
  });

  it("corrida: o e-mail entrou entre a checagem e a gravação → duplicado, sem 500", async () => {
    const store = stores.nova();
    const listar = store.listar.bind(store);
    // a checagem vê a base vazia; logo depois o site grava o mesmo e-mail
    vi.spyOn(store, "listar").mockImplementationOnce(async () => {
      const vazia = await listar();
      await criarOuAtualizarLead(
        store,
        LeadInputSchema.parse(dadosCadastro({ email: "bruna@exemplo.com" })),
        { ip: "1.2.3.4", secret: SECRET_TESTE, agora: T0 },
      );
      return vazia;
    });
    const r = await cadastrarManual(store, dados({ email: "bruna@exemplo.com" }), T0);
    expect(r).toMatchObject({ status: "duplicado", campo: "email" });
    expect(await store.listar()).toHaveLength(1);
  });

  it("a observação vira a 1ª anotação", async () => {
    const store = stores.nova();
    const r = await cadastrarManual(store, dados({ observacao: "conheci no evento do CRECI" }), T0);
    if (r.status !== "ok") throw new Error("esperava ok");
    expect(r.observacaoSalva).toBe(true);
    expect((await store.listarNotas(r.lead.id)).map((n) => n.texto)).toEqual(["conheci no evento do CRECI"]);
  });

  it("a anotação falhou: o lead fica gravado, o admin é avisado e o log leva só a causa", async () => {
    const store = stores.nova();
    vi.spyOn(store, "adicionarNota").mockRejectedValueOnce(
      Object.assign(new Error("insert falhou: conheci no evento, (81) 97777-6666"), { code: "42P01" }),
    );
    const saida = capturarConsole();
    const r = await cadastrarManual(store, dados({ observacao: "conheci no evento" }), T0);
    if (r.status !== "ok") throw new Error("esperava ok");
    expect(r.observacaoSalva).toBe(false);
    expect(await store.listar()).toHaveLength(1);
    expect(saida()).toContain("db:42P01");
    expect(saida()).not.toMatch(/conheci|97777|Bruna/);
  });

  it("depois, a pessoa pede acesso pelo site com o mesmo e-mail: mesmo lead, canal preservado; os dados só entram com o código (O9)", async () => {
    const store = stores.nova();
    const r = await cadastrarManual(store, dados({ email: "bruna@exemplo.com" }), T0);
    if (r.status !== "ok") throw new Error("esperava ok");
    const site = dadosCadastro({ nome: "Bruna Exemplo", email: "bruna@exemplo.com", telefone: "(81) 97777-6666", creci: "PE 12345" });
    const { codigo } = await criarOuAtualizarLead(store, LeadInputSchema.parse(site), {
      ip: "203.0.113.5",
      secret: SECRET_TESTE,
      agora: T0,
    });
    // só o código mudou: o pedido ainda não provou que é dona do e-mail
    expect((await store.listar())[0]).toMatchObject({ id: r.lead.id, creci: "", consentimento: { ip: IP_CADASTRO_MANUAL } });

    const { nome, telefone, creci } = site;
    const v = await verificarCodigo(
      { store, limiter: new MemoriaRateLimiter(), secret: SECRET_TESTE, agora: T0 },
      VerifyInputSchema.parse({ email: "bruna@exemplo.com", codigo, atualizacao: { nome, telefone, creci } }),
      { ip: "203.0.113.5" },
    );
    expect(v.status).toBe("verificado");
    const todos = await store.listar();
    expect(todos).toHaveLength(1);
    expect(todos[0]).toMatchObject({ id: r.lead.id, canal: "indicacao", creci: "PE 12345" });
    expect(todos[0]!.consentimento.ip).toBe("203.0.113.5"); // agora o titular consentiu direto
  });

  it("O9: CRECI repetido → duplicado (pela chave: PE 12345 ≡ PE 12345-F); sem UF só casa com sem UF", async () => {
    const store = stores.nova();
    await store.criar(leadCru({ id: "site", creci: "PE 12345" }));
    await store.criar(leadCru({ id: "antigo", email: "antigo@exemplo.com", telefone: "+5581900000001", creci: "777" }));
    expect(await cadastrarManual(store, dados({ creci: "CRECI-PE 12.345-F" }), T0)).toEqual({ status: "duplicado", id: "site", campo: "creci" });
    expect(await cadastrarManual(store, dados({ creci: "777-F" }), T0)).toEqual({ status: "duplicado", id: "antigo", campo: "creci" });
    // outra série (J) e outra UF são outros registros
    expect((await cadastrarManual(store, dados({ creci: "PE 12345-J" }), T0)).status).toBe("ok");
    expect((await cadastrarManual(store, dados({ telefone: "(81) 96666-5555", creci: "SP 777" }), T0)).status).toBe("ok");
    expect(await store.listar()).toHaveLength(4);
  });
});
