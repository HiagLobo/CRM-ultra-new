import { describe, it, expect } from "vitest";
import { ErroConfiguracao, causaDoErro } from "./erros";
import { PRAZO_ESGOTADO } from "./prazo";

describe("causaDoErro — categoria segura para log", () => {
  it("configuração: o nome da variável, nunca a mensagem", () => {
    const erro = new ErroConfiguracao("RESEND_API_KEY", "texto qualquer com detalhe");
    expect(causaDoErro(erro, "email")).toBe("config:RESEND_API_KEY");
  });

  it("outros erros: prefixo + nome do erro, sem a mensagem (que pode ter o destinatário)", () => {
    const erro = new Error("falhou ao enviar para corretor@exemplo.com");
    expect(causaDoErro(erro, "email")).toBe("email:Error");
    expect(causaDoErro(Object.assign(new Error("x"), { name: PRAZO_ESGOTADO }), "email")).toBe("email:PrazoEsgotado");
    expect(causaDoErro("corretor@exemplo.com", "email")).toBe("email:desconhecido");
  });
});
