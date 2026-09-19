/**
 * Contas com dias `AAAA-MM-DD` do painel (próxima ação, retomar). Um dia não é
 * um instante: a conta é feita em UTC puro, sem fuso — quem decide qual é o
 * "hoje" é o `diaRecife` do domínio. Puro, para o teste cobrir as viradas.
 */
import { diaBR } from "@/features/lead/admin";
import { diaValido } from "@/features/lead/funil";

const UM_DIA_MS = 24 * 60 * 60 * 1000;

const meiaNoite = (dia: string) => Date.parse(`${dia}T00:00:00Z`);

/** `dia` + `n` dias (negativo volta). Dia inválido sai como veio. */
export function somarDias(dia: string, n: number): string {
  if (!diaValido(dia)) return dia;
  return new Date(meiaNoite(dia) + n * UM_DIA_MS).toISOString().slice(0, 10);
}

/** Quantos dias de `de` até `ate` (negativo quando `ate` vem antes). */
export function diasEntre(de: string, ate: string): number {
  return Math.round((meiaNoite(ate) - meiaNoite(de)) / UM_DIA_MS);
}

/** Dias inteiros desde o instante ISO (0 nas primeiras 24 h). Data ilegível → 0. */
export function diasDesde(iso: string, agora: Date): number {
  const ms = agora.getTime() - Date.parse(iso);
  return Number.isNaN(ms) || ms < 0 ? 0 : Math.floor(ms / UM_DIA_MS);
}

/** Horas desde o instante ISO. Data ilegível → 0 (nunca empurra um lead para "parado"). */
export function horasDesde(iso: string, agora: Date): number {
  const ms = agora.getTime() - Date.parse(iso);
  return Number.isNaN(ms) || ms < 0 ? 0 : ms / (60 * 60 * 1000);
}

/**
 * O dia como se fala: "hoje", "amanhã", "ontem"; no mesmo ano, `dd/mm`; fora
 * dele, `dd/mm/aaaa`. `hoje` é o dia de Recife (`diaRecife`).
 */
export function rotuloDia(dia: string, hoje: string): string {
  if (!diaValido(dia)) return dia;
  const distancia = diasEntre(hoje, dia);
  if (distancia === 0) return "hoje";
  if (distancia === 1) return "amanhã";
  if (distancia === -1) return "ontem";
  const completo = diaBR(dia);
  return dia.slice(0, 4) === hoje.slice(0, 4) ? completo.slice(0, 5) : completo;
}
