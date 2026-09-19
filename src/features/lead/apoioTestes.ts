/**
 * Dublês dos testes do slice de leads — sem rede, sem Resend, sem banco.
 * Só arquivos `*.test.ts` importam daqui; nada de produção depende disto.
 */
import { promises as fs } from "fs";
import os from "os";
import path from "path";
import { randomUUID } from "crypto";
import { vi } from "vitest";
import { FileLeadStore, type LeadStore } from "../../lib/leadStore";
import { MemoriaRateLimiter } from "../../lib/ratelimit";
import type { ProvedorEmail } from "../../lib/email";
import { brand, type BrandConfig } from "../../config/brand";
import type { DepsSolicitarAcesso } from "./solicitarAcesso";

/** APP_SECRET dos testes (HMAC do código). Fictício. */
export const SECRET_TESTE = "segredo-de-teste-1234567890";

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

/** Deps do `solicitarAcesso` com dublês: e-mail falso (sob demanda) e limitador em memória. */
export function depsSolicitar(store: LeadStore, over: Partial<DepsSolicitarAcesso> = {}) {
  const email = new EmailFake();
  const deps: DepsSolicitarAcesso = {
    store,
    email: () => email,
    limiter: new MemoriaRateLimiter(),
    brand,
    secret: SECRET_TESTE,
    limiteEnviosDia: 90,
    ...over,
  };
  return { deps, email };
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
