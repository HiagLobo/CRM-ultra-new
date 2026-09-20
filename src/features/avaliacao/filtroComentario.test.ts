/**
 * O filtro automático é a única rede de proteção do "publica direto" (F2):
 * cada regra tem o seu teste, os disfarces que a revisão encontrou têm o deles,
 * e o texto normal tem de passar — filtro que segura tudo vira aprovação
 * manual, que é o que o fundador não quis.
 *
 * As palavras de baixo calão NÃO são escritas aqui: o teste importa a lista do
 * arquivo que existe só para guardá-las.
 */
import { describe, it, expect } from "vitest";
import { filtrarComentario, ROTULO_MOTIVO, type MotivoPendente } from "./filtroComentario";
import { BAIXO_CALAO } from "./baixoCalao";
import { COMENTARIO_MAX } from "./avaliacao";

const segurou = (texto: string, motivo: MotivoPendente) =>
  expect(filtrarComentario(texto), texto).toEqual({ status: "pendente", motivo });

const passou = (texto: string) => expect(filtrarComentario(texto), texto).toEqual({ status: "publicado" });

/** Um termo longo da lista, sem escrever nenhum deles aqui. */
const PALAVRAO = BAIXO_CALAO.find((p) => p.length >= 5)!;

describe("filtro do comentário — o que segura", () => {
  it("link: http, www e domínio solto", () => {
    segurou("Muito bom, veja em http://exemplo.test/promo", "link");
    segurou("Conheça www.exemplo.test e compare", "link");
    segurou("Melhor que o sistema da concorrente.com.br", "link");
  });

  it("qualquer terminação, e não uma lista de conhecidas (era por onde o golpe passava)", () => {
    for (const dominio of ["golpe.online", "golpe.shop", "golpe.store", "golpe.info", "golpe.club", "golpe.vip", "golpe.tk", "golpe.ru"]) {
      segurou(`vale a pena ver ${dominio} antes`, "link");
    }
  });

  it("ponto disfarçado: espaçado, escrito, entre parênteses, entre colchetes e em outro alfabeto", () => {
    for (const disfarce of ["golpe . com", "golpe(ponto)com", "golpe[.]com", "golpe ponto com", "golpe。com", "golpe．com"]) {
      segurou(`vale a pena ver ${disfarce} antes`, "link");
    }
  });

  it("e-mail (antes de virar 'link': o motivo mais específico ganha), inclusive espaçado", () => {
    segurou("Me chama em contato@exemplo.com que eu explico", "email");
    segurou("me chama em eu @ golpe . com", "email");
  });

  it("telefone, com ou sem máscara e com caractere invisível no meio", () => {
    segurou("Fala comigo: (81) 90000-0001", "telefone");
    segurou("Meu zap 81900000001", "telefone");
    segurou("Meu zap 819​0000​0001", "telefone");
  });

  it("palavrão espaçado, cortado, com dígito no lugar da letra, no plural e em outro alfabeto", () => {
    const grafias = [
      PALAVRAO,
      PALAVRAO.toUpperCase(),
      `${PALAVRAO}s`,
      PALAVRAO.split("").join(" "),
      PALAVRAO.split("").join("-"),
      PALAVRAO.replace(/e/g, "3").replace(/o/g, "0").replace(/a/g, "4"),
      `${PALAVRAO[0]}​${PALAVRAO.slice(1)}`,
      PALAVRAO.replace(/a/g, "а").replace(/o/g, "о").replace(/e/g, "е"), // letras cirílicas
    ];
    for (const grafia of grafias) segurou(`o sistema e bom, mas o preco e uma ${grafia}`, "baixo_calao");
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

  it("ponto final, reticências e data não viram link nem telefone", () => {
    passou("Muito bom. Recomendo para quem trabalha sozinho.");
    passou("Ainda estou testando... mas gostei do que vi.");
    passou("Uso desde 17/09/2026 e só tenho a elogiar o sistema.");
  });

  it("a palavra 'ponto' no meio da frase continua sendo a palavra 'ponto'", () => {
    passou("Chegou no ponto certo da minha rotina.");
    passou("O ponto forte é o funil.");
  });

  it("palavra inteira: 'curso', 'custo' e 'cuidado' não são palavrão", () => {
    passou("Fiz o curso, entendi o custo e tive todo o cuidado com os dados.");
  });

  it("comentário no limite de tamanho passa — acima disso quem recusa é o Zod, com 400", () => {
    passou("a".repeat(COMENTARIO_MAX));
  });

  it("todo motivo tem rótulo em português para o painel", () => {
    for (const rotulo of Object.values(ROTULO_MOTIVO)) expect(rotulo.length).toBeGreaterThan(3);
    expect(Object.keys(ROTULO_MOTIVO)).toHaveLength(6);
  });
});
