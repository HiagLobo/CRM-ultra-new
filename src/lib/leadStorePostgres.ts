/**
 * Adaptador de PRODUÇÃO da porta `LeadStore` (D1: Vercel + Postgres).
 *
 * O domínio não muda: mesma interface do `FileLeadStore`. O que este adaptador
 * resolve e o de arquivo não resolvia:
 * - sobrevive a serverless (o disco da lambda é efêmero);
 * - `email` é UNIQUE no banco, então o upsert é atômico de verdade.
 *
 * Leitura com `SELECT *` e gravação das colunas da O8 só quando têm valor, de
 * propósito: se o deploy sair ANTES da migração 004, o fluxo público (pedir
 * acesso, verificar) segue gravando; só o funil do admin falha, com a causa no
 * log (`db:42703` coluna, `db:42P01` tabela). Status antigo lido vira etapa nova.
 *
 * SERVER-ONLY. Os objetos aninhados do domínio viram colunas achatadas.
 */
import { randomUUID } from "crypto";
import type { Pool, PoolClient } from "pg";
import type { AtualizacaoCodigo, AtualizacaoContato, AtualizacaoFunil, LeadStore } from "./leadStore";
import type { Lead } from "../features/lead/lead";
import { normalizarCanal, normalizarStatus, type NotaLead } from "../features/lead/funil";

/** Linha da tabela `leads` como o Postgres devolve. As colunas da O8 podem faltar (migração pendente). */
interface LinhaLead {
  id: string;
  email: string | null;
  telefone: string;
  creci: string;
  status: string;
  nome?: string | null;
  canal?: string | null;
  retomar_em?: Date | string | null;
  motivo?: string | null;
  proxima_acao_em?: Date | string | null;
  proxima_acao?: string | null;
  consentimento_texto: string;
  consentimento_aceito_em: Date;
  consentimento_ip: string;
  codigo_hash: string;
  codigo_expira_em: Date;
  codigo_tentativas: number;
  codigo_enviado_em: Date;
  verificado_em: Date | null;
  origem_utm: string | null;
  origem_ref: string | null;
  criado_em: Date;
  atualizado_em: Date;
}

type Coluna = [nome: string, valor: unknown];

const dois = (n: number) => String(n).padStart(2, "0");

/**
 * Coluna DATE → `AAAA-MM-DD`. O `pg` entrega DATE como `Date` à meia-noite do
 * fuso LOCAL do processo — por isso as partes locais (as UTC trocariam o dia).
 */
export function diaDoBanco(valor: Date | string | null | undefined): string | undefined {
  if (valor instanceof Date) {
    if (Number.isNaN(valor.getTime())) return undefined;
    return `${valor.getFullYear()}-${dois(valor.getMonth() + 1)}-${dois(valor.getDate())}`;
  }
  return typeof valor === "string" && /^\d{4}-\d{2}-\d{2}/.test(valor) ? valor.slice(0, 10) : undefined;
}

/** Só as chaves com valor — o lead do domínio não carrega `campo: undefined`. */
function definidos<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined && v !== null)) as Partial<T>;
}

function paraDominio(l: LinhaLead): Lead {
  const origem = definidos({ utm: l.origem_utm ?? undefined, ref: l.origem_ref ?? undefined });
  return {
    id: l.id,
    telefone: l.telefone,
    creci: l.creci,
    status: normalizarStatus(l.status),
    canal: normalizarCanal(l.canal),
    ...definidos({
      email: l.email ?? undefined,
      nome: l.nome ?? undefined,
      retomarEm: diaDoBanco(l.retomar_em),
      motivo: l.motivo ?? undefined,
      proximaAcaoEm: diaDoBanco(l.proxima_acao_em),
      proximaAcao: l.proxima_acao ?? undefined,
      verificadoEm: l.verificado_em?.toISOString(),
    }),
    consentimento: {
      texto: l.consentimento_texto,
      aceitoEm: l.consentimento_aceito_em.toISOString(),
      ip: l.consentimento_ip,
    },
    codigo: {
      hash: l.codigo_hash,
      expiraEm: l.codigo_expira_em.toISOString(),
      tentativas: l.codigo_tentativas,
      enviadoEm: l.codigo_enviado_em.toISOString(),
    },
    ...(origem.utm || origem.ref ? { origem } : {}),
    criadoEm: l.criado_em.toISOString(),
    atualizadoEm: l.atualizado_em.toISOString(),
  };
}

