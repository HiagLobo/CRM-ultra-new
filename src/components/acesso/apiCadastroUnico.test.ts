/**
 * Cliente da API no cadastro único (O9·S2): cada resposta nova do contrato vira
 * um estado fechado, o "entrar" fala com a rota nova e o reenvio usa o endpoint
 * do passo de origem. Sem rede (fetch falso) e sem dado real.
 */
import { describe, it, expect, afterEach, vi } from "vitest";
import { MENSAGEM_SEM_CODIGO, solicitarAcesso, verificarCodigo } from "./api";
import { entrarComEmail, reenviarCodigo, type PedidoCodigo } from "./apiEntrar";
import { MENSAGEM_CRECI_EM_USO, MENSAGEM_ENVIO_INDISPONIVEL, MENSAGEM_SEM_CADASTRO } from "./mensagens";
import { DADOS, capturarConsole, fetchFake, fetchOffline } from "./apoioTestes";

const DICA = "m•••••a@provedor.com.br";
const ATUALIZACAO = { nome: DADOS.nome, telefone: DADOS.telefone, creci: DADOS.creci };

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("POST /api/lead — respostas novas", () => {
  it("409 telefone_em_uso com dica: devolve o e-mail mascarado", async () => {
    fetchFake(409, { ok: false, erro: "telefone_em_uso", dica: DICA });
    expect(await solicitarAcesso(DADOS)).toEqual({ status: "telefone_em_uso", dica: DICA });
  });

  it("409 telefone_em_uso sem dica (dono sem e-mail, ou dica vazia/estranha): dica null", async () => {
    for (const dica of [null, "", "   ", 42, undefined]) {
      fetchFake(409, { ok: false, erro: "telefone_em_uso", dica });
      expect(await solicitarAcesso(DADOS)).toEqual({ status: "telefone_em_uso", dica: null });
    }
  });

  it("409 creci_em_uso: estado próprio, sem dica", async () => {
    fetchFake(409, { ok: false, erro: "creci_em_uso" });
    expect(await solicitarAcesso(DADOS)).toEqual({ status: "creci_em_uso" });
  });

  it("409 desconhecido cai no erro genérico (com WhatsApp)", async () => {
    fetchFake(409, { ok: false, erro: "outra_coisa" });
    expect(await solicitarAcesso(DADOS)).toMatchObject({ status: "erro", whatsapp: true });
  });

  it("existente: true → código para entrar; ausente (robô, versão antiga) → cadastro novo", async () => {
    fetchFake(200, { ok: true, status: "enviado", existente: true });
    expect(await solicitarAcesso(DADOS)).toEqual({ status: "enviado", codigoDev: undefined, existente: true });
    fetchFake(200, { ok: true, status: "enviado" });
    expect(await solicitarAcesso(DADOS)).toMatchObject({ existente: false });
    fetchFake(200, { ok: true, status: "enviado", existente: "sim" });
    expect(await solicitarAcesso(DADOS)).toMatchObject({ existente: false });
  });

  it("503 envio_indisponivel (emenda: e-mail que já existia, código não saiu): nada de 'recebemos seus dados'", async () => {
    fetchFake(503, { ok: false, erro: "envio_indisponivel" });
    const r = await solicitarAcesso(DADOS);
    expect(r).toEqual({ status: "envio_indisponivel", mensagem: MENSAGEM_ENVIO_INDISPONIVEL });
    expect(r.status === "envio_indisponivel" && r.mensagem).not.toMatch(/Recebemos/);
    // o 503 do anti-robô continua sendo outra coisa
    fetchFake(503, { ok: false, erro: "verificacao_indisponivel" });
    expect((await solicitarAcesso(DADOS)).status).toBe("desafio");
  });

  it("202 (só e-mail novo) repassa `existente` apenas se vier true — defesa para o fluxo", async () => {
    fetchFake(202, { ok: true, status: "recebido_sem_codigo" });
    expect(await solicitarAcesso(DADOS)).toEqual({ status: "recebido_sem_codigo", mensagem: MENSAGEM_SEM_CODIGO, existente: false });
    fetchFake(202, { ok: true, status: "recebido_sem_codigo", existente: true });
    expect(await solicitarAcesso(DADOS)).toMatchObject({ status: "recebido_sem_codigo", existente: true });
  });

  it("manda o nome no corpo, junto do CRECI com UF", async () => {
    const chamadas = fetchFake(200, { ok: true, status: "enviado", existente: false });
    await solicitarAcesso(DADOS);
    expect(chamadas[0]!.body).toMatchObject({ nome: DADOS.nome, creci: "SP 12345" });
  });
});

