import { describe, it, expect, vi } from "vitest";
import { parseEnv } from "./env";

const base = { APP_SECRET: "x".repeat(16), ADMIN_PASSWORD: "senhaForte1" };

describe("parseEnv (env fail-closed)", () => {
  it("aceita ambiente válido e aplica default de NODE_ENV", () => {
    const env = parseEnv({ ...base });
    expect(env.NODE_ENV).toBe("development");
    expect(env.APP_SECRET.length).toBeGreaterThanOrEqual(16);
  });

  it("rejeita quando falta APP_SECRET", () => {
    expect(() => parseEnv({ ADMIN_PASSWORD: "senhaForte1" })).toThrow(/APP_SECRET/);
  });

  it("rejeita ADMIN_PASSWORD curta", () => {
    expect(() => parseEnv({ ...base, ADMIN_PASSWORD: "123" })).toThrow(/ADMIN_PASSWORD/);
  });

  it("sem RESEND_API_KEY indica modo dev de e-mail", () => {
    const env = parseEnv({ ...base });
    expect(Boolean(env.RESEND_API_KEY)).toBe(false);
  });

  it("trata RESEND_API_KEY/EMAIL_FROM vazios (.env) como não definidos", () => {
    const env = parseEnv({ ...base, RESEND_API_KEY: "", EMAIL_FROM: "" });
    expect(env.RESEND_API_KEY).toBeUndefined();
    expect(env.EMAIL_FROM).toBeUndefined();
  });

  // O7·S3: "Nome <endereço>" derrubava o build (o env valida no import)
  it("EMAIL_FROM aceita só o endereço ou Nome <endereço>", () => {
    const so = parseEnv({ ...base, EMAIL_FROM: "acesso@mail.exemplo.com.br" });
    expect(so.EMAIL_FROM).toBe("acesso@mail.exemplo.com.br");
    const comNome = parseEnv({ ...base, EMAIL_FROM: "Marca Teste <acesso@mail.exemplo.com.br>" });
    expect(comNome.EMAIL_FROM).toBe("Marca Teste <acesso@mail.exemplo.com.br>");
  });

  it("EMAIL_FROM fora do formato é recusado com o exemplo do formato certo", () => {
    expect(() => parseEnv({ ...base, EMAIL_FROM: "Marca Teste" })).toThrow(/EMAIL_FROM: use "endereço" ou "Nome <endereço>"/);
    expect(() => parseEnv({ ...base, EMAIL_FROM: "Marca\nBcc: x@exemplo.com <a@exemplo.com>" })).toThrow(/EMAIL_FROM/);
  });
});

describe("variáveis da O7·S1 (todas opcionais)", () => {
  it("LIMITE_ENVIOS_DIA: padrão 90 (abaixo dos 100/dia do Resend Free); vazio = padrão", () => {
    expect(parseEnv({ ...base }).LIMITE_ENVIOS_DIA).toBe(90);
    expect(parseEnv({ ...base, LIMITE_ENVIOS_DIA: "" }).LIMITE_ENVIOS_DIA).toBe(90);
    expect(parseEnv({ ...base, LIMITE_ENVIOS_DIA: "2500" }).LIMITE_ENVIOS_DIA).toBe(2500);
  });

  it("LIMITE_ENVIOS_DIA fora do formato para o boot com mensagem clara", () => {
    for (const ruim of ["abc", "0", "-5", "1.5"]) {
      expect(() => parseEnv({ ...base, LIMITE_ENVIOS_DIA: ruim })).toThrow(/LIMITE_ENVIOS_DIA/);
    }
  });

  it("Turnstile: as duas chaves juntas ou nenhuma — uma sozinha para o boot", () => {
    expect(parseEnv({ ...base }).TURNSTILE_SECRET_KEY).toBeUndefined();
    const ambas = parseEnv({ ...base, NEXT_PUBLIC_TURNSTILE_SITE_KEY: "site-teste", TURNSTILE_SECRET_KEY: "segredo-teste" });
    expect(ambas.TURNSTILE_SECRET_KEY).toBe("segredo-teste");
    expect(() => parseEnv({ ...base, NEXT_PUBLIC_TURNSTILE_SITE_KEY: "site-teste" })).toThrow(
      /TURNSTILE_SECRET_KEY: defina NEXT_PUBLIC_TURNSTILE_SITE_KEY e TURNSTILE_SECRET_KEY juntas/,
    );
    expect(() => parseEnv({ ...base, TURNSTILE_SECRET_KEY: "segredo-teste" })).toThrow(
      /NEXT_PUBLIC_TURNSTILE_SITE_KEY: defina/,
    );
    // vazias no .env contam como ausentes
    expect(() => parseEnv({ ...base, NEXT_PUBLIC_TURNSTILE_SITE_KEY: "", TURNSTILE_SECRET_KEY: "" })).not.toThrow();
  });

  it("AVISO_LEADS_EMAIL: opcional, mas se vier tem de ser e-mail", () => {
    expect(parseEnv({ ...base }).AVISO_LEADS_EMAIL).toBeUndefined();
    expect(parseEnv({ ...base, AVISO_LEADS_EMAIL: "avisos@exemplo.com.br" }).AVISO_LEADS_EMAIL).toBe(
      "avisos@exemplo.com.br",
    );
    expect(() => parseEnv({ ...base, AVISO_LEADS_EMAIL: "fundador" })).toThrow(/AVISO_LEADS_EMAIL/);
  });
});

/**
 * Achado da revisão final (O5·S1): sem esta trava, subir em produção sem
 * RESEND_API_KEY faria a rota devolver o código de verificação na resposta —
 * qualquer um entraria no demo com o e-mail de qualquer pessoa.
 */
describe("fallback de e-mail nunca vale em produção", () => {
  const carregarEnv = async (raw: Record<string, string | undefined>) => {
    vi.resetModules();
    const anterior = { ...process.env };
    Object.assign(process.env, raw);
    try {
      return await import("./env");
    } finally {
      process.env = anterior;
    }
  };

  it("dev sem chave → modo dev ligado; produção sem chave → desligado", async () => {
    const dev = await carregarEnv({ ...base, NODE_ENV: "development", RESEND_API_KEY: "" });
    expect(dev.emailModoDev).toBe(true);

    const prod = await carregarEnv({ ...base, NODE_ENV: "production", RESEND_API_KEY: "" });
    expect(prod.emailModoDev).toBe(false);
  });

  it("produção sem chave para o boot do provedor com mensagem clara", async () => {
    vi.resetModules();
    const anterior = { ...process.env };
    Object.assign(process.env, { ...base, NODE_ENV: "production", RESEND_API_KEY: "" });
    try {
      const { criarProvedorEmail } = await import("./email");
      expect(() => criarProvedorEmail()).toThrow(/RESEND_API_KEY é obrigatória em produção/);
    } finally {
      process.env = anterior;
      vi.resetModules();
    }
  });
});
