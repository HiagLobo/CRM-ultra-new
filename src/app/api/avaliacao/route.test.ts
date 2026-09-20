/**
 * POST /api/avaliacao no handler de verdade: quem identifica quem avalia é o
 * cookie `crm_demo` (nunca o corpo), o Zod barra nota fora de 1–5 e o 500
 * registra só a causa. Stores em tmpdir, limitador em memória e e-mail falso
 * entram por `vi.mock` nas fábricas — nada vai para `data/`.
 */
import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from "vitest";
import { NextRequest } from "next/server";
import type { LeadStore } from "@/lib/leadStore";
import type { AvaliacaoStore } from "@/lib/avaliacaoStore";
import type { RateLimiter } from "@/lib/ratelimit";
import type { ProvedorEmail } from "@/lib/email";
import { MemoriaRateLimiter } from "@/lib/ratelimit";
import { COOKIE_TOKEN_DEMO, assinarTokenDemo } from "@/lib/token";
import { EmailFake, SECRET_TESTE, capturarConsole } from "@/features/lead/apoioTestes";
import { bancoTemporario, leadVerificado, resumoComArquivo } from "@/features/avaliacao/apoioTestes";

const dubles = vi.hoisted(() => ({
  leads: undefined as unknown as LeadStore,
  avaliacoes: undefined as unknown as AvaliacaoStore,
  limiter: undefined as unknown as RateLimiter,
  email: undefined as unknown as () => ProvedorEmail,
}));
vi.mock("@/lib/criarLeadStore", () => ({ leadStore: () => dubles.leads }));
vi.mock("@/lib/criarAvaliacaoStore", () => ({ avaliacaoStore: () => dubles.avaliacoes }));
vi.mock("@/lib/criarRateLimiter", () => ({ rateLimiter: () => dubles.limiter }));
vi.mock("@/lib/email", async (original) => ({
  ...(await original<typeof import("@/lib/email")>()),
  provedorEmail: () => dubles.email(),
}));

import { POST } from "./route";

const EMAIL = "corretor@exemplo.com";
const banco = bancoTemporario("rota-avaliacao");
let email: EmailFake;

beforeAll(() => {
  process.env.APP_SECRET = SECRET_TESTE; // em teste, `env` é o process.env
});
beforeEach(() => {
  email = new EmailFake();
  dubles.leads = banco.leads();
  dubles.avaliacoes = banco.avaliacoes();
  dubles.limiter = new MemoriaRateLimiter();
  dubles.email = () => email;
});
afterEach(async () => {
  await banco.limpar();
  vi.restoreAllMocks();
});

const cookieValido = () => `${COOKIE_TOKEN_DEMO}=${assinarTokenDemo({ email: EMAIL }, SECRET_TESTE)}`;

function avaliar(corpo: unknown, cookie?: string) {
  const headers: Record<string, string> = { "Content-Type": "application/json", "x-forwarded-for": "203.0.113.9" };
  if (cookie) headers.cookie = cookie;
  return POST(
    new NextRequest("http://localhost/api/avaliacao", { method: "POST", headers, body: JSON.stringify(corpo) }),
  );
}

const CORPO = { estrelas: 5, comentario: "Organizou meu dia.", identificacao: "nome" };

describe("quem não tem o demo liberado não avalia", () => {
  it("sem cookie → 401 sem_acesso, e nada é lido nem gravado", async () => {
    const buscar = vi.spyOn(dubles.leads, "buscarPorEmail");
    const salvar = vi.spyOn(dubles.avaliacoes, "salvar");
    const res = await avaliar(CORPO);
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ ok: false, erro: "sem_acesso" });
    expect(buscar).not.toHaveBeenCalled();
    expect(salvar).not.toHaveBeenCalled();
  });

  it("cookie forjado, de outro segredo, vencido ou do admin → 401", async () => {
    const ontem = new Date(Date.now() - 8 * 86_400_000);
    for (const cookie of [
      `${COOKIE_TOKEN_DEMO}=lixo`,
      `${COOKIE_TOKEN_DEMO}=${assinarTokenDemo({ email: EMAIL }, "outro-segredo-1234567890")}`,
      `${COOKIE_TOKEN_DEMO}=${assinarTokenDemo({ email: EMAIL }, SECRET_TESTE, ontem)}`,
      "crm_admin=qualquer",
    ]) {
      expect((await avaliar(CORPO, cookie)).status).toBe(401);
    }
  });

  it("cookie válido de lead que foi excluído (LGPD) → 401, sem gravar avaliação órfã", async () => {
    const salvar = vi.spyOn(dubles.avaliacoes, "salvar");
    const res = await avaliar(CORPO, cookieValido());
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ ok: false, erro: "sem_acesso" });
    expect(salvar).not.toHaveBeenCalled();
  });
});

