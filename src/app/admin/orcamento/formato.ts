/**
 * Formatos do papel: dinheiro em reais e data como o cliente lê. Puro, para o
 * teste cobrir as bordas (valor quebrado, data com hora, número estragado).
 */
import { diaBR } from "@/features/lead/admin";

/** `179` vira `R$ 179,00`. Centavos sempre visíveis: é documento de preço. */
export function reais(valor: number): string {
  if (!Number.isFinite(valor)) return "";
  return `R$ ${valor.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** `2026-09-20` e `2026-09-20T13:00:00Z` viram `20/09/2026`. */
export function dataBR(valor: string): string {
  return diaBR(valor.slice(0, 10));
}

/** `16.67` vira `16,67%`; inteiro sai sem casas (`15%`). */
export function porcento(valor: number): string {
  if (!Number.isFinite(valor)) return "";
  return `${valor.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}%`;
}

/** "1 assento" / "4 assentos", para a tabela e os totais. */
export function assentos(quantidade: number): string {
  return `${quantidade} ${quantidade === 1 ? "assento" : "assentos"}`;
}
