/**
 * Adaptador de PRODUÇÃO da porta `OrcamentoStore` (Vercel + Postgres).
 *
 * O domínio não muda: mesma interface do `FileOrcamentoStore`. O que este
 * adaptador resolve e o de arquivo não resolvia: sobrevive a serverless (o
 * disco da lambda é efêmero) e a NUMERAÇÃO é atômica de verdade — o próximo
 * `ORC-AAAA-NNN` sai dentro do próprio INSERT, e o índice único da migração
 * 007 recusa qualquer repetido; nesse caso a gravação tenta de novo.
 *
 * Migração 007 pendente → `db:42P01` no log da rota, e só o orçamento falha.
 *
 * SERVER-ONLY.
 */
import { randomUUID } from "crypto";
import type { Pool, PoolClient } from "pg";
import type { Orcamento, StatusOrcamento } from "../features/orcamento/orcamento";
import { PREFIXO_NUMERO, normalizarPublico, normalizarStatusOrcamento } from "../features/orcamento/orcamento";
import type { CondicoesOrcamento, ItemOrcamento, TotaisOrcamento } from "../features/orcamento/orcamento";
import type { DadosOrcamento, OrcamentoStore, TrocaStatusOrcamento } from "./orcamentoStorePorta";

/** Linha do `SELECT *` da tabela `orcamentos`. */
export interface LinhaOrcamento {
  id: string;
  numero: string;
  lead_id: string;
  publico: string;
  status: string;
  itens: ItemOrcamento[];
  totais: TotaisOrcamento;
  condicoes: CondicoesOrcamento;
  validade_em: Date | string;
  observacao: string | null;
  criado_em: Date | string;
  atualizado_em: Date | string;
  enviado_em: Date | string | null;
}

/** TIMESTAMPTZ volta como `Date`; texto já ISO passa direto. */
function iso(valor: Date | string): string {
  return valor instanceof Date ? valor.toISOString() : String(valor);
}

/**
 * DATE volta como `Date` na meia-noite LOCAL do processo. Montar o dia pelas
 * partes locais devolve exatamente o que foi gravado; `toISOString()` trocaria
 * o dia em qualquer fuso a leste de Greenwich.
 */
export function diaDaColuna(valor: Date | string): string {
  if (!(valor instanceof Date)) return String(valor).slice(0, 10);
  const mes = String(valor.getMonth() + 1).padStart(2, "0");
  const dia = String(valor.getDate()).padStart(2, "0");
  return `${valor.getFullYear()}-${mes}-${dia}`;
}

export function paraDominio(l: LinhaOrcamento): Orcamento {
  return {
    id: l.id,
    numero: l.numero,
    leadId: l.lead_id,
    publico: normalizarPublico(l.publico),
    status: normalizarStatusOrcamento(l.status),
    itens: l.itens,
    totais: l.totais,
    condicoes: l.condicoes,
    validadeEm: diaDaColuna(l.validade_em),
    ...(l.observacao ? { observacao: l.observacao } : {}),
    criadoEm: iso(l.criado_em),
    atualizadoEm: iso(l.atualizado_em),
    ...(l.enviado_em ? { enviadoEm: iso(l.enviado_em) } : {}),
  };
}

/** Quantas vezes insistir quando outra gravação levou o número no meio do caminho. */
const TENTATIVAS_DE_NUMERO = 5;
const NUMERO_REPETIDO = "23505"; // unique_violation

export class PostgresOrcamentoStore implements OrcamentoStore {
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

  private async listarPor(sql: string, params: unknown[] = []): Promise<Orcamento[]> {
    return (await this.consultar<LinhaOrcamento>(sql, params)).map(paraDominio);
  }

