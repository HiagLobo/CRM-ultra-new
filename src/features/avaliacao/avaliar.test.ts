/**
 * Caso de uso `avaliar` com as stores de arquivo de verdade (nada de mock de
 * persistência): uma avaliação por lead, editável; a escolha de identificação
 * carimbada com data e IP; e o filtro decidindo só a situação do TEXTO — a
 * nota entra na hora em todos os casos.
 */
import { describe, it, expect, afterEach } from "vitest";
import { MemoriaRateLimiter } from "../../lib/ratelimit";
import { avaliar, REGRA_AVALIACAO } from "./avaliar";
import { textoConsentimentoAvaliacao } from "./consentimento";
import { bancoTemporario, entradaAvaliacao, leadVerificado, resumoComArquivo } from "./apoioTestes";

const banco = bancoTemporario("avaliar");
afterEach(() => banco.limpar());

const T = new Date("2026-09-19T15:00:00.000Z");
const CTX = { email: "corretor@exemplo.com", ip: "203.0.113.9" };

/** Deps com o lead já gravado (é ele que o cookie identifica). */
async function comLead(parcial = {}) {
  const deps = banco.deps({ agora: T });
  const lead = leadVerificado(parcial);
  await deps.leads.criar(lead);
  return { deps, lead };
}

describe("avaliar — quem pode", () => {
  it("e-mail do cookie sem lead no banco (excluído pela LGPD) → sem_acesso, e nada é gravado", async () => {
    const deps = banco.deps({ agora: T });
    expect(await avaliar(deps, entradaAvaliacao(), CTX)).toEqual({ status: "sem_acesso" });
    expect(await deps.avaliacoes.resumoContagem()).toEqual({ soma: 0, quantas: 0 });
  });

  it("pediu para aparecer com nome e o cadastro não tem nome (lead anterior à O9) → sem_nome", async () => {
    const { deps } = await comLead({ nome: undefined });
    for (const identificacao of ["nome", "nome_creci"] as const) {
      expect(await avaliar(deps, entradaAvaliacao({ identificacao }), CTX)).toEqual({ status: "sem_nome" });
    }
    // a mesma pessoa consegue avaliar como anônima
    const r = await avaliar(deps, entradaAvaliacao({ identificacao: "anonimo" }), CTX);
    expect(r.status).toBe("ok");
  });

  it("rate limit: 5 envios por lead em 30 min, o 6º é barrado sem gravar", async () => {
    const { deps } = await comLead();
    for (let i = 0; i < REGRA_AVALIACAO.max; i++) {
      expect((await avaliar(deps, entradaAvaliacao({ estrelas: 4 }), CTX)).status).toBe("ok");
    }
    expect(await avaliar(deps, entradaAvaliacao({ estrelas: 1 }), CTX)).toEqual({ status: "limitado" });
    // a última nota gravada continua sendo a 5ª (4 estrelas), não a barrada
    expect(await deps.avaliacoes.resumoContagem()).toEqual({ soma: 4, quantas: 1 });

    // passada a janela, volta a aceitar
    const depois = new Date(T.getTime() + REGRA_AVALIACAO.janelaMs + 1000);
    const r = await avaliar({ ...deps, agora: depois }, entradaAvaliacao({ estrelas: 1 }), CTX);
    expect(r.status).toBe("ok");
  });

  it("o limite é por lead: o de outro corretor não é gasto", async () => {
    const { deps } = await comLead();
    await deps.leads.criar(leadVerificado({ id: "lead-2", email: "outro@exemplo.com", creci: "PE 54321" }));
    const limiter = new MemoriaRateLimiter();
    for (let i = 0; i < REGRA_AVALIACAO.max; i++) {
      await avaliar({ ...deps, limiter }, entradaAvaliacao(), CTX);
    }
    const outro = await avaliar({ ...deps, limiter }, entradaAvaliacao(), { ...CTX, email: "outro@exemplo.com" });
    expect(outro.status).toBe("ok");
  });
});

describe("avaliar — o que fica gravado", () => {
  it("nota, texto, escolha e consentimento (texto exibido + data + IP)", async () => {
    const { deps, lead } = await comLead();
    const r = await avaliar(deps, entradaAvaliacao({ identificacao: "nome_creci" }), CTX);
    expect(r.status).toBe("ok");

    const gravada = await deps.avaliacoes.doLead(lead.id);
    expect(gravada).toMatchObject({
      leadId: lead.id,
      estrelas: 5,
      comentario: "Organizou meu dia de trabalho.",
      identificacao: "nome_creci",
      status: "publicado",
      criadoEm: T.toISOString(),
    });
    expect(gravada!.consentimento).toEqual({
      texto: textoConsentimentoAvaliacao("nome_creci"),
      em: T.toISOString(),
      ip: "203.0.113.9",
    });
  });

  it("uma por lead, editável: avaliar de novo troca nota e texto, mantendo id e criadoEm", async () => {
    const { deps, lead } = await comLead();
    const primeira = await avaliar(deps, entradaAvaliacao(), CTX);
    expect(primeira).toMatchObject({ status: "ok", novo: true, resumo: resumoComArquivo(5) });

    const depois = new Date(T.getTime() + 60_000);
    const segunda = await avaliar(
      { ...deps, agora: depois },
      entradaAvaliacao({ estrelas: 3, comentario: "Mudei de ideia: faltou integração.", identificacao: "anonimo" }),
      CTX,
    );
    expect(segunda).toMatchObject({ status: "ok", novo: false, statusAnterior: "publicado" });

    const todas = await deps.avaliacoes.listarTodas();
    expect(todas).toHaveLength(1);
    expect(todas[0]).toMatchObject({
      id: (primeira as { avaliacao: { id: string } }).avaliacao.id,
      estrelas: 3,
      identificacao: "anonimo",
      criadoEm: T.toISOString(),
      atualizadoEm: depois.toISOString(),
    });
    expect(await deps.avaliacoes.resumoContagem()).toEqual({ soma: 3, quantas: 1 });
  });

  it("comentário que o filtro segura entra como pendente — mas a NOTA conta na hora", async () => {
    const { deps } = await comLead();
    const r = await avaliar(deps, entradaAvaliacao({ estrelas: 4, comentario: "fala comigo em www.exemplo.test" }), CTX);
    expect(r).toMatchObject({ status: "ok", avaliacao: { status: "pendente" }, resumo: resumoComArquivo(4) });
  });

  it("só a nota (sem comentário) publica direto e não inventa texto vazio", async () => {
    const { deps, lead } = await comLead();
    const r = await avaliar(deps, { estrelas: 5, identificacao: "anonimo" }, CTX);
    expect(r).toMatchObject({ status: "ok", avaliacao: { status: "publicado" } });
    expect(await deps.avaliacoes.doLead(lead.id)).not.toHaveProperty("comentario");
  });
});
