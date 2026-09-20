import { describe, it, expect, afterEach, vi } from "vitest";
import { fetchFake, fetchOffline, capturarConsole } from "../acesso/apoioTestes";
import {
  MAX_COMENTARIO,
  MENSAGENS,
  buscarAvaliacoes,
  corpoDoEnvio,
  enviarAvaliacao,
  lerResumo,
  lerVitrine,
} from "./api";
import { IDENTIFICACOES, rotuloIdentificacao, textoConsentimento, ehIdentificacao } from "./identificacao";

/** `fetch` de mentira para o GET (que vai sem corpo, então o dublê do acesso não serve). */
function fetchGet(status: number, corpo: unknown, opts: { naoEhJson?: boolean } = {}) {
  const urls: string[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) => {
      urls.push(url);
      return {
        ok: status >= 200 && status < 300,
        status,
        json: async () => {
          if (opts.naoEhJson) throw new Error("não é json");
          return corpo;
        },
      } as unknown as Response;
    }),
  );
  return urls;
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("corpo do POST /api/avaliacao", () => {
  it("manda nota, identificação e comentário aparado", () => {
    expect(corpoDoEnvio({ estrelas: 5, comentario: "  gostei muito  ", identificacao: "nome" })).toEqual({
      estrelas: 5,
      identificacao: "nome",
      comentario: "gostei muito",
    });
  });

  it("comentário vazio ou só espaço é omitido — nunca vai como string vazia", () => {
    expect(corpoDoEnvio({ estrelas: 4, identificacao: "anonimo" })).toEqual({ estrelas: 4, identificacao: "anonimo" });
    expect(corpoDoEnvio({ estrelas: 4, comentario: "   \n ", identificacao: "anonimo" })).toEqual({
      estrelas: 4,
      identificacao: "anonimo",
    });
  });

  it("comentário gigante é cortado no limite do contrato (400)", () => {
    const corpo = corpoDoEnvio({ estrelas: 3, comentario: "a".repeat(900), identificacao: "nome_creci" });
    expect(String(corpo.comentario)).toHaveLength(MAX_COMENTARIO);
  });
});

describe("enviarAvaliacao — cada resposta do contrato vira um estado", () => {
  it("200 publicado devolve o resumo novo e o corpo sai como o contrato pede", async () => {
    const chamadas = fetchFake(200, { ok: true, status: "publicado", resumo: { media: 4.8, quantas: 9 } });
    const r = await enviarAvaliacao({ estrelas: 5, comentario: "muito bom", identificacao: "nome_creci" });
    expect(r).toEqual({ status: "publicado", resumo: { media: 4.8, quantas: 9 } });
    expect(chamadas[0]!.url).toBe("/api/avaliacao");
    expect(chamadas[0]!.body).toEqual({ estrelas: 5, identificacao: "nome_creci", comentario: "muito bom" });
  });

  it("200 pendente avisa que o texto ficou para conferência, e a nota entrou igual", async () => {
    fetchFake(200, { ok: true, status: "pendente", resumo: { media: 4.5, quantas: 10 } });
    const r = await enviarAvaliacao({ estrelas: 4, comentario: "olha meu site", identificacao: "anonimo" });
    expect(r).toEqual({ status: "pendente", resumo: { media: 4.5, quantas: 10 } });
  });

  it("200 sem resumo ainda é sucesso — a tela só omite os números", async () => {
    fetchFake(200, { ok: true, status: "publicado" });
    expect(await enviarAvaliacao({ estrelas: 5, identificacao: "nome" })).toEqual({
      status: "publicado",
      resumo: null,
    });
  });

  it("401 sem_acesso manda entrar de novo", async () => {
    fetchFake(401, { ok: false, erro: "sem_acesso" });
    const r = await enviarAvaliacao({ estrelas: 5, identificacao: "nome" });
    expect(r).toEqual({ status: "sem_acesso", mensagem: MENSAGENS.semAcesso });
  });

  it("409 sem_nome leva a tela a cair para anônimo", async () => {
    fetchFake(409, { ok: false, erro: "sem_nome" });
    const r = await enviarAvaliacao({ estrelas: 5, identificacao: "nome_creci" });
    expect(r.status).toBe("sem_nome");
    expect(r.status === "sem_nome" && r.mensagem).toMatch(/anônimo/i);
  });

  it("400 vira inválido com os campos da API", async () => {
    fetchFake(400, { ok: false, erro: "dados inválidos", campos: { estrelas: ["escolha de 1 a 5"] } });
    const r = await enviarAvaliacao({ estrelas: 9, identificacao: "nome" });
    expect(r.status).toBe("invalido");
    expect(r.status === "invalido" && r.campos?.estrelas).toEqual(["escolha de 1 a 5"]);
  });

  it("429 vira limitado com texto de espera", async () => {
    fetchFake(429, { ok: false, erro: "muitas solicitações" });
    expect((await enviarAvaliacao({ estrelas: 5, identificacao: "nome" })).status).toBe("limitado");
  });

  it("500, rede fora e resposta que não é JSON nunca somem em silêncio", async () => {
    fetchFake(500, { ok: false });
    expect((await enviarAvaliacao({ estrelas: 5, identificacao: "nome" })).status).toBe("erro");

    fetchFake(200, null, { naoEhJson: true });
    expect((await enviarAvaliacao({ estrelas: 5, identificacao: "nome" })).status).toBe("erro");

    fetchOffline();
    const r = await enviarAvaliacao({ estrelas: 5, identificacao: "nome" });
    expect(r).toEqual({ status: "erro", mensagem: MENSAGENS.rede });
  });

  it("nada do que a pessoa escreveu vai para o console, nem quando dá erro", async () => {
    const logs = capturarConsole();
    fetchFake(500, { ok: false });
    await enviarAvaliacao({ estrelas: 2, comentario: "meu nome é Fulano", identificacao: "nome_creci" });
    fetchOffline();
    await enviarAvaliacao({ estrelas: 2, comentario: "meu nome é Fulano", identificacao: "nome_creci" });
    expect(logs.join(" ")).not.toMatch(/Fulano/);
    expect(logs).toEqual([]);
  });
});

