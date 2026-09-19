import { describe, it, expect } from "vitest";
import { causaDoErro } from "./causaErro";

const comCodigo = (mensagem: string, code: string) => Object.assign(new Error(mensagem), { code });

describe("causaDoErro (log das rotas do admin)", () => {
  it("SQLSTATE do Postgres vira db:<código>", () => {
    expect(causaDoErro(comCodigo('relation "rate_limit" does not exist', "42P01"))).toBe("db:42P01");
    expect(causaDoErro(comCodigo("falha", "28P01"))).toBe("db:28P01");
  });

  it("errno do Node vira <nome>:<código>", () => {
    expect(causaDoErro(comCodigo("connect ECONNREFUSED 10.0.0.1:5432", "ECONNREFUSED"))).toBe(
      "Error:ECONNREFUSED",
    );
  });

  it("sem código fica só o nome; o que não é Error vira 'desconhecido'", () => {
    expect(causaDoErro(new TypeError("x"))).toBe("TypeError");
    expect(causaDoErro("texto solto")).toBe("desconhecido");
    expect(causaDoErro(null)).toBe("desconhecido");
  });

  it("nunca devolve a mensagem nem nome/código fora do formato esperado", () => {
    const pii = "Key (email)=(corretor@exemplo.com) already exists";
    const erro = comCodigo(pii, "23505");
    expect(causaDoErro(erro)).toBe("db:23505");
    expect(causaDoErro(erro)).not.toContain("exemplo");

    const estranho = Object.assign(new Error(pii), { name: "corretor@exemplo.com", code: "a b c" });
    expect(causaDoErro(estranho)).toBe("Error");
  });
});
