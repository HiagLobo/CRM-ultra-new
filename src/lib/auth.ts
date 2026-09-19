/**
 * Auth MOCK do protótipo — SEM segurança real.
 * Fica atrás de uma interface limpa (`AuthProvider`) para que, no futuro,
 * baste trocar a implementação por chamadas reais ao backend sem mexer nas telas.
 *
 * Sessão guardada no cliente (localStorage), apenas o perfil/nome/e-mail.
 */
import type { Perfil, Sessao } from "@/types";
import { emailDemo } from "@/config/demo";

export interface AuthProvider {
  login(email: string, senha: string): Sessao | null;
  logout(): void;
  getSession(): Sessao | null;
  isAuthenticated(): boolean;
}

const STORAGE_KEY = "crm_session";

/**
 * Personas fictícias do demo, uma por painel (e-mail no domínio reservado do
 * demo). Não há formulário de senha: a `senha` só existe porque `login` a
 * exige — quem entra é `entrarComoDemo`, depois que o e-mail foi confirmado.
 */
interface DemoUser {
  email: string;
  senha: string;
  perfil: Perfil;
  nome: string;
}

const DEMO_USERS: DemoUser[] = [
  { email: emailDemo("ceo"), senha: "123", perfil: "ceo", nome: "Marina Duarte" },
  { email: emailDemo("corretor"), senha: "123", perfil: "corretor", nome: "Júlia Castro" },
  { email: emailDemo("franqueado"), senha: "123", perfil: "franqueado", nome: "Bruno Tavares" },
];

export const mockAuth: AuthProvider = {
  login(email, senha) {
    const found = DEMO_USERS.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.senha === senha,
    );
    if (!found) return null;
    const sessao: Sessao = { perfil: found.perfil, nome: found.nome, email: found.email };
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sessao));
      // espelho leve em cookie (não usado para segurança — só conveniência)
      document.cookie = `${STORAGE_KEY}=${found.perfil}; path=/; max-age=86400; samesite=lax`;
    }
    return sessao;
  },

  logout() {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(STORAGE_KEY);
    document.cookie = `${STORAGE_KEY}=; path=/; max-age=0`;
  },

  getSession() {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Sessao) : null;
    } catch {
      return null;
    }
  },

  isAuthenticated() {
    return this.getSession() !== null;
  },
};

/**
 * Entra na demonstração como a persona fictícia do perfil escolhido (O2·S3).
 * Sem senha de propósito: quem chega aqui já provou o e-mail (token de demo da
 * O1·S3) — a senha do protótipo não protege nada. Reusa `login` para a sessão
 * ser gravada num lugar só.
 */
export function entrarComoDemo(perfil: Perfil): Sessao | null {
  const persona = DEMO_USERS.find((u) => u.perfil === perfil);
  if (!persona) return null;
  return mockAuth.login(persona.email, persona.senha);
}

/** Para onde redirecionar após login, conforme o perfil. */
export function homeForPerfil(perfil: Perfil): string {
  if (perfil === "ceo") return "/ceo/visao-geral";
  if (perfil === "franqueado") return "/franqueado";
  return "/corretor";
}

