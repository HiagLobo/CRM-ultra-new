import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

/** localStorage falso (o ambiente de teste é node: não existe window). */
function storageFake() {
  const dados = new Map<string, string>();
  return {
    getItem: (k: string) => dados.get(k) ?? null,
    setItem: (k: string, v: string) => void dados.set(k, v),
    removeItem: (k: string) => void dados.delete(k),
    get tamanho() {
      return dados.size;
    },
    get chaves() {
      return [...dados.keys()];
    },
    get valores() {
      return [...dados.values()];
    },
  };
}

let fake = storageFake();

beforeEach(() => {
  fake = storageFake();
  vi.stubGlobal("window", { localStorage: fake });
  vi.stubGlobal("document", { cookie: "" });
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe("demoAccess (espelho de UX do acesso ao demo)", () => {
  it("liberar → estaLiberado; limpar → volta a barrar", async () => {
    const { liberar, estaLiberado, limpar } = await import("./demoAccess");
    expect(estaLiberado()).toBe(false);
    liberar();
    expect(estaLiberado()).toBe(true);
    limpar();
    expect(estaLiberado()).toBe(false);
  });

  it("guarda só uma flag — nenhuma PII no localStorage", async () => {
    const { liberar } = await import("./demoAccess");
    liberar();
    expect(fake.chaves).toEqual(["crm_demo_liberado"]);
    expect(fake.valores).toEqual(["1"]);
  });

  it("sem window (SSR) não quebra e responde 'não liberado'", async () => {
    vi.stubGlobal("window", undefined);
    const { estaLiberado, liberar, limpar } = await import("./demoAccess");
    expect(estaLiberado()).toBe(false);
    expect(() => liberar()).not.toThrow();
    expect(() => limpar()).not.toThrow();
  });

  it("storage bloqueado (modo privativo) não derruba a tela", async () => {
    vi.stubGlobal("window", {
      get localStorage(): Storage {
        throw new Error("acesso negado");
      },
    });
    const { estaLiberado, liberar } = await import("./demoAccess");
    expect(() => liberar()).not.toThrow();
    expect(estaLiberado()).toBe(false);
  });
});

describe("entrarComoDemo (as 3 entradas da demonstração)", () => {
  it("abre a sessão da persona certa para cada perfil", async () => {
    const { entrarComoDemo, homeForPerfil } = await import("./auth");
    const esperado: [string, string][] = [
      ["corretor", "/corretor"],
      ["ceo", "/ceo/visao-geral"],
      ["franqueado", "/franqueado"],
    ];
    for (const [perfil, destino] of esperado) {
      const sessao = entrarComoDemo(perfil as never);
      expect(sessao?.perfil).toBe(perfil);
      expect(sessao?.nome).toBeTruthy(); // persona fictícia (LGPD: nunca pessoa real)
      expect(homeForPerfil(perfil as never)).toBe(destino);
    }
  });

  it("perfil desconhecido não cria sessão", async () => {
    const { entrarComoDemo, mockAuth } = await import("./auth");
    expect(entrarComoDemo("inexistente" as never)).toBeNull();
    expect(mockAuth.getSession()).toBeNull();
  });
});
