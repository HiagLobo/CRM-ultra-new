/**
 * Guardas de regressão do projeto (O5·S1) — o que antes era conferência manual
 * e passava a valer só até alguém esquecer de rodar o grep.
 */
import { describe, it, expect } from "vitest";
import { promises as fs } from "fs";
import path from "path";

const RAIZ = path.join(process.cwd(), "src");

async function arquivosFonte(dir: string = RAIZ): Promise<string[]> {
  const itens = await fs.readdir(dir, { withFileTypes: true });
  const listas = await Promise.all(
    itens.map(async (i) => {
      const completo = path.join(dir, i.name);
      if (i.isDirectory()) return arquivosFonte(completo);
      return /\.(ts|tsx|css)$/.test(i.name) ? [completo] : [];
    }),
  );
  return listas.flat();
}

const relativo = (a: string) => path.relative(process.cwd(), a).replace(/\\/g, "/");

/** Este arquivo cita padrões de busca que ele mesmo casaria — não se conta. */
const ESTE_ARQUIVO = "src/lib/regressao.test.ts";
const paraVarrer = (arquivos: string[]) => arquivos.filter((a) => relativo(a) !== ESTE_ARQUIVO);

/**
 * Documentos que vão junto com o repositório. O `README.md` ficou com a marca e
 * o e-mail real de uma pessoa até a O5·S1 — a varredura da O0 só olhava `src/`.
 * Nome e pessoas do ex-cliente são vigiados por hash em `exCliente.test.ts` (O6);
 * aqui fica o padrão genérico de e-mail pessoal.
 */
async function documentosPublicos(): Promise<string[]> {
  const md = async (dir: string): Promise<string[]> => {
    const itens = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
    const listas = await Promise.all(
      itens.map((i) =>
        i.isDirectory() ? md(path.join(dir, i.name)) : Promise.resolve(i.name.endsWith(".md") ? [path.join(dir, i.name)] : []),
      ),
    );
    return listas.flat();
  };
  return ["README.md", ".env.example", "public/assets/CREDITOS.md"]
    .map((d) => path.join(process.cwd(), d))
    .concat(await md(path.join(process.cwd(), "waves")));
}

describe("marca e contato", () => {
  it("nenhum e-mail de pessoa real nos documentos publicados", async () => {
    // o demo é todo persona fictícia; e-mail de gente real não entra no repo
    const achados: string[] = [];
    for (const doc of await documentosPublicos()) {
      const txt = await fs.readFile(doc, "utf8").catch(() => "");
      txt.split("\n").forEach((linha, i) => {
        if (/[a-z0-9._%+-]+@(gmail|hotmail|outlook|yahoo|icloud)\.com/i.test(linha)) {
          achados.push(`${relativo(doc)}:${i + 1}`);
        }
      });
    }
    expect(achados).toEqual([]);
  });

  /**
   * O contato real (Safe Guardian) vive em `brand.ts` e em mais lugar nenhum.
   * Foi assim que o contato do cliente ANTIGO sobreviveu à O0 espalhado por 6
   * telas — este teste é o que impede a história se repetir.
   */
  it("telefone, e-mail e CNPJ existem só no brand.ts", async () => {
    const { brand } = await import("../config/brand");
    const marcas: [string, string][] = [
      ["e-mail", brand.contato.email],
      ["telefone", brand.contato.telefone.replace(/\D/g, "")],
      ["CNPJ", brand.empresa.cnpj.replace(/\D/g, "")],
    ];

    const fora: string[] = [];
    for (const a of paraVarrer(await arquivosFonte())) {
      const rel = relativo(a);
      if (rel === "src/config/brand.ts") continue; // a fonte única
      const txt = (await fs.readFile(a, "utf8")).replace(/\D/g, "");
      const bruto = await fs.readFile(a, "utf8");
      for (const [nome, valor] of marcas) {
        if (!valor) continue;
        const achou = nome === "e-mail" ? bruto.includes(valor) : txt.includes(valor);
        if (achou) fora.push(`${rel} (${nome})`);
      }
    }
    expect(fora).toEqual([]);
  });

});

