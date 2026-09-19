/**
 * Marcação das peças anti-robô e da saída pelo WhatsApp (revisão da O7·S1),
 * renderizada no servidor — sem navegador, sem rede.
 */
import { describe, it, expect } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { CampoIsca, NOME_CAMPO_ISCA } from "./AntiRobo";
import { AvisoErro } from "./ui";

const html = (el: Parameters<typeof renderToStaticMarkup>[0]) => renderToStaticMarkup(el);

describe("CampoIsca (honeypot)", () => {
  const isca = html(createElement(CampoIsca, { valor: "", aoMudar: () => undefined }));

  it("nome e rótulo sem nada que o autopreenchimento reconheça como site", () => {
    expect(NOME_CAMPO_ISCA).not.toMatch(/web|site|url|home|link|http/i);
    expect(isca).toContain(`name="${NOME_CAMPO_ISCA}"`);
    expect(isca).not.toMatch(/web|site|url|homepage/i);
  });

  it("gerenciadores de senha mandados ignorar; fora do Tab e do leitor de tela", () => {
    expect(isca).toContain('data-1p-ignore=""');
    expect(isca).toContain('data-lpignore="true"');
    expect(isca).toContain('tabindex="-1"');
    expect(isca).toMatch(/autocomplete="off"/i);
    expect(isca).toContain('aria-hidden="true"');
  });
});

describe("AvisoErro", () => {
  it("com whatsapp: link clicável da marca, sem dado da pessoa na mensagem pronta", () => {
    const aviso = html(createElement(AvisoErro, { mensagem: "a verificação caiu.", whatsapp: true }));
    expect(aviso).toContain("https://wa.me/");
    expect(aviso).toContain("Falar no WhatsApp");
    expect(aviso).not.toMatch(/@/); // nenhum e-mail no texto pré-preenchido
  });

  it("sem whatsapp: só a mensagem", () => {
    const aviso = html(createElement(AvisoErro, { mensagem: "confira os dados." }));
    expect(aviso).toContain("confira os dados.");
    expect(aviso).not.toContain("wa.me");
  });
});
