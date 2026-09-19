/**
 * O portão de servidor dos painéis. O que importa: só passa quem tem o cookie
 * httpOnly ASSINADO — não basta ter um cookie, nem ter o espelho no
 * localStorage (que o servidor sequer enxerga).
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { assinarTokenDemo, assinarPayload, COOKIE_TOKEN_DEMO } from "./token";

const SECRET = "segredo-de-teste-1234567890";

const { estado } = vi.hoisted(() => ({
  estado: { cookie: undefined as string | undefined, redirecionou: null as string | null },
}));

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (nome: string) =>
      nome === COOKIE_TOKEN_DEMO && estado.cookie ? { value: estado.cookie } : undefined,
  }),
}));
vi.mock("next/navigation", () => ({
  redirect: (destino: string) => {
    estado.redirecionou = destino;
    throw new Error("NEXT_REDIRECT"); // o redirect real também interrompe a renderização
  },
}));

beforeEach(() => {
  process.env.APP_SECRET = SECRET;
  estado.cookie = undefined;
  estado.redirecionou = null;
});

async function tentar(): Promise<"passou" | "barrado"> {
  const { exigirDemo } = await import("./exigirDemo");
  try {
    await exigirDemo();
    return "passou";
  } catch {
    return "barrado";
  }
}

describe("exigirDemo (portão de servidor dos painéis)", () => {
  it("token válido passa", async () => {
    estado.cookie = assinarTokenDemo({ email: "corretor@exemplo.com" }, SECRET);
    expect(await tentar()).toBe("passou");
    expect(estado.redirecionou).toBeNull();
  });

  it("sem cookie: barra e manda para a landing SINALIZANDO o motivo", async () => {
    // sem o parâmetro, quem voltasse depois dos 7 dias cairia na landing sem
    // explicação e com o /login ainda mostrando as 3 entradas
    expect(await tentar()).toBe("barrado");
    expect(estado.redirecionou).toBe("/?acesso=necessario");
  });

  it("cookie forjado à mão não passa", async () => {
    estado.cookie = "eyJlbWFpbCI6ImludmFzb3JAeC5jb20iLCJleHAiOjk5OTk5OTk5OTl9.assinatura";
    expect(await tentar()).toBe("barrado");
  });

  it("token assinado com outro secret não passa", async () => {
    estado.cookie = assinarTokenDemo({ email: "x@y.com" }, "outro-segredo-1234567890");
    expect(await tentar()).toBe("barrado");
  });

  it("token expirado não passa", async () => {
    const ontem = new Date(Date.now() - 8 * 24 * 3600 * 1000); // validade é 7 dias
    estado.cookie = assinarTokenDemo({ email: "x@y.com" }, SECRET, ontem);
    expect(await tentar()).toBe("barrado");
  });

  it("sessão de ADMIN não abre painel de demo (payload sem e-mail)", async () => {
    // assinado com o mesmo secret, mas é outro tipo de token
    estado.cookie = assinarPayload({ adm: true }, SECRET, 3600);
    expect(await tentar()).toBe("barrado");
  });
});
