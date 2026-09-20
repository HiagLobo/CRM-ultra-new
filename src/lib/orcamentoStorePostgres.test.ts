/**
 * O adaptador de produção dos orçamentos. Pool falso: o que se testa é o SQL
 * emitido (a numeração dentro do próprio INSERT, o retry quando outra gravação
 * leva o número, o carimbo do 1º envio) e a leitura da linha, não o driver.
 */
import { describe, it, expect, vi } from "vitest";
import { PostgresOrcamentoStore, diaDaColuna, paraDominio, type LinhaOrcamento } from "./orcamentoStorePostgres";
import type { DadosOrcamento } from "./orcamentoStorePorta";
import { calcularOrcamento, formatarNumero } from "@/features/orcamento";

const T = "2026-09-20T15:00:00.000Z";

const calculado = (() => {
  const r = calcularOrcamento({ publico: "imobiliaria", assentos: { pro: 5, ultra: 0 } });
  if (!r.ok) throw new Error("cálculo do teste recusado");
  return r.calculo;
})();

function poolFake(respostas: unknown[][] = [[linha()]], erros: (unknown | undefined)[] = []) {
  const consultas: { sql: string; params: unknown[] }[] = [];
  let chamada = 0;
  const cliente = {
    query: vi.fn(async (sql: string, params: unknown[] = []) => {
      const i = chamada++;
      consultas.push({ sql, params });
      const erro = erros[i];
      if (erro) throw erro;
      return { rows: respostas[Math.min(i, respostas.length - 1)] ?? [] };
    }),
    release: vi.fn(),
  };
  return { pool: { connect: vi.fn(async () => cliente) }, consultas, cliente };
}

const loja = (pool: unknown) => new PostgresOrcamentoStore(pool as never);

function linha(over: Partial<LinhaOrcamento> = {}): LinhaOrcamento {
  const d = new Date(T);
  return {
    id: "orc-1",
    numero: "ORC-2026-001",
    lead_id: "lead-1",
    publico: "imobiliaria",
    status: "rascunho",
    itens: calculado.itens,
    totais: calculado.totais,
    condicoes: calculado.condicoes,
    validade_em: new Date(2026, 9, 5), // 05/10/2026, meia-noite local (como o pg devolve DATE)
    observacao: null,
    criado_em: d,
    atualizado_em: d,
    enviado_em: null,
    ...over,
  };
}

const DADOS: DadosOrcamento = {
  leadId: "lead-1",
  publico: "imobiliaria",
  status: "rascunho",
  itens: calculado.itens,
  totais: calculado.totais,
  condicoes: calculado.condicoes,
  validadeEm: "2026-10-05",
  em: T,
  ano: 2026,
};

const repetido = () => Object.assign(new Error("duplicate key value violates unique constraint"), { code: "23505" });

describe("criar: a numeração sai dentro do INSERT", () => {
  /**
   * O número que o pool falso devolve não prova nada (é o que o dublê mandou):
   * o que se confere aqui é a EXPRESSÃO que vai ao banco.
   */
  it("o próximo número vem do MAX do ano, numa instrução só", async () => {
    const { pool, consultas, cliente } = poolFake();
    await loja(pool).criar(DADOS);

    const { sql, params } = consultas[0]!;
    expect(sql).toContain("INSERT INTO orcamentos");
    expect(sql).toContain("COALESCE(MAX(substring(numero from '[0-9]+$')::int), 0) + 1");
    expect(sql).toContain("WHERE numero LIKE $11 || '%'");
    expect(params[10]).toBe("ORC-2026-"); // o prefixo do ano filtra e monta o número
    expect(typeof params[11]).toBe("string"); // o id é gerado aqui
    expect(cliente.release).toHaveBeenCalled();
  });

  /**
   * `lpad(x, 3, '0')` TRUNCA: no orçamento 1000 ele montaria 'ORC-AAAA-100',
   * colidiria com o 100 e o retry nunca sairia disso. A expressão tem de
   * completar até 3 dígitos e nunca cortar, como o `padStart` do domínio.
   */
  it("acima de 999 o número mantém todos os dígitos", async () => {
    const { pool, consultas } = poolFake();
    await loja(pool).criar(DADOS);
    const { sql } = consultas[0]!;

    expect(sql).toContain("lpad(seq, greatest(3, length(seq)), '0')");
    expect(sql).not.toMatch(/lpad\([^)]*,\s*3\s*,\s*'0'\)/); // nada de tamanho fixo

    // a mesma regra da expressão, conferida contra o domínio
    const comoNoBanco = (seq: number) => String(seq).padStart(Math.max(3, String(seq).length), "0");
    expect(comoNoBanco(7)).toBe("007");
    expect(comoNoBanco(999)).toBe("999");
    expect(comoNoBanco(1_000)).toBe("1000");
    expect(`ORC-2026-${comoNoBanco(1_000)}`).toBe(formatarNumero(2026, 1_000));
    expect(`ORC-2026-${comoNoBanco(7)}`).toBe(formatarNumero(2026, 7));
  });

  it("o retrato vai como JSONB e a validade como DATE", async () => {
    const { pool, consultas } = poolFake();
    await loja(pool).criar(DADOS);
    const { sql, params } = consultas[0]!;
    expect(sql).toContain("$4::jsonb");
    expect(sql).toContain("$7::date");
    expect(JSON.parse(params[3] as string)).toEqual(calculado.itens);
    expect(JSON.parse(params[4] as string)).toEqual(calculado.totais);
    expect(params[6]).toBe("2026-10-05");
    expect(params[9]).toBeNull(); // rascunho não carimba envio
  });

  it("número levado por outra gravação (23505) tenta de novo, em vez de repetir", async () => {
    const { pool, consultas } = poolFake([[linha({ numero: "ORC-2026-002" })]], [repetido()]);
    const orcamento = await loja(pool).criar(DADOS);
    expect(consultas).toHaveLength(2);
    expect(orcamento.numero).toBe("ORC-2026-002");
  });

  it("erro que não é número repetido sobe na hora (nada de insistir com o banco fora do ar)", async () => {
    const outro = Object.assign(new Error('relation "orcamentos" does not exist'), { code: "42P01" });
    const { pool, consultas } = poolFake([[linha()]], [outro]);
    await expect(loja(pool).criar(DADOS)).rejects.toMatchObject({ code: "42P01" });
    expect(consultas).toHaveLength(1);
  });
});

