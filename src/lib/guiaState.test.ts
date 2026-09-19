import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { GUIA, SECOES, TOURS, painelDaRota, secaoDaRota, tourDaRota, type Painel } from "../content/guia";

function storageFake() {
  const dados = new Map<string, string>();
  return {
    getItem: (k: string) => dados.get(k) ?? null,
    setItem: (k: string, v: string) => void dados.set(k, v),
    removeItem: (k: string) => void dados.delete(k),
    get chaves() {
      return [...dados.keys()];
    },
    set: (k: string, v: string) => void dados.set(k, v),
  };
}

let fake = storageFake();

beforeEach(() => {
  fake = storageFake();
  vi.stubGlobal("window", { localStorage: fake });
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe("guiaState (memória do guia do demo)", () => {
  it("boas-vindas aparecem uma vez por painel, e cada painel conta separado", async () => {
    const { jaViu, marcarVisto } = await import("./guiaState");
    expect(jaViu("corretor")).toBe(false);

    marcarVisto("corretor");
    expect(jaViu("corretor")).toBe(true);
    expect(jaViu("ceo")).toBe(false); // o visitante ainda não abriu o painel do CEO

    marcarVisto("ceo");
    expect(jaViu("ceo")).toBe(true);
    expect(jaViu("corretor")).toBe(true); // marcar um não apaga o outro
  });

  it("marcar duas vezes não duplica o registro", async () => {
    const { marcarVisto } = await import("./guiaState");
    marcarVisto("corretor");
    marcarVisto("corretor");
    expect(JSON.parse(fake.getItem("crm_guia_vistos")!)).toEqual(["corretor"]);
  });

  it("banner fica oculto depois de fechado", async () => {
    const { bannerOculto, ocultarBanner } = await import("./guiaState");
    expect(bannerOculto()).toBe(false);
    ocultarBanner();
    expect(bannerOculto()).toBe(true);
  });

  it("limparGuia devolve o demo ao estado inicial (para reapresentar)", async () => {
    const { marcarVisto, ocultarBanner, limparGuia, jaViu, bannerOculto } = await import("./guiaState");
    marcarVisto("corretor");
    ocultarBanner();
    limparGuia();
    expect(jaViu("corretor")).toBe(false);
    expect(bannerOculto()).toBe(false);
  });

  it("valor corrompido no storage é tratado como 'nunca viu', sem quebrar", async () => {
    fake.set("crm_guia_vistos", "isto não é json");
    const { jaViu, marcarVisto } = await import("./guiaState");
    expect(jaViu("corretor")).toBe(false);
    expect(() => marcarVisto("corretor")).not.toThrow();
  });

  it("sem window (SSR) responde 'não viu' e não lança", async () => {
    vi.stubGlobal("window", undefined);
    const { jaViu, marcarVisto, bannerOculto, ocultarBanner } = await import("./guiaState");
    expect(jaViu("ceo")).toBe(false);
    expect(bannerOculto()).toBe(false);
    expect(() => marcarVisto("ceo")).not.toThrow();
    expect(() => ocultarBanner()).not.toThrow();
  });
});

describe("tours guiados", () => {
  it("memória por tela: pular ou concluir não faz o tour insistir", async () => {
    const { tourVisto, marcarTourVisto, esquecerTour } = await import("./guiaState");
    expect(tourVisto("/corretor")).toBe(false);
    marcarTourVisto("/corretor");
    expect(tourVisto("/corretor")).toBe(true);
    expect(tourVisto("/buscar")).toBe(false); // cada tela conta a sua

    esquecerTour("/corretor"); // "refazer o tour" no guia
    expect(tourVisto("/corretor")).toBe(false);
  });

  it("limparGuia zera também os tours", async () => {
    const { marcarTourVisto, limparGuia, tourVisto } = await import("./guiaState");
    marcarTourVisto("/corretor/atendimento");
    limparGuia();
    expect(tourVisto("/corretor/atendimento")).toBe(false);
  });

  it("todo passo aponta para uma âncora que EXISTE no código", async () => {
    // é o erro que passa despercebido: renomeou o data-tour, o passo some calado
    const { promises: fs } = await import("fs");
    const path = await import("path");

    async function varrer(dir: string): Promise<string[]> {
      const itens = await fs.readdir(dir, { withFileTypes: true });
      const listas = await Promise.all(
        itens.map(async (i) => {
          const completo = path.join(dir, i.name);
          if (i.isDirectory()) return varrer(completo);
          return /\.tsx$/.test(i.name) ? [completo] : [];
        }),
      );
      return listas.flat();
    }

    const arquivos = await varrer(path.join(process.cwd(), "src"));
    const fontes = await Promise.all(arquivos.map((a) => fs.readFile(a, "utf8")));
    const codigo = fontes.join("\n");

    // âncoras fixas: data-tour="alguma-coisa"
    const literais = new Set(
      [...codigo.matchAll(/data-tour="([a-z0-9-]+)"/g)].map((m) => m[1]!),
    );
    // âncoras geradas: data-tour={`prefixo-${...}`} — a barra lateral do corretor
    // e os grupos do CEO nascem assim, então o nome exato não existe no código
    const prefixos = [...codigo.matchAll(/data-tour=\{`([a-z0-9-]+)\$\{/g)].map((m) => m[1]!);

    const ausentes: string[] = [];
    for (const [rota, passos] of Object.entries(TOURS)) {
      for (const passo of passos) {
        const nome = passo.alvo.replace(/\[data-tour="(.+)"\]/, "$1");
        const existe = literais.has(nome) || prefixos.some((p) => nome.startsWith(p));
        if (!existe) ausentes.push(`${rota} → ${passo.alvo}`);
      }
    }
    expect(ausentes).toEqual([]);
    expect(prefixos.length, "os prefixos gerados deixaram de existir").toBeGreaterThan(0);

    // O prefixo sozinho aceitaria "ceo-grupo-financeiros" com erro de digitação.
    // Os nomes saem dos títulos do menu do CEO, então dá para conferir de verdade.
    const chrome = await fs.readFile(
      path.join(process.cwd(), "src/components/ceo/CeoChrome.tsx"),
      "utf8",
    );
    const grupos = [...chrome.matchAll(/title: "([^"]+)", items:/g)]
      .map((m) =>
        m[1]!
          .normalize("NFD")
          .replace(/[̀-ͯ]/g, "")
          .toLowerCase()
          .split(" ")[0]!,
      )
      .concat("inicio"); // o primeiro grupo não tem título

    const gruposInvalidos = Object.values(TOURS)
      .flat()
      .map((p) => p.alvo.replace(/\[data-tour="(.+)"\]/, "$1"))
      .filter((nome) => nome.startsWith("ceo-grupo-"))
      .filter((nome) => !grupos.includes(nome.replace("ceo-grupo-", "")));
    expect(gruposInvalidos, `grupos do CEO conhecidos: ${grupos.join(", ")}`).toEqual([]);
  });

  it("todo tour tem texto utilizável e rota conhecida", () => {
    for (const [rota, passos] of Object.entries(TOURS)) {
      expect(passos.length, rota).toBeGreaterThanOrEqual(3);
      expect(tourDaRota(rota), rota).toBe(passos);
      for (const passo of passos) {
        expect(passo.alvo, rota).toMatch(/^\[data-tour="[a-z0-9-]+"\]$/);
        expect(passo.titulo.length, rota).toBeGreaterThan(5);
        expect(passo.texto.length, rota).toBeGreaterThan(30);
      }
    }
    expect(tourDaRota("/rota/que/nao/tem/tour")).toBeNull();
  });
});

describe("catálogo do guia", () => {
  const painéis: Painel[] = ["corretor", "ceo", "franqueado"];

  it("os 3 painéis têm conteúdo utilizável", () => {
    for (const painel of painéis) {
      const g = GUIA[painel];
      expect(g.nome.length, painel).toBeGreaterThan(3);
      expect(g.titulo.length, painel).toBeGreaterThan(10);
      expect(g.resumo.length, painel).toBeGreaterThan(40);
      expect(g.passos.length, painel).toBeGreaterThanOrEqual(3);
      for (const passo of g.passos) {
        expect(passo.titulo.length).toBeGreaterThan(3);
        expect(passo.texto.length).toBeGreaterThan(20);
      }
    }
  });

  it("cada seção aponta para um painel existente e tem dica utilizável", () => {
    for (const secao of SECOES) {
      expect(painelDaRota(secao.rota), secao.rota).not.toBeNull();
      expect(secao.titulo.length, secao.rota).toBeGreaterThan(3);
      expect(secao.dicas.length, secao.rota).toBeGreaterThanOrEqual(2);
      for (const dica of secao.dicas) expect(dica.length).toBeGreaterThan(30);
    }
  });

  it("a rota escolhe a seção, e a correspondência mais específica ganha", () => {
    expect(secaoDaRota("/corretor/funil")?.titulo).toBe("Funil de vendas");
    expect(secaoDaRota("/ceo/associados")?.titulo).toBe("Corretores associados");
    // /corretor/radar/mapa é sub-rota do Radar: herda as dicas dele
    expect(secaoDaRota("/corretor/radar/mapa")?.titulo).toBe("Radar de captação");
    // /franqueado é prefixo de tudo do painel, mas não pode capturar outro painel
    expect(secaoDaRota("/franqueado")?.titulo).toBe("Visão da unidade");
  });

  it("rota sem dica própria cai no fallback — o guia nunca abre vazio", () => {
    // telas que existem no painel mas não estão no catálogo
    for (const rota of ["/corretor/parcerias", "/corretor/perfil", "/ceo/planos", "/ceo/radar"]) {
      expect(secaoDaRota(rota), rota).toBeNull();
      const painel = painelDaRota(rota)!;
      // o fallback são os passos gerais do painel, que sempre existem
      expect(GUIA[painel].passos.length).toBeGreaterThanOrEqual(3);
    }
  });

  it("a rota decide o painel; fora dos painéis não há guia", () => {
    expect(painelDaRota("/corretor")).toBe("corretor");
    expect(painelDaRota("/corretor/funil")).toBe("corretor");
    expect(painelDaRota("/ceo/visao-geral")).toBe("ceo");
    expect(painelDaRota("/franqueado")).toBe("franqueado");
    expect(painelDaRota("/")).toBeNull();
    expect(painelDaRota("/admin")).toBeNull();
    expect(painelDaRota("/demo/portal")).toBeNull();
  });
});
