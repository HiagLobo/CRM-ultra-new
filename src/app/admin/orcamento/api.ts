/**
 * Busca do orçamento para o documento. Fica fora do React para o teste trocar o
 * `fetch` e cobrir cada caminho: achou, não existe, sessão caiu, servidor
 * falhou, rede fora e resposta em formato estranho.
 *
 * Nunca lança: quem chama recebe um estado e desenha a tela certa.
 */
import { orcamentoSchema, type Orcamento } from "./tiposOrcamento";

export type BuscaOrcamento =
  | { estado: "ok"; orcamento: Orcamento }
  | { estado: "sessao" }
  | { estado: "nao_encontrado" }
  | { estado: "erro"; mensagem: string };

export const SEM_CONEXAO = "Sem conexão: não deu para abrir o orçamento. Confira a internet e tente de novo.";
export const FALHA_SERVIDOR = "Não deu para abrir o orçamento: falha no servidor. Tente de novo em instantes.";
export const FORMATO_ESTRANHO =
  "O orçamento veio num formato que esta tela não entende. Avise quem cuida do sistema antes de enviar a proposta.";

/** Rota do orçamento no admin (o id vai escapado na URL). */
export function urlOrcamento(id: string): string {
  return `/api/admin/orcamentos/${encodeURIComponent(id)}`;
}

export async function buscarOrcamento(id: string): Promise<BuscaOrcamento> {
  let resposta: Response;
  try {
    resposta = await fetch(urlOrcamento(id), { cache: "no-store" });
  } catch {
    return { estado: "erro", mensagem: SEM_CONEXAO };
  }

  if (resposta.status === 401) return { estado: "sessao" };
  if (resposta.status === 404) return { estado: "nao_encontrado" };
  if (resposta.status >= 500) return { estado: "erro", mensagem: FALHA_SERVIDOR };

  let corpo: unknown = null;
  try {
    corpo = await resposta.json();
  } catch {
    corpo = null; // sem JSON (página de erro do provedor): o status já disse o resto
  }
  if (!resposta.ok) return { estado: "erro", mensagem: FALHA_SERVIDOR };

  const bruto = (corpo as { orcamento?: unknown } | null)?.orcamento;
  const lido = orcamentoSchema.safeParse(bruto);
  if (!lido.success) return { estado: "erro", mensagem: FORMATO_ESTRANHO };
  return { estado: "ok", orcamento: lido.data };
}
