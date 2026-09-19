/**
 * Porta de persistência de leads (fronteira de fornecedor — ADR U3): o que o
 * domínio pede ao banco. Adaptadores: `FileLeadStore` (dev, `leadStore.ts`) e
 * `PostgresLeadStore` (produção, `leadStorePostgres.ts`).
 *
 * Toda escrita é DIRECIONADA (O7·S1, O8, O9): cada fluxo grava só as colunas
 * que são dele — o pedido de acesso o código, a verificação o código, o
 * carimbo e (com o código certo) o contato, o admin o funil. Regravar a linha
 * inteira desfaria o que o outro fluxo gravou no meio.
 */
import type { CodigoVerificacao, Consentimento, Lead } from "../features/lead/lead";
import type { NotaLead, StatusLead } from "../features/lead/funil";
import type { ConferenciaCreci } from "../features/lead/creci";

/**
 * O que a verificação com `atualizacao` (O9) muda no contato — só DEPOIS do
 * código certo. Só os campos presentes são gravados; o consentimento é
 * carimbado de novo (a pessoa aceitou o texto do formulário outra vez).
 */
export interface AtualizacaoContato {
  nome?: string;
  telefone?: string;
  creci?: string;
  consentimento: Consentimento;
  atualizadoEm: string;
}

/** O que a verificação do código muda: o código e, no sucesso, o carimbo. Nunca a etapa. */
export interface AtualizacaoCodigo {
  codigo: CodigoVerificacao;
  /** Carimbo da verificação. Se já havia um, fica o original (nunca re-carimba). */
  verificadoEm?: string;
  atualizadoEm: string;
}

/** O que o admin muda no lead (O8, O9). Só os campos presentes são gravados; `null` limpa. */
export interface AtualizacaoFunil {
  status?: StatusLead;
  retomarEm?: string | null;
  motivo?: string | null;
  proximaAcaoEm?: string | null;
  proximaAcao?: string | null;
  /** Conferência do CRECI na busca oficial (O9). */
  creciConferencia?: ConferenciaCreci | null;
  creciConferidoEm?: string | null;
  atualizadoEm: string;
}

export interface LeadStore {
  /** Lead com e-mail repetido → erro "já existe lead com este e-mail". */
  criar(lead: Lead): Promise<Lead>;
  buscarPorEmail(email: string): Promise<Lead | null>;
  buscarPorId(id: string): Promise<Lead | null>;
  /**
   * Um lead com este WhatsApp (E.164), ou `null` (O9). Havendo repetidos
   * antigos, vem primeiro o que tem e-mail, depois o mais antigo.
   */
  buscarPorTelefone(telefone: string): Promise<Lead | null>;
  /**
   * Um lead cujo CRECI é uma destas grafias canônicas (`formasEquivalentesCreci`),
   * ou `null` (O9). Havendo repetidos antigos, o mais antigo.
   */
  buscarPorCreci(formas: readonly string[]): Promise<Lead | null>;
  /**
   * Grava SÓ os campos de contato presentes + consentimento — nunca etapa,
   * código, `verificadoEm`, origem nem `criadoEm`. Lead que sumiu → erro.
   */
  atualizarContato(id: string, dados: AtualizacaoContato): Promise<void>;
  /** Grava SÓ o código e o carimbo da verificação. Lead que sumiu → erro. */
  atualizarCodigo(id: string, dados: AtualizacaoCodigo): Promise<void>;
  /**
   * Grava SÓ `ultimoAcessoEm` (O9). Escrita separada de propósito: se a coluna
   * não existir (migração 005 pendente), só ela falha — o login segue.
   */
  registrarAcesso(id: string, em: string): Promise<void>;
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