describe("leitura da linha", () => {
  it("a DATE vira o dia que foi gravado, sem pular por causa de fuso", () => {
    expect(diaDaColuna(new Date(2026, 9, 5))).toBe("2026-10-05");
    expect(diaDaColuna("2026-10-05")).toBe("2026-10-05");
  });

  it("o retrato passa inteiro, e situação desconhecida vira rascunho", () => {
    const o = paraDominio(linha({ status: "inventado", observacao: "combinado no WhatsApp", enviado_em: new Date(T) }));
    expect(o).toMatchObject({
      id: "orc-1",
      numero: "ORC-2026-001",
      leadId: "lead-1",
      status: "rascunho",
      validadeEm: "2026-10-05",
      observacao: "combinado no WhatsApp",
      enviadoEm: T,
    });
    expect(o.totais.mensalCentavos).toBe(77_500);
    expect(paraDominio(linha()).enviadoEm).toBeUndefined();
  });
});

describe("situação e exclusão", () => {
  it("o UPDATE lê a situação anterior na mesma instrução e só carimba o 1º envio", async () => {
    const { pool, consultas } = poolFake([[{ ...linha({ status: "enviado" }), status_anterior: "rascunho" }]]);
    const troca = await loja(pool).trocarStatus("orc-1", "enviado", T);

    const { sql } = consultas[0]!;
    expect(sql).toContain("WITH antigo AS (SELECT id, status FROM orcamentos WHERE id = $1)");
    expect(sql).toContain("COALESCE(o.enviado_em, $3::timestamptz)");
    expect(troca).toMatchObject({ anterior: "rascunho", orcamento: { status: "enviado" } });
  });

  it("id que não existe devolve null, sem inventar linha", async () => {
    const { pool } = poolFake([[]]);
    expect(await loja(pool).trocarStatus("nao-existe", "aceito", T)).toBeNull();
  });

  it("excluir e remover do lead contam o que saiu (e 0 não é erro)", async () => {
    const { pool: p1 } = poolFake([[{ id: "orc-1" }]]);
    expect(await loja(p1).excluir("orc-1")).toBe(true);

    const { pool: p2 } = poolFake([[]]);
    expect(await loja(p2).excluir("orc-1")).toBe(false);

    const { pool: p3, consultas } = poolFake([[{ id: "orc-1" }, { id: "orc-2" }]]);
    expect(await loja(p3).removerDoLead("lead-1")).toBe(2);
    expect(consultas[0]!.sql).toContain("DELETE FROM orcamentos WHERE lead_id = $1");

    const { pool: p4 } = poolFake([[]]);
    expect(await loja(p4).removerDoLead("lead-1")).toBe(0);
  });

  it("as listagens vêm do mais recente para o mais antigo", async () => {
    const { pool, consultas } = poolFake();
    await loja(pool).listar();
    await loja(pool).doLead("lead-1");
    expect(consultas[0]!.sql).toContain("ORDER BY criado_em DESC");
    expect(consultas[1]!.sql).toContain("WHERE lead_id = $1 ORDER BY criado_em DESC");
  });
});
