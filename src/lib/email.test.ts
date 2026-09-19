import { describe, it, expect, vi, beforeEach } from "vitest";
import type { BrandConfig } from "../config/brand";

/** Resend falso: guarda o que seria enviado e devolve o resultado escolhido. */
const enviar = vi.hoisted(() => vi.fn());
vi.mock("resend", () => ({
  Resend: class {
    emails = { send: enviar };
  },
}));

import { ConsoleEmail, ResendEmail, mascararEmail } from "./email";

const MARCA: BrandConfig = {
  nome: "Marca Teste Completa",
  nomeCurto: "Marca Teste",
  tagline: "t",
  contato: { email: "contato@exemplo.com.br", whatsapp: "+55 11 90000-0000", telefone: "(11) 90000-0000" },
  empresa: { razaoSocial: "Empresa Fictícia Ltda", cnpj: "00.000.000/0001-00" },
  dominio: "exemplo.com.br",
  demoMode: true,
};
const ENDERECO = "acesso@mail.exemplo.com.br";
const PARA = "corretor.ficticio@exemplo.com";

beforeEach(() => {
  enviar.mockReset();
  enviar.mockResolvedValue({ data: { id: "x" }, error: null });
});

describe("ResendEmail — remetente e resposta", () => {
  it("EMAIL_FROM só com endereço → envia como \"{nomeCurto} <endereço>\"", async () => {
    await new ResendEmail("re_teste", { endereco: ENDERECO }).enviarCodigo(PARA, "123456", MARCA);
    expect(enviar).toHaveBeenCalledTimes(1);
    const msg = enviar.mock.calls[0]![0];
    expect(msg.from).toBe(`Marca Teste <${ENDERECO}>`);
    expect(msg.to).toBe(PARA);
  });

  it("EMAIL_FROM com nome → mantém o nome escolhido", async () => {
    await new ResendEmail("re_teste", { nome: "Outro Nome", endereco: ENDERECO }).enviarCodigo(PARA, "123456", MARCA);
    expect(enviar.mock.calls[0]![0].from).toBe(`Outro Nome <${ENDERECO}>`);
  });

  it("reply_to = contato da marca; corpo com site e validade", async () => {
    await new ResendEmail("re_teste", { endereco: ENDERECO }).enviarCodigo(PARA, "123456", MARCA);
    const msg = enviar.mock.calls[0]![0];
    expect(msg.replyTo).toBe(MARCA.contato.email);
    expect(msg.text).toContain("https://exemplo.com.br");
    expect(msg.html).toContain("https://exemplo.com.br");
  });

  it("marca sem e-mail de contato → sem replyTo (não manda campo vazio ao Resend)", async () => {
    const semContato = { ...MARCA, contato: { ...MARCA.contato, email: "" } };
    await new ResendEmail("re_teste", { endereco: ENDERECO }).enviarCodigo(PARA, "123456", semContato);
    expect(enviar.mock.calls[0]![0]).not.toHaveProperty("replyTo");
  });

  it("falha do Resend propaga só o nome do erro — sem destinatário nem código", async () => {
    enviar.mockResolvedValue({ data: null, error: { name: "daily_quota_exceeded", message: `quota for ${PARA}` } });
    const envio = new ResendEmail("re_teste", { endereco: ENDERECO }).enviarCodigo(PARA, "123456", MARCA);
    await expect(envio).rejects.toThrow("falha no envio de e-mail (daily_quota_exceeded)");
    const erro = await envio.catch((e: Error) => e.message);
    expect(erro).not.toContain(PARA);
    expect(erro).not.toContain("123456");
  });
});

describe("criarProvedorEmail — EMAIL_FROM em produção", () => {
  const carregar = async (raw: Record<string, string>) => {
    vi.resetModules();
    const anterior = { ...process.env };
    Object.assign(process.env, { APP_SECRET: "x".repeat(16), ADMIN_PASSWORD: "senhaForte1", NODE_ENV: "production", RESEND_API_KEY: "re_teste", ...raw });
    try {
      return await import("./email");
    } finally {
      process.env = anterior;
    }
  };

  it.each([ENDERECO, `Marca Teste <${ENDERECO}>`])("aceita %j e envia com nome", async (from) => {
    const { criarProvedorEmail } = await carregar({ EMAIL_FROM: from });
    await criarProvedorEmail().enviarCodigo(PARA, "123456", MARCA);
    expect(enviar.mock.calls[0]![0].from).toBe(`Marca Teste <${ENDERECO}>`);
  });

  it("EMAIL_FROM fora do formato → erro claro (sem cair em remetente quebrado)", async () => {
    const { criarProvedorEmail } = await carregar({ EMAIL_FROM: "Marca Teste" });
    expect(() => criarProvedorEmail()).toThrow(/EMAIL_FROM inválido/);
  });
});

describe("ResendEmail — aviso de lead novo ao fundador (O7·S1)", () => {
  const FUNDADOR = "avisos@exemplo.com.br";

  it("vai para o fundador, com remetente nomeado e link do /admin", async () => {
    await new ResendEmail("re_teste", { endereco: ENDERECO }).enviarAvisoNovoLead(FUNDADOR, MARCA);
    const msg = enviar.mock.calls[0]![0];
    expect(msg.to).toBe(FUNDADOR);
    expect(msg.from).toBe(`Marca Teste <${ENDERECO}>`);
    expect(msg.subject).toContain("novo lead");
    expect(msg.text).toContain("https://exemplo.com.br/admin");
    expect(msg.html).toContain("https://exemplo.com.br/admin");
    expect(msg).not.toHaveProperty("replyTo"); // ninguém responde a um aviso automático
  });

  it("corpo sem PII: nenhum endereço de e-mail nem número de telefone", async () => {
    await new ResendEmail("re_teste", { endereco: ENDERECO }).enviarAvisoNovoLead(FUNDADOR, MARCA);
    const { text, html, subject } = enviar.mock.calls[0]![0];
    for (const parte of [text, html, subject]) {
      expect(parte).not.toMatch(/[\w.+-]+@[\w-]+\.[\w.]+/); // nem o do lead, nem outro qualquer
      expect(parte).not.toMatch(/\d{4,5}-?\d{4}/);
    }
  });

  it("falha do Resend no aviso propaga só o nome do erro", async () => {
    enviar.mockResolvedValue({ data: null, error: { name: "rate_limit_exceeded", message: "x" } });
    await expect(
      new ResendEmail("re_teste", { endereco: ENDERECO }).enviarAvisoNovoLead(FUNDADOR, MARCA),
    ).rejects.toThrow("falha no envio de e-mail (rate_limit_exceeded)");
  });
});

describe("ConsoleEmail (fallback dev) — sem PII em log", () => {
  const logs = () => vi.spyOn(console, "log").mockImplementation(() => {});

  it("código: não loga o e-mail completo nem o código", async () => {
    const spy = logs();
    await new ConsoleEmail().enviarCodigo(PARA, "123456", MARCA);
    const logado = spy.mock.calls.map((c) => c.join(" ")).join("\n");
    expect(logado).not.toContain(PARA);
    expect(logado).not.toContain("123456");
    expect(logado).toContain(mascararEmail(PARA)); // só a forma mascarada
    spy.mockRestore();
  });

  it("aviso: não loga nem o destinatário", async () => {
    const spy = logs();
    await new ConsoleEmail().enviarAvisoNovoLead("avisos@exemplo.com.br", MARCA);
    const logado = spy.mock.calls.map((c) => c.join(" ")).join("\n");
    expect(logado).toContain("aviso de lead novo");
    expect(logado).not.toContain("@");
    spy.mockRestore();
  });
});
