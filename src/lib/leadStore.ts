/**
 * Porta de persistência de leads (fronteira de fornecedor — ADR U3).
 * Hoje: FileLeadStore (JSON em data/leads.json) para dev/O1–O4.
 * Produção (D1 = Vercel/serverless): trocar por PostgresLeadStore na O5,
 * sem mexer no domínio (mesma interface LeadStore).
 *
 * SERVER-ONLY (usa fs/crypto). Nunca importar em componente de cliente.
 */
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import type { CodigoVerificacao, Consentimento, Lead } from "../features/lead/lead";

/** O que um novo pedido de acesso muda num lead que já existe (O7·S1). */
export interface AtualizacaoContato {
  telefone: string;
  creci: string;
  origem?: Lead["origem"];
  consentimento: Consentimento;
  atualizadoEm: string;
  /** Código novo — só quando o e-mail saiu. Ausente: o código gravado fica como está. */
  codigo?: CodigoVerificacao;
}

export interface LeadStore {
  criar(lead: Lead): Promise<Lead>;
  buscarPorEmail(email: string): Promise<Lead | null>;
  atualizar(lead: Lead): Promise<Lead>;
  /**
   * Grava SÓ contato, consentimento e (se vier) o código — nunca status,
   * `verificadoEm` nem `criadoEm`. O pedido de acesso lê o lead, espera o
   * e-mail (segundos) e só então grava: regravar a linha inteira desfaria uma
   * verificação feita nesse meio e ressuscitaria um código já consumido.
   */
  atualizarContato(id: string, dados: AtualizacaoContato): Promise<void>;
  listar(): Promise<Lead[]>;
  /**
   * Apaga o lead de vez (LGPD art. 18 — direito à eliminação).
   * Devolve `false` se não existia: atender duas vezes o mesmo pedido de
   * exclusão não pode virar erro.
   */
  excluir(id: string): Promise<boolean>;
}

const CAMINHO_PADRAO = path.join(process.cwd(), "data", "leads.json");

export class FileLeadStore implements LeadStore {
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

  private async ler(): Promise<Lead[]> {
    try {
      const txt = await fs.readFile(this.arquivo, "utf8");
      const dados: unknown = JSON.parse(txt);
      return Array.isArray(dados) ? (dados as Lead[]) : [];
    } catch (err) {
      if ((err as NodeJS.ErrnoException)?.code === "ENOENT") return [];
      throw err;
    }
  }

  /** Escrita atômica: grava num tmp e renomeia (rename é atômico no mesmo FS). */
  private async escrever(leads: Lead[]): Promise<void> {
    await fs.mkdir(path.dirname(this.arquivo), { recursive: true });
    const tmp = `${this.arquivo}.${randomUUID()}.tmp`;
    try {
      await fs.writeFile(tmp, JSON.stringify(leads, null, 2), "utf8");
      await fs.rename(tmp, this.arquivo);
    } catch (err) {
      // não deixa tmp órfão com PII se a escrita/rename falhar; propaga o erro
      await fs.rm(tmp, { force: true });
      throw err;
    }
  }

  criar(lead: Lead): Promise<Lead> {
    return this.enfileirar(async () => {
      const leads = await this.ler();
      if (leads.some((l) => l.email === lead.email)) {
        throw new Error("já existe lead com este e-mail");
      }
      leads.push(lead);
      await this.escrever(leads);
      return lead;
    });
  }

  buscarPorEmail(email: string): Promise<Lead | null> {
    return this.enfileirar(async () => {
      const leads = await this.ler();
      return leads.find((l) => l.email === email) ?? null;
    });
  }

  atualizar(lead: Lead): Promise<Lead> {
    return this.enfileirar(async () => {
      const leads = await this.ler();
      const i = leads.findIndex((l) => l.id === lead.id);
      if (i === -1) throw new Error("lead não encontrado para atualizar");
      leads[i] = lead;
      await this.escrever(leads);
      return lead;
    });
  }

  atualizarContato(id: string, dados: AtualizacaoContato): Promise<void> {
    return this.enfileirar(async () => {
      const leads = await this.ler();
      const i = leads.findIndex((l) => l.id === id);
      if (i === -1) throw new Error("lead não encontrado para atualizar");
      const { origem, codigo, ...contato } = dados;
      const atualizado: Lead = { ...leads[i]!, ...contato, origem, ...(codigo ? { codigo } : {}) };
      if (!origem) delete atualizado.origem; // como no Postgres: sem origem, as colunas ficam nulas
      leads[i] = atualizado;
      await this.escrever(leads);
    });
  }

  listar(): Promise<Lead[]> {
    return this.enfileirar(() => this.ler());
  }

  excluir(id: string): Promise<boolean> {
    return this.enfileirar(async () => {
      const leads = await this.ler();
      const restantes = leads.filter((l) => l.id !== id);
      if (restantes.length === leads.length) return false;
      await this.escrever(restantes);
      return true;
    });
  }
}
