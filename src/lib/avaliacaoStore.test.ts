/**
 * Adaptador de arquivo (dev): as mesmas garantias que o Postgres dá pela
 * migração 006 — uma avaliação por lead (upsert), listagem da mais recente
 * para a mais antiga e contagem de todas as situações.
 */
import { describe, it, expect, afterEach } from "vitest";
import { bancoTemporario } from "../features/avaliacao/apoioTestes";
import type { DadosAvaliacao } from "./avaliacaoStorePorta";

const banco = bancoTemporario("store-avaliacoes");
afterEach(() => banco.limpar());

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

describe("FileAvaliacaoStore", () => {
  it("salvar duas vezes o mesmo lead edita a avaliação — nunca cria a segunda", async () => {
    const store = banco.avaliacoes();
    const primeira = await store.salvar("lead-1", dados());
    const depois = new Date(Date.parse(T) + 60_000).toISOString();
    const segunda = await store.salvar("lead-1", dados({ estrelas: 3, comentario: "Mudei de ideia.", em: depois }));

    expect(await store.listarTodas()).toHaveLength(1);
    expect(segunda).toMatchObject({
      id: primeira.id,
      estrelas: 3,
      comentario: "Mudei de ideia.",
      criadoEm: T,
      atualizadoEm: depois,
    });
    expect(await store.doLead("lead-1")).toEqual(segunda);
    expect(await store.doLead("lead-2")).toBeNull();
  });

  it("editar sem comentário apaga o texto anterior (nada fica herdado da versão velha)", async () => {
    const store = banco.avaliacoes();
    await store.salvar("lead-1", dados({ comentario: "Texto da primeira versão." }));
    const { comentario: _sem, ...soNota } = dados({ estrelas: 3 });
    const segunda = await store.salvar("lead-1", soNota);

    expect(segunda).not.toHaveProperty("comentario");
    expect(await store.doLead("lead-1")).not.toHaveProperty("comentario");
    expect(await store.listarPublicadas(12)).toEqual([]);
  });

  it("removerDoLead apaga a avaliação daquele lead — o que o CASCADE da 006 faz no Postgres", async () => {
    const store = banco.avaliacoes();
    await store.salvar("lead-1", dados());
    await store.salvar("lead-2", dados());

    expect(await store.removerDoLead("lead-1")).toBe(true);
    expect(await store.doLead("lead-1")).toBeNull();
    expect((await store.listarTodas()).map((a) => a.leadId)).toEqual(["lead-2"]);
    expect(await store.resumoContagem()).toEqual({ soma: 5, quantas: 1 });
    // pedir duas vezes não é erro (a exclusão do titular é idempotente)
    expect(await store.removerDoLead("lead-1")).toBe(false);
  });

  it("listarPublicadas: só as publicadas COM texto, da mais recente para a mais antiga, no limite", async () => {
    const store = banco.avaliacoes();
    await store.salvar("lead-1", dados({ em: "2026-09-19T10:00:00.000Z" }));
    await store.salvar("lead-2", dados({ status: "pendente", em: "2026-09-19T11:00:00.000Z" }));
    await store.salvar("lead-3", dados({ status: "recusado", em: "2026-09-19T12:00:00.000Z" }));
    await store.salvar("lead-4", dados({ comentario: undefined, em: "2026-09-19T13:00:00.000Z" }));
    await store.salvar("lead-5", dados({ comentario: "   ", em: "2026-09-19T14:00:00.000Z" }));
    await store.salvar("lead-6", dados({ em: "2026-09-19T15:00:00.000Z" }));

    const publicadas = await store.listarPublicadas(10);
    expect(publicadas.map((a) => a.leadId)).toEqual(["lead-6", "lead-1"]);
    expect((await store.listarPublicadas(1)).map((a) => a.leadId)).toEqual(["lead-6"]);
    expect(await store.listarPublicadas(0)).toEqual([]);
  });

  it("resumoContagem soma todas as situações; arquivo que não existe ainda devolve zero", async () => {
    const store = banco.avaliacoes();
    expect(await store.resumoContagem()).toEqual({ soma: 0, quantas: 0 });
    await store.salvar("lead-1", dados({ estrelas: 5 }));
    await store.salvar("lead-2", dados({ estrelas: 4, status: "pendente" }));
    await store.salvar("lead-3", dados({ estrelas: 3, status: "recusado" }));
    expect(await store.resumoContagem()).toEqual({ soma: 12, quantas: 3 });
  });

  it("trocarStatus devolve a situação anterior; id desconhecido → null", async () => {
    const store = banco.avaliacoes();
    const a = await store.salvar("lead-1", dados());
    const depois = "2026-09-19T16:00:00.000Z";
    expect(await store.trocarStatus(a.id, "recusado", depois)).toMatchObject({
      anterior: "publicado",
      avaliacao: { id: a.id, status: "recusado", atualizadoEm: depois },
    });
    expect(await store.trocarStatus("nao-existe", "publicado", depois)).toBeNull();
  });

  it("listarTodas: da mais recente para a mais antiga", async () => {
    const store = banco.avaliacoes();
    await store.salvar("lead-1", dados({ em: "2026-09-19T10:00:00.000Z" }));
    await store.salvar("lead-2", dados({ em: "2026-09-19T12:00:00.000Z" }));
    expect((await store.listarTodas()).map((a) => a.leadId)).toEqual(["lead-2", "lead-1"]);
  });
});
