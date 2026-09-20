/**
 * A migração 007 é colada à mão pelo fundador no SQL Editor do Neon ANTES do
 * deploy da O11 — sem psql, sem rollback. Este teste lê o arquivo e garante que
 * ele só acrescenta (uma tabela nova e os índices dela), nunca apaga, reescreve
 * nem mexe nas tabelas que já existem.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import path from "path";

describe("migração 007 (colada inteira no SQL Editor do Neon)", () => {
  const sql = readFileSync(path.join(process.cwd(), "migrations", "007-orcamentos.sql"), "utf8");
  const semComentarios = sql
    .split("\n")
    .filter((l) => !l.trim().startsWith("--"))
    .join("\n");
  const comandos = semComentarios
    .split(";")
    .map((c) => c.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  it("só comandos idempotentes que acrescentam — nada que apague, reescreva ou trave", () => {
    for (const c of comandos) expect(c).toMatch(/^CREATE (TABLE|UNIQUE INDEX|INDEX) IF NOT EXISTS\b/);
    // o único "DELETE" permitido é o da regra da chave estrangeira (apagar o lead apaga o orçamento)
    const semCascade = semComentarios.replace(/ON DELETE CASCADE/g, "");
    expect(semCascade).not.toMatch(/\b(DROP|DELETE|TRUNCATE|UPDATE|INSERT|ALTER|RENAME|GRANT)\b/i);
  });

  it("a tabela nova com as colunas do plano, e nada mexendo em leads ou avaliações", () => {
    const criacao = comandos[0]!;
    expect(criacao).toMatch(/^CREATE TABLE IF NOT EXISTS orcamentos \(/);
    const colunas = criacao
      .replace(/^CREATE TABLE IF NOT EXISTS orcamentos \(/, "")
      .replace(/\)$/, "")
      .split(/,(?![^(]*\))/)
      .map((c) => c.trim().split(" ")[0]);
    expect(colunas).toEqual([
      "id",
      "numero",
      "lead_id",
      "publico",
      "status",
      "itens",
      "totais",
      "condicoes",
      "validade_em",
      "observacao",
      "criado_em",
      "atualizado_em",
      "enviado_em",
    ]);
    // excluir o lead (LGPD) leva os orçamentos junto, e o número é único de verdade
    expect(criacao).toContain("REFERENCES leads (id) ON DELETE CASCADE");
    expect(criacao).toMatch(/numero\s+TEXT\s+NOT NULL UNIQUE/);
    // o retrato do preço do dia mora em JSONB
    for (const coluna of ["itens", "totais", "condicoes"]) {
      expect(criacao).toMatch(new RegExp(`${coluna}\\s+JSONB\\s+NOT NULL`));
    }
    // a 007 não altera avaliações, e só cita leads na chave estrangeira
    expect(semComentarios).not.toMatch(/\bavaliacoes\b/);
    expect(comandos.slice(1).join(" ")).not.toMatch(/\bleads\b/);
  });

  it("os índices da ficha do lead e da listagem do painel", () => {
    expect(comandos.slice(1)).toEqual([
      "CREATE INDEX IF NOT EXISTS orcamentos_lead_idx ON orcamentos (lead_id)",
      "CREATE INDEX IF NOT EXISTS orcamentos_status_criado_idx ON orcamentos (status, criado_em DESC)",
    ]);
  });

  it("o cabeçalho diz a ordem: roda ANTES do deploy", () => {
    expect(sql).toContain("RODE ANTES DO DEPLOY DESTA VERSÃO");
  });
});
