/**
 * `/api/admin/avaliacoes` devolve o texto do comentário e quem escreveu: a
 * porta é o `exigirAdmin`, e os testes provam que ela fecha nos dois handlers.
 * A moderação registra auditoria com id e situação — nunca texto nem pessoa.
 * Auditoria e stores entram por `vi.mock`: nada vai para `data/`.
 */
import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from "vitest";
import { NextRequest } from "next/server";
import type { LeadStore } from "@/lib/leadStore";
import type { AvaliacaoStore } from "@/lib/avaliacaoStore";
import type { EventoAuditoria } from "@/lib/auditoria";
import { COOKIE_ADMIN, criarSessaoAdmin } from "@/lib/adminAuth";
import { SECRET_TESTE, capturarConsole } from "@/features/lead/apoioTestes";
import { bancoTemporario, leadVerificado, resumoComArquivo } from "@/features/avaliacao/apoioTestes";
import type { DadosAvaliacao } from "@/lib/avaliacaoStorePorta";

const dubles = vi.hoisted(() => ({
  leads: undefined as unknown as LeadStore,
  avaliacoes: undefined as unknown as AvaliacaoStore,
  auditoria: [] as { acao: string; dados: EventoAuditoria["dados"] }[],
}));
vi.mock("@/lib/criarLeadStore", () => ({ leadStore: () => dubles.leads }));
vi.mock("@/lib/criarAvaliacaoStore", () => ({ avaliacaoStore: () => dubles.avaliacoes }));
vi.mock("@/lib/auditoria", () => ({
  registrarAuditoria: async (acao: string, dados: EventoAuditoria["dados"]) => {
    dubles.auditoria.push({ acao, dados });
  },
}));

import { GET, PATCH } from "./route";

const banco = bancoTemporario("rota-admin-avaliacoes");
const T = "2026-09-19T15:00:00.000Z";

const dados = (over: Partial<DadosAvaliacao> = {}): DadosAvaliacao => ({
  estrelas: 5,
  comentario: "Texto que só o painel vê.",
  identificacao: "nome",
  status: "publicado",
  consentimento: { texto: "Autorizo…", em: T, ip: "203.0.113.9" },
  em: T,
  ...over,
});

beforeAll(() => {
  process.env.APP_SECRET = SECRET_TESTE; // em teste, `env` é o process.env
});
beforeEach(() => {
  dubles.leads = banco.leads();
  dubles.avaliacoes = banco.avaliacoes();
  dubles.auditoria = [];
});
afterEach(async () => {
  await banco.limpar();
  vi.restoreAllMocks();
});

const sessao = () => `${COOKIE_ADMIN}=${criarSessaoAdmin(SECRET_TESTE)}`;

function req(metodo: string, corpo?: unknown, cookie?: string) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (cookie) headers.cookie = cookie;
  return new NextRequest("http://localhost/api/admin/avaliacoes", {
    method: metodo,
    headers,
    ...(corpo !== undefined ? { body: JSON.stringify(corpo) } : {}),
  });
}

describe("sem sessão de admin, nada", () => {
  it("GET → 401, sem ler avaliação nenhuma", async () => {
    const listar = vi.spyOn(dubles.avaliacoes, "listarTodas");
    const res = await GET(req("GET"));
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ ok: false, erro: "nao_autorizado" });
    expect(listar).not.toHaveBeenCalled();
  });

  it("PATCH → 401, sem mudar situação nem registrar auditoria", async () => {
    const trocar = vi.spyOn(dubles.avaliacoes, "trocarStatus");
    const res = await PATCH(req("PATCH", { id: "aval-1", status: "recusado" }));
    expect(res.status).toBe(401);
    expect(trocar).not.toHaveBeenCalled();
    expect(dubles.auditoria).toEqual([]);
  });

  it("cookie de demo ou de outro segredo não abre o painel", async () => {
    for (const cookie of ["crm_demo=qualquer", `${COOKIE_ADMIN}=${criarSessaoAdmin("outro-segredo-1234567890")}`]) {
      expect((await GET(req("GET", undefined, cookie))).status).toBe(401);
    }
  });
});

