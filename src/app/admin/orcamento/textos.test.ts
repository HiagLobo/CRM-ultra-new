/**
 * O texto que o cliente lê. Aqui mora a parte da revisão que reprovou a
 * primeira versão: cada assunto do papel precisa ter UMA resposta.
 *
 * Em especial: a implantação é paga em duas partes e não é diluída nem
 * devolvida; não existe multa de saída; o anexo só chama de "no ar hoje" o que
 * o cliente pagante usa; e nenhum texto promete resultado.
 */
import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "fs";
import path from "path";
import { assentos, dataBR, porcento, reais } from "./formato";
import { ANEXO_NO_AR, ANEXO_NOTAS, ANEXO_PROXIMAS, ANEXO_REVISADO_EM, CLAUSULA_MES_GRATIS } from "./anexo";
import { ORCAMENTO_EXEMPLO } from "./exemplo";
import {
  AVISO_PROPOSTA,
  CONDICOES_COMERCIAIS,
  ESCADA_EXPLICADA,
  FUNDADOR_EM_TROCA,
  FUNDADOR_RECEBE,
  IMPLANTACAO_EXPLICADA,
  IMPLANTACAO_ISENTA,
  linhaValidade,
  rotuloPublico,
  textoLgpd,
} from "./legais";

const TABELA_OFICIAL = path.join(process.cwd(), "src", "features", "orcamento", "tabela.ts");

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
    expect(porcento(50)).toBe("50%");
    expect(assentos(1)).toBe("1 assento");
    expect(assentos(12)).toBe("12 assentos");
  });
});

describe("implantação: serviço entregue, pago em duas partes", () => {
  it("diz as duas partes, traduz go live e avisa que não é devolvida", () => {
    expect(IMPLANTACAO_EXPLICADA).toMatch(/entrada na assinatura/i);
    expect(IMPLANTACAO_EXPLICADA).toMatch(/saldo na conclusão/i);
    expect(IMPLANTACAO_EXPLICADA).toMatch(/go live, quando o sistema entra em operação/i);
    expect(IMPLANTACAO_EXPLICADA).toMatch(/não é devolvido/i);
    expect(IMPLANTACAO_ISENTA).toMatch(/isenta/i);
  });

  it("nenhum texto do papel fala em amortizar ou em saldo não amortizado", () => {
    const tudo = [IMPLANTACAO_EXPLICADA, IMPLANTACAO_ISENTA, ...CONDICOES_COMERCIAIS, ...FUNDADOR_RECEBE, ...FUNDADOR_EM_TROCA].join(" ");
    expect(tudo).not.toMatch(/amortiz/i);
    expect(tudo).not.toMatch(/1\/12/);
  });
});

describe("condições comerciais e saída", () => {
  it("cobrem entrada, mensalidade, anual e saída", () => {
    const tudo = CONDICOES_COMERCIAIS.join(" ").toLowerCase();
    expect(tudo).toMatch(/entrada da implantação vence na assinatura/);
    expect(tudo).toMatch(/mensalidade começa no go live/);
    expect(tudo).toMatch(/12 meses pelo preço de 10/);
    expect(tudo).toMatch(/sem prazo mínimo de permanência/);
    expect(CONDICOES_COMERCIAIS.length).toBeGreaterThanOrEqual(5);
  });

  it("multa só aparece para dizer que não existe, e nenhum valor de multa é impresso", () => {
    const tudo = [...CONDICOES_COMERCIAIS, ...FUNDADOR_RECEBE, ...FUNDADOR_EM_TROCA].join(" ");
    for (const trecho of tudo.matchAll(/[^.]*multa[^.]*/gi)) {
      expect(trecho[0], "toda frase com multa precisa dizer que não há").toMatch(/não há multa|sem multa/i);
    }
    expect(tudo).not.toMatch(/multa de/i);
  });

  it("a condição de fundador diz o que o cliente ganha e o que fica combinado", () => {
    expect(FUNDADOR_RECEBE.join(" ")).toMatch(/congelado/i);
    expect(FUNDADOR_RECEBE.join(" ")).toMatch(/isenta/i);
    expect(FUNDADOR_EM_TROCA.join(" ")).toMatch(/12 meses/);
  });
});

