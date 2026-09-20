/**
 * A busca do orçamento com o `fetch` trocado: achou, não existe, sessão caiu,
 * servidor falhou, rede fora, formato estranho e conta que não fecha. Nunca
 * lança, e nunca deixa passar proposta pela metade.
 *
 * Os dados são de empresa inventada, no domínio de exemplo (RFC 2606): nenhum
 * dado de pessoa real entra em teste.
 */
import { describe, it, expect, vi, afterEach } from "vitest";
import { FALHA_SERVIDOR, FORMATO_ESTRANHO, NAO_FECHA, SEM_CONEXAO, buscarOrcamento, urlOrcamento } from "./api";

afterEach(() => {
  vi.unstubAllGlobals();
});

const responder = (res: Response) => vi.stubGlobal("fetch", vi.fn(async () => res));

/** Orçamento no contrato da trilha A: código e rótulo lado a lado, dinheiro em reais. */
function orcamentoFalso(mudanca: Record<string, unknown> = {}) {
  return {
    id: "orc-1",
    numero: "ORC-2026-007",
    situacao: "enviado",
    situacaoRotulo: "Enviado",
    criadoEm: "2026-09-20T12:00:00.000Z",
    validoAte: "2026-10-05",
    cliente: { nome: "Imobiliária de Exemplo", email: "contato@exemplo.example", telefone: "+5511900000000" },
    publico: "imobiliaria",
    publicoRotulo: "Imobiliária",
    assentos: [
      { codigo: "pro", nivel: "Pro", faixa: "1o e 2o assento", quantidade: 2, precoUnitario: 179, total: 358 },
    ],
    extras: [],
    implantacao: { total: 1790, entrada: 895, saldo: 895, entradaPct: 50 },
    totais: { mensal: 358, anual: 4296 },
    anual: false,
    descontoPct: 0,
    condicaoFundador: false,
    inclusos: { pro: ["Funil, agenda e ficha do cliente por assento."] },
    franquias: [{ rotulo: "Atendimentos de IA", incluso: "25 por assento/mês", excedente: "R$ 1,50 por atendimento" }],
    ...mudanca,
  };
}

const buscarCom = async (mudanca: Record<string, unknown> = {}) => {
  responder(Response.json({ ok: true, orcamento: orcamentoFalso(mudanca) }));
  return buscarOrcamento("orc-1");
};

describe("buscar o orçamento do documento", () => {
  it("200 com o orçamento → estado ok, sem cache e com o id escapado na URL", async () => {
    const fetchFalso = vi.fn(async () => Response.json({ ok: true, orcamento: orcamentoFalso() }));
    vi.stubGlobal("fetch", fetchFalso);

    const r = await buscarOrcamento("orc-1");
    expect(r.estado).toBe("ok");
    if (r.estado !== "ok") return;
    expect(r.orcamento.numero).toBe("ORC-2026-007");
    expect(r.orcamento.assentos[0]?.nivel).toBe("Pro");
    expect(r.orcamento.implantacao?.entrada).toBe(895);
    expect(fetchFalso).toHaveBeenCalledWith(
      "/api/admin/orcamentos/orc-1",
      expect.objectContaining({ cache: "no-store" }),
    );
  });

  it("o que é enfeite entra com padrão (extras, anual, desconto, fundador)", async () => {
    const r = await buscarCom({
      extras: undefined,
      anual: undefined,
      descontoPct: undefined,
      condicaoFundador: undefined,
    });
    expect(r.estado).toBe("ok");
    if (r.estado !== "ok") return;
    expect(r.orcamento.extras).toEqual([]);
    expect(r.orcamento.anual).toBe(false);
    expect(r.orcamento.descontoPct).toBe(0);
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

  it("resposta sem JSON (página de erro do provedor) → formato estranho", async () => {
    responder(new Response("<html>ops</html>", { status: 200 }));
    expect(await buscarOrcamento("orc-1")).toEqual({ estado: "erro", mensagem: FORMATO_ESTRANHO });
  });

  it("a rota é a do admin e o id vai escapado", () => {
    expect(urlOrcamento("abc-123")).toBe("/api/admin/orcamentos/abc-123");
    expect(urlOrcamento("../x?y")).toBe("/api/admin/orcamentos/..%2Fx%3Fy");
  });
});

describe("o que impede a proposta de virar papel", () => {
  const recusado = { estado: "erro", mensagem: FORMATO_ESTRANHO };
  const naoFecha = { estado: "erro", mensagem: NAO_FECHA };

  it("sem linha de assento (proposta com preço e sem item)", async () => {
    expect(await buscarCom({ assentos: [] })).toEqual(recusado);
  });

  it("sem o que está incluso ou sem franquias (blocos obrigatórios do papel)", async () => {
    expect(await buscarCom({ inclusos: undefined })).toEqual(recusado);
    expect(await buscarCom({ franquias: [] })).toEqual(recusado);
  });

  it("situação inventada ou data que não existe no calendário", async () => {
    expect(await buscarCom({ situacao: "inventada" })).toEqual(recusado);
    expect(await buscarCom({ validoAte: "2026-02-31" })).toEqual(recusado);
    expect(await buscarCom({ validoAte: "05/10/2026" })).toEqual(recusado);
  });

  it("nível contratado sem a lista do que inclui", async () => {
    expect(await buscarCom({ inclusos: { ultra: ["Radar de oportunidades."] } })).toEqual(naoFecha);
  });

  it("linhas que não somam o total mensal", async () => {
    expect(await buscarCom({ totais: { mensal: 999, anual: 11988 } })).toEqual(naoFecha);
  });

  it("implantação cobrada onde ela é isenta (anual e condição de fundador)", async () => {
    expect(await buscarCom({ anual: true })).toEqual(naoFecha);
    expect(await buscarCom({ condicaoFundador: true })).toEqual(naoFecha);
  });

  it("implantação só com o número, sem entrada e saldo (formato antigo)", async () => {
    expect(
      await buscarCom({ implantacao: undefined, totais: { mensal: 358, anual: 4296, implantacao: 1790 } }),
    ).toEqual(naoFecha);
  });
});
