/**
 * Avisos e textos do cadastro único (O9·S2), renderizados no servidor — sem
 * navegador, sem rede. O número do WhatsApp não aparece aqui: vive só no
 * `brand.ts`; o esperado sai do próprio `linkWhatsapp`.
 */
import { describe, it, expect, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { linkWhatsapp } from "@/config/brand";
import { AvisoNaoAtualizados, AvisoRepetido, AvisoSemCadastro } from "./AvisosCadastro";
import {
  MENSAGEM_CRECI_EM_USO,
  MENSAGEM_SEM_CADASTRO,
  WHATSAPP_CRECI_EM_USO,
  WHATSAPP_ENTRAR_SEM_CODIGO,
  WHATSAPP_NAO_ATUALIZADO,
  WHATSAPP_TELEFONE_EM_USO,
  mensagemNaoAtualizados,
  mensagemTelefoneEmUso,
} from "./mensagens";
import StepOk from "./StepOk";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: () => undefined, replace: () => undefined }),
}));

const html = (el: Parameters<typeof renderToStaticMarkup>[0]) => renderToStaticMarkup(el);
const hrefNoHtml = (url: string) => `href="${url.replace(/&/g, "&amp;")}"`;
const semAcao = () => undefined;
const DICA = "m•••••a@provedor.com.br";

describe("textos", () => {
  it("WhatsApp repetido: com dica cita o e-mail mascarado; sem dica manda falar com a gente", () => {
    expect(mensagemTelefoneEmUso(DICA)).toBe(`Esse WhatsApp já tem cadastro com ${DICA}.`);
    expect(mensagemTelefoneEmUso(null)).toBe("Esse WhatsApp já tem cadastro. Fale com a gente.");
  });

  it("não atualizados: um campo, os dois, nenhum", () => {
    expect(mensagemNaoAtualizados(["telefone"])).toBe(
      "Não atualizamos seu WhatsApp: ele já está em outro cadastro. Fale com a gente.",
    );
    expect(mensagemNaoAtualizados(["creci"])).toMatch(/^Não atualizamos seu CRECI:/);
    expect(mensagemNaoAtualizados(["creci", "telefone"])).toMatch(/seu WhatsApp e seu CRECI: eles já estão/);
    expect(mensagemNaoAtualizados([])).toBeNull();
  });

  it("mensagens prontas do WhatsApp sem dado da pessoa", () => {
    for (const texto of [WHATSAPP_TELEFONE_EM_USO, WHATSAPP_CRECI_EM_USO, WHATSAPP_ENTRAR_SEM_CODIGO, WHATSAPP_NAO_ATUALIZADO]) {
      expect(texto).not.toMatch(/@|\d{4}/);
    }
  });
});

describe("AvisoRepetido (409 do cadastro)", () => {
  it("WhatsApp com dica: mostra o e-mail mascarado e oferece entrar com ele", () => {
    const aviso = html(createElement(AvisoRepetido, { repetido: { tipo: "telefone", dica: DICA }, aoEntrar: semAcao }));
    expect(aviso).toContain(DICA);
    expect(aviso).toContain("Entrar com esse e-mail");
    expect(aviso).toContain('role="alert"');
    expect(aviso).not.toContain("wa.me");
  });

  it("WhatsApp sem dica: só o WhatsApp da marca", () => {
    const aviso = html(createElement(AvisoRepetido, { repetido: { tipo: "telefone", dica: null }, aoEntrar: semAcao }));
    expect(aviso).toContain("Fale com a gente.");
    expect(aviso).toContain(hrefNoHtml(linkWhatsapp(WHATSAPP_TELEFONE_EM_USO)));
    expect(aviso).not.toContain("Entrar com esse e-mail");
  });

  it("CRECI: sem dica, com as duas saídas", () => {
    const aviso = html(createElement(AvisoRepetido, { repetido: { tipo: "creci" }, aoEntrar: semAcao }));
    expect(aviso).toContain(MENSAGEM_CRECI_EM_USO);
    expect(aviso).toContain("Entrar com meu e-mail");
    expect(aviso).toContain(hrefNoHtml(linkWhatsapp(WHATSAPP_CRECI_EM_USO)));
    expect(aviso).not.toContain("@");
  });
});

describe("AvisoSemCadastro e passo final", () => {
  it("e-mail sem cadastro oferece o cadastro", () => {
    const aviso = html(createElement(AvisoSemCadastro, { aoCadastrar: semAcao }));
    expect(aviso).toContain(MENSAGEM_SEM_CADASTRO);
    expect(aviso).toContain("Quero me cadastrar");
  });

  it("StepOk avisa o que não foi atualizado — e fica quieto quando tudo foi", () => {
    const comAviso = html(createElement(StepOk, { aoFechar: semAcao, naoAtualizados: ["telefone"] }));
    expect(comAviso).toContain("Não atualizamos seu WhatsApp");
    expect(comAviso).toContain(hrefNoHtml(linkWhatsapp(WHATSAPP_NAO_ATUALIZADO)));
    expect(html(createElement(StepOk, { aoFechar: semAcao }))).not.toContain("Não atualizamos");
    expect(html(createElement(AvisoNaoAtualizados, { campos: [] }))).toBe("");
  });
});
