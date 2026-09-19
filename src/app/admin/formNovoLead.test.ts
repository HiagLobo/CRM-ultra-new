/**
 * "+ Novo lead": validação no cliente (o mesmo schema da rota) e a leitura da
 * resposta (201 · 409 · 400 · 500). Dados fictícios; nenhuma mensagem pode
 * repetir o que foi digitado (contato é PII).
 */
import { describe, it, expect } from "vitest";
import type { LeadAdmin } from "@/features/lead/admin";
import { FORM_NOVO_LEAD_VAZIO, lerRespostaCadastro, validarNovoLead, type FormNovoLead } from "./formNovoLead";

const VALIDO: FormNovoLead = {
  ...FORM_NOVO_LEAD_VAZIO,
  nome: "Rita Fictícia",
  telefone: "(81) 98888-7777",
  canal: "indicacao",
  consentimento: true,
};

describe("validação do formulário", () => {
  it("só telefone + canal + checkbox basta (nome, e-mail, CRECI e observação são opcionais)", () => {
    const minimo = { ...FORM_NOVO_LEAD_VAZIO, telefone: "81988887777", canal: "whatsapp" as const, consentimento: true };
    expect(validarNovoLead(minimo)).toEqual({ ok: true, valor: minimo });
    expect(validarNovoLead({ ...VALIDO, email: "rita@exemplo.com", creci: "CRECI-PE 12.345-F", observacao: "veio do evento" }).ok).toBe(true);
  });

  it("formulário vazio: telefone, canal e checkbox obrigatórios", () => {
    const r = validarNovoLead(FORM_NOVO_LEAD_VAZIO);
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(Object.keys(r.erros).sort()).toEqual(["canal", "consentimento", "telefone"]);
    expect(r.erros.canal).toBe("escolha o canal");
    expect(r.erros.consentimento).toBe("confirme que a pessoa sabe e concordou em ser contatada");
  });

  it("formato inválido de telefone, e-mail e CRECI → erro no campo, sem repetir o valor", () => {
    const digitado = { ...VALIDO, telefone: "4321", email: "rita@", creci: "zz" };
    const r = validarNovoLead(digitado);
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(Object.keys(r.erros).sort()).toEqual(["creci", "email", "telefone"]);
    const mensagens = Object.values(r.erros).join(" | ");
    for (const valor of ["4321", "rita@", "zz"]) expect(mensagens).not.toContain(valor);
  });

  it("checkbox desmarcado barra mesmo com o resto certo", () => {
    const r = validarNovoLead({ ...VALIDO, consentimento: false });
    expect(r.ok ? [] : Object.keys(r.erros)).toEqual(["consentimento"]);
  });

  it("canal 'site' não é cadastro manual", () => {
    const r = validarNovoLead({ ...VALIDO, canal: "site" as never });
    expect(r.ok ? null : r.erros.canal).toBe("escolha o canal");
  });
});

describe("resposta do cadastro", () => {
  const lead: LeadAdmin = { id: "n1", telefone: "+5581988887777", creci: "", canal: "indicacao", status: "novo", criadoEm: "2026-09-19T15:00:00.000Z" };

  it("201: o lead entra; o aviso de observação não salva é repassado", () => {
    expect(lerRespostaCadastro({ status: 201, corpo: { ok: true, lead } })).toEqual({ status: "ok", lead, observacaoNaoSalva: false });
    expect(lerRespostaCadastro({ status: 201, corpo: { ok: true, lead, aviso: "observacao_nao_salva" } })).toEqual({
      status: "ok",
      lead,
      observacaoNaoSalva: true,
    });
  });

  it("409: 'já existe' com o id para abrir o existente, sem o dado repetido", () => {
    expect(lerRespostaCadastro({ status: 409, corpo: { ok: false, erro: "lead_existente", id: "e9", campo: "telefone" } })).toEqual({
      status: "duplicado",
      id: "e9",
      mensagem: "Já existe um lead com esse telefone.",
    });
    const porEmail = lerRespostaCadastro({ status: 409, corpo: { ok: false, id: "e9", campo: "email" } });
    expect(porEmail.status === "duplicado" && porEmail.mensagem).toBe("Já existe um lead com esse e-mail.");
    const porCreci = lerRespostaCadastro({ status: 409, corpo: { ok: false, id: "e9", campo: "creci" } });
    expect(porCreci.status === "duplicado" && porCreci.mensagem).toBe("Já existe um lead com esse CRECI.");
  });

  it("400 com campos → erros nos campos; 500 e sem conexão → mensagem geral", () => {
    expect(
      lerRespostaCadastro({ status: 400, corpo: { ok: false, erro: "dados_invalidos", campos: { telefone: ["telefone inválido (use DDD + número)"] } } }),
    ).toEqual({ status: "invalido", erros: { telefone: "telefone inválido (use DDD + número)" } });
    expect(lerRespostaCadastro({ status: 500, corpo: { ok: false, erro: "falha_interna" } })).toEqual({
      status: "erro",
      erro: "Não deu para cadastrar o lead: falha no servidor. Tente de novo em instantes.",
    });
    expect(lerRespostaCadastro({ status: 0, corpo: null }).status).toBe("erro");
    // 201 sem o lead no corpo não finge sucesso
    expect(lerRespostaCadastro({ status: 201, corpo: { ok: true } }).status).toBe("erro");
  });
});