  /**
   * O número sai do próprio INSERT: `MAX` dos números do ano + 1, numa
   * instrução só. Duas gravações simultâneas podem ler o mesmo máximo, e aí o
   * índice único derruba a segunda (`23505`) — que tenta de novo e pega o
   * número seguinte, em vez de gravar um repetido.
   */
  async criar(dados: DadosOrcamento): Promise<Orcamento> {
    const valores = [
      dados.leadId,
      dados.publico,
      dados.status,
      JSON.stringify(dados.itens),
      JSON.stringify(dados.totais),
      JSON.stringify(dados.condicoes),
      dados.validadeEm,
      dados.observacao ?? null,
      dados.em,
      dados.status === "enviado" ? dados.em : null,
    ];
    const sql =
      `INSERT INTO orcamentos (id, numero, lead_id, publico, status, itens, totais, condicoes, ` +
      `validade_em, observacao, criado_em, atualizado_em, enviado_em) ` +
      `SELECT $12, $11 || lpad((COALESCE(MAX(substring(numero from '[0-9]+$')::int), 0) + 1)::text, 3, '0'), ` +
      `$1, $2, $3, $4::jsonb, $5::jsonb, $6::jsonb, $7::date, $8, $9::timestamptz, $9::timestamptz, $10::timestamptz ` +
      `FROM orcamentos WHERE numero LIKE $11 || '%' RETURNING *`;

    const prefixo = `${PREFIXO_NUMERO}-${dados.ano}-`;
    let ultima: unknown;
    for (let tentativa = 0; tentativa < TENTATIVAS_DE_NUMERO; tentativa++) {
      try {
        const linhas = await this.consultar<LinhaOrcamento>(sql, [...valores, prefixo, randomUUID()]);
        return paraDominio(linhas[0]!);
      } catch (err) {
        if ((err as { code?: string })?.code !== NUMERO_REPETIDO) throw err;
        ultima = err; // outra gravação levou o número: tenta o seguinte
      }
    }
    throw ultima;
  }

  listar(): Promise<Orcamento[]> {
    return this.listarPor(`SELECT * FROM orcamentos ORDER BY criado_em DESC`);
  }

  doLead(leadId: string): Promise<Orcamento[]> {
    return this.listarPor(`SELECT * FROM orcamentos WHERE lead_id = $1 ORDER BY criado_em DESC`, [leadId]);
  }

  async buscarPorId(id: string): Promise<Orcamento | null> {
    const linhas = await this.listarPor(`SELECT * FROM orcamentos WHERE id = $1 LIMIT 1`, [id]);
    return linhas[0] ?? null;
  }

  /**
   * A CTE lê a situação ANTES do UPDATE (o `WITH` enxerga o retrato do início
   * da instrução), então a auditoria registra "de → para" numa consulta só.
   * `enviado_em` só é preenchido na 1ª ida para "enviado" (COALESCE).
   */
  async trocarStatus(id: string, status: StatusOrcamento, em: string): Promise<TrocaStatusOrcamento | null> {
    const linhas = await this.consultar<LinhaOrcamento & { status_anterior: string }>(
      `WITH antigo AS (SELECT id, status FROM orcamentos WHERE id = $1) ` +
        `UPDATE orcamentos AS o SET status = $2, atualizado_em = $3, ` +
        `enviado_em = CASE WHEN $2 = 'enviado' THEN COALESCE(o.enviado_em, $3::timestamptz) ELSE o.enviado_em END ` +
        `FROM antigo WHERE o.id = antigo.id RETURNING antigo.status AS status_anterior, o.*`,
      [id, status, em],
    );
    const linha = linhas[0];
    if (!linha) return null;
    return { anterior: normalizarStatusOrcamento(linha.status_anterior), orcamento: paraDominio(linha) };
  }

  async excluir(id: string): Promise<boolean> {
    const linhas = await this.consultar<{ id: string }>(`DELETE FROM orcamentos WHERE id = $1 RETURNING id`, [id]);
    return linhas.length > 0;
  }

  /**
   * Redundante em produção (o `ON DELETE CASCADE` da 007 já apagou as linhas
   * quando o lead saiu), e é por isso que não pode falhar: apagar "de novo"
   * não acha nada e devolve 0.
   */
  async removerDoLead(leadId: string): Promise<number> {
    const linhas = await this.consultar<{ id: string }>(
      `DELETE FROM orcamentos WHERE lead_id = $1 RETURNING id`,
      [leadId],
    );
    return linhas.length;
  }
}
