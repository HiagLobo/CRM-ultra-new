/**
 * GET /api/avaliacoes é a única rota PÚBLICA das avaliações — sem cookie, sem
 * senha, direto na landing. Os testes são de vazamento (nome de anônimo,
 * texto segurado ou tirado do ar, e-mail) e de cache de borda.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import type { LeadStore } from "@/lib/leadStore";
import type { AvaliacaoStore } from "@/lib/avaliacaoStore";
import { capturarConsole } from "@/features/lead/apoioTestes";
import { bancoTemporario, leadVerificado, resumoComArquivo } from "@/features/avaliacao/apoioTestes";
import type { DadosAvaliacao } from "@/lib/avaliacaoStorePorta";

const dubles = vi.hoisted(() => ({
  leads: undefined as unknown as LeadStore,
  avaliacoes: undefined as unknown as AvaliacaoStore,
}));
vi.mock("@/lib/criarLeadStore", () => ({ leadStore: () => dubles.leads }));
vi.mock("@/lib/criarAvaliacaoStore", () => ({ avaliacaoStore: () => dubles.avaliacoes }));

import { GET } from "./route";
import { limparCacheDaVitrine } from "./cacheVitrine";

const banco = bancoTemporario("rota-avaliacoes");
const T = "2026-09-19T15:00:00.000Z";

const dados = (over: Partial<DadosAvaliacao> = {}): DadosAvaliacao => ({
  estrelas: 5,
  comentario: "Organizou meu dia.",
  identificacao: "nome",
  status: "publicado",
  consentimento: { texto: "Autorizo…", em: T, ip: "203.0.113.9" },
  em: T,
  ...over,
});

beforeEach(() => {
  dubles.leads = banco.leads();
  dubles.avaliacoes = banco.avaliacoes();
  limparCacheDaVitrine(); // a rota guarda a resposta por 60 s: cada teste começa do zero
  vi.useFakeTimers({ shouldAdvanceTime: true });
  vi.setSystemTime(new Date("2026-09-20T12:00:00.000Z"));
});
afterEach(async () => {
  vi.useRealTimers();
  await banco.limpar();
  vi.restoreAllMocks();
});

describe("GET /api/avaliacoes", () => {
  it("banco vazio: 200 já com a média das três do arquivo (F4) e lista vazia", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ...resumoComArquivo(), comentarios: [] });
  });

  it("duas no banco (5 e 4) + as três do arquivo (5, 5, 4): quantas 5 e média 4,6 já somadas", async () => {
    await dubles.avaliacoes.salvar("lead-1", dados({ estrelas: 5, identificacao: "anonimo" }));
    await dubles.avaliacoes.salvar("lead-2", dados({ estrelas: 4, identificacao: "anonimo" }));
    // a tela usa estes números como chegam e NUNCA soma o arquivo de novo
    expect(await (await GET()).json()).toMatchObject({ media: 4.6, quantas: 5 });
  });

  it("guarda a resposta boa por 60 s (o Next carimba no-store nesta rota, então o cache mora aqui)", async () => {
    const chamadas = vi.spyOn(dubles.avaliacoes, "listarPublicadas");
    await GET();
    await GET();
    expect(chamadas.mock.calls.length).toBe(1); // a 2ª veio da memória

    vi.setSystemTime(new Date(Date.now() + 61_000));
    await GET();
    expect(chamadas.mock.calls.length).toBe(2); // passou de 60 s: consulta de novo
    chamadas.mockRestore();
  });

  it("erro NÃO fica guardado: a chamada seguinte tenta o banco de novo", async () => {
    const quebrado = vi.spyOn(dubles.avaliacoes, "listarPublicadas").mockRejectedValueOnce(new Error("db fora"));
    expect((await GET()).status).toBe(500);
    quebrado.mockRestore();
    expect((await GET()).status).toBe(200);
  });

  it("não vaza nome de anônimo, texto de pendente/recusado nem e-mail de ninguém", async () => {
    await dubles.leads.criar(leadVerificado({ id: "lead-1" }));
    await dubles.leads.criar(
      leadVerificado({ id: "lead-2", nome: "Anônima Exemplo", email: "anonima@exemplo.com", creci: "PE 54321" }),
    );
    await dubles.leads.criar(
      leadVerificado({ id: "lead-3", nome: "Segurada Exemplo", email: "segurada@exemplo.com", creci: "PE 99999" }),
    );
    await dubles.avaliacoes.salvar("lead-1", dados({ identificacao: "nome_creci" }));
    await dubles.avaliacoes.salvar("lead-2", dados({ identificacao: "anonimo", comentario: "Texto da anônima." }));
    await dubles.avaliacoes.salvar("lead-3", dados({ status: "pendente", comentario: "Texto segurado." }));

    const res = await GET();
    const bruto = await res.text();
    const corpo = JSON.parse(bruto) as { comentarios: { texto: string; nome?: string; creci?: string }[] };

    expect(corpo.comentarios.map((c) => c.texto).sort()).toEqual(["Organizou meu dia.", "Texto da anônima."]);
    expect(corpo.comentarios.find((c) => c.texto === "Texto da anônima.")).not.toHaveProperty("nome");
    expect(corpo.comentarios.find((c) => c.texto === "Organizou meu dia.")).toMatchObject({
      nome: "Corretor Exemplo",
      creci: "PE 12345",
    });
    for (const sensivel of ["@exemplo.com", "Anônima Exemplo", "Segurada Exemplo", "Texto segurado.", "+55", "203.0.113.9"]) {
      expect(bruto, sensivel).not.toContain(sensivel);
    }
  });

  it("a média conta todas as situações; os comentários, só as publicadas com texto", async () => {
    await dubles.avaliacoes.salvar("lead-1", dados({ estrelas: 5, identificacao: "anonimo" }));
    await dubles.avaliacoes.salvar("lead-2", dados({ estrelas: 3, status: "recusado" }));
    const corpo = (await (await GET()).json()) as { media: number; quantas: number; comentarios: unknown[] };
    expect(corpo).toMatchObject(resumoComArquivo(5, 3));
    expect(corpo.comentarios).toHaveLength(1);
  });

  it("banco com problema → 500 genérico, com só a causa no log", async () => {
    vi.spyOn(dubles.avaliacoes, "resumoContagem").mockRejectedValueOnce(
      Object.assign(new Error('relation "avaliacoes" does not exist; corretor@exemplo.com'), { code: "42P01" }),
    );
    const linhas = capturarConsole();
    const res = await GET();
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ ok: false, erro: "falha_interna" });
    expect(linhas()).toContain("db:42P01");
    expect(linhas()).not.toContain("exemplo.com");
  });
});
