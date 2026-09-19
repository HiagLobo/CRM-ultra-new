/**
 * CSV da base de leads (o admin abre na planilha para trabalhar o follow-up).
 * Só o que o painel já mostra (o `LeadAdmin`): nada de hash, IP ou texto do
 * consentimento — e as anotações ficam de fora (texto livre, fica no painel).
 */
import type { LeadStore } from "../../lib/leadStore";
import { dataHoraRecife, diaBR, resumo, telefoneNacional } from "./admin";

/**
 * `;` é o separador de lista do Excel em português: com ele o duplo clique já
 * abre em colunas, e o `;` que vier dentro de um campo fica preso nas aspas.
 */
const SEPARADOR = ";";

export const COLUNAS_CSV = [
  "id",
  "nome",
  "email",
  "telefone",
  "creci",
  "etapa",
  "canal",
  "verificado_em",
  "criado_em",
  "proxima_acao_em",
  "retomar_em",
  "motivo",
  "origem_utm",
  "origem_ref",
] as const;

/**
 * Escapa um campo para CSV (sempre entre aspas) e **neutraliza injeção de
 * fórmula**: uma célula que começa com `= + - @` (ou tab/CR) é executada por
 * Excel/Sheets ao abrir. Como e-mail, CRECI, nome, motivo e origem vêm de
 * fora (visitante ou texto livre), prefixamos com `'` nesses casos.
 */
function celula(valor: string | undefined): string {
  const bruto = valor ?? "";
  const seguro = /^[=+\-@\t\r]/.test(bruto) ? `'${bruto}` : bruto;
  return `"${seguro.replace(/"/g, '""')}"`;
}

const linhaCsv = (campos: ReadonlyArray<string | undefined>) => campos.map(celula).join(SEPARADOR);

export async function exportarCsv(store: LeadStore): Promise<{ csv: string; linhas: number }> {
  const { leads } = await resumo(store);
  const corpo = leads.map((l) =>
    linhaCsv([
      l.id,
      l.nome,
      l.email,
      telefoneNacional(l.telefone),
      l.creci,
      l.status,
      l.canal,
      dataHoraRecife(l.verificadoEm),
      dataHoraRecife(l.criadoEm),
      diaBR(l.proximaAcaoEm),
      diaBR(l.retomarEm),
      l.motivo,
      l.origem?.utm,
      l.origem?.ref,
    ]),
  );
  // BOM para o Excel abrir os acentos certo
  return { csv: `﻿${[linhaCsv(COLUNAS_CSV), ...corpo].join("\r\n")}\r\n`, linhas: leads.length };
}
