/**
 * Criar, guardar e reabrir o orçamento: numeração sequencial (inclusive com
 * duas criações ao mesmo tempo), recusa do piso antes de gravar e a promessa
 * que sustenta a proposta — **o orçamento emitido guarda o preço do dia**.
 *
 * Sem banco: stores de arquivo em pasta temporária. Cliente fictício.
 */
import { describe, it, expect, afterEach } from "vitest";
import type { LeadStore } from "../../lib/leadStore";
import type { OrcamentoStore } from "../../lib/orcamentoStorePorta";
import { criarOrcamento } from "./criar";
import { buscarOrcamentoAdmin, listarOrcamentosParaAdmin, trocarStatusOrcamento } from "./admin";
import { FAIXAS, TABELA } from "./tabela";
import { bancoTemporario, leadDoOrcamento, pedidoOrcamento } from "./apoioTestes";

const banco = bancoTemporario("orcamento-criar");
const AGORA = new Date("2026-09-20T15:00:00.000Z");

afterEach(async () => {
  await banco.limpar();
});

/** Stores prontas, com o lead fictício já cadastrado. */
async function comLead(): Promise<{ orcamentos: OrcamentoStore; leads: LeadStore }> {
  const deps = { orcamentos: banco.orcamentos(), leads: banco.leads() };
  await deps.leads.criar(leadDoOrcamento());
  return deps;
}

/** O orçamento criado, ou uma falha clara no teste. */
async function criado(deps: { orcamentos: OrcamentoStore; leads: LeadStore }, over: Record<string, unknown> = {}) {
  const r = await criarOrcamento(deps, pedidoOrcamento(over), AGORA);
  if (r.status !== "ok") throw new Error(`esperava criação, veio ${r.status}`);
  return r;
}

describe("criação", () => {
  it("nasce rascunho, numerado, com validade de 15 dias e o cliente do lead", async () => {
    const deps = await comLead();
    const { orcamento, auditoria } = await criado(deps);

    expect(orcamento.numero).toBe("ORC-2026-001");
    expect(orcamento.status).toBe("rascunho");
    expect(orcamento.validadeEm).toBe("2026-10-05"); // 20/09 + 15 dias
    expect(orcamento.cliente).toEqual({
      nome: "Imobiliária Exemplo",
      email: "contato@exemplo.com",
      telefone: "+5581900000001",
    });
    // 5 assentos Pro = 2 x 179,00 + 3 x 139,00
    expect(orcamento.totais.mensalCentavos).toBe(77_500);

    // auditoria: id, público e QUANTIDADE de assentos; nunca valor nem nome
    expect(auditoria).toEqual({
      acao: "orcamento.criado",
      dados: { id: orcamento.id, publico: "imobiliaria", assentos: 5 },
    });
    const cru = JSON.stringify(auditoria);
    for (const sensivel of ["Imobiliária Exemplo", "exemplo.com", "+5581900000001", "mensal", "totais"]) {
      expect(cru).not.toContain(sensivel);
    }
  });

  it("a numeração segue em ordem e não repete, nem com duas criações ao mesmo tempo", async () => {
    const deps = await comLead();
    const primeiro = await criado(deps);
    expect(primeiro.orcamento.numero).toBe("ORC-2026-001");

    const [a, b] = await Promise.all([
      criarOrcamento(deps, pedidoOrcamento(), AGORA),
      criarOrcamento(deps, pedidoOrcamento(), AGORA),
    ]);
    const numeros = [a, b].map((r) => (r.status === "ok" ? r.orcamento.numero : r.status));
    expect(new Set(numeros).size).toBe(2); // nada de dois "ORC-2026-002"
    expect(numeros.sort()).toEqual(["ORC-2026-002", "ORC-2026-003"]);
  });

  it("lead que não existe não vira orçamento", async () => {
    const deps = { orcamentos: banco.orcamentos(), leads: banco.leads() };
    const r = await criarOrcamento(deps, pedidoOrcamento({ leadId: "nao-existe" }), AGORA);
    expect(r.status).toBe("lead_nao_encontrado");
    expect(await deps.orcamentos.listar()).toEqual([]);
  });

  it("desconto abaixo do piso é recusado ANTES de gravar", async () => {
    const deps = await comLead();
    const r = await criarOrcamento(deps, pedidoOrcamento({ assentos: { pro: 10, ultra: 0 }, descontoPct: 41.38 }), AGORA);
    expect(r).toMatchObject({ status: "recusado", recusa: { erro: "abaixo_do_piso", piso: 8_500, efetivo: 8_499 } });
    expect(await deps.orcamentos.listar()).toEqual([]); // nada guardado
  });

  it("observação em branco não vira campo vazio no registro", async () => {
    const deps = await comLead();
    const { orcamento } = await criado(deps, { observacao: "   " });
    expect(orcamento.observacao).toBeUndefined();
  });
});

