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

  it("assentos linha a linha, em reais E em texto pronto", () => {
    expect(doc.assentos).toEqual([
      { nivel: "Ultra", codigo: "ultra", faixa: "1º e 2º assento", quantidade: 2, precoUnitario: 299, total: 598, precoUnitarioTexto: "R$ 299,00", totalTexto: "R$ 598,00" },
      { nivel: "Ultra", codigo: "ultra", faixa: "3º ao 9º assento", quantidade: 1, precoUnitario: 229, total: 229, precoUnitarioTexto: "R$ 229,00", totalTexto: "R$ 229,00" },
      { nivel: "Pro", codigo: "pro", faixa: "3º ao 9º assento", quantidade: 5, precoUnitario: 139, total: 695, precoUnitarioTexto: "R$ 139,00", totalTexto: "R$ 695,00" },
    ]);
    // 598 + 229 + 695 = 1.522,00, o mesmo mensal do registro
    expect(doc.totais.mensal).toBe(1_522);
    expect(doc.totais.mensal).toBe(emReais(doc.totais.mensalCentavos));
  });

  it("totais em reais, com a implantação e a economia do anual", () => {
    expect(doc.totais).toMatchObject({
      mensal: 1_522,
      anual: 1_522 * 12,
      implantacao: 1_790,
      mensalTexto: "R$ 1.522,00",
      anualTexto: "R$ 18.264,00",
      implantacaoTexto: "R$ 1.790,00",
    });
    expect(doc.totais.economiaAnual).toBeUndefined(); // só no plano anual
    expect(doc.totais.economiaAnualTexto).toBeUndefined();
  });

  it("quem imprime usa o texto: somar reais no navegador traz o ponto flutuante de volta", () => {
    // 1,50 + 4,90 + 17,40 em ponto flutuante dá 23,799999999999997
    const r = calcularOrcamento({
      publico: "imobiliaria",
      assentos: { pro: 5, ultra: 0 },
      extras: [
        { item: "ia_excedente", quantidade: 1 }, // R$ 1,50
        { item: "reuniao_excedente", quantidade: 1 }, // R$ 4,90
        { item: "radar_avulso", quantidade: 6 }, // R$ 17,40
      ],
    });
    if (!r.ok) throw new Error("cálculo do teste recusado");
    const comExtras = paraDocumento(orcamento({ publico: "imobiliaria", assentos: { pro: 5, ultra: 0 } }, { itens: r.calculo.itens, totais: r.calculo.totais, condicoes: r.calculo.condicoes }));

    const somados = comExtras.extras.reduce((t, e) => t + e.total, 0);
    expect(somados).not.toBe(23.8); // o número solto erra
    expect(comExtras.totais.extrasMensaisCentavos).toBe(2_380); // o centavo inteiro acerta
    for (const extra of comExtras.extras) expect(extra.totalTexto).toMatch(/^R\$ \d/);
  });

  it("as linhas fecham com o mensal: assentos menos desconto mais extras mensais", () => {
    const r = calcularOrcamento({
      publico: "imobiliaria",
      assentos: { pro: 5, ultra: 3 },
      descontoPct: 10,
      extras: [
        { item: "whatsapp_adicional", quantidade: 2 }, // mensal
        { item: "migracao_lote", quantidade: 1 }, // cobrança única, fora do mensal
      ],
    });
    if (!r.ok) throw new Error("cálculo do teste recusado");
    const d = paraDocumento(orcamento({ publico: "imobiliaria", assentos: { pro: 5, ultra: 3 } }, { itens: r.calculo.itens, totais: r.calculo.totais, condicoes: r.calculo.condicoes }));

    // a conferência da folha, em centavos inteiros: bate exatamente, sem tolerância
    const somaAssentos = d.assentos.reduce((t, a) => t + a.total * 100, 0);
    const somaMensais = d.extras.filter((e) => e.recorrencia === "mensal").reduce((t, e) => t + e.total * 100, 0);
    expect(Math.round(somaAssentos - d.totais.descontoCentavos + somaMensais)).toBe(d.totais.mensalCentavos);
    // o que é cobrança única fica de fora do mensal
    expect(d.totais.extrasUnicos).toBe(1_290);
    expect(d.totais.desconto).toBe(152.2); // 10% de R$ 1.522,00
    expect(d.totais.descontoTexto).toBe("R$ 152,20");
  });

  it("isenção fica no VALOR guardado, não só no texto", () => {
    for (const bandeira of [{ anual: true }, { condicaoFundador: true }, { implantacaoIsenta: true }]) {
      const r = calcularOrcamento({ publico: "imobiliaria", assentos: { pro: 5, ultra: 0 }, ...bandeira });
      if (!r.ok) throw new Error("cálculo do teste recusado");
      const d = paraDocumento(orcamento({ publico: "imobiliaria", assentos: { pro: 5, ultra: 0 } }, { itens: r.calculo.itens, totais: r.calculo.totais, condicoes: r.calculo.condicoes }));
      expect(d.implantacao, JSON.stringify(bandeira)).toMatchObject({ total: 0, entrada: 0, saldo: 0 });
      expect(d.totais.implantacao).toBe(0);
      expect(d.totais.implantacaoCheiaCentavos).toBe(179_000); // o que foi abatido continua à vista
    }
  });

  it("a implantação vai em três partes: total, entrada na assinatura e saldo na conclusão", () => {
    expect(doc.implantacao).toEqual({
      totalCentavos: 179_000,
      entradaCentavos: 89_500,
      saldoCentavos: 89_500,
      entradaPct: 50,
      total: 1_790,
      entrada: 895,
      saldo: 895,
      totalTexto: "R$ 1.790,00",
      entradaTexto: "R$ 895,00",
      saldoTexto: "R$ 895,00",
    });
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
        precoUnitarioTexto: "R$ 149,00",
        totalTexto: "R$ 298,00",
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

    // a tabela nova é uma CÓPIA: o singleton é readonly e nunca é remendado
    const dobrada: TabelaPrecos = { ...TABELA, franquias: { ...TABELA.franquias, iaPorAssento: 50 } };
    // um orçamento NOVO já sai com a franquia nova
    expect(textosDoDia({ pro: 1, ultra: 0 }, dobrada).franquias[0]!.incluso).toBe("50 por assento/mês");
    // o emitido continua com o que prometeu
    expect(paraDocumento(emitido).franquias).toEqual(antes);
    expect(antes[0]!.incluso).toBe("25 por assento/mês");
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
