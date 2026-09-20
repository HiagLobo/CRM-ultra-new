/**
 * LGPD art. 18 no `DELETE /api/admin/leads`: excluir o lead leva os orçamentos
 * dele junto (O11), como já levava a avaliação (O10). No Postgres quem faz é o
 * `ON DELETE CASCADE` da 007; no arquivo (dev) é a chamada da rota — e é ela
 * que este teste prova, porque proposta órfã é dado de quem pediu para sumir.
 *
 * A 007 pendente não pode travar a eliminação: só a causa vai para o log.
 */
import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from "vitest";
import { NextRequest } from "next/server";
import type { LeadStore } from "@/lib/leadStore";
import type { AvaliacaoStore } from "@/lib/avaliacaoStore";
import type { OrcamentoStore } from "@/lib/orcamentoStorePorta";
import { COOKIE_ADMIN, criarSessaoAdmin } from "@/lib/adminAuth";
import { SECRET_TESTE, capturarConsole } from "@/features/lead/apoioTestes";
import { criarOrcamento } from "@/features/orcamento";
import { bancoTemporario, leadDoOrcamento, pedidoOrcamento } from "@/features/orcamento/apoioTestes";
import { bancoTemporario as bancoAvaliacoes } from "@/features/avaliacao/apoioTestes";

const dubles = vi.hoisted(() => ({
  leads: undefined as unknown as LeadStore,
  avaliacoes: undefined as unknown as AvaliacaoStore,
  orcamentos: undefined as unknown as OrcamentoStore,
}));
vi.mock("@/lib/criarLeadStore", () => ({ leadStore: () => dubles.leads }));
vi.mock("@/lib/criarAvaliacaoStore", () => ({ avaliacaoStore: () => dubles.avaliacoes }));
vi.mock("@/lib/criarOrcamentoStore", () => ({ orcamentoStore: () => dubles.orcamentos }));
vi.mock("@/lib/auditoria", () => ({ registrarAuditoria: async () => undefined }));

import { DELETE } from "../leads/route";

const banco = bancoTemporario("exclusao-lead-orcamentos");
const avaliacoes = bancoAvaliacoes("exclusao-lead-avaliacoes");

beforeAll(() => {
  process.env.APP_SECRET = SECRET_TESTE;
});
beforeEach(async () => {
  dubles.leads = banco.leads();
  dubles.avaliacoes = avaliacoes.avaliacoes();
  dubles.orcamentos = banco.orcamentos();
  await dubles.leads.criar(leadDoOrcamento());
  await criarOrcamento({ orcamentos: dubles.orcamentos, leads: dubles.leads }, pedidoOrcamento());
});
afterEach(async () => {
  await banco.limpar();
  await avaliacoes.limpar();
  vi.restoreAllMocks();
});

function pedidoDelete(id: string) {
  return new NextRequest("http://localhost/api/admin/leads", {
    method: "DELETE",
    headers: { "Content-Type": "application/json", cookie: `${COOKIE_ADMIN}=${criarSessaoAdmin(SECRET_TESTE)}` },
    body: JSON.stringify({ id }),
  });
}

describe("excluir o lead leva os orçamentos", () => {
  it("o lead sai e nenhuma proposta dele fica para trás", async () => {
    expect(await dubles.orcamentos.doLead("lead-1")).toHaveLength(1);

    const res = await DELETE(pedidoDelete("lead-1"));
    expect(res.status).toBe(200);
    expect(await dubles.leads.buscarPorId("lead-1")).toBeNull();
    expect(await dubles.orcamentos.listar()).toEqual([]);
  });

  it("migração 007 pendente não trava a eliminação: o lead sai e só a causa vai para o log", async () => {
    vi.spyOn(dubles.orcamentos, "removerDoLead").mockRejectedValueOnce(
      Object.assign(new Error('relation "orcamentos" does not exist; contato@exemplo.com'), { code: "42P01" }),
    );
    const linhas = capturarConsole();

    const res = await DELETE(pedidoDelete("lead-1"));
    expect(res.status).toBe(200);
    expect(await dubles.leads.buscarPorId("lead-1")).toBeNull();
    expect(linhas()).toContain("db:42P01");
    expect(linhas()).not.toContain("exemplo.com");
  });
});
