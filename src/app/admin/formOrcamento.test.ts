/**
 * O formulário do orçamento: o corpo que vai para a API, a prévia ao vivo
 * (mesma função do servidor), a leitura de cada resposta e o "duplicar".
 * Nenhum preço escrito à mão: tudo sai do cálculo do domínio.
 */
import { describe, it, expect } from "vitest";
import { calcularOrcamento, NovoOrcamentoSchema, type OrcamentoAdmin } from "@/features/orcamento";
import {
  campoDaPrevia,
  campoDoCaminho,
  corpoDoForm,
  extrasDoForm,
  formDoOrcamento,
  FORM_ORCAMENTO_VAZIO,
  lerRespostaOrcamento,
  mensagemDaRecusa,
  previaDoForm,
  validarOrcamento,
  type FormOrcamento,
} from "./formOrcamento";

const form = (over: Partial<FormOrcamento> = {}): FormOrcamento => ({ ...FORM_ORCAMENTO_VAZIO, ...over });

describe("o corpo do POST", () => {
  it("números saem como número, e o que está vazio não vai", () => {
    const corpo = corpoDoForm(form({ pro: "5", ultra: "3", descontoPct: "12,5", observacao: "  " }), "lead-1");
    expect(corpo).toEqual({
      leadId: "lead-1",
      publico: "imobiliaria",
      assentos: { pro: 5, ultra: 3 },
      descontoPct: 12.5, // vírgula do teclado brasileiro vira ponto
      anual: false,
      implantacaoIsenta: false,
      condicaoFundador: false,
      entradaPct: 50, // metade da implantação na assinatura
      validadeDias: 15,
    });
    // o schema do servidor aceita o corpo que a tela monta
    expect(NovoOrcamentoSchema.safeParse(corpo).success).toBe(true);
  });

  it("unidades só vão na rede, e os extras só com quantidade", () => {
    const rede = corpoDoForm(form({ publico: "rede", pro: "30", unidades: "4" }), "lead-1");
    expect(rede).toMatchObject({ publico: "rede", unidades: 4 });

    const comExtras = form({ extras: { whatsapp_adicional: "2", migracao_lote: "0", radar_avulso: "" } });
    expect(extrasDoForm(comExtras)).toEqual([{ item: "whatsapp_adicional", quantidade: 2 }]);
    expect(corpoDoForm(comExtras, "lead-1")).toMatchObject({ extras: [{ item: "whatsapp_adicional", quantidade: 2 }] });
    expect(corpoDoForm(form(), "lead-1")).not.toHaveProperty("extras");
    expect(corpoDoForm(form(), "lead-1")).not.toHaveProperty("unidades");
  });

  it("o que não é número vira erro de campo, e não 0 calado", () => {
    const r = validarOrcamento(form({ pro: "cinco" }), "lead-1");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.erros.assentosPro).toBeTruthy();
  });

  it("o erro do Ultra vai para o campo do Ultra (antes caía no do Pro)", () => {
    const r = validarOrcamento(form({ pro: "3", ultra: "2,5" }), "lead-1");
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.erros.assentosUltra).toBeTruthy();
      expect(r.erros.assentosPro).toBeUndefined();
    }
    expect(campoDoCaminho(["assentos", "ultra"])).toBe("assentosUltra");
    expect(campoDoCaminho(["assentos", "pro"])).toBe("assentosPro");
    expect(campoDoCaminho(["assentos"])).toBe("assentos"); // o 400 do servidor achata o caminho
    expect(campoDoCaminho(["entradaPct"])).toBe("entradaPct");
    expect(campoDoCaminho(["coisa_nova"])).toBeNull();
  });

  it("a entrada da implantação vai no corpo e é conferida antes de enviar", () => {
    expect(corpoDoForm(form({ entradaPct: "30" }), "lead-1")).toMatchObject({ entradaPct: 30 });
    for (const entradaPct of ["5", "120", "33,5"]) {
      const r = validarOrcamento(form({ entradaPct }), "lead-1");
      expect(r.ok, entradaPct).toBe(false);
      if (!r.ok) expect(r.erros.entradaPct, entradaPct).toBeTruthy();
    }
  });

  it("rede sem unidades e desconto fora da faixa não passam da tela", () => {
    const semUnidades = validarOrcamento(form({ publico: "rede", pro: "30" }), "lead-1");
    expect(semUnidades.ok).toBe(false);
    if (!semUnidades.ok) expect(semUnidades.erros.unidades).toBeTruthy();

    const desconto = validarOrcamento(form({ descontoPct: "120" }), "lead-1");
    expect(desconto.ok).toBe(false);
    if (!desconto.ok) expect(desconto.erros.descontoPct).toBeTruthy();
  });

  it("formulário válido devolve o pedido já normalizado pelo Zod", () => {
    const r = validarOrcamento(form({ pro: "5" }), "lead-1");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.valor).toMatchObject({ leadId: "lead-1", assentos: { pro: 5, ultra: 0 } });
  });
});

