/**
 * Guarda da decisão F5 (O11): o demo não espelha a tabela real do CRM Ultra.
 *
 * Quem tira print de `/ceo/planos` ou `/ceo/custos` não pode chegar na
 * negociação com "mas no seu sistema custa X", nem sair de `/ceo/custos`
 * sabendo quantas vezes a mensalidade cobre o custo.
 *
 * A tabela oficial vem do plano da onda (`waves/11-orcamentos/00-PLANO.md`), que
 * é o que a `src/features/orcamento/tabela.ts` implementa; quando essa tabela
 * existir no código, os números dela entram na conferência junto.
 *
 * Tela nova com preço no demo entra em `TELAS_DE_PRECO`. As outras telas do
 * demo mostram valor de negócio (fatura, VGV, avaliação de imóvel), que não é
 * lista de preço e por isso não é comparada aqui.
 */
import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "fs";
import path from "path";

const RAIZ = process.cwd();
const TELAS_DE_PRECO = ["src/app/ceo/planos/page.tsx", "src/app/ceo/custos/page.tsx"];
const PLANO_DA_ONDA = "waves/11-orcamentos/00-PLANO.md";
const TABELA_OFICIAL = "src/features/orcamento/tabela.ts";

const ler = (relativo: string) => readFileSync(path.join(RAIZ, relativo), "utf8");

/** `R$ 1.790`, `R$ 1,50`, `R$ 135 mil`, `R$ 1,6 mi`. Zero não conta (é valor genérico). */
function valoresEmReais(texto: string): number[] {
  const achados: number[] = [];
  for (const m of texto.matchAll(/R\$\s*(\d{1,3}(?:\.\d{3})+|\d+)(,\d+)?\s*(mil|mi)?/gi)) {
    const inteiro = m[1]!.replace(/\./g, "");
    const decimal = m[2] ? m[2].replace(",", ".") : "";
    const escala = m[3]?.toLowerCase() === "mil" ? 1000 : m[3]?.toLowerCase() === "mi" ? 1_000_000 : 1;
    const valor = parseFloat(`${inteiro}${decimal}`) * escala;
    if (valor > 0) achados.push(valor);
  }
  return achados;
}

/** Custo unitário da tabela editável de `/ceo/custos` (`vu: 1.9`), que vira "R$ 1,90" na tela. */
function custosUnitarios(texto: string): number[] {
  return [...texto.matchAll(/\bvu:\s*(\d+(?:\.\d+)?)/g)].map((m) => parseFloat(m[1]!)).filter((v) => v > 0);
}

/**
 * Números da tabela oficial. Do código (quando existir) entram só os que podem
 * ser preço: 50 para cima, ou com centavos. Mês, percentual e quantidade de
 * franquia ficam de fora, senão a guarda pegaria "12" e "25".
 */
function tabelaOficial(): number[] {
  const doPlano = valoresEmReais(ler(PLANO_DA_ONDA));
  if (!existsSync(path.join(RAIZ, TABELA_OFICIAL))) return doPlano;
  const doCodigo = [...ler(TABELA_OFICIAL).matchAll(/\b(\d+(?:\.\d+)?)\b/g)]
    .map((m) => parseFloat(m[1]!))
    .filter((v) => v >= 50 || !Number.isInteger(v));
  return [...doPlano, ...doCodigo];
}

describe("o demo não espelha a tabela real", () => {
  const oficiais = new Set(tabelaOficial());

  it("a tabela oficial foi lida de verdade (a guarda não passa por engano)", () => {
    expect(oficiais.size).toBeGreaterThan(15);
    expect(oficiais.has(179)).toBe(true);
    expect(oficiais.has(11900)).toBe(true);
  });

  it("nenhum valor das telas de preço do demo bate com a tabela oficial", () => {
    const colisoes: string[] = [];
    let conferidos = 0;
    for (const tela of TELAS_DE_PRECO) {
      const texto = ler(tela);
      const valores = [...valoresEmReais(texto), ...custosUnitarios(texto)];
      conferidos += valores.length;
      for (const valor of valores) {
        if (oficiais.has(valor)) colisoes.push(`${tela}: ${valor}`);
      }
    }
    expect(conferidos, "as telas do demo deveriam ter vários valores").toBeGreaterThan(20);
    expect(colisoes).toEqual([]);
  });

  it("nenhum plano do demo se chama Pro ou Ultra", () => {
    const nomes = [...ler("src/app/ceo/planos/page.tsx").matchAll(/name: '([^']+)'/g)].map((m) => m[1]!);
    expect(nomes.length).toBeGreaterThan(3);
    expect(nomes.filter((n) => /(^|\s)(Pro|Ultra)(\s|$)/.test(n))).toEqual([]);
  });

  it("a tela de custos não entrega múltiplo de custo sobre mensalidade", () => {
    const custos = ler("src/app/ceo/custos/page.tsx");
    expect(custos).not.toMatch(/cobre\s*\d+\s*[x×]/i);
    expect(custos).not.toMatch(/margem/i);
  });
});
