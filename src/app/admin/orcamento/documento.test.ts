/**
 * O que o documento não pode perder: número, data, validade, CNPJ, totais,
 * anexo datado, LGPD e o aviso de que proposta não é contrato. Some daqui, o
 * fundador manda uma proposta furada para um cliente.
 *
 * Como o painel não tem navegador em teste (vitest roda em Node), os textos são
 * conferidos no módulo puro e a montagem é conferida na fonte da folha, do
 * mesmo jeito que `painelSemPii.test.ts` e `regressao.test.ts` fazem.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import path from "path";
import { assentos, dataBR, porcento, reais } from "./formato";
import { ORCAMENTO_EXEMPLO } from "./exemplo";
import { orcamentoSchema } from "./tiposOrcamento";
import { ANEXO_NO_AR, ANEXO_NOTAS, ANEXO_PROXIMAS, ANEXO_REVISADO_EM, CLAUSULA_MES_GRATIS } from "./anexo";
import {
  AVISO_PROPOSTA,
  CONDICOES_COMERCIAIS,
  ESCADA_EXPLICADA,
  FUNDADOR_EM_TROCA,
  FUNDADOR_RECEBE,
  IMPLANTACAO_EXPLICADA,
  linhaValidade,
  rotuloPublico,
  textoLgpd,
} from "./legais";

const PASTA = path.join(process.cwd(), "src", "app", "admin", "orcamento");
const fonte = (arquivo: string) => readFileSync(path.join(PASTA, arquivo), "utf8");
const folha = fonte("FolhaOrcamento.tsx");
const condicoes = fonte("CondicoesOrcamento.tsx");
const pagina = fonte(path.join("[id]", "page.tsx"));
const css = readFileSync(path.join(process.cwd(), "src", "app", "globals.css"), "utf8");

describe("formatos do papel", () => {
  it("dinheiro sempre com centavos e separador brasileiro", () => {
    expect(reais(179)).toBe("R$ 179,00");
    expect(reais(11900)).toBe("R$ 11.900,00");
    expect(reais(0.9)).toBe("R$ 0,90");
    expect(reais(Number.NaN)).toBe("");
  });

  it("data com ou sem hora vira dd/mm/aaaa", () => {
    expect(dataBR("2026-10-05")).toBe("05/10/2026");
    expect(dataBR("2026-09-20T12:00:00.000Z")).toBe("20/09/2026");
  });

  it("porcentagem e plural de assento", () => {
    expect(porcento(16.67)).toBe("16,67%");
    expect(porcento(15)).toBe("15%");
    expect(assentos(1)).toBe("1 assento");
    expect(assentos(12)).toBe("12 assentos");
  });
});

describe("texto comercial e jurídico", () => {
  it("a escada cabe em uma linha e explica que a faixa é do assento", () => {
    expect(ESCADA_EXPLICADA).toMatch(/faixa/i);
    expect(ESCADA_EXPLICADA.includes("\n")).toBe(false);
    expect(ESCADA_EXPLICADA.length).toBeLessThan(160);
  });

  it("implantação diz quando é cobrada e como é amortizada", () => {
    expect(IMPLANTACAO_EXPLICADA).toMatch(/go live/i);
    expect(IMPLANTACAO_EXPLICADA).toMatch(/amortizada/i);
  });

  it("condições cobrem pagamento, anual e saída", () => {
    const tudo = CONDICOES_COMERCIAIS.join(" ").toLowerCase();
    expect(tudo).toMatch(/pagamento/);
    expect(tudo).toMatch(/anual/);
    expect(tudo).toMatch(/saída/);
    expect(CONDICOES_COMERCIAIS.length).toBeGreaterThanOrEqual(4);
  });

  it("condição de fundador diz o que o cliente ganha e o que fica combinado em troca", () => {
    expect(FUNDADOR_RECEBE.join(" ")).toMatch(/congelado/i);
    expect(FUNDADOR_EM_TROCA.join(" ")).toMatch(/12 meses/);
  });

  it("LGPD nomeia controlador e operador e promete a carteira exportável", () => {
    const texto = textoLgpd("Imobiliária de Exemplo", "Operadora de Exemplo").join(" ");
    expect(texto).toMatch(/controladora/i);
    expect(texto).toMatch(/operadora/i);
    expect(texto).toMatch(/export/i);
    expect(texto).toMatch(/13\.709/);
    expect(texto).toContain("Imobiliária de Exemplo");
  });

  it("o rodapé avisa que é proposta comercial e não contrato", () => {
    expect(AVISO_PROPOSTA.toLowerCase()).toContain("proposta comercial");
    expect(AVISO_PROPOSTA.toLowerCase()).toContain("não é contrato");
  });

  it("validade e público saem em português de gente", () => {
    expect(linhaValidade("05/10/2026")).toBe("Proposta válida até 05/10/2026.");
    expect(rotuloPublico("rede")).toBe("Rede de imobiliárias");
    expect(rotuloPublico(undefined)).toBe("");
    expect(rotuloPublico("outro")).toBe("outro");
  });
});

describe("anexo datado", () => {
  it("diz o que está no ar hoje e o que entra em qual mês", () => {
    expect(ANEXO_NO_AR.length).toBeGreaterThan(2);
    expect(ANEXO_PROXIMAS.length).toBeGreaterThan(1);
    for (const entrega of ANEXO_PROXIMAS) {
      expect(entrega.mes, "todo bloco do anexo tem mês e ano").toMatch(/de 20\d\d$/);
      expect(entrega.itens.length).toBeGreaterThan(0);
    }
  });

  it("item atrasado vale um mês de mensalidade sem cobrança", () => {
    const clausula = CLAUSULA_MES_GRATIS.join(" ").toLowerCase();
    expect(clausula).toContain("sem cobrança");
    expect(clausula).toMatch(/atrasad|passar do mês/);
  });

  it("a lista é datada e avisa que a demonstração não é operação", () => {
    expect(ANEXO_REVISADO_EM).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(ANEXO_NOTAS.join(" ").toLowerCase()).toContain("demonstração");
  });
});

describe("o que a proposta nunca pode dizer", () => {
  const PROIBIDAS = [
    "completo",
    "completa",
    "garantimos",
    "garantido",
    "aumenta",
    "dobra",
    "triplica",
    "mais vendas",
    "mais negócios",
    "lucro",
    "roi",
  ];

  it("nenhuma promessa de resultado e nenhum nível chamado de completo", () => {
    const textos = [
      ...ANEXO_NO_AR,
      ...ANEXO_NOTAS,
      ...CLAUSULA_MES_GRATIS,
      ...ANEXO_PROXIMAS.flatMap((e) => [e.mes, ...e.itens]),
      ...CONDICOES_COMERCIAIS,
      ...FUNDADOR_RECEBE,
      ...FUNDADOR_EM_TROCA,
      ...textoLgpd("Cliente de Exemplo", "Operadora de Exemplo"),
      AVISO_PROPOSTA,
      ESCADA_EXPLICADA,
      IMPLANTACAO_EXPLICADA,
      folha,
      condicoes,
    ].join(" ");

    const achadas = PROIBIDAS.filter((palavra) => new RegExp(`\\b${palavra}`, "i").test(textos));
    expect(achadas).toEqual([]);
  });
});

describe("a folha monta os blocos obrigatórios", () => {
  it("marca, número, datas e validade no topo", () => {
    for (const pedaco of ["brand.empresa.razaoSocial", "brand.empresa.cnpj", "orcamento.numero", "criadoEm", "validoAte"]) {
      expect(folha, `falta ${pedaco} na folha`).toContain(pedaco);
    }
  });

  it("cliente, assentos com a escada, implantação em destaque, extras e totais", () => {
    for (const pedaco of [
      "cliente.nome",
      "ESCADA_EXPLICADA",
      "IMPLANTACAO_TITULO",
      "totais.implantacao",
      "orcamento.extras",
      "totais.mensal",
      "totais.anual",
      "economiaAnual",
    ]) {
      expect(folha, `falta ${pedaco} na folha`).toContain(pedaco);
    }
  });

  it("incluso, franquias, anexo, condições, LGPD e rodapé", () => {
    for (const pedaco of [
      "inclusosDoNivel",
      "franquiasDoOrcamento",
      "TITULO_ANEXO",
      "CLAUSULA_MES_GRATIS",
      "CONDICOES_COMERCIAIS",
      "TITULO_LGPD",
      "AVISO_PROPOSTA",
      "brand.contato.email",
    ]) {
      expect(condicoes, `falta ${pedaco} no fim do documento`).toContain(pedaco);
    }
  });

  it("nenhum preço escrito na tela: tudo passa pelo formatador", () => {
    expect(/R\$\s*\d/.test(folha)).toBe(false);
    expect(/R\$\s*\d/.test(condicoes)).toBe(false);
  });

  it("a página exige sessão de admin antes de renderizar", () => {
    expect(pagina).toContain("sessaoAdminValida");
    expect(pagina).toContain("/admin/login");
  });
});

describe("orçamento de exemplo (conferir a folha sem API)", () => {
  it("cabe no contrato da API e se declara inventado", () => {
    const lido = orcamentoSchema.safeParse(ORCAMENTO_EXEMPLO);
    expect(lido.success).toBe(true);
    expect(ORCAMENTO_EXEMPLO.numero).toContain("EXEMPLO");
    expect(ORCAMENTO_EXEMPLO.cliente.email).toContain(".example");
  });

  it("só abre fora de produção", () => {
    const tela = fonte("DocumentoOrcamento.tsx");
    expect(tela).toContain('process.env.NODE_ENV !== "production"');
  });
});

describe("impressão em A4", () => {
  it("o bloco de impressão está no globals.css, em A4 com 15 mm", () => {
    const bloco = css.slice(css.indexOf("@media print"));
    expect(bloco).toContain("@page { size: A4; margin: 15mm; }");
    expect(bloco).toContain(".orc-naoimprime { display: none !important; }");
    expect(css).toContain(".orc-bloco { break-inside: avoid; page-break-inside: avoid; }");
  });
});