describe("POST /api/lead/verify — atualizacao e naoAtualizados", () => {
  it("leva a atualizacao só quando existe", async () => {
    const chamadas = fetchFake(200, { ok: true });
    await verificarCodigo(DADOS.email, "123456", ATUALIZACAO);
    await verificarCodigo(DADOS.email, "123456");
    expect(chamadas[0]!.body).toEqual({ email: DADOS.email, codigo: "123456", atualizacao: ATUALIZACAO });
    expect(chamadas[1]!.body).toEqual({ email: DADOS.email, codigo: "123456" });
  });

  it("naoAtualizados: só os campos do contrato, sem repetição; vazio some", async () => {
    fetchFake(200, { ok: true, naoAtualizados: ["telefone"] });
    expect(await verificarCodigo(DADOS.email, "123456", ATUALIZACAO)).toEqual({ status: "verificado", naoAtualizados: ["telefone"] });
    fetchFake(200, { ok: true, naoAtualizados: ["creci", "telefone", "creci", "senha"] });
    expect(await verificarCodigo(DADOS.email, "123456", ATUALIZACAO)).toEqual({
      status: "verificado",
      naoAtualizados: ["telefone", "creci"],
    });
    for (const naoAtualizados of [[], "telefone", null]) {
      fetchFake(200, { ok: true, naoAtualizados });
      expect(await verificarCodigo(DADOS.email, "123456", ATUALIZACAO)).toEqual({ status: "verificado" });
    }
  });
});

describe("POST /api/lead/entrar", () => {
  it("happy: manda só o e-mail (+ anti-robô quando existe) e repassa o codigoDev", async () => {
    const chamadas = fetchFake(200, { ok: true, status: "enviado", codigoDev: "123456" });
    expect(await entrarComEmail(DADOS.email, { turnstileToken: "tok-1", website: "" })).toEqual({
      status: "enviado",
      codigoDev: "123456",
    });
    expect(chamadas[0]).toEqual({ url: "/api/lead/entrar", body: { email: DADOS.email, turnstileToken: "tok-1" } });
  });

  it("404 sem_cadastro", async () => {
    fetchFake(404, { ok: false, erro: "sem_cadastro" });
    expect(await entrarComEmail(DADOS.email)).toEqual({ status: "sem_cadastro" });
  });

  it("503 envio_indisponivel: mensagem própria — diferente do anti-robô fora do ar", async () => {
    fetchFake(503, { ok: false, erro: "envio_indisponivel" });
    expect(await entrarComEmail(DADOS.email)).toEqual({ status: "envio_indisponivel", mensagem: MENSAGEM_ENVIO_INDISPONIVEL });
    fetchFake(503, { ok: false, erro: "verificacao_indisponivel" });
    expect(await entrarComEmail(DADOS.email)).toMatchObject({ status: "desafio", whatsapp: true });
  });

  it("403, 429, 400, 500 e rede: como no /api/lead", async () => {
    fetchFake(403, { ok: false, erro: "verificacao_humana" });
    expect((await entrarComEmail(DADOS.email)).status).toBe("desafio");
    fetchFake(429, { ok: false });
    expect((await entrarComEmail(DADOS.email)).status).toBe("limitado");
    fetchFake(400, { ok: false, erro: "dados inválidos", campos: { email: ["e-mail inválido"] } });
    expect(await entrarComEmail(DADOS.email)).toMatchObject({ status: "invalido", campos: { email: ["e-mail inválido"] } });
    fetchFake(500, { ok: false });
    expect(await entrarComEmail(DADOS.email)).toMatchObject({ status: "erro", whatsapp: true });
    fetchOffline();
    expect(await entrarComEmail(DADOS.email)).toMatchObject({ status: "erro", whatsapp: true });
  });
});

