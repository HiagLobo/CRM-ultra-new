/**
 * Verify da O9: a `atualizacao` (nome, WhatsApp, CRECI digitados por quem já
 * tinha cadastro) só vale com o código certo, campo a campo, pulando o que é de
 * OUTRO lead; e o último acesso é carimbado à prova de falha.
 */
import { describe, it, expect, afterEach, vi } from "vitest";
import { MemoriaRateLimiter } from "../../lib/ratelimit";
import type { LeadStore } from "../../lib/leadStore";
import { LeadInputSchema, VerifyInputSchema, TEXTO_CONSENTIMENTO } from "./schema";
import { criarOuAtualizarLead, EXPIRACAO_CODIGO_MIN } from "./lead";
import { verificarCodigo } from "./verificacao";
import { capturarConsole, dadosCadastro, leadCru, SECRET_TESTE, storesTemporarias } from "./apoioTestes";

const T0 = new Date("2026-06-17T12:00:00.000Z");
const EMAIL = "corretor@exemplo.com";
const IP_VERIFY = "203.0.113.50";

const stores = storesTemporarias("leads-atualizacao");
afterEach(async () => {
  await stores.limpar();
  vi.restoreAllMocks();
});

/** Lead com código pendente (pedido em T0 pelo IP 1.2.3.4) + outro lead que é dono de (81) 90000-0001 e PE 777. */
async function cenario() {
  const store = stores.nova();
  const { lead, codigo } = await criarOuAtualizarLead(store, LeadInputSchema.parse(dadosCadastro()), {
    ip: "1.2.3.4",
    secret: SECRET_TESTE,
    agora: T0,
  });
  await store.criar(leadCru({ id: "outro", email: "outro@exemplo.com", telefone: "+5581900000001", creci: "PE 777" }));
  return { store, lead, codigo };
}

function verificar(store: LeadStore, codigo: string, atualizacao?: Record<string, string>, agora = T0) {
  return verificarCodigo(
    { store, limiter: new MemoriaRateLimiter(), secret: SECRET_TESTE, agora },
    VerifyInputSchema.parse({ email: EMAIL, codigo, ...(atualizacao ? { atualizacao } : {}) }),
    { ip: IP_VERIFY },
  );
}

const errado = (codigo: string) => (codigo === "000000" ? "111111" : "000000");

