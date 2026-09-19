import { describe, it, expect } from "vitest";
import {
  acaoDaTecla,
  decidirEspera,
  marcaComoVisto,
  passoVizinho,
  ESPERA_ESTAVEL_MS,
  ESPERA_MAXIMA_MS,
} from "./regrasDoTour";

describe("marcaComoVisto", () => {
  it("concluir e pular marcam; fechar por falta de alvo não", () => {
    expect(marcaComoVisto("concluiu")).toBe(true);
    expect(marcaComoVisto("pulou")).toBe(true);
    expect(marcaComoVisto("sem-alvo")).toBe(false);
  });

  it("chamada sem motivo (quem ainda não passa o motivo) continua marcando", () => {
    expect(marcaComoVisto(undefined)).toBe(true);
  });
});

describe("decidirEspera — o tour espera a tela carregar", () => {
  const espera = (presentes: number, total: number, decorridoMs: number, estavelHaMs = 0) =>
    decidirEspera({ presentes, total, decorridoMs, estavelHaMs });

  it("Atendimento aos 450 ms: esqueleto na tela, nenhum alvo ainda — espera em vez de desistir", () => {
    expect(espera(0, 6, 0)).toBe("esperar");
    expect(espera(0, 6, 350, 350)).toBe("esperar");
  });

  it("todos os alvos apareceram: abre na hora", () => {
    expect(espera(6, 6, 400)).toBe("abrir");
  });

  it("parte dos alvos (celular, menu escondido): abre quando a tela para de mudar", () => {
    expect(espera(1, 6, 500, ESPERA_ESTAVEL_MS - 1)).toBe("esperar");
    expect(espera(1, 6, 1000, ESPERA_ESTAVEL_MS)).toBe("abrir");
  });

  it("Radar: a lista chega depois das abas — não abre antes de assentar", () => {
    // abas presentes desde o início, lista ainda carregando: a contagem acabou de mudar
    expect(espera(2, 3, 300, 0)).toBe("esperar");
    expect(espera(3, 3, 400, 0)).toBe("abrir");
  });

  it("no teto: abre com o que houver, ou desiste se não houver nada", () => {
    expect(espera(2, 6, ESPERA_MAXIMA_MS, 0)).toBe("abrir");
    expect(espera(0, 6, ESPERA_MAXIMA_MS, ESPERA_MAXIMA_MS)).toBe("desistir");
    expect(espera(0, 6, ESPERA_MAXIMA_MS - 1, ESPERA_MAXIMA_MS - 1)).toBe("esperar");
  });

  it("tour sem passos nunca abre", () => {
    expect(espera(0, 0, 0)).toBe("esperar");
    expect(espera(0, 0, ESPERA_MAXIMA_MS)).toBe("desistir");
  });
});

describe("passoVizinho — a fila é refeita a cada passo", () => {
  it("avança para o próximo disponível, pulando os que sumiram", () => {
    expect(passoVizinho([0, 3, 7], 0, 1)).toBe(3);
    expect(passoVizinho([0, 3, 7], 3, 1)).toBe(7);
  });

  it("fim da fila: null (o tour conclui)", () => {
    expect(passoVizinho([0, 3, 7], 7, 1)).toBeNull();
  });

  it("volta para o anterior disponível; no primeiro, não há para onde voltar", () => {
    expect(passoVizinho([0, 3, 7], 7, -1)).toBe(3);
    expect(passoVizinho([0, 3, 7], 0, -1)).toBeNull();
  });

  it("o passo atual sumiu da tela: ainda acha o vizinho certo", () => {
    // estava no 3, que saiu da lista (a gaveta fechou)
    expect(passoVizinho([0, 7], 3, 1)).toBe(7);
    expect(passoVizinho([0, 7], 3, -1)).toBe(0);
  });

  it("a gaveta abriu no meio do tour: os passos de dentro dela entram na fila", () => {
    // celular: 0 = botão do menu, 7 = botão Guia; com a gaveta aberta, 1..6 aparecem
    expect(passoVizinho([0, 7], 0, 1)).toBe(7);
    expect(passoVizinho([0, 1, 2, 3, 4, 5, 6, 7], 0, 1)).toBe(1);
  });
});

describe("acaoDaTecla — o tour não sequestra quem digita", () => {
  const foco = (tag: string, extra: { editavel?: boolean; modificador?: boolean } = {}) => ({
    tag,
    editavel: extra.editavel ?? false,
    modificador: extra.modificador ?? false,
  });

  it("com o foco na página: Enter e → avançam, ← volta, Esc sai", () => {
    expect(acaoDaTecla("Enter", foco("BODY"))).toBe("avancar");
    expect(acaoDaTecla("ArrowRight", foco("BODY"))).toBe("avancar");
    expect(acaoDaTecla("ArrowLeft", foco("DIV"))).toBe("voltar");
    expect(acaoDaTecla("Escape", foco("BODY"))).toBe("sair");
  });

  it("digitando no campo de mensagem ou numa área de texto: ignora Enter e setas", () => {
    for (const tag of ["INPUT", "TEXTAREA", "SELECT"]) {
      expect(acaoDaTecla("Enter", foco(tag)), tag).toBeNull();
      expect(acaoDaTecla("ArrowLeft", foco(tag)), tag).toBeNull();
      expect(acaoDaTecla("ArrowRight", foco(tag)), tag).toBeNull();
    }
  });

  it("texto editável (contenteditable) também é digitação", () => {
    expect(acaoDaTecla("Enter", foco("DIV", { editavel: true }))).toBeNull();
  });

  it("Enter num botão (ex.: Pular) só aciona o botão — não avança junto", () => {
    expect(acaoDaTecla("Enter", foco("BUTTON"))).toBeNull();
    expect(acaoDaTecla("Enter", foco("A"))).toBeNull();
    expect(acaoDaTecla("Enter", foco("button"))).toBeNull(); // tag em minúsculas (SVG/XHTML)
  });

  it("com foco num botão do próprio balão, as setas navegam e o Enter fica com o botão", () => {
    const noBalao = { tag: "BUTTON", editavel: false, modificador: false, noBalao: true };
    expect(acaoDaTecla("ArrowRight", noBalao)).toBe("avancar");
    expect(acaoDaTecla("ArrowLeft", noBalao)).toBe("voltar");
    expect(acaoDaTecla("Enter", noBalao)).toBeNull();
    expect(acaoDaTecla("Escape", noBalao)).toBe("sair");
  });

  it("com modificador (Alt+← é o voltar do navegador): ignora", () => {
    expect(acaoDaTecla("ArrowLeft", foco("BODY", { modificador: true }))).toBeNull();
    expect(acaoDaTecla("Enter", foco("BODY", { modificador: true }))).toBeNull();
  });

  it("Esc fecha o tour mesmo com o foco num campo", () => {
    expect(acaoDaTecla("Escape", foco("INPUT"))).toBe("sair");
  });

  it("outras teclas não fazem nada", () => {
    expect(acaoDaTecla("a", foco("BODY"))).toBeNull();
    expect(acaoDaTecla(" ", foco("BODY"))).toBeNull();
  });
});
