/**
 * Dublês dos testes do slice de avaliações — sem rede, sem Resend, sem banco.
 * Só arquivos `*.test.ts` importam daqui; nada de produção depende disto.
 * Pessoas e contatos são fictícios (`@exemplo.com`, +5581900000001).
 */
import { promises as fs } from "fs";
import os from "os";
import path from "path";
import { randomUUID } from "crypto";
import { FileAvaliacaoStore } from "../../lib/avaliacaoStore";
import { FileLeadStore } from "../../lib/leadStore";
import { MemoriaRateLimiter } from "../../lib/ratelimit";
import type { Lead } from "../lead/lead";
import type { AvaliacaoInput } from "./schema";
import type { DepsAvaliar } from "./avaliar";
import { resumo, type ResumoAvaliacoes } from "./avaliacao";
import { notasDoArquivo } from "./doArquivo";

/**
 * Resumo esperado quando o BANCO tem estas notas: já somado com as três do
 * arquivo (decisão F4), que é como a API devolve. Calculado a partir do
 * arquivo de verdade para o teste não quebrar quando o fundador acrescentar um
 * depoimento — o número exato do contrato é fixado em `avaliacao.test.ts`.
 */
export function resumoComArquivo(...doBanco: number[]): ResumoAvaliacoes {
  return resumo(
    doBanco.map((estrelas) => ({ estrelas })),
    notasDoArquivo(),
  );
}

/** Lead fictício já verificado, com nome e CRECI (quem pode avaliar). */
export function leadVerificado(parcial: Partial<Lead> = {}, agora = new Date("2026-09-19T12:00:00.000Z")): Lead {
  return {
    id: "lead-1",
    nome: "Corretor Exemplo",
    email: "corretor@exemplo.com",
    telefone: "+5581900000001",
    creci: "PE 12345",
    status: "novo",
    canal: "site",
    consentimento: { texto: "texto-da-politica", aceitoEm: agora.toISOString(), ip: "203.0.113.9" },
    codigo: { hash: "hash-do-codigo", expiraEm: agora.toISOString(), tentativas: 0, enviadoEm: agora.toISOString() },
    verificadoEm: agora.toISOString(),
    criadoEm: agora.toISOString(),
    atualizadoEm: agora.toISOString(),
    ...parcial,
  };
}

/** Entrada válida do formulário de avaliação. */
export function entradaAvaliacao(over: Partial<AvaliacaoInput> = {}): AvaliacaoInput {
  return { estrelas: 5, comentario: "Organizou meu dia de trabalho.", identificacao: "nome", ...over };
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
    avaliacoes: () => new FileAvaliacaoStore(arquivo("avaliacoes")),
    leads: () => new FileLeadStore(arquivo("leads")),
    /** As duas stores + limitador em memória, prontas para o `avaliar`. */
    deps(over: Partial<DepsAvaliar> = {}): DepsAvaliar {
      return {
        avaliacoes: this.avaliacoes(),
        leads: this.leads(),
        limiter: new MemoriaRateLimiter(),
        ...over,
      };
    },
    async limpar(): Promise<void> {
      await Promise.all(arquivos.map((a) => fs.rm(a, { force: true })));
      arquivos = [];
    },
  };
}
