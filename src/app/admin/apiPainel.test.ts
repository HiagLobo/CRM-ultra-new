/**
 * `pedirApi` com o `fetch` trocado: sessão vencida (401) leva ao login e não
 * devolve corpo; rede fora vira status 0; corpo sem JSON vira `null`. Nunca lança.
 */
import { describe, it, expect, vi, afterEach } from "vitest";
import { comJson, pedirApi, urlNotas } from "./apiPainel";

afterEach(() => {
  vi.unstubAllGlobals();
});

const responder = (res: Response) => vi.stubGlobal("fetch", vi.fn(async () => res));

describe("chamada à API do painel", () => {
  it("200 com JSON → status e corpo; sem cache", async () => {
    const fetchFalso = vi.fn(async () => Response.json({ ok: true, leads: [] }));
    vi.stubGlobal("fetch", fetchFalso);
    const aoSessaoCair = vi.fn();
    expect(await pedirApi("/api/admin/leads", undefined, aoSessaoCair)).toEqual({ status: 200, corpo: { ok: true, leads: [] } });
    expect(aoSessaoCair).not.toHaveBeenCalled();
    expect(fetchFalso).toHaveBeenCalledWith("/api/admin/leads", expect.objectContaining({ cache: "no-store" }));
  });

  it("401 (sessão vencida) → volta para o login e devolve null", async () => {
    responder(Response.json({ ok: false, erro: "nao_autorizado" }, { status: 401 }));
    const aoSessaoCair = vi.fn();
    expect(await pedirApi("/api/admin/leads", comJson("PATCH", { id: "1", etapa: "cliente" }), aoSessaoCair)).toBeNull();
    expect(aoSessaoCair).toHaveBeenCalledOnce();
  });

  it("rede fora → status 0 (a tela diz 'sem conexão'), sem lançar", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => Promise.reject(new TypeError("Failed to fetch"))));
    expect(await pedirApi("/api/admin/leads", undefined, vi.fn())).toEqual({ status: 0, corpo: null });
  });

  it("resposta sem JSON (página de erro do provedor) → corpo null com o status", async () => {
    responder(new Response("<html>502</html>", { status: 502 }));
    expect(await pedirApi("/api/admin/leads", undefined, vi.fn())).toEqual({ status: 502, corpo: null });
  });

  it("envio JSON e rota das anotações com o id escapado", () => {
    expect(comJson("POST", { texto: "a" })).toEqual({
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: '{"texto":"a"}',
    });
    expect(urlNotas("abc-123")).toBe("/api/admin/leads/abc-123/notas");
    expect(urlNotas("../x?y")).toBe("/api/admin/leads/..%2Fx%3Fy/notas");
  });
});
