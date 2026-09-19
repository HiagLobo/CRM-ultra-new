/**
 * Adaptador de DEV da porta `LeadStore` (JSON em `data/leads.json`). A porta —
 * interface e tipos das escritas direcionadas — mora em `leadStorePorta.ts` e
 * é re-exportada daqui (quem importava de `leadStore` segue igual).
 * Produção: `PostgresLeadStore` (mesma interface — o domínio não muda).
 *
 * SERVER-ONLY (usa fs/crypto). Nunca importar em componente de cliente.
 */
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import type { Lead } from "../features/lead/lead";
import { normalizarCanal, normalizarStatus, type NotaLead } from "../features/lead/funil";
import { normalizarConferencia } from "../features/lead/creci";
import type { AtualizacaoCodigo, AtualizacaoContato, AtualizacaoFunil, LeadStore } from "./leadStorePorta";

export type { AtualizacaoCodigo, AtualizacaoContato, AtualizacaoFunil, LeadStore } from "./leadStorePorta";

const CAMINHO_PADRAO = path.join(process.cwd(), "data", "leads.json");

/** No arquivo, as anotações moram dentro do próprio lead: excluí-lo leva todas junto. */
type Registro = Lead & { notas?: NotaLead[] };

/** Linha do arquivo → registro com etapa, canal e conferência conhecidos (valor antigo nunca quebra). */
function normalizar(r: Registro): Registro {
  const novo: Registro = { ...r, status: normalizarStatus(r.status), canal: normalizarCanal(r.canal) };
  const conferencia = normalizarConferencia(r.creciConferencia);
  if (conferencia) novo.creciConferencia = conferencia;
  else delete novo.creciConferencia;
  return novo;
}

/** O domínio recebe o lead sem as anotações (elas têm método próprio). */
function paraLead(r: Registro): Lead {
  const { notas: _anotacoes, ...lead } = r;
  return lead;
}

/** Mais antigo primeiro (`criadoEm` ISO ordena como texto). */
const porIdade = (a: Lead, b: Lead) => a.criadoEm.localeCompare(b.criadoEm);

function aplicarFunil(atual: Registro, d: AtualizacaoFunil): Registro {
  const novo: Registro = { ...atual, ...(d.status ? { status: d.status } : {}), atualizadoEm: d.atualizadoEm };
  const opcionais = {
    retomarEm: d.retomarEm,
    motivo: d.motivo,
    proximaAcaoEm: d.proximaAcaoEm,
    proximaAcao: d.proximaAcao,
    creciConferidoEm: d.creciConferidoEm,
  };
  for (const [campo, valor] of Object.entries(opcionais) as [keyof typeof opcionais, string | null | undefined][]) {
    if (valor === null) delete novo[campo];
    else if (valor !== undefined) novo[campo] = valor;
  }
  if (d.creciConferencia === null) delete novo.creciConferencia;
  else if (d.creciConferencia !== undefined) novo.creciConferencia = d.creciConferencia;
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

  /** Com e-mail primeiro, depois o mais antigo — a mesma ordem do Postgres. */
  buscarPorTelefone(telefone: string): Promise<Lead | null> {
    return this.enfileirar(async () => {
      const achados = (await this.ler()).filter((r) => r.telefone === telefone);
      achados.sort((a, b) => Number(!a.email) - Number(!b.email) || porIdade(a, b));
      return achados[0] ? paraLead(achados[0]) : null;
    });
  }

  buscarPorCreci(formas: readonly string[]): Promise<Lead | null> {
    return this.enfileirar(async () => {
      const achados = (await this.ler()).filter((r) => r.creci !== "" && formas.includes(r.creci)).sort(porIdade);
      return achados[0] ? paraLead(achados[0]) : null;
    });
  }

  async atualizarContato(id: string, dados: AtualizacaoContato): Promise<void> {
    const { nome, telefone, creci, limparConferencia, consentimento, atualizadoEm } = dados;
    const r = await this.alterar(id, (atual) => {
      const novo: Registro = {
        ...atual,
        ...(nome !== undefined ? { nome } : {}),
        ...(telefone !== undefined ? { telefone } : {}),
        ...(creci !== undefined ? { creci } : {}),
        consentimento,
        atualizadoEm,
      };
      if (limparConferencia) {
        delete novo.creciConferencia;
        delete novo.creciConferidoEm;
      }
      return novo;
    });
    if (!r) throw new Error("lead não encontrado para atualizar");
  }

  /** Lead que sumiu: não é erro — o acesso já foi liberado, só não há onde carimbar. */
  async registrarAcesso(id: string, em: string): Promise<void> {
    await this.alterar(id, (atual) => ({ ...atual, ultimoAcessoEm: em }));
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
