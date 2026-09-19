/**
 * Adaptador de PRODUÇÃO da porta `LeadStore` (D1: Vercel + Postgres).
 *
 * O domínio não muda: mesma interface do `FileLeadStore`. O que este adaptador
 * resolve e o de arquivo não resolvia:
 * - sobrevive a serverless (o disco da lambda é efêmero);
 * - `email` é UNIQUE no banco, então o upsert é atômico de verdade — o de
 *   arquivo era last-write-wins entre processos.
 *
 * SERVER-ONLY. Os objetos aninhados do domínio viram colunas achatadas.
 */
import { Pool, type PoolClient } from "pg";
import type { LeadStore } from "./leadStore";
import type { Lead, StatusLead } from "../features/lead/lead";

/** Linha da tabela `leads` como o Postgres devolve. */
interface LinhaLead {
  id: string;
  email: string;
  telefone: string;
  creci: string;
  status: string;
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

const COLUNAS = `id, email, telefone, creci, status,
  consentimento_texto, consentimento_aceito_em, consentimento_ip,
  codigo_hash, codigo_expira_em, codigo_tentativas, codigo_enviado_em,
  verificado_em, origem_utm, origem_ref, criado_em, atualizado_em`;

function paraDominio(l: LinhaLead): Lead {
  const origem =
    l.origem_utm || l.origem_ref
      ? { ...(l.origem_utm ? { utm: l.origem_utm } : {}), ...(l.origem_ref ? { ref: l.origem_ref } : {}) }
      : undefined;
  return {
    id: l.id,
    email: l.email,
    telefone: l.telefone,
    creci: l.creci,
    status: l.status as StatusLead,
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
    ...(l.verificado_em ? { verificadoEm: l.verificado_em.toISOString() } : {}),
    ...(origem ? { origem } : {}),
    criadoEm: l.criado_em.toISOString(),
    atualizadoEm: l.atualizado_em.toISOString(),
  };
}

/** Ordem dos valores usada por INSERT e UPDATE. */
function valores(lead: Lead): unknown[] {
  return [
    lead.id,
    lead.email,
    lead.telefone,
    lead.creci,
    lead.status,
    lead.consentimento.texto,
    lead.consentimento.aceitoEm,
    lead.consentimento.ip,
    lead.codigo.hash,
    lead.codigo.expiraEm,
    lead.codigo.tentativas,
    lead.codigo.enviadoEm,
    lead.verificadoEm ?? null,
    lead.origem?.utm ?? null,
    lead.origem?.ref ?? null,
    lead.criadoEm,
    lead.atualizadoEm,
  ];
}

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

  async criar(lead: Lead): Promise<Lead> {
    const marcadores = valores(lead).map((_, i) => `$${i + 1}`).join(", ");
    try {
      await this.consultar(`INSERT INTO leads (${COLUNAS}) VALUES (${marcadores})`, valores(lead));
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
    const linhas = await this.consultar<LinhaLead>(
      `SELECT ${COLUNAS} FROM leads WHERE email = $1 LIMIT 1`,
      [email],
    );
    return linhas[0] ? paraDominio(linhas[0]) : null;
  }

  async atualizar(lead: Lead): Promise<Lead> {
    const campos = COLUNAS.split(",").map((c) => c.trim());
    const atribuicoes = campos
      .slice(1) // o id não é atualizado; ele é a chave
      .map((c, i) => `${c} = $${i + 2}`)
      .join(", ");
    const vals = valores(lead);
    const linhas = await this.consultar<{ id: string }>(
      `UPDATE leads SET ${atribuicoes} WHERE id = $1 RETURNING id`,
      [vals[0], ...vals.slice(1)],
    );
    if (linhas.length === 0) throw new Error("lead não encontrado para atualizar");
    return lead;
  }

  async listar(): Promise<Lead[]> {
    const linhas = await this.consultar<LinhaLead>(
      `SELECT ${COLUNAS} FROM leads ORDER BY criado_em DESC`,
    );
    return linhas.map(paraDominio);
  }

  async excluir(id: string): Promise<boolean> {
    const linhas = await this.consultar<{ id: string }>(
      `DELETE FROM leads WHERE id = $1 RETURNING id`,
      [id],
    );
    return linhas.length > 0;
  }
}
