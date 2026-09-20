/**
 * Relógio do convite para avaliar (O10·S2).
 *
 * Conta **só o tempo com a aba visível**: quem abriu o demo e foi almoçar não
 * "navegou" por isso. Tudo aqui é função pura com o instante injetado — nada de
 * `Date.now()` escondido nem `setTimeout` — para o teste provar o comportamento
 * sem esperar 4 minutos de verdade.
 *
 * Não guarda, não lê e não deriva nenhum dado de pessoa: só segundos.
 */

/** Quanto tempo de demo abre o convite (F1: "depois de ~4 minutos navegando"). */
export const ALVO_SEGUNDOS = 4 * 60;

/**
 * Teto de segurança. Relógio do sistema mudando (fuso, ajuste de hora) ou valor
 * adulterado no storage não podem virar um número absurdo no acumulado.
 */
export const TETO_SEGUNDOS = 60 * 60;

export interface Relogio {
  /** Segundos já fechados (trechos em que a aba esteve visível). */
  acumulado: number;
  /** Instante (ms) em que o trecho atual começou; `null` = aba escondida. */
  desde: number | null;
}

/** Aceita como acumulado só número finito e positivo, limitado pelo teto. */
export function segundosValidos(valor: unknown): number {
  if (typeof valor !== "number" || !Number.isFinite(valor) || valor <= 0) return 0;
  return Math.min(Math.floor(valor), TETO_SEGUNDOS);
}

/** Começa do que já estava guardado; só liga a contagem se a aba estiver visível. */
export function iniciarRelogio(acumulado: unknown, visivel: boolean, agora: number): Relogio {
  return { acumulado: segundosValidos(acumulado), desde: visivel ? agora : null };
}

/** Segundos contados até `agora` (o trecho aberto entra; o escondido, não). */
export function segundosDe(relogio: Relogio, agora: number): number {
  if (relogio.desde === null) return relogio.acumulado;
  const corrido = Math.max(0, Math.floor((agora - relogio.desde) / 1000));
  return Math.min(relogio.acumulado + corrido, TETO_SEGUNDOS);
}

/**
 * A aba mudou de estado: escondeu (fecha o trecho no acumulado) ou voltou
 * (abre um trecho novo). Chamar duas vezes com o mesmo estado não conta em dobro.
 */
export function comVisibilidade(relogio: Relogio, visivel: boolean, agora: number): Relogio {
  if (visivel) return relogio.desde === null ? { ...relogio, desde: agora } : relogio;
  return { acumulado: segundosDe(relogio, agora), desde: null };
}

export function atingiuAlvo(relogio: Relogio, agora: number): boolean {
  return segundosDe(relogio, agora) >= ALVO_SEGUNDOS;
}

/**
 * O convite deve aparecer agora? Dispensado ("Agora não") e já respondido não
 * voltam sozinhos — só pelo link do Guia, que limpa a dispensa.
 */
export function deveConvidar(
  relogio: Relogio,
  agora: number,
  estado: { dispensado: boolean; respondido: boolean },
): boolean {
  if (estado.dispensado || estado.respondido) return false;
  return atingiuAlvo(relogio, agora);
}
