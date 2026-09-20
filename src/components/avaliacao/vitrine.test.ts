import { describe, it, expect } from "vitest";
import { DEPOIMENTOS, mediaDasNotas } from "@/content/depoimentos";
import type { ComentarioPublicado, VitrineDaApi } from "./api";
import { ASSINATURA_ANONIMA, MAX_COMENTARIOS, assinaturaDoBanco, montarVitrine } from "./vitrine";

const doBanco = (id: string, extra: Partial<ComentarioPublicado> = {}): ComentarioPublicado => ({
  id,
  estrelas: 5,
  texto: `comentário ${id}`,
  em: "2026-09-19",
  ...extra,
});

const resposta = (parcial: Partial<VitrineDaApi> = {}): VitrineDaApi => ({
  media: 4.8,
  quantas: 20,
  comentarios: [],
  ...parcial,
});

describe("vitrine — arquivo + banco", () => {
  it("sem resposta da API, fica exatamente o que a página já mostrava", () => {
    const v = montarVitrine(null);
    expect(v.comBanco).toBe(false);
    expect(v.resumo).toEqual(mediaDasNotas(DEPOIMENTOS)); // 4,7 de 3 avaliações
    expect(v.cartoes).toHaveLength(DEPOIMENTOS.length);
    expect(v.cartoes[0]!.assinatura).toBe("Rodrigo, corretor em Recife");
    expect(v.cartoes[0]!.estrelas).toBe(5);
  });

  it("os três do arquivo vêm primeiro e os do banco entram depois (sem pulo de layout)", () => {
    const v = montarVitrine(resposta({ comentarios: [doBanco("7"), doBanco("8")] }));
    expect(v.comBanco).toBe(true);
    expect(v.cartoes).toHaveLength(DEPOIMENTOS.length + 2);
    expect(v.cartoes.slice(0, 3).every((c) => c.chave.startsWith("arquivo-"))).toBe(true);
    expect(v.cartoes.slice(3).map((c) => c.chave)).toEqual(["banco-7", "banco-8"]);
  });

  it("a média e a contagem são as do servidor — o arquivo NÃO é somado de novo", () => {
    // o contrato diz que `media`/`quantas` já somam arquivo + banco
    const v = montarVitrine(resposta({ media: 4.8, quantas: 20 }));
    expect(v.resumo).toEqual({ media: 4.8, quantas: 20 });
    expect(v.resumo!.quantas).not.toBe(20 + DEPOIMENTOS.length);
  });

  it("banco vazio (quantas 0) cai na média do arquivo, nunca em zero estrela", () => {
    const v = montarVitrine(resposta({ media: 0, quantas: 0 }));
    expect(v.resumo).toEqual(mediaDasNotas(DEPOIMENTOS));
  });

  it("no máximo 12 comentários do banco, mesmo se o servidor mandar mais", () => {
    const muitos = Array.from({ length: 30 }, (_, i) => doBanco(String(i)));
    const v = montarVitrine(resposta({ comentarios: muitos }));
    expect(v.cartoes.filter((c) => c.chave.startsWith("banco-"))).toHaveLength(MAX_COMENTARIOS);
  });

  it("as chaves não colidem entre arquivo e banco", () => {
    const v = montarVitrine(resposta({ comentarios: [doBanco(DEPOIMENTOS[0]!.id)] }));
    expect(new Set(v.cartoes.map((c) => c.chave)).size).toBe(v.cartoes.length);
  });
});

describe("assinatura — só o que a pessoa autorizou (F3)", () => {
  it("nome + CRECI, só nome, ou anônima", () => {
    expect(assinaturaDoBanco("Ana", "PE 12345")).toBe("Ana · CRECI PE 12345");
    expect(assinaturaDoBanco("Ana")).toBe("Ana");
    expect(assinaturaDoBanco()).toBe(ASSINATURA_ANONIMA);
    expect(assinaturaDoBanco(undefined, "PE 12345")).toBe(ASSINATURA_ANONIMA); // CRECI sem nome não assina
  });

  it("a anônima aparece sem inventar pessoa e sem prometer cliente", () => {
    const v = montarVitrine(resposta({ comentarios: [doBanco("1")] }));
    const anonima = v.cartoes.find((c) => c.chave === "banco-1")!;
    expect(anonima.assinatura).toBe(ASSINATURA_ANONIMA);
    expect(anonima.assinatura).toMatch(/testou a demonstração/);
  });
});
