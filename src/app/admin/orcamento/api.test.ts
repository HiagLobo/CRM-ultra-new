/**
 * A busca do orçamento com o `fetch` trocado: achou, não existe, sessão caiu,
 * servidor falhou, rede fora e resposta em formato estranho. Nunca lança.
 *
 * Os dados são de empresa inventada, no domínio de exemplo (RFC 2606): nenhum
 * dado de pessoa real entra em teste.
 */
import { describe, it, expect, vi, afterEach } from "vitest";
import { FALHA_SERVIDOR, FORMATO_ESTRANHO, SEM_CONEXAO, buscarOrcamento, urlOrcamento } from "./api";

afterEach(() => {
  vi.unstubAllGlobals();
});

const responder = (res: Response) => vi.stubGlobal("fetch", vi.fn(async () => res));

/** Orçamento mínimo que a trilha A promete no DTO. */
function orcamentoFalso() {
  return {
    id: "orc-1",
    numero: "ORC-2026-007",
    situacao: "enviado",
    criadoEm: "2026-09-20T12:00:00.000Z",
    validoAte: "2026-10-05",
    cliente: { nome: "Imobiliária de Exemplo", email: "contato@exemplo.example", telefone: "+5511900000000" },
    publico: "imobiliaria",
    assentos: [{ nivel: "pro", faixa: "1o e 2o assento", quantidade: 2, precoUnitario: 179, total: 358 }],
    extras: [{ item: "treinamento", rotulo: "Turma extra de treinamento", quantidade: 1, precoUnitario: 690, total: 690 }],
    totais: { mensal: 358, anual: 4296, implantacao: 1790, economiaAnual: 716 },
    anual: false,
    descontoPct: 0,
    condicaoFundador: false,
  };
}

describe("buscar o orçamento do documento", () => {
  it("200 com o orçamento → estado ok, sem cache e com o id escapado na URL", async () => {
    const fetchFalso = vi.fn(async () => Response.json({ ok: true, orcamento: orcamentoFalso() }));
    vi.stubGlobal("fetch", fetchFalso);

    const r = await buscarOrcamento("orc-1");
    expect(r.estado).toBe("ok");
    if (r.estado !== "ok") return;
    expect(r.orcamento.numero).toBe("ORC-2026-007");
    expect(r.orcamento.assentos[0]?.total).toBe(358);
    expect(fetchFalso).toHaveBeenCalledWith("/api/admin/orcamentos/orc-1", expect.objectContaining({ cache: "no-store" }));
  });

  it("o que a API ainda não manda entra com padrão (nada de tela quebrada)", async () => {
    const enxuto = {
      numero: "ORC-2026-001",
      situacao: "rascunho",
      criadoEm: "2026-09-20",
      validoAte: "2026-10-05",
      cliente: { nome: "Rede de Exemplo" },
      totais: { mensal: 1000, anual: 12000 },
    };
    responder(Response.json({ ok: true, orcamento: enxuto }));

    const r = await buscarOrcamento("orc-2");
    expect(r.estado).toBe("ok");
    if (r.estado !== "ok") return;
    expect(r.orcamento.assentos).toEqual([]);
    expect(r.orcamento.extras).toEqual([]);
    expect(r.orcamento.totais.implantacao).toBe(0);
    expect(r.orcamento.anual).toBe(false);
    expect(r.orcamento.condicaoFundador).toBe(false);
  });

  it("401 (sessão vencida) → estado de sessão, para a tela voltar ao login", async () => {
    responder(Response.json({ ok: false, erro: "nao_autorizado" }, { status: 401 }));
    expect(await buscarOrcamento("orc-1")).toEqual({ estado: "sessao" });
  });

  it("404 → orçamento apagado, com tela própria", async () => {
    responder(Response.json({ ok: false }, { status: 404 }));
    expect(await buscarOrcamento("sumiu")).toEqual({ estado: "nao_encontrado" });
  });

  it("500 → falha do servidor com texto útil", async () => {
    responder(Response.json({ ok: false }, { status: 500 }));
    expect(await buscarOrcamento("orc-1")).toEqual({ estado: "erro", mensagem: FALHA_SERVIDOR });
  });

  it("rede fora → sem conexão, sem lançar", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => Promise.reject(new TypeError("Failed to fetch"))));
    expect(await buscarOrcamento("orc-1")).toEqual({ estado: "erro", mensagem: SEM_CONEXAO });
  });

  it("corpo fora do contrato → formato estranho, e a folha não é desenhada", async () => {
    responder(Response.json({ ok: true, orcamento: { numero: "ORC-1", situacao: "inventada" } }));
    expect(await buscarOrcamento("orc-1")).toEqual({ estado: "erro", mensagem: FORMATO_ESTRANHO });
  });

  it("resposta sem JSON (página de erro do provedor) → formato estranho", async () => {
    responder(new Response("<html>ops</html>", { status: 200 }));
    expect(await buscarOrcamento("orc-1")).toEqual({ estado: "erro", mensagem: FORMATO_ESTRANHO });
  });

  it("a rota é a do admin e o id vai escapado", () => {
    expect(urlOrcamento("abc-123")).toBe("/api/admin/orcamentos/abc-123");
    expect(urlOrcamento("../x?y")).toBe("/api/admin/orcamentos/..%2Fx%3Fy");
  });
});
