/**
 * Porta de persistência das avaliações (fronteira de fornecedor — mesma exceção
 * de YAGNI do `LeadStore`). Adaptadores: `FileAvaliacaoStore` (dev,
 * `avaliacaoStore.ts`) e `PostgresAvaliacaoStore` (produção).
 *
 * Uma avaliação por lead, editável: tudo passa pelo `salvar`, que é upsert por
 * `lead_id` (índice único da migração 006). O texto do comentário é dado
 * pessoal do mesmo jeito que o contato: nunca vai para log nem auditoria.
 */
import type { Avaliacao, Identificacao, StatusAvaliacao } from "../features/avaliacao/avaliacao";
import type { ConsentimentoAvaliacao } from "../features/avaliacao/avaliacao";

/** O que o caso de uso manda gravar. O `id` e o `criadoEm` são do store. */
export interface DadosAvaliacao {
  estrelas: number;
  /** Ausente = só a nota (a coluna fica NULL). */
  comentario?: string;
  identificacao: Identificacao;
  status: StatusAvaliacao;
  consentimento: ConsentimentoAvaliacao;
  /** Momento da gravação (ISO 8601) — relógio injetado pelo caso de uso. */
  em: string;
}

/** Soma das notas e quantas avaliações existem — TODAS, em qualquer situação. */
export interface ContagemAvaliacoes {
  soma: number;
  quantas: number;
}

/** O que a troca de situação devolve, com a situação anterior para a auditoria. */
export interface TrocaStatus {
  anterior: StatusAvaliacao;
  avaliacao: Avaliacao;
}

export interface AvaliacaoStore {
  /**
   * Grava a avaliação do lead. Já havia uma: sobrescreve nota, texto, escolha,
   * situação e consentimento, mantendo `id` e `criadoEm` (é a MESMA avaliação,
   * editada). Lead que não existe → erro (a chave estrangeira recusa).
   */
  salvar(leadId: string, dados: DadosAvaliacao): Promise<Avaliacao>;
  /** A avaliação daquele lead, ou `null`. */
  doLead(leadId: string): Promise<Avaliacao | null>;
  /**
   * As `publicado` **com texto**, da mais recente para a mais antiga, no máximo
   * `limite` — é o que a vitrine pública mostra. Sem texto não vira comentário
   * (a nota dessas já está na contagem).
   */
  listarPublicadas(limite: number): Promise<Avaliacao[]>;
  /** Todas, da mais recente para a mais antiga (painel do fundador). */
  listarTodas(): Promise<Avaliacao[]>;
  /** Muda a situação do texto. `null` se o id não existe. */
  trocarStatus(id: string, status: StatusAvaliacao, em: string): Promise<TrocaStatus | null>;
  /** Contagem para a média do site, sem trazer as linhas. */
  resumoContagem(): Promise<ContagemAvaliacoes>;
}
