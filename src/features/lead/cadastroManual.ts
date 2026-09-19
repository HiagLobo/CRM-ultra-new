/**
 * Cadastro manual de lead pelo admin (O8): indicação, evento, WhatsApp.
 *
 * Sem código de verificação (quem cadastra é o admin, não o titular) e sem
 * e-mail obrigatório. O consentimento gravado diz de onde veio o registro e a
 * base legal, com `ip = "admin"` — nunca finge que a pessoa preencheu o site.
 * Deduplica por e-mail, telefone e CRECI (O9, pela chave: `PE 12345` ≡
 * `PE 12345-F`): o mesmo contato não vira dois leads.
 *
 * SERVER-ONLY (usa crypto). Nada aqui loga contato, nome ou observação.
 */
import { randomUUID } from "crypto";
import type { LeadStore } from "../../lib/leadStore";
import { causaDoErro } from "../../lib/erros";
import { paraLeadAdmin, type LeadAdmin } from "./admin";
import { codigoInutilizado, type Lead } from "./lead";
import { ROTULO_CANAL, type CanalManual } from "./funil";
import { chaveCreci } from "./creci";
import type { EventoAuditoriaAdmin } from "./funilAdmin";
import type { CadastroManual } from "./schemaAdmin";

/** No lugar do IP do titular: quem registrou foi o admin, no painel. */
export const IP_CADASTRO_MANUAL = "admin";

/** O texto que fica carimbado no consentimento do lead cadastrado à mão. */
export function textoConsentimentoManual(canal: CanalManual): string {
  return (
    `Cadastro manual pelo administrador — canal ${ROTULO_CANAL[canal]} — base legal: legítimo interesse ` +
    "(contato iniciado pelo titular ou indicação consentida)."
  );
}

export type ResultadoCadastro =
  | {
      status: "ok";
      lead: LeadAdmin;
      /** Só quando veio observação: `false` = o lead foi gravado, a 1ª anotação não. */
      observacaoSalva?: boolean;
      auditoria: EventoAuditoriaAdmin;
    }
  | { status: "duplicado"; id: string; campo: "email" | "telefone" | "creci" };

function acharDuplicado(leads: ReadonlyArray<Lead>, dados: CadastroManual) {
  const porEmail = dados.email ? leads.find((l) => l.email === dados.email) : undefined;
  if (porEmail) return { id: porEmail.id, campo: "email" as const };
  const porTelefone = leads.find((l) => l.telefone === dados.telefone);
  if (porTelefone) return { id: porTelefone.id, campo: "telefone" as const };
  const chave = dados.creci ? chaveCreci(dados.creci) : undefined;
  const porCreci = chave ? leads.find((l) => l.creci && chaveCreci(l.creci) === chave) : undefined;
  return porCreci ? { id: porCreci.id, campo: "creci" as const } : null;
}

export async function cadastrarManual(
  store: LeadStore,
  dados: CadastroManual,
  agora: Date = new Date(),
): Promise<ResultadoCadastro> {
  const repetido = acharDuplicado(await store.listar(), dados);
  if (repetido) return { status: "duplicado", ...repetido };

  const iso = agora.toISOString();
  const lead: Lead = {
    id: randomUUID(),
    ...(dados.email ? { email: dados.email } : {}),
    telefone: dados.telefone,
    creci: dados.creci ?? "",
    ...(dados.nome ? { nome: dados.nome } : {}),
    canal: dados.canal,
    status: "novo",
    consentimento: { texto: textoConsentimentoManual(dados.canal), aceitoEm: iso, ip: IP_CADASTRO_MANUAL },
    codigo: codigoInutilizado(agora),
    criadoEm: iso,
    atualizadoEm: iso,
  };

  try {
    await store.criar(lead);
  } catch (err) {
    // corrida: o mesmo e-mail entrou nesse meio (pelo site ou por outra aba do painel)
    const existente = dados.email ? await store.buscarPorEmail(dados.email) : null;
    if (!existente) throw err;
    return { status: "duplicado", id: existente.id, campo: "email" };
  }

  const auditoria: EventoAuditoriaAdmin = { acao: "lead.manual", dados: { id: lead.id, canal: lead.canal } };
  if (!dados.observacao) return { status: "ok", lead: paraLeadAdmin(lead), auditoria };
  return {
    status: "ok",
    lead: paraLeadAdmin(lead),
    observacaoSalva: await salvarObservacao(store, lead.id, dados.observacao, iso),
    auditoria,
  };
}

/**
 * A observação vira a 1ª anotação. Se falhar, o lead (já gravado) fica — o
 * admin é avisado para anotar de novo; a causa vai ao log, o texto nunca.
 */
async function salvarObservacao(store: LeadStore, leadId: string, texto: string, em: string): Promise<boolean> {
  try {
    return (await store.adicionarNota(leadId, texto, em)) !== null;
  } catch (err) {
    const causa = causaDoErro(err, "db");
    console.error("[lead.manual] observação não salva (o lead foi gravado):", causa);
    return false;
  }
}