describe("prévia ao vivo: a mesma conta do servidor", () => {
  it("o total da tela é o total que o servidor calcularia", () => {
    const f = form({ pro: "5", ultra: "3" });
    const previa = previaDoForm(f);
    const servidor = calcularOrcamento({ publico: "imobiliaria", assentos: { pro: 5, ultra: 3 } });
    expect(previa.ok && servidor.ok).toBe(true);
    if (previa.ok && servidor.ok) {
      expect(previa.calculo.totais).toEqual(servidor.calculo.totais);
      expect(previa.calculo.totais.mensalCentavos).toBe(152_200); // R$ 1.522,00
    }
  });

  it("campo pela metade não quebra a prévia: conta como 0", () => {
    expect(previaDoForm(form({ pro: "", ultra: "" }))).toEqual({ ok: false, erro: "sem_assentos" });
    expect(previaDoForm(form({ pro: "abc" }))).toEqual({ ok: false, erro: "sem_assentos" });
  });

  it("quantidade de extra que o Zod recusaria já barra na prévia, apontando o campo", () => {
    for (const quantidade of ["1,5", "-2", "200000"]) {
      const r = previaDoForm(form({ extras: { whatsapp_adicional: quantidade } }));
      expect(r, quantidade).toEqual({ ok: false, erro: "quantidade_invalida", campo: "extras" });
      expect(campoDaPrevia(r)).toBe("extras");
      expect(mensagemDaRecusa(r)).toContain("inteiro");
    }
    // vazio não é erro: é extra não contratado
    expect(previaDoForm(form({ extras: { whatsapp_adicional: "" } })).ok).toBe(true);
  });

  it("rede sem unidades recusa, em vez de fingir que é 1 unidade", () => {
    const semUnidades = previaDoForm(form({ publico: "rede", pro: "30" }));
    expect(semUnidades).toEqual({ ok: false, erro: "unidades_faltando", campo: "unidades" });
    expect(campoDaPrevia(semUnidades)).toBe("unidades");
    expect(mensagemDaRecusa(semUnidades)).toContain("unidades");
    // com as unidades preenchidas, o mínimo faturável volta a valer (5 por unidade)
    expect(previaDoForm(form({ publico: "rede", pro: "30", unidades: "4" })).ok).toBe(true);
    expect(previaDoForm(form({ publico: "rede", pro: "10", unidades: "4" }))).toMatchObject({
      erro: "assentos_abaixo_do_minimo",
      minimo: 20,
    });
  });

  it("a prévia já recusa o desconto abaixo do piso, antes de tentar salvar", () => {
    const r = previaDoForm(form({ pro: "10", descontoPct: "41,38" }));
    expect(r).toEqual({ ok: false, erro: "abaixo_do_piso", nivel: "pro", piso: 8_500, efetivo: 8_499 });
  });

  it("o aviso de desconto alto acende a partir de 15%", () => {
    const abaixo = previaDoForm(form({ pro: "5", descontoPct: "14" }));
    const acima = previaDoForm(form({ pro: "5", descontoPct: "15" }));
    expect(abaixo.ok && abaixo.calculo.condicoes.descontoAlto).toBe(false);
    expect(acima.ok && acima.calculo.condicoes.descontoAlto).toBe(true);
  });
});

