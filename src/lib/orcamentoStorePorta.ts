/**
 * Porta de persistência dos orçamentos (fronteira de fornecedor — mesma
 * exceção de YAGNI do `LeadStore`). Adaptadores: `FileOrcamentoStore` (dev,
 * `orcamentoStore.ts`) e `PostgresOrcamentoStore` (produção).
 *
 * O registro é um RETRATO: `itens`, `totais` e `condicoes` chegam prontos do
 * cálculo e ninguém recalcula na leitura. Mudar a tabela de preços depois não
 * mexe em orçamento já emitido.
 *
 * A NUMERAÇÃO é responsabilidade do store, não do caso de uso: só quem grava
 * consegue garantir que duas criações ao mesmo tempo não repetem o `ORC-AAAA-NNN`.
 */
import type { CondicoesOrcamento, ItemOrcamento, Orcamento, StatusOrcamento, TotaisOrcamento } from "../features/orcamento/orcamento";
import type { PublicoOrcamento } from "../features/orcamento/tabela";

/** O que o caso de uso manda gravar. `id` e `numero` são do store. */
export interface DadosOrcamento {
  leadId: string;
  publico: PublicoOrcamento;
  status: StatusOrcamento;
  itens: ItemOrcamento[];
  totais: TotaisOrcamento;
  condicoes: CondicoesOrcamento;
  /** `AAAA-MM-DD`. */
  validadeEm: string;
  observacao?: string;
  /** Momento da gravação (ISO 8601) — relógio injetado pelo caso de uso. */
  em: string;
  /** Ano da numeração (o do fuso de Recife, decidido pelo caso de uso). */
  ano: number;
}

/** O que a troca de situação devolve, com a anterior para a auditoria. */
export interface TrocaStatusOrcamento {
  anterior: StatusOrcamento;
  orcamento: Orcamento;
}

export interface OrcamentoStore {
  /**
   * Grava um orçamento novo, com o próximo `ORC-AAAA-NNN` do ano. Lead que não
   * existe → erro (a chave estrangeira recusa).
   */
  criar(dados: DadosOrcamento): Promise<Orcamento>;
  /** Todos, do mais recente para o mais antigo (painel do fundador). */
  listar(): Promise<Orcamento[]>;
  /** Os daquele lead, do mais recente para o mais antigo (ficha do lead). */
  doLead(leadId: string): Promise<Orcamento[]>;
  buscarPorId(id: string): Promise<Orcamento | null>;
  /**
   * Muda a situação. `null` se o id não existe. A 1ª ida para "enviado"
   * carimba `enviadoEm`; voltar e reenviar mantém o carimbo original.
   */
  trocarStatus(id: string, status: StatusOrcamento, em: string): Promise<TrocaStatusOrcamento | null>;
  /** `false` se já não existia: excluir duas vezes não é erro. */
  excluir(id: string): Promise<boolean>;
  /**
   * Apaga os orçamentos do lead (LGPD art. 18 — a exclusão do lead leva a
   * proposta junto). No Postgres o `ON DELETE CASCADE` da 007 já faz isso
   * sozinho, e chamar de novo não é erro; no arquivo (dev) é esta chamada que
   * mantém o mesmo comportamento. Devolve quantos saíram.
   */
  removerDoLead(leadId: string): Promise<number>;
}
