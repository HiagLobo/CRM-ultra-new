/**
 * Dados novos de quem já tinha cadastro (O9): o formulário completo com um
 * e-mail que já existe vira "entrar", e o nome, o WhatsApp e o CRECI digitados
 * viajam no verify como `atualizacao`. Só chegam aqui DEPOIS do código certo —
 * quem digita o e-mail de outra pessoa não troca o WhatsApp dela.
 *
 * Campo a campo: só o que mudou, e pulando o que já é de OUTRO lead (a mesma
 * regra do cadastro: WhatsApp e CRECI não se repetem). O que foi pulado volta
 * em `naoAtualizados` para a tela avisar. O consentimento é carimbado de novo
 * (a pessoa aceitou o texto do formulário outra vez).
 *
 * SERVER-ONLY. Nada aqui loga contato: só a causa segura (`causaDoErro`).
 */
import type { AtualizacaoContato, LeadStore } from "../../lib/leadStore";
import { causaDoErro } from "../../lib/erros";
import { chaveCreci, formasEquivalentesCreci } from "./creci";
import { registrarConsentimento, type Lead } from "./lead";
import type { AtualizacaoCadastro } from "./schema";

/** Campos que podem ficar para trás por já serem de outro lead (o nome nunca colide). */
export type CampoNaoAtualizado = "telefone" | "creci";

/** Outro lead (não este) já usa o valor? */
const deOutro = (achado: Lead | null, lead: Lead) => achado !== null && achado.id !== lead.id;

export async function aplicarAtualizacao(
  store: LeadStore,
  lead: Lead,
  dados: AtualizacaoCadastro,
  ctx: { ip: string; agora: Date },
): Promise<CampoNaoAtualizado[]> {
  const naoAtualizados: CampoNaoAtualizado[] = [];
  const mudou: Pick<AtualizacaoContato, "nome" | "telefone" | "creci"> = {};

  if (dados.nome !== lead.nome) mudou.nome = dados.nome;

  if (dados.telefone !== lead.telefone) {
    if (deOutro(await store.buscarPorTelefone(dados.telefone), lead)) naoAtualizados.push("telefone");
    else mudou.telefone = dados.telefone;
  }

  // mesma chave ("PE 12345" ≡ "PE 12345-F") = mesmo CRECI: não é mudança
  if (chaveCreci(dados.creci) !== chaveCreci(lead.creci)) {
    if (deOutro(await store.buscarPorCreci(formasEquivalentesCreci(dados.creci)), lead)) naoAtualizados.push("creci");
    else mudou.creci = dados.creci;
  }

  if (Object.keys(mudou).length === 0) return naoAtualizados;

  const em = ctx.agora.toISOString();
  await store.atualizarContato(lead.id, { ...mudou, consentimento: registrarConsentimento(ctx.ip, ctx.agora), atualizadoEm: em });
  if (mudou.creci && lead.creciConferencia) await desfazerConferencia(store, lead.id, em);
  return naoAtualizados;
}

/**
 * CRECI novo: a conferência feita no número antigo não vale para ele. À prova
 * de falha — o pior caso é um selo velho no painel, nunca o login travado.
 */
async function desfazerConferencia(store: LeadStore, id: string, em: string): Promise<void> {
  try {
    await store.atualizarFunil(id, { creciConferencia: null, creciConferidoEm: null, atualizadoEm: em });
  } catch (err) {
    console.error("[verify] conferência do CRECI antigo não desfeita:", causaDoErro(err, "db"));
  }
}
