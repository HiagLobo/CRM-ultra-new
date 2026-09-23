/**
 * A seção de diferenciais da landing. O que este teste protege, em ordem de
 * importância:
 *
 * 1. **O site não promete mais que o papel.** Cada diferencial aponta um mês do
 *    anexo da proposta, e o teste confere que aquele mês existe lá. Se alguém
 *    escrever um diferencial novo sem entrega contratada, quebra aqui, e não
 *    numa conversa com o cliente que assinou.
 * 2. Nada de promessa de resultado nem de marca de terceiro na tela.
 * 3. Os ícones existem de verdade: `Icon.tsx` troca nome errado por uma
 *    interrogação sem avisar ninguém.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it, expect } from "vitest";
import {
  DIFERENCIAIS,
  EYEBROW_DIFERENCIAIS,
  TITULO_DIFERENCIAIS,
  SUB_DIFERENCIAIS,
} from "./diferenciais";
import { ANEXO_PROXIMAS, ANEXO_NO_AR } from "@/app/admin/orcamento/anexo";

const RAIZ = process.cwd();
const naTela = [
  EYEBROW_DIFERENCIAIS,
  TITULO_DIFERENCIAIS,
  SUB_DIFERENCIAIS,
  ...DIFERENCIAIS.flatMap((d) => [d.titulo, d.texto]),
];

describe("os seis diferenciais, na ordem que o fundador definiu", () => {
  it("são seis, com id estável e sem repetição", () => {
    expect(DIFERENCIAIS.map((d) => d.id)).toEqual([
      "triagem",
      "anuncios",
      "conversa",
      "funil",
      "pagamentos",
      "celular",
    ]);
    expect(new Set(DIFERENCIAIS.map((d) => d.titulo)).size).toBe(6);
  });

  it("cada cartão cabe na tela do celular", () => {
    for (const d of DIFERENCIAIS) {
      expect(d.titulo.length, d.id).toBeLessThanOrEqual(46);
      expect(d.texto.length, d.id).toBeGreaterThan(80);
      expect(d.texto.length, d.id).toBeLessThanOrEqual(260);
    }
  });
});

describe("o site não promete mais que o anexo da proposta", () => {
  const meses = ANEXO_PROXIMAS.map((e) => e.mes);

  it("cada diferencial aponta um mês que existe no anexo", () => {
    for (const d of DIFERENCIAIS) {
      expect(meses, `${d.id} sem entrega contratada`).toContain(d.entregaContratada);
    }
  });

  it("nenhum diferencial se apoia no que ainda é só demonstração", () => {
    const noAr = ANEXO_NO_AR.join(" ").toLowerCase();
    expect(noAr).toContain("demonstração");
    // se um dia um diferencial for entregue, ele sai do mês e vira "no ar hoje":
    // o campo continua obrigatório, então o teste acima acusa a falta
    for (const d of DIFERENCIAIS) expect(d.entregaContratada).not.toBe("");
  });
});

describe("o que a seção nunca pode dizer", () => {
  const texto = naTela.join(" ").toLowerCase();

  it("nenhuma promessa de resultado", () => {
    const proibidas = [
      "garantimos",
      "garantido",
      "aumenta",
      "dobra",
      "triplica",
      "mais vendas",
      "mais negócios",
      "lucro",
      "roi",
      "nunca mais",
      "o melhor",
      "revolucion",
    ];
    expect(proibidas.filter((p) => new RegExp(`\\b${p}`, "i").test(texto))).toEqual([]);
  });

  it("nenhuma marca de terceiro", () => {
    const marcas = ["zap", "vivareal", "viva real", "olx", "jetimob", "kenlo", "vista soft", "imoview"];
    expect(marcas.filter((m) => texto.includes(m))).toEqual([]);
  });

  it("nenhum travessão, que o fundador não usa em texto de cliente", () => {
    expect(naTela.filter((t) => t.includes("—"))).toEqual([]);
  });

  it("o cartão do celular fala em navegador, não em loja de aplicativo", () => {
    const celular = DIFERENCIAIS.find((d) => d.id === "celular");
    expect(celular?.texto.toLowerCase()).toContain("navegador");
    expect(celular?.texto.toLowerCase()).toMatch(/sem instalar|não tem aplicativo/);
  });
});

describe("os ícones existem no mapa do Icon.tsx", () => {
  it("nenhum cai na interrogação silenciosa", () => {
    const fonte = readFileSync(path.join(RAIZ, "src/components/Icon.tsx"), "utf8");
    const mapa = fonte.slice(fonte.indexOf("const MAP"), fonte.indexOf("export function Icon"));
    for (const d of DIFERENCIAIS) {
      const chave = new RegExp(`(^|[\\s{,])"?${d.icone}"?:`, "m");
      expect(chave.test(mapa), `ícone ${d.icone} (${d.id}) não está no MAP`).toBe(true);
    }
  });
});
