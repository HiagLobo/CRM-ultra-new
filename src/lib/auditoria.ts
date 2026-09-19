/**
 * Registro de auditoria das ações materiais do admin (LGPD).
 *
 * Dois destinos, escolhidos pelo ambiente: **Postgres** quando há banco
 * (produção) e **arquivo** append-only em `data/auditoria.log` no dev. Registro
 * de auditoria que mora no disco da lambda some na primeira reciclagem — e um
 * registro que some não é registro.
 *
 * O que entra: o quê, quando e o mínimo para reconstituir a ação (id do lead,
 * status de/para, quantidade exportada). O que NÃO entra: e-mail, telefone,
 * CRECI — o log não pode virar uma segunda cópia da base de contatos.
 *
 * SERVER-ONLY (usa fs/pg).
 */
import { promises as fs } from "fs";
import { causaDoErro } from "./erros";
import path from "path";
import { poolPostgres } from "./db";

const CAMINHO_PADRAO = path.join(process.cwd(), "data", "auditoria.log");

export interface EventoAuditoria {
  /** ISO 8601 */
  em: string;
  acao: string;
  dados: Record<string, string | number | boolean | undefined>;
}

/**
 * Anexa um evento ao log. Nunca derruba a ação que está sendo auditada: se a
 * escrita falhar, registra o tipo do erro e segue (a alternativa — abortar um
 * follow-up já persistido — seria pior).
 */
export async function registrarAuditoria(
  acao: string,
  dados: EventoAuditoria["dados"],
  arquivo?: string,
  agora: Date = new Date(),
): Promise<void> {
  const evento: EventoAuditoria = { em: agora.toISOString(), acao, dados };
  try {
    // caminho explícito = arquivo (testes e conferência manual); senão, o ambiente decide
    const pool = arquivo ? null : poolPostgres();
    if (pool) {
      await pool.query("INSERT INTO auditoria (em, acao, dados) VALUES ($1, $2, $3)", [
        evento.em,
        evento.acao,
        JSON.stringify(evento.dados),
      ]);
      return;
    }
    const destino = arquivo ?? CAMINHO_PADRAO;
    await fs.mkdir(path.dirname(destino), { recursive: true });
    await fs.appendFile(destino, `${JSON.stringify(evento)}\n`, "utf8");
  } catch (err) {
    // causa segura (db:42P01 = migração 002 não rodou) — nunca a mensagem do erro
    const causa = causaDoErro(err, "db");
    console.error("[auditoria] falha ao registrar:", acao, causa);
  }
}

/** Lê os eventos registrados (usado em teste e para conferência manual). */
export async function lerAuditoria(
  arquivo?: string,
  limite = 500,
): Promise<EventoAuditoria[]> {
  const pool = arquivo ? null : poolPostgres();
  if (pool) {
    const { rows } = await pool.query(
      "SELECT em, acao, dados FROM auditoria ORDER BY em DESC LIMIT $1",
      [limite],
    );
    return rows.map((r: { em: Date; acao: string; dados: EventoAuditoria["dados"] }) => ({
      em: r.em.toISOString(),
      acao: r.acao,
      dados: r.dados,
    }));
  }

  try {
    const txt = await fs.readFile(arquivo ?? CAMINHO_PADRAO, "utf8");
    return txt
      .split("\n")
      .filter((l) => l.trim())
      .map((l) => JSON.parse(l) as EventoAuditoria);
  } catch (err) {
    if ((err as NodeJS.ErrnoException)?.code === "ENOENT") return [];
    throw err;
  }
}