describe("o que cada resposta vira na tela", () => {
  const orcamento = { id: "orc-1", numero: "ORC-2026-001" } as unknown as OrcamentoAdmin;

  it("201 devolve o orçamento salvo", () => {
    const r = lerRespostaOrcamento({ status: 201, corpo: { ok: true, orcamento } });
    expect(r).toEqual({ status: "ok", orcamento });
  });

  it("409 abaixo do piso explica o piso e o preço efetivo, sem jargão", () => {
    const r = lerRespostaOrcamento({
      status: 409,
      corpo: { ok: false, erro: "abaixo_do_piso", nivel: "pro", piso: 8_500, efetivo: 8_499 },
    });
    expect(r.status).toBe("recusado");
    if (r.status === "recusado") {
      expect(r.mensagem).toContain("piso do Pro");
      expect(r.mensagem).toContain("R$ 84,99"); // o que ficaria por assento
      expect(r.mensagem).toContain("R$ 85,00"); // o mínimo
      expect(r.mensagem).not.toContain("—");
    }
  });

  it("409 de mínimo, de sem assento e desconhecido também viram frase", () => {
    expect(mensagemDaRecusa({ erro: "assentos_abaixo_do_minimo", minimo: 3, assentos: 2 })).toBe(
      "O mínimo faturável desse público é 3 assentos (você lançou 2).",
    );
    expect(mensagemDaRecusa({ erro: "sem_assentos" })).toContain("pelo menos um assento");
    expect(mensagemDaRecusa({ erro: "coisa_nova" })).toContain("não fecham com a tabela");
  });

  it("400 volta para os campos; 404, 500 e sem conexão viram aviso", () => {
    const invalido = lerRespostaOrcamento({ status: 400, corpo: { erro: "dados_invalidos", campos: { assentos: ["quantos assentos Pro?"] } } });
    expect(invalido).toEqual({ status: "invalido", erros: { assentos: "quantos assentos Pro?" } });

    for (const status of [404, 500, 0]) {
      const r = lerRespostaOrcamento({ status, corpo: null });
      expect(r.status, String(status)).toBe("erro");
      if (r.status === "erro") expect(r.erro.length).toBeGreaterThan(10);
    }
  });
});

describe("duplicar", () => {
  it("o formulário volta com as condições da proposta que já existe", () => {
    const calculado = calcularOrcamento({
      publico: "rede",
      assentos: { pro: 30, ultra: 5 },
      unidades: 6,
      descontoPct: 10,
      extras: [{ item: "suporte_sincrono", quantidade: 2 }],
    });
    expect(calculado.ok).toBe(true);
    if (!calculado.ok) return;

    const salvo = {
      publico: "rede",
      itens: calculado.calculo.itens,
      condicoes: calculado.calculo.condicoes,
      observacao: "combinado por WhatsApp",
    } as unknown as OrcamentoAdmin;

    expect(formDoOrcamento(salvo)).toEqual({
      publico: "rede",
      pro: "30",
      ultra: "5",
      unidades: "6",
      descontoPct: "10",
      anual: false,
      implantacaoIsenta: false,
      condicaoFundador: false,
      entradaPct: "50",
      validadeDias: "15",
      observacao: "combinado por WhatsApp",
      extras: { suporte_sincrono: "2" },
    });
  });

  it("isenção que veio do anual não volta marcada à mão (senão dobraria a regra)", () => {
    const anual = calcularOrcamento({ publico: "imobiliaria", assentos: { pro: 5, ultra: 0 }, anual: true });
    if (!anual.ok) throw new Error("cálculo do teste recusado");
    const salvo = { publico: "imobiliaria", itens: anual.calculo.itens, condicoes: anual.calculo.condicoes } as unknown as OrcamentoAdmin;
    const f = formDoOrcamento(salvo);
    expect(f.anual).toBe(true);
    expect(f.implantacaoIsenta).toBe(false);
    expect(f.observacao).toBe("");
  });
});
