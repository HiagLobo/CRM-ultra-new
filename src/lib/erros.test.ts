/**
 * `causaDoErro` — uma categoria por tipo de falha (O7·S2), sempre sem PII: o
 * teste põe e-mail, telefone, CRECI, host e senha na MENSAGEM de cada erro e
 * confere que nada disso aparece na causa.
 */
import { describe, it, expect } from "vitest";
import { ErroConfiguracao, ErroEnvioEmail, causaDoErro } from "./erros";
import { PRAZO_ESGOTADO } from "./prazo";

/** Tudo o que não pode vazar para o log, embutido nas mensagens de erro. Fictício. */
const PII = "corretor@exemplo.com +5511900000000 SP-12345 db.exemplo.invalid:5432 senha-ficticia";

const comCodigo = (code: string, nome = "Error") => Object.assign(new Error(`${PII} (${code})`), { code, name: nome });

function semPII(causa: string) {
  for (const trecho of PII.split(" ")) expect(causa).not.toContain(trecho);
}

describe("causaDoErro — config:<VARIÁVEL>", () => {
  it("o nome da variável, nunca a mensagem", () => {
    const erro = new ErroConfiguracao("DATABASE_URL", `faltou; ${PII}`);
    expect(causaDoErro(erro)).toBe("config:DATABASE_URL");
    expect(causaDoErro(new ErroConfiguracao("RESEND_API_KEY", PII), "email")).toBe("config:RESEND_API_KEY");
    semPII(causaDoErro(erro));
  });

  it("reconhece pelo nome mesmo vindo de outra cópia do módulo (sem instanceof)", () => {
    const deOutroModulo = Object.assign(new Error(PII), { name: "ErroConfiguracao", variavel: "EMAIL_FROM" });
    expect(causaDoErro(deOutroModulo)).toBe("config:EMAIL_FROM");
  });

  it("variável fora do formato não vira causa (nada de texto livre no log)", () => {
    const forjado = Object.assign(new Error("x"), { name: "ErroConfiguracao", variavel: "corretor@exemplo.com" });
    expect(causaDoErro(forjado)).toBe("erro:ErroConfiguracao");
  });
});

describe("causaDoErro — email:<código do Resend>", () => {
  it("o código do erro do Resend, nunca a mensagem", () => {
    const erro = new ErroEnvioEmail("daily_quota_exceeded");
    expect(causaDoErro(erro, "email")).toBe("email:daily_quota_exceeded");
    expect(causaDoErro(new ErroEnvioEmail("invalid_api_Key"))).toBe("email:invalid_api_Key");
    expect(erro.message).toBe("falha no envio de e-mail (daily_quota_exceeded)");
  });

  it("código ausente ou fora do formato vira email:desconhecido", () => {
    expect(causaDoErro(new ErroEnvioEmail(undefined))).toBe("email:desconhecido");
    expect(causaDoErro(new ErroEnvioEmail("para corretor@exemplo.com"))).toBe("email:desconhecido");
    expect(causaDoErro(new ErroEnvioEmail({ name: "x" }))).toBe("email:desconhecido");
  });

  it("prazo do envio e erro genérico seguem com o prefixo (O7·S1)", () => {
    expect(causaDoErro(Object.assign(new Error(PII), { name: PRAZO_ESGOTADO }), "email")).toBe("email:PrazoEsgotado");
    expect(causaDoErro(new Error(PII), "email")).toBe("email:Error");
    expect(causaDoErro(PII, "email")).toBe("email:desconhecido");
  });
});

describe("causaDoErro — db:<SQLSTATE> e conexão com o banco", () => {
  it("erro do Postgres (o DatabaseError tem name 'error'): o SQLSTATE, sem os valores da linha", () => {
    for (const code of ["42P01", "28P01", "3D000", "53300", "53100", "57P01", "08006", "XX000", "23505"]) {
      const causa = causaDoErro(comCodigo(code, "error"));
      expect(causa).toBe(`db:${code}`);
      semPII(causa);
    }
  });

  it("prazo e queda de conexão do pg/pg-pool (vêm sem código) têm categoria própria", () => {
    expect(causaDoErro(new Error("timeout exceeded when trying to connect"))).toBe("db:PrazoConexao");
    expect(causaDoErro(new Error("Connection terminated due to connection timeout"))).toBe("db:PrazoConexao");
    expect(causaDoErro(new Error("Connection terminated unexpectedly"))).toBe("db:ConexaoEncerrada");
  });

  it("só a mensagem exata da biblioteca: parecida ou 'mágica' cai no genérico", () => {
    expect(causaDoErro(new Error(`timeout exceeded when trying to connect ${PII}`))).toBe("erro:Error");
    expect(causaDoErro(new Error("constructor"))).toBe("erro:Error");
  });
});

describe("causaDoErro — rede:<errno> e tls:<código>", () => {
  it("não alcançou o servidor: o errno, sem host nem porta", () => {
    for (const code of ["ENOTFOUND", "ECONNREFUSED", "ETIMEDOUT", "ECONNRESET", "EAI_AGAIN"]) {
      const causa = causaDoErro(comCodigo(code));
      expect(causa).toBe(`rede:${code}`);
      semPII(causa);
    }
  });

  it("certificado recusado: o código do TLS", () => {
    expect(causaDoErro(comCodigo("ERR_TLS_CERT_ALTNAME_INVALID"))).toBe("tls:ERR_TLS_CERT_ALTNAME_INVALID");
    expect(causaDoErro(comCodigo("SELF_SIGNED_CERT_IN_CHAIN"))).toBe("tls:SELF_SIGNED_CERT_IN_CHAIN");
  });

  it("código interno do Node (ERR_*) não é rede: fica o nome do erro", () => {
    expect(causaDoErro(comCodigo("ERR_INVALID_ARG_TYPE", "TypeError"))).toBe("erro:TypeError");
  });
});

describe("causaDoErro — o resto", () => {
  it("prefixo padrão 'erro' + nome do erro; o que não é Error vira desconhecido", () => {
    expect(causaDoErro(new TypeError(PII))).toBe("erro:TypeError");
    expect(causaDoErro(null)).toBe("erro:desconhecido");
    expect(causaDoErro({ code: "42P01" })).toBe("erro:desconhecido");
  });

  it("nome ou código fora do formato nunca entram na causa", () => {
    const estranho = Object.assign(new Error(PII), { name: "corretor@exemplo.com", code: "a b c" });
    expect(causaDoErro(estranho)).toBe("erro:Error");
    semPII(causaDoErro(estranho));
  });
});