describe("verify com atualizacao — só depois do código certo", () => {
  it("aplica nome, WhatsApp e CRECI novos e carimba o consentimento de novo", async () => {
    const { store, lead, codigo } = await cenario();
    const r = await verificar(store, codigo, { nome: "Maria da Silva", telefone: "(21) 98888-7777", creci: "RJ 4321" });
    expect(r).toEqual({ status: "verificado", email: EMAIL, jaVerificado: false });

    const salvo = (await store.buscarPorId(lead.id))!;
    expect(salvo).toMatchObject({ nome: "Maria da Silva", telefone: "+5521988887777", creci: "RJ 4321" });
    expect(salvo.consentimento).toEqual({ texto: TEXTO_CONSENTIMENTO, aceitoEm: T0.toISOString(), ip: IP_VERIFY });
    expect(salvo.codigo.hash).toBe(""); // e o código foi consumido
  });

  it("pula o que já é de OUTRO lead e devolve naoAtualizados; o resto grava", async () => {
    const { store, lead, codigo } = await cenario();
    const r = await verificar(store, codigo, { nome: "Maria da Silva", telefone: "(81) 90000-0001", creci: "PE 777-F" });
    expect(r).toEqual({ status: "verificado", email: EMAIL, jaVerificado: false, naoAtualizados: ["telefone", "creci"] });

    const salvo = (await store.buscarPorId(lead.id))!;
    expect(salvo).toMatchObject({ nome: "Maria da Silva", telefone: "+5511900000000", creci: "SP 12345" });
    expect((await store.buscarPorId("outro"))!.telefone).toBe("+5581900000001"); // o outro nem é tocado
  });

  it("código errado ou expirado: nada da atualização é aplicado", async () => {
    const { store, lead, codigo } = await cenario();
    const nova = { nome: "Invasor Exemplo", telefone: "(21) 98888-7777", creci: "RJ 4321" };
    expect(await verificar(store, errado(codigo), nova)).toEqual({ status: "falha", motivo: "codigo_invalido" });
    const depois = new Date(T0.getTime() + (EXPIRACAO_CODIGO_MIN + 1) * 60_000);
    expect(await verificar(store, codigo, nova, depois)).toEqual({ status: "falha", motivo: "expirado" });

    const salvo = (await store.buscarPorId(lead.id))!;
    expect(salvo).toMatchObject({ nome: "Corretor Exemplo", telefone: "+5511900000000", creci: "SP 12345" });
    expect(salvo.consentimento.ip).toBe("1.2.3.4");
  });

  it("nada mudou (CRECI na mesma chave): não regrava nem recarimba o consentimento", async () => {
    const { store, lead, codigo } = await cenario();
    const r = await verificar(store, codigo, { nome: "Corretor Exemplo", telefone: "(11) 90000-0000", creci: "SP 12345-F" });
    expect(r).not.toHaveProperty("naoAtualizados");
    const salvo = (await store.buscarPorId(lead.id))!;
    expect(salvo.creci).toBe("SP 12345");
    expect(salvo.consentimento.ip).toBe("1.2.3.4");
  });

  it("CRECI novo desfaz a conferência feita no número antigo", async () => {
    const { store, lead, codigo } = await cenario();
    await store.atualizarFunil(lead.id, { creciConferencia: "conferido", creciConferidoEm: T0.toISOString(), atualizadoEm: T0.toISOString() });
    await verificar(store, codigo, { nome: "Corretor Exemplo", telefone: "(11) 90000-0000", creci: "PE 4321" });
    const salvo = (await store.buscarPorId(lead.id))!;
    expect(salvo.creci).toBe("PE 4321");
    expect(salvo).not.toHaveProperty("creciConferencia");
    expect(salvo).not.toHaveProperty("creciConferidoEm");
  });

  it("banco falhou ao gravar a atualização: 500 no caller e o código segue valendo (dá para tentar de novo)", async () => {
    const { store, codigo } = await cenario();
    vi.spyOn(store, "atualizarContato").mockRejectedValueOnce(Object.assign(new Error("falhou"), { code: "08006" }));
    const nova = { nome: "Maria da Silva", telefone: "(21) 98888-7777", creci: "RJ 4321" };
    await expect(verificar(store, codigo, nova)).rejects.toThrow();
    expect((await verificar(store, codigo, nova)).status).toBe("verificado");
  });
});

describe("último acesso ao demo (registrarAcesso)", () => {
  it("cada verificação com sucesso carimba ultimoAcessoEm; o verificadoEm fica o da 1ª", async () => {
    const { store, lead, codigo } = await cenario();
    await verificar(store, codigo);
    const depois = new Date(T0.getTime() + 3 * 3_600_000);
    const { codigo: codigo2 } = await criarOuAtualizarLead(store, LeadInputSchema.parse(dadosCadastro()), {
      ip: "1.2.3.4",
      secret: SECRET_TESTE,
      agora: depois,
    });
    await verificar(store, codigo2, undefined, depois);
    expect(await store.buscarPorId(lead.id)).toMatchObject({
      verificadoEm: T0.toISOString(),
      ultimoAcessoEm: depois.toISOString(),
    });
  });

  it("falha do registrarAcesso (coluna da 005 faltando) NÃO derruba o login; o log leva só a causa", async () => {
    const saida = capturarConsole();
    const { store, codigo } = await cenario();
    vi.spyOn(store, "registrarAcesso").mockRejectedValueOnce(
      Object.assign(new Error(`column "ultimo_acesso_em" does not exist; ${EMAIL}`), { code: "42703" }),
    );
    expect(await verificar(store, codigo)).toMatchObject({ status: "verificado" });
    expect(saida()).toContain("[verify] último acesso não registrado: db:42703");
    expect(saida()).not.toContain(EMAIL);
  });

  it("código errado não carimba acesso", async () => {
    const { store, lead, codigo } = await cenario();
    await verificar(store, errado(codigo));
    expect(await store.buscarPorId(lead.id)).not.toHaveProperty("ultimoAcessoEm");
  });
});
