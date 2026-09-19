import { describe, it, expect } from "vitest";
import { interpretarRemetente, montarRemetente } from "./remetente";

const ENDERECO = "acesso@mail.exemplo.com.br";

describe("interpretarRemetente (EMAIL_FROM)", () => {
  it("aceita só o endereço", () => {
    expect(interpretarRemetente(ENDERECO)).toEqual({ endereco: ENDERECO });
    expect(interpretarRemetente(`  ${ENDERECO}  `)).toEqual({ endereco: ENDERECO });
  });

  it("aceita Nome <endereço>, com ou sem aspas no nome", () => {
    expect(interpretarRemetente(`Marca Teste <${ENDERECO}>`)).toEqual({ nome: "Marca Teste", endereco: ENDERECO });
    expect(interpretarRemetente(`"Marca Teste" <${ENDERECO}>`)).toEqual({ nome: "Marca Teste", endereco: ENDERECO });
    expect(interpretarRemetente(`Marca Teste<${ENDERECO}>`)).toEqual({ nome: "Marca Teste", endereco: ENDERECO });
  });

  it("<endereço> sem nome vale como só o endereço", () => {
    expect(interpretarRemetente(`<${ENDERECO}>`)).toEqual({ endereco: ENDERECO });
  });

  it.each([
    "Marca Teste",
    "Marca Teste <>",
    "Marca Teste <nao-e-email>",
    `Marca Teste ${ENDERECO}`,
    `Marca <Teste> <${ENDERECO}>`,
    `Marca "Teste" <${ENDERECO}>`,
    `Marca\r\nBcc: alguem@exemplo.com <${ENDERECO}>`, // injeção de cabeçalho
    `Marca\tTeste <${ENDERECO}>`,
    "",
  ])("recusa %j", (valor) => {
    expect(interpretarRemetente(valor)).toBeNull();
  });

  it("quebra de linha nas pontas (copiar/colar no painel) é aparada, não recusada", () => {
    expect(interpretarRemetente(`${ENDERECO}\n`)).toEqual({ endereco: ENDERECO });
  });
});

describe("montarRemetente (from do envio)", () => {
  it("só o endereço → usa o nome padrão da marca", () => {
    expect(montarRemetente({ endereco: ENDERECO }, "Marca Teste")).toBe(`Marca Teste <${ENDERECO}>`);
  });

  it("com nome → mantém o nome do EMAIL_FROM", () => {
    expect(montarRemetente({ nome: "Outro Nome", endereco: ENDERECO }, "Marca Teste")).toBe(
      `Outro Nome <${ENDERECO}>`,
    );
  });

  it("nome com caractere especial vai entre aspas (RFC 5322)", () => {
    expect(montarRemetente({ endereco: ENDERECO }, "Marca, Teste Ltda.")).toBe(`"Marca, Teste Ltda." <${ENDERECO}>`);
  });

  it("marca sem nome curto → só o endereço (nunca \" <endereço>\")", () => {
    expect(montarRemetente({ endereco: ENDERECO }, "  ")).toBe(ENDERECO);
  });

  it("nunca deixa quebra de linha ou aspas soltas chegarem ao cabeçalho", () => {
    const r = montarRemetente({ endereco: ENDERECO }, 'Marca\r\n"Teste"');
    expect(r).not.toMatch(/[\r\n]/);
    expect(r).toBe(`MarcaTeste <${ENDERECO}>`);
  });
});
