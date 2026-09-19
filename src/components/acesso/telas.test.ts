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
import CampoCreci from "./CampoCreci";
import { ID_CAMPO } from "./cadastro";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: () => undefined, replace: () => undefined }),
}));

const html = (el: Parameters<typeof renderToStaticMarkup>[0]) => renderToStaticMarkup(el);
const semAcao = () => undefined;
const AVISO_VENCIDO = "Seu acesso ao demo expirou";

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

  it("Entrar com a dica do WhatsApp repetido mostra o e-mail mascarado", () => {
    const tela = html(
      createElement(StepEntrar, { emailInicial: "", dica: "m•••••a@provedor.com.br", aoEnviado: semAcao, aoCadastrar: semAcao }),
    );
    expect(tela).toContain("m•••••a@provedor.com.br");
    expect(tela).toContain("Cadastre-se");
  });
});
