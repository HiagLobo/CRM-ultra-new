import { describe, it, expect } from "vitest";
import {
  assinarTokenDemo,
  verificarTokenDemo,
  VALIDADE_TOKEN_DIAS,
  COOKIE_TOKEN_DEMO,
} from "./token";

const SECRET = "segredo-de-teste-1234567890";
const EMAIL = "corretor@exemplo.com";
const T0 = new Date("2026-06-17T12:00:00.000Z");

describe("token de demo (HMAC)", () => {
  it("assina e verifica: devolve o payload com expiração de 7 dias", () => {
    const token = assinarTokenDemo({ email: EMAIL }, SECRET, T0);
    const payload = verificarTokenDemo(token, SECRET, T0);
    expect(payload?.email).toBe(EMAIL);
    expect(payload?.exp).toBe(Math.floor(T0.getTime() / 1000) + VALIDADE_TOKEN_DIAS * 86_400);
    expect(VALIDADE_TOKEN_DIAS).toBe(7);
    expect(COOKIE_TOKEN_DEMO).toMatch(/^crm_/); // padrão de storage do CRM Ultra (O0)
  });

  it("rejeita assinatura adulterada", () => {
    const token = assinarTokenDemo({ email: EMAIL }, SECRET, T0);
    const [corpo, assinatura] = token.split(".");
    const trocada = `${assinatura!.slice(0, -1)}${assinatura!.endsWith("A") ? "B" : "A"}`;
    expect(verificarTokenDemo(`${corpo}.${trocada}`, SECRET, T0)).toBeNull();
  });

  it("rejeita payload adulterado (troca de e-mail sem reassinar)", () => {
    const token = assinarTokenDemo({ email: EMAIL, }, SECRET, T0);
    const assinatura = token.split(".")[1]!;
    const forjado = Buffer.from(
      JSON.stringify({ email: "invasor@exemplo.com", exp: 99_999_999_999 }),
      "utf8",
    ).toString("base64url");
    expect(verificarTokenDemo(`${forjado}.${assinatura}`, SECRET, T0)).toBeNull();
  });

  it("rejeita token assinado com outro secret", () => {
    const token = assinarTokenDemo({ email: EMAIL }, "outro-segredo-1234567890", T0);
    expect(verificarTokenDemo(token, SECRET, T0)).toBeNull();
  });

  it("expira: válido antes do prazo, inválido depois", () => {
    const token = assinarTokenDemo({ email: EMAIL }, SECRET, T0);
    const quaseLa = new Date(T0.getTime() + VALIDADE_TOKEN_DIAS * 86_400_000 - 1000);
    const depois = new Date(T0.getTime() + VALIDADE_TOKEN_DIAS * 86_400_000 + 1000);
    expect(verificarTokenDemo(token, SECRET, quaseLa)?.email).toBe(EMAIL);
    expect(verificarTokenDemo(token, SECRET, depois)).toBeNull();
  });

  it("rejeita formatos malformados sem lançar", () => {
    for (const t of ["", "abc", "a.b.c", ".", "eyJ.", `${"x".repeat(50)}.${"y".repeat(43)}`]) {
      expect(verificarTokenDemo(t, SECRET, T0)).toBeNull();
    }
  });
});