/** Colunas do INSERT. As da O8 entram só com valor: o padrão do banco (`canal = 'site'`) cobre o resto. */
function colunasDoInsert(lead: Lead): Coluna[] {
  const base: Coluna[] = [
    ["id", lead.id],
    ["email", lead.email ?? null],
    ["telefone", lead.telefone],
    ["creci", lead.creci],
    ["status", lead.status],
    ["consentimento_texto", lead.consentimento.texto],
    ["consentimento_aceito_em", lead.consentimento.aceitoEm],
    ["consentimento_ip", lead.consentimento.ip],
    ...colunasDoCodigo(lead.codigo),
    ["verificado_em", lead.verificadoEm ?? null],
    ["origem_utm", lead.origem?.utm ?? null],
    ["origem_ref", lead.origem?.ref ?? null],
    ["criado_em", lead.criadoEm],
    ["atualizado_em", lead.atualizadoEm],
  ];
  const daO8: Coluna[] = [
    ["nome", lead.nome],
    ["canal", lead.canal === "site" ? undefined : lead.canal],
    ["retomar_em", lead.retomarEm],
    ["motivo", lead.motivo],
    ["proxima_acao_em", lead.proximaAcaoEm],
    ["proxima_acao", lead.proximaAcao],
  ];
  return [...base, ...daO8.filter(([, v]) => v !== undefined)];
}

function colunasDoCodigo(codigo: AtualizacaoCodigo["codigo"]): Coluna[] {
  return [
    ["codigo_hash", codigo.hash],
    ["codigo_expira_em", codigo.expiraEm],
    ["codigo_tentativas", codigo.tentativas],
    ["codigo_enviado_em", codigo.enviadoEm],
  ];
}

/** Campo do funil no domínio → coluna. */
const COLUNAS_FUNIL = {
  status: "status",
  retomarEm: "retomar_em",
  motivo: "motivo",
  proximaAcaoEm: "proxima_acao_em",
  proximaAcao: "proxima_acao",
} as const;

export class PostgresLeadStore implements LeadStore {
  constructor(private readonly pool: Pool) {}

  private async consultar<T>(sql: string, params: unknown[] = []): Promise<T[]> {
    const cliente: PoolClient = await this.pool.connect();
    try {
      const { rows } = await cliente.query(sql, params);
      return rows as T[];
    } finally {
      cliente.release();
    }
  }

  /** `UPDATE leads SET <só as colunas dadas> WHERE id = $1 RETURNING <retorno>`. */
  private atualizarColunas<T>(id: string, colunas: Coluna[], retorno = "id"): Promise<T[]> {
    const atribuicoes = colunas.map(([c], i) => `${c} = $${i + 2}`).join(", ");
    const valores = colunas.map(([, v]) => v);
    return this.consultar<T>(`UPDATE leads SET ${atribuicoes} WHERE id = $1 RETURNING ${retorno}`, [id, ...valores]);
  }

  async criar(lead: Lead): Promise<Lead> {
    const colunas = colunasDoInsert(lead);
    const nomes = colunas.map(([c]) => c).join(", ");
    const marcadores = colunas.map((_, i) => `$${i + 1}`).join(", ");
    try {
      await this.consultar(`INSERT INTO leads (${nomes}) VALUES (${marcadores})`, colunas.map(([, v]) => v));
    } catch (err) {
      // violação de unique (email) → mesma mensagem do FileLeadStore, para o
      // domínio tratar a corrida do mesmo jeito nos dois adaptadores
      if ((err as { code?: string })?.code === "23505") {
        throw new Error("já existe lead com este e-mail");
      }
      throw err;
    }
    return lead;
  }

  async buscarPorEmail(email: string): Promise<Lead | null> {
    const linhas = await this.consultar<LinhaLead>(`SELECT * FROM leads WHERE email = $1 LIMIT 1`, [email]);
    return linhas[0] ? paraDominio(linhas[0]) : null;
  }

  async buscarPorId(id: string): Promise<Lead | null> {
    const linhas = await this.consultar<LinhaLead>(`SELECT * FROM leads WHERE id = $1 LIMIT 1`, [id]);
    return linhas[0] ? paraDominio(linhas[0]) : null;
  }

