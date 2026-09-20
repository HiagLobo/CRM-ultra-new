/**
 * O filtro automático é a única rede de proteção do "publica direto" (F2):
 * cada regra tem o seu teste, e o texto normal tem de passar — filtro que
 * segura tudo vira aprovação manual, que é o que o fundador não quis.
 *
 * As palavras de baixo calão NÃO são escritas aqui: o teste importa a lista do
 * arquivo que existe só para guardá-las.
 */
import { describe, it, expect } from "vitest";
import { filtrarComentario, ROTULO_MOTIVO, type MotivoPendente } from "./filtroComentario";
import { BAIXO_CALAO } from "./baixoCalao";
import { COMENTARIO_MAX } from "./avaliacao";

const segurou = (texto: string, motivo: MotivoPendente) =>
  expect(filtrarComentario(texto)).toEqual({ status: "pendente", motivo });

const passou = (texto: string) => expect(filtrarComentario(texto)).toEqual({ status: "publicado" });

describe("filtro do comentário — o que segura", () => {
  it("link: http, www e domínio solto", () => {
    segurou("Muito bom, veja em http://exemplo.test/promo", "link");
    segurou("Conheça www.exemplo.test e compare", "link");
    segurou("Melhor que o sistema da concorrente.com.br", "link");
  });

  it("e-mail (antes de virar 'link': o motivo mais específico ganha)", () => {
    segurou("Me chama em contato@exemplo.com que eu explico", "email");
  });

  it("telefone, com ou sem máscara — e a data do dia continua passando", () => {
    segurou("Fala comigo: (81) 90000-0001", "telefone");
    segurou("Meu zap 81900000001", "telefone");
    passou("Uso desde 17/09/2026 e só tenho a elogiar o sistema.");
  });

  it("palavrão da lista (em qualquer caixa e com acento)", () => {
    const palavra = BAIXO_CALAO[0]!;
    segurou(`Sistema bom, mas o preço é uma ${palavra} de caro`, "baixo_calao");
    segurou(`Sistema bom, mas o preço é uma ${palavra.toUpperCase()} de caro`, "baixo_calao");
    // palavra inteira: "cu" não pega "curso", "custo", "cuidado"
    passou("Fiz o curso, entendi o custo e tive todo o cuidado com os dados.");
  });

  it("texto gigante (acima do limite do comentário)", () => {
    segurou("a".repeat(COMENTARIO_MAX + 1), "tamanho");
    passou("a".repeat(COMENTARIO_MAX));
  });

  it("três linhas em branco seguidas", () => {
    segurou("Muito bom\n\n\n\nvale a pena", "linhas_vazias");
    passou("Muito bom\n\nvale a pena");
  });

  it("CAPS em mais de 70% do texto — mas 'ÓTIMO!' curto é animação, não grito", () => {
    segurou("ATENDIMENTO EXCELENTE, RECOMENDO MUITO", "caps");
    passou("ÓTIMO!");
    passou("Recomendo MUITO, virou meu dia a dia de trabalho.");
  });
});

describe("filtro do comentário — o que publica direto", () => {
  it("elogio comum, crítica comum e comentário vazio (só a nota)", () => {
    passou("Organizou meu dia: parei de perder retorno de cliente.");
    passou("Gostei, mas senti falta de integração com o portal que eu uso.");
    passou("");
    expect(filtrarComentario(undefined)).toEqual({ status: "publicado" });
    expect(filtrarComentario("   ")).toEqual({ status: "publicado" });
  });

  it("todo motivo tem rótulo em português para o painel", () => {
    for (const rotulo of Object.values(ROTULO_MOTIVO)) expect(rotulo.length).toBeGreaterThan(3);
    expect(Object.keys(ROTULO_MOTIVO)).toHaveLength(7);
  });
});
