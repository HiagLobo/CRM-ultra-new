/**
 * A migração 004 é colada à mão pelo fundador no SQL Editor do Neon — sem
 * psql, sem rollback. Este teste lê o arquivo e garante que ele só tem
 * comandos idempotentes e que traduz os status antigos igual ao código.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import path from "path";
import { normalizarStatus } from "./funil";

describe("migração 004 (colada inteira no SQL Editor do Neon)", () => {
  const sql = readFileSync(path.join(process.cwd(), "migrations", "004-funil.sql"), "utf8");
  const semComentarios = sql
    .split("\n")
    .filter((l) => !l.trim().startsWith("--"))
    .join("\n");
  const comandos = semComentarios
    .split(";")
    .map((c) => c.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  it("só comandos idempotentes — nada que apague ou reescreva dado de contato", () => {
    const permitido =
      /^(ALTER TABLE leads ADD COLUMN IF NOT EXISTS |ALTER TABLE leads ALTER COLUMN email DROP NOT NULL$|UPDATE leads SET status = '\w+' WHERE status = '\w+'$|CREATE TABLE IF NOT EXISTS lead_notas |CREATE INDEX IF NOT EXISTS )/;
    for (const c of comandos) expect(c).toMatch(permitido);
    expect(semComentarios).not.toMatch(/\b(DROP TABLE|DROP COLUMN|DELETE FROM|TRUNCATE)\b/i);
  });

  it("colunas do funil, canal 'site' por padrão e anotações que saem junto com o lead", () => {
    for (const coluna of ["nome", "canal", "retomar_em", "motivo", "proxima_acao_em", "proxima_acao"]) {
      expect(semComentarios).toMatch(new RegExp(`ADD COLUMN IF NOT EXISTS ${coluna} `));
    }
    expect(semComentarios).toContain("canal TEXT NOT NULL DEFAULT 'site'");
    expect(semComentarios).toMatch(/lead_id\s+TEXT\s+NOT NULL REFERENCES leads \(id\) ON DELETE CASCADE/);
    expect(semComentarios).toMatch(/CREATE INDEX IF NOT EXISTS lead_notas_lead_em_idx ON lead_notas \(lead_id, em DESC\)/);
  });

  it("converte exatamente os 3 status antigos, igual ao normalizador do código", () => {
    const pares = comandos
      .map((c) => /^UPDATE leads SET status = '(\w+)' WHERE status = '(\w+)'$/.exec(c))
      .filter((m): m is RegExpExecArray => m !== null)
      .map((m) => [m[2]!, m[1]!]);
    expect(pares).toEqual([
      ["verificado", "novo"],
      ["contatado", "em_contato"],
      ["descartado", "perdido"],
    ]);
    for (const [de, para] of pares) expect(normalizarStatus(de)).toBe(para);
  });
});
