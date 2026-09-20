/**
 * O corpo que a folha A4 (trilha B) recebe: os apelidos dela em cima do
 * registro, sem renomear nada do que já existe e sem recalcular preço.
 *
 * Reais só na borda: o domínio continua em centavos, e a divisão por 100
 * acontece uma vez só, aqui.
 */
import { describe, it, expect } from "vitest";
import { calcularOrcamento } from "./calculo";
import { paraDocumento, emReais } from "./documento";
import { textosDoDia } from "./inclusos";
import type { OrcamentoAdmin } from "./admin";
import { FAIXAS, TABELA, type TabelaPrecos } from "./tabela";

/** Um orçamento como a API guarda, com os totais calculados de verdade. */
function orcamento(pedido = { publico: "imobiliaria" as const, assentos: { pro: 5, ultra: 3 } }, over: Partial<OrcamentoAdmin> = {}): OrcamentoAdmin {
  const r = calcularOrcamento(pedido);
  if (!r.ok) throw new Error(`pedido do teste recusado: ${r.erro}`);
  return {
    id: "orc-1",
    numero: "ORC-2026-001",
    leadId: "lead-1",
    cliente: { nome: "Imobiliária Exemplo", email: "contato@exemplo.com", telefone: "+5581900000001" },
    publico: pedido.publico,
    status: "enviado",
    itens: r.calculo.itens,
    totais: r.calculo.totais,
    condicoes: r.calculo.condicoes,
    validadeEm: "2026-10-05",
    criadoEm: "2026-09-20T12:00:00.000Z",
    atualizadoEm: "2026-09-20T12:00:00.000Z",
    ...over,
  };
}

describe("apelidos da folha, sem renomear o registro", () => {
  const doc = paraDocumento(orcamento());

  it("o registro continua inteiro no corpo", () => {
    expect(doc).toMatchObject({
      id: "orc-1",
      numero: "ORC-2026-001",
      status: "enviado",
      validadeEm: "2026-10-05",
      publico: "imobiliaria",
    });
    expect(doc.itens.length).toBeGreaterThan(0);
    expect(doc.totais.mensalCentavos).toBe(152_200);
  });

  it("e ganha os nomes que a folha espera", () => {
    expect(doc.situacao).toBe("enviado"); // o código, como no resto da API
    expect(doc.situacaoRotulo).toBe("Enviado"); // o texto, para imprimir
    expect(doc.validoAte).toBe("2026-10-05");
    expect(doc.publicoRotulo).toBe("Imobiliária");
    expect(doc.cliente).toEqual({
      nome: "Imobiliária Exemplo",
      email: "contato@exemplo.com",
      telefone: "+5581900000001",
    });
    expect(doc.anual).toBe(false);
    expect(doc.descontoPct).toBe(0);
    expect(doc.condicaoFundador).toBe(false);
    expect(doc.unidades).toBeUndefined();
  });

  it("assentos linha a linha, em reais, com a faixa da escada", () => {
    expect(doc.assentos).toEqual([
      { nivel: "Ultra", codigo: "ultra", faixa: "1º e 2º assento", quantidade: 2, precoUnitario: 299, total: 598 },
      { nivel: "Ultra", codigo: "ultra", faixa: "3º ao 9º assento", quantidade: 1, precoUnitario: 229, total: 229 },
      { nivel: "Pro", codigo: "pro", faixa: "3º ao 9º assento", quantidade: 5, precoUnitario: 139, total: 695 },
    ]);
    // 598 + 229 + 695 = 1.522,00, o mesmo mensal do registro
    expect(doc.totais.mensal).toBe(1_522);
    expect(doc.totais.mensal).toBe(emReais(doc.totais.mensalCentavos));
  });

  it("totais em reais, com a implantação e a economia do anual", () => {
    expect(doc.totais).toMatchObject({ mensal: 1_522, anual: 1_522 * 12, implantacao: 1_790 });
    expect(doc.totais.economiaAnual).toBeUndefined(); // só no plano anual
  });

  it("no anual: 10 meses no total do ano, implantação isenta e a economia declarada", () => {
    const r = calcularOrcamento({ publico: "imobiliaria", assentos: { pro: 5, ultra: 0 }, anual: true });
    if (!r.ok) throw new Error("cálculo do teste recusado");
    const doc = paraDocumento(orcamento({ publico: "imobiliaria", assentos: { pro: 5, ultra: 0 } }, { itens: r.calculo.itens, totais: r.calculo.totais, condicoes: r.calculo.condicoes }));
    expect(doc.anual).toBe(true);
    expect(doc.totais).toMatchObject({ mensal: 775, anual: 7_750, implantacao: 0, economiaAnual: 1_550 });
  });

  it("extras viram linhas com rótulo em português", () => {
    const r = calcularOrcamento({
      publico: "imobiliaria",
      assentos: { pro: 5, ultra: 0 },
      extras: [{ item: "whatsapp_adicional", quantidade: 2 }],
    });
    if (!r.ok) throw new Error("cálculo do teste recusado");
    const doc = paraDocumento(orcamento({ publico: "imobiliaria", assentos: { pro: 5, ultra: 0 } }, { itens: r.calculo.itens, totais: r.calculo.totais, condicoes: r.calculo.condicoes }));
    expect(doc.extras).toEqual([
      {
        rotulo: "Número de WhatsApp oficial adicional",
        quantidade: 2,
        precoUnitario: 149,
        total: 298,
        recorrencia: "mensal",
      },
    ]);
    // a implantação não é extra: tem destaque próprio na folha
    expect(doc.extras.some((e) => e.rotulo.includes("Migração de carteira"))).toBe(false);
  });

  it("centavo quebrado sobrevive à ida para reais", () => {
    expect(emReais(8_499)).toBe(84.99);
    expect(emReais(0)).toBe(0);
    expect(emReais(1_590_600)).toBe(15_906);
  });
});

