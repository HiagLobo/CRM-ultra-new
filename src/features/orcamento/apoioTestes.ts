/**
 * Dublês dos testes do slice de orçamentos — sem rede, sem banco.
 * Só arquivos `*.test.ts` importam daqui; nada de produção depende disto.
 * Pessoas e contatos são fictícios (`@exemplo.com`, +5581900000001).
 */
import { promises as fs } from "fs";
import os from "os";
import path from "path";
import { randomUUID } from "crypto";
import { NextRequest } from "next/server";
import { COOKIE_ADMIN, criarSessaoAdmin } from "../../lib/adminAuth";
import { FileLeadStore } from "../../lib/leadStore";
import { FileOrcamentoStore } from "../../lib/orcamentoStore";
import { SECRET_TESTE } from "../lead/apoioTestes";
import type { Lead } from "../lead/lead";
import { anoEmRecife } from "./orcamento";
import type { NovoOrcamento } from "./schema";
import { NovoOrcamentoSchema } from "./schema";

/**
 * Relógio congelado das rotas: o ano do número e a validade não podem depender
 * do dia em que a suíte roda (na virada do ano o teste piscaria sozinho).
 */
export const AGORA_TESTE = new Date("2026-09-20T15:00:00.000Z");
export const ANO_TESTE = anoEmRecife(AGORA_TESTE);
/** `ORC-2026-001` a partir da sequência ("001"). */
export const numeroDoTeste = (sequencia: string) => `ORC-${ANO_TESTE}-${sequencia}`;

/** Cookie de sessão de admin válido para os testes de rota. */
export const sessaoDeAdmin = () => `${COOKIE_ADMIN}=${criarSessaoAdmin(SECRET_TESTE)}`;

/** Requisição para `/api/admin/orcamentos` (o corpo vai como JSON). */
export function requisicao(metodo: string, corpo?: unknown, cookie?: string): NextRequest {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (cookie) headers.cookie = cookie;
  return new NextRequest("http://localhost/api/admin/orcamentos", {
    method: metodo,
    headers,
    ...(corpo !== undefined ? { body: JSON.stringify(corpo) } : {}),
  });
}

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
