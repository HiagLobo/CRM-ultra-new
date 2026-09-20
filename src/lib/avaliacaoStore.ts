/**
 * Adaptador de DEV da porta `AvaliacaoStore` (JSON em `data/avaliacoes.json`).
 * A porta mora em `avaliacaoStorePorta.ts` e é re-exportada daqui (mesmo
 * arranjo do `leadStore.ts`). Produção: `PostgresAvaliacaoStore`.
 *
 * SERVER-ONLY (usa fs/crypto). Nunca importar em componente de cliente.
 */
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import type { Avaliacao } from "../features/avaliacao/avaliacao";
import type {
  AvaliacaoStore,
  ContagemAvaliacoes,
  DadosAvaliacao,
  TrocaStatus,
} from "./avaliacaoStorePorta";

export type { AvaliacaoStore, ContagemAvaliacoes, DadosAvaliacao, TrocaStatus } from "./avaliacaoStorePorta";

const CAMINHO_PADRAO = path.join(process.cwd(), "data", "avaliacoes.json");

/** Da mais recente para a mais antiga (`criadoEm` ISO ordena como texto). */
const maisNovaPrimeiro = (a: Avaliacao, b: Avaliacao) => b.criadoEm.localeCompare(a.criadoEm);

/** Campos que a edição sobrescreve; `id` e `criadoEm` ficam (é a mesma avaliação). */
function comDados(base: Pick<Avaliacao, "id" | "leadId" | "criadoEm">, dados: DadosAvaliacao): Avaliacao {
  return {
    ...base,
    estrelas: dados.estrelas,
    ...(dados.comentario ? { comentario: dados.comentario } : {}),
    identificacao: dados.identificacao,
    status: dados.status,
    consentimento: dados.consentimento,
    atualizadoEm: dados.em,
  };
}

export class FileAvaliacaoStore implements AvaliacaoStore {
  /** Serializa as operações para evitar corrida de escrita no mesmo arquivo. */
  private fila: Promise<void> = Promise.resolve();

  constructor(private readonly arquivo: string = CAMINHO_PADRAO) {}

  private enfileirar<T>(fn: () => Promise<T>): Promise<T> {
    const resultado = this.fila.then(fn, fn);
    this.fila = resultado.then(
      () => undefined,
      () => undefined,
    );
    return resultado;
  }

  private async ler(): Promise<Avaliacao[]> {
    try {
      const txt = await fs.readFile(this.arquivo, "utf8");
      const dados: unknown = JSON.parse(txt);
      return Array.isArray(dados) ? (dados as Avaliacao[]) : [];
    } catch (err) {
      if ((err as NodeJS.ErrnoException)?.code === "ENOENT") return [];
      throw err;
    }
  }

  /** Escrita atômica: grava num tmp e renomeia (rename é atômico no mesmo FS). */
  private async escrever(registros: Avaliacao[]): Promise<void> {
    await fs.mkdir(path.dirname(this.arquivo), { recursive: true });
    const tmp = `${this.arquivo}.${randomUUID()}.tmp`;
    try {
      await fs.writeFile(tmp, JSON.stringify(registros, null, 2), "utf8");
      await fs.rename(tmp, this.arquivo);
    } catch (err) {
      // não deixa tmp órfão com o texto do comentário se a escrita/rename falhar
      await fs.rm(tmp, { force: true });
      throw err;
    }
  }

  salvar(leadId: string, dados: DadosAvaliacao): Promise<Avaliacao> {
    return this.enfileirar(async () => {
      const registros = await this.ler();
      const i = registros.findIndex((a) => a.leadId === leadId);
      const base = i === -1 ? { id: randomUUID(), leadId, criadoEm: dados.em } : registros[i]!;
      const avaliacao = comDados(base, dados);
      if (i === -1) registros.push(avaliacao);
      else registros[i] = avaliacao;
      await this.escrever(registros);
      return avaliacao;
    });
  }

  doLead(leadId: string): Promise<Avaliacao | null> {
    return this.enfileirar(async () => (await this.ler()).find((a) => a.leadId === leadId) ?? null);
  }

  listarPublicadas(limite: number): Promise<Avaliacao[]> {
    return this.enfileirar(async () =>
      (await this.ler())
        .filter((a) => a.status === "publicado" && !!a.comentario?.trim())
        .sort(maisNovaPrimeiro)
        .slice(0, Math.max(0, limite)),
    );
  }

  listarTodas(): Promise<Avaliacao[]> {
    return this.enfileirar(async () => (await this.ler()).sort(maisNovaPrimeiro));
  }

  trocarStatus(id: string, status: Avaliacao["status"], em: string): Promise<TrocaStatus | null> {
    return this.enfileirar(async () => {
      const registros = await this.ler();
      const i = registros.findIndex((a) => a.id === id);
      if (i === -1) return null;
      const anterior = registros[i]!.status;
      const avaliacao: Avaliacao = { ...registros[i]!, status, atualizadoEm: em };
      registros[i] = avaliacao;
      await this.escrever(registros);
      return { anterior, avaliacao };
    });
  }

  resumoContagem(): Promise<ContagemAvaliacoes> {
    return this.enfileirar(async () => {
      const todas = await this.ler();
      return { soma: todas.reduce((t, a) => t + a.estrelas, 0), quantas: todas.length };
    });
  }
}
