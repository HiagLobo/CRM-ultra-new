/**
 * Authz das rotas do admin — testado nos handlers de verdade (não em mock).
 * Fecha a lacuna da O4, onde isso só era provado por smoke manual.
 *
 * Só exercita caminhos que NÃO escrevem em disco: 401 em todas as rotas, o GET
 * autorizado (que apenas lê) e o login. Export/PATCH autorizados escreveriam em
 * `data/` do projeto — ficam com os testes de domínio + smoke. Falhas do banco
 * são simuladas com spy no store/limitador em uso, restaurado a cada teste.
 */
import { describe, it, expect, beforeAll, afterEach, vi } from "vitest";
import { NextRequest } from "next/server";
import { COOKIE_ADMIN, criarSessaoAdmin } from "./adminAuth";
import { leadStore } from "./criarLeadStore";
import { rateLimiter } from "./criarRateLimiter";
import type { Lead } from "@/features/lead/lead";

const SECRET = "segredo-de-teste-1234567890";
const SENHA = "senha-forte-do-admin";

beforeAll(() => {
  // em teste, `env` é o process.env (SKIP_ENV_VALIDATION)
  process.env.APP_SECRET = SECRET;
  process.env.ADMIN_PASSWORD = SENHA;
});

afterEach(() => {
  vi.restoreAllMocks();
});

/** Erro como o do pg: SQLSTATE no `code` e dado da linha na mensagem. */
const erroDoBanco = () =>
  Object.assign(new Error('relation "rate_limit" does not exist; corretor@exemplo.com'), { code: "42P01" });

function req(url: string, init: { metodo?: string; cookie?: string; ip?: string; corpo?: unknown } = {}) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (init.cookie) headers.cookie = init.cookie;
  if (init.ip) headers["x-forwarded-for"] = init.ip;
  return new NextRequest(`http://localhost${url}`, {
    method: init.metodo ?? "GET",
    headers,
    ...(init.corpo !== undefined ? { body: JSON.stringify(init.corpo) } : {}),
  });
}

const sessao = () => `${COOKIE_ADMIN}=${criarSessaoAdmin(SECRET)}`;

describe("toda rota /api/admin/* barra sem sessão", () => {
  it("GET /api/admin/leads → 401", async () => {
    const { GET } = await import("@/app/api/admin/leads/route");
    const res = await GET(req("/api/admin/leads"));
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ ok: false, erro: "nao_autorizado" });
  });

  it("PATCH /api/admin/leads → 401 (e não chega a tocar o lead)", async () => {
    const { PATCH } = await import("@/app/api/admin/leads/route");
    const res = await PATCH(
      req("/api/admin/leads", { metodo: "PATCH", corpo: { id: "x", status: "contatado" } }),
    );
    expect(res.status).toBe(401);
  });

  it("GET /api/admin/export → 401", async () => {
    const { GET } = await import("@/app/api/admin/export/route");
    expect((await GET(req("/api/admin/export"))).status).toBe(401);
  });

  it("DELETE /api/admin/leads → 401 (exclusão LGPD não é anônima)", async () => {
    const { DELETE } = await import("@/app/api/admin/leads/route");
    const res = await DELETE(req("/api/admin/leads", { metodo: "DELETE", corpo: { id: "x" } }));
    expect(res.status).toBe(401);
  });

  it("DELETE com sessão mas id inexistente → 404, sem apagar nada por engano", async () => {
    const { DELETE } = await import("@/app/api/admin/leads/route");
    const res = await DELETE(
      req("/api/admin/leads", { metodo: "DELETE", cookie: sessao(), corpo: { id: "nao-existe" } }),
    );
    expect(res.status).toBe(404);
    expect((await res.json()).erro).toBe("lead_nao_encontrado");
  });

  it("cookie forjado, de outro secret ou token de demo → 401", async () => {
    const { GET } = await import("@/app/api/admin/leads/route");
    const outro = criarSessaoAdmin("outro-segredo-1234567890");
    for (const cookie of [`${COOKIE_ADMIN}=lixo`, `${COOKIE_ADMIN}=${outro}`, "crm_demo=qualquer"]) {
      expect((await GET(req("/api/admin/leads", { cookie }))).status).toBe(401);
    }
  });

  it("com sessão válida, o GET responde (resumo + lista)", async () => {
    const { GET } = await import("@/app/api/admin/leads/route");
    const res = await GET(req("/api/admin/leads", { cookie: sessao() }));
    expect(res.status).toBe(200);
    const corpo = await res.json();
    expect(corpo.ok).toBe(true);
    expect(corpo.resumo).toHaveProperty("total");
    expect(Array.isArray(corpo.leads)).toBe(true);
  });
});

