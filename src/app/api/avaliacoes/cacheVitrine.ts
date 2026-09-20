/**
 * Cache curto da vitrine, na memória da função.
 *
 * Mora fora do `route.ts` porque arquivo de rota do Next só pode exportar os
 * verbos HTTP e as opções dele. Serve para a landing (a página mais visitada)
 * não consultar o banco a cada visita: a rota é `force-dynamic`, o Next carimba
 * `no-store` nesse caso e o `s-maxage` que mandávamos era ignorado pela borda
 * (conferido em produção em 2026-09-20).
 *
 * Só guarda resposta boa. Erro nunca entra aqui: a chamada seguinte tenta o
 * banco de novo.
 */
import type { VitrineAvaliacoes } from "@/features/avaliacao";

/** Validade do que fica guardado. Avaliação nova aparece no site em até 1 minuto. */
export const CACHE_MS = 60_000;

let guardado: { em: number; dados: VitrineAvaliacoes } | null = null;

/** O que está guardado, se ainda vale; `null` quando venceu ou não há nada. */
export function vitrineGuardada(agora: number): VitrineAvaliacoes | null {
  if (!guardado || agora - guardado.em >= CACHE_MS) return null;
  return guardado.dados;
}

export function guardarVitrine(dados: VitrineAvaliacoes, agora: number): void {
  guardado = { em: agora, dados };
}

/** Só para os testes: começa de novo sem nada guardado. */
export function limparCacheDaVitrine(): void {
  guardado = null;
}