/**
 * Imagens do protótipo do ex-cliente são vigiadas por conteúdo (hash) em
 * `exCliente.test.ts`. Aqui: nenhum src de imagem apontando para arquivo inexistente.
 */
describe("imagens", () => {
  it("toda imagem referenciada no código existe em public/ (nada de src quebrado)", async () => {
    const arquivos = paraVarrer(await arquivosFonte());
    const faltando: string[] = [];
    for (const a of arquivos) {
      const txt = await fs.readFile(a, "utf8");
      // caminhos absolutos de imagem: "/img/x.png", "/assets/y.svg"
      for (const m of txt.matchAll(/["'`(](\/(?:img|assets)\/[\w./-]+\.(?:png|jpe?g|svg|webp))["'`)]/g)) {
        const rel = m[1]!;
        const existe = await fs
          .access(path.join(process.cwd(), "public", rel))
          .then(() => true)
          .catch(() => false);
        if (!existe) faltando.push(`${relativo(a)} → ${rel}`);
      }
    }
    expect(faltando).toEqual([]);
  });
});

describe("regra das 200 linhas (bloqueador acima de 300)", () => {
  /**
   * Vale para o que as ondas construíram. As telas herdadas do protótipo
   * (painéis mock) nasceram fora deste plano e estouram o limite — dividi-las
   * seria refatorar fora de escopo, o que o PROTOCOLO proíbe. Ficam registradas
   * como ressalva no ESTADO da O5, não como pass silencioso.
   */
  const AREAS_DAS_ONDAS = [
    "src/features/",
    "src/lib/",
    "src/config/",
    "src/components/landing/",
    "src/components/acesso/",
    "src/app/admin/",
    "src/app/api/",
    "src/app/page.tsx",
  ];

  it("nenhum arquivo construído nas ondas passa de 300 linhas", async () => {
    const arquivos = await arquivosFonte();
    const grandes: string[] = [];
    for (const a of arquivos) {
      const rel = relativo(a);
      if (!AREAS_DAS_ONDAS.some((area) => rel.startsWith(area))) continue;
      const linhas = (await fs.readFile(a, "utf8")).split("\n").length;
      if (linhas > 300) grandes.push(`${rel} (${linhas})`);
    }
    expect(grandes).toEqual([]);
  });
});

describe("superfícies públicas com PII", () => {
  it("toda rota de /api/admin chama exigirAdmin antes de qualquer coisa", async () => {
    const rotas = (await arquivosFonte(path.join(RAIZ, "app", "api", "admin"))).filter((a) =>
      a.endsWith("route.ts"),
    );
    // login e logout são a porta: não podem exigir sessão para funcionar
    const protegidas = rotas.filter((a) => !/(login|logout)/.test(a));
    expect(protegidas.length).toBeGreaterThan(0);

    for (const rota of protegidas) {
      const txt = await fs.readFile(rota, "utf8");
      const handlers = txt.match(/export async function (GET|POST|PATCH|PUT|DELETE)/g) ?? [];
      expect(handlers.length, `${relativo(rota)} sem handler`).toBeGreaterThan(0);
      // um exigirAdmin por handler exportado
      const guardas = txt.match(/exigirAdmin\(req\)/g) ?? [];
      expect(guardas.length, `${relativo(rota)}: ${handlers.length} handlers, ${guardas.length} guardas`).toBe(
        handlers.length,
      );
    }
  });

  it("nenhuma rota loga o objeto de erro inteiro (vazaria caminho/conteúdo)", async () => {
    const rotas = (await arquivosFonte(path.join(RAIZ, "app", "api"))).filter((a) =>
      a.endsWith("route.ts"),
    );
    const suspeitas: string[] = [];
    for (const rota of rotas) {
      const txt = await fs.readFile(rota, "utf8");
      // aceito: console.error("...", err instanceof Error ? err.name : ...)
      // recusado: console.error(err) / console.log(err) cru
      if (/console\.(error|log|warn)\([^)]*\berr\b\s*[,)]/.test(txt)) suspeitas.push(relativo(rota));
    }
    expect(suspeitas).toEqual([]);
  });
});
