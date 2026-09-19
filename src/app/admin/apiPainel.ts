/**
 * Chamada à API do admin, igual para o painel todo: sessão vencida (401) volta
 * para o login, falha de rede vira status 0 (a tela mostra "sem conexão") e o
 * corpo chega como JSON ou `null`. Nunca lança — quem chama decide a mensagem.
 * Sem React: o teste troca o `fetch` e confere cada caminho.
 */
import { SEM_CONEXAO, type RespostaApi } from "./mensagensApi";

/**
 * `null` quando a sessão caiu (o `aoSessaoCair` já foi chamado e o painel está
 * indo para o login: quem chamou para por ali).
 */
export async function pedirApi(
  url: string,
  init: RequestInit | undefined,
  aoSessaoCair: () => void,
): Promise<RespostaApi | null> {
  let res: Response;
  try {
    res = await fetch(url, { cache: "no-store", ...init });
  } catch {
    return { status: SEM_CONEXAO, corpo: null };
  }
  if (res.status === 401) {
    aoSessaoCair();
    return null;
  }
  let corpo: unknown = null;
  try {
    corpo = await res.json();
  } catch {
    corpo = null; // sem JSON (ex.: página de erro do provedor): o status diz o resto
  }
  return { status: res.status, corpo };
}

/** `RequestInit` de um envio JSON. */
export function comJson(metodo: "POST" | "PATCH" | "DELETE", corpo: unknown): RequestInit {
  return { method: metodo, headers: { "Content-Type": "application/json" }, body: JSON.stringify(corpo) };
}

/** Rota das anotações de um lead (o id vai escapado na URL). */
export function urlNotas(leadId: string): string {
  return `/api/admin/leads/${encodeURIComponent(leadId)}/notas`;
}
