/**
 * Dublês dos testes do cliente da API do fluxo de acesso — sem rede.
 * Só arquivos `*.test.ts` importam daqui; nada de produção depende disto.
 * Dados fictícios (repositório público): e-mail em `exemplo.com`, telefone de teste.
 */
import { vi } from "vitest";
import type { DadosSolicitacao } from "./api";

export const DADOS: DadosSolicitacao = {
  nome: "Corretora Exemplo",
  email: "corretor@exemplo.com",
  telefone: "+5511900000000",
  creci: "SP 12345",
  consentimento: true,
};

/** fetch falso: devolve status + corpo escolhidos e guarda o que foi enviado. */
export function fetchFake(status: number, corpo: unknown, opts: { naoEhJson?: boolean } = {}) {
  const chamadas: { url: string; body: unknown }[] = [];
  const fake = vi.fn(async (url: string, init: RequestInit) => {
    chamadas.push({ url, body: JSON.parse(String(init.body)) });
    return {
      ok: status >= 200 && status < 300,
      status,
      json: async () => {
        if (opts.naoEhJson) throw new Error("não é json");
        return corpo;
      },
    } as unknown as Response;
  });
  vi.stubGlobal("fetch", fake);
  return chamadas;
}

/** fetch que falha como rede fora do ar. */
export function fetchOffline() {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => {
      throw new Error("offline");
    }),
  );
}

/** Captura tudo o que for para o console (para provar que nada de PII sai). */
export function capturarConsole(): string[] {
  const logs: string[] = [];
  for (const nivel of ["log", "info", "warn", "error", "debug"] as const) {
    vi.spyOn(console, nivel).mockImplementation((...args: unknown[]) => {
      logs.push(args.map(String).join(" "));
    });
  }
  return logs;
}
