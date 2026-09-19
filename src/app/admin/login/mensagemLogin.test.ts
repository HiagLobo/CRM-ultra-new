import { describe, it, expect } from "vitest";
import { mensagemDeFalhaNoLogin } from "./mensagemLogin";

describe("mensagem do login do admin", () => {
  it("5xx é erro no servidor, nunca 'senha incorreta'", () => {
    for (const status of [500, 502, 503, 504]) {
      expect(mensagemDeFalhaNoLogin(status)).toBe("erro no servidor, tente de novo.");
    }
  });

  it("401 é senha incorreta; 429 pede para aguardar", () => {
    expect(mensagemDeFalhaNoLogin(401)).toBe("senha incorreta.");
    expect(mensagemDeFalhaNoLogin(429)).toContain("muitas tentativas");
  });

  it("outro status não finge ser senha errada", () => {
    expect(mensagemDeFalhaNoLogin(400)).not.toContain("senha");
  });
});