describe("GET /api/admin/leads com sessão: só o necessário, e falha com causa", () => {
  const completo = {
    id: "lead-1",
    email: "corretor@exemplo.com",
    telefone: "+5581988887777",
    creci: "PE 12345",
    status: "verificado",
    consentimento: { texto: "texto-da-politica", aceitoEm: "2026-06-17T12:00:00.000Z", ip: "203.0.113.9" },
    codigo: {
      hash: "hash-do-codigo",
      expiraEm: "2026-06-17T12:10:00.000Z",
      tentativas: 1,
      enviadoEm: "2026-06-17T12:00:00.000Z",
    },
    verificadoEm: "2026-06-17T12:05:00.000Z",
    criadoEm: "2026-06-17T12:00:00.000Z",
    atualizadoEm: "2026-06-17T12:05:00.000Z",
  } as Lead;

  it("a resposta leva o contato, sem hash do código, IP e texto do consentimento", async () => {
    vi.spyOn(leadStore(), "listar").mockResolvedValueOnce([completo]);
    const { GET } = await import("@/app/api/admin/leads/route");
    const res = await GET(req("/api/admin/leads", { cookie: sessao() }));
    expect(res.status).toBe(200);

    const bruto = await res.text();
    expect(JSON.parse(bruto).leads[0]).toMatchObject({ id: "lead-1", email: "corretor@exemplo.com" });
    for (const sensivel of ["hash-do-codigo", "203.0.113.9", "texto-da-politica", "consentimento", "codigo"]) {
      expect(bruto).not.toContain(sensivel);
    }
  });

  it("banco com problema → 500 genérico; o log leva só a causa (db:SQLSTATE)", async () => {
    vi.spyOn(leadStore(), "listar").mockRejectedValueOnce(erroDoBanco());
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const { GET } = await import("@/app/api/admin/leads/route");
    const res = await GET(req("/api/admin/leads", { cookie: sessao() }));
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ ok: false, erro: "falha_interna" });
    expect(log).toHaveBeenCalledWith("[/api/admin/leads] GET:", "db:42P01");
    expect(JSON.stringify(log.mock.calls)).not.toContain("exemplo.com");
  });
});

describe("login do admin", () => {
  /** Cada teste usa um IP próprio — o rate-limit é por IP, então não interferem. */
  const chamar = async (senha: unknown, ip: string) => {
    const { POST } = await import("@/app/api/admin/login/route");
    return POST(req("/api/admin/login", { metodo: "POST", corpo: { senha }, ip }));
  };

  it("senha errada e corpo inválido devolvem o MESMO 401 genérico", async () => {
    const errada = await chamar("chute", "1.1.1.1");
    const invalido = await chamar(undefined, "1.1.1.2");
    expect(errada.status).toBe(401);
    expect(invalido.status).toBe(401);
    expect(await errada.json()).toEqual(await invalido.json());
  });

  it("senha certa abre a sessão em cookie httpOnly — sem a senha dentro", async () => {
    const res = await chamar(SENHA, "2.2.2.2");
    expect(res.status).toBe(200);
    const cookie = res.headers.get("set-cookie") ?? "";
    expect(cookie).toContain(`${COOKIE_ADMIN}=`);
    expect(cookie.toLowerCase()).toContain("httponly");
    expect(cookie.toLowerCase()).toContain("samesite=lax");
    expect(cookie).not.toContain(SENHA);
  });

  it("brute-force: a 6ª tentativa do mesmo IP é barrada com 429", async () => {
    const ip = "3.3.3.3";
    for (let i = 0; i < 5; i++) {
      expect((await chamar("errada", ip)).status).toBe(401);
    }
    const barrado = await chamar("errada", ip);
    expect(barrado.status).toBe(429);
    expect((await barrado.json()).erro).toBe("limitado");

    // outro IP não é afetado
    expect((await chamar("errada", "4.4.4.4")).status).toBe(401);
  });

  it("falha do servidor (ex.: rate_limit sem tabela) → 500, não o 401 de senha errada", async () => {
    vi.spyOn(rateLimiter(), "permitir").mockRejectedValueOnce(erroDoBanco());
    const log = vi.spyOn(console, "error").mockImplementation(() => {});

    const res = await chamar(SENHA, "5.5.5.5"); // até com a senha certa
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ ok: false, erro: "falha_interna" });
    expect(res.headers.get("set-cookie")).toBeNull(); // falhou: nenhuma sessão aberta
    expect(log).toHaveBeenCalledWith("[/api/admin/login] POST:", "db:42P01");
    const logado = JSON.stringify(log.mock.calls);
    expect(logado).not.toContain("exemplo.com");
    expect(logado).not.toContain(SENHA);
  });
});