describe("GET /api/avaliacoes — leitura da vitrine", () => {
  it("lê média, contagem e comentários do corpo do contrato", async () => {
    const urls = fetchGet(200, {
      media: 4.7,
      quantas: 12,
      comentarios: [
        { id: "7", estrelas: 5, texto: "rápido de usar", nome: "Ana", creci: "PE 12345", em: "2026-09-19" },
        { id: "8", estrelas: 4, texto: "gostei do funil", em: "2026-09-18" },
      ],
    });
    const v = await buscarAvaliacoes();
    expect(urls[0]).toBe("/api/avaliacoes");
    expect(v?.media).toBe(4.7);
    expect(v?.quantas).toBe(12);
    expect(v?.comentarios).toHaveLength(2);
    expect(v?.comentarios[0]!.creci).toBe("PE 12345");
    expect(v?.comentarios[1]!.nome).toBeUndefined(); // anônima
  });

  it("descarta linha sem id, sem texto ou com nota impossível", () => {
    const v = lerVitrine({
      media: 5,
      quantas: 3,
      comentarios: [
        { id: "", estrelas: 5, texto: "sem id" },
        { id: "2", estrelas: 5, texto: "   " },
        { id: "3", estrelas: 9, texto: "nota fora da escala" },
        { id: "4", estrelas: 5, texto: "esta vale" },
        "lixo",
      ],
    });
    expect(v?.comentarios.map((c) => c.id)).toEqual(["4"]);
  });

  it("CRECI sem nome não vira assinatura: o campo é descartado", () => {
    const v = lerVitrine({ media: 5, quantas: 1, comentarios: [{ id: "9", estrelas: 5, texto: "boa", creci: "PE 1" }] });
    expect(v?.comentarios[0]).toMatchObject({ id: "9" });
    expect(v?.comentarios[0]!.creci).toBeUndefined();
  });

  it("corpo sem os números, 500, rede fora e não-JSON devolvem null (a landing segue com o arquivo)", async () => {
    expect(lerVitrine({ comentarios: [] })).toBeNull();
    expect(lerVitrine(null)).toBeNull();
    expect(lerResumo({ media: "4,7", quantas: 3 })).toBeNull();
    expect(lerResumo({ media: 4.7, quantas: 3 })).toEqual({ media: 4.7, quantas: 3 });

    fetchGet(500, { erro: "falhou" });
    expect(await buscarAvaliacoes()).toBeNull();

    fetchGet(200, null, { naoEhJson: true });
    expect(await buscarAvaliacoes()).toBeNull();

    fetchOffline();
    expect(await buscarAvaliacoes()).toBeNull();
  });

  it("a falha do GET não escreve nada no console", async () => {
    const logs = capturarConsole();
    fetchOffline();
    await buscarAvaliacoes();
    expect(logs).toEqual([]);
  });
});

describe("identificação e consentimento (F3 + LGPD)", () => {
  it("são exatamente as três escolhas do contrato", () => {
    expect(IDENTIFICACOES).toEqual(["nome_creci", "nome", "anonimo"]);
    expect(ehIdentificacao("nome")).toBe(true);
    expect(ehIdentificacao("qualquer")).toBe(false);
  });

  it("cada escolha tem rótulo e texto de consentimento próprios, sem repetição", () => {
    const textos = IDENTIFICACOES.map(textoConsentimento);
    expect(new Set(textos).size).toBe(3);
    expect(new Set(IDENTIFICACOES.map(rotuloIdentificacao)).size).toBe(3);
    for (const t of textos) expect(t.length).toBeGreaterThan(40);
  });

  it("o texto diz o que será publicado, e o anônimo NEGA a publicação do nome", () => {
    expect(textoConsentimento("nome_creci")).toMatch(/nome e meu CRECI/);
    expect(textoConsentimento("nome")).toMatch(/sem o CRECI/);
    expect(textoConsentimento("anonimo")).toMatch(/^Não autorizo/);
  });

  it("o nome do produto vem da marca, não cravado no texto", async () => {
    const { brand } = await import("@/config/brand");
    for (const escolha of IDENTIFICACOES) {
      expect(textoConsentimento(escolha)).toContain(brand.nomeCurto);
    }
  });
});
