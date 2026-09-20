/**
 * Adaptador de PRODUÇÃO da porta `AvaliacaoStore` (Vercel + Postgres).
 *
 * O domínio não muda: mesma interface do `FileAvaliacaoStore`. O que este
 * adaptador resolve e o de arquivo não resolvia: sobrevive a serverless (o
 * disco da lambda é efêmero) e o upsert por `lead_id` é atômico de verdade
 * (índice único da migração 006) — duas abas avaliando ao mesmo tempo não
 * criam duas avaliações.
 *
 * Migração 006 pendente → `db:42P01` no log da rota, e só a avaliação falha.
 *
 * SERVER-ONLY.
 */
import { randomUUID } from "crypto";
import type { Pool, PoolClient } from "pg";
import type { Avaliacao, StatusAvaliacao } from "../features/avaliacao/avaliacao";
import { normalizarIdentificacao, normalizarStatusAvaliacao } from "../features/avaliacao/avaliacao";
import type { AvaliacaoStore, ContagemAvaliacoes, DadosAvaliacao, TrocaStatus } from "./avaliacaoStorePorta";

/** Linha do `SELECT *` da tabela `avaliacoes`. */
export interface LinhaAvaliacao {
  id: string;
  lead_id: string;
  estrelas: number;
  comentario: string | null;
  identificacao: string;
  status: string;
  consentimento_texto: string;
  consentimento_em: Date | string;
  consentimento_ip: string;
  criado_em: Date | string;
  atualizado_em: Date | string;
}

const COLUNAS = [
  "id",
  "lead_id",
  "estrelas",
  "comentario",
  "identificacao",
  "status",
  "consentimento_texto",
  "consentimento_em",
  "consentimento_ip",
  "criado_em",
  "atualizado_em",
] as const;

/** TIMESTAMPTZ volta como `Date`; texto já ISO passa direto. */
function iso(valor: Date | string): string {
  return valor instanceof Date ? valor.toISOString() : String(valor);
}

export function paraDominio(l: LinhaAvaliacao): Avaliacao {
  return {
    id: l.id,
    leadId: l.lead_id,
    estrelas: Number(l.estrelas),
    ...(l.comentario ? { comentario: l.comentario } : {}),
    identificacao: normalizarIdentificacao(l.identificacao),
    status: normalizarStatusAvaliacao(l.status),
    consentimento: { texto: l.consentimento_texto, em: iso(l.consentimento_em), ip: l.consentimento_ip },
    criadoEm: iso(l.criado_em),
    atualizadoEm: iso(l.atualizado_em),
  };
}

/** Colunas que a edição sobrescreve — `id`, `lead_id` e `criado_em` ficam como estavam. */
const ATUALIZAVEIS = COLUNAS.filter((c) => c !== "id" && c !== "lead_id" && c !== "criado_em");

export class PostgresAvaliacaoStore implements AvaliacaoStore {
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

  private async listar(sql: string, params: unknown[] = []): Promise<Avaliacao[]> {
    return (await this.consultar<LinhaAvaliacao>(sql, params)).map(paraDominio);
  }

  /** Upsert atômico pelo índice único de `lead_id` (nunca duas avaliações do mesmo lead). */
  async salvar(leadId: string, dados: DadosAvaliacao): Promise<Avaliacao> {
    const valores = [
      randomUUID(),
      leadId,
      dados.estrelas,
      dados.comentario ?? null,
      dados.identificacao,
      dados.status,
      dados.consentimento.texto,
      dados.consentimento.em,
      dados.consentimento.ip,
      dados.em, // criado_em (só vale na inserção)
      dados.em, // atualizado_em
    ];
    const marcadores = valores.map((_, i) => `$${i + 1}`).join(", ");
    const set = ATUALIZAVEIS.map((c) => `${c} = EXCLUDED.${c}`).join(", ");
    const linhas = await this.consultar<LinhaAvaliacao>(
      `INSERT INTO avaliacoes (${COLUNAS.join(", ")}) VALUES (${marcadores}) ` +
        `ON CONFLICT (lead_id) DO UPDATE SET ${set} RETURNING *`,
      valores,
    );
    return paraDominio(linhas[0]!);
  }

  async doLead(leadId: string): Promise<Avaliacao | null> {
    const linhas = await this.listar(`SELECT * FROM avaliacoes WHERE lead_id = $1 LIMIT 1`, [leadId]);
    return linhas[0] ?? null;
  }

  listarPublicadas(limite: number): Promise<Avaliacao[]> {
    return this.listar(
      `SELECT * FROM avaliacoes WHERE status = 'publicado' AND comentario IS NOT NULL AND btrim(comentario) <> '' ` +
        `ORDER BY criado_em DESC LIMIT $1`,
      [Math.max(0, limite)],
    );
  }

  listarTodas(): Promise<Avaliacao[]> {
    return this.listar(`SELECT * FROM avaliacoes ORDER BY criado_em DESC`);
  }

  /**
   * Redundante em produção (o `ON DELETE CASCADE` da 006 já apagou a linha
   * quando o lead saiu), e é exatamente por isso que não pode falhar: apagar
   * "de novo" não acha nada e devolve `false`.
   */
  async removerDoLead(leadId: string): Promise<boolean> {
    const linhas = await this.consultar<{ id: string }>(
      `DELETE FROM avaliacoes WHERE lead_id = $1 RETURNING id`,
      [leadId],
    );
    return linhas.length > 0;
  }

  /**
   * A CTE lê a situação ANTES do UPDATE (o `WITH` enxerga o retrato do início
   * da instrução), então a auditoria registra "de → para" numa consulta só.
   */
  async trocarStatus(id: string, status: StatusAvaliacao, em: string): Promise<TrocaStatus | null> {
    const linhas = await this.consultar<LinhaAvaliacao & { status_anterior: string }>(
      `WITH antiga AS (SELECT id, status FROM avaliacoes WHERE id = $1) ` +
        `UPDATE avaliacoes AS a SET status = $2, atualizado_em = $3 FROM antiga ` +
        `WHERE a.id = antiga.id RETURNING antiga.status AS status_anterior, a.*`,
      [id, status, em],
    );
    const linha = linhas[0];
    if (!linha) return null;
    return { anterior: normalizarStatusAvaliacao(linha.status_anterior), avaliacao: paraDominio(linha) };
  }

  /** Conta TODAS (inclusive `pendente` e `recusado`): o que sai do ar é o texto, não a nota. */
  async resumoContagem(): Promise<ContagemAvaliacoes> {
    const linhas = await this.consultar<{ soma: number; quantas: number }>(
      `SELECT COALESCE(SUM(estrelas), 0)::int AS soma, COUNT(*)::int AS quantas FROM avaliacoes`,
    );
    return { soma: Number(linhas[0]?.soma ?? 0), quantas: Number(linhas[0]?.quantas ?? 0) };
  }
}
