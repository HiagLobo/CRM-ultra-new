import { describe, it, expect, vi } from "vitest";
import type { BrandConfig } from "../config/brand";

// validade diferente da padrão: prova que o texto lê a constante, não um "10" cravado
vi.mock("../features/lead/schema", async (original) => ({
  ...(await original<typeof import("../features/lead/schema")>()),
  EXPIRACAO_CODIGO_MIN: 25,
}));

const { montarEmailCodigo, urlDoSite } = await import("./emailCodigo");

/** Marca fictícia — o teste não depende (nem repete) o contato real do brand.ts. */
const MARCA: BrandConfig = {
  nome: "Marca <Teste> & Cia",
  nomeCurto: "Marca Teste",
  tagline: "t",
  contato: { email: "contato@exemplo.com.br", whatsapp: "+55 11 90000-0000", telefone: "(11) 90000-0000" },
  empresa: { razaoSocial: "Empresa Fictícia Ltda", cnpj: "00.000.000/0001-00" },
  dominio: "exemplo.com.br",
  demoMode: true,
};

describe("montarEmailCodigo", () => {
  const email = montarEmailCodigo("123456", MARCA);

  it("assunto com o nome curto da marca, sem o código", () => {
    expect(email.assunto).toBe("Marca Teste: seu código de acesso");
    expect(email.assunto).not.toContain("123456");
  });

  it("traz o código no texto e no HTML", () => {
    expect(email.texto).toContain("123456");
    expect(email.html).toContain("123456");
  });

  it("validade vem de EXPIRACAO_CODIGO_MIN (não cravada)", () => {
    expect(email.texto).toContain("Validade: 25 minutos.");
    expect(email.html).toContain("Validade: 25 minutos.");
    expect(email.texto).not.toContain("10 minutos");
  });

  it("rodapé com o site e quem envia (razão social + CNPJ)", () => {
    expect(urlDoSite(MARCA)).toBe("https://exemplo.com.br");
    for (const parte of [email.texto, email.html]) {
      expect(parte).toContain("https://exemplo.com.br");
      expect(parte).toContain("Empresa Fictícia Ltda");
      expect(parte).toContain("CNPJ 00.000.000/0001-00");
      expect(parte).toContain("responder este e-mail");
    }
  });

  it("escapa a marca dentro do HTML", () => {
    expect(email.html).toContain("Marca &lt;Teste&gt; &amp; Cia");
    expect(email.html).not.toContain("<Teste>");
  });
});