describe("validação e regras", () => {
  beforeEach(async () => {
    await dubles.leads.criar(leadVerificado());
  });

  it("nota fora de 1–5, decimal, escolha inventada e JSON quebrado → 400", async () => {
    for (const corpo of [
      { ...CORPO, estrelas: 0 },
      { ...CORPO, estrelas: 6 },
      { ...CORPO, estrelas: 4.5 },
      { ...CORPO, estrelas: "5" },
      { ...CORPO, identificacao: "inventado" },
      { comentario: "sem nota" },
    ]) {
      const res = await avaliar(corpo, cookieValido());
      expect(res.status, JSON.stringify(corpo)).toBe(400);
      expect((await res.json()).erro).toBe("dados_invalidos");
    }
  });

  it("comentário acima de 400 caracteres → 400 (o filtro nem chega a ser chamado)", async () => {
    const res = await avaliar({ ...CORPO, comentario: "a".repeat(401) }, cookieValido());
    expect(res.status).toBe(400);
    expect((await res.json()).campos).toHaveProperty("comentario");
  });

  it("pediu nome e o cadastro não tem nome → 409 sem_nome", async () => {
    dubles.leads = banco.leads();
    await dubles.leads.criar(leadVerificado({ nome: undefined }));
    const res = await avaliar(CORPO, cookieValido());
    expect(res.status).toBe(409);
    expect(await res.json()).toEqual({ ok: false, erro: "sem_nome" });
  });

  it("6º envio em 30 min → 429", async () => {
    for (let i = 0; i < 5; i++) expect((await avaliar(CORPO, cookieValido())).status).toBe(200);
    const barrado = await avaliar(CORPO, cookieValido());
    expect(barrado.status).toBe(429);
    expect((await barrado.json()).erro).toBe("limitado");
  });
});

describe("resposta do caminho feliz", () => {
  beforeEach(async () => {
    await dubles.leads.criar(leadVerificado());
  });

  it("200 com situação e resumo — e sem nome, e-mail, id ou texto na resposta", async () => {
    const res = await avaliar(CORPO, cookieValido());
    expect(res.status).toBe(200);
    const bruto = await res.text();
    expect(JSON.parse(bruto)).toEqual({ ok: true, status: "publicado", resumo: resumoComArquivo(5) });
    for (const sensivel of ["exemplo.com", "Corretor Exemplo", "PE 12345", "Organizou", "203.0.113.9"]) {
      expect(bruto).not.toContain(sensivel);
    }
  });

  it("comentário com link entra como pendente, e a nota conta na hora", async () => {
    const res = await avaliar({ ...CORPO, comentario: "veja em www.exemplo.test" }, cookieValido());
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, status: "pendente", resumo: resumoComArquivo(5) });
  });

  it("avisa o fundador sem PII quando há AVISO_LEADS_EMAIL", async () => {
    process.env.AVISO_LEADS_EMAIL = "avisos@exemplo.com.br";
    try {
      expect((await avaliar({ ...CORPO, estrelas: 4 }, cookieValido())).status).toBe(200);
      expect(email.avaliacoes).toEqual([{ para: "avisos@exemplo.com.br", estrelas: 4, pendente: false }]);
    } finally {
      delete process.env.AVISO_LEADS_EMAIL;
    }
  });

  it("a rota não reemite cookie nenhum (quem libera o demo é a verificação)", async () => {
    const res = await avaliar(CORPO, cookieValido());
    expect(res.headers.get("set-cookie")).toBeNull();
  });
});

describe("falha do banco", () => {
  it("migração 006 pendente → 500 genérico e log só com a causa (db:42P01)", async () => {
    await dubles.leads.criar(leadVerificado());
    vi.spyOn(dubles.avaliacoes, "doLead").mockRejectedValueOnce(
      Object.assign(new Error('relation "avaliacoes" does not exist; corretor@exemplo.com'), { code: "42P01" }),
    );
    const linhas = capturarConsole();

    const res = await avaliar(CORPO, cookieValido());
    expect(res.status).toBe(500);
    expect((await res.json()).erro).toBe("falha_interna");
    expect(linhas()).toContain("db:42P01");
    expect(linhas()).not.toContain("exemplo.com");
  });
});
