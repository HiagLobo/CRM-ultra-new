/**
 * Adaptador de DEV da porta `OrcamentoStore` (JSON em `data/orcamentos.json`).
 * A porta mora em `orcamentoStorePorta.ts` e é re-exportada daqui (mesmo
 * arranjo do `leadStore.ts`). Produção: `PostgresOrcamentoStore`.
 *
 * A numeração sai da FILA: ler os números usados, escolher o próximo e gravar
 * acontece dentro da mesma operação enfileirada, então duas criações ao mesmo
 * tempo saem com números diferentes.
 *
 * SERVER-ONLY (usa fs/crypto). Nunca importar em componente de cliente.
 */
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import type { Orcamento, StatusOrcamento } from "../features/orcamento/orcamento";
import { proximoNumero } from "../features/orcamento/orcamento";
import type { DadosOrcamento, OrcamentoStore, TrocaStatusOrcamento } from "./orcamentoStorePorta";

export type { DadosOrcamento, OrcamentoStore, TrocaStatusOrcamento } from "./orcamentoStorePorta";

const CAMINHO_PADRAO = path.join(process.cwd(), "data", "orcamentos.json");

/** Do mais recente para o mais antigo (`criadoEm` ISO ordena como texto). */
const maisNovoPrimeiro = (a: Orcamento, b: Orcamento) => b.criadoEm.localeCompare(a.criadoEm);

export class FileOrcamentoStore implements OrcamentoStore {
  /** Serializa as operações: evita corrida de escrita e de numeração. */
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

  private async ler(): Promise<Orcamento[]> {
    try {
      const txt = await fs.readFile(this.arquivo, "utf8");
      const dados: unknown = JSON.parse(txt);
      return Array.isArray(dados) ? (dados as Orcamento[]) : [];
    } catch (err) {
      if ((err as NodeJS.ErrnoException)?.code === "ENOENT") return [];
      throw err;
    }
  }

  /** Escrita atômica: grava num tmp e renomeia (rename é atômico no mesmo FS). */
  private async escrever(registros: Orcamento[]): Promise<void> {
    await fs.mkdir(path.dirname(this.arquivo), { recursive: true });
    const tmp = `${this.arquivo}.${randomUUID()}.tmp`;
    try {
      await fs.writeFile(tmp, JSON.stringify(registros, null, 2), "utf8");
      await fs.rename(tmp, this.arquivo);
    } catch (err) {
      // não deixa tmp órfão com preço e nome de cliente se a escrita falhar
      await fs.rm(tmp, { force: true });
      throw err;
    }
  }

  criar(dados: DadosOrcamento): Promise<Orcamento> {
    return this.enfileirar(async () => {
      const registros = await this.ler();
      const orcamento: Orcamento = {
        id: randomUUID(),
        numero: proximoNumero(
          dados.ano,
          registros.map((o) => o.numero),
        ),
        leadId: dados.leadId,
        publico: dados.publico,
        status: dados.status,
        itens: dados.itens,
        totais: dados.totais,
        condicoes: dados.condicoes,
        validadeEm: dados.validadeEm,
        ...(dados.observacao ? { observacao: dados.observacao } : {}),
        criadoEm: dados.em,
        atualizadoEm: dados.em,
        ...(dados.status === "enviado" ? { enviadoEm: dados.em } : {}),
      };
      registros.push(orcamento);
      await this.escrever(registros);
      return orcamento;
    });
  }

  listar(): Promise<Orcamento[]> {
    return this.enfileirar(async () => (await this.ler()).sort(maisNovoPrimeiro));
  }

  doLead(leadId: string): Promise<Orcamento[]> {
    return this.enfileirar(async () => (await this.ler()).filter((o) => o.leadId === leadId).sort(maisNovoPrimeiro));
  }

  buscarPorId(id: string): Promise<Orcamento | null> {
    return this.enfileirar(async () => (await this.ler()).find((o) => o.id === id) ?? null);
  }

  trocarStatus(id: string, status: StatusOrcamento, em: string): Promise<TrocaStatusOrcamento | null> {
    return this.enfileirar(async () => {
      const registros = await this.ler();
      const i = registros.findIndex((o) => o.id === id);
      if (i === -1) return null;
      const atual = registros[i]!;
      const orcamento: Orcamento = {
        ...atual,
        status,
        atualizadoEm: em,
        // o carimbo do 1º envio fica: reenviar não reescreve a data
        ...(status === "enviado" && !atual.enviadoEm ? { enviadoEm: em } : {}),
      };
      registros[i] = orcamento;
      await this.escrever(registros);
      return { anterior: atual.status, orcamento };
    });
  }

  excluir(id: string): Promise<boolean> {
    return this.enfileirar(async () => {
      const registros = await this.ler();
      const restantes = registros.filter((o) => o.id !== id);
      if (restantes.length === registros.length) return false;
      await this.escrever(restantes);
      return true;
    });
  }

  /** O que o `ON DELETE CASCADE` da migração 007 faz sozinho no Postgres. */
  removerDoLead(leadId: string): Promise<number> {
    return this.enfileirar(async () => {
      const registros = await this.ler();
      const restantes = registros.filter((o) => o.leadId !== leadId);
      const quantos = registros.length - restantes.length;
      if (quantos === 0) return 0;
      await this.escrever(restantes);
      return quantos;
    });
  }
}
