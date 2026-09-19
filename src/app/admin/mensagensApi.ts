/**
 * Resposta da API do admin → mensagem para a tela. Puro, para o teste garantir
 * que toda falha vira um texto útil e que nenhum texto repete o que foi
 * digitado (contato, nome, anotação): as mensagens de campo vêm do schema do
 * servidor, que também nunca repete o valor recebido.
 */

/** O que a tela precisa de uma resposta: o status (0 = sem conexão) e o corpo JSON (ou `null`). */
export interface RespostaApi {
  status: number;
  corpo: unknown;
}

export const SEM_CONEXAO = 0;

const objeto = (v: unknown): Record<string, unknown> =>
  v !== null && typeof v === "object" ? (v as Record<string, unknown>) : {};

/** 2xx com `{ ok: true }` — o formato de sucesso de todas as rotas do admin. */
export function respostaOk(r: RespostaApi): boolean {
  return r.status >= 200 && r.status < 300 && objeto(r.corpo).ok === true;
}

/**
 * A 1ª mensagem de cada campo que a tela conhece, a partir do `campos` de um
 * 400 (`{ campo: ["mensagem", ...] }`). O que não for texto é ignorado.
 */
export function errosPorCampo<C extends string>(corpo: unknown, conhecidos: readonly C[]): Partial<Record<C, string>> {
  const campos = objeto(objeto(corpo).campos);
  const erros: Partial<Record<C, string>> = {};
  for (const campo of conhecidos) {
    const lista = campos[campo];
    if (Array.isArray(lista) && typeof lista[0] === "string") erros[campo] = lista[0];
  }
  return erros;
}

/** A 1ª mensagem de qualquer campo (ou geral) de um 400, para um aviso de uma linha. */
function primeiraMensagem(corpo: unknown): string | null {
  const c = objeto(corpo);
  const listas = [...Object.values(objeto(c.campos)), c.gerais];
  for (const lista of listas) {
    if (Array.isArray(lista) && typeof lista[0] === "string") return lista[0];
  }
  return null;
}

/** Falha → frase para a tela. `oQue` completa "Não deu para …" (ex.: "mudar a etapa"). */
export function mensagemDeErro(r: RespostaApi, oQue: string): string {
  if (r.status === SEM_CONEXAO) return `Sem conexão: não deu para ${oQue}. Confira a internet e tente de novo.`;
  if (r.status === 404) return "Esse lead não existe mais (foi excluído?). Recarregue a lista.";
  if (r.status === 409 && (r.corpo as { erro?: unknown } | null)?.erro === "fora_da_fila") {
    return "Esse lead está em Retomar depois ou Perdido: mude a etapa antes de marcar a próxima ação.";
  }
  if (r.status === 400) {
    const detalhe = primeiraMensagem(r.corpo);
    return detalhe ? `Não deu para ${oQue}: ${detalhe}.` : `Não deu para ${oQue}. Tente de novo.`;
  }
  if (r.status >= 500) return `Não deu para ${oQue}: falha no servidor. Tente de novo em instantes.`;
  return `Não deu para ${oQue}. Tente de novo.`;
}

/** 409 do cadastro manual: diz qual dado repetiu, sem repetir o dado. */
export function mensagemDuplicado(campo: unknown): string {
  if (campo === "email") return "Já existe um lead com esse e-mail.";
  if (campo === "creci") return "Já existe um lead com esse CRECI.";
  return "Já existe um lead com esse telefone.";
}
