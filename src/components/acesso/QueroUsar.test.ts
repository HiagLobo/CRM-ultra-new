/**
 * "Quero usar no meu time" (O8·S3): banner do demo, rodapé do guia e tela de
 * acesso liberado, renderizados no servidor — sem navegador, sem rede.
 *
 * O número do WhatsApp não aparece aqui: vive só no `brand.ts` (guarda da
 * `regressao.test.ts`); o esperado sai do próprio `linkWhatsapp`.
 */
import { describe, it, expect, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { brand, linkWhatsapp } from "@/config/brand";
import { palette as p } from "@/lib/palette";
import { BotaoQueroUsar, MENSAGEM_CONVERSAR, MENSAGEM_QUERO_USAR, ROTULO_QUERO_USAR, linkQueroUsar } from "./QueroUsar";
import DemoBanner, { CSS_BANNER, LARGURA_CELULAR_BANNER } from "@/components/guia/DemoBanner";
import GuiaDrawer from "@/components/guia/GuiaDrawer";
import StepOk from "./StepOk";

vi.mock("next/navigation", () => ({
  usePathname: () => "/corretor",
  useRouter: () => ({ push: () => undefined, replace: () => undefined }),
}));

const html = (el: Parameters<typeof renderToStaticMarkup>[0]) => renderToStaticMarkup(el);
const semAcao = () => undefined;
/** O `href` do WhatsApp como sai no HTML (o React escapa `&` em `&amp;`). */
const hrefNoHtml = (url: string) => `href="${url.replace(/&/g, "&amp;")}"`;
/** Estilo inline de um elemento com o atributo dado (ex.: o link do botão). */
function estiloDe(markup: string, atributo: string): string {
  const tag = markup.split("<").find((t) => t.includes(atributo)) ?? "";
  return /style="([^"]*)"/.exec(tag)?.[1] ?? "";
}

describe("mensagem e link", () => {
  it("curta, com o nome da marca e sem dado da pessoa", () => {
    expect(MENSAGEM_QUERO_USAR).toContain(brand.nomeCurto);
    expect(MENSAGEM_QUERO_USAR.length).toBeLessThanOrEqual(90);
    expect(MENSAGEM_QUERO_USAR).not.toMatch(/@|\d{4}/);
    expect(MENSAGEM_CONVERSAR).toContain(brand.nomeCurto);
  });

  it("abre o WhatsApp comercial da marca em nova aba, com a mensagem pronta", () => {
    expect(linkQueroUsar()).toBe(linkWhatsapp(MENSAGEM_QUERO_USAR));
    const botao = html(createElement(BotaoQueroUsar));
    expect(botao).toContain(hrefNoHtml(linkQueroUsar()));
    expect(botao).toContain('target="_blank"');
    expect(botao).toContain('rel="noopener noreferrer"');
    expect(botao).toContain(ROTULO_QUERO_USAR);
  });
});

describe("DemoBanner — o destaque é o Quero usar", () => {
  const banner = html(createElement(DemoBanner, { aoSaberMais: semAcao, aoFechar: semAcao }));

  it("tem o botão, preenchido com a cor primária, ao lado do Como usar e do fechar", () => {
    expect(banner).toContain(hrefNoHtml(linkQueroUsar()));
    expect(estiloDe(banner, "wa.me")).toContain(`background:${p.primary}`);
    expect(estiloDe(banner, "wa.me")).toContain("color:#fff");
    expect(banner).toContain("Como usar este painel");
    expect(banner).toContain('aria-label="Ocultar aviso de demonstração"');
  });

  it("desktop: textos completos; celular: 'Quero usar' e 'Como usar', ações na 2ª linha", () => {
    expect(banner).toContain(`<span class="db-longo">${ROTULO_QUERO_USAR}</span>`);
    expect(banner).toContain('<span class="db-curto">Quero usar</span>');
    expect(banner).toContain('<span class="db-curto">Como usar</span>');
    expect(CSS_BANNER).toMatch(/^\s*\.db-curto \{ display: none; \}/); // na tela larga, só o texto longo
    const celular = CSS_BANNER.slice(CSS_BANNER.indexOf(`@media (max-width: ${LARGURA_CELULAR_BANNER}px)`));
    expect(celular).toMatch(/\.db-longo \{ display: none; \}/);
    expect(celular).toMatch(/\.db-curto \{ display: inline; \}/);
    expect(celular).toMatch(/\.db-acoes \{[^}]*flex-basis: 100%/);
  });

  it("não cobre nada: a faixa fica no fluxo e quebra linha em vez de vazar", () => {
    const faixa = estiloDe(banner, 'class="db-faixa"');
    expect(faixa).toContain("flex-wrap:wrap");
    expect(faixa).not.toMatch(/position:(fixed|absolute|sticky)/);
    expect(banner).not.toMatch(/position:(fixed|absolute)/);
    // o texto encolhe sem empurrar os botões para fora da tela
    expect(banner).toContain("flex:1 1 260px;min-width:0");
  });
});

describe("GuiaDrawer — rodapé sempre oferece o Quero usar", () => {
  const props = { painel: "corretor" as const, aoFechar: semAcao, rodape: "84px" };

  it("com e sem tour na tela (vale também para quem fechou o banner)", () => {
    for (const aoRefazerTour of [undefined, semAcao]) {
      const guia = html(createElement(GuiaDrawer, { ...props, aoRefazerTour }));
      expect(guia).toContain(hrefNoHtml(linkQueroUsar()));
      expect(guia).toContain(ROTULO_QUERO_USAR);
      expect(estiloDe(guia, "wa.me")).toContain(`background:${p.primary}`);
    }
  });

  it("o rodapé gruda na base do próprio guia (visível quando as dicas rolam) e fica por último", () => {
    const guia = html(createElement(GuiaDrawer, { ...props, aoRefazerTour: semAcao }));
    const rodape = /<div style="([^"]*)"><a href="https:\/\/wa\.me/.exec(guia)?.[1] ?? "";
    expect(rodape).toContain("position:sticky");
    expect(rodape).toContain("bottom:0");
    expect(guia.indexOf("Refazer o tour")).toBeLessThan(guia.indexOf("wa.me"));
  });
});

describe("StepOk — acesso liberado", () => {
  it("oferece a conversa no WhatsApp, em nova aba", () => {
    const ok = html(createElement(StepOk, { aoFechar: semAcao }));
    expect(ok).toContain("Quer conversar?");
    expect(ok).toContain("Fale com a gente no WhatsApp");
    expect(ok).toContain(hrefNoHtml(linkWhatsapp(MENSAGEM_CONVERSAR)));
    expect(ok).toContain('target="_blank"');
  });
});
