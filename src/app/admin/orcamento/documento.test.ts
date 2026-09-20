/**
 * A montagem do documento: os blocos que o papel não pode perder, o que ele
 * nunca deve imprimir e as regras de impressão em A4.
 *
 * Como o painel não tem navegador em teste (vitest roda em Node), a montagem é
 * conferida na fonte da folha, do mesmo jeito que `painelSemPii.test.ts` e
 * `regressao.test.ts` fazem. O texto em si está em `textos.test.ts`.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import path from "path";
import { ORCAMENTO_EXEMPLO } from "./exemplo";
import { orcamentoSchema } from "./tiposOrcamento";

const PASTA = path.join(process.cwd(), "src", "app", "admin", "orcamento");
const fonte = (arquivo: string) => readFileSync(path.join(PASTA, arquivo), "utf8");
const folha = fonte("FolhaOrcamento.tsx");
const condicoes = fonte("CondicoesOrcamento.tsx");
const tela = fonte("DocumentoOrcamento.tsx");
const pagina = fonte(path.join("[id]", "page.tsx"));
const css = readFileSync(path.join(process.cwd(), "src", "app", "globals.css"), "utf8");

describe("a folha monta os blocos obrigatórios", () => {
  it("marca, número, datas e validade no topo", () => {
    for (const pedaco of ["brand.empresa.razaoSocial", "brand.empresa.cnpj", "orcamento.numero", "criadoEm", "validoAte"]) {
      expect(folha, `falta ${pedaco} na folha`).toContain(pedaco);
    }
  });

  it("cliente, assentos com a escada e extras", () => {
    for (const pedaco of ["cliente.nome", "publicoRotulo", "ESCADA_EXPLICADA", "item.faixa", "orcamento.extras"]) {
      expect(folha, `falta ${pedaco} na folha`).toContain(pedaco);
    }
  });

  it("implantação com total, entrada e saldo, e o texto de isenta quando não há", () => {
    for (const pedaco of [
      "IMPLANTACAO_TITULO",
      "implantacao.total",
      "implantacao.entrada",
      "implantacao.saldo",
      "implantacao.entradaPct",
      "IMPLANTACAO_ISENTA",
      "IMPLANTACAO_EXPLICADA",
    ]) {
      expect(folha, `falta ${pedaco} na folha`).toContain(pedaco);
    }
  });

  it("totais deixam claro o que é mensalidade e o que é o primeiro ano", () => {
    expect(folha).toContain("Total de 12 meses de mensalidade");
    expect(folha).toContain("Primeiro ano, com a implantação");
    expect(folha).toContain("totais.anual + implantacao");
    expect(folha).toContain("economiaAnual");
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

  it("incluso e franquias vêm do orçamento, sem texto genérico de enchimento", () => {
    expect(condicoes).not.toMatch(/seguem a tabela vigente/i);
    expect(condicoes).not.toMatch(/acompanha esta proposta/i);
  });

  it("o anexo pode virar a página, mas cada pedaço dele fica inteiro", () => {
    expect(condicoes).toContain("quebravel");
    expect(condicoes.match(/className="orc-bloco"/g)?.length ?? 0).toBeGreaterThanOrEqual(3);
  });

  it("nenhum preço escrito na tela: tudo passa pelo formatador", () => {
    expect(/R\$\s*\d/.test(folha)).toBe(false);
    expect(/R\$\s*\d/.test(condicoes)).toBe(false);
  });
});

describe("o que a tela não deixa acontecer", () => {
  it("a página exige sessão de admin antes de renderizar", () => {
    expect(pagina).toContain("sessaoAdminValida");
    expect(pagina).toContain("/admin/login");
  });

  it("sem documento completo não existe botão de PDF", () => {
    expect(tela).toContain('{busca?.estado === "ok" && (');
    expect(tela).not.toContain("disabled={busca");
  });

  it("falha e orçamento apagado têm texto próprio, e dá para tentar de novo", () => {
    expect(tela).toContain("nao_encontrado");
    expect(tela).toContain("Tentar de novo");
    expect(tela).toContain('role="alert"');
  });
});

describe("orçamento de exemplo (conferir a folha sem API)", () => {
  it("cabe no contrato da API e se declara inventado", () => {
    const lido = orcamentoSchema.safeParse(ORCAMENTO_EXEMPLO);
    expect(lido.success).toBe(true);
    expect(ORCAMENTO_EXEMPLO.numero).toContain("EXEMPLO");
    expect(ORCAMENTO_EXEMPLO.cliente.email).toContain(".example");
  });

  it("traz a implantação em duas partes, para a folha ter o que mostrar", () => {
    const implantacao = ORCAMENTO_EXEMPLO.implantacao;
    expect(implantacao?.entrada).toBeGreaterThan(0);
    expect((implantacao?.entrada ?? 0) + (implantacao?.saldo ?? 0)).toBe(implantacao?.total);
  });

  it("só abre fora de produção", () => {
    expect(tela).toContain('process.env.NODE_ENV !== "production"');
  });
});

describe("impressão em A4", () => {
  const bloco = css.slice(css.indexOf("@media print"));

  it("A4 com 15 mm, sem barra e sem botão no papel", () => {
    expect(bloco).toContain("@page { size: A4; margin: 15mm; }");
    expect(bloco).toContain(".orc-naoimprime { display: none !important; }");
    expect(css).toContain(".orc-bloco { break-inside: avoid; page-break-inside: avoid; }");
  });

  it("o cabeçalho da tabela repete e a tabela inteira não vira bloco indivisível", () => {
    expect(bloco).toContain(".orc-folha thead { display: table-header-group; }");
    expect(bloco).toContain(".orc-folha tr { break-inside: avoid; page-break-inside: avoid; }");
    expect(bloco).not.toMatch(/\.orc-folha table[,\s]/);
  });

  it("cor exata e fundo branco só valem na folha (o resto do site imprime normal)", () => {
    expect(bloco).not.toMatch(/^\s*\*\s*\{/m);
    expect(bloco).toContain(".orc-folha * { -webkit-print-color-adjust: exact !important");
    expect(bloco).toContain("body:has(.orc-folha)");
  });
});
