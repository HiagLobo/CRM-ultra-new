/**
 * Guardas do painel (O8·S2), sem navegador:
 * - o painel não loga nada: contato, nome e anotações só aparecem na tela;
 * - o painel só fala com a API do admin (nada de terceiro recebendo dado de lead);
 * - cor só da palette (nada de hex cravado nos componentes — `#fff` incluso).
 */
import { describe, it, expect } from "vitest";
import { promises as fs } from "fs";
import path from "path";

const PASTA = path.join(process.cwd(), "src", "app", "admin");

async function fontes(dir: string = PASTA): Promise<string[]> {
  const itens = await fs.readdir(dir, { withFileTypes: true });
  const listas = await Promise.all(
    itens.map(async (i) => {
      const completo = path.join(dir, i.name);
      if (i.isDirectory()) return fontes(completo);
      return /\.(ts|tsx)$/.test(i.name) && !i.name.endsWith(".test.ts") ? [completo] : [];
    }),
  );
  return listas.flat();
}

const rel = (a: string) => path.relative(process.cwd(), a).replace(/\\/g, "/");

describe("painel do admin sem vazamento", () => {
  it("nenhum console.* no painel (PII fica na tela, nunca no log do navegador)", async () => {
    const achados: string[] = [];
    for (const a of await fontes()) {
      if (/\bconsole\.(log|error|warn|info|debug)\(/.test(await fs.readFile(a, "utf8"))) achados.push(rel(a));
    }
    expect(achados).toEqual([]);
  });

  it("o painel só chama a própria API (/api/admin/*)", async () => {
    const fora: string[] = [];
    for (const a of await fontes()) {
      const txt = await fs.readFile(a, "utf8");
      for (const m of txt.matchAll(/fetch\(\s*["'`]([^"'`]+)["'`]/g)) {
        if (!m[1]!.startsWith("/api/admin/")) fora.push(`${rel(a)} → ${m[1]}`);
      }
      for (const m of txt.matchAll(/pedir(?:Api)?\(\s*["'`]([^"'`]+)["'`]/g)) {
        if (!m[1]!.startsWith("/api/admin/")) fora.push(`${rel(a)} → ${m[1]}`);
      }
    }
    expect(fora).toEqual([]);
  });

  it("as telas novas da O8 usam só a palette (sem cor hex cravada)", async () => {
    const telas = (await fontes()).filter((a) => a.endsWith(".tsx") && !a.includes(`${path.sep}login${path.sep}`));
    const cravadas: string[] = [];
    for (const a of telas) {
      const txt = await fs.readFile(a, "utf8");
      for (const m of txt.matchAll(/["'`]#[0-9a-fA-F]{3,8}["'`]/g)) cravadas.push(`${rel(a)} ${m[0]}`);
    }
    expect(cravadas).toEqual([]);
  });
});