describe("reenviar código — endpoint do passo de origem", () => {
  const doCadastro: PedidoCodigo = { tipo: "cadastro", dados: DADOS, existente: true, atualizar: true };
  const doEntrar: PedidoCodigo = { tipo: "entrar", email: DADOS.email };

  it("cadastro: POST /api/lead com os mesmos dados", async () => {
    const chamadas = fetchFake(200, { ok: true, status: "enviado", existente: true, codigoDev: "222222" });
    expect(await reenviarCodigo(doCadastro, { turnstileToken: "tok-2" })).toEqual({ status: "enviado", codigoDev: "222222" });
    expect(chamadas[0]).toEqual({ url: "/api/lead", body: { ...DADOS, turnstileToken: "tok-2" } });
  });

  it("entrar: POST /api/lead/entrar só com o e-mail", async () => {
    const chamadas = fetchFake(200, { ok: true, status: "enviado" });
    expect(await reenviarCodigo(doEntrar)).toEqual({ status: "enviado", codigoDev: undefined });
    expect(chamadas[0]).toEqual({ url: "/api/lead/entrar", body: { email: DADOS.email } });
  });

  it("código novo que não saiu (202 ou 503 do cadastro, 503 do entrar) → sem_codigo", async () => {
    fetchFake(202, { ok: true, status: "recebido_sem_codigo" });
    expect((await reenviarCodigo(doCadastro)).status).toBe("sem_codigo");
    fetchFake(503, { ok: false, erro: "envio_indisponivel" });
    expect(await reenviarCodigo(doCadastro)).toEqual({ status: "sem_codigo", mensagem: MENSAGEM_ENVIO_INDISPONIVEL });
    fetchFake(503, { ok: false, erro: "envio_indisponivel" });
    expect(await reenviarCodigo(doEntrar)).toEqual({ status: "sem_codigo", mensagem: MENSAGEM_ENVIO_INDISPONIVEL });
  });

  it("limite segue limite; repetido e sem cadastro viram erro com texto claro", async () => {
    fetchFake(429, { ok: false });
    expect((await reenviarCodigo(doEntrar)).status).toBe("limitado");
    fetchFake(409, { ok: false, erro: "creci_em_uso" });
    expect(await reenviarCodigo(doCadastro)).toEqual({ status: "erro", mensagem: MENSAGEM_CRECI_EM_USO });
    fetchFake(404, { ok: false, erro: "sem_cadastro" });
    expect(await reenviarCodigo(doEntrar)).toEqual({ status: "erro", mensagem: MENSAGEM_SEM_CADASTRO });
    fetchOffline();
    expect((await reenviarCodigo(doEntrar)).status).toBe("erro");
  });
});

describe("sem PII no console (O9)", () => {
  it("nome, e-mail, telefone, CRECI, código e dica nunca vão para o console", async () => {
    const logs = capturarConsole();
    fetchFake(409, { ok: false, erro: "telefone_em_uso", dica: DICA });
    await solicitarAcesso(DADOS);
    fetchFake(404, { ok: false, erro: "sem_cadastro" });
    await entrarComEmail(DADOS.email);
    fetchFake(200, { ok: true, naoAtualizados: ["creci"] });
    await verificarCodigo(DADOS.email, "654321", ATUALIZACAO);
    fetchOffline();
    await entrarComEmail(DADOS.email);
    await reenviarCodigo({ tipo: "cadastro", dados: DADOS, existente: false, atualizar: false });

    const saida = logs.join("\n");
    for (const pii of [DADOS.nome, DADOS.email, DADOS.telefone, DADOS.creci, "654321", DICA]) {
      expect(saida).not.toContain(pii);
    }
  });
});
