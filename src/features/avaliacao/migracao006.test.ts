/**
 * A migração 006 é colada à mão pelo fundador no SQL Editor do Neon ANTES do
 * deploy da O10 — sem psql, sem rollback. Este teste lê o arquivo e garante que
 * ele só acrescenta (uma tabela nova e os índices dela), nunca apaga, reescreve
 * nem mexe na tabela de leads.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import path from "path";

describe("migração 006 (colada inteira no SQL Editor do Neon)", () => {
  const sql = readFileSync(path.join(process.cwd(), "migrations", "006-avaliacoes.sql"), "utf8");
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
    // o único "DELETE" permitido é o da regra da chave estrangeira (apagar o lead apaga a avaliação)
    const semCascade = semComentarios.replace(/ON DELETE CASCADE/g, "");
    expect(semCascade).not.toMatch(/\b(DROP|DELETE|TRUNCATE|UPDATE|INSERT|ALTER|RENAME|GRANT)\b/i);
  });

  it("a tabela nova com as colunas do plano, e nada mexendo na tabela de leads", () => {
    const criacao = comandos[0]!;
    expect(criacao).toMatch(/^CREATE TABLE IF NOT EXISTS avaliacoes \(/);
    const colunas = criacao
      .replace(/^CREATE TABLE IF NOT EXISTS avaliacoes \(/, "")
      .replace(/\)$/, "")
      // a vírgula do CHECK (estrelas BETWEEN 1 AND 5) não separa coluna
      .split(/,(?![^(]*\))/)
      .map((c) => c.trim().split(" ")[0]);
    expect(colunas).toEqual([
      "id",
      "lead_id",
      "estrelas",
      "comentario",
      "identificacao",
      "status",
      "consentimento_texto",
      "consentimento_em",
      "consentimento_ip",
      "criado_em",
      "atualizado_em",
    ]);
    // excluir o lead (LGPD) leva a avaliação junto, e a nota só existe de 1 a 5
    expect(criacao).toContain("REFERENCES leads (id) ON DELETE CASCADE");
    expect(criacao).toContain("CHECK (estrelas BETWEEN 1 AND 5)");
    // a 006 não altera a tabela de leads em lugar nenhum
    expect(comandos.slice(1).join(" ")).not.toMatch(/\bleads\b/);
  });

  it("uma avaliação por lead (índice único) e o índice da listagem", () => {
    expect(comandos.slice(1)).toEqual([
      "CREATE UNIQUE INDEX IF NOT EXISTS avaliacoes_lead_idx ON avaliacoes (lead_id)",
      "CREATE INDEX IF NOT EXISTS avaliacoes_status_criado_idx ON avaliacoes (status, criado_em DESC)",
    ]);
  });

  it("o cabeçalho diz a ordem: roda ANTES do deploy", () => {
    expect(sql).toContain("RODE ANTES DO DEPLOY DESTA VERSÃO");
  });
});
