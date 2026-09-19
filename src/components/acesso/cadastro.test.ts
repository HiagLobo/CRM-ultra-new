/**
 * Regras puras do formulário de cadastro (O9·S2): Estado pelo DDD enquanto a
 * pessoa não mexe, CRECI "UF NÚMERO" e erros por campo da tela.
 */
import { describe, it, expect } from "vitest";
import { LISTA_UFS, MENSAGEM_CRECI_SEM_UF } from "@/features/lead/creci";
import { MENSAGEM_NOME } from "@/features/lead/schema";
import {
  FORM_VAZIO,
  MENSAGEM_NUMERO_INVALIDO,
  MENSAGEM_NUMERO_VAZIO,
  comTelefone,
  comUf,
  errosPorCampo,
  montarCreci,
  primeiroCampoComErro,
  ufPeloWhatsapp,
  validarCadastro,
  type FormCadastro,
} from "./cadastro";
import { mascararTelefone } from "./ui";

const FORM_OK: FormCadastro = {
  nome: "  Corretora   Exemplo ",
  email: " Corretor@Exemplo.com ",
  telefone: "(81) 90000-0001",
  uf: "PE",
  numero: "12.345-f",
  ufTocada: false,
};

describe("Estado pelo DDD do WhatsApp", () => {
  it("todas as 27 UFs saem de algum DDD, digitado com máscara", () => {
    const achadas = new Set<string>();
    for (let ddd = 11; ddd <= 99; ddd++) {
      const uf = ufPeloWhatsapp(mascararTelefone(`${ddd}900000001`));
      if (uf) achadas.add(uf);
    }
    expect([...achadas].sort()).toEqual([...LISTA_UFS].sort());
  });

  it("DDD conhecido → UF; desconhecido ou incompleto → vazio", () => {
    expect(ufPeloWhatsapp("(81) 90000-0001")).toBe("PE");
    expect(ufPeloWhatsapp("+5511900000000")).toBe("SP");
    expect(ufPeloWhatsapp("(61) 9")).toBe("DF");
    expect(ufPeloWhatsapp("(20) 90000-0001")).toBe("");
    expect(ufPeloWhatsapp("8")).toBe("");
    expect(ufPeloWhatsapp("")).toBe("");
  });

  it("acompanha o DDD enquanto a pessoa não mexe no Estado", () => {
    let form = comTelefone(FORM_VAZIO, "(81) 9");
    expect(form.uf).toBe("PE");
    form = comTelefone(form, "(21) 9");
    expect(form.uf).toBe("RJ");
    form = comTelefone(form, "2"); // apagou o DDD: sem palpite
    expect(form.uf).toBe("");
  });

  it("depois que a pessoa escolhe o Estado, o DDD não troca mais", () => {
    let form = comTelefone(FORM_VAZIO, "(81) 90000-0001");
    form = comUf(form, "SP");
    expect(form).toMatchObject({ uf: "SP", ufTocada: true });
    form = comTelefone(form, "(21) 90000-0001");
    expect(form.uf).toBe("SP");
    // voltar para "UF" também é escolha dela
    form = comTelefone(comUf(form, ""), "(81) 90000-0001");
    expect(form.uf).toBe("");
  });

  it("valor fora da lista não vira UF", () => {
    expect(comUf(FORM_VAZIO, "XX").uf).toBe("");
  });
});

describe("montagem do CRECI (\"UF NÚMERO\")", () => {
  it.each([
    ["PE", "12345", "PE 12345"],
    ["PE", " 12.345-F ", "PE 12.345-F"],
    ["SP", "12345-J", "SP 12345-J"],
    ["", "12345", "12345"],
    ["RJ", "", "RJ"],
  ] as const)("%j + %j → %j", (uf, numero, creci) => {
    expect(montarCreci(uf, numero)).toBe(creci);
  });

  it("o que vai para a API é o CRECI canônico do schema do servidor", () => {
    for (const [numero, canonico] of [
      ["12345", "PE 12345"],
      ["12345-F", "PE 12345-F"],
      ["12.345-j", "PE 12345-J"],
      ["CRECI-PE 12.345", "PE 12345"],
    ]) {
      const r = validarCadastro({ ...FORM_OK, numero: numero! }, true);
      expect(r.ok && r.dados.creci).toBe(canonico);
    }
  });
});

