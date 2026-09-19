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
import { interpretarRemetente, MENSAGEM_REMETENTE_INVALIDO } from "./remetente";

/** Campo opcional que trata string vazia de `.env` (ex.: `RESEND_API_KEY=`) como não definida. */
const opcional = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((v) => (v === "" ? undefined : v), schema);

/** Teto diário padrão de e-mails do app — abaixo dos 100/dia do plano gratuito do Resend. */
export const LIMITE_ENVIOS_DIA_PADRAO = 90;

const MENSAGEM_TURNSTILE_PAR =
  "defina NEXT_PUBLIC_TURNSTILE_SITE_KEY e TURNSTILE_SECRET_KEY juntas (ou nenhuma das duas)";

const camposEnv = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  // E-mail (Resend). Opcional: sem chave, liga o fallback de desenvolvimento (ConsoleEmail).
  RESEND_API_KEY: opcional(z.string().min(1).optional()),
  // "endereço" ou "Nome <endereço>" — o nome de exibição não derruba mais o build (O7·S3)
  EMAIL_FROM: opcional(
    z
      .string()
      .trim()
      .refine((v) => interpretarRemetente(v) !== null, MENSAGEM_REMETENTE_INVALIDO)
      .optional(),
  ),

  // Segredo para assinar tokens (HMAC) — obrigatório. Gere um valor longo e aleatório.
  APP_SECRET: z.string().min(16, "defina um valor com 16+ caracteres aleatórios"),

  // Senha do painel admin — obrigatória.
  ADMIN_PASSWORD: z.string().min(8, "use uma senha forte (8+ caracteres)"),

  // O7·S1 — teto de e-mails que o app envia em 24h (códigos + avisos). Estourou:
  // o lead NOVO é gravado mesmo assim e o fundador fala com ele pelo /admin (quem já
  // tinha cadastro recebe 503 "envio_indisponivel" — O9).
  LIMITE_ENVIOS_DIA: opcional(
    z.coerce
      .number({ invalid_type_error: "use um número inteiro (ex.: 90)" })
      .int("use um número inteiro (ex.: 90)")
      .min(1, "use 1 ou mais")
      .max(100_000, "use no máximo 100000")
      .default(LIMITE_ENVIOS_DIA_PADRAO),
  ),

  // O7·S1 — Cloudflare Turnstile (anti-robô). As duas juntas ligam; nenhuma, desliga.
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: opcional(z.string().trim().min(1).optional()),
  TURNSTILE_SECRET_KEY: opcional(z.string().trim().min(1).optional()),

  // O7·S1 — quem recebe o aviso "novo lead confirmado" (sem dado do lead no corpo).
  AVISO_LEADS_EMAIL: opcional(z.string().trim().email("use um e-mail válido").max(254).optional()),
});

export const envSchema = camposEnv.superRefine((e, ctx) => {
  // uma chave sem a outra: ou o widget aparece e o servidor ignora o token, ou o
  // servidor exige um token que a tela nunca manda (todo lead barrado)
  if (Boolean(e.NEXT_PUBLIC_TURNSTILE_SITE_KEY) !== Boolean(e.TURNSTILE_SECRET_KEY)) {
    const falta = e.TURNSTILE_SECRET_KEY ? "NEXT_PUBLIC_TURNSTILE_SITE_KEY" : "TURNSTILE_SECRET_KEY";
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: [falta], message: MENSAGEM_TURNSTILE_PAR });
  }
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