describe("o que foi prometido fica escrito no dia", () => {
  it("inclusos só dos níveis contratados, e franquias de Radar só com Ultra", () => {
    const soPro = paraDocumento(orcamento({ publico: "imobiliaria", assentos: { pro: 5, ultra: 0 } }));
    expect(soPro.inclusos.pro?.length).toBeGreaterThan(2);
    expect(soPro.inclusos.ultra).toBeUndefined();
    expect(soPro.franquias.map((f) => f.rotulo)).toEqual(["Atendimentos de IA", "Reuniões transcritas"]);
    expect(soPro.franquias[0]).toEqual({
      rotulo: "Atendimentos de IA",
      incluso: "25 por assento/mês",
      excedente: "R$ 1,50 cada",
    });

    const comUltra = paraDocumento(orcamento());
    expect(comUltra.inclusos.pro).toBeTruthy();
    expect(comUltra.inclusos.ultra).toBeTruthy();
    expect(comUltra.franquias).toHaveLength(4);
    expect(comUltra.franquias[3]).toMatchObject({ incluso: "300 por conta/mês", excedente: "R$ 0,90 cada" });
  });

  it("o texto é o do dia: mudar a tabela depois não mexe no que já foi emitido", () => {
    const emitido = orcamento();
    const antes = paraDocumento(emitido).franquias;

    const franquiasOriginais = TABELA.franquias;
    try {
      TABELA.franquias = { ...TABELA.franquias, iaPorAssento: 50 };
      // um orçamento NOVO já sai com a franquia nova
      expect(textosDoDia({ pro: 1, ultra: 0 }).franquias[0]!.incluso).toBe("50 por assento/mês");
      // o emitido continua com o que prometeu
      expect(paraDocumento(emitido).franquias).toEqual(antes);
    } finally {
      TABELA.franquias = franquiasOriginais;
    }
  });

  it("registro antigo (sem os textos) não inventa promessa: listas vazias", () => {
    const antigo = orcamento();
    const semTextos = {
      ...antigo,
      condicoes: { ...antigo.condicoes, inclusos: undefined, franquias: undefined },
    };
    const doc = paraDocumento(semTextos);
    expect(doc.inclusos).toEqual({});
    expect(doc.franquias).toEqual([]);
  });

  it("extra que sumiu da tabela vira texto neutro, nunca preço inventado", () => {
    const tabelaSemExtras: TabelaPrecos = { ...TABELA, extras: [], faixas: FAIXAS };
    expect(textosDoDia({ pro: 1, ultra: 0 }, tabelaSemExtras).franquias[0]!.excedente).toBe("sob consulta");
  });
});
