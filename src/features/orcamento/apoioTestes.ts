/**
 * Dublês dos testes do slice de orçamentos — sem rede, sem banco.
 * Só arquivos `*.test.ts` importam daqui; nada de produção depende disto.
 * Pessoas e contatos são fictícios (`@exemplo.com`, +5581900000001).
 */
import { promises as fs } from "fs";
import os from "os";
import path from "path";
import { randomUUID } from "crypto";
import { FileLeadStore } from "../../lib/leadStore";
import { FileOrcamentoStore } from "../../lib/orcamentoStore";
import type { Lead } from "../lead/lead";
import type { NovoOrcamento } from "./schema";
import { NovoOrcamentoSchema } from "./schema";

/** Lead fictício do funil, o "cliente" das propostas dos testes. */
export function leadDoOrcamento(parcial: Partial<Lead> = {}, agora = new Date("2026-09-20T12:00:00.000Z")): Lead {
  return {
    id: "lead-1",
    nome: "Imobiliária Exemplo",
    email: "contato@exemplo.com",
    telefone: "+5581900000001",
    creci: "PE 12345",
    status: "negociacao",
    canal: "site",
    consentimento: { texto: "texto-da-politica", aceitoEm: agora.toISOString(), ip: "203.0.113.9" },
    codigo: { hash: "hash-do-codigo", expiraEm: agora.toISOString(), tentativas: 0, enviadoEm: agora.toISOString() },
    verificadoEm: agora.toISOString(),
    criadoEm: agora.toISOString(),
    atualizadoEm: agora.toISOString(),
    ...parcial,
  };
}

/** Pedido válido (imobiliária, 5 assentos Pro), já passado pelo Zod. */
export function pedidoOrcamento(over: Record<string, unknown> = {}): NovoOrcamento {
  return NovoOrcamentoSchema.parse({
    leadId: "lead-1",
    publico: "imobiliaria",
    assentos: { pro: 5, ultra: 0 },
    ...over,
  });
}

/** Stores em arquivos temporários, apagados por `limpar()` (chamar no afterEach). */
export function bancoTemporario(prefixo: string) {
  let arquivos: string[] = [];
  const arquivo = (sufixo: string) => {
    const caminho = path.join(os.tmpdir(), `${prefixo}-${sufixo}-${randomUUID()}.json`);
    arquivos.push(caminho);
    return caminho;
  };
  return {
    orcamentos: () => new FileOrcamentoStore(arquivo("orcamentos")),
    leads: () => new FileLeadStore(arquivo("leads")),
    async limpar(): Promise<void> {
      await Promise.all(arquivos.map((a) => fs.rm(a, { force: true })));
      arquivos = [];
    },
  };
}