describe("o orçamento emitido guarda o preço do dia", () => {
  it("mudar a tabela depois não altera o que já foi proposto", async () => {
    const deps = await comLead();
    const emitido = (await criado(deps)).orcamento;
    expect(emitido.totais.mensalCentavos).toBe(77_500);

    // o fundador reajusta a tabela (R$ 50,00 a mais por assento, em toda faixa)
    const faixasOriginais = TABELA.faixas;
    try {
      TABELA.faixas = FAIXAS.map((f) => ({ ...f, pro: f.pro + 5_000, ultra: f.ultra + 5_000 }));

      const novo = (await criado(deps)).orcamento;
      expect(novo.totais.mensalCentavos).toBe(102_500); // 2 x 229,00 + 3 x 189,00

      // e o que já tinha sido emitido continua exatamente como foi proposto
      const guardado = await buscarOrcamentoAdmin(deps.orcamentos, deps.leads, emitido.id);
      expect(guardado!.totais).toEqual(emitido.totais);
      expect(guardado!.itens).toEqual(emitido.itens);
      expect(guardado!.condicoes.pisos).toEqual(emitido.condicoes.pisos);
    } finally {
      TABELA.faixas = faixasOriginais;
    }
  });

  it("o retrato tem a linha de cada faixa, com o preço unitário do dia", async () => {
    const deps = await comLead();
    const { orcamento } = await criado(deps, { assentos: { pro: 5, ultra: 3 } });
    expect(orcamento.itens.filter((i) => i.tipo === "assento").map((i) => [i.codigo, i.quantidade, i.unitarioCentavos])).toEqual([
      ["ultra", 2, 29_900],
      ["ultra", 1, 22_900],
      ["pro", 5, 13_900],
    ]);
  });
});

describe("acompanhar e excluir", () => {
  it("marcar enviado carimba a data uma vez; voltar e reenviar mantém a primeira", async () => {
    const deps = await comLead();
    const { orcamento } = await criado(deps);

    const enviado = await trocarStatusOrcamento(deps.orcamentos, orcamento.id, "enviado", new Date("2026-09-21T10:00:00.000Z"));
    expect(enviado).toMatchObject({
      status: "ok",
      auditoria: { acao: "orcamento.status", dados: { id: orcamento.id, de: "rascunho", para: "enviado" } },
    });

    await trocarStatusOrcamento(deps.orcamentos, orcamento.id, "rascunho", new Date("2026-09-22T10:00:00.000Z"));
    await trocarStatusOrcamento(deps.orcamentos, orcamento.id, "enviado", new Date("2026-09-23T10:00:00.000Z"));
    const guardado = await deps.orcamentos.buscarPorId(orcamento.id);
    expect(guardado!.enviadoEm).toBe("2026-09-21T10:00:00.000Z");
    expect(guardado!.status).toBe("enviado");
  });

  it("id que não existe não troca situação", async () => {
    const deps = await comLead();
    expect(await trocarStatusOrcamento(deps.orcamentos, "nao-existe", "aceito")).toEqual({ status: "nao_encontrado" });
  });

  it("excluir o lead leva os orçamentos dele (LGPD art. 18)", async () => {
    const deps = await comLead();
    await deps.leads.criar(leadDoOrcamento({ id: "lead-2", email: "outro@exemplo.com", telefone: "+5581900000002" }));
    await criado(deps);
    await criado(deps, { leadId: "lead-2" });

    expect(await deps.orcamentos.removerDoLead("lead-1")).toBe(1);
    const sobraram = await deps.orcamentos.listar();
    expect(sobraram.map((o) => o.leadId)).toEqual(["lead-2"]);
    // pedir de novo não é erro (no Postgres o CASCADE já apagou)
    expect(await deps.orcamentos.removerDoLead("lead-1")).toBe(0);
  });

  it("excluir um orçamento não mexe nos outros, e excluir duas vezes não é erro", async () => {
    const deps = await comLead();
    const um = (await criado(deps)).orcamento;
    const dois = (await criado(deps)).orcamento;
    expect(await deps.orcamentos.excluir(um.id)).toBe(true);
    expect(await deps.orcamentos.excluir(um.id)).toBe(false);
    expect((await listarOrcamentosParaAdmin(deps.orcamentos, deps.leads)).orcamentos.map((o) => o.id)).toEqual([dois.id]);
  });

  it("a lista vem do mais recente para o mais antigo, com o cliente de cada um", async () => {
    const deps = await comLead();
    await criarOrcamento(deps, pedidoOrcamento(), new Date("2026-09-20T10:00:00.000Z"));
    await criarOrcamento(deps, pedidoOrcamento(), new Date("2026-09-20T12:00:00.000Z"));
    const { orcamentos } = await listarOrcamentosParaAdmin(deps.orcamentos, deps.leads);
    expect(orcamentos.map((o) => o.criadoEm)).toEqual([
      "2026-09-20T12:00:00.000Z",
      "2026-09-20T10:00:00.000Z",
    ]);
    expect(orcamentos[0]!.cliente.nome).toBe("Imobiliária Exemplo");
  });
});