describe("LGPD e rodapé", () => {
  it("nomeia controlador e operador sem quebrar quando o cliente é pessoa", () => {
    const texto = textoLgpd("João da Silva", "Operadora de Exemplo").join(" ");
    expect(texto).toContain("de João da Silva, na posição de controlador");
    expect(texto).toMatch(/é a operadora/);
    expect(texto).toMatch(/13\.709/);
  });

  it("exportar e apagar pela tela fica no futuro, com o caminho de hoje", () => {
    const texto = textoLgpd("Imobiliária de Exemplo", "Operadora de Exemplo").join(" ");
    expect(texto).toMatch(/entra junto com o painel do cliente, na data do anexo/i);
    expect(texto).toMatch(/até lá, o pedido é feito por e-mail/i);
  });

  it("a exclusão diz produção em 30 dias e cópias de segurança em 35", () => {
    const texto = textoLgpd("Cliente de Exemplo", "Operadora de Exemplo").join(" ");
    expect(texto).toMatch(/ambientes de produção em até 30 dias/i);
    expect(texto).toMatch(/cópias de segurança expiram no ciclo normal de retenção, em até 35 dias/i);
  });

  it("o rodapé fixa preço, prazo e anexo, e não anula a cláusula do anexo", () => {
    expect(AVISO_PROPOSTA).toMatch(/proposta comercial e não é o contrato/i);
    expect(AVISO_PROPOSTA).toMatch(/fixa o preço, o prazo e o anexo/i);
    expect(AVISO_PROPOSTA).not.toMatch(/obrigação de resultado/i);
  });

  it("validade e público saem em português de gente", () => {
    expect(linhaValidade("05/10/2026")).toBe("Proposta válida até 05/10/2026.");
    expect(rotuloPublico("rede")).toBe("Rede de imobiliárias");
    expect(rotuloPublico(undefined)).toBe("");
    expect(rotuloPublico("outro")).toBe("outro");
  });
});

describe("anexo datado", () => {
  it("em 'no ar hoje' só entra o que o cliente pagante usa", () => {
    const noAr = ANEXO_NO_AR.join(" ").toLowerCase();
    expect(ANEXO_NO_AR.length).toBeLessThanOrEqual(3);
    expect(noAr).toMatch(/demonstração/);
    // o painel de leads, a landing e a moderação são do fornecedor, não do cliente
    expect(noAr).not.toMatch(/painel de leads|funil|exportação|avaliações|site público|moderação/);
  });

  it("o que saiu do 'hoje' virou entrega com mês marcado", () => {
    const futuro = ANEXO_PROXIMAS.flatMap((e) => e.itens).join(" ").toLowerCase();
    expect(futuro).toMatch(/funil por etapa/);
    expect(futuro).toMatch(/exportação da carteira/);
    expect(futuro).toMatch(/site público da imobiliária/);
    expect(futuro).toMatch(/publicação direta e filtro automático/);
  });

  it("todo bloco futuro tem mês e ano, e nenhum item fica solto", () => {
    expect(ANEXO_PROXIMAS.length).toBeGreaterThan(1);
    for (const entrega of ANEXO_PROXIMAS) {
      expect(entrega.mes).toMatch(/de 20\d\d$/);
      expect(entrega.itens.length).toBeGreaterThan(0);
    }
  });

  it("item atrasado vale um mês sem cobrança, e o entregue passa a ter franquia", () => {
    const clausula = CLAUSULA_MES_GRATIS.join(" ").toLowerCase();
    expect(clausula).toContain("sem cobrança");
    expect(clausula).toMatch(/enquanto um item não é entregue, ele não é cobrado/);
    expect(clausula).toMatch(/valem a franquia de uso e o preço do excedente/);
    expect(clausula).not.toMatch(/já está no preço/);
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

  /** Texto meu, texto da tabela (quando existir) e o que o exemplo imprime. */
  function tudoQueSaiNoPapel(): string {
    const doExemplo = [
      ...Object.values(ORCAMENTO_EXEMPLO.inclusos).flat(),
      ...ORCAMENTO_EXEMPLO.franquias.flatMap((f) => [f.rotulo, f.incluso, f.excedente ?? ""]),
      ...ORCAMENTO_EXEMPLO.extras.map((e) => e.rotulo),
      ORCAMENTO_EXEMPLO.observacao ?? "",
    ];
    const daTabela = existsSync(TABELA_OFICIAL) ? [readFileSync(TABELA_OFICIAL, "utf8")] : [];
    return [
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
      IMPLANTACAO_ISENTA,
      ...doExemplo,
      ...daTabela,
    ].join(" ");
  }

  it("nenhuma promessa de resultado e nenhum nível chamado de completo", () => {
    const texto = tudoQueSaiNoPapel();
    const achadas = PROIBIDAS.filter((palavra) => new RegExp(`\\b${palavra}`, "i").test(texto));
    expect(achadas).toEqual([]);
  });

  it("a varredura olha também o que vem da tabela e do exemplo", () => {
    expect(tudoQueSaiNoPapel()).toContain(ORCAMENTO_EXEMPLO.franquias[0]!.rotulo);
    expect(existsSync(TABELA_OFICIAL) ? tudoQueSaiNoPapel().length : 5000).toBeGreaterThan(4000);
  });
});
