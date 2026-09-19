/**
 * Dublês dos testes do slice de leads — sem rede, sem Resend, sem banco.
 * Só arquivos `*.test.ts` importam daqui; nada de produção depende disto.
 */
import { promises as fs } from "fs";
import os from "os";
import path from "path";
import { randomUUID } from "crypto";
import { vi } from "vitest";
import { FileLeadStore } from "../../lib/leadStore";
import type { ProvedorEmail } from "../../lib/email";
import type { BrandConfig } from "../../config/brand";

/** E-mail falso: registra o que "enviou" e falha quando mandado. */
export class EmailFake implements ProvedorEmail {
  codigos: { para: string; codigo: string }[] = [];
  avisos: { para: string; marca: string }[] = [];
  falharCodigo?: Error;
  falharAviso?: Error;

  async enviarCodigo(para: string, codigo: string, _brand: BrandConfig): Promise<void> {
    if (this.falharCodigo) throw this.falharCodigo;
    this.codigos.push({ para, codigo });
  }

  async enviarAvisoNovoLead(para: string, brand: BrandConfig): Promise<void> {
    if (this.falharAviso) throw this.falharAviso;
    this.avisos.push({ para, marca: brand.nomeCurto });
  }
}

/** Stores em arquivos temporários, apagados por `limpar()` (chamar no afterEach). */
export function storesTemporarias(prefixo: string) {
  let arquivos: string[] = [];
  return {
    nova(): FileLeadStore {
      const arquivo = path.join(os.tmpdir(), `${prefixo}-${randomUUID()}.json`);
      arquivos.push(arquivo);
      return new FileLeadStore(arquivo);
    },
    async limpar(): Promise<void> {
      await Promise.all(arquivos.map((a) => fs.rm(a, { force: true })));
      arquivos = [];
    },
  };
}

/** Junta tudo o que foi para o console (para provar que PII não vaza em log). */
export function capturarConsole(): () => string {
  const linhas: string[] = [];
  for (const nivel of ["log", "info", "warn", "error"] as const) {
    vi.spyOn(console, nivel).mockImplementation((...args: unknown[]) => {
      linhas.push(args.map(String).join(" "));
    });
  }
  return () => linhas.join("\n");
}
