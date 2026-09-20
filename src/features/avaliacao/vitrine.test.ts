/**
 * A vitrine é a única superfície PÚBLICA das avaliações: o que sai daqui vai
 * para a landing, sem cookie e sem senha. Por isso os testes são de vazamento —
 * nome de quem pediu anonimato, texto segurado ou tirado do ar, e-mail de
 * qualquer um. Nada disso pode aparecer, nem no JSON cru.
 */
import { describe, it, expect, afterEach } from "vitest";
import { avaliar } from "./avaliar";
import { moderar } from "./admin";
import { vitrine } from "./vitrine";
import { bancoTemporario, entradaAvaliacao, leadVerificado, resumoComArquivo } from "./apoioTestes";
import type { DepsAvaliar } from "./avaliar";

const banco = bancoTemporario("vitrine");
afterEach(() => banco.limpar());

const T = new Date("2026-09-19T15:00:00.000Z");

/** N leads fictícios prontos para avaliar (`corretor<i>@exemplo.com`). */
async function comLeads(deps: DepsAvaliar, n: number) {
  for (let i = 0; i < n; i++) {
    await deps.leads.criar(
      leadVerificado({
        id: `lead-${i}`,
        nome: `Corretor ${String.fromCharCode(65 + i)} Exemplo`,
        email: `corretor${i}@exemplo.com`,
        creci: `PE 1234${i}`,
      }),
    );
  }
}

const ctx = (i: number) => ({ email: `corretor${i}@exemplo.com`, ip: "203.0.113.9" });

describe("vitrine pública", () => {
  it("nome e CRECI só conforme a escolha da pessoa — e e-mail nunca", async () => {
    const deps = banco.deps({ agora: T });
    await comLeads(deps, 3);
    await avaliar(deps, entradaAvaliacao({ identificacao: "nome_creci", comentario: "Com nome e CRECI." }), ctx(0));
    await avaliar(deps, entradaAvaliacao({ identificacao: "nome", comentario: "Só com o nome." }), ctx(1));
    await avaliar(deps, entradaAvaliacao({ identificacao: "anonimo", comentario: "Sem me identificar." }), ctx(2));

    const publico = await vitrine(deps);
    const porTexto = new Map(publico.comentarios.map((c) => [c.texto, c]));
    expect(porTexto.get("Com nome e CRECI.")).toMatchObject({ nome: "Corretor A Exemplo", creci: "PE 12340" });
    expect(porTexto.get("Só com o nome.")).toMatchObject({ nome: "Corretor B Exemplo" });
    expect(porTexto.get("Só com o nome.")).not.toHaveProperty("creci");
    expect(porTexto.get("Sem me identificar.")).not.toHaveProperty("nome");
    expect(porTexto.get("Sem me identificar.")).not.toHaveProperty("creci");

    const cru = JSON.stringify(publico);
    expect(cru).not.toContain("@exemplo.com");
    expect(cru).not.toContain("Corretor C Exemplo"); // o anônimo
    expect(cru).not.toContain("+55");
  });

  it("texto de pendente e de recusado não vai ao ar — mas a NOTA dos dois conta na média", async () => {
    const deps = banco.deps({ agora: T });
    await comLeads(deps, 3);
    await avaliar(deps, entradaAvaliacao({ estrelas: 5, comentario: "Publicado mesmo." }), ctx(0));
    // o filtro segura este (tem link)
    await avaliar(deps, entradaAvaliacao({ estrelas: 4, comentario: "veja em www.exemplo.test" }), ctx(1));
    const terceira = await avaliar(deps, entradaAvaliacao({ estrelas: 3, comentario: "Tirado do site." }), ctx(2));
    await moderar(deps.avaliacoes, (terceira as { avaliacao: { id: string } }).avaliacao.id, "recusado", T);

    const publico = await vitrine(deps);
    expect(publico.comentarios.map((c) => c.texto)).toEqual(["Publicado mesmo."]);
    expect(publico).toMatchObject(resumoComArquivo(5, 4, 3)); // banco (5, 4, 3) + arquivo (5, 5, 4)
    const cru = JSON.stringify(publico);
    expect(cru).not.toContain("exemplo.test");
    expect(cru).not.toContain("Tirado do site.");
  });

  it("avaliação sem texto conta na média e não vira comentário vazio", async () => {
    const deps = banco.deps({ agora: T });
    await comLeads(deps, 2);
    await avaliar(deps, { estrelas: 5, identificacao: "nome" }, ctx(0));
    await avaliar(deps, entradaAvaliacao({ estrelas: 4, comentario: "Com texto." }), ctx(1));

    const publico = await vitrine(deps);
    expect(publico).toMatchObject(resumoComArquivo(5, 4));
    expect(publico.comentarios).toHaveLength(1);
  });

  it("da mais recente para a mais antiga, no máximo o limite pedido", async () => {
    const deps = banco.deps();
    await comLeads(deps, 4);
    for (let i = 0; i < 4; i++) {
      await avaliar(
        { ...deps, agora: new Date(T.getTime() + i * 60_000) },
        entradaAvaliacao({ comentario: `Comentário ${i}.` }),
        ctx(i),
      );
    }
    const publico = await vitrine(deps, 2);
    expect(publico.comentarios.map((c) => c.texto)).toEqual(["Comentário 3.", "Comentário 2."]);
    expect(publico.quantas).toBe(resumoComArquivo(5, 5, 5, 5).quantas); // o limite corta a lista, não a contagem
  });

  it("lead excluído (LGPD) com avaliação identificada: o texto sai do ar, a nota fica", async () => {
    const deps = banco.deps({ agora: T });
    await comLeads(deps, 1);
    await avaliar(deps, entradaAvaliacao({ identificacao: "nome", comentario: "Some comigo." }), ctx(0));
    await deps.leads.excluir("lead-0");

    const publico = await vitrine(deps);
    expect(publico.comentarios).toEqual([]);
    expect(publico).toMatchObject(resumoComArquivo(5));
  });

  it("banco vazio: nenhum comentário, e a média fica sendo só a das três do arquivo (F4)", async () => {
    expect(await vitrine(banco.deps())).toEqual({ ...resumoComArquivo(), comentarios: [] });
  });
});
