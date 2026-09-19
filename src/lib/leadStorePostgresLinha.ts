/**
 * Linha da tabela `leads` ⇄ `Lead` do domínio, para o `PostgresLeadStore`
 * (separado do adaptador na O9 — regra das 200 linhas).
 *
 * Tolerância de migração: a leitura é `SELECT *`, então colunas das migrações
 * 004/005 podem faltar (deploy antes da migração) — ausente vira campo ausente.
 * O INSERT só leva as colunas novas quando têm valor.
 *
 * SERVER-ONLY. Os objetos aninhados do domínio viram colunas achatadas.
 */
import type { Lead } from "../features/lead/lead";
import { normalizarCanal, normalizarStatus } from "../features/lead/funil";
import { normalizarConferencia } from "../features/lead/creci";
import type { AtualizacaoCodigo, AtualizacaoFunil } from "./leadStorePorta";

/** Linha da tabela `leads` como o Postgres devolve. As colunas da O8/O9 podem faltar (migração pendente). */
export interface LinhaLead {
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
  creci_conferencia?: string | null;
  creci_conferido_em?: Date | null;
  ultimo_acesso_em?: Date | null;
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

export type Coluna = [nome: string, valor: unknown];

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

export function paraDominio(l: LinhaLead): Lead {
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
      ultimoAcessoEm: l.ultimo_acesso_em?.toISOString(),
      creciConferencia: normalizarConferencia(l.creci_conferencia),
      creciConferidoEm: l.creci_conferido_em?.toISOString(),
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
export function colunasDoInsert(lead: Lead): Coluna[] {
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

export function colunasDoCodigo(codigo: AtualizacaoCodigo["codigo"]): Coluna[] {
  return [
    ["codigo_hash", codigo.hash],
    ["codigo_expira_em", codigo.expiraEm],
    ["codigo_tentativas", codigo.tentativas],
    ["codigo_enviado_em", codigo.enviadoEm],
  ];
}

/** Campo do funil no domínio → coluna. */
export const COLUNAS_FUNIL: Readonly<Record<Exclude<keyof AtualizacaoFunil, "atualizadoEm">, string>> = {
  status: "status",
  retomarEm: "retomar_em",
  motivo: "motivo",
  proximaAcaoEm: "proxima_acao_em",
  proximaAcao: "proxima_acao",
  creciConferencia: "creci_conferencia",
  creciConferidoEm: "creci_conferido_em",
};
