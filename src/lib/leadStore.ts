/**
 * Porta de persistência de leads (fronteira de fornecedor — ADR U3).
 * Dev: FileLeadStore (JSON em data/leads.json). Produção: PostgresLeadStore
 * (mesma interface — o domínio não muda).
 *
 * Toda escrita é DIRECIONADA (O7·S1, O8): cada fluxo grava só as colunas que
 * são dele — o pedido de acesso o contato, a verificação o código, o admin o
 * funil. Regravar a linha inteira desfaria o que o outro fluxo gravou no meio.
 *
 * SERVER-ONLY (usa fs/crypto). Nunca importar em componente de cliente.
 */
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import type { CodigoVerificacao, Consentimento, Lead } from "../features/lead/lead";
import { normalizarCanal, normalizarStatus, type NotaLead, type StatusLead } from "../features/lead/funil";

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

/** O que a verificação do código muda: o código e, no sucesso, o carimbo. Nunca a etapa. */
export interface AtualizacaoCodigo {
  codigo: CodigoVerificacao;
  /** Carimbo da verificação. Se já havia um, fica o original (nunca re-carimba). */
  verificadoEm?: string;
  atualizadoEm: string;
}

/** O que o admin muda no funil (O8). Só os campos presentes são gravados; `null` limpa. */
export interface AtualizacaoFunil {
  status?: StatusLead;
  retomarEm?: string | null;
  motivo?: string | null;
  proximaAcaoEm?: string | null;
  proximaAcao?: string | null;
  atualizadoEm: string;
}

export interface LeadStore {
  /** Lead com e-mail repetido → erro "já existe lead com este e-mail". */
  criar(lead: Lead): Promise<Lead>;
  buscarPorEmail(email: string): Promise<Lead | null>;
  buscarPorId(id: string): Promise<Lead | null>;
  /**
   * Grava SÓ contato, consentimento e (se vier) o código — nunca etapa,
   * `verificadoEm` nem `criadoEm`. O pedido de acesso lê o lead, espera o
   * e-mail (segundos) e só então grava.
   */
  atualizarContato(id: string, dados: AtualizacaoContato): Promise<void>;
  /** Grava SÓ o código e o carimbo da verificação. Lead que sumiu → erro. */
  atualizarCodigo(id: string, dados: AtualizacaoCodigo): Promise<void>;
  /** Grava SÓ as colunas do funil. Devolve o lead atualizado, ou `null` se o id não existe. */
  atualizarFunil(id: string, dados: AtualizacaoFunil): Promise<Lead | null>;
  listar(): Promise<Lead[]>;
  /** Anotações do lead, da mais recente para a mais antiga. */
  listarNotas(leadId: string): Promise<NotaLead[]>;
  /** `null` se o lead não existe (nota solta nunca é gravada). */
  adicionarNota(leadId: string, texto: string, em: string): Promise<NotaLead | null>;
  /**
   * Apaga o lead de vez, COM as anotações (LGPD art. 18 — direito à eliminação).
   * Devolve `false` se não existia: pedir duas vezes não pode virar erro.
   */
  excluir(id: string): Promise<boolean>;
}

const CAMINHO_PADRAO = path.join(process.cwd(), "data", "leads.json");

/** No arquivo, as anotações moram dentro do próprio lead: excluí-lo leva todas junto. */
type Registro = Lead & { notas?: NotaLead[] };

/** Linha do arquivo → registro com etapa e canal conhecidos (status antigo nunca quebra). */
function normalizar(r: Registro): Registro {
  return { ...r, status: normalizarStatus(r.status), canal: normalizarCanal(r.canal) };
}

/** O domínio recebe o lead sem as anotações (elas têm método próprio). */
function paraLead(r: Registro): Lead {
  const { notas: _anotacoes, ...lead } = r;
  return lead;
}

