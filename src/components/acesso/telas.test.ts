/**
 * Telas do fluxo de acesso (O9·S2), renderizadas no servidor — sem navegador,
 * sem rede: em que passo o modal abre, os campos novos do cadastro e a ligação
 * rótulo/erro dos campos (acessibilidade).
 */
import { describe, it, expect, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MENSAGEM_CRECI_SEM_UF } from "@/features/lead/creci";
import AccessFlow from "./AccessFlow";
import StepEntrar from "./StepEntrar";
import StepCodigo from "./StepCodigo";
import CampoCreci from "./CampoCreci";
import { ID_CAMPO } from "./cadastro";
import { BotaoSubmit, Campo } from "./ui";
import { MENSAGEM_EXISTENTE } from "./mensagens";
import { DADOS } from "./apoioTestes";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: () => undefined, replace: () => undefined }),
}));

const html = (el: Parameters<typeof renderToStaticMarkup>[0]) => renderToStaticMarkup(el);
const semAcao = () => undefined;
const AVISO_VENCIDO = "Seu acesso ao demo expirou";
/** A tag de abertura do elemento que tem o atributo dado. */
const tag = (markup: string, atributo: string) => markup.split("<").find((t) => t.includes(atributo)) ?? "";

describe("em que passo o modal abre", () => {
  it("acesso vencido (avisoAcesso): direto no Entrar, com o aviso", () => {
    const tela = html(createElement(AccessFlow, { aoFechar: semAcao, avisoAcesso: true }));
    expect(tela).toContain("Entrar na demonstração");
    expect(tela).toContain("Passo 1 de 2");
    expect(tela).toContain(AVISO_VENCIDO);
    expect(tela).toContain('id="acesso-entrar-email"');
    expect(tela).not.toContain(`id="${ID_CAMPO.nome}"`);
  });

  it("padrão: cadastro, com o link 'Já tenho cadastro' e sem o aviso de vencido", () => {
    const tela = html(createElement(AccessFlow, { aoFechar: semAcao }));
    expect(tela).toContain("Acessar a demonstração");
    expect(tela).toContain("Já tenho cadastro");
    expect(tela).not.toContain(AVISO_VENCIDO);
  });

  it("/login: abre no Entrar sem o aviso de vencido", () => {
    const tela = html(createElement(AccessFlow, { aoFechar: semAcao, passoInicial: "entrar" }));
    expect(tela).toContain("Entrar na demonstração");
    expect(tela).not.toContain(AVISO_VENCIDO);
  });
});

describe("cadastro: campos novos", () => {
  const tela = html(createElement(AccessFlow, { aoFechar: semAcao }));

  it("Nome completo, E-mail, WhatsApp e CRECI (Estado + Número), nessa ordem, cada um com rótulo", () => {
    const ordem = ["nome", "email", "telefone", "uf", "numero", "consentimento"] as const;
    const posicoes = ordem.map((c) => tela.indexOf(`id="${ID_CAMPO[c]}"`));
    expect(posicoes.every((p) => p > 0)).toBe(true);
    expect([...posicoes].sort((a, b) => a - b)).toEqual(posicoes);
    for (const c of ordem) expect(tela).toContain(`for="${ID_CAMPO[c]}"`);
    expect(tela).toContain("Nome completo");
    expect(tela).toContain("<legend");
  });

  it("Estado: as 27 UFs + a opção vazia", () => {
    const select = tela.slice(tela.indexOf(`<select id="${ID_CAMPO.uf}"`), tela.indexOf("</select>"));
    expect(select.match(/<option/g)).toHaveLength(28);
    expect(select).toContain('<option value="PE">PE</option>');
  });
});

describe("acessibilidade dos erros", () => {
  it("CRECI: erro anunciado (role=alert) e ligado ao campo por aria-describedby", () => {
    const campo = html(
      createElement(CampoCreci, {
        uf: "",
        numero: "",
        erroUf: MENSAGEM_CRECI_SEM_UF,
        aoMudarUf: semAcao,
        aoMudarNumero: semAcao,
      }),
    );
    expect(campo).toContain(`aria-describedby="${ID_CAMPO.uf}-erro"`);
    expect(campo).toContain(`id="${ID_CAMPO.uf}-erro" role="alert"`);
    expect(campo).toContain('aria-invalid="true"');
  });

  it("Entrar com a dica do WhatsApp repetido: o e-mail (com foco) aponta para a dica", () => {
    const tela = html(
      createElement(StepEntrar, { emailInicial: "", dica: "m•••••a@provedor.com.br", aoEnviado: semAcao, aoCadastrar: semAcao }),
    );
    expect(tela).toContain("m•••••a@provedor.com.br");
    expect(tela).toContain('id="acesso-entrar-dica"');
    expect(tag(tela, 'id="acesso-entrar-email"')).toContain('aria-describedby="acesso-entrar-dica"');
    expect(tela).toContain("Cadastre-se");
    const semDica = html(createElement(StepEntrar, { emailInicial: "", dica: null, aoEnviado: semAcao, aoCadastrar: semAcao }));
    expect(tag(semDica, 'id="acesso-entrar-email"')).not.toContain("aria-describedby");
  });

  it("código de quem já tinha cadastro: o campo do código aponta para o aviso", () => {
    const pedido = { tipo: "cadastro" as const, dados: DADOS, existente: true, atualizar: true };
    const tela = html(createElement(StepCodigo, { pedido, aoVerificar: semAcao, aoVoltar: semAcao }));
    expect(tela).toContain(MENSAGEM_EXISTENTE);
    expect(tela).toContain('id="acesso-codigo-existente"');
    expect(tag(tela, 'id="acesso-codigo"')).toContain('aria-describedby="acesso-codigo-existente"');
  });

  it("Campo junta o erro e a descrição do passo no aria-describedby", () => {
    const campo = html(createElement(Campo, { id: "x", label: "X", valor: "", aoMudar: semAcao, erro: "ruim", "aria-describedby": "aviso" }));
    expect(campo).toContain('aria-describedby="x-erro aviso"');
  });
});

describe("peças que já existiam (achados da revisão)", () => {
  it("o estilo do passo completa o do Campo em vez de trocá-lo (campo do código com borda e largura)", () => {
    const pedido = { tipo: "entrar" as const, email: DADOS.email };
    const entrada = tag(html(createElement(StepCodigo, { pedido, aoVerificar: semAcao, aoVoltar: semAcao })), 'id="acesso-codigo"');
    expect(entrada).toContain("width:100%");
    expect(entrada).toContain("border:1.5px solid");
    expect(entrada).toContain("letter-spacing:8px");
    expect(entrada).toContain("font-size:20px");
  });

  it("BotaoSubmit fica desabilitado enviando, mesmo com disabled={false}", () => {
    const botao = html(createElement(BotaoSubmit, { carregando: true, disabled: false, children: "Enviar" }));
    expect(botao).toContain('disabled=""');
    expect(html(createElement(BotaoSubmit, { disabled: false, children: "Enviar" }))).not.toContain("disabled");
  });
});
