import { describe, it, expect } from "vitest";
import { errosPorCampo, mensagemDeErro, mensagemDuplicado, respostaOk } from "./mensagensApi";

describe("resposta da API → mensagem na tela", () => {
  it("sucesso é 2xx com ok: true (nada menos)", () => {
    expect(respostaOk({ status: 200, corpo: { ok: true } })).toBe(true);
    expect(respostaOk({ status: 201, corpo: { ok: true } })).toBe(true);
    expect(respostaOk({ status: 200, corpo: { ok: false } })).toBe(false);
    expect(respostaOk({ status: 200, corpo: null })).toBe(false);
    expect(respostaOk({ status: 500, corpo: { ok: true } })).toBe(false);
  });

  it("cada falha vira uma frase útil", () => {
    expect(mensagemDeErro({ status: 0, corpo: null }, "mudar a etapa")).toBe(
      "Sem conexão: não deu para mudar a etapa. Confira a internet e tente de novo.",
    );
    expect(mensagemDeErro({ status: 404, corpo: { ok: false, erro: "lead_nao_encontrado" } }, "mudar a etapa")).toMatch(/não existe mais/);
    expect(mensagemDeErro({ status: 500, corpo: { ok: false, erro: "falha_interna" } }, "salvar a anotação")).toBe(
      "Não deu para salvar a anotação: falha no servidor. Tente de novo em instantes.",
    );
    expect(mensagemDeErro({ status: 400, corpo: { ok: false, erro: "json_invalido" } }, "mudar a etapa")).toBe(
      "Não deu para mudar a etapa. Tente de novo.",
    );
  });

  it("400 com o campo: a mensagem do servidor (data de retomar, próxima ação) aparece", () => {
    const corpo = { ok: false, erro: "data_invalida", campos: { retomarEm: ["a data de retomar precisa ser depois de hoje"] } };
    expect(mensagemDeErro({ status: 400, corpo }, "mudar a etapa")).toBe(
      "Não deu para mudar a etapa: a data de retomar precisa ser depois de hoje.",
    );
    expect(mensagemDeErro({ status: 400, corpo: { gerais: ["envie a etapa ou a próxima ação (uma das duas)"] } }, "salvar")).toMatch(/uma das duas/);
    // O9: conferência do CRECI de lead sem CRECI
    expect(mensagemDeErro({ status: 409, corpo: { ok: false, erro: "sem_creci" } }, "marcar a conferência do CRECI")).toBe(
      "Esse lead não tem CRECI para conferir.",
    );
  });

  it("erros por campo: só os campos conhecidos e só texto", () => {
    const corpo = { campos: { telefone: ["telefone inválido (use DDD + número)"], email: [42], extra: ["x"] } };
    expect(errosPorCampo(corpo, ["telefone", "email"] as const)).toEqual({ telefone: "telefone inválido (use DDD + número)" });
    expect(errosPorCampo(null, ["telefone"] as const)).toEqual({});
  });

  it("sem PII: a mensagem de duplicado diz o tipo do dado, nunca o dado", () => {
    expect(mensagemDuplicado("email")).toBe("Já existe um lead com esse e-mail.");
    expect(mensagemDuplicado("telefone")).toBe("Já existe um lead com esse telefone.");
    expect(mensagemDuplicado("qualquer")).toBe("Já existe um lead com esse telefone.");
    for (const m of [mensagemDuplicado("email"), mensagemDuplicado("telefone")]) {
      expect(m).not.toMatch(/@|\d/);
    }
  });
});
