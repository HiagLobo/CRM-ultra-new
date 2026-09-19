/**
 * A migração 005 é colada à mão pelo fundador no SQL Editor do Neon ANTES do
 * deploy da O9 — sem psql, sem rollback. Este teste lê o arquivo e garante que
 * ele só acrescenta (colunas e índices simples), nunca apaga nem reescreve.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import path from "path";

describe("migração 005 (colada inteira no SQL Editor do Neon)", () => {
  const sql = readFileSync(path.join(process.cwd(), "migrations", "005-cadastro-unico.sql"), "utf8");
  const semComentarios = sql
    .split("\n")
    .filter((l) => !l.trim().startsWith("--"))
    .join("\n");
  const comandos = semComentarios
    .split(";")
    .map((c) => c.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  it("só comandos idempotentes que acrescentam — nada que apague, reescreva ou trave", () => {
    const permitido = /^(ALTER TABLE leads ADD COLUMN IF NOT EXISTS \w+ (TEXT|TIMESTAMPTZ)$|CREATE INDEX IF NOT EXISTS \w+ ON leads \(\w+\)$)/;
    for (const c of comandos) expect(c).toMatch(permitido);
    expect(semComentarios).not.toMatch(/\b(DROP|DELETE|TRUNCATE|UPDATE|UNIQUE|NOT NULL|RENAME)\b/i);
  });

  it("as 3 colunas da O9 e os 2 índices da busca de repetidos", () => {
    expect(comandos).toEqual([
      "ALTER TABLE leads ADD COLUMN IF NOT EXISTS creci_conferencia TEXT",
      "ALTER TABLE leads ADD COLUMN IF NOT EXISTS creci_conferido_em TIMESTAMPTZ",
      "ALTER TABLE leads ADD COLUMN IF NOT EXISTS ultimo_acesso_em TIMESTAMPTZ",
      "CREATE INDEX IF NOT EXISTS leads_telefone_idx ON leads (telefone)",
      "CREATE INDEX IF NOT EXISTS leads_creci_idx ON leads (creci)",
    ]);
  });

  it("o cabeçalho diz a ordem: roda ANTES do deploy", () => {
    expect(sql).toContain("RODE ANTES DO DEPLOY DESTA VERSÃO");
  });
});
