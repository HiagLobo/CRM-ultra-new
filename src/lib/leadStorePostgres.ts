/**
 * Adaptador de PRODUÇÃO da porta `LeadStore` (D1: Vercel + Postgres).
 *
 * O domínio não muda: mesma interface do `FileLeadStore`. O que este adaptador
 * resolve e o de arquivo não resolvia:
 * - sobrevive a serverless (o disco da lambda é efêmero);
 * - `email` é UNIQUE no banco, então o upsert é atômico de verdade.
 *
 * Leitura com `SELECT *` (mapeamento em `leadStorePostgresLinha.ts`) e escritas
 * direcionadas, de propósito: coluna de migração pendente só derruba o fluxo
 * que grava nela, com a causa no log (`db:42703` coluna, `db:42P01` tabela).
 * Desde a O9 o cadastro público grava `nome` (migração 004); o último acesso
 * (005) é gravado à parte e à prova de falha pela verificação.
 *
 * SERVER-ONLY.
 */
import { randomUUID } from "crypto";
import type { Pool, PoolClient } from "pg";
import type { AtualizacaoCodigo, AtualizacaoContato, AtualizacaoFunil, LeadStore } from "./leadStorePorta";
import type { Lead } from "../features/lead/lead";
import type { NotaLead } from "../features/lead/funil";
import {
  COLUNAS_FUNIL,
  colunasDoCodigo,
  colunasDoInsert,
  paraDominio,
  type Coluna,
  type LinhaLead,
} from "./leadStorePostgresLinha";

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

  /** Primeira linha de um `SELECT *` já como lead do domínio. */
  private async umLead(sql: string, params: unknown[]): Promise<Lead | null> {
    const linhas = await this.consultar<LinhaLead>(sql, params);
    return linhas[0] ? paraDominio(linhas[0]) : null;
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

  buscarPorEmail(email: string): Promise<Lead | null> {
    return this.umLead(`SELECT * FROM leads WHERE email = $1 LIMIT 1`, [email]);
  }

  buscarPorId(id: string): Promise<Lead | null> {
    return this.umLead(`SELECT * FROM leads WHERE id = $1 LIMIT 1`, [id]);
  }

  /** Repetidos antigos: o que tem e-mail primeiro (é ele que vira a dica), depois o mais antigo. */
  buscarPorTelefone(telefone: string): Promise<Lead | null> {
    return this.umLead(
      `SELECT * FROM leads WHERE telefone = $1 ORDER BY (email IS NULL), criado_em LIMIT 1`,
      [telefone],
    );
  }

  buscarPorCreci(formas: readonly string[]): Promise<Lead | null> {
    if (formas.length === 0) return Promise.resolve(null);
    return this.umLead(`SELECT * FROM leads WHERE creci = ANY($1::text[]) ORDER BY criado_em LIMIT 1`, [[...formas]]);
  }

  /**
   * UPDATE só dos campos de contato que vieram + consentimento (O9, depois do
   * código certo): `status`, código, `verificado_em`, origem e `criado_em` nem
   * aparecem no SQL. `limparConferencia` zera a conferência do CRECI no MESMO
   * UPDATE (só vem quando o lead tinha conferência — então a coluna existe).
   */
  async atualizarContato(id: string, dados: AtualizacaoContato): Promise<void> {
    const opcionais: Coluna[] = [
      ["nome", dados.nome],
      ["telefone", dados.telefone],
      ["creci", dados.creci],
    ];
    const colunas: Coluna[] = [
      ...opcionais.filter(([, v]) => v !== undefined),
      ...(dados.limparConferencia
        ? ([
            ["creci_conferencia", null],
            ["creci_conferido_em", null],
          ] satisfies Coluna[])
        : []),
      ["consentimento_texto", dados.consentimento.texto],
      ["consentimento_aceito_em", dados.consentimento.aceitoEm],
      ["consentimento_ip", dados.consentimento.ip],
      ["atualizado_em", dados.atualizadoEm],
    ];
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

  /** Só `ultimo_acesso_em` (nem `atualizado_em`: entrar no demo não é editar o lead). */
  async registrarAcesso(id: string, em: string): Promise<void> {
    await this.consultar(`UPDATE leads SET ultimo_acesso_em = $2 WHERE id = $1`, [id, em]);
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