function aplicarFunil(atual: Registro, d: AtualizacaoFunil): Registro {
  const novo: Registro = { ...atual, ...(d.status ? { status: d.status } : {}), atualizadoEm: d.atualizadoEm };
  const opcionais = { retomarEm: d.retomarEm, motivo: d.motivo, proximaAcaoEm: d.proximaAcaoEm, proximaAcao: d.proximaAcao };
  for (const [campo, valor] of Object.entries(opcionais) as [keyof typeof opcionais, string | null | undefined][]) {
    if (valor === null) delete novo[campo];
    else if (valor !== undefined) novo[campo] = valor;
  }
  return novo;
}

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

  private async ler(): Promise<Registro[]> {
    try {
      const txt = await fs.readFile(this.arquivo, "utf8");
      const dados: unknown = JSON.parse(txt);
      return Array.isArray(dados) ? (dados as Registro[]).map(normalizar) : [];
    } catch (err) {
      if ((err as NodeJS.ErrnoException)?.code === "ENOENT") return [];
      throw err;
    }
  }

  /** Escrita atômica: grava num tmp e renomeia (rename é atômico no mesmo FS). */
  private async escrever(registros: Registro[]): Promise<void> {
    await fs.mkdir(path.dirname(this.arquivo), { recursive: true });
    const tmp = `${this.arquivo}.${randomUUID()}.tmp`;
    try {
      await fs.writeFile(tmp, JSON.stringify(registros, null, 2), "utf8");
      await fs.rename(tmp, this.arquivo);
    } catch (err) {
      // não deixa tmp órfão com PII se a escrita/rename falhar; propaga o erro
      await fs.rm(tmp, { force: true });
      throw err;
    }
  }

  /** Acha o lead pelo id, aplica `fn` e grava — tudo na mesma vez da fila. `null` se não existe. */
  private alterar(id: string, fn: (atual: Registro) => Registro): Promise<Registro | null> {
    return this.enfileirar(async () => {
      const registros = await this.ler();
      const i = registros.findIndex((r) => r.id === id);
      if (i === -1) return null;
      const novo = fn(registros[i]!);
      registros[i] = novo;
      await this.escrever(registros);
      return novo;
    });
  }

  criar(lead: Lead): Promise<Lead> {
    return this.enfileirar(async () => {
      const registros = await this.ler();
      // lead manual sem e-mail não conflita com ninguém (no Postgres, NULL não fere o UNIQUE)
      if (lead.email && registros.some((r) => r.email === lead.email)) {
        throw new Error("já existe lead com este e-mail");
      }
      registros.push(lead);
      await this.escrever(registros);
      return lead;
    });
  }

  buscarPorEmail(email: string): Promise<Lead | null> {
    return this.enfileirar(async () => {
      const achado = (await this.ler()).find((r) => r.email === email);
      return achado ? paraLead(achado) : null;
    });
  }

  buscarPorId(id: string): Promise<Lead | null> {
    return this.enfileirar(async () => {
      const achado = (await this.ler()).find((r) => r.id === id);
      return achado ? paraLead(achado) : null;
    });
  }

  async atualizarContato(id: string, dados: AtualizacaoContato): Promise<void> {
    const { origem, codigo, ...contato } = dados;
    const r = await this.alterar(id, (atual) => {
      const novo: Registro = { ...atual, ...contato, origem, ...(codigo ? { codigo } : {}) };
      if (!origem) delete novo.origem; // como no Postgres: sem origem, as colunas ficam nulas
      return novo;
    });
    if (!r) throw new Error("lead não encontrado para atualizar");
  }

  async atualizarCodigo(id: string, dados: AtualizacaoCodigo): Promise<void> {
    const r = await this.alterar(id, (atual) => {
      const verificadoEm = atual.verificadoEm ?? dados.verificadoEm; // como o COALESCE do Postgres
      return { ...atual, codigo: dados.codigo, ...(verificadoEm ? { verificadoEm } : {}), atualizadoEm: dados.atualizadoEm };
    });
    if (!r) throw new Error("lead não encontrado para atualizar");
  }

  async atualizarFunil(id: string, dados: AtualizacaoFunil): Promise<Lead | null> {
    const r = await this.alterar(id, (atual) => aplicarFunil(atual, dados));
    return r ? paraLead(r) : null;
  }

  listar(): Promise<Lead[]> {
    return this.enfileirar(async () => (await this.ler()).map(paraLead));
  }

  listarNotas(leadId: string): Promise<NotaLead[]> {
    return this.enfileirar(async () => {
      const notas = (await this.ler()).find((r) => r.id === leadId)?.notas ?? [];
      return [...notas].sort((a, b) => b.em.localeCompare(a.em));
    });
  }

  async adicionarNota(leadId: string, texto: string, em: string): Promise<NotaLead | null> {
    const nota: NotaLead = { id: randomUUID(), texto, em };
    const r = await this.alterar(leadId, (atual) => ({ ...atual, notas: [...(atual.notas ?? []), nota] }));
    return r ? nota : null;
  }

  excluir(id: string): Promise<boolean> {
    return this.enfileirar(async () => {
      const registros = await this.ler();
      const restantes = registros.filter((r) => r.id !== id);
      if (restantes.length === registros.length) return false;
      await this.escrever(restantes); // as anotações saem junto: moram dentro do registro
      return true;
    });
  }
}
