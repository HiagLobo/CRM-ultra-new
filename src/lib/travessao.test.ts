/**
 * Guarda do travessão (2026-09-19, pedido do fundador): "—" não aparece em
 * texto que o cliente lê. No lugar dele: vírgula, dois-pontos, parênteses ou
 * duas frases.
 *
 * Vigia as pastas de tela (`src/app`, `src/components`, `src/content`), fora
 * dos testes. Comentários de código e mensagens de log podem ter travessão:
 * ninguém os vê no site, então eles são removidos antes da conferência.
 *
 * O travessão sozinho como "campo vazio" (`{valor || "—"}`, `<span>—</span>`)
 * continua valendo: é marca de vazio, não pontuação de frase.
 */
import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync } from "fs";
import path from "path";

const RAIZ = process.cwd();
const PASTAS = ["src/app", "src/components", "src/content"];
const EXTENSOES = [".ts", ".tsx"];

function arquivos(dir: string): string[] {
  const achados: string[] = [];
  for (const nome of readdirSync(dir)) {
    const caminho = path.join(dir, nome);
    if (statSync(caminho).isDirectory()) {
      achados.push(...arquivos(caminho));
      continue;
    }
    if (!EXTENSOES.includes(path.extname(nome))) continue;
    if (/\.test\.tsx?$/.test(nome)) continue; // nome de teste sai só no terminal
    achados.push(caminho);
  }
  return achados;
}

/** Tira comentário de bloco (inclusive `{/* … *\/}` do JSX) e de linha. */
function semComentarios(codigo: string): string {
  const semBloco = codigo.replace(/\/\*[\s\S]*?\*\//g, " ");
  return semBloco
    .split("\n")
    .map((linha) => {
      const corte = linha.indexOf("//");
      if (corte < 0) return linha;
      const antes = linha.slice(0, corte);
      // `https://` e `//` dentro de texto entre aspas não são comentário
      const aspas = (antes.match(/["'`]/g) ?? []).length;
      if (antes.endsWith(":") || aspas % 2 === 1) return linha;
      return antes;
    })
    .join("\n");
}

/** O travessão sozinho marca campo vazio; o que a regra pega é o de frase. */
function ehMarcaDeVazio(linha: string, posicao: number): boolean {
  const antes = linha.slice(Math.max(0, posicao - 2), posicao);
  const depois = linha.slice(posicao + 1, posicao + 3);
  return /["'>]\s*$/.test(antes) && /^\s*["'<]/.test(depois);
}

describe("travessão fora do texto que o cliente lê", () => {
  const encontrados: string[] = [];
  for (const pasta of PASTAS) {
    for (const arquivo of arquivos(path.join(RAIZ, pasta))) {
      const linhas = semComentarios(readFileSync(arquivo, "utf8")).split("\n");
      linhas.forEach((linha, i) => {
        let posicao = linha.indexOf("—");
        while (posicao >= 0) {
          if (!ehMarcaDeVazio(linha, posicao)) {
            encontrados.push(`${path.relative(RAIZ, arquivo).replace(/\\/g, "/")}:${i + 1}: ${linha.trim().slice(0, 120)}`);
            break;
          }
          posicao = linha.indexOf("—", posicao + 1);
        }
      });
    }
  }

  it("nenhuma tela usa travessão como pontuação", () => {
    expect(encontrados).toEqual([]);
  });

  it("a varredura está olhando arquivo de verdade (a guarda não passa por engano)", () => {
    const total = PASTAS.reduce((soma, pasta) => soma + arquivos(path.join(RAIZ, pasta)).length, 0);
    expect(total).toBeGreaterThan(50);
  });
});