describe("GET com sessão: o fundador vê tudo", () => {
  it("lista com quem avaliou, o motivo do que ficou pendente e o resumo do topo", async () => {
    await dubles.leads.criar(leadVerificado());
    await dubles.avaliacoes.salvar("lead-1", dados({ estrelas: 4, status: "pendente", comentario: "zap 81900000001" }));

    const res = await GET(req("GET", undefined, sessao()));
    expect(res.status).toBe(200);
    const corpo = await res.json();
    expect(corpo.resumo).toEqual(resumoComArquivo(4)); // o mesmo número do site
    expect(corpo.avaliacoes[0]).toMatchObject({
      leadId: "lead-1",
      estrelas: 4,
      status: "pendente",
      motivo: "telefone",
      autor: { nome: "Corretor Exemplo", email: "corretor@exemplo.com", creci: "PE 12345" },
    });
  });

  it("nem no painel sai o carimbo do consentimento (texto e IP ficam no banco)", async () => {
    await dubles.leads.criar(leadVerificado());
    await dubles.avaliacoes.salvar("lead-1", dados());
    const bruto = await (await GET(req("GET", undefined, sessao()))).text();
    expect(bruto).not.toContain("203.0.113.9");
    expect(bruto).not.toContain("Autorizo");
  });

  it("banco com problema → 500 genérico, com só a causa no log", async () => {
    vi.spyOn(dubles.avaliacoes, "listarTodas").mockRejectedValueOnce(
      Object.assign(new Error('relation "avaliacoes" does not exist; corretor@exemplo.com'), { code: "42P01" }),
    );
    const linhas = capturarConsole();
    const res = await GET(req("GET", undefined, sessao()));
    expect(res.status).toBe(500);
    expect(linhas()).toContain("db:42P01");
    expect(linhas()).not.toContain("exemplo.com");
  });
});

describe("PATCH com sessão: tirar do site e publicar de volta", () => {
  async function comAvaliacao() {
    await dubles.leads.criar(leadVerificado());
    return dubles.avaliacoes.salvar("lead-1", dados());
  }

  it("recusado tira o texto do ar e a auditoria leva só id, de e para", async () => {
    const aval = await comAvaliacao();
    const res = await PATCH(req("PATCH", { id: aval.id, status: "recusado" }, sessao()));
    expect(res.status).toBe(200);
    expect((await res.json()).avaliacao).toMatchObject({ id: aval.id, status: "recusado" });
    expect(await dubles.avaliacoes.listarPublicadas(12)).toEqual([]);

    expect(dubles.auditoria).toEqual([
      { acao: "avaliacao.status", dados: { id: aval.id, de: "publicado", para: "recusado" } },
    ]);
    const cru = JSON.stringify(dubles.auditoria);
    for (const sensivel of ["Texto que só o painel vê.", "exemplo.com", "Corretor Exemplo", "203.0.113.9"]) {
      expect(cru).not.toContain(sensivel);
    }
  });

  it("publicado devolve ao ar o que o filtro tinha segurado", async () => {
    await dubles.leads.criar(leadVerificado());
    const aval = await dubles.avaliacoes.salvar("lead-1", dados({ status: "pendente" }));
    const res = await PATCH(req("PATCH", { id: aval.id, status: "publicado" }, sessao()));
    expect(res.status).toBe(200);
    expect(await dubles.avaliacoes.listarPublicadas(12)).toHaveLength(1);
    expect(dubles.auditoria[0]!.dados).toMatchObject({ de: "pendente", para: "publicado" });
  });

  it("situação fora do permitido (pendente, inventada) ou id faltando → 400", async () => {
    for (const corpo of [{ id: "x", status: "pendente" }, { id: "x", status: "sei_la" }, { status: "recusado" }, { id: "" }]) {
      const res = await PATCH(req("PATCH", corpo, sessao()));
      expect(res.status, JSON.stringify(corpo)).toBe(400);
    }
    expect(dubles.auditoria).toEqual([]);
  });

  it("id que não existe → 404, sem auditoria", async () => {
    const res = await PATCH(req("PATCH", { id: "nao-existe", status: "recusado" }, sessao()));
    expect(res.status).toBe(404);
    expect((await res.json()).erro).toBe("avaliacao_nao_encontrada");
    expect(dubles.auditoria).toEqual([]);
  });
});
