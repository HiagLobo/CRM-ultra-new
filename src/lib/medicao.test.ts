/**
 * O filtro da medição de audiência. O que importa provar: nenhuma URL de área
 * restrita chega ao contador, principalmente a folha do orçamento, cujo
 * endereço carrega o identificador do cliente.
 */
import { describe, it, expect } from "vitest";
import { caminhoDaUrl, podeMedir, filtrarEvento, FORA_DA_MEDICAO } from "./medicao";

const SITE = "https://www.exemplo.com.br";

describe("caminhoDaUrl", () => {
  it("tira domínio, busca e âncora", () => {
    expect(caminhoDaUrl(`${SITE}/demo/portal?utm_source=insta#topo`)).toBe("/demo/portal");
    expect(caminhoDaUrl("/demo/portal")).toBe("/demo/portal");
    expect(caminhoDaUrl(SITE)).toBe("/");
    expect(caminhoDaUrl(`${SITE}/`)).toBe("/");
  });

  it("barra no fim não cria outra página", () => {
    expect(caminhoDaUrl(`${SITE}/admin/`)).toBe("/admin");
    expect(caminhoDaUrl("admin")).toBe("/admin");
  });
});

describe("podeMedir", () => {
  it("conta o site público", () => {
    for (const rota of ["/", "/privacidade", "/demo/portal", "/ceo/planos", "/corretor/radar"]) {
      expect(podeMedir(SITE + rota)).toBe(true);
    }
  });

  it("nunca conta o painel nem a entrada dele", () => {
    for (const rota of ["/admin", "/admin/", "/admin/login", "/ADMIN/Leads", "/login", "/api/admin/orcamentos"]) {
      expect(podeMedir(SITE + rota)).toBe(false);
    }
  });

  it("a folha do orçamento não leva o identificador do cliente para fora", () => {
    const id = "6f1c0c2e-0000-4000-8000-000000000001";
    expect(podeMedir(`${SITE}/admin/orcamento/${id}`)).toBe(false);
    expect(podeMedir(`${SITE}/admin/orcamento/${id}?imprimir=1`)).toBe(false);
  });

  it("não confunde quem só começa parecido", () => {
    expect(podeMedir(`${SITE}/administracao`)).toBe(true);
    expect(podeMedir(`${SITE}/logins`)).toBe(true);
  });
});

describe("filtrarEvento", () => {
  it("devolve o evento do site e descarta o do painel", () => {
    const publico = { type: "pageview" as const, url: `${SITE}/` };
    expect(filtrarEvento(publico)).toBe(publico);
    expect(filtrarEvento({ type: "pageview" as const, url: `${SITE}/admin` })).toBeNull();
    expect(filtrarEvento({ type: "event" as const, url: `${SITE}/admin/orcamento/abc` })).toBeNull();
  });

  it("a lista de áreas restritas cobre tudo que é do fundador", () => {
    expect([...FORA_DA_MEDICAO]).toEqual(["/admin", "/login", "/api"]);
  });
});
