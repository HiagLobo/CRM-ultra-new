import { describe, it, expect, vi } from "vitest";
import {
  verificarSenha,
  criarSessaoAdmin,
  sessaoAdminValida,
  VALIDADE_SESSAO_H,
  REGRA_LOGIN_ADMIN,
  COOKIE_ADMIN,
} from "./adminAuth";
import { assinarTokenDemo, assinarPayload } from "./token";

const SECRET = "segredo-de-teste-1234567890";
const SENHA = "senha-forte-do-admin";
const T0 = new Date("2026-06-17T12:00:00.000Z");

describe("verificarSenha (tempo constante)", () => {
  it("aceita a senha certa e recusa a errada", () => {
    expect(verificarSenha(SENHA, SENHA)).toBe(true);
    expect(verificarSenha("outra-coisa-qualquer", SENHA)).toBe(false);
  });

  it("recusa senha vazia e tamanhos diferentes sem lançar", () => {
    expect(verificarSenha("", SENHA)).toBe(false);
    expect(verificarSenha("curta", SENHA)).toBe(false);
    expect(verificarSenha(`${SENHA}x`, SENHA)).toBe(false);
    expect(() => verificarSenha("qualquer", "")).not.toThrow();
  });
});

describe("sessão do admin", () => {
  it("cria uma sessão válida por 12h e recusa depois do prazo", () => {
    const token = criarSessaoAdmin(SECRET, T0);
    expect(sessaoAdminValida(token, SECRET, T0)).toBe(true);

    const quaseLa = new Date(T0.getTime() + VALIDADE_SESSAO_H * 3_600_000 - 1000);
    const depois = new Date(T0.getTime() + VALIDADE_SESSAO_H * 3_600_000 + 1000);
    expect(sessaoAdminValida(token, SECRET, quaseLa)).toBe(true);
    expect(sessaoAdminValida(token, SECRET, depois)).toBe(false);
    expect(VALIDADE_SESSAO_H).toBe(12);
  });

  it("não guarda a senha no cookie — só a marca de admin e a expiração", () => {
    const token = criarSessaoAdmin(SECRET, T0);
    const corpo = JSON.parse(Buffer.from(token.split(".")[0]!, "base64url").toString("utf8"));
    expect(corpo).toEqual({ adm: true, exp: Math.floor(T0.getTime() / 1000) + 12 * 3600 });
    expect(token).not.toContain(SENHA);
  });

  it("recusa cookie ausente, adulterado ou assinado com outro secret", () => {
    const token = criarSessaoAdmin(SECRET, T0);
    expect(sessaoAdminValida(undefined, SECRET, T0)).toBe(false);
    expect(sessaoAdminValida("", SECRET, T0)).toBe(false);
    expect(sessaoAdminValida("nao.e.token", SECRET, T0)).toBe(false);
    expect(sessaoAdminValida(`${token}x`, SECRET, T0)).toBe(false);
    expect(sessaoAdminValida(token, "outro-segredo-1234567890", T0)).toBe(false);
  });

  it("token de demo NÃO vira sessão de admin (nem forjando o payload)", () => {
    const demo = assinarTokenDemo({ email: "corretor@exemplo.com" }, SECRET, T0);
    expect(sessaoAdminValida(demo, SECRET, T0)).toBe(false);

    // payload sem a marca de admin, mas assinado com o secret certo
    const semMarca = assinarPayload({ adm: false }, SECRET, 3600, T0);
    expect(sessaoAdminValida(semMarca, SECRET, T0)).toBe(false);
  });

  it("usa a regra de 5 tentativas / 5 min e o cookie `crm_admin`", () => {
    expect(REGRA_LOGIN_ADMIN).toEqual({ max: 5, janelaMs: 5 * 60_000 });
    expect(COOKIE_ADMIN).toBe("crm_admin");
  });
});

describe("exigirAdmin (portão de /api/admin/*)", () => {
  /** Monta uma requisição com (ou sem) o cookie de sessão. */
  async function requisicao(cookie?: string) {
    const { NextRequest } = await import("next/server");
    return new NextRequest("http://localhost/api/admin/leads", {
      headers: cookie ? { cookie } : {},
    });
  }

  it("sem cookie → 401; com sessão válida → deixa passar", async () => {
    process.env.APP_SECRET = SECRET; // em teste, `env` é o process.env (SKIP_ENV_VALIDATION)
    const { exigirAdmin } = await import("./adminAuth");

    const semCookie = exigirAdmin(await requisicao());
    expect(semCookie?.status).toBe(401);
    expect(await semCookie?.json()).toEqual({ ok: false, erro: "nao_autorizado" });

    const valido = criarSessaoAdmin(SECRET);
    expect(exigirAdmin(await requisicao(`${COOKIE_ADMIN}=${valido}`))).toBeNull();
  });

  it("cookie adulterado, de outro secret ou de demo → 401", async () => {
    process.env.APP_SECRET = SECRET;
    const { exigirAdmin } = await import("./adminAuth");
    const outro = criarSessaoAdmin("outro-segredo-1234567890");
    const demo = assinarTokenDemo({ email: "corretor@exemplo.com" }, SECRET);

    for (const valor of [`${COOKIE_ADMIN}=lixo`, `${COOKIE_ADMIN}=${outro}`, `${COOKIE_ADMIN}=${demo}`]) {
      expect(exigirAdmin(await requisicao(valor))?.status).toBe(401);
    }
  });
});

describe("sem vazamento da senha", () => {
  it("nada do fluxo de sessão loga a senha", () => {
    const logs: string[] = [];
    for (const nivel of ["log", "info", "warn", "error"] as const) {
      vi.spyOn(console, nivel).mockImplementation((...a: unknown[]) => {
        logs.push(a.map(String).join(" "));
      });
    }
    verificarSenha(SENHA, SENHA);
    verificarSenha("errada", SENHA);
    criarSessaoAdmin(SECRET, T0);
    expect(logs.join("\n")).not.toContain(SENHA);
    vi.restoreAllMocks();
  });
});
