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
