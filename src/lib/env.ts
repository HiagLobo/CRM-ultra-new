/**
 * Variáveis de ambiente — validadas com Zod, fail-closed no boot.
 *
 * Uso APENAS no servidor (lê segredos). Importar este módulo em código de servidor
 * dispara a validação; se faltar uma variável obrigatória, o processo falha com
 * mensagem clara em vez de quebrar silenciosamente mais adiante.
 *
 * Em testes, defina SKIP_ENV_VALIDATION=1 e use `parseEnv(raw)` com entradas explícitas.
 */
import { z } from "zod";

/** Campo opcional que trata string vazia de `.env` (ex.: `RESEND_API_KEY=`) como não definida. */
const opcional = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((v) => (v === "" ? undefined : v), schema);

export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  // E-mail (Resend). Opcional: sem chave, liga o fallback de desenvolvimento (ConsoleEmail).
  RESEND_API_KEY: opcional(z.string().min(1).optional()),
  EMAIL_FROM: opcional(z.string().email().optional()),

  // Segredo para assinar tokens (HMAC) — obrigatório. Gere um valor longo e aleatório.
  APP_SECRET: z.string().min(16, "defina um valor com 16+ caracteres aleatórios"),

  // Senha do painel admin — obrigatória.
  ADMIN_PASSWORD: z.string().min(8, "use uma senha forte (8+ caracteres)"),
});

export type Env = z.infer<typeof envSchema>;

/** Valida um objeto de ambiente. Lança Error legível se inválido. */
export function parseEnv(raw: Record<string, string | undefined> = process.env): Env {
  const parsed = envSchema.safeParse(raw);
  if (!parsed.success) {
    const detalhes = parsed.error.issues
      .map((i) => `  - ${i.path.join(".") || "(raiz)"}: ${i.message}`)
      .join("\n");
    throw new Error(
      `[env] Configuração de ambiente inválida. Corrija as variáveis abaixo (veja .env.example):\n${detalhes}`,
    );
  }
  return parsed.data;
}

/**
 * Ambiente validado. Em teste (SKIP_ENV_VALIDATION) não valida no import,
 * para os testes controlarem as entradas via parseEnv.
 */
export const env: Env = process.env.SKIP_ENV_VALIDATION
  ? (process.env as unknown as Env)
  : parseEnv();

/**
 * Sem chave Resend → modo de desenvolvimento do e-mail (o código volta na
 * resposta da rota em vez de ser enviado).
 *
 * **Nunca em produção.** Sem esta trava, subir sem `RESEND_API_KEY` faria a
 * `POST /api/lead` devolver o código de verificação para quem pedisse — ou
 * seja, qualquer um entraria no demo com o e-mail de qualquer pessoa.
 * (achado da revisão final da O5·S1)
 */
export const emailModoDev = !env.RESEND_API_KEY && env.NODE_ENV !== "production";