  /**
   * UPDATE só das colunas de contato/consentimento (e do código, se vier):
   * `status`, `verificado_em` e `criado_em` nem aparecem no SQL, então uma
   * verificação que aconteceu durante o envio do e-mail não é desfeita.
   */
  async atualizarContato(id: string, dados: AtualizacaoContato): Promise<void> {
    const colunas: Coluna[] = [
      ["telefone", dados.telefone],
      ["creci", dados.creci],
      ["origem_utm", dados.origem?.utm ?? null],
      ["origem_ref", dados.origem?.ref ?? null],
      ["consentimento_texto", dados.consentimento.texto],
      ["consentimento_aceito_em", dados.consentimento.aceitoEm],
      ["consentimento_ip", dados.consentimento.ip],
      ["atualizado_em", dados.atualizadoEm],
    ];
    if (dados.codigo) colunas.push(...colunasDoCodigo(dados.codigo));
    const linhas = await this.atualizarColunas(id, colunas);
    if (linhas.length === 0) throw new Error("lead não encontrado para atualizar");
  }

  /**
   * Código + carimbo, e nada mais — a etapa nem aparece no SQL. O `COALESCE`
   * mantém o `verificado_em` original de quem já tinha (nunca re-carimba).
   */
  async atualizarCodigo(id: string, dados: AtualizacaoCodigo): Promise<void> {
    const { hash, expiraEm, tentativas, enviadoEm } = dados.codigo;
    const linhas = await this.consultar<{ id: string }>(
      `UPDATE leads SET codigo_hash = $2, codigo_expira_em = $3, codigo_tentativas = $4, codigo_enviado_em = $5, ` +
        `verificado_em = COALESCE(verificado_em, $6), atualizado_em = $7 WHERE id = $1 RETURNING id`,
      [id, hash, expiraEm, tentativas, enviadoEm, dados.verificadoEm ?? null, dados.atualizadoEm],
    );
    if (linhas.length === 0) throw new Error("lead não encontrado para atualizar");
  }

  /** Só as colunas do funil que vieram (+ `atualizado_em`) — contato, código e carimbo nem aparecem. */
  async atualizarFunil(id: string, dados: AtualizacaoFunil): Promise<Lead | null> {
    const colunas: Coluna[] = [];
    for (const [campo, coluna] of Object.entries(COLUNAS_FUNIL) as [keyof typeof COLUNAS_FUNIL, string][]) {
      if (dados[campo] !== undefined) colunas.push([coluna, dados[campo]]);
    }
    colunas.push(["atualizado_em", dados.atualizadoEm]);
    const linhas = await this.atualizarColunas<LinhaLead>(id, colunas, "*");
    return linhas[0] ? paraDominio(linhas[0]) : null;
  }

  async listar(): Promise<Lead[]> {
    const linhas = await this.consultar<LinhaLead>(`SELECT * FROM leads ORDER BY criado_em DESC`);
    return linhas.map(paraDominio);
  }

  async listarNotas(leadId: string): Promise<NotaLead[]> {
    const linhas = await this.consultar<{ id: string; texto: string; em: Date }>(
      `SELECT id, texto, em FROM lead_notas WHERE lead_id = $1 ORDER BY em DESC, id DESC`,
      [leadId],
    );
    return linhas.map((n) => ({ id: n.id, texto: n.texto, em: n.em.toISOString() }));
  }

  async adicionarNota(leadId: string, texto: string, em: string): Promise<NotaLead | null> {
    const nota: NotaLead = { id: randomUUID(), texto, em };
    const sql = `INSERT INTO lead_notas (id, lead_id, texto, em) VALUES ($1, $2, $3, $4)`;
    try {
      await this.consultar(sql, [nota.id, leadId, texto, em]);
    } catch (err) {
      // 23503 = a chave estrangeira recusou: o lead não existe (ou foi excluído nesse meio)
      if ((err as { code?: string })?.code === "23503") return null;
      throw err;
    }
    return nota;
  }

  /** As anotações saem junto pelo `ON DELETE CASCADE` da `lead_notas` (migração 004). */
  async excluir(id: string): Promise<boolean> {
    const linhas = await this.consultar<{ id: string }>(`DELETE FROM leads WHERE id = $1 RETURNING id`, [id]);
    return linhas.length > 0;
  }
}