describe("validação do cadastro (mesmos schemas da rota)", () => {
  it("happy: normaliza nome, e-mail, telefone e CRECI", () => {
    const r = validarCadastro(FORM_OK, true);
    expect(r).toEqual({
      ok: true,
      dados: {
        nome: "Corretora Exemplo",
        email: "corretor@exemplo.com",
        telefone: "+5581900000001",
        creci: "PE 12345-F",
        consentimento: true,
      },
    });
  });

  it("formulário vazio: um erro por campo, na ordem da tela", () => {
    const r = validarCadastro(FORM_VAZIO, false);
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.erros).toEqual({
      nome: MENSAGEM_NOME,
      email: expect.any(String),
      telefone: expect.any(String),
      uf: MENSAGEM_CRECI_SEM_UF,
      numero: MENSAGEM_NUMERO_VAZIO,
      consentimento: "consentimento é obrigatório",
    });
    expect(primeiroCampoComErro(r.erros)).toBe("nome");
  });

  it("nome de uma palavra só é recusado", () => {
    const r = validarCadastro({ ...FORM_OK, nome: "Corretora" }, true);
    expect(!r.ok && r.erros).toEqual({ nome: MENSAGEM_NOME });
  });

  it("sem Estado: o erro é do Estado, não do número", () => {
    const r = validarCadastro({ ...FORM_OK, uf: "" }, true);
    expect(!r.ok && r.erros).toEqual({ uf: MENSAGEM_CRECI_SEM_UF });
    expect(!r.ok && primeiroCampoComErro(r.erros)).toBe("uf");
  });

  it("número inválido com Estado escolhido: o erro é só do número", () => {
    const r = validarCadastro({ ...FORM_OK, numero: "abc" }, true);
    expect(!r.ok && r.erros).toEqual({ numero: MENSAGEM_NUMERO_INVALIDO });
  });

  it("UF digitada junto do número vale mesmo com o Estado vazio", () => {
    const r = validarCadastro({ ...FORM_OK, uf: "", numero: "SP 12345" }, true);
    expect(r.ok && r.dados.creci).toBe("SP 12345");
  });

  it("Estado e número de UFs diferentes: número inválido", () => {
    const r = validarCadastro({ ...FORM_OK, uf: "PE", numero: "SP 12345" }, true);
    expect(!r.ok && r.erros).toEqual({ numero: MENSAGEM_NUMERO_INVALIDO });
  });
});

describe("erros do 400 da API → campos da tela", () => {
  it("nome, e-mail, telefone e consentimento vão para os próprios campos", () => {
    const erros = errosPorCampo(
      { nome: [MENSAGEM_NOME], email: ["e-mail inválido"], telefone: ["telefone inválido"], consentimento: ["x"] },
      { uf: "PE", numero: "12345" },
    );
    expect(erros).toEqual({ nome: MENSAGEM_NOME, email: "e-mail inválido", telefone: "telefone inválido", consentimento: "x" });
  });

  it("CRECI sem UF → Estado; CRECI inválido → Número (o 'sem UF' que vem junto é ignorado)", () => {
    expect(errosPorCampo({ creci: [MENSAGEM_CRECI_SEM_UF] }, { uf: "PE", numero: "12345" })).toEqual({
      uf: MENSAGEM_CRECI_SEM_UF,
    });
    expect(errosPorCampo({ creci: ["CRECI inválido (ex.: PE 12345-F)", MENSAGEM_CRECI_SEM_UF] }, { uf: "PE", numero: "1" })).toEqual({
      numero: MENSAGEM_NUMERO_INVALIDO,
    });
  });

  it("campo que a tela não tem não vira erro de campo", () => {
    const erros = errosPorCampo({ origem: ["x"] }, { uf: "PE", numero: "12345" });
    expect(erros).toEqual({});
    expect(primeiroCampoComErro(erros)).toBeUndefined();
  });
});
