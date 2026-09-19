/**
 * Guarda de servidor dos painéis do demo.
 *
 * Sem o cookie httpOnly assinado, a página **não chega a renderizar** — é a
 * diferença entre um portão de experiência (o `AuthGate`, que só evita piscar
 * conteúdo) e um de verdade.
 *
 * Aqui não se trata de proteger dado: os painéis são 100% mock. Trata-se de
 * proteger a **captação** — o demo é o que se troca pelo lead, e sem checagem
 * no servidor qualquer um digita `/corretor` e pula o formulário.
 *
 * Roda em Server Component (runtime Node), então reusa a mesma verificação HMAC
 * das rotas — sem uma segunda implementação de cripto para o Edge, que poderia
 * divergir sem ninguém notar.
 *
 * SERVER-ONLY.
 */
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { env } from "./env";
import { COOKIE_TOKEN_DEMO, verificarTokenDemo } from "./token";
import { PARAM_ACESSO, VALOR_ACESSO_NECESSARIO } from "./demoAccess";


/** Redireciona para a landing (onde se pede acesso) se não houver token válido. */
export async function exigirDemo(): Promise<void> {
  const token = (await cookies()).get(COOKIE_TOKEN_DEMO)?.value;
  if (!token || !verificarTokenDemo(token, env.APP_SECRET)) {
    redirect(`/?${PARAM_ACESSO}=${VALOR_ACESSO_NECESSARIO}`);
  }
}
