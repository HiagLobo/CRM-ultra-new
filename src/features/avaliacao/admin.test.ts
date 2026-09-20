/**
 * Painel de avaliações: o fundador vê tudo (é a tela atrás de senha), o motivo
 * de cada uma que o filtro segurou, e a moderação registra auditoria com id e
 * situação — nunca o texto nem quem escreveu.
 */
import { describe, it, expect, afterEach } from "vitest";
import { avaliar } from "./avaliar";
import { listarParaAdmin, moderar, paraAvaliacaoAdmin } from "./admin";
import { bancoTemporario, entradaAvaliacao, leadVerificado, resumoComArquivo } from "./apoioTestes";
import type { DepsAvaliar } from "./avaliar";

const banco = bancoTemporario("admin-avaliacoes");
afterEach(() => banco.limpar());

const T = new Date("2026-09-19T15:00:00.000Z");
const ctx = (i: number) => ({ email: `corretor${i}@exemplo.com`, ip: "203.0.113.9" });

async function comLeads(deps: DepsAvaliar, n: number) {
  for (let i = 0; i < n; i++) {
    await deps.leads.criar(
      leadVerificado({
        id: `lead-${i}`,
        nome: `Corretor ${String.fromCharCode(65 + i)} Exemplo`,
        email: `corretor${i}@exemplo.com`,
        creci: `PE 1234${i}`,
      }),
    );
  }
}

describe("lista do painel", () => {
  it("da mais recente para a mais antiga, com quem avaliou e o resumo do topo", async () => {
    const deps = banco.deps();
    await comLeads(deps, 2);
    await avaliar({ ...deps, agora: T }, entradaAvaliacao({ estrelas: 5 }), ctx(0));
    await avaliar(
      { ...deps, agora: new Date(T.getTime() + 60_000) },
      entradaAvaliacao({ estrelas: 4, identificacao: "anonimo" }),
      ctx(1),
    );

    const { resumo, avaliacoes } = await listarParaAdmin(deps.avaliacoes, deps.leads);
    expect(resumo).toEqual(resumoComArquivo(5, 4));
    expect(avaliacoes.map((a) => a.estrelas)).toEqual([4, 5]);
    // mesmo a anônima mostra de quem é: o painel é a tela de conferência do fundador
    expect(avaliacoes[0]!.autor).toEqual({
      nome: "Corretor B Exemplo",
      email: "corretor1@exemplo.com",
      creci: "PE 12341",
    });
    expect(avaliacoes[0]!.leadId).toBe("lead-1");
  });

  it("a segurada mostra o motivo em código (o rótulo em português mora no filtro)", async () => {
    const deps = banco.deps({ agora: T });
    await comLeads(deps, 1);
    await avaliar(deps, entradaAvaliacao({ comentario: "meu zap 81900000001" }), ctx(0));

    const { avaliacoes } = await listarParaAdmin(deps.avaliacoes, deps.leads);
    expect(avaliacoes[0]).toMatchObject({ status: "pendente", motivo: "telefone" });
  });

  it("publicada não carrega motivo, e o consentimento (texto e IP) não vai para a tela", async () => {
    const deps = banco.deps({ agora: T });
    await comLeads(deps, 1);
    await avaliar(deps, entradaAvaliacao(), ctx(0));

    const { avaliacoes } = await listarParaAdmin(deps.avaliacoes, deps.leads);
    expect(avaliacoes[0]).not.toHaveProperty("motivo");
    const cru = JSON.stringify(avaliacoes);
    expect(cru).not.toContain("203.0.113.9");
    expect(cru).not.toContain("Autorizo publicar");
  });

  it("lead sem CRECI (cadastro manual) não vira string vazia na tela", () => {
    const linha = paraAvaliacaoAdmin(
      {
        id: "a1",
        leadId: "lead-9",
        estrelas: 5,
        identificacao: "anonimo",
        status: "publicado",
        consentimento: { texto: "t", em: T.toISOString(), ip: "1.2.3.4" },
        criadoEm: T.toISOString(),
        atualizadoEm: T.toISOString(),
      },
      { nome: "Bruna Exemplo" },
    );
    expect(linha.autor).toEqual({ nome: "Bruna Exemplo" });
  });
});

describe("moderação em um clique", () => {
  it("tira do site e põe de volta; a nota continua contando nos dois casos", async () => {
    const deps = banco.deps({ agora: T });
    await comLeads(deps, 1);
    const feita = await avaliar(deps, entradaAvaliacao({ estrelas: 4 }), ctx(0));
    const id = (feita as { avaliacao: { id: string } }).avaliacao.id;

    const tirada = await moderar(deps.avaliacoes, id, "recusado", T);
    expect(tirada).toMatchObject({ status: "ok", avaliacao: { status: "recusado" } });
    expect(await deps.avaliacoes.listarPublicadas(12)).toEqual([]);
    expect(await deps.avaliacoes.resumoContagem()).toEqual({ soma: 4, quantas: 1 });

    const devolta = await moderar(deps.avaliacoes, id, "publicado", T);
    expect(devolta).toMatchObject({ status: "ok", avaliacao: { status: "publicado" } });
    expect(await deps.avaliacoes.listarPublicadas(12)).toHaveLength(1);
  });

  it("a auditoria leva id e situação de/para — e nada de texto, nome ou e-mail", async () => {
    const deps = banco.deps({ agora: T });
    await comLeads(deps, 1);
    const feita = await avaliar(deps, entradaAvaliacao({ comentario: "Texto que não pode vazar." }), ctx(0));
    const id = (feita as { avaliacao: { id: string } }).avaliacao.id;

    const r = await moderar(deps.avaliacoes, id, "recusado", T);
    expect(r.status === "ok" && r.auditoria).toEqual({
      acao: "avaliacao.status",
      dados: { id, de: "publicado", para: "recusado" },
    });
    const cru = JSON.stringify(r.status === "ok" ? r.auditoria : {});
    for (const sensivel of ["Texto que não pode vazar.", "exemplo.com", "Corretor A Exemplo", "203.0.113.9"]) {
      expect(cru).not.toContain(sensivel);
    }
  });

  it("id que não existe → nao_encontrada (e nada é criado por engano)", async () => {
    const deps = banco.deps({ agora: T });
    expect(await moderar(deps.avaliacoes, "nao-existe", "recusado", T)).toEqual({ status: "nao_encontrada" });
    expect(await deps.avaliacoes.listarTodas()).toEqual([]);
  });
});
